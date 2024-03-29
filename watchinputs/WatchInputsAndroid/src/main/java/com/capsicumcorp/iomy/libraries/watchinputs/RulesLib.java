/*
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Copyright: Capsicum Corporation 2016

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

public class RulesLib {
    public native long jnigetmodulesinfo();

    public RulesLib(String AppName) {
    }

    static {
        System.loadLibrary("ruleslib");
    }
}
