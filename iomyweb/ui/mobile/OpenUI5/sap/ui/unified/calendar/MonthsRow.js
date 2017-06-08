/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/ui/core/LocaleData','sap/ui/core/delegate/ItemNavigation','sap/ui/model/type/Date','sap/ui/unified/calendar/CalendarUtils','sap/ui/core/date/UniversalDate','sap/ui/unified/library'],function(q,C,L,I,D,a,U,l){"use strict";var M=C.extend("sap.ui.unified.calendar.MonthsRow",{metadata:{library:"sap.ui.unified",properties:{date:{type:"object",group:"Data"},startDate:{type:"object",group:"Data"},months:{type:"int",group:"Appearance",defaultValue:12},intervalSelection:{type:"boolean",group:"Behavior",defaultValue:false},singleSelection:{type:"boolean",group:"Behavior",defaultValue:true},showHeader:{type:"boolean",group:"Appearance",defaultValue:false}},aggregations:{selectedDates:{type:"sap.ui.unified.DateRange",multiple:true,singularName:"selectedDate"},specialDates:{type:"sap.ui.unified.DateTypeRange",multiple:true,singularName:"specialDate"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"},legend:{type:"sap.ui.unified.CalendarLegend",multiple:false}},events:{select:{},focus:{parameters:{date:{type:"object"},notVisible:{type:"boolean"}}}}}});M.prototype.init=function(){this._oFormatYyyymm=sap.ui.core.format.DateFormat.getInstance({pattern:"yyyyMMdd",calendarType:sap.ui.core.CalendarType.Gregorian});this._oFormatLong=sap.ui.core.format.DateFormat.getInstance({pattern:"MMMM y"});this._mouseMoveProxy=q.proxy(this._handleMouseMove,this);this._rb=sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");};M.prototype.exit=function(){if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy();delete this._oItemNavigation;}if(this._sInvalidateMonths){q.sap.clearDelayedCall(this._sInvalidateMonths);}};M.prototype.onAfterRendering=function(){_.call(this);r.call(this);};M.prototype.onsapfocusleave=function(E){if(!E.relatedControlId||!q.sap.containsOrEquals(this.getDomRef(),sap.ui.getCore().byId(E.relatedControlId).getFocusDomRef())){if(this._bMouseMove){u.call(this,true);m.call(this,this._getDate());this._bMoveChange=false;this._bMousedownChange=false;p.call(this);}if(this._bMousedownChange){this._bMousedownChange=false;p.call(this);}}};M.prototype.invalidate=function(O){if(!this._bDateRangeChanged&&(!O||!(O instanceof sap.ui.unified.DateRange))){C.prototype.invalidate.apply(this,arguments);}else if(this.getDomRef()&&!this._sInvalidateMonths){if(this._bInvalidateSync){s.call(this);}else{this._sInvalidateMonths=q.sap.delayedCall(0,this,s);}}};M.prototype.removeAllSelectedDates=function(){this._bDateRangeChanged=true;var R=this.removeAllAggregation("selectedDates");return R;};M.prototype.destroySelectedDates=function(){this._bDateRangeChanged=true;var b=this.destroyAggregation("selectedDates");return b;};M.prototype.removeAllSpecialDates=function(){this._bDateRangeChanged=true;var R=this.removeAllAggregation("specialDates");return R;};M.prototype.destroySpecialDates=function(){this._bDateRangeChanged=true;var b=this.destroyAggregation("specialDates");return b;};M.prototype.setDate=function(b){g.call(this,b,false);return this;};M.prototype._setDate=function(b){var i=a._createLocalDate(b);this.setProperty("date",i,true);this._oUTCDate=b;};M.prototype._getDate=function(){if(!this._oUTCDate){this._oUTCDate=a._createUniversalUTCDate(new Date());}return this._oUTCDate;};M.prototype.setStartDate=function(S){if(!(S instanceof Date)){throw new Error("Date must be a JavaScript date object; "+this);}var y=S.getFullYear();if(y<1||y>9999){throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); "+this);}var b=a._createUniversalUTCDate(S);this.setProperty("startDate",S,true);this._oUTCStartDate=b;this._oUTCStartDate.setUTCDate(1);if(this.getDomRef()){var O=a._createLocalDate(this._getDate());this._bNoRangeCheck=true;this.displayDate(S);this._bNoRangeCheck=false;if(O&&this.checkDateFocusable(O)){this.setDate(O);}}return this;};M.prototype._getStartDate=function(){if(!this._oUTCStartDate){this._oUTCStartDate=a._createUniversalUTCDate(new Date());this._oUTCStartDate.setUTCDate(1);}return this._oUTCStartDate;};M.prototype.displayDate=function(b){g.call(this,b,true);return this;};M.prototype._getLocale=function(){var P=this.getParent();if(P&&P.getLocale){return P.getLocale();}else if(!this._sLocale){this._sLocale=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();}return this._sLocale;};M.prototype._getLocaleData=function(){var P=this.getParent();if(P&&P._getLocaleData){return P._getLocaleData();}else if(!this._oLocaleData){var b=this._getLocale();var i=new sap.ui.core.Locale(b);this._oLocaleData=L.getInstance(i);}return this._oLocaleData;};M.prototype._getFormatLong=function(){var b=this._getLocale();if(this._oFormatLong.oLocale.toString()!=b){var i=new sap.ui.core.Locale(b);this._oFormatLong=sap.ui.core.format.DateFormat.getInstance({style:"long"},i);}return this._oFormatLong;};M.prototype.getIntervalSelection=function(){var P=this.getParent();if(P&&P.getIntervalSelection){return P.getIntervalSelection();}else{return this.getProperty("intervalSelection");}};M.prototype.getSingleSelection=function(){var P=this.getParent();if(P&&P.getSingleSelection){return P.getSingleSelection();}else{return this.getProperty("singleSelection");}};M.prototype.getSelectedDates=function(){var P=this.getParent();if(P&&P.getSelectedDates){return P.getSelectedDates();}else{return this.getAggregation("selectedDates",[]);}};M.prototype.getSpecialDates=function(){var P=this.getParent();if(P&&P.getSpecialDates){return P.getSpecialDates();}else{return this.getAggregation("specialDates",[]);}};M.prototype._getShowHeader=function(){var P=this.getParent();if(P&&P._getShowItemHeader){return P._getShowItemHeader();}else{return this.getProperty("showHeader");}};M.prototype.getAriaLabelledBy=function(){var P=this.getParent();if(P&&P.getAriaLabelledBy){return P.getAriaLabelledBy();}else{return this.getAssociation("ariaLabelledBy",[]);}};M.prototype.getLegend=function(){var P=this.getParent();if(P&&P.getLegend){return P.getLegend();}else{return this.getAssociation("ariaLabelledBy",[]);}};M.prototype._checkDateSelected=function(b){if(!(b instanceof U)){throw new Error("Date must be a UniversalDate object "+this);}var S=0;var v=this.getSelectedDates();var w=new U(b.getTime());w.setUTCDate(1);var T=w.getTime();for(var i=0;i<v.length;i++){var R=v[i];var x=R.getStartDate();var y=0;if(x){x=a._createUniversalUTCDate(x);x.setUTCDate(1);y=x.getTime();}var E=R.getEndDate();var z=0;if(E){E=a._createUniversalUTCDate(E);E.setUTCDate(1);z=E.getTime();}if(T==y&&!E){S=1;break;}else if(T==y&&E){S=2;if(E&&T==z){S=5;}break;}else if(E&&T==z){S=3;break;}else if(E&&T>y&&T<z){S=4;break;}if(this.getSingleSelection()){break;}}return S;};M.prototype._getDateType=function(b){if(!(b instanceof U)){throw new Error("Date must be a UniversalDate object "+this);}var T;var S=this.getSpecialDates();var v=new U(b.getTime());v.setUTCDate(1);var w=v.getTime();for(var i=0;i<S.length;i++){var R=S[i];var x=R.getStartDate();var y=0;if(x){x=a._createUniversalUTCDate(x);x.setUTCDate(1);y=x.getTime();}var E=R.getEndDate();var z=0;if(E){E=a._createUniversalUTCDate(E);E.setUTCDate(1);E.setUTCMonth(E.getUTCMonth()+1);E.setUTCDate(0);z=E.getTime();}if((w==y&&!E)||(w>=y&&w<=z)){T={type:R.getType(),tooltip:R.getTooltip_AsString()};break;}}return T;};M.prototype._checkMonthEnabled=function(b){if(!(b instanceof U)){throw new Error("Date must be a UniversalDate object "+this);}var T=b.getTime();var P=this.getParent();if(P&&P._oMinDate&&P._oMaxDate){if(T<P._oMinDate.getTime()||T>P._oMaxDate.getTime()){return false;}}return true;};M.prototype._handleMouseMove=function(E){if(!this.$().is(":visible")){u.call(this,true);}var T=q(E.target);if(T.hasClass("sapUiCalItemText")){T=T.parent();}if(T.hasClass("sapUiCalItem")){var O=this._getDate();var F=new U(this._oFormatYyyymm.parse(T.attr("data-sap-month"),true).getTime());F.setUTCDate(1);if(F.getTime()!=O.getTime()){this._setDate(F);m.call(this,F,true);this._bMoveChange=true;}}};M.prototype.onmouseup=function(E){if(this._bMouseMove){u.call(this,true);var F=this._getDate();var b=this._oItemNavigation.getItemDomRefs();for(var i=0;i<b.length;i++){var $=q(b[i]);if($.attr("data-sap-month")==this._oFormatYyyymm.format(F.getJSDate(),true)){$.focus();break;}}if(this._bMoveChange){var T=q(E.target);if(T.hasClass("sapUiCalItemText")){T=T.parent();}if(T.hasClass("sapUiCalItem")){F=new U(this._oFormatYyyymm.parse(T.attr("data-sap-month"),true).getTime());F.setUTCDate(1);}m.call(this,F);this._bMoveChange=false;this._bMousedownChange=false;p.call(this);}}if(this._bMousedownChange){this._bMousedownChange=false;p.call(this);}};M.prototype.onsapselect=function(E){var S=m.call(this,this._getDate());if(S){p.call(this);}E.stopPropagation();E.preventDefault();};M.prototype.onsapselectmodifiers=function(E){this.onsapselect(E);};M.prototype.onsappageupmodifiers=function(E){var F=new U(this._getDate().getTime());var y=F.getUTCFullYear();if(E.metaKey||E.ctrlKey){F.setUTCFullYear(y-10);}else{var i=this.getMonths();if(i<=12){F.setUTCFullYear(y-1);}else{F.setUTCMonths(F.getUTCMonth()-i);}}this.fireFocus({date:a._createLocalDate(F),notVisible:true});E.preventDefault();};M.prototype.onsappagedownmodifiers=function(E){var F=new U(this._getDate().getTime());var y=F.getUTCFullYear();if(E.metaKey||E.ctrlKey){F.setUTCFullYear(y+10);}else{var i=this.getMonths();if(i<=12){F.setUTCFullYear(y+1);}else{F.setUTCMonths(F.getUTCMonth()+i);}}this.fireFocus({date:a._createLocalDate(F),notVisible:true});E.preventDefault();};M.prototype.onThemeChanged=function(){if(this._bNoThemeChange){return;}this._bNamesLengthChecked=undefined;this._bLongWeekDays=undefined;var b=this._getLocaleData();var v=b.getMonthsStandAlone("wide");var w=this.$("months").children();var x=this._getStartDate().getUTCMonth();for(var i=0;i<w.length;i++){var $=q(q(w[i]).children(".sapUiCalItemText"));$.text(v[(i+x)%12]);}r.call(this);};M.prototype.checkDateFocusable=function(b){if(!(b instanceof Date)){throw new Error("Date must be a JavaScript date object; "+this);}if(this._bNoRangeCheck){return false;}var S=this._getStartDate();var E=new U(S.getTime());E.setUTCDate(1);E.setUTCMonth(E.getUTCMonth()+this.getMonths());var i=a._createUniversalUTCDate(b);if(i.getTime()>=S.getTime()&&i.getTime()<E.getTime()){return true;}else{return false;}};M.prototype.applyFocusInfo=function(i){this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());return this;};function _(){var b=this._getDate();var y=this._oFormatYyyymm.format(b.getJSDate(),true);var v=0;var R=this.$("months").get(0);var w=this.$("months").children(".sapUiCalItem");for(var i=0;i<w.length;i++){var $=q(w[i]);if($.attr("data-sap-month")===y){v=i;break;}}if(!this._oItemNavigation){this._oItemNavigation=new I();this._oItemNavigation.attachEvent(I.Events.AfterFocus,c,this);this._oItemNavigation.attachEvent(I.Events.FocusAgain,d,this);this._oItemNavigation.attachEvent(I.Events.BorderReached,e,this);this.addDelegate(this._oItemNavigation);this._oItemNavigation.setDisabledModifiers({sapnext:["alt"],sapprevious:["alt"],saphome:["alt"],sapend:["alt"]});this._oItemNavigation.setCycling(false);this._oItemNavigation.setColumns(1,true);}this._oItemNavigation.setRootDomRef(R);this._oItemNavigation.setItemDomRefs(w);this._oItemNavigation.setFocusedIndex(v);this._oItemNavigation.setPageSize(w.length);}function c(b){var i=b.getParameter("index");var E=b.getParameter("event");if(!E){return;}var O=this._getDate();var F=new U(O.getTime());var v=this._oItemNavigation.getItemDomRefs();var $=q(v[i]);F=new U(this._oFormatYyyymm.parse($.attr("data-sap-month"),true).getTime());F.setUTCDate(1);this._setDate(F);this.fireFocus({date:a._createLocalDate(F),notVisible:false});if(E.type=="mousedown"){f.call(this,E,F,i);}}function d(b){var i=b.getParameter("index");var E=b.getParameter("event");if(!E){return;}if(E.type=="mousedown"){var F=this._getDate();f.call(this,E,F,i);}}function e(b){var E=b.getParameter("event");var i=this.getMonths();var O=this._getDate();var F=new U(O.getTime());if(E.type){switch(E.type){case"sapnext":case"sapnextmodifiers":F.setUTCMonth(F.getUTCMonth()+1);break;case"sapprevious":case"sappreviousmodifiers":F.setUTCMonth(F.getUTCMonth()-1);break;case"sappagedown":F.setUTCMonth(F.getUTCMonth()+i);break;case"sappageup":F.setUTCMonth(F.getUTCMonth()-i);break;default:break;}this.fireFocus({date:a._createLocalDate(F),notVisible:true});}}function f(E,F,i){if(E.button){return;}var S=m.call(this,F);if(S){this._bMousedownChange=true;}if(this._bMouseMove){u.call(this,true);this._bMoveChange=false;}else if(S&&this.getIntervalSelection()&&this.$().is(":visible")){t.call(this,true);}E.preventDefault();E.setMark("cancelAutoClose");}function g(b,N){if(!(b instanceof Date)){throw new Error("Date must be a JavaScript date object; "+this);}var y=b.getFullYear();if(y<1||y>9999){throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); "+this);}var F=true;if(!q.sap.equal(this.getDate(),b)){var i=a._createUniversalUTCDate(b);i.setUTCDate(1);F=this.checkDateFocusable(b);if(!this._bNoRangeCheck&&!F){throw new Error("Date must be in visible date range; "+this);}this.setProperty("date",b,true);this._oUTCDate=i;}if(this.getDomRef()){if(F){h.call(this,this._oUTCDate,N);}else{j.call(this,N);}}}function h(b,N){var y=this._oFormatYyyymm.format(b.getJSDate(),true);var v=this._oItemNavigation.getItemDomRefs();var $;for(var i=0;i<v.length;i++){$=q(v[i]);if($.attr("data-sap-month")==y){if(document.activeElement!=v[i]){if(N){this._oItemNavigation.setFocusedIndex(i);}else{this._oItemNavigation.focusItem(i);}}break;}}}function j(N){var b=this._getStartDate();var $=this.$("months");if($.length>0){var R=sap.ui.getCore().createRenderManager();this.getRenderer().renderMonths(R,this,b);R.flush($[0]);R.destroy();}k.call(this);_.call(this);if(!N){this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());}}function k(){var S=this._getStartDate();if(this._getShowHeader()){var $=this.$("Head");if($.length>0){var b=this._getLocaleData();var R=sap.ui.getCore().createRenderManager();this.getRenderer().renderHeaderLine(R,this,b,S);R.flush($[0]);R.destroy();}}}function m(b,v){if(!this._checkMonthEnabled(b)){return false;}var S=this.getSelectedDates();var w;var x=this._oItemNavigation.getItemDomRefs();var $;var y;var i=0;var P=this.getParent();var A=this;var z;if(P&&P.getSelectedDates){A=P;}if(this.getSingleSelection()){if(S.length>0){w=S[0];z=w.getStartDate();if(z){z=a._createUniversalUTCDate(z);z.setUTCDate(1);}}else{w=new sap.ui.unified.DateRange();A.addAggregation("selectedDates",w,true);}if(this.getIntervalSelection()&&(!w.getEndDate()||v)&&z){var E;if(b.getTime()<z.getTime()){E=z;z=b;if(!v){w.setProperty("startDate",a._createLocalDate(new Date(z.getTime())),true);w.setProperty("endDate",a._createLocalDate(new Date(E.getTime())),true);}}else if(b.getTime()>=z.getTime()){E=b;if(!v){w.setProperty("endDate",a._createLocalDate(new Date(E.getTime())),true);}}n.call(this,z,E);}else{n.call(this,b);w.setProperty("startDate",a._createLocalDate(new Date(b.getTime())),true);w.setProperty("endDate",undefined,true);}}else{if(this.getIntervalSelection()){throw new Error("Calender don't support multiple interval selection");}else{var B=this._checkDateSelected(b);if(B>0){for(i=0;i<S.length;i++){z=S[i].getStartDate();if(z){z=a._createUniversalUTCDate(z);z.setUTCDate(1);if(b.getTime()==z.getTime()){A.removeAggregation("selectedDates",i,true);break;}}}}else{w=new sap.ui.unified.DateRange({startDate:a._createLocalDate(new Date(b.getTime()))});A.addAggregation("selectedDates",w,true);}y=this._oFormatYyyymm.format(b.getJSDate(),true);for(i=0;i<x.length;i++){$=q(x[i]);if($.attr("data-sap-month")==y){if(B>0){$.removeClass("sapUiCalItemSel");$.attr("aria-selected","false");}else{$.addClass("sapUiCalItemSel");$.attr("aria-selected","true");}}}}}return true;}function n(S,E){var b=this._oItemNavigation.getItemDomRefs();var $;var i=0;var v=false;var w=false;if(!E){var y=this._oFormatYyyymm.format(S.getJSDate(),true);for(i=0;i<b.length;i++){$=q(b[i]);v=false;w=false;if($.attr("data-sap-month")==y){$.addClass("sapUiCalItemSel");$.attr("aria-selected","true");v=true;}else if($.hasClass("sapUiCalItemSel")){$.removeClass("sapUiCalItemSel");$.attr("aria-selected","false");}if($.hasClass("sapUiCalItemSelStart")){$.removeClass("sapUiCalItemSelStart");}else if($.hasClass("sapUiCalItemSelBetween")){$.removeClass("sapUiCalItemSelBetween");}else if($.hasClass("sapUiCalItemSelEnd")){$.removeClass("sapUiCalItemSelEnd");}o.call(this,$,v,w);}}else{var x;for(i=0;i<b.length;i++){$=q(b[i]);v=false;w=false;x=new U(this._oFormatYyyymm.parse($.attr("data-sap-month"),true).getTime());x.setUTCDate(1);if(x.getTime()==S.getTime()){$.addClass("sapUiCalItemSelStart");v=true;$.addClass("sapUiCalItemSel");$.attr("aria-selected","true");if(E&&x.getTime()==E.getTime()){$.addClass("sapUiCalItemSelEnd");w=true;}$.removeClass("sapUiCalItemSelBetween");}else if(E&&x.getTime()>S.getTime()&&x.getTime()<E.getTime()){$.addClass("sapUiCalItemSel");$.attr("aria-selected","true");$.addClass("sapUiCalItemSelBetween");$.removeClass("sapUiCalItemSelStart");$.removeClass("sapUiCalItemSelEnd");}else if(E&&x.getTime()==E.getTime()){$.addClass("sapUiCalItemSelEnd");w=true;$.addClass("sapUiCalItemSel");$.attr("aria-selected","true");$.removeClass("sapUiCalItemSelStart");$.removeClass("sapUiCalItemSelBetween");}else{if($.hasClass("sapUiCalItemSel")){$.removeClass("sapUiCalItemSel");$.attr("aria-selected","false");}if($.hasClass("sapUiCalItemSelStart")){$.removeClass("sapUiCalItemSelStart");}else if($.hasClass("sapUiCalItemSelBetween")){$.removeClass("sapUiCalItemSelBetween");}else if($.hasClass("sapUiCalItemSelEnd")){$.removeClass("sapUiCalItemSelEnd");}}o.call(this,$,v,w);}}}function o($,S,E){if(!this.getIntervalSelection()){return;}var b="";var v=[];var w=this.getId();var x=false;b=$.attr("aria-describedby");if(b){v=b.split(" ");}var y=-1;var z=-1;for(var i=0;i<v.length;i++){var A=v[i];if(A==(w+"-Start")){y=i;}if(A==(w+"-End")){z=i;}}if(y>=0&&!S){v.splice(y,1);x=true;if(z>y){z--;}}if(z>=0&&!E){v.splice(z,1);x=true;}if(y<0&&S){v.push(w+"-Start");x=true;}if(z<0&&E){v.push(w+"-End");x=true;}if(x){b=v.join(" ");$.attr("aria-describedby",b);}}function p(){if(this._bMouseMove){u.call(this,true);}this.fireSelect();}function r(){if(!this._bNamesLengthChecked){var i=0;var v=this.$("months").children();var T=false;var w=this.getMonths();var B=Math.ceil(12/w);var x=0;var y=this._getLocaleData();var z=y.getMonthsStandAlone("wide");var $;for(var b=0;b<B;b++){if(w<12){for(i=0;i<v.length;i++){$=q(q(v[i]).children(".sapUiCalItemText"));$.text(z[(i+x)%12]);}x=x+w;if(x>11){x=11;}}for(i=0;i<v.length;i++){var A=v[i];if(Math.abs(A.clientWidth-A.scrollWidth)>1){T=true;break;}}if(T){break;}}if(w<12){x=this._getStartDate().getUTCMonth();for(i=0;i<v.length;i++){$=q(q(v[i]).children(".sapUiCalItemText"));$.text(z[(i+x)%12]);}}if(T){this._bLongMonth=false;var E=y.getMonthsStandAlone("abbreviated");x=this._getStartDate().getUTCMonth();for(i=0;i<v.length;i++){$=q(q(v[i]).children(".sapUiCalItemText"));$.text(E[(i+x)%12]);}}else{this._bLongMonth=true;}this._bNamesLengthChecked=true;}}function s(){this._sInvalidateMonths=undefined;j.call(this,this._bNoFocus);this._bDateRangeChanged=undefined;this._bNoFocus=undefined;}function t(){q(window.document).bind('mousemove',this._mouseMoveProxy);this._bMouseMove=true;}function u(){q(window.document).unbind('mousemove',this._mouseMoveProxy);this._bMouseMove=undefined;}return M;},true);
