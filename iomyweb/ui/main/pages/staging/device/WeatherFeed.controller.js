/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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
sap.ui.controller("pages.staging.device.WeatherFeed", {
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/
	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (oEvent) {
				
				//-- Set Static parameters --//
				//-- (#ToDo# - Pull from the DB) --//
				
				//-- Defines the Screen Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
				
				//-- Updates Paramaters & ID's on Load --//
                oController.LoadData(oEvent.data.ThingId);
                oView.byId("ToolbarTitle").setText( iomy.common.ThingList["_"+oEvent.data.ThingId].DisplayName );
			}
		});		
	},
	
	LoadData : function (iThingId) {
        var oController = this;
        var oView       = this.getView();
        var sNAMessage  = "N/A";
        
        var fnFail = function (sError) {
            $.sap.log.error(sError);
            
            oView.byId("WeatherOutside").setText(sNAMessage);
            oView.byId("Temperature").setText(sNAMessage);
            oView.byId("Sunrise").setText(sNAMessage);
            oView.byId("Sunset").setText(sNAMessage);
            oView.byId("Humidity").setText(sNAMessage);
            oView.byId("WindDirection").setText(sNAMessage);
            oView.byId("WindSpeed").setText(sNAMessage);
            oView.byId("AirPressure").setText(sNAMessage);
        };
        
        try {
            iomy.devices.weatherfeed.FetchCurrentWeather({
                thingID : iThingId,

                onSuccess : function (mData) {
                    oView.byId("WeatherOutside").setText(mData.Condition.Value);
                    oView.byId("Temperature").setText(mData.Temperature.Value.toFixed(1) + mData.Temperature.UomName);
                    oView.byId("Sunrise").setText(mData.HumanReadable.SunriseTime);
                    oView.byId("Sunset").setText(mData.HumanReadable.SunsetTime);
                    oView.byId("Humidity").setText(mData.Humidity.Value + mData.Humidity.UomName);
                    oView.byId("WindDirection").setText(mData.HumanReadable.WindDirection);
                    oView.byId("WindSpeed").setText(mData.WindSpeed.Value + mData.WindSpeed.UomName);
                    oView.byId("AirPressure").setText(mData.Pressure.Value + mData.Pressure.UomName);

                },

                onFail : fnFail
            });
            
        } catch (e) {
            fnFail("Cannot load weather data: " + e.message);
        }
    }
		
});