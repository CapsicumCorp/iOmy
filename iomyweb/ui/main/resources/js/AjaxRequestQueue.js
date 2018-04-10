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

/**
 * An object that executes AJAX requests in a sequence. Can also be used to
 * run concurrent requests.
 * 
 * Here are the parameters:
 * 
 * new AjaxRequestQueue({
 *     requests : [],              An array of request data (JS Objects) that will be taken and executed (default = []).
 *     concurrentRequests : 1,     Number requests to run at a time (default = 1).
 *     executeNow : true,          Specifies whether to execute after the object is created or not (default = true).
 *     onSuccess : function () {}, A function to run if all of the requests executed successfully. Optional.
 *     onWarning : function () {}, A function to run if some requests executed successfully but others generated errors. Optional.
 *     onFail : function () {}     A function to run if all of the requests failed. Optional.
 * });
 * 
 * @param {type} mSettings                  Map containing parameters.
 * @returns {AjaxRequestQueue}
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
    this._requestQueuesStates   = {};
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
            bExecuteNow = mSettings.executeNow;
            
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
        
        if (this._requestQueuesStates["_"+i] === undefined) {
            this._requestQueuesStates["_"+i] = 0;
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
        this.execute();
    }
}

AjaxRequestQueue.prototype.getNumberOfRequests = function () {
    var iCount = 0;
    
    $.each(this._requestQueues, function (sI, aRequests) {
        iCount += aRequests.length;
    });
    
    return iCount;
};

AjaxRequestQueue.prototype.getRunningStateOfAllQueues = function () {
    var self = this;
    var iState = 0;
    
    $.each(self._requestQueuesStates, function (sI, iQueueRunningState) {
        iState += iQueueRunningState;
    });
    
    if (iState > 0) {
        iState = 1;
    }
    
    return iState;
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

/**
 * Determines which queues should be running and then begins to execute the
 * requests.
 */
AjaxRequestQueue.prototype.execute = function () {
    var self = this;
    
    if (!self._running) {
        $.each(self._requestQueues, function (sI, aQueue) {
            
            self._requestQueuesStates[sI] = aQueue.length > 0;
        });
        
        self._run();
    }
};

/**
 * Successively executes requests in one or more queues. After all of the
 * requests are completed, one of the callback functions will be executed
 * depending on how many requests succeeded, and how many failed.
 * 
 * @private
 */
AjaxRequestQueue.prototype._run = function (sQueueIndex) {
    var self                = this;
    self._running           = true;
    
    //------------------------------------------------------------------------//
    // If the queue index has not been specified, run this function for each
    // queue (using each queue index as the parameter).
    //------------------------------------------------------------------------//
    if (sQueueIndex === undefined || sQueueIndex === null) {
        $.each(self._requestQueues, function (sQueue, aRequests) {
            self._run(sQueue);
        });
    } else {
        //--------------------------------------------------------------------//
        // Otherwise, take the next request from the specified queue and run it.
        //--------------------------------------------------------------------//
        var mRequestData        = self._requestQueues[sQueueIndex].shift();
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

                // Run the success callback of the request if it's defined.
                if (mRequestData.onSuccess !== undefined) {
                    mRequestData.onSuccess(type, data);
                }

                //------------------------------------------------------------//
                // If there are no more requests in this queue, set its running
                // flag to 0.
                //------------------------------------------------------------//
                if (self._requestQueues[sQueueIndex][0] === undefined) {
                    self._requestQueuesStates[sQueueIndex] = 0;
                }

                //------------------------------------------------------------//
                // Run another request if there are more, otherwise run the
                // appropriate callback function.
                //------------------------------------------------------------//
                if (self.getRunningStateOfAllQueues() === 0) {
                    self._runCallback();
                } else {
                    self._run(sQueueIndex);
                }
            };

            mRequestParameters.onFail = function (response) {
                self._errors++;

                // Run the failure callback of the request if it's defined.
                if (mRequestData.onFail !== undefined) {
                    mRequestData.onFail(response);
                }

                //------------------------------------------------------------//
                // If there are no more requests in this queue, set its running
                // flag to 0.
                //------------------------------------------------------------//
                if (self._requestQueues[sQueueIndex][0] === undefined) {
                    self._requestQueuesStates[sQueueIndex] = 0;
                }

                //------------------------------------------------------------//
                // Run another request if there are more, otherwise run the
                // appropriate callback function.
                //------------------------------------------------------------//
                if (self.getRunningStateOfAllQueues() === 0) {
                    self._runCallback();
                } else {
                    self._run(sQueueIndex);
                }
            };
            
            //----------------------------------------------------------------//
            // Process the success and error callbacks for regular $.ajax
            // requests.
            //----------------------------------------------------------------//
            mRequestParameters.success = function (response, status, xhr) {
                self._successes++;

                // Run the success callback of the request if it's defined.
                if (mRequestData.success !== undefined) {
                    mRequestData.success(response, status, xhr);
                }
            };

            mRequestParameters.error = function (xhr, status, errorThrown) {
                self._errors++;

                // Run the failure callback of the request if it's defined.
                if (mRequestData.error !== undefined) {
                    mRequestData.error(xhr, status, errorThrown);
                }
            };
            
            mRequestParameters.complete = function (xhr, status) {
                // Run the complete callback of the request if it's defined.
                if (mRequestData.complete !== undefined) {
                    mRequestData.complete(xhr, status);
                }
                
                //------------------------------------------------------------//
                // If there are no more requests in this queue, set its running
                // flag to 0.
                //------------------------------------------------------------//
                if (self._requestQueues[sQueueIndex][0] === undefined) {
                    self._requestQueuesStates[sQueueIndex] = 0;
                }

                //------------------------------------------------------------//
                // Run another request if there are more, otherwise run the
                // appropriate callback function.
                //------------------------------------------------------------//
                if (self.getRunningStateOfAllQueues() === 0) {
                    self._runCallback();
                } else {
                    self._run(sQueueIndex);
                }
            };

            if (mRequestData.library !== undefined && mRequestData.library !== null) {
                if (mRequestData.library.toLowerCase() === "php") {
                    iomy.apiphp.AjaxRequest(mRequestParameters);
                } else if (mRequestData.library.toLowerCase() === "odata") {
                    iomy.apiodata.AjaxRequest(mRequestParameters);
                } else {
                    
                    
                    $.ajax(mRequestParameters);
                }
            } else {
                $.ajax(mRequestParameters);
            }
        }
    }
};

/**
 * This function runs one of the callback functions that may be specified.
 * Should only run if there are no requests left in any queue.
 * 
 * @private
 */
AjaxRequestQueue.prototype._runCallback = function () {
    //------------------------------------------------------------------------//
    // All of the requests have been completed, take action based on the success
    // and error counts.
    //------------------------------------------------------------------------//
    var self = this;
    
    if (self._running) {
        self._running = false;
        self._currentQueue  = 0;
        
        // TODO: A simple data structure needs to be returned to the programmer via these three callback functions.
        
        if (self._errors === 0 && self._successes > 0) {
            self._onSuccess();
            
        } else if (self._errors > 0 && self._successes > 0) {
            self._onWarning();
            
        } else if (self._errors > 0 && self._successes === 0) {
            self._onFail();
        }
    }
};