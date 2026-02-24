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
            /**
             * Duration of the count-up animation in milliseconds
             * @type {number}
             */
            duration: 2000,
            /**
             * Delay before the animation starts (ms)
             * @type {number}
             */
            delay: 1500
        },

        initialize: function (options) {
            this.parent(options);

            this.$counter = null;
            this.start = null;
            this.end = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        $onImport: function () {
            this.$counter = this.$Elm.getElement('.countUpBasic-entry-header-number-counter');

            this.start = this.$counter.get('html').toInt();
            this.end = this.$counter.getAttribute('data-qui-count').toInt();

            const winSize = QUI.getWindowSize().y;
            const controlPos = this.$counter.getPosition().y;
            this.breakPoint = controlPos - (winSize / 1.3);
            this.$isAnimating = false;

            if (QUI.getScroll().y > this.breakPoint) {
                this.$prepareCount();
            }

            QUI.addEvent('scroll', this.$scroll);
        },

        /**
         * Scroll event handler: Starts animation when breakpoint is passed
         */
        $scroll: function () {
            if (this.$isAnimating) {
                QUI.removeEvent('scroll', this.$scroll);
                return;
            }

            if (QUI.getScroll().y > this.breakPoint) {
                this.$prepareCount();
            }
        },

        /**
         * Prepares and starts the count-up animation
         */
        $prepareCount: function () {
            this.$isAnimating = true;
            this.$count();
        },

        /**
         * Animates the count-up using easing and requestAnimationFrame
         */
        $count: function () {
            const counterElm = this.$counter;
            const startValue = this.start;
            const endValue = this.end;
            const duration = this.options.duration;
            const startTime = performance.now();

            /**
             * Easing function: easeOutQuad
             * @param {number} t - Progress from 0 to 1
             */
            function easeOutQuad(t) {
                return t * (2 - t);
            }

            /**
             * Animation step
             * @param {number} now - Current timestamp
             */
            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuad(progress);
                const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);

                counterElm.set('html', currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counterElm.set('html', endValue);
                }
            }

            requestAnimationFrame(animate);
        }
    });
});
