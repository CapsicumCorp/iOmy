/*
Title: Add Dummy Things To Thing List
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts dummy link types to the link type list.
Copyright: Capsicum Corporation 2017

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

$.sap.declare("IOMy.experimental.addDemoDataToThingList",true);

//----------------------------------------------------------------------------//
// Add this function to the experimental module.
//----------------------------------------------------------------------------//
$.extend(IOMy.experimental,{
    
    addDemoDataToThingList : function () {
        //--------------------------------------------------------------------//
        // Declare Variables and Scope
        //--------------------------------------------------------------------//
        var me                  = this;
        var iPreviousLinkId     = 0;
        var iPreviousThingId    = 0;
        var iTempLinkId         = 0;
        var iTempThingId        = 0;
        var iTempIOId           = 0;
        var oTempThing;
        var oTempIO;
        
        //--------------------------------------------------------------------//
        // Populate the ThingList Dummy Data
        //--------------------------------------------------------------------//
        
        $.each( me.aDemoThingList,function(index, aIO) {
            try {
                //--------------------------------------------------------------------//
                // PREP: Store commonly used Temporary variables
                //--------------------------------------------------------------------//
                iTempLinkId     = aIO.LinkId;
                iTempThingId    = aIO.ThingId;
                iTempIOId       = aIO.IOId;
                
                //--------------------------------------------------------------------//
                // STEP 2: Device List Thing
                //--------------------------------------------------------------------//
                if( iPreviousThingId!==iTempThingId ) {
                    //-- Check to see if the device exists --//
                    if( ! IOMy.common.ThingList["_"+iTempThingId] ) {
                        //--------------------------------------------------------//
                        //-- Add the missing "Thing"                            --//
                        //--------------------------------------------------------//

                        //-- Wipe the variable --//
                        oTempThing = {};

                        //-- Add the Id to the array --//
                        oTempThing.Id                  = iTempThingId;

                        //-- Add the basic Thing information for the Thing --//
                        oTempThing.DisplayName         = aIO.ThingName;

                        //-- Add the Thing Status (THING_STATE) --//
                        oTempThing.Status              = aIO.ThingStatus;

                        //-- Thing Type --//
                        oTempThing.TypeId              = aIO.ThingTypeId;
                        oTempThing.TypeName            = aIO.ThingTypeName;

                        //-- Add the basic Link information for the device --//
                        oTempThing.LinkId              = iTempLinkId;
                        oTempThing.LinkDisplayName     = aIO.LinkDisplayName;
                        oTempThing.LinkStatus          = aIO.LinkStatus;

                        //-- Add the Premise Id --//
                        oTempThing.PremiseId           = aIO.PremiseId;
                        //-- Add the Room Id (if a room is assigned) --//
                        oTempThing.RoomId              = aIO.RoomId;

                        //-- Store the Permissions --//
                        oTempThing.PermRead            = aIO.PermissionRead;
                        oTempThing.PermWrite           = aIO.PermissionWrite;
                        oTempThing.PermToggle          = aIO.PermissionStateToggle;

                        //-- Store when this thing was last updated --//
                        oTempThing.UILastUpdate        = new Date();

                        //-- Store references to the widgets containing display names. --//
                        oTempThing.LabelWidgets        = [];

                        //-- Add an associative array for the IOs --//
                        oTempThing.IO                  = {};

                        //--------------------------------------------------------//
                        //-- Add the Thing                                      --//
                        //--------------------------------------------------------//
                        IOMy.common.ThingList["_"+iTempThingId] = IOMy.common.createExtraThingProperties(oTempThing);

                        //--------------------------------------------------------//
                        //-- Check that the Premise is setup in the Rooms List  --//
                        //--------------------------------------------------------//
                        if( !!IOMy.common.RoomsList["_"+aIO.PremiseId] ) {
                            //-- Do nothing --//

                        } else {
                            //-- Setup the PremiseId in the RoomsList global variable --//
                            IOMy.common.RoomsList["_"+aIO.PremiseId] = {};
                        }


                        //--------------------------------------------------------//
                        //-- Check if the Room isn't valid                      --//
                        //--------------------------------------------------------//
                        if( !(aIO.RoomId >= 1) || !IOMy.common.RoomsList["_"+aIO.PremiseId]["_"+aIO.RoomId] ) {
                            //--------------------------------------------------------//
                            //-- CHECK IF THE "Unassigned" ROOM DOESN'T EXIST       --//
                            //--------------------------------------------------------//
                            if( !IOMy.common.RoomsList["_"+aIO.PremiseId].Unassigned ) {
                                //-- CREATE THE "UNASSIGNED" ROOM --//
                                IOMy.common.RoomsList["_"+aIO.PremiseId].Unassigned = { 
                                    "PremiseId":        aIO.PremiseId,
                                    "PremiseName":      aIO.PremiseName,
                                    "RoomId":           null,
                                    "RoomName":         "Unassigned",
                                    "Things":           {} 
                                };
                            }
                            //--------------------------------------------------------//
                            //-- STORE THE THING IN THE "UNASSIGNED"                --//
                            //--------------------------------------------------------//
                            IOMy.common.RoomsList["_"+aIO.PremiseId].Unassigned.Things["_"+iTempThingId] = {
                                "Link":     iTempLinkId,
                                "Thing":    iTempThingId
                            }

                        } else {
                            //--------------------------------------------------------//
                            //-- STORE THE THING IN THE ROOM                        --//
                            //--------------------------------------------------------//
                            IOMy.common.RoomsList["_"+aIO.PremiseId]["_"+aIO.RoomId].Things["_"+iTempThingId] = {
                                "Link":     iTempLinkId,
                                "Thing":    iTempThingId
                            }

                        }

                    }	//-- End if to verify if the device exists --//
                    //--------------------------------------------------------------//
                    //-- Store the Current "LinkId" as the previous "LinkId"      --//
                    //--------------------------------------------------------------//
                    iPreviousLinkId = iTempLinkId;
                }

                //------------------------------------------------------------//
                //-- 2.A.1.4 - STEP 3: Add the IO                           --//
                //------------------------------------------------------------//

                //-- Add an Associative Array for the IO to be stored in --//
                oTempIO = {};

                //------------------------------------------------------------//
                //-- Part A - IO Info                                       --//
                //------------------------------------------------------------//
                //-- Add the IO Id --//
                oTempIO.Id             = aIO.IOId;
                //-- Add the IO DisplayName --//
                oTempIO.Name           = aIO.IOName;
                //-- Add the IO Status --//
                oTempIO.Status         = aIO.IOStatus;
                //-- Add the IO Type Id --//
                oTempIO.TypeId         = aIO.IOTypeId;
                //-- Add the IO DataType --//
                oTempIO.DataType       = aIO.DataType;
                //-- Add the IO DataTypeName --//
                oTempIO.DataTypeName   = aIO.DataTypeName;
                //-- Add the IO DataType Enumeration Flags --//
                oTempIO.DataTypeEnum   = aIO.DataTypeEnum;
                //-- Add the IO SampleRate --//
                oTempIO.Samplerate     = aIO.IOSamplerate;
                //-- Add the IO ConvertRate --//
                oTempIO.Convertrate    = aIO.IOConvertRate;

                //------------------------------------------------------------//
                //-- Part B - IO UoM                                        --//
                //------------------------------------------------------------//

                //-- Add the IO UoM Id --//
                oTempIO.UoMId          = aIO.UomId;
                //-- Add the IO UoM Name --//
                oTempIO.UoMName        = aIO.UomName;
                //-- Add the IO UoMSubCat Id --//
                oTempIO.UoMSubCatId    = aIO.UomSubCatId;
                //-- Add the IO UoMSubCat Name --//
                oTempIO.UoMSubCatName  = aIO.UomSubCatName;
                //-- Add the IO UoMCat Id --//
                oTempIO.UoMCatId       = aIO.UomCatId;
                //-- Add the IO UoMCat Name --//
                oTempIO.UoMCatName     = aIO.UomCatName;

                //------------------------------------------------------------//
                //-- Part C - IO Resource Categorization                    --//
                //------------------------------------------------------------//
                //-- Add the IO RSCat Id --//
                oTempIO.RSCatId        = aIO.RSCatId;
                //-- Add the IO RSSubCat Id --//
                oTempIO.RSSubCatId     = aIO.RSSubCatId;
                //-- Add the IO RSSubCat Name --//
                oTempIO.RSSubCatName   = aIO.RSSubCatName;
                //-- Add the IO RSSubCat Type --//
                oTempIO.RSSubCatType   = aIO.RSSubCatType;
                //-- Add the IO RSTariff Id --//
                oTempIO.RSTariffId     = aIO.RSTariffId;
                //-- TODO: Add a Tariff code (to indicate which Tariff of that type) to the Database and API --//

                //-- Add the IO RSType Id --//
                oTempIO.RSTypeId       = aIO.RSTypeId;
                //-- Add the IO RSType Main Flag --//
                oTempIO.RSTypeMain     = aIO.RSTypeMain;

                //------------------------------------------------------------//
                //-- Add the IO to the device list                          --//
                //------------------------------------------------------------//
                IOMy.common.ThingList["_"+iTempThingId].IO["_"+iTempIOId] = oTempIO;
                
            } catch(e2) {
                jQuery.sap.log.error("CriticalErrorIODetect: "+e2.message, "", "IO Detection");
            }
        }); //-- End of foreach loop ($.each) --//
    },
    
    aDemoThingList : [
        //--------------------------------------------//
        // Door Lock
        //--------------------------------------------//
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":1,
            "RSCatName":"Electricity",
            "RSSubCatId":21,
            "RSSubCatName":"Electrical Potential",
            "RSSubCatType":0,
            "RSTariffId":211,
            "RSTypeId":2111,
            "RSTypeName":"Battery Voltage",
            "RSTypeMain":0,
            "LinkId":"-1",
            "LinkDisplayName":"Door Lock",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-1",
            "ThingName":"Front Door",
            "ThingStatus":1,
            "ThingTypeId":"-1",
            "ThingTypeName":"Door Lock",
            "IOId":"-1",
            "IOName":"Battery Voltage",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":10,
            "UomId":10,
            "UomName":"V",
            "UomSubCatId":7,
            "UomSubCatName":"Electric Potential",
            "UomCatId":4,
            "UomCatName":"Electrical Potential",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":13,
            "RSCatName":"Debugging",
            "RSSubCatId":40,
            "RSSubCatName":"Debugging",
            "RSSubCatType":0,
            "RSTariffId":400,
            "RSTypeId":4000,
            "RSTypeName":"Needs Categorization",
            "RSTypeMain":0,
            "LinkId":"-1",
            "LinkDisplayName":"Door Lock",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-1",
            "ThingName":"Front Door",
            "ThingStatus":1,
            "ThingTypeId":"-1",
            "ThingTypeName":"Door Lock",
            "IOId":"-2",
            "IOName":"Sensor Type",
            "IOStatus":1,
            "IOSamplerate":300,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":12,
            "RSCatName":"Device Info",
            "RSSubCatId":39,
            "RSSubCatName":"Device Info",
            "RSSubCatType":0,
            "RSTariffId":390,
            "RSTypeId":3909,
            "RSTypeName":"Special Bitwise Status",
            "RSTypeMain":0,
            "LinkId":"-1",
            "LinkDisplayName":"Door Lock",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-1",
            "ThingName":"Front Door",
            "ThingStatus":1,
            "ThingTypeId":"-1",
            "ThingTypeName":"Door Lock",
            "IOId":"-3",
            "IOName":"Status",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":6,
            "RSCatName":"Climate",
            "RSSubCatId":17,
            "RSSubCatName":"Local Climate",
            "RSSubCatType":0,
            "RSTariffId":170,
            "RSTypeId":1701,
            "RSTypeName":"Local Temperature",
            "RSTypeMain":0,
            "LinkId":"-1",
            "LinkDisplayName":"Door Lock",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-1",
            "ThingName":"Front Door",
            "ThingStatus":1,
            "ThingTypeId":"-1",
            "ThingTypeName":"Door Lock",
            "IOId":"-4",
            "IOName":"Temperature",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":100,
            "UomId":16,
            "UomName":"\u00b0C",
            "UomSubCatId":11,
            "UomSubCatName":"Temperature Metric",
            "UomCatId":7,
            "UomCatName":"Temperature",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        
        //--------------------------------------------//
        // Window Sensor
        //--------------------------------------------//
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":1,
            "RSCatName":"Electricity",
            "RSSubCatId":21,
            "RSSubCatName":"Electrical Potential",
            "RSSubCatType":0,
            "RSTariffId":211,
            "RSTypeId":2111,
            "RSTypeName":"Battery Voltage",
            "RSTypeMain":0,
            "LinkId":"-2",
            "LinkDisplayName":"Window Sensor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-2",
            "ThingName":"Laundry Window",
            "ThingStatus":1,
            "ThingTypeId":"-2",
            "ThingTypeName":"Window Sensor",
            "IOId":"-5",
            "IOName":"Battery Voltage",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":10,
            "UomId":10,
            "UomName":"V",
            "UomSubCatId":7,
            "UomSubCatName":"Electric Potential",
            "UomCatId":4,
            "UomCatName":"Electrical Potential",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":13,
            "RSCatName":"Debugging",
            "RSSubCatId":40,
            "RSSubCatName":"Debugging",
            "RSSubCatType":0,
            "RSTariffId":400,
            "RSTypeId":4000,
            "RSTypeName":"Needs Categorization",
            "RSTypeMain":0,
            "LinkId":"-2",
            "LinkDisplayName":"Window Sensor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-2",
            "ThingName":"Laundry Window",
            "ThingStatus":1,
            "ThingTypeId":"-2",
            "ThingTypeName":"Window Sensor",
            "IOId":"-6",
            "IOName":"Sensor Type",
            "IOStatus":1,
            "IOSamplerate":300,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":12,
            "RSCatName":"Device Info",
            "RSSubCatId":39,
            "RSSubCatName":"Device Info",
            "RSSubCatType":0,
            "RSTariffId":390,
            "RSTypeId":3909,
            "RSTypeName":"Special Bitwise Status",
            "RSTypeMain":0,
            "LinkId":"-2",
            "LinkDisplayName":"Window Sensor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-2",
            "ThingName":"Laundry Window",
            "ThingStatus":1,
            "ThingTypeId":"-2",
            "ThingTypeName":"Window Sensor",
            "IOId":"-7",
            "IOName":"Status",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":6,
            "RSCatName":"Climate",
            "RSSubCatId":17,
            "RSSubCatName":"Local Climate",
            "RSSubCatType":0,
            "RSTariffId":170,
            "RSTypeId":1701,
            "RSTypeName":"Local Temperature",
            "RSTypeMain":0,
            "LinkId":"-2",
            "LinkDisplayName":"Window Sensor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-2",
            "ThingName":"Laundry Window",
            "ThingStatus":1,
            "ThingTypeId":"-2",
            "ThingTypeName":"Window Sensor",
            "IOId":"-8",
            "IOName":"Temperature",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":100,
            "UomId":16,
            "UomName":"\u00b0C",
            "UomSubCatId":11,
            "UomSubCatName":"Temperature Metric",
            "UomCatId":7,
            "UomCatName":"Temperature",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        
        //--------------------------------------------//
        // Bluetooth Scales
        //--------------------------------------------//
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":1,
            "RSCatName":"Electricity",
            "RSSubCatId":21,
            "RSSubCatName":"Electrical Potential",
            "RSSubCatType":0,
            "RSTariffId":211,
            "RSTypeId":2111,
            "RSTypeName":"Battery Voltage",
            "RSTypeMain":0,
            "LinkId":"-3",
            "LinkDisplayName":"Bluetooth Scales",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-3",
            "ThingName":"Scales",
            "ThingStatus":1,
            "ThingTypeId":"-3",
            "ThingTypeName":"Bluetooth Scales",
            "IOId":"-9",
            "IOName":"Battery Voltage",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":10,
            "UomId":10,
            "UomName":"V",
            "UomSubCatId":7,
            "UomSubCatName":"Electric Potential",
            "UomCatId":4,
            "UomCatName":"Electrical Potential",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":13,
            "RSCatName":"Debugging",
            "RSSubCatId":40,
            "RSSubCatName":"Debugging",
            "RSSubCatType":0,
            "RSTariffId":400,
            "RSTypeId":4000,
            "RSTypeName":"Needs Categorization",
            "RSTypeMain":0,
            "LinkId":"-3",
            "LinkDisplayName":"Bluetooth Scales",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-3",
            "ThingName":"Scales",
            "ThingStatus":1,
            "ThingTypeId":"-3",
            "ThingTypeName":"Bluetooth Scales",
            "IOId":"-10",
            "IOName":"Sensor Type",
            "IOStatus":1,
            "IOSamplerate":300,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":12,
            "RSCatName":"Device Info",
            "RSSubCatId":39,
            "RSSubCatName":"Device Info",
            "RSSubCatType":0,
            "RSTariffId":390,
            "RSTypeId":3909,
            "RSTypeName":"Special Bitwise Status",
            "RSTypeMain":0,
            "LinkId":"-3",
            "LinkDisplayName":"Bluetooth Scales",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-3",
            "ThingName":"Scales",
            "ThingStatus":1,
            "ThingTypeId":"-3",
            "ThingTypeName":"Bluetooth Scales",
            "IOId":"-11",
            "IOName":"Status",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":6,
            "RSCatName":"Climate",
            "RSSubCatId":17,
            "RSSubCatName":"Local Climate",
            "RSSubCatType":0,
            "RSTariffId":170,
            "RSTypeId":1701,
            "RSTypeName":"Local Temperature",
            "RSTypeMain":0,
            "LinkId":"-3",
            "LinkDisplayName":"Bluetooth Scales",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-3",
            "ThingName":"Scales",
            "ThingStatus":1,
            "ThingTypeId":"-3",
            "ThingTypeName":"Bluetooth Scales",
            "IOId":"-12",
            "IOName":"Temperature",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":100,
            "UomId":16,
            "UomName":"\u00b0C",
            "UomSubCatId":11,
            "UomSubCatName":"Temperature Metric",
            "UomCatId":7,
            "UomCatName":"Temperature",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        
        //--------------------------------------------//
        // Blood Pressure Monitor
        //--------------------------------------------//
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":1,
            "RSCatName":"Electricity",
            "RSSubCatId":21,
            "RSSubCatName":"Electrical Potential",
            "RSSubCatType":0,
            "RSTariffId":211,
            "RSTypeId":2111,
            "RSTypeName":"Battery Voltage",
            "RSTypeMain":0,
            "LinkId":"-4",
            "LinkDisplayName":"Blood Pressure Monitor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-4",
            "ThingName":"BPM",
            "ThingStatus":1,
            "ThingTypeId":"-4",
            "ThingTypeName":"Blood Pressure Monitor",
            "IOId":"-13",
            "IOName":"Battery Voltage",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":10,
            "UomId":10,
            "UomName":"V",
            "UomSubCatId":7,
            "UomSubCatName":"Electric Potential",
            "UomCatId":4,
            "UomCatName":"Electrical Potential",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":13,
            "RSCatName":"Debugging",
            "RSSubCatId":40,
            "RSSubCatName":"Debugging",
            "RSSubCatType":0,
            "RSTariffId":400,
            "RSTypeId":4000,
            "RSTypeName":"Needs Categorization",
            "RSTypeMain":0,
            "LinkId":"-4",
            "LinkDisplayName":"Blood Pressure Monitor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-4",
            "ThingName":"BPM",
            "ThingStatus":1,
            "ThingTypeId":"-4",
            "ThingTypeName":"Blood Pressure Monitor",
            "IOId":"-14",
            "IOName":"Sensor Type",
            "IOStatus":1,
            "IOSamplerate":300,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":12,
            "RSCatName":"Device Info",
            "RSSubCatId":39,
            "RSSubCatName":"Device Info",
            "RSSubCatType":0,
            "RSTariffId":390,
            "RSTypeId":3909,
            "RSTypeName":"Special Bitwise Status",
            "RSTypeMain":0,
            "LinkId":"-4",
            "LinkDisplayName":"Blood Pressure Monitor",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-4",
            "ThingName":"BPM",
            "ThingStatus":1,
            "ThingTypeId":"-4",
            "ThingTypeName":"Blood Pressure Monitor",
            "IOId":"-15",
            "IOName":"Status",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        
        //--------------------------------------------//
        // Remote Controlled Garage Door
        //--------------------------------------------//
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":1,
            "RSCatName":"Electricity",
            "RSSubCatId":21,
            "RSSubCatName":"Electrical Potential",
            "RSSubCatType":0,
            "RSTariffId":211,
            "RSTypeId":2111,
            "RSTypeName":"Battery Voltage",
            "RSTypeMain":0,
            "LinkId":"-5",
            "LinkDisplayName":"Remote Controlled Garage Door",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-5",
            "ThingName":"Garage Door",
            "ThingStatus":1,
            "ThingTypeId":"-5",
            "ThingTypeName":"Remote Controlled Garage Door",
            "IOId":"-16",
            "IOName":"Battery Voltage",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":10,
            "UomId":10,
            "UomName":"V",
            "UomSubCatId":7,
            "UomSubCatName":"Electric Potential",
            "UomCatId":4,
            "UomCatName":"Electrical Potential",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":13,
            "RSCatName":"Debugging",
            "RSSubCatId":40,
            "RSSubCatName":"Debugging",
            "RSSubCatType":0,
            "RSTariffId":400,
            "RSTypeId":4000,
            "RSTypeName":"Needs Categorization",
            "RSTypeMain":0,
            "LinkId":"-5",
            "LinkDisplayName":"Remote Controlled Garage Door",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-5",
            "ThingName":"Garage Door",
            "ThingStatus":1,
            "ThingTypeId":"-5",
            "ThingTypeName":"Remote Controlled Garage Door",
            "IOId":"-17",
            "IOName":"Sensor Type",
            "IOStatus":1,
            "IOSamplerate":300,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":12,
            "RSCatName":"Device Info",
            "RSSubCatId":39,
            "RSSubCatName":"Device Info",
            "RSSubCatType":0,
            "RSTariffId":390,
            "RSTypeId":3909,
            "RSTypeName":"Special Bitwise Status",
            "RSTypeMain":0,
            "LinkId":"-5",
            "LinkDisplayName":"Remote Controlled Garage Door",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-5",
            "ThingName":"Garage Door",
            "ThingStatus":1,
            "ThingTypeId":"-5",
            "ThingTypeName":"Remote Controlled Garage Door",
            "IOId":"-18",
            "IOName":"Status",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":1,
            "UomId":1,
            "UomName":"",
            "UomSubCatId":1,
            "UomSubCatName":"",
            "UomCatId":1,
            "UomCatName":"",
            "IOTypeId":102,
            "IOTypeName":"Real Int Enum",
            "DataType":2,
            "DataTypeEnum":1,
            "DataTypeName":"integer"
        },
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":6,
            "RSCatName":"Climate",
            "RSSubCatId":17,
            "RSSubCatName":"Local Climate",
            "RSSubCatType":0,
            "RSTariffId":170,
            "RSTypeId":1701,
            "RSTypeName":"Local Temperature",
            "RSTypeMain":0,
            "LinkId":"-5",
            "LinkDisplayName":"Remote Controlled Garage Door",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-5",
            "ThingName":"Garage Door",
            "ThingStatus":1,
            "ThingTypeId":"-5",
            "ThingTypeName":"Remote Controlled Garage Door",
            "IOId":"-19",
            "IOName":"Temperature",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":100,
            "UomId":16,
            "UomName":"\u00b0C",
            "UomSubCatId":11,
            "UomSubCatName":"Temperature Metric",
            "UomCatId":7,
            "UomCatName":"Temperature",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        },
        
        //--------------------------------------------//
        // Thermostat
        //--------------------------------------------//
        {  
            "PermissionWrite":1,
            "PermissionStateToggle":1,
            "PermissionRead":1,
            "PermissionDataRead":1,
            "PremiseId":1,
            "RoomId":1,
            "RSCatId":6,
            "RSCatName":"Climate",
            "RSSubCatId":17,
            "RSSubCatName":"Local Climate",
            "RSSubCatType":0,
            "RSTariffId":170,
            "RSTypeId":1701,
            "RSTypeName":"Local Temperature",
            "RSTypeMain":0,
            "LinkId":"-6",
            "LinkDisplayName":"Thermostat",
            "LinkStatus":1,
            "LinkCommId":1,
            "ThingId":"-6",
            "ThingName":"Thermostat",
            "ThingStatus":1,
            "ThingTypeId":"-6",
            "ThingTypeName":"Thermostat",
            "IOId":"-20",
            "IOName":"Temperature",
            "IOStatus":1,
            "IOSamplerate":900,
            "IOSamplerateMax":900,
            "IOSamplerateLimit":900,
            "IOConvertRate":100,
            "UomId":16,
            "UomName":"\u00b0C",
            "UomSubCatId":11,
            "UomSubCatName":"Temperature Metric",
            "UomCatId":7,
            "UomCatName":"Temperature",
            "IOTypeId":2,
            "IOTypeName":"Real Int",
            "DataType":2,
            "DataTypeEnum":0,
            "DataTypeName":"integer"
        }
    ]
    
});