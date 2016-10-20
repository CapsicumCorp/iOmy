/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/Control','sap/ui/core/delegate/ItemNavigation','./library','jquery.sap.dom'],function(q,C,I,l){"use strict";var N=C.extend("sap.ui.ux3.NavigationBar",{metadata:{library:"sap.ui.ux3",properties:{toplevelVariant:{type:"boolean",group:"Misc",defaultValue:false}},defaultAggregation:"items",aggregations:{items:{type:"sap.ui.ux3.NavigationItem",multiple:true,singularName:"item"},overflowMenu:{type:"sap.ui.commons.Menu",multiple:false,visibility:"hidden"}},associations:{selectedItem:{type:"sap.ui.ux3.NavigationItem",multiple:false},associatedItems:{type:"sap.ui.ux3.NavigationItem",multiple:true,singularName:"associatedItem"}},events:{select:{allowPreventDefault:true,parameters:{itemId:{type:"string"},item:{type:"sap.ui.ux3.NavigationItem"}}}}}});N.SCROLL_STEP=250;N.prototype.init=function(){this._bPreviousScrollForward=false;this._bPreviousScrollBack=false;this._iLastArrowPos=-100;this._bRtl=sap.ui.getCore().getConfiguration().getRTL();this.allowTextSelection(false);this.startScrollX=0;this.startTouchX=0;var t=this;this._oItemNavigation=new I().setCycling(false);this.addDelegate(this._oItemNavigation);this.data("sap-ui-fastnavgroup","true",true);if(q.sap.touchEventMode==="ON"){var T=function(e){e.preventDefault();if(t._iInertiaIntervalId){window.clearInterval(t._iInertiaIntervalId);}t.startScrollX=t.getDomRef("list").scrollLeft;t.startTouchX=e.touches[0].pageX;t._bTouchNotMoved=true;t._lastMoveTime=new Date().getTime();};var f=function(e){var d=e.touches[0].pageX-t.startTouchX;var L=t.getDomRef("list");var o=L.scrollLeft;var n=t.startScrollX-d;L.scrollLeft=n;t._bTouchNotMoved=false;var b=new Date().getTime()-t._lastMoveTime;t._lastMoveTime=new Date().getTime();if(b>0){t._velocity=(n-o)/b;}e.preventDefault();};var a=function(e){if(t._bTouchNotMoved===false){e.preventDefault();var L=t.getDomRef("list");var d=50;var b=Math.abs(t._velocity/10);t._iInertiaIntervalId=window.setInterval(function(){t._velocity=t._velocity*0.80;var c=t._velocity*d;L.scrollLeft=L.scrollLeft+c;if(Math.abs(t._velocity)<b){window.clearInterval(t._iInertiaIntervalId);t._iInertiaIntervalId=undefined;}},d);}else if(t._bTouchNotMoved===true){t.onclick(e);e.preventDefault();}t._bTouchNotMoved=undefined;t._lastMoveTime=undefined;};this.ontouchstart=T;this.ontouchend=a;this.ontouchmove=f;}};N.prototype.exit=function(){if(this._oItemNavigation){this.removeDelegate(this._oItemNavigation);this._oItemNavigation.destroy();delete this._oItemNavigation;}if(this._checkOverflowIntervalId){q.sap.clearIntervalCall(this._checkOverflowIntervalId);this._checkOverflowIntervalId=null;}};N.prototype.onBeforeRendering=function(){if(this._checkOverflowIntervalId){q.sap.clearIntervalCall(this._checkOverflowIntervalId);this._checkOverflowIntervalId=null;}if(!!sap.ui.Device.browser.firefox){this.$().unbind("DOMMouseScroll",this._handleScroll);}else{this.$().unbind("mousewheel",this._handleScroll);}var a=this.getDomRef("arrow");this._iLastArrowPos=a?parseInt(this._bRtl?a.style.right:a.style.left,10):-100;};N.prototype.invalidate=function(s){if(s instanceof sap.ui.ux3.NavigationItem){this._menuInvalid=true;}C.prototype.invalidate.apply(this,arguments);};N.prototype._calculatePositions=function(){var d=this.getDomRef();this._bPreviousScrollForward=false;this._bPreviousScrollBack=false;this._checkOverflow(d.firstChild,this.getDomRef("ofb"),this.getDomRef("off"));};N.prototype.onThemeChanged=function(){if(this.getDomRef()){this._calculatePositions();}};N.prototype.onAfterRendering=function(){var d=this.getDomRef();var L=d.firstChild;var o=this.getDomRef("ofb");var a=this.getDomRef("off");this._checkOverflowIntervalId=q.sap.intervalCall(350,this,"_checkOverflow",[L,o,a]);if(!!sap.ui.Device.browser.firefox){q(d).bind("DOMMouseScroll",q.proxy(this._handleScroll,this));}else{q(d).bind("mousewheel",q.proxy(this._handleScroll,this));}this._calculatePositions();this._updateItemNavigation();var n=this.$();n.on("scroll",function(){n.children().scrollTop(0);n.scrollTop(0);});};N.prototype._updateItemNavigation=function(){var d=this.getDomRef();if(d){var s=-1;var S=this.getSelectedItem();var i=q(d).children().children("li").children().not(".sapUiUx3NavBarDummyItem");i.each(function(a,e){if(e.id==S){s=a;}});this._oItemNavigation.setRootDomRef(d);this._oItemNavigation.setItemDomRefs(i.toArray());this._oItemNavigation.setSelectedIndex(s);}};N.prototype.onsapspace=function(e){this._handleActivation(e);};N.prototype.onclick=function(e){this._handleActivation(e);};N.prototype._handleActivation=function(e){var t=e.target.id;if(t){var i=this.getId();e.preventDefault();if(t==i+"-ofb"){this._scroll(-N.SCROLL_STEP,500);}else if(t==i+"-off"){this._scroll(N.SCROLL_STEP,500);}else if(t==i+"-oflt"||t==i+"-ofl"){this._showOverflowMenu();}else{var a=sap.ui.getCore().byId(t);if(a&&(t!=this.getSelectedItem())&&(sap.ui.getCore().byId(t)instanceof sap.ui.ux3.NavigationItem)){if(this.fireSelect({item:a,itemId:t})){this.setAssociation("selectedItem",a,true);this._updateSelection(t);}}}}};N.prototype._getOverflowMenu=function(){var m=this.getAggregation("overflowMenu");if(!m||this._menuInvalid){if(m){m.destroyAggregation("items",true);}else{m=new sap.ui.commons.Menu();}var a=this._getCurrentItems();var t=this;var s=this.getSelectedItem();for(var i=0;i<a.length;++i){var n=a[i];var M=new sap.ui.commons.MenuItem(n.getId()+"-overflowItem",{text:n.getText(),visible:n.getVisible(),icon:s==n.getId()?"sap-icon://accept":null,select:(function(n){return function(e){t._handleActivation({target:{id:n.getId()},preventDefault:function(){}});};})(n)});m.addAggregation("items",M,true);}this.setAggregation("overflowMenu",m,true);this._menuInvalid=false;}return m;};N.prototype._getCurrentItems=function(){var a=this.getItems();if(a.length<1){a=this.getAssociatedItems();var c=sap.ui.getCore();for(var i=0;i<a.length;++i){a[i]=c.byId(a[i]);}}return a;};N.prototype._showOverflowMenu=function(){var m=this._getOverflowMenu();var t=this.$("ofl").get(0);m.open(true,t,sap.ui.core.Popup.Dock.EndTop,sap.ui.core.Popup.Dock.CenterCenter,t);};N.prototype._updateSelection=function(i){this._menuInvalid=true;var $=q.sap.byId(i);$.attr("tabindex","0").attr("aria-checked","true");$.parent().addClass("sapUiUx3NavBarItemSel");$.parent().parent().children().each(function(){var a=this.firstChild;if(a&&(a.id!=i)&&(a.className.indexOf("Dummy")==-1)){q(a).attr("tabindex","-1");q(a).parent().removeClass("sapUiUx3NavBarItemSel");q(a).attr("aria-checked","false");}});var s=$.parent().index();if(s>0){s--;}this._oItemNavigation.setSelectedIndex(s);var A=this.$("arrow");var b=A.outerWidth();var t=N._getArrowTargetPos(i,b,this._bRtl);A.stop();var c=this._bRtl?{right:t+"px"}:{left:t+"px"};A.animate(c,500,"linear");var d=this;window.setTimeout(function(){t=N._getArrowTargetPos(i,b,d._bRtl);A.stop();var a=d._bRtl?{right:t+"px"}:{left:t+"px"};A.animate(a,200,"linear",function(){var e=q.sap.domById(i);d._scrollItemIntoView(e);});},300);};N.prototype._scrollItemIntoView=function(i){if(!i){return;}var a=q(i.parentNode);var u=a.parent();var t;var r=sap.ui.getCore().getConfiguration().getRTL();var b=a.index()-1;if(b==0){t=r?(u[0].scrollWidth-u.innerWidth()+20):0;}else if(b==a.siblings().length-2){t=r?0:(u[0].scrollWidth-u.innerWidth()+20);}else{var c=a.position().left;var d=r?u.scrollLeftRTL():u.scrollLeft();if(c<0){t=d+c;}else{var e=u.innerWidth()-(c+a.outerWidth(true));if(e<0){t=d-e;t=Math.min(t,d+c);}}}if(t!==undefined){if(r){t=q.sap.denormalizeScrollLeftRTL(t,u.get(0));}u.stop(true,true).animate({scrollLeft:t});}};N._getArrowTargetPos=function(t,a,r){var i=q.sap.byId(t);if(i.length>0){var w=i.outerWidth();var b=Math.round(i[0].offsetLeft+(w/2)-(a/2));if(!r){return b;}else{return i.parent().parent().innerWidth()-b-a;}}else{return-100;}};N.prototype._handleScroll=function(e){if(e.type=="DOMMouseScroll"){var s=e.originalEvent.detail*40;this._scroll(s,50);}else{var s=-e.originalEvent.wheelDelta;this._scroll(s,50);}e.preventDefault();};N.prototype._scroll=function(d,D){var o=this.$()[0].firstChild;var s=o.scrollLeft;if(!sap.ui.Device.browser.internet_explorer&&this._bRtl){d=-d;}var S=s+d;q(o).stop(true,true).animate({scrollLeft:S},D);};N.prototype._checkOverflow=function(L,o,a){function i(){return sap.ui.Device.os.macintosh&&sap.ui.Device.browser.chrome;}if(L&&this.getDomRef()&&q.sap.act.isActive()){var s=L.scrollLeft;var S=false;var b=false;var r=L.scrollWidth;var c=L.clientWidth;var d=i()?5:0;if(Math.abs(r-c)==1){r=c;}if(!this._bRtl){if(s>d){S=true;}if((r>c)&&(r-(s+c)>d)){b=true;}}else{var $=q(L);if($.scrollLeftRTL()>d){b=true;}if($.scrollRightRTL()>d){S=true;}}if((b!=this._bPreviousScrollForward)||(S!=this._bPreviousScrollBack)){this._bPreviousScrollForward=b;this._bPreviousScrollBack=S;this.$().toggleClass("sapUiUx3NavBarScrollBack",S).toggleClass("sapUiUx3NavBarScrollForward",b);if(!N._bMenuLoaded&&(S||b)){N._bMenuLoaded=true;q.sap.require("sap.ui.commons.Menu");}}var e=sap.ui.getCore().byId(this.getSelectedItem());if(e){var A=this.$("arrow");var f=A.outerWidth();var t=N._getArrowTargetPos(e.getId(),f,this._bRtl)+"px";if(!this._bRtl){if(A[0].style.left!=t){A[0].style.left=t;}}else{if(A[0].style.right!=t){A[0].style.right=t;}}}}};N.prototype.setSelectedItem=function(i){this.setAssociation("selectedItem",i,true);if(this.getDomRef()){var s=(!i||(typeof(i)=="string"))?i:i.getId();this._updateSelection(s);}};N.prototype.addItem=function(i){this._menuInvalid=true;return this.addAggregation("items",i);};N.prototype.destroyItems=function(){this._menuInvalid=true;return this.destroyAggregation("items");};N.prototype.insertItem=function(i,a){this._menuInvalid=true;return this.insertAggregation("items",i,a);};N.prototype.removeItem=function(i){this._menuInvalid=true;return this.removeAggregation("items",i);};N.prototype.removeAllItems=function(){this._menuInvalid=true;return this.removeAllAggregation("items");};N.prototype.addAssociatedItem=function(i){this._menuInvalid=true;return this.addAssociation("associatedItems",i);};N.prototype.removeAssociatedItem=function(i){this._menuInvalid=true;return this.removeAssociation("associatedItems",i);};N.prototype.removeAllAssociatedItems=function(){this._menuInvalid=true;return this.removeAllAssociation("associatedItems");};N.prototype.setAssociatedItems=function(a){var L=this.getDomRef("list");this.removeAllAssociation("associatedItems",true);for(var i=0;i<a.length;i++){this.addAssociation("associatedItems",a[i],true);}if(L){var f=q(L).find(":focus");var b=(f.length>0)?f.attr("id"):null;if(arguments.length>1&&typeof arguments[1]==="boolean"){this._iLastArrowPos=-100;}else{var c=this.getDomRef("arrow");this._iLastArrowPos=parseInt(this._bRtl?c.style.right:c.style.left,10);}L.innerHTML="";var r=sap.ui.getCore().createRenderManager();sap.ui.ux3.NavigationBarRenderer.renderItems(r,this);r.flush(L,true);r.destroy();var n;if(b&&(n=q.sap.domById(b))){q.sap.focus(n);}this._updateSelection(this.getSelectedItem());this._updateItemNavigation();}return this;};N.prototype.isSelectedItemValid=function(){var s=this.getSelectedItem();if(!s){return false;}var a=this.getItems();if(!a||a.length==0){a=this.getAssociatedItems();for(var i=0;i<a.length;i++){if(a[i]==s){return true;}}}else{for(var i=0;i<a.length;i++){if(a[i].getId()==s){return true;}}}return false;};return N;},true);
