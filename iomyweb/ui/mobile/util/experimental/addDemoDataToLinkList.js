/*
Title: Add Dummy Links To Link List
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts dummy links to the link list
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

$.sap.declare("IOMy.experimental.addDemoDataToLinkList",true);

//----------------------------------------------------------------------------//
// Add this function to the experimental module.
//----------------------------------------------------------------------------//
$.extend(IOMy.experimental,{
    
    addDemoDataToLinkList : function () {
        //---------------------------------------//
        // Door Lock
        //---------------------------------------//
        IOMy.common.LinkList.push({
            "LinkId" : "-1",
            "LinkName" : "Front Door",
            "LinkSerialCode" : null,
            "LinkConnected" : 1,
            "LinkState" : 1,
            "LinkRoomId" : "29",
            "LinkTypeId" : "-1",
            "LinkTypeName" : "Door Lock",
            "LinkConnId" : 1,
            "LinkConnName" : null,
            "LinkConnAddress" : null,
            "LinkConnUsername" : null,
            "LinkConnPassword" : null,
            "LinkConnPort" : null,
            "PremiseId" : 1
        });

        //---------------------------------------//
        // Window Sensor
        //---------------------------------------//
        IOMy.common.LinkList.push({
            "LinkId" : "-2",
            "LinkName" : "Garage Window",
            "LinkSerialCode" : null,
            "LinkConnected" : 1,
            "LinkState" : 1,
            "LinkRoomId" : "1",
            "LinkTypeId" : "-2",
            "LinkTypeName" : "Window Sensor",
            "LinkConnId" : 1,
            "LinkConnName" : null,
            "LinkConnAddress" : null,
            "LinkConnUsername" : null,
            "LinkConnPassword" : null,
            "LinkConnPort" : null,
            "PremiseId" : 1
        });

        //---------------------------------------//
        // Bluetooth Scales
        //---------------------------------------//
        IOMy.common.LinkList.push({
            "LinkId" : "-3",
            "LinkName" : "Bluetooth Scales",
            "LinkSerialCode" : null,
            "LinkConnected" : 1,
            "LinkState" : 1,
            "LinkRoomId" : "46",
            "LinkTypeId" : "-3",
            "LinkTypeName" : "Bluetooth Scales",
            "LinkConnId" : 1,
            "LinkConnName" : null,
            "LinkConnAddress" : null,
            "LinkConnUsername" : null,
            "LinkConnPassword" : null,
            "LinkConnPort" : null,
            "PremiseId" : 1
        });

        //---------------------------------------//
        // Blood Pressure Monitor
        //---------------------------------------//
        IOMy.common.LinkList.push({
            "LinkId" : "-4",
            "LinkName" : "Blood Pressure Monitor",
            "LinkSerialCode" : null,
            "LinkConnected" : 1,
            "LinkState" : 1,
            "LinkRoomId" : "46",
            "LinkTypeId" : "-4",
            "LinkTypeName" : "Blood Pressure Monitor",
            "LinkConnId" : 1,
            "LinkConnName" : null,
            "LinkConnAddress" : null,
            "LinkConnUsername" : null,
            "LinkConnPassword" : null,
            "LinkConnPort" : null,
            "PremiseId" : 1
        });

        //---------------------------------------//
        // Remote Controlled Garage Door
        //---------------------------------------//
        IOMy.common.LinkList.push({
            "LinkId" : "-5",
            "LinkName" : "Remote Controlled Garage Door",
            "LinkSerialCode" : null,
            "LinkConnected" : 1,
            "LinkState" : 1,
            "LinkRoomId" : "35",
            "LinkTypeId" : "-5",
            "LinkTypeName" : "Remote Controlled Garage Door",
            "LinkConnId" : 1,
            "LinkConnName" : null,
            "LinkConnAddress" : null,
            "LinkConnUsername" : null,
            "LinkConnPassword" : null,
            "LinkConnPort" : null,
            "PremiseId" : 1
        });
        
        //---------------------------------------//
        // Thermostat
        //---------------------------------------//
        IOMy.common.LinkList.push({
            "LinkId" : "-6",
            "LinkName" : "Thermostat",
            "LinkSerialCode" : null,
            "LinkConnected" : 1,
            "LinkState" : 1,
            "LinkRoomId" : "1",
            "LinkTypeId" : "-6",
            "LinkTypeName" : "Thermostat",
            "LinkConnId" : 1,
            "LinkConnName" : null,
            "LinkConnAddress" : null,
            "LinkConnUsername" : null,
            "LinkConnPassword" : null,
            "LinkConnPort" : null,
            "PremiseId" : 1
        });
        
        IOMy.common.LinkListLastUpdate = new Date();
    }
    
});