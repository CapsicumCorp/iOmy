/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/Object','./FilterOperator','sap/ui/Device'],function(q,B,F,D){"use strict";var a=B.extend("sap.ui.model.Filter",{constructor:function(f,o,v,V){if(typeof f==="object"&&!q.isArray(f)){this.sPath=f.path;this.sOperator=f.operator;this.oValue1=f.value1;this.oValue2=f.value2;this.aFilters=f.filters||f.aFilters;this.bAnd=f.and||f.bAnd;this.fnTest=f.test;}else{if(q.isArray(f)){this.aFilters=f;}else{this.sPath=f;}if(q.type(o)==="boolean"){this.bAnd=o;}else if(q.type(o)==="function"){this.fnTest=o;}else{this.sOperator=o;}this.oValue1=v;this.oValue2=V;}if(!String.prototype.normalize&&typeof this.oValue1=="string"&&!D.browser.mobile){q.sap.require("jquery.sap.unicode");}if(q.isArray(this.aFilters)&&!this.sPath&&!this.sOperator&&!this.oValue1&&!this.oValue2){this._bMultiFilter=true;q.each(this.aFilters,function(i,b){if(!(b instanceof a)){q.sap.log.error("Filter in Aggregation of Multi filter has to be instance of sap.ui.model.Filter");}});}else if(!this.aFilters&&this.sPath!==undefined&&((this.sOperator&&this.oValue1!==undefined)||this.fnTest)){this._bMultiFilter=false;}else{q.sap.log.error("Wrong parameters defined for filter.");}}});return a;});
