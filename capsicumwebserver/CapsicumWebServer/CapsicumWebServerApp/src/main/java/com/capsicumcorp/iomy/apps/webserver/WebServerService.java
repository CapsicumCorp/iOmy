/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2016

This file is part of Capsicum Web Server which is part of the iOmy project.

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

package com.capsicumcorp.iomy.apps.webserver;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

public class WebServerService extends Service {
    private static final int ONGOING_NOTIFICATION = 1;
    public static ExtractServerServices ServicesThread=null;

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!Application.getInstance().getServiceStarted()) {
            Log.println(Log.INFO, Application.getInstance().getAppName(), "Entering WebServices.onStartCommand");

            Notification notification = new NotificationCompat.Builder(this)
                    .setContentTitle(Application.getInstance().getAppName())
                    .setContentText("Capsicum Web Server Service")
                    //.setSmallIcon(R.drawable.logo)
                    .build();

            //Using this makes Android less likely to kill the service during low ram situation
            startForeground(ONGOING_NOTIFICATION, notification);

            Application.getInstance().onServiceStarted();
        }
        // We want this service to continue running until it is explicitly
        // stopped, so return sticky.
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        Log.println(Log.INFO, Application.getInstance().getAppName(), "Entering WebServices.destroy");
        Application.getInstance().onServiceDestroy();
        stopForeground(true);
        Log.println(Log.INFO, Application.getInstance().getAppName(), "Exiting WebServices.destroy");
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    public static Intent createIntent(Context context) {
        return new Intent(context, WebServerService.class);
    }
}
