/*
Title: iOmy app loader
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Modified: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Registers major modules for iOmy, icons, and app pages, and loads iOmy.
Copyright: Capsicum Corporation 2015, 2016, 2017

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
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

//================================================//
//== 5.1 - IOMY LOAD JS MODULES					==//
//================================================//
$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common");

$.sap.registerModulePath('IOMy.apiphp', sModuleInitialBuildLocation+'util/apiphp');
$.sap.require("IOMy.apiphp");

$.sap.registerModulePath('IOMy.apiodata', sModuleInitialBuildLocation+'util/apiodata');
$.sap.require("IOMy.apiodata");

$.sap.registerModulePath('IOMy.widgets', sModuleInitialBuildLocation+'util/widgets');
$.sap.require("IOMy.widgets");

$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices");

$.sap.registerModulePath('IOMy.time', sModuleInitialBuildLocation+'util/time');
$.sap.require("IOMy.time");

$.sap.registerModulePath('IOMy.help', sModuleInitialBuildLocation+'util/help');
$.sap.require("IOMy.help");

$.sap.registerModulePath('IOMy.experimental', sModuleInitialBuildLocation+'util/experimental');
$.sap.require("IOMy.experimental");

//----------------------------------------//
//-- 5.1.1 - LOAD DEVICE FILES  		--//
//----------------------------------------//
$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.zigbeesmartplug");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.philipshue");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.onvif");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.motionsensor");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.temperaturesensor");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.develco");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.weatherfeed");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.doorlock");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.windowsensor");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.bluetoothscale");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.bpm");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.garagedoor");

$.sap.registerModulePath('IOMy.devices', sModuleInitialBuildLocation+'util/devices');
$.sap.require("IOMy.devices.thermostat");

//----------------------------------------//
//-- 5.1.2 - LOAD FUNCTION MODULES 		--//
//----------------------------------------//
$.sap.registerModulePath('IOMy.functions', sModuleInitialBuildLocation+'util/functions');
$.sap.require("IOMy.functions.DeviceLabels");

//================================================//
//== 5.2 - INITIALISE APPLICATION				==//
//================================================//
//sap.ui.localResources("mjs", sLocalResources);
var sLocalResources = sModuleInitialBuildLocation+"mjs";
jQuery.sap.registerResourcePath("mjs", sLocalResources);

var oApp = new sap.m.App("oApp");
	
//----------------------------------------//
//-- 5.2.3 - Custom Transitions         --//
//----------------------------------------//
try {
	oApp.addCustomTransition( 
		"c_SlideBack", 
		sap.m.NavContainer.transitions.slide.back,
		sap.m.NavContainer.transitions.slide.to
	);
} catch( e1 ) {
	console.log("Error with Custom Transition");
}


//----------------------------------------//
//-- 5.2.4 - Custom Icons               --//
//----------------------------------------//
sap.ui.core.IconPool.addIcon( 'environment',        'IOMy1', 'IOMy1', 'e900' );
sap.ui.core.IconPool.addIcon( 'appliances',         'IOMy1', 'IOMy1', 'e901' );
sap.ui.core.IconPool.addIcon( 'monitoring',         'IOMy1', 'IOMy1', 'e902' );
sap.ui.core.IconPool.addIcon( 'utilitymeter',       'IOMy1', 'IOMy1', 'e903' );

sap.ui.core.IconPool.addIcon('3d_rotation',                                                           'GoogleMaterial', 'GoogleMaterial', 'e84d' );
sap.ui.core.IconPool.addIcon('ac_unit',                                                               'GoogleMaterial', 'GoogleMaterial', 'eb3b' );
sap.ui.core.IconPool.addIcon('access_alarm',                                                          'GoogleMaterial', 'GoogleMaterial', 'e190' );
sap.ui.core.IconPool.addIcon('access_alarms',                                                         'GoogleMaterial', 'GoogleMaterial', 'e191' );
sap.ui.core.IconPool.addIcon('access_time',                                                           'GoogleMaterial', 'GoogleMaterial', 'e192' );
sap.ui.core.IconPool.addIcon('accessibility',                                                         'GoogleMaterial', 'GoogleMaterial', 'e84e' );
sap.ui.core.IconPool.addIcon('accessible',                                                            'GoogleMaterial', 'GoogleMaterial', 'e914' );
sap.ui.core.IconPool.addIcon('account_balance',                                                       'GoogleMaterial', 'GoogleMaterial', 'e84f' );
sap.ui.core.IconPool.addIcon('account_balance_wallet',                                                'GoogleMaterial', 'GoogleMaterial', 'e850' );
sap.ui.core.IconPool.addIcon('account_box',                                                           'GoogleMaterial', 'GoogleMaterial', 'e851' );
sap.ui.core.IconPool.addIcon('account_circle',                                                        'GoogleMaterial', 'GoogleMaterial', 'e853' );
sap.ui.core.IconPool.addIcon('adb',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e60e' );
sap.ui.core.IconPool.addIcon('add',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e145' );
sap.ui.core.IconPool.addIcon('add_a_photo',                                                           'GoogleMaterial', 'GoogleMaterial', 'e439' );
sap.ui.core.IconPool.addIcon('add_alarm',                                                             'GoogleMaterial', 'GoogleMaterial', 'e193' );
sap.ui.core.IconPool.addIcon('add_alert',                                                             'GoogleMaterial', 'GoogleMaterial', 'e003' );
sap.ui.core.IconPool.addIcon('add_box',                                                               'GoogleMaterial', 'GoogleMaterial', 'e146' );
sap.ui.core.IconPool.addIcon('add_circle',                                                            'GoogleMaterial', 'GoogleMaterial', 'e147' );
sap.ui.core.IconPool.addIcon('add_circle_outline',                                                    'GoogleMaterial', 'GoogleMaterial', 'e148' );
sap.ui.core.IconPool.addIcon('add_location',                                                          'GoogleMaterial', 'GoogleMaterial', 'e567' );
sap.ui.core.IconPool.addIcon('add_shopping_cart',                                                     'GoogleMaterial', 'GoogleMaterial', 'e854' );
sap.ui.core.IconPool.addIcon('add_to_photos',                                                         'GoogleMaterial', 'GoogleMaterial', 'e39d' );
sap.ui.core.IconPool.addIcon('add_to_queue',                                                          'GoogleMaterial', 'GoogleMaterial', 'e05c' );
sap.ui.core.IconPool.addIcon('adjust',                                                                'GoogleMaterial', 'GoogleMaterial', 'e39e' );
sap.ui.core.IconPool.addIcon('airline_seat_flat',                                                     'GoogleMaterial', 'GoogleMaterial', 'e630' );
sap.ui.core.IconPool.addIcon('airline_seat_flat_angled',                                              'GoogleMaterial', 'GoogleMaterial', 'e631' );
sap.ui.core.IconPool.addIcon('airline_seat_individual_suite',                                         'GoogleMaterial', 'GoogleMaterial', 'e632' );
sap.ui.core.IconPool.addIcon('airline_seat_legroom_extra',                                            'GoogleMaterial', 'GoogleMaterial', 'e633' );
sap.ui.core.IconPool.addIcon('airline_seat_legroom_normal',                                           'GoogleMaterial', 'GoogleMaterial', 'e634' );
sap.ui.core.IconPool.addIcon('airline_seat_legroom_reduced',                                          'GoogleMaterial', 'GoogleMaterial', 'e635' );
sap.ui.core.IconPool.addIcon('airline_seat_recline_extra',                                            'GoogleMaterial', 'GoogleMaterial', 'e636' );
sap.ui.core.IconPool.addIcon('airline_seat_recline_normal',                                           'GoogleMaterial', 'GoogleMaterial', 'e637' );
sap.ui.core.IconPool.addIcon('airplanemode_active',                                                   'GoogleMaterial', 'GoogleMaterial', 'e195' );
sap.ui.core.IconPool.addIcon('airplanemode_inactive',                                                 'GoogleMaterial', 'GoogleMaterial', 'e194' );
sap.ui.core.IconPool.addIcon('airplay',                                                               'GoogleMaterial', 'GoogleMaterial', 'e055' );
sap.ui.core.IconPool.addIcon('airport_shuttle',                                                       'GoogleMaterial', 'GoogleMaterial', 'eb3c' );
sap.ui.core.IconPool.addIcon('alarm',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e855' );
sap.ui.core.IconPool.addIcon('alarm_add',                                                             'GoogleMaterial', 'GoogleMaterial', 'e856' );
sap.ui.core.IconPool.addIcon('alarm_off',                                                             'GoogleMaterial', 'GoogleMaterial', 'e857' );
sap.ui.core.IconPool.addIcon('alarm_on',                                                              'GoogleMaterial', 'GoogleMaterial', 'e858' );
sap.ui.core.IconPool.addIcon('album',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e019' );
sap.ui.core.IconPool.addIcon('all_inclusive',                                                         'GoogleMaterial', 'GoogleMaterial', 'eb3d' );
sap.ui.core.IconPool.addIcon('all_out',                                                               'GoogleMaterial', 'GoogleMaterial', 'e90b' );
sap.ui.core.IconPool.addIcon('android',                                                               'GoogleMaterial', 'GoogleMaterial', 'e859' );
sap.ui.core.IconPool.addIcon('announcement',                                                          'GoogleMaterial', 'GoogleMaterial', 'e85a' );
sap.ui.core.IconPool.addIcon('apps',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e5c3' );
sap.ui.core.IconPool.addIcon('archive',                                                               'GoogleMaterial', 'GoogleMaterial', 'e149' );
sap.ui.core.IconPool.addIcon('arrow_back',                                                            'GoogleMaterial', 'GoogleMaterial', 'e5c4' );
sap.ui.core.IconPool.addIcon('arrow_downward',                                                        'GoogleMaterial', 'GoogleMaterial', 'e5db' );
sap.ui.core.IconPool.addIcon('arrow_drop_down',                                                       'GoogleMaterial', 'GoogleMaterial', 'e5c5' );
sap.ui.core.IconPool.addIcon('arrow_drop_down_circle',                                                'GoogleMaterial', 'GoogleMaterial', 'e5c6' );
sap.ui.core.IconPool.addIcon('arrow_drop_up',                                                         'GoogleMaterial', 'GoogleMaterial', 'e5c7' );
sap.ui.core.IconPool.addIcon('arrow_forward',                                                         'GoogleMaterial', 'GoogleMaterial', 'e5c8' );
sap.ui.core.IconPool.addIcon('arrow_upward',                                                          'GoogleMaterial', 'GoogleMaterial', 'e5d8' );
sap.ui.core.IconPool.addIcon('art_track',                                                             'GoogleMaterial', 'GoogleMaterial', 'e060' );
sap.ui.core.IconPool.addIcon('aspect_ratio',                                                          'GoogleMaterial', 'GoogleMaterial', 'e85b' );
sap.ui.core.IconPool.addIcon('assessment',                                                            'GoogleMaterial', 'GoogleMaterial', 'e85c' );
sap.ui.core.IconPool.addIcon('assignment',                                                            'GoogleMaterial', 'GoogleMaterial', 'e85d' );
sap.ui.core.IconPool.addIcon('assignment_ind',                                                        'GoogleMaterial', 'GoogleMaterial', 'e85e' );
sap.ui.core.IconPool.addIcon('assignment_late',                                                       'GoogleMaterial', 'GoogleMaterial', 'e85f' );
sap.ui.core.IconPool.addIcon('assignment_return',                                                     'GoogleMaterial', 'GoogleMaterial', 'e860' );
sap.ui.core.IconPool.addIcon('assignment_returned',                                                   'GoogleMaterial', 'GoogleMaterial', 'e861' );
sap.ui.core.IconPool.addIcon('assignment_turned_in',                                                  'GoogleMaterial', 'GoogleMaterial', 'e862' );
sap.ui.core.IconPool.addIcon('assistant',                                                             'GoogleMaterial', 'GoogleMaterial', 'e39f' );
sap.ui.core.IconPool.addIcon('assistant_photo',                                                       'GoogleMaterial', 'GoogleMaterial', 'e3a0' );
sap.ui.core.IconPool.addIcon('attach_file',                                                           'GoogleMaterial', 'GoogleMaterial', 'e226' );
sap.ui.core.IconPool.addIcon('attach_money',                                                          'GoogleMaterial', 'GoogleMaterial', 'e227' );
sap.ui.core.IconPool.addIcon('attachment',                                                            'GoogleMaterial', 'GoogleMaterial', 'e2bc' );
sap.ui.core.IconPool.addIcon('audiotrack',                                                            'GoogleMaterial', 'GoogleMaterial', 'e3a1' );
sap.ui.core.IconPool.addIcon('autorenew',                                                             'GoogleMaterial', 'GoogleMaterial', 'e863' );
sap.ui.core.IconPool.addIcon('av_timer',                                                              'GoogleMaterial', 'GoogleMaterial', 'e01b' );
sap.ui.core.IconPool.addIcon('backspace',                                                             'GoogleMaterial', 'GoogleMaterial', 'e14a' );
sap.ui.core.IconPool.addIcon('backup',                                                                'GoogleMaterial', 'GoogleMaterial', 'e864' );
sap.ui.core.IconPool.addIcon('battery_alert',                                                         'GoogleMaterial', 'GoogleMaterial', 'e19c' );
sap.ui.core.IconPool.addIcon('battery_charging_full',                                                 'GoogleMaterial', 'GoogleMaterial', 'e1a3' );
sap.ui.core.IconPool.addIcon('battery_full',                                                          'GoogleMaterial', 'GoogleMaterial', 'e1a4' );
sap.ui.core.IconPool.addIcon('battery_std',                                                           'GoogleMaterial', 'GoogleMaterial', 'e1a5' );
sap.ui.core.IconPool.addIcon('battery_unknown',                                                       'GoogleMaterial', 'GoogleMaterial', 'e1a6' );
sap.ui.core.IconPool.addIcon('beach_access',                                                          'GoogleMaterial', 'GoogleMaterial', 'eb3e' );
sap.ui.core.IconPool.addIcon('beenhere',                                                              'GoogleMaterial', 'GoogleMaterial', 'e52d' );
sap.ui.core.IconPool.addIcon('block',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e14b' );
sap.ui.core.IconPool.addIcon('bluetooth',                                                             'GoogleMaterial', 'GoogleMaterial', 'e1a7' );
sap.ui.core.IconPool.addIcon('bluetooth_audio',                                                       'GoogleMaterial', 'GoogleMaterial', 'e60f' );
sap.ui.core.IconPool.addIcon('bluetooth_connected',                                                   'GoogleMaterial', 'GoogleMaterial', 'e1a8' );
sap.ui.core.IconPool.addIcon('bluetooth_disabled',                                                    'GoogleMaterial', 'GoogleMaterial', 'e1a9' );
sap.ui.core.IconPool.addIcon('bluetooth_searching',                                                   'GoogleMaterial', 'GoogleMaterial', 'e1aa' );
sap.ui.core.IconPool.addIcon('blur_circular',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3a2' );
sap.ui.core.IconPool.addIcon('blur_linear',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3a3' );
sap.ui.core.IconPool.addIcon('blur_off',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3a4' );
sap.ui.core.IconPool.addIcon('blur_on',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3a5' );
sap.ui.core.IconPool.addIcon('book',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e865' );
sap.ui.core.IconPool.addIcon('bookmark',                                                              'GoogleMaterial', 'GoogleMaterial', 'e866' );
sap.ui.core.IconPool.addIcon('bookmark_border',                                                       'GoogleMaterial', 'GoogleMaterial', 'e867' );
sap.ui.core.IconPool.addIcon('border_all',                                                            'GoogleMaterial', 'GoogleMaterial', 'e228' );
sap.ui.core.IconPool.addIcon('border_bottom',                                                         'GoogleMaterial', 'GoogleMaterial', 'e229' );
sap.ui.core.IconPool.addIcon('border_clear',                                                          'GoogleMaterial', 'GoogleMaterial', 'e22a' );
sap.ui.core.IconPool.addIcon('border_color',                                                          'GoogleMaterial', 'GoogleMaterial', 'e22b' );
sap.ui.core.IconPool.addIcon('border_horizontal',                                                     'GoogleMaterial', 'GoogleMaterial', 'e22c' );
sap.ui.core.IconPool.addIcon('border_inner',                                                          'GoogleMaterial', 'GoogleMaterial', 'e22d' );
sap.ui.core.IconPool.addIcon('border_left',                                                           'GoogleMaterial', 'GoogleMaterial', 'e22e' );
sap.ui.core.IconPool.addIcon('border_outer',                                                          'GoogleMaterial', 'GoogleMaterial', 'e22f' );
sap.ui.core.IconPool.addIcon('border_right',                                                          'GoogleMaterial', 'GoogleMaterial', 'e230' );
sap.ui.core.IconPool.addIcon('border_style',                                                          'GoogleMaterial', 'GoogleMaterial', 'e231' );
sap.ui.core.IconPool.addIcon('border_top',                                                            'GoogleMaterial', 'GoogleMaterial', 'e232' );
sap.ui.core.IconPool.addIcon('border_vertical',                                                       'GoogleMaterial', 'GoogleMaterial', 'e233' );
sap.ui.core.IconPool.addIcon('branding_watermark',                                                    'GoogleMaterial', 'GoogleMaterial', 'e06b' );
sap.ui.core.IconPool.addIcon('brightness_1',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3a6' );
sap.ui.core.IconPool.addIcon('brightness_2',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3a7' );
sap.ui.core.IconPool.addIcon('brightness_3',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3a8' );
sap.ui.core.IconPool.addIcon('brightness_4',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3a9' );
sap.ui.core.IconPool.addIcon('brightness_5',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3aa' );
sap.ui.core.IconPool.addIcon('brightness_6',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3ab' );
sap.ui.core.IconPool.addIcon('brightness_7',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3ac' );
sap.ui.core.IconPool.addIcon('brightness_auto',                                                       'GoogleMaterial', 'GoogleMaterial', 'e1ab' );
sap.ui.core.IconPool.addIcon('brightness_high',                                                       'GoogleMaterial', 'GoogleMaterial', 'e1ac' );
sap.ui.core.IconPool.addIcon('brightness_low',                                                        'GoogleMaterial', 'GoogleMaterial', 'e1ad' );
sap.ui.core.IconPool.addIcon('brightness_medium',                                                     'GoogleMaterial', 'GoogleMaterial', 'e1ae' );
sap.ui.core.IconPool.addIcon('broken_image',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3ad' );
sap.ui.core.IconPool.addIcon('brush',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e3ae' );
sap.ui.core.IconPool.addIcon('bubble_chart',                                                          'GoogleMaterial', 'GoogleMaterial', 'e6dd' );
sap.ui.core.IconPool.addIcon('bug_report',                                                            'GoogleMaterial', 'GoogleMaterial', 'e868' );
sap.ui.core.IconPool.addIcon('build',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e869' );
sap.ui.core.IconPool.addIcon('burst_mode',                                                            'GoogleMaterial', 'GoogleMaterial', 'e43c' );
sap.ui.core.IconPool.addIcon('business',                                                              'GoogleMaterial', 'GoogleMaterial', 'e0af' );
sap.ui.core.IconPool.addIcon('business_center',                                                       'GoogleMaterial', 'GoogleMaterial', 'eb3f' );
sap.ui.core.IconPool.addIcon('cached',                                                                'GoogleMaterial', 'GoogleMaterial', 'e86a' );
sap.ui.core.IconPool.addIcon('cake',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e7e9' );
sap.ui.core.IconPool.addIcon('call',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e0b0' );
sap.ui.core.IconPool.addIcon('call_end',                                                              'GoogleMaterial', 'GoogleMaterial', 'e0b1' );
sap.ui.core.IconPool.addIcon('call_made',                                                             'GoogleMaterial', 'GoogleMaterial', 'e0b2' );
sap.ui.core.IconPool.addIcon('call_merge',                                                            'GoogleMaterial', 'GoogleMaterial', 'e0b3' );
sap.ui.core.IconPool.addIcon('call_missed',                                                           'GoogleMaterial', 'GoogleMaterial', 'e0b4' );
sap.ui.core.IconPool.addIcon('call_missed_outgoing',                                                  'GoogleMaterial', 'GoogleMaterial', 'e0e4' );
sap.ui.core.IconPool.addIcon('call_received',                                                         'GoogleMaterial', 'GoogleMaterial', 'e0b5' );
sap.ui.core.IconPool.addIcon('call_split',                                                            'GoogleMaterial', 'GoogleMaterial', 'e0b6' );
sap.ui.core.IconPool.addIcon('call_to_action',                                                        'GoogleMaterial', 'GoogleMaterial', 'e06c' );
sap.ui.core.IconPool.addIcon('camera',                                                                'GoogleMaterial', 'GoogleMaterial', 'e3af' );
sap.ui.core.IconPool.addIcon('camera_alt',                                                            'GoogleMaterial', 'GoogleMaterial', 'e3b0' );
sap.ui.core.IconPool.addIcon('camera_enhance',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8fc' );
sap.ui.core.IconPool.addIcon('camera_front',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3b1' );
sap.ui.core.IconPool.addIcon('camera_rear',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3b2' );
sap.ui.core.IconPool.addIcon('camera_roll',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3b3' );
sap.ui.core.IconPool.addIcon('cancel',                                                                'GoogleMaterial', 'GoogleMaterial', 'e5c9' );
sap.ui.core.IconPool.addIcon('card_giftcard',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8f6' );
sap.ui.core.IconPool.addIcon('card_membership',                                                       'GoogleMaterial', 'GoogleMaterial', 'e8f7' );
sap.ui.core.IconPool.addIcon('card_travel',                                                           'GoogleMaterial', 'GoogleMaterial', 'e8f8' );
sap.ui.core.IconPool.addIcon('casino',                                                                'GoogleMaterial', 'GoogleMaterial', 'eb40' );
sap.ui.core.IconPool.addIcon('cast',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e307' );
sap.ui.core.IconPool.addIcon('cast_connected',                                                        'GoogleMaterial', 'GoogleMaterial', 'e308' );
sap.ui.core.IconPool.addIcon('center_focus_strong',                                                   'GoogleMaterial', 'GoogleMaterial', 'e3b4' );
sap.ui.core.IconPool.addIcon('center_focus_weak',                                                     'GoogleMaterial', 'GoogleMaterial', 'e3b5' );
sap.ui.core.IconPool.addIcon('change_history',                                                        'GoogleMaterial', 'GoogleMaterial', 'e86b' );
sap.ui.core.IconPool.addIcon('chat',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e0b7' );
sap.ui.core.IconPool.addIcon('chat_bubble',                                                           'GoogleMaterial', 'GoogleMaterial', 'e0ca' );
sap.ui.core.IconPool.addIcon('chat_bubble_outline',                                                   'GoogleMaterial', 'GoogleMaterial', 'e0cb' );
sap.ui.core.IconPool.addIcon('check',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e5ca' );
sap.ui.core.IconPool.addIcon('check_box',                                                             'GoogleMaterial', 'GoogleMaterial', 'e834' );
sap.ui.core.IconPool.addIcon('check_box_outline_blank',                                               'GoogleMaterial', 'GoogleMaterial', 'e835' );
sap.ui.core.IconPool.addIcon('check_circle',                                                          'GoogleMaterial', 'GoogleMaterial', 'e86c' );
sap.ui.core.IconPool.addIcon('chevron_left',                                                          'GoogleMaterial', 'GoogleMaterial', 'e5cb' );
sap.ui.core.IconPool.addIcon('chevron_right',                                                         'GoogleMaterial', 'GoogleMaterial', 'e5cc' );
sap.ui.core.IconPool.addIcon('child_care',                                                            'GoogleMaterial', 'GoogleMaterial', 'eb41' );
sap.ui.core.IconPool.addIcon('child_friendly',                                                        'GoogleMaterial', 'GoogleMaterial', 'eb42' );
sap.ui.core.IconPool.addIcon('chrome_reader_mode',                                                    'GoogleMaterial', 'GoogleMaterial', 'e86d' );
sap.ui.core.IconPool.addIcon('class',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e86e' );
sap.ui.core.IconPool.addIcon('clear',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e14c' );
sap.ui.core.IconPool.addIcon('clear_all',                                                             'GoogleMaterial', 'GoogleMaterial', 'e0b8' );
sap.ui.core.IconPool.addIcon('close',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e5cd' );
sap.ui.core.IconPool.addIcon('closed_caption',                                                        'GoogleMaterial', 'GoogleMaterial', 'e01c' );
sap.ui.core.IconPool.addIcon('cloud',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e2bd' );
sap.ui.core.IconPool.addIcon('cloud_circle',                                                          'GoogleMaterial', 'GoogleMaterial', 'e2be' );
sap.ui.core.IconPool.addIcon('cloud_done',                                                            'GoogleMaterial', 'GoogleMaterial', 'e2bf' );
sap.ui.core.IconPool.addIcon('cloud_download',                                                        'GoogleMaterial', 'GoogleMaterial', 'e2c0' );
sap.ui.core.IconPool.addIcon('cloud_off',                                                             'GoogleMaterial', 'GoogleMaterial', 'e2c1' );
sap.ui.core.IconPool.addIcon('cloud_queue',                                                           'GoogleMaterial', 'GoogleMaterial', 'e2c2' );
sap.ui.core.IconPool.addIcon('cloud_upload',                                                          'GoogleMaterial', 'GoogleMaterial', 'e2c3' );
sap.ui.core.IconPool.addIcon('code',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e86f' );
sap.ui.core.IconPool.addIcon('collections',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3b6' );
sap.ui.core.IconPool.addIcon('collections_bookmark',                                                  'GoogleMaterial', 'GoogleMaterial', 'e431' );
sap.ui.core.IconPool.addIcon('color_lens',                                                            'GoogleMaterial', 'GoogleMaterial', 'e3b7' );
sap.ui.core.IconPool.addIcon('colorize',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3b8' );
sap.ui.core.IconPool.addIcon('comment',                                                               'GoogleMaterial', 'GoogleMaterial', 'e0b9' );
sap.ui.core.IconPool.addIcon('compare',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3b9' );
sap.ui.core.IconPool.addIcon('compare_arrows',                                                        'GoogleMaterial', 'GoogleMaterial', 'e915' );
sap.ui.core.IconPool.addIcon('computer',                                                              'GoogleMaterial', 'GoogleMaterial', 'e30a' );
sap.ui.core.IconPool.addIcon('confirmation_number',                                                   'GoogleMaterial', 'GoogleMaterial', 'e638' );
sap.ui.core.IconPool.addIcon('contact_mail',                                                          'GoogleMaterial', 'GoogleMaterial', 'e0d0' );
sap.ui.core.IconPool.addIcon('contact_phone',                                                         'GoogleMaterial', 'GoogleMaterial', 'e0cf' );
sap.ui.core.IconPool.addIcon('contacts',                                                              'GoogleMaterial', 'GoogleMaterial', 'e0ba' );
sap.ui.core.IconPool.addIcon('content_copy',                                                          'GoogleMaterial', 'GoogleMaterial', 'e14d' );
sap.ui.core.IconPool.addIcon('content_cut',                                                           'GoogleMaterial', 'GoogleMaterial', 'e14e' );
sap.ui.core.IconPool.addIcon('content_paste',                                                         'GoogleMaterial', 'GoogleMaterial', 'e14f' );
sap.ui.core.IconPool.addIcon('control_point',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3ba' );
sap.ui.core.IconPool.addIcon('control_point_duplicate',                                               'GoogleMaterial', 'GoogleMaterial', 'e3bb' );
sap.ui.core.IconPool.addIcon('copyright',                                                             'GoogleMaterial', 'GoogleMaterial', 'e90c' );
sap.ui.core.IconPool.addIcon('create',                                                                'GoogleMaterial', 'GoogleMaterial', 'e150' );
sap.ui.core.IconPool.addIcon('create_new_folder',                                                     'GoogleMaterial', 'GoogleMaterial', 'e2cc' );
sap.ui.core.IconPool.addIcon('credit_card',                                                           'GoogleMaterial', 'GoogleMaterial', 'e870' );
sap.ui.core.IconPool.addIcon('crop',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e3be' );
sap.ui.core.IconPool.addIcon('crop_16_9',                                                             'GoogleMaterial', 'GoogleMaterial', 'e3bc' );
sap.ui.core.IconPool.addIcon('crop_3_2',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3bd' );
sap.ui.core.IconPool.addIcon('crop_5_4',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3bf' );
sap.ui.core.IconPool.addIcon('crop_7_5',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3c0' );
sap.ui.core.IconPool.addIcon('crop_din',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3c1' );
sap.ui.core.IconPool.addIcon('crop_free',                                                             'GoogleMaterial', 'GoogleMaterial', 'e3c2' );
sap.ui.core.IconPool.addIcon('crop_landscape',                                                        'GoogleMaterial', 'GoogleMaterial', 'e3c3' );
sap.ui.core.IconPool.addIcon('crop_original',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3c4' );
sap.ui.core.IconPool.addIcon('crop_portrait',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3c5' );
sap.ui.core.IconPool.addIcon('crop_rotate',                                                           'GoogleMaterial', 'GoogleMaterial', 'e437' );
sap.ui.core.IconPool.addIcon('crop_square',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3c6' );
sap.ui.core.IconPool.addIcon('dashboard',                                                             'GoogleMaterial', 'GoogleMaterial', 'e871' );
sap.ui.core.IconPool.addIcon('data_usage',                                                            'GoogleMaterial', 'GoogleMaterial', 'e1af' );
sap.ui.core.IconPool.addIcon('date_range',                                                            'GoogleMaterial', 'GoogleMaterial', 'e916' );
sap.ui.core.IconPool.addIcon('dehaze',                                                                'GoogleMaterial', 'GoogleMaterial', 'e3c7' );
sap.ui.core.IconPool.addIcon('delete',                                                                'GoogleMaterial', 'GoogleMaterial', 'e872' );
sap.ui.core.IconPool.addIcon('delete_forever',                                                        'GoogleMaterial', 'GoogleMaterial', 'e92b' );
sap.ui.core.IconPool.addIcon('delete_sweep',                                                          'GoogleMaterial', 'GoogleMaterial', 'e16c' );
sap.ui.core.IconPool.addIcon('description',                                                           'GoogleMaterial', 'GoogleMaterial', 'e873' );
sap.ui.core.IconPool.addIcon('desktop_mac',                                                           'GoogleMaterial', 'GoogleMaterial', 'e30b' );
sap.ui.core.IconPool.addIcon('desktop_windows',                                                       'GoogleMaterial', 'GoogleMaterial', 'e30c' );
sap.ui.core.IconPool.addIcon('details',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3c8' );
sap.ui.core.IconPool.addIcon('developer_board',                                                       'GoogleMaterial', 'GoogleMaterial', 'e30d' );
sap.ui.core.IconPool.addIcon('developer_mode',                                                        'GoogleMaterial', 'GoogleMaterial', 'e1b0' );
sap.ui.core.IconPool.addIcon('device_hub',                                                            'GoogleMaterial', 'GoogleMaterial', 'e335' );
sap.ui.core.IconPool.addIcon('devices',                                                               'GoogleMaterial', 'GoogleMaterial', 'e1b1' );
sap.ui.core.IconPool.addIcon('devices_other',                                                         'GoogleMaterial', 'GoogleMaterial', 'e337' );
sap.ui.core.IconPool.addIcon('dialer_sip',                                                            'GoogleMaterial', 'GoogleMaterial', 'e0bb' );
sap.ui.core.IconPool.addIcon('dialpad',                                                               'GoogleMaterial', 'GoogleMaterial', 'e0bc' );
sap.ui.core.IconPool.addIcon('directions',                                                            'GoogleMaterial', 'GoogleMaterial', 'e52e' );
sap.ui.core.IconPool.addIcon('directions_bike',                                                       'GoogleMaterial', 'GoogleMaterial', 'e52f' );
sap.ui.core.IconPool.addIcon('directions_boat',                                                       'GoogleMaterial', 'GoogleMaterial', 'e532' );
sap.ui.core.IconPool.addIcon('directions_bus',                                                        'GoogleMaterial', 'GoogleMaterial', 'e530' );
sap.ui.core.IconPool.addIcon('directions_car',                                                        'GoogleMaterial', 'GoogleMaterial', 'e531' );
sap.ui.core.IconPool.addIcon('directions_railway',                                                    'GoogleMaterial', 'GoogleMaterial', 'e534' );
sap.ui.core.IconPool.addIcon('directions_run',                                                        'GoogleMaterial', 'GoogleMaterial', 'e566' );
sap.ui.core.IconPool.addIcon('directions_subway',                                                     'GoogleMaterial', 'GoogleMaterial', 'e533' );
sap.ui.core.IconPool.addIcon('directions_transit',                                                    'GoogleMaterial', 'GoogleMaterial', 'e535' );
sap.ui.core.IconPool.addIcon('directions_walk',                                                       'GoogleMaterial', 'GoogleMaterial', 'e536' );
sap.ui.core.IconPool.addIcon('disc_full',                                                             'GoogleMaterial', 'GoogleMaterial', 'e610' );
sap.ui.core.IconPool.addIcon('dns',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e875' );
sap.ui.core.IconPool.addIcon('do_not_disturb',                                                        'GoogleMaterial', 'GoogleMaterial', 'e612' );
sap.ui.core.IconPool.addIcon('do_not_disturb_alt',                                                    'GoogleMaterial', 'GoogleMaterial', 'e611' );
sap.ui.core.IconPool.addIcon('do_not_disturb_off',                                                    'GoogleMaterial', 'GoogleMaterial', 'e643' );
sap.ui.core.IconPool.addIcon('do_not_disturb_on',                                                     'GoogleMaterial', 'GoogleMaterial', 'e644' );
sap.ui.core.IconPool.addIcon('dock',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e30e' );
sap.ui.core.IconPool.addIcon('domain',                                                                'GoogleMaterial', 'GoogleMaterial', 'e7ee' );
sap.ui.core.IconPool.addIcon('done',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e876' );
sap.ui.core.IconPool.addIcon('done_all',                                                              'GoogleMaterial', 'GoogleMaterial', 'e877' );
sap.ui.core.IconPool.addIcon('donut_large',                                                           'GoogleMaterial', 'GoogleMaterial', 'e917' );
sap.ui.core.IconPool.addIcon('donut_small',                                                           'GoogleMaterial', 'GoogleMaterial', 'e918' );
sap.ui.core.IconPool.addIcon('drafts',                                                                'GoogleMaterial', 'GoogleMaterial', 'e151' );
sap.ui.core.IconPool.addIcon('drag_handle',                                                           'GoogleMaterial', 'GoogleMaterial', 'e25d' );
sap.ui.core.IconPool.addIcon('drive_eta',                                                             'GoogleMaterial', 'GoogleMaterial', 'e613' );
sap.ui.core.IconPool.addIcon('dvr',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e1b2' );
sap.ui.core.IconPool.addIcon('edit',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e3c9' );
sap.ui.core.IconPool.addIcon('edit_location',                                                         'GoogleMaterial', 'GoogleMaterial', 'e568' );
sap.ui.core.IconPool.addIcon('eject',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e8fb' );
sap.ui.core.IconPool.addIcon('email',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e0be' );
sap.ui.core.IconPool.addIcon('enhanced_encryption',                                                   'GoogleMaterial', 'GoogleMaterial', 'e63f' );
sap.ui.core.IconPool.addIcon('equalizer',                                                             'GoogleMaterial', 'GoogleMaterial', 'e01d' );
sap.ui.core.IconPool.addIcon('error',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e000' );
sap.ui.core.IconPool.addIcon('error_outline',                                                         'GoogleMaterial', 'GoogleMaterial', 'e001' );
sap.ui.core.IconPool.addIcon('euro_symbol',                                                           'GoogleMaterial', 'GoogleMaterial', 'e926' );
sap.ui.core.IconPool.addIcon('ev_station',                                                            'GoogleMaterial', 'GoogleMaterial', 'e56d' );
sap.ui.core.IconPool.addIcon('event',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e878' );
sap.ui.core.IconPool.addIcon('event_available',                                                       'GoogleMaterial', 'GoogleMaterial', 'e614' );
sap.ui.core.IconPool.addIcon('event_busy',                                                            'GoogleMaterial', 'GoogleMaterial', 'e615' );
sap.ui.core.IconPool.addIcon('event_note',                                                            'GoogleMaterial', 'GoogleMaterial', 'e616' );
sap.ui.core.IconPool.addIcon('event_seat',                                                            'GoogleMaterial', 'GoogleMaterial', 'e903' );
sap.ui.core.IconPool.addIcon('exit_to_app',                                                           'GoogleMaterial', 'GoogleMaterial', 'e879' );
sap.ui.core.IconPool.addIcon('expand_less',                                                           'GoogleMaterial', 'GoogleMaterial', 'e5ce' );
sap.ui.core.IconPool.addIcon('expand_more',                                                           'GoogleMaterial', 'GoogleMaterial', 'e5cf' );
sap.ui.core.IconPool.addIcon('explicit',                                                              'GoogleMaterial', 'GoogleMaterial', 'e01e' );
sap.ui.core.IconPool.addIcon('explore',                                                               'GoogleMaterial', 'GoogleMaterial', 'e87a' );
sap.ui.core.IconPool.addIcon('exposure',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3ca' );
sap.ui.core.IconPool.addIcon('exposure_neg_1',                                                        'GoogleMaterial', 'GoogleMaterial', 'e3cb' );
sap.ui.core.IconPool.addIcon('exposure_neg_2',                                                        'GoogleMaterial', 'GoogleMaterial', 'e3cc' );
sap.ui.core.IconPool.addIcon('exposure_plus_1',                                                       'GoogleMaterial', 'GoogleMaterial', 'e3cd' );
sap.ui.core.IconPool.addIcon('exposure_plus_2',                                                       'GoogleMaterial', 'GoogleMaterial', 'e3ce' );
sap.ui.core.IconPool.addIcon('exposure_zero',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3cf' );
sap.ui.core.IconPool.addIcon('extension',                                                             'GoogleMaterial', 'GoogleMaterial', 'e87b' );
sap.ui.core.IconPool.addIcon('face',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e87c' );
sap.ui.core.IconPool.addIcon('fast_forward',                                                          'GoogleMaterial', 'GoogleMaterial', 'e01f' );
sap.ui.core.IconPool.addIcon('fast_rewind',                                                           'GoogleMaterial', 'GoogleMaterial', 'e020' );
sap.ui.core.IconPool.addIcon('favorite',                                                              'GoogleMaterial', 'GoogleMaterial', 'e87d' );
sap.ui.core.IconPool.addIcon('favorite_border',                                                       'GoogleMaterial', 'GoogleMaterial', 'e87e' );
sap.ui.core.IconPool.addIcon('featured_play_list',                                                    'GoogleMaterial', 'GoogleMaterial', 'e06d' );
sap.ui.core.IconPool.addIcon('featured_video',                                                        'GoogleMaterial', 'GoogleMaterial', 'e06e' );
sap.ui.core.IconPool.addIcon('feedback',                                                              'GoogleMaterial', 'GoogleMaterial', 'e87f' );
sap.ui.core.IconPool.addIcon('fiber_dvr',                                                             'GoogleMaterial', 'GoogleMaterial', 'e05d' );
sap.ui.core.IconPool.addIcon('fiber_manual_record',                                                   'GoogleMaterial', 'GoogleMaterial', 'e061' );
sap.ui.core.IconPool.addIcon('fiber_new',                                                             'GoogleMaterial', 'GoogleMaterial', 'e05e' );
sap.ui.core.IconPool.addIcon('fiber_pin',                                                             'GoogleMaterial', 'GoogleMaterial', 'e06a' );
sap.ui.core.IconPool.addIcon('fiber_smart_record',                                                    'GoogleMaterial', 'GoogleMaterial', 'e062' );
sap.ui.core.IconPool.addIcon('file_download',                                                         'GoogleMaterial', 'GoogleMaterial', 'e2c4' );
sap.ui.core.IconPool.addIcon('file_upload',                                                           'GoogleMaterial', 'GoogleMaterial', 'e2c6' );
sap.ui.core.IconPool.addIcon('filter',                                                                'GoogleMaterial', 'GoogleMaterial', 'e3d3' );
sap.ui.core.IconPool.addIcon('filter_1',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d0' );
sap.ui.core.IconPool.addIcon('filter_2',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d1' );
sap.ui.core.IconPool.addIcon('filter_3',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d2' );
sap.ui.core.IconPool.addIcon('filter_4',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d4' );
sap.ui.core.IconPool.addIcon('filter_5',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d5' );
sap.ui.core.IconPool.addIcon('filter_6',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d6' );
sap.ui.core.IconPool.addIcon('filter_7',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d7' );
sap.ui.core.IconPool.addIcon('filter_8',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d8' );
sap.ui.core.IconPool.addIcon('filter_9',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3d9' );
sap.ui.core.IconPool.addIcon('filter_9_plus',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3da' );
sap.ui.core.IconPool.addIcon('filter_b_and_w',                                                        'GoogleMaterial', 'GoogleMaterial', 'e3db' );
sap.ui.core.IconPool.addIcon('filter_center_focus',                                                   'GoogleMaterial', 'GoogleMaterial', 'e3dc' );
sap.ui.core.IconPool.addIcon('filter_drama',                                                          'GoogleMaterial', 'GoogleMaterial', 'e3dd' );
sap.ui.core.IconPool.addIcon('filter_frames',                                                         'GoogleMaterial', 'GoogleMaterial', 'e3de' );
sap.ui.core.IconPool.addIcon('filter_hdr',                                                            'GoogleMaterial', 'GoogleMaterial', 'e3df' );
sap.ui.core.IconPool.addIcon('filter_list',                                                           'GoogleMaterial', 'GoogleMaterial', 'e152' );
sap.ui.core.IconPool.addIcon('filter_none',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3e0' );
sap.ui.core.IconPool.addIcon('filter_tilt_shift',                                                     'GoogleMaterial', 'GoogleMaterial', 'e3e2' );
sap.ui.core.IconPool.addIcon('filter_vintage',                                                        'GoogleMaterial', 'GoogleMaterial', 'e3e3' );
sap.ui.core.IconPool.addIcon('find_in_page',                                                          'GoogleMaterial', 'GoogleMaterial', 'e880' );
sap.ui.core.IconPool.addIcon('find_replace',                                                          'GoogleMaterial', 'GoogleMaterial', 'e881' );
sap.ui.core.IconPool.addIcon('fingerprint',                                                           'GoogleMaterial', 'GoogleMaterial', 'e90d' );
sap.ui.core.IconPool.addIcon('first_page',                                                            'GoogleMaterial', 'GoogleMaterial', 'e5dc' );
sap.ui.core.IconPool.addIcon('fitness_center',                                                        'GoogleMaterial', 'GoogleMaterial', 'eb43' );
sap.ui.core.IconPool.addIcon('flag',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e153' );
sap.ui.core.IconPool.addIcon('flare',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e3e4' );
sap.ui.core.IconPool.addIcon('flash_auto',                                                            'GoogleMaterial', 'GoogleMaterial', 'e3e5' );
sap.ui.core.IconPool.addIcon('flash_off',                                                             'GoogleMaterial', 'GoogleMaterial', 'e3e6' );
sap.ui.core.IconPool.addIcon('flash_on',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3e7' );
sap.ui.core.IconPool.addIcon('flight',                                                                'GoogleMaterial', 'GoogleMaterial', 'e539' );
sap.ui.core.IconPool.addIcon('flight_land',                                                           'GoogleMaterial', 'GoogleMaterial', 'e904' );
sap.ui.core.IconPool.addIcon('flight_takeoff',                                                        'GoogleMaterial', 'GoogleMaterial', 'e905' );
sap.ui.core.IconPool.addIcon('flip',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e3e8' );
sap.ui.core.IconPool.addIcon('flip_to_back',                                                          'GoogleMaterial', 'GoogleMaterial', 'e882' );
sap.ui.core.IconPool.addIcon('flip_to_front',                                                         'GoogleMaterial', 'GoogleMaterial', 'e883' );
sap.ui.core.IconPool.addIcon('folder',                                                                'GoogleMaterial', 'GoogleMaterial', 'e2c7' );
sap.ui.core.IconPool.addIcon('folder_open',                                                           'GoogleMaterial', 'GoogleMaterial', 'e2c8' );
sap.ui.core.IconPool.addIcon('folder_shared',                                                         'GoogleMaterial', 'GoogleMaterial', 'e2c9' );
sap.ui.core.IconPool.addIcon('folder_special',                                                        'GoogleMaterial', 'GoogleMaterial', 'e617' );
sap.ui.core.IconPool.addIcon('font_download',                                                         'GoogleMaterial', 'GoogleMaterial', 'e167' );
sap.ui.core.IconPool.addIcon('format_align_center',                                                   'GoogleMaterial', 'GoogleMaterial', 'e234' );
sap.ui.core.IconPool.addIcon('format_align_justify',                                                  'GoogleMaterial', 'GoogleMaterial', 'e235' );
sap.ui.core.IconPool.addIcon('format_align_left',                                                     'GoogleMaterial', 'GoogleMaterial', 'e236' );
sap.ui.core.IconPool.addIcon('format_align_right',                                                    'GoogleMaterial', 'GoogleMaterial', 'e237' );
sap.ui.core.IconPool.addIcon('format_bold',                                                           'GoogleMaterial', 'GoogleMaterial', 'e238' );
sap.ui.core.IconPool.addIcon('format_clear',                                                          'GoogleMaterial', 'GoogleMaterial', 'e239' );
sap.ui.core.IconPool.addIcon('format_color_fill',                                                     'GoogleMaterial', 'GoogleMaterial', 'e23a' );
sap.ui.core.IconPool.addIcon('format_color_reset',                                                    'GoogleMaterial', 'GoogleMaterial', 'e23b' );
sap.ui.core.IconPool.addIcon('format_color_text',                                                     'GoogleMaterial', 'GoogleMaterial', 'e23c' );
sap.ui.core.IconPool.addIcon('format_indent_decrease',                                                'GoogleMaterial', 'GoogleMaterial', 'e23d' );
sap.ui.core.IconPool.addIcon('format_indent_increase',                                                'GoogleMaterial', 'GoogleMaterial', 'e23e' );
sap.ui.core.IconPool.addIcon('format_italic',                                                         'GoogleMaterial', 'GoogleMaterial', 'e23f' );
sap.ui.core.IconPool.addIcon('format_line_spacing',                                                   'GoogleMaterial', 'GoogleMaterial', 'e240' );
sap.ui.core.IconPool.addIcon('format_list_bulleted',                                                  'GoogleMaterial', 'GoogleMaterial', 'e241' );
sap.ui.core.IconPool.addIcon('format_list_numbered',                                                  'GoogleMaterial', 'GoogleMaterial', 'e242' );
sap.ui.core.IconPool.addIcon('format_paint',                                                          'GoogleMaterial', 'GoogleMaterial', 'e243' );
sap.ui.core.IconPool.addIcon('format_quote',                                                          'GoogleMaterial', 'GoogleMaterial', 'e244' );
sap.ui.core.IconPool.addIcon('format_shapes',                                                         'GoogleMaterial', 'GoogleMaterial', 'e25e' );
sap.ui.core.IconPool.addIcon('format_size',                                                           'GoogleMaterial', 'GoogleMaterial', 'e245' );
sap.ui.core.IconPool.addIcon('format_strikethrough',                                                  'GoogleMaterial', 'GoogleMaterial', 'e246' );
sap.ui.core.IconPool.addIcon('format_textdirection_l_to_r',                                           'GoogleMaterial', 'GoogleMaterial', 'e247' );
sap.ui.core.IconPool.addIcon('format_textdirection_r_to_l',                                           'GoogleMaterial', 'GoogleMaterial', 'e248' );
sap.ui.core.IconPool.addIcon('format_underlined',                                                     'GoogleMaterial', 'GoogleMaterial', 'e249' );
sap.ui.core.IconPool.addIcon('forum',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e0bf' );
sap.ui.core.IconPool.addIcon('forward',                                                               'GoogleMaterial', 'GoogleMaterial', 'e154' );
sap.ui.core.IconPool.addIcon('forward_10',                                                            'GoogleMaterial', 'GoogleMaterial', 'e056' );
sap.ui.core.IconPool.addIcon('forward_30',                                                            'GoogleMaterial', 'GoogleMaterial', 'e057' );
sap.ui.core.IconPool.addIcon('forward_5',                                                             'GoogleMaterial', 'GoogleMaterial', 'e058' );
sap.ui.core.IconPool.addIcon('free_breakfast',                                                        'GoogleMaterial', 'GoogleMaterial', 'eb44' );
sap.ui.core.IconPool.addIcon('fullscreen',                                                            'GoogleMaterial', 'GoogleMaterial', 'e5d0' );
sap.ui.core.IconPool.addIcon('fullscreen_exit',                                                       'GoogleMaterial', 'GoogleMaterial', 'e5d1' );
sap.ui.core.IconPool.addIcon('functions',                                                             'GoogleMaterial', 'GoogleMaterial', 'e24a' );
sap.ui.core.IconPool.addIcon('g_translate',                                                           'GoogleMaterial', 'GoogleMaterial', 'e927' );
sap.ui.core.IconPool.addIcon('gamepad',                                                               'GoogleMaterial', 'GoogleMaterial', 'e30f' );
sap.ui.core.IconPool.addIcon('games',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e021' );
sap.ui.core.IconPool.addIcon('gavel',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e90e' );
sap.ui.core.IconPool.addIcon('gesture',                                                               'GoogleMaterial', 'GoogleMaterial', 'e155' );
sap.ui.core.IconPool.addIcon('get_app',                                                               'GoogleMaterial', 'GoogleMaterial', 'e884' );
sap.ui.core.IconPool.addIcon('gif',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e908' );
sap.ui.core.IconPool.addIcon('golf_course',                                                           'GoogleMaterial', 'GoogleMaterial', 'eb45' );
sap.ui.core.IconPool.addIcon('gps_fixed',                                                             'GoogleMaterial', 'GoogleMaterial', 'e1b3' );
sap.ui.core.IconPool.addIcon('gps_not_fixed',                                                         'GoogleMaterial', 'GoogleMaterial', 'e1b4' );
sap.ui.core.IconPool.addIcon('gps_off',                                                               'GoogleMaterial', 'GoogleMaterial', 'e1b5' );
sap.ui.core.IconPool.addIcon('grade',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e885' );
sap.ui.core.IconPool.addIcon('gradient',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3e9' );
sap.ui.core.IconPool.addIcon('grain',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e3ea' );
sap.ui.core.IconPool.addIcon('graphic_eq',                                                            'GoogleMaterial', 'GoogleMaterial', 'e1b8' );
sap.ui.core.IconPool.addIcon('grid_off',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3eb' );
sap.ui.core.IconPool.addIcon('grid_on',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3ec' );
sap.ui.core.IconPool.addIcon('group',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e7ef' );
sap.ui.core.IconPool.addIcon('group_add',                                                             'GoogleMaterial', 'GoogleMaterial', 'e7f0' );
sap.ui.core.IconPool.addIcon('group_work',                                                            'GoogleMaterial', 'GoogleMaterial', 'e886' );
sap.ui.core.IconPool.addIcon('hd',                                                                    'GoogleMaterial', 'GoogleMaterial', 'e052' );
sap.ui.core.IconPool.addIcon('hdr_off',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3ed' );
sap.ui.core.IconPool.addIcon('hdr_on',                                                                'GoogleMaterial', 'GoogleMaterial', 'e3ee' );
sap.ui.core.IconPool.addIcon('hdr_strong',                                                            'GoogleMaterial', 'GoogleMaterial', 'e3f1' );
sap.ui.core.IconPool.addIcon('hdr_weak',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3f2' );
sap.ui.core.IconPool.addIcon('headset',                                                               'GoogleMaterial', 'GoogleMaterial', 'e310' );
sap.ui.core.IconPool.addIcon('headset_mic',                                                           'GoogleMaterial', 'GoogleMaterial', 'e311' );
sap.ui.core.IconPool.addIcon('healing',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3f3' );
sap.ui.core.IconPool.addIcon('hearing',                                                               'GoogleMaterial', 'GoogleMaterial', 'e023' );
sap.ui.core.IconPool.addIcon('help',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e887' );
sap.ui.core.IconPool.addIcon('help_outline',                                                          'GoogleMaterial', 'GoogleMaterial', 'e8fd' );
sap.ui.core.IconPool.addIcon('high_quality',                                                          'GoogleMaterial', 'GoogleMaterial', 'e024' );
sap.ui.core.IconPool.addIcon('highlight',                                                             'GoogleMaterial', 'GoogleMaterial', 'e25f' );
sap.ui.core.IconPool.addIcon('highlight_off',                                                         'GoogleMaterial', 'GoogleMaterial', 'e888' );
sap.ui.core.IconPool.addIcon('history',                                                               'GoogleMaterial', 'GoogleMaterial', 'e889' );
sap.ui.core.IconPool.addIcon('home',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e88a' );
sap.ui.core.IconPool.addIcon('hot_tub',                                                               'GoogleMaterial', 'GoogleMaterial', 'eb46' );
sap.ui.core.IconPool.addIcon('hotel',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e53a' );
sap.ui.core.IconPool.addIcon('hourglass_empty',                                                       'GoogleMaterial', 'GoogleMaterial', 'e88b' );
sap.ui.core.IconPool.addIcon('hourglass_full',                                                        'GoogleMaterial', 'GoogleMaterial', 'e88c' );
sap.ui.core.IconPool.addIcon('http',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e902' );
sap.ui.core.IconPool.addIcon('https',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e88d' );
sap.ui.core.IconPool.addIcon('image',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e3f4' );
sap.ui.core.IconPool.addIcon('image_aspect_ratio',                                                    'GoogleMaterial', 'GoogleMaterial', 'e3f5' );
sap.ui.core.IconPool.addIcon('import_contacts',                                                       'GoogleMaterial', 'GoogleMaterial', 'e0e0' );
sap.ui.core.IconPool.addIcon('import_export',                                                         'GoogleMaterial', 'GoogleMaterial', 'e0c3' );
sap.ui.core.IconPool.addIcon('important_devices',                                                     'GoogleMaterial', 'GoogleMaterial', 'e912' );
sap.ui.core.IconPool.addIcon('inbox',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e156' );
sap.ui.core.IconPool.addIcon('indeterminate_check_box',                                               'GoogleMaterial', 'GoogleMaterial', 'e909' );
sap.ui.core.IconPool.addIcon('info',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e88e' );
sap.ui.core.IconPool.addIcon('info_outline',                                                          'GoogleMaterial', 'GoogleMaterial', 'e88f' );
sap.ui.core.IconPool.addIcon('input',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e890' );
sap.ui.core.IconPool.addIcon('insert_chart',                                                          'GoogleMaterial', 'GoogleMaterial', 'e24b' );
sap.ui.core.IconPool.addIcon('insert_comment',                                                        'GoogleMaterial', 'GoogleMaterial', 'e24c' );
sap.ui.core.IconPool.addIcon('insert_drive_file',                                                     'GoogleMaterial', 'GoogleMaterial', 'e24d' );
sap.ui.core.IconPool.addIcon('insert_emoticon',                                                       'GoogleMaterial', 'GoogleMaterial', 'e24e' );
sap.ui.core.IconPool.addIcon('insert_invitation',                                                     'GoogleMaterial', 'GoogleMaterial', 'e24f' );
sap.ui.core.IconPool.addIcon('insert_link',                                                           'GoogleMaterial', 'GoogleMaterial', 'e250' );
sap.ui.core.IconPool.addIcon('insert_photo',                                                          'GoogleMaterial', 'GoogleMaterial', 'e251' );
sap.ui.core.IconPool.addIcon('invert_colors',                                                         'GoogleMaterial', 'GoogleMaterial', 'e891' );
sap.ui.core.IconPool.addIcon('invert_colors_off',                                                     'GoogleMaterial', 'GoogleMaterial', 'e0c4' );
sap.ui.core.IconPool.addIcon('iso',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e3f6' );
sap.ui.core.IconPool.addIcon('keyboard',                                                              'GoogleMaterial', 'GoogleMaterial', 'e312' );
sap.ui.core.IconPool.addIcon('keyboard_arrow_down',                                                   'GoogleMaterial', 'GoogleMaterial', 'e313' );
sap.ui.core.IconPool.addIcon('keyboard_arrow_left',                                                   'GoogleMaterial', 'GoogleMaterial', 'e314' );
sap.ui.core.IconPool.addIcon('keyboard_arrow_right',                                                  'GoogleMaterial', 'GoogleMaterial', 'e315' );
sap.ui.core.IconPool.addIcon('keyboard_arrow_up',                                                     'GoogleMaterial', 'GoogleMaterial', 'e316' );
sap.ui.core.IconPool.addIcon('keyboard_backspace',                                                    'GoogleMaterial', 'GoogleMaterial', 'e317' );
sap.ui.core.IconPool.addIcon('keyboard_capslock',                                                     'GoogleMaterial', 'GoogleMaterial', 'e318' );
sap.ui.core.IconPool.addIcon('keyboard_hide',                                                         'GoogleMaterial', 'GoogleMaterial', 'e31a' );
sap.ui.core.IconPool.addIcon('keyboard_return',                                                       'GoogleMaterial', 'GoogleMaterial', 'e31b' );
sap.ui.core.IconPool.addIcon('keyboard_tab',                                                          'GoogleMaterial', 'GoogleMaterial', 'e31c' );
sap.ui.core.IconPool.addIcon('keyboard_voice',                                                        'GoogleMaterial', 'GoogleMaterial', 'e31d' );
sap.ui.core.IconPool.addIcon('kitchen',                                                               'GoogleMaterial', 'GoogleMaterial', 'eb47' );
sap.ui.core.IconPool.addIcon('label',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e892' );
sap.ui.core.IconPool.addIcon('label_outline',                                                         'GoogleMaterial', 'GoogleMaterial', 'e893' );
sap.ui.core.IconPool.addIcon('landscape',                                                             'GoogleMaterial', 'GoogleMaterial', 'e3f7' );
sap.ui.core.IconPool.addIcon('language',                                                              'GoogleMaterial', 'GoogleMaterial', 'e894' );
sap.ui.core.IconPool.addIcon('laptop',                                                                'GoogleMaterial', 'GoogleMaterial', 'e31e' );
sap.ui.core.IconPool.addIcon('laptop_chromebook',                                                     'GoogleMaterial', 'GoogleMaterial', 'e31f' );
sap.ui.core.IconPool.addIcon('laptop_mac',                                                            'GoogleMaterial', 'GoogleMaterial', 'e320' );
sap.ui.core.IconPool.addIcon('laptop_windows',                                                        'GoogleMaterial', 'GoogleMaterial', 'e321' );
sap.ui.core.IconPool.addIcon('last_page',                                                             'GoogleMaterial', 'GoogleMaterial', 'e5dd' );
sap.ui.core.IconPool.addIcon('launch',                                                                'GoogleMaterial', 'GoogleMaterial', 'e895' );
sap.ui.core.IconPool.addIcon('layers',                                                                'GoogleMaterial', 'GoogleMaterial', 'e53b' );
sap.ui.core.IconPool.addIcon('layers_clear',                                                          'GoogleMaterial', 'GoogleMaterial', 'e53c' );
sap.ui.core.IconPool.addIcon('leak_add',                                                              'GoogleMaterial', 'GoogleMaterial', 'e3f8' );
sap.ui.core.IconPool.addIcon('leak_remove',                                                           'GoogleMaterial', 'GoogleMaterial', 'e3f9' );
sap.ui.core.IconPool.addIcon('lens',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e3fa' );
sap.ui.core.IconPool.addIcon('library_add',                                                           'GoogleMaterial', 'GoogleMaterial', 'e02e' );
sap.ui.core.IconPool.addIcon('library_books',                                                         'GoogleMaterial', 'GoogleMaterial', 'e02f' );
sap.ui.core.IconPool.addIcon('library_music',                                                         'GoogleMaterial', 'GoogleMaterial', 'e030' );
sap.ui.core.IconPool.addIcon('lightbulb_outline',                                                     'GoogleMaterial', 'GoogleMaterial', 'e90f' );
sap.ui.core.IconPool.addIcon('line_style',                                                            'GoogleMaterial', 'GoogleMaterial', 'e919' );
sap.ui.core.IconPool.addIcon('line_weight',                                                           'GoogleMaterial', 'GoogleMaterial', 'e91a' );
sap.ui.core.IconPool.addIcon('linear_scale',                                                          'GoogleMaterial', 'GoogleMaterial', 'e260' );
sap.ui.core.IconPool.addIcon('link',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e157' );
sap.ui.core.IconPool.addIcon('linked_camera',                                                         'GoogleMaterial', 'GoogleMaterial', 'e438' );
sap.ui.core.IconPool.addIcon('list',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e896' );
sap.ui.core.IconPool.addIcon('live_help',                                                             'GoogleMaterial', 'GoogleMaterial', 'e0c6' );
sap.ui.core.IconPool.addIcon('live_tv',                                                               'GoogleMaterial', 'GoogleMaterial', 'e639' );
sap.ui.core.IconPool.addIcon('local_activity',                                                        'GoogleMaterial', 'GoogleMaterial', 'e53f' );
sap.ui.core.IconPool.addIcon('local_airport',                                                         'GoogleMaterial', 'GoogleMaterial', 'e53d' );
sap.ui.core.IconPool.addIcon('local_atm',                                                             'GoogleMaterial', 'GoogleMaterial', 'e53e' );
sap.ui.core.IconPool.addIcon('local_bar',                                                             'GoogleMaterial', 'GoogleMaterial', 'e540' );
sap.ui.core.IconPool.addIcon('local_cafe',                                                            'GoogleMaterial', 'GoogleMaterial', 'e541' );
sap.ui.core.IconPool.addIcon('local_car_wash',                                                        'GoogleMaterial', 'GoogleMaterial', 'e542' );
sap.ui.core.IconPool.addIcon('local_convenience_store',                                               'GoogleMaterial', 'GoogleMaterial', 'e543' );
sap.ui.core.IconPool.addIcon('local_dining',                                                          'GoogleMaterial', 'GoogleMaterial', 'e556' );
sap.ui.core.IconPool.addIcon('local_drink',                                                           'GoogleMaterial', 'GoogleMaterial', 'e544' );
sap.ui.core.IconPool.addIcon('local_florist',                                                         'GoogleMaterial', 'GoogleMaterial', 'e545' );
sap.ui.core.IconPool.addIcon('local_gas_station',                                                     'GoogleMaterial', 'GoogleMaterial', 'e546' );
sap.ui.core.IconPool.addIcon('local_grocery_store',                                                   'GoogleMaterial', 'GoogleMaterial', 'e547' );
sap.ui.core.IconPool.addIcon('local_hospital',                                                        'GoogleMaterial', 'GoogleMaterial', 'e548' );
sap.ui.core.IconPool.addIcon('local_hotel',                                                           'GoogleMaterial', 'GoogleMaterial', 'e549' );
sap.ui.core.IconPool.addIcon('local_laundry_service',                                                 'GoogleMaterial', 'GoogleMaterial', 'e54a' );
sap.ui.core.IconPool.addIcon('local_library',                                                         'GoogleMaterial', 'GoogleMaterial', 'e54b' );
sap.ui.core.IconPool.addIcon('local_mall',                                                            'GoogleMaterial', 'GoogleMaterial', 'e54c' );
sap.ui.core.IconPool.addIcon('local_movies',                                                          'GoogleMaterial', 'GoogleMaterial', 'e54d' );
sap.ui.core.IconPool.addIcon('local_offer',                                                           'GoogleMaterial', 'GoogleMaterial', 'e54e' );
sap.ui.core.IconPool.addIcon('local_parking',                                                         'GoogleMaterial', 'GoogleMaterial', 'e54f' );
sap.ui.core.IconPool.addIcon('local_pharmacy',                                                        'GoogleMaterial', 'GoogleMaterial', 'e550' );
sap.ui.core.IconPool.addIcon('local_phone',                                                           'GoogleMaterial', 'GoogleMaterial', 'e551' );
sap.ui.core.IconPool.addIcon('local_pizza',                                                           'GoogleMaterial', 'GoogleMaterial', 'e552' );
sap.ui.core.IconPool.addIcon('local_play',                                                            'GoogleMaterial', 'GoogleMaterial', 'e553' );
sap.ui.core.IconPool.addIcon('local_post_office',                                                     'GoogleMaterial', 'GoogleMaterial', 'e554' );
sap.ui.core.IconPool.addIcon('local_printshop',                                                       'GoogleMaterial', 'GoogleMaterial', 'e555' );
sap.ui.core.IconPool.addIcon('local_see',                                                             'GoogleMaterial', 'GoogleMaterial', 'e557' );
sap.ui.core.IconPool.addIcon('local_shipping',                                                        'GoogleMaterial', 'GoogleMaterial', 'e558' );
sap.ui.core.IconPool.addIcon('local_taxi',                                                            'GoogleMaterial', 'GoogleMaterial', 'e559' );
sap.ui.core.IconPool.addIcon('location_city',                                                         'GoogleMaterial', 'GoogleMaterial', 'e7f1' );
sap.ui.core.IconPool.addIcon('location_disabled',                                                     'GoogleMaterial', 'GoogleMaterial', 'e1b6' );
sap.ui.core.IconPool.addIcon('location_off',                                                          'GoogleMaterial', 'GoogleMaterial', 'e0c7' );
sap.ui.core.IconPool.addIcon('location_on',                                                           'GoogleMaterial', 'GoogleMaterial', 'e0c8' );
sap.ui.core.IconPool.addIcon('location_searching',                                                    'GoogleMaterial', 'GoogleMaterial', 'e1b7' );
sap.ui.core.IconPool.addIcon('lock',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e897' );
sap.ui.core.IconPool.addIcon('lock_open',                                                             'GoogleMaterial', 'GoogleMaterial', 'e898' );
sap.ui.core.IconPool.addIcon('lock_outline',                                                          'GoogleMaterial', 'GoogleMaterial', 'e899' );
sap.ui.core.IconPool.addIcon('looks',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e3fc' );
sap.ui.core.IconPool.addIcon('looks_3',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3fb' );
sap.ui.core.IconPool.addIcon('looks_4',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3fd' );
sap.ui.core.IconPool.addIcon('looks_5',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3fe' );
sap.ui.core.IconPool.addIcon('looks_6',                                                               'GoogleMaterial', 'GoogleMaterial', 'e3ff' );
sap.ui.core.IconPool.addIcon('looks_one',                                                             'GoogleMaterial', 'GoogleMaterial', 'e400' );
sap.ui.core.IconPool.addIcon('looks_two',                                                             'GoogleMaterial', 'GoogleMaterial', 'e401' );
sap.ui.core.IconPool.addIcon('loop',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e028' );
sap.ui.core.IconPool.addIcon('loupe',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e402' );
sap.ui.core.IconPool.addIcon('low_priority',                                                          'GoogleMaterial', 'GoogleMaterial', 'e16d' );
sap.ui.core.IconPool.addIcon('loyalty',                                                               'GoogleMaterial', 'GoogleMaterial', 'e89a' );
sap.ui.core.IconPool.addIcon('mail',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e158' );
sap.ui.core.IconPool.addIcon('mail_outline',                                                          'GoogleMaterial', 'GoogleMaterial', 'e0e1' );
sap.ui.core.IconPool.addIcon('map',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e55b' );
sap.ui.core.IconPool.addIcon('markunread',                                                            'GoogleMaterial', 'GoogleMaterial', 'e159' );
sap.ui.core.IconPool.addIcon('markunread_mailbox',                                                    'GoogleMaterial', 'GoogleMaterial', 'e89b' );
sap.ui.core.IconPool.addIcon('memory',                                                                'GoogleMaterial', 'GoogleMaterial', 'e322' );
sap.ui.core.IconPool.addIcon('menu',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e5d2' );
sap.ui.core.IconPool.addIcon('merge_type',                                                            'GoogleMaterial', 'GoogleMaterial', 'e252' );
sap.ui.core.IconPool.addIcon('message',                                                               'GoogleMaterial', 'GoogleMaterial', 'e0c9' );
sap.ui.core.IconPool.addIcon('mic',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e029' );
sap.ui.core.IconPool.addIcon('mic_none',                                                              'GoogleMaterial', 'GoogleMaterial', 'e02a' );
sap.ui.core.IconPool.addIcon('mic_off',                                                               'GoogleMaterial', 'GoogleMaterial', 'e02b' );
sap.ui.core.IconPool.addIcon('mms',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e618' );
sap.ui.core.IconPool.addIcon('mode_comment',                                                          'GoogleMaterial', 'GoogleMaterial', 'e253' );
sap.ui.core.IconPool.addIcon('mode_edit',                                                             'GoogleMaterial', 'GoogleMaterial', 'e254' );
sap.ui.core.IconPool.addIcon('monetization_on',                                                       'GoogleMaterial', 'GoogleMaterial', 'e263' );
sap.ui.core.IconPool.addIcon('money_off',                                                             'GoogleMaterial', 'GoogleMaterial', 'e25c' );
sap.ui.core.IconPool.addIcon('monochrome_photos',                                                     'GoogleMaterial', 'GoogleMaterial', 'e403' );
sap.ui.core.IconPool.addIcon('mood',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e7f2' );
sap.ui.core.IconPool.addIcon('mood_bad',                                                              'GoogleMaterial', 'GoogleMaterial', 'e7f3' );
sap.ui.core.IconPool.addIcon('more',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e619' );
sap.ui.core.IconPool.addIcon('more_horiz',                                                            'GoogleMaterial', 'GoogleMaterial', 'e5d3' );
sap.ui.core.IconPool.addIcon('more_vert',                                                             'GoogleMaterial', 'GoogleMaterial', 'e5d4' );
sap.ui.core.IconPool.addIcon('motorcycle',                                                            'GoogleMaterial', 'GoogleMaterial', 'e91b' );
sap.ui.core.IconPool.addIcon('mouse',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e323' );
sap.ui.core.IconPool.addIcon('move_to_inbox',                                                         'GoogleMaterial', 'GoogleMaterial', 'e168' );
sap.ui.core.IconPool.addIcon('movie',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e02c' );
sap.ui.core.IconPool.addIcon('movie_creation',                                                        'GoogleMaterial', 'GoogleMaterial', 'e404' );
sap.ui.core.IconPool.addIcon('movie_filter',                                                          'GoogleMaterial', 'GoogleMaterial', 'e43a' );
sap.ui.core.IconPool.addIcon('multiline_chart',                                                       'GoogleMaterial', 'GoogleMaterial', 'e6df' );
sap.ui.core.IconPool.addIcon('music_note',                                                            'GoogleMaterial', 'GoogleMaterial', 'e405' );
sap.ui.core.IconPool.addIcon('music_video',                                                           'GoogleMaterial', 'GoogleMaterial', 'e063' );
sap.ui.core.IconPool.addIcon('my_location',                                                           'GoogleMaterial', 'GoogleMaterial', 'e55c' );
sap.ui.core.IconPool.addIcon('nature',                                                                'GoogleMaterial', 'GoogleMaterial', 'e406' );
sap.ui.core.IconPool.addIcon('nature_people',                                                         'GoogleMaterial', 'GoogleMaterial', 'e407' );
sap.ui.core.IconPool.addIcon('navigate_before',                                                       'GoogleMaterial', 'GoogleMaterial', 'e408' );
sap.ui.core.IconPool.addIcon('navigate_next',                                                         'GoogleMaterial', 'GoogleMaterial', 'e409' );
sap.ui.core.IconPool.addIcon('navigation',                                                            'GoogleMaterial', 'GoogleMaterial', 'e55d' );
sap.ui.core.IconPool.addIcon('near_me',                                                               'GoogleMaterial', 'GoogleMaterial', 'e569' );
sap.ui.core.IconPool.addIcon('network_cell',                                                          'GoogleMaterial', 'GoogleMaterial', 'e1b9' );
sap.ui.core.IconPool.addIcon('network_check',                                                         'GoogleMaterial', 'GoogleMaterial', 'e640' );
sap.ui.core.IconPool.addIcon('network_locked',                                                        'GoogleMaterial', 'GoogleMaterial', 'e61a' );
sap.ui.core.IconPool.addIcon('network_wifi',                                                          'GoogleMaterial', 'GoogleMaterial', 'e1ba' );
sap.ui.core.IconPool.addIcon('new_releases',                                                          'GoogleMaterial', 'GoogleMaterial', 'e031' );
sap.ui.core.IconPool.addIcon('next_week',                                                             'GoogleMaterial', 'GoogleMaterial', 'e16a' );
sap.ui.core.IconPool.addIcon('nfc',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e1bb' );
sap.ui.core.IconPool.addIcon('no_encryption',                                                         'GoogleMaterial', 'GoogleMaterial', 'e641' );
sap.ui.core.IconPool.addIcon('no_sim',                                                                'GoogleMaterial', 'GoogleMaterial', 'e0cc' );
sap.ui.core.IconPool.addIcon('not_interested',                                                        'GoogleMaterial', 'GoogleMaterial', 'e033' );
sap.ui.core.IconPool.addIcon('note',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e06f' );
sap.ui.core.IconPool.addIcon('note_add',                                                              'GoogleMaterial', 'GoogleMaterial', 'e89c' );
sap.ui.core.IconPool.addIcon('notifications',                                                         'GoogleMaterial', 'GoogleMaterial', 'e7f4' );
sap.ui.core.IconPool.addIcon('notifications_active',                                                  'GoogleMaterial', 'GoogleMaterial', 'e7f7' );
sap.ui.core.IconPool.addIcon('notifications_none',                                                    'GoogleMaterial', 'GoogleMaterial', 'e7f5' );
sap.ui.core.IconPool.addIcon('notifications_off',                                                     'GoogleMaterial', 'GoogleMaterial', 'e7f6' );
sap.ui.core.IconPool.addIcon('notifications_paused',                                                  'GoogleMaterial', 'GoogleMaterial', 'e7f8' );
sap.ui.core.IconPool.addIcon('offline_pin',                                                           'GoogleMaterial', 'GoogleMaterial', 'e90a' );
sap.ui.core.IconPool.addIcon('ondemand_video',                                                        'GoogleMaterial', 'GoogleMaterial', 'e63a' );
sap.ui.core.IconPool.addIcon('opacity',                                                               'GoogleMaterial', 'GoogleMaterial', 'e91c' );
sap.ui.core.IconPool.addIcon('open_in_browser',                                                       'GoogleMaterial', 'GoogleMaterial', 'e89d' );
sap.ui.core.IconPool.addIcon('open_in_new',                                                           'GoogleMaterial', 'GoogleMaterial', 'e89e' );
sap.ui.core.IconPool.addIcon('open_with',                                                             'GoogleMaterial', 'GoogleMaterial', 'e89f' );
sap.ui.core.IconPool.addIcon('pages',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e7f9' );
sap.ui.core.IconPool.addIcon('pageview',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8a0' );
sap.ui.core.IconPool.addIcon('palette',                                                               'GoogleMaterial', 'GoogleMaterial', 'e40a' );
sap.ui.core.IconPool.addIcon('pan_tool',                                                              'GoogleMaterial', 'GoogleMaterial', 'e925' );
sap.ui.core.IconPool.addIcon('panorama',                                                              'GoogleMaterial', 'GoogleMaterial', 'e40b' );
sap.ui.core.IconPool.addIcon('panorama_fish_eye',                                                     'GoogleMaterial', 'GoogleMaterial', 'e40c' );
sap.ui.core.IconPool.addIcon('panorama_horizontal',                                                   'GoogleMaterial', 'GoogleMaterial', 'e40d' );
sap.ui.core.IconPool.addIcon('panorama_vertical',                                                     'GoogleMaterial', 'GoogleMaterial', 'e40e' );
sap.ui.core.IconPool.addIcon('panorama_wide_angle',                                                   'GoogleMaterial', 'GoogleMaterial', 'e40f' );
sap.ui.core.IconPool.addIcon('party_mode',                                                            'GoogleMaterial', 'GoogleMaterial', 'e7fa' );
sap.ui.core.IconPool.addIcon('pause',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e034' );
sap.ui.core.IconPool.addIcon('pause_circle_filled',                                                   'GoogleMaterial', 'GoogleMaterial', 'e035' );
sap.ui.core.IconPool.addIcon('pause_circle_outline',                                                  'GoogleMaterial', 'GoogleMaterial', 'e036' );
sap.ui.core.IconPool.addIcon('payment',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8a1' );
sap.ui.core.IconPool.addIcon('people',                                                                'GoogleMaterial', 'GoogleMaterial', 'e7fb' );
sap.ui.core.IconPool.addIcon('people_outline',                                                        'GoogleMaterial', 'GoogleMaterial', 'e7fc' );
sap.ui.core.IconPool.addIcon('perm_camera_mic',                                                       'GoogleMaterial', 'GoogleMaterial', 'e8a2' );
sap.ui.core.IconPool.addIcon('perm_contact_calendar',                                                 'GoogleMaterial', 'GoogleMaterial', 'e8a3' );
sap.ui.core.IconPool.addIcon('perm_data_setting',                                                     'GoogleMaterial', 'GoogleMaterial', 'e8a4' );
sap.ui.core.IconPool.addIcon('perm_device_information',                                               'GoogleMaterial', 'GoogleMaterial', 'e8a5' );
sap.ui.core.IconPool.addIcon('perm_identity',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8a6' );
sap.ui.core.IconPool.addIcon('perm_media',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8a7' );
sap.ui.core.IconPool.addIcon('perm_phone_msg',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8a8' );
sap.ui.core.IconPool.addIcon('perm_scan_wifi',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8a9' );
sap.ui.core.IconPool.addIcon('person',                                                                'GoogleMaterial', 'GoogleMaterial', 'e7fd' );
sap.ui.core.IconPool.addIcon('person_add',                                                            'GoogleMaterial', 'GoogleMaterial', 'e7fe' );
sap.ui.core.IconPool.addIcon('person_outline',                                                        'GoogleMaterial', 'GoogleMaterial', 'e7ff' );
sap.ui.core.IconPool.addIcon('person_pin',                                                            'GoogleMaterial', 'GoogleMaterial', 'e55a' );
sap.ui.core.IconPool.addIcon('person_pin_circle',                                                     'GoogleMaterial', 'GoogleMaterial', 'e56a' );
sap.ui.core.IconPool.addIcon('personal_video',                                                        'GoogleMaterial', 'GoogleMaterial', 'e63b' );
sap.ui.core.IconPool.addIcon('pets',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e91d' );
sap.ui.core.IconPool.addIcon('phone',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e0cd' );
sap.ui.core.IconPool.addIcon('phone_android',                                                         'GoogleMaterial', 'GoogleMaterial', 'e324' );
sap.ui.core.IconPool.addIcon('phone_bluetooth_speaker',                                               'GoogleMaterial', 'GoogleMaterial', 'e61b' );
sap.ui.core.IconPool.addIcon('phone_forwarded',                                                       'GoogleMaterial', 'GoogleMaterial', 'e61c' );
sap.ui.core.IconPool.addIcon('phone_in_talk',                                                         'GoogleMaterial', 'GoogleMaterial', 'e61d' );
sap.ui.core.IconPool.addIcon('phone_iphone',                                                          'GoogleMaterial', 'GoogleMaterial', 'e325' );
sap.ui.core.IconPool.addIcon('phone_locked',                                                          'GoogleMaterial', 'GoogleMaterial', 'e61e' );
sap.ui.core.IconPool.addIcon('phone_missed',                                                          'GoogleMaterial', 'GoogleMaterial', 'e61f' );
sap.ui.core.IconPool.addIcon('phone_paused',                                                          'GoogleMaterial', 'GoogleMaterial', 'e620' );
sap.ui.core.IconPool.addIcon('phonelink',                                                             'GoogleMaterial', 'GoogleMaterial', 'e326' );
sap.ui.core.IconPool.addIcon('phonelink_erase',                                                       'GoogleMaterial', 'GoogleMaterial', 'e0db' );
sap.ui.core.IconPool.addIcon('phonelink_lock',                                                        'GoogleMaterial', 'GoogleMaterial', 'e0dc' );
sap.ui.core.IconPool.addIcon('phonelink_off',                                                         'GoogleMaterial', 'GoogleMaterial', 'e327' );
sap.ui.core.IconPool.addIcon('phonelink_ring',                                                        'GoogleMaterial', 'GoogleMaterial', 'e0dd' );
sap.ui.core.IconPool.addIcon('phonelink_setup',                                                       'GoogleMaterial', 'GoogleMaterial', 'e0de' );
sap.ui.core.IconPool.addIcon('photo',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e410' );
sap.ui.core.IconPool.addIcon('photo_album',                                                           'GoogleMaterial', 'GoogleMaterial', 'e411' );
sap.ui.core.IconPool.addIcon('photo_camera',                                                          'GoogleMaterial', 'GoogleMaterial', 'e412' );
sap.ui.core.IconPool.addIcon('photo_filter',                                                          'GoogleMaterial', 'GoogleMaterial', 'e43b' );
sap.ui.core.IconPool.addIcon('photo_library',                                                         'GoogleMaterial', 'GoogleMaterial', 'e413' );
sap.ui.core.IconPool.addIcon('photo_size_select_actual',                                              'GoogleMaterial', 'GoogleMaterial', 'e432' );
sap.ui.core.IconPool.addIcon('photo_size_select_large',                                               'GoogleMaterial', 'GoogleMaterial', 'e433' );
sap.ui.core.IconPool.addIcon('photo_size_select_small',                                               'GoogleMaterial', 'GoogleMaterial', 'e434' );
sap.ui.core.IconPool.addIcon('picture_as_pdf',                                                        'GoogleMaterial', 'GoogleMaterial', 'e415' );
sap.ui.core.IconPool.addIcon('picture_in_picture',                                                    'GoogleMaterial', 'GoogleMaterial', 'e8aa' );
sap.ui.core.IconPool.addIcon('picture_in_picture_alt',                                                'GoogleMaterial', 'GoogleMaterial', 'e911' );
sap.ui.core.IconPool.addIcon('pie_chart',                                                             'GoogleMaterial', 'GoogleMaterial', 'e6c4' );
sap.ui.core.IconPool.addIcon('pie_chart_outlined',                                                    'GoogleMaterial', 'GoogleMaterial', 'e6c5' );
sap.ui.core.IconPool.addIcon('pin_drop',                                                              'GoogleMaterial', 'GoogleMaterial', 'e55e' );
sap.ui.core.IconPool.addIcon('place',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e55f' );
sap.ui.core.IconPool.addIcon('play_arrow',                                                            'GoogleMaterial', 'GoogleMaterial', 'e037' );
sap.ui.core.IconPool.addIcon('play_circle_filled',                                                    'GoogleMaterial', 'GoogleMaterial', 'e038' );
sap.ui.core.IconPool.addIcon('play_circle_outline',                                                   'GoogleMaterial', 'GoogleMaterial', 'e039' );
sap.ui.core.IconPool.addIcon('play_for_work',                                                         'GoogleMaterial', 'GoogleMaterial', 'e906' );
sap.ui.core.IconPool.addIcon('playlist_add',                                                          'GoogleMaterial', 'GoogleMaterial', 'e03b' );
sap.ui.core.IconPool.addIcon('playlist_add_check',                                                    'GoogleMaterial', 'GoogleMaterial', 'e065' );
sap.ui.core.IconPool.addIcon('playlist_play',                                                         'GoogleMaterial', 'GoogleMaterial', 'e05f' );
sap.ui.core.IconPool.addIcon('plus_one',                                                              'GoogleMaterial', 'GoogleMaterial', 'e800' );
sap.ui.core.IconPool.addIcon('poll',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e801' );
sap.ui.core.IconPool.addIcon('polymer',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8ab' );
sap.ui.core.IconPool.addIcon('pool',                                                                  'GoogleMaterial', 'GoogleMaterial', 'eb48' );
sap.ui.core.IconPool.addIcon('portable_wifi_off',                                                     'GoogleMaterial', 'GoogleMaterial', 'e0ce' );
sap.ui.core.IconPool.addIcon('portrait',                                                              'GoogleMaterial', 'GoogleMaterial', 'e416' );
sap.ui.core.IconPool.addIcon('power',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e63c' );
sap.ui.core.IconPool.addIcon('power_input',                                                           'GoogleMaterial', 'GoogleMaterial', 'e336' );
sap.ui.core.IconPool.addIcon('power_settings_new',                                                    'GoogleMaterial', 'GoogleMaterial', 'e8ac' );
sap.ui.core.IconPool.addIcon('pregnant_woman',                                                        'GoogleMaterial', 'GoogleMaterial', 'e91e' );
sap.ui.core.IconPool.addIcon('present_to_all',                                                        'GoogleMaterial', 'GoogleMaterial', 'e0df' );
sap.ui.core.IconPool.addIcon('print',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e8ad' );
sap.ui.core.IconPool.addIcon('priority_high',                                                         'GoogleMaterial', 'GoogleMaterial', 'e645' );
sap.ui.core.IconPool.addIcon('public',                                                                'GoogleMaterial', 'GoogleMaterial', 'e80b' );
sap.ui.core.IconPool.addIcon('publish',                                                               'GoogleMaterial', 'GoogleMaterial', 'e255' );
sap.ui.core.IconPool.addIcon('query_builder',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8ae' );
sap.ui.core.IconPool.addIcon('question_answer',                                                       'GoogleMaterial', 'GoogleMaterial', 'e8af' );
sap.ui.core.IconPool.addIcon('queue',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e03c' );
sap.ui.core.IconPool.addIcon('queue_music',                                                           'GoogleMaterial', 'GoogleMaterial', 'e03d' );
sap.ui.core.IconPool.addIcon('queue_play_next',                                                       'GoogleMaterial', 'GoogleMaterial', 'e066' );
sap.ui.core.IconPool.addIcon('radio',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e03e' );
sap.ui.core.IconPool.addIcon('radio_button_checked',                                                  'GoogleMaterial', 'GoogleMaterial', 'e837' );
sap.ui.core.IconPool.addIcon('radio_button_unchecked',                                                'GoogleMaterial', 'GoogleMaterial', 'e836' );
sap.ui.core.IconPool.addIcon('rate_review',                                                           'GoogleMaterial', 'GoogleMaterial', 'e560' );
sap.ui.core.IconPool.addIcon('receipt',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8b0' );
sap.ui.core.IconPool.addIcon('recent_actors',                                                         'GoogleMaterial', 'GoogleMaterial', 'e03f' );
sap.ui.core.IconPool.addIcon('record_voice_over',                                                     'GoogleMaterial', 'GoogleMaterial', 'e91f' );
sap.ui.core.IconPool.addIcon('redeem',                                                                'GoogleMaterial', 'GoogleMaterial', 'e8b1' );
sap.ui.core.IconPool.addIcon('redo',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e15a' );
sap.ui.core.IconPool.addIcon('refresh',                                                               'GoogleMaterial', 'GoogleMaterial', 'e5d5' );
sap.ui.core.IconPool.addIcon('remove',                                                                'GoogleMaterial', 'GoogleMaterial', 'e15b' );
sap.ui.core.IconPool.addIcon('remove_circle',                                                         'GoogleMaterial', 'GoogleMaterial', 'e15c' );
sap.ui.core.IconPool.addIcon('remove_circle_outline',                                                 'GoogleMaterial', 'GoogleMaterial', 'e15d' );
sap.ui.core.IconPool.addIcon('remove_from_queue',                                                     'GoogleMaterial', 'GoogleMaterial', 'e067' );
sap.ui.core.IconPool.addIcon('remove_red_eye',                                                        'GoogleMaterial', 'GoogleMaterial', 'e417' );
sap.ui.core.IconPool.addIcon('remove_shopping_cart',                                                  'GoogleMaterial', 'GoogleMaterial', 'e928' );
sap.ui.core.IconPool.addIcon('reorder',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8fe' );
sap.ui.core.IconPool.addIcon('repeat',                                                                'GoogleMaterial', 'GoogleMaterial', 'e040' );
sap.ui.core.IconPool.addIcon('repeat_one',                                                            'GoogleMaterial', 'GoogleMaterial', 'e041' );
sap.ui.core.IconPool.addIcon('replay',                                                                'GoogleMaterial', 'GoogleMaterial', 'e042' );
sap.ui.core.IconPool.addIcon('replay_10',                                                             'GoogleMaterial', 'GoogleMaterial', 'e059' );
sap.ui.core.IconPool.addIcon('replay_30',                                                             'GoogleMaterial', 'GoogleMaterial', 'e05a' );
sap.ui.core.IconPool.addIcon('replay_5',                                                              'GoogleMaterial', 'GoogleMaterial', 'e05b' );
sap.ui.core.IconPool.addIcon('reply',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e15e' );
sap.ui.core.IconPool.addIcon('reply_all',                                                             'GoogleMaterial', 'GoogleMaterial', 'e15f' );
sap.ui.core.IconPool.addIcon('report',                                                                'GoogleMaterial', 'GoogleMaterial', 'e160' );
sap.ui.core.IconPool.addIcon('report_problem',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8b2' );
sap.ui.core.IconPool.addIcon('restaurant',                                                            'GoogleMaterial', 'GoogleMaterial', 'e56c' );
sap.ui.core.IconPool.addIcon('restaurant_menu',                                                       'GoogleMaterial', 'GoogleMaterial', 'e561' );
sap.ui.core.IconPool.addIcon('restore',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8b3' );
sap.ui.core.IconPool.addIcon('restore_page',                                                          'GoogleMaterial', 'GoogleMaterial', 'e929' );
sap.ui.core.IconPool.addIcon('ring_volume',                                                           'GoogleMaterial', 'GoogleMaterial', 'e0d1' );
sap.ui.core.IconPool.addIcon('room',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e8b4' );
sap.ui.core.IconPool.addIcon('room_service',                                                          'GoogleMaterial', 'GoogleMaterial', 'eb49' );
sap.ui.core.IconPool.addIcon('rotate_90_degrees_ccw',                                                 'GoogleMaterial', 'GoogleMaterial', 'e418' );
sap.ui.core.IconPool.addIcon('rotate_left',                                                           'GoogleMaterial', 'GoogleMaterial', 'e419' );
sap.ui.core.IconPool.addIcon('rotate_right',                                                          'GoogleMaterial', 'GoogleMaterial', 'e41a' );
sap.ui.core.IconPool.addIcon('rounded_corner',                                                        'GoogleMaterial', 'GoogleMaterial', 'e920' );
sap.ui.core.IconPool.addIcon('router',                                                                'GoogleMaterial', 'GoogleMaterial', 'e328' );
sap.ui.core.IconPool.addIcon('rowing',                                                                'GoogleMaterial', 'GoogleMaterial', 'e921' );
sap.ui.core.IconPool.addIcon('rss_feed',                                                              'GoogleMaterial', 'GoogleMaterial', 'e0e5' );
sap.ui.core.IconPool.addIcon('rv_hookup',                                                             'GoogleMaterial', 'GoogleMaterial', 'e642' );
sap.ui.core.IconPool.addIcon('satellite',                                                             'GoogleMaterial', 'GoogleMaterial', 'e562' );
sap.ui.core.IconPool.addIcon('save',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e161' );
sap.ui.core.IconPool.addIcon('scanner',                                                               'GoogleMaterial', 'GoogleMaterial', 'e329' );
sap.ui.core.IconPool.addIcon('schedule',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8b5' );
sap.ui.core.IconPool.addIcon('school',                                                                'GoogleMaterial', 'GoogleMaterial', 'e80c' );
sap.ui.core.IconPool.addIcon('screen_lock_landscape',                                                 'GoogleMaterial', 'GoogleMaterial', 'e1be' );
sap.ui.core.IconPool.addIcon('screen_lock_portrait',                                                  'GoogleMaterial', 'GoogleMaterial', 'e1bf' );
sap.ui.core.IconPool.addIcon('screen_lock_rotation',                                                  'GoogleMaterial', 'GoogleMaterial', 'e1c0' );
sap.ui.core.IconPool.addIcon('screen_rotation',                                                       'GoogleMaterial', 'GoogleMaterial', 'e1c1' );
sap.ui.core.IconPool.addIcon('screen_share',                                                          'GoogleMaterial', 'GoogleMaterial', 'e0e2' );
sap.ui.core.IconPool.addIcon('sd_card',                                                               'GoogleMaterial', 'GoogleMaterial', 'e623' );
sap.ui.core.IconPool.addIcon('sd_storage',                                                            'GoogleMaterial', 'GoogleMaterial', 'e1c2' );
sap.ui.core.IconPool.addIcon('search',                                                                'GoogleMaterial', 'GoogleMaterial', 'e8b6' );
sap.ui.core.IconPool.addIcon('security',                                                              'GoogleMaterial', 'GoogleMaterial', 'e32a' );
sap.ui.core.IconPool.addIcon('select_all',                                                            'GoogleMaterial', 'GoogleMaterial', 'e162' );
sap.ui.core.IconPool.addIcon('send',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e163' );
sap.ui.core.IconPool.addIcon('sentiment_dissatisfied',                                                'GoogleMaterial', 'GoogleMaterial', 'e811' );
sap.ui.core.IconPool.addIcon('sentiment_neutral',                                                     'GoogleMaterial', 'GoogleMaterial', 'e812' );
sap.ui.core.IconPool.addIcon('sentiment_satisfied',                                                   'GoogleMaterial', 'GoogleMaterial', 'e813' );
sap.ui.core.IconPool.addIcon('sentiment_very_dissatisfied',                                           'GoogleMaterial', 'GoogleMaterial', 'e814' );
sap.ui.core.IconPool.addIcon('sentiment_very_satisfied',                                              'GoogleMaterial', 'GoogleMaterial', 'e815' );
sap.ui.core.IconPool.addIcon('settings',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8b8' );
sap.ui.core.IconPool.addIcon('settings_applications',                                                 'GoogleMaterial', 'GoogleMaterial', 'e8b9' );
sap.ui.core.IconPool.addIcon('settings_backup_restore',                                               'GoogleMaterial', 'GoogleMaterial', 'e8ba' );
sap.ui.core.IconPool.addIcon('settings_bluetooth',                                                    'GoogleMaterial', 'GoogleMaterial', 'e8bb' );
sap.ui.core.IconPool.addIcon('settings_brightness',                                                   'GoogleMaterial', 'GoogleMaterial', 'e8bd' );
sap.ui.core.IconPool.addIcon('settings_cell',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8bc' );
sap.ui.core.IconPool.addIcon('settings_ethernet',                                                     'GoogleMaterial', 'GoogleMaterial', 'e8be' );
sap.ui.core.IconPool.addIcon('settings_input_antenna',                                                'GoogleMaterial', 'GoogleMaterial', 'e8bf' );
sap.ui.core.IconPool.addIcon('settings_input_component',                                              'GoogleMaterial', 'GoogleMaterial', 'e8c0' );
sap.ui.core.IconPool.addIcon('settings_input_composite',                                              'GoogleMaterial', 'GoogleMaterial', 'e8c1' );
sap.ui.core.IconPool.addIcon('settings_input_hdmi',                                                   'GoogleMaterial', 'GoogleMaterial', 'e8c2' );
sap.ui.core.IconPool.addIcon('settings_input_svideo',                                                 'GoogleMaterial', 'GoogleMaterial', 'e8c3' );
sap.ui.core.IconPool.addIcon('settings_overscan',                                                     'GoogleMaterial', 'GoogleMaterial', 'e8c4' );
sap.ui.core.IconPool.addIcon('settings_phone',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8c5' );
sap.ui.core.IconPool.addIcon('settings_power',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8c6' );
sap.ui.core.IconPool.addIcon('settings_remote',                                                       'GoogleMaterial', 'GoogleMaterial', 'e8c7' );
sap.ui.core.IconPool.addIcon('settings_system_daydream',                                              'GoogleMaterial', 'GoogleMaterial', 'e1c3' );
sap.ui.core.IconPool.addIcon('settings_voice',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8c8' );
sap.ui.core.IconPool.addIcon('share',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e80d' );
sap.ui.core.IconPool.addIcon('shop',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e8c9' );
sap.ui.core.IconPool.addIcon('shop_two',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8ca' );
sap.ui.core.IconPool.addIcon('shopping_basket',                                                       'GoogleMaterial', 'GoogleMaterial', 'e8cb' );
sap.ui.core.IconPool.addIcon('shopping_cart',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8cc' );
sap.ui.core.IconPool.addIcon('short_text',                                                            'GoogleMaterial', 'GoogleMaterial', 'e261' );
sap.ui.core.IconPool.addIcon('show_chart',                                                            'GoogleMaterial', 'GoogleMaterial', 'e6e1' );
sap.ui.core.IconPool.addIcon('shuffle',                                                               'GoogleMaterial', 'GoogleMaterial', 'e043' );
sap.ui.core.IconPool.addIcon('signal_cellular_4_bar',                                                 'GoogleMaterial', 'GoogleMaterial', 'e1c8' );
sap.ui.core.IconPool.addIcon('signal_cellular_connected_no_internet_4_bar',                           'GoogleMaterial', 'GoogleMaterial', 'e1cd' );
sap.ui.core.IconPool.addIcon('signal_cellular_no_sim',                                                'GoogleMaterial', 'GoogleMaterial', 'e1ce' );
sap.ui.core.IconPool.addIcon('signal_cellular_null',                                                  'GoogleMaterial', 'GoogleMaterial', 'e1cf' );
sap.ui.core.IconPool.addIcon('signal_cellular_off',                                                   'GoogleMaterial', 'GoogleMaterial', 'e1d0' );
sap.ui.core.IconPool.addIcon('signal_wifi_4_bar',                                                     'GoogleMaterial', 'GoogleMaterial', 'e1d8' );
sap.ui.core.IconPool.addIcon('signal_wifi_4_bar_lock',                                                'GoogleMaterial', 'GoogleMaterial', 'e1d9' );
sap.ui.core.IconPool.addIcon('signal_wifi_off',                                                       'GoogleMaterial', 'GoogleMaterial', 'e1da' );
sap.ui.core.IconPool.addIcon('sim_card',                                                              'GoogleMaterial', 'GoogleMaterial', 'e32b' );
sap.ui.core.IconPool.addIcon('sim_card_alert',                                                        'GoogleMaterial', 'GoogleMaterial', 'e624' );
sap.ui.core.IconPool.addIcon('skip_next',                                                             'GoogleMaterial', 'GoogleMaterial', 'e044' );
sap.ui.core.IconPool.addIcon('skip_previous',                                                         'GoogleMaterial', 'GoogleMaterial', 'e045' );
sap.ui.core.IconPool.addIcon('slideshow',                                                             'GoogleMaterial', 'GoogleMaterial', 'e41b' );
sap.ui.core.IconPool.addIcon('slow_motion_video',                                                     'GoogleMaterial', 'GoogleMaterial', 'e068' );
sap.ui.core.IconPool.addIcon('smartphone',                                                            'GoogleMaterial', 'GoogleMaterial', 'e32c' );
sap.ui.core.IconPool.addIcon('smoke_free',                                                            'GoogleMaterial', 'GoogleMaterial', 'eb4a' );
sap.ui.core.IconPool.addIcon('smoking_rooms',                                                         'GoogleMaterial', 'GoogleMaterial', 'eb4b' );
sap.ui.core.IconPool.addIcon('sms',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e625' );
sap.ui.core.IconPool.addIcon('sms_failed',                                                            'GoogleMaterial', 'GoogleMaterial', 'e626' );
sap.ui.core.IconPool.addIcon('snooze',                                                                'GoogleMaterial', 'GoogleMaterial', 'e046' );
sap.ui.core.IconPool.addIcon('sort',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e164' );
sap.ui.core.IconPool.addIcon('sort_by_alpha',                                                         'GoogleMaterial', 'GoogleMaterial', 'e053' );
sap.ui.core.IconPool.addIcon('spa',                                                                   'GoogleMaterial', 'GoogleMaterial', 'eb4c' );
sap.ui.core.IconPool.addIcon('space_bar',                                                             'GoogleMaterial', 'GoogleMaterial', 'e256' );
sap.ui.core.IconPool.addIcon('speaker',                                                               'GoogleMaterial', 'GoogleMaterial', 'e32d' );
sap.ui.core.IconPool.addIcon('speaker_group',                                                         'GoogleMaterial', 'GoogleMaterial', 'e32e' );
sap.ui.core.IconPool.addIcon('speaker_notes',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8cd' );
sap.ui.core.IconPool.addIcon('speaker_notes_off',                                                     'GoogleMaterial', 'GoogleMaterial', 'e92a' );
sap.ui.core.IconPool.addIcon('speaker_phone',                                                         'GoogleMaterial', 'GoogleMaterial', 'e0d2' );
sap.ui.core.IconPool.addIcon('spellcheck',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8ce' );
sap.ui.core.IconPool.addIcon('star',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e838' );
sap.ui.core.IconPool.addIcon('star_border',                                                           'GoogleMaterial', 'GoogleMaterial', 'e83a' );
sap.ui.core.IconPool.addIcon('star_half',                                                             'GoogleMaterial', 'GoogleMaterial', 'e839' );
sap.ui.core.IconPool.addIcon('stars',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e8d0' );
sap.ui.core.IconPool.addIcon('stay_current_landscape',                                                'GoogleMaterial', 'GoogleMaterial', 'e0d3' );
sap.ui.core.IconPool.addIcon('stay_current_portrait',                                                 'GoogleMaterial', 'GoogleMaterial', 'e0d4' );
sap.ui.core.IconPool.addIcon('stay_primary_landscape',                                                'GoogleMaterial', 'GoogleMaterial', 'e0d5' );
sap.ui.core.IconPool.addIcon('stay_primary_portrait',                                                 'GoogleMaterial', 'GoogleMaterial', 'e0d6' );
sap.ui.core.IconPool.addIcon('stop',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e047' );
sap.ui.core.IconPool.addIcon('stop_screen_share',                                                     'GoogleMaterial', 'GoogleMaterial', 'e0e3' );
sap.ui.core.IconPool.addIcon('storage',                                                               'GoogleMaterial', 'GoogleMaterial', 'e1db' );
sap.ui.core.IconPool.addIcon('store',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e8d1' );
sap.ui.core.IconPool.addIcon('store_mall_directory',                                                  'GoogleMaterial', 'GoogleMaterial', 'e563' );
sap.ui.core.IconPool.addIcon('straighten',                                                            'GoogleMaterial', 'GoogleMaterial', 'e41c' );
sap.ui.core.IconPool.addIcon('streetview',                                                            'GoogleMaterial', 'GoogleMaterial', 'e56e' );
sap.ui.core.IconPool.addIcon('strikethrough_s',                                                       'GoogleMaterial', 'GoogleMaterial', 'e257' );
sap.ui.core.IconPool.addIcon('style',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e41d' );
sap.ui.core.IconPool.addIcon('subdirectory_arrow_left',                                               'GoogleMaterial', 'GoogleMaterial', 'e5d9' );
sap.ui.core.IconPool.addIcon('subdirectory_arrow_right',                                              'GoogleMaterial', 'GoogleMaterial', 'e5da' );
sap.ui.core.IconPool.addIcon('subject',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8d2' );
sap.ui.core.IconPool.addIcon('subscriptions',                                                         'GoogleMaterial', 'GoogleMaterial', 'e064' );
sap.ui.core.IconPool.addIcon('subtitles',                                                             'GoogleMaterial', 'GoogleMaterial', 'e048' );
sap.ui.core.IconPool.addIcon('subway',                                                                'GoogleMaterial', 'GoogleMaterial', 'e56f' );
sap.ui.core.IconPool.addIcon('supervisor_account',                                                    'GoogleMaterial', 'GoogleMaterial', 'e8d3' );
sap.ui.core.IconPool.addIcon('surround_sound',                                                        'GoogleMaterial', 'GoogleMaterial', 'e049' );
sap.ui.core.IconPool.addIcon('swap_calls',                                                            'GoogleMaterial', 'GoogleMaterial', 'e0d7' );
sap.ui.core.IconPool.addIcon('swap_horiz',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8d4' );
sap.ui.core.IconPool.addIcon('swap_vert',                                                             'GoogleMaterial', 'GoogleMaterial', 'e8d5' );
sap.ui.core.IconPool.addIcon('swap_vertical_circle',                                                  'GoogleMaterial', 'GoogleMaterial', 'e8d6' );
sap.ui.core.IconPool.addIcon('switch_camera',                                                         'GoogleMaterial', 'GoogleMaterial', 'e41e' );
sap.ui.core.IconPool.addIcon('switch_video',                                                          'GoogleMaterial', 'GoogleMaterial', 'e41f' );
sap.ui.core.IconPool.addIcon('sync',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e627' );
sap.ui.core.IconPool.addIcon('sync_disabled',                                                         'GoogleMaterial', 'GoogleMaterial', 'e628' );
sap.ui.core.IconPool.addIcon('sync_problem',                                                          'GoogleMaterial', 'GoogleMaterial', 'e629' );
sap.ui.core.IconPool.addIcon('system_update',                                                         'GoogleMaterial', 'GoogleMaterial', 'e62a' );
sap.ui.core.IconPool.addIcon('system_update_alt',                                                     'GoogleMaterial', 'GoogleMaterial', 'e8d7' );
sap.ui.core.IconPool.addIcon('tab',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e8d8' );
sap.ui.core.IconPool.addIcon('tab_unselected',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8d9' );
sap.ui.core.IconPool.addIcon('tablet',                                                                'GoogleMaterial', 'GoogleMaterial', 'e32f' );
sap.ui.core.IconPool.addIcon('tablet_android',                                                        'GoogleMaterial', 'GoogleMaterial', 'e330' );
sap.ui.core.IconPool.addIcon('tablet_mac',                                                            'GoogleMaterial', 'GoogleMaterial', 'e331' );
sap.ui.core.IconPool.addIcon('tag_faces',                                                             'GoogleMaterial', 'GoogleMaterial', 'e420' );
sap.ui.core.IconPool.addIcon('tap_and_play',                                                          'GoogleMaterial', 'GoogleMaterial', 'e62b' );
sap.ui.core.IconPool.addIcon('terrain',                                                               'GoogleMaterial', 'GoogleMaterial', 'e564' );
sap.ui.core.IconPool.addIcon('text_fields',                                                           'GoogleMaterial', 'GoogleMaterial', 'e262' );
sap.ui.core.IconPool.addIcon('text_format',                                                           'GoogleMaterial', 'GoogleMaterial', 'e165' );
sap.ui.core.IconPool.addIcon('textsms',                                                               'GoogleMaterial', 'GoogleMaterial', 'e0d8' );
sap.ui.core.IconPool.addIcon('texture',                                                               'GoogleMaterial', 'GoogleMaterial', 'e421' );
sap.ui.core.IconPool.addIcon('theaters',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8da' );
sap.ui.core.IconPool.addIcon('thumb_down',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8db' );
sap.ui.core.IconPool.addIcon('thumb_up',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8dc' );
sap.ui.core.IconPool.addIcon('thumbs_up_down',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8dd' );
sap.ui.core.IconPool.addIcon('time_to_leave',                                                         'GoogleMaterial', 'GoogleMaterial', 'e62c' );
sap.ui.core.IconPool.addIcon('timelapse',                                                             'GoogleMaterial', 'GoogleMaterial', 'e422' );
sap.ui.core.IconPool.addIcon('timeline',                                                              'GoogleMaterial', 'GoogleMaterial', 'e922' );
sap.ui.core.IconPool.addIcon('timer',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e425' );
sap.ui.core.IconPool.addIcon('timer_10',                                                              'GoogleMaterial', 'GoogleMaterial', 'e423' );
sap.ui.core.IconPool.addIcon('timer_3',                                                               'GoogleMaterial', 'GoogleMaterial', 'e424' );
sap.ui.core.IconPool.addIcon('timer_off',                                                             'GoogleMaterial', 'GoogleMaterial', 'e426' );
sap.ui.core.IconPool.addIcon('title',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e264' );
sap.ui.core.IconPool.addIcon('toc',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e8de' );
sap.ui.core.IconPool.addIcon('today',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e8df' );
sap.ui.core.IconPool.addIcon('toll',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e8e0' );
sap.ui.core.IconPool.addIcon('tonality',                                                              'GoogleMaterial', 'GoogleMaterial', 'e427' );
sap.ui.core.IconPool.addIcon('touch_app',                                                             'GoogleMaterial', 'GoogleMaterial', 'e913' );
sap.ui.core.IconPool.addIcon('toys',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e332' );
sap.ui.core.IconPool.addIcon('track_changes',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8e1' );
sap.ui.core.IconPool.addIcon('traffic',                                                               'GoogleMaterial', 'GoogleMaterial', 'e565' );
sap.ui.core.IconPool.addIcon('train',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e570' );
sap.ui.core.IconPool.addIcon('tram',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e571' );
sap.ui.core.IconPool.addIcon('transfer_within_a_station',                                             'GoogleMaterial', 'GoogleMaterial', 'e572' );
sap.ui.core.IconPool.addIcon('transform',                                                             'GoogleMaterial', 'GoogleMaterial', 'e428' );
sap.ui.core.IconPool.addIcon('translate',                                                             'GoogleMaterial', 'GoogleMaterial', 'e8e2' );
sap.ui.core.IconPool.addIcon('trending_down',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8e3' );
sap.ui.core.IconPool.addIcon('trending_flat',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8e4' );
sap.ui.core.IconPool.addIcon('trending_up',                                                           'GoogleMaterial', 'GoogleMaterial', 'e8e5' );
sap.ui.core.IconPool.addIcon('tune',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e429' );
sap.ui.core.IconPool.addIcon('turned_in',                                                             'GoogleMaterial', 'GoogleMaterial', 'e8e6' );
sap.ui.core.IconPool.addIcon('turned_in_not',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8e7' );
sap.ui.core.IconPool.addIcon('tv',                                                                    'GoogleMaterial', 'GoogleMaterial', 'e333' );
sap.ui.core.IconPool.addIcon('unarchive',                                                             'GoogleMaterial', 'GoogleMaterial', 'e169' );
sap.ui.core.IconPool.addIcon('undo',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e166' );
sap.ui.core.IconPool.addIcon('unfold_less',                                                           'GoogleMaterial', 'GoogleMaterial', 'e5d6' );
sap.ui.core.IconPool.addIcon('unfold_more',                                                           'GoogleMaterial', 'GoogleMaterial', 'e5d7' );
sap.ui.core.IconPool.addIcon('update',                                                                'GoogleMaterial', 'GoogleMaterial', 'e923' );
sap.ui.core.IconPool.addIcon('usb',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e1e0' );
sap.ui.core.IconPool.addIcon('verified_user',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8e8' );
sap.ui.core.IconPool.addIcon('vertical_align_bottom',                                                 'GoogleMaterial', 'GoogleMaterial', 'e258' );
sap.ui.core.IconPool.addIcon('vertical_align_center',                                                 'GoogleMaterial', 'GoogleMaterial', 'e259' );
sap.ui.core.IconPool.addIcon('vertical_align_top',                                                    'GoogleMaterial', 'GoogleMaterial', 'e25a' );
sap.ui.core.IconPool.addIcon('vibration',                                                             'GoogleMaterial', 'GoogleMaterial', 'e62d' );
sap.ui.core.IconPool.addIcon('video_call',                                                            'GoogleMaterial', 'GoogleMaterial', 'e070' );
sap.ui.core.IconPool.addIcon('video_label',                                                           'GoogleMaterial', 'GoogleMaterial', 'e071' );
sap.ui.core.IconPool.addIcon('video_library',                                                         'GoogleMaterial', 'GoogleMaterial', 'e04a' );
sap.ui.core.IconPool.addIcon('videocam',                                                              'GoogleMaterial', 'GoogleMaterial', 'e04b' );
sap.ui.core.IconPool.addIcon('videocam_off',                                                          'GoogleMaterial', 'GoogleMaterial', 'e04c' );
sap.ui.core.IconPool.addIcon('videogame_asset',                                                       'GoogleMaterial', 'GoogleMaterial', 'e338' );
sap.ui.core.IconPool.addIcon('view_agenda',                                                           'GoogleMaterial', 'GoogleMaterial', 'e8e9' );
sap.ui.core.IconPool.addIcon('view_array',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8ea' );
sap.ui.core.IconPool.addIcon('view_carousel',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8eb' );
sap.ui.core.IconPool.addIcon('view_column',                                                           'GoogleMaterial', 'GoogleMaterial', 'e8ec' );
sap.ui.core.IconPool.addIcon('view_comfy',                                                            'GoogleMaterial', 'GoogleMaterial', 'e42a' );
sap.ui.core.IconPool.addIcon('view_compact',                                                          'GoogleMaterial', 'GoogleMaterial', 'e42b' );
sap.ui.core.IconPool.addIcon('view_day',                                                              'GoogleMaterial', 'GoogleMaterial', 'e8ed' );
sap.ui.core.IconPool.addIcon('view_headline',                                                         'GoogleMaterial', 'GoogleMaterial', 'e8ee' );
sap.ui.core.IconPool.addIcon('view_list',                                                             'GoogleMaterial', 'GoogleMaterial', 'e8ef' );
sap.ui.core.IconPool.addIcon('view_module',                                                           'GoogleMaterial', 'GoogleMaterial', 'e8f0' );
sap.ui.core.IconPool.addIcon('view_quilt',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8f1' );
sap.ui.core.IconPool.addIcon('view_stream',                                                           'GoogleMaterial', 'GoogleMaterial', 'e8f2' );
sap.ui.core.IconPool.addIcon('view_week',                                                             'GoogleMaterial', 'GoogleMaterial', 'e8f3' );
sap.ui.core.IconPool.addIcon('vignette',                                                              'GoogleMaterial', 'GoogleMaterial', 'e435' );
sap.ui.core.IconPool.addIcon('visibility',                                                            'GoogleMaterial', 'GoogleMaterial', 'e8f4' );
sap.ui.core.IconPool.addIcon('visibility_off',                                                        'GoogleMaterial', 'GoogleMaterial', 'e8f5' );
sap.ui.core.IconPool.addIcon('voice_chat',                                                            'GoogleMaterial', 'GoogleMaterial', 'e62e' );
sap.ui.core.IconPool.addIcon('voicemail',                                                             'GoogleMaterial', 'GoogleMaterial', 'e0d9' );
sap.ui.core.IconPool.addIcon('volume_down',                                                           'GoogleMaterial', 'GoogleMaterial', 'e04d' );
sap.ui.core.IconPool.addIcon('volume_mute',                                                           'GoogleMaterial', 'GoogleMaterial', 'e04e' );
sap.ui.core.IconPool.addIcon('volume_off',                                                            'GoogleMaterial', 'GoogleMaterial', 'e04f' );
sap.ui.core.IconPool.addIcon('volume_up',                                                             'GoogleMaterial', 'GoogleMaterial', 'e050' );
sap.ui.core.IconPool.addIcon('vpn_key',                                                               'GoogleMaterial', 'GoogleMaterial', 'e0da' );
sap.ui.core.IconPool.addIcon('vpn_lock',                                                              'GoogleMaterial', 'GoogleMaterial', 'e62f' );
sap.ui.core.IconPool.addIcon('wallpaper',                                                             'GoogleMaterial', 'GoogleMaterial', 'e1bc' );
sap.ui.core.IconPool.addIcon('warning',                                                               'GoogleMaterial', 'GoogleMaterial', 'e002' );
sap.ui.core.IconPool.addIcon('watch',                                                                 'GoogleMaterial', 'GoogleMaterial', 'e334' );
sap.ui.core.IconPool.addIcon('watch_later',                                                           'GoogleMaterial', 'GoogleMaterial', 'e924' );
sap.ui.core.IconPool.addIcon('wb_auto',                                                               'GoogleMaterial', 'GoogleMaterial', 'e42c' );
sap.ui.core.IconPool.addIcon('wb_cloudy',                                                             'GoogleMaterial', 'GoogleMaterial', 'e42d' );
sap.ui.core.IconPool.addIcon('wb_incandescent',                                                       'GoogleMaterial', 'GoogleMaterial', 'e42e' );
sap.ui.core.IconPool.addIcon('wb_iridescent',                                                         'GoogleMaterial', 'GoogleMaterial', 'e436' );
sap.ui.core.IconPool.addIcon('wb_sunny',                                                              'GoogleMaterial', 'GoogleMaterial', 'e430' );
sap.ui.core.IconPool.addIcon('wc',                                                                    'GoogleMaterial', 'GoogleMaterial', 'e63d' );
sap.ui.core.IconPool.addIcon('web',                                                                   'GoogleMaterial', 'GoogleMaterial', 'e051' );
sap.ui.core.IconPool.addIcon('web_asset',                                                             'GoogleMaterial', 'GoogleMaterial', 'e069' );
sap.ui.core.IconPool.addIcon('weekend',                                                               'GoogleMaterial', 'GoogleMaterial', 'e16b' );
sap.ui.core.IconPool.addIcon('whatshot',                                                              'GoogleMaterial', 'GoogleMaterial', 'e80e' );
sap.ui.core.IconPool.addIcon('widgets',                                                               'GoogleMaterial', 'GoogleMaterial', 'e1bd' );
sap.ui.core.IconPool.addIcon('wifi',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e63e' );
sap.ui.core.IconPool.addIcon('wifi_lock',                                                             'GoogleMaterial', 'GoogleMaterial', 'e1e1' );
sap.ui.core.IconPool.addIcon('wifi_tethering',                                                        'GoogleMaterial', 'GoogleMaterial', 'e1e2' );
sap.ui.core.IconPool.addIcon('work',                                                                  'GoogleMaterial', 'GoogleMaterial', 'e8f9' );
sap.ui.core.IconPool.addIcon('wrap_text',                                                             'GoogleMaterial', 'GoogleMaterial', 'e25b' );
sap.ui.core.IconPool.addIcon('youtube_searched_for',                                                  'GoogleMaterial', 'GoogleMaterial', 'e8fa' );
sap.ui.core.IconPool.addIcon('zoom_in',                                                               'GoogleMaterial', 'GoogleMaterial', 'e8ff' );
sap.ui.core.IconPool.addIcon('zoom_out',                                                              'GoogleMaterial', 'GoogleMaterial', 'e900' );
sap.ui.core.IconPool.addIcon('zoom_out_map',                                                          'GoogleMaterial', 'GoogleMaterial', 'e56b' );

//-- Note: Opensource Weather Icon Font from "erikflowers.github.io" --//
//-- Daytime --//
sap.ui.core.IconPool.addIcon('wi-day-sunny',                                                          'WeatherIcons', 'WeatherIcons', 'f00d' );
sap.ui.core.IconPool.addIcon('wi-day-cloudy',                                                         'WeatherIcons', 'WeatherIcons', 'f002' );
sap.ui.core.IconPool.addIcon('wi-day-cloudy-gusts',                                                   'WeatherIcons', 'WeatherIcons', 'f000' );
sap.ui.core.IconPool.addIcon('wi-day-cloudy-windy',                                                   'WeatherIcons', 'WeatherIcons', 'f001' );
sap.ui.core.IconPool.addIcon('wi-day-fog',                                                            'WeatherIcons', 'WeatherIcons', 'f003' );
sap.ui.core.IconPool.addIcon('wi-day-hail',                                                           'WeatherIcons', 'WeatherIcons', 'f004' );
sap.ui.core.IconPool.addIcon('wi-day-haze',                                                           'WeatherIcons', 'WeatherIcons', 'f0b6' );
sap.ui.core.IconPool.addIcon('wi-day-lightning',                                                      'WeatherIcons', 'WeatherIcons', 'f005' );
sap.ui.core.IconPool.addIcon('wi-day-rain',                                                           'WeatherIcons', 'WeatherIcons', 'f008' );
sap.ui.core.IconPool.addIcon('wi-day-rain-mix',                                                       'WeatherIcons', 'WeatherIcons', 'f006' );
sap.ui.core.IconPool.addIcon('wi-day-rain-wind',                                                      'WeatherIcons', 'WeatherIcons', 'f007' );
sap.ui.core.IconPool.addIcon('wi-day-showers',                                                        'WeatherIcons', 'WeatherIcons', 'f009' );
sap.ui.core.IconPool.addIcon('wi-day-sleet',                                                          'WeatherIcons', 'WeatherIcons', 'f0b2' );
sap.ui.core.IconPool.addIcon('wi-day-sleet-storm',                                                    'WeatherIcons', 'WeatherIcons', 'f068' );
sap.ui.core.IconPool.addIcon('wi-day-snow',                                                           'WeatherIcons', 'WeatherIcons', 'f00a' );
sap.ui.core.IconPool.addIcon('wi-day-snow-thunderstorm',                                              'WeatherIcons', 'WeatherIcons', 'f06b' );
sap.ui.core.IconPool.addIcon('wi-day-snow-wind',                                                      'WeatherIcons', 'WeatherIcons', 'f065' );
sap.ui.core.IconPool.addIcon('wi-day-sprinkle',                                                       'WeatherIcons', 'WeatherIcons', 'f00b' );
sap.ui.core.IconPool.addIcon('wi-day-storm-showers',                                                  'WeatherIcons', 'WeatherIcons', 'f00e' );
sap.ui.core.IconPool.addIcon('wi-day-sunny-overcast',                                                 'WeatherIcons', 'WeatherIcons', 'f00c' );
sap.ui.core.IconPool.addIcon('wi-day-thunderstorm',                                                   'WeatherIcons', 'WeatherIcons', 'f010' );
sap.ui.core.IconPool.addIcon('wi-day-windy',                                                          'WeatherIcons', 'WeatherIcons', 'f085' );
sap.ui.core.IconPool.addIcon('wi-solar-eclipse',                                                      'WeatherIcons', 'WeatherIcons', 'f06e' );
sap.ui.core.IconPool.addIcon('wi-hot',                                                                'WeatherIcons', 'WeatherIcons', 'f072' );
sap.ui.core.IconPool.addIcon('wi-day-cloudy-high',                                                    'WeatherIcons', 'WeatherIcons', 'f07d' );
sap.ui.core.IconPool.addIcon('wi-day-light-wind',                                                     'WeatherIcons', 'WeatherIcons', 'f0c4' );
//-- Nighttime --//
sap.ui.core.IconPool.addIcon('wi-night-clear',                                                        'WeatherIcons', 'WeatherIcons', 'f02e' );
sap.ui.core.IconPool.addIcon('wi-night-alt-cloudy',                                                   'WeatherIcons', 'WeatherIcons', 'f086' );
sap.ui.core.IconPool.addIcon('wi-night-alt-cloudy-gusts',                                             'WeatherIcons', 'WeatherIcons', 'f022' );
sap.ui.core.IconPool.addIcon('wi-night-alt-cloudy-windy',                                             'WeatherIcons', 'WeatherIcons', 'f023' );
sap.ui.core.IconPool.addIcon('wi-night-alt-hail',                                                     'WeatherIcons', 'WeatherIcons', 'f024' );
sap.ui.core.IconPool.addIcon('wi-night-alt-lightning',                                                'WeatherIcons', 'WeatherIcons', 'f025' );
sap.ui.core.IconPool.addIcon('wi-night-alt-rain',                                                     'WeatherIcons', 'WeatherIcons', 'f028' );
sap.ui.core.IconPool.addIcon('wi-night-alt-rain-mix',                                                 'WeatherIcons', 'WeatherIcons', 'f026' );
sap.ui.core.IconPool.addIcon('wi-night-alt-rain-wind',                                                'WeatherIcons', 'WeatherIcons', 'f027' );
sap.ui.core.IconPool.addIcon('wi-night-alt-showers',                                                  'WeatherIcons', 'WeatherIcons', 'f029' );
sap.ui.core.IconPool.addIcon('wi-night-alt-sleet',                                                    'WeatherIcons', 'WeatherIcons', 'f0b4' );
sap.ui.core.IconPool.addIcon('wi-night-alt-sleet-storm',                                              'WeatherIcons', 'WeatherIcons', 'f06a' );
sap.ui.core.IconPool.addIcon('wi-night-alt-snow',                                                     'WeatherIcons', 'WeatherIcons', 'f02a' );
sap.ui.core.IconPool.addIcon('wi-night-alt-snow-thunderstorm',                                        'WeatherIcons', 'WeatherIcons', 'f06d' );
sap.ui.core.IconPool.addIcon('wi-night-alt-snow-wind',                                                'WeatherIcons', 'WeatherIcons', 'f067' );
sap.ui.core.IconPool.addIcon('wi-night-alt-sprinkle',                                                 'WeatherIcons', 'WeatherIcons', 'f02b' );
sap.ui.core.IconPool.addIcon('wi-night-alt-storm-showers',                                            'WeatherIcons', 'WeatherIcons', 'f02c' );
sap.ui.core.IconPool.addIcon('wi-night-alt-thunderstorm',                                             'WeatherIcons', 'WeatherIcons', 'f02d' );
sap.ui.core.IconPool.addIcon('wi-night-cloudy',                                                       'WeatherIcons', 'WeatherIcons', 'f031' );
sap.ui.core.IconPool.addIcon('wi-night-cloudy-gusts',                                                 'WeatherIcons', 'WeatherIcons', 'f02f' );
sap.ui.core.IconPool.addIcon('wi-night-cloudy-windy',                                                 'WeatherIcons', 'WeatherIcons', 'f030' );
sap.ui.core.IconPool.addIcon('wi-night-fog',                                                          'WeatherIcons', 'WeatherIcons', 'f04a' );
sap.ui.core.IconPool.addIcon('wi-night-hail',                                                         'WeatherIcons', 'WeatherIcons', 'f032' );
sap.ui.core.IconPool.addIcon('wi-night-lightning',                                                    'WeatherIcons', 'WeatherIcons', 'f033' );
sap.ui.core.IconPool.addIcon('wi-night-partly-cloudy',                                                'WeatherIcons', 'WeatherIcons', 'f083' );
sap.ui.core.IconPool.addIcon('wi-night-rain',                                                         'WeatherIcons', 'WeatherIcons', 'f036' );
sap.ui.core.IconPool.addIcon('wi-night-rain-mix',                                                     'WeatherIcons', 'WeatherIcons', 'f034' );
sap.ui.core.IconPool.addIcon('wi-night-rain-wind',                                                    'WeatherIcons', 'WeatherIcons', 'f035' );
sap.ui.core.IconPool.addIcon('wi-night-showers',                                                      'WeatherIcons', 'WeatherIcons', 'f037' );
sap.ui.core.IconPool.addIcon('wi-night-sleet',                                                        'WeatherIcons', 'WeatherIcons', 'f0b3' );
sap.ui.core.IconPool.addIcon('wi-night-sleet-storm',                                                  'WeatherIcons', 'WeatherIcons', 'f069' );
sap.ui.core.IconPool.addIcon('wi-night-snow',                                                         'WeatherIcons', 'WeatherIcons', 'f038' );
sap.ui.core.IconPool.addIcon('wi-night-snow-thunderstorm',                                            'WeatherIcons', 'WeatherIcons', 'f06c' );
sap.ui.core.IconPool.addIcon('wi-night-snow-wind',                                                    'WeatherIcons', 'WeatherIcons', 'f066' );
sap.ui.core.IconPool.addIcon('wi-night-sprinkle',                                                     'WeatherIcons', 'WeatherIcons', 'f039' );
sap.ui.core.IconPool.addIcon('wi-night-storm-showers',                                                'WeatherIcons', 'WeatherIcons', 'f03a' );
sap.ui.core.IconPool.addIcon('wi-night-thunderstorm',                                                 'WeatherIcons', 'WeatherIcons', 'f03b' );
sap.ui.core.IconPool.addIcon('wi-lunar-eclipse',                                                      'WeatherIcons', 'WeatherIcons', 'f070' );
sap.ui.core.IconPool.addIcon('wi-stars',                                                              'WeatherIcons', 'WeatherIcons', 'f077' );
sap.ui.core.IconPool.addIcon('wi-storm-showers',                                                      'WeatherIcons', 'WeatherIcons', 'f01d' );
sap.ui.core.IconPool.addIcon('wi-thunderstorm',                                                       'WeatherIcons', 'WeatherIcons', 'f01e' );
sap.ui.core.IconPool.addIcon('wi-night-alt-cloudy-high',                                              'WeatherIcons', 'WeatherIcons', 'f080' );
sap.ui.core.IconPool.addIcon('wi-night-alt-partly-cloudy',                                            'WeatherIcons', 'WeatherIcons', 'f081' );
//-- Neutral --//
sap.ui.core.IconPool.addIcon('wi-cloud',                                                              'WeatherIcons', 'WeatherIcons', 'f041' );
sap.ui.core.IconPool.addIcon('wi-cloudy',                                                             'WeatherIcons', 'WeatherIcons', 'f013' );
sap.ui.core.IconPool.addIcon('wi-cloudy-gusts',                                                       'WeatherIcons', 'WeatherIcons', 'f011' );
sap.ui.core.IconPool.addIcon('wi-cloudy-windy',                                                       'WeatherIcons', 'WeatherIcons', 'f012' );
sap.ui.core.IconPool.addIcon('wi-fog',                                                                'WeatherIcons', 'WeatherIcons', 'f014' );
sap.ui.core.IconPool.addIcon('wi-hail',                                                               'WeatherIcons', 'WeatherIcons', 'f015' );
sap.ui.core.IconPool.addIcon('wi-rain',                                                               'WeatherIcons', 'WeatherIcons', 'f019' );
sap.ui.core.IconPool.addIcon('wi-rain-mix',                                                           'WeatherIcons', 'WeatherIcons', 'f017' );
sap.ui.core.IconPool.addIcon('wi-rain-wind',                                                          'WeatherIcons', 'WeatherIcons', 'f018' );
sap.ui.core.IconPool.addIcon('wi-showers',                                                            'WeatherIcons', 'WeatherIcons', 'f01a' );
sap.ui.core.IconPool.addIcon('wi-sleet',                                                              'WeatherIcons', 'WeatherIcons', 'f0b5' );
sap.ui.core.IconPool.addIcon('wi-sprinkle',                                                           'WeatherIcons', 'WeatherIcons', 'f01c' );
sap.ui.core.IconPool.addIcon('wi-storm-showers',                                                      'WeatherIcons', 'WeatherIcons', 'f01d' );
sap.ui.core.IconPool.addIcon('wi-thunderstorm',                                                       'WeatherIcons', 'WeatherIcons', 'f01e' );
sap.ui.core.IconPool.addIcon('wi-snow-wind',                                                          'WeatherIcons', 'WeatherIcons', 'f064' );
sap.ui.core.IconPool.addIcon('wi-snow',                                                               'WeatherIcons', 'WeatherIcons', 'f01b' );
sap.ui.core.IconPool.addIcon('wi-smog',                                                               'WeatherIcons', 'WeatherIcons', 'f074' );
sap.ui.core.IconPool.addIcon('wi-smoke',                                                              'WeatherIcons', 'WeatherIcons', 'f062' );
sap.ui.core.IconPool.addIcon('wi-lightning',                                                          'WeatherIcons', 'WeatherIcons', 'f016' );
sap.ui.core.IconPool.addIcon('wi-raindrops',                                                          'WeatherIcons', 'WeatherIcons', 'f04e' );
sap.ui.core.IconPool.addIcon('wi-raindrop',                                                           'WeatherIcons', 'WeatherIcons', 'f078' );
sap.ui.core.IconPool.addIcon('wi-dust',                                                               'WeatherIcons', 'WeatherIcons', 'f063' );
sap.ui.core.IconPool.addIcon('wi-snowflake-cold',                                                     'WeatherIcons', 'WeatherIcons', 'f076' );
sap.ui.core.IconPool.addIcon('wi-windy',                                                              'WeatherIcons', 'WeatherIcons', 'f021' );
sap.ui.core.IconPool.addIcon('wi-strong-wind',                                                        'WeatherIcons', 'WeatherIcons', 'f050' );
sap.ui.core.IconPool.addIcon('wi-sandstorm',                                                          'WeatherIcons', 'WeatherIcons', 'f082' );
sap.ui.core.IconPool.addIcon('wi-earthquake',                                                         'WeatherIcons', 'WeatherIcons', 'f0c6' );
sap.ui.core.IconPool.addIcon('wi-fire',                                                               'WeatherIcons', 'WeatherIcons', 'f0c7' );
sap.ui.core.IconPool.addIcon('wi-flood',                                                              'WeatherIcons', 'WeatherIcons', 'f07c' );
sap.ui.core.IconPool.addIcon('wi-meteor',                                                             'WeatherIcons', 'WeatherIcons', 'f071' );
sap.ui.core.IconPool.addIcon('wi-tsunami',                                                            'WeatherIcons', 'WeatherIcons', 'f0c5' );
sap.ui.core.IconPool.addIcon('wi-volcano',                                                            'WeatherIcons', 'WeatherIcons', 'f0c8' );
sap.ui.core.IconPool.addIcon('wi-hurricane',                                                          'WeatherIcons', 'WeatherIcons', 'f073' );
sap.ui.core.IconPool.addIcon('wi-tornado',                                                            'WeatherIcons', 'WeatherIcons', 'f056' );
sap.ui.core.IconPool.addIcon('wi-small-craft-advisory',                                               'WeatherIcons', 'WeatherIcons', 'f0cc' );
sap.ui.core.IconPool.addIcon('wi-gale-warning',                                                       'WeatherIcons', 'WeatherIcons', 'f0cd' );
sap.ui.core.IconPool.addIcon('wi-storm-warning',                                                      'WeatherIcons', 'WeatherIcons', 'f0ce' );
sap.ui.core.IconPool.addIcon('wi-hurricane-warning',                                                  'WeatherIcons', 'WeatherIcons', 'f0cf' );
sap.ui.core.IconPool.addIcon('wi-wind-direction',                                                     'WeatherIcons', 'WeatherIcons', 'f0b1' );
//-- Miscellaneous --//
sap.ui.core.IconPool.addIcon('wi-alien',                                                              'WeatherIcons', 'WeatherIcons', 'f075' );
sap.ui.core.IconPool.addIcon('wi-celsius',                                                            'WeatherIcons', 'WeatherIcons', 'f03c' );
sap.ui.core.IconPool.addIcon('wi-fahrenheit',                                                         'WeatherIcons', 'WeatherIcons', 'f045' );
sap.ui.core.IconPool.addIcon('wi-degrees',                                                            'WeatherIcons', 'WeatherIcons', 'f042' );
sap.ui.core.IconPool.addIcon('wi-thermometer',                                                        'WeatherIcons', 'WeatherIcons', 'f055' );
sap.ui.core.IconPool.addIcon('wi-thermometer-exterior',                                               'WeatherIcons', 'WeatherIcons', 'f053' );
sap.ui.core.IconPool.addIcon('wi-thermometer-internal',                                               'WeatherIcons', 'WeatherIcons', 'f054' );
sap.ui.core.IconPool.addIcon('wi-cloud-down',                                                         'WeatherIcons', 'WeatherIcons', 'f03d' );
sap.ui.core.IconPool.addIcon('wi-cloud-up',                                                           'WeatherIcons', 'WeatherIcons', 'f040' );
sap.ui.core.IconPool.addIcon('wi-cloud-refresh',                                                      'WeatherIcons', 'WeatherIcons', 'f03e' );
sap.ui.core.IconPool.addIcon('wi-horizon',                                                            'WeatherIcons', 'WeatherIcons', 'f047' );
sap.ui.core.IconPool.addIcon('wi-horizon-alt',                                                        'WeatherIcons', 'WeatherIcons', 'f046' );
sap.ui.core.IconPool.addIcon('wi-sunrise',                                                            'WeatherIcons', 'WeatherIcons', 'f051' );
sap.ui.core.IconPool.addIcon('wi-sunset',                                                             'WeatherIcons', 'WeatherIcons', 'f052' );
sap.ui.core.IconPool.addIcon('wi-moonrise',                                                           'WeatherIcons', 'WeatherIcons', 'f0c9' );
sap.ui.core.IconPool.addIcon('wi-moonset',                                                            'WeatherIcons', 'WeatherIcons', 'f0ca' );
sap.ui.core.IconPool.addIcon('wi-refresh',                                                            'WeatherIcons', 'WeatherIcons', 'f04c' );
sap.ui.core.IconPool.addIcon('wi-refresh-alt',                                                        'WeatherIcons', 'WeatherIcons', 'f04b' );
sap.ui.core.IconPool.addIcon('wi-umbrella',                                                           'WeatherIcons', 'WeatherIcons', 'f084' );
sap.ui.core.IconPool.addIcon('wi-barometer',                                                          'WeatherIcons', 'WeatherIcons', 'f079' );
sap.ui.core.IconPool.addIcon('wi-humidity',                                                           'WeatherIcons', 'WeatherIcons', 'f07a' );
sap.ui.core.IconPool.addIcon('wi-na',                                                                 'WeatherIcons', 'WeatherIcons', 'f07b' );
sap.ui.core.IconPool.addIcon('wi-train',                                                              'WeatherIcons', 'WeatherIcons', 'f0cb' );
//-- Moon Phases --//
sap.ui.core.IconPool.addIcon('wi-moon-new',                                                           'WeatherIcons', 'WeatherIcons', 'f095' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-crescent-1',                                             'WeatherIcons', 'WeatherIcons', 'f096' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-crescent-2',                                             'WeatherIcons', 'WeatherIcons', 'f097' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-crescent-3',                                             'WeatherIcons', 'WeatherIcons', 'f098' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-crescent-4',                                             'WeatherIcons', 'WeatherIcons', 'f099' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-crescent-5',                                             'WeatherIcons', 'WeatherIcons', 'f09a' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-crescent-6',                                             'WeatherIcons', 'WeatherIcons', 'f09b' );
sap.ui.core.IconPool.addIcon('wi-moon-first-quarter',                                                 'WeatherIcons', 'WeatherIcons', 'f09c' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-gibbous-1',                                              'WeatherIcons', 'WeatherIcons', 'f09d' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-gibbous-2',                                              'WeatherIcons', 'WeatherIcons', 'f09e' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-gibbous-3',                                              'WeatherIcons', 'WeatherIcons', 'f09f' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-gibbous-4',                                              'WeatherIcons', 'WeatherIcons', 'f0a0' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-gibbous-5',                                              'WeatherIcons', 'WeatherIcons', 'f0a1' );
sap.ui.core.IconPool.addIcon('wi-moon-waxing-gibbous-6',                                              'WeatherIcons', 'WeatherIcons', 'f0a2' );
sap.ui.core.IconPool.addIcon('wi-moon-moon-full',                                                     'WeatherIcons', 'WeatherIcons', 'f0a3' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-gibbous-1',                                              'WeatherIcons', 'WeatherIcons', 'f0a4' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-gibbous-2',                                              'WeatherIcons', 'WeatherIcons', 'f0a5' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-gibbous-3',                                              'WeatherIcons', 'WeatherIcons', 'f0a6' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-gibbous-4',                                              'WeatherIcons', 'WeatherIcons', 'f0a7' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-gibbous-5',                                              'WeatherIcons', 'WeatherIcons', 'f0a8' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-gibbous-6',                                              'WeatherIcons', 'WeatherIcons', 'f0a9' );
sap.ui.core.IconPool.addIcon('wi-moon-third-quarter',                                                 'WeatherIcons', 'WeatherIcons', 'f0aa' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-crescent-1',                                             'WeatherIcons', 'WeatherIcons', 'f0ab' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-crescent-2',                                             'WeatherIcons', 'WeatherIcons', 'f0ac' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-crescent-3',                                             'WeatherIcons', 'WeatherIcons', 'f0ad' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-crescent-4',                                             'WeatherIcons', 'WeatherIcons', 'f0ae' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-crescent-5',                                             'WeatherIcons', 'WeatherIcons', 'f0af' );
sap.ui.core.IconPool.addIcon('wi-moon-waning-crescent-6',                                             'WeatherIcons', 'WeatherIcons', 'f0b0' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-new',                                                       'WeatherIcons', 'WeatherIcons', 'f0eb' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-crescent-1',                                         'WeatherIcons', 'WeatherIcons', 'f0d0' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-crescent-2',                                         'WeatherIcons', 'WeatherIcons', 'f0d1' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-crescent-3',                                         'WeatherIcons', 'WeatherIcons', 'f0d2' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-crescent-4',                                         'WeatherIcons', 'WeatherIcons', 'f0d3' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-crescent-5',                                         'WeatherIcons', 'WeatherIcons', 'f0d4' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-crescent-6',                                         'WeatherIcons', 'WeatherIcons', 'f0d5' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-first-quarter',                                             'WeatherIcons', 'WeatherIcons', 'f0d6' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-gibbous-1',                                          'WeatherIcons', 'WeatherIcons', 'f0d7' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-gibbous-2',                                          'WeatherIcons', 'WeatherIcons', 'f0d8' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-gibbous-3',                                          'WeatherIcons', 'WeatherIcons', 'f0d9' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-gibbous-4',                                          'WeatherIcons', 'WeatherIcons', 'f0da' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-gibbous-5',                                          'WeatherIcons', 'WeatherIcons', 'f0db' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waxing-gibbous-6',                                          'WeatherIcons', 'WeatherIcons', 'f0dc' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-moon-full',                                                 'WeatherIcons', 'WeatherIcons', 'f0dd' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-gibbous-1',                                          'WeatherIcons', 'WeatherIcons', 'f0de' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-gibbous-2',                                          'WeatherIcons', 'WeatherIcons', 'f0df' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-gibbous-3',                                          'WeatherIcons', 'WeatherIcons', 'f0e0' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-gibbous-4',                                          'WeatherIcons', 'WeatherIcons', 'f0e1' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-gibbous-5',                                          'WeatherIcons', 'WeatherIcons', 'f0e2' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-gibbous-6',                                          'WeatherIcons', 'WeatherIcons', 'f0e3' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-third-quarter',                                             'WeatherIcons', 'WeatherIcons', 'f0e4' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-crescent-1',                                         'WeatherIcons', 'WeatherIcons', 'f0e5' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-crescent-2',                                         'WeatherIcons', 'WeatherIcons', 'f0e6' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-crescent-3',                                         'WeatherIcons', 'WeatherIcons', 'f0e7' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-crescent-4',                                         'WeatherIcons', 'WeatherIcons', 'f0e8' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-crescent-5',                                         'WeatherIcons', 'WeatherIcons', 'f0e9' );
sap.ui.core.IconPool.addIcon('wi-moon-alt-waning-crescent-6',                                         'WeatherIcons', 'WeatherIcons', 'f0ea' );
//-- Time --//
sap.ui.core.IconPool.addIcon('wi-time-1',                                                             'WeatherIcons', 'WeatherIcons', 'f08a' );
sap.ui.core.IconPool.addIcon('wi-time-2',                                                             'WeatherIcons', 'WeatherIcons', 'f08b' );
sap.ui.core.IconPool.addIcon('wi-time-3',                                                             'WeatherIcons', 'WeatherIcons', 'f08c' );
sap.ui.core.IconPool.addIcon('wi-time-4',                                                             'WeatherIcons', 'WeatherIcons', 'f08d' );
sap.ui.core.IconPool.addIcon('wi-time-5',                                                             'WeatherIcons', 'WeatherIcons', 'f08e' );
sap.ui.core.IconPool.addIcon('wi-time-6',                                                             'WeatherIcons', 'WeatherIcons', 'f08f' );
sap.ui.core.IconPool.addIcon('wi-time-7',                                                             'WeatherIcons', 'WeatherIcons', 'f090' );
sap.ui.core.IconPool.addIcon('wi-time-8',                                                             'WeatherIcons', 'WeatherIcons', 'f091' );
sap.ui.core.IconPool.addIcon('wi-time-9',                                                             'WeatherIcons', 'WeatherIcons', 'f092' );
sap.ui.core.IconPool.addIcon('wi-time-10',                                                            'WeatherIcons', 'WeatherIcons', 'f093' );
sap.ui.core.IconPool.addIcon('wi-time-11',                                                            'WeatherIcons', 'WeatherIcons', 'f094' );
sap.ui.core.IconPool.addIcon('wi-time-12',                                                            'WeatherIcons', 'WeatherIcons', 'f089' );
//-- Directional Arrows --//
sap.ui.core.IconPool.addIcon('wi-direction-up',                                                       'WeatherIcons', 'WeatherIcons', 'f058' );
sap.ui.core.IconPool.addIcon('wi-direction-up-right',                                                 'WeatherIcons', 'WeatherIcons', 'f057' );
sap.ui.core.IconPool.addIcon('wi-direction-right',                                                    'WeatherIcons', 'WeatherIcons', 'f04d' );
sap.ui.core.IconPool.addIcon('wi-direction-down-right',                                               'WeatherIcons', 'WeatherIcons', 'f088' );
sap.ui.core.IconPool.addIcon('wi-direction-down',                                                     'WeatherIcons', 'WeatherIcons', 'f044' );
sap.ui.core.IconPool.addIcon('wi-direction-down-left',                                                'WeatherIcons', 'WeatherIcons', 'f043' );
sap.ui.core.IconPool.addIcon('wi-direction-left',                                                     'WeatherIcons', 'WeatherIcons', 'f048' );
sap.ui.core.IconPool.addIcon('wi-direction-up-left',                                                  'WeatherIcons', 'WeatherIcons', 'f087' );
/*-- 
//-- Wind Degree Examples --//
sap.ui.core.IconPool.addIcon('towards-0-deg',                                                         'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-23-deg',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-45-deg',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-68-deg',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-90-deg',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-113-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-135-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-158-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-180-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-203-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-225-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-248-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-270-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-293-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-313-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('towards-336-deg',                                                       'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-180-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-203-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-225-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-248-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-270-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-293-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-313-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-336-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-0-deg',                                                            'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-23-deg',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-45-deg',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-68-deg',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-90-deg',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-113-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-135-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('from-158-deg',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
//-- Wind Cardinal Examples --//
sap.ui.core.IconPool.addIcon('wi-towards-n',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-nne',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-ne',                                                         'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-ene',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-e',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-ese',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-se',                                                         'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-sse',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-s',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-ssw',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-sw',                                                         'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-wsw',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-w',                                                          'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-wnw',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-nw',                                                         'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-towards-nnw',                                                        'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-n',                                                             'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-nne',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-ne',                                                            'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-ene',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-e',                                                             'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-ese',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-se',                                                            'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-sse',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-s',                                                             'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-ssw',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-sw',                                                            'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-wsw',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-w',                                                             'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-wnw',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-nw',                                                            'WeatherIcons', 'WeatherIcons', 'f0b1' );
sap.ui.core.IconPool.addIcon('wi-from-nnw',                                                           'WeatherIcons', 'WeatherIcons', 'f0b1' );
--*/
//-- Beaufort Wind Scale --//
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-1',                                                    'WeatherIcons', 'WeatherIcons', 'f0b7' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-1',                                                    'WeatherIcons', 'WeatherIcons', 'f0b8' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-2',                                                    'WeatherIcons', 'WeatherIcons', 'f0b9' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-3',                                                    'WeatherIcons', 'WeatherIcons', 'f0ba' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-4',                                                    'WeatherIcons', 'WeatherIcons', 'f0bb' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-5',                                                    'WeatherIcons', 'WeatherIcons', 'f0bc' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-6',                                                    'WeatherIcons', 'WeatherIcons', 'f0bd' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-7',                                                    'WeatherIcons', 'WeatherIcons', 'f0be' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-8',                                                    'WeatherIcons', 'WeatherIcons', 'f0bf' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-9',                                                    'WeatherIcons', 'WeatherIcons', 'f0c0' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-10',                                                   'WeatherIcons', 'WeatherIcons', 'f0c1' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-11',                                                   'WeatherIcons', 'WeatherIcons', 'f0c2' );
sap.ui.core.IconPool.addIcon('wi-wind-beaufort-12',                                                   'WeatherIcons', 'WeatherIcons', 'f0c3' );


