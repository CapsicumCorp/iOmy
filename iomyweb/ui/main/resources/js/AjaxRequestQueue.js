/*
Title: Ajax Request Queue Object
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Object specifically for sequentially running AJAX requests using
    one or multiple queues.
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
        if (mSettings.requests !== undefined || mSettings.requests !== null) {
            this._requests = mSettings.requests;
        }
        
        //--------------------------------------------------------------------//
        // Find out how many requests can be made at a time. Default is one.
        //--------------------------------------------------------------------//
        if (mSettings.concurrentRequests !== undefined || mSettings.concurrentRequests !== null) {
            this._concurrentRequests = mSettings.concurrentRequests;
        } else {
            this._concurrentRequests = 1;
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
    // Process the requests
    //--------------------------------------------------------------------//
    for (var i = 0; i < this._requests.length; i++) {
        this.addRequest(this._requests[i]);
    }
}

AjaxRequestQueue.prototype.getNumberOfRequests = function () {
    var iCount = 0;
    
    $.each(this._requestQueues, function (sI, aRequests) {
        iCount += aRequests.length;
    });
    
    return iCount;
};

AjaxRequestQueue.prototype.addRequest = function (mRequestData) {
    //------------------------------------------------------------------------//
    // Take the request and put it in the appropriate queue.
    //------------------------------------------------------------------------//
    this._requestQueues["_"+this._currentQueue].push( mRequestData );
    
    if (!this._running) {
        this._run();
    }

    // Show that we should use the next queue if there are multiple
    // queues.
    if (this._concurrentRequests > 1) {
        this._currentQueue = this._currentQueue % this._concurrentRequests;
    }
    
};

AjaxRequestQueue.prototype._run = function () {
    var self                = this;
    var iCompletedQueues    = false;
    self._running           = true;
    
    $.each(self._requestQueues, function (sQueue, aRequests) {
        var mRequestData        = aRequests.pop();
        var mRequestParameters  = {};
        
        if (mRequestData) {
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
            
            if (mRequestData.library === "PHP") {
                IomyRe.apiphp.AjaxRequest(mRequestParameters);
            } else if (mRequestData.library === "OData") {
                IomyRe.apiodata.AjaxRequest(mRequestParameters);
            } else {
                $.sap.log.error("Specified library must be either \"PHP\" or \"OData\". Ignoring request.\n\n"+JSON.stringify(mRequestData));
            }
        } else {
            iCompletedQueues++;
        }
    });
    
    if (iCompletedQueues === self._concurrentRequests) {
        this._running = false;
        
        if (self._errors === 0 && self._successes > 0) {
            self._onSuccess();
            
        } else if (self._errors > 0 && self._successes > 0) {
            self._onWarning();
            
        } else {
            self._onFail();
        }
    }
};