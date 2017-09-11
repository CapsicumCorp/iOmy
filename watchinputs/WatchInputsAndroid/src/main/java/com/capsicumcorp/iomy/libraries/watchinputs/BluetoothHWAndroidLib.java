/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2015-2017

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
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.content.pm.FeatureInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.ParcelUuid;
import android.util.Log;
import android.util.SparseArray;
import android.widget.Toast;

import com.csr.mesh.BatteryModelApi;
import com.csr.mesh.ConfigModelApi;
import com.csr.mesh.MeshService;
import com.csr.mesh.PowerModelApi;
import com.csr.mesh.SuperLightModelApi;

@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
public class BluetoothHWAndroidLib implements AssociationListener {
    private static BluetoothHWAndroidLib instance;
    private Context context=null;
	private static BluetoothAdapter mBluetoothAdapter;
	private static boolean mLEScanning=false;
	private static Handler mLEHandler;

	//public static native void jniRemoveQueueItem(int messtype, String address, String serviceuuid, String uuid);
	//public static native int jniAddDevice(String name, String address, int bttype);
	//public static native void jniGattSetConnectionState(String address, int connectionState);
	//public static native void jniGattSetFinishedServiceDiscovery(String address, int status);
	//public static native int jniAddBtGattService(String address, String uuid, int type);
	//public static native int jniAddBtGattCharacteristic(String address, String serviceuuid, String uuid, int properties);
	//public static native int jniProcessReceivedCharacteristic(String address, String serviceuuid, String uuid, byte[] bytes, int status);
	//public native long jnigetmodulesinfo();

    //CSRMesh variables
    /*package*/ static final int DEVICE_LOCAL_ADDRESS =  0x8000;
    /*package*/ static final int ATTENTION_DURATION_MS = 20000;
    /*package*/ static final int ATTRACTION_DURATION_MS = 5000;

    private SparseArray<String> mUuidHashToAppearance = new SparseArray<String>();
    private MeshService mService = null;

    private int mAssociationTransactionId = -1;

    // Listeners
    private AssociationListener mAssListener;

    private String CSRMeshNetworkKey="TestKey";

    //Testing
    //private int deviceID=0x10000;
    private int deviceID=0x1;
    private boolean theColor=false;

    public static BluetoothHWAndroidLib getInstance() {
        if (instance == null)
            throw new IllegalStateException();
        return instance;
    }

    public BluetoothHWAndroidLib(Context context) {
        this.context=context;
        this.instance=this;
	}
	@TargetApi(18)
    public static int init() {
        int result=0;
    	BluetoothManager lBluetoothManager;

        getInstance().instanceInit();
    	return result;
    }
    public static void shutdown() {
        getInstance().instanceShutdown();
    }
    private int instanceInit() {
        // Make a connection to MeshService to enable us to use its services.
        Intent bindIntent = new Intent(context, MeshService.class);
        context.bindService(bindIntent, mServiceConnection, Context.BIND_AUTO_CREATE);

        mAssListener = this;

        return 0;
    }
    private void instanceShutdown() {
        mService.setHandler(null);
        mMeshHandler.removeCallbacksAndMessages(null);
        context.unbindService(mServiceConnection);
    }
    public static void displayException(String functionName, Exception e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String exceptionAsString = sw.toString();
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib."+functionName+": Exception:"+exceptionAsString);
    }
    /**
     * Callbacks for changes to the state of the connection.
     */
    private ServiceConnection mServiceConnection = new ServiceConnection() {
        public void onServiceConnected(ComponentName className, IBinder rawBinder) {
            mService = ((MeshService.LocalBinder) rawBinder).getService();
            if (mService != null) {
                // Try to get the last setting ID used.
                //SharedPreferences activityPrefs = getPreferences(Activity.MODE_PRIVATE);
                //int lastIdUsed = activityPrefs.getInt(SETTING_LAST_ID, Setting.UKNOWN_ID);
                //restoreSettings(lastIdUsed);

                connect();
            }
        }

        public void onServiceDisconnected(ComponentName classname) {
            mService = null;
        }
    };

