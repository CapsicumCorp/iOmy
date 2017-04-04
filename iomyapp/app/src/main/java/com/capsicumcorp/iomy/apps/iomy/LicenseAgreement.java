/*
Title: License Agreement Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Defines the activity title and the function for the 'Accept' button.
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

import android.content.res.AssetManager;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Handles the License declaration for IOMy. Upon creation the full GPL v3 license is inserted into
 * the page.
 */
public class LicenseAgreement extends AppCompatActivity {
    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_license_agreement);
        this.setTitle(Titles.licenseAgreementTitle);

        TextView tv = (TextView) findViewById(R.id.licenseView);
        tv.setText(this.getGPLContent());
    }

    /**
     * Commands the the install wizard module to bring up the next activity.
     */
    public void nextPage(View view) {
        // Lock the button
        view.setEnabled(false);

        Settings.setFirstRunWizardStepCompleted(this, this.getTitle().toString());
        installWizard.summonNextPage(this, installWizard.PROCEED);

        // Unlock the button
        view.setEnabled(true);
    }

    /**
     * Reads the GPL from the license file in the assets folder.
     *
     * @return      GPL v3 or greater License
     */
    public String getGPLContent() {
        String licenseStr = "";

        try {
            InputStream assetLicenseFileStream;
            AssetManager assetManager = this.getAssets();

            assetLicenseFileStream = assetManager.open("License");

            try {
                BufferedReader in = new BufferedReader(new InputStreamReader(assetLicenseFileStream, "UTF-8"));
                String line;
                while ((line = in.readLine()) != null) {
                    licenseStr += line + "\n";
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        } catch (IOException e) {
            //Do nothing
        }

        return licenseStr;
    }
}
