/*
Title: Base class for the Progress Activity
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
    Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: NOT TO BE USED DIRECTLY - Each progress class extends this one. Links to the Progress
    Page Activity.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.
 */

package com.capsicumcorp.iomy.apps.webserver;

import android.app.Notification;
import android.app.NotificationManager;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Base class for all progress pages with a notification widget and a percentage. Provides the most
 * common methods and properties used by each of its child classes.
 */
public class ProgressPage extends AppCompatActivity {
    protected ProgressPage me;                                          // Captures this activity to be referenced in subroutines
    protected int totalRequests;                                        // Number of requests to be processed
    protected float count = 0;                                          // Number requests completed
    RequestQueue fullQueue;                                             // The request queue in the scope of the entire class

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
    }

    protected synchronized void setTotalRequests(int totalRequests) {
        this.totalRequests=totalRequests;
    }
    protected synchronized int getTotalRequests() {
        return this.totalRequests;
    }
    protected synchronized void setCount(float count) {
        this.count=count;
    }
    protected synchronized float getCount() {
        return this.count;
    }
    protected synchronized void incCount() {
        this.count++;
    }
    /**
     * Updates the notification Text View to indicate the currently running action.
     * @param note              Notice to display.
     */
    protected synchronized void changeNotificationText(String note) {
        TextView tv = (TextView) findViewById(R.id.progressNotification);
        tv.setText(note);
    }

    protected synchronized void disablePercentageText() {
        TextView tv = (TextView) findViewById(R.id.progressPercentage);
        tv.setText("");
    }
    /**
     * Updates the percentage text
     */
    protected synchronized void changePercentageText() {
        TextView tv = (TextView) findViewById(R.id.progressPercentage);
        float result = (this.count / (float) this.totalRequests) * 100;
        tv.setText(Math.round(result)+"%");
        // Increase the complete request count
        this.count++;
    }

    /**
     * The back functionality should be erased if it's a progress page.
     */
    @Override
    public void onBackPressed() {
        // DO NOTHING
    }

    /**
     * Commands the the install wizard module to bring up the next activity.
     */
    protected void onComplete() {
        this.finish();
    }

    /**
     * Creates the procedure to run when a HTTP request is successful. This does NOT call the
     * onComplete() function.
     *
     * @param requestName           Used as a tag for logging
     * @return                      Success Response Listener
     */
    Response.Listener<String> createSuccessRequestListener(final String requestName) {
        return new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.v(requestName, response);
                try {
                    JSONObject jsonResponse = new JSONObject(response);
                } catch (JSONException jsone) {
                    Log.e(requestName, jsone.getMessage());
                }
            }
        };
    }

    /**
     * Creates the procedure to run when a HTTP request is successful. This is used only by the
     * final request in the queue as it calls the onComplete() function.
     *
     * @param requestName           Used as a tag for logging
     * @return                      Success Response Listener
     */
    Response.Listener<String> createSuccessRequestListenerOnComplete(final String requestName) {
        me = this; // Capture scope

        return new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.v(requestName, response);
                Notification notice = new NotificationCompat.Builder(getApplicationContext())
                        .setSmallIcon(android.R.drawable.stat_notify_error)
                        .setContentTitle("iOmy")
                        .setContentText("Database successfully created!")
                        .build();
                //notice.notify();
                try {
                    JSONObject jsonResponse = new JSONObject(response);
                    me.onComplete();
                } catch (JSONException jsone) {
                    Log.e(requestName, jsone.getMessage());
                }
            }
        };
    }

    /**
     * Creates the procedure to run if the current HTTP request encounters an error of some
     * description.
     *
     * @param requestName           Used as a tag for logging
     * @return                      Error Response Listener
     */
    Response.ErrorListener createErrorRequestListener(final String requestName) {
        return new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.v(requestName, error.toString()+"");
                // If a timeout occurs, show a dialog
                if (error.toString() == "com.android.volley.TimeoutError") {
                    Log.v(requestName, "Connection Timed Out: Server not accessible");
//                    NotificationCompat.Builder mBuilder =
//                            new NotificationCompat.Builder(getApplicationContext())
//                                    .setSmallIcon(android.R.drawable.stat_notify_error)
//                                    .setContentTitle("iOmy")
//                                    .setContentText("Connection Timed Out");
//
//                    // Sets an ID for the notification
//                    int mNotificationId = 001;
//                    // Gets an instance of the NotificationManager service
//                    NotificationManager mNotifyMgr = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
//                    // Builds the notification and issues it.
//                    mNotifyMgr.notify(mNotificationId, mBuilder.build());

                    Notification errNotice = new NotificationCompat.Builder(getApplicationContext())
                            .setSmallIcon(android.R.drawable.stat_notify_error)
                            .setContentTitle("iOmy")
                            .setContentText("Connection Timed Out")
                            .build();
                    errNotice.notify();
                } else if (error.toString() == "com.android.volley.NoConnectionError") {
                    Log.v(requestName, "Connection Timed Out: Server not accessible");
                    NotificationCompat.Builder mBuilder =
                            new NotificationCompat.Builder(getApplicationContext())
                                    .setSmallIcon(android.R.drawable.stat_notify_error)
                                    .setContentTitle("Timeout Error")
                                    .setContentText("Connection Timed Out");

                    // Sets an ID for the notification
                    int mNotificationId = 001;
                    // Gets an instance of the NotificationManager service
                    NotificationManager mNotifyMgr = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                    // Builds the notification and issues it.
                    mNotifyMgr.notify(mNotificationId, mBuilder.build());
                }

                // Close the activity
                me.finish();

                //----------------------------------------------------------------------//
                // Apply the request filter to specify no filter so that all pending requests
                // are removed after failure.
                //----------------------------------------------------------------------//
                RequestQueue.RequestFilter rf = new RequestQueue.RequestFilter() {
                    @Override
                    public boolean apply(Request<?> request) {
                        return true;
                    }
                };
                me.fullQueue.cancelAll(rf);
            }
        };
    }
}
