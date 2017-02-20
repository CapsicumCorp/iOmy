/*
Title: Thermostat Device Page
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: This is a UI5 Controller that creates a page to display information about a chosen thermostat device
Copyright: Capsicum Corporation 2016, 2017

This file is part of the iOmy project.

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

sap.ui.controller("mjs.devices.Thermostat", {
    
    aElementsToDestroy : [],
    
    wWeatherField       : null,
    wTemperatureField   : null,
    wSunriseField       : null,
    wSunsetField        : null,
    wHumidityField      : null,
    wWindDirectionField : null,
    wWindSpeedField     : null,
    wPressureField      : null,
    wMainList           : null,
    wPanel              : null,
    
    destroyItemsWithIDs     : IOMy.functions.destroyItemsByIdFromView,
    
    mThingInfo : null,
    
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.Thermostat
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.Thermostat
*/
//	onAfterRendering: function() {
//		
//	},
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.Thermostat
*/
//	onExit: function() {
//
//	}

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.Thermostat
*/
    onInit : function () {
        var me = this;
        var thisView = me.getView();
        
        thisView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
                
                me.mThingInfo = IOMy.common.ThingList['_'+evt.data.ThingId];
                // Start the form creation
                me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
                me.DrawUI();            // STEP 2: Draw the actual user interface
                
            }
        });
    },
    
    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        //--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Wipe any elements with IDs assigned to them
        me.destroyItemsWithIDs(me, me.aElementsToDestroy);
        
        // Clear the element list
        me.aElementsToDestroy = [];
    },
    
    /**
     * Constructs the user interface for this page.
     */
    DrawUI : function () {
        //=======================================================\\
        // DECLARE VARIABLES
        //=======================================================\\
        var me = this;
        var thisView = me.getView();
        var weatherModule = IOMy.devices.weatherfeed;
        var widgetIDs = weatherModule.uiIDs;
        
        //=======================================================\\
        // CONSTRUCT FIELDS
        //=======================================================\\
        
        //-- Refresh the Navigational buttons --//
        IOMy.common.NavigationRefreshButtons( me );
        
        // WEATHER
        me.wWeatherField = new sap.m.Text(me.createId(widgetIDs.sConditionDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // TEMPERATURE
        me.wTemperatureField = new sap.m.Text(me.createId(widgetIDs.sTemperatureDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // SUNRISE
        me.wSunriseField = new sap.m.Text(me.createId(widgetIDs.sSunriseDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // SUNSET
        me.wSunsetField = new sap.m.Text(me.createId(widgetIDs.sSunsetDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // HUMIDITY
        me.wHumidityField = new sap.m.Text(me.createId(widgetIDs.sHumidityDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // WIND
        me.wWindDirectionField = new sap.m.Text(me.createId(widgetIDs.sWindDirectionDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        me.wWindSpeedField = new sap.m.Text(me.createId(widgetIDs.sWindSpeedDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // PRESSURE
        me.wPressureField = new sap.m.Text(me.createId(widgetIDs.sPressureDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // Populate the fields
        weatherModule.FetchCurrentWeather(me.mThingInfo.Id, me, "");
        
        //=======================================================\\
        // CONSTRUCT THE MAIN LIST
        //=======================================================\\
        me.wMainList = new sap.m.List({
            items :[
                //-- Weather Outside --//
                new sap.m.InputListItem ({
                    label : "Weather Outside:",
                    content : [
                        //-- Column 2 for Weather Outside Row --//
                        me.wWeatherField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Temperature Outside --//
                new sap.m.InputListItem ({
                    label : "Temperature:",
                    content : [
                        //-- Column 2 for Temperature Row --//
                        me.wTemperatureField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Sunrise --//
                new sap.m.InputListItem ({
                    label : "Sunrise:",
                    content : [
                        //-- Column 2 for Sunrise Row --//
                        me.wSunriseField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Sunset --//
                new sap.m.InputListItem ({
                    label : "Sunset:",
                    content : [
                        //-- Column 2 for Sunset Row --//
                        me.wSunsetField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Humidity --//
                new sap.m.InputListItem ({
                    label : "Humidity:",
                    content : [
                        //-- Column 2 for Humidity Row --//
                        me.wHumidityField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Wind Direction --//
                new sap.m.InputListItem ({
                    label : "Wind Direction:",
                    content : [
                        //-- Column 2 for Wind Direction Row --//
                        me.wWindDirectionField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Wind Speed --//
                new sap.m.InputListItem ({
                    label : "Wind Speed:",
                    content : [
                        //-- Column 2 for Wind Speed Row --//
                        me.wWindSpeedField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Air Pressure --//
                new sap.m.InputListItem ({
                    label : "Air Pressure:",
                    content : [
                        //-- Column 2 for Air Pressure Row --//
                        me.wPressureField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
            ]
        }).addStyleClass("PadBottom10px UserInputForm");
        
        me.wPanel = new sap.m.Panel({
            backgroundDesign: "Transparent",
            content : [me.wMainList]
        });
        
        thisView.byId("page").addContent(me.wPanel);
    }
});