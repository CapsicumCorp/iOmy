/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2015-2016

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

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.Context;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Log;

import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import com.hoho.android.usbserial.driver.UsbSerialProber;

public class UserspaceUSBSerialAndroidLib extends Activity {
    private Context context=null;
	private static UsbManager mUsbManager;
	private static List<UsbSerialDriver> mAvailableDrivers; //This is global as it might not be refreshed all the time

	public native long jnigetmodulesinfo();
    public static native int jniadddevice(String filename);

    //Temp Storage
    private static UsbDeviceConnection tmpConnection;
    private static UsbSerialPort tmpPort;

    //Array of open usb devices
    private static int MAX_SERIAL_PORTS=10;
    private static boolean[] usbSerialDeviceIsOpen;
    private static String[] usbSerialDeviceFilename;
    private static UsbDeviceConnection[] usbSerialDeviceConnection;
    private static UsbSerialPort[] usbSerialDevicePort;

    //If this is set for a device then the app has requested permission from Android and is waiting for the user to either accept
    //  or if they block, then this will stay true until the app is restarted
    private static HashMap<String, Boolean> waitingForPermision=new HashMap<String, Boolean>();

	private static final String ACTION_USB_PERMISSION = "com.capsicumcorp.iomy.libraries.watchinputs.USB_PERMISSION";
    private static PendingIntent mPermissionIntent=null;

