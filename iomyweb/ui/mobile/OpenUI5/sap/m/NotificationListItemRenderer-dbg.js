/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([], function () {
	'use strict';

	/**
	 * NotificationListItem renderer.
	 * @namespace
	 */
	var NotificationListItemRenderer = {};

	var classNameItem = 'sapMNLI';
	var classNameListBaseItem = 'sapMLIB';
	var classNameAuthor = 'sapMNLI-AuthorPicture';
	var classNamePriority = 'sapMNLI-Priority';
	var classNameHeader = 'sapMNLI-Header';
	var classNameBody = 'sapMNLI-Body';
	var classNameDescription = 'sapMNLI-Description';
	var classNameDetails = 'sapMNLI-Details';
	var classNameBullet = 'sapMNLI-Bullet';
	var classNameFooter = 'sapMNLI-Footer';
	var classNameCloseButton = 'sapMNLI-CloseButton';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.render = function (oRm, oControl) {
		var id = oControl.getId();

		oRm.write('<li');
		oRm.addClass(classNameItem);
		oRm.addClass(classNameListBaseItem);
		oRm.writeControlData(oControl);
		oRm.writeAttribute('tabindex', '0');

		// ARIA
		oRm.writeAccessibilityState(oControl, {
			role: "listitem",
			labelledby: id + '-title',
			describedby: (id + '-body') + ' ' + (id + '-info')
		});

		oRm.writeClasses();
		oRm.write('>');

		this.renderPriorityArea(oRm, oControl);
		this.renderHeader(oRm, oControl);
		this.renderBody(oRm, oControl);
		this.renderFooter(oRm, oControl);
		this.renderCloseButton(oRm, oControl);

		oRm.write('</li>');
	};

	//================================================================================
	// Priority and picture rendering methods
	//================================================================================

	/**
	 * Renders the visual representation of the priority of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderPriorityArea = function(oRm, oControl) {
		oRm.write('<div');

		var classPriority = '';

		switch (oControl.getPriority()) {
			case (sap.ui.core.Priority.Low):
				classPriority = 'sapMNLI-Low';
				break;
			case (sap.ui.core.Priority.Medium):
				classPriority = 'sapMNLI-Medium';
				break;
			case (sap.ui.core.Priority.High):
				classPriority = 'sapMNLI-High';
				break;
			default:
				classPriority = 'sapMNLI-None';
				break;
		}

		oRm.addClass(classNamePriority);
		oRm.addClass(classPriority);

		oRm.writeClasses();
		oRm.write('>');
		oRm.write('</div>');
	};

	/**
	 * Renders the picture of the author of the Notification.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderAuthorPicture = function(oRm, oControl) {
		if (!oControl.getAuthorPicture()) {
		    return;
		}

		oRm.write('<div');
		oRm.addClass(classNameAuthor);
		oRm.writeClasses();
		oRm.write('>');
		oRm.renderControl(oControl._getAuthorImage());
		oRm.write('</div>');
	};

	/**
	 * Renders the close button of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderCloseButton = function (oRm, oControl) {
		if (oControl.getShowCloseButton()) {
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
		}
	};

	//================================================================================
	// Header rendering methods
	//================================================================================

	/**
	 * Renders the header content of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderHeader = function (oRm, oControl) {
		oRm.write('<div class=' + classNameHeader + '>');
		this.renderTitle(oRm, oControl);
		oRm.write('</div>');
	};

	/**
	 * Renders the title of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderTitle = function (oRm, oControl) {
		oRm.renderControl(oControl._getHeaderTitle());
	};

	//================================================================================
	// Body rendering methods
	//================================================================================

	/**
	 * Renders the body content of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderBody = function (oRm, oControl) {
		oRm.write('<div class=' + classNameBody + '>');

		this.renderAuthorPicture(oRm, oControl);
		oRm.write('<div class=' + classNameDescription + '>');
		this.renderDescription(oRm, oControl);
		this.renderDetails(oRm, oControl);
		oRm.write('</div>');
		this.renderAriaText(oRm, oControl);

		oRm.write('</div>');
	};

	/**
	 * Renders the description text inside the body of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderDescription = function (oRm, oControl) {
		oRm.renderControl(oControl._getDescriptionText());
	};

	/**
	 * Renders the details, such as author name and timestamp of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderDetails = function(oRm, oControl) {
		oRm.write('<div class="' + classNameDetails + '">');
		this.renderAuthorName(oRm, oControl);

		if (oControl.getAuthorName()) {
			oRm.write('<span class="' + classNameBullet + '">&#x00B7</span>');
		}
		this.renderDatetime(oRm, oControl);
		oRm.write('</div>');
	};

	/**
	 * Renders the timestamp of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderDatetime = function (oRm, oControl) {
		oRm.renderControl(oControl._getDateTimeText());
	};

	/**
	 * Renders the name of the author of the notification.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderAuthorName = function (oRm, oControl) {
		oRm.renderControl(oControl._getAuthorName());
	};

	/**
	 * Provides ARIA support for the additional control information information, such as, read status, due date, and priority.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.NotificationListItem} oControl An object representation of the Notification List Item that should be rendered
	 */
	NotificationListItemRenderer.renderAriaText = function (oRm, oControl) {
		oRm.renderControl(oControl._ariaDetailsText);
	};

	//================================================================================
	// Footer rendering methods
	//================================================================================

	/**
	 * Renders the footer content of the NotificationListItem.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.renderFooter = function (oRm, oControl) {
		var aButtons = oControl.getButtons();

		if (aButtons && aButtons.length && oControl.getShowButtons()) {
			oRm.write('<div class=' + classNameFooter + '>');
			oRm.renderControl(oControl.getAggregation('_overflowToolbar'));
			oRm.write('</div>');
		}
	};

	return NotificationListItemRenderer;

}, /* bExport= */ true);
