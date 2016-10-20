/*
Title: Configure Root Database Password Setup Class
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
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
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

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

public class DBConfigureRootPassword extends ProgressPage {
    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.webserverDatabaseRootPasswordSetupTitle);
        this.startSettingUpDatabaseRootPassword();
    }

    /**
     * Start creating the Database Root Password
     */
    private void startSettingUpDatabaseRootPassword() {
        me = this;     // Captures this activity to be referenced in subroutines
        int requests = 0;

        String newRootPassword=this.installWizard.generateRandomPassword();
        Log.println(Log.INFO, "iOmy", "DEBUG: startSettingUpDatabaseRootPassword: new password will be "+newRootPassword);

        installWizard.dbPassword=newRootPassword;

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
        baseparams.put("Access", "{\"URI\":\"" + installWizard.dbURI + "\",\"Port\":\"" + installWizard.dbServerPort + "\",\"Username\":\"" + installWizard.dbUsername + "\",\"Password\":\"\"}");
        baseparams.put("DBName", installWizard.databaseSchema);
        baseparams.put("Data", "{\"Password\":\""+installWizard.dbPassword+"\"}");

        final String modeDBPasswordInit             = "01_DBPasswordInit";

        //-----------------------------------------------------------------//
        // Configure the database root password.
        //-----------------------------------------------------------------//
        requests++;
        final StringRequest dBPasswordInit = new StringRequest(Request.Method.POST, sUrl,
                createSuccessRequestListenerOnComplete("Configure Database Root Password"),
                createErrorRequestListener("Configure Database Root Password")) {
            protected Map<String, String> getParams() throws com.android.volley.AuthFailureError {
                Map<String, String> params = new HashMap<String, String>(baseparams);

                // Update the notification text
                me.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        me.changeNotificationText("Configuring database root password");
                        me.changePercentageText();
                    }
                });

                params.put("Mode", modeDBPasswordInit);
                return params;
            }
        };

        this.totalRequests = requests;
        //Set longer retry policy for all requests
        //See http://www.techstricks.com/avoid-multiple-requests-when-using-volley/
        dBPasswordInit.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 0, DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        //Don't return a cached result for these requests
        dBPasswordInit.setShouldCache(false);

        // Add the requests to the RequestQueue.
        this.fullQueue.add(dBPasswordInit);

        //Start the requests
        this.fullQueue.start();
    }
}
