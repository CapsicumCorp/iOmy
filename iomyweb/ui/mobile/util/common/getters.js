/*
Title: Extension of Common Library (Getters for Core Variable Items)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes functions to retrive items from the core variables.
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

$.sap.declare("IOMy.common.getters",true);

$.extend(IOMy.common, {
    
    /**
     * Fetches a premise from IOMy.common.PremiseList
     * 
     * @param {type} iPremiseId         ID of the premise to retrieve from memory
     * @returns {Object}                Premise
     * 
     * @throws PremiseNotFoundException
     */
    getPremise : function (iPremiseId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var oPremise = null;
        
        //--------------------------------------------------------------------//
        // Get premise and return it
        //--------------------------------------------------------------------//
        for (var i = 0; i < this.PremiseList.length; i++) {
            // There is still an inconsistency with the data types of these two
            // IDs. They are the same value but not the same type. This is why
            // two equal signs are used to compare instead of the preferred three.
            if (this.PremiseList[i].Id == iPremiseId) {
                oPremise = this.PremiseList[i];
                break;
            }
        }
        
        if (oPremise === null) {
            throw new PremiseNotFoundException();
        }
        
        return oPremise;
    }
    
});