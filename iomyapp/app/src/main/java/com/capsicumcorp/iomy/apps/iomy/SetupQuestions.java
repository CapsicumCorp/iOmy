/*
Title: Titles Interface
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Titles for different activities
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

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.CheckBox;

public class SetupQuestions extends AppCompatActivity {
    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setup_questions);
        this.setTitle(Titles.setupQuestions);
    }

    /**
     * Commands the the install wizard module to bring up the next activity.
     */
    public void nextPage(View view) {
        // Lock the button
        view.setEnabled(false);

        //--------------------------------------------------------------------//
        // Grab the installation options check boxes
        //--------------------------------------------------------------------//
        CheckBox chkboxInstallDemo = (CheckBox) findViewById(R.id.installDemo);

        //--------------------------------------------------------------------//
        // Apply the installation parameters
        //--------------------------------------------------------------------//
        boolean installDemoData=chkboxInstallDemo.isChecked();

        installWizard.setInstallDemoData(installDemoData);

        Settings.setDemoModeEnabled(this, installDemoData);
        Settings.setFirstRunWizardStepCompleted(this, this.getTitle().toString());

        if (installDemoData) {
            Settings.setMySQLOwnerUsername(this, "demo");
            Settings.setMySQLOwnerPassword(this, "demo");
            Settings.setWatchInputsEnabled(this, false);
        } else {
            Settings.setWatchInputsEnabled(this, true);
        }
        //Save these settings here until WebserverServerDevice is setup
        Settings.setWebServerHostname(this, installWizard.hostname);
        Settings.setWebServerPortAsInt(this, installWizard.webserverport);
        Settings.setMySQLServerHostname(this, installWizard.dbURI);
        Settings.setMySQLServerPortAsInt(this, installWizard.dbServerPort);
        Settings.setLighttpdPHPEnabled(this, true);
        Settings.setMySQLEnabled(this, true);

        installWizard.summonNextPage(this, installWizard.PROCEED);

        // Unlock the button
        view.setEnabled(true);
    }
}
