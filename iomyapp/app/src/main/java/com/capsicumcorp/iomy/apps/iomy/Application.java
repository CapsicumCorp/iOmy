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
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.os.Environment;
import android.util.Log;

import java.io.File;

import static com.capsicumcorp.iomy.apps.iomy.Constants.installWizard;

public class Application extends android.app.Application {
    private static Application instance;
    private String AppName;
    private String InternalStorageFolderName;
    private String ExternalStorageFolderName;
    private String SystemDirectory;
    private UsbManager mUsbManager;

    //Dynamically Registered Receiver Intents
    private BroadcastReceiver mShutdownReceiver;

    //Whether the service has started.
    private boolean serviceStarted;

    //Whether the various services have started
    private boolean backgroundTasksStarted=false;

    //Whether the app was started from the usb device attached intent
    private boolean startedFromUsb=false;

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
        InternalStorageFolderName=null;
        ExternalStorageFolderName=null;
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
        this.InternalStorageFolderName=this.getFilesDir().getPath();
        this.ExternalStorageFolderName=Environment.getExternalStorageDirectory().getPath()+"/iOmy";

        //Register Dynamic Receiver Intents
        IntentFilter filterShutdown = new IntentFilter(Intent.ACTION_SHUTDOWN);
        BroadcastReceiver mShutdownReceiver = new ShutdownReceiver();
        registerReceiver(mShutdownReceiver, filterShutdown);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR1) {
        	this.mUsbManager=(UsbManager) getSystemService(Context.USB_SERVICE);
        } else {
            this.mUsbManager=null;
        }
        //Create external storage folder if it doesn't exist
        File ExternalStorageFolderFile=new File(this.ExternalStorageFolderName);
        if (!ExternalStorageFolderFile.exists()) {
            ExternalStorageFolderFile.mkdir();
            if (!ExternalStorageFolderFile.exists()) {
                Log.println(Log.INFO, this.AppName, "Application.onCreate: Failed to create external storage directory: "+this.ExternalStorageFolderName);
            }
        }
        //Create Extract Server Services object
        extractServerServices=new ExtractServerServices(this, SystemDirectory, InternalStorageFolderName, ExternalStorageFolderName);

        //Create Run Server Services object
        runServerServices=new RunServerServices(this, SystemDirectory, InternalStorageFolderName, ExternalStorageFolderName);
    }
    //Returns true if the first run wizard needs to be run
    public synchronized boolean needFirstRunWizard() {
        boolean firstrunval=Settings.getRunFirstRunWizard(this);

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
        //Import default or current settings from Android preferences to the local variables
        installWizard.setInitialSettings(this);

        boolean firstrunval=Settings.getRunFirstRunWizard(this);
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
        //Stop the background tasks before stopping the service as Android won't wait for Service.onDestroy to complete
        //  before shutting down
        Log.println(Log.INFO, this.AppName, "Application.stopBackgroundTasks: Stopping Background Tasks");
        stopBackgroundTasks();
        Log.println(Log.INFO, this.AppName, "Application.stopBackgroundTasks: Stopping Background Service");
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
        return Settings.getWatchInputsEnabled(this);
    }
    public synchronized boolean getLighttpdServerEnabled() {
        return Settings.getLighttpdPHPEnabled(this);
    }
    public synchronized boolean getMySQLEnabled() {
        return Settings.getMySQLEnabled(this);
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
    public String getCacheStorageFolderName() { return this.getCacheDir().getPath(); }
    public UsbManager getUsbManager() {
    	return this.mUsbManager;
    }
    public void setStartedFromUsb(boolean val) { startedFromUsb=val; }
    public boolean getStartedFromUsb() { return startedFromUsb; }
    public boolean getInstallDemoData()             { return installWizard.getInstallDemoData(); }

    public String getCurrentAppVersionName() {
        String versionName = "";
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            versionName = packageInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionName;
    }
    public int getCurrentAppVersionCode() {
        int versionCode = -1;
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            versionCode = packageInfo.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionCode;
    }
    static {
        System.loadLibrary("crystax");
        System.loadLibrary("gnustl_shared");
        System.loadLibrary("boost_system");
        System.loadLibrary("boost_chrono");
        System.loadLibrary("boost_thread");
        System.loadLibrary("boost_filesystem");
    }
}
