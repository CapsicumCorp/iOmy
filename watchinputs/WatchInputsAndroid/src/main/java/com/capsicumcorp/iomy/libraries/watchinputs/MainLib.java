/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2012-2016

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

package com.capsicumcorp.iomy.libraries.watchinputs;

import java.io.File;

import android.content.Context;
import android.hardware.usb.UsbManager;
import android.os.Environment;
import android.util.Log;

public class MainLib {
    private static MainLib instance;
    private String AppName;
    private UsbManager usbManager;
    private String StorageFolderName;

    private CmdServerLib mCmdServerLib;
    private CommonServerLib mCommonServerLib;
    private ConfigLib mConfigLib;
    private DebugLib mDebugLib;
    private SimCList mSimCList;
    private XbeeLib mXbeeLib;
    private CommonLib mCommonLib;
    private DbLib mDbLib;
    private DbCounterLib mDbCounterLib;
    private SerialPortLib mSerialPortLib;
    private MysqlLib mMysqlLib;
    private RapidHALib mRapidHALib;
    private ZigbeeLib mZigbeeLib;
    private UserspaceUSBSerialAndroidLib mUserspaceUSBSerialAndroidLib;
    private WebApiClientLib mWebApiClientLib;
    private LockLib mLockLib;

    public native int jniinit();
    public native int jniloadModule(long module);
    public native int jnifillinModuleDependencyInfo();
    public native int jnimain();
    public native void jnicleanup();
    public native long jnigetmodulesinfo();
    public native void jnisetConfigFilename(String cfgfile);

    public static MainLib getInstance() {
        if (instance == null) {
            throw new IllegalStateException();
        }
        return instance;
    }

    public MainLib(Context context, String AppName, UsbManager usbManager, String StorageFolderName) {
        instance=this;
        this.AppName=AppName;
        this.usbManager=usbManager;
        this.StorageFolderName=StorageFolderName;

        mCmdServerLib=new CmdServerLib(AppName);
        mCommonServerLib=new CommonServerLib(AppName);
        mConfigLib=new ConfigLib(AppName);
        mDebugLib=new DebugLib(AppName);
        mSimCList=new SimCList(AppName);
        mXbeeLib=new XbeeLib(AppName);
        mCommonLib=new CommonLib(AppName);
        mDbLib=new DbLib(AppName);
        mDbCounterLib=new DbCounterLib(AppName);
        mMysqlLib=new MysqlLib(context);
        mSerialPortLib=new SerialPortLib(AppName);
        mRapidHALib=new RapidHALib(AppName);
        mZigbeeLib=new ZigbeeLib(AppName);
        mUserspaceUSBSerialAndroidLib=new UserspaceUSBSerialAndroidLib(AppName);
        mWebApiClientLib=new WebApiClientLib(AppName);
        mLockLib=new LockLib(AppName);
    }

    public int init() {
        return jniinit();
    }

    public void shutdown() {
        jnicleanup();
    }

    public int loadModules() {
        long modulesinfo;
        int result;

        //Add main library
        modulesinfo=jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: mainlib");
            return -1;
        }
        //Add cmdserver library
        modulesinfo=mCmdServerLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: cmdserverlib");
            return -1;
        }
        //Add commonserver library
        modulesinfo=mCommonServerLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: commonserverlib");
            return -1;
        }
        //Add configlib library
        modulesinfo=mConfigLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: configlib");
            return -1;
        }
        //Add debug library
        modulesinfo=mDebugLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: debuglib");
            return -1;
        }
        //Add simclist library
        modulesinfo=mSimCList.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: simclist");
            return -1;
        }
        //Add xbeelib library
        modulesinfo=mXbeeLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: xbeelib");
            return -1;
        }
        //Add rapidhalib library
        modulesinfo=mRapidHALib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: rapidhalib");
            return -1;
        }
        //Add zigbeelib library
        modulesinfo=mZigbeeLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: zigbeelib");
            return -1;
        }
        //Add commonlib library
        modulesinfo=mCommonLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: commonlib");
            return -1;
        }
        //Add dblib library
        modulesinfo=mDbLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: dblib");
            return -1;
        }
        //Add dbcounterlib library
        modulesinfo=mDbCounterLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: dbcounterlib");
            return -1;
        }
        //Add serialportlib library
        modulesinfo=mSerialPortLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: serialportlib");
            return -1;
        }
        //Add Mysqllib library
        modulesinfo=mMysqlLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: mysqllib");
            return -1;
        }
        //Add UserspaceUSBSerialAndroidLib library
        modulesinfo=mUserspaceUSBSerialAndroidLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: userspaceusbserialandroidlib");
            return -1;
        }
        //Add WebApiClientLib library
        modulesinfo=mWebApiClientLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: webapiclientlib");
            return -1;
        }
        //Add LockLib library
        modulesinfo=mLockLib.jnigetmodulesinfo();
        result=jniloadModule(modulesinfo);
        if (result!=0) {
            Log.println(Log.INFO, AppName, "MainLib.loadModules: Failed to load module: locklib");
            return -1;
        }
        return 0;
    }

    public int mainloop() {
        if (loadModules()!=0) {
            return -2;
        }

        if (jnifillinModuleDependencyInfo()!=0) {
            return -3;
        }
        String watchInputsConfigFilename=new File(StorageFolderName+"/WatchInputs.cfg").toString();
        jnisetConfigFilename(watchInputsConfigFilename);
        jnimain();

        return 0;
    }

    public String getAppName() {
        return this.AppName;
    }
    public String getStorageFolderName() {
        return this.StorageFolderName;
    }
    public UsbManager getUsbManager() {
        return this.usbManager;
    }

    static {
        System.loadLibrary("watch_inputs");
    }

}
