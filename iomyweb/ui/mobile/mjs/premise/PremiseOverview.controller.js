/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.premise.PremiseOverview", {
	api : IOMy.apiphp,	
	common : IOMy.common,
	oData : IOMy.apiodata,
	
	rooms : [],
	aRoomIds : [],
    
    premisesExpanded : {},
    
    lastUpdated : new Date(),
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.premise.PremiseOverview
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				
				
				//------------------------------------------------------------//
				//-- 2.2 - Enable/Disable Navigational Forward Button       --//
				//------------------------------------------------------------//
				if( IOMy.common.NavigationForwardPresent()===true ) {
					me.byId("NavSubHead_ForwardBtn").setVisible(true);
				} else {
					me.byId("NavSubHead_ForwardBtn").setVisible(false);
				}
				
				if( IOMy.common.NavPagesCurrentIndex<=0 ) {
					console.log("Disable back button");
					//me.byId("NavSubHead_BackBtn").setVisible( false );
				} else {
					console.log("Don't disable back button");
				}
				
				//------------------------------------------------------------//
				//-- 2.3 - Other                                            --//
				//------------------------------------------------------------//
				
                me.composeRoomList();
			}
		});
	},
	
	composeRoomList : function () {
		var me = this;
		var thisView = me.getView();
        var iNumOfButtons = 0;
		
		if (me.byId("verticalBox") !== undefined)
			me.byId("verticalBox").destroy();
		
		if (me.timerInterval !== null)
			clearInterval(me.timerInterval);

		me.rooms = [];
		
		var rooms = IOMy.common.RoomsList;
		jQuery.sap.log.debug(JSON.stringify(rooms));
        
        //==============================================\\
        // CREATE THE TOP SECTION                       \\
        //==============================================\\
        var oTopButtons = new sap.m.FlexBox({}).addStyleClass("TextCenter FlexWrap");
        
        if (IOMy.common.RoomsList["_1"]["Unassigned"] !== undefined) {
            iNumOfButtons++;
            oTopButtons.addItem(
                new sap.m.HBox({
                    items : [
                        new sap.m.Image({
                            densityAware: false,
                            src : "resources/images/deviceIcon.png",
                            press: function (oControlEvent) {
                                var aUnassignedPseudoRoom = {
                                    "RoomId" : "Unassigned",
                                    "RoomName" : "Unassigned Devices",
                                    "PremiseId" : 1
                                };
                                IOMy.common.NavigationChangePage("pRoomsUnassignedDevices", {room : aUnassignedPseudoRoom});
                            }
                        }).addStyleClass("width40px MarTop4px MarLeft4px"),
                        new sap.m.VBox({
                            items : [
                                new sap.m.Button({
                                    text : "Unassigned Devices",
                                    //type : "Unstyled",
                                    press : function () {
                                        var aUnassignedPseudoRoom = {
                                            "RoomId" : "Unassigned",
                                            "RoomName" : "Unassigned Devices",
                                            "PremiseId" : 1
                                        };
                                        IOMy.common.NavigationChangePage("pRoomsUnassignedDevices", {room : aUnassignedPseudoRoom});
                                    }
                                }).addStyleClass("ButtonNoBorder IOMYButton PadTop5px PadBottom5px TextCenter TextSize16px width100Percent YellowLinkButton")
                            ]
                        }).addStyleClass("width100Percent"),
                        new sap.m.Link({
                            textAlign : "Center",
                            text : IOMy.functions.getNumberOfDevicesInRoom(0),
                            press : function () {
                                var aUnassignedPseudoRoom = {
                                    "RoomId" : "Unassigned",
                                    "RoomName" : "Unassigned Devices",
                                    "PremiseId" : 1
                                };
                                IOMy.common.NavigationChangePage("pRoomsUnassignedDevices", {room : aUnassignedPseudoRoom});
                            }
                        }).addStyleClass("NavMain_Data_Value_2DigitCircle MarTop10px MarRight5px")
                    ]
                }).addStyleClass("DynamicButton YellowLinkButton")
            );
        }
        
        iNumOfButtons++;
        oTopButtons.addItem(
            new sap.m.HBox({
                items : [
                    new sap.m.Image({
                        densityAware: false,
                        src : "resources/images/logo/logo-rooms.png",
                        press: function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsRoomAdd", {} );
                        }
                    }).addStyleClass("width40px MarTop4px MarLeft4px"),
                    new sap.m.VBox({
                        items : [
                            new sap.m.Button({
                                text : "New Room",
                                icon : "sap-icon://add",
                                iconFirst : false,
                                press : function () {
                                    IOMy.common.NavigationChangePage("pSettingsRoomAdd");
                                }
                            }).addStyleClass("ButtonNoBorder IOMYButton PadTop5px PadBottom5px TextCenter TextSize16px width100Percent GreenLinkButton")
                        ]
                    }).addStyleClass("width100Percent")
                ]
            }).addStyleClass((iNumOfButtons === 1 ? "width100Percent" : "DynamicButton")+" GreenLinkButton")
        );
		
        // Create the main placeholder
		var oVertBox = new sap.m.VBox(me.createId("verticalBox"), {
			items: [oTopButtons]
		});
        
        //==============================================\\
        // CREATE THE LIST OF PREMISES                  \\
        //==============================================\\

		// Layout Objects
		var oLayout = new sap.m.VBox({
			items: []
		}).addStyleClass("");

		// ID management
		var idCount = 0; 

		var oLine = new sap.ui.core.HTML({
			content : ["<div class='Line'></div>"]
		});
		oLayout.addItem(oLine);
        
        var iDevicesInRoom;
        var iRow = 0;
        var iPremiseRow = 0;
        var sRowBackgroundClass;

        $.each(rooms,function(sIndex,aPremise) {
            //-- Verify that the Premise has rooms --//
            if( sIndex!==undefined && sIndex!==null && aPremise!==undefined && aPremise!==null ) {
                // Clean up any old elements with IDs.
                if (me.byId("premiseName"+sIndex) !== undefined)
                    me.byId("premiseName"+sIndex).destroy();
                
                iPremiseRow = iPremiseRow % 2;
                
                //=========== Create the button to show/hide the list of rooms for this premise. =============\\
                oVertBox.addItem(
                    new sap.m.VBox({
                        items : [
                            new sap.m.Button(me.createId("premiseName"+sIndex), {
                                textAlign:	"Center",
                                icon : "sap-icon://down",
                                press : function () {
                                    if (me.premisesExpanded[sIndex] === false) {
                                        me.byId("premise"+sIndex).setVisible(true);
                                        me.premisesExpanded[sIndex] = true;
                                        this.setIcon("sap-icon://down");
                                    } else {
                                        me.byId("premise"+sIndex).setVisible(false);
                                        me.premisesExpanded[sIndex] = false;
                                        this.setIcon("sap-icon://media-play");
                                    }
                                }
                            }).addStyleClass("ButtonNoBorder IOMYButton ButtonIconWhite TextSize16px Text_white "+(iPremiseRow === 0 ? "BG_grey_13" : "BG_grey_11")+" width100Percent minheight20px")
                        ]
                    }).addStyleClass("width100Percent")
                ).addItem(
                    //=============== Create the placeholder for the room list. ===============\\
                    new sap.m.VBox(me.createId("premise"+sIndex), {
                        items : []
                    })
                );
                
                $.each(aPremise,function(sJndex,aRoom) {
                    if( sJndex!=="Unassigned" && sJndex!==undefined && sJndex!==null && aRoom!==undefined && aRoom!==null ) {
                        iRow = iRow % 2;
                        if (iRow === 0)
                            sRowBackgroundClass = "DeviceOverview-ItemContainerLight";
                        else if (iRow === 1)
                            sRowBackgroundClass = "DeviceOverview-ItemContainerDark";
                        
                        me.aRoomIds.push(aRoom.RoomId);
                        
                        // Create the flag for showing the list of rooms for a selected premise
                        // if it doesn't already exist.
                        if (me.premisesExpanded[sIndex] === undefined) {
                            me.premisesExpanded[sIndex] = false;
                        }
                        
                        // Set the premise title if it hasn't been set already.
                        if (me.byId("premiseName"+sIndex).getText() !== aRoom.PremiseName)
                            me.byId("premiseName"+sIndex).setText(aRoom.PremiseName);
                        
                        // Clean up any old elements with IDs.
                        if (me.byId("room"+aRoom.RoomId) !== undefined)
                            me.byId("room"+aRoom.RoomId).destroy();
                        if (me.byId("roomInfo"+aRoom.RoomId) !== undefined)
                            me.byId("roomInfo"+aRoom.RoomId).destroy();
                        if (me.byId("line"+aRoom.RoomId) !== undefined)
                            me.byId("line"+aRoom.RoomId).destroy();
                        
                        iDevicesInRoom = IOMy.functions.getNumberOfDevicesInRoom(aRoom.RoomId);
                        
                        //=============== Create a function to link to the room devices overview. ===============\\
                        if (iDevicesInRoom > 0) {
                            fnRoomLink = function () {
                                IOMy.common.NavigationChangePage("pRoomsOverview", {room : aRoom});
                            };
                        } else {
                            fnRoomLink = function () {};
                        }

                        me.byId("premise"+sIndex).addItem(
                            // Room Link
                            new sap.m.HBox({
                                items : [
                                    new sap.m.VBox(me.createId("room"+aRoom.RoomId),{
                                        items : [
                                            new sap.m.Link({
                                                text : aRoom.RoomName,
                                                press : function () {
                                                    IOMy.common.NavigationChangePage("pSettingsRoomEdit", {room : aRoom});
                                                }
                                            }).addStyleClass("SettingsLinks PadLeft6px Setting-RoomListItemLabel TextLeft Text_grey_20 PadLeft8px width100Percent"),
                                        ]
                                    }).addStyleClass("width95Percent"),
                                    new sap.m.VBox(me.createId("roomInfo"+aRoom.RoomId),{
                                        items : [
                                            new sap.m.HBox({
                                                items : [
                                                    new sap.m.Text({
                                                        textAlign : "Center",
                                                        text : iDevicesInRoom
                                                    }).addStyleClass("NavMain_Data_Value_2DigitCircle MarTop6px MarLeft4px"),
                                                    // Either put a text widget (0 devices) or put a button (1 or more devices)
                                                    iDevicesInRoom > 0
                                                    ? // If iDevicesInRoom > 0
                                                        new sap.m.Button({
                                                            text : "Device"+(iDevicesInRoom !== 1 ? "s" : ""),
                                                            icon : "sap-icon://show",
                                                            iconFirst : false,
                                                            press : fnRoomLink
                                                        }).addStyleClass("ButtonIconWhite IOMYButton DeviceButton Text_white NavMain_Data_ValueNormal ButtonNoBorder MarLeft8px width110px NormalLinkButton")
                                                    : // Else
                                                        new sap.m.Text({
                                                            text : "Devices"
                                                        }).addStyleClass("NavMain_Data_ValueNormal height20px MarLeft8px PadAll10px")
                                                ]
                                            }).addStyleClass("MarLeft5px PadTop4px width160px")
                                        ]
                                    }).addStyleClass("Setting-ItemAjaxBox minwidth160px maxwidth160px MarLeft6px")
                                ]
                            }).addStyleClass("width100Percent PadTop4px MainPanelElement "+sRowBackgroundClass)
                        );

                        // Decide whether to hide or show when the page loads/reloads.
                        if (me.premisesExpanded[sIndex] === false) {
                            me.byId("premise"+sIndex).setVisible(false);
                            me.byId("premiseName"+sIndex).setIcon("sap-icon://media-play");
                        }
                        
                        idCount++;
                        iRow++;
                    }
                });
            }
        });

		oVertBox.addItem(oLayout);

		// Destroy the old panel if it exists.
		if (me.byId("panel") !== undefined) 
			me.byId("panel").destroy();
		var oPanel = new sap.m.Panel(me.createId("panel"), {
			content: [oVertBox] //-- End of Panel Content --//
		}).addStyleClass("height100Percent PanelNoPadding MarTop0px");

		thisView.byId("page").addContent(oPanel);
		idCount = 0;
        
        me.lastUpdated = IOMy.common.RoomsListLastUpdate;
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.premise.PremiseOverview
*/
//	onBeforeRendering: function() {
//        
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.premise.PremiseOverview
*/
//	onAfterRendering: function() {
//		
//	}
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.premise.PremiseOverview
*/
//	onExit: function() {
//
//	}

});