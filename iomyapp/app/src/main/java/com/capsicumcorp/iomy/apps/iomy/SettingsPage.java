/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2016

This file is part of ioMy.

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

package com.capsicumcorp.iomy.apps.iomy;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.EditTextPreference;
import android.preference.PreferenceActivity;
import android.preference.PreferenceScreen;
import android.support.v7.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;

//The deprecation ignore is for findPreference as it is deprecated on newer Android APIs
public class SettingsPage extends PreferenceActivity {
    private SharedPreferences.OnSharedPreferenceChangeListener changeListener;

    @SuppressWarnings("deprecation")
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        addPreferencesFromResource(R.xml.preferences);

        EditTextPreference textPref;

        textPref=(EditTextPreference)findPreference("pref_webserver_hostname");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_webserver_port");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_hostname");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_port");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_root_password");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_owner_username");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_owner_password");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_watchInputs_username");
        textPref.setSummary(textPref.getText());

        textPref=(EditTextPreference)findPreference("pref_mysql_watchInputs_password");
        textPref.setSummary(textPref.getText());

        PreferenceScreen server_settings = (PreferenceScreen) getPreferenceScreen().findPreference("server_settings_key");
        Intent server_settings_intent = new Intent(this, ServiceSettings.class);
        server_settings.setIntent(server_settings_intent);

        changeListener = new SharedPreferences.OnSharedPreferenceChangeListener() {
                    @Override
                    public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
                        if (key.equals("pref_watch_inputs_enabled") || key.equals("pref_lighttpdphp_enabled") || key.equals("pref_mysql_enabled")) {
                            Application.getInstance().wakeUpServerServicesThread();
                        }
                    }
                };
        Settings.getSharedPref(this).registerOnSharedPreferenceChangeListener(changeListener);
    }
    @Override
    public void onDestroy() {
        super.onDestroy();

        Settings.getSharedPref(this).unregisterOnSharedPreferenceChangeListener(changeListener);
    }

    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        LinearLayout root = (LinearLayout)findViewById(android.R.id.list).getParent().getParent().getParent();
        Toolbar bar = (Toolbar) LayoutInflater.from(this).inflate(R.layout.pref_with_actionbar, root, false);
        root.addView(bar, 0); // insert at top
        bar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
    }}
