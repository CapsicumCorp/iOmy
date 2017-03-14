/*
Title: Extension of the Progress Activity that allows customisation of the percentage display
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: NOT TO BE USED DIRECTLY - Each progress class that needs custom updating of the percentage display
    extends this one. Links to the Progress Page Activity.
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

import android.widget.TextView;

public class ProgressPageWithCustomPercentage extends ProgressPage {
    /**
     * Sets the percentage counter without updating the percentage text
     * @param count The value to set the count to
     */
    protected synchronized void updatePercentageCounter(long count) {
        this.count=count;
    }

    /**
     * Updates the percentage text without updating the percentage counter
     */
    protected synchronized void updatePercentageText() {
        TextView tv = (TextView) findViewById(R.id.progressPercentage);
        float result = (this.count / (float) this.totalRequests) * 100;
        tv.setText(Math.round(result)+"%");
        // Increase the complete request count
    }
}
