/*
Title: Device Overview page
Author: Andrew Sommerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: UI5 Controller. Lists all the devices the current user has access to.
Copyright: Capsicum Corporation 2016, 2017

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


sap.ui.controller("mjs.devices.DeviceOverview", {
	api: IOMy.apiphp,
	oData: IOMy.apiodata,
	functions : IOMy.functions,
	common : IOMy.common,
	
		
	//timerInterval		: null,
	aAjaxTasks:{ 
		"Low":						[],			//-- ARRAY:			Sub-array that is used to hold the list of slower ajax requests which can be left to last to be run.		--//
		"Mid":						[],			//-- ARRAY:			Sub-array that is used to hold the list of mid range ajax requests which can be left to lrun in between the high and low tasks.		--//
		"High":						[]			//-- ARRAY:			Sub-array that is used to hold the list of quick ajax requests that can be run before the slower tasks.		--//
	},											//-- ARRAY:			Used to store the list of Ajax tasks to execute to update the page. --//
	aUIGroupingData:				[],			//-- ARRAY:			Used to store the UI data
	
    iIOCount:                       0,          //-- INTEGER:       Counts the number of IOs detected. --//
    iIOErrorCount:                  0,          //-- INTEGER:       Counts the number of IOs that failed to load. --//
    aIOErrorMessages:               [],         //-- ARRAY:         An array for the error messages that are generated when an error occurs with one of the IOs. --//
    
	iCachingSeconds:				300,		//-- INTEGER:		The Time in seconds of how long to cache the Page before it needs refreshing. (Hugely decreases the Server workload)	--//
	dLastAjaxUpdate:				null,		//-- DATE:			Stores the last time the page had the Ajax values updated.			--//
	dLastDeviceUpdate:				null,		//-- DATE:			Stores the last time the page had the Ajax values updated.			--//
	iLastRoomId:					-100,		//-- INTEGER:		Stores the last RoomId so that if the RoomId changes the page will need to be redrawn.--//
	aCurrentRoomData:				{},			//-- ARRAY:			Used to store the current room data			--//
	aElementsToDestroy:				[],			//-- ARRAY:			Stores a list of Ids of UI5 Objects to destroy on Page Redraw		--//
    
    sFilter:                        "",
    aFilters:                       [],
	
	//aUIGroupingDataPerRoom: {},
	//aLastAjaxUpdatePerRoom: {},
	
	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf mjs.devices.DeviceOverview
	*/
	onInit: function() {
		//----------------------------------------------------//
		//-- Declare Variables								--//
		//----------------------------------------------------//
		var me = this;
		var thisView = me.getView();

		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
                //-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				//----------------------------------------------------//
				//-- Prepare for redrawing the page					--//
				//----------------------------------------------------//
				
				//-- IF no Ajax requests have been run from this page yet. --//
//				if( me.dLastAjaxUpdate!==null && me.dLastDeviceUpdate !== null) {
//						
//                    me.DestroyCurrentDevices();
//                    me.InitialThingUISetup();
//                    me.RefreshAjaxDataForUI();
//                        
//				//-- ELSE do nothing as the page should be doing the "1st Run". --//
//				} else {
					//console.log("Room: First run hasn't initialised!");
					me.DestroyCurrentDevices();
					//-- Run the 1st run tool --//
					me.InitialThingUISetup();
					//-- Update the Ajax Data for the UI --//
					me.RefreshAjaxDataForUI();
//				}
/*
				if (me.aLastAjaxUpdatePerRoom["_"+me.roomID] === undefined) {
					me.aLastAjaxUpdatePerRoom["_"+me.roomID] = null;
				}
				if (me.aUIGroupingDataPerRoom["_"+me.roomID] === undefined) {
					me.aUIGroupingDataPerRoom["_"+me.roomID] = [];
				}
//				if( me.dLastAjaxUpdate!==null ) {
//					if( me.dLastAjaxUpdate > ( Date() - 300) ) {
//						me.RefreshAjaxDataForUI();
//					}
//				}
				if( me.aLastAjaxUpdatePerRoom["_"+me.roomID]!==null ) {
					if( me.aLastAjaxUpdatePerRoom["_"+me.roomID] > ( Date() - 300) ) {
						me.RefreshAjaxDataForUI();
					}
				}
				
                //-- Run the 1st run tool --//
                if (me.byId("forRoom"+me.roomID) === undefined)
                    me.InitialThingUISetup();
                //-- Update the Ajax Data for the UI --//
                me.RefreshAjaxDataForUI();
*/
			}
		});
	},
	
	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* @memberOf mjs.devices.DeviceOverview
	*/
