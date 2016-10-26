/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2016

This file is part of Capsicum Web Server which is part of the iOmy project.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

Some code copied from DroidPHP: https://github.com/DroidPHP/DroidPHP

DroidPHP is licensed under the <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0 (the "License");</a>.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

package com.capsicumcorp.iomy.apps.webserver;

import android.content.SharedPreferences;
import android.content.res.Resources;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.util.Log;

public class Application extends android.app.Application {
    private static Application instance;
    private String AppName;
    private String InternalStorageFolderName;
    private String ExternalStorageFolderName;
    private String SystemDirectory;

    //Whether the service has started.
    private boolean serviceStarted;

    //Whether the various services have started
    private boolean monitoringStarted;

    public ExtractServerServices extractServerServices;
    public RunServerServices runServerServices;

    public static Application getInstance() {
        if (instance == null)
            throw new IllegalStateException();
        return instance;
    }

    public Application() {
        instance = this;

        AppName=null;
        InternalStorageFolderName =null;
        ExternalStorageFolderName=null;
        SystemDirectory=null;
        serviceStarted = false;
        extractServerServices=null;
        runServerServices=null;
    }
    public void onCreate() {
        Resources res;

        super.onCreate();
        res=this.getResources();

        this.AppName=res.getString(R.string.app_name);
        this.SystemDirectory= Environment.getRootDirectory().getPath();
        this.InternalStorageFolderName =this.getFilesDir().getPath();
        this.ExternalStorageFolderName=Environment.getExternalStorageDirectory().getPath()+"/CapsicumWS";

        //Create Extract Server Services object
        extractServerServices=new ExtractServerServices(this);

        //Create Run Server Services object
        runServerServices=new RunServerServices(this);
    }
    //Returns true if the first run wizard needs to be run
    public synchronized boolean needFirstRunWizard() {
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        boolean firstrunval=sharedPref.getBoolean("pref_run_first_run_wizard", true);

        if (firstrunval==true) {
            //The first run wizard needs to be run first
            return true;
        }
        return false;
    }
    //Called to start the monitoring system
    //NOTE: It is okay to start the watch inputs and run server services threads even before the
    //  first run wizard completes
    public boolean startMonitoringSystem() {
        Log.println(Log.INFO, this.AppName, "Entering Application.startMonitoringSystem");

        int result = 0;

        //Start Server Services Thread
        runServerServices.start();
        ++result;
        if (result==0) {
            Log.println(Log.INFO, this.AppName, "Application.startMonitoringSystem: Monitoring failed to start result=" + result);
            return false;
        }
        Log.println(Log.INFO, this.AppName, "Exiting Application.startMonitoringSystem");

        return true;
    }
    //Call to stop the monitoring system
    public void stopMonitoringSystem() {
        Log.println(Log.INFO, AppName, "Entering Application.stopMonitoringSystem");

        runServerServices.stopWebServer();
        try {
            //Wait for the server services to stop
            runServerServices.wait();
        } catch (InterruptedException e) {
            //Do nothing
        }
        Log.println(Log.INFO, this.AppName, "Exiting Application.stopMonitoringSystem");
    }
    //Call to start the monitoring service
    public void startMonitoringService() {
        Log.println(Log.INFO, this.AppName, "Application.startMonitoringService: Starting Monitoring Service");
        startService(WebServerService.createIntent(this));
    }
    //Call to stop the monitoring service
    public void stopMonitoringService() {
        Log.println(Log.INFO, this.AppName, "Application.startMonitoringService: Stopping Monitoring Service");
        stopService(WebServerService.createIntent(this));
    }
    //Called by the service when it is started
    public void onServiceStarted() {

        Log.println(Log.INFO, this.AppName, "Entering Application.onServiceStarted");
        if (serviceStarted) {
            //The service is already started
            return;
        }
        if (!startMonitoringSystem()) {
            Log.println(Log.INFO, this.AppName, "Exiting Application.onServiceStarted");
            return;
        }
        serviceStarted=true;
        Log.println(Log.INFO, this.AppName, "Exiting Application.onServiceStarted");
    }
    //Called by the service when it is destroyed
    public void onServiceDestroy() {
        Log.println(Log.INFO, this.AppName, "Entering Application.onServiceDestroy");
        if (serviceStarted) {
            stopMonitoringSystem();
        }
        onUnload();
        Log.println(Log.INFO, this.AppName, "Exiting Application.onServiceDestroy: Shouldn't get here");
    }
    //Called when we want to unload the program from memory
    public void onUnload() {
        Log.println(Log.INFO, this.AppName, "Entering Application.onUnload");
        android.os.Process.killProcess(android.os.Process.myPid());
        Log.println(Log.INFO, this.AppName, "Exiting Application.onUnload: Shouldn't get here");
    }

    public synchronized void wakeUpServerServicesThread() {
        runServerServices.interrupt();
    }
    public boolean getServiceStarted() {
        return this.serviceStarted;
    }
    public synchronized boolean getLighttpdServerEnabled() {
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        SharedPreferences.Editor editor = sharedPref.edit();
        return sharedPref.getBoolean("pref_lighttpdphp_enabled", true);
    }
    public synchronized boolean getMySQLEnabled() {
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        SharedPreferences.Editor editor = sharedPref.edit();
        return sharedPref.getBoolean("pref_mysql_enabled", true);
    }
    public String getAppName() {
        return this.AppName;
    }
    public String getSystemDirectory() { return this.SystemDirectory; }
    public String getInternalStorageFolderName() {
        return this.InternalStorageFolderName;
    }
    public String getExternalStorageFolderName() {
        return this.ExternalStorageFolderName;
    }
}
