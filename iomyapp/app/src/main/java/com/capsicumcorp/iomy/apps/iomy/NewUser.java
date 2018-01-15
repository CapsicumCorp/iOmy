/*
Title: New User Class
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

import android.content.DialogInterface;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

public class NewUser extends AppCompatActivity {

    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_owner);
        this.setTitle(Titles.premiseHubOwnerTitle);
    }

    /**
     * Validates the username and password. If one or both is present and valid, the next activity
     * will begin to create the user, premise, and hub. Otherwise, it will bring up a Snackbar
     * notice at the bottom of the screen.
     *
     * @param view              Button that calls this procedure.
     */
    public void nextPage(View view) {
        // Lock the button
        view.setEnabled(false);
        //------------------------------------------------------------//
        // Gather form data
        //------------------------------------------------------------//
        EditText et = (EditText) findViewById(R.id.owner_username);
        installWizard.ownerUsername = et.getText().toString();

        et = (EditText) findViewById(R.id.owner_password);
        installWizard.ownerPassword = et.getText().toString();

        et = (EditText) findViewById(R.id.owner_confirm_password);
        installWizard.confirmOwnerPassword = et.getText().toString();

        if (this.isValidData() == true) {
            //------------------------------------------------------------//
            // Proceed to create the premise, hub, and a new user, the owner.
            //------------------------------------------------------------//
            Settings.setMySQLOwnerUsername(this, installWizard.ownerUsername);
            Settings.setMySQLOwnerPassword(this, installWizard.ownerPassword);
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
            // Bring up the notice.
//            LinearLayout linearLayout=(LinearLayout)findViewById(R.id.owner_form);
//            Snackbar errorNotice = Snackbar.make(linearLayout, errorMessages, 5000);
//            // Retrieve the text view that holds the message(s)
//            View errorNoticeView = errorNotice.getView();
//            LinearLayout.LayoutParams params=(LinearLayout.LayoutParams)view.getLayoutParams();
//            params.gravity = Gravity.TOP;
//            errorNoticeView.setLayoutParams(params);
//            TextView textView = (TextView) errorNoticeView.findViewById(android.support.design.R.id.snackbar_text);
//            textView.setMaxLines(12);  // We wish to have a maximum 12 lines
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

    public boolean isValidData() {
        boolean valid = true;

        // Clear the error log
        this.installWizard.validationErrorMessages.clear();

        // Does the username exist?
        if (installWizard.ownerUsername.trim().length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Username must be filled out.");

        } else if (installWizard.ownerUsername.trim().length() == 1) {
            valid = false;
            this.installWizard.validationErrorMessages.add("Username must be longer than a single character.");

        } else {
            // Has the user attempted to use 'admin' or 'root' as their username.
            String lowerCaseUsername = installWizard.ownerUsername.toLowerCase();

            if (lowerCaseUsername.equals("admin") || lowerCaseUsername.equals("root") ||
                    lowerCaseUsername.equals("administrator") || lowerCaseUsername.equals("sys") ||
                    lowerCaseUsername.equals("manager"))
            {
                valid = false;
                this.installWizard.validationErrorMessages.add("Username must not be any variation of 'admin', 'administrator', 'manager', 'sys', or 'root.");

            } else {
                // Make sure there are no invalid characters in the username.
                Log.d("Given Username", installWizard.ownerUsername.replaceAll("[a-zA-Z0-9]", ""));
                if (installWizard.ownerUsername.replaceAll("[a-zA-Z0-9]", "").length() > 0) {
                    valid = false;
                    this.installWizard.validationErrorMessages.add("Username should contain only numbers and letters.");
                }
            }
        }

        // Run the password check
        if (installWizard.ownerPassword.length() == 0) {
            valid = false;
            installWizard.validationErrorMessages.add("Password must be entered.");
        }

        valid = installWizard.isValidPassword(installWizard.ownerPassword) && valid;
        if (valid) {
            Log.v("New User", "Valid");
        } else {
            Log.v("New User", "Not Valid");
        }

        if (this.installWizard.confirmOwnerPassword.length() == 0) {
            installWizard.validationErrorMessages.add("You must re-enter password to confirm.");
            valid = false;
        } else {
            if (!this.installWizard.ownerPassword.equals(this.installWizard.confirmOwnerPassword)) {
                valid = false;
                this.installWizard.validationErrorMessages.add("Passwords don't match.");
            }
        }

        return valid;
    }
}
