/*
Title: Install Wizard Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides functionality for the entire installation process.
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

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;
import android.util.Log;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * This is a Java module for controlling all aspects of the installer. It handles the flow between
 * activities, provides temporary storage for user input from forms, and can generate and validate
 * passwords.
 */
public class InstallWizard {
    //==============================================//
    // Declare all the class properties
    //==============================================//

    private String welcomeMessage            = "Thank you for choosing iOmy home automation. Press begin to start the quick installation.";
    private boolean installDemoData          = true;

    // Enumerations of answers to the questions.
    public int YES = 0;
    public int NO = 1;
    public int CREATE_NEW = 2;
    public int USE_EXISTING = 3;
    public int PROCEED = 4;

    // Form Data
    public String setupAPI = "http://localhost:8080/iomyserver.php";
    public String hostname = null;
    public int webserverport = 8080;
    public String dbURI                 = "localhost";
    public int dbServerPort             = 3306;
    public String dbUsername            = "root";
    public String dbPassword            = "";
    public String databaseSchema        = null;
    public String premiseName           = null;
    public String hubName               = null;
    public String ownerUsername         = null;
    public String ownerPassword         = null;
    public String confirmOwnerPassword  = null;

    public String watchInputsUsername   = "WatchInputs001";
    public String watchInputsPassword   = null;

    public List<String> validationErrorMessages = new ArrayList<String>();
    public List<String> apiErrorMessages        = new ArrayList<String>();

    // JSON responses
    public JSONObject lastJSONResponse  = null;

    // New PKs
    public int premiseID                = 0;
    public int hubID                    = 0;
    public int userID                   = 0;

    //==============================================//
    // Constructor
    //==============================================//
    public InstallWizard() {

    }

    /**
     * Retrieves the net.hostname system property
     * @param defValue the value to be returned if the hostname could
     * not be resolved
     */
    public String getHostName(String defValue) {
        try {
            Method getString = Build.class.getDeclaredMethod("getString", String.class);
            getString.setAccessible(true);
            return getString.invoke(null, "net.hostname").toString();
        } catch (Exception ex) {
            return defValue;
        }
    }

    //Set initial variable settings based on the current stored preferences
    public void setInitialSettings(Context context) {
        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(context);

        //Using localhost is okay for the local web server
        this.hostname=sharedPref.getString("pref_webserver_hostname", "localhost");
        this.webserverport=Integer.parseInt(sharedPref.getString("pref_webserver_port", "8080"));
        this.setupAPI="http://"+this.hostname+":"+this.webserverport+"/iomyserver.php";
        this.dbURI=sharedPref.getString("pref_mysql_hostname", "localhost");
        this.dbServerPort=Integer.parseInt(sharedPref.getString("pref_mysql_port", "3306"));
        this.dbPassword=sharedPref.getString("pref_mysql_root_password", "");
        this.installDemoData=sharedPref.getBoolean("pref_demo_data_mode", true);
    }
    /**
     * Generates a random password between 8 - 20 characters long.
     *
     * @return          New password
     */
    public String generateRandomPassword() {
        String password = "";
        int minLength = 8;
        int maxLength = 20;
        Random r = new Random();
        int length = r.nextInt((maxLength - minLength) + 1) + minLength;
        String validChars = "abcdefghijkmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ!@#%^&*()[]{}_+=-<>?";

        // Until a valid password is generated...
        do {
            // ...generate the password.

            // Ensure that the string is empty before the password is generated.
            password = "";

            for (int i = 0; i < length; i++) {
                r = new Random();
                password += validChars.charAt(r.nextInt(validChars.length()));
            }

        } while (!this.isValidPassword(password));

        return password;
    }

