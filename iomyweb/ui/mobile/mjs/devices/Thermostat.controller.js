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
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined)
                me.byId(sCurrentID).destroy();
        }
        
        // Clear the array
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
        
        // Boxes
        var oWeatherLabel, oWeatherField;
        var oSunriseLabel, oSunriseField;
        var oSunsetLabel, oSunsetField;
        var oTemperatureLabel, oTemperatureField;
        var oHumidityLabel, oHumidityField;
        var oWindDirectionLabel, oWindDirectionField;
        var oWindSpeedLabel, oWindSpeedField;
        var oPressureLabel, oPressureField;
        var oColumn1, oColumn2;
        var oInfoBox;
        var oVertBox, oPanel;
        
        //=======================================================\\
        // CONSTRUCT ELEMENTS
        //=======================================================\\
        
        //-- Refresh the Navigational buttons --//
        IOMy.common.NavigationRefreshButtons( me );
        
        // WEATHER
        oWeatherLabel = new sap.m.Text({
            text : "Weather outside:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oWeatherField = new sap.m.Text(me.createId(widgetIDs.sConditionDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // TEMPERATURE
        oTemperatureLabel = new sap.m.Text({
            text : "Temperature:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oTemperatureField = new sap.m.Text(me.createId(widgetIDs.sTemperatureDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // SUNRISE
        oSunriseLabel = new sap.m.Text({
            text : "Sunrise:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oSunriseField = new sap.m.Text(me.createId(widgetIDs.sSunriseDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // SUNSET
        oSunsetLabel = new sap.m.Text({
            text : "Sunset:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oSunsetField = new sap.m.Text(me.createId(widgetIDs.sSunsetDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // HUMIDITY
        oHumidityLabel = new sap.m.Text({
            text : "Humidity:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oHumidityField = new sap.m.Text(me.createId(widgetIDs.sHumidityDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // WIND
        oWindDirectionLabel = new sap.m.Text({
            text : "Wind Direction:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oWindDirectionField = new sap.m.Text(me.createId(widgetIDs.sWindDirectionDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        oWindSpeedLabel = new sap.m.Text({
            text : "Wind Speed:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oWindSpeedField = new sap.m.Text(me.createId(widgetIDs.sWindSpeedDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // PRESSURE
        oPressureLabel = new sap.m.Text({
            text : "Air Pressure:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        oPressureField = new sap.m.Text(me.createId(widgetIDs.sPressureDisplayID), {
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // Populate the fields
        weatherModule.FetchCurrentWeather(me.mThingInfo.Id, me, "");
        
        oColumn1 = new sap.m.VBox({
            items : [
                oWeatherLabel,
                oTemperatureLabel,
                oHumidityLabel,
                oWindDirectionLabel,
                oWindSpeedLabel,
                oPressureLabel,
                oSunriseLabel,
                oSunsetLabel
            ]
        }).addStyleClass("width160px");
        
        oColumn2 = new sap.m.VBox({
            items : [
                oWeatherField,
                oTemperatureField,
                oHumidityField,
                oWindDirectionField,
                oWindSpeedField,
                oPressureField,
                oSunriseField,
                oSunsetField
            ]
        });
        
        oInfoBox = new sap.m.HBox({
            items : [oColumn1, oColumn2]
        });
        
        me.aElementsToDestroy.push("mainBox");
        oVertBox = new sap.m.VBox(me.createId("mainBox"),{
            items : [oInfoBox]
        });
        
        me.aElementsToDestroy.push("panel");
        oPanel = new sap.m.Panel(me.createId("panel"), {
            content : [oVertBox]
        }).addStyleClass("UserInputForm");
        
        thisView.byId("page").addContent(oPanel);
    }
});