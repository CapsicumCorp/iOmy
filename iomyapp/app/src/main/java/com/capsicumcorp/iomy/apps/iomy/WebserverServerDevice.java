/*
Title: Web Server Location Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Definition for the page that asks the user whether the web server is local (on the
    current device) or elsewhere.
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
import android.support.v7.app.AppCompatActivity;
import android.view.View;

/**
 * Asks whether the user wishes to use the default local web server, or use a remote server (which
 * requires manual configuration on that server).
 */
public class WebserverServerDevice extends AppCompatActivity {
    private InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_server_question_local);
        this.setTitle(Titles.webserverDeviceTitle);
    }

    /**
     * Commands the the install wizard module to bring up the next activity determined if the user
     * selects 'YES'.
     */
    public void nextPageYes(View view) {
        // Lock the button
        view.setEnabled(false);

        this.installWizard.summonNextPage(this, this.installWizard.YES);
        // Unlock the button
        view.setEnabled(true);
    }

    /**
     * Commands the the install wizard module to bring up the next activity determined if the user
     * selects 'NO'.
     */
    public void nextPageNo(View view) {
        // Lock the button
        view.setEnabled(false);

        this.installWizard.summonNextPage(this, this.installWizard.NO);
        // Unlock the button
        view.setEnabled(true);
    }
}
