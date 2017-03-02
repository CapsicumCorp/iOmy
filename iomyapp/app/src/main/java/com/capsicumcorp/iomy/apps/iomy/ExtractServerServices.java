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

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.os.Environment;
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
import java.util.Hashtable;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

//TODO: Migrate to AsyncTask or one of the other Android methods of Thread operations
public class ExtractServerServices extends Thread {
    private String SystemDirectory;
    private String CHANGE_PERMISSION;
    private String INTERNAL_LOCATION = null;
    private String EXTERNAL_STORAGE = null;
    public static final String ASSETSFILENAME = "webserverassets.zip";
    public static final String ASSETSNUMFILESFILENAME = "webserverassetsnumfiles.txt";
    public static final String ASSETSVERSIONFILENAME = "webserverassetsversion.txt";
    private final Context context;

    private boolean okayToExtract=false; //Only extract when it is confirmed to be okay
    private boolean isExtracted=false;
    private boolean quit=false;
    private boolean runServerServices=false; //If true the service services will be started by this class after extracting the files

    private InputStream assetsversionfile;

    private ProgressPage progressPage;

    private Hashtable<String, Boolean> skipfiles = new Hashtable<String, Boolean>();
    private Hashtable<String, Boolean> skipfolders = new Hashtable<String, Boolean>();
    private Hashtable<String, Boolean> skipfoldersifexist = new Hashtable<String, Boolean>();
    private Hashtable<String, Boolean> changedfiles = new Hashtable<String, Boolean>();

    ExtractServerServices(Context context, String SystemDirectory, String InternalStorageFolderName, String ExternalStorageFolderName) {
        this.context = context;
        this.progressPage=null;
        this.SystemDirectory = SystemDirectory;
        this.CHANGE_PERMISSION = SystemDirectory + "/bin/chmod 755 ";
        this.INTERNAL_LOCATION=InternalStorageFolderName;
        this.EXTERNAL_STORAGE=ExternalStorageFolderName;
    }
    private Application getApplication() {
        return Application.getInstance();
    }
    private String getSystemFolder() {
        return getApplication().getSystemDirectory();
    }
    private String getInternalStorageFolder() {
        return getApplication().getInternalStorageFolderName();
    }
    private String getExternalStorageFolder() {
        return getApplication().getExternalStorageFolderName();
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

    private void DoExtractErrorNotification(String errortype, String errormsg) {
        Notification mNotification = new NotificationCompat.Builder(context)
                .setContentTitle(getApplication().getAppName()+" "+errortype)
                .setContentText(errormsg)
                .setSmallIcon(android.R.drawable.stat_notify_error)
                .build();

        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.HONEYCOMB) {
            Intent intent = new Intent();
            PendingIntent contentIntent = PendingIntent.getActivity(context, 0, intent, 0);
            mNotification.contentIntent = contentIntent;
        }
        // Sets an ID for the notification
        int mNotificationId = 11;
        // Gets an instance of the NotificationManager service
        NotificationManager mNotifyMgr = (NotificationManager) context.getSystemService(context.NOTIFICATION_SERVICE);
        // Builds the notification and issues it.
        mNotifyMgr.notify(mNotificationId, mNotification);

        // Close the activity
        if (progressPage!=null) {
            progressPage.finish();
        }
    }

