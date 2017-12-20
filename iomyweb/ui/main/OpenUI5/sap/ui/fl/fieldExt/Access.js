/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.storage"],function(S){"use strict";var A={};A._sStorageKey="sap.ui.fl.fieldExt.Access";A._iValidityPeriod=1*7*24*60*60*1000;A.getBusinessContexts=function(s,e,E){var o=this._parseServiceUri(s);var b=this._buildBusinessContextRetrievalUri(o.serviceName,o.serviceVersion,e,E);var a=this._getAjaxSettings();var p=this._executeAjaxCall(b,a,o.serviceName,o.serviceVersion,e,E);return p;};A.isServiceOutdated=function(s){if(!this._isSystemInfoAvailable()){return false;}var m=this._getServiceItem(this._createServiceItem(s));if(m){if(this._isServiceExpired(m)){this.setServiceValid(s);return false;}else{return true;}}else{return false;}};A.setServiceValid=function(s){if(this._isSystemInfoAvailable()){var d=this._getDataFromLocalStorage();delete d[this._createServiceItem(s).serviceKey];this._setDataToLocalStorage(d);}};A.setServiceInvalid=function(s){if(this._isSystemInfoAvailable()){var d=this._getDataFromLocalStorage();var i=this._createServiceItem(s);d[i.serviceKey]=i;this._setDataToLocalStorage(d);}};A._parseServiceUri=function(s){var r=/.*sap\/opu\/odata\/([^\/]+)\/([^\/]+)/i;var R=/([^;]+);v=(\d{1,4})/i;var o="sap/opu/odata";var a;if(s.toLowerCase().indexOf(o)!==-1){var b=s.match(r);if(!b||b.length!==3){throw new Error("sap.ui.fl.fieldExt.Access._parseService","Malformed service URI (Invalid service name)");}if(b[1].toLowerCase()!=="sap"){a="/"+b[1]+"/"+b[2];}else{a=b[2];}}else{if(s.length>0&&s.lastIndexOf("/")+1===s.length){s=s.substring(0,s.length-1);}a=s.substring(s.lastIndexOf("/")+1);}if(a.indexOf(";v=")!==-1){var v=a.match(R);if(!v||v.length!==3){throw new Error("sap.ui.fl.fieldExt.Access._parseService","Malformed service URI (Invalid version)");}return{serviceName:v[1],serviceVersion:v[2]};}else{return{serviceName:a,serviceVersion:'0001'};}};A._buildBusinessContextRetrievalUri=function(s,a,e,E){if(e==null){e="";}if(E==null){E="";}if(((E.length===0)&&(e.length===0))||(!(E.length===0)&&!(e.length===0))){throw new Error("sap.ui.fl.fieldExt.Access._buildBusinessContextRetrievalUri()"+"Inconsistent input parameters EntityName: "+e+" EntitySet: "+E);}var b="/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType?"+"EntitySetName=\'"+E+"\'"+"&EntityTypeName=\'"+e+"\'"+"&ServiceName=\'"+s+"\'"+"&ServiceVersion=\'"+a+"\'"+"&$format=json";return b;};A._executeAjaxCall=function(b,r,s,a,e,E){var t=this;var d=jQuery.Deferred();jQuery.ajax(b,r).done(function(c,f,j){var B=[];if(c){B=t._extractBusinessContexts(c);}var R={BusinessContexts:B,ServiceName:s,ServiceVersion:a};d.resolve(R);}).fail(function(j,c,f){var g=t._getMessagesFromXHR(j);var o={errorOccured:true,errorMessages:g,serviceName:s,serviceVersion:a,entityType:e,entitySet:E};d.reject(o);});return d.promise();};A._getAjaxSettings=function(){var s={type:"GET",async:true,dataType:"json"};return s;};A._extractBusinessContexts=function(d){var r=null;var b=[];if(d&&d.d){r=d.d.results;}if(r!==null&&r.length>0){for(var i=0;i<r.length;i++){if(r[i].BusinessContext!==null){b.push(r[i].BusinessContext);}}}return b;};A._getMessagesFromXHR=function(x){var m=[];try{var E=JSON.parse(x.responseText);if(E&&E.error&&E.error.message&&E.error.message.value&&E.error.message.value!==''){m.push({severity:"error",text:E.error.message.value});}else{m.push({severity:"error",text:x.responseText});}}catch(e){}return m;};A._getCurrentTime=function(){return Date.now();};A._isServiceExpired=function(s){return s.expirationDate<=this._getCurrentTime();};A._getLocalStorage=function(){return jQuery.sap.storage(jQuery.sap.storage.Type.local);};A.isLocalStorageAvailable=function(){return this._getLocalStorage()&&this._getLocalStorage().isSupported();};A._getServiceItem=function(s){return this._getDataFromLocalStorage()[s.serviceKey]||null;};A._createServiceItem=function(s){var e=this._getCurrentTime()+this._iValidityPeriod;var m=this._getSystemInfo();var p=this._extractServiceInfo(s);return{"serviceKey":m.getName()+m.getClient()+p.serviceName+p.serviceVersion,"expirationDate":e};};A._extractServiceInfo=function(s){if(typeof s==="string"){return this._parseServiceUri(s);}else{return s;}};A._isSystemInfoAvailable=function(){return sap&&sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getLogonSystem;};A._getSystemInfo=function(){return sap.ushell.Container.getLogonSystem();};A._setDataToLocalStorage=function(d){if(this.isLocalStorageAvailable()){this._getLocalStorage().put(A._sStorageKey,JSON.stringify(d));}};A._getDataFromLocalStorage=function(){if(!this.isLocalStorageAvailable()){return{};}var s=this._getLocalStorage().get(A._sStorageKey);if(!s){return{};}else{return JSON.parse(s);}};return A;},true);