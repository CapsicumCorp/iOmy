/*
Title: PHP API Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Module for handling communication with the main APIs (written in PHP),
Copyright: Capsicum Corporation 2015, 2016, 2017

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

$.sap.declare("iomy.apiphp",true);

iomy.apiphp = new sap.ui.base.Object();

$.extend(iomy.apiphp,{
	
	//============================================================================================//
	//== PHP API LOCATION FUNCTION                                                              ==//
	//============================================================================================//
	//-- Description: This function is used to turn a quick name into a full URL for use in an  --//
	//--    API. Most functions that request data from a PHP IOMY API use this function to      --//
	//--    fetch the URL.                                                                      --//
	//--------------------------------------------------------------------------------------------//
	APILocation: function( sApiName ) {
		//------------------------------------------------//
		//-- 1.0 - Initialise Variables                 --//
		//------------------------------------------------//
		var sUrlPublic      = iomy.common.ConfigVars("URLPublicApi");
		var sUrlRestricted  = iomy.common.ConfigVars("URLRestrictedApi");
		var sReturn         = "";
		
		//------------------------------------------------//
		//-- 3.0 - Convert quick name to URL            --//
		//------------------------------------------------//
		switch(sApiName) {
			//--------------------------------//
			//-- Public APIs                --//
			//--------------------------------//
			case "sessioncheck":
				sReturn = sUrlPublic+'/php/checkSession.php';
				break;
				
			case "colorbox":
				sReturn = sUrlPublic+'/php/api_colorbox.php';
				break;
				
			//--------------------------------//
			//-- Restricted APIs        --//
			//--------------------------------//
			case "users":
				sReturn = sUrlRestricted+'/php/api_users.php';
				break;
				
			case "premises":
				sReturn = sUrlRestricted+'/php/api_premises.php';
				break;
				
			case "rooms":
				sReturn = sUrlRestricted+'/php/api_rooms.php';
				break;
			
			case "link":
				sReturn = sUrlRestricted+'/php/api_link.php';
				break;
				
			case "hubs":
				sReturn = sUrlRestricted+'/php/api_hubs.php';
				break;
                
            case "hubtelnet":
				sReturn = sUrlRestricted+'/php/api_hubtelnet.php';
				break;
				
			case "thing":
				sReturn = sUrlRestricted+'/php/api_thing.php';
				break;
				
			case "iodetection":
				sReturn = sUrlRestricted+'/php/api_io.php';
				break;
				
			case "aggregation" :
				sReturn = sUrlRestricted+'/php/api_dataaggregation.php';
				break;
				
			case "mostrecent" :
				sReturn = sUrlRestricted+'/php/api_datamostrecent.php';
				break;
				
			case "statechange":
				sReturn = sUrlRestricted+'/php/api_statechange.php';
				break;
				
			case "graph" :
				sReturn = sUrlRestricted+'/php/api_datagraph.php';
				break;
				
            case "onvif":
				sReturn = sUrlRestricted+'/php/api_onvif.php';
				break;
                
            case "onvifthumbnail":
				sReturn = sUrlRestricted+'/php/api_onvifthumbnail.php';
				break;
				
			case "ipcamera":
				sReturn = sUrlRestricted+'/php/api_ipcamera.php';
				break;
                
            case "philipshue":
				sReturn = sUrlRestricted+'/php/api_philipshue.php';
				break;
                
            case "light":
				sReturn = sUrlRestricted+'/php/api_light.php';
				break;
                
            case "motionsensor":
				sReturn = sUrlRestricted+'/php/api_motionsensor.php';
				break;
                
            case "weather":
				sReturn = sUrlRestricted+'/php/api_weather.php';
				break;
                
            case "permissions":
				sReturn = sUrlRestricted+'/php/api_permissions.php';
				break;
                
            case "devicerules":
				sReturn = sUrlRestricted+'/php/api_devicerulesconfig.php';
				break;
                
            case "hubrules":
				sReturn = sUrlRestricted+'/php/api_hubrules.php';
				break;
                
            case "serveradmin":
				sReturn = sUrlRestricted+'/php/api_serveradmin.php';
				break;
                
            case "managedstreams":
                sReturn = sUrlRestricted+'/php/api_managedstreams.php';
                break;
		}
		
		//--------------------------------------------------------//
		//-- 9.0 - Return the Result                            --//
		//--------------------------------------------------------//
		return sReturn;
	},
	
	
	//============================================================================================//
	//== PHP API AJAX REQUEST FUNCTION                                                          ==//
	//============================================================================================//
	//-- Description: This function is used to perform a simple Ajax Request to a API and then  --//
	//--    pass the results on to the "onSuccess" function that is passed as a parameter       --//
	//-- NOTE: This Ajax request is setup to make 3 attempts to try and get a desired results.  --//
	//--------------------------------------------------------------------------------------------//
	AjaxRequest: function( aConfig ){
		//---------------------------------------------------------------------------//
		//-- NOTE: aConfig is an associative array that has the following elements --//
		//---------------------------------------------------------------------------//
		//-- @url                     (required) STRING      - This is the Url of the API that this function will attempt to talk to.                                            --//
		//-- @data                    (optional) ARRAY       - This is the Data that can sent via HTTP POST to the API.                                                          --//
		//-- @onSuccess               (optional) FUNCTION    - This is for queueing up functions to run if the Ajax request is successful.                                       --//
		//-- @onFail                  (optional) FUNCTION    - This is for queueing up functions to run if the Ajax request is unsuccessful.                                     --//
		//-- @ajaxdatatype            (optional) STRING      - This is the expected data type that the Ajax request should return. (Defaults to "json" if no value is passed)    --//
		//-- @ExpectedResponseType    (optional) STRING      - This is the full MIME type in the Ajax Resposes if everything is successful (Default: "application/json")         --//
		//-- @async                   (optional) BOOLEAN     - CRIPPLES PERFORMANCE IF CHANGED: It should not be used unless there is an absolute need for it.                   --//
		
		//------------------------------------------------//
		//-- 1.0 - Initialise Variables                 --//
		//------------------------------------------------//
		var oScope          = this;         //-- SCOPE:     Used to bind the current scope for a varaiable if needed.                                                     --//
		var sUrl            = "";           //-- STRING:    This will hold the URL that is extracted from the "aConfig" parameter.                                        --//
		var sDataType       = "";           //-- STRING:    This is used to store the "ajaxdatatype" variable from the "aConfig" function parameter if specified.         --//
		var sERType         = "";           //-- STRING:    This is used to store the "ExpectedResponseType" variable from the "aConfig" function parameter if specified. --//
		var bAsync          = "";           //-- BOOLEAN:   This is a toggle off async if absolutely needed. If changed it cripples performance.                          --//
		var oAjax           = null;         //-- OBJECT:    This variable is used to hold the "Ajax Request" Object.                                                      --//
		var iLoginTimestamp = 0;            //-- INTEGER:   This holds the current login timestamp so that if it changes --//
		
		//------------------------------------------------//
		//-- 2.0 - Configure Variables                  --//
		//------------------------------------------------//
		
		//-- Use JSON Unless specified in the config --//
		aConfig.ajaxdatatype                = aConfig.ajaxdatatype || "json";
		aConfig.ExpectedResponseType        = aConfig.ExpectedResponseType || "application/json";
		
		//-- Extract the values from the Config that are need in the Ajax request --//
		sUrl            = aConfig.url;
		sDataType       = aConfig.ajaxdatatype;
		sERType         = aConfig.ExpectedResponseType;
		bAsync          = aConfig.async || true;
		
		iLoginTimestamp = iomy.common.oCurrentLoginTimestamp.getTime();
		
		//------------------------------------------------//
		//-- 3.0 - Make the Ajax Request                --//
		//------------------------------------------------//
		if( sUrl && sDataType && sERType ) {
			//--------------------------------------------//
			//-- Check if the User is logged in         --//
			//--------------------------------------------//
			if( iomy.common.bUserCurrentlyLoggedIn===true ) {
				oAjax = $.ajax({
					url: sUrl,                                     //-- The URL to the PHP API that needs to be called.                                          --//
					crossDomain: true,                             //-- Allow calls to other servers                                                             --//
					dataType: sDataType,                           //-- Expected Result                                                                          --//
					type: (aConfig.data) ? 'POST' : 'GET',         //-- If there is anything in "type" then "POST" else "GET".                                   --//
					data: aConfig.data || {},                      //-- If there is anything in "data" then include it here.                                     --//
					async: bAsync,
					RetryAttemptCount: 0,                          //-- The current count of how many attempts to get a successful Ajax request have been made.  --//
					RetryAttemptLimit: 3,                          //-- Maximum amount of times the Ajax request should be retried before giving up.             --//
					bApiComplete: false,                           //-- Indicates if the API is flagged as "still attempting" or "aborting/successful".          --//
					iCurrentLoginTimestamp: iLoginTimestamp,       //-- Holds the Login Timestamp so the API know to abort if this value changes.                --//
					DebugLogString: "",                            //-- This is used to store the DebuggingLog.                                                  --//
					//============================================================================================//
					//== AJAX "SUCCESS" EVENT                                                                   ==//
					//============================================================================================//
					success : function( Response, sStatus, XHR ) {
						
						//================================================//
						//== 1.1 - Initialise Variables                 ==//
						//================================================//
						var sContentType   = "";
						var sDebugLogLines = "=================================\n";
						var sDebugHeader   = "\n"+sDebugLogLines+"== PHP Ajax Error!            ==\n"+sDebugLogLines;
						
						try {
							if( iomy.common.bUserCurrentlyLoggedIn===true && this.iCurrentLoginTimestamp===iomy.common.oCurrentLoginTimestamp.getTime() ) {
								
								//-- Increment the attempt count even though this was a success! --//
								this.RetryAttemptCount++;
								
								//================================================//
								//== 1.2 - Look at and extract the results      ==//
								//================================================//
								if( Response!==null ) {
									//--------------------------------------------//
									//-- 1.2.A.1 - Retrieve the "content-type"  --//
									//--------------------------------------------//
									sContentType = XHR.getResponseHeader("content-type") || "";
									
									//------------------------------------------------------------//
									//-- 1.2.A.2.A - If the Response ContentType is expected    --//
									//------------------------------------------------------------//
									if( sContentType.indexOf(sERType) > -1 ) {
										//----------------------------------------------------//
										//-- 1.2.A.2.A.A - If Expecting JSON response       --//
										//----------------------------------------------------//
										if( sERType==="application/json" ) {
											//-- Flag the API Request as successful --//
											bApiComplete = true;
											
											//-- Store the response in the data variable --//
											Data = Response;
											
											//-- Trigger the OnSuccess Event --//
											if( aConfig.onSuccess ) {
												try {
													aConfig.onSuccess("JSON", Data);
												} catch( e01 ) {
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onSuccess\" section of the passed parameter!. (e01)\n"+e01.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
												}
											}
											
										//--------------------------------------------------------//
										//-- 1.2.A.2.A.B - If Expecting HTML or Text response   --//
										//--------------------------------------------------------//
										} else if( sERType==="text/html" || sERType==="text/plain" || sERType==="application/javascript" ) {
											
											//------------------------------------------------------------//
											//-- 1.2.A.2.A.B.A - Check if the "Response" is a string    --//
											//------------------------------------------------------------//
											if(typeof Response === "string") {
												//-- Flag the API Request as successful --//
												bApiComplete = true;
												
												//-- Store the response in the data variable --//
												Data = Response;
												
												//-- Trigger the OnSuccess Event --//
												if( aConfig.onSuccess ) {
													
													try {
														aConfig.onSuccess("Text", Data);
													} catch( e02 ) {
														jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onSuccess\" section of the passed parameter!. (e02)\n"+e02.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
													}
												}
												
												
											//------------------------------------------------------------//
											//-- 1.2.A.2.A.B.B - Else an error has occurred             --//
											//------------------------------------------------------------//
											} else {
												//-- Error not a String --//
												if( this.DebugLogString==="" ) { this.DebugLogString += sDebugHeader; }
												jQuery.sap.log.error(this.DebugLogString+"ErrMesg: HTML/Text Response is not a string", "", "PHP AjaxRequest");
												
												//-- Trigger the "onFail" event --//
												if(aConfig.onFail) {
													try {
														aConfig.onFail();
													} catch( e03 ) {
														jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e03)\n"+e03.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
													}
												}
											}
											
										//--------------------------------------------------------------------------------------------//
										//-- 1.2.A.2.A.C - Else this function isn't configured on what to do with this datatype     --//
										//--------------------------------------------------------------------------------------------//
										} else {
											//-- No Method for this response type --//
											if( this.DebugLogString==="" ) { this.DebugLogString += sDebugHeader; }
											jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Unexpected Method for parsing Response type, ExpResType="+sERType, "", "PHP AjaxRequest" );
											
											//-- Trigger the "onFail" event --//
											if(aConfig.onFail) {
												try {
													aConfig.onFail();
												} catch( e04 ) {
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e04)\n"+e04.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
												}
											}
										}
										
									//--------------------------------------------------------------------//
									//-- 1.2.A.2.B - Else then the Response ContentType is not expected --//
									//--------------------------------------------------------------------//
									} else {
										//------------------------------------------------------------------------------------//
										//-- Check to see if the Response is safe (eg. a String) to dump to the console.log --//
										//------------------------------------------------------------------------------------//
										if(typeof Response === "string") {
											//-- Push Error & Content type and Response --//
											if( this.DebugLogString==="" ) { this.DebugLogString += sDebugHeader; }
											jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Unexpected Response, ContentType="+sContentType+", Response="+Response, "", "PHP AjaxRequest" );
											
											//-- Trigger the "onFail" event --//
											if(aConfig.onFail) {
												try {
													aConfig.onFail(Response);
												} catch( e05 ) {
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e05)\n"+e05.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
												}
											}
											
										} else {
											//-- Push Error to Console Log --//
											jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Unexpected Response, ContentType="+sContentType+", Expected="+sERType, "", "PHP AjaxRequest" );
											
											//-- Trigger the "onFail" event --//
											if(aConfig.onFail) {
												try {
													aConfig.onFail();
												} catch( e06 ) {
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e06)\n"+e06.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
												}
											}
										}
									}
								} else {
									//------------------------------------//
									//-- ERROR: Response is null        --//
									//------------------------------------//
									jQuery.sap.log.error("Response is null", "", "PHP AjaxRequest" );
									
									//-- Trigger the "onFail" event --//
									if(aConfig.onFail) {
										try {
											aConfig.onFail();
										} catch( e07 ) {
											jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e07)\n"+e07.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
										}
									}
								}
							
							//--------------------------------------------------------//
							//-- ELSE This is ajax task has been orphaned           --//
							//--------------------------------------------------------//
							} else {
								var sErrorMesg2 = "Silently aborting PHP API request (before parsing the sucessful response from the ajax request) due to being logged out!!";
								jQuery.sap.log.info( sErrorMesg2, "", "iomy.apiphp.AjaxRequest" );
							}
							
						} catch(e1) {
							jQuery.sap.log.error("Critical Error in Success Section", e1.message, "PHP AjaxRequest");
						}
					},
					
					//============================================================================================//
					//== AJAX "ERROR" EVENT                                                                     ==//
					//============================================================================================//
					error:function(err) {
						try {
							if( iomy.common.bUserCurrentlyLoggedIn===true && this.iCurrentLoginTimestamp===iomy.common.oCurrentLoginTimestamp.getTime() ) {
								//================================================//
								//== 2.1 - Initialise Variables                 ==//
								//================================================//
								var sDebugLogLines = "=================================\n";
								
								if(this.RetryAttemptCount===0) {
									this.DebugLogString += "\n"+sDebugLogLines+"== PHP Ajax Error!            ==\n"+sDebugLogLines;
								}
								
								this.RetryAttemptCount++;
								this.DebugLogString += "Attempt "+this.RetryAttemptCount+"! ";
								
								//-----------------------------------------------------------------------------//
                                //-- 2.3.A - HTTP 500 OR 503 STATUS CODE: A dreaded error code has occurred! --//
                                //-----------------------------------------------------------------------------//
                                if (err.status=='500' || err.status=='503') {
									//-- Flag that the API is not complete and should possibly try again (if allowed) --//
									this.bApiComplete = false;
									
								//------------------------------------------------------------------------//
								//-- 2.2.B - HTTP 200 STATUS CODE: 										--//
								//------------------------------------------------------------------------//
								} else if (err.status=="200") {
									//-- NOTE: API didn't return a valid response (most likely an error message)  --//
									this.DebugLogString += "Status Code 200: Server (Android or Cloud) returned a error message: (\n"+err.responseText+")\n";
									//-- Flag that we can try again for a different result as the API Request isn't complete --//
									this.bApiComplete = false;
									
								//------------------------------------------------------------------------//
								//-- 2.2.C - HTTP 0 STATUS CODE: 										--//
								//------------------------------------------------------------------------//
								} else if (err.status=="0") {
									//-- NOTE: This is a weird non-standard error code (more info on what causes of this needs to be found) --//
		                            //-- Seems to be a timeout issue --//
									//-- Log that it happened and try again --//
									this.DebugLogString += "The HTTP 0 Status Code has been returned! UI Developers need to be notified. \n";
									//-- Flag that we can try again for a different result as the API Request isn't complete --//
									this.bApiComplete = false;
									
								//------------------------------------------------------------------------//
								//-- 2.2.D - HTTP 401 STATUS CODE:                                      --//
								//------------------------------------------------------------------------//
								} else if (err.status=="401") {
									//-- TODO: This section needs to be looked into further to see if anything needs to be changed --// 
									
									if( aConfig.auth ) {
										iomy.common.showError("Incorrect username and/or password. Please retype your username and password again!");
										iomy.common.showLoading(false);
										
									} else {
										iomy.common.showError("Unexpected HTTP 401 Status Code");
									}
									
									//-- Flag that we shouldn't retry the ajax request --// 
									this.bApiComplete = true;
									
								//------------------------------------------------------------------------//
								//-- 2.2.E - HTTP 403 STATUS CODE:                                      --//
								//------------------------------------------------------------------------//
								} else if (err.status=="403") {
		                            //-- Flag that we shouldn't retry the ajax request --// 
									this.bApiComplete = true;
									//-- Flag that the user isn't currently logged in --//
									iomy.common.bUserCurrentlyLoggedIn = false;
									
									//-- Run the handle403APIError function --//
		                            iomy.apiphp.handle403APIError(aConfig);
									
									
								//------------------------------------------------------------------------//
								//-- 2.2.F - HTTP 520 STATUS CODE: CORRUPTED USER DATA                  --//
								//------------------------------------------------------------------------//
								} else if( err.status=="520" ) {
									//-- Flag that we shouldn't retry the ajax request --// 
									this.bApiComplete = true;
									
									//-- Flag that the user isn't currently logged in --//
									iomy.common.bUserCurrentlyLoggedIn = false;
									
									iomy.common.showError("HTTP 520 Status Code: Corrupted User Data! Please contact the administrator to ");
									
								//------------------------------------------------------------------------//
								//-- 2.2.F - UNEXPECTED STATUS CODE:                                    --//
								//------------------------------------------------------------------------//
								} else {
									//-- Log the Error --//
									this.DebugLogString += "HTTP Status:"+err.status+"\n The above error code is not expected! \nError Mesgage:"+err.message+"\n";
									
									//-- Flag that we shouldn't retry the ajax request (because we assume it won't help the error that we are getting) --//
									this.bApiComplete = true;
									
								}
								
								//------------------------------------------------------------------------//
								//-- 2.3 - RETRY OR FINALISE                                            --//
								//------------------------------------------------------------------------//
								//-- 2.3.1.A - IF CONTINUE RETRYING --//
								//-- API didn't get a desired result and max retries not exceeded --//
								if( this.bApiComplete===false && this.RetryAttemptCount<this.RetryAttemptLimit ) {
									//-- Display an message --//
									this.DebugLogString += "-- The API did not yield a desired result and the UI will be retry to see if a desired result can be achieved! --\n\n";
									
									//-- RETRY AJAX REQUEST --//
									$.ajax(this);
									return;
									
								//-- 2.3.1.B - ELSE IF MAXIMUM RETRY ATTEMPTS EXCEEDED --//
								//-- API didin't get a desired result before max attempts was exceeded --//
								} else if( (this.RetryAttemptCount===this.RetryAttemptLimit) && this.bApiComplete == false) {
									this.DebugLogString += sDebugLogLines+"The number of retry attempts to get a desired result from the API has been exceeded! \nThe UI will no make any more attempts with this request.\n"+sDebugLogLines;
									jQuery.sap.log.error(this.DebugLogString, "", "PHP Ajax Request");
								}
								
								//------------------------------------------------------------------------//
								//-- 2.4 - TRIGGER THE PASSED "FAIL FUNCTION"                           --//
								//------------------------------------------------------------------------//
								//-- If we aren't retrying the ajax request we should run the onFail function --//
								if(aConfig.onFail) {
									try {
										aConfig.onFail(err);
									} catch( e21 ) {
										jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e21)\n"+e21.message+" \n"+sUrl, "", "iomy.apiphp.AjaxRequest");
									}
								}
							
							} else {
								var sErrorMesg2 = "Silently aborting PHP API request (before parsing the unsucessful response from the ajax request) due to being logged out!!";
								jQuery.sap.log.info( sErrorMesg2, "", "iomy.apiphp.AjaxRequest" );
							}
							
							
						} catch(e20) {
							jQuery.sap.log.error("== Critical Error! == \n"+this.DebugLogString+"\n Error Message="+e20.message , "", "PHP Ajax Request");
						}
					}
				});
				
			//-----------------------------------------------------------------------------//
			//-- ELSE This ajax task is orphaned and should abort silently               --//
			//-----------------------------------------------------------------------------//
			} else {
				var sErrorMesg = "Silently aborting PHP API request (before starting the ajax request) due to being logged out!";
				jQuery.sap.log.info( sErrorMesg, "", "iomy.apiphp.AjaxRequest" );
			}
		}
	},
    
    /**
     * Replace the onFail function with one that brings up an error popup that
     * the user will be taken back to the sign in page again. If a previous API
     * call encountered a 403 error, then a popup will have already appeared or
     * will appear, so an empty function will be given.
     * 
     * @param {Map} mConfig             The config map that came with the API call.
     */
	handle403APIError : function (mConfig) {
        //--------------------------------------------------------------------//
        // Check that the request config was given
        //--------------------------------------------------------------------//
        if (mConfig === undefined) {
            throw new MissingSettingsMapException("API request config must be given!");
        }
        
        //--------------------------------------------------------------------//
        // Handle the error by replacing the onFail function.
        //--------------------------------------------------------------------//
        if (iomy.common.bSessionTerminated === false) {
            //-- 403 Errors indicate that the session has been terminated and the user will need to log back in. Flag this --//
            iomy.common.bSessionTerminated = true;
            //-- Overwrite the onFail function to handle a terminated session. --//
            mConfig.onFail = function () {
                //-- 403 was returned! Take the user back to the login screen   --//
                //-- once they close the dialog.                                --//
                window.location.reload(true);   // TRUE forces a reload from the server, NOT the cache!
            };
        } else {
            //------------------------------------------------------------------------//
            // If there is a slew of requests being run at once, one log out command
            // should be executed. The other requests should do nothing.
            //------------------------------------------------------------------------//
            mConfig.onFail = function () {};
        }
    }
	

});