    //Threads can only be started once for a single instance so stay in a loop mostly sleeping
    //  so can be activated with an interrupt
    @Override
    public void run() {
        while (!getQuit()) {
            while (!getQuit() && !getOkayToExtract()) {
                try {
                    Thread.sleep(60000);
                } catch (InterruptedException e) {
                    Log.println(Log.INFO, "WebServer", "run(): Extract Server thread has been interrupted");
                }
            }
            if (getQuit()) {
                return;
            }
            //Log.println(Log.INFO, "WebServer", "system directory=" + SystemDirectory + " , internal storage=" + context.getFilesDir().getPath());
            if (!areWebServerAssetsExtracted()) {
                int upgraderesult = doUpgrade();
                if (upgraderesult < 0) {
                    DoExtractErrorNotification("Upgrade Error", "Failed to upgrade the Web Server files");
                    return;
                }
                if (!extractAssets()) {
                    DoExtractErrorNotification("Extract Error", "Failed to extract the Web Server assets");
                    return;
                }
            }

            setPermissions();
            setConfigsFromTemplates();

            Log.println(Log.INFO, "WebServer", "Extract complete");

            if (runServerServices) {
                Log.println(Log.INFO, "WebServer", "About to run server services");
                Application.getInstance().runServerServices.setOkayToRunServices(true);

                //Only run the server services once per request
                setRunServerServices(false);
            } else {
                if (progressPage != null) {
                    progressPage.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            progressPage.onComplete();
                        }
                    });
                }
            }
            //Only extract at certain times
            setOkayToExtract(false);
        }
    }
    public void stopThread() {
        setQuit(true);

        //Interrupt the main loop
        Log.println(Log.INFO, "WebServer", "stopThread(): Interrupting extract server thread");
        interrupt();

        //Wait for the thread to exit
        boolean waiting=true;
        while (waiting) {
            try {
                Log.println(Log.INFO, "WebServer", "stopThread(): Waiting for extract server thread to exit");
                join();
                waiting = false;
            } catch (InterruptedException e) {
                //Do nothing
            }
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
        AssetManager assetManager = context.getAssets();

        //Get number of files
        try {
            InputStream assetsnumfilesstream;

            assetsnumfilesstream = assetManager.open(ASSETSNUMFILESFILENAME);
            assetsnumfilesstream.mark(2048);
            String numFilesStr = getNumFiles(assetsnumfilesstream);
            if (!numFilesStr.equals("")) {
                try {
                    int numfiles = Integer.parseInt(numFilesStr);
                    if (progressPage!=null) {
                        progressPage.setTotalRequests(numfiles);
                    }
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

            while ((zipEntry = zipInputStream.getNextEntry()) != null) {
                final String zipEntryName=zipEntry.getName();
                boolean skipfile=false;

                //skipfiles and skipfolders are populated by the doUpgrade script
                Boolean reallySkipFile=skipfiles.get(zipEntryName);
                if (reallySkipFile!=null) {
                    //Log.println(Log.INFO, "WebServer", "Skipping file: " + zipEntryName);
                    doNotification("Skipping file: " + zipEntryName);
                    //Log.println(Log.INFO, "WebServer", "SUPER DEBUG: Skipping file: " + zipEntry.getName() + " in assets.zip as it already exists");
                    changeProgressPagePercentageText();
                    continue;
                }
                for (String key : skipfolders.keySet()) {
                    if (zipEntryName.startsWith(key)) {
                        skipfile=true;
                        //Log.println(Log.INFO, "WebServer", "Skipping folder: " + zipEntryName);
                        doNotification("Skipping folder: " + zipEntryName);
                        changeProgressPagePercentageText();
                        break;
                    }
                }
                if (skipfile) {
                    continue;
                }
                Boolean isChanged=changedfiles.get(zipEntryName);
                if (isChanged==null) {
                    for (String key : skipfoldersifexist.keySet()) {
                        if (zipEntryName.startsWith(key)) {
                            File skipFile = new File(getFolderWithRootForPath(zipEntryName));
                            if (skipFile.exists()) {
                                skipfile=true;
                                //Log.println(Log.INFO, "WebServer", "Skipping file: " + zipEntryName);
                                doNotification("Skipping file: " + zipEntryName);
                                changeProgressPagePercentageText();
                                break;
                            }
                        }
                    }
                }
                if (skipfile) {
                    continue;
                }
                //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Extracting file: "+zipEntryName);
                doNotification("Extracting file: " + zipEntryName);
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
    //Run an upgrade script if it is available and needed
    //Returns 0 if okay to do extract or negative value if extract should abort

    // An upgrade script to migrate the web server files from version 1 to version 2
    // skipfolderifexist skips files in that folder unless they don't exist
    // skipfile will always re-extract if the file doesn't exist
    // deletefolder will recursively delete everything in the folder
    // changedfile entries will override skipfolder entries
    // If a skipfile or changedfile is a folder, then add a / at the end so extract can match it
    // You should include a changedfile entry for new folders so they will be created
    // Only put one space between parameters otherwise split won't work properly
    private int doUpgrade() {
        AssetManager assetManager = context.getAssets();
        String appassetsversion, dataversion;

        try {
            assetsversionfile = assetManager.open(ASSETSVERSIONFILENAME);
            assetsversionfile.mark(2048);
            appassetsversion = getFileVersion(assetsversionfile);

            try {
                InputStream dataversionfile = new FileInputStream(new File(getInternalStorageFolder() + "/" + ASSETSVERSIONFILENAME));
                dataversion = getFileVersion(dataversionfile);
            } catch (FileNotFoundException e) {
                //Ignore this error for now
                Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgradeFailed to access file: " + getInternalStorageFolder() + "/" + ASSETSVERSIONFILENAME);

                //Upgrade not needed as the files have never been fully access
                return 0;
            }
        } catch (IOException e) {
            //Abort as we can't open the version filename asset from the app package
            Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Failed to access version filename from asset: " + ASSETSVERSIONFILENAME);
            return -1;
        }
        String upgradescriptname = "webserver_upgradescripts/webserver_upgrade_" + dataversion + "_to_" + appassetsversion + ".upgrade";

        //Log.println(Log.INFO, getApplication().getAppName(), "DEBUG: WebServer.doUpgrade(): Check upgrade script: " + upgradescriptname);

        InputStream upgradeScriptStream;
        try {
            upgradeScriptStream = assetManager.open(upgradescriptname);
        } catch (IOException e) {
            Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Failed to access version upgrade script: " + upgradescriptname);
            return -3;
        }
        //Open the upgrade script and process its instructions
        //First count the number of operations for progress report
        int numoperations=0;
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(upgradeScriptStream, "UTF-8"));
            String line;
            upgradeScriptStream.mark(32768);
            while ((line = in.readLine()) != null) {
                if (line.length() == 0) {
                    //Empty line
                    continue;
                }
                if (line.charAt(0) == '#' || line.charAt(0) == ';') {
                    //Comment
                    continue;
                }
                String parts[] = line.split(" ");
                if (parts.length == 0) {
                    //No parts found
                    continue;
                }
                ++numoperations;
            }
            Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Num Operations="+numoperations);
            upgradeScriptStream.reset();
        } catch (Exception e) {
            Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Error while processing upgrade script: " + upgradescriptname);
            e.printStackTrace();
            return -4;
        }
        if (progressPage!=null) {
            progressPage.setTotalRequests(numoperations);
        }
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(upgradeScriptStream, "UTF-8"));
            String line;
            skipfiles.clear();
            skipfolders.clear();
            skipfoldersifexist.clear();
            changedfiles.clear();
            while ((line = in.readLine()) != null) {
                if (line.length() == 0) {
                    //Empty line
                    continue;
                }
                if (line.charAt(0) == '#' || line.charAt(0) == ';') {
                    //Comment
                    continue;
                }
                String parts[] = line.split(" ");
                if (parts.length == 0) {
                    //No parts found
                    continue;
                }
                String cmd = parts[0];
                if (cmd.equals("mkdir")) {
                    String folder = parts[1];
                    String rootfolder=getFolderWithRootForPath(folder);
                    File rootFolderFile=new File(rootfolder);
                    if (!rootFolderFile.exists()) {
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Making folder: " + folder);
                        doNotification("Upgrading web server files: Making folder: " + folder);
                        createDirectoryNew(rootfolder);
                    }
                } else if (cmd.equals("movefile")) {
                    String srcfilename = parts[1];
                    String destfilename = parts[2];
                    File srcFile=new File(getFolderWithRootForPath(srcfilename));
                    File destFile=new File(getFolderWithRootForPath(destfilename));
                    if (srcFile.exists()) {
                        //Only move if the source file exists
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Moving file from " + srcfilename + " to " + destfilename);
                        doNotification("Upgrading web server files: Moving file from " + srcfilename + " to " + destfilename);
                        if (destFile.exists()) {
                            throw new java.io.IOException(destFile + " exists");
                        }
                        srcFile.renameTo(destFile);
                    }
                } else if (cmd.equals("deletefile")) {
                    String thefile = parts[1];
                    File deleteFile=new File(getFolderWithRootForPath(thefile));
                    if (deleteFile.exists()) {
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Deleting file: " + thefile);
                        doNotification("Upgrading web server files: Deleting file: " + thefile);
                        deleteFile.delete();
                    }
                } else if (cmd.equals("deletefolder")) {
                    String thefolder = parts[1];
                    File deleteFolderFile=new File(getFolderWithRootForPath(thefolder));
                    if (deleteFolderFile.exists()) {
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Deleting folder: " + thefolder);
                        doNotification("Upgrading web server files: Deleting folder: " + thefolder);
                        recursiveDeleteDir(deleteFolderFile);
                    }
                } else if (cmd.equals("skipfile" )) {
                    String skipfilename = parts[1];
                    File skipFile=new File(getFolderWithRootForPath(skipfilename));
                    if (skipFile.exists()) {
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Skipping file: " + skipfilename);
                        doNotification("Upgrading web server files: Skipping file: " + skipfilename);
                        skipfiles.put(skipfilename, true);
                    }
                } else if (cmd.equals("skipfolder" )) {
                    String skipfoldername = parts[1];
                    File skipFolderFile=new File(getFolderWithRootForPath(skipfoldername));
                    if (skipFolderFile.exists()) {
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Skipping folder: " + skipfoldername);
                        doNotification("Upgrading web server files: Skipping folder: " + skipfoldername);
                        skipfolders.put(skipfoldername, true);
                    }
                } else if (cmd.equals("skipfolderifexist" )) {
                    String skipfoldername = parts[1];
                    File skipFolderFile=new File(getFolderWithRootForPath(skipfoldername));
                    if (skipFolderFile.exists()) {
                        //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Skipping files if they exist in folder: " + skipfoldername);
                        doNotification("Upgrading web server files: Skipping files if they exist in folder: " + skipfoldername);
                        skipfoldersifexist.put(skipfoldername, true);
                    }
                } else if (cmd.equals("changedfile" )) {
                    String changedfile = parts[1];
                    //Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Not skipping file: " + changedfile);
                    doNotification("Upgrading web server files: Not skipping file: " + changedfile);
                    changedfiles.put(changedfile, true);
                }
                changeProgressPagePercentageText();
            }
        } catch (Exception e) {
            Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Error while processing upgrade script: " + upgradescriptname + " "+e.getMessage());
            e.printStackTrace();
            return -4;
        }
        return 0;
    }
    private void doNotification(final String message) {
        if (progressPage==null) {
            return;
        }
        progressPage.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                progressPage.changeNotificationText(message);
            }
        });
    }
    private void changeProgressPagePercentageText() {
        if (progressPage==null) {
            return;
        }
        progressPage.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                progressPage.changePercentageText();
            }
        });
    }
    //Return prefixed with the root folder for a given path
    private String getFolderWithRootForPath(String path) {
        String rootpath;
        rootpath=getInternalStorageFolder();

        return rootpath+"/"+path;
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

    //Create a directory anywhere
    private void createDirectoryNew(String dirName) {
        File file = new File(dirName);
        if (!file.isDirectory()) {
            file.mkdirs();
        }
    }
    //Recursively delete a folder
    private void recursiveDeleteDir(File file) {
        File[] contents = file.listFiles();
        if (contents != null) {
            for (File f : contents) {
                recursiveDeleteDir(f);
            }
        }
        file.delete();
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
    public synchronized void setOkayToExtract(boolean val) { okayToExtract=val; interrupt(); }
    public synchronized boolean getOkayToExtract() { return okayToExtract; }
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
