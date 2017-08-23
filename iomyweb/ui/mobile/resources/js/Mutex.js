/*
Title: Mutex Object
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Mutex object used for queuing tasks that are executed
	sequentially.
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
 * Provides a queue to place tasks into. Used to ensure that race conditions do
 * not occur as a result of multiple threads (i.e ajax requests) accessing the
 * same resources.
 * 
 * The queue will run when a task is queued and execution will end when there is
 * nothing left in the queue.
 * 
 * The tasks can be executed manually if the mutex is in manual mode. This means
 * that tasks are not executed sequentially but as needed by a function, giving
 * the programmer greater flexibility.
 * 
 * A Javascript object is optionally parsed as an argument that contains the
 * parameter 'manual'. This is a boolean flag to indicate whether to let the
 * mutex control the flow of execution (false)(default) or the programmer 
 * (true).
 * 
 * Based on the example at https://blog.jcoglan.com/2016/07/12/mutexes-and-javascript/
 * 
 * @param {map} mSettings               Map containing settings (optional)
 * @returns {Mutex}
 */
function Mutex(mSettings) {
    if (mSettings !== undefined && mSettings !== null) {
        if (mSettings.manual === undefined || mSettings.manual === null) {
            this.manual = false;
        } else {
            this.manual = mSettings.manual;
        }
    } else {
        this.manual = false;
    }
    
	
	
	this.queue = [];
	this.busy = false;
}

/**
 * Takes a task and if it's valid it will be added to the queue. The queue will
 * begin executing if it hasn't already done so (or if manual mode is disabled).
 * 
 * @param {type} mSettings			The task at hand.
 */
Mutex.prototype.synchronize = function (mSettings) {
	
	if (mSettings !== undefined) {
		//-- Only push a task to the queue if one is specified. --//
		if (mSettings.task !== undefined) {
			
			this.queue.push(mSettings);

			if (!this.busy && !this.manual) {
				this.dequeue();
			}
		}
	}
};

/**
 * Takes a task out of the queue and runs it. If the queue is empty when this is
 * called, the busy flag is set back to false.
 * 
 * When the mutex is in manual mode, this should be executed in an if statement
 * that checks whether it's busy or not.
 */
Mutex.prototype.dequeue = function () {
	this.busy = true;
	var mInfo = this.queue.shift();
	
	// Run the task if one is in the queue.
	if (mInfo) {
		this.run(mInfo);
	} else {
		this.busy = false;
	}
};

/**
 * Runs a given task. Also runs its onSuccess or onFail callbacks if they're
 * given.
 * 
 * If the task runs and there is an exception thrown by that task, then it will
 * be caught by its onFail callback. If there is no onFail function in the task,
 * then the exception will simply be rethrown.
 * 
 * If either the onSuccess or onFail function throws an exception, it will be
 * recorded in the task object and the exception will be rethrown.
 * 
 * @param {type} mTask					Task at hand
 */
Mutex.prototype.run = function (mTask) {
	var me = this;
	
	//------------------------------------------------------------------------//
	// Attempt to run the task
	//------------------------------------------------------------------------//
	try {
		mTask.returnValue = mTask.task();
		
		//--------------------------------------------------------------------//
		// If the success callback function is declared, try and run it.
		//--------------------------------------------------------------------//
		if (mTask.onSuccess !== undefined && mTask.onSuccess !== null) {
			try {
				mTask.onSuccess();
			} catch (ex0) {
				mTask.errorMessage = "Error in running the success callback: "+ex0.message;
				throw ex0;
			}
		}
	} catch (ex1) {
		//--------------------------------------------------------------------//
		// If the failure callback function is declared, try and run it.
		// Otherwise, rethrow the exception.
		//--------------------------------------------------------------------//
		mTask.errorMessage = "Error in running the task: "+ex1.message;
		
		try {
			if (mTask.onFail !== undefined && mTask.onFail !== null) {
				mTask.fnFail(ex1);
			} else {
				throw ex1;
			}
		} catch (ex2) {
			mTask.errorMessage = "Error in running the failure callback: "+ex2.message;
			throw ex2;
		}
	} finally {
		//--------------------------------------------------------------------//
		// Regardless of the outcome, run the next task in the queue.
		//--------------------------------------------------------------------//
		if (!this.manual) {
			me.dequeue();
		}
	}
};

/**
 * Clears any remaining tasks from the queue.
 */
Mutex.prototype.clear = function () {
	this.queue = [];
};