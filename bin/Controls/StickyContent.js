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
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/StickyContent',

        Binds: [
            '$onImport',
            '$calc',
            '$resize',
            '$scroll',
            'show',
            'hide',
            'setImagesFixed',
            'setImagesAbsolute'
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

            this.List       = null;
            this.PointsList = null;

            this.vNav = null;
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
            this.dots.forEach(function (dot) {
                dot.addEvent('click', function () {
                    self.dots.forEach(function(Elm) {
                        Elm.removeClass('control-background circle-icon-active');
                    });
                    this.addClass('control-background circle-icon-active');
                    var section = self.sections[dot.getAttribute('data-qui-section')];
                    new Fx.Scroll(window).toElement(section);
                });
            });


            QUI.addEvent('resize', this.$resize);

            this.$resize();

            QUI.addEvent('scroll', function () {
                this.$scroll(QUI.getScroll().y);
            }.bind(this));
        },

        /**
         * event: on resize
         */
        $resize: function () {
            console.log("resize event");
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

            this.sections.forEach(function (entry) {
                var point = entry.getPosition().y - Math.round((this.entryHeight / 2)), // change img when half of next the next section is visible
                    image = entry.getElement('img');

                this.List[point] = image;
                this.PointsList.push(point);
            }.bind(this));

            this.PointsList.push(this.lastPoint);

        },

        /**
         * scroll event
         */
        $scroll: function (scroll) {
            if (scroll > this.firstPoint && scroll < this.lastPoint) {

                if (!this.imagesFixed) {
                    this.setImagesFixed();
                }

                for (var i = 0; i < this.PointsList.length; i++) {
                    if (scroll > this.PointsList[i] && scroll < this.PointsList[i + 1]) {
                        if (this.pos != this.PointsList[i]) {
                            this.pos = this.PointsList[i];
                            this.show(this.List[this.pos]);
                        }
                    }
                }
                return;
            }

            if (this.imagesFixed) {
                this.setImagesAbsolute();
            }
        },

        /**
         * show current image
         *
         * @param image DOM
         */
        show: function (image) {
            this.hide();
            image.setStyle('opacity', 1);
        },

        /**
         * hide all images
         */
        hide: function () {
            this.List.forEach(function (Elm) {
                Elm.setStyle('opacity', 0)
            })
        },

        /**
         * set images position to fixed
         */
        setImagesFixed: function () {
            this.List.forEach(function (Elm) {
                Elm.setStyle('position', 'fixed')
            });

            this.imagesFixed = true;

        },

        /**
         * set images position to absolute and show all
         */
        setImagesAbsolute: function () {
            this.List.forEach(function (Elm) {
                Elm.setStyle('position', 'absolute');
            });

            this.imagesFixed = false;
        }
    });
});
