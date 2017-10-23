/*
Title: IOMy Page Widgets
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to create a complete sap.m.Page for all activities
    (pages).
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

$.sap.declare("IomyRe.widgets",true);

IomyRe.widgets = new sap.ui.base.Object();

$.extend( IomyRe.widgets, {
	
	//-- Top Navigation for all pages --//
	getToolPageHeader : function (oCurrentController) {
	
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//
		
		var oNavButton;					//-- OBJECT:	Stores the UI5 Button that holds the Toggle Navigation Button	--//
		var oToolbarSpacer1;			//-- OBJECT:	Stores the UI5 Toolbar Spacer									--//
		var oToolbarSpacer2;			//-- OBJECT:	Stores the UI5 Toolbar Spacer									--//
		var oLogo;						//-- OBJECT:	Stores the UI5 Image that holds the iOmy Logo					--//
		var oAdd;						//-- OBJECT:	Stores the UI5 Button that holds the Add Button / Menu			--//
		var oEdit;						//-- OBJECT:	Stores the UI5 Button that holds the Edit Button / Menu			--//
		var oSwitchView;				//-- OBJECT:	Stores the UI5 Button that holds the SwitchView Button / Menu	--//
		var oSettings;					//-- OBJECT:	Stores the UI5 Button that holds the Settings Button / Menu		--//
		var oToolHeader;				//-- OBJECT:	This variable stores the ToolPage header and is returned.		--//	

		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		
		//----------------------------------------------------//
		//-- 2.0 - Create ToolHeader Content                --//
		//----------------------------------------------------//
		
		oNavButton = new sap.m.Button (oView.createId("sideNavigationToggleButton"), {
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			icon: "sap-icon://menu2",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.onSideNavButtonPress(oControlEvent, oView);
			}
		});
		
		oToolbarSpacer1 = new sap.m.ToolbarSpacer ({});
		
		oToolbarSpacer2 = new sap.m.ToolbarSpacer ({});
		
		oLogo = new sap.m.Image ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
            densityAware : false,
			width: "70px",
			height: "40px",
			src: "resources/images/mini-logo.png"
		});
		
		oAdd = new sap.m.OverflowToolbarButton ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.High
			}),
			icon: "sap-icon://add",
			text: "Add",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.AddMenu(oControlEvent, oView);
			}	
		});
		
		oEdit = new sap.m.OverflowToolbarButton ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.High
			}),
			icon: "sap-icon://edit",
			text: "Edit",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.EditMenu(oControlEvent, oView);
			}	
		});
		
		oSwitchView = new sap.m.OverflowToolbarButton ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.High
			}),
			icon: "sap-icon://switch-views",
			type: "Transparent",
			text: "View By",
			press: function(oControlEvent) {
				IomyRe.navigation.GroupMenu(oControlEvent, oView);
			}	
		});
		
		oSettings = new sap.m.Button (oView.createId("openMenu"), {
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.High
			}),
			text: "Hi, Freshwater1!",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.UserMenu(oControlEvent, oView);
			}	
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Create the Tool Header itself    --//
		//----------------------------------------------------//
		oToolHeader = new sap.tnt.ToolHeader ({
			content : [
				oNavButton, oToolbarSpacer1, oLogo, oToolbarSpacer2, oAdd, oEdit, oSwitchView, oSettings
			]
		});
			
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//		
		return oToolHeader;
	},
	
	
	//-- Side Navigation for all pages --//
	getToolPageSideContent : function (oCurrentController) {
	
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//
		
		var oToolSideNav;		//-- OBJECT:	This variable stores the ToolPage header and is returned.		--//
		var oNavHome;			//-- OBJECT:	Stores the UI5 List Item that holds the Home Select				--//
		var oNavDevices;		//-- OBJECT:	Stores the UI5 List Item that holds the Devices Select			--//
		var oNavPremise;		//-- OBJECT:	Stores the UI5 List Item that holds the Premise Select			--//
		var oNavRoom;			//-- OBJECT:	Stores the UI5 List Item that holds the Room Select				--//
		var oNavRules;			//-- OBJECT:	Stores the UI5 List Item that holds the Rules Select			--//
		var oNavUsers;			//-- OBJECT:	Stores the UI5 List Item that holds the Users Select			--//
		var oNavLinks;			//-- OBJECT:	Stores the UI5 List Item that holds the Important Links Select  --//
		var oNavLegal;			//-- OBJECT:	Stores the UI5 List Item that holds the Legal Select			--//
	
		//----------------------------------------------------//
		//-- 2.0 - Create ToolHeader Side Content           --//
		//----------------------------------------------------//
		
		oNavHome = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://home",
			text: "Home",
			select : function () {
				IomyRe.common.NavigationChangePage( "pBlock" , {} , false);
			}
		});
		
		oNavDevices = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://it-system",
			text: "Devices",
			select : function () {
				IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
			}
		});
		
		oNavPremise = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://building",
			text: "Premise",
			select : function () {
				IomyRe.common.NavigationChangePage( "pPremise" , {} , false);
			}
		});
		
		oNavRoom = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://idea-wall",
			text: "Room",
			select : function () {
				IomyRe.common.NavigationChangePage( "pRoomList" , {bEditing: false} , false);
			}
		});
		
		oNavRules = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://add-activity",
			text: "Rules",
			select : function () {
				IomyRe.common.NavigationChangePage( "pRulesList" , {} , false);
			}
		});
		
		oNavUsers = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://family-protection",
			text: "Users",
			select : function () {
				IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
			}
		});
		
		oNavLinks = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://chain-link",
			text: "Important Links",
			select : function () {
				IomyRe.common.NavigationChangePage( "pUserForm" , {} , false);
			}
		});
		
		oNavLegal = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://compare",
			text: "Legal Information",
			select : function () {
				IomyRe.common.NavigationChangePage( "" , {} , false);
			}
		});
		
		
		//----------------------------------------------------//
		//-- 3.0 - Create the Tool Side NavigationList      --//
		//----------------------------------------------------//
		oToolSideNav = new sap.tnt.SideNavigation ({
			expanded : true,
			item : new sap.tnt.NavigationList ({
				items : [
					oNavHome, oNavDevices, oNavPremise, oNavRoom, oNavRules, oNavUsers
				]
			}),
			fixedItem : new sap.tnt.NavigationList ({
				items : [
					oNavLinks, oNavLegal
				]
			}),
			footer : new sap.tnt.NavigationList ({
				items : [
					
				]
			})
		});
		
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//	
		return oToolSideNav;
	},
	
	//-- CSR Button for the "Day Light Mode" button --//
	CSRbutton : function (oCurrentController) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//		
		
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		var oDescLabel;
		var oWhiteLight;
		var oCSRHBox;
		
		//----------------------------------------------------//
		//-- 2.0 - Create the Hbox Content                  --//
		//----------------------------------------------------//
		oWhiteLight = new sap.m.Switch ({
			
		});
		
		oDescLabel = new sap.m.Label ({
			text: "Day Light Mode",
			
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Fill the CSR HBox                        --//
		//----------------------------------------------------//
		oCSRHBox = new sap.m.VBox (oView.createId("WhiteLight_Cont"),{
			width: "71px",
			height: "100%",
			items : [
				oDescLabel, oWhiteLight
			]
		}).addStyleClass("ElementCenter");
		
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//	
		
		return oCSRHBox;
		
	},
	
	
	//-- Scroll Container for the "RGB" colorpicker --//
	RGBContainer : function (oCurrentController, mSettings) {
		var oScrollContainer;
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
        
        //--------------------------------------------------------------------//
        // Find the parameters map for the widget
        //--------------------------------------------------------------------//
        if (mSettings === undefined || mSettings === null) {
            mSettings = {};
        }
        
        mSettings.mode = sap.ui.unified.ColorPickerMode.HSV;
		
		oScrollContainer = new sap.m.ScrollContainer (oView.createId("RGB_Cont"), {
			width: "100%",
			height: "100%",
			vertical : true,
			content : [
				new sap.ui.unified.ColorPicker (oView.createId("CPicker"), mSettings).addStyleClass("ElementChildCenter PadTop2d0Rem")
			]
		});
		
		return oScrollContainer;
	},
	
	//-- Scroll Container for the "Mjpeg" image --//
	MJPEGCont : function (oCurrentController, mSettings) {
		var oScrollContainer;
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
        
        //--------------------------------------------------------------------//
        // Find the parameters map for the widget
        //--------------------------------------------------------------------//
        if (mSettings === undefined || mSettings === null) {
            mSettings = {};
        }
        
        mSettings.width     = "75%";
        mSettings.height    = "75%";
        mSettings.alt       = "Stream not available";
		
		oScrollContainer = new sap.m.ScrollContainer (oView.createId("MJPEG_Cont"), {
			width: "100%",
			height: "100%",
			vertical : true,
			content : [
				new sap.m.Image (oView.createId("MJPEG_Img"), mSettings).addStyleClass("MarLeft14Per")
			]
		});
		
		return oScrollContainer;
	},
	
	//-- Provides the "Page" with a Title --//
	DeviceToolbar : function (oCurrentController, sDevName) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//	
		var oToolbar;
		var oDevTitle;
		var oTSpacer1;
		var oTSpacer2;
		
		//----------------------------------------------------//
		//-- 2.0 - Create the Content                       --//
		//----------------------------------------------------//
		oDevTitle = new sap.m.Title ({
			text: sDevName
		});
		
		oTSpacer1 = new sap.m.ToolbarSpacer({});
		oTSpacer2 = new sap.m.ToolbarSpacer({});
		//----------------------------------------------------//
		//-- 3.0 - Fill the Toolbar                         --//
		//----------------------------------------------------//
		oToolbar = new sap.m.Toolbar ({
			content : [
				oTSpacer1, oDevTitle, oTSpacer2
			]
		});
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//
		
		return oToolbar;
	},
	
	UserForm : function (oCurrentController, sPageSectionID, sSubSectionID, sFormID, bEditable, sSectionTitle) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//	
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		var oPageSection;
		var oSubSection;
		
		//----------------------------------------------------//
		//-- 2.0 - Create the Content                       --//
		//----------------------------------------------------//
		oSubSection = new sap.uxap.ObjectPageSubSection(oView.createId(sSubSectionID), {
			blocks : [
				new sap.ui.layout.form.Form( oView.createId(sFormID),{
					editable: bEditable,
					layout : new sap.ui.layout.form.ResponsiveGridLayout ({
						labelSpanXL: 3,
						labelSpanL: 3,
						labelSpanM: 3,
						labelSpanS: 12,
						adjustLabelSpan: false,
						emptySpanXL: 3,
						emptySpanL: 2,
						emptySpanM: 0,
						emptySpanS: 0,
						columnsXL: 1,
						columnsL: 1,
						columnsM: 1,
						columnsS: 1,
						singleContainerFullSize: false
					}),
					toolbar : new sap.m.Toolbar({
						content : [
							new sap.m.Title ({
								text: sSectionTitle
							})
						]
					}).addStyleClass("MarBottom1d0Rem"),
					formContainers : [
					
					]
				})
			]
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Fill the Page Section                    --//
		//----------------------------------------------------//
		oPageSection = new sap.uxap.ObjectPageSection(oView.createId(sPageSectionID), {
			visible: false,
			showTitle: false,
			title: sSectionTitle,
			subSections : [
				oSubSection
			]
		});
		
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//
		return oPageSection;
	},
    
    
    //------------------------------------------------------------------------//
    // The select boxes
    //------------------------------------------------------------------------//
    
	/**
     * Returns a select box containing a list of device types and onvif servers
     * 
     * @param {string} sId          ID for the select box.
     * @param {object} mSettings    Map containing parameters.
     * 
     * @returns {sap.m.Select}      Select box with the options.
     * 
     * @throws IllegalArgumentException if either the ID or the settings map is of an incorrect type.
     */
    selectBoxNewDeviceOptions : function (sId, mSettings) {
        //================================================================//
		// Declare Variables
		//================================================================//
		try {
            var aaOptions = IomyRe.functions.getNewDeviceOptions();
            var oSBox;
            var sID;
        } catch (e) {
            jQuery.sap.log.error(e.name+": "+e.message);
        }

        
		//================================================================//
        // Process any settings and create the select box
		//================================================================//
        if (typeof sId === "string") {
            sID = sId;
            
            if (typeof mSettings === "object") {

                if (mSettings === undefined) {
                    mSettings = {};
                }

                mSettings.items = [
                    new sap.ui.core.Item ({
                        text: "Please choose a device type",
                        key: "start"
                    })
                ];

                oSBox = new sap.m.Select(sId, mSettings);
                
            } else {
                throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
            }
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            
            oSBox = new sap.m.Select(mSettings);
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
		

		$.each(aaOptions, function(sIndex,mEntry) {
			if( sIndex!==undefined && sIndex!==null && mEntry!==undefined && mEntry!==null ) {
				oSBox.addItem(
					new sap.ui.core.Item({
						text : mEntry.Name,
						key : sIndex
					})
				);
			}
		});
		
		//oSBox.setSelectedKey(null);

		return oSBox;
    },
    
    /**
     * Returns a select box containing a list of rooms within a given premise. Can also
     * receive the ID of the room that is currently selected if changing from one room
     * to another.
     * 
     * @param {object} mSettings        Parameters
     * @returns {sap.m.Select}          Select box with the rooms in a given premise.
     * 
     * @throws NoRoomsFoundException when there are no rooms visible to the user.
     */
    selectBoxRoom : function (sId, mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var aItems              = [];
        var aFirstItem          = [];
        var iFirstRoomId        = null;
        var mTemplate           = null;
        var sModelPath;
        var sPremiseId;
        var iRoomId;
        var bIncludeUnassigned;
        var bAddAllRoomOption;
        var oSBox;
        
        if (typeof sId === "string") {
            
            if (mSettings !== undefined && mSettings !== null) {
                if (typeof mSettings !== "object") {
                    throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
                }
            } else {
                mSettings = {};
            }
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            sId = null;
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
        
        if (mSettings !== undefined) {
            
            if (mSettings.premiseID === undefined || mSettings.premiseID === null) {
                
                //--------------------------------------------------------------------//
                // Fetch the premise ID.
                // 
                // NOTE: This currently selects the first premise in the list, which is
                // normally the only one in the list. When we start adding support for
                // multiple premises, this code will need to be redone.
                //--------------------------------------------------------------------//
                $.each(IomyRe.common.PremiseList, function (sI, mPremise) {
                    sPremiseId = sI;
                    return false;
                });
                
            } else {
                sPremiseId = mSettings.premiseID;
                
                if (isNaN(sPremiseId)) {
                    if (sPremiseId.charAt(0) !== '_') {
                        bError = true;
                        aErrorMessages = "Premise ID is not in a valid format.";
                    }
                } else {
                    sPremiseId = "_" + sPremiseId;
                }
            }
            
            if (mSettings.roomID === undefined || mSettings.roomID === null) {
                iRoomId = null;
            } else {
                iRoomId = mSettings.roomID;
            }
            
            if (mSettings.showUnassigned === undefined || mSettings.showUnassigned === null) {
                bIncludeUnassigned = false;
            } else {
                bIncludeUnassigned = mSettings.showUnassigned;
            }
            
            if (mSettings.showAllRoomOption === undefined || mSettings.showAllRoomOption === null) {
                bAddAllRoomOption = false;
            } else {
                bAddAllRoomOption = mSettings.showAllRoomOption;
            }
            
            if (mSettings.template !== undefined && mSettings.template !== null && mSettings.template !== false) {
                var mTemplateSettings = mSettings.template;
                
                if (mTemplateSettings.path === undefined || mTemplateSettings.path === null) {
                    bError = true;
                    aErrorMessages = "Path to the data in the model has not been specified.";
                }
                
                if (mTemplateSettings.item === undefined || mTemplateSettings.path === null) {
                    bError = true;
                    aErrorMessages = "Item template is not given.";
                } else if (mTemplateSettings.path instanceof sap.ui.core.Item) {
                    bError = true;
                    aErrorMessages = "Item template is not a valid UI5 Item (sap.ui.core.Item).";
                }
                
                if (!bError) {
                    mTemplate = {
                        path : mTemplateSettings.path,
                        template : mTemplateSettings.item
                    };
                }
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
        } else {
            //--------------------------------------------------------------------//
            // Fetch the premise ID.
            // 
            // NOTE: This currently selects the first premise in the list, which is
            // normally the only one in the list. When we start adding support for
            // multiple premises, this code will need to be redone.
            //--------------------------------------------------------------------//
            $.each(IomyRe.common.PremiseList, function (sI, mPremise) {
                sPremiseId = sI;
                return false;
            });
            
            iRoomId = null;
            bIncludeUnassigned = false;
            bAddAllRoomOption = false;
        }
        
        try {
            //====================================================================//
            // Declare Variables                                                  //
            //====================================================================//
            var iRoomsCounted = 0;
            var bHasUnassignedRoom = false;
            
            if (bIncludeUnassigned === undefined || bIncludeUnassigned === null) {
                bIncludeUnassigned = false;
            }

            //====================================================================//
            // Create the Select Box                                              //
            //====================================================================//
            if (sap.ui.getCore().byId(sId) !== undefined) {
                sap.ui.getCore().byId(sId).destroy();
            }
            
            if (mTemplate === null) {
                if (IomyRe.common.RoomsList[sPremiseId] !== undefined) {

                    aFirstItem.push(
                        new sap.ui.core.Item({
                            "text" : "Please select a room",
                            "key" : -1
                        })
                    );

                    if (bAddAllRoomOption) {
                        aFirstItem.push(
                            new sap.ui.core.Item({
                                "text" : "All Rooms",
                                "key" : 0
                            })
                        );
                    }

                    $.each(IomyRe.common.RoomsList[sPremiseId],function(sIndex,aRoom) {
                        //-- Verify that the Premise has rooms, other than the pseudo-room Unassigned --//
                        if( sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null)
                        {
                            if (aRoom.RoomId === 1 && aRoom.RoomName === "Unassigned" && !bIncludeUnassigned) {
                                bHasUnassignedRoom = true;

                            } else {
                                if (iFirstRoomId === null) {
                                    iFirstRoomId = aRoom.RoomId;
                                }

                                aItems.push(
                                    new sap.ui.core.Item({
                                        "text" : aRoom.RoomName,
                                        "key" : aRoom.RoomId
                                    })
                                );

                                iRoomsCounted++;
                            }
                        }
                    });

                    aItems = aFirstItem.concat(aItems);

                    mSettings.items = aItems;

                    if (sId !== null) {
                        oSBox = new sap.m.Select(sId, mSettings);

                    } else {
                        oSBox = new sap.m.Select(mSettings);
                    }

                    if (iRoomsCounted > 0) {
                        if (iRoomId !== undefined && iRoomId !== null) {
                            oSBox.setSelectedKey(iRoomId);
                        } else {
                            oSBox.setSelectedKey(iFirstRoomId);
                        }

                    } else {
                        if (bHasUnassignedRoom) {
                            oSBox.destroyItems();
                            oSBox.addItem(
                                new sap.ui.core.Item({
                                    text : "No rooms configured"
                                })
                            );
                            oSBox.setEnabled(false);
                        } else {
                            throw new NoRoomsFoundException();
                        }
                    }

                } else {
                    throw new NoRoomsFoundException();
                }
                
            } else {
                mSettings.items = mTemplate;

                if (sId !== null) {
                    oSBox = new sap.m.Select(sId, mSettings);

                } else {
                    oSBox = new sap.m.Select(mSettings);
                }
            }
            
            return oSBox;

        } catch (e) {
            e.message = "Error in IomyRe.widgets.selectBoxRoom(): "+e.message;
            throw e;
        }
    },
    
    /**
     * Returns a select box containing a list of hubs accessible to the current user.
     * Can also accept a hub ID to immediately set that particular hub as currently
     * selected.
     * 
     * @param {string} sId          ID for the select box.
     * @param {Number} iHubId       ID of the given hub.
     * @returns {mixed}             Either the select box filled with hubs or a text widget with an error message.
     */
    selectBoxHub : function (sId, mSettings, iHubId) {
        var bError              = false;
        var aErrorMessages      = [];
        var iFirstHubId         = null;
        var aItems              = [];
        var aFirstItem          = [];
        var mTemplate           = null;
        var sID;
        var oSBox;
        
        if (typeof sId === "string") {
            sID = sId;
            
            if (mSettings !== undefined && mSettings !== null) {
                if (typeof mSettings !== "object") {
                    throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
                }
            }
            
            oSBox = new sap.m.Select(sID, {
                enabled : false
            });
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            
            oSBox = new sap.m.Select({
                enabled : false
            });
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
        
        if (mSettings.template !== undefined && mSettings.template !== null && mSettings.template !== false) {
            var mTemplateSettings = mSettings.template;

            if (mTemplateSettings.path === undefined || mTemplateSettings.path === null) {
                bError = true;
                aErrorMessages = "Path to the data in the model has not been specified.";
            }

            if (mTemplateSettings.item === undefined || mTemplateSettings.path === null) {
                bError = true;
                aErrorMessages = "Item template is not given.";
            } else if (mTemplateSettings.path instanceof sap.ui.core.Item) {
                bError = true;
                aErrorMessages = "Item template is not a valid UI5 Item (sap.ui.core.Item).";
            }

            if (!bError) {
                mTemplate = {
                    path : mTemplateSettings.path,
                    template : mTemplateSettings.item
                };
            } else {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
        }
        
        try {
            //====================================================================//
            // Clean up                                                           //
            //====================================================================//
            if (sap.ui.getCore().byId(sId) !== undefined) {
                sap.ui.getCore().byId(sId).destroy();
            }

            //====================================================================//
            // Create the Select Box
            //====================================================================//
            if (mTemplate === null) {
                aFirstItem.push(
                    new sap.ui.core.Item({
                        "text" : "Please select a hub",
                        "key" : -1
                    })
                );

                $.each(IomyRe.common.HubList, function (sI, mHub) {
                    if (iFirstHubId === null) {
                        iFirstHubId = mHub.HubId;
                    }

                    aItems.push(
                        new sap.ui.core.Item({
                            text : mHub.HubName,
                            key : mHub.HubId
                        })
                    );
                });

                aItems = aFirstItem.concat(aItems);
                mSettings.items = aItems;

                if (sId !== null) {
                    oSBox = new sap.m.Select(sId, mSettings);

                } else {
                    oSBox = new sap.m.Select(mSettings);
                }

                if (iHubId !== undefined && iHubId !== null) {
                    oSBox.setSelectedKey(iHubId);
                } else {
                    oSBox.setSelectedKey(iFirstHubId);
                }
            
            } else {
                mSettings.items = mTemplate;

                if (sId !== null) {
                    oSBox = new sap.m.Select(sId, mSettings);

                } else {
                    oSBox = new sap.m.Select(mSettings);
                }
            }
            
            return oSBox;
            
        } catch (e) {
            e.message = "Error in IomyRe.widgets.selectBoxHub(): "+e.message;
            throw e;
            
        }
    },
    
    /**
     * Returns a select box that will contain any Zigbee or Rapid HA modems that
     * were detected. This function refreshes the Comm list to get the latest
     * information which will run an AJAX request.
     * 
     * The select box itself will be returned, but the list may still be
     * generated, thus the widget will remain disabled until completed. Parsing
     * the success and fail callbacks is recommended for additional actions.
     * 
     * If no modems are detected neither of the callbacks will run and will
     * display a message in the widget saying so. The widget will remain
     * disabled.
     * 
     * @param {object} mSettings        Parameters
     * @returns {sap.m.Select}          Select box with the modems.
     * 
     * @throws NoRoomsFoundException when there are no rooms visible to the user.
     */
    selectBoxZigbeeModem : function (sId, mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var iModemCount         = 0;
        var mTemplate           = null;
        var sID;
        var oSBox;
        var fnSuccess;
        var fnFail;
        
        if (typeof sId === "string") {
            sID = sId;
            
            if (mSettings !== undefined && mSettings !== null) {
                if (typeof mSettings !== "object") {
                    throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
                }
            }
            
            mSettings.enabled = false;
            
            oSBox = new sap.m.Select(sId, mSettings);
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            mSettings.enabled = false;
            
            sId = null;
            
            oSBox = new sap.m.Select(mSettings);
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
        
        if (mSettings !== undefined) {
            if (mSettings.template !== undefined && mSettings.template !== null && mSettings.template !== false) {
                var mTemplateSettings = mSettings.template;

                if (mTemplateSettings.path === undefined || mTemplateSettings.path === null) {
                    bError = true;
                    aErrorMessages = "Path to the data in the model has not been specified.";
                }

                if (mTemplateSettings.item === undefined || mTemplateSettings.path === null) {
                    bError = true;
                    aErrorMessages = "Item template is not given.";
                } else if (mTemplateSettings.path instanceof sap.ui.core.Item) {
                    bError = true;
                    aErrorMessages = "Item template is not a valid UI5 Item (sap.ui.core.Item).";
                }

                if (!bError) {
                    mTemplate = {
                        path : mTemplateSettings.path,
                        template : mTemplateSettings.item
                    };
                } else {
                    throw new IllegalArgumentException(aErrorMessages.join("\n"));
                }
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        try {
            IomyRe.common.RefreshCommList({

                onSuccess : function () {

                    var iFirstModem = null;

                    $.each(IomyRe.common.CommList, function (sI, mComm) {

                        if (mComm.CommTypeId == IomyRe.devices.zigbeesmartplug.CommTypeId) {
                            if (iFirstModem === null) {
                                iFirstModem = mComm.CommId;
                            }

                            oSBox.addItem(
                                new sap.ui.core.Item({
                                    key : mComm.CommId,
                                    text : mComm.CommName
                                })
                            );

                            iModemCount++;
                        }

                    });

                    if (iModemCount > 0) {
                        oSBox.setSelectedKey(iFirstModem);

                        oSBox.setEnabled(true);
                        fnSuccess();

                    } else {
                        oSBox.addItem(
                            new sap.ui.core.Item({
                                key : -1,
                                text : "No modems detected"
                            })
                        );
                    }
                }

            });
            
            return oSBox;

        } catch (e) {
            e.message = "Error in IomyRe.widgets.selectBoxZigbeeModem(): "+e.message;
            throw e;
        }
    },
    
    selectBoxOnvifProfiles : function (sId, mSettings) {
        var sID;
        var iLinkId;
        var oSBox;
        var fnSuccess;
        var fnFail;
        
        if (typeof sId === "string") {
            sID = sId;
            
            if (mSettings !== undefined && mSettings !== null) {
                if (typeof mSettings !== "object") {
                    throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
                }
            } else {
                mSettings.enabled = false;
            }
            
            oSBox = new sap.m.Select(sID, mSettings);
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            mSettings.enabled = false;
            
            oSBox = new sap.m.Select(mSettings);
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
        
        if (mSettings !== undefined) {
            if (mSettings.linkID === undefined || isNaN(mSettings.linkID)) {
                throw new IllegalArgumentException("Link ID must be given and be a valid number");
            } else {
                iLinkId = mSettings.linkID;
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            throw new MissingSettingsMapException("Settings object must be parsed. It must contain a valid 'linkID' parameter.");
        }
        
        try {
            IomyRe.devices.onvif.LookupProfiles({
                linkID : iLinkId,
                
                onSuccess : function (aProfiles) {
                    
                    for (var i = 0; i < aProfiles.length; i++) {
                        oSBox.addItem(
                            new sap.ui.core.Item({
                                "key" : aProfiles[i].ProfileToken,
                                "text" : aProfiles[i].ProfileName
                            })
                        );
                    }
                },
                
                onFail : function () {
                    oSBox.addItem(
                        new sap.ui.core.Item({
                            "text" : "Failed to load profiles."
                        })
                    );
                }
            });
            
            return oSBox;
        } catch (e) {
            e.message = "Error in IomyRe.widgets.selectBoxOnvifProfiles(): "+e.message;
            throw e;
        }
    },
    
    selectBoxOnvifServer : function (sId, mSettings) {
        var bFirstElementFound  = false;
        var bEnabled            = true;
        var aItems              = [];
        var aFirstItem          = [];
        var sID;
        var oSBox;
        var fnSuccess;
        var fnFail;
        
        if (typeof sId === "string") {
            sID = sId;
            
            if (mSettings !== undefined && mSettings !== null) {
                if (typeof mSettings !== "object") {
                    throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
                }
            } else {
                mSettings = {};
                mSettings.enabled = false;
            }
            
            //oSBox = new sap.m.Select(sID, mSettings);
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            mSettings.enabled = false;
            sId = null;
            
            //oSBox = new sap.m.Select(mSettings);
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
        
        if (mSettings !== undefined) {
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        try {
            
            aFirstItem.push(
                new sap.ui.core.Item({
                    text : "Please select Onvif device",
                    key : -1
                })
            );
        
            $.each(IomyRe.common.LinkList, function (sI, mLink) {
                
                if (!bFirstElementFound) {
                    bFirstElementFound = true;
                }
                
                if (mLink.LinkTypeId == IomyRe.devices.onvif.LinkTypeId) {
                    aItems.push(
                        new sap.ui.core.Item({
                            key : mLink.LinkId,
                            text : mLink.LinkName
                        })
                    );
                }
                
            });
            
            if (!bFirstElementFound) {
                aItems.push(
                    new sap.ui.core.Item({
                        text : "No Onvif cameras or servers detected."
                    })
                );
            
                bEnabled = false;
                
            } else {
                aItems = aFirstItem.concat(aItems);
            }
            
            mSettings.items = aItems;
            mSettings.enabled = bEnabled;
            
            if (sId !== null) {
                oSBox = new sap.m.Select(sId, mSettings);

            } else {
                oSBox = new sap.m.Select(mSettings);
            }
            
            return oSBox;
        } catch (e) {
            e.message = "Error in IomyRe.widgets.selectBoxOnvifServer(): "+e.message;
            throw e;
        }
    }
    
});