//================================================//
//== 5.3 - PAGES								==//
//================================================//
//-- NOTE: The first page added is the one that will be displayed on first run --//

var aPages = [
    // --- User Login Views --- \\
	{
		"Id":			"pLogin",
		"Location":		"mjs.login.Login",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.login.Login\" Page!\n",
        
        "HelpInfo":     "Before you can use the app, you need to enter your username and password to "
						+ "view and manage your devices."
	},
	{
		"Id":			"pForceSwitchUser",
		"Location":		"mjs.login.ForceSwitchUser",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.login.ForceSwitchUser\" Page!\n",
        
        "HelpInfo":     "If at anytime you wish to switch from one user to the next, simply enter the "
						+ "username and password. The current session will terminate once you switch users."
	},
    // --- Premise Overview --- \\
    {
		"Id":			"pPremiseOverview",
		"Location":		"mjs.premise.Overview",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.premise.Overview\" Page!\n",
        
        "HelpInfo":     "The Premise Overview features a combo box complete with "
                        + "a list of premises that are available to the user. Below the premise combo box "
                        + "is a list of rooms that are registered with the currently selected premise.\n\n"
                        + "There is a button to the right of the name of the room that allows you to show "
                        + "or hide its list of devices.\n\n Each device can be tapped to lead into the device "
                        + "information page.\n\nThe action menu will allow you to edit the information and address "
                        + "of the currently selected premise, and add a new room."
	},
    // --- Device Overview --- \\
    {
		"Id":			"pDeviceOverview",
		"Location":		"mjs.devices.DeviceOverview",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.device.DeviceOverview\" Page!\n",
        
        "HelpInfo":     "This is the home page.\n\nHere is a list of all the devices that the current user "
                        + "has access to, regardless of their location. Some of these can be switched on or off "
                        + "depending on whether the current user has permission to do this."
	},
    // --- Room Overview And Unassigned Devices --- \\
    {
		"Id":			"pRoomsOverview",
		"Location":		"mjs.rooms.Room",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.rooms.Room\" Page!\n",
        
        "HelpInfo":     "This page lists all devices in the selected room and their current readings of "
						+ "voltage, amps, kilowatts, and kilowatt/hour.\n\nYou can also switch these devices on "
                        + "or off."
	},
//    {
//		"Id":			"pRoomsUnassignedDevices",
//		"Location":		"mjs.rooms.UnassignedDevices",
//		"Type":			"JS",
//		"ErrMesg":		"Critical Error: Couldn't load \"mjs.rooms.UnassignedDevices\" Page!\n"
//	},
    // --- Settings Views --- \\
    {
		"Id":			"pSettingsDeviceList",
		"Location":		"mjs.settings.DeviceList",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.DeviceList\" Page!\n",
        
        "HelpInfo":     "Here is a list of links and their objects. Tap a name to view or edit "
						+ "the link or object details. Each link has a list of any objects that may "
                        + "be connected to it. These lists are expandable.\n\nThere are two entries in "
                        + "the action menu, one to add a link, and the other to add an item to a link."
	},
    {
		"Id":			"pSettingsEditLink",
		"Location":		"mjs.settings.devices.EditLink",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.devices.EditLink\" Page!\n",
        
        "HelpInfo":     "You can change the name of a link and which room the link is located on this page."
	},
    {
		"Id":			"pSettingsEditThing",
		"Location":		"mjs.settings.devices.EditThing",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.devices.EditThing\" Page!\n",
        
        "HelpInfo":     "You can change the name of an item in this page."
	},
    {
		"Id":			"pSettingsLinkAdd",
		"Location":		"mjs.settings.links.LinkAdd",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.links.LinkAdd\" Page!\n",
        
        "HelpInfo":     "Allows you to add a link and assign it a room. Different link types are "
                        + "supported and each one will have its own specific form."
	},
    {
		"Id":			"pSettingsThingAdd",
		"Location":		"mjs.settings.things.ItemAdd",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.things.ItemAdd\" Page!\n",
        
        "HelpInfo":     "Allows you to add items of certain types to a link. Note that some items like "
                        + "Philips Hue lamps and devices attached to Zigbee plugs will have already "
                        + "been added to their links as soon as the link was created."
	},
    {
		"Id":			"pSettingsAddUser",
		"Location":		"mjs.settings.user.AddUser",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.user.AddUser\" Page!\n",
        
        "HelpInfo":     "This is where you can create new users if you have permission to do so. "
                        + "Required fields are the Display Name, username, and Line 1 of the Street Address. "
                        + "User information, address, and credentials are stored in the database."
	},
    {
		"Id":			"pSettingsUserInfo",
		"Location":		"mjs.settings.user.EditUserInformation",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.user.EditUserInformation\" Page!\n",
        
        "HelpInfo":     "This page is where you can change your name(s) and your personal and contact details."
	},
    {
		"Id":			"pSettingsUserPassword",
		"Location":		"mjs.settings.user.UserEditPassword",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.user.UserEditPassword\" Page!\n",
        
        "HelpInfo":     "Enter your currrent password to change your password. Enter the new "
                        + "password twice to confirm."
	},
    {
		"Id":			"pSettingsUserAddress",
		"Location":		"mjs.settings.user.EditUserAddress",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.user.EditUserAddress\" Page!\n",
        
        "HelpInfo":     "This page allows you to change your address."
	},
    {
		"Id":			"pSettingsPremiseList",
		"Location":		"mjs.settings.PremiseList",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.PremiseList\" Page!\n",
        
        "HelpInfo":     "This page is a list of premises that are available to the user. Any hubs that "
                        + "the current user has access to will be displayed under their own premise once its "
                        + "list is expanded."
	},
    {
		"Id":			"pSettingsPremiseInfo",
		"Location":		"mjs.settings.premise.PremiseEditInfo",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.premise.PremiseEditInfo\" Page!\n",
        
        "HelpInfo":     "The user can change the premise name and its description. If the current user "
                        + "owns the premise, a button to change the permissions will be available."
	},
    {
		"Id":			"pSettingsPremiseHub",
		"Location":		"mjs.settings.premise.PremiseEditHub",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.premise.PremiseEditHub\" Page!\n",
        
        "HelpInfo":     "The user can change the name of the selected hub on this page."
	},
    {
		"Id":			"pSettingsPremiseAddress",
		"Location":		"mjs.settings.premise.PremiseEditAddress",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.premise.PremiseEditAddress\" Page!\n",
        
        "HelpInfo":     "This page allows you to change the location address of the selected premise."
	},
    {
		"Id":			"pSettingsRoomEdit",
		"Location":		"mjs.settings.rooms.RoomEdit",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.rooms.RoomEdit\" Page!\n",
        
        "HelpInfo":     "Use this page to modify details about the selected room, i.e. name (required), "
                        + "description (optional), and the type of room it is."
	},
    {
		"Id":			"pSettingsRoomAdd",
		"Location":		"mjs.settings.rooms.RoomAdd",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.rooms.RoomAdd\" Page!\n",
        
        "HelpInfo":     "Use this page to create a room with a name (required), description (optional), "
                        + "what floor it belongs to, and the type of room it is."
	},
    {
		"Id":			"pSettingsRoomPermissions",
		"Location":		"mjs.settings.permissions.RoomPermission",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.permissions.RoomPermission\" Page!\n"
	},
    {
		"Id":			"pSettingsPremisePermissions",
		"Location":		"mjs.settings.permissions.PremisePermission",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.settings.permissions.PremisePermission\" Page!\n"
	},
    {
		"Id":			"pDeviceData",
		"Location":		"mjs.premise.DeviceData",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.premise.DeviceData\" Page!\n",
        
        "HelpInfo":     "This page lists the current state (on/off) all the current readings of voltage, amps, "
						+ "kilowatts, and kilowatt/hour from the current device."
	},
    {
		"Id":			"pOnvif",
		"Location":		"mjs.devices.OnvifCamera",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.OnvifCamera\" Page!\n",
        
        "HelpInfo":     "Displays the camera stream thumbnail if the camera is on. If the camera has PTZ support, "
                        + "there are controls around the page."
	},
    {
		"Id":			"pPhilipsHue",
		"Location":		"mjs.devices.PhilipsHue",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.PhilipsHue\" Page!\n",
        
        "HelpInfo":     "This page shows the current the colour (hue), saturation, and brightness of the "
						+ "currently selected device. Each has its own slide to easily change the levels of "
                        + "each setting. There is also a switch to turn it either on or off."
	},
    { // TODO: Change the file containing this to './mjs/devices/OpenWeatherMap'.
		"Id":			"pThermostat",
		"Location":		"mjs.devices.Thermostat",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.Thermostat\" Page!\n"
	},
    {
		"Id":			"pMotionSensor",
		"Location":		"mjs.devices.MotionSensor",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.MotionSensor\" Page!\n"
	},
    { 
		"Id":			"pDeviceDoorLock",
		"Location":		"mjs.devices.DoorLock",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.DoorLock\" Page!\n"
	},
	{ 
		"Id":			"pDeviceWindowSensor",
		"Location":		"mjs.devices.WindowSensor",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.WindowSensor\" Page!\n"
	},
	{ 
		"Id":			"pDeviceTestThermostat",
		"Location":		"mjs.devices.TestThermostat",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.TestThermostat\" Page!\n"
	},
	{
		"Id":			"pDeviceScales",
		"Location":		"mjs.devices.Scales",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.Scales\" Page!\n"
	},
	/* No current pages 
	{
		"Id":			"pDeviceQuadcopter",
		"Location":		"mjs.devices.Quadcopter",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.Quadcopter\" Page!\n"
	},
	*/
	{
		"Id":			"pDeviceBPM",
		"Location":		"mjs.devices.BPM",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.BPM\" Page!\n"
	},
    {
		"Id":			"pDeviceGaragedoor",
		"Location":		"mjs.devices.Garagedoor",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.devices.Garagedoor\" Page!\n"
	},
    //--------------------------------------------------------------------//
    // Staging
    //--------------------------------------------------------------------//
	{ 
		"Id":			"pStagingHome",
		"Location":		"mjs.staging.StagingHome",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.staging.StagingHome\" Page!\n"
	},
	{ 
		"Id":			"pRulesOverview",
		"Location":		"mjs.staging.RulesOverview",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"mjs.staging.RulesOverview\" Page!\n"
	},
	
];

