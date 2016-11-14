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

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.MenuItem;
import android.view.View;
import android.webkit.HttpAuthHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * IOMy Web View Activity displays the app itself. The main app interface was created using OpenUI5,
 * which makes use of Javascript and jQuery, HTML, and CSS.
 */
public class IOMy extends AppCompatActivity
    implements NavigationView.OnNavigationItemSelectedListener {

    private int menuItemId=-1;

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
        // DO NOTHING
    }

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
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
        iomy.setWebViewClient(new WebViewClient() {});
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
        }
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout_iomy);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }
}
