/*
Title: Ajax Request Queue Object
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Object specifically for sequentially running AJAX requests using
    one or multiple queues. STILL IN DEVELOPMENT. Works for single queues.
Copyright: Capsicum Corporation 2017

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

function AjaxRequestQueue(mSettings) {
    var bError                  = false;
    var aErrorMessages          = [];
    var aRequests               = [];
    var bExecuteNow             = true;
    
    //------------------------------------------------------------------------//
    // Declare the properties of this object.
    //------------------------------------------------------------------------//
    this._requestQueues         = {};
    this._requests              = [];
    this._running               = false;
    this._currentQueue          = 0;
    this._errors                = 0;
    this._successes             = 0;
    this._onSuccess;
    this._onWarning;
    this._onFail;
    
    if (mSettings !== undefined) {
        //--------------------------------------------------------------------//
        // Look for the request queue. An empty array is the default.
        //--------------------------------------------------------------------//
        if (mSettings.requests !== undefined && mSettings.requests !== null) {
            this._requests = mSettings.requests;
        }
        
        //--------------------------------------------------------------------//
        // Find out how many requests can be made at a time. Default is one.
        //--------------------------------------------------------------------//
        if (mSettings.concurrentRequests !== undefined && mSettings.concurrentRequests !== null) {
            this._concurrentRequests = mSettings.concurrentRequests;
        } else {
            this._concurrentRequests = 1;
        }
        
        //--------------------------------------------------------------------//
        // Determine whether we execute the requests now, or have the programmer
        // decide. Default is true.
        //--------------------------------------------------------------------//
        if (mSettings.executeNow !== undefined && mSettings.executeNow !== null) {
            bExecuteNow = mSettings.concurrentRequests;
            
            if (typeof bExecuteNow !== "boolean") {
                $.sap.log.error("WARNING: 'executeNow' is not a boolean ('"+typeof bExecuteNow+"' given). Will default to true.");
            }
        }
        
        //----------------------------------------------------------------//
        // Find the success callback function.
        //----------------------------------------------------------------//
        if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
            this._onSuccess = mSettings.onSuccess;
        } else {
            this._onSuccess = function () {};
        }

        //----------------------------------------------------------------//
        // Find the warning callback function.
        //----------------------------------------------------------------//
        if (mSettings.onWarning !== undefined && mSettings.onWarning !== null) {
            this._onWarning = mSettings.onWarning;
        } else {
            this._onWarning = function () {};
        }
        
        //----------------------------------------------------------------//
        // Find the failure callback function.
        //----------------------------------------------------------------//
        if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
            this._onFail = mSettings.onFail;
        } else {
            this._onFail = function () {};
        }
        
    } else {
        this._requests              = [];
        this._concurrentRequests    = 1;
        this._onSuccess             = function () {};
        this._onWarning             = function () {};
        this._onFail                = function () {};
    }
    
    //--------------------------------------------------------------------//
    // Create the queues.
    //--------------------------------------------------------------------//
    for (var i = 0; i < this._concurrentRequests; i++) {
        //----------------------------------------------------------------//
        // Create the queue if it doesn't already exist.
        //----------------------------------------------------------------//
        if (this._requestQueues["_"+i] === undefined) {
            this._requestQueues["_"+i] = [];
        }
    }
    
    //--------------------------------------------------------------------//
    // Process any requests.
    //--------------------------------------------------------------------//
    for (var i = 0; i < this._requests.length; i++) {
        this.addRequest(this._requests[i]);
    }
    
    //--------------------------------------------------------------------//
    // If the requests are to be run right away, run them.
    //--------------------------------------------------------------------//
    if (bExecuteNow) {
        this._run();
    }
}

AjaxRequestQueue.prototype.getNumberOfRequests = function () {
    var iCount = 0;
    
    $.each(this._requestQueues, function (sI, aRequests) {
        iCount += aRequests.length;
    });
    
    return iCount;
};

/**
 * Adds a request to a queue. If the request queue isn't already running, it
 * will trigger the AJAX request.
 * 
 * @param {type} mRequestData           Object containg request parameters
 */
AjaxRequestQueue.prototype.addRequest = function (mRequestData) {
    //------------------------------------------------------------------------//
    // Take the request and put it in the appropriate queue.
    //------------------------------------------------------------------------//
    this._requestQueues["_"+this._currentQueue].push( mRequestData );

    //------------------------------------------------------------------------//
    // Show that we should use the next queue if there are multiple
    // queues.
    //------------------------------------------------------------------------//
    if (this._concurrentRequests > 1) {
        this._currentQueue = ++this._currentQueue % this._concurrentRequests;
    }
    
};

AjaxRequestQueue.prototype.execute = function () {
    if (!this._running) {
        this._run();
    }
};

/**
 * Successively executes requests in one or more queues. After all of the
 * requests are completed, one of the callback functions will be executed
 * depending on how many requests succeeded, and how many failed.
 * 
 * @private
 */
AjaxRequestQueue.prototype._run = function () {
    var self                = this;
    var iCompletedQueues    = false;
    self._running           = true;
    
    //------------------------------------------------------------------------//
    // All of the requests have been completed, take action based on the success
    // and error counts.
    //------------------------------------------------------------------------//
    if (self.getNumberOfRequests() === 0) {
        self._running       = false;
        self._currentQueue  = 0;
        
        // TODO: A simple data structure needs to be returned to the programmer via these three callback functions.
        
        if (self._errors === 0 && self._successes > 0) {
            self._onSuccess();
            
        } else if (self._errors > 0 && self._successes > 0) {
            self._onWarning();
            
        } else {
            self._onFail();
        }
    } else {
        //------------------------------------------------------------------------//
        // Otherwise go through each queue and take out request data and run them.
        //------------------------------------------------------------------------//
        $.each(self._requestQueues, function (sQueue, aRequests) {
            var mRequestData        = aRequests.shift();
            var mRequestParameters  = {};

            if (mRequestData) {
                //----------------------------------------------------------------//
                // Copy the request data so that the success and failure callbacks
                // can be modified to increment either the success or error counter,
                // and run the next set of requests in the queue.
                //----------------------------------------------------------------//
                mRequestParameters = JSON.parse( JSON.stringify(mRequestData) );

                mRequestParameters.onSuccess = function (type, data) {
                    self._successes++;

                    if (mRequestData.onSuccess !== undefined) {
                        mRequestData.onSuccess(type, data);
                    }

                    self._run();
                };

                mRequestParameters.onFail = function (response) {
                    self._errors++;

                    if (mRequestData.onFail !== undefined) {
                        mRequestData.onFail(response);
                    }

                    self._run();
                };

                if (mRequestData.library.toLowerCase() === "php") {
                    IomyRe.apiphp.AjaxRequest(mRequestParameters);
                } else if (mRequestData.library.toLowerCase() === "odata") {
                    IomyRe.apiodata.AjaxRequest(mRequestParameters);
                } else {
                    // TODO: A generic AJAX request should be made here without any reference to PHP or OData APIs necessarily.
                    $.sap.log.error("Specified library must be either \"PHP\" or \"OData\". Ignoring request.\n\n"+JSON.stringify(mRequestData));
                }
            }
        });
    }
};