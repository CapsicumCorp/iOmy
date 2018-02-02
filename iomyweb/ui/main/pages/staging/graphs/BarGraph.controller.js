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

sap.ui.controller("pages.staging.graphs.BarGraph", {
	
	Graph_Data1:          [],
	Graph_Data2:          [],
	
	iIOId               : 0,
	iThingId			: 0,
    
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
				
                oController.iIOId	= evt.data.IO_ID;
				oController.iThingId	= evt.data.ThingId;
                
				var dateCurrentTime = new Date();
				$("#GraphPage_Main").html("");
				$("#GraphPage_Main_Info").html("");
				
                //oController.GetBarDataAndDrawGraph( oController.iIOId, (dateCurrentTime.getTime() / 1000), IomyRe.graph_jqplot.PeriodWeek );
                oController.GetBarDataAndDrawGraph( oController.iIOId, (dateCurrentTime.getTime() / 1000), IomyRe.graph_jqplot.PeriodWeek );
                //oController.GetBarDataAndDrawGraph( oController.iIOId, 1501545539, IomyRe.graph_jqplot.PeriodYear );
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
    
    generateTicks : function (mUTSData, sPeriod) {
        var aTicks      = [];
        
        $.each(mUTSData, function (sI, mUTS) {
            
            switch (sPeriod) {
                case IomyRe.graph_jqplot.PeriodWeek:
                    var date = new Date(IomyRe.time.GetStartStampForTimePeriod(sPeriod, Math.floor(mUTS.start) * 1000));
                    
                    if (date.getUTCDay() === 0) {
                        aTicks.push('Sun');
                        
                    } else if (date.getUTCDay() === 1) {
                        aTicks.push('Mon');
                        
                    } else if (date.getUTCDay() === 2) {
                        aTicks.push('Tue');
                        
                    } else if (date.getUTCDay() === 3) {
                        aTicks.push('Wed');
                        
                    } else if (date.getUTCDay() === 4) {
                        aTicks.push('Thu');
                        
                    } else if (date.getUTCDay() === 5) {
                        aTicks.push('Fri');
                        
                    } else if (date.getUTCDay() === 6) {
                        aTicks.push('Sat');
                        
                    }
                    
                    break;
                    
                case IomyRe.graph_jqplot.PeriodYear:
                    var date = new Date(IomyRe.time.GetStartStampForTimePeriod(sPeriod, Math.floor(mUTS.start) * 1000));
                    
                    if (date.getUTCMonth() === 0) {
                        aTicks.push('Jan');
                        
                    } else if (date.getUTCMonth() === 1) {
                        aTicks.push('Feb');
                        
                    } else if (date.getUTCMonth() === 2) {
                        aTicks.push('Mar');
                        
                    } else if (date.getUTCMonth() === 3) {
                        aTicks.push('Apr');
                        
                    } else if (date.getUTCMonth() === 4) {
                        aTicks.push('May');
                        
                    } else if (date.getUTCMonth() === 5) {
                        aTicks.push('Jun');
                        
                    } else if (date.getUTCMonth() === 6) {
                        aTicks.push('Jul');
                        
                    } else if (date.getUTCMonth() === 7) {
                        aTicks.push('Aug');
                        
                    } else if (date.getUTCMonth() === 8) {
                        aTicks.push('Sep');
                        
                    } else if (date.getUTCMonth() === 9) {
                        aTicks.push('Oct');
                        
                    } else if (date.getUTCMonth() === 10) {
                        aTicks.push('Nov');
                        
                    } else if (date.getUTCMonth() === 11) {
                        aTicks.push('Dec');
                        
                    }
                    
                    break;
            }
        });
        console.log(aTicks);
        
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
            case IomyRe.graph_jqplot.PeriodWeek:
                //aTicks = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
                
                for (var i = 7; i > 0; i--) {
                    mUTSData["period"+(7 - (i - 1))] = {
                        start : iEndUTS - ( 86400 * i ),
                        end : iEndUTS - ( 86400 * (i - 1) )
                    };
                }
                
                break;
                
            case IomyRe.graph_jqplot.PeriodYear:
                //aTicks = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
                
                for (var i = 12; i > 0; i--) {
                    mUTSData["period"+(12 - (i - 1))] = {
                        start : iEndUTS - ( 86400 * (31 * i) ),
                        end : iEndUTS - ( 86400 * (31 * (i - 1)) )
                    };
                }
                
                break;
                
            default :
                $.sap.log.error("Invalid period type");
                return;
        }
        
        aTicks = oController.generateTicks(mUTSData, sPeriodType);
        
        //--------------------------------------------------------------------//
        // Create the Min aggregation request for the first period.
        //--------------------------------------------------------------------//
        try {
            aRequests.push({
                library : "php",
                url:  IomyRe.apiphp.APILocation( "aggregation" ),
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
                    url:  IomyRe.apiphp.APILocation( "aggregation" ),
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
                        var sDeviceName		= IomyRe.common.ThingList["_"+oController.iThingId].DisplayName;

                        var aSeriesData = {
                            "Label": sDeviceName,
                            "Color": "lightslategrey",
                            "Data":  aGraphData
                        };

                        try {
                            IomyRe.graph_jqplot.CreateBarGraph( 
                                oController,
                                'GraphPage_Main',
                                [
                                    aSeriesData
                                ],
                                {
                                    "sTitle":       "Weekly Usage for "+sDeviceName,
                                    "sType":        "Basic",
                                    "UseLegend":    false,
                                    "LegendPreset": 2,
                                    "AxisX_Label":  "Week",
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

        //----------------------------------------------------//
        //-- 4.0 - Get the data for the appropriate Period  --//
        //----------------------------------------------------//
        /*switch( sPeriodType ) {
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
                IomyRe.apiphp.AjaxRequest({
                    url:  IomyRe.apiphp.APILocation( "aggregation" ),
                    data: {
                        Id:        iIOId,
                        Mode:      "Min",
                        StartUTS:  iDay1StartUTS,
                        EndUTS:    iDay1EndUTS
                    },
                    onSuccess: function ( sResponseType, aData1Min ) {
                        //--------------------------------//
                        //-- DATA1 MAX                  --//
                        IomyRe.apiphp.AjaxRequest({
                            url:  IomyRe.apiphp.APILocation( "aggregation" ),
                            data: {
                                Id:       iIOId,
                                Mode:     "Max",
                                StartUTS: iDay1StartUTS,
                                EndUTS:   iDay1EndUTS
                            },
                            onSuccess: function ( sResponseType, aData1Max ) {

                                //--------------------------------//
                                //-- DATA2 MAX                  --//
                                IomyRe.apiphp.AjaxRequest({
                                    url:  IomyRe.apiphp.APILocation( "aggregation" ),
                                    data: {
                                        Id:        iIOId,
                                        Mode:      "Max",
                                        StartUTS:  iDay2StartUTS,
                                        EndUTS:    iDay2EndUTS
                                    },
                                    onSuccess: function ( sResponseType, aData2Max ) {

                                        //--------------------------------//
                                        //-- DATA3 MAX                  --//
                                        IomyRe.apiphp.AjaxRequest({
                                            url:  IomyRe.apiphp.APILocation( "aggregation" ),
                                            data: {
                                                Id:       iIOId,
                                                Mode:     "Max",
                                                StartUTS: iDay3StartUTS,
                                                EndUTS:   iDay3EndUTS
                                            },
                                            onSuccess: function ( sResponseType, aData3Max ) {

                                                //--------------------------------//
                                                //-- DATA4 MAX                  --//
                                                IomyRe.apiphp.AjaxRequest({
                                                    url:  IomyRe.apiphp.APILocation( "aggregation" ),
                                                    data: {
                                                        Id:       iIOId,
                                                        Mode:     "Max",
                                                        StartUTS: iDay4StartUTS,
                                                        EndUTS:   iDay4EndUTS
                                                    },
                                                    onSuccess: function ( sResponseType, aData4Max ) {

                                                        //--------------------------------//
                                                        //-- DATA5 MAX                  --//
                                                        IomyRe.apiphp.AjaxRequest({
                                                            url:  IomyRe.apiphp.APILocation( "aggregation" ),
                                                            data: {
                                                                Id:       iIOId,
                                                                Mode:     "Max",
                                                                StartUTS: iDay5StartUTS,
                                                                EndUTS:   iDay5EndUTS
                                                            },
                                                            onSuccess: function ( sResponseType, aData5Max ) {

                                                                //--------------------------------//
                                                                //-- DATA6 MAX                  --//
                                                                IomyRe.apiphp.AjaxRequest({
                                                                    url:  IomyRe.apiphp.APILocation( "aggregation" ),
                                                                    data: {
                                                                        Id:       iIOId,
                                                                        Mode:     "Max",
                                                                        StartUTS: iDay6StartUTS,
                                                                        EndUTS:   iDay6EndUTS
                                                                    },
                                                                    onSuccess: function ( sResponseType, aData6Max ) {

                                                                        //--------------------------------//
                                                                        //-- DATA7 MAX                  --//
                                                                        IomyRe.apiphp.AjaxRequest({
                                                                            url:  IomyRe.apiphp.APILocation( "aggregation" ),
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
																					var sDeviceName		= IomyRe.common.ThingList["_"+oController.iThingId].DisplayName;
																					
                                                                                    var aSeriesData = {
                                                                                        "Label": sDeviceName,
                                                                                        "Color": "lightslategrey",
                                                                                        "Data":  [ iSundayValue, iMondayValue, iTuesdayValue, iWednesdayValue, iThursdayValue, iFridayValue, iSaturdayValue ]
                                                                                    };


                                                                                    var aTicks = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

                                                                                    try {
                                                                                        IomyRe.graph_jqplot.CreateBarGraph( 
                                                                                            oController,
                                                                                            'GraphPage_Main',
                                                                                            [
                                                                                                aSeriesData
                                                                                            ],
                                                                                            {
                                                                                                "sTitle":       "Weekly Usage for "+sDeviceName,
                                                                                                "sType":        "Basic",
                                                                                                "UseLegend":    false,
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
                                                                                    
                                                                                    } catch (e) {
                                                                                        $.sap.log.error("An error occurred drawing the bar graph ("+e.name+"): " + e.message);
                                                                                    }
                                                                                    
                                                                                } catch( e20 ) {
                                                                                    $.sap.log.error( "Data1Min = "+JSON.stringify( aData1Max ) );
                                                                                    $.sap.log.error( "Data1Max = "+JSON.stringify( aData1Max ) );
                                                                                    $.sap.log.error( "Data2Max = "+JSON.stringify( aData2Max ) );
                                                                                    $.sap.log.error( "Data3Max = "+JSON.stringify( aData3Max ) );
                                                                                    $.sap.log.error( "Data4Max = "+JSON.stringify( aData4Max ) );
                                                                                    $.sap.log.error( "Data5Max = "+JSON.stringify( aData5Max ) );
                                                                                    $.sap.log.error( "Data6Max = "+JSON.stringify( aData6Max ) );
                                                                                    $.sap.log.error( "Data7Max = "+JSON.stringify( aData7Max ) );

                                                                                    $.sap.log.error("Critical Error! Bar Graph: "+e20.message );
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
        }*/
    }
	
});