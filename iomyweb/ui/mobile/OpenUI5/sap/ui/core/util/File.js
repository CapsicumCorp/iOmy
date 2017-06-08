/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){'use strict';var F={save:function(d,f,s,m,c){var a=f+'.'+s;if(c==='utf-8'&&s==='csv'){d='\ufeff'+d;}if(window.Blob){var t='data:'+m;if(c){t+=';charset='+c;}var b=new window.Blob([d],{type:t});if(window.navigator.msSaveOrOpenBlob){window.navigator.msSaveOrOpenBlob(b,a);}else{var u=window.URL||window.webkitURL;var B=u.createObjectURL(b);var l=window.document.createElement('a');if('download'in l){var $=q(document.body);var e=q(l).attr({download:a,href:B,style:'display:none'});$.append(e);e.get(0).click();e.remove();}else{d=encodeURI(d);var w=window.open(t+","+d);if(!w){throw new Error("Could not download file. A popup blocker might be active.");}}}}}};return F;},true);