    private BluetoothAdapter.LeScanCallback mScanCallBack = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord) {
            mService.processMeshAdvert(device, scanRecord, rssi);
        }
    };

    private void connect() {
        mService.setHandler(mMeshHandler);
        mService.setLeScanCallback(mScanCallBack);
        mService.setMeshListeningMode(true, true);
        mService.autoConnect(1, 15000, 0, 2);

        //TODO: Migrate this to a random key that saves to config
        mService.setNetworkPassPhrase(CSRMeshNetworkKey);

        //TODO: Add device store
        // set next device id to be used according with the last device used in the database.
        mService.setNextDeviceId(1);

        // set TTL to the library
        //TODO: Add device store
        mService.setTTL(255);
    }

    /**
     * Handle messages from mesh service.
     */
    private final Handler mMeshHandler = new MeshHandler(this);

    private static class MeshHandler extends Handler {
        private final WeakReference<BluetoothHWAndroidLib> mActivity;

        public MeshHandler(BluetoothHWAndroidLib activity) {
            mActivity = new WeakReference<BluetoothHWAndroidLib>(activity);
        }

        public void handleMessage(Message msg) {
            BluetoothHWAndroidLib parentActivity = mActivity.get();
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib ----------------------------------------------------------------------------");
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib ----------------------------------------------------------------------------");
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib.handleMessage="+msg.what+"");
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib ----------------------------------------------------------------------------");
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib ----------------------------------------------------------------------------");
            switch (msg.what) {
                case MeshService.MESSAGE_LE_CONNECTED: {
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib Found device: "+msg.getData().getString(MeshService.EXTRA_DEVICE_ADDRESS));
                    /*parentActivity.mConnectedDevices.add(msg.getData().getString(MeshService.EXTRA_DEVICE_ADDRESS));
                    if (!parentActivity.mConnected) {
                        parentActivity.onConnected();
                    }*/
                    //Testing
                    /*if (parentActivity.theColor) {
                        parentActivity.setLightPower(parentActivity.deviceID, PowerModelApi.PowerState.ON);
                        //parentActivity.setLightColorRGB(parentActivity.deviceID, 255, 0, 0, 99);
                        parentActivity.theColor=false;
                    } else {
                        parentActivity.setLightPower(parentActivity.deviceID, PowerModelApi.PowerState.OFF);
                        //parentActivity.setLightColorRGB(parentActivity.deviceID, 0, 0, 255, 99);
                        parentActivity.theColor=true;
                    }*/
                    break;
                }
                case MeshService.MESSAGE_LE_DISCONNECTED: {
                    int numConnections = msg.getData().getInt(MeshService.EXTRA_NUM_CONNECTIONS);
                    String address = msg.getData().getString(MeshService.EXTRA_DEVICE_ADDRESS);
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib Disconnected device: "+address+" now have num connections: "+numConnections);
                    /*if (address != null) {
                        String toRemove = null;
                        for (String s : parentActivity.mConnectedDevices) {
                            if (s.compareTo(address) == 0) {
                                toRemove = s;
                                break;
                            }
                        }
                        if (toRemove != null) {
                            parentActivity.mConnectedDevices.remove(toRemove);
                        }
                    }
                    if (numConnections == 0) {
                        parentActivity.mConnected = false;
                        parentActivity.showProgress(parentActivity.getString(R.string.connecting));
                    }*/
                    break;
                }
                case MeshService.MESSAGE_BRIDGE_CONNECT_TIMEOUT:
                    //TODO: If this message occurs, the CSRMesh library seems to give up so find a way to get it to restart again
                    break;
                case MeshService.MESSAGE_TIMEOUT:{
                    int expectedMsg = msg.getData().getInt(MeshService.EXTRA_EXPECTED_MESSAGE);
                    int id;
                    int meshRequestId;
                    if (msg.getData().containsKey(MeshService.EXTRA_UUIDHASH_31)) {
                        id = msg.getData().getInt(MeshService.EXTRA_UUIDHASH_31);
                    }
                    else {
                        id = msg.getData().getInt(MeshService.EXTRA_DEVICE_ID);
                    }
                    meshRequestId = msg.getData().getInt(MeshService.EXTRA_MESH_REQUEST_ID);
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib message timeout: expected message: "+expectedMsg+" id: "+id+" meshRequestId: "+meshRequestId);
                    //parentActivity.onMessageTimeout(expectedMsg, id, meshRequestId);
                    break;
                }
                case MeshService.MESSAGE_DEVICE_DISCOVERED: {
                    ParcelUuid uuid = msg.getData().getParcelable(MeshService.EXTRA_UUID);
                    int uuidHash = msg.getData().getInt(MeshService.EXTRA_UUIDHASH_31);
                    int rssi = msg.getData().getInt(MeshService.EXTRA_RSSI);
                    int ttl = msg.getData().getInt(MeshService.EXTRA_TTL);
                    /*if (parentActivity.mRemovedListener != null && parentActivity.mRemovedUuidHash == uuidHash) {
                        // This was received after a device was removed, so let the removed listener know.

                        parentActivity.mDeviceStore.removeDevice(parentActivity.mRemovedDeviceId);
                        parentActivity.mRemovedListener.onDeviceRemoved(parentActivity.mRemovedDeviceId, true);
                        parentActivity.mRemovedListener = null;
                        parentActivity.mRemovedUuidHash = 0;
                        parentActivity.mRemovedDeviceId = 0;
                        Log.println(Log.INFO, "CSRMesh", "MainActivity handleMessage: MESSAGE_DEVICE_DISCOVERED");
                        parentActivity.mService.setDeviceDiscoveryFilterEnabled(false);
                        removeCallbacks(parentActivity.removeDeviceTimeout);
                    }*/ if (parentActivity.mAssListener != null) {
                        // This was received after discover was enabled so let the UUID listener know.
                        parentActivity.mAssListener.newUuid(uuid.getUuid(), uuidHash, rssi, ttl);
                    }
                    break;
                }
                case MeshService.MESSAGE_DEVICE_APPEARANCE: {
                    // This is the appearance received when a device is in association mode.
                    // If appearance has been explicitly requested via CONFIG_DEVICE_INFO, then the appearance
                    // will be received in a MESSAGE_CONFIG_DEVICE_INFO.
                    byte[] appearance = msg.getData().getByteArray(MeshService.EXTRA_APPEARANCE);
                    String shortName = msg.getData().getString(MeshService.EXTRA_SHORTNAME);
                    int uuidHash = msg.getData().getInt(MeshService.EXTRA_UUIDHASH_31);
                    if (parentActivity.mAssListener != null) {
                        parentActivity.mUuidHashToAppearance.put(uuidHash, shortName);
                        // This was received after discover was enabled so let the UUID listener know.
                        parentActivity.mAssListener.newAppearance(uuidHash, appearance, shortName);
                    }
                    break;
                }
                case MeshService.MESSAGE_DEVICE_ASSOCIATED: {
                    // New device has been associated and is telling us its device id.
                    // Request supported models before adding to DeviceStore, and the UI.
                    int deviceId = msg.getData().getInt(MeshService.EXTRA_DEVICE_ID);
                    int uuidHash = msg.getData().getInt(MeshService.EXTRA_UUIDHASH_31);
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib New device associating with id: "+String.format("0x%x", deviceId)+" uuidHash: "+String.format("0x%x", uuidHash));

                    parentActivity.deviceID=deviceId;
                    /*if (parentActivity.mDeviceStore.getDevice(deviceId) == null) {
                        // Save the device id with the UUID hash so that we can store the UUID hash in the device
                        // object when MESSAGE_CONFIG_MODELS is received.
                        parentActivity.mDeviceIdtoUuidHash.put(deviceId, uuidHash);

                        // We add the device with no supported models. We will update that once we get the info.
                        if (uuidHash != 0) {
                            parentActivity.addDevice(deviceId, uuidHash, null, 0, false);
                        }

                    }*/
                    // If we don't already know about this device request its model support.
                    // We only need the lower 64-bits, so just request those.
                    ConfigModelApi.getInfo(deviceId, ConfigModelApi.DeviceInfo.MODEL_LOW);
                    break;
                }
                case MeshService.MESSAGE_ASSOCIATING_DEVICE:
                    int progress = msg.getData().getInt(MeshService.EXTRA_PROGRESS_INFORMATION);
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib associating device: progress="+progress);
                    break;
                case MeshService.MESSAGE_CONFIG_DEVICE_INFO: {
                    int deviceId = msg.getData().getInt(MeshService.EXTRA_DEVICE_ID);
                    //int uuidHash = parentActivity.mDeviceIdtoUuidHash.get(deviceId);

                    ConfigModelApi.DeviceInfo infoType =
                            ConfigModelApi.DeviceInfo.values()[msg.getData().getByte(MeshService.EXTRA_DEVICE_INFO_TYPE)];
                    if (infoType == ConfigModelApi.DeviceInfo.MODEL_LOW) {
                        long bitmap = msg.getData().getLong(MeshService.EXTRA_DEVICE_INFORMATION);
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device info: deviceId: "+deviceId+" bitmap: "+bitmap);
                        // If the uuidHash was saved for this device id then this is an expected message, so process it.
                        /*if (uuidHash != 0) {
                            // Remove the uuidhash from the array as we have received its model support now.
                            parentActivity.mDeviceIdtoUuidHash
                                    .removeAt(parentActivity.mDeviceIdtoUuidHash.indexOfKey(deviceId));
                            String shortName = parentActivity.mUuidHashToAppearance.get(uuidHash);
                            if (shortName != null) {
                                parentActivity.mUuidHashToAppearance.remove(uuidHash);
                            }
                            parentActivity.addDevice(deviceId, uuidHash, shortName, bitmap, true);
                            parentActivity.deviceAssociated(true, null);
                        } else if (parentActivity.mDeviceIdtoUuidHash.size() == 0) {
                            if (parentActivity.mInfoListener != null) {
                                SingleDevice device = parentActivity.mDeviceStore.getSingleDevice(deviceId);
                                if (device != null) {
                                    device.setModelSupport(bitmap, 0);
                                    parentActivity.mDeviceStore.addDevice(device);
                                    parentActivity.mInfoListener.onDeviceConfigReceived(true);
                                } else {
                                    parentActivity.mInfoListener.onDeviceConfigReceived(false);
                                }


                            }
                        }*/
                    } else if (infoType == ConfigModelApi.DeviceInfo.VID_PID_VERSION) {
                        // ConfigModelApi.DeviceInfo.VID_PID_VERSION
                        byte[] vid;
                        byte[] pid;
                        byte[] version;

                        vid = msg.getData().getByteArray(MeshService.EXTRA_VID_INFORMATION);
                        pid = msg.getData().getByteArray(MeshService.EXTRA_PID_INFORMATION);
                        version = msg.getData().getByteArray(MeshService.EXTRA_VERSION_INFORMATION);
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device info: deviceId: "+deviceId+" vid: "+vid+" pid: "+pid+" version: "+version);
                        /*if (parentActivity.mDeviceStore.getSingleDevice(deviceId).isModelSupported(BatteryModelApi.MODEL_NUMBER)) {
                            parentActivity.getBatteryState(parentActivity.mInfoListener);
                        } else if (parentActivity.mInfoListener != null) {
                            parentActivity.mInfoListener.onDeviceInfoReceived(parentActivity.vid, parentActivity.pid, parentActivity.version, GroupAssignFragment.UNKNOWN_BATTERY_LEVEL,GroupAssignFragment.UNKNOWN_BATTERY_STATE, deviceId, true);
                        } else {
                            // shouldn't happen. Just in case for avoiding endless loops.
                            parentActivity.hideProgress();
                        }*/

                    }
                    break;
                }                default:
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib.handleMessage unhandled="+msg.what+"");
            }
        }
    }


    public void newUuid(UUID uuid, int uuidHash, int rssi, int ttl) {
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib newUuid: uuid="+uuid + " uuidHash="+uuidHash+" rssi: "+rssi + " ttl: "+ttl);
        associateDevice(uuidHash, null);
    }
    public void newAppearance(int uuidHash, byte[] appearance,String shortName) {
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib newAppearance: uuidHash="+uuidHash+" shortName: "+shortName);

        //This triggers MESSAGE_DEVICE_DISCOVERED
        mService.setDeviceDiscoveryFilterEnabled(true);

        //Start Pre-Association mode
//        activateAttentionMode(uuidHash, true);

        //associateDevice(uuidHash, null);
    }
    public void deviceAssociated(boolean success, String message) {
        //Disable discovery once a device is associated
        mService.setDeviceDiscoveryFilterEnabled(false);
    }
    public void associationProgress(final int progress, final String message) {

    }

    public void activateAttentionMode(int uuidHash, boolean enabled) {

        // enable the new uuidHash.
        mService.setAttentionPreAssociation(uuidHash, enabled, ATTRACTION_DURATION_MS);
    }

    public boolean associateDevice(int uuidHash, String shortCode) {
        try {
            if (shortCode == null) {
                mAssociationTransactionId = mService.associateDevice(uuidHash, 0, false);
                return true;
            } else {
                int decodedHash = MeshService.getDeviceHashFromShortcode(shortCode);

                Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib associateDevice: "+decodedHash);
                if (decodedHash == uuidHash) {
                    mAssociationTransactionId = mService.associateDevice(uuidHash, MeshService.getAuthorizationCode(shortCode), true);
                    return true;
                }
                return false;
            }
        }
        catch (Exception e) {
            displayException("associateDevice", e);

            return false;
        }
    }

    public void setLightColorRGB(int deviceId, int red, int green, int blue, int brightness) {
        if (brightness < 0 || brightness > 99) {
            throw new NumberFormatException("Brightness value should be between 0 and 99");
        }
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceID+" setLightColor: Red: "+(int) red+" Green: "+(int) green+" Blue: "+(int) blue+" Brightness: "+(int) brightness);

        //Color Type: 1 RGB
        //Color Type: 2 Kelvin?
        //Color Type: 3 White Light
        //SuperLightModelApi.setLevel(mSendDeviceId, (byte) 10, false);
        //SuperLightModelApi.setRgb(mSendDeviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
        SuperLightModelApi.setRgb(deviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
    }
    public void setLightColor(int deviceId, int color, int brightness) {
        if (brightness < 0 || brightness > 99) {
            throw new NumberFormatException("Brightness value should be between 0 and 99");
        }

        // Convert currentColor to HSV space and make the brightness (value) calculation. Then convert back to RGB to
        // make the colour to send.
        // Don't modify currentColor with the brightness or else it will deviate from the HS colour selected on the
        // wheel due to accumulated errors in the calculation after several brightness changes.
        float[] hsv = new float[3];
        Color.colorToHSV(color, hsv);
        hsv[2] = ((float) brightness + 1) / 100.0f;
        int mColorToSend = Color.HSVToColor(hsv);

        byte red, green, blue;
        red=(byte) (mColorToSend >> 16);
        green=(byte) (mColorToSend >> 8);
        blue=(byte) (mColorToSend & 0xff);

        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceID+" setLightColor: Red: "+(int) red+" Green: "+(int) green+" Blue: "+(int) blue+" Brightness: "+(int) brightness);

        //Color Type: 1 RGB
        //Color Type: 2 Kelvin?
        //Color Type: 3 White Light
        //SuperLightModelApi.setLevel(mSendDeviceId, (byte) 10, false);
        //SuperLightModelApi.setRgb(mSendDeviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
        SuperLightModelApi.setRgb(deviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
    }

    public void setLightPower(int deviceId, PowerModelApi.PowerState state) {
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceID+" setLightPower: state: "+state);
        try {
            PowerModelApi.setState(deviceId, state, false);
        } catch (Exception e) {
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceID+" setLightPower: state: "+state+" Exception: "+e.getMessage());
        }
    }

    /*static {
        System.loadLibrary("bluetoothhwandroidlib");
    }*/
}
