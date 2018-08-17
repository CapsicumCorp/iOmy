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
import java.net.NetworkInterface;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import android.Manifest;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.ParcelUuid;
import android.provider.Settings;
import android.util.Log;
import android.util.SparseArray;
import com.csr.mesh.ConfigModelApi;
import com.csr.mesh.MeshService;
import com.csr.mesh.PowerModelApi;
import com.csr.mesh.SuperLightModelApi;

@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
public class BluetoothHWAndroidLib implements AssociationListener {
    private static BluetoothHWAndroidLib instance;
    private Context context=null;

    private native int jniaddcsrmeshdeviceforpairing(String shortName, int uuidHash);
    private native void jnicsrmeshdevicepaired(int uuidHash, int deviceId);
    private native void jniCSRMeshDeviceInfoModelLow(int deviceId, long bitmap);
	public native long jnigetmodulesinfo();

    private String bluetoothHostMacAddress;
    private boolean shuttingdown=false; //Set to true when we are shutting down

    //CSRMesh variables
    /*package*/ static final int DEVICE_LOCAL_ADDRESS =  0x8000;
    /*package*/ static final int ATTENTION_DURATION_MS = 20000;
    /*package*/ static final int ATTRACTION_DURATION_MS = 5000;

    private MeshService mService = null;

    private int csrMeshNextDeviceId;
    private int mAssociationTransactionId = -1;
    private boolean csrMeshBridgeConnected=false; //If false then we shouldn't try and sent any packets

    // Listeners
    private AssociationListener mAssListener;

    private String csrMeshNetworkKey="";

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
        getInstance().csrMeshBridgeConnected=false;
        getInstance().csrMeshNetworkKey="";

