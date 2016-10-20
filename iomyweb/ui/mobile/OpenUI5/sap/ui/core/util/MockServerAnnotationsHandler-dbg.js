/*
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([ 'jquery.sap.global', 'sap/ui/Device', 'sap/ui/core/util/MockServer', 'sap/ui/model/odata/ODataModel', 'jquery.sap.xml' ], function(jQuery, Device, MockServer, ODataModel) {
	"use strict";
	return {

		parse : function(oMetadata) {
			var oMockStub = new MockServer({
				rootUri: "/annotationhandler/",
				requests: [{
					method: "GET",
					path: new RegExp("\\$metadata"),
					response: function(oXhr) {
						oXhr.respond(200, {
							"Content-Type": "application/xml;charset=utf-8"
						}, jQuery.sap.serializeXML(oMetadata));
					}
								}]
			});
			oMockStub.start();

			var mModelOptions = {
					annotationURI : [
										"/annotationhandler/$metadata"
									],
					json : true
				};

			var oModel = new ODataModel("/annotationhandler/", mModelOptions);
			var oAnnotations = oModel.getServiceAnnotations();
			oMockStub.destroy();
			return oAnnotations;
		}
	};

}, /* bExport= */true);