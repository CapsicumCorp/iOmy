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

$.sap.require("IomyRe.graph_jqplot");

sap.ui.controller("pages.staging.graphs.LineGraph", {
	
	Graph_Data:          [],
	
	iIOId				: 0,
	iThingId			: 0,
	sTimePeriod			: 0,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.staging.graphs.LineGraph
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = oController.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				var dateCurrentTime = new Date();
				
				oController.iIOId = evt.data.IO_ID;
				oController.iThingId	= evt.data.ThingId;
				oController.sTimePeriod = evt.data.TimePeriod;
				
				$("#LineGraphPage_Main").html("");
                $("#LineGraphPage_Main_Info").html("");
				oController.GetLineDataAndDrawGraph( Math.floor(dateCurrentTime.getTime() / 1000), oController.sTimePeriod );
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf pages.staging.graphs.LineGraph
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf pages.staging.graphs.LineGraph
*/
	onAfterRendering: function() {
		var oController    = this;
		var oView          = this.getView();

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf pages.staging.graphs.AddRule
*/
	onExit: function() {

	},
	
	GetLineDataAndDrawGraph : function (iEndUTS, sPeriodType) {
		var oController		= this;
		var oView			= this.getView();
		var iStartUTS		= iEndUTS;
		
		if (sPeriodType === IomyRe.graph_jqplot.PeriodDay) {
			iStartUTS = iEndUTS - 86400;
		} else if (sPeriodType === IomyRe.graph_jqplot.PeriodWeek) {
			iStartUTS = iEndUTS - (86400 * 7);
		} else if (sPeriodType === IomyRe.graph_jqplot.PeriodFortnight) {
			iStartUTS = iEndUTS - (86400 * 14);
		} else if (sPeriodType === IomyRe.graph_jqplot.PeriodMonth) {
			iStartUTS = iEndUTS - (86400 * 31);
		} else if (sPeriodType === IomyRe.graph_jqplot.PeriodQuarter) {
			iStartUTS = iEndUTS - (86400 * 91);
		} else if (sPeriodType === IomyRe.graph_jqplot.PeriodYear) {
			iStartUTS = iEndUTS - (86400 * 365);
		}
		
		//============================================================================================//
		//--  2.1 - LINE GRAPH API DATA                                                             ==//
		//============================================================================================//
		IomyRe.apiphp.AjaxRequest({
			url:       IomyRe.apiphp.APILocation("graph"),
			data:      {
				"Mode": "GraphLine",
				"Data": "{\"Type\":\"Normal\",\"IOId\":"+oController.iIOId+"}",
				"StartUTS": iStartUTS,
				"EndUTS":   iEndUTS,
				"Points":   100
			},
			onSuccess: function ( sType, aData ) {
                try {
                    //-- Check that the data is JSON. --//
                    if( sType==="JSON" ) {
                        //-- Only proceed normally if the error flag is not true. --//
                        if ( aData.Error !== true ) {
                            oController.Graph_Data = [];

                            $.each( aData.Data,function(index, aLineData) {
                                oController.Graph_Data.push( [aLineData.Timestamp, aLineData.Value]);
                            });

                            //----------------------------//
                            //-- GRAPH                  --//
                            //----------------------------//
                            var sDeviceName		= IomyRe.common.ThingList["_"+oController.iThingId].DisplayName;
                            var sIOName			= IomyRe.common.ThingList["_"+oController.iThingId].IO["_"+oController.iIOId].Name;
                            var sUOM			= IomyRe.common.ThingList["_"+oController.iThingId].IO["_"+oController.iIOId].UoMName;

                            try {
                                IomyRe.graph_jqplot.CreateLineGraph(
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
                                        "TimePeriod":           sPeriodType
                                    }
                                );
                            } catch (e) {
                                $.sap.log.error("An error occurred drawing the line graph ("+e.name+"): " + e.message);
                            }
                            
                        } else {
                            $.sap.log.error("Failed to load line graph data: " + aData.ErrMesg);
                        }

                    } else {
                        $.sap.log.error("Graph API data returned was not in JSON format. The format was "+sType+".");
                    }
                } catch (e) {
                    $.sap.log.error("An error occurred while processing line graph data ("+e.name+"): " + e.message);
                }
			},
            
			onFail: function (response) {
				$.sap.log.error("An error occurred loading the API: " + response.responseText);
			}
		});
	}
	
});