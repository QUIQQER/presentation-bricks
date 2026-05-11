/**
 * QUIQQER Count Up Basic
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\CountUpBasic
 */
define('package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicEntry', [

    'qui/controls/Control'

], function (QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicEntry',

        Binds: [
            '$onImport',
            '$count'
        ],

        options: {
            /**
             * Duration of the count-up animation in milliseconds
             * @type {number}
             */
            duration: 2500
        },

        initialize: function (options) {
            this.parent(options);

            this.$counter = null;
            this.$observer = null;
            this.$hasAnimated = false;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        $onImport: function () {
            this.$counter = this.$Elm.getElement(
                '.quiqqer-presentationBricks-countUpBasic-control__counter'
            );

            if (!this.$counter) {
                return;
            }

            if (!('IntersectionObserver' in window)) {
                this.$count();
                return;
            }

            this.$observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting || this.$hasAnimated) {
                        return;
                    }

                    this.$count();
                    this.$observer.disconnect();
                }.bind(this));
            }.bind(this), {
                rootMargin: '0px 0px -20% 0px',
                threshold : 0.35
            });

            this.$observer.observe(this.$Elm);
        },

        /**
         * Animates the count-up using easing and requestAnimationFrame
         */
        $count: function () {
            if (!this.$counter || this.$hasAnimated) {
                return;
            }

            this.$hasAnimated = true;

            const counterElm = this.$counter;
            const startValue = 0;
            const endValue = Number(counterElm.getAttribute('data-qui-count')) || 0;
            const duration = this.options.duration;
            const startTime = performance.now();
            const formatValue = function (value) {
                return value.toLocaleString();
            };

            /**
             * Easing function: easeOutExpo
             * @param {number} t - Progress from 0 to 1
             */
            function easeOutExpo(t) {
                if (t === 1) {
                    return 1;
                }

                return 1 - Math.pow(2, -10 * t);
            }

            /**
             * Animation step
             * @param {number} now - Current timestamp
             */
            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);
                const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);

                counterElm.set('html', formatValue(currentValue));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counterElm.set('html', formatValue(endValue));
                }
            }

            requestAnimationFrame(animate);
        }
    });
});
