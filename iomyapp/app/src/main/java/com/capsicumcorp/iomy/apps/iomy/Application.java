/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Main Application class for Watch Inputs
Copyright: Capsicum Corporation 2014-2016

This file is part of iOmy.

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

*/

package com.capsicumcorp.iomy.apps.iomy;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.util.Log;

public class Application extends android.app.Application {
    private static Application instance;
    private String AppName;
    private String StorageFolderName;
    private String SystemDirectory;
    private UsbManager mUsbManager;

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
        StorageFolderName=null;
        SystemDirectory=null;
        serviceStarted = false;
        monitoringStarted = false;
        extractServerServices=null;
        runServerServices=null;
    }
    @TargetApi(12)
    public void onCreate() {
        Resources res;

        super.onCreate();
        res=this.getResources();

        this.AppName=res.getString(R.string.app_name);
        this.SystemDirectory=Environment.getRootDirectory().getPath();
        this.StorageFolderName=this.getFilesDir().getPath();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR1) {
        	this.mUsbManager=(UsbManager) getSystemService(Context.USB_SERVICE);
        } else {
            this.mUsbManager=null;
        }
        //Create Extract Server Services object
        extractServerServices=new ExtractServerServices(this, SystemDirectory, StorageFolderName);

        //Create Run Server Services object
        runServerServices=new RunServerServices(this, SystemDirectory, StorageFolderName);
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
        if (monitoringStarted) {
            Log.println(Log.INFO, this.AppName, "Application.startMonitoringSystem: Monitoring is already started");
            return false;
        }

        int result = 0;

        //Start Server Services Thread
        runServerServices.start();
        ++result;
        if (result==0) {
            Log.println(Log.INFO, this.AppName, "Application.startMonitoringSystem: Monitoring failed to start result=" + result);
            return false;
        }
        monitoringStarted=true;
        Log.println(Log.INFO, this.AppName, "Exiting Application.startMonitoringSystem");

        return true;
    }
    //Call to stop the monitoring system
    public void stopMonitoringSystem() {
        Log.println(Log.INFO, AppName, "Entering Application.stopMonitoringSystem");
        if (monitoringStarted) {
            runServerServices.stopWebServer();
            try {
                //Wait for the server services to stop
                runServerServices.wait();
            } catch (InterruptedException e) {
                //Do nothing
            }
            monitoringStarted=false;
        }
        Log.println(Log.INFO, this.AppName, "Exiting Application.stopMonitoringSystem");
    }
    //Call to start the monitoring service
    public void startMonitoringService() {
        Log.println(Log.INFO, this.AppName, "Application.startMonitoringService: Starting Monitoring Service");
        startService(iOmyServices.createIntent(this));
    }
    //Call to stop the monitoring service
    public void stopMonitoringService() {
        Log.println(Log.INFO, this.AppName, "Application.startMonitoringService: Stopping Monitoring Service");
        stopService(iOmyServices.createIntent(this));
    }
    //Called by the service when it is started
    public void onServiceStarted() {

        Log.println(Log.INFO, this.AppName, "Entering Application.onServiceStarted");
        if (serviceStarted) {
            //The service is already started
            return;
        }
        if (!monitoringStarted) {
            if (!startMonitoringSystem()) {
                Log.println(Log.INFO, this.AppName, "Exiting Application.onServiceStarted");
                return;
            }
        }
        serviceStarted=true;
        Log.println(Log.INFO, this.AppName, "Exiting Application.onServiceStarted");
    }
    //Called by the service when it is destroyed
    public void onServiceDestroy() {
        Log.println(Log.INFO, this.AppName, "Entering Application.onServiceDestroy");
        if (monitoringStarted) {
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
        runServerServices.changeServiceState();
    }
    public boolean getServiceStarted() {
        return this.serviceStarted;
    }
    public boolean getMonitoringStarted() { return this.monitoringStarted; }

    public synchronized boolean getWatchInputsEnabled() {
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
        SharedPreferences.Editor editor = sharedPref.edit();
        return sharedPref.getBoolean("pref_watch_inputs_enabled", true);
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
    public String getStorageFolderName() {
        return this.StorageFolderName;
    }
    public UsbManager getUsbManager() {
    	return this.mUsbManager;
    }

    static {
        System.loadLibrary("crystax");
        System.loadLibrary("gnustl_shared");
        System.loadLibrary("boost_system");
        System.loadLibrary("boost_chrono");
        System.loadLibrary("boost_thread");
    }
}