//	onBeforeRendering: function() {
//		
//	},
	
	//============================================================================================//
	//== DESTROY CURRENT DEVICES																==//
	//============================================================================================//
	DestroyCurrentDevices: function() {
		var oController					= this;				//-- SCOPE:
		
		//-- Clear the List of tasks --//
		oController.aAjaxTasks = { 
			"Low":	[],
			"Mid":	[],
			"High":	[]
		}
		
		//-- Destroy each element --//
		$.each( oController.aElementsToDestroy, function( sIndex, sObjectId ) {
			try {
				oController.byId( sObjectId ).destroy();
			} catch(e1) {
				//console.log("Error DeletingObject: "+sObjectId);
			}
			
		});
		
		oController.aElementsToDestroy = [];
	},

	//============================================================================================//
	//== INITIAL THING UI SETUP																==//
	//============================================================================================//
	InitialThingUISetup: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables						--//
		//----------------------------------------------------//
		var oController			= this;						//-- SCOPE:		--//
		var thisView			= oController.getView();	//-- OBJECT:	--//
		
		var sDeviceGrouping		= "";				//-- INTEGER:	--//
		var iRowNumber			= 0;				//-- INTEGER:	Starts with zero as the 1st row then increments for every other row. This will help with the styling --//
		var aCurrentRoom		= {};				//-- ARRAY:		Stores the Current Room Data after it has been picked from the Premise List --//
		var sPKey				= "";				//-- STRING:	Holds the "Premise Id" based key in the "PremiseList" global array. --//
		var sRKey				= "";				//-- STRING:	Holds the "Rooms Id" based key in the "PremiseList" global array. --//
		var sGroupName			= "";				//-- STRING:	Holds the "UI Grouping Name" that will be used. --//
		var aDevice				= {};				//-- ARRAY:		--//
		var aMenuItems = [                          //-- ARRAY:		Holds the items for building the action menu. --//
            {
                text: "NO FILTER",
                select: function(oControlEvent) {
                    if (oController.sFilter !== "") {
                        oController.sFilter = "";
                        oController.DestroyCurrentDevices();
                        oController.InitialThingUISetup();
                        oController.RefreshAjaxDataForUI();
                    }
                }
            },
        ];
		//----------------------------------------------------//
		//-- 2.0 - ADD DEVICES INTO THE APPROPIATE GROUPING	--//
		//----------------------------------------------------//
		oController.aFilters = []; // Clear the list of filters in case any new device types appear or disappear in the list.
		
		oController.dLastDeviceUpdate = oController.common.ThingListLastUpdate; // Set when the Thing/Item list was last updated.
		
		//-- Reset the UI Groupings --//
		oController.aUIGroupingData = {};
		
        $.each( IOMy.common.RoomsList, function( sIndex, aPremise ) {
            //-- Check if the Premise is accessible --//
            if(aPremise!==undefined) {
                $.each( aPremise, function( sIndex, aRoom ) {
                    //-- Check if the Room is accessible --//
                    if( aRoom!==undefined ) {
                        //-- Foreach Thing in the UI RoomList --//
                        $.each( aRoom.Things, function( sIndex, aDeviceKeys ) {

                            //-- Check to make sure the Device is defined (Best to do this for each result from a foreach) --//
                            if ( aDeviceKeys!==undefined ) {

                                //-- Store the Device Data from the Device List --//
                                aDevice = IOMy.common.ThingList["_"+aDeviceKeys.Thing];
                                
                                //-- If it isn't already logged as a filter, add the device type to the filter list --//
                                //-- and add the menu item to the extras menu. --//
                                if (oController.aFilters.indexOf(aDevice.TypeName) === -1) {
                                    // Register the device type.
                                    oController.aFilters.push(aDevice.TypeName);
                                    // Create the filter button.
                                    aMenuItems.push({
                                        text: aDevice.TypeName,
                                        select: function(oControlEvent) {
                                            if (oController.sFilter !== this.getText()) {
                                                oController.sFilter = this.getText();
                                                oController.DestroyCurrentDevices();
                                                oController.InitialThingUISetup();
                                                oController.RefreshAjaxDataForUI();
                                                oController.byId("filterMenu").close();
                                            }
                                        }
                                    });
                                }

                                if (oController.sFilter === aDevice.TypeName || oController.sFilter === "") {
                                    //-- Setup the UI Group Name --//
                                    sDeviceGrouping	= aDevice.TypeName;

                                    //--------------------------------------------//
                                    //-- If Grouping isn't setup yet			--//
                                    //--------------------------------------------//
                                    if( oController.aUIGroupingData[sDeviceGrouping]===undefined ) {
                                        //-- Define the Grouping --//
                                        //me.aUIGroupingDataPerRoom[sDeviceGrouping] = {
                                        oController.aUIGroupingData[sDeviceGrouping] = {
                                            "Name":sDeviceGrouping,		//-- Display the name of the Grouping --//
                                            "Prefix":"Dev",				//-- Prefix to make object have a unique Id --//
                                            "Devices":[]				//-- Array to store the devices in the Grouping --//
                                        };
                                    }

                                    //--------------------------------------------//
                                    //-- Add the Devices into the Grouping		--//
                                    //--------------------------------------------//
                                    oController.aUIGroupingData[sDeviceGrouping].Devices.push({
                                        "DeviceId":			aDevice.Id,
                                        "DeviceName":		aDevice.DisplayName,
                                        "DeviceTypeId":		aDevice.TypeId,
                                        "DeviceTypeName":	aDevice.TypeName,
                                        "DeviceStatus":		aDevice.Status,
                                        "LinkId":           aDevice.LinkId,
                                        "PermToggle":		aDevice.PermToggle,
                                        "IOs":              aDevice.IO,
                                        "RoomId":			aDevice.RoomId,
                                        "PremiseId":		aDevice.PremiseId,
                                        "UILastUpdate":		aDevice.UILastUpdate,
                                        "LabelWidgets":     aDevice.LabelWidgets
                                    });
                                }
                            }
                        });
                    } else {
                        console.log("Room: Failure with looking the RoomKey");
                    }
                });
            } else {
                console.log("Room: Failure with the PremiseKey!");
            }
        });
		
