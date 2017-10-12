/*
Title: Template UI5 View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Creates the page list all devices and their information in a given
    room.
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

sap.ui.jsview("pages.staging.Device", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.staging.Device
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.staging.Device";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.staging.Device
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "Device List",
            header : IomyRe.widgets.getToolPageHeader( oController ),
            sideContent : IomyRe.widgets.getToolPageSideContent(oController),
            mainContents: [ 
                IomyRe.widgets.DeviceToolbar(oController, "Device List"),
                new sap.m.ScrollContainer ({
                    width: "100%",
                    height: "100%",
                    vertical : true,
                    content : [
                        new sap.m.List (oView.createId("DeviceList"), {
                            mode: sap.m.ListMode.None,
                            items: [
//                                new sap.m.GroupHeaderListItem ({
//                                    title: "Zigbee Netvox SmartPlug"
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Computer & Monitor",
//                                    type: "Active",
//                                    number: "0.03",
//                                    numberUnit: "kW",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Toggle State"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "Status: On"
//                                        })
//                                    ],
//                                    press : function () {
//                                        IomyRe.common.NavigationChangePage( "pTile" , {} , false);
//                                    }
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Fridge",
//                                    type: "Active",
//                                    number: "0.00",
//                                    numberUnit: "kW",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Toggle State"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "Status: On"
//                                        }),
//                                    ]
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "TV",
//                                    type: "Active",
//                                    number: "0.17",
//                                    numberUnit: "kW",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Toggle State"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "Status: On"
//                                        }),
//                                    ]
//                                }),
//                                new sap.m.GroupHeaderListItem ({
//                                    title: "Phillip Hue Light"
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Main Office",
//                                    type: "Active",
//                                    number: "Blue",
//                                    numberUnit: "hue",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Toggle State"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "Status: On"
//                                        }),
//                                    ],
//                                    press : function () {
//                                        IomyRe.common.NavigationChangePage( "pRGBlight" , {} , false);
//                                    },
//                                }),
//                                new sap.m.GroupHeaderListItem ({
//                                    title: "Onvif Camera Stream"
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Shop Front",
//                                    type: "Active",
//                                    number: "Monitoring",
//                                    numberUnit: "activity",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Take Screenshot"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Record"
//                                            })
//                                        }),
//                                    ]
//                                }),
//                                new sap.m.GroupHeaderListItem ({
//                                    title: "MJPEG Camera"
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Reception",
//                                    type: "Active",
//                                    number: "Monitoring",
//                                    numberUnit: "activity",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Take Screenshot"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Record"
//                                            })
//                                        }),
//                                    ],
//                                    press : function () {
//                                        IomyRe.common.NavigationChangePage( "pMJPEG" , {} , false);
//                                    },
//                                }),
//                                new sap.m.GroupHeaderListItem ({
//                                    title: "Weather Feed"
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Reception",
//                                    type: "Active",
//                                    number: "22°C",
//                                    numberUnit: "Inside",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "Humidity: 84%",
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "Weather Outside: Clear",
//                                        }),
//                                    ],
//                                    press : function () {
//                                        IomyRe.common.NavigationChangePage( "pWeatherFeed" , {} , false);
//                                    },
//                                }),
//                                new sap.m.GroupHeaderListItem ({
//                                    title: "Motion Sensor"
//                                }),
//                                new sap.m.ObjectListItem ({        
//                                    title: "Office Hallway",
//                                    type: "Active",
//                                    number: "No Motion",
//                                    numberUnit: "Detected",
//                                    attributes : [
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Enable Alarm"
//                                            })
//                                        }),
//                                        new sap.m.ObjectAttribute ({
//                                            text: "link",
//                                            customContent : new sap.m.Link ({
//                                                text: "Disable Alarm"
//                                            })
//                                        }),
//                                    ],
//                                    press : function () {
//                                        IomyRe.common.NavigationChangePage( "pMotionSensor" , {} , false);
//                                    },
//                                }),
                            ],
                        }).addStyleClass("DevicePage")
                    ]
                })
            ]
        }).addStyleClass("MainBackground");
    }
});