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

$.sap.declare("IomyRe.apiphp",true);

IomyRe.apiphp = new sap.ui.base.Object();

$.extend(IomyRe.apiphp,{
	
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
		var sUrlPublic      = IomyRe.common.ConfigVars("URLPublicApi");
		var sUrlRestricted  = IomyRe.common.ConfigVars("URLRestrictedApi");
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
		
		iLoginTimestamp = IomyRe.common.oCurrentLoginTimestamp.getTime();
		
		//------------------------------------------------//
		//-- 3.0 - Make the Ajax Request                --//
		//------------------------------------------------//
		if( sUrl && sDataType && sERType ) {
			//--------------------------------------------//
			//-- Check if the User is logged in         --//
			//--------------------------------------------//
			if( IomyRe.common.bUserCurrentlyLoggedIn===true ) {
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
							if( IomyRe.common.bUserCurrentlyLoggedIn===true && this.iCurrentLoginTimestamp===IomyRe.common.oCurrentLoginTimestamp.getTime() ) {
								
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
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onSuccess\" section of the passed parameter!. (e01)\n"+e01.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
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
														jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onSuccess\" section of the passed parameter!. (e02)\n"+e02.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
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
														jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e03)\n"+e03.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
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
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e04)\n"+e04.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
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
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e05)\n"+e05.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
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
													jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e06)\n"+e06.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
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
											jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e07)\n"+e07.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
										}
									}
								}
							
							//--------------------------------------------------------//
							//-- ELSE This is ajax task has been orphaned           --//
							//--------------------------------------------------------//
							} else {
								var sErrorMesg2 = "Silently aborting PHP API request (before parsing the sucessful response from the ajax request) due to being logged out!!";
								jQuery.sap.log.info( sErrorMesg2, "", "IomyRe.apiphp.AjaxRequest" );
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
							if( IomyRe.common.bUserCurrentlyLoggedIn===true && this.iCurrentLoginTimestamp===IomyRe.common.oCurrentLoginTimestamp.getTime() ) {
								//================================================//
								//== 2.1 - Initialise Variables                 ==//
								//================================================//
								var sDebugLogLines = "=================================\n";
								
								if(this.RetryAttemptCount===0) {
									this.DebugLogString += "\n"+sDebugLogLines+"== PHP Ajax Error!            ==\n"+sDebugLogLines;
								}
								
								this.RetryAttemptCount++;
								this.DebugLogString += "Attempt "+this.RetryAttemptCount+"! ";
								
								//------------------------------------------------------------------------//
								//-- 2.2.A - HTTP 500 STATUS CODE: The dreaded error code has occurred! --//
								//------------------------------------------------------------------------//
								if (err.status=='500') {
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
										IomyRe.common.showError("Incorrect username and/or password. Please retype your username and password again!");
										IomyRe.common.showLoading(false);
										
									} else {
										IomyRe.common.showError("Unexpected HTTP 401 Status Code");
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
									IomyRe.common.bUserCurrentlyLoggedIn = false;
									
									//-- Run the handle403APIError function --//
		                            IomyRe.apiphp.handle403APIError(aConfig);
									
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
										jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e21)\n"+e21.message+" \n"+sUrl, "", "IomyRe.apiphp.AjaxRequest");
									}
								}
							
							} else {
								var sErrorMesg2 = "Silently aborting PHP API request (before parsing the unsucessful response from the ajax request) due to being logged out!!";
								jQuery.sap.log.info( sErrorMesg2, "", "IomyRe.apiphp.AjaxRequest" );
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
				jQuery.sap.log.info( sErrorMesg, "", "IomyRe.apiphp.AjaxRequest" );
			}
		}
	},
	
	//============================================================================================//
	//== REFRESH THE THINGLIST                                                                  ==//
	//============================================================================================//
	//-- Description: This function is used to create an updated "ThingList" so that it can     --//
	//--    replace the existing version. Many pages require this list to be setup in order for --//
	//--    those pages to be able to work.                                                     --//
	//--------------------------------------------------------------------------------------------//
	RefreshThingList: function( oConfig ) {
		//---------------------------------------------------------------------------//
		//-- NOTE: aConfig is an associative array that has the following elements --//
		//---------------------------------------------------------------------------//
		//-- @onSuccess               (optional) FUNCTION    - This is for queueing up functions to run if the Ajax request is successful.                                       --//
		
		//------------------------------------------------//
		//-- 1.0 - Initialise Variables                 --//
		//------------------------------------------------//
		var oScope                  = this;         //-- OBJECT:    Used to bind the scope to an object for sub-function if they need it.                                   --//
		var aThingList              = {};           //-- ARRAY:     The new updated "ThingList" that is being built to replace the existing ThingList in the commons Lib.   --//
		
		var iTempLinkId             = 0;            //-- INTEGER:   Commonly used variable. Holds the "Link Id" which is used several times in this function.               --//
		var iTempThingId            = 0;            //-- INTEGER:   Commonly used variable. Holds the "Thing Id" which is used several times in this function.              --//
		var iTempIOId               = 0;            //-- INTEGER:   Commonly used variable. Holds the "IO Id" of the IO that is currently being processed.                  --//
		var iPreviousThingId        = -10;          //-- INTEGER:   Used to store what was the current "Thing Id" so that if it changes then it knows it needs creating     --//
		var oTempThing              = {};           //-- OBJECT:    Used to create an associative array that holds the relevant data about the Thing and its Link and IOs   --//
		var oTempIO                 = {};           //-- OBJECT:    Used to create the IO associative array. This and the oTempThing may end up be coming                   --//
		
		//------------------------------------------------//
		//-- 2.0 - Start the Ajax Request               --//
		//------------------------------------------------//
		try {
			IomyRe.apiphp.AjaxRequest({
				//-- Set the URL to the IODetection --//
				url: IomyRe.apiphp.APILocation("iodetection"),
				//-- The Data and MimeTypes can be left on the default values --//
				//-- On Success --//
				onSuccess:$.proxy(function(sDataType, data) {
					//----------------------------------------------------------------//
					//-- 2.A.1.0 - Foreach IO from the IODetect API                 --//
					//----------------------------------------------------------------//
					$.each( data,function(index, aIO) {
						try {
							//--------------------------------------------------------------------//
							//-- 2.A.1.1 - PREP: Store commonly used Temporary variables        --//
							//--------------------------------------------------------------------//
							iTempLinkId     = aIO.LinkId;
							iTempThingId    = aIO.ThingId;
							iTempIOId       = aIO.IOId;
							
							//--------------------------------------------------------------------//
							//-- 2.A.1.3 - STEP 2: Device List Thing                            --//
							//--------------------------------------------------------------------//
							if( iPreviousThingId!==iTempThingId ) {
								//-- Check to see if the device exists --//
								if( ! aThingList["_"+iTempThingId] ) {
									//--------------------------------------------------------//
									//-- Add the missing "Thing"                            --//
									//--------------------------------------------------------//
									
									//-- Wipe the variable --//
									oTempThing = {};
									
									//-- Add the Id to the array --//
									oTempThing.Id                  = iTempThingId;
									
									//-- Add the basic Thing information for the Thing --//
									oTempThing.DisplayName         = aIO.ThingName;
									
									//-- Add the Thing Status (THING_STATE) --//
									oTempThing.Status              = aIO.ThingStatus;
									
									//-- Thing Type --//
									oTempThing.TypeId              = aIO.ThingTypeId;
									oTempThing.TypeName            = aIO.ThingTypeName;
									
									//-- Add the basic Link information for the device --//
									oTempThing.LinkId              = iTempLinkId;
									oTempThing.LinkDisplayName     = aIO.LinkDisplayName;
									oTempThing.LinkStatus          = aIO.LinkStatus;
									
									//-- Add the Premise Id --//
									oTempThing.PremiseId           = aIO.PremiseId;
									//-- Add the Room Id (if a room is assigned) --//
									oTempThing.RoomId              = aIO.RoomId;
									
									//-- Store the Permissions --//
									oTempThing.PermRead            = aIO.PermissionRead;
									oTempThing.PermWrite           = aIO.PermissionWrite;
									oTempThing.PermToggle          = aIO.PermissionStateToggle;
									
									//-- Store when this thing was last updated --//
									oTempThing.UILastUpdate        = new Date();
                                    
                                    //-- Store references to the widgets containing display names. --//
                                    oTempThing.LabelWidgets        = [];
									
									//-- Add an associative array for the IOs --//
									oTempThing.IO                  = {};
									
									//--------------------------------------------------------//
									//-- Add the thing                                      --//
									//--------------------------------------------------------//
									aThingList["_"+iTempThingId]  = oTempThing;
									
									//--------------------------------------------------------//
									//-- Check that the Premise is setup in the Rooms List  --//
									//--------------------------------------------------------//
									if( !!IomyRe.common.RoomsList["_"+aIO.PremiseId] ) {
										//-- Do nothing --//
										
									} else {
										//-- Setup the PremiseId in the RoomsList global variable --//
										IomyRe.common.RoomsList["_"+aIO.PremiseId] = {};
									}
									
									
									//--------------------------------------------------------//
									//-- Check if the Room isn't valid                      --//
									//--------------------------------------------------------//
									if( !(aIO.RoomId >= 1) || !IomyRe.common.RoomsList["_"+aIO.PremiseId]["_"+aIO.RoomId] ) {
										//--------------------------------------------------------//
										//-- CHECK IF THE "Unassigned" ROOM DOESN'T EXIST       --//
										//--------------------------------------------------------//
										if( !IomyRe.common.RoomsList["_"+aIO.PremiseId].Unassigned ) {
											//-- CREATE THE "UNASSIGNED" ROOM --//
											IomyRe.common.RoomsList["_"+aIO.PremiseId].Unassigned = { 
												"PremiseId":        aIO.PremiseId,
												"PremiseName":      aIO.PremiseName,
												"RoomId":           null,
												"RoomName":         "Unassigned",
												"Things":           {} 
											};
										}
										//--------------------------------------------------------//
										//-- STORE THE THING IN THE "UNASSIGNED"                --//
										//--------------------------------------------------------//
										IomyRe.common.RoomsList["_"+aIO.PremiseId].Unassigned.Things["_"+iTempThingId] = {
											"Link":     iTempLinkId,
											"Thing":    iTempThingId
										}
										
									} else {
										//--------------------------------------------------------//
										//-- STORE THE THING IN THE ROOM                        --//
										//--------------------------------------------------------//
										IomyRe.common.RoomsList["_"+aIO.PremiseId]["_"+aIO.RoomId].Things["_"+iTempThingId] = {
											"Link":     iTempLinkId,
											"Thing":    iTempThingId
										}
										
									}
									
								}	//-- End if to verify if the device exists --//
								//--------------------------------------------------------------//
								//-- Store the Current "LinkId" as the previous "LinkId"      --//
								//--------------------------------------------------------------//
								iPreviousLinkId = iTempLinkId;
							}
							
							//------------------------------------------------------------//
							//-- 2.A.1.4 - STEP 3: Add the IO                           --//
							//------------------------------------------------------------//
							
							//-- Add an Associative Array for the IO to be stored in --//
							oTempIO = {};
							
							//------------------------------------------------------------//
							//-- Part A - IO Info                                       --//
							//------------------------------------------------------------//
							//-- Add the IO Id --//
							oTempIO.Id              = aIO.IOId;
							//-- Add the IO DisplayName --//
							oTempIO.Name            = aIO.IOName;
							//-- Add the IO Status --//
							oTempIO.Status          = aIO.IOStatus;
							//-- Add the IO Type Id --//
							oTempIO.TypeId          = aIO.IOTypeId;
							//-- Add the IO DataType --//
							oTempIO.DataType        = aIO.DataType;
							//-- Add the IO DataTypeName --//
							oTempIO.DataTypeName    = aIO.DataTypeName;
							//-- Add the IO DataType Enumeration Flags --//
							oTempIO.DataTypeEnum    = aIO.DataTypeEnum;
							//-- Add the IO SampleRate --//
							oTempIO.Samplerate      = aIO.IOSamplerate;
							//-- Add the IO SampleRateLimit --//
							oTempIO.SamplerateLimit = aIO.IOSamplerateLimit;
							//-- Add the IO ConvertRate --//
							oTempIO.Convertrate     = aIO.IOConvertRate;
							
							//------------------------------------------------------------//
							//-- Part B - IO UoM                                        --//
							//------------------------------------------------------------//
							
							//-- Add the IO UoM Id --//
							oTempIO.UoMId          = aIO.UomId;
							//-- Add the IO UoM Name --//
							oTempIO.UoMName        = aIO.UomName;
							//-- Add the IO UoMSubCat Id --//
							oTempIO.UoMSubCatId    = aIO.UomSubCatId;
							//-- Add the IO UoMSubCat Name --//
							oTempIO.UoMSubCatName  = aIO.UomSubCatName;
							//-- Add the IO UoMCat Id --//
							oTempIO.UoMCatId       = aIO.UomCatId;
							//-- Add the IO UoMCat Name --//
							oTempIO.UoMCatName     = aIO.UomCatName;
							
							//------------------------------------------------------------//
							//-- Part C - IO Resource Categorization                    --//
							//------------------------------------------------------------//
							//-- Add the IO RSCat Id --//
							oTempIO.RSCatId        = aIO.RSCatId;
							//-- Add the IO RSSubCat Id --//
							oTempIO.RSSubCatId     = aIO.RSSubCatId;
							//-- Add the IO RSSubCat Name --//
							oTempIO.RSSubCatName   = aIO.RSSubCatName;
							//-- Add the IO RSSubCat Type --//
							oTempIO.RSSubCatType   = aIO.RSSubCatType;
							//-- Add the IO RSTariff Id --//
							oTempIO.RSTariffId     = aIO.RSTariffId;
							//-- TODO: Add a Tariff code (to indicate which Tariff of that type) to the Database and API --//
							
							//-- Add the IO RSType Id --//
							oTempIO.RSTypeId       = aIO.RSTypeId;
							//-- Add the IO RSType Main Flag --//
							oTempIO.RSTypeMain     = aIO.RSTypeMain;
							
							//------------------------------------------------------------//
							//-- Add the IO to the device list                          --//
							//------------------------------------------------------------//
							aThingList["_"+iTempThingId].IO["_"+iTempIOId] = oTempIO;
							
							
							
						} catch(e2) {
							jQuery.sap.log.error("CriticalErrorIODetect: "+e2.message, "", "IO Detection");
						}
					}); //-- End of foreach loop ($.each) --//
                    
                    //----------------------------------------------------------------//
					//-- Store the Lists in global variables so the                 --//
					//-- other UI components can use them.                          --//
					//----------------------------------------------------------------//
					try {
						IomyRe.common.ThingList = aThingList;
					} catch(e1234) {
						jQuery.sap.log.error("Problem Mapping ThingList: "+e1234.message, "", "IO Detection");
					}
					
					//--------------------------------------------------------//
                    // ONLY add these hard-coded devices if user is 'demo'.
                    //--------------------------------------------------------//
//                    if (IomyRe.common.CurrentUsername === "demo") {
//                        IomyRe.experimental.addDemoDataToThingList();
//                    }
					
					//----------------------------------------------------------------//
					//-- 8.0 - DEBUGGING                                            --//
					//----------------------------------------------------------------//
					var sTemp = "=================================\n";
					jQuery.sap.log.debug( sTemp+"== common.ThingList           ==\n"+JSON.stringify(IomyRe.common.ThingList), "", "IO Detection");
					
					//-- Update the Timestamp on when the ThingList was last updated --//
					IomyRe.common.ThingListLastUpdate = new Date();
					
					//----------------------------------------------------------------//
					//-- 9.0 - FINALISE BY TRIGGERING THE NEXT TASK                 --//
					//----------------------------------------------------------------//
					if(oConfig.onSuccess) {
						
						IomyRe.common.bCoreRefreshInProgress = false;
						
						oConfig.onSuccess();
					}
					
				},oScope), 	//-- End of "OnSuccess" Ajax Request --//
                
                onFail : function (response) {
                    jQuery.sap.log.error("Error refreshing thing list: "+JSON.stringify(response));
                    //-- Perform the "onFail" function if applicable --//
                    if(oConfig.onFail) {
                        oConfig.onFail();
                    }
                }
			}); //-- End of Ajax Request --//
			//
			
		} catch(e1) {
            IomyRe.common.bCoreRefreshInProgress = false;
			jQuery.sap.log.error( "RefreshThingList: "+e1.message, "", "IO Detection");
            
            //-- Perform the "onFail" function if applicable --//
            if(oConfig.onFail) {
                oConfig.onFail();
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
        if (IomyRe.common.bSessionTerminated === false) {
            //-- 403 Errors indicate that the session has been terminated and the user will need to log back in. Flag this --//
            IomyRe.common.bSessionTerminated = true;
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