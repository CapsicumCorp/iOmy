/*
Title: Line Graph
Author: Andrew Sommerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Drafted By: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>

Description:
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

sap.ui.controller("mjs.devices.graphs.LineGraph", {
	
	Graph_Data:          [],
	
	iIOId				: 0,
	iThingId			: 0,
	sTimePeriod			: 0,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.graphs.LineGraph
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				var dateCurrentTime = new Date();
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				me.iIOId = evt.data.IO_ID;
				me.iThingId	= evt.data.ThingId;
				me.sTimePeriod = evt.data.TimePeriod;
				
				$("#LineGraphPage_Main").html("");
                $("#LineGraphPage_Main_Info").html("");
				me.GetLineDataAndDrawGraph( Math.floor(dateCurrentTime.getTime() / 1000), me.sTimePeriod );
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.graphs.LineGraph
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.graphs.LineGraph
*/
	onAfterRendering: function() {
		var oController    = this;
		var oView          = this.getView();

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.graphs.AddRule
*/
	onExit: function() {

	},
	
	GetLineDataAndDrawGraph : function (iEndUTS, sPeriodType) {
		var oController		= this;
		var oView			= this.getView();
		var iStartUTS		= iEndUTS;
		
		if (sPeriodType === IOMy.graph_jqplot.PeriodDay) {
			iStartUTS = iEndUTS - 86400;
		} else if (sPeriodType === IOMy.graph_jqplot.PeriodWeek) {
			iStartUTS = iEndUTS - (86400 * 7);
		} else if (sPeriodType === IOMy.graph_jqplot.PeriodFortnight) {
			iStartUTS = iEndUTS - (86400 * 14);
		} else if (sPeriodType === IOMy.graph_jqplot.PeriodMonth) {
			iStartUTS = iEndUTS - (86400 * 31);
		} else if (sPeriodType === IOMy.graph_jqplot.PeriodQuarter) {
			iStartUTS = iEndUTS - (86400 * 91);
		} else if (sPeriodType === IOMy.graph_jqplot.PeriodYear) {
			iStartUTS = iEndUTS - (86400 * 365);
		}
		
		//============================================================================================//
		//--  2.1 - LINE GRAPH API DATA                                                             ==//
		//============================================================================================//
		IOMy.apiphp.AjaxRequest({
			url:       IOMy.apiphp.APILocation("graph"),
			data:      {
				"Mode": "GraphLine",
				"Data": "{\"Type\":\"NormalAvg\",\"IOId\":"+oController.iIOId+"}",
				"StartUTS": iStartUTS,
				"EndUTS":   iEndUTS,
				"Points":   100
			},
			onSuccess: function ( sType, aData ) {
				
				if( sType==="JSON" && aData.Error===false ) {
					oController.Graph_Data = [];
					
					$.each( aData.Data,function(index, aLineData) {
						oController.Graph_Data.push( [aLineData.LastTimestamp, aLineData.Value]);
					});
					
					//----------------------------//
					//-- GRAPH                  --//
					//----------------------------//
					var sDeviceName		= IOMy.common.ThingList["_"+oController.iThingId].DisplayName;
					var sIOName			= IOMy.common.ThingList["_"+oController.iThingId].IO["_"+oController.iIOId].Name;
					var sUOM			= IOMy.common.ThingList["_"+oController.iThingId].IO["_"+oController.iIOId].UoMName;

					var oLineTest = IOMy.graph_jqplot.CreateLineGraph(
						oController,
						'LineGraphPage_Main',
						[
							{
								"Label":    sDeviceName,
								"Data":     oController.Graph_Data
							}//,
							//{
							//	"Label":    "Fridge",
							//	"Data":     oController.Graph_Data2
							//}
						],
						{
							"sTitle":               sDeviceName + " (" + sIOName + ")",
							"sType":                "1YAxis",
							"UseLegend":            false,
							"LegendPreset":         2,
							"AxisX_Label":          "Time",
							"AxisX_UseDate":        true,
							"AxisY_Label":          sUOM,
							"TimePeriod":           "year"
						}
					);
					
				} else {
					//-- Run the fail event
					
				}
			},
			onFail: function () {
				
			}
		});
	}
	
});