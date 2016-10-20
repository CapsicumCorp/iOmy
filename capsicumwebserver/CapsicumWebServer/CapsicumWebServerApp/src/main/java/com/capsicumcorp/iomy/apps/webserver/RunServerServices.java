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

Some code copied from DroidPHP: https://github.com/DroidPHP/DroidPHP

DroidPHP is licensed under the <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0 (the "License");</a>.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

package com.capsicumcorp.iomy.apps.webserver;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class RunServerServices extends Thread {
    public static String CHANGE_PERMISSION = null;
    public static final String ASSETSVERSIONFILENAME = "webserverassetsversion.txt";
    private final Context context;

    private boolean isExtracted=false;
    private boolean quit=false;

    private boolean overrideLighttpdState=true;
    private boolean overrideMySQLState=true;

    private InputStream assetsversionfile;

    private ProgressPage progressPage=null;

    RunServerServices(Context context) {
        this.context = context;
        this.CHANGE_PERMISSION = getInternalStorageFolder() + "/bin/chmod 755 ";
    }

    private Application getApplication() {
        return Application.getInstance();
    }
    private String getSystemFolder() {
        return getApplication().getSystemDirectory();
    }
    private String getInternalStorageFolder() {
        return getApplication().getInstance().getInternalStorageFolderName();
    }
    private String getExternalStorageFolder() {
        return getApplication().getExternalStorageFolderName();
    }
    private int execWithWait(String cmd) throws Exception {
        Process p;
        Runtime runtime = Runtime.getRuntime();
        int exitval;

        p=runtime.exec(cmd);
        boolean waiting=true;
        while (waiting) {
            try {
                p.waitFor();
                waiting = false;
            } catch (InterruptedException e) {
                //Ignore interrupts while waiting for program to finish executing
            }
        }
        exitval=p.exitValue();

        //When finished with runtime.exec some Android devices don't close the connection to stdin, stdout, and stderr if not explicitly destroyed
        p.destroy();

        return exitval;
    }
    private int execWithWait(String[] cmd) throws Exception {
        Process p;
        Runtime runtime = Runtime.getRuntime();
        int exitval;

        p=runtime.exec(cmd);
        boolean waiting=true;
        while (waiting) {
            try {
                p.waitFor();
                waiting = false;
            } catch (InterruptedException e) {
                //Ignore interrupts while waiting for program to finish executing
            }
        }
        exitval=p.exitValue();

        //When finished with runtime.exec some Android devices don't close the connection to stdin, stdout, and stderr if not explicitly destroyed
        p.destroy();

        return exitval;
    }

    @Override
    public void run() {
        //Log.println(Log.INFO, AppName, "system directory=" + getSystemFolder() + " , internal storage=" + getInternalStorageFolder() + " external=" + getExternalStorageFolder());
        Log.println(Log.INFO, "RunServerServices", "run(): Waiting for extract");
        while (!getQuit()) {
            //Wait for assets to be extracted
            if (getIsExtracted()) {
                break;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Log.println(Log.INFO, "RunServerServices", "run(): Server thread has been interrupted");
            }
        }
        Log.println(Log.INFO, "RunServerServices", "run(): Starting services");
        setProgressNotificationText("Starting Web Server Services");
        while (!getQuit()) {
            //Keep the services running
            if (Application.getInstance().getLighttpdServerEnabled()) {
                if (!getBoolIsLighttpdRunning() && getLighttpdOverrideState()) {
                    startLighttpd();
                    startphp();
                    changeServiceSettingsLighttpdCheckbox(true);
                } else if (getBoolIsLighttpdRunning() && !getLighttpdOverrideState()) {
                    stopLighttpd();
                    stopphp();
                    changeServiceSettingsLighttpdCheckbox(false);
                }
            }
            if (Application.getInstance().getMySQLEnabled()) {
                if (!getBoolIsMySQLRunning() && getMySQLOverrideState()) {
                    startmysql();
                    bootstrap_mysql();
                    changeServiceSettingsMySQLCheckbox(true);
                } else if (getBoolIsMySQLRunning() && !getMySQLOverrideState()) {
                    stopmysql();
                    changeServiceSettingsMySQLCheckbox(false);
                }
            }
            final ProgressPage progressPage=getProgressPage();
            if (progressPage!=null) {
                Log.println(Log.INFO, "WebServer", "run(): Completing progress page");
                progressPage.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        progressPage.onComplete();
                        setProgressPage(null);
                    }
                });
            }
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                Log.println(Log.INFO, "RunServerServices", "run(): Server thread has been interrupted");
            }
        }
        Log.println(Log.INFO, "RunServerServices", "run(): Stopping services");
        stopServices();
    }
    public synchronized ProgressPage getProgressPage() {
        return this.progressPage;
    }
    public synchronized void setProgressPage(ProgressPage progressPage) {
        this.progressPage=progressPage;
    }
    /*public synchronized void setServiceSettings(ServiceSettings serviceSettings) {
        this.serviceSettings=serviceSettings;
    }*/
    private synchronized void setProgressNotificationText(String text) {
        final String localText=text;
        final ProgressPage progressPage=getProgressPage();
        if (progressPage!=null) {
            progressPage.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    progressPage.changeNotificationText(localText);
                    progressPage.disablePercentageText();
                }
            });
        }
    }
    public void stopWebServer() {
        setQuit(true);

        //Interrupt the main loop
        Log.println(Log.INFO, "WebServer", "stopWebServer(): Interrupting server thread");
        interrupt();

        //Wait for the thread to exit
        try {
            Log.println(Log.INFO, "WebServer", "stopWebServer(): Waiting for server thread to exit");
            join();
        } catch (InterruptedException e) {
            //Do nothing
        }
    }
    public synchronized void overrideLighttpdState(boolean start) {
        this.overrideLighttpdState=start;
        interrupt();
    }
    private synchronized boolean getLighttpdOverrideState() {
        return this.overrideLighttpdState;
    }
    private synchronized void changeServiceSettingsLighttpdCheckbox(boolean checked) {
        /*if (serviceSettings==null) {
            return;
        }
        final boolean localChecked=checked;
        serviceSettings.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                serviceSettings.changeLighttpdCheckbox(localChecked, false);
            }
        });*/
    }
    public synchronized void overrideMySQLState(boolean start) {
        this.overrideMySQLState=start;
        interrupt();
    }
    private synchronized boolean getMySQLOverrideState() {
        return this.overrideMySQLState;
    }
    private synchronized void changeServiceSettingsMySQLCheckbox(boolean checked) {
        /*if (serviceSettings==null) {
            return;
        }
        final boolean localChecked=checked;
        serviceSettings.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                serviceSettings.changeMySQLCheckbox(localChecked, false);
            }
        });*/
    }
    //Returns true if Web Server assets are extracted or false otherwise
    public synchronized boolean  areWebServerAssetsExtracted() {
        AssetManager assetManager = context.getAssets();
        String appassetsversion, dataversion;

        try {
            assetsversionfile = assetManager.open(ASSETSVERSIONFILENAME);
            assetsversionfile.mark(2048);
            appassetsversion = getFileVersion(assetsversionfile);

            try {
                InputStream dataversionfile = new FileInputStream(new File(getInternalStorageFolder() + "/" + ASSETSVERSIONFILENAME));
                dataversion = getFileVersion(dataversionfile);
                if (appassetsversion.equals(dataversion)) {
                    Log.println(Log.INFO, "WebServer", "Latest assets have already been extracted");
                    return true;
                }
            } catch (FileNotFoundException e) {
                //Ignore this error for now
                Log.println(Log.INFO, "WebServer", "Failed to access file: " + getInternalStorageFolder() + "/" + ASSETSVERSIONFILENAME);
            }
            return false;
        } catch (IOException e) {
            //Ignore this error for now and go on to the next check
            Log.println(Log.INFO, "WebServer", "Failed to access asset: " + ASSETSVERSIONFILENAME);
            //return false;
        }
        return false;
    }
    //Get the version String from a file
    //Returns the version or empty string otherwise
    String getFileVersion(InputStream versionfile) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(versionfile, "UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
                if (line.charAt(0) == '#') {
                    continue;
                }
                String parts[] = line.split("=");
                if (parts[0].equals("ZIPVERSION")) {
                    return parts[1];
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }
    //After starting MySQL for the first time, it needs some tables added
    public void bootstrap_mysql() {
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " bootstrap_mysql");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void startServices() {
        Log.println(Log.INFO, "WebServer", "Starting all services");
        setProgressNotificationText("Starting all web server services");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " start_all");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void startLighttpd() {
        Log.println(Log.INFO, "WebServer", "Starting lighttpd");
        setProgressNotificationText("Starting Lighttpd");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " start_lighttpd");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void startphp() {
        Log.println(Log.INFO, "WebServer", "Starting php");
        setProgressNotificationText("Starting PHP");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " start_php");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void startmysql() {
        Log.println(Log.INFO, "WebServer", "Starting mysql");
        setProgressNotificationText("Starting MySQL and checking database");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " start_mysql");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void stopServices() {
        setProgressNotificationText("Stopping all web server services");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " stop_all");
        } catch (Exception e) {
            e.printStackTrace();
        }
        Log.println(Log.INFO, "WebServer", "All services have been stopped");
    }
    public void stopLighttpd() {
        Log.println(Log.INFO, "WebServer", "Stopping lighttpd");
        setProgressNotificationText("Stopping Lighttpd");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " stop_lighttpd");
        } catch (Exception e) {
            e.printStackTrace();
        }
        Log.println(Log.INFO, "WebServer", "Lighttpd has been stopped");
    }
    public void stopphp() {
        Log.println(Log.INFO, "WebServer", "Stopping php");
        setProgressNotificationText("Stopping PHP");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " stop_php");
        } catch (Exception e) {
            e.printStackTrace();
        }
        Log.println(Log.INFO, "WebServer", "php has been stopped");
    }
    public void stopmysql() {
        Log.println(Log.INFO, "WebServer", "Stopping mysql");
        setProgressNotificationText("Stopping MySQL");
        try {
            execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " stop_mysql");
        } catch (Exception e) {
            e.printStackTrace();
        }
        Log.println(Log.INFO, "WebServer", "mysql has been stopped");
    }
    public synchronized void setIsExtracted(boolean val) {
        isExtracted=val;
    }
    public synchronized boolean getIsExtracted() {
        return isExtracted;
    }
    public synchronized int getIsLighttpdRunning() {
        try {
            String cmd[]={ getSystemFolder() + "/bin/sh", getInternalStorageFolder() + "/scripts/manage_services.sh", getSystemFolder(), getInternalStorageFolder(), "is_running_lighttpd" };
            int exitval=execWithWait(cmd);
            if (exitval==0) {
                return 1;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
        return 0;
    }
    public synchronized int getIsPHPRunning() {
        try {
            int exitval=execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " is_running_php");
            if (exitval==0) {
                return 1;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
        return 0;
    }
    public synchronized int getIsMySQLRunning() {
        try {
            int exitval=execWithWait(getSystemFolder() + "/bin/sh " + getInternalStorageFolder() + "/scripts/manage_services.sh " + getSystemFolder() + " " + getInternalStorageFolder() + " is_running_mysql");
            if (exitval==0) {
                return 1;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
        return 0;
    }
    public synchronized boolean getBoolIsLighttpdRunning() {
        int lighttpdRunning, phpRunning;

        lighttpdRunning=getIsLighttpdRunning();
        phpRunning=getIsPHPRunning();
        if (lighttpdRunning==1 && phpRunning==1) {
            return true;
        }
        return false;
    }
    public synchronized boolean getBoolIsMySQLRunning() {
        if (getIsMySQLRunning()==1) {
            return true;
        }
        return false;
    }
    public synchronized void setQuit(boolean val) {
        quit=val;
    }
    public synchronized boolean getQuit() {
        return quit;
    }
}
