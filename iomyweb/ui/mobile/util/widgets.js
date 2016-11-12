/*
Title: iOmy Widgets Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Modified: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Description: Functions that create commonly used purpose-built UI5 widgets that
    are used across multiple pages.
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

$.sap.declare("IOMy.widgets",true);

IOMy.widgets = new sap.ui.base.Object();

$.extend(IOMy.widgets,{
    
    extrasMenuOpen : false,
    
	
    /**
     * Constructs the IOMy footer that appears on every page. It has the help
     * button (which invokes IOMy.functions.showHelpDialog()), and the 
     * Capsicum Corporation logo.
     * 
     * @returns {sap.m.Bar}     App Footer
     */
	getAppFooter : function () {
		var oFooter = new sap.m.Bar({
			contentLeft : [
				new sap.m.Button({
					text:	"Help",
                    icon:   "sap-icon://GoogleMaterial/help",
					iconFirst: false,
					press : function () {
						IOMy.functions.showHelpDialog();
					}
				}).addStyleClass("FooterHelpButton IOMYButton MarTop9px MarLeft10px width85px TextLeft Text_white")
            ],
			contentRight : [
                new sap.m.Image({
                    densityAware: false,
                    src : "resources/images/logo/capcorplogo.png"
                })
            ],
			design:"Footer"
		}).addStyleClass("footerMBarContainer FooterBackgroundColour");
		
		return oFooter;
	},
	
	//--------------------------------------------------------------------------------------------------------//
	//-- This is used to draw the Page Header (which is located one every page but the "Login" Page).       --//
	//-- It will display the Open Navigation Menu and the App Logo                                          --//
	//--------------------------------------------------------------------------------------------------------//
    /**
     * Constructs the header bar for IOMy located one every page but the "Login" or
     * "Switch User" Pages. Contains the menu button on the left to
     * bring up the IOMy app menu. In the middle is the IOMy logo, and on the right
     * is a placeholder for a button that brings up a menu with extra options pertaining
     * to the current page. This button appears only on certain pages.
     * 
     * @param {object} oCurrentController    UI5 Controller or View that the app header appears on
     * @returns {sap.m.Bar}                 App Header
     */
	getIOMYPageHeaderNav : function ( oCurrentController ) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//
		var me				= this;				//-- SCOPE:		Bind the current scope to a variable for other subfunctions,etc --//
		var oHeader;							//-- OBJECT:	This variable stores the Page header and is returned. --//
		var oLogoImg;							//-- OBJECT:	Stores the UI5 Object that is used to hold the scaled down version of the icon --//
		var oNavOpenBtn;						//-- OBJECT:	Stores the UI5 Button that holds the Navigation Open Button				--//
		
		//----------------------------------------------------//
		//-- 2.0 - Left Content                             --//
		//----------------------------------------------------//
		oNavOpenBtn = new sap.m.Button({
			icon:	"sap-icon://GoogleMaterial/menu",
			type:	sap.m.ButtonType.Unstyled,
			press:	function(oControlEvent) {
				//oCurrentController.onOpenNavMenu( oControlEvent );
				if(!oCurrentController.oNavMenu) {
					oCurrentController.oNavMenu = sap.ui.jsfragment("mjs.fragments.NavMenu", oCurrentController );
					oCurrentController.getView().addDependent( oCurrentController.oNavMenu );
					
				}
				
				var oButton = oControlEvent.getSource();
				//-- Wait for UI5 to do the redraw after adding the Fragment so that the fragment is loaded before it is opened --//
				$.sap.delayedCall(0, oCurrentController, function() {
					if (oCurrentController.oNavMenu.isOpen())
                        oCurrentController.oNavMenu.close();
                    else
                        oCurrentController.oNavMenu.openBy( oButton );
				});
			}
		}).addStyleClass("NavButton");
        
        //----------------------------------------------------//
		//-- 3.0 - Right Content Create Logo                --//
		//----------------------------------------------------//
		oLogoImg = new sap.m.Image({
			densityAware: false,
			src : "resources/images/minilogo.png",
			press: function(oControlEvent) {
				IOMy.common.NavigationReturnToHome();
			}
		}).addStyleClass("BG_white PadAll2px MarTop3px MainHeadingMiniLogo");
		
		//----------------------------------------------------//
		//-- 4.0 - Create the Page Header Section itself    --//
		//----------------------------------------------------//
		oHeader = new sap.m.Bar({
			design:	"Header",
			contentLeft:[oNavOpenBtn],
            contentMiddle:[oLogoImg],
			contentRight:[
				new sap.m.HBox({
                    items : [
                        new sap.m.VBox(oCurrentController.getView().createId("extrasMenuHolder"), {})
                    ]
                })
			]
		});
		
		//----------------------------------------------------//
		//-- 5.0 - Return the Results                       --//
		//----------------------------------------------------//
		return oHeader;
	},
	
	//========================================================================================================//
	//== IOMY NAVIGATIONAL SUB HEADER																		==//
	//========================================================================================================//
	//-- This is used to draw the Navigational Header (which is normally located below the Page Header).	--//
	//-- It will display the Page Title, Icon (if applicable) as well as the "Back" and "Forward" buttons	--//
	//--------------------------------------------------------------------------------------------------------//
    
    /**
     * Constructs the sub header that will situate just below the header. It will
     * have a title with an icon to the left of the title. There will also be back
     * and forward navigation buttons that will respectively appear if you can
     * navigate back or forward.
     * 
     * @param {string} sTitle       Page title to display
     * @param {string} sPageIcon    Icon to display to the left of the title
     * @param {mixed} oScope        UI5 Controller or View that will have the subheader.
     * @returns {sap.m.Bar}
     */
	getNavigationalSubHeader : function (sTitle, sPageIcon, oScope) {
		//--------------------------------------------//
		//-- 1.0 - Initialise						--//
		//--------------------------------------------//
		var me				= this;				//-- SCOPE:		Bind the current scope to a variable for other subfunctions,etc --//
		var oHeader;							//-- OBJECT:	This variable stores the Page header and is returned. --//
		var oTitleText;							//-- OBJECT:	This will hold the Title --//
		var oPageIcon;							//-- OBJECT:	This will hold the forward button that the user can click to go back a page --//
		var oBackBtn;							//-- OBJECT:	This will hold the back button that the user can click to go back a page --//
		var oForwardBtn;						//-- OBJECT:	This will hold the forward button that the user can click to go back a page --//
		
		//--------------------------------------------//
		//-- 2.0 - Create the objects				--//
		//--------------------------------------------//
		if( typeof oScope==="undefined" || oScope===false || oScope===null ) {
			
			//-- 2.1.1 - Left Content Back Button --//
			oBackBtn = new sap.m.Button({
				icon:	"sap-icon://navigation-left-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( false );
				}
			}).addStyleClass("BackForwardButton PadTop5px Text_grey_11 TextSize38px");
			
			//-- 2.1.2 - Page Icon (if applicable) --//
			if( sPageIcon!==undefined && sPageIcon!=="" ) {
				oPageIcon = new sap.ui.core.Icon({
					src : sPageIcon,
					//densityAware : false
				}).addStyleClass("NavHeader-Icon");
			} else {
				oPageIcon = new sap.m.Text({ text:"" });
			}
			
			
			//-- 2.1.3 - Center Content Title --//
			oTitleText = new sap.m.Text({
				text : sTitle
			}).addStyleClass("Font-Larger Text_black");
			
			
			//-- 2.1.4 - Right Content Forward button (if Applicable) --//
			oForwardBtn = new sap.m.Button({
				icon:	"sap-icon://navigation-right-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( true );
                    this.rerender();
				}
			}).addStyleClass("BackForwardButton PadTop5px Text_grey_11 TextSize38px");
			
		} else {
			
			//-- 2.2.1 - Left Content Back Button --//
			oBackBtn = new sap.m.Button( oScope.createId( "NavSubHead_BackBtn" ), {
				visible: false,
				icon:	"sap-icon://navigation-left-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( false );
				}
			}).addStyleClass("BackForwardButton Text_grey_11 PadTop5px TextSize38px");
			
			//-- 2.2.2 - Page Icon (if applicable) --//
			if( sPageIcon!==undefined && sPageIcon!=="" ) {
                oPageIcon = new sap.ui.core.Icon({
                    src : sPageIcon
                }).addStyleClass("TextSize40px NavHeader-Icon");
			} else {
				oPageIcon = new sap.m.Text({ text:"" });
			}
			
			
			//-- 2.2.3 - Center Content Title --//
			oTitleText = new sap.m.Text( oScope.createId( "NavSubHead_Title" ), {
				text : sTitle
			}).addStyleClass("Font-Larger Text_black NavHeader-Text");
			
			
			//-- 2.2.4 - Right Content Forward button (if Applicable) --//
			oForwardBtn = new sap.m.Button( oScope.createId( "NavSubHead_ForwardBtn" ), {
				visible: false,
				icon:	"sap-icon://navigation-right-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( true );
				}
			}).addStyleClass("BackForwardButton Text_grey_11 PadTop5px TextSize38px");
			
		}
		
		//--------------------------------------------//
		//-- 3.0 - Create the SubHeader itself		--//
		//--------------------------------------------//
		oHeader = new sap.m.Bar({
			contentLeft:[
                oBackBtn
            ],
			contentMiddle:[
                new sap.m.HBox({
                    items: [
                        oPageIcon,
                        oTitleText
                    ]
                })
            ],
			contentRight:[
                oForwardBtn
            ],
			design : sap.m.BarDesign.SubHeader
		}).addStyleClass("HeaderLower BG_white MaxWidth");
		
		//--------------------------------------------//
		//-- 4.0 - Return the Results				--//
		//--------------------------------------------//
		return oHeader;
	},
    
    /**
     * Returns a combo box containing a list of rooms within a given premise. Can also
     * receive the ID of the room that is currently selected if changing from one room
     * to another.
     * 
     * @param {string} sId          ID for the combo box.
     * @param {string} sPremiseId   ID of the given premise.
     * @param {Number} iRoomId      (optional) ID of the room currently set.
     * @returns {sap.m.ComboBox}    Combo box with the rooms in a given premise.
     */
    getRoomSelector : function (sId, sPremiseId, iRoomId) {
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Combo Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.ComboBox(sId,{}).addStyleClass("width100Percent");
            
            $.each(IOMy.common.RoomsList[sPremiseId],function(sIndex,aRoom) {
                //-- Verify that the Premise has rooms, other than the pseudo-room Unassigned --//
                if( sIndex !== "Unassigned" && sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null ) {
                    oCBox.addItem(
                        new sap.ui.core.Item({
                            text : aRoom.RoomName,
                            key : aRoom.RoomId
                        })
                    );
                }
            });

            if (iRoomId !== undefined)
                oCBox.setSelectedKey(iRoomId);//.addStyleClass("width100Percent SettingsDropdownInput");

            return oCBox;
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getRoomSelector(): "+e.message);
            return new sap.m.Text({text : "Failed to load the room combo box."});
        }
    },
	
    /**
     * Returns a combo box containing a list of premises accessible to the current user.
     * Can also accept a premise ID to immediately set that particular premise as the
     * current premise for a hub, for instance.
     * 
     * @param {string} sId          ID for the combo box.
     * @param {Number} iPremiseId   ID of the given premise.
     * @returns {sap.m.ComboBox}
     */
    getPremiseSelector : function (sId, iPremiseId) {
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Combo Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.ComboBox(sId,{});

            if (IOMy.common.PremiseList.length !== 0) {
                for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
                    oCBox.addItem(
                        new sap.ui.core.Item({
                            text : IOMy.common.PremiseList[i].Name,
                            key : IOMy.common.PremiseList[i].Id
                        })
                    );
                }

                if (iPremiseId !== undefined)
                    oCBox.setSelectedKey(iPremiseId);

                return oCBox;
            } else {
                return new sap.m.Text({text : "You have no premises."});
            }
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getPremiseSelector(): "+e.message);
            IOMy.common.showError("Failed to load the premise combo box\n\n"+e.message, "Error");
            return new sap.m.Text({text : "Failed to load the premise combo box."});
        }
    },
    
    /**
     * Returns a combo box containing a list of hubs accessible to the current user.
     * Can also accept a hub ID to immediately set that particular hub as currently
     * selected.
     * 
     * @param {string} sId          ID for the combo box.
     * @param {Number} iPremiseId   ID of the given hub.
     * @returns {mixed}             Either the combo box filled with hubs or a text widget with an error message.
     */
    getHubSelector : function (sId, iHubId) {
        var oElement;
        
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Combo Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.ComboBox(sId,{});

            for (var i = 0; i < IOMy.common.HubList.length; i++) {
                oCBox.addItem(
                    new sap.ui.core.Item({
                        text : IOMy.common.HubList[i].HubName,
                        key : IOMy.common.HubList[i].HubId
                    })
                );
            }

            if (iHubId !== undefined)
                oCBox.setSelectedKey(iHubId);

            oElement = oCBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getHubSelector(): "+e.message);
            IOMy.common.showError("Failed to load the hub combo box\n\n"+e.message, "Error");
            oElement = new sap.m.Text({text : "Failed to load the hub combo box."});
            
        } finally {
            
            return oElement; // Either a combo box or an error message.
        }
    },
    
    /**
     * Returns a combo box containing a list of links accessible to the current user.
     * Can also accept a link ID to immediately set that particular link type as the
     * current type for a link.
     * 
     * @param {string} sId          ID for the combo box.
     * @returns {mixed}             Either the combo box filled with links or a text widget with an error message.
     */
    getLinkSelector : function (sId, iLinkId) {
        var oElement;
        
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Combo Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.ComboBox(sId,{});

            for (var i = 0; i < IOMy.common.LinkList.length; i++) {
                oCBox.addItem(
                    new sap.ui.core.Item({
                        text : IOMy.common.LinkList[i].LinkName,
                        key : IOMy.common.LinkList[i].LinkId
                    })
                );
            }

            if (iLinkId !== undefined)
                oCBox.setSelectedKey(iLinkId);

            oElement = oCBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getLinkSelector(): "+e.message);
            IOMy.common.showError("Failed to load the link combo box\n\n"+e.message, "Error");
            oElement = new sap.m.Text({text : "Failed to load the link combo box."});
            
        } finally {
            
            return oElement; // Either a combo box or an error message.
        }
    },
    
    /**
     * Returns a combo box containing a list of link types accessible to the current user.
     * Can also accept a link type ID to immediately set that particular link type as the
     * current type for a link.
     * 
     * @param {string} sId          ID for the combo box.
     * @param {Number} iPremiseId   ID of the given premise.
     * @returns {mixed}             Either the combo box filled with link types or a text widget with an error message.
     */
    getLinkTypeSelector : function (sId, iLinkTypeId) {
        var oElement;
        
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Combo Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.ComboBox(sId,{});

            for (var i = 0; i < IOMy.common.LinkTypeList.length; i++) {
                if (IOMy.common.LinkTypeList[i].LinkTypeId == 2 ||
                        IOMy.common.LinkTypeList[i].LinkTypeId == 6 ||
                        IOMy.common.LinkTypeList[i].LinkTypeId == 7 ||
                        IOMy.common.LinkTypeList[i].LinkTypeId == 8) 
                {
                    oCBox.addItem(
                        new sap.ui.core.Item({
                            text : IOMy.common.LinkTypeList[i].LinkTypeName,
                            key : IOMy.common.LinkTypeList[i].LinkTypeId
                        })
                    );
                }
            }

            if (iLinkTypeId !== undefined)
                oCBox.setSelectedKey(iLinkTypeId);

            oElement = oCBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getLinkTypeSelector(): "+e.message);
            IOMy.common.showError("Failed to load the link type combo box\n\n"+e.message, "Error");
            oElement = new sap.m.Text({text : "Failed to load the link type combo box."});
            
        } finally {
            
            return oElement; // Either a combo box or an error message.
        }
    },
    
    getIPAddressAndPortField : function (mSettings) {
        // Check that there is a settings map.
        if (mSettings === undefined) {
            throw "Settings must be specified.";
        } else {
            var sErrors = ""; // Error string
            
            // Is the scope specified?
            if (mSettings.scope === undefined) {
                sErrors += "The scope of the controller must be parsed.";
            }
            
            // Is the IP Address Field ID specified?
            if (mSettings.ipAddressFieldID === undefined) {
                if (sErrors.length === 0) {
                    sErrors += "\n";
                }
                sErrors += "The HTML ID for the IP Address field must be given.";
            }
            
            // Is the IP Port Field ID specified?
            if (mSettings.ipPortFieldID === undefined) {
                if (sErrors.length === 0) {
                    sErrors += "\n";
                }
                sErrors += "The HTML ID for the IP Port field must be given.";
            }
            
            // If one or more of the required fields are not specified, throw the errors
            if (sErrors.length > 0) {
                throw sErrors;
            }
        }
        
        // If the default IP address and port are not given, leave them blank.
        if (mSettings.defaultIPAddress === undefined) {
            mSettings.defaultIPAddress = "";
        }
        
        if (mSettings.defaultIPPort === undefined) {
            mSettings.defaultIPPort = "80";
        }
        
        var me = mSettings.scope;
        var oIPAddressAndPortLabel;
        var oIPAddressField, oColon, oIPPort;
        var oIPAddressAndPortBox;
        var oWidget;
        
        try {
            // LABEL
            me.aElementsForAFormToDestroy.push("IPAddressLabel");
            oIPAddressAndPortLabel = new sap.m.Label(me.createId("IPAddressLabel"), {
                text : "IP Address and port (eg. 10.9.9.9:80)"
            });
            me.byId("formBox").addItem(oIPAddressAndPortLabel);

            // FIELD
            me.aElementsForAFormToDestroy.push(mSettings.ipAddressFieldID);
            oIPAddressField = new sap.m.Input(me.createId(mSettings.ipAddressFieldID), {
                value : mSettings.defaultIPAddress
            }).addStyleClass("width100Percent SettingsTextInput");

            me.aElementsForAFormToDestroy.push("Colon");
            oColon = new sap.m.Text(me.createId("Colon"), {
                text : ":"
            }).addStyleClass("PadLeft5px PadRight5px FlexNoShrink LineHeight45px");

            me.aElementsForAFormToDestroy.push(mSettings.ipPortFieldID);
            oIPPort = new sap.m.Input(me.createId(mSettings.ipPortFieldID), {
                value : mSettings.defaultIPPort
            }).addStyleClass("width100px SettingsTextInput FlexNoShrink");

            me.aElementsForAFormToDestroy.push("IPBox");
            oIPAddressAndPortBox = new sap.m.HBox(me.createId("IPBox"), {
                items : [ oIPAddressField,oColon,oIPPort ]
            }).addStyleClass("width100Percent IPAddressBox");
            me.byId("formBox").addItem(oIPAddressAndPortBox);
            
            me.aElementsForAFormToDestroy.push("IPWidget");
            oWidget = new sap.m.VBox(me.createId("IPWidget"), {
                items : [oIPAddressAndPortLabel,oIPAddressAndPortBox]
            });
            
        } catch (e) {
            
            jQuery.sap.log.error("Error in IOMy.widgets.getIPAddressAndPortField(): "+e.message);
            IOMy.common.showError("Failed to load the IP Address and Port field\n\n"+e.message, "Error");
            oWidget = new sap.m.Text({text : "Failed to load the IP Address and Port field."});
            
        } finally {
            
            return oWidget;
        }
    },
    
    /**************************************************************************\
    |* A widget that will return an extras button (sap-icon://overflow).      *|
    \**************************************************************************/
    /**
     * Constructs a button that will bring up a menu whose items are defined in the
     * mSettings.items variable.
     * 
     * @param {JS Object} mSettings     Map of parameters.
     * @return {sap.m.HBox}             Extras menu button
     */
    getExtrasButton : function (mSettings) {
        var me = this;
        // STEP 1: Create the menu items for the widget.
        var oNavList = new sap.tnt.NavigationList({});
        
        try {
            if (mSettings.items === undefined) {
                //-----------------------------------------------------------------------------//
                //-- 'items' has not been found. Throw an error.                             --//
                //-----------------------------------------------------------------------------//
                var sErrMessage = "Expected a list of items, 'items' not declared.";
                throw sErrMessage;
            } else {
                for (var i = 0; i < mSettings.items.length; i++) {
                    //----------------------------------------------------------------------------//
                    //-- Flags to indicate whether optional parameters are discovered           --//
                    //----------------------------------------------------------------------------//
                    var bCheckIcon   = false;
                    var bCheckSelect = false;

                    //----------------------------------------------------------------------------//
                    //-- PART 1 - Check to see what Parameters are passed                       --//
                    //----------------------------------------------------------------------------//
                    if( mSettings.items[i] ) {
                        //-- Check Text (REQUIRED) --//
                        if( mSettings.items[i].text === undefined ) {
                            // Throw an exception for debugging.
                            throw "'text' is not declared for one of the items. This is the item declared:\n\n"+JSON.stringify(mSettings.items[i]);
                        }
                        
                        //-- Check Icon --//
                        if( mSettings.items[i].icon ) {
                            bCheckIcon = true;
                        } else {
                            bCheckIcon = false;
                        }

                        //-- Check Select --//
                        if( mSettings.items[i].select ) {
                            bCheckSelect = true;
                        } else {
                            bCheckSelect = false;
                        }
                    }
                    
                    // Assign a default ID if one isn't defined.
                    // TODO: Remove this once all of the extras menu invocations use an ID.
                    if (mSettings.id === undefined) {
                        mSettings.id = "extrasMenu"; 
                    }

                    //----------------------------------------------------------------------------//
                    //-- PART 2 - Choose the correct button based upon what values are passed   --//
                    //----------------------------------------------------------------------------//
                    if( bCheckIcon===true && bCheckSelect===true ) {
                        //-- NORMAL BUTTON --//
                        oNavList.addItem(
                            new sap.tnt.NavigationListItem({
                                text: mSettings.items[i].text,
                                icon: mSettings.items[i].icon,
                                select:	mSettings.items[i].select
                            })
                        );
                    } else if( bCheckSelect===true ) {
                        oNavList.addItem(
                            new sap.tnt.NavigationListItem({
                                // [No Child Icon]",
                                text: mSettings.items[i].text,
                                select:	mSettings.items[i].select
                            })
                        );
                    } else if( bCheckIcon===true ) {
                        oNavList.addItem(
                            new sap.tnt.NavigationListItem({
                                // [No Child Select]",
                                text: mSettings.items[i].text,
                                icon: mSettings.items[i].icon,
                                select: function() {
                                    console.log("No select function has been configured by the UI Developer yet!");
                                }
                            })
                        );
                    } else {
                        oNavList.addItem(
                            new sap.tnt.NavigationListItem({
                                // [No Child Icon and no Child Select]",
                                text: mSettings.items[i].text,
                                select: function() {
                                    console.log("No select function has been configured by the UI Developer yet!");
                                }
                            })
                        );
                    }
                }
            }
        } catch (e) {
            jQuery.sap.log.error("STEP 1: Error creating the navigation list: "+e.message);
        }
        
        // STEP 2: Create the HBox that will contain the widget.
        try {
            var oWidget = new sap.m.HBox({
                items : [
                    new sap.m.VBox({
                        items : [
                            new sap.m.Button({
                                icon : mSettings.icon,
                                press : function (oControlEvent) {
                                    if (me.extrasMenuOpen === false) {
                                        // Get or create a new extra menu
                                        var oButton = oControlEvent.getSource();
                                        var oMenu;
                                        if (sap.ui.getCore().byId(mSettings.id) === undefined) {
                                            oMenu = new sap.m.Popover(mSettings.id, {
                                                placement: sap.m.PlacementType.Bottom,
                                                showHeader : false,
                                                content: [oNavList]
                                            }).addStyleClass("IOMYNavMenuContainer");
                                        } else {
                                            oMenu = sap.ui.getCore().byId(mSettings.id);
                                        }

                                        oMenu.attachAfterClose(function () {
                                            me.extrasMenuOpen = false;
                                        });
                                    
                                        oMenu.openBy(oButton);
                                        me.extrasMenuOpen = true;
                                    } else {
                                        sap.ui.getCore().byId(mSettings.id).close();
                                    }
                                }
                            }).addStyleClass("ButtonNoBorder IOMYButton TextCenter TextSize40px width100Percent")
                        ]
                    }).addStyleClass("")
                ]
            }).addStyleClass("width100Percent");

            return oWidget;
        } catch (e) {
            jQuery.sap.log.error("STEP 2: Error creating the widget: "+e.message);
        }
    },
    
    /**
     * Function that generates a page for the IOMy app with all the settings and widgets
     * preconfigured (navigation, header and footer).
     * 
     * Parameters are stored in a map, which is a JavaScript Object. Required parameters
     * are view, icon, and title. Other parameters are controller, and page ID (id). If
     * the controller isn't given, one can be extracted from the view. The default page
     * ID is "page". Leave id blank if you want to use the default ID.
     * 
     * The view is a sap.ui.jsview object. The controller is a sap.ui.controller object.
     * 
     * @param {map} mSettings       // Parameters placed in a map
     * @returns {object}            // sap.m.Page OR an empty object, {}
     */
    IOMyPage : function (mSettings) {
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        
        // Error checking
        var bError              = false;    // Unless indicated otherwise.
        var aErrorMessages      = [];       // Array of error messages.
        var sErrorMessage       = "";       // Final error message.
        // The Page itself
        var oPage               = {};
        
        //===============================================\\
        // VALIDATE REQUIRED ARGUMENTS
        //===============================================\\
        
        try {
            //== VIEW ==\\
            //--- If the view is undefined, then the page can't be created. ---\\
            if (mSettings.view === undefined) {
                bError = true; // Bugger.
                aErrorMessages.push("A UI5 view must be parsed.");

            //--- If it is parsed, check to see if it's actually a JS Object. ---\\
            } else if (typeof mSettings.view !== "object") {
                // If it's not, then that's an error.
                bError = true;
                aErrorMessages.push("view must be a JS Object (sap.ui.jsview).");
            }

            //== CONTROLLER ==\\
            //--- If there is a valid view, check the controller to see if it exists and is valid. ---\\
            if (mSettings.controller === undefined || typeof mSettings.controller !== "object") {
                //--- If not, see if a controller can be gathered from the view instead. ---\\
                try {

                    mSettings.controller = mSettings.view.getController();

                } catch (e) {
                    bError = true; // No.
                    aErrorMessages.push("Could not retrieve the controller: "+e.message);
                }
            }
            //== ID ==\\
            //--- Now see if the ID exists and is valid. ---\\
            if (mSettings.id === undefined || isNaN(mSettings.id) === false) {
                // Set the default ID which will be unique to its view if a valid ID does not exist.
                mSettings.id = "page";
            }

            //== TITLE ==\\
            //--- Every page needs a title... ---\\
            if (mSettings.title === undefined) {
                bError = true; // No title!
                aErrorMessages.push("Every page needs a title");

            //--- ...which must be a string ---\\
            } else if (typeof mSettings.title !== "string") {
                bError = true; // It's not a string.
                aErrorMessages.push("Title must be a string");
            }

            //== ICON ==\\
            //--- Every page needs an icon... ---\\
            if (mSettings.icon === undefined) {
                bError = true; // Where's the icon?
                aErrorMessages.push("Every page needs an icon");

            //--- ...which must be a string ---\\
            } else if (typeof mSettings.icon !== "string") {
                bError = true; // It's not a string.
                aErrorMessages.push("Title must be a string");
            }

            //===============================================\\
            // NOW CREATE THE PAGE IF IT ALL CHECKS OUT
            //===============================================\\

            if (bError === false) {
                try {
                    oPage = new sap.m.Page(mSettings.view.createId(mSettings.id), {
                        customHeader : IOMy.widgets.getIOMYPageHeaderNav( mSettings.controller ),
                        content: [IOMy.widgets.getNavigationalSubHeader(mSettings.title.toUpperCase(), mSettings.icon, mSettings.view)],
                        footer : IOMy.widgets.getAppFooter()
                    }).addStyleClass("height100Percent width100Percent MainBackground");
                } catch (e) {
                    // Something has gone wrong if this executes.
                    bError = true;
                    aErrorMessages.push("There was an error in creating the page: "+e.message);
                }

            }

        } catch (e) {
            // Something has gone wrong if this executes.
            bError = true;
            aErrorMessages.push("There : "+e.message);
        }
        
        if (bError === true) {
            sErrorMessage = aErrorMessages.join("\n");
            jQuery.sap.log.error(sErrorMessage);
            IOMy.common.showError(sErrorMessage, "Error");
            // Send the user back to the page so as not to get stuck.
            IOMy.common.NavigationTriggerBackForward(false);
        }
        return oPage; // Either the page or an empty JS Object
    }
});