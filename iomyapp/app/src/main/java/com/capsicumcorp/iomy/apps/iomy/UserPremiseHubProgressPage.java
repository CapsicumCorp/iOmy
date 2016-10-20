/*
Title: Create new user, premise and hub progress class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
    Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Performs a HTTP request to a PHP API on the web server to create the new user/owner,
    premise and hub.
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
import java.util.HashMap;
import java.util.Map;

/**
 * This Java activity class runs the setup API to create the PHP configuration file on the web
 * server using a HTTP request. Another HTTP request will create the new user, premise, and hub.
 * Will close on an error. Will bring up the next activity if successful.
 */
public class UserPremiseHubProgressPage extends ProgressPage {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.finalSetupTitle);
        this.startSettingUpPHPConfUserPremiseAndHub();
    }

    /**
     * Start creating the PHP config file, then the new user, premise, and hub
     */
    private void startSettingUpPHPConfUserPremiseAndHub() {
        me = this;     // Captures this activity to be referenced in subroutines
        int requests = 0;

        //From Volley.newRequestQueue but modified to create a thread pool size of 1 so only do one query at a time
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
        // URL
        String sUrl = installWizard.setupAPI;
        // Parameters
        final Map<String, String> baseparams = new HashMap<String, String>();
        baseparams.put("Access", "{\"URI\":\"" + installWizard.dbURI + "\",\"Port\":\"" + installWizard.dbServerPort + "\",\"Username\":\"" + installWizard.dbUsername + "\",\"Password\":\"" + installWizard.dbPassword + "\"}");
        baseparams.put("DBName", installWizard.databaseSchema);
        baseparams.put("Data", "{\"InsertType\":\"NewAll\",\"UserName\":\""+installWizard.ownerUsername+"\",\"UserPassword\":\""+installWizard.ownerPassword+"\",\"PremiseName\":\""+installWizard.premiseName+"\",\"PremiseDesc\":\"\",\"HubName\":\""+installWizard.hubName+"\",\"HubType\":\"2\"}");

        final String modeAddHub             = "03_AddHub";
        final String modeCreatePHPConfig    = "02_CreatePHPConfig";

        //-----------------------------------------------------------------//
        // Create the new user, premise, and hub.
        //-----------------------------------------------------------------//
        requests++;
        final StringRequest addHub = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListenerOnComplete("Add Premise, Hub, and User"),
                createErrorRequestListener("Add Premise, Hub, and User")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating new user: "+installWizard.ownerUsername+"\nNew Premise: "+installWizard.premiseName+"\nNew Hub: "+installWizard.hubName);
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeAddHub);
                return params;
            }
        };

        //-----------------------------------------------------------------//
        // Create the PHP Configuration file
        //-----------------------------------------------------------------//
        requests++;
        final StringRequest createPHPConfig = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListenerOnComplete("Create the PHP Config file"),
                createErrorRequestListener("Create the PHP Config file")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Creating PHP Configuration file");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeCreatePHPConfig);
                return params;
            }
        };

        this.totalRequests = requests;
        //Set longer retry policy for all requests
        //See http://www.techstricks.com/avoid-multiple-requests-when-using-volley/
        createPHPConfig.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
        addHub.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        //Don't return a cached result for these requests
        createPHPConfig.setShouldCache(false);
        addHub.setShouldCache(false);

        // Add the requests to the RequestQueue.
        this.fullQueue.add(createPHPConfig);
        this.fullQueue.add(addHub);

        //Start the requests
        this.fullQueue.start();
    }
}
