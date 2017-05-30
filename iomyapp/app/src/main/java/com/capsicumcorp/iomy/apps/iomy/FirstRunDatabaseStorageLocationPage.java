package com.capsicumcorp.iomy.apps.iomy;

import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.support.v4.os.EnvironmentCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;

import java.io.File;
import java.math.RoundingMode;
import java.text.DecimalFormat;

import static java.lang.Math.round;

public class FirstRunDatabaseStorageLocationPage extends AppCompatActivity {
    private InstallWizard installWizard = Constants.installWizard;
    String[] externalStoragePaths=null;
    int[] externalStorageIds=null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_database_storage_location);
        this.setTitle(Titles.FirstRunDatabaseStorageLocationTitle);

        // Disable the next button until a storage location has been selected
        Button btn= (Button) findViewById(R.id.database_storage_location_next_button);
        btn.setEnabled(false);

        //Code from https://stackoverflow.com/questions/19380526/how-to-add-radio-button-dynamically-as-per-the-given-number-of-counts
        RadioGroup rgp= (RadioGroup) findViewById(R.id.database_storage_location_radio_group);

        //TODO: Store all the paths to a private array so can match the ids when user ticks next
        //TODO: Add custom path option

        //https://stackoverflow.com/questions/153724/how-to-round-a-number-to-n-decimal-places-in-java
        DecimalFormat df = new DecimalFormat("0.00");
        df.setRoundingMode(RoundingMode.HALF_UP);

        //Internal Storage Radio Button
        RadioButton radioButtonInternalStorage = new RadioButton(this);
        File internalStorageFile=this.getFilesDir();
        String internalStorageFreeSpaceStr = df.format(((float) internalStorageFile.getFreeSpace()) / 1024.0 / 1024.0 / 1024.0);
        radioButtonInternalStorage.setText("Internal Storage, "+internalStorageFreeSpaceStr+" GB free");
        radioButtonInternalStorage.setId(R.id.storage_location_internal);
        rgp.addView(radioButtonInternalStorage);

        if (Build.VERSION.SDK_INT < 19) {
            //Pre Android 4.4 (API 19) External Storage Radio Button
            if (!Environment.isExternalStorageEmulated()) {
                //Only show External Storage if it is on a different partition to internal storage
                RadioButton radioButtonExternalStorage = new RadioButton(this);
                File externalStorageFile = this.getExternalFilesDir(null);
                String externalStorageFreeSpaceStr = df.format(((float) externalStorageFile.getFreeSpace()) / 1024.0 / 1024.0 / 1024.0);
                radioButtonExternalStorage.setText("SD Card, " + externalStorageFreeSpaceStr + " GB free");
                radioButtonExternalStorage.setId(R.id.storage_location_external);
                rgp.addView(radioButtonExternalStorage);
            }
        } else {
            File[] externalStorageFiles=this.getExternalFilesDirs(null);
            externalStoragePaths=new String[externalStorageFiles.length];
            externalStorageIds=new int[externalStorageFiles.length];

            int i=0;
            for(File externalStorageFile : externalStorageFiles) {
                if (!EnvironmentCompat.getStorageState(externalStorageFile).equals(Environment.MEDIA_MOUNTED)) {
                    //Only provide options for media that can be written to
                    //Log.println(Log.INFO, "IOMY", "DEBUG Can't write to storage: "+externalStoragePath.getPath() + " "+EnvironmentCompat.getStorageState(externalStoragePath));
                    continue;
                }
                //Only show External Storage if it is on a different partition to internal storage (emulated)
                if (externalStorageFile.getPath().equals(this.getExternalFilesDir(null).getPath())) {
                    //Log.println(Log.INFO, "IOMY", "DEBUG Found first external storage: "+externalStoragePath.getPath());
                    if (Environment.isExternalStorageEmulated()) {
                        //Log.println(Log.INFO, "IOMY", "DEBUG First external storage is emulated: "+externalStoragePath.getPath());
                        continue;
                    }
                }
                if (Build.VERSION.SDK_INT >= 21) {
                    //Android Lollipop (API 21) adds ability to check any external storage if it is emulated
                    if (Environment.isExternalStorageEmulated(externalStorageFile)) {
                        //Log.println(Log.INFO, "IOMY", "DEBUG Other external storage is emulated: "+externalStoragePath.getPath());
                        continue;
                    }
                }
                RadioButton radioButtonExternalStorage = new RadioButton(this);
                String externalStorageFreeSpaceStr = df.format(((float) externalStorageFile.getFreeSpace()) / 1024.0 / 1024.0 / 1024.0);
                if (i<1) {
                    radioButtonExternalStorage.setText("SD Card, " + externalStorageFreeSpaceStr + " GB free");
                } else {
                    radioButtonExternalStorage.setText("SD Card "+(i+1)+", " + externalStorageFreeSpaceStr + " GB free");
                }
                //https://stackoverflow.com/questions/6583843/how-to-access-resource-with-dynamic-name-in-my-case
                int id = getResources().getIdentifier("storage_location_external_"+i, "id", getPackageName());

                externalStoragePaths[i]=externalStorageFile.getPath();
                externalStorageIds[i]=id;

                radioButtonExternalStorage.setId(id);
                rgp.addView(radioButtonExternalStorage);

                ++i;
            }
        }
        //When a radio button is checked, we can enable the Next button
        rgp.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                Button btn= (Button) findViewById(R.id.database_storage_location_next_button);
                btn.setEnabled(true);
            }
        });
    }

    public void onRadioButtonClicked(View view) {

    }
    public void nextPage(View view) {
        String selectedStoragePath=null;
        RadioGroup rgp= (RadioGroup) findViewById(R.id.database_storage_location_radio_group);
        int radioButtonID = rgp.getCheckedRadioButtonId();

        //Log.println(Log.INFO, "IOMY", "DEBUG Radio ID="+radioButtonID);
        if (radioButtonID==R.id.storage_location_internal) {
            //Log.println(Log.INFO, "IOMY", "DEBUG internal selected");
            selectedStoragePath=this.getFilesDir().getPath();
        } else if (radioButtonID==R.id.storage_location_external) {
            //Log.println(Log.INFO, "IOMY", "DEBUG external selected");
            selectedStoragePath=this.getExternalFilesDir(null).getPath();
        } else {
            int i=0;
            for (int id : externalStorageIds) {
                if (id==radioButtonID) {
                    //Log.println(Log.INFO, "IOMY", "DEBUG external id: "+cnt);
                    selectedStoragePath=externalStoragePaths[i];
                }
                ++i;
            }
        }
        if (selectedStoragePath==null) {
            //No valid selection has been made
            return;
        }
        //Log.println(Log.INFO, "IOMY", "DEBUG storage path="+selectedStoragePath);
        Settings.setPrefDatabaseStorageLocation(this, selectedStoragePath);
        Settings.setFirstRunWizardStepCompleted(this, this.getTitle().toString());
        installWizard.summonNextPage(this, installWizard.PROCEED);
    }
}
