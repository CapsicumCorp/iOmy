/*
Title: Update Dummy Thing Field
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Allows for modifying dummy thing field directly at the source of
    the dummy data.
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

$.sap.declare("IOMy.experimental.updateThingField",true);

//----------------------------------------------------------------------------//
// Add this function to the experimental module.
//----------------------------------------------------------------------------//
$.extend(IOMy.experimental,{
    
    updateThingField : function (iThingId, sProperty, vNewValue) {
        //--------------------------------------------------------------------//
        // Check that the required parameters are there.
        //--------------------------------------------------------------------//
        var sErrorMessage = "Error updating the dummy thing: ";
        
        //-- Check the Thing ID --//
        if (iThingId === undefined) {
            //-- It doesn't exist... --//
            sErrorMessage += "Thing ID is not given!";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
            
        } else if (isNaN(iThingId)) {
            //-- It's not a number --//
            sErrorMessage += "Thing ID is not a valid number";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
        }
        
        //-- Check the Property name --//
        if (sProperty === undefined) {
            //-- It doesn't exist... --//
            sErrorMessage += "Property is not given!";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
            
        } else if (typeof sProperty !== "string") {
            //-- It's not a string --//
            sErrorMessage += "Property is not a string!";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
        }
        
        //-- Check the new value --//
        if (vNewValue === undefined) {
            //-- It doesn't exist... --//
            sErrorMessage += "No value given! Not updating";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
            
        }
        
        //--------------------------------------------------------------------//
        // Declare variables
        //--------------------------------------------------------------------//
        var me      = this;
        var oTmp    = null;
        var oThing  = null;
        
        //--------------------------------------------------------------------//
        // Search for and fetch the Thing using the given ID.
        //--------------------------------------------------------------------//
        for (var i = 0; i < me.aDemoThingList.length; i++) {
            oTmp = me.aDemoThingList[i];
            
            if (oTmp.ThingId === iThingId) {
                //-- Found it! --//
                oThing = oTmp;
                break;
            }
        }
        
        //--------------------------------------------------------------------//
        // Throw an exception if the Thing does not exist.
        //--------------------------------------------------------------------//
        if (oThing === null) {
            throw sErrorMessage + "Thing does not exist!";
        }
        
        //--------------------------------------------------------------------//
        // Update the field
        //--------------------------------------------------------------------//
        me.aDemoThingList[ sProperty ] = vNewValue;
    }
    
});