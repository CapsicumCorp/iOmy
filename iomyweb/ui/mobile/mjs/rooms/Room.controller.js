/*
Title: Room Overview UI5 Controller
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a list of all devices and their information in a given
    room.
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

sap.ui.controller("mjs.rooms.Room", {
	api: IOMy.apiphp,
	oData: IOMy.apiodata,
	functions : IOMy.functions,
	common : IOMy.common,
	
	/***********************************************************************************************************************
	** DECLARE THE CONTROLLER VARIABLES                                                                                   **
	************************************************************************************************************************/

	aAjaxTasks:{ 
		"Low":          [],         //-- ARRAY:         Sub-array that is used to hold the list of slower ajax requests which can be left to last to be run.                              --//
		"Mid":          [],         //-- ARRAY:         Sub-array that is used to hold the list of mid range ajax requests which can be left to run in between the high and low tasks.    --//
		"High":         []          //-- ARRAY:         Sub-array that is used to hold the list of quick ajax requests that can be run before the slower tasks.                           --//
	},                              //-- ARRAY:         Used to store the list of Ajax tasks to execute to update the page.                                                               --//
	aUIGroupingData:    [],         //-- ARRAY:         Used to store the UI Grouping data that is used to categorize the various "Devices"/"Things"                                      --//
	iCachingSeconds:    300,        //-- INTEGER:       The Time in seconds of how long to cache the Page before it needs refreshing. (Hugely decreases the Server workload)              --//
	dLastAjaxUpdate:    null,       //-- DATE:          Stores the last time the page had the Ajax values updated.                                                                        --//
	dLastDeviceUpdate:  null,       //-- DATE:          Stores the last time the page had the Ajax values updated.                                                                        --//
	iLastRoomId:        -100,       //-- INTEGER:       Stores the last RoomId so that if the RoomId changes the page will need to be redrawn.                                            --//
	aCurrentRoomData:   {},         //-- ARRAY:         Used to store the current room data                                                                                               --//
	aElementsToDestroy: [],         //-- ARRAY:         Stores a list of Ids of UI5 Objects to destroy on Page Redraw                                                                     --//
	
	roomID:							null,
	
	/***********************************************************************************************************************
	* Called when a controller is instantiated and its View controls (if available) are already created.                  **
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization. **
	* @memberOf mjs.rooms.Room                                                                                            **
	************************************************************************************************************************/
	onInit: function() {
		//----------------------------------------------------//
		//-- Declare Variables								--//
		//----------------------------------------------------//
		var me = this;
		var thisView = me.getView();

		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				//----------------------------------------------------//
				//-- Prepare for redrawing the page					--//
				//----------------------------------------------------//
				
				//-- Lookup the Current RoomId --//
				me.roomID = evt.data.room.RoomId;
				
				//-- Store the CurrentRoomData --//
				IOMy.common.RoomSelected = evt.data.room;
                
                //-- Set Room name as the title --//
                thisView.byId("NavSubHead_Title").setText( IOMy.common.RoomSelected.RoomName.toUpperCase() );
				
				//-- IF no Ajax requests have been run from this page yet. --//
				if( me.dLastAjaxUpdate!==null && me.dLastDeviceUpdate !== null) {
					//-- IF the RoomIds have changed since last refresh. --//
					if( me.iLastRoomId===evt.data.room.RoomId ) {
						if (me.common.ThingListLastUpdate !== me.dLastDeviceUpdate) {
                            me.DestroyCurrentDevices();
                            me.InitialThingUISetup();
                            me.RefreshAjaxDataForUI();
                            
                        //-- IF enough time has elapsed. --//
						} else if( me.dLastAjaxUpdate > ( Date() - me.iCachingSeconds ) ) {
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
					me.DestroyCurrentDevices();
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
	
	/***********************************************************************************************************************
	** Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered                  **
	** @memberOf mjs.rooms.Room                                                                                           **
	************************************************************************************************************************/
	onBeforeRendering: function() {
		
	},
	
	//============================================================================================//
	//== INITIAL THING UI SETUP                                                                 ==//
	//============================================================================================//
	//-- Description: This function is used to setup the UI objects on the page.                --//
	//--    Some UI objects get their Ids added to the list of itmes to be deleted so that when --//
	//--    the page needs to be redrawn they can be removed.                                   --//
	//--------------------------------------------------------------------------------------------//
	InitialThingUISetup: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables                     --//
		//----------------------------------------------------//
		var oController         = this;     //-- OBJECT:    Binds the current controller scope to a variable for subfunctions to access                          --//
		var thisView			= oController.getView();	//-- OBJECT:	--//
		
		var sDeviceGrouping     = "";       //-- STRING:    Stores the Device UI Grouping name                                                                   --//
		var iRowNumber          = 0;        //-- INTEGER:   Starts with zero as the 1st row then increments for every other row. This will help with the styling --//
		var aCurrentRoom        = {};       //-- ARRAY:     Stores the Current Room Data after it has been picked from the Premise List                          --//
		var sPKey               = "";       //-- STRING:    Holds the "Premise Id" based key in the "PremiseList" global array.                                  --//
		var sRKey               = "";       //-- STRING:    Holds the "Rooms Id" based key in the "PremiseList" global array.                                    --//
		var sGroupName          = "";       //-- STRING:    Holds the "UI Grouping Name" that will be used.                                                      --//
		var aDevice             = {};       //-- ARRAY:     Holds the "DeviceData" from the device list for the current device that is getting its UI Setup      --//
		
		//----------------------------------------------------//
		//-- 2.0 - ADD DEVICES INTO THE APPROPIATE GROUPING --//
		//----------------------------------------------------//
		
		//---------------------------//
		//-- Setup the Variables   --//
		//---------------------------//
		sPKey		= "_"+IOMy.common.RoomSelected.PremiseId;
		sRKey		= "_"+IOMy.common.RoomSelected.RoomId;
		
		oController.dLastDeviceUpdate = oController.common.ThingListLastUpdate;
		
		//-- Reset the UI Groupings --//
		oController.aUIGroupingData = {};
		
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
						//-- If Grouping isn't setup yet            --//
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
						//-- Add the Devices into the Grouping      --//
						//--------------------------------------------//
						//me.aUIGroupingDataPerRoom[sDeviceGrouping].Devices.push({
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
                            "PremiseId":		aDevice.PremiseId
						});
					}
				});
			} else {
				console.log("Room: Failure with looking the RoomKey");
			}
		} else {
			console.log("Room: Failure with the PremiseKey!");
		}
		
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
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label( oController.createId(sTempName), {
                                text:		aGrouping.Name
                            }).addStyleClass("width100Percent")
                        ]
                    }).addStyleClass("MarLeft6px")
                ]
            }).addStyleClass("ConsistentMenuHeader BorderBottom");
			
			oVBox.addItem(oHeading);
			
			//----------------------------------------//
			//-- FOREACH DEVICE IN GROUPING         --//
			//----------------------------------------//
			
			//-- 3.1.3 - Draw the UI for each Device --//
			$.each( aGrouping.Devices, function( sIndex2, aDevice ) {
				
				//-- Create the Prefix --//
				var sPrefix = aGrouping.Prefix+"_"+aDevice.DeviceId;
				
				//--  --//
				var oRowObject = IOMy.devices.GetCommonUI( sPrefix, oController, aDevice );
				
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
			
			oVBox.addStyleClass("");
            oVertBox.addItem(oVBox);
            
		}); //-- END FOREACH LOOP --//
		
        //-- Main Page Body --//
        if (oController.byId("Panel") !== undefined)
            oController.byId("Panel").destroy();

        var oPanel = new sap.m.Panel( oController.createId("Panel"), {
           //-- Add Grouping box to Panel --//
           backgroundDesign: "Transparent",
           content: [oVertBox]
        }).addStyleClass("PanelNoPadding UserInputForm TableSideBorders MarTop3px BorderTop");

        thisView.byId("page").addContent( oPanel );
		//-- Update the LastRoomId --//
		oController.iLastRoomId = IOMy.common.RoomSelected.RoomId;
        
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : oController.createId("extrasMenu"),        // Uses the page ID
                icon : "sap-icon://GoogleMaterial/more_vert",
                items : [
                    {
                        text: "Edit Room Information",
                        select:	function (oControlEvent) {
                            IOMy.common.NavigationChangePage("pSettingsRoomEdit", {room : IOMy.common.RoomSelected});
                        }
                    }
//                    {
//                        text: "Delete this Room",
//                        select:	function (oControlEvent) {
//                            var iSelected;
//
//                            // Find the Premise List item that has the ID of the currently selected premise.
//                            for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
//                                if (IOMy.common.PremiseList[i].Id == me.byId("premiseBox").getSelectedKey()) {
//                                    // Grab the correct list index.
//                                    iSelected = i;
//                                    break;
//                                }
//                            }
//
//                            IOMy.common.NavigationChangePage( "pSettingsPremise", {premise : IOMy.common.PremiseList[iSelected]} );
//                        }
//                    }
                ]
            })
        );
	},

	//============================================================================================//
	//== DESTROY CURRENT DEVICES                                                                ==//
	//============================================================================================//
	//-- Description: This function is used to clear the list of ajax tasks that still need to  --//
	//--    be run and remove any UI Element from the page that is in the list of Elements to   --//
	//--    destroy.                                                                            --//
	//--------------------------------------------------------------------------------------------//
	DestroyCurrentDevices: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables                     --//
		//----------------------------------------------------//
		var oController         = this;          //-- OBJECT:    Binds the current Controller scope to a variable for use in sub-functions (eg. "$.each")   --//
		
		//----------------------------------------------------//
		//-- 2.0 - Clear the List of tasks                  --//
		//----------------------------------------------------//
		oController.aAjaxTasks = { 
			"Low":    [],
			"Mid":    [],
			"High":   []
		}
		
		//----------------------------------------------------//
		//-- 4.0 - Destroy each UI Element                  --//
		//----------------------------------------------------//
		$.each( oController.aElementsToDestroy, function( sIndex, sObjectId ) {
			try {
				oController.byId( sObjectId ).destroy();
			} catch(e1) {
				console.log("Error DeletingObject: "+sObjectId);
			}
			
		});
		
		//----------------------------------------------------//
		//-- 5.0 - Clear the list of UI Elements to destroy --//
		//----------------------------------------------------//
		oController.aElementsToDestroy = [];
	},
	
	//============================================================================================//
	//== REFRESH AJAX DATA FOR UI                                                               ==//
	//============================================================================================//
	//-- Description: This function is used to setup the list of Ajax "Tasks" that needs to be  --//
	//--    in order to refresh the values on the page then launches the function twice to      --//
	//--    begin executing the tasks.                                                          --//
	//--------------------------------------------------------------------------------------------//
	RefreshAjaxDataForUI: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables                     --//
		//----------------------------------------------------//
		var oController			= this;
		
		//----------------------------------------------------//
		//-- 2.0 - Fetch a list of Ajax tasks               --//
		//----------------------------------------------------//
		$.each( oController.aUIGroupingData, function( sIndex, aGrouping ) {
			//-- 3.1.3 - Draw the UI for each Device --//
			$.each( aGrouping.Devices, function( sIndex, aDevice ) {
				//-- Create the Prefix --//
				var sPrefix = aGrouping.Prefix+"_"+aDevice.DeviceId;
				
				//-- Add the Tasks to populate the UI --//
				var aNewTasks = IOMy.devices.GetCommonUITaskList( sPrefix, oController, aDevice );
				//jQuery.sap.log.debug( JSON.stringify(aNewTasks) );
				
				//-- High Priority --//
				if( aNewTasks.High!==undefined && aNewTasks.High!==null ) {
					if( aNewTasks.High.length > 0 ) {
						oController.aAjaxTasks.High.push.apply( oController.aAjaxTasks.High, aNewTasks.High );
					}
				}
				//-- Mid Priority --//
				if( aNewTasks.Mid!==undefined && aNewTasks.Mid!==null ) {
					if( aNewTasks.Mid.length > 0 ) {
						oController.aAjaxTasks.Mid.push.apply( oController.aAjaxTasks.Mid, aNewTasks.Mid );
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
		//-- 3.0 - Execute the Ajax Tasks                   --//
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
	
	//============================================================================================//
	//== RECURSIVE AJAX LOADER                                                                  ==//
	//============================================================================================//
	//-- Description: This function is used to keep loading tasks from the "AjaxTasks" List     --//
	//--    based upon what priority they are set at (High, Mid, Low). The functions that this  --//
	//--    function triggers will all call this function when they finish until there is no    --//
	//--    more tasks to load.                                                                 --//
	//--------------------------------------------------------------------------------------------//
	RecursiveLoadAjaxData: function() {
		//----------------------------------------------------//
		//-- 1.0 - Initialise Variables                     --//
		//----------------------------------------------------//
		var oController     = this;   //-- SCOPE:     Binds the current controller scope for subfunctions                --//
		var aTask           = {};     //-- ARRAY:     This will hold a task that has being pulled from the task list     --//
		
		
		//---------------------------------------------------------------------//
		//-- Check the Length of the array to see if there is any jobs to do --//
		//---------------------------------------------------------------------//
		if( oController.aAjaxTasks.High.length > 0 ) {
			//-- Pull a task from the array --//
			aTask = oController.aAjaxTasks.High.pop();
			oController.RunAjaxTask(aTask);
			
		} else if( oController.aAjaxTasks.Mid.length > 0 ) {
			//-- Pull a task from the array --//
			aTask = oController.aAjaxTasks.Mid.pop();
			oController.RunAjaxTask(aTask);
				
		} else if( oController.aAjaxTasks.Low.length > 0 ) {
			//-- Pull a task from the array --//
			aTask = oController.aAjaxTasks.Low.pop();
			oController.RunAjaxTask(aTask);
		}
	},
	
	//============================================================================================//
	//== RUN AJAX TASK                                                                          ==//
	//============================================================================================//
	//-- Description: This function is used to work out which function should be used to make   --//
	//--    the correct Ajax requests to either the "OData" or "PHP" APIs (sometimes more than  --//
	//--    one Ajax request is called) and then calculate the correct value to display.        --//
	//--------------------------------------------------------------------------------------------//
	RunAjaxTask: function( aTask ) {
		//--------------------------------------------------------//
		//-- 1.0 - Initialise Variables                         --//
		//--------------------------------------------------------//
		
		
		
		
		//--------------------------------------------------------//
		//-- 3.0 - Call the appropiate function for the Task    --//
		//--------------------------------------------------------//
		switch( aTask.Type ) {
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
				return false;
			
		}
		
		//--------------------------------------------------------//
		//-- 9.0 - Return true                                  --//
		//--------------------------------------------------------//
		return true;
	},
	
	
	//============================================================================================//
	//== AJAX GET MOST RECENT VALUE                                                             ==//
	//============================================================================================//
	//-- Description: This function makes an Ajax request to the appropiate Odata Service to    --//
	//--    fetch the most recent value from the Database then sets the value returned to the   --//
	//--    appropiate UI5 Object.                                                              --//
	//--------------------------------------------------------------------------------------------//
	GetDeviceIORecentValue: function ( aTask ) {
		//--------------------------------------------------------//
		//-- 1.0 - Initialise                                   --//
		//--------------------------------------------------------//
		var oController         = this;     //-- OBJECT:        Binds the current Controller's scope to a variable for sub-functions to access    --//
		var iIOId           = 0;        //-- INTEGER:       The IO Id to poll the Data for                                                --//
		var sIODataType     = "";       //-- STRING:        The IO's Datatype is stored so that we know what Odata URL to poll            --//
		var sIOLabel        = "";       //-- STRING:        This will hold the nickname of which odata url to poll for data                   --//
		var iUTS_Start          = 0;        //-- INTEGER:       Used to hold the current period's starting Unix Timestamp                         --//
		var iUTS_End            = 0;        //-- INTEGER:       Used to hold the current period's ending Unix Timestamp                           --//
		var sAjaxUrl            = "";       //-- STRING:        Used to hold the the URL to the API called.                                       --//
		var aAjaxColumns        = [];       //-- ARRAY:         Used to hold an array of "Columns" that the Odata API will return values for.     --//
		var aAjaxWhereClause    = [];       //-- ARRAY:         Used to hold an array of "Where" conditions that are passed to the Odata API.     --//
		var aAjaxOrderByClause  = [];       //-- ARRAY:         Used to hold an array of "Order By" arrangment that is passed to the Odata API.   --//
		
		//--------------------------------------------------------//
		//-- 2.0 - Extract the variables from the Task Data     --//
		//--------------------------------------------------------//
		try {
			iIOId           = aTask.Data.IOId;
			sIODataType     = aTask.Data.IODataType;
			sIOLabel        = aTask.Data.LabelId;
			
		} catch( e1000 ) {
			jQuery.sap.log.error("Error: Extracting Task data!"); 
		}
		
		//--------------------------------------------------------//
		//-- 3.0 - Prepare for Ajax Request                     --//
		//--------------------------------------------------------//
		iUTS_End                = IOMy.time.GetCurrentUTS();
		iUTS_Start              = 0;//IOMy.time.GetStartStampForTimePeriod( "day", iUTS_End);
		
		//-- Store the Odata URL --//
		sAjaxUrl                = IOMy.apiodata.ODataLocation("data"+sIODataType);
		//-- Set the Columns --//
		aAjaxColumns            = ["CALCEDVALUE", "UTS", "UOM_NAME"];
		//-- Set the Where Clause --//
		aAjaxWhereClause = [
			"IO_PK eq "+iIOId, 
			"UTS gt "+iUTS_Start,
			"UTS le "+iUTS_End
		];
		//-- Set the Order by --//
		aAjaxOrderByClause = ["UTS desc"];
		
		//--------------------------------------------------------//
		//-- 4.0 - Check if Ajax Request should be run          --//
		//--------------------------------------------------------//
		IOMy.apiodata.AjaxRequest({
			"Url":              sAjaxUrl,
			"Limit":            1,
			"Columns":          ["CALCEDVALUE", "UTS", "UOM_NAME"],
			"WhereClause":      aAjaxWhereClause,
			"OrderByClause":    aAjaxOrderByClause,
			"onSuccess":        function (sResponseType, aData) {
				
				try {
					if( aData!==undefined && aData!==null) {
						if( aData[0]!==undefined && aData[0]!==null) {
							if(aData[0].UTS!==undefined && aData[0].UTS!==null) {
								//-- If the UTS is less than 10 minutes from the endstamp --//
								
								//-- Check if the dates are valid --//
								if( aData[0].UTS>=iUTS_Start && aData[0].UTS<=iUTS_End ) {
									
									//-- Update the Page --//
									var oUI5Object = oController.byId( sIOLabel );
									
									if( oUI5Object!==undefined && oUI5Object!==null && oUI5Object!==false ) {
										//----------------------------------------//
										//-- Round to 3 decimal places          --//
										//----------------------------------------//
										var fCalcedValue = ( Math.round( aData[0].CALCEDVALUE * 1000 ) ) / 1000;
										
										//----------------------------------------//
										//-- Show the Results                   --//
										//----------------------------------------//
										oUI5Object.setText( fCalcedValue+" "+aData[0].UOM_NAME);
										
										
									} else {
										console.log("Critical Error: Odata OnSuccess can't find "+sIOLabel)
									}
								} else {
									//-- Update the Page --//
									oController.byId( sIOLabel ).setText("IO Offline");
								}
							} else {
								oController.byId( sIOLabel ).setText("IO Offline");
							}
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
				
				//-- Recursively check for more Tasks --//
				oController.RecursiveLoadAjaxData();
			}
		});
	},
	
	
	//============================================================================================//
	//== AJAX CALCULATE THE NORMAL VALUE FROM THE TOTALED VALUE                                 ==//
	//============================================================================================//
	//-- Description: This function makes an Ajax request to the appropiate Odata Service to    --//
	//--    fetch the most recent value from the Database then sets the value returned to the   --//
	//--    appropiate UI5 Object.                                                              --//
	//--------------------------------------------------------------------------------------------//
	
	GetDeviceIOTotaledValue: function ( aTask ) {
		//------------------------------------------------------------------------------------//
		//-- NOTE:  This is a special workaround for when the Device doesn't have the       --//
		//--        "Current kWh" but only the "Total kWh the device has ever seen"         --//
		//------------------------------------------------------------------------------------//
		
		//--------------------------------------------------------//
		//-- 1.0 - Initialise                                   --//
		//--------------------------------------------------------//
		var oController         = this;         //-- OBJECT:        Binds the controller scope to a variable so sub-functions can access it --//
		var iIOId           = 0;            //-- INTEGER:       The IO Id to poll the Data for                                      --//
		var sIOLabel        = "";           //-- STRING:        This will hold the nickname of which odata url to poll for data         --//
		var sIOUoMName      = "";           //-- STRING:        This holds the UoM to be displayed on the Page                          --//
		var iUTS_Start          = 0;            //-- INTEGER:       Used to hold the current period's starting Unix Timestamp               --//
		var iUTS_End            = 0;            //-- INTEGER:       Used to hold the current period's ending Unix Timestamp                 --//
		
		//--------------------------------------------------------//
		//-- 2.0 - Check if Ajax Request should be run          --//
		//--------------------------------------------------------//
		try {
			iIOId           = aTask.Data.IOId;
			sIOLabel        = aTask.Data.LabelId;
			sIOUoMName      = aTask.Data.IOUoMName;
		} catch( e1000 ) {
			jQuery.sap.log.error("Error: Extracting Task data!"); 
		}
		
		//--------------------------------------------------------//
		//-- 3.0 - Prepare for Ajax Request                     --//
		//--------------------------------------------------------//
		iUTS_End                = IOMy.time.GetCurrentUTS();
		iUTS_Start              = IOMy.time.GetStartStampForTimePeriod( "day", iUTS_End);
		
		//--------------------------------------------------------//
		//-- 4.0 - Check if Ajax Request should be run          --//
		//--------------------------------------------------------//
		
		//----------------------------//
		//-- 4.1 - Maximum Value    --//
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
				//-- 4.2 - Minimum Value    --//
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
						//-- 4.3: Calculate the real value                                  --//
						//-- Make a guess at the kWh (minus Minimum from Maximum value)     --//
						//--------------------------------------------------------------------//
						
						if( aMaxData.Value!==undefined && aMaxData.Value!==null ) {
							if( aMinData.Value!==undefined && aMinData.Value!==null ) {
								
								var iValue      = ( Math.round( (aMaxData.Value - aMinData.Value) * 1000) ) / 1000;
								var sUoM        = aMaxData.UOM_NAME;
								
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
						oController.dLastAjaxUpdate  = Date();
						
						//-- Recursively check for more Tasks --//
						oController.RecursiveLoadAjaxData();
					},
					"onFail": function (response) {
						oController.byId( sIOLabel ).setText("IO Offline");
						
						IOMy.common.showError("There was an error retriving the Totaled value");
						
						//-- Update the Last Ajax Request Date --//
						oController.dLastAjaxUpdate	= Date();
						
						//-- Recursively check for more Tasks --//
						oController.RecursiveLoadAjaxData();
					}
				});
				
			},
			"onFail": function (response) {
				IOMy.common.showError("There was an error retriving the Totaled value");
				//-- Update the Last Ajax Request Date --//
				oController.dLastAjaxUpdate	= Date();
				//-- Recursively check for more Tasks --//
				oController.RecursiveLoadAjaxData();
			}
		});
	}

	
	
});