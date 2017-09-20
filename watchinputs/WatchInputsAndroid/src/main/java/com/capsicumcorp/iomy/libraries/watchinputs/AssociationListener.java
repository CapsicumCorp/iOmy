
/******************************************************************************
 Copyright Cambridge Silicon Radio Limited 2014 - 2015.
 ******************************************************************************/

package com.capsicumcorp.iomy.libraries.watchinputs;

import java.util.UUID;

/**
 * Call backs implemented by AssociationFragment, and called by MainActivity.
 * 
 */
public interface AssociationListener {

    /**
     * Called when a new UUID has been discovered from a device.
     * 
     * @param uuid
     *            The full UUID of the device.
     * @param uuidHash
     *            The 31-bit UUID hash of the device.
     * @param rssi
     *            RSSI of the advert that contained the device uuid packet.
     * @param ttl
     *            Message Sequence number provides uniqueness for MTL.
     */
    public void newUuid(UUID uuid, int uuidHash, int rssi, int ttl);
    
    /**
     * Called when a new appearance has been received.
     * 
     * @param uuidHash
     *            The 31-bit UUID hash of the device.
     * @param appearance
     *            The 24-bit appearance of the device.
     * @param shortName
     *            The short name of the device.
     */
    public void newAppearance(int uuidHash, byte[] appearance, String shortName);

    /**
     * Called when association is complete with a device, or if association failed.
     * 
     * @param success
     *            True if association completed successfully.
     * @param message
     *            Message to deliver to the user.
     *
     */
    public void deviceAssociated(boolean success, String message);
    
    
    /**
     * Called to change the association bar progress
     * 
     * @param progress Percent between 0-100 of the association process.
     * @param message to be displayed.
     * 
     */
    public void associationProgress(int progress, String message);
}
