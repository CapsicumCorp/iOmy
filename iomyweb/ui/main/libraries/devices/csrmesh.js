/*
Title: CSR Bluetooth Mesh Device Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the information for a CSR Mesh device.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IomyRe.devices.csrmesh",true);
IomyRe.devices.csrmesh = new sap.ui.base.Object();

$.extend(IomyRe.devices.csrmesh,{
    
    LinkTypeId        : 15,
    ThingTypeId       : 19,
    
    RSHue           : 3901,
    RSSaturation    : 3902,
    RSBrightness    : 3903,
});