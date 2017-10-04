/*
Title: Philips Hue Device Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Philips Hue device entry.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IomyRe.devices.philipshue",true);
IomyRe.devices.philipshue = new sap.ui.base.Object();

$.extend(IomyRe.devices.philipshue,{
	Devices: [],
	
	LinkTypeId		: 7,
    
    RSHue           : 3901,
    RSSaturation    : 3902,
    RSBrightness    : 3903,
	
	DevicePageID : "pPhilipsHue"
});