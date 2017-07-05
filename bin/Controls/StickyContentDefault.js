/**
 * QUIQQER Sticky Content - Template Default
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\StickyContentDefault
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/presentation-bricks/bin/Controls/StickyContentDefault', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Functions'

], function (QUI, QUIControl, QUIFunctions) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/StickyContent/Default',

        Binds: [
            '$onImport',
            '$calc',
            '$calcMobile',
            '$resize',
            '$scroll',
            '$changeImg',
            'showImage',
            'hideImages',
            'showImageMobile',
            'hideImagesMobile',
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
            // this.hideImages();

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

        $calcMobile: function () {
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
            // this.hideImages();


            /*var container = document.getElement('body');

             this.PointsList.each(function (Elm) {
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

                            this.winPos = scroll; // to determinate scroll direction
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
         * change images and call a function to change the focus on vertical nav
         *
         * @param currentImage DOM
         * @param currentDot DOM
         */
        $changeImg: function (currentImage, currentDot) {
            if (this.mobile) {
                this.hideImagesMobile();
                this.showImageMobile(currentImage);
                this.changeDotsFocus(currentDot);
                return;
            }
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

        },

        /**
         * show image (mobile)
         *
         * @param currentImage DOM
         */
        showImageMobile: function (currentImage) {

            currentImage.removeProperty('class');

            if (this.scrollDown) {
                currentImage.setStyles({
                    opacity  : 1,
                    transform: 'translateY(0px)'
                });
            }

            currentImage.setStyles({
                opacity  : 1,
                transform: 'translateY(0px)'
            });

        },

        /**
         * hide all images (mobile)
         */
        hideImagesMobile: function () {

            if (this.scrollDown) {

                this.List.each(function (Elm) {
                    Elm.img.removeProperty('class');
                    Elm.img.setStyles({
                        opacity  : 0,
                        transform: 'translateY(60px)'
                    });
                });
                return;
            }
            this.List.each(function (Elm) {
                Elm.img.removeProperty('class');
                Elm.img.setStyles({
                    opacity  : 0,
                    transform: 'translateY(-60px)'
                });
            });
        },

        /**
         * set images position to fixed
         */
        setImagesFixed: function () {
            this.List.each(function (Elm) {
                Elm.img.setStyle('position', 'fixed')
            });

            this.imagesFixed = true;

        }
        ,

        /**
         * set images position to absolute and show all
         */
        setImagesAbsolute: function () {
            this.List.each(function (Elm) {
                Elm.img.setStyle('position', 'absolute');
            });

            this.imagesFixed = false;
        }
        ,

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
        }
        ,

        /**
         * show the container with the vertical nav (points)
         */
        showVNav: function () {
            this.vNav.addClass('visible');
            this.vNavVisible = true;
        }
        ,

        /**
         * show the container with the vertical nav (points)
         */
        hideVNav: function () {
            this.vNav.removeClass('visible');
            this.vNavVisible = false;
        }
    });
});
