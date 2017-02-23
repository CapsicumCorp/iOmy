/*
Title: iOmy Experimental Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares various functions used for demonstrating experimental
    features, mainly new device pages using dummy data.
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

$.sap.declare("IOMy.experimental",true);

IOMy.experimental = new sap.ui.base.Object();

//----------------------------------------//
//-- LOAD OTHER MODULES                 --//
//----------------------------------------//
$.sap.registerModulePath('IOMy.experimental', sModuleInitialBuildLocation+'util/experimental');
$.sap.require("IOMy.experimental.addDemoDataToLinkList");

$.sap.registerModulePath('IOMy.experimental', sModuleInitialBuildLocation+'util/experimental');
$.sap.require("IOMy.experimental.addDemoDataToLinkTypeList");

$.sap.registerModulePath('IOMy.experimental', sModuleInitialBuildLocation+'util/experimental');
$.sap.require("IOMy.experimental.addDemoDataToThingList");