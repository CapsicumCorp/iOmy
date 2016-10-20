package com.capsicumcorp.iomy.apps.iomy;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

public class DatabaseProgressPage extends AppCompatActivity {
    protected InstallWizard installWizard = Constants.installWizard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_progress_page);
        this.setTitle(Titles.webserverDatabaseSetupTitle);
        this.startSettingUpDatabase();
    }

    private void startSettingUpDatabase() {
        final DatabaseProgressPage me = this;     // Captures this activity to be referenced in subroutines
        EditText tvSchema = (EditText) findViewById(R.id.dbSchema);
        String dbSchema = tvSchema.getText().toString();

        RequestQueue queue = Volley.newRequestQueue(this);
        String sUrl = installWizard.setupAPI;
        final TextView mTextView = new TextView(this);
        ViewGroup layout = (ViewGroup) findViewById(R.id.activity_start);
        layout.addView(mTextView);

        //TODO: Update this to be similar with DBSetupProgressPage code
        sUrl += "?Mode=02_NewSchema";
        sUrl += "&DBName="+dbSchema;

        StringRequest stringRequest = new StringRequest(Request.Method.GET, sUrl,
            new Response.Listener<String>() {
                @Override
                public void onResponse(String response) {
                    me.onComplete();
                }
            },
            new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    //me.changeNotificationText(error.getMessage());
                }
            }
        );
        // Add the request to the RequestQueue.
        queue.add(stringRequest);
        // TODO: Build MySQL
    }

    protected void onComplete() {
        this.installWizard.summonNextPage(this, this.installWizard.PROCEED);
    }
}
