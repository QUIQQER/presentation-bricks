/**
 * QUIQQER Sticky Content - Template MockUp
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\StickyContentMockup
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/presentation-bricks/bin/Controls/StickyContentMockUp', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctions) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/StickyContent/MockUp',

        Binds: [
            '$onImport',
            '$calc',
            '$calcMobile',
            '$resize',
            '$scroll',
            'setImagesFixed',
            'setImagesAbsolute',
            'changeDotsFocus',
            'showVNav',
            'hideVNav'
        ],

        initialize: function (options) {
            this.parent(options);


            this.addEvents({
                onImport: this.$onImport
            });

            this.brick          = null; // whole brick
            this.sections       = null; // entries with text
            this.left    = null; // container with mockup and images
            this.leftWrapper = null;
            this.imageContainer = null;
            this.mockUp         = null; // mockup image (iMac, Macbook)
            this.firstPoint     = null;
            this.lastPoint      = null;
            this.entryHeight    = null;
            this.imagesFixed    = false;
            this.pos            = 0;
            this.winPos         = null;
            this.scrollDown     = true;


            this.List       = null;
            this.PointsList = null;

            this.vNav        = null;
            this.dots        = null;
            this.vNavVisible = false;
        },

        /**
         * event: on import
         */
        $onImport: function () {

            this.brick          = document.getElement('.qui-control-stickyContent');
            this.sections       = this.brick.getElements('.qui-control-stickyContent-right-entry');
            this.left    = this.brick.getElement('.qui-control-stickyContent-left');
            this.leftWrapper    = this.brick.getElement('.qui-control-stickyContent-left-wrapper');
            this.imageContainer = this.brick.getElement('.qui-control-stickyContent-left-wrapper-container');
            this.mockUp         = this.brick.getElement('.image-mockup');

            this.vNav = this.brick.getElement('.qui-control-stickyContent-vNav-container');
            this.dots = this.vNav.getElements('.circle-icon');

            var self = this;

            // add click event to all dots in vertical nav
            this.dots.each(function (dot) {
                dot.addEvent('click', function () {
                    var section = self.sections[dot.getAttribute('data-qui-section')];
                    new Fx.Scroll(window).toElement(section);
                });
            });


            QUI.addEvent('resize', this.$resize);

            this.$resize();

            QUI.addEvent('scroll', function () {
                self.$scroll(QUI.getScroll().y)
            });

        },

        /**
         * event: on resize
         */
        $resize: function () {

            this.List       = []; // clear the both arrays
            this.PointsList = []; // at each resize
            this.mobile     = false;

            // mobile?
            if (window.getSize().x < 768) {
                this.$calcMobile();
                this.mobile = true;
                return;
            }

            this.$calc();
            this.$scroll(QUI.getScroll().y);

        },

        /**
         * calc the break points of all containers
         */
        $calc: function () {
            this.firstPoint  = this.brick.getPosition().y;
            this.entryHeight = this.sections[0].getSize().y;
            this.lastPoint   = this.firstPoint + (this.entryHeight * (this.sections.length - 1));
            var dot          = 0,
                imgSize      = document.getElement('.qui-control-stickyContent-image').getSize().y,
                imgPos       = 0;

            this.sections.each(function (entry) {
                // change img when half of next the next section is visible
                var point = entry.getPosition().y - Math.round((this.entryHeight / 2));

                this.List[point] = {
                    img: imgPos,
                    dot: this.dots[dot]
                };

                dot++;
                imgPos = imgPos + imgSize;
                this.PointsList.push(point);
            }.bind(this));

            this.PointsList.push(this.lastPoint);

            this.containerPos = (this.entryHeight * (this.sections.length - 1));

            console.log(this.List);
            console.log(this.PointsList);

            this.winPos = QUI.getScroll().y;
        },

        $calcMobile: function () {
            this.firstPoint  = this.brick.getPosition().y;
            this.entryHeight = this.sections[0].getSize().y;
            // this.lastPoint   = this.firstPoint + (this.entryHeight * (this.sections.length - 1));
            this.lastPoint   = this.firstPoint + this.brick.getSize().y - this.sections[this.sections.length - 1].getSize().y;
            var dot          = 0,
                imgSize      = document.getElement('.qui-control-stickyContent-left-wrapper-container img').getSize().y,
                imgPos       = 0;


            this.sections.each(function (entry) {
                // change img when half of next the next section is visible
                var point = entry.getPosition().y - Math.round((this.entryHeight * 1));

                this.List[point] = {
                    img: imgPos,
                    dot: this.dots[dot]
                };

                dot++;
                imgPos = imgPos + imgSize;

                this.PointsList.push(point);
            }.bind(this));

            this.PointsList.push(this.lastPoint);
            console.log(this.PointsList);

            this.winPos = QUI.getScroll().y;


            var container = document.getElement('body');

            /*this.PointsList.each(function (Elm) {
                var html = new Element('div', {
                    'class': 'test-css',
                    styles : {
                        top: Elm
                    }
                });

                html.inject(container);

            });*/

        },

        /**
         * scroll event
         */
        $scroll: function (scroll) {

            if (scroll >= this.firstPoint && scroll <= this.lastPoint) {

                if (!this.vNavVisible) {
                    this.showVNav();
                }

                if (!this.imagesFixed) {
                    this.setImagesFixed();
                }

                for (var i = 0; i < this.PointsList.length; i++) {
                    if (scroll > this.PointsList[i] && scroll < this.PointsList[i + 1]) {

                        if (this.pos != this.PointsList[i]) {
                            // scroll down
                            this.scrollDown = true;
                            if (scroll < this.winPos) {
                                // scroll up
                                this.scrollDown = false;
                            }

                            this.pos    = this.PointsList[i];

                            var top = this.List[this.PointsList[i]].img;
                            this.changeDotsFocus(this.List[this.PointsList[i]].dot);

                            // scroll the screen to the new position
                            this.imageContainer.setStyle('top', -top);
                        }
                    }
                }
                return;
            }

            if (this.imagesFixed) {
                if (scroll > this.lastPoint) {
                    this.left.setStyle('top', this.containerPos);
                } else {
                    this.left.setStyle('top', 0);
                }
                this.setImagesAbsolute();
            }

            if (this.vNavVisible) {
                this.hideVNav();
            }
        },

        /**
         * set images position to fixed
         */
        setImagesFixed: function () {
            if (!this.mobile) {
                this.mockUp.setStyle('position', 'fixed');
                document.getElement('.qui-control-stickyContent-left-wrapper').setStyle('position', 'fixed');
            } else {
                // mobile
                this.left.setStyle('position', 'fixed');
                document.getElement('.qui-control-stickyContent-right-entry-content').setStyle('margin-top', '50vh');
            }


            this.imagesFixed = true;
        },

        /**
         * set images position to absolute
         */
        setImagesAbsolute: function () {
            if (!this.mobile) {
                this.mockUp.setStyle('position', 'absolute');
                document.getElement('.qui-control-stickyContent-left-wrapper').setStyle('position', 'absolute');
            } else {
                // mobile
                this.left.setStyle('position', 'relative');
                document.getElement('.qui-control-stickyContent-right-entry-content').setStyle('margin-top', 0);
            }

            this.imagesFixed = false;
        },

        /**
         * change the focus of the vertical nav point
         *
         * @param activeDot
         */
        changeDotsFocus: function (activeDot) {
            this.dots.each(function (Elm) {
                Elm.removeClass('control-background circle-icon-active');
            });
            activeDot.addClass('control-background circle-icon-active');
        },

        /**
         * show the container with the vertical nav (dots)
         */
        showVNav: function () {
            this.vNav.addClass('visible');
            this.vNavVisible = true;
        },

        /**
         * show the container with the vertical nav (dots)
         */
        hideVNav: function () {
            this.vNav.removeClass('visible');
            this.vNavVisible = false;
        }
    });
});