    /**
     * Determine whether a given password has at least one letter, number, and symbol, and is longer
     * than 8 characters.
     *
     * @param password              Password given for checking
     * @return                      Whether it's valid or not
     */
    public boolean isValidPassword(String password) {
        boolean valid;
        boolean continueCheck           = false;
        boolean eightChars              = false;
        boolean hasASymbol              = false;
        boolean hasANumber              = false;
        boolean hasAnUpperCaseLetter    = false;
        boolean hasALowerCaseLetter     = false;
        int expectedPasswordLength      = 8;
        int passwordLength              = password.length();
        int symbols                     = 0;
        int numbers                     = 0;
        int letters                     = 0;
        int upperCaseLetters            = 0;
        int lowerCaseLetters            = 0;

        //----------------------------------//
        // How long is the password?
        //----------------------------------//
        if (passwordLength >= expectedPasswordLength) {
            // Take any spaces off the end of the password.
            password = password.trim();
            passwordLength = password.length();

            // Now see what the true length of the password is.
            if (passwordLength >= expectedPasswordLength) {
                eightChars = true;
                // Go through every single character, analyse each one to see if it's a letter, number, or symbol
                for (int i = 0; i < passwordLength; i++) {
                    if (continueCheck == true) {
                        break;
                    }
                    // Is it a number?
                    if (Character.isDigit(password.charAt(i))) {
                        numbers++;

                    // Is it a letter?
                    } else if (Character.isLetter(password.charAt(i))) {
                        // Is it upper or lower case.
                        if (Character.isUpperCase(password.charAt(i))) {
                            upperCaseLetters++;
                        } else if (Character.isLowerCase(password.charAt(i))) {
                            lowerCaseLetters++;
                        }
                        letters++;

                    // So it must be some sort of symbol.
                    } else {
                        symbols++;
                    }
                }

                //----------------------------------------------------------------------------------------//
                // Check that all the criteria have been met
                //----------------------------------------------------------------------------------------//
                // Are there numbers?
                if (numbers > 0) {
                    hasANumber = true;
                } else {
                    this.validationErrorMessages.add("Password must have a number.");
                }

                // Are there letters?
                if (letters > 0) {
                    // Are there upper-case letters?
                    if (upperCaseLetters > 0) {
                        hasAnUpperCaseLetter = true;
                    } else {
                        this.validationErrorMessages.add("Password must have at least one upper-case letter.");
                    }

                    // Are there lower-case letters?
                    if (lowerCaseLetters > 0) {
                        hasALowerCaseLetter = true;
                    } else {
                        this.validationErrorMessages.add("Password must have at least one lower-case letter.");
                    }
                } else {
                    this.validationErrorMessages.add("Password must contain letters.");
                }

                if (symbols > 0) {
                    hasASymbol = true;
                } else {
                    this.validationErrorMessages.add("Password must have a symbol (!, @, %, etc).");
                }

            //---------------------------------------------------------------------------------//
            // Someone was cheeky enough to try and circumvent the 8 character limit by placing
            // spaces on either sides of the characters. No chance!
            //---------------------------------------------------------------------------------//
            } else {
                this.validationErrorMessages.add("Password must be at least 8 characters. No trailing spaces.");
            }
        //---------------------------------------------------------------------------------//
        // The password simply isn't long enough to be secure!
        //---------------------------------------------------------------------------------//
        } else {
            this.validationErrorMessages.add("Password must be at least 8 characters.");
        }

        //----------------------------------------------------------------------------------------//
        // Verify validity and generate error messages when not all of the conditions are met.
        //----------------------------------------------------------------------------------------//
        if (eightChars == true && hasAnUpperCaseLetter == true && hasALowerCaseLetter == true &&
                hasANumber == true && hasASymbol == true) {

            valid = true;

        } else { // One of the conditions has not been met
            valid = false;
            // Populate the error log with the relevant messages.

        }

        return valid;
    }

