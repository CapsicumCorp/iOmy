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

package com.capsicumcorp.iomy.apps.iomy;

import android.app.NotificationManager;
import android.content.Context;
import android.content.res.AssetManager;
import android.os.Environment;
import android.support.annotation.IntegerRes;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

//TODO: Migrate to AsyncTask or one of the other Android methods of Thread operations
public class ExtractServerServices extends Thread {
    private String SystemDirectory;
    private String CHANGE_PERMISSION;
    private String INTERNAL_LOCATION = null;
    public static final String EXTERNAL_STORAGE = Environment.getExternalStorageDirectory().getPath(); //For debugging
    public static final String ASSETSFILENAME = "webserverassets.zip";
    public static final String ASSETSNUMFILESFILENAME = "webserverassetsnumfiles.txt";
    public static final String ASSETSVERSIONFILENAME = "webserverassetsversion.txt";
    private final Context context;

    private boolean isExtracted=false;
    private boolean quit=false;
    private boolean runServerServices=false; //If true the service services will be started by this class after extracting the files

    private InputStream assetsversionfile;

    private ProgressPage progressPage;

    ExtractServerServices(Context context, String SystemDirectory, String StorageFolderName) {
        this.context = context;
        this.progressPage=null;
        this.SystemDirectory = SystemDirectory;
        this.CHANGE_PERMISSION = SystemDirectory + "/bin/chmod 755 ";
        this.INTERNAL_LOCATION=StorageFolderName;
    }

