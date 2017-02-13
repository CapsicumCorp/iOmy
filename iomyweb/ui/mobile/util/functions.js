/*
Title: iOmy Functions Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares various functions that are used across multiple pages.
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

$.sap.declare("IOMy.functions",true);

IOMy.functions = new sap.ui.base.Object();

//----------------------------------------//
//-- LOAD OTHER MODULES                 --//
//----------------------------------------//
$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.destroyItemsById");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.destroyItemsByIdFromView");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getLengthOfTimePassed");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getLinkConnInfo");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getLinkTypeIDOfLink");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfDevices");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfDevicesInRoom");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfHubsInPremise");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfThingsInLink");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfRooms");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfRoomsInPremise");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getNumberOfPremises");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getPremiseIDFromHub");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.getTimestampString");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.loadLocaleCBoxItems");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.setCurrentUserNameForNavigation");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.showHelpDialog");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.ValidateIPAddress");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.validateSecurePassword");