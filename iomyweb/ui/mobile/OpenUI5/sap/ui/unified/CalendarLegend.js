/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','./library'],function(q,C,l){"use strict";var a=C.extend("sap.ui.unified.CalendarLegend",{metadata:{library:"sap.ui.unified",properties:{columnWidth:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:'120px'}},aggregations:{items:{type:"sap.ui.unified.CalendarLegendItem",multiple:true,singularName:"item"},standardItems:{type:"sap.ui.unified.CalendarLegendItem",multiple:true,visibility:"hidden"}}}});a.prototype.init=function(){var r=sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");var i=this.getId();var I=new sap.ui.unified.CalendarLegendItem(i+"-Today",{text:r.getText("LEGEND_TODAY")});this.addAggregation("standardItems",I);I=new sap.ui.unified.CalendarLegendItem(i+"-Selected",{text:r.getText("LEGEND_SELECTED")});this.addAggregation("standardItems",I);I=new sap.ui.unified.CalendarLegendItem(i+"-NormalDay",{text:r.getText("LEGEND_NORMAL_DAY")});this.addAggregation("standardItems",I);I=new sap.ui.unified.CalendarLegendItem(i+"-NonWorkingDay",{text:r.getText("LEGEND_NON_WORKING_DAY")});this.addAggregation("standardItems",I);};a.prototype.onAfterRendering=function(){if(sap.ui.Device.browser.msie){if(sap.ui.Device.browser.version<10){q(".sapUiUnifiedLegendItem").css("width",this.getColumnWidth()+4+"px").css("display","inline-block");}}};a.prototype._getItemType=function(i){var I=this.getItems(),t=i.getType(),n,f;if(t&&t!==sap.ui.unified.CalendarDayType.None){return t;}f=this._getUnusedItemTypes();n=I.filter(function(b){return!b.getType()||b.getType()===sap.ui.unified.CalendarDayType.None;}).indexOf(i);if(n<0){q.sap.log.error('Legend item is not in the legend',this);return t;}if(f[n]){t=f[n];}else{t="Type"+(Object.keys(sap.ui.unified.CalendarDayType).length+n-f.length);}return t;};a.prototype._getItemByType=function(t){var I,b=this.getItems(),i;for(i=0;i<b.length;i++){if(this._getItemType(b[i])===t){I=b[i];break;}}return I;};a.prototype._getUnusedItemTypes=function(){var f=q.extend({},sap.ui.unified.CalendarDayType),I=this.getItems(),t,i;delete f[sap.ui.unified.CalendarDayType.None];for(i=0;i<I.length;i++){t=I[i].getType();if(f[t]){delete f[t];}}return Object.keys(f);};a.typeARIATexts={};a.getTypeAriaText=function(t){var r,T;if(t.indexOf("Type")!==0){return;}if(!a.typeARIATexts[t]){r=sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");T=r.getText("LEGEND_UNNAMED_TYPE",parseInt(t.slice(4),10).toString());a.typeARIATexts[t]=new sap.ui.core.InvisibleText({text:T});a.typeARIATexts[t].toStatic();}return a.typeARIATexts[t];};return a;},true);
