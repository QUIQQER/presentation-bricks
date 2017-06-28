/**
 * QUIQQER Sticky Content
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\StickyContent
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/presentation-bricks/bin/Controls/StickyContent', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctions) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/StickyContent',

        Binds: [
            '$onImport',
            '$calc',
            '$resize',
            '$scroll',
            '$changeImg',
            'showImage',
            'hideImages',
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

            this.brick       = null;
            this.sections    = null;
            this.firstPoint  = null;
            this.lastPoint   = null;
            this.entryHeight = null;
            this.imagesFixed = false;
            this.pos         = 0;
            this.winPos      = null;
            this.scrollDown  = true;

            this.List       = null;
            this.PointsList = null;

            this.vNav        = null;
            this.dots        = null;
            this.activeDot   = null;
            this.vNavVisible = false;
        },

        /**
         * event: on import
         */
        $onImport: function () {

            this.brick    = document.getElement('.qui-control-stickyContent');
            this.sections = this.brick.getElements('.qui-control-stickyContent-entry');

            this.List       = [];
            this.PointsList = [];

            this.vNav = this.brick.getElement('.qui-control-stickyContent-vNav');
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
            // mobile?
            /*if (window.getSize().x < 768) {
             return;
             }*/

            this.$calc();
            this.$scroll(QUI.getScroll().y);
        },

        /**
         * calc the point of all containers
         */
        $calc: function () {
            this.firstPoint  = this.sections[0].getPosition().y;
            this.entryHeight = this.sections[0].getSize().y;
            this.lastPoint   = this.firstPoint + (this.entryHeight * (this.sections.length - 1));
            var dot          = 0;

            this.sections.each(function (entry) {
                var point = entry.getPosition().y - Math.round((this.entryHeight / 2)), // change img when half of next the next section is visible
                    image = entry.getElement('img');

                this.List[point] = {
                    img: image,
                    dot: this.dots[dot]
                };

                dot++;
                this.PointsList.push(point);
            }.bind(this));

            this.PointsList.push(this.lastPoint);

            this.winPos = QUI.getScroll().y;
            this.hideImages();

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

                            // scroll up
                            this.scrollDown = true;
                            if (scroll < this.winPos) {
                                this.scrollDown = false;
                            }

                            this.winPos = scroll;
                            this.pos    = this.PointsList[i];
                            this.$changeImg(this.List[this.pos].img, this.List[this.pos].dot);
                        }
                    }
                }
                return;
            }

            if (this.imagesFixed) {
                this.setImagesAbsolute();
            }

            if (this.vNavVisible) {
                this.hideVNav();
            }
        },

        /**
         * change images
         *
         * @param currentImage
         */
        $changeImg: function (currentImage, currentDot) {

            this.hideImages();
            this.showImage(currentImage);
            this.changeDotsFocus(currentDot);
        },

        /**
         * show image
         *
         * @param currentImage DOM
         */
        showImage: function (currentImage) {

            currentImage.removeProperty('class');
            if (this.scrollDown) {
                currentImage.addClass('fadeInUp');
                return;
            }
            currentImage.addClass('fadeInDown');

            /*currentImage.setStyles({
             opacity: 1,
             top    : '50%'
             });*/

        },

        /**
         * hide all images
         */
        hideImages: function () {

            if (this.scrollDown) {
                this.List.each(function (Elm) {
                    Elm.img.addClass('fadeOutUp');
                });
                return;
            }

            this.List.each(function (Elm) {
                Elm.img.addClass('fadeOutDown');
            });


            /*this.List.each(function (Elm) {
             Elm.img.setStyles({
             opacity: 0,
             top    : '30%'
             })
             })*/
        },

        /**
         * set images position to fixed
         */
        setImagesFixed: function () {
            this.List.each(function (Elm) {
                Elm.img.setStyle('position', 'fixed')
            });

            this.imagesFixed = true;

        },

        /**
         * set images position to absolute and show all
         */
        setImagesAbsolute: function () {
            this.List.each(function (Elm) {
                Elm.img.setStyle('position', 'absolute');
            });

            this.imagesFixed = false;
        },

        changeDotsFocus: function (activeDot) {
            this.dots.each(function (Elm) {
                Elm.removeClass('control-background circle-icon-active');
            });
            activeDot.addClass('control-background circle-icon-active');
        },

        showVNav: function () {
            this.vNav.setStyles({
                opacity   : 1,
                visibility: 'visible'
            });

            this.vNavVisible = true;
        },

        hideVNav: function () {
            this.vNav.setStyles({
                opacity   : 0,
                visibility: 'hidden'
            });

            this.vNavVisible = false;
        }
    });
});
