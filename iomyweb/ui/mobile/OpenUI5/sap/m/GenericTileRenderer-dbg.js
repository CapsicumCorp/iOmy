/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * GenericTile renderer.
	 * @namespace
	 */
	var GenericTileRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	GenericTileRenderer.render = function(oRm, oControl) {
		// Write the HTML into the render manager.
		var sTooltip = oControl.getTooltip_AsString();
		var sHeaderImage = oControl.getHeaderImage();

		oRm.write("<div");

		oRm.writeControlData(oControl);
		if (sTooltip.trim()) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapMGT");
		oRm.addClass(oControl.getSize());
		oRm.addClass(oControl.getFrameType());

		oRm.writeAttribute("role", "presentation");
		oRm.writeAttributeEscaped("aria-label", oControl.getAltText());

		if (oControl.hasListeners("press") && oControl.getState() != sap.m.LoadState.Disabled) {
			oRm.addClass("sapMPointer");
			oRm.writeAttribute("tabindex", "0");
		}

		if (oControl.getBackgroundImage()) {
			oRm.write(" style='background-image:url(");
			oRm.writeEscaped(oControl.getBackgroundImage());
			oRm.write(");'");
			oRm.addClass("sapMGTBackgroundImage");
		}
		oRm.writeClasses();
		oRm.write(">");
		var sState = oControl.getState();
		if (sState != sap.m.LoadState.Loaded) {
			oRm.write("<div");
			oRm.addClass("sapMGTOverlay");
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-overlay");
			if (sTooltip.trim()) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}
			oRm.write(">");
			switch (sState) {
				case sap.m.LoadState.Disabled :
				case sap.m.LoadState.Loading :
					oControl._oBusy.setBusy(sState == sap.m.LoadState.Loading);
					oRm.renderControl(oControl._oBusy);
					break;
				case sap.m.LoadState.Failed :
					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-ftr");
					oRm.addClass("sapMGenericTileFtrFld");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-icon");
					oRm.addClass("sapMGenericTileFtrFldIcn");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl._oWarningIcon);
					oRm.write("</div>");

					oRm.write("<div");
					oRm.writeAttribute("id", oControl.getId() + "-failed-text");
					oRm.addClass("sapMGenericTileFtrFldTxt");
					oRm.writeClasses();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("_failedMessageText"));
					oRm.write("</div>");

					oRm.write("</div>");
					break;
				default :
			}

			oRm.write("</div>");
		}

		oRm.write("<div");
		oRm.addClass("sapMGTHdrContent");
		oRm.addClass(oControl.getSize());
		oRm.addClass(oControl.getFrameType());
		if (sTooltip.trim()) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeClasses();
		oRm.write(">");
		if (sHeaderImage) {
			oRm.renderControl(oControl._oImage);
		}

		this._renderHeader(oRm, oControl);
		this._renderSubheader(oRm, oControl);

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMGTContent");
		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-content");
		oRm.write(">");
		var iLength = oControl.getTileContent().length;
		for (var i = 0; i < iLength; i++) {
			oRm.renderControl(oControl.getTileContent()[i]);
		}
		oRm.write("</div>");
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the header of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 */
	GenericTileRenderer._renderHeader = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTHdrTxt");
		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.renderControl(oControl._oTitle);
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the subheader of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose description should be rendered
	 */
	GenericTileRenderer._renderSubheader = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl.getSubheader());
		oRm.write("</div>");
	};

	return GenericTileRenderer;

}, /* bExport= */true);
