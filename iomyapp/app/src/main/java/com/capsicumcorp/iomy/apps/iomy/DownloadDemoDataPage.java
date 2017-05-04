/*
Title: Download demo data from a web url
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Downloads the demo data from a web url while displaying progress to the user
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.
 */

package com.capsicumcorp.iomy.apps.iomy;

import android.app.NotificationManager;
import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

public class DownloadDemoDataPage extends ProgressPageWithCustomPercentage {
    private DownloadDemoDataPage localme;
    private Application application;

    // In between base_url and filename_url we will put the app version so downloaded demo data
    // is for the current app version name
    private final String baseUrl = "https://downloaddemodata.iomy.org/AY935cdV8KGJz6ueKgF4qwWBb92n57uYQP253adx/rp78PrkZ7jPfD892bBnZQWfsu32NUUz77d58Nk9V/8sJFd62653wWzT2SZdnj657LrgpnfvJ3UGPh4VG2/";
    private final String filenameUrl = "webservermysqldemodatabase.zip";
    private final String fileinfoFilenameUrl = "webservermysqldemodatabasefileinfo.txt";

    private String fullFilenameUrl;
    private String fullFileInfoFilenameUrl;

    private String outputFilename;
    private String outputFileInfoFilename;
    private String demodataDownloadedFilename;

    private int currentDownloadTask;
    private final int DOWNLOAD_TASK_DEMODATAFILEINFO=1;
    private final int DOWNLOAD_TASK_DEMODATA=2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.downloadDemoDataTitle);
        this.downloadFile();
    }

    private void downloadFile() {
        me=localme=this;
        application=Application.getInstance();

        fullFilenameUrl = baseUrl + Application.getInstance().getCurrentAppVersionName() + "/" + filenameUrl;
        fullFileInfoFilenameUrl = baseUrl + Application.getInstance().getCurrentAppVersionName() + "/" + fileinfoFilenameUrl;

        outputFilename=Application.getInstance().getInternalStorageFolderName() + "/" + "webservermysqldemodatabase.zip";
        outputFileInfoFilename=Application.getInstance().getInternalStorageFolderName() + "/" + "webservermysqldemodatabasefileinfo.txt";
        demodataDownloadedFilename=Application.getInstance().getInternalStorageFolderName() + "/" + "webservermysqldemodatabase.downloaded";

        File demodataDownloadedFile=new File(demodataDownloadedFilename);
        if (demodataDownloadedFile.exists()) {
            //Demo data is already downloaded
            me.finish();
        } else {
            currentDownloadTask = DOWNLOAD_TASK_DEMODATAFILEINFO;
            new DownloadFileFromURL().execute(fullFileInfoFilenameUrl);
        }
    }

    private synchronized void downloadFailureNotice() {
        NotificationCompat.Builder b = new NotificationCompat.Builder(Application.getInstance().getApplicationContext())
                .setSmallIcon(android.R.drawable.stat_notify_error)
                .setContentTitle("iOmy")
                .setContentText("Failed to download demo data");
        NotificationManager notificationManager = (NotificationManager) Application.getInstance().getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(2, b.build());
    }

    /**
     * Background Async Task to download file
     * */
    class DownloadFileFromURL extends AsyncTask<String, Long, Integer> {

        /**
         * Before starting background thread
         * Show Progress Bar Dialog
         * */
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            if (currentDownloadTask==DOWNLOAD_TASK_DEMODATAFILEINFO) {
                localme.changeNotificationText("Downloading demo data file info");
            } else if (currentDownloadTask==DOWNLOAD_TASK_DEMODATA) {
                localme.changeNotificationText("Downloading demo data");
            }
        }

        /**
         * Downloading file in background thread
         * */
        @Override
        protected Integer doInBackground(String... f_url) {
            int count;
            Log.println(Log.INFO, application.getAppName(), "Downloading "+f_url[0]);
            try {
                URL url = new URL(f_url[0]);
                URLConnection conection = url.openConnection();
                conection.connect();
                // this will be useful so that you can show a tipical 0-100% progress bar
                int lengthOfFile = conection.getContentLength();

                // download the file
                InputStream input = new BufferedInputStream(url.openStream(), 8192);

                // Output stream
                OutputStream output;
                if (currentDownloadTask==DOWNLOAD_TASK_DEMODATAFILEINFO) {
                    output = new FileOutputStream(outputFileInfoFilename);
                } else {
                    output = new FileOutputStream(outputFilename);
                }
                byte data[] = new byte[1024];

                long total = 0;
                localme.setTotalRequests(lengthOfFile);

                while ((count = input.read(data)) != -1) {
                    total += count;
                    // publishing the progress....
                    // After this onProgressUpdate will be called
                    publishProgress((long)(total));

                    // writing data to file
                    output.write(data, 0, count);
                }

                // flushing output
                output.flush();

                // closing streams
                output.close();
                input.close();

            } catch (Exception e) {
                e.printStackTrace();
                Log.e("Error: ", e.getMessage());
                return -1;
            }

            return 0;
        }

        /**
         * Updating progress bar
         * */
        protected void onProgressUpdate(Long... progress) {
            // setting progress percentage
            localme.updatePercentageCounter(progress[0].longValue());
            localme.updatePercentageText();
        }

        /**
         * After completing background task
         * Dismiss the progress dialog
         * **/
        @Override
        protected void onPostExecute(Integer result) {
            if (result!=0) {
                Log.println(Log.INFO, application.getAppName(), "Failed to download demo data");
                localme.downloadFailureNotice();
                localme.finish();
            } else {
                if (currentDownloadTask == DOWNLOAD_TASK_DEMODATAFILEINFO) {
                    currentDownloadTask = DOWNLOAD_TASK_DEMODATA;
                    new DownloadFileFromURL().execute(fullFilenameUrl);
                } else {
                    File demodataDownloadedFile=new File(demodataDownloadedFilename);
                    try {
                        demodataDownloadedFile.createNewFile();
                    } catch (IOException e) {
                        // Do nothing
                    }
                    localme.onComplete();
                }
            }
        }

    }
}
