/*
Title: Extension of Common Library (Fetch Premise Permissions)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes a function to fetch permission settings of a selected
    premise for a given user
Copyright: Capsicum Corporation 2016, 2017

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

$.sap.declare("IOMy.common.premises.getPremise",true);

$.extend(IOMy.common, {
    
    /**
     * Checks a premise to see if the user has room admin privileges for a given
     * premise.
     * 
     * @param {type} iPremiseId
     * @returns {Boolean|null}              True or False.
     * 
     * @throws MissingArgumentException if the premise ID is not given
     */
    hasRoomAdminAccess : function (iPremiseId) {
        //--------------------------------------------------------------------//
        // Check that the premise ID is given.
        //--------------------------------------------------------------------//
        if (iPremiseId === undefined) {
            throw MissingArgumentException("Premise ID needs to be specified!");
        }
        
        try {
            //----------------------------------------------------------------//
            // Determine if the premise has room admin privileges assigned to
            // the current user.
            //----------------------------------------------------------------//
            var oPremise = this.getPremise(iPremiseId);

            if (oPremise.PermRoomAdmin == 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            //----------------------------------------------------------------//
            // A PremiseNotFoundException may occur. Prepare for it.
            //----------------------------------------------------------------//
//            if (err.name === "PremiseNotFoundException") {
//                jQuery.sap.log.warning("Couldn't check room admin privileges if the premise doesn't exist.");
//                return null;
//            } else {
//                // It's an unexpected exception. Rethrow it.
//                throw err;
//            }
            jQuery.sap.log.error(err.getMessage());
            return false;
            
        }
    }
    
});