/*
Title: Usb Connected Class
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Activated when a recognised usb device is plugged in so the app can start in the background
  instead of opening up fully
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

//NOTE: This brings up a white window which quickly disappears when a usb device is plugged in or
//    at bootup if the device is connected at the time

package com.capsicumcorp.iomy.apps.iomy;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

public class UsbConnected extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        finish();
        Application.getInstance().setStartedFromUsb(true);
        Application.getInstance().startBackgroundService();
        Application.getInstance().startBackgroundTasksfromReceiver();
    }
}
