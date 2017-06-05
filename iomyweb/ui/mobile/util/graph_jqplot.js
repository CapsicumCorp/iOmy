/*
Title: iOmy Graph jqPlot Module
Authora: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2016

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

$.sap.declare("IOMy.graph_jqplot",true);
IOMy.graph_jqplot = new sap.ui.base.Object();

$.extend( IOMy.graph_jqplot, {
	
	
	DefaultLineSeriesColors: [
		"silver",
		"lightslategrey",
		"red",
		"royalblue",
		"forestgreen",
		"orange",
		"navy",
		"violet",
		"lawngreen",
		"grey"

	],
	Default6HourPieSeriesColors: [
		"orangered",
		"royalblue",
		"limegreen",
		"yellow"
	],
	DefaultBarSeriesColors: [
		"red",
		"royalblue",
		"forestgreen",
		"orange",
		"navy",
		"violet",
		"lawngreen",
		"grey"
	],
	
	//========================================================================//
	// Time Period Strings
	//========================================================================//
	PeriodDay		: "day",
	PeriodWeek		: "Week",
	PeriodFortnight	: "Fortnight",
	PeriodMonth		: "Month",
	PeriodQuarter	: "Quarter",
	PeriodYear		: "year",
	
	//========================================================================//
	//== LEGEND PRESET                                                      ==//
	//========================================================================//
	LegendPreset: function( iLegendPreset ) {
		//------------------------------------//
		//-- Setup the static legend data   --//
		var aLegendCustomData = {
			//"renderer":         $.jqplot.EnhancedLegendRenderer,
			"show":             true,
			"numberColumns":    2
		};
		
		//-- Load the preset data into the static legend data --//
		if( iLegendPreset===1 ) {
			aLegendCustomData.location    = "s";
			aLegendCustomData.xoffset     = 0;
			aLegendCustomData.yoffset     = 0;
			aLegendCustomData.placement   = "outside";
			
		} else if( iLegendPreset===2 ) {
			aLegendCustomData.location    = "e";
			aLegendCustomData.xoffset     = 10;
			aLegendCustomData.yoffset     = 32;
			aLegendCustomData.placement   = "outside";
			
		} else if( iLegendPreset===3 ) {
			aLegendCustomData.location    = "s";
			aLegendCustomData.xoffset     = 0;
			aLegendCustomData.yoffset     = 0;
			aLegendCustomData.placement   = "outside";
			
		} else if( iLegendPreset===4 ) {
			aLegendCustomData.location    = "s";
			aLegendCustomData.xoffset     = 0;
			aLegendCustomData.yoffset     = 0;
			aLegendCustomData.placement   = "outside";
			
		} else if( iLegendPreset===5 ) {
			aLegendCustomData.location    = "s";
			aLegendCustomData.xoffset     = 0;
			aLegendCustomData.yoffset     = 0;
			aLegendCustomData.placement   = "outside";
			
		} else if( iLegendPreset===6 ) {
			aLegendCustomData.location    = "s";
			aLegendCustomData.xoffset     = 0;
			aLegendCustomData.yoffset     = 0;
			aLegendCustomData.placement   = "outside";
			
		} else {
			aLegendCustomData.location    = "s";
			aLegendCustomData.xoffset     = 0;
			aLegendCustomData.yoffset     = 0;
			aLegendCustomData.placement   = "outside";
		}
		
		//------------------------------------//
		//-- Return the Results             --//
		return aLegendCustomData;
	},
	

	//========================================================================//
	//== LINE GRAPH                                                         ==//
	//========================================================================//
	CreateLineGraph: function( oController, sGraphElementName, aGraphDataSources, aSetupData ) {
		//----------------------------------------------------------------------------------------//
		//-- 1.0 - Declare Variables                                                            --//
		//----------------------------------------------------------------------------------------//
		var oGraph                      = null;         //-- OBJECT:        --//
		var sGraphTitle                 = "";           //-- STRING:        --//
		var aSeriesData                 = [];           //-- ARRAY:         --//
		
		var sAxisX_Min                  = "";           //-- STRING:        The minimum value to display on the X Axis. NOTE: This could be an integer or a string. --//
		var sAxisX_Max                  = "";           //-- STRING:        The maximum value to display on the X Axis. NOTE: This could be an integer or a string. --//
		var sAxisX_Label                = "";           //-- STRING:        --//
		var bAxisX_UseDate              = false;        //-- BOOLEAN:       Used to indicate if the X Axis is using date format. --//
		var bAxisX_SetTicks             = false;        //-- BOOLEAN:       --//
		var bAxisX_FormatTickString     = false;        //-- BOOLEAN:       Used to indicate if a Custom Format Tick String is already set. --//
		var sAxisX_FormatTickString     = "";           //-- STRING:        --//
		var sAxisX_CustomTickString     = "";           //-- STRING:        --//
		
		var sAxisY_Min                  = "";           //-- STRING:        The minimum value to display on the Y Axis. NOTE: This could be an integer or a string. --//
		var sAxisY_Max                  = "";           //-- STRING:        The maximum value to display on the Y Axis. NOTE: This could be an integer or a string. --//
		var sAxisY_Label                = "";           //-- STRING:        --//
		var sTimePeriod                 = "";           //-- STRING:        --//
		
		var bUseCustomLegend            = false;        //-- BOOLEAN:       --//
		var bUseLegend                  = false;        //-- BOOLEAN:       --//
		var iLegendPreset               = 0;            //-- INTEGER:       --//
		var aLegendCustomData           = {};           //-- ARRAY:         --//
		var aGraphSettings              = {};           //-- ARRAY:         --//
		var bUseCustomData              = false;        //-- BOOLEAN:       --//
		var aCustomData                 = [];           //-- ARRAY:         --//
		var bUseCustomColors            = false;        //-- BOOLEAN:       --//
		var aCustomColors               = [];           //-- ARRAY:         --//
		//----------------------------------------------------------------------------------------//
		//-- 2.0 -  Setup the Variables                                                         --//
		//----------------------------------------------------------------------------------------//
		
		
		//------------------------------------------------//
		//-- 2.01 - Graph Title                         --//
		//------------------------------------------------//
		if( aSetupData.sTitle!==undefined && aSetupData.sTitle!==false && aSetupData.sTitle!==null ) {
			sGraphTitle     = aSetupData.sTitle;
		}
		
		//------------------------------------------------//
		//-- 2.05 - X Axis                              --//
		//------------------------------------------------//
		
		//-- X Axis Min and Max --//
		if( aSetupData.AxisX_Min!==undefined && aSetupData.AxisX_Min!==false && aSetupData.AxisX_Min!==null ) {
			sAxisX_Min        = aSetupData.AxisX_Min;
		}
		
		if( aSetupData.AxisX_Max!==undefined && aSetupData.AxisX_Max!==false && aSetupData.AxisX_Max!==null ) {
			sAxisX_Max        = aSetupData.AxisX_Max;
		}
		
		//-- X Axis Label --//
		if( aSetupData.AxisX_Label!==undefined && aSetupData.AxisX_Label!==false && aSetupData.AxisX_Label!==null ) {
			sAxisX_Label      = aSetupData.AxisX_Label;
		}
		
		//-- X Axis Date and Custom Date formatting --//
		if( aSetupData.AxisX_UseDate===true || aSetupData.AxisX_UseDate===false ) {
			bAxisX_UseDate    = aSetupData.AxisX_UseDate;
		}
		
		//-- X Axis custom format string --//
		if( aSetupData.AxisXCustomFormatString!==undefined && aSetupData.AxisXCustomFormatString!==null && aSetupData.AxisXCustomFormatString!==false && aSetupData.AxisXCustomFormatString!=="" ) {
			bAxisX_FormatTickString = true;
			sAxisX_CustomTickString = aSetupData.AxisXCustomFormatString;
		}
		//------------------------------------------------//
		//-- 2.06 - Y Axis                              --//
		//------------------------------------------------//
		
		//-- Y Axis Label --//
		if( aSetupData.AxisY_Label!==undefined && aSetupData.AxisY_Label!==false && aSetupData.AxisY_Label!==null ) {
			sAxisY_Label      = aSetupData.AxisY_Label;
		}
		
		//-- Y Axis Min and Max --//
		if( aSetupData.AxisY_Min!==undefined && aSetupData.AxisY_Min!==false && aSetupData.AxisY_Min!==null ) {
			sAxisY_Min        = aSetupData.AxisY_Min;
		}
		
		if( aSetupData.AxisY_Max!==undefined && aSetupData.AxisY_Max!==false && aSetupData.AxisY_Max!==null ) {
			sAxisY_Max        = aSetupData.AxisY_Max;
		}
		
		//------------------------------------------------//
		//-- 2.08 - Legend                              --//
		//------------------------------------------------//
		if( aSetupData.UseLegend===true ) {
			//----------------------------------------//
			//-- IF wanting a preset                --//
			//----------------------------------------//
			if( aSetupData.LegendPreset!==undefined && aSetupData.LegendPreset!==false && aSetupData.LegendPreset!==null ) {
				
				bUseLegend    = true;
				iLegendPreset = aSetupData.LegendPreset;
				
				//-- Setup the static legend data --//
				aLegendCustomData = IOMy.graph_jqplot.LegendPreset( iLegendPreset );
				
				
			//----------------------------------------//
			//-- ELSE IF Custom data is present     --//
			//----------------------------------------//
			} else if( aSetupData.UseLegendCustom===true ) {
				
				//-- Load the Legend preset into the static data --//
				if( aSetupData.LegendLocation!==undefined && aSetupData.LegendLocation!==null && aSetupData.LegendLocation!==false ) {
					if( aSetupData.LegendXOffset!==undefined && aSetupData.LegendXOffset!==null && aSetupData.LegendXOffset!==false ) {
						if( aSetupData.LegendYOffset!==undefined && aSetupData.LegendYOffset!==null && aSetupData.LegendYOffset!==false ) {
							if( aSetupData.LegendXPlacement!==undefined && aSetupData.LegendXPlacement!==null && aSetupData.LegendXPlacement!==false ) {
								//-- Flag that a custom legend placement is used --//
								bUseLegend       = true;
								bUseCustomLegend = true;
								
								//-- Setup the custom legend placement --//
								aLegendCustomData = {
									"renderer":         $.jqplot.EnhancedLegendRenderer,
									"show":             true,
									"numberColumns":    2,
									"location":         aSetupData.LegendLocation,
									"xoffset":          aSetupData.LegendXOffset,
									"yoffset":          aSetupData.LegendYOffset,
									"placement":        aSetupData.LegendXPlacement
								};
							}
						}
					}
				}
			} //-- ENDELSEIF Custom Data is present --//
			
			//----------------------------------------//
			//-- IF Legend Labels are provided      --//
			//----------------------------------------//
			if( aSetupData.LegendLables!==undefined && aSetupData.LegendLables!==null && aSetupData.LegendLables!==false ) {
				if( Array.isArray( aSetupData.LegendLables ) ) {
					aLegendCustomData.labels = aSetupData.LegendLables;
				}
			} else {
				if( Array.isArray( aGraphDataSources ) ) {
					//-- FOREACH Graph Data Source --//
					$.each( aGraphDataSources, function( sIndex, aGraphDataSource ) {
						if( aGraphDataSource.Label!==undefined && aGraphDataSource.Label!==null && aGraphDataSource.Label!==false ) {
							//-- Setup the array if undefined --//
							if( typeof aLegendCustomData.labels==="undefined" || aLegendCustomData.labels===null ) {
								aLegendCustomData.labels = [];
							}
							
							//-- Push the Label into the --//
							aLegendCustomData.labels.push( aGraphDataSource.Label );
						}
					}); //-- ENDFOREACH --//
				} //-- ENDIF Is an array --//
			} //-- ENDELSE --//
		} //-- ENDIF Use Legend --//
		
		
		//------------------------------------------------//
		//-- 2.09 - Time Period                         --//
		//------------------------------------------------//
		if( aSetupData.TimePeriod!==undefined && aSetupData.TimePeriod!==null && aSetupData.TimePeriod!==false && aSetupData.TimePeriod!=="" ) {
			sTimePeriod = aSetupData.TimePeriod;
		}
		
		
		//------------------------------------------------//
		//-- 2.10 - Custom Data and Colors              --//
		//------------------------------------------------//
		if( aGraphDataSources!==undefined && aGraphDataSources!==null && aGraphDataSources!==false ) {
			$.each( aGraphDataSources, function( sIndex, aGraphDataSource ) {
				//--------------------------------------------//
				//-- OPTION A: Both Data and Color          --//
				//--------------------------------------------//
				if( typeof aGraphDataSource.Data!=="undefined" && typeof aGraphDataSource.Color!=="undefined" ) {
					//-- Flag that custom data is used rather than the controller --//
					bUseCustomData = true;
					
					//-- Add to the custom data --//
					aCustomData.push( aGraphDataSource.Data );
					
					//-- Flag that custom colors are used --//
					bUseCustomColors = true;
					
					//-- Add to the Custom Colors --//
					aCustomColors.push( aGraphDataSource.Color );
					
					
				//--------------------------------------------//
				//-- OPTION B: Data found                   --//
				//--------------------------------------------//
				} else if( typeof aGraphDataSource.Data!=="undefined" ) {
					//-- Flag that custom data is used rather than the controller --//
					bUseCustomData = true;
					
					//-- Store the custom data --//
					aCustomData.push( aGraphDataSource.Data );
					
					
				//--------------------------------------------//
				//-- OPTION C: Color found                  --//
				//--------------------------------------------//
				} else if( typeof aGraphDataSource.Color!=="undefined" ) {
					//-- Flag that custom colors are used --//
					bUseCustomColors = true;
					
					//-- Add to the Custom Colors --//
					aCustomColors.push( aGraphDataSource.Color );
				}
			});
		}
		
		//----------------------------------------------------------------------------------------//
		//-- 4.0 - Setup                                                                        --//
		//----------------------------------------------------------------------------------------//
		
		//-- 4.01 - Setup the Basic variables for all line Graphs --//
		aGraphSettings = {
			"grid": {
				"background":	'#D3DDC9',
				"borderColor":	'#AAAAAA'
			},
			"cursor": {
				"show":        true,
				"zoom":        true
			},
			"highlighter":     {
				"show":            false
			},
			"seriesDefaults":  {
				"showMarker":      false,
				"pointLabels":     {
					"show":            false
				}
			},
			"axesDefaults":    {
				"labelOptions":    {
					"fontSize":        '13pt'
				}
			},
			"axes":            {
				"xaxis":           {
					
				},
				"yaxis":           {
					
				}
			}
		};
		
		
		//------------------------------------------------//
		//-- 4.02 - Graph Title                         --//
		//------------------------------------------------//
		if( sGraphTitle!==undefined && sGraphTitle!==false && sGraphTitle!==null ) {
			//-- Set the Title --//
			aGraphSettings.title = sGraphTitle;
		}
		
		//------------------------------------------------//
		//-- 4.03 - Graph Smoothing                     --//
		//------------------------------------------------//
		if( aSetupData.bGraphSmoothing===true ) {
			//-- Add the smoothing      --//
			aGraphSettings.series.push(
				{
					rendererOptions: {
						smooth: true
					}
				}
			);
		}
		
		//------------------------------------------------//
		//--  4.04 - X Axis                             --//
		//------------------------------------------------//
		
		//-- X Axis Min and Max --//
		if( sAxisX_Min!=="" ) {
			aGraphSettings.axes.xaxis.min = sAxisX_Min;
		}
		if( sAxisX_Max!=="" ) {
			aGraphSettings.axes.xaxis.max = sAxisX_Max;
		}
		
		//-- X Axis Label --//
		if( sAxisX_Label!=="" ) {
			aGraphSettings.axes.xaxis.label = sAxisX_Label;
		}
		
		//-- X Axis Use Date --//
		if( bAxisX_UseDate===true && ( sTimePeriod!=="" || sAxisX_CustomTickString ) ) {
			//-- Setup the date renderer --//
			aGraphSettings.axes.xaxis.renderer = $.jqplot.DateAxisRenderer;
			
			//-- Choose the format tick string --//
			if( sAxisX_CustomTickString!=="" ) {
				sAxisX_FormatTickString = sAxisX_CustomTickString;
				
			} else if ( sTimePeriod==="6hour" ) {
				sAxisX_FormatTickString = "%#I:%M%p";
				
			} else if ( sTimePeriod==="day" ) {
				sAxisX_FormatTickString = "%b&nbsp%#d\n%#I:%M%p";
				
			} else if ( sTimePeriod==="year" ) {
				sAxisX_FormatTickString = "%#d&nbsp;%b&nbsp;%y";
				
			} else {
				sAxisX_FormatTickString = "%#d&nbsp;%b";
				
			}
			
			//-- Set the "format tick string" --//
			aGraphSettings.axes.xaxis.tickOptions = {
				"formatString": sAxisX_FormatTickString
			};
		}
		
		
		//------------------------------------------------//
		//-- 4.05 - Y Axis                              --//
		//------------------------------------------------//
		
		//-- Add the Label --//
		if( sAxisY_Label!=="" ) {
			//-- Set the label and set the label renderer --//
			aGraphSettings.axes.yaxis.label = sAxisY_Label;
			aGraphSettings.axes.yaxis.labelRenderer = $.jqplot.CanvasAxisLabelRenderer;
		}
		
		//-- Y Axis Min and Max --//
		if( sAxisY_Min!=="") {
			aGraphSettings.axes.yaxis.min = sAxisY_Min;
		}
		if( sAxisY_Max!=="") {
			aGraphSettings.axes.yaxis.max = sAxisY_Max;
		}
		
		//------------------------------------------------//
		//-- 4.06 - Legend                              --//
		//------------------------------------------------//
		if( bUseLegend===true) {
			//-- Setup the legend data --//
			aGraphSettings.legend = aLegendCustomData;
			
		}
		
		//------------------------------------------------//
		//-- 4.07 - Setup the Series Colors             --//
		//------------------------------------------------//
		if( aSetupData.bUseCustomColors===true ) {
			//-- Use the colors defined in the GraphDataSources parameter --//
			aGraphSettings.seriesColors = aCustomColors;
			
		} else {
			//-- Use the defaults --//
			aGraphSettings.seriesColors = IOMy.graph_jqplot.DefaultLineSeriesColors;
		}
		
		//------------------------------------------------//
		//-- 4.10 - Set the Data                        --//
		//------------------------------------------------//
		if( bUseCustomData===false ) {
			//-- Use the Data in the controller --//
			aCustomData = oController.Graph_Data;
		}
		
		
		//----------------------------------------------------------------------------------------//
		//-- 5.0 - Make the Graph                                                               --//
		//----------------------------------------------------------------------------------------//
		$.jqplot.config.enablePlugins = true;
		oGraph = $.jqplot( sGraphElementName, aCustomData, aGraphSettings );
		
		//--------------------------------------------------------//
		//-- 9.0 - Return the Results                           --//
		//--------------------------------------------------------//
		return oGraph;
		
	},
	
	
	//========================================================================//
	//== PIE GRAPH                                                          ==//
	//========================================================================//
	CreatePieGraph: function( oController, sGraphElementName, aGraphDataSources, aSetupData ) {
		//----------------------------------------------------------------------------------------//
		//-- 1.0 - Declare Variables                                                            --//
		//----------------------------------------------------------------------------------------//
		var oGraph                      = null;         //-- OBJECT:        --//
		var sGraphTitle                 = "";           //-- STRING:        --//
		var sGraphType                  = "";           //-- STRING:        --//
		var bUseCustomLegend            = false;        //-- BOOLEAN:       --//
		var bUseLegend                  = false;        //-- BOOLEAN:       --//
		var iLegendPreset               = 0;            //-- INTEGER:       --//
		var aLegendCustomData           = {};           //-- ARRAY:         --//
		var aGraphSettings              = {};           //-- ARRAY:         --//
		var bUseCustomData              = false;        //-- BOOLEAN:       --//
		var aCustomData                 = [];           //-- ARRAY:         --//
		
		
		
		//----------------------------------------------------------------------------------------//
		//-- 2.0 -  Setup the Variables                                                         --//
		//----------------------------------------------------------------------------------------//
		
		//------------------------------------------------//
		//-- 2.01 - Graph Title                         --//
		//------------------------------------------------//
		if( aSetupData.sTitle!==undefined && aSetupData.sTitle!==false && aSetupData.sTitle!==null ) {
			sGraphTitle     = aSetupData.sTitle;
		}
		
		//------------------------------------------------//
		//-- 2.02 - Graph Type                          --//
		//------------------------------------------------//
		if( aSetupData.sType!==undefined && aSetupData.sType!==false && aSetupData.sType!==null ) {
			sGraphType = aSetupData.sType;
		}
		
		//------------------------------------------------//
		//-- 2.08 - Legend                              --//
		//------------------------------------------------//
		if( aSetupData.UseLegend===true ) {
			//----------------------------------------//
			//-- IF wanting a preset                --//
			//----------------------------------------//
			if( aSetupData.LegendPreset!==undefined && aSetupData.LegendPreset!==false && aSetupData.LegendPreset!==null ) {
				
				bUseLegend    = true;
				iLegendPreset = aSetupData.LegendPreset;
				
				//-- Setup the static legend data --//
				aLegendCustomData = this.LegendPreset( iLegendPreset );
				
				
			//----------------------------------------//
			//-- ELSE IF Custom data is present     --//
			//----------------------------------------//
			} else if( aSetupData.UseLegendCustom===true ) {
				
				
				//-- Load the Legend preset into the static data --//
				if( aSetupData.LegendLocation!==undefined && aSetupData.LegendLocation!==null && aSetupData.LegendLocation!==false ) {
					if( aSetupData.LegendXOffset!==undefined && aSetupData.LegendXOffset!==null && aSetupData.LegendXOffset!==false ) {
						if( aSetupData.LegendYOffset!==undefined && aSetupData.LegendYOffset!==null && aSetupData.LegendYOffset!==false ) {
							if( aSetupData.LegendXPlacement!==undefined && aSetupData.LegendXPlacement!==null && aSetupData.LegendXPlacement!==false ) {
								//-- Flag that a custom legend placement is used --//
								bUseLegend       = true;
								bUseCustomLegend = true;
								
								//-- Setup the custom legend placement --//
								aLegendCustomData = {
									"renderer":         $.jqplot.EnhancedLegendRenderer,
									"show":             true,
									"numberColumns":    2,
									"location":         aSetupData.LegendLocation,
									"xoffset":          aSetupData.LegendXOffset,
									"yoffset":          aSetupData.LegendYOffset,
									"placement":        aSetupData.LegendXPlacement
								};
							}
						}
					}
				}
			}
		}
		
		
		//------------------------------------------------//
		//-- 2.10 - Custom Data and Colors              --//
		//------------------------------------------------//
		if( aGraphDataSources!==undefined && aGraphDataSources!==null && aGraphDataSources!==false ) {
			$.each( aGraphDataSources, function( sIndex, aGraphDataSource ) {
				//--------------------------------------------//
				//-- OPTION A: Data found                   --//
				//--------------------------------------------//
				if( typeof aGraphDataSource.Data!=="undefined" ) {
					//-- Flag that custom data is used rather than the controller --//
					bUseCustomData = true;
					
					//-- Store the custom data --//
					aCustomData.push( aGraphDataSource.Data );
				}
			});
		}
		
		
		//----------------------------------------------------------------------------------------//
		//-- 4.0 - Setup                                                                        --//
		//----------------------------------------------------------------------------------------//
		
		//-- 4.01 - Setup the Basic variables for all Pie Graphs --//
		aGraphSettings = {
			"seriesDefaults":  {
				"renderer":        $.jqplot.PieRenderer,
				"rendererOptions": {
					"showDataLabels":   true
					//"trendline":       { 
					//	"show":            false 
					//},
					
				}
			},
			highlighter: {
				"show": true,
				"useAxesFormatters": false,
				"tooltipFormatString": '%s'
			},
			cursor: {
				show: false
			}
		};
		
		//------------------------------------------------//
		//-- 4.02 - Graph Title                         --//
		//------------------------------------------------//
		if( sGraphTitle!==undefined && sGraphTitle!==false && sGraphTitle!==null ) {
			//-- Set the Title --//
			aGraphSettings.title = sGraphTitle;
		}
		
		//------------------------------------------------//
		//-- 4.06 - Legend                              --//
		//------------------------------------------------//
		if( bUseLegend===true) {
			//-- Setup the legend data --//
			aGraphSettings.legend = aLegendCustomData;
		}
		
		if( sGraphType==='6HourPie') {
			aGraphSettings.seriesColors = IOMy.graph_jqplot.Default6HourPieSeriesColors;
		}
		
		//------------------------------------------------//
		//-- 4.10 - Set the Data                        --//
		//------------------------------------------------//
		if( bUseCustomData===false ) {
			//-- Use the Data in the controller --//
			aCustomData = oController.Graph_Data;
		}
		
		//----------------------------------------------------------------------------------------//
		//-- 5.0 - Make the Graph                                                               --//
		//----------------------------------------------------------------------------------------//
		$.jqplot.config.enablePlugins = true;
		oGraph = $.jqplot( sGraphElementName, aCustomData, aGraphSettings );
		
		//--------------------------------------------------------//
		//-- 9.0 - Return the Results                           --//
		//--------------------------------------------------------//
		return oGraph;
	},
	
	
	
	
	//========================================================================//
	//== BASIC BAR GRAPH                                                    ==//
	//========================================================================//
	CreateBarGraph: function( oController, sGraphElementName, aGraphDataSources, aSetupData ) {
		//----------------------------------------------------------------------------------------//
		//-- 1.0 - Declare Variables                                                            --//
		//----------------------------------------------------------------------------------------//
		var oGraph                      = null;         //-- OBJECT:        --//
		var sGraphTitle                 = "";           //-- STRING:        --//
		var aSeriesData                 = [];           //-- ARRAY:         --//
		
		var sAxisX_Min                  = "";           //-- STRING:        The minimum value to display on the X Axis. NOTE: This could be an integer or a string. --//
		var sAxisX_Max                  = "";           //-- STRING:        The maximum value to display on the X Axis. NOTE: This could be an integer or a string. --//
		var sAxisX_Label                = "";           //-- STRING:        --//
		var bAxisX_UseCategories        = false;        //-- BOOLEAN:       --//
		var aAxisX_TickCategories       = [];           //-- ARRAY:         --//
		
		var sAxisY_Min                  = "";           //-- STRING:        The minimum value to display on the Y Axis. NOTE: This could be an integer or a string. --//
		var sAxisY_Max                  = "";           //-- STRING:        The maximum value to display on the Y Axis. NOTE: This could be an integer or a string. --//
		var sAxisY_Label                = "";           //-- STRING:        --//
		var sTimePeriod                 = "";           //-- STRING:        --//
		
		var bUseCustomLegend            = false;        //-- BOOLEAN:       --//
		var bUseLegend                  = false;        //-- BOOLEAN:       --//
		var iLegendPreset               = 0;            //-- INTEGER:       --//
		var aLegendCustomData           = {};           //-- ARRAY:         --//
		var aGraphSettings              = {};           //-- ARRAY:         --//
		var bUseCustomData              = false;        //-- BOOLEAN:       --//
		var aCustomData                 = [];           //-- ARRAY:         --//
		var bUseCustomColors            = false;        //-- BOOLEAN:       --//
		var aCustomColors               = [];           //-- ARRAY:         --//
		
		
		
		//----------------------------------------------------------------------------------------//
		//-- 2.0 -  Setup the Variables                                                         --//
		//----------------------------------------------------------------------------------------//
		
		//------------------------------------------------//
		//-- 2.01 - Graph Title                         --//
		//------------------------------------------------//
		if( aSetupData.sTitle!==undefined && aSetupData.sTitle!==false && aSetupData.sTitle!==null ) {
			sGraphTitle     = aSetupData.sTitle;
		}
		
		//------------------------------------------------//
		//-- 2.05 - X Axis                              --//
		//------------------------------------------------//
		
		//-- X Axis Min and Max --//
		if( aSetupData.AxisX_Min!==undefined && aSetupData.AxisX_Min!==false && aSetupData.AxisX_Min!==null ) {
			sAxisX_Min        = aSetupData.AxisX_Min;
		}
		
		if( aSetupData.AxisX_Max!==undefined && aSetupData.AxisX_Max!==false && aSetupData.AxisX_Max!==null ) {
			sAxisX_Max        = aSetupData.AxisX_Max;
		}
		
		//-- X Axis Label --//
		if( aSetupData.AxisX_Label!==undefined && aSetupData.AxisX_Label!==false && aSetupData.AxisX_Label!==null ) {
			sAxisX_Label      = aSetupData.AxisX_Label;
		}
		
		
		//-- X Axis Tick Categories --//
		if( aSetupData.AxisX_TickCategories!==undefined && aSetupData.AxisX_TickCategories!==false && aSetupData.AxisX_TickCategories!==null ) {
			bAxisX_UseCategories  = true;
			aAxisX_TickCategories = aSetupData.AxisX_TickCategories;
		}
		
		
		//------------------------------------------------//
		//-- 2.06 - Y Axis                              --//
		//------------------------------------------------//
		
		//-- Y Axis Label --//
		if( aSetupData.AxisY_Label!==undefined && aSetupData.AxisY_Label!==false && aSetupData.AxisY_Label!==null ) {
			sAxisY_Label      = aSetupData.AxisY_Label;
		}
		
		//-- Y Axis Min and Max --//
		if( aSetupData.AxisY_Min!==undefined && aSetupData.AxisY_Min!==false && aSetupData.AxisY_Min!==null ) {
			sAxisY_Min        = aSetupData.AxisY_Min;
		}
		
		if( aSetupData.AxisY_Max!==undefined && aSetupData.AxisY_Max!==false && aSetupData.AxisY_Max!==null ) {
			sAxisY_Max        = aSetupData.AxisY_Max;
		}
		
		
		//------------------------------------------------//
		//-- 2.08 - Legend                              --//
		//------------------------------------------------//
		if( aSetupData.UseLegend===true ) {
			//----------------------------------------//
			//-- IF wanting a preset                --//
			//----------------------------------------//
			if( aSetupData.LegendPreset!==undefined && aSetupData.LegendPreset!==false && aSetupData.LegendPreset!==null ) {
				
				bUseLegend    = true;
				iLegendPreset = aSetupData.LegendPreset;
				
				//-- Setup the static legend data --//
				aLegendCustomData = IOMy.graph_jqplot.LegendPreset( iLegendPreset );
				
				
			//----------------------------------------//
			//-- ELSE IF Custom data is present     --//
			//----------------------------------------//
			} else if( aSetupData.UseLegendCustom===true ) {
				
				//-- Load the Legend preset into the static data --//
				if( aSetupData.LegendLocation!==undefined && aSetupData.LegendLocation!==null && aSetupData.LegendLocation!==false ) {
					if( aSetupData.LegendXOffset!==undefined && aSetupData.LegendXOffset!==null && aSetupData.LegendXOffset!==false ) {
						if( aSetupData.LegendYOffset!==undefined && aSetupData.LegendYOffset!==null && aSetupData.LegendYOffset!==false ) {
							if( aSetupData.LegendXPlacement!==undefined && aSetupData.LegendXPlacement!==null && aSetupData.LegendXPlacement!==false ) {
								//-- Flag that a custom legend placement is used --//
								bUseLegend       = true;
								bUseCustomLegend = true;
								
								//-- Setup the custom legend placement --//
								aLegendCustomData = {
									"renderer":         $.jqplot.EnhancedLegendRenderer,
									"show":             true,
									"numberColumns":    2,
									"location":         aSetupData.LegendLocation,
									"xoffset":          aSetupData.LegendXOffset,
									"yoffset":          aSetupData.LegendYOffset,
									"placement":        aSetupData.LegendXPlacement
								};
							}
						}
					}
				}
			} //-- ENDELSEIF Custom Data is present --//
			
			//----------------------------------------//
			//-- IF Legend Labels are provided      --//
			//----------------------------------------//
			if( aSetupData.LegendLables!==undefined && aSetupData.LegendLables!==null && aSetupData.LegendLables!==false ) {
				if( Array.isArray( aSetupData.LegendLables ) ) {
					aLegendCustomData.labels = aSetupData.LegendLables;
				}
			} else {
				if( Array.isArray( aGraphDataSources ) ) {
					//-- FOREACH Graph Data Source --//
					$.each( aGraphDataSources, function( sIndex, aGraphDataSource ) {
						if( aGraphDataSource.Label!==undefined && aGraphDataSource.Label!==null && aGraphDataSource.Label!==false ) {
							//-- Setup the array if undefined --//
							if( typeof aLegendCustomData.labels==="undefined" || aLegendCustomData.labels===null ) {
								aLegendCustomData.labels = [];
							}
							
							//-- Push the Label into the --//
							aLegendCustomData.labels.push( aGraphDataSource.Label );
						}
					}); //-- ENDFOREACH --//
				} //-- ENDIF Is an array --//
			} //-- ENDELSE --//
		} //-- ENDIF Use Legend --//
		
		
		//------------------------------------------------//
		//-- 2.09 - Time Period                         --//
		//------------------------------------------------//
		if( aSetupData.TimePeriod!==undefined && aSetupData.TimePeriod!==null && aSetupData.TimePeriod!==false && aSetupData.TimePeriod!=="" ) {
			sTimePeriod = aSetupData.TimePeriod;
		}
		
		
		//------------------------------------------------//
		//-- 2.10 - Custom Data and Colors              --//
		//------------------------------------------------//
		if( aGraphDataSources!==undefined && aGraphDataSources!==null && aGraphDataSources!==false ) {
			$.each( aGraphDataSources, function( sIndex, aGraphDataSource ) {
				//--------------------------------------------//
				//-- OPTION A: Both Data and Color          --//
				//--------------------------------------------//
				if( typeof aGraphDataSource.Data!=="undefined" && typeof aGraphDataSource.Color!=="undefined" ) {
					//-- Flag that custom data is used rather than the controller --//
					bUseCustomData = true;
					
					//-- Add to the custom data --//
					aCustomData.push( aGraphDataSource.Data );
					
					//-- Flag that custom colors are used --//
					bUseCustomColors = true;
					
					//-- Add to the Custom Colors --//
					aCustomColors.push( aGraphDataSource.Color );
					
				//--------------------------------------------//
				//-- OPTION B: Data found                   --//
				//--------------------------------------------//
				} else if( typeof aGraphDataSource.Data!=="undefined" ) {
					//-- Flag that custom data is used rather than the controller --//
					bUseCustomData = true;
					
					//-- Store the custom data --//
					aCustomData.push( aGraphDataSource.Data );
					
				//--------------------------------------------//
				//-- OPTION C: Color found                  --//
				//--------------------------------------------//
				} else if( typeof aGraphDataSource.Color!=="undefined" ) {
					//-- Flag that custom colors are used --//
					bUseCustomColors = true;
					
					//-- Add to the Custom Colors --//
					aCustomColors.push( aGraphDataSource.Color );
				}
			});
		}
		
		
		
		//----------------------------------------------------------------------------------------//
		//-- 4.0 - Setup                                                                        --//
		//----------------------------------------------------------------------------------------//
		
		//-- 4.01 - Setup the Basic variables for all line Graphs --//
		aGraphSettings = {
			"animate":         !$.jqplot.use_excanvas,
			"grid": {
				"background":	'#D3DDC9',
				"borderColor":	'#AAAAAA'
			},
			"cursor":          {
				"show":            false,
				"zoom":            false
			},
			"seriesDefaults":  {
				"renderer":        $.jqplot.BarRenderer,
				"pointLabels":     {
					"show": true
				}
			},
			"axesDefaults":    {
				"labelOptions":    {
					"fontSize":        '13pt'
				}
			},
			"axes":            {
				"xaxis":           {},
				"yaxis":           {}
			},
			"highlighter":     {
				"show": false
			}
		};
		
		
		//------------------------------------------------//
		//-- 4.02 - Graph Title                         --//
		//------------------------------------------------//
		if( sGraphTitle!==undefined && sGraphTitle!==false && sGraphTitle!==null ) {
			//-- Set the Title --//
			aGraphSettings.title = sGraphTitle;
		}
		
		
		//------------------------------------------------//
		//--  4.04 - X Axis                             --//
		//------------------------------------------------//
		
		//-- X Axis Min and Max --//
		if( sAxisX_Min!=="") {
			aGraphSettings.axes.xaxis.min = sAxisX_Min;
		}
		if( sAxisX_Max!=="") {
			aGraphSettings.axes.xaxis.max = sAxisX_Max;
		}
		
		//-- X Axis Label --//
		if( sAxisX_Label!=="" ) {
			aGraphSettings.axes.xaxis.label = sAxisX_Label;
		}
		
		//-- X Axis Ticks --//
		if( bAxisX_UseCategories===true ) {
			//-- Activate the Category Renderer --//
			aGraphSettings.axes.xaxis.renderer = $.jqplot.CategoryAxisRenderer;
			
			//-- Set the Tick Categories --//
			aGraphSettings.axes.xaxis.ticks = aAxisX_TickCategories;
		}
		
		
		//------------------------------------------------//
		//-- 4.05 - Y Axis                              --//
		//------------------------------------------------//
		
		//-- Add the Label --//
		if( sAxisY_Label!=="" ) {
			//-- Set the label and set the label renderer --//
			aGraphSettings.axes.yaxis.label = sAxisY_Label;
		}
		
		//-- Y Axis Min and Max --//
		if( sAxisY_Min!=="" ) {
			aGraphSettings.axes.yaxis.min = sAxisY_Min;
		}
		
		if( sAxisY_Max!=="" ) {
			aGraphSettings.axes.yaxis.max = sAxisY_Max;
		}
		
		
		//------------------------------------------------//
		//-- 4.06 - Legend                              --//
		//------------------------------------------------//
		if( bUseLegend===true) {
			//-- Setup the legend data --//
			aGraphSettings.legend = aLegendCustomData;
		}
		
		
		//------------------------------------------------//
		//-- 4.07 - Setup the Series Colors             --//
		//------------------------------------------------//
		if( bUseCustomColors===true ) {
			//-- Use the colors defined in the GraphDataSources parameter --//
			aGraphSettings.seriesColors = aCustomColors;
		} else {
			//-- Use the defaults --//
			aGraphSettings.seriesColors = IOMy.graph_jqplot.DefaultBarSeriesColors;
		}
		
		
		//------------------------------------------------//
		//-- 4.10 - Set the Data                        --//
		//------------------------------------------------//
		if( bUseCustomData===false ) {
			//-- Use the Data in the controller --//
			aCustomData = oController.Graph_Data;
		}
		
		
		//------------------------------------------------//
		//-- 4.?? - Debugging                           --//
		//------------------------------------------------//
		//console.log("Settings ="+JSON.stringify(aGraphSettings) );
		//console.log("Data ="+JSON.stringify(aCustomData) );
		
		
		//----------------------------------------------------------------------------------------//
		//-- 5.0 - Make the Bar Graph                                                           --//
		//----------------------------------------------------------------------------------------//
		$.jqplot.config.enablePlugins = true;
		oGraph = $.jqplot( sGraphElementName, aCustomData, aGraphSettings );
		
		//--------------------------------------------------------//
		//-- 9.0 - Return the Results                           --//
		//--------------------------------------------------------//
		return oGraph;
		
		
	}
	
});