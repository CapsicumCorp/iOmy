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

import java.io.BufferedOutputStream;
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
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

//TODO: Migrate to AsyncTask or one of the other Android methods of Thread operations
public class ExtractServerServices extends Thread {
    private String SystemDirectory;
    private String CHANGE_PERMISSION;
    private String INTERNAL_LOCATION = null;
    private String EXTERNAL_STORAGE = null;
    private String databaseStorageLocation=null;

    public static final String ASSETSFILENAME = "webserverassets.zip";
    public static final String ASSETSFILEINFOFILENAME = "webserverassetsfileinfo.txt";
    public static final String ASSETSVERSIONFILENAME = "webserverassetsversion.txt";
    private final Context context;

    private boolean okayToExtract=false; //Only extract when it is confirmed to be okay
    private boolean isExtracted=false;
    private boolean quit=false;
    private boolean runServerServices=false; //If true the service services will be started by this class after extracting the files

    private InputStream assetsversionfile;

    private ProgressPageWithCustomPercentage progressPage;

    //It is okay if we don't always update the custom percentage count and actually trying to do
    //  all the updates in the ui thread will overload some devices so this allows skipping an
    //  update if one is already running
    private AtomicBoolean updatingCustomPercentage=new AtomicBoolean();

    private boolean isUpgrade=false; //If true, the extract is during an upgrade
    private Hashtable<String, Boolean> newfolders = new Hashtable<String, Boolean>();
    private Hashtable<String, Boolean> newfiles = new Hashtable<String, Boolean>();

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
    public synchronized void setProgressPage(ProgressPageWithCustomPercentage progressPage) {
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
            databaseStorageLocation=Settings.getDatabaseStorageLocation(context);
            isUpgrade=false;
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
        long appassetsversion, dataversion;

        try {
            assetsversionfile = assetManager.open(ASSETSVERSIONFILENAME);
            assetsversionfile.mark(2048);
            appassetsversion = getFileVersion(assetsversionfile);

            try {
                InputStream dataversionfile = new FileInputStream(new File(INTERNAL_LOCATION + "/" + ASSETSVERSIONFILENAME));
                dataversion = getFileVersion(dataversionfile);
                if (appassetsversion==dataversion) {
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
        String[] zipFilename; //Array of zip filenames
        ZipInputStream[] zipFileStream; //Array of zip files to extract
        InputStream[] fileInfoStream; //Array of file info files that contain info about the zip files

        AssetManager assetManager = context.getAssets();
        long totalFileSize=0;

        if (!Application.getInstance().getInstallDemoData()) {
            // Zip files for non-demodata mode
            zipFilename=new String[1];
            zipFileStream=new ZipInputStream[1];
            fileInfoStream=new InputStream[1];
            try {
                zipFilename[0]=ASSETSFILENAME;
                zipFileStream[0]=new ZipInputStream(assetManager.open(ASSETSFILENAME));
                fileInfoStream[0]=assetManager.open(ASSETSFILEINFOFILENAME);
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            // Zip files for demodata mode
            zipFilename=new String[2];
            zipFileStream=new ZipInputStream[2];
            fileInfoStream=new InputStream[2];
            try {
                zipFilename[0]=ASSETSFILENAME;
                zipFileStream[0]=new ZipInputStream(assetManager.open(ASSETSFILENAME));
                fileInfoStream[0]=assetManager.open(ASSETSFILEINFOFILENAME);
                String demodataFilename=Application.getInstance().getCacheStorageFolderName() + "/" + "webservermysqldemodatabase.zip";
                String demodataFileInfoFilename=Application.getInstance().getCacheStorageFolderName() + "/" + "webservermysqldemodatabasefileinfo.txt";
                zipFilename[1]="webservermysqldemodatabase.zip";
                zipFileStream[1]=new ZipInputStream(new FileInputStream(new File(demodataFilename)));
                fileInfoStream[1]=new FileInputStream(new File(demodataFileInfoFilename));
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            }
        }
        //Get number of files
        totalFileSize=0;
        for (InputStream stream : fileInfoStream) {
            stream.mark(2048);
            String totalFileSizeStr = getZipTotalFileSize(stream);
            if (!totalFileSizeStr.equals("")) {
                try {
                    totalFileSize += Integer.parseInt(totalFileSizeStr);
                } catch (Exception e) {
                    //Do nothing
                }
            }
        }
        if (progressPage!=null) {
            progressPage.setTotalRequests(totalFileSize);
        }
        //Extract the web server assets
        int i;
        long curFileSize = 0;
        for (i=0; i<zipFileStream.length; ++i){
            Log.println(Log.INFO, "WebServer", "Extracting asset: " + zipFilename[i]);
            try {
                ZipEntry zipEntry;

                while ((zipEntry = zipFileStream[i].getNextEntry()) != null) {
                    String zipEntryName = zipEntry.getName();
                    long zipFileSize = zipEntry.getSize();

                    //newfiles and newfolders are populated by the doUpgrade script
                    if (isUpgrade) {
                        if (zipEntry.isDirectory()) {
                            if (!newfolders.containsKey(zipEntryName)) {
                                //Log.println(Log.INFO, "WebServer", "Skipping folder: " + zipEntryName);
                                doNotification("Skipping folder: " + zipEntryName);
                                zipFileStream[i].closeEntry();
                                curFileSize += zipFileSize;
                                changeProgressPagePercentageTextCustomCount(curFileSize);
                                continue;
                            }
                        } else {
                            if (!newfiles.containsKey(zipEntryName)) {
                                //Log.println(Log.INFO, "WebServer", "Skipping file: " + zipEntryName);
                                doNotification("Skipping file: " + zipEntryName);
                                zipFileStream[i].closeEntry();
                                curFileSize += zipFileSize;
                                changeProgressPagePercentageTextCustomCount(curFileSize);
                                continue;
                            }
                        }
                    }
                    //Select demo data if demo mode is enabled otherwise select normal data
                    if (Application.getInstance().getInstallDemoData()) {
                        //Skip extracting of normal data and extract demo data
                        if (zipEntryName.startsWith("components/mysql/sbin/data/")) {
                            //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Skipping file: " + zipEntryName);
                            doNotification("Skipping file: " + zipEntryName);
                            zipFileStream[i].closeEntry();
                            curFileSize += zipFileSize;
                            changeProgressPagePercentageTextCustomCount(curFileSize);
                            continue;
                        }
                        if (zipEntryName.startsWith("demodata/mysql_database/")) {
                            //Change the output folder name to components/mysql/sbin/data/
                            zipEntryName = zipEntryName.replace("demodata/mysql_database/", "components/mysql/sbin/data/");
                        } else if (zipEntryName.startsWith("demodata/website_config/")) {
                            //Change the output folder name to iomyweb/
                            zipEntryName = zipEntryName.replace("demodata/website_config/", "htdocs/restricted/config/");
                        }
                    } else {
                        //Skip extracting of demo data folder as we are in normal mode
                        if (zipEntryName.startsWith("demodata/")) {
                            //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Skipping file: " + zipEntryName);
                            doNotification("Skipping file: " + zipEntryName);
                            zipFileStream[i].closeEntry();
                            curFileSize += zipFileSize;
                            changeProgressPagePercentageTextCustomCount(curFileSize);
                            continue;
                        }
                    }
                    if (zipEntryName.equals(zipEntry.getName())) {
                        //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Extracting file: " + zipEntryName);
                        doNotification("Extracting file: " + zipEntryName);
                    } else {
                        //Log.println(Log.INFO, Application.getInstance().getAppName(), "SUPER DEBUG: Extracting file: " + zipEntry.getName() + " as " + zipEntryName);
                        doNotification("Extracting file: " + zipEntry.getName() + " as " + zipEntryName);
                    }
                    if (zipEntry.isDirectory()) {
                        createDirectory(zipEntryName);
                    } else {
                        //Using BufferedOutputStream reduces total extract time on slower devices by quite a lot compared
                        //  to writing direct to a FileOutputStream
                        BufferedOutputStream fout;
                        if (zipEntryName.startsWith("components/mysql/sbin/data/")) {
                            //Use the database storage location for the database files
                            fout=new BufferedOutputStream(new FileOutputStream(databaseStorageLocation + "/" + zipEntryName));
                            //Log.println(Log.INFO, "WebServer", "DEBUG Extracting file to: " + databaseStorageLocation + "/" + zipEntryName);
                        } else {
                            fout=new BufferedOutputStream(new FileOutputStream(INTERNAL_LOCATION + "/" + zipEntryName));
                        }
                        byte[] buffer = new byte[4096 * 10];
                        int length;
                        while ((length = zipFileStream[i].read(buffer)) != -1) {
                            fout.write(buffer, 0, length);
                            curFileSize += length;
                            changeProgressPagePercentageTextCustomCount(curFileSize);
                        }
                        fout.close();
                    }
                    zipFileStream[i].closeEntry();
                }
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
            //One last update to get to 100%
            changeProgressPagePercentageTextCustomCount(totalFileSize, true);
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

    // An upgrade script to migrate the web server files from to the current version
    // deletefile will delete a file
    // deletefolder will recursively delete everything in the folder
    // newfile The file is new and should be extracted
    // newfolder The folder is new and should be extracted
    // mkdir Create a new folder straight away (useful for movefile)
    // movefile The file will be moved from one filename path to a new filename path

    // folder names should have / at the end so extract can match it
    // You should include a newfolder entry for new folders so they will be created
    // Only put one space between parameters otherwise split won't work properly

    // An upgrade script will run for each incremental version upgrade until the current version
    //   is reached.
    // All delete and move operations will run as processed in order
    // newfolder and newfile instructions will be checked when the extract runs
    // When in upgrade mode, any folder/file that doesn't match newfolder/newfile won't be extracted
    private int doUpgrade() {
        AssetManager assetManager = context.getAssets();
        long appassetsversion, dataversion, upgradingversion;

        try {
            assetsversionfile = assetManager.open(ASSETSVERSIONFILENAME);
            assetsversionfile.mark(2048);
            appassetsversion = getFileVersion(assetsversionfile);

            try {
                InputStream dataversionfile = new FileInputStream(new File(getInternalStorageFolder() + "/" + ASSETSVERSIONFILENAME));
                dataversion = getFileVersion(dataversionfile);
            } catch (FileNotFoundException e) {
                //Ignore this error for now
                Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgradeFailed to access file: " + getInternalStorageFolder() + "/" + ASSETSVERSIONFILENAME);

                //Upgrade not needed as the files haven't been fully extracted
                return 0;
            }
        } catch (IOException e) {
            //Abort as we can't open the version filename asset from the app package
            Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Failed to access version filename from asset: " + ASSETSVERSIONFILENAME);
            return -1;
        }
        isUpgrade=true;
        newfolders.clear();
        newfiles.clear();
        for (upgradingversion=dataversion; upgradingversion<appassetsversion; upgradingversion++) {
            String upgradescriptname = "webserver_upgradescripts/webserver_upgrade_" + upgradingversion + "_to_" + (upgradingversion+1) + ".upgrade";

            Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Processing upgrade script: " + upgradescriptname);

            InputStream upgradeScriptStream;
            try {
                upgradeScriptStream = assetManager.open(upgradescriptname);
            } catch (IOException e) {
                Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Failed to access version upgrade script: " + upgradescriptname);
                return -3;
            }
            //Open the upgrade script and process its instructions
            //First count the number of operations for progress report
            int numoperations = 0;
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
                    if (!parts[0].equals("newfile") && !parts[0].equals("newfolder")) {
                        //Only add operations to progress bar that aren't queued for extracting
                        ++numoperations;
                    }
                }
                Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Num Operations=" + numoperations);
                upgradeScriptStream.reset();
            } catch (Exception e) {
                Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Error while processing upgrade script: " + upgradescriptname);
                e.printStackTrace();
                return -4;
            }
            if (progressPage != null) {
                progressPage.setTotalRequests(numoperations);
            }
            try {
                BufferedReader in = new BufferedReader(new InputStreamReader(upgradeScriptStream, "UTF-8"));
                String line;
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
                    // For now we update the log and notify even if the operation doesn't need to be done
                    // so the percentage count updates correctly
                    if (cmd.equals("mkdir")) {
                        String folder = parts[1];
                        String rootfolder = getFolderWithRootForPath(folder);
                        File rootFolderFile = new File(rootfolder);
                        Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Making folder: " + folder);
                        doNotification("Upgrading web server files: Making folder: " + folder);
                        if (!rootFolderFile.exists()) {
                            createDirectoryNew(rootfolder);
                        }
                    } else if (cmd.equals("movefile")) {
                        String srcfilename = parts[1];
                        String destfilename = parts[2];
                        File srcFile = new File(getFolderWithRootForPath(srcfilename));
                        File destFile = new File(getFolderWithRootForPath(destfilename));
                        Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Moving file from " + srcfilename + " to " + destfilename);
                        doNotification("Upgrading web server files: Moving file from " + srcfilename + " to " + destfilename);
                        if (srcFile.exists()) {
                            //Only move if the source file exists
                            if (destFile.exists()) {
                                //Fail if the destination already exists
                                throw new java.io.IOException(destFile + " exists");
                            }
                            srcFile.renameTo(destFile);
                        }
                    } else if (cmd.equals("deletefile")) {
                        String thefile = parts[1];
                        File deleteFile = new File(getFolderWithRootForPath(thefile));
                        Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Deleting file: " + thefile);
                        doNotification("Upgrading web server files: Deleting file: " + thefile);
                        if (deleteFile.exists()) {
                            deleteFile.delete();
                        }
                    } else if (cmd.equals("deletefolder")) {
                        String thefolder = parts[1];
                        File deleteFolderFile = new File(getFolderWithRootForPath(thefolder));
                        Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Deleting folder: " + thefolder);
                        doNotification("Upgrading web server files: Deleting folder: " + thefolder);
                        if (deleteFolderFile.exists()) {
                            recursiveDeleteDir(deleteFolderFile);
                        }
                    } else if (cmd.equals("newfile")) {
                        String newfilename = parts[1];
                        Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Adding new file to queue: " + newfilename);
                        newfiles.put(newfilename, true);
                    } else if (cmd.equals("newfolder")) {
                        String newfoldername = parts[1];
                        Log.println(Log.INFO, getApplication().getAppName(), "ExtractServerServices.doUpgrade(): Adding new folder to queue: " + newfoldername);
                        newfolders.put(newfoldername, true);
                    }
                    changeProgressPagePercentageText();
                }
            } catch (Exception e) {
                Log.println(Log.INFO, getApplication().getAppName(), "WebServer.doUpgrade(): Error while processing upgrade script: " + upgradescriptname + " " + e.getMessage());
                e.printStackTrace();
                return -4;
            }
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
    private void setNotUpdatingCustomPercentage() {
       updatingCustomPercentage.set(false);
    }
    private boolean setUpdatingCustomPercentageIfNotAlready() {
       if (updatingCustomPercentage.compareAndSet(false, true)) {
           return false;
       }
       return true;
    }
    private void changeProgressPagePercentageTextCustomCount(long count) {
        changeProgressPagePercentageTextCustomCount(count, false);
    }
    private void changeProgressPagePercentageTextCustomCount(long count, boolean noSkipUpdate) {
        final long localCount=count;
        if (progressPage == null) {
            return;
        }
        if (!setUpdatingCustomPercentageIfNotAlready() || noSkipUpdate) {
            //Only update the percentage text if not already updating or if no skip update has been requested
            progressPage.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    progressPage.updatePercentageCounter(localCount);
                    progressPage.updatePercentageText();
                    setNotUpdatingCustomPercentage();
                }
            });
        }
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
        File file;
        if (dirName.startsWith("components/mysql/sbin/data")) {
            //Use the database storage location for the database files
            file = new File(databaseStorageLocation + "/" + dirName);
        } else {
            file = new File(INTERNAL_LOCATION + "/" + dirName);
        }
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
    //Returns the version or -1 otherwise
    long getFileVersion(InputStream versionfile) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(versionfile, "UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
                if (line.charAt(0) == '#') {
                    continue;
                }
                String parts[] = line.split("=");
                if (parts[0].equals("ZIPVERSION")) {
                    return Long.parseLong(parts[1]);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1;
    }
    //Get the NUMFILES String from a file
    //Returns the number of files or empty string otherwise
    String getNumFiles(InputStream fileinfofile) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(fileinfofile, "UTF-8"));
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

    /**
     * Get the TOTALSIZE String from a file
     * @param fileinfofile The file to read from
     * @return Returns the total size value
     */
    //Returns the number of files or empty string otherwise
    String getZipTotalFileSize(InputStream fileinfofile) {
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(fileinfofile, "UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
                if (line.charAt(0) == '#') {
                    continue;
                }
                String parts[] = line.split("=");
                if (parts[0].equals("TOTALSIZE")) {
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
            execWithWait(SystemDirectory + "/bin/sh " + INTERNAL_LOCATION + "/scripts/manage_services.sh " + SystemDirectory + " " + INTERNAL_LOCATION + " template_to_conf_mysql 3306 "+databaseStorageLocation);
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
