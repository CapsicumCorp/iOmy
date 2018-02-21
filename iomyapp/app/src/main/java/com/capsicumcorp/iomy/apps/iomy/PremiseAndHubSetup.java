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

import android.content.DialogInterface;
import android.os.Bundle;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
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
     * Gathers form data and either switches to the next page, or brings up a popup notice when
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

//        et = (EditText) findViewById(R.id.premiseHubUsernameField);
//        installWizard.hubUsername = et.getText().toString();
//
//        et = (EditText) findViewById(R.id.premiseHubPasswordField);
//        installWizard.hubPassword = et.getText().toString();

        installWizard.hubUsername = "telnet";
        installWizard.hubPassword = installWizard.generateRandomPassword();

        //------------------------------------------------------------//
        // Proceed to Page 2 of the premise setup. Set up the owner.
        //------------------------------------------------------------//
        if (this.isDataValid() == true) {
            Settings.setMySQLPremiseName(this, installWizard.premiseName);
            Settings.setMySQLHubName(this, installWizard.hubName);
            Settings.setFirstRunWizardStepCompleted(this, this.getTitle().toString());
            installWizard.summonNextPage(this, installWizard.PROCEED);
        } else {
            // Compile the error message
            String errorMessages = "";
            for (int i = 0; i < this.installWizard.validationErrorMessages.size(); i++) {
                if (i > 0) {
                    errorMessages += "\n\n";
                }
                errorMessages += this.installWizard.validationErrorMessages.get(i);
            }
//            // Bring up the notice.
//            LinearLayout linearLayout=(LinearLayout)findViewById(R.id.premiseHubForm);
//            Snackbar errorNotice = Snackbar.make(linearLayout, errorMessages, 5000);
//            // Retrieve the text view that holds the message(s)
//            View errorNoticeView = errorNotice.getView();
//            LinearLayout.LayoutParams params=(LinearLayout.LayoutParams)view.getLayoutParams();
//            params.gravity = Gravity.TOP;
//            errorNoticeView.setLayoutParams(params);
//            TextView textView = (TextView) errorNoticeView.findViewById(android.support.design.R.id.snackbar_text);
//            textView.setMaxLines(6);  // We wish to have a maximum 6 lines
//            errorNotice.show();

            //----------------------------------------------------------------------------//
            // Create an alert dialog box
            //----------------------------------------------------------------------------//
            AlertDialog.Builder confirmationDialogBuilder = new AlertDialog.Builder(this);

            //----------------------------------------------------------------------------//
            // Set the properties
            //----------------------------------------------------------------------------//
            confirmationDialogBuilder.setMessage(errorMessages);
            confirmationDialogBuilder.setNeutralButton("OK",
                    new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog,
                                            int id) {
                            dialog.cancel();
                        }
                    }
            );

            AlertDialog confirmationDialog = confirmationDialogBuilder.create();
            confirmationDialog.show();
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

        //----------------------------------------------------------------------------------------//
        // Check that the premise name is filled out and is longer than 3 characters.
        //----------------------------------------------------------------------------------------//
        if (installWizard.premiseName.trim().length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Premise name must be filled out.");

        } else if (installWizard.premiseName.trim().length() <= 3) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Premise name must be longer than 3 characters.");
        }

        //----------------------------------------------------------------------------------------//
        // Check that the hub name is filled out and is longer than 3 characters.
        //----------------------------------------------------------------------------------------//
        if (installWizard.hubName.trim().length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Hub name must be filled out.");

        } else if (installWizard.hubName.trim().length() <= 3) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Hub name must be longer than 3 characters.");
        }

        //----------------------------------------------------------------------------------------//
        // Hub username must be given.
        //----------------------------------------------------------------------------------------//
        if (installWizard.hubUsername.trim().length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Hub username must be filled out.");

        }

        //----------------------------------------------------------------------------------------//
        // Hub password must be given and secure.
        //----------------------------------------------------------------------------------------//
        if (installWizard.hubPassword.length() == 0) {
            valid = false;
            installWizard.validationErrorMessages.add("Hub password must be entered.");
        }

        valid = installWizard.isValidPassword(installWizard.hubPassword) && valid;

        return valid;
    }

    @Override
    public void onBackPressed () {

    }
}
