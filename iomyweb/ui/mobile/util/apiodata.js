/*
Title: OData API Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Module for handling communication with the OData service and the data retrived from it
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

$.sap.declare("IOMy.apiodata",true);

IOMy.apiodata = new sap.ui.base.Object();

$.extend(IOMy.apiodata,{
	
	callingObject : null,
	
    /**
     * Returns the URL of an OData service requesting using a string that this
     * function will take and use it to return the correct OData URL.
     * 
     * @param {type} sOData     String code
     * @returns {String}        URL of the OData service
     */
	ODataLocation: function( sOData ) {
		
		var sUrlPublic			= IOMy.common.ConfigVars("URLPublicApi");
		var sUrlRestricted		= IOMy.common.ConfigVars("URLRestrictedApi");
		
		var sUrlOData	= IOMy.common.ConfigVars("URLRestrictedOData");
		
		var sReturn			= "";
		
		switch(sOData) {
			//--------------------------------//
			//-- Public ODatas				--//
			//--------------------------------//
			case "regions":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_REGION';
				break;
				
			case "currencies":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_CURRENCIES';
				break;
				
			case "language":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_LANGUAGES';
				break;
				
			case "postcode":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_POSTCODES';
				break;
				
			case "stateprovince":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_STATEPROVINCE';
				break;
				
			case "timezones":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_TIMEZONES';
				break;
				
			case "icons":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_ICONS';
				break;
			
			case "link_types":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_LINKTYPE';
				break;
				
			case "thing_types":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_THINGTYPE';
				break;
                
            case "premise_occupants":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_PREMISEOCCUPANTS';
				break;
				
            case "premise_bedrooms":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_PREMISEBEDROOMS';
				break;
				
            case "premise_floors":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_PREMISEFLOORS';
				break;
				
            case "premise_rooms":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_PREMISEROOMS';
				break;
				
			case "rscategories":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_RSCAT';
				break;
				
			case "rssubcategories":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_RSSUBCAT';
				break;
				
			case "rstariff":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_RSTARIFF';
				break;
				
			case "rstypes":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_RSTYPES';
				break;
				
			case "uom":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_UOMS';
				break;
                
            case "gender":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_USERSGENDER';
				break;
                
            case "room_types":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VP_ROOMTYPE';
				break;
			
			//--------------------------------//
			//-- Restricted ODatas			--//
			//--------------------------------//
			case "link":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSLINK';
				break;
				
			case "thing":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSTHING';
				break;
				
			case "premises":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSPREMISES';
				break;
                
            case "premiselocation":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSPREMISELOCATIONS';
				break;
				
            case "premise_perm_rooms":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSPREMISEROOMS';
				break;
				
			case "rooms":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSROOMS';
				break;
				
			case "io":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSIO';
				break;
				
			case "hubs":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSHUB';
				break;
				
			case "comms":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSCOMM';
				break;
				
			case "users":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_USERSINFO';
				break;
				
			//--------------------------------//
			//-- Restricted DATA ODatas		--//
			//--------------------------------//
			case "datatinyint":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATATINYINT';
				break;
				
			case "datatinyinteger":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATATINYINT';
				break;
				
			case "dataint":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATAINT';
				break;
				
			case "datainteger":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATAINT';
				break;
				
			case "databigint":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATABIGINT';
				break;
				
			case "datafloat":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATAFLOAT';
				break;
				
			case "datatinystring":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATATINYSTRING';
				break;
				
			case "datashortstring":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATASHORTSTRING';
				break;
				
			case "datamedstring":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATAMEDSTRING';
				break;
				
			case "datamediumstring":
				sReturn = sUrlRestricted+'/odata/Main.svc.php/VR_DATAMEDSTRING';
				break;
			
		}
		
		return sReturn;
	},
	
	//============================================================//
	//== ODATA API AJAX REQUEST FUNCTION						==//
	//============================================================//
	AjaxRequest : function( aConfig ) {
		//-- TODO: Get HTTP POST working and tested --//
		
		//============================================================//
		//== Declare Variables										==//
		//============================================================//
		var me						= this;				//-- SCOPE:			--//
		var oAjax;										//-- OBJECT:		--//
		
		var iCurrentRetryCount		= 0;			//-- INTEGER:		--//
		var bApiComplete			= false;		//-- BOOLEAN:		--//
		
		var ajaxFunction;							//-- FUNCTION:		Used to call the ajax function as many times as needed --//
		var sUrl					= "";			//--  --//
		var sCols					= "";			//--  --//
		var sWhere					= "";			//--  --//
		var sOrder					= "";			//--  --//
		var iLimit					= 0;			//--  --//
		var sHTTPMethod				= "";			//-- STRING:		Used to indicate if the "HTTP GET" or "HTTP POST" should be used --//
		var sDataType				= "";			//-- STRING:		Used to indicate which which DataType should be returned --//
		var iLoginTimestamp         = 0;            //-- INTEGER:       --//
		
		//============================================================//
		//== Setup Variables										==//
		//============================================================//
		sUrl			= aConfig.Url;
		iLimit			= aConfig.Limit || 0;
		sHTTPMethod		= aConfig.HTTPMethod || "GET";
		sDataType		= aConfig.DataType || "json";
		iLoginTimestamp = IOMy.common.oCurrentLoginTimestamp.getTime();
		
		
		
		try {
			//-- Create the string for the Columns --//
			for (var i = 0; i < aConfig.Columns.length; i++) {
				if (i < aConfig.Columns.length - 1) {
					sCols += aConfig.Columns[i] + ",";
				} else {
					sCols += aConfig.Columns[i];
				}
			}
			
			//-- Setup the string for the "Where Clause" --//
			for (var i = 0; i < aConfig.WhereClause.length; i++) {
				if (i < aConfig.WhereClause.length - 1) {
					sWhere += aConfig.WhereClause[i] + " and ";
				} else {
					sWhere += aConfig.WhereClause[i];
				}
			}
			
			//-- Setup the string for the "Orderby Clause" --//
			for (var i = 0; i <aConfig.OrderByClause.length; i++) {
				if (i < aConfig.OrderByClause.length - 1) {
					sOrder += aConfig.OrderByClause[i] + ",";
				} else {
					sOrder += aConfig.OrderByClause[i];
				}
			}
			
			//----------------------------------------//
			//-- ADD THE "HTTP GET" PARAMETERS		--//
			//----------------------------------------//
			if( sHTTPMethod!=="POST" ) {
				sUrl += "?";
				//-- ADD THE COLUMNS --//
				if (sCols !== "") {
					sUrl += "$select="+sCols;
				}
				//-- ADD THE WHERE CLAUSE --//
				if (sWhere !== "") {
					sUrl += "&$filter="+sWhere;
				}
				//-- ADD THE ORDER BY CLAUSE --//
				if (sOrder !== "") {
					sUrl += "&$orderby="+sOrder;
				}
				//-- If DataType is specified as json --//
				if( sDataType==='json' ) {
					sUrl += "&$format=json";
				}
				//-- ADD THE LIMIT (IF APPLICABLE) --//
				if (iLimit > 0) {
					sUrl += "&$top="+iLimit;
				}
			}
			jQuery.sap.log.debug(sUrl);
		} catch(e2) {
			jQuery.sap.log.error("Error  "+e2.message, "", "IOMy.apiodata.AjaxRequest");
			
		}
		
		//-- TODO: "HTTP POST" Parameters --//
		
		//============================================================//
		//== ODATA API REQUEST                                      ==//
		//============================================================//
		//-- Check that the User is logged in --//
		if( IOMy.common.bUserCurrentlyLoggedIn===true ) {
			
			oAjax = $.ajax({
				url:                    sUrl,
				crossDomain:            true,
				dataType:               sDataType,      //-- Expected Result --//
				type:                   sHTTPMethod,    //--  --//
				RetryAttemptCount:      0,
				RetryAttempLimit:       3,
				bApiComplete:           false,
				iCurrentLoginTimestamp: iLoginTimestamp,
				DebugLogString:         "",
				
				//============================================================================================//
				//== AJAX "SUCCESS" EVENT
				//============================================================================================//
				success : function( Response, sStatus, XHR ){
					//============================================================//
					//== 1.1 - Initialise Variables                             ==//
					//============================================================//
					var sContentType			= "";
					var sERType					= "";
					var aData					= {};				//-- ARRAY:		Used in the "json" mode to pass the ajax results to the onSuccess function --//
					var sData					= "";				//-- STRING:	Used in other modes to pass the ajax results to the onSuccess function --//
					
					var sDebugLogLines			= "=================================\n";
					var sDebugHeader			= "\n"+sDebugLogLines+"== Odata Ajax Error!            ==\n"+sDebugLogLines;
					
					//============================================================//
					//== 1.2 - Decide what to do on success                     ==//
					//============================================================//
					try {
						//============================================================//
						//== 1.2.A - IF this task is orphaned                       ==//
						//============================================================//
						if( IOMy.common.bUserCurrentlyLoggedIn===false || this.iCurrentLoginTimestamp!==IOMy.common.oCurrentLoginTimestamp.getTime() ) {
							//-- TODO: Log a message that an Odata API request had to be aborted --//
							var sErrorMesg1 = "Silently aborting Odata API request (before parsing the sucessful response from the ajax request) due to being logged out!";
							jQuery.sap.log.info( sErrorMesg1, "", "IOMy.apiodata.AjaxRequest" );
							
						//============================================================//
						//== 1.2.B - ELSEIF the Response isn't null                 ==//
						//============================================================//
						} else if( Response!==null ) {
							//--------------------------------------------//
							//-- 1.2.A.1 - Retrieve the "content-type"  --//
							//--------------------------------------------//
							sContentType = XHR.getResponseHeader("content-type") || "";
							
							if( sDataType==="json" ) {
								sERType = "application/json";
								
							//-- TODO: Add the xml atom format mime type --//
							//} else {
							//	sExpectedResponseType = "";
							}
							
							//------------------------------------------------------------//
							//-- 1.2.A.2.A - If the Response ContentType is expected    --//
							//------------------------------------------------------------//
							if( sContentType.indexOf(sERType) > -1 ) {
								
								//----------------------------------------------------//
								//-- 1.2.A.2.A.A - If Expecting JSON response       --//
								//----------------------------------------------------//
								if(sERType==="application/json") {
									//--DEBUGGING --//
									
									//-- Check the Results --//
									if (Response.d === undefined) {
										try {
											aConfig.onFail(Response);
										} catch( e02 ) {
											if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
											jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e02)\n"+e02.message+" \n"+sUrl, "", "IOMy.apiodata.AjaxRequest");
										}
										
										
									} else {
										//-- Check if the Result is undefined --//
										if( Response.d.results===undefined ) {
											aData = Response.d;
											try {
												aConfig.onSuccess("JSON", aData);
											} catch( e03 ) {
												if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
												jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onSuccess\" section of the passed parameter!.(e03)\n"+e03.message+" \n"+sUrl, "", "IOMy.apiodata.AjaxRequest");
											}
											
										} else {
											aData = Response.d.results;
											try {
												aConfig.onSuccess("JSON", aData);
											} catch( e04 ) {
												if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
												jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onSuccess\" section of the passed parameter!. (e04)\n"+e04.message+" \n"+sUrl, "", "IOMy.apiodata.AjaxRequest");
											}
											
										}
										
										
									}
									return;
									
								//--------------------------------------------------------//
								//-- 1.2.A.2.A.B - If Expecting XML/Atom response       --//
								//--------------------------------------------------------//
									
								//--------------------------------------------------------------------------------------------//
								//-- 1.2.A.2.A.C - Else this function isn't configured on what to do with this datatype     --//
								//--------------------------------------------------------------------------------------------//
								} else {
									//-- No Method for this response type --//
									if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
									jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Unexpected Method for parsing Response type, ExpResType="+sERType, "", "IOMy.apiodata.AjaxRequest" );
									
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
									if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
									jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Unexpected Response, ContentType="+sContentType+"  Response="+Response, "", "IOMy.apiodata.AjaxRequest");
									
								} else {
									//-- Push Error to Console Log --//
									if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
									jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Unexpected Response, ContentType="+sContentType+", Expected="+cfg.ExpectedResponseType, "", "IOMy.apiodata.AjaxRequest");
								}
							}
						//============================================================//
						//== 1.2.C - ELSE the Response is null                      ==//
						//============================================================//
						} else {
							//-- Error: Response is null --//
							
							if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
							jQuery.sap.log.error(this.DebugLogString+"ErrMesg: Response is null", "", "IOMy.apiodata.AjaxRequest");
						}
					} catch(e1) {
						
						if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
						jQuery.sap.log.error(this.DebugLogString+"\nCritical Error occurred in the Success Section: "+e1.message, "", "IOMy.apiodata.AjaxRequest");
					}
				},
				//============================================================================================//
				//== AJAX "ERROR" EVENT
				//============================================================================================//
				error : function(err) {  //When ajax request occur error,post parameters error.
					//============================================================//
					//== 2.1 - Initialise Variables                             ==//
					//============================================================//
					var sDebugLogLines = "=================================\n";
					
					
					//============================================================//
					//== 2.2.A - IF this task is orphaned                       ==//
					//============================================================//
					if( IOMy.common.bUserCurrentlyLoggedIn===false || this.iCurrentLoginTimestamp!==IOMy.common.oCurrentLoginTimestamp.getTime() ) {
						//-- TODO: Log a message that an Odata API request had to be aborted --//
						var sErrorMesg1 = "Silently aborting Odata API request (before parsing the unsucessful response from the ajax request) due to being logged out!";
						jQuery.sap.log.info( sErrorMesg1, "", "IOMy.apiodata.AjaxRequest" );
							
					//============================================================//
					//== 2.2.B - ELSE the task is not orphaned                  ==//
					//============================================================//
					} else {
						
						try {
							if(this.RetryAttemptCount===0) {
								this.DebugLogString += "\n"+sDebugLogLines+"== PHP Ajax Error!            ==\n"+sDebugLogLines;
							}
							
							this.RetryAttemptCount++;
							this.DebugLogString += "Attempt "+this.RetryAttemptCount+"! ";
							
							
							
							//------------------------------------------------------------------------//
							//-- 2.3.A - HTTP 500 STATUS CODE: The dreaded error code has occurred! --//
							//------------------------------------------------------------------------//
							if (err.status=='500') {
								//-- Flag that the API is not complete and should possibly try again (if allowed) --//
								this.bApiComplete = false;
								
							//------------------------------------------------------------------------//
							//-- 2.3.B - HTTP 200 STATUS CODE:                                      --//
							//------------------------------------------------------------------------//
							} else if (err.status=="200") {
								//-- NOTE: API didn't return a valid response (most likely an error message)  --//
								this.DebugLogString += "Status Code 200: Server returned a error message: (\n"+err.responseText+")\n";
								//-- Flag that we can try again for a different result as the API Request isn't complete --//
								this.bApiComplete = false;
								
							//------------------------------------------------------------------------//
							//-- 2.3.C - HTTP 0 STATUS CODE:                                        --//
							//------------------------------------------------------------------------//
							} else if (err.status=="0") {
								//-- NOTE: This is a weird non-standard error code (more info on what causes of this needs to be found) --//
								//-- Log that it happened and try again --//
								this.DebugLogString += "The HTTP 0 Status Code has been returned! UI Developers need to be notified. \n";
								//-- Flag that we can try again for a different result as the API Request isn't complete --//
								this.bApiComplete = false;
								
							//------------------------------------------------------------------------//
							//-- 2.3.D - HTTP 401 STATUS CODE:                                      --//
							//------------------------------------------------------------------------//
							} else if (err.status=="401") {
								//-- TODO: This section needs to be looked into further to see if anything needs to be changed --// 
								
								if( statusObj ) {
									IOMy.common.notAuthorized("HTTP Auth has expired! Please log back in to continue.");
									
								} else if( aConfig.auth ) {
									IOMy.common.showError("Incorrect username and/or password. Please retype your username and password again!");
									IOMy.common.showLoading(false);
									
								} else {
									IOMy.common.showError("Unexpected HTTP 401 Status Code");
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
								IOMy.common.bUserCurrentlyLoggedIn = false;
									
								//-- Run the handle403APIError function --//
								IOMy.apiphp.handle403APIError(aConfig);
			
							//------------------------------------------------------------------------//
							//-- 2.3.F - UNEXPECTED STATUS CODE:                                    --//
							//------------------------------------------------------------------------//
							} else {
								//-- Log the Error --//
								this.DebugLogString += "HTTP Status:"+err.status+"\n The above error code is not expected! \nError Mesgage:"+err.message+"\n";
								
								//-- Flag that we shouldn't retry the ajax request (because we assume it won't help the error that we are getting) --//
								this.bApiComplete = true;
							}
							
						} catch( e20 ) {
							//-- Flag that this API Request has completed unsuccessfully --//
							this.bApiComplete = true;
							jQuery.sap.log.error( "Critical Error occurred in the Odata on error section 1: "+e20.message, "", "IOMy.apiodata.AjaxRequest" );
						}
						
						try {
							//------------------------------------------------------------------------//
							//-- 2.4 - RETRY OR FINALISE                                            --//
							//------------------------------------------------------------------------//
							//-- 2.4.1.A - IF CONTINUE RETRYING --//
							//-- API didn't get a desired result and max retries not exceeded --//
							if( this.bApiComplete===false && this.RetryAttemptCount<this.RetryAttempLimit ) {
								//-- Display an message --//
								this.DebugLogString += "-- The API did not yield a desired result and the UI will be retry to see if a desired result can be achieved! --\n\n";
								
								//-- RETRY AJAX REQUEST --//
								$.ajax(this);
								return;
								
							//-- 2.4.1.B - ELSE IF MAXIMUM RETRY ATTEMPTS EXCEEDED	--//
							//-- API didin't get a desired result before max attempts was exceeded --//
							} else if( (this.RetryAttemptCount===this.RetryAttempLimit) && this.bApiComplete == false) {
								this.DebugLogString += sDebugLogLines+"The number of retry attempts to get a desired result from the API has been exceeded! \nThe UI will no make any more attempts with this request.\n"+sDebugLogLines;
								jQuery.sap.log.error(this.DebugLogString, "", "IOMy.apiodata.AjaxRequest");
							}
							
							//------------------------------------------------------------------------//
							//-- 2.5 - TRIGGER THE PASSED "FAIL FUNCTION"                           --//
							//------------------------------------------------------------------------//
							//-- If we aren't retrying the ajax request we should run the onFail function --//
							if(aConfig.onFail) {
								//aConfig.onFail(err);
								try {
									aConfig.onFail( err );
								} catch( e21 ) {
									if( this.DebugLogString==="" ) { this.DebugLogString = sDebugHeader; }
									jQuery.sap.log.error(this.DebugLogString+"\nCritical Error: Problem in the \"onFail\" section of the passed parameter!. (e21)\n"+e21.message+" \n"+sUrl, "", "IOMy.apiodata.AjaxRequest");
								}
								
							}
						} catch( e21 ) {
							//-- Flag that this API Request has completed unsuccessfully --//
							this.bApiComplete = true;
							jQuery.sap.log.error( "Critical Error occurred in the Odata on error section 2: "+e20.message, "", "IOMy.apiodata.AjaxRequest" );
						}
					}
				} //-- END "error" function --//
			}); //-- END Ajax function --//
		} else {
			//============================================================//
			//== ?.? - IF the User isn't currently logged in            ==//
			//============================================================//
			var sErrorMesg = "Silently aborting Odata API request (before starting the ajax request) due to being logged out!";
			jQuery.sap.log.info( sErrorMesg, "", "IOMy.apiodata.AjaxRequest" );
			
		}
	}

});