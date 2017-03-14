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
import android.support.design.widget.Snackbar;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Created by Capsicum on 9/13/2016.
 */
public class ServerProgressPage extends ProgressPageWithCustomPercentage {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.webserverServerSetupTitle);
        this.showSnackbarPopup("Please wait while installation is in progress. This may take several minutes.", 10000, Gravity.BOTTOM);
        this.startSettingUpWebserver();
    }

    private void startSettingUpWebserver() {
        Application application=Application.getInstance();

        //Extract Server Services
        application.extractServerServices.setProgressPage(this);
        application.runServerServices.setProgressPage(this);

        //Set to start the server services straight after extracting
        application.extractServerServices.setRunServerServices(true);

        //Then run the thread that will call onComplete when extract is finished
        application.extractServerServices.setOkayToExtract(true);
    }

    public void showSnackbarPopup(String message, int seconds, int gravity) {
        //-----------------------------------------------------------------------------------//
        // Bring up the notice.
        //-----------------------------------------------------------------------------------//
        LinearLayout linearLayout=(LinearLayout)findViewById(R.id.progress_page);
        Snackbar notice = Snackbar.make(linearLayout, message, Snackbar.LENGTH_INDEFINITE);

        //-----------------------------------------------------------------------------------//
        // Retrieve the text view that holds the message(s) to set the maximum number of lines.
        //-----------------------------------------------------------------------------------//
        View errorNoticeView = notice.getView();
        TextView textView = (TextView) errorNoticeView.findViewById(android.support.design.R.id.snackbar_text);
        textView.setMaxLines(6);  // We wish to have a maximum 6 lines
        notice.show();

    }
}
