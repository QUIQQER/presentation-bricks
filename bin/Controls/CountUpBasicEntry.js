/**
 * QUIQQER Count Up Basic
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\CountUpBasic
 */
define('package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicEntry', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicEntry',

        Binds: [
            '$onImport',
            '$count',
            '$scroll'
        ],

        options: {
            duration    : 1000,
            speed       : 50,
            delay       : 500,
            asynchronous: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$counter = null;
            this.start = null;
            this.end = null;
            this.countValue = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            this.$counter = this.$Elm.getElement('.countUpBasic-entry-header-number-counter');

            this.start = this.$counter.get('html').toInt();
            this.end = this.$counter.getAttribute('data-qui-count').toInt();
            this.countValue = this.start;

            var winSize = QUI.getWindowSize().y;
            var controlPos = this.$counter.getPosition().y;
            this.breakPoint = controlPos - (winSize / 1.25);
            this.$isAnimating = false;

            if (QUI.getScroll().y > this.breakPoint) {
                this.$prepareCount();
            }

            QUI.addEvent('scrollEnd', this.$scroll);
        },

        $scroll: function () {
            if (this.$isAnimating) {
                QUI.removeEvent('scrollEnd', this.$scroll);
                return;
            }

            if (QUI.getScroll().y > this.breakPoint) {
                this.$prepareCount();
            }
        },

        $prepareCount: function () {
            this.$isAnimating = true;

            var step = Math.ceil(this.end / (this.options.duration / this.options.speed));
            this.$count(step);
        },

        $count: function (step) {
            var self = this;

            (function () {
                moofx.requestFrame(function () {
                    self.$counter.set('html', self.countValue);
                    self.countValue += step;

                    if (self.countValue > self.end) {
                        self.$counter.set('html', self.end);
                        return;
                    }

                    self.$count(step);
                }.bind(self));
            }).delay(self.options.speed);
        }
    });
});
