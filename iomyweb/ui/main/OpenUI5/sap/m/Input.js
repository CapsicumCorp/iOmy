/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./Bar','./Dialog','./InputBase','./List','./Popover','sap/ui/core/Item','./ColumnListItem','./StandardListItem','./DisplayListItem','sap/ui/core/ListItem','./Table','./Toolbar','./ToolbarSpacer','./library','sap/ui/core/IconPool','sap/ui/core/InvisibleText','sap/ui/core/Control'],function(q,B,D,I,L,P,a,C,S,b,c,T,d,e,l,f,g,h){"use strict";var j=I.extend("sap.m.Input",{metadata:{library:"sap.m",properties:{type:{type:"sap.m.InputType",group:"Data",defaultValue:sap.m.InputType.Text},maxLength:{type:"int",group:"Behavior",defaultValue:0},dateFormat:{type:"string",group:"Misc",defaultValue:'YYYY-MM-dd',deprecated:true},showValueHelp:{type:"boolean",group:"Behavior",defaultValue:false},showSuggestion:{type:"boolean",group:"Behavior",defaultValue:false},valueHelpOnly:{type:"boolean",group:"Behavior",defaultValue:false},filterSuggests:{type:"boolean",group:"Behavior",defaultValue:true},maxSuggestionWidth:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},startSuggestion:{type:"int",group:"Behavior",defaultValue:1},showTableSuggestionValueHelp:{type:"boolean",group:"Behavior",defaultValue:true},description:{type:"string",group:"Misc",defaultValue:null},fieldWidth:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:'50%'},valueLiveUpdate:{type:"boolean",group:"Behavior",defaultValue:false},selectedKey:{type:"string",group:"Data",defaultValue:""},textFormatMode:{type:"sap.m.InputTextFormatMode",group:"Misc",defaultValue:sap.m.InputTextFormatMode.Value},textFormatter:{type:"any",group:"Misc",defaultValue:""},suggestionRowValidator:{type:"any",group:"Misc",defaultValue:""},enableSuggestionsHighlighting:{type:"boolean",group:"Behavior",defaultValue:true}},defaultAggregation:"suggestionItems",aggregations:{suggestionItems:{type:"sap.ui.core.Item",multiple:true,singularName:"suggestionItem"},suggestionColumns:{type:"sap.m.Column",multiple:true,singularName:"suggestionColumn",bindable:"bindable"},suggestionRows:{type:"sap.m.ColumnListItem",multiple:true,singularName:"suggestionRow",bindable:"bindable"},_valueHelpIcon:{type:"sap.ui.core.Icon",multiple:false,visibility:"hidden"}},associations:{selectedItem:{type:"sap.ui.core.Item",multiple:false},selectedRow:{type:"sap.m.ColumnListItem",multiple:false}},events:{liveChange:{parameters:{value:{type:"string"},escPressed:{type:"boolean"},previousValue:{type:"string"}}},valueHelpRequest:{parameters:{fromSuggestions:{type:"boolean"}}},suggest:{parameters:{suggestValue:{type:"string"},suggestionColumns:{type:"sap.m.ListBase"}}},suggestionItemSelected:{parameters:{selectedItem:{type:"sap.ui.core.Item"},selectedRow:{type:"sap.m.ColumnListItem"}}},submit:{parameters:{value:{type:"string"}}}}}});f.insertFontFaceStyle();j._wordStartsWithValue=function(t,v){var i;while(t){if(q.sap.startsWithIgnoreCase(t,v)){return true;}i=t.indexOf(' ');if(i==-1){break;}t=t.substring(i+1);}return false;};j._DEFAULTFILTER=function(v,i){if(i instanceof c&&j._wordStartsWithValue(i.getAdditionalText(),v)){return true;}return j._wordStartsWithValue(i.getText(),v);};j._DEFAULTFILTER_TABULAR=function(v,o){var k=o.getCells(),i=0;for(;i<k.length;i++){if(k[i].getText){if(j._wordStartsWithValue(k[i].getText(),v)){return true;}}}return false;};j._DEFAULTRESULT_TABULAR=function(o){var k=o.getCells(),i=0;for(;i<k.length;i++){if(k[i].getText){return k[i].getText();}}return"";};j.prototype.init=function(){I.prototype.init.call(this);this._fnFilter=j._DEFAULTFILTER;this._bUseDialog=sap.ui.Device.system.phone;this._bFullScreen=sap.ui.Device.system.phone;this._iSetCount=0;this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.m");if(!j._sAriaPopupLabelId){j._sAriaPopupLabelId=new g({text:this._oRb.getText("INPUT_AVALIABLE_VALUES")}).toStatic().getId();}};j.prototype.exit=function(){this._deregisterEvents();this.cancelPendingSuggest();if(this._iRefreshListTimeout){q.sap.clearDelayedCall(this._iRefreshListTimeout);this._iRefreshListTimeout=null;}if(this._oSuggestionPopup){this._oSuggestionPopup.destroy();this._oSuggestionPopup=null;}if(this._oList){this._oList.destroy();this._oList=null;}if(this._oSuggestionTable){this._oSuggestionTable.destroy();this._oSuggestionTable=null;}if(this._oButtonToolbar){this._oButtonToolbar.destroy();this._oButtonToolbar=null;}if(this._oShowMoreButton){this._oShowMoreButton.destroy();this._oShowMoreButton=null;}};j.prototype._resizePopup=function(F){var t=this;if(F){this._shouldResizePopup=true;}if(this._oList&&this._oSuggestionPopup&&this._shouldResizePopup){if(this.getMaxSuggestionWidth()){this._oSuggestionPopup.setContentWidth(this.getMaxSuggestionWidth());}else{this._oSuggestionPopup.setContentWidth((this.$().outerWidth())+"px");}setTimeout(function(){if(t._oSuggestionPopup&&t._oSuggestionPopup.isOpen()&&t._oSuggestionPopup.$().outerWidth()<t.$().outerWidth()){t._oSuggestionPopup.setContentWidth((t.$().outerWidth())+"px");}},0);}};j.prototype.onBeforeRendering=function(){var s=this.getSelectedKey();I.prototype.onBeforeRendering.call(this);this._deregisterEvents();if(s){this.setSelectedKey(s);}};j.prototype.onAfterRendering=function(){var t=this;I.prototype.onAfterRendering.call(this);if(!this._bFullScreen){this._resizePopup();this._sPopupResizeHandler=sap.ui.core.ResizeHandler.register(this.getDomRef(),function(){t._resizePopup();});}if(this._bUseDialog&&this.getEditable()){this.$().on("click",q.proxy(function(E){if(this._onclick){this._onclick(E);}if(this.getShowSuggestion()&&this._oSuggestionPopup&&E.target.id!=this.getId()+"-vhi"){this._resizePopup(true);this._oSuggestionPopup.open();}},this));}};j.prototype._getDisplayText=function(i){var t=this.getTextFormatter();if(t){return t(i);}var s=i.getText(),k=i.getKey(),m=this.getTextFormatMode();switch(m){case sap.m.InputTextFormatMode.Key:return k;case sap.m.InputTextFormatMode.ValueKey:return s+' ('+k+')';case sap.m.InputTextFormatMode.KeyValue:return'('+k+') '+s;default:return s;}};j.prototype._onValueUpdated=function(n){if(this._bSelectingItem||n===this._sSelectedValue){return;}var k=this.getSelectedKey(),H;if(k===''){return;}if(this._hasTabularSuggestions()){H=!!this._oSuggestionTable.getSelectedItem();}else{H=!!this._oList.getSelectedItem();}if(H){return;}this.setProperty("selectedKey",'',true);this.setAssociation("selectedRow",null,true);this.setAssociation("selectedItem",null,true);this.fireSuggestionItemSelected({selectedItem:null,selectedRow:null});};j.prototype.setSelectionItem=function(i,k){if(!i){this.setAssociation("selectedItem",null,true);this.setProperty("selectedKey",'',true);this.setValue('');return;}this._bSelectingItem=true;var m=this._iSetCount,n;this.setAssociation("selectedItem",i,true);this.setProperty("selectedKey",i.getKey(),true);if(k){this.fireSuggestionItemSelected({selectedItem:i});}if(m!==this._iSetCount){n=this.getValue();}else{n=this._getDisplayText(i);}this._sSelectedValue=n;if(this._bUseDialog){this._oPopupInput.setValue(n);this._oPopupInput._doSelect();}else{n=this._getInputValue(n);this.setDOMValue(n);this.onChange(null,null,n);}this._iPopupListSelectedIndex=-1;if(!(this._bUseDialog&&this instanceof sap.m.MultiInput&&this._isMultiLineMode)){this._closeSuggestionPopup();}if(!sap.ui.Device.support.touch){this._doSelect();}this._bSelectingItem=false;};j.prototype.setSelectedItem=function(i){if(typeof i==="string"){i=sap.ui.getCore().byId(i);}if(i!==null&&!(i instanceof a)){return this;}this.setSelectionItem(i);return this;};j.prototype.setSelectedKey=function(k){k=this.validateProperty("selectedKey",k);if(this._hasTabularSuggestions()){this.setProperty("selectedKey",k,true);return this;}if(!k){this.setSelectionItem();return this;}var i=this.getSuggestionItemByKey(k);if(i){this.setSelectionItem(i);}else{this.setProperty("selectedKey",k,true);}return this;};j.prototype.getSuggestionItemByKey=function(k){var m=this.getSuggestionItems()||[],o,i;for(i=0;i<m.length;i++){o=m[i];if(o.getKey()===k){return o;}}};j.prototype.setSelectionRow=function(o,i){if(!o){this.setAssociation("selectedRow",null,true);this.setProperty("selectedKey",'',true);this.setValue('');return;}this._bSelectingItem=true;var k,s=this.getSuggestionRowValidator();if(s){k=s(o);if(!(k instanceof a)){k=null;}}var m=this._iSetCount,K="",n;this.setAssociation("selectedRow",o,true);if(k){K=k.getKey();}this.setProperty("selectedKey",K,true);if(i){this.fireSuggestionItemSelected({selectedRow:o});}if(m!==this._iSetCount){n=this.getValue();}else{if(k){n=this._getDisplayText(k);}else{n=this._fnRowResultFilter(o);}}this._sSelectedValue=n;if(this._bUseDialog){this._oPopupInput.setValue(n);this._oPopupInput._doSelect();}else{n=this._getInputValue(n);this.setDOMValue(n);this.onChange(null,null,n);}this._iPopupListSelectedIndex=-1;if(!(this._bUseDialog&&this instanceof sap.m.MultiInput&&this._isMultiLineMode)){this._closeSuggestionPopup();}if(!sap.ui.Device.support.touch){this._doSelect();}this._bSelectingItem=false;};j.prototype.setSelectedRow=function(o){if(typeof o==="string"){o=sap.ui.getCore().byId(o);}if(o!==null&&!(o instanceof C)){return this;}this.setSelectionRow(o);return this;};j.prototype._getValueHelpIcon=function(){var t=this,v=this.getAggregation("_valueHelpIcon"),u;if(v){return v;}u=f.getIconURI("value-help");v=f.createControlByURI({id:this.getId()+"-vhi",src:u,useIconTooltip:false,noTabStop:true});v.addStyleClass("sapMInputValHelpInner");v.attachPress(function(i){if(!t.getValueHelpOnly()){this.getParent().focus();t.fireValueHelpRequest({fromSuggestions:false});}});this.setAggregation("_valueHelpIcon",v);return v;};j.prototype._fireValueHelpRequestForValueHelpOnly=function(){if(this.getEnabled()&&this.getEditable()&&this.getShowValueHelp()&&this.getValueHelpOnly()){this.fireValueHelpRequest({fromSuggestions:false});}};j.prototype.ontap=function(E){I.prototype.ontap.call(this,E);this._fireValueHelpRequestForValueHelpOnly();};j.prototype.setWidth=function(w){return I.prototype.setWidth.call(this,w||"100%");};j.prototype.getWidth=function(){return this.getProperty("width")||"100%";};j.prototype.setFilterFunction=function(F){if(F===null||F===undefined){this._fnFilter=j._DEFAULTFILTER;return this;}this._fnFilter=F;return this;};j.prototype.setRowResultFunction=function(F){if(F===null||F===undefined){this._fnRowResultFilter=j._DEFAULTRESULT_TABULAR;return this;}this._fnRowResultFilter=F;return this;};j.prototype.closeSuggestions=function(){this._closeSuggestionPopup();};j.prototype.setShowValueHelp=function(s){this.setProperty("showValueHelp",s);if(s&&!j.prototype._sAriaValueHelpLabelId){j.prototype._sAriaValueHelpLabelId=new g({text:this._oRb.getText("INPUT_VALUEHELP")}).toStatic().getId();}return this;};j.prototype.setValueHelpOnly=function(v){this.setProperty("valueHelpOnly",v);if(v&&!j.prototype._sAriaInputDisabledLabelId){j.prototype._sAriaInputDisabledLabelId=new g({text:this._oRb.getText("INPUT_DISABLED")}).toStatic().getId();}return this;};j.prototype._doSelect=function(s,E){if(sap.ui.Device.support.touch){return;}var o=this._$input[0];if(o){var r=this._$input;o.focus();r.selectText(s?s:0,E?E:r.val().length);}return this;};j.prototype._scrollToItem=function(i){var p=this._oSuggestionPopup,o=this._oList,s,k,m,t,n;if(!(p instanceof P)||!o){return;}s=p.getScrollDelegate();if(!s){return;}var r=o.getItems()[i],u=r&&r.getDomRef();if(!u){return;}k=p.getDomRef("cont").getBoundingClientRect();m=u.getBoundingClientRect();t=k.top-m.top;n=m.bottom-k.bottom;if(t>0){s.scrollTo(s._scrollX,Math.max(s._scrollY-t,0));}else if(n>0){s.scrollTo(s._scrollX,s._scrollY+n);}};j.prototype._isSuggestionItemSelectable=function(i){return i.getVisible()&&(this._hasTabularSuggestions()||i.getType()!==sap.m.ListType.Inactive);};j.prototype._isIncrementalType=function(){var t=this.getType();if(t==="Number"||t==="Date"||t==="Datetime"||t==="Month"||t==="Time"||t==="Week"){return true;}return false;};j.prototype._onsaparrowkey=function(E,s,i){if(!this.getEnabled()||!this.getEditable()){return;}if(s!=="up"&&s!=="down"){return;}if(this._isIncrementalType()){E.setMarked();}if(!this._oSuggestionPopup||!this._oSuggestionPopup.isOpen()){return;}E.preventDefault();E.stopPropagation();var F=false,o=this._oList,k=this.getSuggestionItems(),m=o.getItems(),n=this._iPopupListSelectedIndex,N,O=n;if(s==="up"&&n===0){return;}if(s=="down"&&n===m.length-1){return;}var p;if(i>1){if(s=="down"&&n+i>=m.length){s="up";i=1;m[n].setSelected(false);p=n;n=m.length-1;F=true;}else if(s=="up"&&n-i<0){s="down";i=1;m[n].setSelected(false);p=n;n=0;F=true;}}if(n===-1){n=0;if(this._isSuggestionItemSelectable(m[n])){O=n;F=true;}else{s="down";}}if(s==="down"){while(n<m.length-1&&(!F||!this._isSuggestionItemSelectable(m[n]))){m[n].setSelected(false);n=n+i;F=true;i=1;if(p===n){break;}}}else{while(n>0&&(!F||!m[n].getVisible()||!this._isSuggestionItemSelectable(m[n]))){m[n].setSelected(false);n=n-i;F=true;i=1;if(p===n){break;}}}if(!this._isSuggestionItemSelectable(m[n])){if(O>=0){m[O].setSelected(true).updateAccessibilityState();this.$("inner").attr("aria-activedescendant",m[O].getId());}return;}else{m[n].setSelected(true).updateAccessibilityState();this.$("inner").attr("aria-activedescendant",m[n].getId());}if(sap.ui.Device.system.desktop){this._scrollToItem(n);}if(sap.m.ColumnListItem&&m[n]instanceof sap.m.ColumnListItem){N=this._getInputValue(this._fnRowResultFilter(m[n]));}else{var r=(k[0]instanceof c?true:false);if(r){N=this._getInputValue(m[n].getLabel());}else{N=this._getInputValue(m[n].getTitle());}}this.setDOMValue(N);this._sSelectedSuggViaKeyboard=N;this._doSelect();this._iPopupListSelectedIndex=n;};j.prototype.onsapup=function(E){this._onsaparrowkey(E,"up",1);};j.prototype.onsapdown=function(E){this._onsaparrowkey(E,"down",1);};j.prototype.onsappageup=function(E){this._onsaparrowkey(E,"up",5);};j.prototype.onsappagedown=function(E){this._onsaparrowkey(E,"down",5);};j.prototype.onsaphome=function(E){if(this._oList){this._onsaparrowkey(E,"up",this._oList.getItems().length);}};j.prototype.onsapend=function(E){if(this._oList){this._onsaparrowkey(E,"down",this._oList.getItems().length);}};j.prototype.onsapescape=function(E){var i;if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){E.originalEvent._sapui_handledByControl=true;this._iPopupListSelectedIndex=-1;this._closeSuggestionPopup();if(this._sBeforeSuggest!==undefined){if(this._sBeforeSuggest!==this.getValue()){i=this._lastValue;this.setValue(this._sBeforeSuggest);this._lastValue=i;}this._sBeforeSuggest=undefined;}return;}if(I.prototype.onsapescape){I.prototype.onsapescape.apply(this,arguments);}};j.prototype.onsapenter=function(E){if(I.prototype.onsapenter){I.prototype.onsapenter.apply(this,arguments);}this.cancelPendingSuggest();if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){var s=this._oList.getSelectedItem();if(s){if(this._hasTabularSuggestions()){this.setSelectionRow(s,true);}else{this.setSelectionItem(s._oItem,true);}}else{if(this._iPopupListSelectedIndex>=0){this._fireSuggestionItemSelectedEvent();this._doSelect();this._iPopupListSelectedIndex=-1;}this._closeSuggestionPopup();}}if(this.getEnabled()&&this.getEditable()&&!(this.getValueHelpOnly()&&this.getShowValueHelp())){this.fireSubmit({value:this.getValue()});}};j.prototype.onsapfocusleave=function(E){var p=this._oSuggestionPopup;if(p instanceof P){if(E.relatedControlId&&q.sap.containsOrEquals(p.getDomRef(),sap.ui.getCore().byId(E.relatedControlId).getFocusDomRef())){this._bPopupHasFocus=true;this.focus();}else{if(this.getDOMValue()===this._sSelectedSuggViaKeyboard){this._sSelectedSuggViaKeyboard=null;}}}var F=sap.ui.getCore().byId(E.relatedControlId);if(!(p&&F&&q.sap.containsOrEquals(p.getDomRef(),F.getFocusDomRef()))){I.prototype.onsapfocusleave.apply(this,arguments);}};j.prototype.onmousedown=function(E){var p=this._oSuggestionPopup;if((p instanceof P)&&p.isOpen()){E.stopPropagation();}};j.prototype._deregisterEvents=function(){if(this._sPopupResizeHandler){sap.ui.core.ResizeHandler.deregister(this._sPopupResizeHandler);this._sPopupResizeHandler=null;}if(this._bUseDialog&&this._oSuggestionPopup){this.$().off("click");}};j.prototype.updateSuggestionItems=function(){this._bSuspendInvalidate=true;this.updateAggregation("suggestionItems");this._bShouldRefreshListItems=true;this._refreshItemsDelayed();this._bSuspendInvalidate=false;return this;};j.prototype.invalidate=function(){if(!this._bSuspendInvalidate){h.prototype.invalidate.apply(this,arguments);}};j.prototype.cancelPendingSuggest=function(){if(this._iSuggestDelay){q.sap.clearDelayedCall(this._iSuggestDelay);this._iSuggestDelay=null;}};j.prototype._triggerSuggest=function(v){this.cancelPendingSuggest();this._bShouldRefreshListItems=true;if(!v){v="";}if(v.length>=this.getStartSuggestion()){this._iSuggestDelay=q.sap.delayedCall(300,this,function(){if(this._sPrevSuggValue!==v){this._bBindingUpdated=false;this.fireSuggest({suggestValue:v});if(!this._bBindingUpdated){this._refreshItemsDelayed();}this._sPrevSuggValue=v;}});}else if(this._bUseDialog){if(this._oList instanceof T){this._oList.addStyleClass("sapMInputSuggestionTableHidden");}else if(this._oList&&this._oList.destroyItems){this._oList.destroyItems();}}else if(this._oSuggestionPopup&&this._oSuggestionPopup.isOpen()){q.sap.delayedCall(0,this,function(){var n=this.getDOMValue()||'';if(n<this.getStartSuggestion()){this._iPopupListSelectedIndex=-1;this._closeSuggestionPopup();}});}};(function(){j.prototype.setShowSuggestion=function(v){this.setProperty("showSuggestion",v,true);this._iPopupListSelectedIndex=-1;if(v){this._lazyInitializeSuggestionPopup(this);}else{n(this);}return this;};j.prototype.setShowTableSuggestionValueHelp=function(v){this.setProperty("showTableSuggestionValueHelp",v,true);if(!this._oSuggestionPopup){return this;}if(v){this._addShowMoreButton();}else{this._removeShowMoreButton();}return this;};j.prototype._getShowMoreButton=function(){var t=this,M=this._oRb;return this._oShowMoreButton||(this._oShowMoreButton=new sap.m.Button({text:M.getText("INPUT_SUGGESTIONS_SHOW_ALL"),press:function(){if(t.getShowTableSuggestionValueHelp()){t.fireValueHelpRequest({fromSuggestions:true});t._iPopupListSelectedIndex=-1;t._closeSuggestionPopup();}}}));};j.prototype._getButtonToolbar=function(){var s=this._getShowMoreButton();return this._oButtonToolbar||(this._oButtonToolbar=new d({content:[new e(),s]}));};j.prototype._addShowMoreButton=function(t){if(!this._oSuggestionPopup||!t&&!this._hasTabularSuggestions()){return;}if(this._oSuggestionPopup instanceof D){var s=this._getShowMoreButton();this._oSuggestionPopup.setEndButton(s);}else{var i=this._getButtonToolbar();this._oSuggestionPopup.setFooter(i);}};j.prototype._removeShowMoreButton=function(){if(!this._oSuggestionPopup||!this._hasTabularSuggestions()){return;}if(this._oSuggestionPopup instanceof D){this._oSuggestionPopup.setEndButton(null);}else{this._oSuggestionPopup.setFooter(null);}};j.prototype.oninput=function(E){I.prototype.oninput.call(this,E);if(E.isMarked("invalid")){return;}var v=this.getDOMValue();if(this.getValueLiveUpdate()){this.setProperty("value",v,true);this._onValueUpdated(v);}this.fireLiveChange({value:v,newValue:v});if(this.getShowSuggestion()&&!this._bUseDialog){this._triggerSuggest(v);}};j.prototype.getValue=function(){return this.getDomRef("inner")&&this._$input?this.getDOMValue():this.getProperty("value");};j.prototype._refreshItemsDelayed=function(){q.sap.clearDelayedCall(this._iRefreshListTimeout);this._iRefreshListTimeout=q.sap.delayedCall(0,this,r,[this]);};j.prototype.addSuggestionItem=function(i){this.addAggregation("suggestionItems",i,true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();m(this);return this;};j.prototype.insertSuggestionItem=function(i,p){this.insertAggregation("suggestionItems",p,i,true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();m(this);return this;};j.prototype.removeSuggestionItem=function(i){var p=this.removeAggregation("suggestionItems",i,true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return p;};j.prototype.removeAllSuggestionItems=function(){var i=this.removeAllAggregation("suggestionItems",true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return i;};j.prototype.destroySuggestionItems=function(){this.destroyAggregation("suggestionItems",true);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return this;};j.prototype.addSuggestionRow=function(i){i.setType(sap.m.ListType.Active);this.addAggregation("suggestionRows",i);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();m(this);return this;};j.prototype.insertSuggestionRow=function(i,p){i.setType(sap.m.ListType.Active);this.insertAggregation("suggestionRows",p,i);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();m(this);return this;};j.prototype.removeSuggestionRow=function(i){var p=this.removeAggregation("suggestionRows",i);this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return p;};j.prototype.removeAllSuggestionRows=function(){var i=this.removeAllAggregation("suggestionRows");this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return i;};j.prototype.destroySuggestionRows=function(){this.destroyAggregation("suggestionRows");this._bShouldRefreshListItems=true;this._refreshItemsDelayed();return this;};j.prototype.bindAggregation=function(){var i=Array.prototype.slice.call(arguments);if(i[0]==="suggestionRows"||i[0]==="suggestionColumns"||i[0]==="suggestionItems"){m(this,i[0]==="suggestionRows"||i[0]==="suggestionColumns");this._bBindingUpdated=true;}this._callMethodInManagedObject.apply(this,["bindAggregation"].concat(i));return this;};j.prototype._lazyInitializeSuggestionPopup=function(){if(!this._oSuggestionPopup){k(this);}};j.prototype._closeSuggestionPopup=function(){if(this._oSuggestionPopup){this._bShouldRefreshListItems=false;this.cancelPendingSuggest();this._oSuggestionPopup.close();this.$("SuggDescr").text("");this.$("inner").removeAttr("aria-haspopup");this.$("inner").removeAttr("aria-activedescendant");this._sPrevSuggValue=null;}};function k(i){var M=i._oRb;if(i._bUseDialog){i._oPopupInput=new j(i.getId()+"-popup-input",{width:"100%",valueLiveUpdate:true,showValueHelp:i.getShowValueHelp(),valueHelpRequest:function(E){i.fireValueHelpRequest({fromSuggestions:true});i._iPopupListSelectedIndex=-1;i._closeSuggestionPopup();},liveChange:function(E){var v=E.getParameter("newValue");i.setDOMValue(i._getInputValue(i._oPopupInput.getValue()));i._triggerSuggest(v);i.fireLiveChange({value:v,newValue:v});}}).addStyleClass("sapMInputSuggInDialog");}i._oSuggestionPopup=!i._bUseDialog?(new P(i.getId()+"-popup",{showArrow:false,showHeader:false,placement:sap.m.PlacementType.Vertical,initialFocus:i,horizontalScrolling:true}).attachAfterClose(function(){if(i._iPopupListSelectedIndex>=0){i._fireSuggestionItemSelectedEvent();}if(i._oList instanceof T){i._oList.removeSelections(true);}else{i._oList.destroyItems();}i._shouldResizePopup=false;}).attachBeforeOpen(function(){i._sBeforeSuggest=i.getValue();})):(new D(i.getId()+"-popup",{beginButton:new sap.m.Button(i.getId()+"-popup-closeButton",{text:M.getText("MSGBOX_CLOSE"),press:function(){i._closeSuggestionPopup();}}),stretch:i._bFullScreen,contentHeight:i._bFullScreen?undefined:"20rem",customHeader:new B(i.getId()+"-popup-header",{contentMiddle:i._oPopupInput.addEventDelegate({onsapenter:function(){if(!(sap.m.MultiInput&&i instanceof sap.m.MultiInput)){i._closeSuggestionPopup();}}},this)}),horizontalScrolling:false,initialFocus:i._oPopupInput}).attachBeforeOpen(function(){i._oPopupInput.setPlaceholder(i.getPlaceholder());i._oPopupInput.setMaxLength(i.getMaxLength());}).attachBeforeClose(function(){i.setDOMValue(i._getInputValue(i._oPopupInput.getValue()));i.onChange();if(i instanceof sap.m.MultiInput&&i._bUseDialog){i._onDialogClose();}}).attachAfterClose(function(){if(i instanceof sap.m.MultiInput&&i._isMultiLineMode){i._showIndicator();}if(i._oList){if(T&&!(i._oList instanceof T)){i._oList.destroyItems();}else{i._oList.removeSelections(true);}}}).attachAfterOpen(function(){var v=i.getValue();i._oPopupInput.setValue(v);i._triggerSuggest(v);r(i);}));i._oSuggestionPopup.addStyleClass("sapMInputSuggestionPopup");i._oSuggestionPopup.addAriaLabelledBy(j._sAriaPopupLabelId);i.addDependent(i._oSuggestionPopup);if(!i._bUseDialog){o(i._oSuggestionPopup,i);}if(i._oList){i._oSuggestionPopup.addContent(i._oList);}if(i.getShowTableSuggestionValueHelp()){i._addShowMoreButton();}}function m(i,t){if(i._oList){return;}if(!i._hasTabularSuggestions()&&!t){i._oList=new L(i.getId()+"-popup-list",{width:"100%",showNoData:false,mode:sap.m.ListMode.SingleSelectMaster,rememberSelections:false,itemPress:function(E){var s=E.getParameter("listItem");i.setSelectionItem(s._oItem,true);}});i._oList.addEventDelegate({onAfterRendering:i._highlightListText.bind(i)});}else{if(i._fnFilter===j._DEFAULTFILTER){i._fnFilter=j._DEFAULTFILTER_TABULAR;}if(!i._fnRowResultFilter){i._fnRowResultFilter=j._DEFAULTRESULT_TABULAR;}i._oList=i._getSuggestionsTable();if(i.getShowTableSuggestionValueHelp()){i._addShowMoreButton(t);}}if(i._oSuggestionPopup){if(i._bUseDialog){i._oSuggestionPopup.addAggregation("content",i._oList,true);var R=i._oSuggestionPopup.$("scrollCont")[0];if(R){var p=sap.ui.getCore().createRenderManager();p.renderControl(i._oList);p.flush(R);p.destroy();}}else{i._oSuggestionPopup.addContent(i._oList);}}}function n(i){if(i._oSuggestionPopup){if(i._oList instanceof T){i._oSuggestionPopup.removeAllContent();i._removeShowMoreButton();}i._oSuggestionPopup.destroy();i._oSuggestionPopup=null;}if(i._oList instanceof L){i._oList.destroy();i._oList=null;}}function o(p,i){p.open=function(){this.openBy(i,false,true);};p.oPopup.setAnimations(function(R,s,O){O();},function(R,s,t){t();});}function r(p){var s=p.getShowSuggestion();var R=p._oRb;p._iPopupListSelectedIndex=-1;if(!s||!p._bShouldRefreshListItems||!p.getDomRef()||(!p._bUseDialog&&!p.$().hasClass("sapMInputFocused"))){return false;}var t,u=p.getSuggestionItems(),v=p.getSuggestionRows(),w=p.getDOMValue()||"",x=p._oList,F=p.getFilterSuggests(),H=[],y=0,z=p._oSuggestionPopup,A={ontouchstart:function(K){(K.originalEvent||K)._sapui_cancelAutoClose=true;}},E,i;if(p._oList){if(p._oList instanceof T){x.removeSelections(true);}else{x.destroyItems();}}if(w.length<p.getStartSuggestion()){if(!p._bUseDialog){p._iPopupListSelectedIndex=-1;this.cancelPendingSuggest();z.close();}else{if(p._hasTabularSuggestions()&&p._oList){p._oList.addStyleClass("sapMInputSuggestionTableHidden");}}p.$("SuggDescr").text("");p.$("inner").removeAttr("aria-haspopup");p.$("inner").removeAttr("aria-activedescendant");return false;}if(p._hasTabularSuggestions()){if(p._bUseDialog&&p._oList){p._oList.removeStyleClass("sapMInputSuggestionTableHidden");}for(i=0;i<v.length;i++){if(!F||p._fnFilter(w,v[i])){v[i].setVisible(true);H.push(v[i]);}else{v[i].setVisible(false);}}p._oSuggestionTable.invalidate();}else{var G=(u[0]instanceof c?true:false);for(i=0;i<u.length;i++){t=u[i];if(!F||p._fnFilter(w,t)){if(G){E=new b(t.getId()+"-dli");E.setLabel(t.getText());E.setValue(t.getAdditionalText());}else{E=new S(t.getId()+"-sli");E.setTitle(t.getText());}E.setType(t.getEnabled()?sap.m.ListType.Active:sap.m.ListType.Inactive);E._oItem=t;E.addEventDelegate(A);H.push(E);}}}y=H.length;var J="";if(y>0){if(y==1){J=R.getText("INPUT_SUGGESTIONS_ONE_HIT");}else{J=R.getText("INPUT_SUGGESTIONS_MORE_HITS",y);}p.$("inner").attr("aria-haspopup","true");if(!p._hasTabularSuggestions()){for(i=0;i<y;i++){x.addItem(H[i]);}}if(!p._bUseDialog){if(p._sCloseTimer){clearTimeout(p._sCloseTimer);p._sCloseTimer=null;}if(!z.isOpen()&&!p._sOpenTimer&&(this.getValue().length>=this.getStartSuggestion())){p._sOpenTimer=setTimeout(function(){p._resizePopup(true);p._sOpenTimer=null;z.open();},0);}}}else{J=R.getText("INPUT_SUGGESTIONS_NO_HIT");p.$("inner").removeAttr("aria-haspopup");p.$("inner").removeAttr("aria-activedescendant");if(!p._bUseDialog){if(z.isOpen()){p._sCloseTimer=setTimeout(function(){p._iPopupListSelectedIndex=-1;p.cancelPendingSuggest();z.close();},0);}}else{if(p._hasTabularSuggestions()&&p._oList){p._oList.addStyleClass("sapMInputSuggestionTableHidden");}}}p.$("SuggDescr").text(J);}})();j.prototype._createHighlightedText=function(i){var t=i.innerText,v=this.getValue().toLowerCase(),k=v.length,m=t.toLowerCase(),s,n='';if(!j._wordStartsWithValue(t,v)){return t;}var o=m.indexOf(v);if(o>0){o=m.indexOf(' '+v)+1;}if(o>-1){n+=t.substring(0,o);s=t.substring(o,o+k);n+='<span class="sapMInputHighlight">'+s+'</span>';n+=t.substring(o+k);}else{n=t;}return n;};j.prototype._highlightListText=function(){if(!this.getEnableSuggestionsHighlighting()){return;}var i,k,m=this._oList.$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');for(i=0;i<m.length;i++){k=m[i];k.innerHTML=this._createHighlightedText(k);}};j.prototype._highlightTableText=function(){if(!this.getEnableSuggestionsHighlighting()){return;}var i,k,m=this._oSuggestionTable.$().find('tbody .sapMLabel');for(i=0;i<m.length;i++){k=m[i];k.innerHTML=this._createHighlightedText(k);}};j.prototype.onfocusin=function(E){I.prototype.onfocusin.apply(this,arguments);this.$().addClass("sapMInputFocused");if(!this._bPopupHasFocus&&!this.getStartSuggestion()&&!this.getValue()){this._triggerSuggest(this.getValue());}this._bPopupHasFocus=undefined;this._sPrevSuggValue=null;};j.prototype.onsapshow=function(E){if(!this.getEnabled()||!this.getEditable()||!this.getShowValueHelp()){return;}this.fireValueHelpRequest({fromSuggestions:false});E.preventDefault();E.stopPropagation();};j.prototype.onsaphide=j.prototype.onsapshow;j.prototype.onsapselect=function(E){this._fireValueHelpRequestForValueHelpOnly();};j.prototype.onfocusout=function(E){I.prototype.onfocusout.apply(this,arguments);this.$().removeClass("sapMInputFocused");this.closeValueStateMessage(this);};j.prototype._hasTabularSuggestions=function(){return!!(this.getAggregation("suggestionColumns")&&this.getAggregation("suggestionColumns").length);};j.prototype._getSuggestionsTable=function(){var t=this;if(!this._oSuggestionTable){this._oSuggestionTable=new T(this.getId()+"-popup-table",{mode:sap.m.ListMode.SingleSelectMaster,showNoData:false,showSeparators:"All",width:"100%",enableBusyIndicator:false,rememberSelections:false,selectionChange:function(E){var s=E.getParameter("listItem");t.setSelectionRow(s,true);}});this._oSuggestionTable.addEventDelegate({onAfterRendering:this._highlightTableText.bind(this)});if(this._bUseDialog){this._oSuggestionTable.addStyleClass("sapMInputSuggestionTableHidden");}this._oSuggestionTable.updateItems=function(){T.prototype.updateItems.apply(this,arguments);t._refreshItemsDelayed();return this;};}return this._oSuggestionTable;};j.prototype._fireSuggestionItemSelectedEvent=function(){if(this._iPopupListSelectedIndex>=0){var s=this._oList.getItems()[this._iPopupListSelectedIndex];if(s){if(sap.m.ColumnListItem&&s instanceof sap.m.ColumnListItem){this.fireSuggestionItemSelected({selectedRow:s});}else{this.fireSuggestionItemSelected({selectedItem:s._oItem});}}this._iPopupListSelectedIndex=-1;}};j.prototype._callMethodInManagedObject=function(F,A){var i=Array.prototype.slice.call(arguments),s;if(A==="suggestionColumns"){s=this._getSuggestionsTable();return s[F].apply(s,["columns"].concat(i.slice(2)));}else if(A==="suggestionRows"){s=this._getSuggestionsTable();return s[F].apply(s,["items"].concat(i.slice(2)));}else{return sap.ui.core.Control.prototype[F].apply(this,i.slice(1));}};j.prototype.validateAggregation=function(A,o,m){return this._callMethodInManagedObject("validateAggregation",A,o,m);};j.prototype.setAggregation=function(A,o,s){this._callMethodInManagedObject("setAggregation",A,o,s);return this;};j.prototype.getAggregation=function(A,o){return this._callMethodInManagedObject("getAggregation",A,o);};j.prototype.indexOfAggregation=function(A,o){return this._callMethodInManagedObject("indexOfAggregation",A,o);};j.prototype.insertAggregation=function(A,o,i,s){this._callMethodInManagedObject("insertAggregation",A,o,i,s);return this;};j.prototype.addAggregation=function(A,o,s){this._callMethodInManagedObject("addAggregation",A,o,s);return this;};j.prototype.removeAggregation=function(A,o,s){return this._callMethodInManagedObject("removeAggregation",A,o,s);};j.prototype.removeAllAggregation=function(A,s){return this._callMethodInManagedObject("removeAllAggregation",A,s);};j.prototype.destroyAggregation=function(A,s){this._callMethodInManagedObject("destroyAggregation",A,s);return this;};j.prototype.getBinding=function(A){return this._callMethodInManagedObject("getBinding",A);};j.prototype.getBindingInfo=function(A){return this._callMethodInManagedObject("getBindingInfo",A);};j.prototype.getBindingPath=function(A){return this._callMethodInManagedObject("getBindingPath",A);};j.prototype.clone=function(){var i=sap.ui.core.Control.prototype.clone.apply(this,arguments),k;k=this.getBindingInfo("suggestionColumns");if(k){i.bindAggregation("suggestionColumns",q.extend({},k));}else{this.getSuggestionColumns().forEach(function(o){i.addSuggestionColumn(o.clone(),true);});}k=this.getBindingInfo("suggestionRows");if(k){i.bindAggregation("suggestionRows",q.extend({},k));}else{this.getSuggestionRows().forEach(function(r){i.addSuggestionRow(r.clone(),true);});}return i;};j.prototype.setValue=function(v){this._iSetCount++;I.prototype.setValue.call(this,v);this._onValueUpdated(v);return this;};j.prototype.setDOMValue=function(v){this._$input.val(v);};j.prototype.getDOMValue=function(){return this._$input.val();};j.prototype.getAccessibilityInfo=function(){var i=I.prototype.getAccessibilityInfo.apply(this,arguments);i.description=((i.description||"")+" "+this.getDescription()).trim();return i;};return j;},true);