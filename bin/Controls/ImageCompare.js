/**
 * Before/after image comparison with a draggable handle.
 *
 * Drag anywhere on the surface (pointer events: mouse + touch), tap to jump
 * (animated), operate with the arrow keys. The visual state is driven by the
 * CSS custom property "--_pos"; without JS the PHP-rendered start position
 * already shows a correct static split.
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/ImageCompare
 */
define('package/quiqqer/presentation-bricks/bin/Controls/ImageCompare', [

    'qui/controls/Control'

], function (QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/ImageCompare',

        Binds: [
            '$onImport',
            '$onPointerDown',
            '$onPointerMove',
            '$onPointerUp',
            '$onKeyDown',
            '$observeViewport',
            '$playIntro',
            '$revealWhenLoaded'
        ],

        options: {
            orientation   : 'horizontal',
            startposition : 50,
            srbefore      : '',
            srafter       : '',
            introanimation: 1
        },

        initialize: function (options) {
            this.parent(options);

            this.$Frame   = null;
            this.$Handle  = null;
            this.$pos     = 50;
            this.$moved   = false;
            this.$pointerId = null;
            this.$startX  = 0;
            this.$startY  = 0;
            this.$introPlayed = false;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm = this.getElm();

            this.$Frame  = Elm.querySelector('.quiqqer-presentationBricks-imageCompare__frame');
            this.$Handle = Elm.querySelector('.quiqqer-presentationBricks-imageCompare__handle');

            if (!this.$Frame || !this.$Handle) {
                return;
            }

            this.$revealWhenLoaded();

            this.$pos = this.$clamp(parseFloat(this.getAttribute('startposition')));

            this.$Frame.addEventListener('pointerdown', this.$onPointerDown);
            this.$Handle.addEventListener('keydown', this.$onKeyDown);

            const reduceMotion = window.matchMedia
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (parseInt(this.getAttribute('introanimation'), 10) === 1 && !reduceMotion) {
                this.$observeViewport();
            }
        },

        /**
         * Play the intro animation once the control scrolls into view.
         */
        $observeViewport: function () {
            if (!('IntersectionObserver' in window)) {
                this.$playIntro();
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.$playIntro();
                        observer.disconnect();
                    }
                });
            }, {threshold: 0.35});

            observer.observe(this.getElm());
        },

        /**
         * A short hint animation: nudge the handle to both sides and back to
         * the start position, so visitors notice it is interactive.
         */
        $playIntro: function () {
            if (this.$introPlayed) {
                return;
            }

            this.$introPlayed = true;

            const Elm   = this.getElm();
            const start = this.$pos;

            // a fixed pixel nudge (converted to % of the current dimension) so
            // the visible motion stays consistent on desktop and mobile,
            // instead of scaling with the container width
            const nudgePx   = 40;
            const rect      = this.$Frame.getBoundingClientRect();
            const dimension = this.getAttribute('orientation') === 'vertical'
                ? rect.height
                : rect.width;
            const offset = dimension ? (nudgePx / dimension) * 100 : 6;

            const left  = this.$clamp(start - offset);
            const right = this.$clamp(start + offset);

            Elm.classList.add('is-intro');
            this.$setPosition(left);

            window.setTimeout(() => this.$setPosition(right), 500);
            window.setTimeout(() => this.$setPosition(start), 1000);
            window.setTimeout(() => Elm.classList.remove('is-intro'), 1500);
        },

        /**
         * Keep the frame hidden until both images are loaded, so the base
         * image never flashes fully before the overlay arrives. If both are
         * already loaded (e.g. from cache), nothing is gated.
         */
        $revealWhenLoaded: function () {
            const Elm = this.getElm();
            const images = Array.from(this.$Frame.querySelectorAll('img'));

            const pending = images.filter((img) => {
                return !(img.complete && img.naturalWidth > 0);
            });

            if (!pending.length) {
                return;
            }

            Elm.classList.add('is-loading');

            let remaining = pending.length;

            const done = () => {
                remaining--;

                if (remaining <= 0) {
                    Elm.classList.remove('is-loading');
                }
            };

            pending.forEach((img) => {
                img.addEventListener('load', done, {once: true});
                img.addEventListener('error', done, {once: true});
            });

            // safety net so the frame is never left hidden
            window.setTimeout(() => Elm.classList.remove('is-loading'), 3000);
        },

        /**
         * Clamp a value to the 0..100 range.
         *
         * @param {number} value
         * @return {number}
         */
        $clamp: function (value) {
            if (isNaN(value)) {
                return 50;
            }

            return Math.max(0, Math.min(100, value));
        },

        /**
         * Position in percent derived from a pointer event.
         *
         * @param {PointerEvent} event
         * @return {number}
         */
        $posFromEvent: function (event) {
            const rect = this.$Frame.getBoundingClientRect();

            let value;

            if (this.getAttribute('orientation') === 'vertical') {
                value = rect.height ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
            } else {
                value = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
            }

            return this.$clamp(value);
        },

        /**
         * Apply a new position to the DOM and ARIA state.
         *
         * @param {number} pos
         */
        $setPosition: function (pos) {
            this.$pos = this.$clamp(pos);

            const rounded = Math.round(this.$pos);

            this.getElm().style.setProperty('--_pos', this.$pos + '%');
            this.$Handle.setAttribute('aria-valuenow', rounded);
            this.$Handle.setAttribute('aria-valuetext', rounded + ' % ' + this.getAttribute('srbefore'));
        },

        $onPointerDown: function (event) {
            event.preventDefault();

            this.$pointerId = event.pointerId;
            this.$moved     = false;
            this.$startX    = event.clientX;
            this.$startY    = event.clientY;

            this.$Frame.setPointerCapture(event.pointerId);
            this.$Frame.addEventListener('pointermove', this.$onPointerMove);
            this.$Frame.addEventListener('pointerup', this.$onPointerUp);
            this.$Frame.addEventListener('pointercancel', this.$onPointerUp);
        },

        $onPointerMove: function (event) {
            if (event.pointerId !== this.$pointerId) {
                return;
            }

            if (!this.$moved) {
                const dx = Math.abs(event.clientX - this.$startX);
                const dy = Math.abs(event.clientY - this.$startY);

                if (dx < 3 && dy < 3) {
                    return;
                }

                // a real drag: switch off the transition for live following
                this.$moved = true;
                this.getElm().classList.add('is-dragging');
            }

            this.$setPosition(this.$posFromEvent(event));
        },

        $onPointerUp: function (event) {
            if (event.pointerId !== this.$pointerId) {
                return;
            }

            // a tap without dragging jumps to the position, animated (no
            // is-dragging class), because the transition stays active here
            if (!this.$moved) {
                this.$setPosition(this.$posFromEvent(event));
            }

            this.getElm().classList.remove('is-dragging');

            if (this.$Frame.hasPointerCapture(event.pointerId)) {
                this.$Frame.releasePointerCapture(event.pointerId);
            }

            this.$Frame.removeEventListener('pointermove', this.$onPointerMove);
            this.$Frame.removeEventListener('pointerup', this.$onPointerUp);
            this.$Frame.removeEventListener('pointercancel', this.$onPointerUp);

            this.$pointerId = null;
            this.$Handle.focus();
        },

        $onKeyDown: function (event) {
            const isVertical = this.getAttribute('orientation') === 'vertical';
            const step = event.shiftKey ? 10 : 1;

            let pos = this.$pos;

            switch (event.key) {
                case 'ArrowLeft':
                    if (isVertical) {
                        return;
                    }
                    pos -= step;
                    break;

                case 'ArrowRight':
                    if (isVertical) {
                        return;
                    }
                    pos += step;
                    break;

                case 'ArrowUp':
                    if (!isVertical) {
                        return;
                    }
                    pos -= step;
                    break;

                case 'ArrowDown':
                    if (!isVertical) {
                        return;
                    }
                    pos += step;
                    break;

                case 'PageUp':
                    pos += 10;
                    break;

                case 'PageDown':
                    pos -= 10;
                    break;

                case 'Home':
                    pos = 0;
                    break;

                case 'End':
                    pos = 100;
                    break;

                default:
                    return;
            }

            event.preventDefault();
            this.$setPosition(pos);
        }
    });
});
