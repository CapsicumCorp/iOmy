/*
Title: Common functions and variables Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Function to insert properties and methods specific to a particular
    Thing. Part of the IOMy.common core module.
Copyright: Capsicum Corporation 2015, 2016, 2017

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

$.sap.declare("IOMy.common.createExtraThingProperties",true);

$.extend(IOMy.common,{
    
    createExtraThingProperties : function (mThing) {
        //--------------------------------------------------------------------//
        // Declare variables
        //--------------------------------------------------------------------//
        var me          = this;
        var iThingType  = mThing.ThingTypeId;
        
        console.log(mThing);
        
        //--------------------------------------------------------------------//
        // Add any methods and properties to these thing objects depending on
        // what type of thing it is.
        //--------------------------------------------------------------------//
        
        //-- If this is a door lock... --//
        if (iThingType == -1) {
            mThing.UnlockTimeout            = null; // JS Timeout:  To store the timeout function that is supposed to lock the door after a period of time.
            mThing.Switches                 = {};   // Array:       Stores the widgets that will act as switches.
            
        }
        
        return mThing;
    }
    
});