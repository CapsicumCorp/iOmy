/*
Title: Add Dummy Links To Link Type List
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts dummy links to the link type list.
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

$.sap.declare("IOMy.experimental.addDemoDataToLinkTypeList",true);

//----------------------------------------------------------------------------//
// Add this function to the experimental module.
//----------------------------------------------------------------------------//
$.extend(IOMy.experimental,{
    
    addDemoDataToLinkTypeList : function () {
        //---------------------------------------//
        // Door Lock
        //---------------------------------------//
        IOMy.common.LinkTypeList.push({
            "LinkTypeId" : "-1",
            "LinkTypeName" : "Door Lock"
        });

        //---------------------------------------//
        // Window Sensor
        //---------------------------------------//
        IOMy.common.LinkTypeList.push({
            "LinkTypeId" : "-2",
            "LinkTypeName" : "Window Sensor"
        });

        //---------------------------------------//
        // Bluetooth Scales
        //---------------------------------------//
        IOMy.common.LinkTypeList.push({
            "LinkTypeId" : "-3",
            "LinkTypeName" : "Bluetooth Scales"
        });

        //---------------------------------------//
        // Blood Pressure Monitor
        //---------------------------------------//
        IOMy.common.LinkTypeList.push({
            "LinkTypeId" : "-4",
            "LinkTypeName" : "Blood Pressure Monitor"
        });

        //---------------------------------------//
        // Remote Controlled Garage Door
        //---------------------------------------//
        IOMy.common.LinkTypeList.push({
            "LinkTypeId" : "-5",
            "LinkTypeName" : "Remote Controlled Garage Door"
        });
        
        //---------------------------------------//
        // Thermostat
        //---------------------------------------//
        IOMy.common.LinkTypeList.push({
            "LinkTypeId" : "-6",
            "LinkTypeName" : "Thermostat"
        });
    }
    
});