    //==============================================//
    // Declare all the class methods
    //==============================================//
    public void summonNextPage(Activity activity, int answer) {
        if (answer < 0 || answer > 4) {
            // THIS SHOULD NOT EXECUTE UNDER NORMAL CIRCUMSTANCES!
            // There must be a bug present in your code for this to run.
            throw new IllegalArgumentException("An unrecognised answer was found.");
        }

        String title = activity.getTitle().toString();

        //--- Proceed from the welcome page to the license agreement. ---//
        if (title == Titles.welcomePageTitle) {
            this.summonLicenseAgreement(activity);

        //--- Proceed from the license agreement to the setup question ---//
        } else if (title == Titles.licenseAgreementTitle) {
            this.summonSetupQuestions(activity);

        //--- Proceed from the setup questions to the question about using the device as the server. ---//
        } else if (title == Titles.setupQuestions) {
            this.loadServerDeviceProgress(activity);

            //--- After the server is setup, bring up the database setup. ---//
        } else if (title == Titles.webserverServerSetupTitle) {
            this.summonWebserverDBInfoSetup(activity);

            //--- Configure the database root password ---//
        } else if (title == Titles.webserverInfoPageTitle) {
            this.summonDBConfigureRootPassword(activity);

            //--- Setup the database ---//
        } else if (title == Titles.webserverDatabaseRootPasswordSetupTitle) {
            //Inform the service services thread about the current root password
            Application.getInstance().runServerServices.supplyDBRootPassword(dbPassword);
            this.summonDBSetupPage(activity);

        //--- Once the database is set up, create a premise and a hub
        } else if (title == Titles.webserverDatabaseSetupTitle) {
            this.summonPremiseAndHubSetup(activity);

        //--- Set the new owner of the premise ---//
        } else if (title == Titles.premiseAndHubTitle) {
            this.summonPremiseHubOwner(activity);

        //--- Create the premise, hub, and their owner ---//
        } else if (title == Titles.premiseHubOwnerTitle) {
            this.loadPremiseHubOwnerProgress(activity);

        //--- Start IOMy ---//
        } else if (title == Titles.finalSetupTitle) {
            writeWatchInputsFile();
            //Disable first run wizard
            SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(activity);
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putBoolean("pref_run_first_run_wizard", false);
            editor.putBoolean("pref_demo_data_mode", true);

            //Update other settings
            editor.putString("pref_webserver_hostname", this.hostname);
            editor.putString("pref_webserver_port", Integer.toString(this.webserverport));
            editor.putString("pref_mysql_hostname", this.dbURI);
            editor.putString("pref_mysql_port", Integer.toString(this.dbServerPort));
            editor.putString("pref_mysql_root_password", this.dbPassword);
            editor.putString("pref_mysql_owner_username", this.ownerUsername);
            editor.putString("pref_mysql_owner_password", this.ownerPassword);
            editor.putString("pref_mysql_watchInputs_username", this.watchInputsUsername);
            editor.putString("pref_mysql_watchInputs_password", this.watchInputsPassword);
            editor.putBoolean("pref_watch_inputs_enabled", true);
            editor.putBoolean("pref_lighttpdphp_enabled", true);
            editor.putBoolean("pref_mysql_enabled", true);
            editor.commit();

            //Load main screen
            this.loadIOMy(activity);
        }
    }

    public void summonSetupQuestions(Activity activity) {
        Intent intent = new Intent(activity, SetupQuestions.class);
        activity.startActivity(intent);
    }

    public void summonLicenseAgreement(Activity activity) {
        Intent intent = new Intent(activity, LicenseAgreement.class);
        activity.startActivity(intent);
    }

    public void summonWebserverDevicePage(Activity activity) {
        Intent intent = new Intent(activity, WebserverServerDevice.class);
        activity.startActivity(intent);
    }

    public void loadServerDeviceProgress(Activity activity) {
        Intent intent = new Intent(activity, ServerProgressPage.class);
        activity.startActivity(intent);
    }

    public void summonWebserverDBInfoSetup(Activity activity) {
        Intent intent = new Intent(activity, WebServerSetupDB.class);
        activity.startActivity(intent);
    }

