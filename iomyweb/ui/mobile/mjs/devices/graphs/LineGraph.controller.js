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

sap.ui.controller("mjs.devices.graphs.LineGraph", {
	
	Graph_Data:          [],
	
	iIOId				: 0,
	iThingId			: 0,
	
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
				
				$("#LineGraphPage_Main").html("");
                $("#LineGraphPage_Main_Info").html("");
				me.GetLineDataAndDrawGraph( Math.floor(dateCurrentTime.getTime() / 1000) );
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
		
		
		//============================================================================================//
		//--  2.1 - LINE GRAPH API DATA                                                             ==//
		//============================================================================================//
		
		//============================================================================================//
		//-- 3.1 - PIE GRAPH API DATA                                                               ==//
		//============================================================================================//
		/*
		IOMy.apiphp.AjaxRequest({
			url:       IOMy.apiphp.APILocation("graph"),
			data:      {
				"Mode": "6HourPiePreviousDay",
				"Data": "{\"Type\":\"Normal\",\"IOId\":10}",
				"EndUTS":   1491314400
			},
			onSuccess: function ( sType, aData ) {
				try {
					
					if( sType==="JSON" && aData.Error===false ) {
					
						//-- Store the Ajax data --//
						oController.Graph_Data1 = [
							[ 'Night',     aData.Data.Night ],
							[ 'Morning',   aData.Data.Morning ],
							[ 'Afternoon', aData.Data.Afternoon ],
							[ 'Evening',   aData.Data.Evening ]
						];
						
						//-- Create the Pie Graph --//
						var oPieTest = IOMy.graph_jqplot.CreatePieGraph( 
							oController,
							'GraphPage_Main',
							[
								{
									"Data": oController.Graph_Data1
								}
							],
							{
								"sTitle":       "API Pie Test",
								"sType":        "6HourPie",
								"UseLegend":    true,
								"LegendPreset": 2
							}
						);
						
						
					} else {
						//-- Run the fail event --//
						
					}
					
				} catch( e01 ) {
					console.log("Critical Graph Error: NOTE: replace this with a real ");
				}
				
				
			},
			onFail: function () {
				
			}
		});
		*/
		
		
		//============================================================================================//
		//-- 3.2 - PIE GRAPH STATIC DATA                                                            ==//
		//============================================================================================//
		/*
		var oPieTest = IOMy.graph_jqplot.CreatePieGraph( 
			oController,
			'GraphPage_Main',
			[
				{
					"Data": [
						[ 'Night', 1 ],
						[ 'Morning', 5 ],
						[ 'Afternoon', 4 ],
						[ 'Evening', 3 ]
					]
				}
			],
			{
				"sTitle":       "Pie Test",
				"sType":        "6HourPie",
				"UseLegend":    true,
				"LegendPreset": 2
			}
		);
		*/
		
		//============================================================================================//
		//-- 4.1 - BAR GRAPH API DATA                                                               ==//
		//============================================================================================//
		/*
		function GetBarDataAndDrawGraph( iIOId, iEndUTS, sPeriodType ) {
			//----------------------------------------------------//
			//-- 1.0 - Declare Variables                        --//
			//----------------------------------------------------//
			
			
			
			
			//----------------------------------------------------//
			//-- 4.0 - Get the data for the appropriate Period  --//
			//----------------------------------------------------//
			switch( sPeriodType ) {
				case "Week":
					//--------------------------------//
					//-- WORKOUT THE TIMESTAMPS     --//
					var iDay1StartUTS = iEndUTS - ( 86400 * 7 );
					var iDay1EndUTS   = iEndUTS - ( 86400 * 6 );
					var iDay2StartUTS = iEndUTS - ( 86400 * 6 );
					var iDay2EndUTS   = iEndUTS - ( 86400 * 5 );
					var iDay3StartUTS = iEndUTS - ( 86400 * 5 );
					var iDay3EndUTS   = iEndUTS - ( 86400 * 4 );
					var iDay4StartUTS = iEndUTS - ( 86400 * 4 );
					var iDay4EndUTS   = iEndUTS - ( 86400 * 3 );
					var iDay5StartUTS = iEndUTS - ( 86400 * 3 );
					var iDay5EndUTS   = iEndUTS - ( 86400 * 2 );
					var iDay6StartUTS = iEndUTS - ( 86400 * 2 );
					var iDay6EndUTS   = iEndUTS - ( 86400 * 1 );
					var iDay7StartUTS = iEndUTS - ( 86400 * 1 );
					var iDay7EndUTS   = iEndUTS;
					
					//--------------------------------//
					//-- PERFORM THE AJAX REQUESTS  --//
					IOMy.apiphp.AjaxRequest({
						url:  IOMy.apiphp.APILocation( "aggregation" ),
						data: {
							Id:        iIOId,
							Mode:      "Min",
							StartUTS:  iDay1StartUTS,
							EndUTS:    iDay1EndUTS
						},
						onSuccess: function ( sResponseType, aData1Min ) {
							//--------------------------------//
							//-- DATA1 MAX                  --//
							IOMy.apiphp.AjaxRequest({
								url:  IOMy.apiphp.APILocation( "aggregation" ),
								data: {
									Id:       iIOId,
									Mode:     "Max",
									StartUTS: iDay1StartUTS,
									EndUTS:   iDay1EndUTS
								},
								onSuccess: function ( sResponseType, aData1Max ) {
									
									//--------------------------------//
									//-- DATA2 MAX                  --//
									IOMy.apiphp.AjaxRequest({
										url:  IOMy.apiphp.APILocation( "aggregation" ),
										data: {
											Id:        iIOId,
											Mode:      "Max",
											StartUTS:  iDay2StartUTS,
											EndUTS:    iDay2EndUTS
										},
										onSuccess: function ( sResponseType, aData2Max ) {
											
											//--------------------------------//
											//-- DATA3 MAX                  --//
											IOMy.apiphp.AjaxRequest({
												url:  IOMy.apiphp.APILocation( "aggregation" ),
												data: {
													Id:       iIOId,
													Mode:     "Max",
													StartUTS: iDay3StartUTS,
													EndUTS:   iDay3EndUTS
												},
												onSuccess: function ( sResponseType, aData3Max ) {
													
													//--------------------------------//
													//-- DATA4 MAX                  --//
													IOMy.apiphp.AjaxRequest({
														url:  IOMy.apiphp.APILocation( "aggregation" ),
														data: {
															Id:       iIOId,
															Mode:     "Max",
															StartUTS: iDay4StartUTS,
															EndUTS:   iDay4EndUTS
														},
														onSuccess: function ( sResponseType, aData4Max ) {
															
															//--------------------------------//
															//-- DATA5 MAX                  --//
															IOMy.apiphp.AjaxRequest({
																url:  IOMy.apiphp.APILocation( "aggregation" ),
																data: {
																	Id:       iIOId,
																	Mode:     "Max",
																	StartUTS: iDay5StartUTS,
																	EndUTS:   iDay5EndUTS
																},
																onSuccess: function ( sResponseType, aData5Max ) {
																	
																	//--------------------------------//
																	//-- DATA6 MAX                  --//
																	IOMy.apiphp.AjaxRequest({
																		url:  IOMy.apiphp.APILocation( "aggregation" ),
																		data: {
																			Id:       iIOId,
																			Mode:     "Max",
																			StartUTS: iDay6StartUTS,
																			EndUTS:   iDay6EndUTS
																		},
																		onSuccess: function ( sResponseType, aData6Max ) {
																			
																			//--------------------------------//
																			//-- DATA7 MAX                  --//
																			IOMy.apiphp.AjaxRequest({
																				url:  IOMy.apiphp.APILocation( "aggregation" ),
																				data: {
																					Id:       iIOId,
																					Mode:     "Max",
																					StartUTS: iDay7StartUTS,
																					EndUTS:   iDay7EndUTS
																				},
																				onSuccess: function ( sResponseType, aData7Max ) {
																					
																					try {
																						var iSundayValue    = aData1Max['Value'] - aData1Min['Value'];
																						var iMondayValue    = aData2Max['Value'] - aData1Max['Value'];
																						var iTuesdayValue   = aData3Max['Value'] - aData2Max['Value'];
																						var iWednesdayValue = aData4Max['Value'] - aData3Max['Value'];
																						var iThursdayValue  = aData5Max['Value'] - aData4Max['Value'];
																						var iFridayValue    = aData6Max['Value'] - aData5Max['Value'];
																						var iSaturdayValue  = aData7Max['Value'] - aData6Max['Value'];
																						
																						var aSeriesData = {
																							"Label": "Fridge",
																							"Color": "red",
																							"Data":  [ iSundayValue, iMondayValue, iTuesdayValue, iWednesdayValue, iThursdayValue, iFridayValue, iSaturdayValue ]
																						};
																						
																						
																						var aTicks = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
																						
																						var oVarTest = IOMy.graph_jqplot.CreateBarGraph( 
																							oController,
																							'GraphPage_Main',
																							[
																								aSeriesData
																							],
																							{
																								"sTitle":       "API Data Bar Test",
																								"sType":        "Basic",
																								"UseLegend":    true,
																								"LegendPreset": 2,
																								"AxisX_Label":  "Week",
																								"AxisY_Label":  aData1Max.UOM_NAME,
																								"AxisX_TickCategories": aTicks
																							}
																						);
																						
																						
																						$('#GraphPage_Main').bind('jqplotDataHighlight', 
																							function( ev, seriesIndex, iPointIndex, aData ) {
																								//$('#GraphPage_Main_Info').html('series: '+seriesIndex+', point: '+pointIndex+', data: '+data);
																								try {
																									$('#GraphPage_Main_Info').html(' '+aTicks[iPointIndex]+': '+aData[1]+' ');
																									
																								} catch( e1 ) {
																									$('#GraphPage_Main_Info').html( e1.message );
																								}
																							}
																						);
																						
																						
																						$('#GraphPage_Main').bind('jqplotDataUnhighlight', 
																							function (ev) {
																								$('#GraphPage_Main_Info').html('');
																							}
																						);
																					} catch( e20 ) {
																						console.log( "Data1Min = "+JSON.stringify( aData1Max ) );
																						console.log( "Data1Max = "+JSON.stringify( aData1Max ) );
																						console.log( "Data2Max = "+JSON.stringify( aData2Max ) );
																						console.log( "Data3Max = "+JSON.stringify( aData3Max ) );
																						console.log( "Data4Max = "+JSON.stringify( aData4Max ) );
																						console.log( "Data5Max = "+JSON.stringify( aData5Max ) );
																						console.log( "Data6Max = "+JSON.stringify( aData6Max ) );
																						console.log( "Data7Max = "+JSON.stringify( aData7Max ) );
																						
																						console.log("Critical Error! Bar Graph: "+e20.message );
																					}
																					
																					
																				},
																				onFail: function () {
																					
																					
																				}
																			});		//-- END of this Data7 Max Ajax request --//
																			
																		},
																		onFail: function () {
																			
																			
																		}
																	});		//-- END of this Data6 Max Ajax request --//
																	
																	
																},
																onFail: function () {
																	
																	
																}
															});		//-- END of this Data5 Max Ajax request --//
															
														},
														onFail: function () {
															
															
														}
													});		//-- END of this Data4 Max Ajax request --//
												},
												onFail: function () {
													
													
												}
											});		//-- END of this Data3 Max Ajax request --//
											
										},
										onFail: function () {
											
											
										}
									});		//-- END of this Data2 Max Ajax request --//
									
									
								},
								onFail: function () {
									
									
								}
							});		//-- END of this Data1 Max Ajax request --//
							
							
						},
						onFail: function () {
							
						}
					});		//-- END of this Data1Min Ajax request --//
					break;
			}
		}
		
		
		
		GetBarDataAndDrawGraph( 10, 1491055200, "Week" );
		
		
		
		
		
		
		*/
		
		//============================================================================================//
		//-- 4.2 - BAR GRAPH STATIC DATA                                                            ==//
		//============================================================================================//
		/*
		
		var aTicks = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
		
		var oVarTest = IOMy.graph_jqplot.CreateBarGraph( 
			oController,
			'GraphPage_Main',
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
		
		
		$('#GraphPage_Main').bind('jqplotDataHighlight', 
			function( ev, seriesIndex, iPointIndex, aData ) {
				//$('#GraphPage_Main_Info').html('series: '+seriesIndex+', point: '+pointIndex+', data: '+data);
				try {
					$('#GraphPage_Main_Info').html(' '+aTicks[iPointIndex]+': '+aData[1]+' ');
					
				} catch( e1 ) {
					$('#GraphPage_Main_Info').html( e1.message );
				}
			}
		);
		
		
		$('#GraphPage_Main').bind('jqplotDataUnhighlight', 
			function (ev) {
				$('#GraphPage_Main_Info').html('');
			}
		);
		
		*/

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.graphs.AddRule
*/
	onExit: function() {

	},
	
	GetLineDataAndDrawGraph : function (iEndUTS) {
		var oController    = this;
		var oView          = this.getView();
		
		//============================================================================================//
		//--  2.1 - LINE GRAPH API DATA                                                             ==//
		//============================================================================================//
		IOMy.apiphp.AjaxRequest({
			url:       IOMy.apiphp.APILocation("graph"),
			data:      {
				"Mode": "GraphLine",
				"Data": "{\"Type\":\"NormalAvg\",\"IOId\":"+oController.iIOId+"}",
				"StartUTS": iEndUTS - 86400,
				"EndUTS":   iEndUTS,
				"Points":   100
			},
			onSuccess: function ( sType, aData ) {
				
				if( sType==="JSON" && aData.Error===false ) {
					oController.Graph_Data = [];
					
					$.each( aData.Data,function(index, aLineData) {
						oController.Graph_Data.push( [aLineData.LastTimestamp, aLineData.Value]);
					})
					//oController.Graph_Data1 = aData.Data;
					
					
					//----------------------------//
					//-- GRAPH LINE DATA 2      --//
					//----------------------------//
//					IOMy.apiphp.AjaxRequest({
//						url:       IOMy.apiphp.APILocation("graph"),
//						data:      {
//							"Mode": "GraphLine",
//							"Data": "{\"Type\":\"NormalAvg\",\"IOId\":8}",
//							"StartUTS": 1488250800,
//							"EndUTS":   1490929200,
//							"Points":   100
//						},
//						onSuccess: function ( sType, aData ) {
							
//							if( sType==="JSON" && aData.Error===false ) {
								//oController.Graph_Data2 = aData.Data;
//								oController.Graph_Data2 = [];
//								$.each( aData.Data,function(index, aLineData) {
//									oController.Graph_Data2.push( [aLineData.LastTimestamp, aLineData.Value]);
//								})
					
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
										"UseLegend":            true,
										"LegendPreset":         2,
										"AxisX_Label":          "Time",
										"AxisX_UseDate":        true,
										"AxisY_Label":          sUOM,
										"TimePeriod":           "year"
									}
								);
								
								
								
								
//							} else {
								//-- Run the fail event
								
//							}
//						},
//						onFail: function () {
							
//						}
//					});
					
					
					
				} else {
					//-- Run the fail event
					
				}
			},
			onFail: function () {
				
			}
		});
		//----------------------------//
		//-- GRAPH LINE DATA 2      --//
		//----------------------------//
		/*IOMy.apiphp.AjaxRequest({
			url:       IOMy.apiphp.APILocation("graph"),
			data:      {
				"Mode": "GraphLine",
				"Data": "{\"Type\":\"NormalAvg\",\"IOId\":"+oController.iIOId+"}",
				"StartUTS": iEndUTS - 86400,
				"EndUTS":   iEndUTS,
				"Points":   100
			},
			onSuccess: function ( sType, aData ) {

				if( sType==="JSON" && aData.Error===false ) {
					//oController.Graph_Data = aData.Data;
					var sDeviceName		= IOMy.common.ThingList["_"+oController.iThingId].DisplayName;
					
					oController.Graph_Data = [];

					$.each( aData.Data,function(index, aLineData) {
						oController.Graph_Data.push( [aLineData.LastTimestamp, aLineData.Value]);
					});

					//----------------------------//
					//-- GRAPH                  --//
					//----------------------------//
					var oLineTest = IOMy.graph_jqplot.CreateLineGraph(
						oController,
						'LineGraphPage_Main',
						[
							{
								"Label":    sDeviceName,
								"Data":     oController.Graph_Data
							}
						],
						{
							"sTitle":               "API Line Y1 Test",
							"sType":                "1YAxis",
							"UseLegend":            true,
							"LegendPreset":         2,
							"AxisX_Label":          "Axis X",
							"AxisX_UseDate":        true,
							"AxisY_Label":          "Axis Y",
							"TimePeriod":           "year"
						}
					);

				} else {
					//-- Run the fail event

				}
			},
			onFail: function () {

			}
		});*/
		//============================================================================================//
		//--  2.1 - LINE GRAPH API DATA                                                             ==//
		//============================================================================================//
		/*IOMy.apiphp.AjaxRequest({
			url:       IOMy.apiphp.APILocation("graph"),
			data:      {
				"Mode": "GraphLine",
				"Data": "{\"Type\":\"NormalAvg\",\"IOId\":10}",
				"StartUTS": 1488250800 * 1000,
				"EndUTS":   1490929200 * 1000,
				"Points":   100
			},
			onSuccess: function ( sType, aData ) {
				
				if( sType==="JSON" && aData.Error===false ) {
					oController.Graph_Data1 = [];
					
					$.each( aData.Data,function(index, aLineData) {
						oController.Graph_Data1.push( [aLineData.LastTimestamp, aLineData.Value]);
					});
					//oController.Graph_Data1 = aData.Data;
					
					
					//----------------------------//
					//-- GRAPH LINE DATA 2      --//
					//----------------------------//
					IOMy.apiphp.AjaxRequest({
						url:       IOMy.apiphp.APILocation("graph"),
						data:      {
							"Mode": "GraphLine",
							"Data": "{\"Type\":\"NormalAvg\",\"IOId\":8}",
							"StartUTS": 1488250800 * 1000,
							"EndUTS":   1490929200 * 1000,
							"Points":   100
						},
						onSuccess: function ( sType, aData ) {
							
							if( sType==="JSON" && aData.Error===false ) {
								//oController.Graph_Data2 = aData.Data;
								
								oController.Graph_Data2 = [];
					
								$.each( aData.Data,function(index, aLineData) {
									oController.Graph_Data2.push( [aLineData.LastTimestamp, aLineData.Value]);
								});
					
								//----------------------------//
								//-- GRAPH                  --//
								//----------------------------//
								var oLineTest = IOMy.graph_jqplot.CreateLineGraph(
									oController,
									'LineGraphPage_Main',
									[
										{
											"Label":    "Kettle",
											"Data":     oController.Graph_Data1
										},
										{
											"Label":    "Fridge",
											"Data":     oController.Graph_Data2
										}
									],
									{
										"sTitle":               "API Line Y1 Test",
										"sType":                "1YAxis",
										"UseLegend":            true,
										"LegendPreset":         2,
										"AxisX_Label":          "Axis X",
										"AxisX_UseDate":        true,
										"AxisY_Label":          "Axis Y",
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
					
					
					
				} else {
					//-- Run the fail event
					
				}
			},
			onFail: function () {
				
			}
		});*/
	}
	
});