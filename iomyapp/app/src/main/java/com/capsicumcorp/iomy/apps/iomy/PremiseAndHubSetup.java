/*
Title: Premise and Hub Setup Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Java Class definition for the premise and hub setup activity. Processes form data as
    the user taps 'Next'.
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

import android.os.Bundle;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

/**
 * Gathers, validates, and submits premise and hub form data provided by the user.
 */
public class PremiseAndHubSetup extends AppCompatActivity {
    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_premise_and_hub_setup);
        this.setTitle(Titles.premiseAndHubTitle);
    }

    /**
     * Gathers form data and either switches to the next page, or brings up a Snackbar notice when
     * the data validation fails.
     *
     * @param view          Android button widget used to invoke this procedure
     */
    public void nextPage(View view) {
        // Lock the button
        view.setEnabled(false);
        //------------------------------------------------------------//
        // Gather form data
        //------------------------------------------------------------//
        EditText et = (EditText) findViewById(R.id.premiseNameField);
        installWizard.premiseName = et.getText().toString();
        et = (EditText) findViewById(R.id.premiseHubNameField);
        installWizard.hubName = et.getText().toString();

        //------------------------------------------------------------//
        // Proceed to Page 2 of the premise setup. Set up the owner.
        //------------------------------------------------------------//
        if (this.isDataValid() == true) {
            installWizard.summonNextPage(this, installWizard.PROCEED);
        } else {
            // Compile the error message
            String errorMessages = "";
            for (int i = 0; i < this.installWizard.validationErrorMessages.size(); i++) {
                if (i > 0) {
                    errorMessages += "\n";
                }
                errorMessages += this.installWizard.validationErrorMessages.get(i);
            }
            // Bring up the notice.
            ViewGroup layout = (ViewGroup) findViewById(R.id.premiseHubForm);
            Snackbar.make(findViewById(R.id.premiseHubForm), errorMessages, Snackbar.LENGTH_LONG)
                    .show();
            // Clear the error log
            this.installWizard.validationErrorMessages.clear();
        }
        // Unlock the button
        view.setEnabled(true);
    }

    /**
     * Validates form input for Premise name and Hub name and changes the labels of the required fields
     * that have no input.
     *
     * @return          Boolean indicating validity
     */
    public boolean isDataValid() {
        boolean valid = true;
        TextView tv;
        String label;

        //--------------------------------------------------------------//
        // Check that the premise name is filled out
        //--------------------------------------------------------------//
        if (installWizard.premiseName.length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Premise name must be filled out.");
        }

        //--------------------------------------------------------------//
        // Check that the hub name is filled out
        //--------------------------------------------------------------//
        if (installWizard.hubName.length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Hub name must be filled out.");
        }

        return valid;
    }

    @Override
    public void onBackPressed () {

    }
}
