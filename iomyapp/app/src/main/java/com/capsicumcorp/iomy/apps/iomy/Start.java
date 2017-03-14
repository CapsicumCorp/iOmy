/*
Title: Start/Welcome Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Class Definition for the welcome activity.
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

import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;

/**
 * Welcomes the user and invites them to install IOMy on their device.
 */
public class Start extends AppCompatActivity {

    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        //========================================================================//
        // Prepare the Activity
        //========================================================================//
        super.onCreate(savedInstanceState);

        Settings.initPreferences(this);

        this.setContentView(R.layout.activity_start);
        this.setTitle(Titles.welcomePageTitle);

        Application.getInstance().startBackgroundService();
        Application.getInstance().startBackgroundTasksfromApp();

        final Context context=this;

        //Import default or current settings from Android preferences to the local variables
        installWizard.setInitialSettings(this);

        boolean firstrunval=Settings.getRunFirstRunWizard(this);
        if (firstrunval==false) {
            Application.getInstance().runServerServices.supplyDBRootPassword(installWizard.dbPassword);

            //If the first run wizard has been run, then onComplete will now call installWizard.loadIOMy
            //TODO: Fix this so it can run an alternative multiple set of screens
            installWizard.loadServerDeviceProgress(this);
            //installWizard.loadIOMy(this);
        }
    }

    /**
     * Commands the the install wizard module to bring up the next activity.
     */
    public void nextPage(View view) {
        // Lock the button
        view.setEnabled(false);

        installWizard.summonNextPage(this, installWizard.PROCEED);

        // Unlock the button
        view.setEnabled(true);
    }
}
