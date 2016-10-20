/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";q.sap.endsWith=function endsWith(s,e){if(typeof(e)!="string"||e==""){return false;}var p=s.lastIndexOf(e);return p>=0&&p==s.length-e.length;};q.sap.endsWithIgnoreCase=function endsWithIgnoreCase(s,e){if(typeof(e)!="string"||e==""){return false;}s=s.toUpperCase();e=e.toUpperCase();return q.sap.endsWith(s,e);};q.sap.startsWith=function startsWith(s,S){if(typeof(S)!="string"||S==""){return false;}if(s==S){return true;}return s.indexOf(S)==0;};q.sap.startsWithIgnoreCase=function startsWithIgnoreCase(s,S){if(typeof(S)!="string"||S==""){return false;}s=s.toUpperCase();S=S.toUpperCase();return q.sap.startsWith(s,S);};q.sap.charToUpperCase=function charToUpperCase(s,p){if(!s){return s;}if(!p||isNaN(p)||p<=0||p>=s.length){p=0;}var C=s.charAt(p).toUpperCase();if(p>0){return s.substring(0,p)+C+s.substring(p+1);}return C+s.substring(p+1);};q.sap.padLeft=function padLeft(s,p,l){if(!s){s="";}while(s.length<l){s=p+s;}return s;};q.sap.padRight=function padRight(s,p,l){if(!s){s="";}while(s.length<l){s=s+p;}return s;};var r=/-(.)/ig;q.sap.camelCase=function camelCase(s){return s.replace(r,function(m,C){return C.toUpperCase();});};var a=/([A-Z])/g;q.sap.hyphen=function hyphen(s){return s.replace(a,function(m,C){return"-"+C.toLowerCase();});};var b=/[-[\]{}()*+?.,\\^$|#\s]/g;q.sap.escapeRegExp=function escapeRegExp(s){return s.replace(b,"\\$&");};q.sap.formatMessage=function formatMessage(p,v){if(arguments.length>2||(v!=null&&!q.isArray(v))){v=Array.prototype.slice.call(arguments,1);}v=v||[];return p.replace(c,function($,d,e,f,o){if(d){return"'";}else if(e){return e.replace(/''/g,"'");}else if(f){return String(v[parseInt(f,10)]);}throw new Error("formatMessage: pattern syntax error at pos. "+o);});};var c=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;return q;});
