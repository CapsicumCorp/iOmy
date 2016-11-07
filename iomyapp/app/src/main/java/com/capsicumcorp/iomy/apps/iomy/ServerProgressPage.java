/*
Title: Server Setup Progress Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Sets up a local web server (using default parameters) or makes use of a remote one.
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
import android.util.Log;

/**
 * Created by Capsicum on 9/13/2016.
 */
public class ServerProgressPage extends ProgressPage {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.webserverServerSetupTitle);
        this.startSettingUpWebserver();
    }

    private void startSettingUpWebserver() {
        Application application=Application.getInstance();

        if (!application.extractServerServices.isAlive()) {
            //Extract Server Services
            application.extractServerServices.setProgressPage(this);
            application.runServerServices.setProgressPage(this);

            //Set to start the server services straight after extracting
            application.extractServerServices.setRunServerServices(true);

            //Then run the thread that will call onComplete when extract is finished
            application.extractServerServices.start();
        }
    }
}
