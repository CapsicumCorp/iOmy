/*
Title: Database Progress Backend
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
    Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Performs HTTP requests to a PHP API on the web server to create the database and its
    tables and their data, views, and foreign keys. Updates the notification and percentage with
    each request.
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

package com.capsicumcorp.iomy.apps.iomy;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;

import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Network;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.BasicNetwork;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HttpStack;
import com.android.volley.toolbox.HurlStack;
import com.android.volley.toolbox.StringRequest;

import java.io.File;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * This Java activity class runs the database setup on the web server via a series of HTTP requests.
 * Will close on an error. Will bring up the next activity if successful.
 */
public class DBSetupProgressPage extends ProgressPage {

    int listIndex;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.webserverDatabaseSetupTitle);
        this.startSettingUpDatabase();
    }

    /**
     * Begin the HTTP calls to the iomyserver API on the web server.
     */
    private void startSettingUpDatabase() {
        me = this;     // Captures this activity to be referenced in subroutines
        int requests = 0;

        // From Volley.newRequestQueue but modified to create a thread pool size of 1 so only do one query at a time
        File cacheDir = new File(this.getCacheDir(), "volley");
        String userAgent = "volley/0";
        try {
            String packageName = this.getPackageName();
            PackageInfo info = this.getPackageManager().getPackageInfo(packageName, 0);
            userAgent = packageName + "/" + info.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            //Do nothing
        }
        HttpStack stack = new HurlStack();

        Network network = new BasicNetwork(stack);
        this.fullQueue = new RequestQueue(new DiskBasedCache(cacheDir), network, 1);
        // -------------------------------------------------------------------------------------- //

        String sUrl = installWizard.setupAPI;

        // Declare each mode parameter that will be used
        final String modeparamDBConnectTest = "02_DBConnectTest";
        final String modeparamNewSchema = "02_NewSchema";
        final String modeparamCreateTables1 = "02_CreateTables1";
        final String modeparamCreateTables2 = "02_CreateTables2";
        final String modeparamCreateTables3 = "02_CreateTables3";
        final String modeparamCreateTables4 = "02_CreateTables4";
        final String modeparamCreateTables5 = "02_CreateTables5";
        final String modeparamCreateTables6 = "02_CreateTables6";
        final String modeparamCreateViewPublic1 = "02_CreateViewsPublic1";
        final String modeparamCreateViewPublic2 = "02_CreateViewsPublic2";
        final String modeparamCreateViewPublic3 = "02_CreateViewsPublic3";
        final String modeparamCreateViewPublic4 = "02_CreateViewsPublic4";
        final String modeparamCreateViewPublic5 = "02_CreateViewsPublic5";
        final String modeparamCreateViewPublic6 = "02_CreateViewsPublic6";
        final String modeparamCreateViewRestricted1 = "02_CreateViewsRestricted1";
        final String modeparamCreateViewRestricted2 = "02_CreateViewsRestricted2";
        final String modeparamCreateViewRestricted3 = "02_CreateViewsRestricted3";
        final String modeparamCreateViewRestricted4 = "02_CreateViewsRestricted4";
        final String modeparamCreateViewRestricted5 = "02_CreateViewsRestricted5";
        final String modeparamCreateViewRestricted6 = "02_CreateViewsRestricted6";
        final String modeparamCreateDefaultData1 = "02_CreateDefaultData1";
        final String modeparamCreateDefaultData2 = "02_CreateDefaultData2";
        final String modeparamCreateDefaultData3 = "02_CreateDefaultData3";
        final String modeparamCreateDefaultData4 = "02_CreateDefaultData4";

        final String modeparamCreateForeignKeys1 = "02_CreateForeignKeys1";
        final String modeparamCreateForeignKeys2 = "02_CreateForeignKeys2";
        final String modeparamCreateForeignKeys3 = "02_CreateForeignKeys3";
        final String modeparamCreateForeignKeys4 = "02_CreateForeignKeys4";
        final String modeparamCreateForeignKeys5 = "02_CreateForeignKeys5";
        final String modeparamCreateForeignKeys6 = "02_CreateForeignKeys6";
        final String modeparamCreateForeignKeys7 = "02_CreateForeignKeys7";
        final String modeparamCreateForeignKeys8 = "02_CreateForeignKeys8";
        final String modeparamCreateForeignKeys9 = "02_CreateForeignKeys9";
        final String modeparamCreateForeignKeys10 = "02_CreateForeignKeys10";
        final String modeparamCreateForeignKeys11 = "02_CreateForeignKeys11";
        final String modeparamCreateForeignKeys12 = "02_CreateForeignKeys12";
        final String modeparamCreateForeignKeys13 = "02_CreateForeignKeys13";
        final String modeparamCreateForeignKeys14 = "02_CreateForeignKeys14";
        final String modeparamCreateForeignKeys15 = "02_CreateForeignKeys15";
        final String modeparamCreateForeignKeys16 = "02_CreateForeignKeys16";
        final String modeparamCreateForeignKeys17 = "02_CreateForeignKeys17";
        final String modeparamCreateForeignKeys18 = "02_CreateForeignKeys18";
        final String modeparamCreateForeignKeys19 = "02_CreateForeignKeys19";
        final String modeparamCreateForeignKeys20 = "02_CreateForeignKeys20";

        ArrayList<String> foreignKeyModeParameters = new ArrayList<String>();
        foreignKeyModeParameters.add("02_CreateForeignKeys1");
        foreignKeyModeParameters.add("02_CreateForeignKeys2");
        foreignKeyModeParameters.add("02_CreateForeignKeys3");
        foreignKeyModeParameters.add("02_CreateForeignKeys4");
        foreignKeyModeParameters.add("02_CreateForeignKeys5");
        foreignKeyModeParameters.add("02_CreateForeignKeys6");
        foreignKeyModeParameters.add("02_CreateForeignKeys7");
        foreignKeyModeParameters.add("02_CreateForeignKeys8");
        foreignKeyModeParameters.add("02_CreateForeignKeys9");
        foreignKeyModeParameters.add("02_CreateForeignKeys10");
        foreignKeyModeParameters.add("02_CreateForeignKeys11");
        foreignKeyModeParameters.add("02_CreateForeignKeys12");
        foreignKeyModeParameters.add("02_CreateForeignKeys13");
        foreignKeyModeParameters.add("02_CreateForeignKeys14");
        foreignKeyModeParameters.add("02_CreateForeignKeys15");
        foreignKeyModeParameters.add("02_CreateForeignKeys16");
        foreignKeyModeParameters.add("02_CreateForeignKeys17");
        foreignKeyModeParameters.add("02_CreateForeignKeys18");
        foreignKeyModeParameters.add("02_CreateForeignKeys19");
        foreignKeyModeParameters.add("02_CreateForeignKeys20");

        final Map<String, String> baseparams = new HashMap<String, String>();
        baseparams.put("Access", "{\"URI\":\"" + installWizard.dbURI + "\",\"Port\":\"" + installWizard.dbServerPort + "\",\"Username\":\"" + installWizard.dbUsername + "\",\"Password\":\"" + installWizard.dbPassword + "\"}");

        final Map<String, String> baseparams2 = new HashMap<String, String>(baseparams);
        baseparams2.put("DBName", installWizard.databaseSchema);

        // TODO: There must be a more efficient way of doing these StringRequest variables.

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 20
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys20 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 20"),
                createErrorRequestListener("Create FKs - Part 20")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys20);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 19
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys19 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 19"),
                createErrorRequestListener("Create FKs - Part 19")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys19);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 18
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys18 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 18"),
                createErrorRequestListener("Create FKs - Part 18")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys18);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 17
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys17 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 17"),
                createErrorRequestListener("Create FKs - Part 17")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys17);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 16
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys16 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListenerOnComplete("Create FKs - Part 16"),
                createErrorRequestListener("Create FKs - Part 16")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys16);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 15
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys15 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 15"),
                createErrorRequestListener("Create FKs - Part 15")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys15);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 14
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys14 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 14"),
                createErrorRequestListener("Create FKs - Part 14")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys14);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 13
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys13 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 13"),
                createErrorRequestListener("Create FKs - Part 13")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys13);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 12
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys12 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 12"),
                createErrorRequestListener("Create FKs - Part 12")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys12);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 11
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys11 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 11"),
                createErrorRequestListener("Create FKs - Part 11")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys11);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 10
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys10 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 10"),
                createErrorRequestListener("Create FKs - Part 10")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys10);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 9
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys9 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 9"),
                createErrorRequestListener("Create FKs - Part 9")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys9);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 8
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys8 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 8"),
                createErrorRequestListener("Create FKs - Part 8")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys8);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 7
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys7 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 7"),
                createErrorRequestListener("Create FKs - Part 7")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys7);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 6
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys6 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListenerOnComplete("Create FKs - Part 6"),
                createErrorRequestListener("Create FKs - Part 6")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys6);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 5
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys5 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 5"),
                createErrorRequestListener("Create FKs - Part 5")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys5);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 4
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys4 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 4"),
                createErrorRequestListener("Create FKs - Part 4")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys4);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 3
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys3 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 3"),
                createErrorRequestListener("Create FKs - Part 3")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys3);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 2
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys2 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 2"),
                createErrorRequestListener("Create FKs - Part 2")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys2);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the foreign keys - Part 1
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createForeignKeys1 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create FKs - Part 1"),
                createErrorRequestListener("Create FKs - Part 1")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Foreign Keys");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateForeignKeys1);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the default data - Part 4
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createDefaultData4 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Data 4"),
                createErrorRequestListener("Create Data 4")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Inserting Generic Data");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateDefaultData4);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the default data - Part 3
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createDefaultData3 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Data 3"),
                createErrorRequestListener("Create Data 3")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Inserting Generic Data");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateDefaultData3);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the default data - Part 2
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createDefaultData2 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Data 2"),
                createErrorRequestListener("Create Data 2")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Inserting Generic Data");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateDefaultData2);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the default data - Part 1
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createDefaultData1 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Data 1"),
                createErrorRequestListener("Create Data 1")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Inserting Generic Data");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateDefaultData1);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the restricted views - Part 6
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewRestricted6 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Private Views 6"),
                createErrorRequestListener("Create Private Views 6")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Restricted Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewRestricted6);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the restricted views - Part 5
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewRestricted5 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Private Views 5"),
                createErrorRequestListener("Create Private Views 5")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Restricted Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewRestricted5);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the restricted views - Part 4
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewRestricted4 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Private Views 4"),
                createErrorRequestListener("Create Private Views 4")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Restricted Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewRestricted4);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the restricted views - Part 3
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewRestricted3 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Private Views 3"),
                createErrorRequestListener("Create Private Views 3")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Restricted Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewRestricted3);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the restricted views - Part 2
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewRestricted2 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Private Views 2"),
                createErrorRequestListener("Create Private Views 2")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Restricted Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewRestricted2);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the restricted views - Part 1
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewRestricted1 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Private Views 1"),
                createErrorRequestListener("Create Private Views 1")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Restricted Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewRestricted1);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the public views - Part 6
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewPublic6 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Public Views 6"),
                createErrorRequestListener("Public Views 6")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Public Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewPublic6);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the public views - Part 5
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewPublic5 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Public Views 5"),
                createErrorRequestListener("Public Views 5")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Public Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewPublic5);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the public views - Part 4
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewPublic4 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Public Views 4"),
                createErrorRequestListener("Create Public Views 4")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Public Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewPublic4);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the public views - Part 3
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewPublic3 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Public Views 3"),
                createErrorRequestListener("Create Public Views 3")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Public Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewPublic3);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the public views - Part 2
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewPublic2 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Public Views 2"),
                createErrorRequestListener("Create Public Views 2")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Public Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewPublic2);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the public views - Part 1
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createViewPublic1 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Public Views 1"),
                createErrorRequestListener("Create Public Views 1")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Public Views");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateViewPublic1);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the tables - Part 6
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createTables6 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Tables - Part 6"),
                createErrorRequestListener("Create Tables - Part 6")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Tables");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateTables6);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the tables - Part 5
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createTables5 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Tables - Part 5"),
                createErrorRequestListener("Create Tables - Part 5")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Tables");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateTables5);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the tables - Part 4
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createTables4 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Tables - Part 4"),
                createErrorRequestListener("Create Tables - Part 4")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Tables");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateTables4);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the tables - Part 3
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createTables3 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Tables - Part 3"),
                createErrorRequestListener("Create Tables - Part 3")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Tables");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateTables3);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the tables - Part 2
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createTables2 = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListener("Create Tables - Part 2"),
                createErrorRequestListener("Create Tables - Part 2")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Tables");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateTables2);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the tables - Part 1
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createTables1 = new StringRequest(Request.Method.POST, installWizard.setupAPI,
                createSuccessRequestListener("Create Tables - Part 1"),
                createErrorRequestListener("Create Tables - Part 1")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Tables");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamCreateTables1);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Prepare the request to create the new schema.
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest createNewSchema = new StringRequest(Request.Method.POST, installWizard.setupAPI,
                createSuccessRequestListener("Create New Schema"),
                createErrorRequestListener("Create New Schema")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams2);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating Database: "+me.installWizard.databaseSchema);
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamNewSchema);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Test the connection
        //-----------------------------------------------------------------//
        requests++;

        final StringRequest testConnection = new StringRequest(Request.Method.POST, installWizard.setupAPI,
                createSuccessRequestListener("Test Connection"),
                createErrorRequestListener("Test Connection")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Testing the connection.");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeparamDBConnectTest);
                return params;
            }
        };

        this.totalRequests = requests;

        //Set longer retry policy for all requests
        //See http://www.techstricks.com/avoid-multiple-requests-when-using-volley/
        testConnection.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createNewSchema.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createTables1.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createTables2.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createTables3.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createTables4.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createTables5.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createTables6.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewPublic1.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewPublic2.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewPublic3.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewPublic4.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewPublic5.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewPublic6.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewRestricted1.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewRestricted2.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewRestricted3.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewRestricted4.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewRestricted5.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createViewRestricted6.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createDefaultData1.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createDefaultData2.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createDefaultData3.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createDefaultData4.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys1.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys2.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys3.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys4.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys5.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys6.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys7.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys8.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys9.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys10.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys11.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys12.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys13.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys14.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys15.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys16.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys17.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys18.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys19.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        createForeignKeys20.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        //Don't return a cached result for these requests
        testConnection.setShouldCache(false);
        createNewSchema.setShouldCache(false);
        createTables1.setShouldCache(false);
        createTables2.setShouldCache(false);
        createTables3.setShouldCache(false);
        createTables4.setShouldCache(false);
        createTables5.setShouldCache(false);
        createTables6.setShouldCache(false);
        createViewPublic1.setShouldCache(false);
        createViewPublic2.setShouldCache(false);
        createViewPublic3.setShouldCache(false);
        createViewPublic4.setShouldCache(false);
        createViewPublic5.setShouldCache(false);
        createViewPublic6.setShouldCache(false);
        createViewRestricted1.setShouldCache(false);
        createViewRestricted2.setShouldCache(false);
        createViewRestricted3.setShouldCache(false);
        createViewRestricted4.setShouldCache(false);
        createViewRestricted5.setShouldCache(false);
        createViewRestricted6.setShouldCache(false);
        createDefaultData1.setShouldCache(false);
        createDefaultData2.setShouldCache(false);
        createDefaultData3.setShouldCache(false);
        createDefaultData4.setShouldCache(false);
        createForeignKeys1.setShouldCache(false);
        createForeignKeys2.setShouldCache(false);
        createForeignKeys3.setShouldCache(false);
        createForeignKeys4.setShouldCache(false);
        createForeignKeys5.setShouldCache(false);
        createForeignKeys6.setShouldCache(false);
        createForeignKeys7.setShouldCache(false);
        createForeignKeys8.setShouldCache(false);
        createForeignKeys9.setShouldCache(false);
        createForeignKeys10.setShouldCache(false);
        createForeignKeys11.setShouldCache(false);
        createForeignKeys12.setShouldCache(false);
        createForeignKeys13.setShouldCache(false);
        createForeignKeys14.setShouldCache(false);
        createForeignKeys15.setShouldCache(false);
        createForeignKeys16.setShouldCache(false);
        createForeignKeys17.setShouldCache(false);
        createForeignKeys18.setShouldCache(false);
        createForeignKeys19.setShouldCache(false);
        createForeignKeys20.setShouldCache(false);

        // Add the requests to the RequestQueue.
        this.fullQueue.add(testConnection);
        this.fullQueue.add(createNewSchema);
        this.fullQueue.add(createTables1);
        this.fullQueue.add(createTables2);
        this.fullQueue.add(createTables3);
        this.fullQueue.add(createTables4);
        this.fullQueue.add(createTables5);
        this.fullQueue.add(createTables6);
        this.fullQueue.add(createViewPublic1);
        this.fullQueue.add(createViewPublic2);
        this.fullQueue.add(createViewPublic3);
        this.fullQueue.add(createViewPublic4);
        this.fullQueue.add(createViewPublic5);
        this.fullQueue.add(createViewPublic6);
        this.fullQueue.add(createViewRestricted1);
        this.fullQueue.add(createViewRestricted2);
        this.fullQueue.add(createViewRestricted3);
        this.fullQueue.add(createViewRestricted4);
        this.fullQueue.add(createViewRestricted5);
        this.fullQueue.add(createViewRestricted6);
        this.fullQueue.add(createDefaultData1);
        this.fullQueue.add(createDefaultData2);
        this.fullQueue.add(createDefaultData3);
        this.fullQueue.add(createDefaultData4);
        this.fullQueue.add(createForeignKeys1);
        this.fullQueue.add(createForeignKeys2);
        this.fullQueue.add(createForeignKeys3);
        this.fullQueue.add(createForeignKeys4);
        this.fullQueue.add(createForeignKeys5);
        this.fullQueue.add(createForeignKeys6);
        this.fullQueue.add(createForeignKeys7);
        this.fullQueue.add(createForeignKeys8);
        this.fullQueue.add(createForeignKeys9);
        this.fullQueue.add(createForeignKeys10);
        this.fullQueue.add(createForeignKeys11);
        this.fullQueue.add(createForeignKeys12);
        this.fullQueue.add(createForeignKeys13);
        this.fullQueue.add(createForeignKeys14);
        this.fullQueue.add(createForeignKeys15);
        this.fullQueue.add(createForeignKeys16);
        this.fullQueue.add(createForeignKeys17);
        this.fullQueue.add(createForeignKeys18);
        this.fullQueue.add(createForeignKeys19);
        this.fullQueue.add(createForeignKeys20);

        //Start the requests
        this.fullQueue.start();
    }
}