    public synchronized void setProgressPage(ProgressPage progressPage) {
        this.progressPage=progressPage;
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
        //Log.println(Log.INFO, "WebServer", "system directory=" + SystemDirectory + " , internal storage=" + context.getFilesDir().getPath());
        if (!areWebServerAssetsExtracted()) {
            if (!extractAssets()) {
                NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(Application.getInstance())
                        .setContentTitle(Application.getInstance().getAppName()+" Extract Error")
                        .setContentText("Failed to extract the Web Server assets")
                        .setSmallIcon(android.R.drawable.stat_notify_error);

                // Sets an ID for the notification
                int mNotificationId = 11;
                // Gets an instance of the NotificationManager service
                NotificationManager mNotifyMgr = (NotificationManager) progressPage.getSystemService(progressPage.NOTIFICATION_SERVICE);
                // Builds the notification and issues it.
                mNotifyMgr.notify(mNotificationId, mBuilder.build());

                // Close the activity
                progressPage.finish();

                return;
            }
        }

        setPermissions();
        setConfigsFromTemplates();

        Log.println(Log.INFO, "WebServer", "Extract complete");

        if (runServerServices) {
            Log.println(Log.INFO, "WebServer", "About to run server services");
            Application.getInstance().runServerServices.interrupt();

            //Only run the server services once per request
            setRunServerServices(false);
        } else {
            progressPage.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    progressPage.onComplete();
                }
            });
        }
    }

    public synchronized void setRunServerServices(boolean runServerServices) {
        this.runServerServices=runServerServices;
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
                InputStream dataversionfile = new FileInputStream(new File(INTERNAL_LOCATION + "/" + ASSETSVERSIONFILENAME));
                dataversion = getFileVersion(dataversionfile);
                if (appassetsversion.equals(dataversion)) {
                    Log.println(Log.INFO, "WebServer", "Latest assets have already been extracted");
                    return true;
                }
            } catch (FileNotFoundException e) {
                //Ignore this error for now
                Log.println(Log.INFO, "WebServer", "Failed to access file: " + INTERNAL_LOCATION + "/" + ASSETSVERSIONFILENAME);
            }
            return false;
        } catch (IOException e) {
            //Ignore this error for now and go on to the next check
            Log.println(Log.INFO, "WebServer", "Failed to access asset: " + ASSETSVERSIONFILENAME);
            //return false;
        }
        return false;
    }
    //Returns true if okay to run services or false if there was an error
    public boolean extractAssets() {
        String[] skipextracts; //Some files/folders contain user-modified data so shouldn't normally be replaced during asset updating
        boolean[] doskipextracts; //Only skip if the file/folder already exists
        AssetManager assetManager = context.getAssets();

        skipextracts=new String[1];
        doskipextracts=new boolean[1];
        skipextracts[0]="components/mysql/sbin/data";

        //Get number of files
        try {
            InputStream assetsnumfilesstream;

            assetsnumfilesstream = assetManager.open(ASSETSNUMFILESFILENAME);
            assetsnumfilesstream.mark(2048);
            String numFilesStr = getNumFiles(assetsnumfilesstream);
            if (!numFilesStr.equals("")) {
                try {
                    int numfiles = Integer.parseInt(numFilesStr);
                    progressPage.setTotalRequests(numfiles);
                } catch (Exception e) {
                    //Do nothing
                }
            }
        } catch (IOException e) {
            //Do nothing
        }
        //Extract the web server assets
        ZipInputStream zipInputStream = null;
        try {
            zipInputStream = new ZipInputStream(assetManager.open(ASSETSFILENAME));
        } catch (IOException e) {
            Log.println(Log.INFO, "WebServer", "Failed to access asset: " + ASSETSFILENAME);
            return false;
        }
        Log.println(Log.INFO, "WebServer", "Extracting asset: " + ASSETSFILENAME);
        try {
            ZipEntry zipEntry;
            FileOutputStream fout;
            for (int i=0; i<skipextracts.length; i++) {
                File file=new File(INTERNAL_LOCATION + "/" + skipextracts[i]);
                if (file.exists()) {
                    //Only skip if the file exists
                    doskipextracts[i] = true;
                } else {
                    doskipextracts[i] = false;
                }
            }
            while ((zipEntry = zipInputStream.getNextEntry()) != null) {
                boolean skip=false;
                final String zipEntryName=zipEntry.getName();
                doNotification("Extracting file: " + zipEntryName);
                //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Extracting file: "+zipEntryName);
                for(int i=0; i<skipextracts.length; i++) {
                    if (doskipextracts[i]) {
                        if (zipEntry.getName().startsWith(skipextracts[i])) {
                            skip = true;
                            doNotification("Skipping file: " + zipEntryName);
                            //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Skipping file: " + zipEntry.getName() + " in assets.zip as it already exists");
                            break;
                        }
                    }
                }
                if (skip) {
                    changeProgressPagePercentageText();
                    continue;
                }
                if (zipEntry.isDirectory()) {
                    createDirectory(zipEntry.getName());
                } else {
                    fout = new FileOutputStream(INTERNAL_LOCATION + "/" + zipEntryName);
                    byte[] buffer = new byte[4096 * 10];
                    int length;
                    while ((length = zipInputStream.read(buffer)) != -1) {
                        fout.write(buffer, 0, length);
                    }
                    zipInputStream.closeEntry();
                    fout.close();
                }
                changeProgressPagePercentageText();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        try {
            File dataversionoutfile = new File(INTERNAL_LOCATION + "/" + ASSETSVERSIONFILENAME);
            if (!dataversionoutfile.exists()) {
                dataversionoutfile.createNewFile();
            }
            assetsversionfile.reset();
            copyFile(assetsversionfile, new FileOutputStream(dataversionoutfile));
        } catch (Exception e) {
            Log.println(Log.INFO, "WebServer", "Unable to copy assets version file to local storage");

            //Return true here as it should still be possible to run the services
            return true;
        }
        return true;
    }
    private void doNotification(final String message) {
        progressPage.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                progressPage.changeNotificationText(message);
            }
        });
    }
    private void changeProgressPagePercentageText() {
        progressPage.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                progressPage.changePercentageText();
            }
        });
    }
    /**
     * Responsible for creating directory inside application's data directory
     *
     * @param dirName Directory to create during extracting
     */
    protected void createDirectory(String dirName) {
        File file = new File(INTERNAL_LOCATION + "/" + dirName);
        if (!file.isDirectory()) file.mkdirs();
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
    //Get the NUMFILES String from a file
    //Returns the number of files or empty string otherwise
    String getNumFiles(InputStream numfilesfile) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(numfilesfile, "UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
                if (line.charAt(0) == '#') {
                    continue;
                }
                String parts[] = line.split("=");
                if (parts[0].equals("NUMFILES")) {
                    return parts[1];
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private void copyFile(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[1024];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
    }

    //Set the permissions of all the service programs
    public void setPermissions() {
        try {
            execWithWait(CHANGE_PERMISSION + INTERNAL_LOCATION + "/scripts/set_permissions.sh");
            execWithWait(SystemDirectory + "/bin/sh " + INTERNAL_LOCATION + "/scripts/set_permissions.sh " + INTERNAL_LOCATION);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public void setConfigsFromTemplates() {
        try {
            execWithWait(SystemDirectory + "/bin/sh " + INTERNAL_LOCATION + "/scripts/manage_services.sh " + SystemDirectory + " " + INTERNAL_LOCATION + " template_to_conf_lighttpd 8080 ioMy Web Server");
            execWithWait(SystemDirectory + "/bin/sh " + INTERNAL_LOCATION + "/scripts/manage_services.sh " + SystemDirectory + " " + INTERNAL_LOCATION + " template_to_conf_php 128M Australia/Brisbane");
            execWithWait(SystemDirectory + "/bin/sh " + INTERNAL_LOCATION + "/scripts/manage_services.sh " + SystemDirectory + " " + INTERNAL_LOCATION + " template_to_conf_mysql 3306");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public synchronized void setIsExtracted(boolean val) {
        isExtracted=val;
    }
    public synchronized boolean getIsExtracted() {
        return isExtracted;
    }
    public synchronized void setQuit(boolean val) {
        quit=val;
    }
    public synchronized boolean getQuit() {
        return quit;
    }
}
