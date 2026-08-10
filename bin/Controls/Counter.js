/**
 * Counter frontend control
 *
 * @module package/quiqqer/presentation-bricks/bin/Controls/Counter
 */
define('package/quiqqer/presentation-bricks/bin/Controls/Counter', [
    'qui/controls/Control'
], function (QUIControl) {
    "use strict";

    return new Class({
        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/Counter',

        Binds: [
            '$onImport',
            '$start'
        ],

        options: {
            duration: 2500,
            smartEasingThreshold: 999,
            smartEasingAmount: 333
        },

        initialize: function (options) {
            this.parent(options);

            this.$started = false;
            this.$animations = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        $onImport: function () {
            if (!('IntersectionObserver' in window)) {
                this.$start();
                return;
            }

            var Observer = new IntersectionObserver(function (entries) {
                if (!entries.length || !entries[0].isIntersecting) {
                    return;
                }

                Observer.disconnect();
                this.$start();
            }.bind(this), {
                threshold: 0.25
            });

            Observer.observe(this.$Elm);
        },

        $start: function () {
            if (this.$started) {
                return;
            }

            this.$started = true;

            var duration = parseInt(this.$Elm.getAttribute('data-counter-duration'), 10);

            if (!duration || duration < 0) {
                duration = this.options.duration;
            }

            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                duration = 0;
            }

            this.$Elm.getElements('.quiqqer-presentationBricks-counter__number').each(function (NumberElm) {
                this.$animateNumber(NumberElm, duration);
            }.bind(this));
        },

        $animateNumber: function (NumberElm, duration) {
            var startValue = this.$parseNumber(NumberElm.getAttribute('data-start-value'));
            var endValue = this.$parseNumber(NumberElm.getAttribute('data-end-value'));
            var decimalPlaces = this.$getDecimalPlaces(startValue, endValue);
            var animation;

            if (startValue === endValue || duration === 0) {
                NumberElm.set('html', this.$formatNumber(endValue));
                return;
            }

            animation = {
                element: NumberElm,
                startVal: startValue,
                endVal: endValue,
                frameVal: startValue,
                decimalPlaces: decimalPlaces,
                duration: duration,
                remaining: duration,
                startTime: null,
                countDown: startValue > endValue,
                useEasing: true,
                finalEndVal: null
            };

            this.$determineDirectionAndSmartEasing(animation);
            requestAnimationFrame(this.$renderAnimation.bind(this, animation));
        },

        $renderAnimation: function (animation, timestamp) {
            var progress;
            var wentPast;

            if (!animation.startTime) {
                animation.startTime = timestamp;
            }

            progress = timestamp - animation.startTime;
            animation.remaining = animation.duration - progress;

            if (animation.useEasing) {
                if (animation.countDown) {
                    animation.frameVal = animation.startVal - this.$easeOutExpo(
                        progress,
                        0,
                        animation.startVal - animation.endVal,
                        animation.duration
                    );
                } else {
                    animation.frameVal = this.$easeOutExpo(
                        progress,
                        animation.startVal,
                        animation.endVal - animation.startVal,
                        animation.duration
                    );
                }
            } else {
                animation.frameVal = animation.startVal + (
                    (animation.endVal - animation.startVal) * (progress / animation.duration)
                );
            }

            wentPast = animation.countDown
                ? animation.frameVal < animation.endVal
                : animation.frameVal > animation.endVal;

            animation.frameVal = wentPast ? animation.endVal : animation.frameVal;
            animation.frameVal = Number(animation.frameVal.toFixed(animation.decimalPlaces));

            animation.element.set(
                'html',
                this.$formatNumber(animation.frameVal, animation.startVal, animation.finalEndVal || animation.endVal)
            );

            if (progress < animation.duration) {
                requestAnimationFrame(this.$renderAnimation.bind(this, animation));
                return;
            }

            if (animation.finalEndVal !== null) {
                this.$updateAnimation(animation, animation.finalEndVal);
                return;
            }

            animation.element.set('html', this.$formatNumber(animation.endVal));
        },

        $updateAnimation: function (animation, newEndValue) {
            animation.startTime = null;
            animation.startVal = animation.frameVal;
            animation.endVal = newEndValue;
            animation.countDown = animation.startVal > animation.endVal;
            animation.finalEndVal = null;
            animation.duration = animation.remaining > 0 ? animation.remaining : this.options.duration;
            this.$determineDirectionAndSmartEasing(animation);

            requestAnimationFrame(this.$renderAnimation.bind(this, animation));
        },

        $determineDirectionAndSmartEasing: function (animation) {
            var end = animation.finalEndVal !== null ? animation.finalEndVal : animation.endVal;
            var animateAmount = end - animation.startVal;
            var up;

            animation.countDown = animation.startVal > end;

            if (
                Math.abs(animateAmount) > this.options.smartEasingThreshold &&
                animation.decimalPlaces === 0
            ) {
                animation.finalEndVal = end;
                up = animation.countDown ? 1 : -1;
                animation.endVal = end + (up * this.options.smartEasingAmount);
                animation.duration = animation.duration / 2;
                animation.useEasing = false;
                return;
            }

            animation.endVal = end;
            animation.finalEndVal = null;
            animation.useEasing = true;
        },

        $easeOutExpo: function (t, b, c, d) {
            return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
        },

        $parseNumber: function (value) {
            value = (value || '').toString().replace(',', '.');

            var number = parseFloat(value);

            return isNaN(number) ? 0 : number;
        },

        $hasDecimals: function (startValue, endValue) {
            return startValue % 1 !== 0 || endValue % 1 !== 0;
        },

        $getDecimalPlaces: function (startValue, endValue) {
            var startPlaces = this.$getNumberDecimalPlaces(startValue);
            var endPlaces = this.$getNumberDecimalPlaces(endValue);

            return Math.min(Math.max(startPlaces, endPlaces), 2);
        },

        $getNumberDecimalPlaces: function (value) {
            var normalized = value.toString();
            var parts = normalized.split('.');

            if (parts.length < 2) {
                return 0;
            }

            return parts[1].length;
        },

        $formatNumber: function (value, startValue, endValue) {
            var hasDecimals = typeof startValue !== 'undefined' && typeof endValue !== 'undefined'
                ? this.$hasDecimals(startValue, endValue)
                : value % 1 !== 0;

            if (!hasDecimals) {
                return Math.round(value).toLocaleString();
            }

            return value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        }
    });
});
