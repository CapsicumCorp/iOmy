/*
Title: Philips Hue Device Page UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the controls for displaying the information about a given Philips Hue device.
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

sap.ui.controller("mjs.devices.PhilipsHue", {
    
    fRate : 65535 / 360, // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
    
    // On/Off/Otherwise state
    iDeviceState : null,
    
    // Slider values
    iHue : 0,
    iSat : 144,
    iLight : 254,
    
    // Colour Box ID
    sColourBoxID : null,
    
    // Hue device
    oThing : null,
    
    /**
     * Creates an empty coloured box, used to help identify what colour the light is.
     * 
     * @param {string} sID                  HTML ID to use with this widget
     * @returns {sap.m.FlexBox}
     */
    CreateColourBox : function (sID) {
        var me = this;
        
        me.sColourBoxID = sID;
        
        if (sap.ui.getCore().byId(sID) !== undefined)
            sap.ui.getCore().byId(sID).destroy();
        
        var oColourBox = new sap.m.FlexBox(sID, {}).addStyleClass("width100Percent height65px");
        return oColourBox;
    },
    
    /**
     * Changes the colour box that was created using CreateColourBox() and references its ID,
     * which is stored in the controller.
     */
    ChangeColourBox : function () {
        var me = this;
        
        if (me.sColourBoxID !== null) {
            var iSaturationPercentage = Math.round((me.iSat / 255) * 100);
            document.getElementById(me.sColourBoxID).style = "background: hsl("+me.iHue+","+iSaturationPercentage+"%,80%);";
        }
    },
    
    /**
     * Loads the information about the currently selected Philips Hue light (colour/hue,
     * saturation, brightness, and on/off status) through an AJAX request to the Philips
     * Hue API.
     * 
     * @param {int} iThingId
     */
    InitialDeviceInfoLoad : function (iThingId) {
        var me = this;
        //-----------------------------------------//
        // Acquire the thing's IOs
        //-----------------------------------------//
        var mIOs = me.oThing.IO;
        //console.log(JSON.stringify(mIOs));
        
        try {
            $.each(mIOs, function (sI, aIO) {
                if (sI !== undefined && sI !== null && aIO !== undefined && aIO !== null) {
                    IOMy.apiodata.AjaxRequest({
                        Url : IOMy.apiodata.ODataLocation("dataint"),
                        Columns : ["CALCEDVALUE","UTS","RSTYPE_PK"],
                        WhereClause : ["THING_PK eq "+me.oThing.Id, "IO_PK eq "+aIO.Id],
                        OrderByClause : ["UTS desc"],
                        limit : 1,
                        format : 'json',

                        onSuccess : function (response, data) {
                            if (data.length > 0) {
                                data = data[0];
                                //console.log(JSON.stringify(data));
                                //----------------------------------------------------//
                                // If we're grabbing the HUE value
                                //----------------------------------------------------//
                                if (data.RSTYPE_PK === 3901) {
                                    me.iHue = data.CALCEDVALUE / me.fRate;
                                    me.byId("hueSlider").setValue(me.iHue);

                                //----------------------------------------------------//
                                // If we're grabbing the SATURATION value
                                //----------------------------------------------------//
                                } else if (data.RSTYPE_PK === 3902) {
                                    me.iSat = data.CALCEDVALUE;
                                    me.byId("satSlider").setValue(me.iSat);

                                //----------------------------------------------------//
                                // If we're grabbing the BRIGHTNESS value
                                //----------------------------------------------------//
                                } else if (data.RSTYPE_PK === 3903) {
                                    me.iLight = data.CALCEDVALUE;
                                    me.byId("briSlider").setValue(me.iLight);
                                }
                            }

                            this.onComplete();
                        },

                        onFail : function (response) {
                            jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+JSON.stringify(response));
                            this.onComplete();
                        },

                        onComplete : function () {
                            me.ChangeColourBox();
                        }
                    });
                }
            });
        } catch (e) {
            jQuery.sap.log.error("There was an error loading the OData services: "+e.message);
        }
    },
    
    /**
    * Called when a controller is instantiated and its View controls (if available) are already created.
    * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
    * @memberOf mjs.devices.PhilipsHue
    */
    onInit : function () {
        var me = this;
        var thisView = me.getView();
        
        thisView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
                //-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
                
                //-- Retrieve any hue data parsed to this controller --//
                me.oThing = IOMy.common.ThingList['_'+evt.data.ThingId];
                //console.log(JSON.stringify(me.oThing));
                
                //-- Clean up the old elements from the previous render. --//
                IOMy.functions.destroyItemsByIdFromView(me,
                [
                    "StatusToggle", "hueSlider", "satSlider", "briSlider", "extrasMenu"+me.oThing.Id
                ]);
                
                // Create the title on the page.
                me.byId("NavSubHead_Title").setText(me.oThing.DisplayName.toUpperCase());
                
                //-- Store the device state --//
                me.iDeviceState = IOMy.common.ThingList["_"+me.oThing.Id].Status;
                var bEnabled = me.iDeviceState === 0 ? false : true;
                
                //-- Create the Colour Box --//
                var oColourBox = me.CreateColourBox("ColourBox");
                
                //-----------------------------------//
                // ON/OFF TOGGLE SWITCH
                //-----------------------------------//
                var oOnOffSwitch = new sap.m.Switch( me.createId("StatusToggle"), {
                    state: me.iDeviceState === 1 ? true : false,
                    change: function () {
                        //-- AJAX --//
                        IOMy.apiphp.AjaxRequest({
                            url: IOMy.apiphp.APILocation("statechange"),
                            type: "POST",
                            data: { 
                                "Mode":"ThingToggleStatus", 
                                "Id": me.oThing.Id
                            },
                            onFail : function(response) {
                                IOMy.common.showError(response.message, "Error Changing Device Status");
                            },
                            onSuccess : function( sExpectedDataType, aAjaxData ) {
                                var bEnabled;

                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
                                    //-- If Turned On --//
                                    if( aAjaxData.ThingStatus===0 ) {
                                        bEnabled = false;
                                    //-- Else Turned Off --//
                                    } else {
                                        bEnabled = true;
                                    }

                                    me.byId("hueSlider").setEnabled(bEnabled);
                                    me.byId("satSlider").setEnabled(bEnabled);
                                    me.byId("briSlider").setEnabled(bEnabled);

                                    IOMy.common.ThingList["_"+me.oThing.Id].Status = aAjaxData.ThingStatus;
                                }
                            }
                        });
                    }
                }).addStyleClass("DeviceOverviewStatusToggleSwitch");
                        //.addStyleClass(sSwitchStyle);//-- END of ToggleButton --//
                
                //===================================//
                // FIRST COLUMN
                //===================================//
                var oLeftSection = new sap.m.VBox({
                    items : [
                        oOnOffSwitch,
                        oColourBox
                    ]
                }).addStyleClass("width65px FlexNoShrink");
                
                //-----------------------------------//
                // HUE SLIDER
                //-----------------------------------//
                var oHueLabel = new sap.m.Label({
                    text: "Hue"
                });
                
                var oHueSlider = new sap.m.Slider(me.createId("hueSlider"), {
                    max : 360,
                    value : me.iHue,
                    enabled : bEnabled,
                    change : function () {
                        me.ChangeHueLight();
                    },
                    liveChange : function () {
                        if (this.getValue() === 360) {
                            me.iHue = 0;
                        } else {
                            me.iHue = this.getValue();
                        }
                        me.ChangeColourBox();
                        
                        //console.log(me.CalculateHueFigureForAPI(me.iHue));
                    }
                }).addStyleClass("width100Percent PhilipsHueSlider PhilipsHueSliderHue");
                
                //-----------------------------------//
                // SATURATION SLIDER
                //-----------------------------------//
                var oSaturationLabel = new sap.m.Label({
                    text: "Saturation"
                });
                
                var oSaturationSlider = new sap.m.Slider(me.createId("satSlider"), {
                    max : 144,
                    value : me.iSat,
                    enabled : bEnabled,
                    change : function () {
                        me.ChangeHueLight();
                    },
                    liveChange : function () {
                        me.iSat = this.getValue();
                        me.ChangeColourBox();
                        //console.log(me.iSat);
                    }
                }).addStyleClass("width100Percent PhilipsHueSlider");
                
                //-----------------------------------//
                // BRIGHTNESS SLIDER
                //-----------------------------------//
                var oBrightnessLabel = new sap.m.Label({
                    text: "Brightness"
                });
                
                var oBrightnessSlider = new sap.m.Slider(me.createId("briSlider"), {
                    max : 254,
                    value : me.iLight,
                    enabled : bEnabled,
                    change : function () {
                        me.ChangeHueLight();
                    },
                    liveChange : function () {
                        me.iLight = this.getValue();
                        //console.log(me.iLight);
                    }
                }).addStyleClass("width100Percent PhilipsHueSlider");
                
                //===================================//
                // SECOND COLUMN
                //===================================//
                var oRightSection = new sap.m.VBox({
                    items : [
                        oHueLabel,oHueSlider,
                        oSaturationLabel,oSaturationSlider,
                        oBrightnessLabel,oBrightnessSlider
                    ]
                }).addStyleClass("width100Percent MarLeft10px")
                
                var oVertBox = new sap.m.VBox({
                    items : [
                        new sap.m.HBox({
                            items : [
                                oLeftSection,
                                oRightSection
                            ]
                        })
                    ]
                });
                
                // Load current Device Data
                me.InitialDeviceInfoLoad(evt.data.ThingId);
                
                // Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("Panel") !== undefined)
					me.byId("Panel").destroy();
                
                var oPanel = new sap.m.Panel(me.createId("Panel"), {
                    backgroundDesign: "Transparent",
                    content : [oVertBox]
                }).addStyleClass("UserInputForm");
                
                thisView.byId("page").addContent(oPanel);
                
                //----------------------------------------------------------------------------//
                //-- THE EXTRAS MENU                                                        --//
                //----------------------------------------------------------------------------//
                try {
                    thisView.byId("extrasMenuHolder").destroyItems();
                    thisView.byId("extrasMenuHolder").addItem(
                        IOMy.widgets.getActionMenu({
                            id : me.createId("extrasMenu"+me.oThing.Id),        // Uses the page ID and device ID
                            icon : "sap-icon://GoogleMaterial/more_vert",
                            items : [
                                {
                                    text: "Edit "+me.oThing.DisplayName,
                                    select:	function (oControlEvent) {
                                        //console.log(JSON.stringify(me.oThing));
                                        IOMy.common.NavigationChangePage( "pSettingsEditThing", {device : me.oThing}, false );
                                    }
                                }
                            ]
                        })
                    );
                } catch (e) {
                    jQuery.sap.log.error("Error redrawing the extras menu.")
                }
            }
        });
    },
    
    
    CalculateHueFigureForAPI : function (iHue) {
        return Math.floor(iHue * this.fRate);
    },
    
    ChangeHueLight : function () {
        var me = this;
        
        IOMy.apiphp.AjaxRequest({
            url : IOMy.apiphp.APILocation("philipshue"),
            data : {
                Mode : "ChangeHueSatLig",
                ThingId : me.oThing.Id,
                Hue : me.CalculateHueFigureForAPI(me.iHue),
                Saturation : me.iSat,
                Brightness : me.iLight
            },
            
            method : "POST",
            
            onFail : function (response) {
                jQuery.sap.log.error("There was a fatal error changing information about the current Hue device: "+JSON.stringify(response));
            }
        });
    }
    
});