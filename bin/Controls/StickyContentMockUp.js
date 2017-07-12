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
    'qui/controls/Control'

], function (QUI, QUIControl) {
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
            '$scrollMobile',
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

            this.brick          = null;
            this.sections       = null; // entries with text
            this.left           = null; // left sides (with images and mockup)
            this.leftWrapper    = null;
            this.imageContainer = null;
            this.mockUp         = null; // mockup image (png)
            this.entryContainer = null;
            this.mobileWrapper  = null;

            this.firstPoint  = null;
            this.lastPoint   = null;
            this.entryHeight = null;
            this.imagesFixed = false;
            this.pos         = 0;
            this.winPos      = null;
            this.mobile      = false;

            this.List       = null; // list with points
            this.PointsList = null;

            this.vNav        = null; // container with vertical navigation
            this.dots        = null; // dots in vertical nav
            this.vNavVisible = false;

            this.offset = 0;

        },

        /**
         * event: on import
         */
        $onImport: function () {

            this.brick          = document.getElement('.qui-control-stickyContent');
            this.sections       = this.brick.getElements('.qui-control-stickyContent-right-entry');
            this.left           = this.brick.getElement('.qui-control-stickyContent-left');
            this.leftWrapper    = this.brick.getElement('.qui-control-stickyContent-left-wrapper');
            this.imageContainer = this.brick.getElement('.qui-control-stickyContent-left-wrapper-container');
            this.mockUp         = this.brick.getElement('.image-mockup');
            this.entryContainer = this.brick.getElement('.qui-control-stickyContent-right-entry-content');
            this.mobileWrapper  = this.brick.getElement('.stickyContent-left-mobileWrapper')

            this.vNav = this.brick.getElement('.qui-control-stickyContent-vNav-container');
            this.dots = this.vNav.getElements('.circle-icon');

            var self = this;

            QUI.addEvent('resize', this.$resize);

            this.$resize();

            // add click event to all dots in vertical nav
            this.dots.each(function (dot) {
                dot.addEvent('click', function () {
                    var section = self.sections[dot.getAttribute('data-qui-section')];

                    new Fx.Scroll(window, {
                        offset: {
                            x: 0,
                            y: self.offset // desktop = 0, mobile = winHeight / 2
                        }
                    }).toElement(section);
                });
            });
        },

        /**
         * event: on resize
         */
        $resize: function () {

            QUI.removeEvents('scroll');

            this.List        = []; // clear the both arrays
            this.PointsList  = []; // at each resize
            this.imagesFixed = false;
            var self         = this;

            // mobile?
            if (window.getSize().x < 768) {
                this.mobile      = true;
                this.imagesFixed = false;
                this.offset      = (Math.round(QUI.getWindowSize().y / 2) * -1) - 1;

                this.$calcMobile();
                this.$scrollMobile(QUI.getScroll().y);

                QUI.addEvent('scroll', function () {
                    self.$scrollMobile(QUI.getScroll().y)
                });

                this.brick.removeClass('hideOnResize');

                return;
            }

            this.mobile = false;
            this.offset = 0;

            this.$calc();
            this.$scroll(QUI.getScroll().y);

            QUI.addEvent('scroll', function () {
                self.$scroll(QUI.getScroll().y)
            });

            this.brick.removeClass('hideOnResize');

        },

        /**
         * calc the break points of all containers
         */
        $calc: function () {
            this.firstPoint  = this.brick.getPosition().y;
            this.entryHeight = this.sections[0].getSize().y;
            this.lastPoint   = this.firstPoint + (this.entryHeight * (this.sections.length - 1));
            var dot          = 0,
                imgSize      = this.imageContainer.getElement('img').getSize().y,
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

        /**
         * calc the break points of all containers (mobile)
         */
        $calcMobile: function () {
            this.firstPoint  = this.brick.getPosition().y;
            this.entryHeight = this.sections[0].getSize().y;
            this.lastPoint   = this.firstPoint + this.brick.getSize().y - this.sections[this.sections.length - 1].getSize().y;
            var dot          = 0,
                imgSize      = this.imageContainer.getElement('img').getSize().y,
                imgPos       = 0;


            this.sections.each(function (entry) {
                // change img when the next section is
                var point = entry.getPosition().y - Math.round(QUI.getWindowSize().y / 2 * 1.5);

                this.List[point] = {
                    img: imgPos,
                    dot: this.dots[dot]
                };

                dot++;
                imgPos = imgPos + imgSize;

                this.PointsList.push(point);
            }.bind(this));

            this.PointsList.push(this.lastPoint);


            // lastPointMobile nötig, weil der rechte Bereich oben ein Margin von 50vh hat
            this.lastPointMobile   = this.firstPoint + this.brick.getSize().y - this.sections[this.sections.length - 1].getSize().y - Math.round(window.getSize().y / 2) - 50;
            this.imageContainerPos = this.brick.getSize().y - this.sections[this.sections.length - 1].getSize().y - Math.round(window.getSize().y / 2) - 50;
            this.winPos            = QUI.getScroll().y;

            // wenn Window weiter gescrollt als der Brick ist,
            // dann dem mobilen Wrapper folgende CSS Eigenschaften hinzufügen
            if (this.winPos > this.lastPointMobile) {
                this.mobileWrapper.setStyles({
                    position: 'relative',
                    top     : this.imageContainerPos
                })
            }

        },

        /**
         * scroll event (desktop)
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

                            this.pos = this.PointsList[i];
                            var top  = this.List[this.PointsList[i]].img;

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
         * scroll event (mobile
         */
        $scrollMobile: function (scroll) {

            if (scroll >= this.firstPoint && scroll <= this.lastPointMobile) {

                if (!this.vNavVisible) {
                    this.showVNav();
                }

                if (!this.imagesFixed) {
                    this.setImagesFixed();
                }

                for (var i = 0; i < this.PointsList.length; i++) {
                    if (scroll > this.PointsList[i] && scroll < this.PointsList[i + 1]) {

                        if (this.pos != this.PointsList[i]) {

                            this.pos = this.PointsList[i];
                            var top  = this.List[this.PointsList[i]].img;

                            this.changeDotsFocus(this.List[this.PointsList[i]].dot);

                            // scroll the screen to the new position
                            this.imageContainer.setStyle('top', -top);
                        }
                    }
                }
                return;
            }

            if (this.imagesFixed) {
                if (scroll > this.lastPointMobile) {
                    this.mobileWrapper.setStyle('top', this.imageContainerPos);
                    this.left.setStyle('top', this.containerPos);
                } else {
                    this.mobileWrapper.setStyle('top', 0);
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

                // desktop
                this.mockUp.setStyle('position', 'fixed');
                this.mobileWrapper.setStyle('position', '');
                this.leftWrapper.setStyle('position', 'fixed');

            } else {

                // mobile
                this.mockUp.setStyle('position', '');
                this.mobileWrapper.setStyles({
                    position: 'fixed',
                    top     : 0
                });
                this.leftWrapper.setStyle('position', '');
                this.entryContainer.setStyle('margin-top', '50vh');
            }

            this.imagesFixed = true;
        },

        /**
         * set images position to absolute
         * (on mobile -> relative)
         */
        setImagesAbsolute: function () {

            if (!this.mobile) {

                // desktop
                this.mockUp.setStyle('position', 'absolute');
                this.leftWrapper.setStyle('position', 'absolute');

            } else {

                // mobile
                this.mobileWrapper.setStyle('position', 'relative');
                this.entryContainer.setStyle('margin-top', 0);
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
