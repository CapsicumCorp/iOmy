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

import static com.capsicumcorp.iomy.apps.iomy.Constants.installWizard;

public class Application extends android.app.Application {
    private static Application instance;
    private String AppName;
    private String StorageFolderName;
    private String SystemDirectory;
    private UsbManager mUsbManager;

    //Whether the service has started.
    private boolean serviceStarted;

    //Whether the various services have started
    private boolean backgroundTasksStarted=false;

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
    //Called from a receiver to start the background tasks
    public boolean startBackgroundTasksfromReceiver() {
        Log.println(Log.INFO, this.AppName, "Entering Application.startBackgroundTasksfromReceiver");
        if (backgroundTasksStarted) {
            Log.println(Log.INFO, this.AppName, "Application.startBackgroundTasksfromReceiver: Background tasks are already started");
            return false;
        }

        //Start Extract Server Services Thread
        try {
            extractServerServices.setRunServerServices(true);

            extractServerServices.start();

            //Start Server Services Thread
            runServerServices.start();
        } catch (Exception e) {
            Log.println(Log.INFO, this.AppName, "Application.startBackgroundTasksfromReceiver: Background tasks failed to start result=");
            return false;
        }
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(Application.getInstance());

        //Import default or current settings from Android preferences to the local variables
        installWizard.setInitialSettings(this);

        boolean firstrunval=sharedPref.getBoolean("pref_run_first_run_wizard", true);
        if (firstrunval==false) {
            Log.println(Log.INFO, this.AppName, "Application.startBackgroundTasksfromReceiver: Activating Extract Service");
            Application.getInstance().runServerServices.supplyDBRootPassword(installWizard.dbPassword);
            extractServerServices.setOkayToExtract(true);
        }
        backgroundTasksStarted=true;
        Log.println(Log.INFO, this.AppName, "Exiting Application.startBackgroundTasksfromReceiver");

        return true;
    }
    //Called from the app to start the background tasks
    public boolean startBackgroundTasksfromApp() {
        Log.println(Log.INFO, this.AppName, "Entering Application.startBackgroundTasksfromApp");
        if (backgroundTasksStarted) {
            Log.println(Log.INFO, this.AppName, "Application.startBackgroundTasksfromApp: Background tasks are already started");
            return false;
        }

        //Start Extract Server Services Thread
        try {
            extractServerServices.setRunServerServices(true);

            extractServerServices.start();

            //Start Server Services Thread
            runServerServices.start();
        } catch (Exception e) {
            Log.println(Log.INFO, this.AppName, "Application.startBackgroundTasksfromApp: Background tasks failed to start result=");
            return false;
        }
        backgroundTasksStarted=true;
        Log.println(Log.INFO, this.AppName, "Exiting Application.startBackgroundTasksfromApp");

        return true;
    }
    //Call to stop the background tasks
    public void stopBackgroundTasks() {
        Log.println(Log.INFO, AppName, "Entering Application.stopBackgroundTasks");
        if (backgroundTasksStarted) {
            runServerServices.stopWebServer();
            extractServerServices.stopThread();

            backgroundTasksStarted=false;
        }
        Log.println(Log.INFO, this.AppName, "Exiting Application.stopBackgroundTasks");
    }
    //Call to start the background service
    public void startBackgroundService() {
        Log.println(Log.INFO, this.AppName, "Application.startBackgroundService: Starting Background Service");
        startService(iOmyServices.createIntent(this));
    }
    //Call to stop the background service
    public void stopBackgroundService() {
        Log.println(Log.INFO, this.AppName, "Application.stopBackgroTasks: Stopping Background Service");
        stopService(iOmyServices.createIntent(this));
    }
    //Called by the service when it is destroyed
    public void onServiceDestroy() {
        Log.println(Log.INFO, this.AppName, "Entering Application.onServiceDestroy");
        stopBackgroundTasks();
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
    public boolean getBackgroundTasksStarted() { return this.backgroundTasksStarted; }

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
