/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Main Activity class for Watch Inputs
Copyright: Capsicum Corporation 2014-2016

This file is part of Watch Inputs which is part of the iOmy project.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

package com.capsicumcorp.iomy.apps.watchinputs;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends Activity {
    public static String AppName;

    private static MainActivity instance;

    public static MainActivity getInstance() {
        if (instance == null) {
            throw new IllegalStateException();
        }
        return instance;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        instance = this;

        AppName=Application.getInstance().getAppName();

        setContentView(R.layout.activity_main);

        Application.getInstance().startMonitoringService();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        Log.println(Log.INFO, AppName, "Entering MainActivity.destroy");

        //This runs when the back button is pressed
        //stopService(IOService.createIntent(this));
    }
}
