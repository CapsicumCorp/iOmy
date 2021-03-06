/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
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

sap.ui.controller("pages.device.IOTiles", {
	
	//----------------------------------------------------//
	//-- DECLARE VARIABLES                              --//
	//----------------------------------------------------//
	aElementsToDestroy:     [],				//-- ARRAY:			Stores a list of Ids of UI5 Objects to destroy on Page Redraw		--//
	aTiles:                 [],				//-- ARRAY:			This is used to hold the Tile Data that is used to configure the menu that controlls it.	--//
	iCurrentThing:          0,				//-- INTEGER:		Stores the current ThingId that this page is setup for.		--//
    sCurrentThingName:              "",             //-- STRING:        Stores the current thing's name.    --//
	dLastThingListUpdate:   null,			//-- DATE:			Stores the last time the page had the Thing List Ajax values updated.			--//
	dUIThingLastUpdate:     null,			//-- DATE:			Stores the last time the page had the individual Thing updated.			--//
	iCurrentThingState:		0,				//-- INTEGER:		--//
	iSelectedIOId:			0,
	sSelectedTimePeriod:	iomy.graph_jqplot.PeriodDay,
	
	bAnalyticsTabSelected:			false,
	bPeriodTabSelected:				false,
	bFilterTabSelected:				false,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		
		
		
		
		oView.addEventDelegate({
			onBeforeShow : function ( oEvent ) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				//-- iomy.common.NavigationRefreshButtons( me ); --//
				
				//-- Defines the Device Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
				
				//------------------------------------------------------------//
				//-- 2.1 - INITIALISE ONBEFORESHOW VARIABLES                --//
				//------------------------------------------------------------//
				var bRedrawPageNeeded           = false;
				var iTempThingId                = 0;
				var iTempIOId                   = 0;
				
				
				
				//------------------------------------------------------------//
				//-- 2.3 - CHECK IF PAGE NEEDS TO BE REDRAWN                --//
				//------------------------------------------------------------//
				try {
					if( !!oEvent.data.ThingId ) {
						if( oController.iCurrentThing!==oEvent.data.ThingId ) {
							//-- Set redraw to true --//
							bRedrawPageNeeded = true;
							
						} else if( oController.dLastThingListUpdate === null ) {
							//-- Set redraw to true --//
							bRedrawPageNeeded = true;
							
						} else if( oController.dLastThingListUpdate!==iomy.common.ThingListLastUpdate ) {
							//-- Set redraw to true --//
							bRedrawPageNeeded = true;
							
						} else if( oController.dUIThingLastUpdate===null ) {
							//-- Set redraw to true --//
							bRedrawPageNeeded = true;
						
						} else if( oController.dUIThingLastUpdate!==iomy.common.ThingList['_'+oEvent.data.ThingId].UILastUpdate ) {
							//-- Set redraw to true --//
							bRedrawPageNeeded = true;
							
						} else if( oController.iCurrentThingState!==iomy.common.ThingList['_'+oEvent.data.ThingId].Status ) {
							//-- Set redraw to true --//
							bRedrawPageNeeded = true;
							
						} else {
                            //-- Check to see if the item/device name has been changed. --//
                            if (iomy.common.bItemNameChangedMustRefresh === true) {
                                //-- Reset the refresh flag --//
                                iomy.common.bItemNameChangedMustRefresh = false;
                                //-- Set redraw to true --//
                                bRedrawPageNeeded = true;
                            }
                        }
					}
				} catch(e0001) {
					console.log("Device Data Page Error: Did not get passed the correct values to initialise the page! "+e0001.message);
					//console.log( JSON.stringify(oEvent.data) );
				}
				
				
				//------------------------------------------------------------//
				//-- 2.4 - IF PAGE NEEDS TO BE REDRAWN                      --//
				//------------------------------------------------------------//
				if( bRedrawPageNeeded===true ) {
					try {
						//console.log(JSON.stringify(iomy.common.ThingList['_'+oEvent.data.ThingId]));
						//----------------------------------------------------------------------------//
						//-- 2.4.1 - IF THE DEVICE IS ACCESSIBLE                                    --//
						//----------------------------------------------------------------------------//
						if( !!iomy.common.ThingList['_'+oEvent.data.ThingId] ) {
                            //----------------------------------------------------------------------------//
                            //-- 2.4.1.1 - Set the title if it hasn't already been created              --//
                            //----------------------------------------------------------------------------//
//                            if (oController.byId("NavSubHead_Title") !== undefined) {
//                                oController.byId("NavSubHead_Title").setText(iomy.common.ThingList['_'+oEvent.data.ThingId].DisplayName.toUpperCase());
//                            }

							//----------------------------------------------------------------------------//
							//-- 2.4.1.2 - Store the Current Event Variables and Set The Page Title     --//
							//----------------------------------------------------------------------------//
							oController.iCurrentThing = iomy.common.ThingList['_'+oEvent.data.ThingId].Id;
							oController.sCurrentThingName = iomy.common.ThingList['_'+oEvent.data.ThingId].DisplayName;
							
							oController.iCurrentThingState = iomy.common.ThingList['_'+oEvent.data.ThingId].Status;
                            
                            oView.byId("ToolbarTitle").setText( oController.sCurrentThingName );
							
							//----------------------------------------------------------------------------//
							//-- 2.4.1.3 - Destroy the specific Tile related objects of this page       --//
							//----------------------------------------------------------------------------//
							oController.DestroyCurrentTiles();
							
							//----------------------------------------------------------------------------//
							//-- 2.4.1.4 - Reset the 'TileData' controller variable                     --//
							//----------------------------------------------------------------------------//
							oController.aTiles = [];
							
							//----------------------------------------------------------------------------//
							//-- 2.4.1.5 - Populate 'Tile Data' controller variable with the new values --//
							//----------------------------------------------------------------------------//
							oController.InitialiseTileData();
							
							//----------------------------------------------------------------------------//
							//-- 2.4.1.6 - Draw the new Tiles on the page                               --//
							//----------------------------------------------------------------------------//
							oController.DrawConfiguredTilesOnThePage();
							
						} else {
							console.log("Device Data Page - Critical Error: Can not access the Device's Data!");
						}
						
						//----------------------------------------------------------------------------//
						//-- 2.4.2 - UPDATE WHEN THE DEVICE LIST WAS LAST UPDATE                    --//
						//----------------------------------------------------------------------------//
						oController.dLastThingListUpdate = iomy.common.ThingListLastUpdate;
						oController.dUIThingLastUpdate   = iomy.common.ThingList['_'+oEvent.data.ThingId].UILastUpdate;
						
					} catch( e1000 ) {
						jQuery.sap.log.error("Device Data Page - Critical Error Occurred! "+e1000.message);
					}
				}
			}
		});
	},
	
	//====================================================================================================================//
	//== INITIALISE TILE DATA                                                                                           ==//
	//====================================================================================================================//
	InitialiseTileData: function() {
		//------------------------------------------------------------------------//
		//-- DESCRIPTION: 														--//
		//--																	--//
		//------------------------------------------------------------------------//
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var oController         = this;         //-- SCOPE:         Binds the current controller's scope to a variable for sub-functions to call --//
		var aIOList             = [];           //-- ARRAY:         Holds the list of IOs of the Thing for use in populating the TileData Array --//
		
		var aTempTileData       = {};           //-- ARRAY:         --//
		var iIOId               = 0;            //-- INTEGER:       --//
		var sIOName				= ""			//-- STRING:        --//
		var iCurrentThing       = 0;            //-- INTEGER:       --//
		var sTemp               = "";           //-- STRING:        --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - FETCH THE "THING" DATA                               --//
		//----------------------------------------------------------------//
		aIOList = iomy.common.ThingList['_'+oController.iCurrentThing].IO;
		
		
		//----------------------------------------------------------------//
		//-- 4.0 - IF STATE IS TOGGLEABLE                               --//
		//----------------------------------------------------------------//
		try {
			//-- If the User has "Toggle" Permission --//
			if( iomy.common.ThingList['_'+oController.iCurrentThing].PermToggle===1 ) {
				//------------------------------------//
				//-- SET TILE VALUE                 --//
				//------------------------------------//
				
				//-- IF it is on --//
				if( iomy.common.ThingList['_'+oController.iCurrentThing].Status===1 ) {
					sTemp = "On";
					
				//-- ELSE assume that it is off --//
				} else {
					sTemp = "Off";
				}
				
				//------------------------------------//
				//-- CREATE THE TILE DATA           --//
				//------------------------------------//
				aTempTileData = {
					"Type":         "ThingStateToggle",
					"Data":         {
						"ThingId":          oController.iCurrentThing,
						"ThingName":        iomy.common.ThingList['_'+oController.iCurrentThing].DisplayName,
						"CurrentVals": {
							"iValue":       iomy.common.ThingList['_'+oController.iCurrentThing].Status,
							"sValue":       sTemp
						}
					},
					"Fragment":     false
				};
				//----------------------------------------------------//
				//-- ADD TO THE GLOBALS                             --//
				//----------------------------------------------------//
				oController.aTiles.push( aTempTileData );
			}
		} catch( e200) {
			console.log( e200.message );
		}
		
		
		//----------------------------------------------------------------//
		//-- 5.0 - ADD THE SENSOR TILES                                 --//
		//----------------------------------------------------------------//
		$.each( aIOList, function( sIndex, aIOData ) {
			try {
				//------------------------------------------------------------//
				//--  --//
				//------------------------------------------------------------//
				iIOId           = aIOData.Id;
				sIOName         = iomy.common.ThingList['_'+oController.iCurrentThing].IO['_'+iIOId].Name;
				//------------------------------------------------------------//
				//-- IF IO DATA IS NOT AN ENUMERATION                       --//
				//------------------------------------------------------------//
				if( aIOData.DataTypeEnum===0 ) {
					//------------------------------------------------------------//
					//-- IF THE RESOURCE TYPE IS COMMONLY USED FOR SUMMING      --//
					//------------------------------------------------------------//
					if( aIOData.RSSubCatType===1 || aIOData.RSSubCatType===2 || aIOData.RSSubCatType===3 ) {
						//------------------------------------//
						//-- CREATE THE TILE DATA           --//
						//------------------------------------//
						
						//-- NOTE: This is commented out temporarily until we go back to using 4 IO values --//
/*
						aTempTileData = {
							"Data":		{
								"ThingId":				oController.iCurrentThing,
								"IOId":				iIOId,
								"IOName":			iomy.common.ThingList['_'+oController.iCurrentThing].IO['_'+iIOId].Name,
								"APIData": {
									"Type":				"TotalableNormal"
								},
								"TileName":				"TileIO-1",
								"FragmentName":			"",
								"EnabledButtons": {
									"TimeRB":[
										"NormalTimePeriods"
									],
									"FilterRB":[
										"TotalableNormal"
									]
								},
								"TempVals": {
									"TimeRB":			null,
									"FilterRB":			null
								},
								"CurrentVals": {
									"TimeRB":			null,
									"FilterRB":			null,
									"TimeCustomStart":	null,
									"TimeCustomEnd":	null
								}
							},
							"Fragment":	false
						}
						
						//----------------------------------------------------//
						//-- APPEND TO THE CONTROLLERS TILE DATA VARIABLE   --//
						//----------------------------------------------------//
						oController.aTiles.push( aTempTileData );
*/
						
					//------------------------------------------------------------//
					//-- ELSE ASSUME THE IO ISN'T USED FOR SUMMING              --//
					//------------------------------------------------------------//
					} else {
						//------------------------------------//
						//-- CREATE THE TILE DATA           --//
						//------------------------------------//
						aTempTileData = {
							"Type":		"IO",
							"Data":		{
								"ThingId":			oController.iCurrentThing,
								"IOId":				iIOId,
								"IOName":			sIOName,
								"APIData": {
									"Type":				"NormalNonTotalable"
								},
								"TileName":				"TileIO-"+iIOId,
								"FragmentName":			"",
								"EnabledButtons": {
									"TimeRB": [
										"MostRecent",
										"NormalTimePeriods"
									],
									"FilterRB": [
										"NormalNonTotalable"
									]
								},
								"TempVals": {
									"TimeRB":			"CurV",
									"FilterRB":			"CurV"
								}, 
								"CurrentVals": {
									"TimeRB":			"CurV",
									"FilterRB":			"CurV",
									"TimeCustomStart":	null,
									"TimeCustomEnd":	null
								}
							},
							"Fragment":	false
						};
						//----------------------------------------------------//
						//-- ADD TO THE GLOBALS                             --//
						//----------------------------------------------------//
						oController.aTiles.push( aTempTileData );
						
						
					}
				//------------------------------------------------------------//
				//-- CHECK FOR SPECIAL TYPE OF TOTALED ENUMERATION          --//
				//------------------------------------------------------------//
				} else if( aIOData.DataTypeEnum===2 ) {
					//------------------------------------------------------------//
					//-- IF THE RESOURCE TYPE IS COMMONLY USED FOR SUMMING      --//
					//------------------------------------------------------------//
					if( aIOData.RSSubCatType===1 || aIOData.RSSubCatType===2 || aIOData.RSSubCatType===3 ) {
						//------------------------------------//
						//-- CREATE THE TILE DATA           --//
						//------------------------------------//
						aTempTileData = {
							"Type": "IO",
							"Data": {
								"ThingId":      oController.iCurrentThing,
								"IOId":         iIOId,
								"IOName":       sIOName,
								"TileName":     "TileIO-"+iIOId,
								"FragmentName": "",
								"APIData": {
									"Type":         "TotalableSpecial"
								},
								"EnabledButtons": {
									"TimeRB":[
										//"MostRecent",
										"NormalTimePeriods"
									],
									"FilterRB":[
										"TotalableSpecial"
									]
								},
								"TempVals": {
									"TimeRB":          "Day",
									"FilterRB":        "TotSpecV"
								},
								"CurrentVals": {
									"TimeRB":          "Day",
									"FilterRB":        "TotSpecV",
									"TimeCustomStart": null,
									"TimeCustomEnd":   null
								}
							},
							"Fragment": false
						};
						//----------------------------------------------------//
						//-- ADD TO THE GLOBALS                             --//
						//----------------------------------------------------//
						oController.aTiles.push( aTempTileData );
						
					} else {
						console.log( "DeviceData Page: Non-supported totaled enumeration!" );
					}
				} else {
					console.log( "DeviceData Page: A non-supported enumeration type is detected!" );
				}
			} catch( e1 ) {
				console.log( "DeviceData Page Error: "+e1.message );
			}
		});
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return true;
		
	},
	
	//====================================================================================================================//
	//== DRAW NEW TILES ON THE PAGE                                                                                     ==//
	//====================================================================================================================//
	DrawConfiguredTilesOnThePage: function() {
		//------------------------------------------------------------------------//
		//-- DESCRIPTION:														--//
		//--																	--//
		//------------------------------------------------------------------------//
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var oController         = this;             //-- SCOPE:         Binds the current controller's scope to a variable for sub-functions to call --//
		var oView               = this.getView();   //-- 
		var oTile               = null;             //-- OBJECT:        --//
		var sTileId             = "";               //-- STRING:        --//
		var sTemp               = "";               //-- STRING:        --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - FOREACH CONFIGURED TILEDATA CREATE THE ACTUAL TITLE  --//
		//----------------------------------------------------------------//
		
		try {
			$.each( oController.aTiles, function( sIndex, aTileData ) {
				try {
					sTileId = aTileData.Data.TileName;
					
					//----------------------------------------//
					//-- TILETYPE: THING STATE TOGGLE       --//
					//----------------------------------------//
					if( aTileData.Type==="ThingStateToggle" ) {
						
						//----------------------------------------//
						//-- CREATE THE TILE                    --//
						//----------------------------------------//
						oTile = new sap.m.GenericTile( oController.createId( sTileId ), {
							"header":       "Toggle Status",
							"frameType":    "OneByOne",
							"size":         "Auto",
							"tileContent":  [
								new sap.m.TileContent( oController.createId( aTileData.Data.TileName+'_content' ), {
									"content":  new sap.ui.core.HTML( oController.createId( aTileData.Data.TileName+'_value' ), {
										"content":    "<div class=\"TileToggleThingStatusLabel\">"+ aTileData.Data.CurrentVals.sValue+"</div>"
									}).addStyleClass("")
								})
							],
							press: function (oControlEvent) {
								oController.ThingToggleState( oControlEvent, sIndex );
							}
						}).addStyleClass("MarAll0d5Rem");
						
						//----------------------------------------//
						//-- ADD THE TILE TO THE PAGE           --//
						//----------------------------------------//
						oView.byId("TileContainer").addContent( oTile );
						
						//------------------------------------------------//
						//-- ADD THE TILE ID TO THE LIST OF IDS TO      --//
						//-- DELETE WHEN THE PAGE GETS REDRAWN          --//
						//------------------------------------------------//
						oController.aElementsToDestroy.push( sTileId );
						
						
						
					//----------------------------------------//
					//-- TILETYPE: IO                       --//
					//----------------------------------------//
					} else if( aTileData.Type==="IO" ) {
						//----------------------------------------//
						//-- CREATE THE TILE                    --//
						//----------------------------------------//
						oTile = new sap.m.GenericTile( oController.createId( sTileId ), {
							"header":       aTileData.Data.IOName,      //-- IO NAME --//
							"frameType":    "OneByOne",
							"size":         "Auto",
							"tileContent":  [
								new sap.m.TileContent( oController.createId( aTileData.Data.TileName+'_content' ), {
									"content": new sap.m.NumericContent( oController.createId( aTileData.Data.TileName+'_value' ), {
										"truncateValueTo":      5,
										"value":                "",
										"valueColor":           "Good",
										"scale":                ""
									}).addStyleClass(""),
									//"footer" : "Period : "+aTileData.Data.CurrentVals.FilterRB
								})
							],
							"press": function (oControlEvent) {
								oController.iSelectedIOId = aTileData.Data.IOId;
								oController.OpenIOTileMenu( oControlEvent, sIndex );
							}
						}).addStyleClass("MarAll0d5Rem");
						
						//----------------------------------------//
						//-- ADD THE TILE TO THE PAGE           --//
						//----------------------------------------//
						oView.byId("TileContainer").addContent( oTile );
						
						//------------------------------------------------//
						//-- ADD THE TILE ID TO THE LIST OF IDS TO      --//
						//-- DELETE WHEN THE PAGE GETS REDRAWN          --//
						//------------------------------------------------//
						oController.aElementsToDestroy.push( sTileId );
						
						
						//------------------------------------------------//
						//-- TRIGGER THE TILEIO MENU AJAX               --//
						//------------------------------------------------//
						oController.IOTileMenuStoreValue( false, sIndex );
						
					}
				} catch( e2 ) {
					jQuery.sap.log.error("DeviceData Page Error: Critical Error Drawing Tiles! "+e2.message );
				}
			});
		} catch( e1 ) {
			jQuery.sap.log.error("DeviceData Page Error: Critical Error Drawing Tiles! "+e1.message );
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return true;
		
	},
	
	//====================================================================================================================//
	//== DESTROY CURRENT TILES                                                                                          ==//
	//====================================================================================================================//
	DestroyCurrentTiles: function() {
		//------------------------------------------------------------------------//
		//-- DESCRIPTION: This function is used to destoy all OpenUI5 Elements  --//
		//--    that are marked for deletion in order to redraw the page        --//
		//------------------------------------------------------------------------//

		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var oController         = this;             //-- SCOPE:     Binds the current controller's scope to a variable for sub-functions to call --//
		var oTempObject         = null;             //-- OBJECT:    Used to 
		var bSuccessfulDelete   = false;            //-- BOOLEAN:   Used to indicate if the UI5 Object was successfully deleted		--//
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - DESTROY EACH ELEMENT MARKED FOR DELETION             --//
		//----------------------------------------------------------------//
		try {
			$.each( oController.aElementsToDestroy, function( sIndex, sObjectId ) {
				//--------------------------------------------------------//
				//-- MARK THAT THE OBJECT HAS NOT BEEN DELETED          --//
				//--------------------------------------------------------//
				bSuccessfulDelete = false;
				
				//--------------------------------------------------------//
				//-- ATTEMPT THE NORMAL WAY OF DELETING AN OBJECT       --//
				//--------------------------------------------------------//
				try {
					oTempObject = oController.byId( sObjectId );
					if( oTempObject ) {
						oTempObject.destroy();
						bSuccessfulDelete = true;
					}
					
				} catch( e1 ) {
					//bSuccessfulDelete = false;
				}
				
				//--------------------------------------------------------//
				//-- IF THAT FAILED TRY THE OTHER WAY                   --//
				//--------------------------------------------------------//
				if( bSuccessfulDelete===false ) {
					try {
						oTempObject = sap.ui.getCore().byId( sObjectId );
						
						if( oTempObject ) {
							oTempObject.destroy();
							bSuccessfulDelete = true;
						}
						
					} catch( e2 ) {
						jQuery.sap.log.error( "Error DeletingObject: "+sObjectId );
						
					}
				}
			});
			
		} catch( e1 ) {
			jQuery.sap.log.error("DeviceData Page Error: Critical Error Removing Tiles! "+e1.message );
		}
		
		//----------------------------------------------------------------//
		//-- 3.0 - EMPTY THE ARRAY OF ELEMENTS FOR DELETION             --//
		//----------------------------------------------------------------//
		oController.aElementsToDestroy = [];
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return true;
	},
	
	//====================================================================================================================//
	//== TOGGLE THING STATUS                                                                                            ==//
	//====================================================================================================================//
	ThingToggleState: function ( oControlEvent, iArrayId ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALIZATION                                       --//
		//----------------------------------------------------------------//
		var oController         = this;
		var iThingId            = oController.aTiles[iArrayId].Data.ThingId;
		var oTile               = null;
		var oTileDisplay        = null;
		
		
		try {
			//----------------------------------------------------------------//
			//-- 2.0 - SETUP VARIABLES                                      --//
			//----------------------------------------------------------------//
			iThingId            = oController.aTiles[iArrayId].Data.ThingId;
			oTile               = oController.getView().byId( oController.aTiles[iArrayId].Data.TileName );
			oTileDisplay        = oController.getView().byId( oController.aTiles[iArrayId].Data.TileName+'_value' );
			
			
			//----------------------------------------------------------------//
			//-- 3.0 - AJAX                                                 --//
			//----------------------------------------------------------------//
			
			oTile.setState("Loading");
			
			
			iomy.apiphp.AjaxRequest({
				url: iomy.apiphp.APILocation("statechange"),
				type: "POST",
				data: { 
					"Mode":   "ThingToggleStatus", 
					"Id":     iThingId
				},
				onSuccess : function( sExpectedDataType, aAjaxData ) {
					//----------------------------------------------------------------//
					//-- 3.A.1 - INITIALISE                                         --//
					//----------------------------------------------------------------//
					var sNewString          = "";        //-- STRING:       Contains the new HTML Code to display on the tile --//
					
					//----------------------------------------------------------------//
					//-- 3.A.2 - PARSE SUCCESS RESULTS                              --//
					//----------------------------------------------------------------//
					if( aAjaxData.ThingStatus!==undefined || aAjaxData.ThingStatus!==null ) {
						
						//------------------------------------//
						//-- Update the Global variables    --//
						//------------------------------------//
						iomy.common.ThingList["_"+iThingId].Status = aAjaxData.ThingStatus;
						iomy.common.ThingList["_"+iThingId].UILastUpdate = new Date();
						
						//------------------------------------//
						//-- Generate the new Label         --//
						//------------------------------------//
						//-- If turned Off --//
						if( aAjaxData.ThingStatus===0 ) {
							sNewString = "<div class=\"TileToggleThingStatusLabel\">Off</div>";
						//-- Else Turned On --//
						} else {
							sNewString = "<div class=\"TileToggleThingStatusLabel\">On</div>";
						}
						
					} else {
						//-- Flag an error --//
						sNewString = "<div class=\"TileToggleThingStatusLabel\">Error</div>";
					}
					
					//----------------------------------------------------------------//
					//-- 3.A.3 - UPDATE THE UI                                      --//
					//----------------------------------------------------------------//
					if( oTileDisplay ) {
						//-- Update the Display --//
						oTileDisplay.setContent( sNewString );
						oTile.setState("Loaded");
					}
					
				},
				onFail : function(response) {
					iomy.common.showError(response.message, "Error Changing Device Status");
				},
			});
		
		
		} catch( e1 ) {
			jQuery.sap.log.error("DeviceData Page Error: Critical Error Toggling Thing State! "+e1.message );
		}
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
	},
	
	
	//====================================================================================================================//
	//== OPEN IO TILE MENU                                                                                              ==//
	//====================================================================================================================//
	OpenIOTileMenu: function ( oControlEvent, iArrayId ) {
		//--------------------------------------------------------//
		//-- 1.0 - INITIALISATION                               --//
		//--------------------------------------------------------//
		var oCurrentController  = this;
		var iThingId            = oCurrentController.aTiles[iArrayId].Data.ThingId;
		var iIOId               = oCurrentController.aTiles[iArrayId].Data.IOId;
		var sIOName             = "";
		var sFragmentName       = "";
		var oButton             = oControlEvent.getSource();
		
		//--------------------------------------------------------//
		//-- 2.0 - MAIN                                         --//
		//--------------------------------------------------------//
		try {
			if(!oCurrentController.aTiles[iArrayId].Fragment) {
				//--------------------------------------------------------//
				//-- SETUP THE IO NAME                                  --//
				//--------------------------------------------------------//
				sIOName         = iomy.common.ThingList['_'+iThingId].IO['_'+iIOId].Name;
				sFragmentName   = "FragTileIO-"+iIOId+"";
				
				
				//--------------------------------------------------------//
				//-- CREATE THE FRAGMENT DATA AND FRAGMENT OBJECT       --//
				//--------------------------------------------------------//
				oCurrentController.aTiles[iArrayId].Data.IOName             = sIOName;              //-- UPDATE THE IO NAME --//
				oCurrentController.aTiles[iArrayId].Data.FragmentName       = sFragmentName;        //--  --//
				oCurrentController.aTiles[iArrayId].Fragment                = sap.ui.jsfragment( sFragmentName, "fragments.IOTileMenu", oCurrentController );
				
				//-- Set the Title --//
				oCurrentController.aTiles[iArrayId].Fragment.setTitle( sIOName );
				
				
				//--------------------------------------------------------//
				//-- ADD THE JSFRAGMENT TO THE CURRENT VIEW             --//
				//--------------------------------------------------------//
				oCurrentController.getView().addDependent( oCurrentController.aTiles[iArrayId].Fragment );
				
				oCurrentController.aElementsToDestroy.push( sFragmentName );
				
				//-- Setup the TileIO for its first run --//
				$.sap.delayedCall(0, oCurrentController, function() {
					oCurrentController.TileIOMenuFirstRun(iArrayId);
				});
				
				//-- Debugging --//
				//console.log(">>> Fragment added to view! <<<");
			} else {
				//-- Debugging --//
				//console.log(">>> Fragment already exists! <<<");
			}
			
			//--------------------------------------------------------//
			//-- OPEN THE TILE IO MENU ITSELF                       --//
			//--------------------------------------------------------//
			//-- Wait for UI5 to do the redraw after adding the Fragment so that the fragment is loaded before it is opened --//
			$.sap.delayedCall(0, oCurrentController, function() {
				oCurrentController.aTiles[iArrayId].Fragment.open();
			});
		} catch( e1 ) {
			jQuery.sap.log.error( "DeviceData Page Error: Critical Error Opening IO Menu! "+e1.message );
		}
	},
	
	
	TileIOMenuFirstRun: function( iArrayId ) {
		//--------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                         --//
		//--------------------------------------------------------//
		var oController         = this;
		var sFragmentName       = "";              //--  --//
		var aRBTime             = [];              //-- ARRAY:   --//
		var aRBFilter           = [];              //-- ARRAY:   --//
		
		var sTempFragId         = "";
		var oTempElement        = null;
		var oTempRadioButton    = null;
		
		var sIdPrefix           = "";
		var sDefaultTimePeriod  = "";
		
		
		
		try {
			//--------------------------------------------------------//
			//-- 2.0 - SETUP VARIABLES                              --//
			//--------------------------------------------------------//
			sFragmentName   = this.aTiles[iArrayId].Data.FragmentName;
			aRBTime         = this.aTiles[iArrayId].Data.EnabledButtons.TimeRB;
			aRBFilter       = this.aTiles[iArrayId].Data.EnabledButtons.FilterRB;
			sIdPrefix       = this.aTiles[iArrayId].Data.IOId+"_";
			
			//--------------------------------------------------------//
			//-- 3.0 - DISABLE INAPPROPIATE FILTERS                 --//
			//--------------------------------------------------------//
			
			//------------------------------------------------------------//
			//-- 3.1 - SETUP THE APPROPIATE "TIME PERIOD" RADIO BUTTONS --//
			//------------------------------------------------------------//
			sTempFragId     = sap.ui.core.Fragment.createId( oController.aTiles[iArrayId].Data.FragmentName, "TimeRB" );
			oTempElement    = sap.ui.getCore().byId( sTempFragId );
			
			
			
			$.each( aRBTime, function( sIndex, sValue ) {
				switch( sValue ) {
					//------------------------------------------------//
					//-- ADD THE "Most Recent Value" RADIO BUTTON   --//
					//------------------------------------------------//
					case "MostRecent":
						//----------------------------//
						//-- Current Value          --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBCurrent"), {
							"text":     "Most Recent Value",
							"editable": true,
							"select": function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "CurV" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodDay;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						break;
					//------------------------------------------------//
					//-- ADD THE "NormalTimePeriods" RADIO BUTTONS  --//
					//------------------------------------------------//
					case "NormalTimePeriods":
						
						//--------------------//
						//-- DAY            --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBDay"), {
							"text":     "Last 24 hours",
							"editable": true,
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "Day" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodDay;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- WEEK           --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBWeek"), {
							"text":     "Last 7 days",
							"editable": true,
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "Week" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodWeek;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- FORTNIGHT      --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBFort"), {
							"text":     "Last 14 days",
							"editable": true,
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "Fortnight" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodFortnight;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- MONTH          --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBMonth"), {
							"text":     "Last 31 days",
							"editable": true,
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "Month" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodMonth;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- QUARTER        --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBQuarter"), {
							"text":     "Last 91 days",
							"editable": true,
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "Quarter" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodQuarter;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- YEAR           --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"TimeRBYear"), {
							"text":     "Last 365 days",
							"editable": true,
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "Year" );
								oController.sSelectedTimePeriod = iomy.graph_jqplot.PeriodYear;
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						break;
						
					default:
						console.log("Unrecognised \"Time Period\" in \"TileIOMenu\"! ");
					
				}
			});
			
			//------------------------------------------------------------//
			//-- 3.2 - SETUP THE APPROPIATE "Filter" RADIO BUTTONS      --//
			//------------------------------------------------------------//
			sTempFragId     = sap.ui.core.Fragment.createId( oController.aTiles[iArrayId].Data.FragmentName, "FilterRB" );
			oTempElement    = sap.ui.getCore().byId( sTempFragId );
			
			$.each( aRBFilter, function( sIndex, sValue ) {
				switch( sValue ) {
					//------------------------------------------------//
					//-- ADD THE "NormalNonTotalable" RADIO BUTTON  --//
					//------------------------------------------------//
					case "NormalNonTotalable":
						//--------------------//
						//-- CURRENT VALUE	--//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBCurV"), {
							"text":     "Current Value",
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "FilterRB", "CurV" );
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- MINIMUM VALUE	--//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBMinV"), {
							"text":     "Minimum Value",
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "FilterRB", "MinV" );
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						//--------------------//
						//-- MAXIMUM VALUE	--//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBMaxV"), {
							"text":     "Maximum Value",
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "FilterRB", "MaxV" );
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						///------------------------//
						//-- AVERAGE VALUE       --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBAvgV"), {
							"text":     "Average Value",
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "FilterRB", "AvgV" );
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						sDefaultTimePeriod = "CurV";
						break;
						
					//------------------------------------------------//
					//-- ADD THE "TotalableSpecial" RADIO BUTTONS   --//
					//------------------------------------------------//
					case "TotalableSpecial":
						
						//------------------------//
						//-- CURRENT VALUE      --//
						//oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBCurV"), {
						//	"text":		"Current Value",
						//	"select":	function( oControlEvent ) {
						//		oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "FilterRB", "CurV" );
						//	}
						//});
						//oTempElement.addButton(oTempRadioButton);
						
						//------------------------//
						//-- TOTALABLE VALUE    --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBTotV"), {
							"text":     "Totalable Value",
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "TotSpecV" );
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						sDefaultTimePeriod = "CurV";
						
						break;
						
					//------------------------------------------------//
					//-- ADD THE "TotalableNormal" RADIO BUTTONS    --//
					//------------------------------------------------//
					case "TotalableNormal":
						
						//------------------------//
						//-- TOTALABLE VALUE    --//
						oTempRadioButton = new sap.m.RadioButton( oController.createId( sIdPrefix+"FilterRBTotV"), {
							"text":     "Totalable Value",
							"select":   function( oControlEvent ) {
								oController.IOTileMenuRButtonOnSelect( oControlEvent, iArrayId, "TimeRB", "TotV" );
							}
						});
						oTempElement.addButton(oTempRadioButton);
						
						sDefaultTimePeriod = "Day";
						
						break;
						
					default:
						console.log("Unrecognised \"Filter\" in \"TileIOMenu\"! \n"+sDefaultTimePeriod);
						break;
				}
			});
			
			//--------------------------------------------------------//
			//-- 4.0 - BIND ONPRESS EVENTS                          --//
			//--------------------------------------------------------//
			oController.aTiles[iArrayId].Fragment.attachConfirm( function( oControlEvent ) {
				oController.IOTileMenuStoreValue( oControlEvent, iArrayId );
			});
			
			
			//----------------------------------------------------------------------------//
			//-- 5.0 - PERFORM VALUE CHANGE TO SET THE INITIAL VALUE TO A VALID VALUE   --//
			//----------------------------------------------------------------------------//
			oController.IOTileMenuRButtonOnSelect( false, iArrayId, "TimeRB", sDefaultTimePeriod );
		
		} catch( e1 ) {
			jQuery.sap.log.error( "DeviceData Page Error: Critical Error Opening IO Menu! "+e1.message );
		}
		
		return true;
	},
	
	
	
	
	IOTileMenuRButtonOnSelect: function( oEvent, iArrayId, sCategory, sValue ) {
		//-- NOTES:		oEvent parameter can be false so before using this parameter it will need to be checked to see if it is not false.	--//
		
		//console.log("RBOnSelect: '"+iArrayId+"', '"+sCategory+"', '"+sValue+"' ");
		
		//--------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                         --//
		//--------------------------------------------------------//
		var oController			= this;				//-- OBJECT:		Store the Current Controller scope as a variable so that sub functions can access it. --//
		var sTempFragId1		= "";				//-- STRING:		--//
		var sTempFragId2		= "";				//-- STRING:		--//
		var oTempElement1		= null;				//-- OBJECT:		--//
		var oTempElement2		= null;				//-- OBJECT:		--//
		var oButton				= null;				//-- OBJECT:		--//
		var iIndex				= 0;				//-- INT/STRING:	--//
		var sFilterState		= "";				//-- STRING:		--//
		//var sValue				= "";				
		
		var sTemp               = "";               //-- STRING:		A Temp variable just used to hold a result so that a function doesn't have to be called multiple time to fetch the same value for a comparison --//
		var oBtn2               = null;             //-- OBJECT:		A temp variable used to store another button for the condition checks. --//
		var sBtn2Value          = "";               //-- STRING:		--//
		var bInvalidOption      = true;             //-- BOOLEAN:		Stores if an invalid option is chosen so that when a valid option becomes available it can be selected instead. --//
		
		
		try {
			//--------------------------------------------------------//
			//-- 2.0 - FETCH TRIGGERING ELEMENT                     --//
			//--------------------------------------------------------//
			sTempFragId1        = sap.ui.core.Fragment.createId( oController.aTiles[iArrayId].Data.FragmentName, sCategory );
			oTempElement1       = sap.ui.getCore().byId( sTempFragId1 );
			
			//--------------------------------------------------------//
			//-- 4.0 - PROCESS THE TRIGGER EVENT                    --//
			//--------------------------------------------------------//
			switch( sCategory ) {
				case "TimeRB":
					//-- IF Element is found --//
					if(oTempElement1) {
						
						//-- FETCH THE "FILTER RADIO BUTTONS" --//
						sTempFragId2        = sap.ui.core.Fragment.createId( oController.aTiles[iArrayId].Data.FragmentName, "FilterRB" );
						oTempElement2       = sap.ui.getCore().byId( sTempFragId2 );
						sFilterState        = oController.aTiles[iArrayId].Data.TempVals.FilterRB;
						
						//-- Store the value in the Temp section --//
						oController.aTiles[iArrayId].Data.TempVals[sCategory] = sValue;
						
						//--------------------------------//
						//-- CURRENT VALUE              --//
						//--------------------------------//
						if( sValue==="CurV" ) {
							
							//--------------------------------------------------------//
							//-- CHECK IF AN INVALID OPTION IS CURRENTLY SELECTED   --//
							//--------------------------------------------------------//
							if( sFilterState==="CurV" ) {
								//-- Flag that a valid option is chosen --//
								bInvalidOption = false;
							}
							
							//--------------------------------------------------------//
							//-- Lockdown all other values except current value     --//
							//--------------------------------------------------------//
							$.each( oTempElement2.getButtons(), function( sIndex, oFilterButton ) {
								if( oFilterButton!==undefined && oFilterButton!==null) {
									//--------------------------------------------------------------------------------//
									//-- ENABLE ONLY "Current Value" FILTERS IF THE TIME PERIOD IS "Current Value"  --//
									if( oFilterButton.getText()==="Current Value") {
										//-- Enable the button --//
										oFilterButton.setEnabled(true);
										//-- If a valid option isn't chosen then select this option --//
										if(bInvalidOption===true) {
											//-- SET THIS BUTTON AS THE SELECTED (due to it being valid button) --//
											oTempElement2.setSelectedButton( oFilterButton );
											oController.aTiles[iArrayId].Data.TempVals.FilterRB = "CurV";
											//-- Flag that an invalid radio button is no longer selected --//
											bInvalidOption = false;
										}
									//--------------------------------------------------------------------------------------------//
									//-- DISABLE THE FILTER BUTTON AS IT IS NOT APPLICABLE FOR THE "Current Value" TIME PERIOD  --//
									} else {
										oFilterButton.setEnabled(false);
									} //-- END ELSE button is type --//
								}
							});
							
						//--------------------------------//
						//-- TIME PERIOD                --//
						//--------------------------------//
						} else if( sValue==="Day" || sValue==="Week" || sValue==="Fortnight" || sValue==="Month" || sValue==="Quarter" || sValue==="Year" ) {
							//--------------------------------//
							//-- IF NORMALNONTOTALABLE      --//
							//--------------------------------//
							if( oController.aTiles[iArrayId].Data.APIData.Type==="NormalNonTotalable") {
								//----------------------------------------------------//
								//-- ENABLE "Min", "Max" & "Avg" FILTER BUTTONS     --//
								//----------------------------------------------------//
								$.each( oTempElement2.getButtons(), function( sIndex, oFilterButton ) {
									
									if( oFilterButton!==undefined && oFilterButton!==null ) {
										//----------------------------//
										//-- GET THE BUTTON VALUE   --//
										//----------------------------//
										sTemp = oFilterButton.getText();
										
										//--------------------------------------------------------------------------------//
										//-- ENABLE ONLY "Avg", "Min", "Max"                                            --//
										//--------------------------------------------------------------------------------//
										if( sTemp==="Minimum Value" ) {
											//-- Enable the button --//
											oFilterButton.setEnabled(true);
											
											//-- If a valid option isn't chosen then select this option --//
											if(bInvalidOption===true) {
												//-- SET THIS BUTTON AS THE SELECTED (due to it being valid button) --//
												oTempElement2.setSelectedButton( oFilterButton );
												oController.aTiles[iArrayId].Data.TempVals.FilterRB = "MinV";
												//-- Flag that an invalid radio button is no longer selected --//
												bInvalidOption = false;
											}
										} else if( sTemp==="Maximum Value" ) {
											//-- Enable the button --//
											oFilterButton.setEnabled(true);
											
											//-- If a valid option isn't chosen then select this option --//
											if(bInvalidOption===true) {
												//-- SET THIS BUTTON AS THE SELECTED (due to it being valid button) --//
												oTempElement2.setSelectedButton( oFilterButton );
												oController.aTiles[iArrayId].Data.TempVals.FilterRB = "MaxV";
												//-- Flag that an invalid radio button is no longer selected --//
												bInvalidOption = false;
											}
										} else if( sTemp==="Average Value" ) {
											//-- Enable the button --//
											oFilterButton.setEnabled(true);
											
											//-- If a valid option isn't chosen then select this option --//
											if(bInvalidOption===true) {
												//-- SET THIS BUTTON AS THE SELECTED (due to it being valid button) --//
												oTempElement2.setSelectedButton( oFilterButton );
												oController.aTiles[iArrayId].Data.TempVals.FilterRB = "AvgV";
												//-- Flag that an invalid radio button is no longer selected --//
												bInvalidOption = false;
											}
										//------------------------------------------------------------------------------------//
										//-- DISABLE THE FILTER BUTTON AS IT IS NOT APPLICABLE FOR THE NORMAL TIME PERIOD   --//
										//------------------------------------------------------------------------------------//
										} else {
											oFilterButton.setEnabled(false);
										} //-- END ELSE button is type --//
									}
								});
							//--------------------------------//
							//-- ELSE IF NORMAL-TOTALABLE   --//
							//--------------------------------//
							} else if( oController.aTiles[iArrayId].Data.APIData.Type==="TotalableNormal") {
								//----------------------------------------------------//
								//-- ENABLE "Tot"FILTER BUTTONS                     --//
								//----------------------------------------------------//
								$.each( oTempElement2.getButtons(), function( sIndex, oFilterButton ) {
									
									if( oFilterButton!==undefined && oFilterButton!==null ) {
										//----------------------------//
										//-- GET THE BUTTON VALUE   --//
										//----------------------------//
										sTemp = oFilterButton.getText();
										
										//--------------------------------------------------------------------------------//
										//-- ENABLE ONLY "Tot"                                                          --//
										//--------------------------------------------------------------------------------//
										if( sTemp==="Totalable Value" ) {
											//-- Enable the button --//
											oFilterButton.setEnabled(true);
											
											//-- If a valid option isn't chosen then select this option --//
											if(bInvalidOption===true) {
												//-- SET THIS BUTTON AS THE SELECTED (due to it being valid button) --//
												oTempElement2.setSelectedButton( oFilterButton );
												oController.aTiles[iArrayId].Data.TempVals.FilterRB = "TotV";
												//-- Flag that an invalid radio button is no longer selected --//
												bInvalidOption = false;
											}
										//------------------------------------------------------------------------------------//
										//-- DISABLE THE FILTER BUTTON AS IT IS NOT APPLICABLE FOR THE NORMAL TIME PERIOD   --//
										//------------------------------------------------------------------------------------//
										} else {
											oFilterButton.setEnabled(false);
										} //-- END ELSE button is type --//
									}
								});
								
								
								
							//--------------------------------//
							//-- ELSE IF SPECIAL-TOTALABLE  --//
							//--------------------------------//
							} else if( oController.aTiles[iArrayId].Data.APIData.Type==="TotalableSpecial") {
								//--------------------------------------------------------//
								//-- ENABLE "TotSpec" FILTER BUTTONS                    --//
								//--------------------------------------------------------//
								$.each( oTempElement2.getButtons(), function( sIndex, oFilterButton ) {
									
									if( oFilterButton!==undefined && oFilterButton!==null ) {
										//----------------------------//
										//-- GET THE BUTTON VALUE   --//
										//----------------------------//
										sTemp = oFilterButton.getText();
										
										//--------------------------------------------------------------------------------//
										//-- ENABLE ONLY "TotSpec"                                                      --//
										//--------------------------------------------------------------------------------//
										if( sTemp==="Totalable Value" ) {
											//-- Enable the button --//
											oFilterButton.setEnabled(true);
											
											//-- If a valid option isn't chosen then select this option --//
											if(bInvalidOption===true) {
												//-- SET THIS BUTTON AS THE SELECTED (due to it being valid button) --//
												oTempElement2.setSelectedButton( oFilterButton );
												oController.aTiles[iArrayId].Data.TempVals.FilterRB = "TotSpecV";
												//-- Flag that an invalid radio button is no longer selected --//
												bInvalidOption = false;
											}
										//------------------------------------------------------------------------------------//
										//-- DISABLE THE FILTER BUTTON AS IT IS NOT APPLICABLE FOR THE NORMAL TIME PERIOD   --//
										//------------------------------------------------------------------------------------//
										} else {
											oFilterButton.setEnabled(false);
										} //-- END ELSE button is type --//
									}
								});
								
							//--------------------------------//
							//-- ELSE UNRECOGNISABLE        --//
							//--------------------------------//
							} else {
								jQuery.sap.log.error( "TileIOMenu Error: Unsupported APIData Type!\n"+oController.aTiles[iArrayId].Data.APIData.Type);
							}
							
						} else {
							jQuery.sap.log.error( "TileIOMenu Error: Unrecognised Time Period!\n"+sValue);
						}
						
					}
					break;
					
				case "FilterRB":
					//-- TODO: This might affect what options are available in the "Analytic" Tab --//
					if( sValue==="CurV" || sValue==="MinV" || sValue==="MaxV" || sValue==="AvgV" || sValue==="TotV" || sValue==="TotSpecV" ) {
						oController.aTiles[iArrayId].Data.TempVals.FilterRB = sValue;
						
					} else {
						jQuery.sap.log.error( "TileIOMenu Error: Unrecognised Filter!\n"+sValue);
					}
					
					break;
			}
		
		
		} catch( e1 ) {
			jQuery.sap.log.error( "DeviceData Page Error: Critical Error IOTileMenu RButtonOnSelect! "+e1.message );
		}
	},
	
	
	//====================================================================================================================//
	//==
	//====================================================================================================================//
	IOTileMenuStoreValue: function( oEvent, iArrayId ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var oController         = this;             //-- OBJECT:        Store the Current Controller scope as a variable so that sub functions can access it. --//
		var sTimeRBValue        = "";               //-- STRING:        --//
		var sFilterRBValue      = "";               //-- STRING:        --//
		
		try {
			//----------------------------------------------------------------//
			//-- 3.0 - STORE THE "TimePeriod" VALUE                         --//
			//----------------------------------------------------------------//
			sTimeRBValue                                                = oController.aTiles[iArrayId].Data.TempVals["TimeRB"];
			oController.aTiles[iArrayId].Data.CurrentVals["TimeRB"]     = sTimeRBValue;
			
			
			//----------------------------------------------------------------//
			//-- 4.0 - STORE THE "Filter" VALUE                             --//
			//----------------------------------------------------------------//
			sFilterRBValue                                              = oController.aTiles[iArrayId].Data.TempVals["FilterRB"];
			oController.aTiles[iArrayId].Data.CurrentVals["FilterRB"]   = sFilterRBValue;
			
			
			//----------------------------------------------------------------//
			//-- 9.0 - CALL THE APIS TO FETCH THE VALUE TO BE DISPLAYED     --//
			//----------------------------------------------------------------//
			oController.IOTileMenuAjaxNewValue( oEvent, iArrayId, sTimeRBValue, sFilterRBValue );
			
			
		} catch( e1 ) {
			jQuery.sap.log.error( "DeviceData Page Error: Critical Error IOTileMenu StoreValue! "+e1.message );
		}
	},
	
	
	
	RefreshCurrentTileIOMenu: function( iArrayId ) {
		//-- This function is used to refresh the "Tile IO Menu" so that it has enabled/disable the appropiate items, etc --//
		//-- This function is triggered everytime the user changes what is selected in the "Tile IO Menu".	--//
		
		//--------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                         --//
		//--------------------------------------------------------//
		var sFragmentName = oCurrentController.aTiles[iArrayId].Data.FragmentName;
		
		
		
	},
	
	//====================================================================================================================//
	//== IO TILE MENU LOAD AJAX NEW VALUE                                                                               ==//
	//====================================================================================================================//
	IOTileMenuAjaxNewValue: function( oEvent, iArrayId, sTimeRBValue, sFilterRBValue ) {
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var oController         = this;             //-- OBJECT:        Store the Current Controller scope as a variable so that sub functions can access it. --//
		var oTile               = null;             //-- OBJECT:        --//
		
		var bError              = false;            //-- BOOLEAN:       Used to indicate that an error occurred somewhere. --//
		var iThingId            = 0;                //-- INTEGER:       --//
		var iIOId               = 0;                //-- INTEGER:       --//
		var aDataThing          = {};               //-- ARRAY:         Used to hold the Thing Data --//
		var aDataIO             = {};               //-- ARRAY:         Used to hold the IO Data --//
		var sAPIUrl             = "";               //-- STRING:        --//
		var aAPIParameters      = {};               //-- ARRAY:         --//
		var aResult             = [];               //-- STRING:        --//
		
		var iStartStamp         = 0;                //-- INTEGER:       --//
		var iEndStamp           = 0;                //-- INTEGER:       --//
		var iSampleRateLimit    = 0;                //-- INTEGER:       --//
		
		var bSuccessful         = false;
		
		
		
		try {
			//----------------------------------------------------------------//
			//-- 2.0 - SETUP VARIABLES                                      --//
			//----------------------------------------------------------------//
			oTile                   = oController.getView().byId( oController.aTiles[iArrayId].Data.TileName );
			
			
			//-- API PREP	--//
			iThingId                = oController.aTiles[iArrayId].Data.ThingId;
			iIOId                   = oController.aTiles[iArrayId].Data.IOId;
			aDataThing              = iomy.common.ThingList['_'+iThingId];
			aDataIO                 = iomy.common.ThingList['_'+iThingId].IO['_'+iIOId];
			
			
			//----------------------------------------------------------------//
			//-- 3.0 - SETUP VARIABLES                                      --//
			//----------------------------------------------------------------//
			iEndStamp               = iomy.time.GetCurrentUTS();
			
			if( sTimeRBValue==="Day" || sTimeRBValue==="Week" || sTimeRBValue==="Fortnight" || sTimeRBValue==="Month" || sTimeRBValue==="Quarter" || sTimeRBValue==="Year" ) {
				iStartStamp         = iomy.time.GetStartStampForTimePeriod( sTimeRBValue, iEndStamp );
				
			} else if( sTimeRBValue==="Custom" ) {
				
				
				
			} else if( sTimeRBValue==="CurV" ) {
				
				
				
			} else {
				bError = true;
				console.log("Unsupported Time Period!");
			}
			
			//console.log("Time Period='"+sTimeRBValue+"'");
			
			
			//----------------------------------------------------------------//
			//-- 4.0 - FETCH API                                            --//
			//----------------------------------------------------------------//
			if( bError===false ) {
				
				//--------------------------------------------//
				//-- 4.1.A - NORMAL NON TOTALABLE           --//
				//--------------------------------------------//
				if( oController.aTiles[iArrayId].Data.APIData.Type==="NormalNonTotalable" ) {
					//----------------------------//
					//-- CURRENT VALUE          --//
					//----------------------------//
					if( sFilterRBValue==="CurV" ) {
						
						oTile.setState("Loading");
						
						
						iomy.apiphp.AjaxRequest({
							"url": iomy.apiphp.APILocation("mostrecent"),
							"data": {
								"Mode":     "MostRecentTwoValues",
								"Id":       iIOId
							},
							"onSuccess": function ( sResponseType, aData ) {
								try {
									iSampleRateLimit = iomy.common.ThingList["_"+oController.iCurrentThing].IO["_"+iIOId].SamplerateLimit;
									
									if( aData!==undefined && aData!==null  ) {
										if( typeof aData['Error']==="undefined" ) {
											if( aData[0]!==undefined && aData[0]!==null ) {
												if( aData[0].UTS!==undefined && aData[0].UTS!==null ) {
	//                                                if (iSampleRateLimit !== null && iSampleRateLimit>=1 && ( aData[0].UTS <= ( iEndStamp - iSampleRateLimit ) )) {
	//                                                    bSuccessful = false;
	//                                                } else {
	                                                    //--------------------------------------------//
	                                                    //-- IF THERE IS MORE THAN 1 VALUE          --//
	                                                    //--------------------------------------------//
	                                                    if( aData.length >= 2 ) {
	
	                                                        //------------------------------------------------------------//
	                                                        //-- Work out if it is decreasing, neutral, increasing      --//
	                                                        //------------------------------------------------------------//
	                                                        if( aData[0].Value===aData[1].Value ) {
	                                                            //-- Value Unchanged --//
	                                                            bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].Value, aData[0].UOM_NAME, "None", "Neutral" );
	
	                                                        } else if( aData[0].Value>=aData[1].Value ) {
	                                                            //-- Increasing Value --//
	                                                            bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].Value, aData[0].UOM_NAME, "Up", "Good" );
	
	                                                        } else {
	                                                            //-- Decreasing Value --//
	                                                            bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].Value, aData[0].UOM_NAME, "Down", "Critical" );
	
	                                                        }
	
	                                                    //--------------------------------------------//
	                                                    //-- ELSE IF THERE IS JUST 1 VALUE          --//
	                                                    //--------------------------------------------//
	                                                    } else if( aData.length===1 ) {
	                                                        //-- Set the colour to Neutral since not enough data provided to determine if up, down, neutral --//
	                                                        bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].Value, aData[0].UOM_NAME, "None", "Neutral" );
	                                                    }
	//                                                }
												}
											}
										}
									}
									
									//----------------------------------------//
									//-- IF NO VALID VALUES WERE FOUND      --//
									//----------------------------------------//
									if( bSuccessful!==true ) {
										oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "", "None", "Error" );
									}
								} catch( e5678) {
									console.log( e5678.message );
								}
								
								//-- Flag that the Tile has been loaded --//
								oTile.setState("Loaded");
							},
							"onFail" : function (response) {
								iomy.common.showError("There was an error retriving the value of IO "+iIOId);
								
								//-- Recursively check for more Tasks --//
								oController.RecursiveLoadAjaxData();
							}
						});
						
					//----------------------------//
					//-- MINIMUM VALUE          --//
					//----------------------------//
					} else if( sFilterRBValue==="MinV" ) {
						oTile.setState("Loading");
						
						iomy.apiphp.AjaxRequest({
							"url":              iomy.apiphp.APILocation( "aggregation" ),
							"data": {
								"Id":           iIOId,
								"Mode":         "Min",
								"StartUTS":     iStartStamp,
								"EndUTS":       iEndStamp
							},
							"onSuccess": function ( sResponseType, aMinData ) {
								//--------------------------------//
								//-- SETUP VARIABLES            --//
								//--------------------------------//
								var sInidicatorType     = "None";           //-- STRING:        Colours: "Down", "None", "Up"							--//
								var sColour             = "";               //-- STRING:        --//
								var sNewValue           = "";               //-- STRING:        Stores the new value									--//
								var oTileDisplay        = null;             //-- OBJECT:        The UI5 object that displays the value to the user on the tile --//
								
								try {
									if( aMinData.Value!==undefined && aMinData.Value!==null ) {
										//-- Set the colour to Neutral since not enough data provided to determine if up, down, neutral --//
										bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aMinData.Value, aMinData.UOM_NAME, "None", "Neutral" );
										
									//----------------------------------------//
									//-- IF NO VALUES WERE FOUND            --//
									//----------------------------------------//
									} else {
										//-- Set the new Value --//
										bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "", "None", "Error" );
									}
									
								} catch( e5678 ) {
									console.log( e5678.message );
								}
								
								oTile.setState("Loaded");
							}
						});
					//----------------------------//
					//-- MAXIMUM VALUE          --//
					//----------------------------//
					} else if( sFilterRBValue==="MaxV" ) {
						oTile.setState("Loading");
						
						iomy.apiphp.AjaxRequest({
							"url":              iomy.apiphp.APILocation( "aggregation" ),
							"data":	{
								"Id":           iIOId,
								"Mode":         "Max",
								"StartUTS":     iStartStamp,
								"EndUTS":       iEndStamp
							},
							"onSuccess": function ( sResponseType, aMaxData ) {
								//--------------------------------//
								//-- SETUP VARIABLES            --//
								//--------------------------------//
								var sInidicatorType     = "Max";        //-- STRING:        Colours: "Down", "None", "Up"							--//
								var sColour             = "";           //-- STRING:        --//
								var sNewValue           = "";           //-- STRING:        Stores the new value									--//
								var oTileDisplay        = null;         //-- OBJECT:        The UI5 object that displays the value to the user on the tile --//
								
								try {
									if( aMaxData.Value!==undefined && aMaxData.Value!==null ) {
										bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aMaxData.Value, aMaxData.UOM_NAME, "None", "Neutral" );
										
									//----------------------------------------//
									//-- IF NO VALUES WERE FOUND            --//
									//----------------------------------------//
									} else {
										//-- Set the new Value --//
										bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "", "None", "Error" );
									}
									
								} catch( e5678 ) {
									console.log( e5678.message );
								}
								
								oTile.setState("Loaded");
							}
						});
					//----------------------------//
					//-- AVERAGE VALUE          --//
					//----------------------------//
					} else if( sFilterRBValue==="AvgV" ) {
						oTile.setState("Loading");
						
						iomy.apiphp.AjaxRequest({
							"url":				iomy.apiphp.APILocation( "aggregation" ),
							"data":	{
								"Id":			iIOId,
								"Mode":			"Count",
								"StartUTS":		iStartStamp,
								"EndUTS":		iEndStamp
							},
							"onSuccess": function ( sResponseType, aCountData ) {
								
								iomy.apiphp.AjaxRequest({
									"url":				iomy.apiphp.APILocation( "aggregation" ),
									"data":	{
										"Id":			iIOId,
										"Mode":			"Sum",
										"StartUTS":		iStartStamp,
										"EndUTS":		iEndStamp
									},
									"onSuccess": function ( sResponseType, aSumData ) {
										//--------------------------------//
										//-- SETUP VARIABLES			--//
										//--------------------------------//
										var sInidicatorType		= "None";		//-- STRING:		Colours -: "Down", "None", "Up"							--//
										var sColour				= "";			//-- STRING:		--//
										var sNewValue			= "";			//-- STRING:		Stores the new value									--//
										var oTileDisplay		= null;			//-- OBJECT:		The UI5 object that displays the value to the user on the tile --//
										var bSuccessful			= false;
										
										try {
											if( aCountData.Value!==undefined && aCountData.Value!==null ) {
												if( aSumData.Value!==undefined && aSumData.Value!==null ) {
													//-- Set the colour to Neutral since not enough data provided to determine if up, down, neutral --//
													//-- Store the new Value --//
													sNewValue			= aSumData.Value / aCountData.Value;
													bSuccessful			= oController.UpdateGenericTileWithNewValue( oController, iArrayId, sNewValue, aSumData.UOM_NAME, "None", "Neutral" );
												}
											}
											
											//----------------------------------------//
											//-- IF NO VALUES WERE FOUND			--//
											//----------------------------------------//
											if(bSuccessful===false) {
												//-- Set the new Value --//
												bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "", "None", "Error" );
												
											}
											
										} catch( e5678 ) {
											console.log( e5678.message );
										}
										
										//----------------------------------------//
										//-- SET TILE STATE TO LOADED			--//
										//----------------------------------------//
										oTile.setState("Loaded");
									}
								});
							}
						});
					//----------------------------//
					//-- UNRECOGNISED VALUE     --//
					//----------------------------//
					} else {
						console.log("TileIOMenu: Unrecognised 'filter' type");
					}
					
				//--------------------------------------------//
				//-- 4.1.B - NORMAL TOTALABLE               --//
				//--------------------------------------------//
				} else if( oController.aTiles[iArrayId].Data.APIData.Type==="TotalableNormal" ) {

					//----------------------------//
					//-- TOTALED VALUE          --//
					//----------------------------//
					if( sFilterRBValue==="TotV" ) {
						oTile.setState("Loading");
						
						iomy.apiphp.AjaxRequest({
							"url":				iomy.apiphp.APILocation( "aggregation" ),
							"data":	{
								"Id":			iIOId,
								"Mode":			"Sum",
								"StartUTS":		iStartStamp,
								"EndUTS":		iEndStamp
							},
							"onSuccess": function ( sResponseType, aMaxData ) {
								//--------------------------------//
								//-- SETUP VARIABLES            --//
								//--------------------------------//
								var sInidicatorType		= "Max";		//-- STRING:		Colours: "Down", "None", "Up"							--//
								var sColour				= "";			//-- STRING:		--//
								var sNewValue			= "";			//-- STRING:		Stores the new value									--//
								var oTileDisplay		= null;			//-- OBJECT:		The UI5 object that displays the value to the user on the tile --//
								
								try {
									if( aMaxData.Value!==undefined && aMaxData.Value!==null ) {
										bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aMaxData.Value, aMaxData.UOM_NAME, "None", "Neutral" );
										
									//----------------------------------------//
									//-- IF NO VALUES WERE FOUND            --//
									//----------------------------------------//
									} else {
										//-- Set the new Value --//
										bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "", "None", "Error" );
									}
									
									
								} catch( e5678 ) {
									console.log( e5678.message );
								}
								
								oTile.setState("Loaded");
							}
						});
						
					//----------------------------//
					//-- UNRECOGNISED VALUE     --//
					//----------------------------//
					} else {
						console.log("TileIOMenu: Unrecognised 'filter' type");
					}
				//--------------------------------------------//
				//-- 4.1.C - SPECIAL TOTALABLE              --//
				//--------------------------------------------//
				} else if( oController.aTiles[iArrayId].Data.APIData.Type==="TotalableSpecial" ) {
					//----------------------------//
					//-- CURRENT VALUE          --//
					//----------------------------//
					if( sFilterRBValue==="CurV" ) {
						//-- LOOKUP THE URL --//
						sAPIUrl = oController.ConvertIODataTypeToOdataString( aDataIO.DataType );
						
						oTile.setState("Loading");
						
						iomy.apiodata.AjaxRequest({
							"Url":				sAPIUrl,
							"Limit":			2,
							"Columns":			[
								"CALCEDVALUE",
								"UTS",
								"UOM_NAME"
							],
							"WhereClause":		[
								"IO_PK eq "+iIOId,
								//"UTS gt "+iStartStamp,
								"UTS le "+iEndStamp
							],
							"OrderByClause":	[
								"UTS desc",
								"CALCEDVALUE desc"
							],
							"onSuccess": function (sResponseType, aData) {
								//--------------------------------//
								//-- SETUP VARIABLES            --//
								//--------------------------------//
								var bSuccessful			= false;	//-- BOOLEAN:		Used to indicate if a valid value --//
								
								//--------------------------------//
								//-- BEGIN PARSING RESULTS      --//
								//--------------------------------//
								try {
									if( aData!==undefined && aData!==null ) {
										if( aData[0]!==undefined && aData[0]!==null ) {
											if( aData[0].UTS!==undefined && aData[0].UTS!==null ) {
												//--------------------------------------------//
												//-- IF THERE IS MORE THAN 1 VALUE          --//
												//--------------------------------------------//
												if( aData.length >=2 ) {
													
													//------------------------------------------------------------//
													//-- Work out if it is decreasing, neutral, increasing      --//
													//------------------------------------------------------------//
													if( aData[0].CALCEDVALUE===aData[1].CALCEDVALUE ) {
														//-- Value Unchanged --//
														bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].CALCEDVALUE, aData[0].UOM_NAME, "None", "Neutral" );
														
													} else if( aData[0].CALCEDVALUE>=aData[1].CALCEDVALUE ) {
														//-- Increasing Value --//
														bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].CALCEDVALUE, aData[0].UOM_NAME, "Up", "Good" );
														
													} else {
														//-- Decreasing Value --//
														bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].CALCEDVALUE, aData[0].UOM_NAME, "Down", "Critical" );
														
													}
													
												//--------------------------------------------//
												//-- ELSE IF THERE IS JUST 1 VALUE          --//
												//--------------------------------------------//
												} else if( aData.length===1 ) {
													//-- Set the colour to Neutral since not enough data provided to determine if up, down, neutral --//
													bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, aData[0].CALCEDVALUE, aData[0].UOM_NAME, "None", "Neutral" );
												}
											}
										}
									}
									
									//----------------------------------------//
									//-- IF NO VALID VALUES WERE FOUND      --//
									//----------------------------------------//
									if( bSuccessful!==true ) {
										oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "None", "", "Error" );
									}
									
								} catch( e41A ) {
									console.log( e41A.message );
								}
								//----------------------------------------//
								//-- SET THE TILE STATE TO LOADED       --//
								//----------------------------------------//
								oTile.setState("Loaded");
							}
						});
						
					//------------------------------------//
					//-- TOTALED VALUE                  --//
					//------------------------------------//
					} else if( sFilterRBValue==="TotSpecV" ) {
						oTile.setState("Loading");
						
						iomy.apiphp.AjaxRequest({
							"url":				iomy.apiphp.APILocation( "aggregation" ),
							"data":	{
								"Id":			iIOId,
								"Mode":			"Max",
								"StartUTS":		iStartStamp,
								"EndUTS":		iEndStamp
							},
							"onSuccess": function ( sResponseType, aMaxData ) {
								iomy.apiphp.AjaxRequest({
									"url":				iomy.apiphp.APILocation( "aggregation" ),
									"data":	{
										"Id":			iIOId,
										"Mode":			"Min",
											"StartUTS":		iStartStamp,
											"EndUTS":		iEndStamp
									},
									"onSuccess": function ( sResponseType, aMinData ) {
										//--------------------------------//
										//-- SETUP VARIABLES            --//
										//--------------------------------//
										var sInidicatorType		= "None";		//-- STRING:		Colours -: "Down", "None", "Up"							--//
										var sColour				= "";			//-- STRING:		--//
										var sNewValue			= "";			//-- STRING:		Stores the new value									--//
										var oTileDisplay		= null;			//-- OBJECT:		The UI5 object that displays the value to the user on the tile --//
										var bSuccessful			= false;
										
										try {
											if( aMaxData.Value!==undefined && aMaxData.Value!==null ) {
												if( aMinData.Value!==undefined && aMinData.Value!==null ) {
													//-- Set the colour to Neutral since not enough data provided to determine if up, down, neutral --//
													//-- Store the new Value --//
													sNewValue			= aMaxData.Value - aMinData.Value;
													bSuccessful			= oController.UpdateGenericTileWithNewValue( oController, iArrayId, sNewValue, aMaxData.UOM_NAME, "None", "Neutral" );
												}
											}
											
											//----------------------------------------//
											//-- IF NO VALUES WERE FOUND            --//
											//----------------------------------------//
											if(bSuccessful===false) {
												//-- Set the new Value --//
												bSuccessful = oController.UpdateGenericTileWithNewValue( oController, iArrayId, "NA", "", "None", "Error" );
												
											}
											
										} catch( e5678 ) {
											console.log( e5678.message );
										}
										
										//----------------------------------------//
										//-- SET TILE STATE TO LOADED           --//
										//----------------------------------------//
										oTile.setState("Loaded");
									}
								});
							}
						});
						
					//----------------------------//
					//-- UNRECOGNISED VALUE     --//
					//----------------------------//
					} else {
						console.log("TileIOMenu: Unrecognised 'filter' type");
					}
				//--------------------------------------------//
				//-- 4.1.? - UNSUPPORTED TYPE               --//
				//--------------------------------------------//
				} else {
					console.log("TileIOMenu Error: Unrecognised to Time Period!");
				}
			}
			
		} catch( e1 ) {
			jQuery.sap.log.error( "DeviceData Page Error: Critical Error IOTileMenu StoreValue! "+e1.message );
		}
	},
	
	//====================================================================================================================//
	//== UPDATE GENERIC TILE WITH NEW VALUE                                                                             ==//
	//====================================================================================================================//
	UpdateGenericTileWithNewValue: function( oController, iArrayId, sNewValue, sUoM, sInidicatorType, sColour ) {
		//------------------------------------------------------------------------//
		//-- DESCRIPTION: This function is used to update a Tile's normal       --//
		//--    display values, UoM and direction indicator                     --//
		//------------------------------------------------------------------------//
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var oTileDisplay        = null;     //-- OBJECT:        The UI5 object that displays the value to the user on the tile.           --//
		var oTileContent        = null;     //-- OBJECT:        The UI5 object that is the container for the main data that is displayed. --//
		var sFooterLabel        = "";       //-- STRING:        --//
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - CHECK TILE DATA                                      --//
		//----------------------------------------------------------------//
		try {
			if( typeof oController.aTiles[iArrayId]!=="undefined" ) {
				
				sFooterLabel = oController.ConvertTileTimePeriodToUserFriendly( oController.aTiles[iArrayId].Data.CurrentVals["TimeRB"] );
				
				oTileContent = oController.getView().byId( oController.createId( oController.aTiles[iArrayId].Data.TileName+'_content' ) );
				
				if( oTileContent ) {
					oTileContent.setFooter( sFooterLabel );
					
				}
			}
			
		} catch( e1 ) {
			return false;
		}
		
		//----------------------------------------------------------------//
		//-- 5.0 - UPDATE THE TILE IO WITH NEW VALUE                    --//
		//----------------------------------------------------------------//
		
		//-- Set the new Value --//
		oTileDisplay = oController.getView().byId( oController.aTiles[iArrayId].Data.TileName+'_value' );
		if( oTileDisplay ) {
			//--  --//
			oTileDisplay.setValue( sNewValue );
			oTileDisplay.setIndicator( sInidicatorType );
			oTileDisplay.setValueColor( sColour );
			oTileDisplay.setScale( sUoM );
			
			return true;
		} else {
			return false;
		}
	},
	

	
	//====================================================================================================================//
	//==
	//====================================================================================================================//
	ConvertIODataTypeToOdataString: function( iDataType ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var sAPIUrl			= "";				//-- STRING:		--//
		
		//----------------------------------------------------------------//
		//-- 2.0 - CONVERT TYPE INTEGER TO ODATA STRING                 --//
		//----------------------------------------------------------------//
		switch( iDataType ) {
			case 1:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'datatinyint' );
				break;
				
			case 2:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'dataint' );
				break;
				
			case 3:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'databigint' );
				break;
				
			case 4:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'datafloat' );
				break;
				
			case 5:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'datatinystring' );
				break;
				
			case 6:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'datashortstring' );
				break;
				
			case 7:
				sAPIUrl		= iomy.apiodata.ODataLocation( 'datamedstring' );
				break;
				
			default:
				sAPIUrl		= false;
				console.log("Unregonised IO Data type!");
				break;
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return sAPIUrl;
	},
	
	
	
	ConvertTileTimePeriodToUserFriendly: function( sTimePeriod ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE VARIABLES                                 --//
		//----------------------------------------------------------------//
		var sReturn = "";    //-- STRING:    --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - CONVERT TYPE INTEGER TO ODATA STRING                 --//
		//----------------------------------------------------------------//
		switch( sTimePeriod ) {
			case "CurV":
				sReturn = "Most Recent";
				break;
				
			case "Day":
				sReturn = "24 hours";
				break;
				
			case "Week":
				sReturn = "7 days";
				break;
				
			case "Fortnight":
				sReturn = "14 days";
				break;
				
			case "Month":
				sReturn = "31 days";
				break;
				
			case "Quarter":
				sReturn = "91 days";
				break;
				
			case "Year":
				sReturn = "365 days";
				break;
				
			default:
				sReturn = "";
				break;
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return sReturn;
		
	}
	


});