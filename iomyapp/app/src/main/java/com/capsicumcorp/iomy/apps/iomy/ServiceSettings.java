/*
Title: Services Settings Class
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

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.SwitchCompat;
import android.widget.CompoundButton;

public class ServiceSettings extends AppCompatActivity {
    private Application applicationInstance;
    private boolean ignoreWatchInputsCheckedListener=false;
    private boolean ignoreLighttpdCheckedListener=false;
    private boolean ignoreMySQLCheckedListener=false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_service_settings);
        this.setTitle(Titles.servicesToggleTitle);

        //Setup switch listeners and sync with current preference values
        applicationInstance=Application.getInstance();

        SwitchCompat watchInputsEnableSwitch=(SwitchCompat) findViewById(R.id.watchInputsEnableSwitch);
        watchInputsEnableSwitch.setChecked(applicationInstance.runServerServices.getIsWatchInputsRunning());

        SwitchCompat lighttpdEnableSwitch=(SwitchCompat) findViewById(R.id.lighttpdEnableSwitch);
        lighttpdEnableSwitch.setChecked(applicationInstance.runServerServices.getBoolIsLighttpdRunning());

        SwitchCompat mySQLEnableSwitch=(SwitchCompat) findViewById(R.id.mySQLEnableSwitch);
        mySQLEnableSwitch.setChecked(applicationInstance.runServerServices.getBoolIsMySQLRunning());

        applicationInstance.runServerServices.setServiceSettings(this);

        watchInputsEnableSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                changeWatchInputsCheckbox(!isChecked, true);
            }
        });
        lighttpdEnableSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                changeLighttpdCheckbox(!isChecked, true);
            }
        });
        mySQLEnableSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                changeMySQLCheckbox(!isChecked, true);
            }
        });
    }
    @Override
    protected void onDestroy() {
        super.onDestroy();
        applicationInstance.runServerServices.setServiceSettings(null);
    }
    //NOTE: Android will change the slider when the user clicks it, so we need to change it back then
    //  wait for the server service to change it when the service change has been applied
    //  The checked listener will also be called when we change the checked value
    //From fromcheckedlistener=true means the checked listener called this function
    public void changeWatchInputsCheckbox(boolean checked, boolean fromcheckedlistener) {
        if (!fromcheckedlistener) {
            //Ignore the next call from the listener so we don't double change the switch slider
            ignoreWatchInputsCheckedListener=true;
        } else {
            if (ignoreWatchInputsCheckedListener) {
                ignoreWatchInputsCheckedListener=false;
                return;
            } else {
                applicationInstance.runServerServices.overrideWatchInputsState(!checked);
            }
        }
        SwitchCompat watchInputsEnableSwitch=(SwitchCompat) findViewById(R.id.watchInputsEnableSwitch);
        watchInputsEnableSwitch.setChecked(checked);
    }
    public void changeLighttpdCheckbox(boolean checked, boolean fromcheckedlistener) {
        if (!fromcheckedlistener) {
            //Ignore the next call from the listener so we don't double change the switch slider
            ignoreLighttpdCheckedListener=true;
        } else {
            if (ignoreLighttpdCheckedListener) {
                ignoreLighttpdCheckedListener=false;
                return;
            } else {
                applicationInstance.runServerServices.overrideLighttpdState(!checked);
            }
        }
        SwitchCompat lighttpdEnableSwitch=(SwitchCompat) findViewById(R.id.lighttpdEnableSwitch);
        lighttpdEnableSwitch.setChecked(checked);
    }
    public void changeMySQLCheckbox(boolean checked, boolean fromcheckedlistener) {
        if (!fromcheckedlistener) {
            //Ignore the next call from the listener so we don't double change the switch slider
            ignoreMySQLCheckedListener=true;
        } else {
            if (ignoreMySQLCheckedListener) {
                ignoreMySQLCheckedListener=false;
                return;
            } else {
                applicationInstance.runServerServices.overrideMySQLState(!checked);
            }
        }
        SwitchCompat mySQLEnableSwitch=(SwitchCompat) findViewById(R.id.mySQLEnableSwitch);
        mySQLEnableSwitch.setChecked(checked);
    }
}
