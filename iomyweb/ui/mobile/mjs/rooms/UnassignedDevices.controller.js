/*
Title: Unassigned Devices UI5 Controller
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a list of all devices and their information not yet
    assigned a particular room in the premise, and controls to assign them to a
    chosen room.
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

sap.ui.controller("mjs.rooms.UnassignedDevices", {
	api: IOMy.apiphp,
	oData: IOMy.apiodata,
	functions : IOMy.functions,
	commmon : IOMy.common,
	
		
	//timerInterval		: null,
	aAjaxTasks:{ 
		"Low":						[],			//-- ARRAY:			Sub-array that is used to hold the list of slower ajax requests which can be left to last to be run.		--//
		"Mid":						[],			//-- ARRAY:			Sub-array that is used to hold the list of mid range ajax requests which can be left to lrun in between the high and low tasks.		--//
		"High":						[]			//-- ARRAY:			Sub-array that is used to hold the list of quick ajax requests that can be run before the slower tasks.		--//
	},											//-- ARRAY:			Used to store the list of Ajax tasks to execute to update the page. --//
	aUIGroupingData:				[],			//-- ARRAY:			Used to store the UI data
	aCheckBoxIDs:                   [],         //-- ARRAY:         Used to store the IDs for every checkbox that was created
	aPrefixes:                      [],         //-- ARRAY:         Used to store each prefix created
	aDeviceIDs:                     [],         //-- ARRAY:         Used to store each device ID
    
	iCachingSeconds:				300,		//-- INTEGER:		The Time in seconds of how long to cache the Page before it needs refreshing. (Hugely decreases the Server workload)	--//
	dLastAjaxUpdate:				null,		//-- DATE:			Stores the last time the page had the Ajax values updated.			--//
	iLastRoomId:					-100,		//-- INTEGER:		Stores the last RoomId so that if the RoomId changes the page will need to be redrawn.--//
	aCurrentRoomData:				{},			//-- ARRAY:			Used to store the current room data			--//
	aElementsToDestroy:				[],			//-- ARRAY:			Stores a list of Ids of UI5 Objects to destroy on Page Redraw		--//
	
	roomID:							null,
	
	//aUIGroupingDataPerRoom: {},
	//aLastAjaxUpdatePerRoom: {},
	
	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf mjs.rooms.UnassignedDevices
	*/
	onInit: function() {
		//----------------------------------------------------//
		//-- Declare Variables								--//
		//----------------------------------------------------//
		var me = this;
		var thisView = me.getView();

		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
                //----------------------------------------------------//
				//-- Refresh the Navigational buttons               --//
                //----------------------------------------------------//
				IOMy.common.NavigationRefreshButtons( me );
				
				//----------------------------------------------------//
				//-- Prepare for redrawing the page					--//
				//----------------------------------------------------//
				
				//-- Lookup the Current RoomId --//
				me.roomID = evt.data.room.RoomId;
				
				//-- Store the CurrentRoomData --//
				me.aCurrentRoomData = evt.data.room;
                
                //-- Set Room name as the title --//
                thisView.byId("NavSubHead_Title").setText(me.aCurrentRoomData.RoomName.toUpperCase());
				
				//-- IF no Ajax requests have been run from this page yet. --//
				if( me.dLastAjaxUpdate!==null ) {
					//-- IF the RoomIds have changed since last refresh. --//
					if( me.iLastRoomId===evt.data.room.RoomId ) {
						//-- IF enough time has elapsed. --//
						if( me.dLastAjaxUpdate > ( Date() - me.iCachingSeconds ) ) {
							//console.log("Room: Refreshing Cache!");
							//-- REFRESH AJAX DATA --//
							me.RefreshAjaxDataForUI();
							
							
						} else { 	//-- ELSE do nothing as the Cache is still recent. --//
							//console.log("Room: Cache still valid!");
						} 
						
					//-- ELSE the Room Id has changed so the page will need to be redrawn. --//
					} else {
						//console.log("Room: Room has changed!");
						
						me.DestroyCurrentDevices();
						me.InitialThingUISetup();
						me.RefreshAjaxDataForUI();
					}
				//-- ELSE do nothing as the page should be doing the "1st Run". --//
				} else {
					//console.log("Room: First run hasn't initialised!");
					
					//-- Run the 1st run tool --//
					me.InitialThingUISetup();
					//-- Update the Ajax Data for the UI --//
					me.RefreshAjaxDataForUI();
				}
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
	* @memberOf mjs.rooms.UnassignedDevices
	*/
	onBeforeRendering: function() {
		
	},
	
	//============================================================================================//
	//== DESTROY CURRENT DEVICES																==//
	//============================================================================================//
	DestroyCurrentDevices: function() {
		var me					= this;				//-- SCOPE:
		
		//-- Clear the List of tasks --//
		me.aAjaxTasks = { 
			"Low":	[],
			"Mid":	[],
			"High":	[]
		};
		
		//-- Destroy each element --//
		$.each( me.aElementsToDestroy, function( sIndex, sObjectId ) {
			try {
				me.byId( sObjectId ).destroy();
			} catch(e1) {
				console.log("Error DeletingObject: "+sObjectId);
			}
			
		});
		
		me.aElementsToDestroy = [];
	},

	//============================================================================================//
	//== INITIAL THING UI SETUP                                                                 ==//
	//============================================================================================//
	InitialThingUISetup: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables                     --//
		//----------------------------------------------------//
		var me                  = this;         //-- SCOPE:		--//
		var thisView            = me.getView(); //-- OBJECT:	--//
		
		var sDeviceGrouping     = "";           //-- INTEGER:	--//
		var iRowNumber          = 0;            //-- INTEGER:	Starts with zero as the 1st row then increments for every other row. This will help with the styling --//
		var aCurrentRoom        = {};           //-- ARRAY:		Stores the Current Room Data after it has been picked from the Premise List --//
		var sPKey               = "";           //-- STRING:	Holds the "Premise Id" based key in the "PremiseList" global array. --//
		var sRKey               = "";           //-- STRING:	Holds the "Rooms Id" based key in the "PremiseList" global array. --//
		var sGroupName          = "";           //-- STRING:	Holds the "UI Grouping Name" that will be used. --//
		var aDevice             = {};           //-- ARRAY:		--//
		
		//----------------------------------------------------//
		//-- 2.0 - ADD DEVICES INTO THE APPROPIATE GROUPING	--//
		//----------------------------------------------------//
		
		//-- Setup the Variables --//
		sPKey = "_"+me.aCurrentRoomData.PremiseId;
		sRKey = "Unassigned";
        //console.log(IOMy.common.RoomsList[sPKey][sRKey]);
        //console.log(sPKey)
		
		
		//-- Reset the UI Groupings --//
		//me.aUIGroupingDataPerRoom = {};
		me.aUIGroupingData = {};
		
		//-- Check if the Premise is accessable --//
		if(IOMy.common.RoomsList[sPKey]!==undefined) {
			//-- Check if the Room is accessable --//
			if( IOMy.common.RoomsList[sPKey][sRKey]!==undefined ) {
				//-- Foreach Thing in the UI RoomList --//
				$.each( IOMy.common.RoomsList[sPKey][sRKey].Things, function( sIndex, aDeviceKeys ) {
					
					//-- Check to make sure the Device is defined (Best to do this for each result from a foreach) --//
					if ( aDeviceKeys!==undefined ) {
						
						//-- Store the Device Data from the Device List --//
						aDevice = IOMy.common.ThingList["_"+aDeviceKeys.Thing];
						
						//-- Setup the UI Group Name --//
						sDeviceGrouping	= aDevice.TypeName;
						
						//--------------------------------------------//
						//-- If Grouping isn't setup yet			--//
						//--------------------------------------------//
						//if( me.aUIGroupingDataPerRoom[sDeviceGrouping]===undefined ) {
						if( me.aUIGroupingData[sDeviceGrouping]===undefined ) {
							//-- Define the Grouping --//
							//me.aUIGroupingDataPerRoom[sDeviceGrouping] = {
							me.aUIGroupingData[sDeviceGrouping] = {
								"Name":sDeviceGrouping,		//-- Display the name of the Grouping --//
								"Prefix":"Dev",				//-- Prefix to make object have a unique Id --//
								"Devices":[]				//-- Array to store the devices in the Grouping --//
							};
						}
						//console.log(me.aUIGroupingData[sDeviceGrouping]);
						//--------------------------------------------//
						//-- Add the Devices into the Grouping		--//
						//--------------------------------------------//
						//me.aUIGroupingDataPerRoom[sDeviceGrouping].Devices.push({
						me.aUIGroupingData[sDeviceGrouping].Devices.push({
							"DeviceId":			aDevice.Id,
							"DeviceName":		aDevice.DisplayName,
							"DeviceTypeId":		aDevice.TypeId,
							"DeviceTypeName":	aDevice.TypeName,
							"DeviceStatus":		aDevice.Status,
							"PermToggle":		aDevice.PermToggle,
							"IOs":              aDevice.IO,
							"RoomId":			aDevice.RoomId
						});
					}
				});
			} else {
				console.log("Room: Failure with looking the RoomKey");
			}
		} else {
			console.log("Room: Failure with the PremiseKey!");
		}
		
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
		//---------------------------------------------------------//
		//-- 3.0 - DRAW THE ROOM COMBO BOX AND THE UPDATE BUTTON --//
		//---------------------------------------------------------//
		
		var iUniqueId = 0;
        
        //-- Create Container --//
        var oVertBox = new sap.m.VBox({
            items: []
        }).addStyleClass("");
        
        //-- Create Unique Id --//
        me.aElementsToDestroy.push( "assignRoomNotice" );
        me.aElementsToDestroy.push( "assignRoomHBox" );
        
        // Apply the heading to the top of the area showing the room combo box
        // and assign button.
        var oHeading = new sap.m.HBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label( me.createId("assignRoomNotice"), {
                            text:		"Choose room to assign selected devices"
                        }).addStyleClass("width100Percent")
                    ]
                }).addStyleClass("MarLeft6px")
            ]
        }).addStyleClass("ConsistentMenuHeader");

        oVertBox.addItem(oHeading);
        
        //---------------------------------------------------------//
        // Create the widgets key to reassigning devices to a room.
        //---------------------------------------------------------//
        oVertBox.addItem(
            new sap.m.HBox(me.createId("assignRoomHBox"), {
                items : [
                    // Combo Box for a list of available rooms.
                    new sap.m.VBox({
                        items : [
                            IOMy.widgets.getRoomSelector(me.createId("Unassigned"), sPKey, sRKey).addStyleClass("width100Percent")
                        ]
                    }).addStyleClass("width100Percent MarTop12px MarBottom12px"),
                    
                    // Button to assign any selected devices to a chosen room.
                    new sap.m.VBox({
                        items : [
                            new sap.m.Link({
                                text : "Update",
                                enabled : me.byId("Unassigned").getEnabled(),
                                press : function () {
                                    // Lock the button while the function runs.
                                    this.setEnabled(false);

                                    // Retrive the ID and name of the selected room.
                                    var iRoomId = me.byId("Unassigned").getSelectedKey();
                                    var sRoomName = me.byId("Unassigned").getSelectedItem().getText();
                                    // Declare arrays of selected prefixes and errors.
                                    var aSelected = [];
                                    var aErrors = [];

                                    //===============================================================\\
                                    // Isolate which devices were selected and place them in a list. \\
                                    //===============================================================\\
                                    for (var i = 0; i < me.aCheckBoxIDs.length; i++) {
                                        if (me.byId(me.aCheckBoxIDs[i]).getSelected() === true)
                                            aSelected.push(me.aDeviceIDs[i]);
                                    }

                                    if (aSelected.length === 0) {
                                        jQuery.sap.log.error("Please select at least one device.");
                                        IOMy.common.showError("Please select at least one device.", "Error");
                                    } else {

                                        //===============================================================\\
                                        // Create a recursive anonymous function to assign each selected \\
                                        // device to the selected room.                                  \\
                                        //===============================================================\\
                                        var iPos = 0;
                                        me.AssignDeviceToRoom(iPos, aSelected, iRoomId, sRoomName, aErrors);
                                    }

                                    this.setEnabled(true);
                                }
                            }).addStyleClass("SettingsLinks width50Percent minwidth100px AcceptSubmitButton TextCenter")
                        ]
                    }).addStyleClass("TextCenter MarAll12px MarRight14px")
                ]
            })
        );
        
       //console.log(me.aUIGroupingData);
        
        //----------------------------------------------------//
		//-- 4.0 - DRAW THE UI FOR EACH DEVICE				--//
		//----------------------------------------------------//
        
		$.each( me.aUIGroupingData, function( sIndex, aGrouping ) {
			//-- Reset the Row number --//
			iRowNumber = 0;
			iUniqueId++;
			//----------------------------------------//
			//-- CREATE THE GROUPING CONTAINER		--//
			//----------------------------------------//
			
			//-- Create Unique Id --//
			var sTempName = "GC_"+iUniqueId+"_"+iRowNumber;
			me.aElementsToDestroy.push( sTempName );
			
			
            //-- Create Container --//
            var oVBox = new sap.m.VBox( me.createId(sTempName), {
                items: []
            }).addStyleClass("");
            
			//----------------------------------------//
			//-- GROUPING HEADING					--//
			//----------------------------------------//
			
			//-- Create Unique Id --//
			sTempName = "GH_"+iUniqueId+"_"+iRowNumber;
			me.aElementsToDestroy.push( sTempName );
			
			var oHeading = new sap.m.HBox({
                items : [
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label( me.createId(sTempName), {
                                text:		aGrouping.Name
                            }).addStyleClass("width100Percent")
                        ]
                    }).addStyleClass("MarLeft6px")
                ]
            }).addStyleClass("ConsistentMenuHeader");
			
			oVBox.addItem(oHeading);
			
			//----------------------------------------//
			//-- FOREACH DEVICE IN GROUPING			--//
			//----------------------------------------//
			
			//-- 3.1.3 - Draw the UI for each Device --//
			$.each( aGrouping.Devices, function( sIndex2, aDevice ) {
				
				//-- Create the Prefix --//
				var sPrefix = aGrouping.Prefix+"_"+aDevice.DeviceId;
                
                //-- Save the prefix --//
                me.aPrefixes.push(sPrefix);
                me.aDeviceIDs.push(aDevice.DeviceId);
				//-- Save the id of the new checkbox --//
                me.aCheckBoxIDs.push(sPrefix+"_Selected");
                
				//--  --//
				var oRowObject = me.GetCommonUIForUnassigned( sPrefix, aDevice );
				
				if( oRowObject!==null ) {
					oRowObject.addStyleClass("DeviceOverview-ItemContainerLight");
					
					//-- Increment the Row Number --//
					iRowNumber++;
					
					//-- Push the UI to the VBox Container --//
					oVBox.addItem( oRowObject );
					
					//-- Add the Object Names to the list of items to cleanup --//
					var aTemp1 = me.aElementsToDestroy;
					var aTemp2 = me.GetObjectIdList( sPrefix, me, aDevice );
					me.aElementsToDestroy = aTemp1.concat(aTemp2);
				}
			});
			
			oVBox.addStyleClass("MarTop3px");
            oVertBox.addItem(oVBox);
            
		}); //-- END FOREACH LOOP --//
		
        //-- Main Page Body --//
        if (me.byId("Panel") !== undefined)
            me.byId("Panel").destroy();

        var oPanel = new sap.m.Panel( me.createId("Panel"), {
           //-- Add Grouping box to Panel --//
           content: [oVertBox]
        }).addStyleClass("PanelNoPadding UserInputForm TableSideBorders");

        thisView.byId("page").addContent( oPanel );
		//-- Update the LastRoomId --//
		me.iLastRoomId = me.aCurrentRoomData.RoomId;
	},


	RefreshAjaxDataForUI: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables						--//
		//----------------------------------------------------//
		var me					= this;
		var thisView			= me.getView();
		
		//----------------------------------------------------//
		//-- 2.0 - Fetch a list of Ajax tasks				--//
		//----------------------------------------------------//
		//$.each( me.aUIGroupingDataPerRoom["_"+me.roomID], function( sIndex, aGrouping ) {
		$.each( me.aUIGroupingData, function( sIndex, aGrouping ) {
			//-- 3.1.3 - Draw the UI for each Device --//
			$.each( aGrouping.Devices, function( sIndex, aDevice ) {
				//-- Create the Prefix --//
				var sPrefix = aGrouping.Prefix+"_"+aDevice.DeviceId;
				
				//-- Add the Tasks to populate the UI --//
				var aNewTasks = me.GetCommonUITaskList( sPrefix, aDevice );
				//jQuery.sap.log.debug( JSON.stringify(aNewTasks) );
				
				//-- High Priority --//
				if( aNewTasks.High!==undefined && aNewTasks.High!==null ) {
					if( aNewTasks.High.length > 0 ) {
						me.aAjaxTasks.High.push.apply( me.aAjaxTasks.High, aNewTasks.High );
					}
				}
				//-- Low Priority --//
				if( aNewTasks.Low!==undefined && aNewTasks.Low!==null ) {
					if( aNewTasks.Low.length > 0 ) {
						me.aAjaxTasks.Low.push.apply( me.aAjaxTasks.Low, aNewTasks.Low );
					}
				}
			});
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Execute the Ajax Tasks					--//
		//----------------------------------------------------//
		//-- Invert the array so that the tasks that were added first will be the first to be fetched --//
		this.aAjaxTasks.High.reverse();
		this.aAjaxTasks.Low.reverse();
		
		//-- Load 2 recursive Ajax Tasks --//
		me.RecursiveLoadAjaxData();
		me.RecursiveLoadAjaxData();
		
		me.dLastAjaxUpdate = new Date();
		
	},
	
	//====================================================//
	//== RECURSIVE AJAX LOADER							==//
	//====================================================//
	RecursiveLoadAjaxData: function() {
		var me				= this;			//-- SCOPE:		Binds the scope for subfunctions					--//
		var aTask			= {};			//-- ARRAY:		This will hold a task that has being pulled from the task list --//

		//-- Check the Length of the array to see if there is any jobs to do --//
        try {
            if( this.aAjaxTasks.High.length > 0 ) {
                //-- Pull a task from the array --//
                aTask = this.aAjaxTasks.High.pop();
                me.RunAjaxTask(aTask);

            } else if( this.aAjaxTasks.Mid.length > 0 ) {
                //-- Pull a task from the array --//
                aTask = this.aAjaxTasks.Mid.pop();
                me.RunAjaxTask(aTask);

            } else {
                if( this.aAjaxTasks.Low.length > 0 ) {
                    //-- Pull a task from the array --//
                    aTask = this.aAjaxTasks.Low.pop();
                    me.RunAjaxTask(aTask);

                }
            }
        } catch (e) {
            jQuery.sap.log.error("There was an error running Ajax Tasks: "+e.message);
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
		var me = this;
		var iIOId			= 0;			//-- INTEGER:		The IO Id to poll the Data for 										--//
		var sIODataType		= "";			//-- STRING:		The IO's Datatype is stored so that we know what Odata URL to poll	--//
		var sIOLabel		= "";			//-- STRING:		This will hold the nickname of which odata url to poll for data			--//
		var iUTS_Start			= 0;			//-- INTEGER:		Used to hold the current period's starting Unix Timestamp				--//
		var iUTS_End			= 0;			//-- INTEGER:		Used to hold the current period's ending Unix Timestamp					--//
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
			
		} catch( e1000 ) {
			jQuery.sap.log.error("Error: Extracting Task data!"); 
		}
		
		//--------------------------------------------------------//
		//-- 3.0 - Prepare for Ajax Request						--//
		//--------------------------------------------------------//
		iUTS_Start				= IOMy.common.GetStartOfCurrentPeriod();
		iUTS_End				= IOMy.common.GetEndOfCurrentPeriod();
		
		//-- Store the Odata URL --//
		sAjaxUrl				= IOMy.apiodata.ODataLocation("data"+sIODataType);
		//-- Set the Columns --//
		aAjaxColumns			= ["CALCEDVALUE", "UTS", "UOM_NAME"];
		//-- Set the Where Clause --//
		aAjaxWhereClause = [
			"IO_PK eq "+iIOId, 
			"UTS gt "+iUTS_Start,
			"UTS le "+iUTS_End
		];
		//-- Set the Order by --//
		aAjaxOrderByClause = ["UTS desc"];
		
		//--------------------------------------------------------//
		//-- 4.0 - Check if Ajax Request should be run			--//
		//--------------------------------------------------------//
		IOMy.apiodata.AjaxRequest({
			"Url":				sAjaxUrl,
			"Limit":			1,
			"Columns":			["CALCEDVALUE", "UTS", "UOM_NAME"],
			"WhereClause":		aAjaxWhereClause,
			"OrderByClause":	aAjaxOrderByClause,
			"onSuccess":		function (sResponseType, aData) {
				
				try {
					if( aData!==undefined && aData!==null) {
						if( aData[0]!==undefined && aData[0]!==null) {
							if(aData[0].UTS!==undefined && aData[0].UTS!==null) {
								//-- If the UTS is less than 10 minutes from the endstamp --//
								//if(aData[0].UTS >= (iUTS_End-600) ) {
									//-- Update the Page --//
									
									var oUI5Object = me.byId( sIOLabel )
									if( oUI5Object!==undefined && oUI5Object!==null && oUI5Object!==false ) {
										
										oUI5Object.setText(aData[0].CALCEDVALUE+" "+aData[0].UOM_NAME);
									} else {
										console.log("Critical Error: Odata OnSuccess can't find "+sIOLabel)
									}
								//} else {
									//-- Update the Page --//
								//	me.byId( sIOLabel ).setText("IO Offline");
								//}
							} else {
								me.byId( sIOLabel ).setText("IO Offline");
							}
						} else {
							me.byId( sIOLabel ).setText("IO Offline");
						}
					} else {
						me.byId( sIOLabel ).setText("IO Offline");
					}
				} catch( e5678) {
					console.log( e5678.message );
				}
				
				//-- Update the Last Ajax Request Date --//
				me.dLastAjaxUpdate	= Date();
				//me.aLastAjaxUpdatePerRoom["_"+me.roomID]	= Date();
				
				//-- Recursively check for more Tasks --//
				me.RecursiveLoadAjaxData();
			},
			"onFail" : function (response) {
				IOMy.common.showError("There was an error retriving the value of IO "+iIOId);
				
				//-- Recursively check for more Tasks --//
				me.RecursiveLoadAjaxData();
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
		var me					= this;
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
								var iValue = aMaxData.Value - aMinData.Value;
								
								var sUoM = aMaxData.UOM_NAME;
								
								var oUI5Object = me.byId( sIOLabel )
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
								me.byId( sIOLabel ).setText("IO Offline");
							}
						} else {
							//-- TODO: Write a better error message --//
							me.byId( sIOLabel ).setText("IO Offline");
						}

						
						//-- Update the Last Ajax Request Date --//
						//me.aLastAjaxUpdatePerRoom["_"+me.roomID]	= Date();
						me.dLastAjaxUpdate	= Date();
						
						//-- Recursively check for more Tasks --//
						me.RecursiveLoadAjaxData();
					},
					"onFail": function (response) {
						me.byId( sIOLabel ).setText("IO Offline");
						
						IOMy.common.showError("There was an error retriving the Totaled value");
						
						//-- Update the Last Ajax Request Date --//
						//me.aLastAjaxUpdatePerRoom["_"+me.roomID]	= Date();
						me.dLastAjaxUpdate	= Date();
						
						//-- Recursively check for more Tasks --//
						me.RecursiveLoadAjaxData();
					}
				});
				
			},
			"onFail": function (response) {
				IOMy.common.showError("There was an error retriving the Totaled value");
			}
		});
	},
    
    AssignDeviceToRoom : function (iPos, aSelected, iRoomId, sRoomName, aErrors) {
        var me = this;
        var iLinkId = 0;
        
        try {
            var iId = aSelected[iPos];
            
            $.each( me.aDeviceIDs, function( iKey, iDevice ){
                if( iDevice===iId ) {
                    iLinkId = IOMy.common.ThingList['_'+iId].LinkId;
                    
                    me.api.AjaxRequest({
                        url : me.api.APILocation("link"),
                        data : {"Mode" : "ChooseRoom", "Id" : parseInt(iLinkId), "RoomId" : parseInt(iRoomId)},
        
                        //===============================================================\\
                        // If successful, run the onComplete function.                   \\
                        //===============================================================\\
                        onSuccess : function (type, data) {
                           //console.log(JSON.stringify(data));
                            this.onComplete();
                        },
    
                        onFail : function (error) {
                            aErrors.push({
                                "long"  : "There was an error assigning "+me.byId(aSelected[iPos]+"_Label").getText()+" to "+sRoomName,
                                "short" : me.byId(aSelected[iPos]+"_Label").getText()
                            });
                            jQuery.sap.log.error("Error: "+JSON.stringify(error));
        
                            this.onComplete();
                        },
        
                        onComplete : function () {
                            var aFailedDevices = []; // List of failed devices
        
                            if (iPos + 1 < aSelected.length) {
                                me.AssignDeviceToRoom(iPos, aSelected, iRoomId, sRoomName, aErrors);
                            } else {
                                me.aPrefixes = [];
                                me.aDeviceIDs = [];
                                me.aCheckBoxIDs = [];
        
                                //------------------------------------------------------//
                                // Check for errors
                                // 
                                // Check that it assigned at least some of the devices (number of errors should be less
                                // (preferably ZERO) than what was selected).
                                //------------------------------------------------------//
                                if (aErrors.length < aSelected.length) {
                                    //-----------------------------------------------------------------//
                                    // If all of the devices have been assigned, job done!
                                    //-----------------------------------------------------------------//
                                    if (aErrors.length === 0) {
                                        // Show a dialog and go to the previous page once the user closes the dialog.
                                        IOMy.common.showSuccess("All devices successfully assigned", "Success", 
                                        function () {
                                            //-- REFRESH ROOMS --//
                                            IOMy.common.RetreiveRoomList( {
                                                onSuccess: $.proxy(function() {
                                                    //-- REFRESH THINGS --//
                                                    IOMy.apiphp.RefreshThingList({
                                                        onSuccess: $.proxy(function() {
        
                                                            try {
                                                                me.dLastAjaxUpdate = new Date();
                                                                me.iLastRoomId = -100;
        
                                                                //-- Flag that the Core Variables have been configured --//
                                                                IOMy.common.CoreVariablesInitialised = true;
                                                                //-- Reset the Navigation array and index after switching users --//
                                                                IOMy.common.NavigationTriggerBackForward(false);
        
                                                            } catch(e654321) {
                                                                //-- ERROR:  TODO: Write a better error message--//
                                                                jQuery.sap.log.error(">>>>Critical Error Loading Room List.<<<<\n"+e654321.message);
                                                            }
                                                        }, me)
                                                    }); //-- END THINGS LIST --//
                                                }, me)
                                            }); //-- END ROOMS LIST --//
                                        }, "UpdateMessageBox");
        
                                    //-----------------------------------------------------------------//
                                    // Otherwise, show that some devices couldn't be assigned.
                                    //-----------------------------------------------------------------//
                                    } else {
                                        // Create the list of failed devices
                                        for (var i = 0; i < aErrors.length; i++) {
                                            aFailedDevices.push(aErrors[i].short);
                                        }
        
                                        IOMy.common.showWarning(aErrors.length+" devices couldn't be reassigned\n\n"+aFailedDevices.join("\n"), "Some devices assigned", 
                                        function () {
                                            //-- REFRESH ROOMS --//
                                            IOMy.common.RetreiveRoomList( {
                                                onSuccess: $.proxy(function() {
                                                    //-- REFRESH THINGS --//
                                                    IOMy.apiphp.RefreshIOList({
                                                        onSuccess: $.proxy(function() {
        
                                                            try {
                                                                me.dLastAjaxUpdate = new Date();
        
                                                                //-- Flag that the Core Variables have been configured --//
                                                                IOMy.common.CoreVariablesInitialised = true;
                                                                //-- Reset the Navigation array and index after switching users --//
                                                                IOMy.common.NavigationTriggerBackForward(false);
        
                                                            } catch(e654321) {
                                                                //-- ERROR:  TODO: Write a better error message--//
                                                                jQuery.sap.log.error(">>>>Critical Error Loading Room List.<<<<\n"+e654321.message);
                                                            }
                                                        }, me)
                                                    }); //-- END THINGS LIST --//
                                                }, me)
                                            }); //-- END ROOMS LIST --//
                                        }, "UpdateMessageBox");
                                    }
        
                                //------------------------------------------------------//
                                // All the devices couldn't be assigned (number of errors the same as the number of devices.
                                //------------------------------------------------------//
                                } else {
                                    IOMy.common.showWarning("All selected devices couldn't be reassigned", "Error", 
                                    function () {}, "");
                                }
                            }
                        }
                    });
                }
                
            });


        } catch (e) {
            jQuery.sap.log.error("Could not make the API request. Did you type in a valid name for the APILocation function?");
        }
    },
    
    Devices     : [],
    
    GetCommonUIForUnassigned: function( sPrefix, aDeviceData ) {
        try {
            //------------------------------------//
            //-- 1.0 - Initialise Variables		--//
            //------------------------------------//

            var me                  = this;                 //-- SCOPE:             --//
            var oUIObject			= null;					//-- OBJECT:			--//

            //------------------------------------//
            //-- 2.0 - Fetch UI					--//
            //------------------------------------//

            //-- TODO: These devices need to be in their own definition file --//
            if( aDeviceData.DeviceTypeId===2 ) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.zigbeesmartplug.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );
                
            //-- Philips Hue --//
            } else if( aDeviceData.DeviceTypeId===13 ) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.philipshue.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );
                
            //-- Onvif Camera --//
            } else if( aDeviceData.DeviceTypeId===12 ) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.onvif.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );
                
            //-- Motion Sensor --//
            } else if ( aDeviceData.DeviceTypeId===3) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.motionsensor.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );

            //-- Temperature Sensor --//
            } else if ( aDeviceData.DeviceTypeId===4) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.temperaturesensor.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );

            //-- DevelCo Energy Meter --//
            } else if ( aDeviceData.DeviceTypeId===10) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.develco.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );

            //-- Weather Feed --//
            } else if ( aDeviceData.DeviceTypeId===14) {
                var bUnassignedDevice = true;
                oUIObject = IOMy.devices.weatherfeed.GetCommonUI( sPrefix, me, aDeviceData, bUnassignedDevice );

            }


            //------------------------------------//
            //-- 9.0 - RETURN THE RESULTS		--//
            //------------------------------------//
            return oUIObject;
        } catch (error) {
            console.log(error.message);
        }
	},
    
    GetCommonUITaskList: function( Prefix, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		//-- TODO: These devices need to be in their own definition file --//
		if( aDeviceData.DeviceTypeId===2 ) {
			if( aDeviceData.IOs!==undefined ) {
				$.each(aDeviceData.IOs, function (sIndex, aIO) {
					if( aIO.RSTypeId===102 || aIO.RSTypeId===103 ) {
						aTasks.Low.push({
							"Type":"DeviceValueKWHTotal", 
							"Data":{ 
								"IOId":			aIO.Id, 
								"IODataType":	aIO.DataTypeName,
								"IOUoMName":	aIO.UoMName,
								"LabelId":			Prefix+"_kWh"
							}
						});
						//jQuery.sap.log.debug(aIO.UoMName);
					} else if( aIO.RSTypeId===2001 ) {
						aTasks.High.push({
							"Type":"DeviceValueKW", 
							"Data":{ 
								"IOId":			aIO.Id, 
								"IODataType":	aIO.DataTypeName,
								"LabelId":			Prefix+"_kW"
							}
						});
					
					} else if (aIO.RSTypeId === 2101) {
						//-- VOLT DATA --//
						aTasks.High.push({
							"Type":"DeviceValueVolt", 
							"Data":{ 
								"IOId":			aIO.Id, 
								"IODataType":	aIO.DataTypeName,
								"LabelId":			Prefix+"_Volt"
							}
						});
					} else if (aIO.RSTypeId === 2201) {
						//-- AMP DATA --//
						aTasks.High.push({
							"Type":"DeviceValueAmp", 
							"Data":{ 
								"IOId":			aIO.Id, 
								"IODataType":	aIO.DataTypeName,
								"LabelId":			Prefix+"_Amp"
							}
						});
					}
				});
			} else {
				//-- TODO: Write a error message --//
				jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
			}
		}
		return aTasks;
	},
	
	GetObjectIdList: function( sPrefix, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aObjectIdList = [];
		var me = this;
		
		//------------------------------------//
		//-- 2.0 - Fetch Definition names	--//
		//------------------------------------//
		
		//-- TODO: These devices need to be in their own definition file --//
		if( aDeviceData.DeviceTypeId===2 ) {
			
			aObjectIdList = [
				sPrefix+"_Container",
                sPrefix+"_Selected",
				sPrefix+"_Label",
				sPrefix+"_DataContainer",
				sPrefix+"_Volt",
				sPrefix+"_Amp",
				sPrefix+"_kW",
				sPrefix+"_kWh",
				sPrefix+"_StatusContainer",
				sPrefix+"_StatusToggle",
			];
			
		}
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return aObjectIdList;
	}
	
});