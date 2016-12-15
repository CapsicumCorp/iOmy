/*
Title: Titles Interface
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Titles for different activities
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

/**
 * List of titles that an activity can choose one from.
 */
public interface Titles {
    String welcomePageTitle                 = "Welcome";
    String setupQuestions                   = "iOmy Setup";
    String licenseAgreementTitle            = "License Information";
    String webserverQuestionTitle           = "Web Server Location";
    String webserverPageTitle               = "Web Server Setup";
    String webserverInfoPageTitle           = "Web Server Setup - Cont.";

    String webserverDeviceTitle             = "Web Server Device";
    String webserverServerSetupTitle        = "Server Setup";
    String webserverDatabaseRootPasswordSetupTitle      = "Database Root Password Setup";
    String webserverDatabaseSetupTitle      = "Database Setup";
    String premiseAndHubTitle               = "Premises and Hubs";
    String premiseHubOwnerTitle             = "User Setup";
    String finalSetupTitle                  = "iOmy Setup";

    String servicesToggleTitle              = "iOmy Services";
}
