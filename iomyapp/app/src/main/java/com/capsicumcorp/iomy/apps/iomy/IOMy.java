/*
Title: IOMy Activity Class
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Java backend for the iOmy Webview Activity.
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

import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.webkit.HttpAuthHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

/**
 * IOMy Web View Activity displays the app itself. The main app interface was created using OpenUI5,
 * which makes use of Javascript and jQuery, HTML, and CSS.
 */
public class IOMy extends AppCompatActivity
    implements NavigationView.OnNavigationItemSelectedListener {

    private int menuItemId=-1;
    private IOMy me;

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        WebView iomy = (WebView) findViewById(R.id.iomy_view);
        iomy.saveState(outState);
    }

    /**
     * The back functionality should be disabled
     */
    @Override
    public void onBackPressed() {
        //----------------------------------------------------------------------------//
        // Create an alert dialog box
        //----------------------------------------------------------------------------//
        AlertDialog.Builder confirmationDialogBuilder = new AlertDialog.Builder(this);

        //----------------------------------------------------------------------------//
        // Set the properties
        //----------------------------------------------------------------------------//
        //confirmationDialogBuilder.setTitle("Are you sure you want to exit iOmy?");
        confirmationDialogBuilder.setMessage("Are you sure you want to exit iOmy?");
        confirmationDialogBuilder.setPositiveButton("Yes",
            new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog,
                                    int id) {
                    // Close iOmy
                    finishAffinity();
                    System.exit(0);
                }
            }
        );
        confirmationDialogBuilder.setNegativeButton("No",
            new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog,
                                    int id) {
                    dialog.cancel();
                }
            }
        );

        //----------------------------------------------------------------------------//
        // Make the dialog appear
        //----------------------------------------------------------------------------//
        AlertDialog confirmationDialog = confirmationDialogBuilder.create();
        confirmationDialog.show();
    }

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        me = this;

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_iomy);

        Toolbar toolbar = (Toolbar) findViewById(R.id.app_bar_toolbar);
        toolbar.setTitle(R.string.app_name);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
        getSupportActionBar().hide();

        final NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view_iomy);
        navigationView.setNavigationItemSelectedListener(this);

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout_iomy);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close) {
            public void onDrawerClosed(View view) {
                super.onDrawerClosed(view);
                if (menuItemId!=-1) {
                    navigationView.getMenu().findItem(menuItemId).setChecked(false);
                    menuItemId = -1;
                }
            }
        };
        drawer.setDrawerListener(toggle);
        toggle.syncState();

        // Configure the webview widget to use JavaScript (ESSENTIAL!)
        WebView iomy = (WebView) findViewById(R.id.iomy_view);
        WebSettings iomySettings = iomy.getSettings();
        iomySettings.setJavaScriptEnabled(true);
        iomySettings.setAppCacheEnabled(false);

        // Enable debugging on the webview.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) {
                WebView.setWebContentsDebuggingEnabled(true);
            }
        }

        // Enable launching external apps after an AJAX request.
        iomySettings.setJavaScriptCanOpenWindowsAutomatically(true);
        iomy.setWebViewClient(new WebViewClient() {

            //------------------------------------------------------------------------------------//
            // Give custom functionality to handle URLs with rtsp:// protocol
            //------------------------------------------------------------------------------------//
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Boolean takeOver = false;       //-- Flag that indicates whether the WebView handles the URL, or if iOmy has to seize control.

                // If the URL uses the rtsp protocol, launch the default program to stream your onvif cameras.
                if (url.startsWith("rtsp://")) {
                    takeOver = true;

                    Uri videoStreamUrl = Uri.parse(url);

                    //----------------------------------------------------------------------------//
                    // Create the intents
                    //----------------------------------------------------------------------------//
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setType("video/H264");
                    intent.setData(videoStreamUrl);

                    // Obtain the title for the Onvif stream app chooser.
                    String title = getResources().getString(R.string.app_chooser_rtsp_title);
                    // Show the chooser
                    Intent chooser = Intent.createChooser(intent, title);

                    //----------------------------------------------------------------------------//
                    // Verify the intent will resolve to at least one activity
                    //----------------------------------------------------------------------------//
                    if (intent.resolveActivity(getPackageManager()) != null) {
                        startActivity(chooser);

                    } else {
                        //----------------------------------------------------------------------------//
                        // Create an alert dialog box
                        //----------------------------------------------------------------------------//
                        AlertDialog.Builder confirmationDialogBuilder = new AlertDialog.Builder(me);

                        //----------------------------------------------------------------------------//
                        // Set the properties
                        //----------------------------------------------------------------------------//
                        confirmationDialogBuilder.setTitle("No suitable app found");
                        confirmationDialogBuilder.setMessage("To view a live stream of this device, you will need an app installed on your phone that can access live feeds. VLC is able to view live streams.");
                        confirmationDialogBuilder.setNegativeButton("OK",
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog,
                                                        int id) {
                                        dialog.cancel();
                                    }
                                }
                        );

                        //----------------------------------------------------------------------------//
                        // Make the dialog appear
                        //----------------------------------------------------------------------------//
                        AlertDialog confirmationDialog = confirmationDialogBuilder.create();
                        confirmationDialog.show();
                    }
                }

                return takeOver;
            }
        });

        if (savedInstanceState != null) {
            iomy.restoreState(savedInstanceState);
        } else {
            iomy.loadUrl("http://" + Constants.installWizard.hostname + ":"+Constants.installWizard.webserverport+"/ui/mobile/");
        }
    }
    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        menuItemId = item.getItemId();

        if (menuItemId == R.id.nav_settings) {
            Intent intent = new Intent(this, SettingsPage.class);
            this.startActivity(intent);
        } else if (menuItemId == R.id.nav_exit) {
            DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout_iomy);
            drawer.closeDrawer(GravityCompat.START);

            //Exit the app but only if the user says yes
            exitAppWithPrompt();
        }
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout_iomy);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    private void exitAppWithPrompt() {
        //----------------------------------------------------------------------------//
        // Create an alert dialog box
        //----------------------------------------------------------------------------//
        AlertDialog.Builder confirmationDialogBuilder = new AlertDialog.Builder(this);

        //----------------------------------------------------------------------------//
        // Set the properties
        //----------------------------------------------------------------------------//
        confirmationDialogBuilder.setMessage("Are you sure you want to exit iOmy?");
        confirmationDialogBuilder.setTitle("This will stop all iOmy monitoring on this device!");
        confirmationDialogBuilder.setPositiveButton("Yes",
                new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog,
                                        int id) {
                        //Shutdown background services
                        Application.getInstance().stopBackgroundService();

                        //Shutdown app
                        Application.getInstance().onServiceDestroy();
                    }
                }
        );
        confirmationDialogBuilder.setNegativeButton("No",
                new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog,
                                        int id) {
                        dialog.cancel();
                    }
                }
        );

        //----------------------------------------------------------------------------//
        // Make the dialog appear
        //----------------------------------------------------------------------------//
        AlertDialog confirmationDialog = confirmationDialogBuilder.create();
        confirmationDialog.show();
    }
}
