/*
Title: Preferences Class
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides an interface to get/set settings
Copyright: Capsicum Corporation 2017

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
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

package com.capsicumcorp.iomy.apps.iomy;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

public class Settings {
    //Constants for Preference names
    //These should be synched with the names specified in xml/preferences.xml
    public static final String PREF_RUN_FIRST_RUN_WIZARD="pref_run_first_run_wizard";
    public static final String PREF_DEMO_DATA_MODE="pref_demo_data_mode";

    public static final String PREF_WATCH_INPUTS_ENABLED="pref_watch_inputs_enabled";
    public static final String PREF_LIGHTTPDPHP_ENABLED="pref_lighttpdphp_enabled";
    public static final String PREF_MYSQL_ENABLED="pref_mysql_enabled";

    public static final String PREF_WEBSERVER_HOSTNAME="pref_webserver_hostname";
    public static final String PREF_WEBSERVER_PORT="pref_webserver_port";

    public static final String PREF_MYSQL_HOSTNAME="pref_mysql_hostname";
    public static final String PREF_MYSQL_PORT="pref_mysql_port";
    public static final String PREF_MYSQL_ROOT_PASSWORD="pref_mysql_root_password";
    public static final String PREF_MYSQL_OWNER_USERNAME="pref_mysql_owner_username";
    public static final String PREF_MYSQL_OWNER_PASSWORD="pref_mysql_owner_password";
    public static final String PREF_MYSQL_WATCHINPUTS_USERNAME="pref_mysql_watchInputs_username";
    public static final String PREF_MYSQL_WATCHINPUTS_PASSWORD="pref_mysql_watchInputs_password";

    //Constants for Preference defaults
    //These should be synched with the defaults specified in xml/preferences.xml
    public static final boolean PREF_RUN_FIRST_RUN_WIZARD_DEFAULT=true;
    public static final boolean PREF_DEMO_DATA_MODE_DEFAULT=false; //Default to false so old installations don't start in demo mode

    public static final boolean PREF_WATCH_INPUTS_ENABLED_DEFAULT=true;
    public static final boolean PREF_LIGHTTPDPHP_ENABLED_DEFAULT=true;
    public static final boolean PREF_MYSQL_ENABLED_DEFAULT=true;

    public static final String PREF_WEBSERVER_HOSTNAME_DEFAULT="localhost";
    public static final String PREF_WEBSERVER_PORT_DEFAULT="8080";

    public static final String PREF_MYSQL_HOSTNAME_DEFAULT="localhost";
    public static final String PREF_MYSQL_PORT_DEFAULT="3306";
    public static final String PREF_MYSQL_ROOT_PASSWORD_DEFAULT="";
    public static final String PREF_MYSQL_OWNER_USERNAME_DEFAULT="";
    public static final String PREF_MYSQL_OWNER_PASSWORD_DEFAULT="";
    public static final String PREF_MYSQL_WATCHINPUTS_USERNAME_DEFAULT="";
    public static final String PREF_MYSQL_WATCHINPUTS_PASSWORD_DEFAULT="";

    public Settings() {
        //Do nothing
    }

    /**
     * Tell Android which xml file to use for shared preferences and also set initial default values
     * This should be called at early App start
     * @param context Android requires a context to access the Preferences
     */
    public static void initPreferences(Context context) {
        PreferenceManager.setDefaultValues(context, R.xml.preferences, false);
    }

    /**
     * Return the Shared Settings object to provide to a getter or setter or for making changes not supported by this class
     * @param context Android requires a context to access the Preferences
     * @return SharedPreferences is returned
     */
    public static SharedPreferences getSharedPref(Context context) {
        return PreferenceManager.getDefaultSharedPreferences(context);
    }

    /**
     * Return the Shared Settings Editor object to provide to a setter
     * @param context Android requires a context to access the Preferences
     * @return The editor for the shared preferences is returned
     */
    public static SharedPreferences.Editor getEditor(Context context) {
        return getSharedPref(context).edit();
    }

    /**
     * Return from saved settings if first run wizard should be run at app start
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings if first run wizard should be run at app start
     */
    public static boolean getRunFirstRunWizard(Context context) {
        return getSharedPref(context).getBoolean(PREF_RUN_FIRST_RUN_WIZARD, PREF_RUN_FIRST_RUN_WIZARD_DEFAULT);
    }

    /**
     * Update to saved settings if first run wizard should be run at app start
     * @param context Android requires a context to access the Preferences
     * @param yes true for Yes or false for No
     */
    public static void setRunFirstRunWizard(Context context, boolean yes) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putBoolean(PREF_RUN_FIRST_RUN_WIZARD, yes);
        editor.apply();
    }

    /**
     * Return from saved settings if demo mode is enabled/disabled
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings if demo mode is enabled/disabled
     */
    public static boolean getDemoModeEnabled(Context context) {
        return getSharedPref(context).getBoolean(PREF_DEMO_DATA_MODE, PREF_DEMO_DATA_MODE_DEFAULT);
    }

    /**
     * Update to saved settings if demo mode is enabled/disabled
     * @param context Android requires a context to access the Preferences
     * @param enabled true to enable or false to disable
     */
    public static void setDemoModeEnabled(Context context, boolean enabled) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putBoolean(PREF_DEMO_DATA_MODE, enabled);
        editor.apply();
    }

    /**
    * Return from saved settings if watch inputs is enabled/disabled
    * @param context Android requires a context to access the Preferences
    * @return Returns from saved settings if watch inputs is enabled/disabled
    */
    public static boolean getWatchInputsEnabled(Context context) {
        return getSharedPref(context).getBoolean(PREF_WATCH_INPUTS_ENABLED, PREF_WATCH_INPUTS_ENABLED_DEFAULT);
    }

    /**
    * Update to saved settings if watch inputs is enabled/disabled
    * @param context Android requires a context to access the Preferences
    * @param enabled true to enable or false to disable
    */
    public static void setWatchInputsEnabled(Context context, boolean enabled) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putBoolean(PREF_WATCH_INPUTS_ENABLED, enabled);
        editor.apply();
    }

    /**
     * Return from saved settings if lighttpd and php are enabled/disabled
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings if lighttpd and php are enabled/disabled
     */
    public static boolean getLighttpdPHPEnabled(Context context) {
        return getSharedPref(context).getBoolean(PREF_LIGHTTPDPHP_ENABLED, PREF_LIGHTTPDPHP_ENABLED_DEFAULT);
    }

    /**
     * Update to saved settings if lighttpd and php are enabled/disabled
     * @param context Android requires a context to access the Preferences
     * @param enabled true to enable or false to disable
     */
    public static void setLighttpdPHPEnabled(Context context, boolean enabled) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putBoolean(PREF_LIGHTTPDPHP_ENABLED, enabled);
        editor.apply();
    }

    /**
     * Return from saved settings if MySQL is enabled/disabled
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings if MySQL is enabled/disabled
     */
    public static boolean getMySQLEnabled(Context context) {
        return getSharedPref(context).getBoolean(PREF_MYSQL_ENABLED, PREF_MYSQL_ENABLED_DEFAULT);
    }

    /**
     * Update to saved settings if MySQL is enabled/disabled
     * @param context Android requires a context to access the Preferences
     * @param enabled true to enable or false to disable
     */
    public static void setMySQLEnabled(Context context, boolean enabled) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putBoolean(PREF_MYSQL_ENABLED, enabled);
        editor.apply();
    }

    /**
    * Return from saved settings the current hostname of the web server to use from
    * @param context Android requires a context to access the Preferences
    * @return Returns from saved settings the current hostname of the web server to use from
    */
    public static String getWebServerHostname(Context context) {
        //Using localhost is okay for the local web server
        return getSharedPref(context).getString(PREF_WEBSERVER_HOSTNAME, PREF_WEBSERVER_HOSTNAME_DEFAULT);
    }

    /**
     * Update the current hostname of the web server to use to saved settings
     * @param context Android requires a context to access the Preferences
     * @param hostname The hostname of the web server to save
     */
    public static void setWebServerHostname(Context context, String hostname) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_WEBSERVER_HOSTNAME, hostname);
        editor.apply();
    }

    /**
     * Return from saved settings the current port of the web server to use from
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current port of the web server to use from
     */
    public static String getWebServerPort(Context context) {
        //Using localhost is okay for the local web server
        return getSharedPref(context).getString(PREF_WEBSERVER_PORT, PREF_WEBSERVER_PORT_DEFAULT);
    }

    /**
     * Return from saved settings the current port of the web server to use from as an integer
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current port of the web server to use from as an integer
     */
    public static int getWebServerPortAsInt(Context context) {
        //Using localhost is okay for the local web server
        return Integer.parseInt(getWebServerPort(context));
    }

    /**
     * Update the current port of the web server to use to saved settings
     * @param context Android requires a context to access the Preferences
     * @param port The port of the web server to save
     */
    public static void setWebServerPort(Context context, String port) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_WEBSERVER_PORT, port);
        editor.apply();
    }

    /**
     * Update the current port of the web server to use as an integer to saved settings
     * The integer is converted to a string before saving to the preference
     * @param context Android requires a context to access the Preferences
     * @param port The port of the web server as an integer to save
     */
    public static void setWebServerPortAsInt(Context context, int port) {
        setWebServerPort(context, Integer.toString(port));
    }

    /**
     * Return from saved settings the current hostname of the MySQL server to use from
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current hostname of the MySQL server to use from
     */
    public static String getMySQLServerHostname(Context context) {
        //Using localhost is okay for the local MySQL server
        return getSharedPref(context).getString(PREF_MYSQL_HOSTNAME, PREF_MYSQL_HOSTNAME_DEFAULT);
    }

    /**
     * Update the current hostname of the MySQL server to use to saved settings
     * @param context Android requires a context to access the Preferences
     * @param hostname The hostname of the MySQL server to save
     */
    public static void setMySQLServerHostname(Context context, String hostname) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_HOSTNAME, hostname);
        editor.apply();
    }

    /**
     * Return from saved settings the current port of the MySQL server to use from
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current port of the MySQL server to use from
     */
    public static String getMySQLServerPort(Context context) {
        //Using localhost is okay for the local web server
        return getSharedPref(context).getString(PREF_MYSQL_PORT, PREF_MYSQL_PORT_DEFAULT);
    }

    /**
     * Return from saved settings the current port of the MySQL server to use from as an integer
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current port of the MySQL server to use from as an integer
     */
    public static int getMySQLServerPortAsInt(Context context) {
        //Using localhost is okay for the local MySQL server
        return Integer.parseInt(getMySQLServerPort(context));
    }

    /**
     * Update the current port of the MySQL server to use to saved settings
     * @param context Android requires a context to access the Preferences
     * @param port The port of the MySQL server to save
     */
    public static void setMySQLServerPort(Context context, String port) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_PORT, port);
        editor.apply();
    }

    /**
     * Update the current port of the MySQL server to use as an integer to saved settings
     * The integer is converted to a string before saving to the preference
     * @param context Android requires a context to access the Preferences
     * @param port The port of the MySQL server as an integer to save
     */
    public static void setMySQLServerPortAsInt(Context context, int port) {
        setMySQLServerPort(context, Integer.toString(port));
    }

    /**
     * Return from saved settings the current root password to use for the MySQL server
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current root password to use for the MySQL server
     */
    public static String getMySQLRootPassword(Context context) {
        return getSharedPref(context).getString(PREF_MYSQL_ROOT_PASSWORD, PREF_MYSQL_ROOT_PASSWORD_DEFAULT);
    }

    /**
     * Update the current root password to use for the MySQL server to saved settings
     * @param context Android requires a context to access the Preferences
     * @param password The root password to use for the MySQL server to save
     */
    public static void setMySQLRootPassword(Context context, String password) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_ROOT_PASSWORD, password);
        editor.apply();
    }

    /**
     * Return from saved settings the current owner username to use for the MySQL server
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current owner username to use for the MySQL server
     */
    public static String getMySQLOwnerUsername(Context context) {
        return getSharedPref(context).getString(PREF_MYSQL_OWNER_USERNAME, PREF_MYSQL_OWNER_USERNAME_DEFAULT);
    }

    /**
     * Update the current owner usenrmae to use for the MySQL server to saved settings
     * @param context Android requires a context to access the Preferences
     * @param username The owner username to use for the MySQL server to save
     */
    public static void setMySQLOwnerUsername(Context context, String username) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_OWNER_USERNAME, username);
        editor.apply();
    }

    /**
     * Return from saved settings the current owner password to use for the MySQL server
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current owner password to use for the MySQL server
     */
    public static String getMySQLOwnerPassword(Context context) {
        return getSharedPref(context).getString(PREF_MYSQL_OWNER_PASSWORD, PREF_MYSQL_OWNER_PASSWORD_DEFAULT);
    }

    /**
     * Update the current owner password to use for the MySQL server to saved settings
     * @param context Android requires a context to access the Preferences
     * @param password The owner password to use for the MySQL server to save
     */
    public static void setMySQLOwnerPassword(Context context, String password) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_OWNER_PASSWORD, password);
        editor.apply();
    }

    /**
     * Return from saved settings the current Watch Inputs username to use for the MySQL server
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current Watch Inputs username to use for the MySQL server
     */
    public static String getMySQLWatchInputsUsername(Context context) {
        return getSharedPref(context).getString(PREF_MYSQL_WATCHINPUTS_USERNAME, PREF_MYSQL_WATCHINPUTS_USERNAME_DEFAULT);
    }

    /**
     * Update the current Watch Inputs usenrmae to use for the MySQL server to saved settings
     * @param context Android requires a context to access the Preferences
     * @param username The Watch Inputs username to use for the MySQL server to save
     */
    public static void setMySQLWatchInputsUsername(Context context, String username) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_WATCHINPUTS_USERNAME, username);
        editor.apply();
    }

    /**
     * Return from saved settings the current Watch Inputs password to use for the MySQL server
     * @param context Android requires a context to access the Preferences
     * @return Returns from saved settings the current Watch Inputs password to use for the MySQL server
     */
    public static String getMySQLWatchInputsPassword(Context context) {
        return getSharedPref(context).getString(PREF_MYSQL_WATCHINPUTS_PASSWORD, PREF_MYSQL_WATCHINPUTS_PASSWORD_DEFAULT);
    }

    /**
     * Update the current Watch Inputs password to use for the MySQL server to saved settings
     * @param context Android requires a context to access the Preferences
     * @param password The Watch Inputs password to use for the MySQL server to save
     */
    public static void setMySQLWatchInputsPassword(Context context, String password) {
        SharedPreferences.Editor editor=getEditor(context);
        editor.putString(PREF_MYSQL_WATCHINPUTS_PASSWORD, password);
        editor.apply();
    }
}
