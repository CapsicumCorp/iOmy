/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
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

sap.ui.controller("mjs.devices.Garagedoor", {
    
    bUIDrawn        : false,
    wControlButton  : null,
    
    mThing  : null,
    iID     : null,
    
	ListItem : {
		"wStatus" : {"label" : "Status" , "text" : "Closed" },
		"wLastAccessed" : { "label" : "Last Accessed" , "text" : "3h 21m" },
		"wBattery" : { "label" : "Battery" , "text" : "33%" },
		"wTamper" : { "label" : "Tamper" , "text" : "Secure" }
    },
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.Garagedoor
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
                me.mThing = IOMy.common.ThingList["_"+evt.data.ThingId];
                me.iID = evt.data.ThingId;
                
                var iStatus = me.GetCurrentStatus();
                
                if (me.wControlButton !== null) {
                    if (iStatus < 0) {
                        me.wControlButton.setEnabled(false);
                    } else {
                        me.wControlButton.setEnabled(true);
                    }
                }
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.Garagedoor
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.Garagedoor
*/
	onAfterRendering: function() {
		//--------------------------------------------//
        //-- Initialise Variables                   --//
        //--------------------------------------------//
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView       = this.getView();


        oController.DrawUI(); 
	},
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.Garagedoor
*/
	onExit: function() {

	},
    
    DetermineStatus : function () {
        //--------------------------------------------------------------------//
        // Capture scope. Determine what the status field should say.
        //--------------------------------------------------------------------//
        var me = this;
        
        // Determine whether it's open or closed.
        if (me.mThing.Status === 1) {
            // Determine if it's opening at the moment.
            if (me.mThing.Opening === true && me.mThing.Opening !== undefined) {
                me.ListItem.wStatus.text = "Opening";
                me.wControlButton.setEnabled(false);
            } else {
                // If not, it's closed.
                me.ListItem.wStatus.text = "Closed";
            }
            
        } else if (me.mThing.Status === 0) {
            // Determine if it's closing at the moment.
            if (me.mThing.Closing === true && me.mThing.Closing !== undefined) {
                me.ListItem.wStatus.text = "Closing";
                me.wControlButton.setEnabled(false);
            } else {
                // If not, it's open.
                me.ListItem.wStatus.text = "Open";
            }
        }
    },
	
	DrawUI: function(  ) {
        //--------------------------------------------//
        //-- Declare Variables                      --//
        //--------------------------------------------//
        var oController         = this;                 //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView               = this.getView();
        var iStatus             = oController.GetCurrentStatus();
        var oList               = oController.byId("list");
        
		//--------------------------------------------------------//
		//-- Draw 1st Run Page 2                                --//
		//--------------------------------------------------------//
		
        oController.wControlButton = new sap.m.Button({
            icon        : "sap-icon://GoogleMaterial/lock_open",
            text        : "Open",
            press : function () {
                oController.ToggleDoor();
            }
        });
        
        oController.DetermineStatus();

		if( oList ) {
			$.each( oController.ListItem, function( sVariable, aListItem ) {
				try {
                    oController[ sVariable ] = new sap.m.Text ({
                        text : aListItem.text,
                        textAlign : "Right",
                    });
                    
					oList.addItem(
						//-- Column 1 --//
						new sap.m.InputListItem ({
							label : aListItem.label+":",
							content : [
								//-- Column 2 --//
								oController[ sVariable ]
							]
						}).addStyleClass("maxlabelwidth50Percent")                 
					);
				} catch(e2) {
					jQuery.sap.log.error("GD_Foreach: "+e2.message, "", "GD");
				}
			}); 
			//-- End of foreach loop ($.each) --//
			//-- Adding in a unqiue item "Control Button" --//
			try {
        
                
				oList.addItem(
					new sap.m.InputListItem ({
						label : "Control:",
						content : [
							//-- Column 2 for Current Temp Row --//
                            oController.wControlButton
						]
					}).addStyleClass("maxlabelwidth50Percent")                 
				);
			} catch(e2) {
				jQuery.sap.log.error("GD_ControlButton: "+e2.message, "", "GD");
			}
		} else {
			console.log("GD List Error - Unable to Find the List");
		}
	},
    
    ToggleDoor : function () {
        var me          = this;
        var aFunctions  = [];
        
        //--------------------------------------------------------------------//
        // Start opening or closing the garage door, disable the switch, and
        // change the status to what it is doing.
        //--------------------------------------------------------------------//
        me.wControlButton.setEnabled(false);
        
        if (me.wControlButton.getText() === "Close") {
            me.wStatus.setText("Closing");
            me.wControlButton.setText("Closing");
            me.wControlButton.setIcon("sap-icon://GoogleMaterial/lock");
            IOMy.common.ThingList["_"+me.iID].Closing = true;
            //IOMy.common.ThingList["_"+me.iID].Status = -1;
        } else if (me.wControlButton.getText() === "Open") {
            me.wStatus.setText("Opening");
            me.wControlButton.setText("Opening");
            me.wControlButton.setIcon("sap-icon://GoogleMaterial/lock_open");
            IOMy.common.ThingList["_"+me.iID].Opening = true;
            //IOMy.common.ThingList["_"+me.iID].Status = -2;
        }
        
        //--------------------------------------------------------------------//
        // Construct the function array to run after timeout, piece by piece.
        //--------------------------------------------------------------------//
        aFunctions.push(
            //----------------------------------------------------------------//
            // Function to update the status field
            //----------------------------------------------------------------//
            function () {
                if (me.wControlButton.getText() === "Closing") {
                    me.wStatus.setText("Closed");
                    IOMy.common.ThingList["_"+me.iID].Closing = false;
                    
                } else if (me.wControlButton.getText() === "Opening") {
                    me.wStatus.setText("Open");
                    IOMy.common.ThingList["_"+me.iID].Opening = false;
                    
                }
            }
            
        );

        aFunctions.push(
            //----------------------------------------------------------------//
            // Function to update the control button.
            //----------------------------------------------------------------//
            function () {
                if (me.wControlButton.getText() === "Closing") {
                    me.wControlButton.setIcon("sap-icon://GoogleMaterial/lock_open");
                    me.wControlButton.setText("Open");
                    
                } else if (me.wControlButton.getText() === "Opening") {
                    me.wControlButton.setIcon("sap-icon://GoogleMaterial/lock");
                    me.wControlButton.setText("Close");
                    
                }
                
                me.wControlButton.setEnabled(true);
            }
            
        );
        
        IOMy.devices.garagedoor.ToggleGarageSwitch(aFunctions);
    },
    
    GetCurrentStatus : function () {
        var me = this;
        
        return me.mThing.Status;
    }

});