/*		
		$.each(IOMy.common.ThingList, function( sIndex, aDevice ) {
			if ( aDevice !== undefined) {
				iDeviceGrouping = 0;
				
				//--------------------------------------------//
				//-- If Grouping isn't setup yet			--//
				//--------------------------------------------//
				if( me.aUIGroupingDataPerRoom["_"+me.roomID][iDeviceGrouping]===undefined ) {
					//-- Define the Grouping --//
					me.aUIGroupingDataPerRoom["_"+me.roomID][iDeviceGrouping] = {
						"Name":"Devices",		//-- Display the name of the Grouping --//
						"Prefix":"Dev",			//-- Prefix to make object have a unique Id --//
						"Devices":[]			//-- Array to store the devices in the Grouping --//
					};
				}
				
				//--------------------------------------------//
				//-- Add the Devices into the Grouping		--//
				//--------------------------------------------//
				me.aUIGroupingDataPerRoom["_"+me.roomID][iDeviceGrouping].Devices.push({
					"DeviceId":			aDevice.Id,
					"DeviceName":		aDevice.DisplayName,
					"DeviceTypeId":		aDevice.TypeId,
					"DeviceTypeName":	aDevice.TypeName,
					"DeviceStatus":		aDevice.Status,
					"PermToggle":		aDevice.PermToggle,
					"IOs":			aDevice.IO,
					"RoomId":			aDevice.RoomId
				});
			}
		});
*/
		//----------------------------------------------------//
		//-- 3.0 - DRAW THE UI FOR EACH DEVICE				--//
		//----------------------------------------------------//
		
		var iUniqueId = 0;
        
        //-- Create Container --//
        var oVertBox = new sap.m.VBox({
            items: []
        }).addStyleClass("");
		
		$.each( oController.aUIGroupingData, function( sIndex, aGrouping ) {
			//-- Reset the Row number --//
			iRowNumber = 0;
			iUniqueId++;
			//----------------------------------------//
			//-- CREATE THE GROUPING CONTAINER		--//
			//----------------------------------------//
			
			//-- Create Unique Id --//
			var sTempName = "GC_"+iUniqueId+"_"+iRowNumber;
			oController.aElementsToDestroy.push( sTempName );
			
			
            //-- Create Container --//
            var oVBox = new sap.m.VBox( oController.createId(sTempName), {
                items: []
            }).addStyleClass("");
			
			//----------------------------------------//
			//-- GROUPING HEADING					--//
			//----------------------------------------//
			
			//-- Create Unique Id --//
			sTempName = "GH_"+iUniqueId+"_"+iRowNumber;
			oController.aElementsToDestroy.push( sTempName );
			
            var oHeading = new sap.m.HBox({
                items : [
                    // Group Heading (Item type)
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label( oController.createId(sTempName), {
                                text:		aGrouping.Name
                            }).addStyleClass("width100Percent")
                        ]
                    }).addStyleClass("MarLeft6px TextOverflowEllipsis")
                ]
            }).addStyleClass("ConsistentMenuHeader BorderBottom");
			
			oVBox.addItem(oHeading);
			
			//----------------------------------------//
			//-- FOREACH DEVICE IN GROUPING			--//
			//----------------------------------------//
			
			//-- 3.1.3 - Draw the UI for each Device --//
			$.each( aGrouping.Devices, function( sIndex2, aDevice ) {
				
				//-- Create the Prefix --//
				var sPrefix = aGrouping.Prefix+"_"+aDevice.DeviceId;
				
				//--  --//
				var oRowObject = IOMy.devices.GetCommonUIForDeviceOverview( sPrefix, oController, aDevice );
				
				if( oRowObject!==null ) {
                    oRowObject.addStyleClass("DeviceOverview-ItemContainerLight");
					
					//-- Increment the Row Number --//
					iRowNumber++;
					
					//-- Push the UI to the VBox Container --//
					oVBox.addItem( oRowObject );
					
					//-- Add the Object Names to the list of items to cleanup --//
					var aTemp1 = oController.aElementsToDestroy;
					var aTemp2 = IOMy.devices.GetObjectIdList( sPrefix, oController, aDevice );
					oController.aElementsToDestroy = aTemp1.concat(aTemp2);
				}
			});
			
			oVertBox.addItem(oVBox);
            
		}); //-- END FOREACH LOOP --//
		
        //-- Main Page Body --//
        if (oController.byId("Panel") !== undefined)
            oController.byId("Panel").destroy();

        var oPanel = new sap.m.Panel( oController.createId("Panel"), {
           //-- Add Grouping box to Panel --//
           backgroundDesign: "Transparent",
           content: [oVertBox]
        }).addStyleClass("MasterPanel UserInputForm PanelNoPadding PadTop3px PadBottom15px");

        thisView.byId("page").addContent( oPanel );
		
        //-- Insert the extras menu used to filter devices according to type. --//
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : oController.createId("extrasMenu"),        // Uses the page ID
                icon : "sap-icon://GoogleMaterial/more_vert",
                items : aMenuItems
            })
        );
	},


	RefreshAjaxDataForUI: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables						--//
		//----------------------------------------------------//
		var oController			= this;
		var thisView			= oController.getView();
		
		//----------------------------------------------------//
		//-- 2.0 - Fetch a list of Ajax tasks				--//
		//----------------------------------------------------//
		$.each( oController.aUIGroupingData, function( sIndex, aGrouping ) {
			//-- 3.1.3 - Draw the UI for each Device --//
			$.each( aGrouping.Devices, function( sIndex, aDevice ) {
				//-- Create the Prefix --//
				var sPrefix = aGrouping.Prefix+"_"+aDevice.DeviceId;
				
				//-- Add the Tasks to populate the UI --//
                //console.log(JSON.stringify(aDevice));
				var aNewTasks = IOMy.devices.GetCommonUITaskListForDeviceOverview( sPrefix, oController, aDevice );
				//jQuery.sap.log.debug( JSON.stringify(aNewTasks) );
				
				//-- High Priority --//
				if( aNewTasks.High!==undefined && aNewTasks.High!==null ) {
					if( aNewTasks.High.length > 0 ) {
						oController.aAjaxTasks.High.push.apply( oController.aAjaxTasks.High, aNewTasks.High );
					}
				}
				//-- Low Priority --//
				if( aNewTasks.Low!==undefined && aNewTasks.Low!==null ) {
					if( aNewTasks.Low.length > 0 ) {
						oController.aAjaxTasks.Low.push.apply( oController.aAjaxTasks.Low, aNewTasks.Low );
					}
				}
			});
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Execute the Ajax Tasks					--//
		//----------------------------------------------------//
		//-- Invert the array so that the tasks that were added first will be the first to be fetched --//
		oController.aAjaxTasks.High.reverse();
		oController.aAjaxTasks.Low.reverse();
		
		//-- Load 2 recursive Ajax Tasks --//
		oController.RecursiveLoadAjaxData();
		oController.RecursiveLoadAjaxData();
		
		//-- Update when the last Ajax data request occurred --//
		oController.dLastAjaxUpdate = new Date();
		
	},
	
	//====================================================//
	//== RECURSIVE AJAX LOADER							==//
	//====================================================//
	RecursiveLoadAjaxData: function() {
		var oController		= this;			//-- SCOPE:		Binds the current controller scope for subfunctions					--//
		var aTask			= {};			//-- ARRAY:		This will hold a task that has being pulled from the task list --//

		//-- Check the Length of the array to see if there is any jobs to do --//
		if( oController.aAjaxTasks.High.length > 0 ) {
			//-- Pull a task from the array --//
			aTask = oController.aAjaxTasks.High.pop();
			oController.RunAjaxTask(aTask);
			
		} else if( oController.aAjaxTasks.Mid.length > 0 ) {
			//-- Pull a task from the array --//
			aTask = oController.aAjaxTasks.Mid.pop();
			oController.RunAjaxTask(aTask);
				
		} else {
			if( oController.aAjaxTasks.Low.length > 0 ) {
				//-- Pull a task from the array --//
				aTask = oController.aAjaxTasks.Low.pop();
				oController.RunAjaxTask(aTask);
				
			}
		}
	},
	
	RunAjaxTask: function( aTask ) {
        
		//-- Extract the task type --//
		var sTaskType = aTask.Type;
		
		switch( sTaskType ) {
			case "DeviceValueKWHTotal":
				this.GetDeviceIOTotaledValue( aTask );
				break;
				
			case "DeviceValueKW":
				this.GetDeviceIORecentValue( aTask );
				break;
				
			case "DeviceValueVolt":
				this.GetDeviceIORecentValue( aTask );
				break;
				
			case "DeviceValueAmp":
				this.GetDeviceIORecentValue( aTask );
				break;
				
			default:
				//-- ERROR: Unknown Task Type --//
			
		}
		return true;
	},
	
	GetDeviceIORecentValue: function ( aTask ) {
		//--------------------------------------------------------//
		//-- 1.0 - Initialise									--//
		//--------------------------------------------------------//
		var oController			= this;			//-- OBJECT:		Binds the current Controller's scope to a variable for sub-functions to access    --//
		var iIOId               = 0;			//-- INTEGER:		The IO Id to poll the Data for                                                --//
		var sIODataType         = "";			//-- STRING:		The IO's Datatype is stored so that we know what Odata URL to poll            --//
		var sIOLabel            = "";			//-- STRING:		This will hold the nickname of which odata url to poll for data                   --//
		var iUTS_Start			= 0;			//-- INTEGER:		Used to hold the current period's starting Unix Timestamp                         --//
		var iUTS_End			= 0;			//-- INTEGER:		Used to hold the current period's ending Unix Timestamp                           --//
		var sAjaxUrl			= "";			//-- STRING:		--//
		var aAjaxColumns		= [];			//-- ARRAY:			--//
		var aAjaxWhereClause	= [];			//-- ARRAY:			--//
		var aAjaxOrderByClause	= [];			//-- ARRAY:			--//
		
		//--------------------------------------------------------//
		//-- 2.0 - Check if Ajax Request should be run			--//
		//--------------------------------------------------------//
		try {
			iIOId			= aTask.Data.IOId;
			sIODataType		= aTask.Data.IODataType;
			sIOLabel		= aTask.Data.LabelId;
            
            // Add to the IO count
            oController.iIOCount++;
			
		} catch( e1000 ) {
			jQuery.sap.log.error("Error: Extracting Task data!"); 
		}
		
		//--------------------------------------------------------//
		//-- 3.0 - Prepare for Ajax Request						--//
		//--------------------------------------------------------//
		//iUTS_Start				= IOMy.common.GetStartOfCurrentPeriod();
		iUTS_End				= IOMy.common.GetEndOfCurrentPeriod();
		
		

		//--------------------------------------------------------//
		//-- 4.0 - Check if Ajax Request should be run			--//
		//--------------------------------------------------------//
		IOMy.apiphp.AjaxRequest({
			"url": IOMy.apiphp.APILocation("mostrecent"),
			"data": {
				"Mode":     "MostRecentValue",
				"Id":       iIOId
			},
			"onSuccess": function ( sResponseType, aData ) {
				try {
					if( aData!==undefined && aData!==null) {
						if(aData.UTS!==undefined && aData.UTS!==null) {
							//-- If the UTS is less than 10 minutes from the endstamp --//
							//if(aData[0].UTS >= (iUTS_End-600) ) {
								//-- Update the Page --//
								
								var oUI5Object = oController.byId( sIOLabel );
								if( oUI5Object!==undefined && oUI5Object!==null && oUI5Object!==false ) {
									//----------------------------------------//
									//-- Round to 3 decimal places          --//
									//----------------------------------------//
									var fCalcedValue = ( Math.round( aData.Value * 1000 ) ) / 1000;
									
									//----------------------------------------//
									//-- Show the Results                   --//
									//----------------------------------------//
									oUI5Object.setText( fCalcedValue+" "+aData.UomName);
									
									
								} else {
									console.log("Critical Error: PHP API (Most Recent) OnSuccess can't find "+sIOLabel);
								}
							//} else {
								//-- Update the Page --//
							//	oController.byId( sIOLabel ).setText("IO Offline");
							//}
						} else {
							oController.byId( sIOLabel ).setText("IO Offline");
						}
					} else {
						oController.byId( sIOLabel ).setText("IO Offline");
					}
					
				} catch( e5678) {
					console.log( e5678.message );
				}
				
				//-- Update the Last Ajax Request Date --//
				oController.dLastAjaxUpdate	= Date();
				
				//-- Recursively check for more Tasks --//
				oController.RecursiveLoadAjaxData();
			},
			"onFail" : function (response) {
				IOMy.common.showError("There was an error retriving the value of IO "+iIOId);
				// Add to the IO Error count
				oController.iIOErrorCount++;
				
				//-- Recursively check for more Tasks --//
				oController.RecursiveLoadAjaxData();
			}
		});
	
	},
	
	
	
	GetDeviceIOTotaledValue: function ( aTask ) {
		//------------------------------------------------------------------------------------//
		//-- NOTE:	This is a special workaround for when the Device doesn't have the		--//
		//--		"Current kWh" but only the "Total kWh the device has ever seen"			--//
		//------------------------------------------------------------------------------------//
		
		//--------------------------------------------------------//
		//-- 1.0 - Initialise									--//
		//--------------------------------------------------------//
		var oController			= this;
		var iIOId			= 0;			//-- INTEGER:		The IO Id to poll the Data for 										--//
		var sIOLabel		= "";			//-- STRING:		This will hold the nickname of which odata url to poll for data			--//
		var sIOUoMName		= "";
		var iUTS_Start			= 0;			//-- INTEGER:		Used to hold the current period's starting Unix Timestamp				--//
		var iUTS_End			= 0;			//-- INTEGER:		Used to hold the current period's ending Unix Timestamp					--//
		
		//--------------------------------------------------------//
		//-- 2.0 - Check if Ajax Request should be run			--//
		//--------------------------------------------------------//
		try {
			iIOId			= aTask.Data.IOId;
			sIOLabel		= aTask.Data.LabelId;
			sIOUoMName		= aTask.Data.IOUoMName;
		} catch( e1000 ) {
			jQuery.sap.log.error("Error: Extracting Task data!"); 
		}
		
		//--------------------------------------------------------//
		//-- 3.0 - Prepare for Ajax Request						--//
		//--------------------------------------------------------//
		iUTS_Start				= IOMy.common.GetStartOfCurrentPeriod();
		iUTS_End				= IOMy.common.GetEndOfCurrentPeriod();
		
		//--------------------------------------------------------//
		//-- 4.0 - Check if Ajax Request should be run			--//
		//--------------------------------------------------------//
		
		//----------------------------//
		//-- 4.1 - Maximum Value	--//
		//----------------------------//
		IOMy.apiphp.AjaxRequest({
			"url": IOMy.apiphp.APILocation("aggregation"),
			"data": {
				"Id":		iIOId,
				"Mode":		"Max",
				"StartUTS":	iUTS_Start,
				"EndUTS":	iUTS_End
			},
			"onSuccess": function ( sResponseType, aMaxData ) {
				//----------------------------//
				//-- 4.2 - Minimum Value	--//
				//----------------------------//
				IOMy.apiphp.AjaxRequest({
					"url": IOMy.apiphp.APILocation("aggregation"),
					"data": {
						"Id":		iIOId,
						"Mode":		"Min",
						"StartUTS":	iUTS_Start,
						"EndUTS":	iUTS_End
					},
					"onSuccess": function ( sResponseType, aMinData ) {
						//--------------------------------------------------------------------//
						//-- STEP 3: Minimum Value											--//
						//-- Make a guess at the kWh (minus Minimum from Maximum value)		--//
						//--------------------------------------------------------------------//
						
						if( aMaxData.Value!==undefined && aMaxData.Value!==null ) {
							if( aMinData.Value!==undefined && aMinData.Value!==null ) {
								
								var iValue		= ( Math.round( (aMaxData.Value - aMinData.Value) * 1000) ) / 1000;
								var sUoM		= aMaxData.UOM_NAME;
								
								var oUI5Object = oController.byId( sIOLabel )
								if( oUI5Object!==undefined && oUI5Object!==null && oUI5Object!==false ) {
									if(aMaxData.UOM_NAME!==undefined && aMaxData.UOM_NAME!==null ) {
										
										
										oUI5Object.setText( iValue+" "+aMaxData.UOM_NAME );
									} else {
										oUI5Object.setText( iValue+" "+sIOUoMName );
									}
								} else {
									console.log("Critical Error: Odata OnSuccess can't find "+sIOLabel)
								}
								
								
							} else {
								//-- TODO: Write a better error message --//
								oController.byId( sIOLabel ).setText("IO Offline");
							}
						} else {
							//-- TODO: Write a better error message --//
							oController.byId( sIOLabel ).setText("IO Offline");
						}

						
						//-- Update the Last Ajax Request Date --//
						//me.aLastAjaxUpdatePerRoom["_"+me.roomID]	= Date();
						oController.dLastAjaxUpdate	= Date();
						
						//-- Recursively check for more Tasks --//
						oController.RecursiveLoadAjaxData();
					},
					"onFail": function (response) {
						oController.byId( sIOLabel ).setText("IO Offline");
						
						IOMy.common.showError("There was an error retriving the Totaled value");
						
						//-- Update the Last Ajax Request Date --//
						//me.aLastAjaxUpdatePerRoom["_"+me.roomID]	= Date();
						oController.dLastAjaxUpdate	= Date();
						
						//-- Recursively check for more Tasks --//
						oController.RecursiveLoadAjaxData();
					}
				});
				
			},
			"onFail": function (response) {
				IOMy.common.showError("There was an error retriving the Totaled value");
			}
		});
	}

	
	
});