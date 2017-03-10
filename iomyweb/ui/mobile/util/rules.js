/*
Title: Rule Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Contains a library for handling device rules for home automation.
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

$.sap.declare("IOMy.rules",true);

IOMy.rules = new sap.ui.base.Object();

//----------------------------------------//
//-- LOAD VALIDATION FUNCTIONS          --//
//----------------------------------------//
//$.sap.registerModulePath('IOMy.rules', sModuleInitialBuildLocation+'util/validation');
//$.sap.require("IOMy.rules.addRule");