    private final BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {

        @TargetApi(12)
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (context) {
                    UsbDevice device = (UsbDevice)intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);

                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        if(device != null) {
                            //http://stackoverflow.com/questions/13687346/java-hashmap-get-method-null-pointer-exception
                            Boolean b = waitingForPermision.get(device.getDeviceName());
                            if (b != null) {
                                //Permission has been granted
                                waitingForPermision.remove(device.getDeviceName());
                            }
                        }
                    }
                    else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "UserspaceUSBSerialAndroidLib.BroadcastReceiver: Permission denied for device: "+device.getDeviceName());
                    }
                }
            }
        }
    };
    public UserspaceUSBSerialAndroidLib(Context context, String AppName) {
        this.context=context;

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB_MR1) {
            //This device doesn't support the USB host api
            return;
        }
    	mUsbManager=MainLib.getInstance().getUsbManager();
        mPermissionIntent = PendingIntent.getBroadcast(context, 0, new Intent(ACTION_USB_PERMISSION), 0);
        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        context.registerReceiver(mUsbReceiver, filter);
    }
    public static int init() {
    	mAvailableDrivers=null;

    	usbSerialDeviceIsOpen=new boolean[MAX_SERIAL_PORTS];
    	usbSerialDeviceFilename=new String[MAX_SERIAL_PORTS];
    	usbSerialDeviceConnection=new UsbDeviceConnection[MAX_SERIAL_PORTS];
    	usbSerialDevicePort=new UsbSerialPort[MAX_SERIAL_PORTS];

        waitingForPermision.clear();

        return 0;
    }

    public static void shutdown() {
    }
    public static void displayException(String functionName, Exception e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String exceptionAsString = sw.toString();
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "UserspaceUSBSerialAndroidLib."+functionName+": Exception:"+exceptionAsString);
    }
    public static int configureBaudRate(int index, int baudRate) {
    	if (usbSerialDevicePort[index]==null) {
    		return -1;
    	}
    	try {
    		usbSerialDevicePort[index].setParameters(baudRate, UsbSerialPort.DATABITS_8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE);
    	} catch (Exception e) {
    		displayException("configureBaudRate", e);
    		return -1;
    	}
    	return 0;
    }
    public static int serialPortReceiveData(int index, final byte[] dest) {
    	int result=0;

    	if (usbSerialDevicePort[index]==null) {
			//Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG UserspaceUSBSerialAndroidLib.serialPortReceiveData: device is null");
    		return -1;
    	}
    	try {
    		//Use a 1 second timeout for now
    		result=usbSerialDevicePort[index].read(dest, 1000);
    	} catch (Exception e) {
    		//Error while reading
			displayException("serialPortReceiveData", e);
    		return -2;
    	}
		//Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG UserspaceUSBSerialAndroidLib.serialPortReceiveData: result="+result);
    	return result;
    }
    public static int serialPortSend(int index, final byte[] src) {
    	int result=0;

    	if (usbSerialDevicePort[index]==null) {
    		return -1;
    	}
    	try {
    		//Use a 1 second timeout for now
    		result=usbSerialDevicePort[index].write(src, 1000);
			//Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG UserspaceUSBSerialAndroidLib.serialPortSend: Sent "+src.length+" bytes with result="+result);
    	} catch (Exception e) {
    		//Error while writing
    		return -2;
    	}
    	return result;
    }
    @TargetApi(12)
    public static int openSerialDevice(String filename) {
    	UsbSerialDriver lDriver=null;

    	if (Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB_MR1) {
    		//This device doesn't support the USB host api
    		return -6;
    	}
    	if (mAvailableDrivers==null) {
    		//List of devices not populated at the moment
    		return -1;
    	}
    	for (UsbSerialDriver driver : mAvailableDrivers) {
    		//Find the driver with a matching filename
    		if (driver.getDevice().getDeviceName().equals(filename)) {
    			lDriver=driver;
    		}
    	}
    	if (lDriver==null) {
    		//Driver not found for the filename
    		return -2;
    	}
        //http://stackoverflow.com/questions/13687346/java-hashmap-get-method-null-pointer-exception
        Boolean b = waitingForPermision.get(filename);
        if (b != null) {
            //User hasn't accepted permission yet
            return -6;
        }
    	if (mUsbManager.hasPermission(lDriver.getDevice())==false) {
    		//User doesn't yet have permission to open this device
            mUsbManager.requestPermission(lDriver.getDevice(), mPermissionIntent);
            waitingForPermision.put(filename, true);
    		return -3;
    	}
    	tmpConnection = mUsbManager.openDevice(lDriver.getDevice());
    	if (tmpConnection == null) {
    		//Probably need permission to open the serial port
    		return -4;
    	}
    	tmpPort=lDriver.getPorts().get(0);
    	try {
    		tmpPort.open(tmpConnection);
		} catch (Exception e) {
    		//Failed to open a connection to the usb serial port
    		tmpConnection=null;

            displayException("openSerialDevice", e);

    		return -5;
    	}
    	//TODO: Add device to temp global storage ready for call to Java addDevice

    	return 0;
    }
    //Close a serial device that was temp opened but never allocated
    public static void closeTempSerialDevice() {
    	if (tmpConnection==null || tmpPort==null) {
    		return;
    	}
    	try {
    		tmpPort.close();
    	} catch (Exception e) {
    		//Do nothing
    	}
    	tmpConnection=null;
    	tmpPort=null;
    }
    //Transfer serial device info from temp storage to the list
    public static int addSerialDevice(String filename, int index) {
    	usbSerialDeviceIsOpen[index]=true;
    	usbSerialDeviceFilename[index]=filename;
    	usbSerialDeviceConnection[index]=tmpConnection;
    	usbSerialDevicePort[index]=tmpPort;
    	tmpConnection=null;
    	tmpPort=null;

    	return 0;
    }
    //Remove a serial device from storage and close
    public static int removeSerialDevice(int index) {
    	if (usbSerialDeviceIsOpen[index]) {
    		try {
    			usbSerialDevicePort[index].close();
    		} catch (Exception e) {
    			//Do nothing if close fails
    		}
    		usbSerialDeviceIsOpen[index]=false;
    		usbSerialDeviceFilename[index]=null;
    		usbSerialDeviceConnection[index]=null;
    		usbSerialDevicePort[index]=null;

    		return 0;
    	}
    	return -1;
    }
    public static void refreshSerialDeviceList() {
    	if (mUsbManager==null) {
    		return;
    	}
    	mAvailableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(mUsbManager);
    }
    @TargetApi(12)
    public static int checkSerialDeviceRemoved(int index) {
    	if (Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB_MR1) {
    		//This device doesn't support the USB host api
    		return -6;
    	}
    	if (mAvailableDrivers==null) {
    		return -1;
    	}
    	for (UsbSerialDriver driver : mAvailableDrivers) {
    		if (driver.getDevice().getDeviceName().equals(usbSerialDeviceFilename[index])) {
    			return 0;
    		}
    	}
    	return -2;
    }
    //Find currently connected and supported serial devices
    //Called from the c module
    @TargetApi(12)
    public static void findSerialDevices() {
    	if (Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB_MR1) {
    		//This device doesn't support the USB host api
    		return;
    	}
    	if (mAvailableDrivers==null) {
    		return;
    	}
    	for (UsbSerialDriver driver : mAvailableDrivers) {
    		//Provide the filename to the c module
        	Log.println(Log.INFO, MainLib.getInstance().getAppName(), "UserspaceUSBSerialAndroidLib.findSerialDevices: Usb Device: "+driver.getDevice().getDeviceName());
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
				Log.println(Log.INFO, MainLib.getInstance().getAppName(), "UserspaceUSBSerialAndroidLib.findSerialDevices: Usb Manufacturer: " + driver.getDevice().getManufacturerName());
				Log.println(Log.INFO, MainLib.getInstance().getAppName(), "UserspaceUSBSerialAndroidLib.findSerialDevices: Usb Product Name: " + driver.getDevice().getProductName());
				Log.println(Log.INFO, MainLib.getInstance().getAppName(), "UserspaceUSBSerialAndroidLib.findSerialDevices: Usb Serial Number: " + driver.getDevice().getSerialNumber());
			}
    		jniadddevice(driver.getDevice().getDeviceName());
    	}
    }
    static {
        System.loadLibrary("userspaceusbserialandroidlib");
    }
}
