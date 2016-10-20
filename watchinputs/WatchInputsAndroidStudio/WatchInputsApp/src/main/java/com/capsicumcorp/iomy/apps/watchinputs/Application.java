/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Main Application class for Watch Inputs
Copyright: Capsicum Corporation 2014-2016

This file is part of Watch Inputs which is part of the iOmy project.

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

package com.capsicumcorp.iomy.apps.watchinputs;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.res.Resources;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Log;

public class Application extends android.app.Application {
    private static Application instance;
    private String AppName;
    private String StorageFolderName;
    private UsbManager mUsbManager;

    //Whether the service has started.
    private boolean serviceStarted;

    //Whether the monitoring system has started
    private boolean monitoringStarted;

    private com.capsicumcorp.iomy.libraries.watchinputs.MainLib mMainLib;

    public static Application getInstance() {
        if (instance == null)
            throw new IllegalStateException();
        return instance;
    }
    
    public Application() {
        instance = this;

        AppName=null;
        StorageFolderName=null;
        serviceStarted = false;
        monitoringStarted = false;
        mMainLib=null;
    }
    @TargetApi(12)
    public void onCreate() {
        Resources res;

        super.onCreate();
        res=this.getResources();

        this.AppName=res.getString(R.string.AppName);
        this.StorageFolderName=res.getString(R.string.StorageFolderName);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR1) {
        	this.mUsbManager=(UsbManager) getSystemService(Context.USB_SERVICE);
        } else {
            this.mUsbManager=null;
        }
    }
    //Called to start the monitoring system
    public boolean startMonitoringSystem() {
        Log.println(Log.INFO, this.AppName, "Entering Application.startMonitoringSystem");
        if (monitoringStarted) {
            Log.println(Log.INFO, this.AppName, "Application.startMonitoringSystem: Monitoring is already started");
            return false;
        }
        mMainLib=new com.capsicumcorp.iomy.libraries.watchinputs.MainLib(this, this.AppName, this.mUsbManager, StorageFolderName);

        mMainLib.init();

        int result=mMainLib.mainloop();
        if (result!=0) {
            Log.println(Log.INFO, this.AppName, "Application.startMonitoringSystem: Monitoring failed to start result="+result);
            return false;
        }
        monitoringStarted=true;
        Log.println(Log.INFO, this.AppName, "Exiting Application.startMonitoringSystem");

        return true;
    }
    //Call to stop the monitoring system
    public void stopMonitoringSystem() {
        Log.println(Log.INFO, AppName, "Entering Application.stopMonitoringSystem");
        if (monitoringStarted && mMainLib!=null) {
            mMainLib.shutdown();
            mMainLib=null;
            monitoringStarted=false;
        }
        Log.println(Log.INFO, this.AppName, "Exiting Application.stopMonitoringSystem");
    }
    //Call to start the monitoring service
    public void startMonitoringService() {
        Log.println(Log.INFO, this.AppName, "Application.startMonitoringService: Starting Monitoring Service");
        startService(IOService.createIntent(this.getApplicationContext()));
    }
    //Call to stop the monitoring service
    public void stopMonitoringService() {
        Log.println(Log.INFO, this.AppName, "Application.startMonitoringService: Stopping Monitoring Service");
        stopService(IOService.createIntent(this));
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
                onUnload();
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

    public boolean getServiceStarted() {
        return this.serviceStarted;
    }

    public boolean getMonitoringStarted() {
        return this.monitoringStarted;
    }

    public String getAppName() {
        return this.AppName;
    }
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
