/*
Title: Line Graph Example
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
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

sap.ui.controller("pages.staging.graphs.PieGraph", {
	
	Graph_Data1:          [],
	Graph_Data2:          [],
	
	iIOId               : 0,
	iThingId			: 0,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.staging.graphs.PieGraph
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = oController.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
                oController.iIOId	= evt.data.IO_ID;
				oController.iThingId	= evt.data.ThingId;
                
				var dateCurrentTime = new Date();
				$("#PieGraphPage_Main").html("");
				$("#PieGraphPage_Main_Info").html("");
				
                oController.GetPieDataAndDrawGraph( oController.iIOId, (dateCurrentTime.getTime() / 1000) );
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf pages.staging.graphs.PieGraph
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf pages.staging.graphs.PieGraph
*/
	onAfterRendering: function() {
		var oController    = this;
		var oView          = this.getView();
		
		//============================================================================================//
		//-- 4.1 - BAR GRAPH API DATA                                                               ==//
		//============================================================================================//
		
		
		
		
		//============================================================================================//
		//-- 4.2 - BAR GRAPH STATIC DATA                                                            ==//
		//============================================================================================//
		/*
		
		var aTicks = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
		
		var oVarTest = IomyRe.graph_jqplot.CreatePieGraph( 
			oController,
			'PieGraphPage_Main',
			[
				{
					"Label": "Fake Data 1",
					"Color": "crimson",
					"Data":  [ 20.34, 66.8, 70.2, 100, 89.9, 75, 60 ]
				},
				{
					"Label": "Fake Data 2",
					"Color": "forestgreen",
					"Data":  [ 100, 89.9, 75, 60, 20.34, 66.8, 70.2 ]
				},
				{
					"Label": "Fake Data 3",
					"Color": "blue",
					"Data":  [ 70, 65, 60, 55, 50, 45, 40 ]
				},
				{
					"Label": "Fake Data 4",
					"Color": "orange",
					"Data":  [ 10, 20, 30, 40, 50, 60, 70 ]
				}
			],
			{
				"sTitle":       "Fake Data Bar Test",
				"sType":        "Basic",
				"UseLegend":    true,
				"LegendPreset": 2,
				"AxisX_Label":  "Week",
				"AxisY_Label":  "Fake UoM",
				"AxisX_TickCategories": aTicks
			}
		);
		
		
		$('#PieGraphPage_Main').bind('jqplotDataHighlight', 
			function( ev, seriesIndex, iPointIndex, aData ) {
				//$('#PieGraphPage_Main_Info').html('series: '+seriesIndex+', point: '+pointIndex+', data: '+data);
				try {
					$('#PieGraphPage_Main_Info').html(' '+aTicks[iPointIndex]+': '+aData[1]+' ');
					
				} catch( e1 ) {
					$('#PieGraphPage_Main_Info').html( e1.message );
				}
			}
		);
		
		
		$('#PieGraphPage_Main').bind('jqplotDataUnhighlight', 
			function (ev) {
				$('#PieGraphPage_Main_Info').html('');
			}
		);
		
		*/

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf pages.staging.graphs.AddRule
*/
	onExit: function() {
        
	},
    
    GetPieDataAndDrawGraph : function ( iIOId, iEndUTS ) {
        //----------------------------------------------------//
        //-- 1.0 - Declare Variables                        --//
        //----------------------------------------------------//
        var oController    = this;
		var oView          = this.getView();


        //----------------------------------------------------//
        //-- 4.0 - Get the data for the appropriate Period  --//
        //----------------------------------------------------//
        IomyRe.apiphp.AjaxRequest({
			url:       IomyRe.apiphp.APILocation("graph"),
			data:      {
				"Mode": "6HourPiePreviousDay",
				"Data": "{\"Type\":\"Normal\",\"IOId\":"+iIOId+"}",
				"EndUTS":   iEndUTS
			},
			onSuccess: function ( sType, aData ) {
				try {
					
                    if( sType==="JSON") {
                        if ( aData.Error===false ) {

                            //-- Store the Ajax data --//
                            oController.Graph_Data1 = [
                                [ 'Night',     aData.Data.Night ],
                                [ 'Morning',   aData.Data.Morning ],
                                [ 'Afternoon', aData.Data.Afternoon ],
                                [ 'Evening',   aData.Data.Evening ]
                            ];

                            try {
                                //-- Create the Pie Graph --//
                                IomyRe.graph_jqplot.CreatePieGraph( 
                                    oController,
                                    'PieGraphPage_Main',
                                    [
                                        {
                                            "Data": oController.Graph_Data1
                                        }
                                    ],
                                    {
                                        "sTitle":       "6 Hour Usage",
                                        "sType":        "6HourPie",
                                        "UseLegend":    true,
                                        "LegendPreset": 2
                                    }
                                );

                            } catch (e) {
                                $.sap.log.error("An error occurred drawing the pie graph ("+e.name+"): " + e.message);
                            }

                        } else {
                            //-- Run the fail event --//
                            $.sap.log.error("Failed to load pie graph data: " + aData.ErrMesg);
                        }
                    } else {
                        $.sap.log.error("Graph API data returned was not in JSON format. The format was "+sType+".");
                    }
					
				} catch( e01 ) {
					$.sap.log.error("An error occurred while processing pie graph data ("+e01.name+"): " + e01.message);
				}
				
				
			},
            
			onFail: function (response) {
				$.sap.log.error("An error occurred loading the API: " + response.responseText);
			}
		});
    }
	
});