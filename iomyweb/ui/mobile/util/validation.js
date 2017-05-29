/*
Title: Argument and Parameter Validation Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Holds numerous functions for verifying specific data to check that
    said data is valid.
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

$.sap.declare("IOMy.validation",true);

IOMy.validation = new sap.ui.base.Object();

//----------------------------------------//
//-- LOAD VALIDATION FUNCTIONS          --//
//----------------------------------------//
$.sap.registerModulePath('IOMy.validation', sModuleInitialBuildLocation+'util/validation');
$.sap.require("IOMy.validation.isDateValid");

$.sap.registerModulePath('IOMy.validation', sModuleInitialBuildLocation+'util/validation');
$.sap.require("IOMy.validation.isDOBValid");

$.sap.registerModulePath('IOMy.validation', sModuleInitialBuildLocation+'util/validation');
$.sap.require("IOMy.validation.isLinkIDValid");

$.sap.registerModulePath('IOMy.validation', sModuleInitialBuildLocation+'util/validation');
$.sap.require("IOMy.validation.isThingIDValid");

$.sap.registerModulePath('IOMy.validation', sModuleInitialBuildLocation+'util/validation');
$.sap.require("IOMy.validation.isRoomIDValid");