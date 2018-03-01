/*
Title: iOmy Help Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares the help module with a variable containing the text that
    should be displayed when the help button is pressed on any page in the app.
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

$.sap.declare("iomy.help",true);

iomy.help = new sap.ui.base.Object();

$.extend(iomy.help,{
    
    /**
     * Map containing help information pertaining to each page. Information is
     * accessible using the ID of the page currently being viewed (example,
     * iomy.help.PageInformation["pLogin"] = "This page logs you in.").
     * 
     * Initially declared as an empty object and populated in app.js as each UI5
     * activity is created.
     */
    PageInformation : {
        "pLogin": "Before you can use the app, you need to enter your username and password to view and manage your devices.\n\nIn the demo version of iOmy. The username is 'demo' and the password is 'demo'.",
            
        "pBlock": "This is the home page.",
        
        "pPremise": "You should be able to see a list of rooms in a premise with the number of devices to the left of each one. If there are no rooms, you can press the button to add one.\n\nThe 'Unassigned' area will only appear if there are any devices that have not yet been assigned to a room.",
        
        "pDevice": "Here is a list of all the devices that the current user has access to, regardless of their location. Some of these can be switched on or off depending on whether the current user has permission to do this.",
        
        "pRoomList": "This page lists all devices in the selected room. Similar to the device overview page, only it shows devices for a particular room.",
         
        "pOnvifSnapshot": "Displays the camera stream thumbnail if the camera is on. If the camera has PTZ support, there will be controls around the page.",
        
        "pTelnet" : "This page allows you to interact with WatchInputs via telnet. The input field accepts the following commands:\n\nhelp: Show a list of commands on the screen\n\nversioninfo: Show the version of WatchInputs\n\nmodulesinfo: Show a list modules currently loaded\n\nget_rapidha_info: Display information about connected RapidHA dongles\n\nget_zigbee_info: Display information about the devices on a Zigbee network\n\ndebug output show: Show recent debug information\n\ndebug output hide: Hide debugging information",
        
        "pUserSettings" : "This page allows you to edit your own user information and change your password",
        
        "pTile" : "This page allows you to see the data for Zigbee devices, selecting a tile will allow you to change the period shown or generate a graph",
        
        "pRGBlight" : "This page allows you to toggle the state or change the color of your RGB light bulb.",
        
        "pMJPEG" : "This page allows you to view your configured devices MJPEG stream",
        
        "pUserForm" : "This page allows you to edit another users details",
        
        "pNewUser" : "This page allows you to create a new user, you can find the root password on the side android navigation of your installed iomy application",
        
        "pDeviceForm" : "This page allows you to edit your devices information",
        
        "pPremiseForm" : "This page allows you to edit your premises information",
        
        "pWeatherFeed" : "This page allows you to view your configured weather stations data",
        
        "pMotionSensor" : "This page allows you to view your configured motion sensors data",
        
        "pRulesList" : "This page allows you to manage rules for supported devices. e.g. Netvox plugs",
        
        "pGraphLine" : "This page allows you to view your devices data in a line graph",
        
        "pGraphBar" : "This page allows you to view your devices data in a bar graph",
        
        "pGraphPie" : "This page allows you to view your devices data in a pie graph",
        
        "pAddRoomForm" : "This page allows you to create a new room",
        
        "pEditRoomForm" : "This page allows you to change information for a room",
        
        "pRulesForm" : "This page allows you to add or edit rules for your selected device",
        
        "pFFMPEG" : "This page allows you to view streams using FFMPEG"
    },
    
    /**
     * Inserts a help message for a given page, and enables the help button
     * for that page.
     * 
     * @param {type} sPageID        ID of the UI5 view/page
     * @param {type} sMessage       Help message
     */
    addHelpMessage : function (sPageID) {
        //this.PageInformation[sPageID] = sMessage;
        try {
            if (oApp.getPage(sPageID) !== null) {
                var oPageHelp =  oApp.getPage(sPageID).byId("helpButton");
                
                if (oPageHelp !== null && oPageHelp !== undefined && oPageHelp !== false) {
                    oPageHelp.setEnabled(true);
                }
            }
        } catch (e1) {
            $.sap.log.error("Help: Error looking up the page "+e1.message);
        }
    }
    
});