/**
 * Add each page declared in aPages using the map of variables for the page ID,
 * view name and its corresponding controller name, language type (in this it is
 * JS (JavaScript), and also the error message that will be displayed if an error
 * occurs in either its UI5 view or controller.
 */
$.each( aPages, function (iIndex, aPageData) {
	try {
		//--------------------------------//
		//-- 1.0 - Declare variables	--//
		//--------------------------------//
		var sType			= "";
		var sErMesg			= aPageData.ErrMesg;
		
		//--------------------------------//
		//--
		//--------------------------------//
		switch(aPageData.Type) {
			case "JS":
				sType =		sap.ui.core.mvc.ViewType.JS;
				break;
			
			case "XML":
				sType =		sap.ui.core.mvc.ViewType.XML;
				break;
			
		}
		
		//------------------------------------//
        // Add the help information to memory
        //------------------------------------//
        if (aPageData.HelpInfo !== undefined) {
            IOMy.help.PageInformation[aPageData.Id] = aPageData.HelpInfo;
        } else {
            // Pages with no help information will show the ID indicating that
            // the page needs to show help information.
            // TODO: Help information must be provided before the activity can
            // be created.
            IOMy.help.PageInformation[aPageData.Id] = aPageData.Id;
        }
		
        oApp.addPage(
			new sap.ui.view({
				id:			aPageData.Id,
				viewName:	aPageData.Location,
				type:		sType
			})
		);

	} catch(ePLogin) {
		console.log( sErMesg+ePLogin.message );
	}
});

//================================================//
//== 5.4 - DEPLOY OPENUI5 APP					==//
//================================================//

//-- Deploy that App in the Content Div --//
oApp.placeAt("content");


