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

$.sap.require("iomy.graph_jqplot");

sap.ui.controller("pages.staging.graphs.BarGraph", {
	
	Graph_Data1:          [],
	Graph_Data2:          [],
	
	iIOId               : 0,
	iThingId			: 0,
    sPeriod             : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.staging.graphs.BarGraph
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = oController.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
                oController.iIOId       = evt.data.IO_ID;
				oController.iThingId	= evt.data.ThingId;
                
                oController.sPeriod = evt.data.TimePeriod;
                
                //-- Weekly view is the default --//
                if (oController.sPeriod !== iomy.graph_jqplot.PeriodWeek &&
                    oController.sPeriod !== iomy.graph_jqplot.PeriodYear)
                {
                    oController.sPeriod = iomy.graph_jqplot.PeriodWeek;
                }
                
				var dateCurrentTime = new Date();
				$("#GraphPage_Main").html("");
				$("#GraphPage_Main_Info").html("");
				
                oController.GetBarDataAndDrawGraph( oController.iIOId, (dateCurrentTime.getTime() / 1000), oController.sPeriod );
                //oController.GetBarDataAndDrawGraph( oController.iIOId, 1501509599, oController.sPeriod );
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf pages.staging.graphs.BarGraph
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf pages.staging.graphs.BarGraph
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf pages.staging.graphs.AddRule
*/
	onExit: function() {
        
	},
    
    /**
     * Generates for 12 months to the current time the data that will be used to
     * generate the start and end UTS for loading data for each period.
     * 
     * @param {type} iUTS           The current time
     * @returns {Array}             Returns an array of data used for the bar graph.
     */
    generateMonthData : function (iUTS) {
        var aMonths = [];
        
        //--------------------------------------------------------------------//
        // Create a date object to fetch the month number and current year,
        // then grab the maximum number of days for each month and record the
        // month number and the year.
        //--------------------------------------------------------------------//
        try {
            var date    = new Date(iUTS * 1000);
            var iMonth  = date.getMonth() + 1;
            var iYear   = date.getFullYear();
            var mData   = {};

            for (var i = 0; i < 12; i++) {
                mData = {
                    month   : iMonth,
                    year    : iYear,
                    days    : iomy.time.getMaximumDateInMonth( iYear, iMonth )
                };

                aMonths.push(mData);

                //-- Move on to the previous month --//
                iMonth--;

                if (iMonth === 0) {
                    iMonth = 12;
                    iYear--;
                }
            }
        } catch (e) {
            $.sap.log.error("Error generating data about months in a year for the bar graph ("+e.name+"): " + e.message);
            
        } finally {
            return aMonths.reverse();
        }
    },
    
    /**
     * Creates the start and end UTS periods to be used when calling the
     * aggregation APIs to load the graph data for viewing annual data.
     * 
     * X-axis ticks will be generated after the timestamps have been created.
     * 
     * @param {type} iUTS       Current UTS
     * @returns {Object}        UTS Data
     */
    generateMonthlyUTSPeriods : function (iUTS) {
        var mData       = {};
        
        try {
            var oController = this;
            var mUTSData    = {};
            var aMonthInfo  = oController.generateMonthData(iUTS);
            var iDays       = 0;
            var dateTmp1    = new Date(iUTS * 1000);
            var dateTmp2    = null;
            var iStart;
            var iEnd;

            //-- The number of days will either be 365 or 366. --//
            for (var i = 0; i < aMonthInfo.length; i++) {
                iDays += aMonthInfo[i].days;
            }
            
            //-- Set the current date to the end of the month --//
            dateTmp1 = new Date(iUTS * 1000);
            dateTmp1.setMilliseconds(59);
            dateTmp1.setSeconds(59);
            dateTmp1.setMinutes(59);
            dateTmp1.setHours(23);
            dateTmp1.setDate( iomy.time.getMaximumDateInMonth( dateTmp1.getFullYear(), dateTmp1.getMonth() + 1 ) );
            
            iUTS = dateTmp1.getTime() / 1000;

            //-- Start generating the two UTS times. --//
            for (var i = 0; i < aMonthInfo.length; i++) {
                iStart = iUTS - ( 86400 * (iDays - 1));

                dateTmp2 = new Date(iStart * 1000);
                dateTmp2.setDate(1);
                dateTmp2.setHours(0);
                dateTmp2.setMinutes(0);
                dateTmp2.setSeconds(0);
                dateTmp2.setMilliseconds(0);

                //-- Recalculate the remaining days if there are no months after the current one. --//
                if (aMonthInfo[i+1] !== undefined) {
                    iDays -= iomy.time.getMaximumDateInMonth( aMonthInfo[i].year, aMonthInfo[i].month );

                    iEnd = iUTS - ( 86400 * iDays);
                } else {
                    iEnd = iUTS;
                }
                
//                console.log("Start: "+dateTmp2);
//                console.log("End: "+new Date(iEnd * 1000));

                //-- Create the data entry. --//
                mUTSData["period"+(i+1)] = {
                    start : dateTmp2.getTime() / 1000,
                    end : iEnd
                };
            }

            mData.ticks = oController.generateTicks(mUTSData);
            mData.utsData = mUTSData;
            
            console.log(mUTSData);

        } catch (e) {
            $.sap.log.error("Error generating the start and end UTS times ("+e.name+"): " + e.message);
            
        } finally {
            return mData;
        }
    },
    
    /**
     * Takes a map contains a set of periods and uses them to create the X-axis
     * ticks depending on the period the graph is set to display for.
     * 
     * @param {type} mUTSData       Map containing the UTS API data
     * @returns {Array}             Ticks
     */
    generateTicks : function (mUTSData) {
        var oController = this;
        var aTicks      = [];
        
        $.each(mUTSData, function (sI, mUTS) {
            
            switch (oController.sPeriod) {
                //------------------------------------------------------------//
                // Generate the days of the week for the weekly view.
                //------------------------------------------------------------//
                case iomy.graph_jqplot.PeriodWeek:
                    var date = new Date(mUTS.start * 1000);
                    
                    if (date.getDay() === 0) {
                        aTicks.push('Sun');
                        
                    } else if (date.getDay() === 1) {
                        aTicks.push('Mon');
                        
                    } else if (date.getDay() === 2) {
                        aTicks.push('Tue');
                        
                    } else if (date.getDay() === 3) {
                        aTicks.push('Wed');
                        
                    } else if (date.getDay() === 4) {
                        aTicks.push('Thu');
                        
                    } else if (date.getDay() === 5) {
                        aTicks.push('Fri');
                        
                    } else if (date.getDay() === 6) {
                        aTicks.push('Sat');
                        
                    }
                    
                    break;
                    
                //------------------------------------------------------------//
                // Generate the names of the previous 12 months for the annual
                // view.
                //------------------------------------------------------------//
                case iomy.graph_jqplot.PeriodYear:
                    //var date = new Date(iomy.time.GetStartStampForTimePeriod("month", Math.floor(mUTS.end) * 1000));
                    var date = new Date(mUTS.start * 1000);
                    
                    if (date.getMonth() === 0) {
                        aTicks.push('Jan');
                        
                    } else if (date.getMonth() === 1) {
                        aTicks.push('Feb');
                        
                    } else if (date.getMonth() === 2) {
                        aTicks.push('Mar');
                        
                    } else if (date.getMonth() === 3) {
                        aTicks.push('Apr');
                        
                    } else if (date.getMonth() === 4) {
                        aTicks.push('May');
                        
                    } else if (date.getMonth() === 5) {
                        aTicks.push('Jun');
                        
                    } else if (date.getMonth() === 6) {
                        aTicks.push('Jul');
                        
                    } else if (date.getMonth() === 7) {
                        aTicks.push('Aug');
                        
                    } else if (date.getMonth() === 8) {
                        aTicks.push('Sep');
                        
                    } else if (date.getMonth() === 9) {
                        aTicks.push('Oct');
                        
                    } else if (date.getMonth() === 10) {
                        aTicks.push('Nov');
                        
                    } else if (date.getMonth() === 11) {
                        aTicks.push('Dec');
                        
                    }
                    
                    break;
            }
        });
        //console.log(aTicks);
        
        return aTicks;
    },
    
    GetBarDataAndDrawGraph : function ( iIOId, iEndUTS, sPeriodType ) {
        //----------------------------------------------------//
        //-- 1.0 - Declare Variables                        --//
        //----------------------------------------------------//
        var oController     = this;
		var oView           = this.getView();
        var mUTSData        = {};
        var aGraphData      = [];
        var iTempData       = 0;
        var aRequests       = [];
        var sUOM            = null;
        var oGraphRequests  = null;
        var aTicks          = [];
        
        //--------------------------------------------------------------------//
        // Create the map of UTS timestamps calculated for each period
        //--------------------------------------------------------------------//
        switch (sPeriodType) {
            case iomy.graph_jqplot.PeriodYear:
                var mData = oController.generateMonthlyUTSPeriods(iEndUTS);
                
                mUTSData = mData.utsData;
                aTicks   = mData.ticks;
                
                break;
                
            default :
                for (var i = 7; i > 0; i--) {
                    mUTSData["period"+(7 - (i - 1))] = {
                        start : iEndUTS - ( 86400 * i ),
                        end : iEndUTS - ( 86400 * (i - 1) )
                    };
                }
                
                aTicks = oController.generateTicks(mUTSData, sPeriodType);
                
                break;
        }
        
        
        //--------------------------------------------------------------------//
        // Create the Min aggregation request for the first period.
        //--------------------------------------------------------------------//
        try {
            aRequests.push({
                library : "php",
                url:  iomy.apiphp.APILocation( "aggregation" ),
                data: {
                    Id:        iIOId,
                    Mode:      "Min",
                    StartUTS:  mUTSData.period1.start,
                    EndUTS:    mUTSData.period1.end
                },

                onSuccess : function (sType, mData) {
                    iTempData = mData.Value;
                },
                
                onFail : function (response) {
                    $.sap.log.error( "Error retrieving bar graph data (period1 - min aggregation): " + response.responseText );
                }
            });
        } catch (e) {
            $.sap.log.error("Fatal error creating the minimum aggregation request ("+e.name+"): " + e.message);
            return;
        }
        
        try {
            //--------------------------------------------------------------------//
            // Create Max aggregation requests for the other periods.
            //--------------------------------------------------------------------//
            $.each(mUTSData, function(sI, mUTS) {
                aRequests.push({
                    library : "php",
                    url:  iomy.apiphp.APILocation( "aggregation" ),
                    data: {
                        Id:        iIOId,
                        Mode:      "Max",
                        StartUTS:  mUTS.start,
                        EndUTS:    mUTS.end
                    },

                    onSuccess : function (sType, mData) {
                        //-- If the UOM hasn't been captured, do so now. --//
                        if (sUOM === null) {
                            sUOM = mData.UOM_NAME;
                        }

                        //-- Calculate, then store the value for the next request. --//
                        aGraphData.push( mData.Value - iTempData );
                        iTempData = mData.Value;
                    },

                    onFail : function (response) {
                        $.sap.log.error( "Error retrieving bar graph data ("+sI+"): " + response.responseText );
                    }
                });

            });
        } catch (e) {
            $.sap.log.error("Fatal error creating the maximum aggregation requests ("+e.name+"): " + e.message);
            return;
        }
        
        //--------------------------------------------------------------------//
        // Run all requests in a request queue, and draw the graph afterwards.
        //--------------------------------------------------------------------//
        try {
            oGraphRequests = new AjaxRequestQueue({
                requests : aRequests,

                onSuccess : function () {
                    try {
                        var sDeviceName		= iomy.common.ThingList["_"+oController.iThingId].DisplayName;

                        var aSeriesData = {
                            "Label": sDeviceName,
                            "Color": "lightslategrey",
                            "Data":  aGraphData
                        };
                        
                        var sTitle      = "";
                        var sAxisXLabel = "";
                        
                        if (oController.sPeriod === iomy.graph_jqplot.PeriodWeek) {
                            sTitle      = "Weekly Usage for "+sDeviceName;
                            sAxisXLabel = "Week";
                            
                        } else if (oController.sPeriod === iomy.graph_jqplot.PeriodYear) {
                            sTitle      = "Yearly Usage for "+sDeviceName;
                            sAxisXLabel = "Month";
                            
                        }

                        try {
                            iomy.graph_jqplot.CreateBarGraph( 
                                oController,
                                'GraphPage_Main',
                                [
                                    aSeriesData
                                ],
                                {
                                    "sTitle":       sTitle,
                                    "sType":        "Basic",
                                    "UseLegend":    false,
                                    "LegendPreset": 2,
                                    "AxisX_Label":  sAxisXLabel,
                                    "AxisY_Label":  sUOM,
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

                        } catch (e) {
                            $.sap.log.error("An error occurred drawing the bar graph ("+e.name+"): " + e.message);
                        }

                    } catch( e20 ) {
    //                    $.sap.log.error( "Data1Min = "+JSON.stringify( aData1Max ) );
    //                    $.sap.log.error( "Data1Max = "+JSON.stringify( aData1Max ) );
    //                    $.sap.log.error( "Data2Max = "+JSON.stringify( aData2Max ) );
    //                    $.sap.log.error( "Data3Max = "+JSON.stringify( aData3Max ) );
    //                    $.sap.log.error( "Data4Max = "+JSON.stringify( aData4Max ) );
    //                    $.sap.log.error( "Data5Max = "+JSON.stringify( aData5Max ) );
    //                    $.sap.log.error( "Data6Max = "+JSON.stringify( aData6Max ) );
    //                    $.sap.log.error( "Data7Max = "+JSON.stringify( aData7Max ) );

                        $.sap.log.error("Critical Error! Bar Graph: "+e20.message );
                    }
                },

                onWarning : function () {
                    $.sap.log.error("Failed to load some data for the bar graph.");
                },

                onFail : function () {
                    $.sap.log.error("Failed to load any data for the bar graph.");
                }
            });
        } catch (e) {
            $.sap.log.error("Fatal error running the bar graph request queue ("+e.name+"): " + e.message);
            return;
        }
    }
	
});