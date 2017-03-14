/*
Title: iOmy Widgets Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Modified: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Description: Functions that create commonly used purpose-built UI5 widgets that
    are used across multiple pages.
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

$.sap.declare("IOMy.widgets",true);

IOMy.widgets = new sap.ui.base.Object();

$.extend(IOMy.widgets,{
    
    ThingNameLabels : {},
    
});

//----------------------------------------//
//-- LOAD OTHER MODULES                 --//
//----------------------------------------//
$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.IOMyPage");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getActionMenu");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getAppFooter");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getCountryItems");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getGenderSelectBox");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getHubSelector");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getIOMYPageHeaderNav");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getIPAddressAndPortField");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getLanguageItems");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getLinkSelector");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getLinkTypeSelector");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getListOfUsersForPremisePermissions");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getListOfUsersForRoomPermissions");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getNavigationalSubHeader");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getPermissionSelectBox");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getPostCodeItems");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getPremiseSelector");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getRoomOptions");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getRoomSelector");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getStateProvinceItems");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.getTimezoneItems");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets.selectBoxLocale");