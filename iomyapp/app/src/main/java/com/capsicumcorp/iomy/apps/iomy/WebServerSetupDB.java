/*
Title: Database Setup Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Class Definition for the database schema activity.
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
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

/**
 * This activity has the user either accept the default name of the database schema that IOMy will
 * use ('IOMY'), or enter a different schema name.
 */
public class WebServerSetupDB extends AppCompatActivity {
    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_server_setup_db);
        this.setTitle(Titles.webserverInfoPageTitle);
    }

    /**
     * Procedure that validates the name of the database to see if it exists. If it exists, then
     * move it to the next page. If not it will create a Snackbar notice at the bottom with an
     * error message.
     *
     * @param view      Button that called this procedure
     */
    public void nextPage(View view) {
        // Locks this button to prevent the user from running the DB setup twice.
        view.setEnabled(false);

        EditText tvSchema = (EditText) findViewById(R.id.dbSchema);
        installWizard.databaseSchema = tvSchema.getText().toString();
        Log.d("WebServerSetupDB", installWizard.databaseSchema);
        Log.d("WebServerSetupDB", "Length of the Schema name: "+installWizard.databaseSchema.length());

        List<String> sets = new ArrayList<String>();

        if (this.isDataValid()) {
            Settings.setMySQLDatabaseSchema(this, installWizard.databaseSchema);
            Settings.setFirstRunWizardStepCompleted(this, this.getTitle().toString());
            installWizard.summonNextPage(this, installWizard.PROCEED);
        } else {
            // Reset the variable to null
            installWizard.databaseSchema = null;
            // Compile the error message
            String errorMessages = "";
            for (int i = 0; i < this.installWizard.validationErrorMessages.size(); i++) {
                if (i > 0) {
                    errorMessages += "\n";
                }
                errorMessages += this.installWizard.validationErrorMessages.get(i);
            }
//            // Bring up the notice.
//            LinearLayout linearLayout=(LinearLayout)findViewById(R.id.webserverDBForm);
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
     * Validates all user input before submitting.
     *
     * @return                  Whether all input is valid (true) or not (false)
     */
    public boolean isDataValid() {
        boolean valid = true;

        //--------------------------------------------------------------//
        // Check that the database schema name is filled out
        //--------------------------------------------------------------//
        if (this.installWizard.databaseSchema.length() == 0) {
            valid = false;
            this.installWizard.validationErrorMessages.add("You must specify a database name for iOmy to use.");
        }

        return valid;
    }

    @Override
    public void onBackPressed () {

    }
}