        return 0;
    }
    public static void shutdown() {
    }

    public static int startCSRMesh() {
        //CSRMesh needs access to a context which better handled by an instance of the class instead of as static
        return getInstance().instanceStartCSRMesh();
    }
    public static int stopCSRMesh() {
        return getInstance().instanceStopCSRMesh();
    }
    private int instanceStartCSRMesh() {
        // Make a connection to MeshService to enable us to use its services.
        shuttingdown=false;
        try {
            Intent bindIntent = new Intent(context, MeshService.class);
            context.bindService(bindIntent, mServiceConnection, Context.BIND_AUTO_CREATE);

            mAssListener = this;
        } catch (Exception e) {
            displayException("instanceStartCSRMesh", e);
            return -1;
        }
        return 0;
    }
    private int instanceStopCSRMesh() {
        shuttingdown=true;
        try {
            mService.disconnectBridge();
            mService.setHandler(null);
            mMeshHandler.removeCallbacksAndMessages(null);
            context.unbindService(mServiceConnection);
        } catch (Exception e) {
            displayException("instanceStopCSRMesh", e);
            return -1;
        }
        return 0;
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
        if (csrMeshNetworkKey=="") {
            return;
        }
        mService.setHandler(mMeshHandler);
        mService.setLeScanCallback(mScanCallBack);
        mService.setMeshListeningMode(true, true);
        mService.autoConnect(1, 15000, 0, 2);

        mService.setNetworkPassPhrase(csrMeshNetworkKey);

        // set next device id to be used according with the last device used in the database.
        //NOTE: Do not call this if there are no devices in the database as the CSRMesh library will
        //  set the first id
        if (csrMeshNextDeviceId>0) {
            mService.setNextDeviceId(csrMeshNextDeviceId);
        }
        // set TTL to the library
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
            //Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib.handleMessage="+msg.what+" "+msg.getData());
            if (parentActivity.shuttingdown) {
                //Ignore all messages since we are shutting down
                Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib.handleMessage Ignoring message due to CSRMesh shutdown");
                return;
            }
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
                    //TODO: call the C++ library so it can set the link as connected
                    parentActivity.csrMeshBridgeConnected=true;
                    break;
                }
                case MeshService.MESSAGE_LE_DISCONNECTED: {
                    //TODO: If numconnections is 0, call the C++ library so it can set the link as not connected
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
                    if (numConnections==0) {
                        parentActivity.csrMeshBridgeConnected = false;
                    }
                    break;
                }
                case MeshService.MESSAGE_LE_DISCONNECT_COMPLETE:
                    //If we get this message then the bridge is probably down
                    parentActivity.csrMeshBridgeConnected = false;
                    if (!parentActivity.shuttingdown) {
                        parentActivity.connect();
                    }
                    break;
                case MeshService.MESSAGE_BRIDGE_CONNECT_TIMEOUT:
                    // If this message occurs, the CSRMesh library seems to give up call disconnect
                    //   and then reconnect to get CSRMesh going again
                    parentActivity.csrMeshBridgeConnected=false;
                    try {
                        parentActivity.mService.disconnectBridge();
                    } catch (Exception e) {
                        //Sometimes disconnectBridge will trigger an exception in BluetoothGatt such as
                        //  android.os.DeadObjectException.  We'll just ignore these for now
                        displayException("MeshService.MESSAGE_BRIDGE_CONNECT_TIMEOUT: DisconnectBridge: ", e);
                    }
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
                    //TODO: Handle various timeouts such as association timeout
                    //parentActivity.onMessageTimeout(expectedMsg, id, meshRequestId);
                    break;
                }
                case MeshService.MESSAGE_PACKET_NOT_SENT: {
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib message packet not sent");
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
                    parentActivity.jniaddcsrmeshdeviceforpairing(shortName, uuidHash);
                    /*if (parentActivity.mAssListener != null) {
                        parentActivity.mUuidHashToAppearance.put(uuidHash, shortName);
                        // This was received after discover was enabled so let the UUID listener know.
                        parentActivity.mAssListener.newAppearance(uuidHash, appearance, shortName);
                    }*/
                    break;
                }
                case MeshService.MESSAGE_DEVICE_ASSOCIATED: {
                    // New device has been associated and is telling us its device id.
                    // Request supported models before adding to DeviceStore, and the UI.
                    int deviceId = msg.getData().getInt(MeshService.EXTRA_DEVICE_ID);
                    int uuidHash = msg.getData().getInt(MeshService.EXTRA_UUIDHASH_31);
                    parentActivity.jnicsrmeshdevicepaired(uuidHash, deviceId);
                    //Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib New device associating with id: "+String.format("0x%x", deviceId)+" uuidHash: "+String.format("0x%x", uuidHash));

                    //parentActivity.deviceID=deviceId;
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
                    //ConfigModelApi.getInfo(deviceId, ConfigModelApi.DeviceInfo.MODEL_LOW);
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
                        parentActivity.jniCSRMeshDeviceInfoModelLow(deviceId, bitmap);
                        //Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device info: deviceId: "+deviceId+" bitmap: "+bitmap);
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
                }
                default:
                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib.handleMessage unhandled="+msg.what+" "+msg.getData());
            }
        }
    }

    public static void setCSRMeshNetworkKey(String networkKey) {
        getInstance().csrMeshNetworkKey=networkKey;
    }
    public static void setCSRMeshNextDeviceId(int nextDeviceId) {
        getInstance().csrMeshNextDeviceId=nextDeviceId;
    }
    public static void CSRMeshGetModelInfoLow(int deviceId) {
        if (!getInstance().csrMeshBridgeConnected) {
            return;
        }
        ConfigModelApi.getInfo(deviceId, ConfigModelApi.DeviceInfo.MODEL_LOW);
    }
    public static String getMacAddr() {
        //Get first available mac address as that should be fairly unique
        //https://stackoverflow.com/questions/11705906/programmatically-getting-the-mac-of-an-android-device
        try {
            List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : all) {
                byte[] macBytes = nif.getHardwareAddress();
                if (macBytes == null) {
                    continue;
                }
                StringBuilder res1 = new StringBuilder();
                for (byte b : macBytes) {
                    String hex = Integer.toHexString(b & 0xFF);
                    if (hex.length() == 1)
                        hex = "0".concat(hex);
                    res1.append(hex.concat(":"));
                }
                if (res1.length() > 0) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib Found mac address="+res1+" from network interface: "+nif.getName());

                return res1.toString();
            }
        } catch (Exception ex) {
        }
        return null;
    }

    public static String getbluetoothHostMacAddress() {
        //https://stackoverflow.com/questions/25653129/how-to-get-bluetooth-mac-address-on-android
        String result = null;
        if (getInstance().context.checkCallingOrSelfPermission(Manifest.permission.BLUETOOTH)
                == PackageManager.PERMISSION_GRANTED) {
            if (Build.VERSION.SDK_INT >= 26) {
                //Reflection no longer works to get the bluetooth mac address in Android 8 and
                //  it may cause crashes in future versions so just do nothing and
                //  fallback to getting a network mac address below
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                // Hardware ID are restricted in Android 6+
                // https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html#behavior-hardware-id
                // Getting bluetooth mac via reflection for devices with Android 6+
                // NOTE: This code can't be removed as existing Android 6 and 7 users will depend on this
                //   for a consistent comm address in the database
                result = android.provider.Settings.Secure.getString(getInstance().context.getContentResolver(),
                        "bluetooth_address");
            } else {
                BluetoothAdapter bta = BluetoothAdapter.getDefaultAdapter();
                result = bta != null ? bta.getAddress() : "";
            }
            if (result==null) {
                //Unable to get the bluetooth mac address so use the Android unique device id
                //https://developer.android.com/reference/android/provider/Settings.Secure#ANDROID_ID
                String androidId = Settings.Secure.getString(getInstance().context.getContentResolver(), Settings.Secure.ANDROID_ID);;
                if (androidId!=null && androidId.length()>=16) {
                    //Generate a fake mac address based on the android id
                    result=androidId.substring(0, 2)+":";
                    result+=androidId.substring(2, 4)+":";
                    result+=androidId.substring(4, 6)+":";
                    result+=androidId.substring(10, 12)+":";
                    result+=androidId.substring(12, 14)+":";
                    result+=androidId.substring(14, 16);

                    Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib Found unique id from android device id: "+androidId);
                } else {
                    //Just get the mac address of another network device instead
                    //NOTE: This can change depending on what interfaces are active at the time
                    result=getMacAddr();
                }
            }
        }
        //-----------------------------------------------------------------------------------------

        getInstance().bluetoothHostMacAddress=result;

        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib Mac Address="+getInstance().bluetoothHostMacAddress);

        return getInstance().bluetoothHostMacAddress;
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
    public static void CSRMeshAssociateDevice(int uuidHash) {
        getInstance().associateDevice(uuidHash, null);
    }
    public static void csrMeshSetDeviceOnOff(int deviceId, int state) {
        if (state==0) {
            getInstance().setLightPower(deviceId, PowerModelApi.PowerState.OFF);
        } else if (state==1) {
            getInstance().setLightPower(deviceId, PowerModelApi.PowerState.ON);
        }
    }
    public static void csrMeshSetDeviceColor(int deviceId, int red, int green, int blue) {
        int color;

        getInstance().setLightColorRGB(deviceId, red & 0xFF, green & 0xFF, blue, 255);
    }
    public void deviceAssociated(boolean success, String message) {
        //Disable discovery once a device is associated
        mService.setDeviceDiscoveryFilterEnabled(false);
    }
    public void associationProgress(final int progress, final String message) {

    }

    public void activateAttentionMode(int uuidHash, boolean enabled) {
        if (!csrMeshBridgeConnected) {
            return;
        }
        // enable the new uuidHash.
        mService.setAttentionPreAssociation(uuidHash, enabled, ATTRACTION_DURATION_MS);
    }

    public boolean associateDevice(int uuidHash, String shortCode) {
        if (!csrMeshBridgeConnected) {
            return false;
        }
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
        if (brightness < 0 || brightness > 255) {
            throw new NumberFormatException("Brightness value should be between 0 and 255");
        }
        if (!csrMeshBridgeConnected) {
            return;
        }
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceId+" setLightColor: Red: "+(int) red+" Green: "+(int) green+" Blue: "+(int) blue+" Brightness: "+(int) brightness);

        //Color Type: 1 RGB
        //Color Type: 2 Kelvin?
        //Color Type: 3 White Light
        //SuperLightModelApi.setLevel(mSendDeviceId, (byte) 10, false);
        //SuperLightModelApi.setRgb(mSendDeviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
        SuperLightModelApi.setRgb(deviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) brightness, false);
    }
    public void setLightColor(int deviceId, int color, int brightness) {
        if (brightness < 0 || brightness > 99) {
            throw new NumberFormatException("Brightness value should be between 0 and 99");
        }
        if (!csrMeshBridgeConnected) {
            return;
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

        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceId+" setLightColor: Red: "+(int) red+" Green: "+(int) green+" Blue: "+(int) blue+" Brightness: "+(int) brightness);

        //Color Type: 1 RGB
        //Color Type: 2 Kelvin?
        //Color Type: 3 White Light
        //SuperLightModelApi.setLevel(mSendDeviceId, (byte) 10, false);
        //SuperLightModelApi.setRgb(mSendDeviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
        SuperLightModelApi.setRgb(deviceId, (byte) red, (byte) green, (byte) blue, (byte) 1, (byte) (brightness*2.56), false);
    }

    public void setLightPower(int deviceId, PowerModelApi.PowerState state) {
        if (!csrMeshBridgeConnected) {
            return;
        }
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceId+" setLightPower: state: "+state);
        try {
            PowerModelApi.setState(deviceId, state, false);
        } catch (Exception e) {
            Log.println(Log.INFO, MainLib.getInstance().getAppName(), "BluetoothHWAndroidLib device: "+deviceId+" setLightPower: state: "+state+" Exception: "+e.getMessage());
        }
    }

    static {
        System.loadLibrary("bluetoothhwandroidlib");
    }
}
