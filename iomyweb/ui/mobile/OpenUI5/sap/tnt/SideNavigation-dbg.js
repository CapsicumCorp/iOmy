/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.t.SideNavigation.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/ResizeHandler', 'sap/ui/core/Icon', './NavigationList'],
    function (jQuery, library, Control, ResizeHandler, Icon) {
        'use strict';

        /**
         * Constructor for a new SideNavigation.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class
         * The SideNavigation control is a container, which consists of flexible and fixed parts on top of each other. The flexible part adapts its size to the fixed one.
         * The flexible part has a scrollbar when the content is larger than the available space.
         * Whenever the height of the whole control is less than 256 pixels, the scrollbar becomes joint for the two parts.
         *
         * <b>Note:</b> In order for the SideNavigation to stretch properly, its parent layout control should only be the sap.tnt.ToolLayout.
         * @extends sap.ui.core.Control
         *
         * @author SAP SE
         * @version 1.34.9
         *
         * @constructor
         * @public
         * @since 1.34
         * @alias sap.tnt.SideNavigation
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var SideNavigation = Control.extend('sap.tnt.SideNavigation', /** @lends sap.t.SideNavigation.prototype */ {
            metadata: {
                library: 'sap.tnt',
                properties: {
                    /**
                     * Specifies if the control is expanded.
                     */
                    expanded: {type: 'boolean', group: 'Misc', defaultValue: true}
                },
                defaultAggregation: "item",
                aggregations: {
                    /**
                     * Defines the content inside the flexible part.
                     */
                    item: {type: 'sap.tnt.NavigationList', multiple: false, bindable: "bindable"},
                    /**
                     * Defines the content inside the fixed part.
                     */
                    fixedItem: {type: 'sap.tnt.NavigationList', multiple: false},
                    /**
                     * Defines the content inside the footer.
                     */
                    footer: {type: 'sap.tnt.NavigationList', multiple: false},
                    /**
                     * The top arrow, used for scrolling throw items when SideNavigation is collapsed.
                     */
                    _topArrowControl: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
                    /**
                     * The bottom arrow, used for scrolling throw items when SideNavigation is collapsed.
                     */
                    _bottomArrowControl: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
                },
                events: {
                    /**
                     * Fired when an item is selected.
                     */
                    itemSelect: {
                        parameters: {
                            /**
                             * The selected item.
                             */
                            item: {type: 'sap.ui.core.Item'}
                        }
                    }
                }
            }
        });

        SideNavigation.prototype.init = function () {
            // Define group for F6 handling
            this.data('sap-ui-fastnavgroup', 'true', true);
        };

        SideNavigation.prototype.setAggregation = function (aggregationName, object, suppressInvalidate) {
            if (object && object.attachItemSelect) {
                object.attachItemSelect(this._itemSelectionHandler.bind(this));
            }

            return sap.ui.base.ManagedObject.prototype.setAggregation.apply(this, arguments);
        };

        SideNavigation.prototype.setExpanded = function (isExpanded) {
            if (sap.ui.Device.system.phone) {
                isExpanded = true;
            }

            if (this.getExpanded() === isExpanded) {
                return this;
            }

            if (this.getAggregation('item')) {
                this.getAggregation('item').setExpanded(isExpanded);
            }

            if (this.getAggregation('fixedItem')) {
                this.getAggregation('fixedItem').setExpanded(isExpanded);
            }

            if (this.getDomRef()) {
                this.getDomRef().classList.toggle('sapTntSideNavigationNotExpanded');
            }

            this.setProperty('expanded', isExpanded, true);

            this._toggleArrows();

            return this;
        };

        /**
         * @private
         */
        SideNavigation.prototype.onBeforeRendering = function () {
            this._deregisterControl();
        };

        /**
         * @private
         */
        SideNavigation.prototype.onAfterRendering = function () {
            this._ResizeHandler = ResizeHandler.register(this.getDomRef(), this._toggleArrows.bind(this));
            this._toggleArrows();
        };

        /**
         * @private
         */
        SideNavigation.prototype.exit = function () {
            this._deregisterControl();
        };

        /**
         *
         * @param event
         * @private
         */
        SideNavigation.prototype._itemSelectionHandler = function (event) {
            var listId = event.getSource().getId();
            var itemAggregation = this.getAggregation('item');
            var fixedItemAggregation = this.getAggregation('fixedItem');

            if (itemAggregation && fixedItemAggregation && listId === itemAggregation.getId()) {
                fixedItemAggregation.setSelectedItem(null);
            }

            if (itemAggregation && fixedItemAggregation && listId === fixedItemAggregation.getId()) {
                itemAggregation.setSelectedItem(null);
            }

            this.fireItemSelect({
                item: event.getParameter('item')
            });
        };

        /**
         * @private
         */
        SideNavigation.prototype._deregisterControl = function () {
            if (this._ResizeHandler) {
                ResizeHandler.deregister(this._ResizeHandler);
                this._ResizeHandler = null;
            }
        };

        /**
         * @private
         * @param {Object} event
         */
        SideNavigation.prototype.ontouchmove = function (event) {
            // mark the event for components that needs to know if the event was handled
            event.setMarked();
        };

        /**
         * Returns the sap.ui.core.Icon control used to display the group icon.
         * @returns {sap.ui.core.Icon}
         * @private
         */
        SideNavigation.prototype._getTopArrowControl = function () {
            var iconControl = this.getAggregation('_topArrowControl');
            var that = this;

            if (!iconControl) {
                iconControl = new Icon({
                    src: 'sap-icon://navigation-up-arrow',
                    noTabStop: true,
                    useIconTooltip: false,
                    tooltip: '',
                    press: this._arrowPress.bind(that)
                }).addStyleClass('sapTntSideNavigationScrollIcon sapTntSideNavigationScrollIconUp');
                this.setAggregation("_topArrowControl", iconControl, true);
            }

            return iconControl;
        };

        /**
         * Returns the sap.ui.core.Icon control used to display the group icon.
         * @returns {sap.ui.core.Icon}
         * @private
         */
        SideNavigation.prototype._getBottomArrowControl = function () {
            var iconControl = this.getAggregation('_bottomArrowControl');
            var that = this;

            if (!iconControl) {
                iconControl = new Icon({
                    src: 'sap-icon://navigation-down-arrow',
                    noTabStop: true,
                    useIconTooltip: false,
                    tooltip: '',
                    press: this._arrowPress.bind(that)
                }).addStyleClass('sapTntSideNavigationScrollIcon sapTntSideNavigationScrollIconDown');

                this.setAggregation("_bottomArrowControl", iconControl, true);
            }

            return iconControl;
        };

        SideNavigation.prototype._toggleArrows = function () {
            var domRef = this.getDomRef();

            if (!domRef) {
                return;
            }

            var scrollContainerWrapper = this.$('Flexible')[0];
            var scrollContainerContent = this.$('Flexible-Content')[0];
            var isAsideExpanded = this.getExpanded();

            if ((scrollContainerContent.offsetHeight > scrollContainerWrapper.offsetHeight) && !isAsideExpanded) {
                domRef.querySelector('.sapTntSideNavigationScrollIconUp').style.display = 'block';
                domRef.querySelector('.sapTntSideNavigationScrollIconDown').style.display = 'block';

                domRef.querySelector('.sapTntSideNavigationScrollIconDown').classList.remove('sapTntSideNavigationScrollIconDisabled');
            } else {
                domRef.querySelector('.sapTntSideNavigationScrollIconUp').style.display = 'none';
                domRef.querySelector('.sapTntSideNavigationScrollIconDown').style.display = 'none';
            }
        };

        SideNavigation.prototype._arrowPress = function (event, step) {
            event.preventDefault();

            var source = document.getElementById(event.oSource.sId);
            var isDirectionForward = source.classList.contains('sapTntSideNavigationScrollIconDown') ? true : false;

            var $container = this.$('Flexible');

            var step = isDirectionForward ? 40 : -40;
            $container[0].scrollTop += step;
        };

        return SideNavigation;

    }, /* bExport= */ true
);
