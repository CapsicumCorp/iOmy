/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: This module provides support for mysql database and is the
               Java part of the MysqlLib module.
Copyright: Capsicum Corporation 2010-2016

This file is part of Watch Inputs which is part of the iOmy project.

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

*/

package com.capsicumcorp.iomy.libraries.watchinputs;

import java.io.PrintWriter;
import java.io.StringWriter;

import android.content.Context;
import android.util.Log;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class MysqlLib {
    private static MysqlLib instance;

    //Watch Inputs database version 1
    private static int MYSQLLIB_GETPORT_UNIQUEID=0; //Get the unique id for an ioport
    private static int MYSQLLIB_GETSENSOR_UNIQUEID=1; //Get the unique id for an ioport sensor
    private static int MYSQLLIB_GETIOPORT_STATE=2; //Get the state field for an io port
    private static int MYSQLLIB_GETSENSOR_SAMPLERATECURRENT=3; //Retrieve the current sample rate for a sensor
    private static int MYSQLLIB_UPDATE_IOPORT_STATE=4; //Update the state field for an io port
    private static int MYSQLLIB_INSERT_DATAFLOAT_VALUE=5; //Insert a double value into the DATAFLOAT table
    private static int MYSQLLIB_INSERT_DATABIGINT_VALUE=6; //Insert an int64 value into the DATABIGINT table
    private static int MYSQLLIB_INSERT_DATAINT_VALUE=7; //Insert a int32 value into the DATAINT table
    private static int MYSQLLIB_INSERT_DATATINYINT_VALUE=8; //Insert a int8 value into the DATATINYINT table
    private static int MYSQLLIB_GET_DATAFLOAT_VALUE=9; //Get the most recent double value from the DATAFLOAT table
    private static int MYSQLLIB_GET_DATABIGINT_VALUE=10; //Get the most recent int64 value from the DATABIGINT table
    private static int MYSQLLIB_GET_DATAINT_VALUE=11; //Get the most recent int32 value from the DATAINT table
    private static int MYSQLLIB_GET_DATATINYINT_VALUE=12; //Get the most recent int8 value from the DATATINYINT table
    private static int MYSQLLIB_UPDATE_DATAFLOAT_VALUE=13; //Update a double value in the DATAFLOAT table
    private static int MYSQLLIB_UPDATE_DATABIGINT_VALUE=14; //Update an int64 value in the DATABIGINT table
    private static int MYSQLLIB_UPDATE_DATAINT_VALUE=15; //Update a int32 value in the DATAINT table
    private static int MYSQLLIB_UPDATE_DATATINYINT_VALUE=16; //Update a int8 value in the DATATINYINT table
    private static int MYSQLLIB_GETCOMMPK=17; //Get the pk for a comm
    private static int MYSQLLIB_GETLINKPK=18; //Get the pk for a link
    private static int MYSQLLIB_GETLINKCOMMPK=19; //Get the comm pk that is associated with a link
    private static final int MYSQLLIB_GETTHINGPK=20; //Get the pk for a thing address and hwid
    private static final int MYSQLLIB_GETLINK_USERNAME_PASSWORD=21; //Get the username and password associated with a link
    private static final int MYSQLLIB_GETTHING_INFO=22; //Get about about all things for a link

    private Context context=null;
    private static boolean dbloaded=false;
    private static Connection dbconn=null; 
    private static PreparedStatement[] preparedStmts;

    //Temp variables returned from database queries
    private String usernameStr, passwordStr;
    private List<Integer> thingHwid=new ArrayList<Integer>();
    private List<Integer> thingOutputHwid=new ArrayList<Integer>();
    private List<Integer> thingType=new ArrayList<Integer>();
    private List<String> thingSerialCode=new ArrayList<String>();
    private List<String> thingName=new ArrayList<String>();

    public native long jnigetmodulesinfo();

    public static MysqlLib getInstance() {
        if (instance == null)
            throw new IllegalStateException();
        return instance;
    }

    public MysqlLib(Context context) {
        this.instance=this;
        this.context=context;
        MysqlLib.preparedStmts=new PreparedStatement[32];
    }

    //TODO: This might need some fixing as variables should only be initialised in the global and shutdown
    public static int init() {
    	try {
    		Class.forName("com.mysql.jdbc.Driver");
    	} catch (Exception e) {
    		//Treat this as non-fatal
    		displayException("init", e);
    	}
        dbloaded=false;
        dbconn=null;
        //Log.println(Log.INFO, "Watch Inputs", "In MysqlLib init");

        return 0;
    }

    //TODO: This might need some fixing as not all variables should be uninitialised
    public static void shutdown() {
        getInstance().context=null;
        //Log.println(Log.INFO, "Watch Inputs", "In MysqlLib shutdown");
    }
    public static void displayException(String functionName, Exception e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        String exceptionAsString = sw.toString();
        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib."+functionName+": Exception:"+exceptionAsString);
    }
    public static int loaddatabase(String hostname, String dbname, String username, String password) {
    	try {
    		Properties dbproperties=new Properties();

    		//TODO: Handle cases where the connection to the database server has been lost so
    		//  don't need auto reconnect
    		//NOTE: Setting compression to true doesn't seem to work on Android
    		dbproperties.setProperty("user", username);
    		dbproperties.setProperty("password", password);
    		dbproperties.setProperty("autoReconnect", "true");
    		dbproperties.setProperty("emulateUnsupportedPstmts", "false"); //With this enabled, errors in server side prepared statements are hidden 
    		Connection newdbconn=DriverManager.getConnection("jdbc:mysql://"+hostname+"/"+dbname, dbproperties);
    		if (newdbconn==null) {
    			return 0;
    		}
    		newdbconn.setAutoCommit(false);

    		dbconn=newdbconn;
    	} catch (SQLException e) {
    		displayException("loaddatabase", e);
    		return 0;
    	}
        return 1;
    }
    public static int unloaddatabase() {
    	if (dbconn!=null) {
    		try {
    			dbconn.close();
    		} catch (SQLException e) {
    			//Treat this as non-fatal
    			displayException("unloaddatabase", e);
    		}
    		dbconn=null;
    	}
        return 1;
    }
    public static int prepareStmt(String stmt, int stmtidx) {
        try {
        	//Log.println(Log.INFO, Application.getInstance().getAppName(), "MysqlLib.prepareStmt: "+stmt);
            preparedStmts[stmtidx]=dbconn.prepareStatement(stmt);
        } catch ( SQLException e) {
            displayException("prepareStmt", e);
            preparedStmts[stmtidx]=null;
            return 0;
        }
        return -1;
    }
    public static int unprepareStmt(int stmtidx) {
        int result=-1;
        try {
            if (preparedStmts[stmtidx]!=null) {
                preparedStmts[stmtidx].close();
            }
        } catch ( SQLException e) {
            displayException("unprepareStmt", e);
            result=0;
        }
        //The prepared statement will fail to unload if the database connection has been lost so remove the local reference anyway
        preparedStmts[stmtidx]=null;

        return result;
    }
    public static int begin() {
    	//MySQL JDBC starts a new transaction on the first command after commit
        return 0;
    }
    public static int end() {
        try {
            dbconn.commit();
        } catch ( SQLException e) {
            displayException("end", e);
            return -1;
        }
        return 0;
    }
    public static int rollback() {
        try {
            dbconn.rollback();
        } catch ( SQLException e) {
            displayException("rollback", e);
            return -1;
        }
        return 0;
    }


    //==========================
    //Version 5 schema functions
    //==========================
    //This function returns the ioportspk value
    public static long getPortUniqueId(String addr, int portid) {
        long plugid=-2;
        int psidx=MYSQLLIB_GETPORT_UNIQUEID;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getPortUniqueId: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setString(1, addr);
                preparedStmts[psidx].setInt(2, portid);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        plugid=rs.getLong(1);
                    }
                }
            } catch ( SQLException e) {
                displayException("getPortUniqueId", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getPortUniqueId", e);
                }
            }
        }
        return plugid;
    }
    public static long getSensorUniqueId(String addr, int portid, String sensor_name) {
        long plugid=-2;
        int psidx=MYSQLLIB_GETSENSOR_UNIQUEID;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getSensorUniqueId: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setString(1, addr);
                preparedStmts[psidx].setInt(2, portid);
                preparedStmts[psidx].setString(3, sensor_name);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        plugid=rs.getLong(1);
                    }
                }
            } catch ( SQLException e) {
                displayException("getSensorUniqueId", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getSensorUniqueId", e);
                }
            }
        }
        return plugid;
    }
    public static int getIOPortState(long ioportspk) {
        int portstate=-2;
        int psidx=MYSQLLIB_GETIOPORT_STATE;

        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, ioportspk);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        portstate=rs.getInt(1);
                    } else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib.getIOPortState: No state for ioportspk: "+ioportspk);
                    }
                }
            } catch ( SQLException e) {
                displayException("getIOPortState", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getIOPortState", e);
                }
            }
        }
        return portstate;
    }
    public static double getSensorSampleRateCurrent(long sensorpk) {
        double portstate=-2;
        int psidx=MYSQLLIB_GETSENSOR_SAMPLERATECURRENT;

        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        portstate=rs.getDouble(1);
                    } else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib.getSensorSampleRateCurrent: No sample rate current for sensorpk: "+sensorpk);
                    }
                }
            } catch ( SQLException e) {
                displayException("getSensorSampleRateCurrent", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getSensorSampleRateCurrent", e);
                }
            }
        }
        return portstate;
    }
    public static int updateIOPortsState(long ioportspk, int value) {
        int psidx=MYSQLLIB_UPDATE_IOPORT_STATE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setInt(1, value);
                preparedStmts[psidx].setLong(2, ioportspk);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("updateIOPortsState", e);
            }
        }
        return -1;
    }    
    public static int insertSensorDataFloatValue(long sensorpk, long date, double value) {
        int psidx=MYSQLLIB_INSERT_DATAFLOAT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                preparedStmts[psidx].setLong(2, date);
                preparedStmts[psidx].setDouble(3, value);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("insertSensorDataFloatValue", e);
            }
        }
        return -1;
    }
    public static int insertSensorDataBigIntValue(long sensorpk, long date, long value) {
        int psidx=MYSQLLIB_INSERT_DATABIGINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                preparedStmts[psidx].setLong(2, date);
                preparedStmts[psidx].setLong(3, value);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("insertSensorDataBigIntValue", e);
            }
        }
        return -1;
    }
    public static int insertSensorDataIntValue(long sensorpk, long date, int value) {
        int psidx=MYSQLLIB_INSERT_DATAINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                preparedStmts[psidx].setLong(2, date);
                preparedStmts[psidx].setInt(3, value);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("insertSensorDataIntValue", e);
            }
        }
        return -1;
    }    
    public static int insertSensorDataTinyIntValue(long sensorpk, long date, int value) {
        int psidx=MYSQLLIB_INSERT_DATATINYINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                preparedStmts[psidx].setLong(2, date);
                preparedStmts[psidx].setInt(3, value);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("insertSensorDataTinyIntValue", e);
            }
        }
        return -1;
    }    
    public static double getSensorDataFloatValue(long sensorpk) {
        double portstate=-2;
        int psidx=MYSQLLIB_GET_DATAFLOAT_VALUE;

        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        portstate=rs.getDouble(1);
                    } else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib.getSensorDataFloatValue: No DATAFLOAT value for sensorpk: "+sensorpk);
                    }
                }
            } catch ( SQLException e) {
                displayException("getSensorDataFloatValue", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getSensorDataFloatValue", e);
                }
            }
        }
        return portstate;
    }
    public static long getSensorDataBigIntValue(long sensorpk) {
        long portstate=-2;
        int psidx=MYSQLLIB_GET_DATABIGINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        portstate=rs.getLong(1);
                    } else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib.getSensorDataBigIntValue: No DATABIGINT value for sensorpk: "+sensorpk);
                    }
                }
            } catch ( SQLException e) {
                displayException("getSensorDataBigIntValue", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getSensorDataBigIntValue", e);
                }
            }
        }
        return portstate;
    }
    public static int getSensorDataIntValue(long sensorpk) {
        int portstate=-2;
        int psidx=MYSQLLIB_GET_DATAINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        portstate=rs.getInt(1);
                    } else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib.getSensorDataIntValue: No DATAINT value for sensorpk: "+sensorpk);
                    }
                }
            } catch ( SQLException e) {
                displayException("getSensorDataIntValue", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getSensorDataIntValue", e);
                }
            }
        }
        return portstate;
    }
    public static int getSensorDataTinyIntValue(long sensorpk) {
        int portstate=-2;
        int psidx=MYSQLLIB_GET_DATATINYINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, sensorpk);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        portstate=rs.getInt(1);
                    } else {
                        Log.println(Log.INFO, MainLib.getInstance().getAppName(), "MysqlLib.getSensorDataTinyIntValue: No DATATINYINT value for sensorpk: "+sensorpk);
                    }
                }
            } catch ( SQLException e) {
                displayException("getSensorDataTinyIntValue", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getSensorDataTinyIntValue", e);
                }
            }
        }
        return portstate;
    }
    public static int updateSensorDataFloatValue(long sensorpk, long date, double value) {
        int psidx=MYSQLLIB_UPDATE_DATAFLOAT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, date);
                preparedStmts[psidx].setDouble(2, value);
                preparedStmts[psidx].setLong(3, sensorpk);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("updateSensorDataFloatValue", e);
            }
        }
        return -1;
    }
    public static int updateSensorDataBigIntValue(long sensorpk, long date, long value) {
        int psidx=MYSQLLIB_UPDATE_DATABIGINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, date);
                preparedStmts[psidx].setLong(2, value);
                preparedStmts[psidx].setLong(3, sensorpk);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("updateSensorDataBigIntValue", e);
            }
        }
        return -1;
    }
    public static int updateSensorDataIntValue(long sensorpk, long date, int value) {
        int psidx=MYSQLLIB_UPDATE_DATAINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, date);
                preparedStmts[psidx].setInt(2, value);
                preparedStmts[psidx].setLong(3, sensorpk);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("updateSensorDataIntValue", e);
            }
        }
        return -1;
    }
    public static int updateSensorDataTinyIntValue(long sensorpk, long date, int value) {
        int psidx=MYSQLLIB_UPDATE_DATATINYINT_VALUE;

        if (preparedStmts[psidx]!=null) {
            try {
                preparedStmts[psidx].setLong(1, date);
                preparedStmts[psidx].setInt(2, value);
                preparedStmts[psidx].setLong(3, sensorpk);
                preparedStmts[psidx].executeUpdate();
                return 0;
            } catch ( SQLException e) {
                displayException("updateSensorDataTinyIntValue", e);
            }
        }
        return -1;
    }
    public static long getCommPK(String addr) {
        long pk=-2;
        int psidx=MYSQLLIB_GETCOMMPK;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getCommPK: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setString(1, addr);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        pk=rs.getLong(1);
                    } else {
                        //PK doesn't exist
                        pk=-1;
                    }
                } else {
                    //PK doesn't exist
                    pk=-1;
                }
            } catch ( SQLException e) {
                displayException("getCommPK", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getCommPK", e);
                }
            }
        }
        return pk;
    }
    public static long getLinkPK(String addr) {
        long pk=-2;
        int psidx=MYSQLLIB_GETLINKPK;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getLinkPK: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setString(1, addr);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        pk=rs.getLong(1);
                    } else {
                        //PK doesn't exist
                        pk=-1;
                    }
                } else {
                    //PK doesn't exist
                    pk=-1;
                }
            } catch ( SQLException e) {
                displayException("getLinkPK", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getLinkPK", e);
                }
            }
        }
        return pk;
    }
    public static long getThingPK(String serialcode, int hwid) {
        long pk=-2;
        int psidx=MYSQLLIB_GETTHINGPK;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getLinkPK: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setString(1, serialcode);
                preparedStmts[psidx].setInt(2, hwid);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        pk=rs.getLong(1);
                    } else {
                        //PK doesn't exist
                        pk=-1;
                    }
                } else {
                    //PK doesn't exist
                    pk=-1;
                }
            } catch ( SQLException e) {
                displayException("getThingPK", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getThingPK", e);
                }
            }
        }
        return pk;
    }
    public static int getDBLinkUsernamePassword(long linkPK) {
        int result=-1;
        String username="", password="";
        int psidx=MYSQLLIB_GETLINK_USERNAME_PASSWORD;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getLinkCommPK: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, linkPK);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    if (rs.first()) {
                        username=rs.getString(1);
                        password=rs.getString(2);
                        result=0;
                    } else {
                        //PK doesn't exist
                        result=-1;
                    }
                } else {
                    //PK doesn't exist
                    result=-1;
                }
            } catch ( SQLException e) {
                displayException("getDBLinkUsernamePassword", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getDBLinkUsernamePassword", e);
                }
            }
        }
        if (result==0) {
            getInstance().usernameStr=username;
            getInstance().passwordStr=password;
        }
        return result;
    }
    public static int getDBThingInfo(long linkPK) {
        int result=-1;
        List<Integer> thingHwid=new ArrayList<Integer>();
        List<Integer> thingOutputHwid=new ArrayList<Integer>();
        List<Integer> thingType=new ArrayList<Integer>();
        List<String> thingSerialCode=new ArrayList<String>();
        List<String> thingName=new ArrayList<String>();
        int psidx=MYSQLLIB_GETTHING_INFO;
        int tmpval;
        int numThings=0;

        //Log.println(Log.INFO, MainActivity.AppName, "MysqlLib.getLinkCommPK: DEBUG: addr="+addr+" iotechtype="+iotechtype+" portid="+portid);
        if (preparedStmts[psidx]!=null) {
            ResultSet rs=null;

            try {
                preparedStmts[psidx].setLong(1, linkPK);
                rs=preparedStmts[psidx].executeQuery();
                if (rs!=null) {
                    rs.beforeFirst();
                    result = 0;
                    while (rs.next()) {
                        tmpval = rs.getInt("THING_HWID");
                        if (rs.wasNull()) {
                            tmpval = -1; //Redefine as -1 if NULL
                        }
                        thingHwid.add(tmpval);
                        tmpval = rs.getInt("THING_OUTPUTHWID");
                        if (rs.wasNull()) {
                            tmpval = -1; //Redefine as -1 if NULL
                        }
                        thingOutputHwid.add(tmpval);
                        thingType.add(rs.getInt("THINGTYPE_PK"));
                        thingSerialCode.add(rs.getString("THING_SERIALCODE"));
                        thingName.add(rs.getString("THING_NAME"));
                        ++numThings;
                    }
                } else {
                    //PK doesn't exist
                    result=-1;
                }
            } catch ( SQLException e) {
                displayException("getDBThingInfo", e);
            }
            if (rs!=null) {
                try {
                    rs.close();
                } catch ( SQLException e) {
                    displayException("getDBThingInfo", e);
                }
            }
        }
        if (result==0) {
            getInstance().thingHwid=thingHwid;
            getInstance().thingOutputHwid=thingOutputHwid;
            getInstance().thingType=thingType;
            getInstance().thingSerialCode=thingSerialCode;
            getInstance().thingName=thingName;
            result=numThings;
        }
        return result;
    }
    public static String getLinkUsernameStr() {
        return getInstance().usernameStr;
    }
    public static String getLinkPasswordStr() {
        return getInstance().passwordStr;
    }
    public static int getThingHwid(int row) {
        return getInstance().thingHwid.get(row);
    }
    public static int getThingOutputHwid(int row) {
        return getInstance().thingOutputHwid.get(row);
    }
    public static int getThingType(int row) {
        return getInstance().thingType.get(row);
    }
    public static String getThingSerialCodeStr(int row) {
        return getInstance().thingSerialCode.get(row);
    }
    public static String getThingNameStr(int row) {
        return getInstance().thingName.get(row);
    }
    static {
        System.loadLibrary("mysqllib");
    }

}