    public void summonDBConfigureRootPassword(Activity activity) {
        Intent intent = new Intent(activity, DBConfigureRootPassword.class);
        activity.startActivity(intent);
    }

    public void summonDBSetupPage(Activity activity) {
        Intent intent = new Intent(activity, DBSetupProgressPage.class);
        activity.startActivity(intent);
    }

    public void summonPremiseAndHubSetup(Activity activity) {
        Intent intent = new Intent(activity, PremiseAndHubSetup.class);
        activity.startActivity(intent);
    }

    public void summonPremiseHubOwner(Activity activity) {
        Intent intent = new Intent(activity, NewUser.class);
        activity.startActivity(intent);
    }

    public void loadPremiseHubOwnerProgress(Activity activity) {
        Intent intent = new Intent(activity, UserPremiseHubProgressPage.class);
        activity.startActivity(intent);
    }

    public void loadIOMy(Activity activity) {
        Intent intent = new Intent(activity, IOMy.class);

        //Disable ability to go back to the first run wizard
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        activity.startActivity(intent);
    }

    //TODO: Get the real hubpk instead of assuming 1
    public void writeWatchInputsFile() {
        //First write to a temp file as if Watch Inputs is already running
        //  when we write to the final filename, Watch Inputs may pick up the file
        //  before we have finished writing the entire contents
        File watchInputsSrcFile=new File(Application.getInstance().getStorageFolderName() + "/WatchInputs.cfg.tmp");
        if (watchInputsSrcFile.exists()) {
            watchInputsSrcFile.delete();
        }
        try {
            watchInputsSrcFile.createNewFile();

            PrintWriter watchInputsTempFile = new PrintWriter(Application.getInstance().getStorageFolderName() +"/WatchInputs.cfg.tmp");
            watchInputsTempFile.println("# ioMy Watch Inputs Config");
            watchInputsTempFile.println("[general]");
            watchInputsTempFile.println("hubpk=" + hubID);
            watchInputsTempFile.println("hubname=" + hubName);
            watchInputsTempFile.println("[dbconfig]");
            watchInputsTempFile.println("dbtype=mysql");
            watchInputsTempFile.println("dbname=" + databaseSchema);
            watchInputsTempFile.println("host=" + dbURI);
            watchInputsTempFile.println("username=" + watchInputsUsername);
            watchInputsTempFile.println("password=" + watchInputsPassword);
            watchInputsTempFile.println("[webapiconfig]");
            watchInputsTempFile.println("hostname=" + dbURI);
            watchInputsTempFile.println("port=8080");
            watchInputsTempFile.println("url=/restricted/php/special/watchinputs.php");
            watchInputsTempFile.println("apiusername=" + watchInputsUsername);
            watchInputsTempFile.println("apipassword=" + watchInputsPassword);
            watchInputsTempFile.println("[zigbeeconfig]");
            watchInputsTempFile.println("zigbeedefsfilename=" + Application.getInstance().getStorageFolderName() + "/zigbeedefs.ini");
            watchInputsTempFile.close();

            File watchInputsDestFile = new File(Application.getInstance().getStorageFolderName() + "/WatchInputs.cfg");
            if (watchInputsDestFile.exists()) {
                watchInputsDestFile.delete();
            }
            watchInputsSrcFile.renameTo(watchInputsDestFile);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
//    public String getWelcomePageTitle()                 {return this.welcomePageTitle;}
//    public String getWebserverPageTitle()               {return this.webserverPageTitle;}
//    public String getWebserverInfoPageTitle()           {return this.webserverInfoPageTitle;}
//    public String getLicenseAgreementTitle()            {return this.licenseAgreementTitle;}
//    public String getPremiseAndHubTitle()               {return this.premiseAndHubTitle;}

    public String getWelcomeMessage()               {return this.welcomeMessage;}
    public boolean getInstallDemoData()             {
        return this.installDemoData;
    }

    public void setInstallDemoData(boolean b)       {
        this.installDemoData = b;
    }
}
