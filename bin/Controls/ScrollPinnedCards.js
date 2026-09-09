/**
 * ScrollPinnedCards - pins the section while scrolling and moves the card
 * track horizontally, mapped 1:1 to the scroll progress inside the tall
 * pin wrapper.
 *
 * The pin is a progressive enhancement. It is only switched on when every
 * condition holds: a fine pointer, a desktop sized viewport, no
 * "prefers-reduced-motion" and at least two cards. In every other case the
 * PHP rendered stack of cards stays untouched.
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards
 */
define('package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards', [

    'qui/controls/Control',
    'Locale'

], function (QUIControl, QUILocale) {
    "use strict";

    const lg = 'quiqqer/presentation-bricks';
    const pinnedClass = 'quiqqer-presentationBricks-scrollPinnedCards--pinned';
    const restoringClass = 'quiqqer-presentationBricks-scrollPinnedCards--restoring';

    // The scroll position is not written to the track directly. Per 60 Hz
    // frame the track covers this share of the distance that is still missing,
    // which turns the coarse steps of a mouse wheel into a continuous
    // movement. Lower values glide longer, higher ones stick to the wheel.
    const smoothing = 0.14;
    const frameTime = 1000 / 60;

    return new Class({

        Extends: QUIControl,
        Type: 'package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards',

        Binds: [
            '$onImport',
            '$onDestroy',
            '$onScroll',
            '$onResize',
            '$onTrackResize',
            '$onFocusIn',
            '$evaluateMode',
            '$update',
            '$tick'
        ],

        options: {
            countermode: 'inline',
            countertarget: '',
            breakpoint: 1024,
            mincards: 2
        },

        initialize: function (options) {
            this.parent(options);

            this.$PinWrapper = null;
            this.$Viewport = null;
            this.$Track = null;
            this.$Counter = null;
            this.$CounterCurrent = null;
            this.$CounterLive = null;

            this.$cards = [];
            this.$distance = 0;
            this.$travel = 0;
            this.$progress = 0;
            this.$target = 0;
            this.$lastFrame = 0;
            this.$index = 0;
            this.$isPinned = false;
            this.$frame = null;
            this.$resizeFrame = null;
            this.$queries = [];
            this.$Observer = null;

            this.addEvents({
                onImport: this.$onImport,
                onDestroy: this.$onDestroy
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm = this.getElm();

            this.$PinWrapper = Elm.querySelector('[data-name="pinWrapper"]');
            this.$Viewport = Elm.querySelector('[data-name="viewport"]');
            this.$Track = Elm.querySelector('[data-name="track"]');

            if (!this.$PinWrapper || !this.$Viewport || !this.$Track) {
                return;
            }

            this.$cards = Array.from(Elm.querySelectorAll('[data-name="card"]'));

            this.$setupCounter();
            this.$watchMediaQueries();

            window.addEventListener('resize', this.$onResize);

            this.$evaluateMode();

            // whatever the mode turned out to be, the presentation is final
            // now - the inline script may have held the track back until here
            this.getElm().classList.remove(restoringClass);
        },

        /**
         * event : on destroy
         */
        $onDestroy: function () {
            this.$disablePin();
            window.removeEventListener('resize', this.$onResize);

            if (this.$resizeFrame) {
                window.cancelAnimationFrame(this.$resizeFrame);
                this.$resizeFrame = null;
            }

            this.$queries.forEach(function (entry) {
                if (entry.Query.removeEventListener) {
                    entry.Query.removeEventListener('change', entry.listener);
                    return;
                }

                entry.Query.removeListener(entry.listener);
            });

            this.$queries = [];
        },

        /**
         * Resolve the counter elements and move the counter into the custom
         * container when one is configured. A missing container falls back to
         * the built in position - the counter must never disappear silently.
         */
        $setupCounter: function () {
            const Elm = this.getElm();

            this.$Counter = Elm.querySelector('[data-name="counter"]');

            if (!this.$Counter) {
                return;
            }

            this.$CounterCurrent = this.$Counter.querySelector('[data-name="counterCurrent"]');
            this.$CounterLive = this.$Counter.querySelector('[data-name="counterLive"]');

            if (this.getAttribute('countermode') !== 'custom') {
                return;
            }

            const target = (this.getAttribute('countertarget') || '').toString().trim();
            const Target = target === ''
                ? null
                : Elm.querySelector('[data-name="' + this.$escapeSelectorValue(target) + '"]');

            if (!Target) {
                console.warn(
                    'ScrollPinnedCards: no container with data-name="' + target + '" found in the brick content,'
                    + ' the counter stays at its built in position.'
                );

                return;
            }

            Target.appendChild(this.$Counter);
        },

        /**
         * Register the media queries that decide whether the pin may run.
         */
        $watchMediaQueries: function () {
            if (!window.matchMedia) {
                return;
            }

            [
                '(pointer: fine)',
                '(min-width: ' + parseInt(this.getAttribute('breakpoint'), 10) + 'px)',
                '(prefers-reduced-motion: reduce)'
            ].forEach(function (query) {
                const Query = window.matchMedia(query);
                const listener = this.$evaluateMode;

                if (Query.addEventListener) {
                    Query.addEventListener('change', listener);
                } else {
                    Query.addListener(listener);
                }

                this.$queries.push({
                    Query: Query,
                    listener: listener
                });
            }.bind(this));
        },

        /**
         * Switch between the pinned and the stacked presentation.
         */
        $evaluateMode: function () {
            if (!this.$mayPin()) {
                this.$disablePin();
                return;
            }

            this.$enablePin();

            // Only now, with the pinned layout applied, can the decisive
            // question be answered: does the content survive this screen?
            if (!this.$cardsFit()) {
                this.$disablePin();
            }
        },

        /**
         * A pinned card must not scroll on its own - an inner scroll container
         * would swallow the wheel events the pin lives on. So when a card is
         * taller than the pinned screen, the stacked presentation is the
         * honest answer instead of silently cutting the content off.
         *
         * @return {boolean}
         */
        $cardsFit: function () {
            return !this.$cards.some(function (Card) {
                return Card.scrollHeight > Card.clientHeight + 1;
            });
        },

        /**
         * @return {boolean}
         */
        $mayPin: function () {
            if (this.$cards.length < parseInt(this.getAttribute('mincards'), 10)) {
                return false;
            }

            if (!window.matchMedia) {
                return false;
            }

            if (!window.matchMedia('(pointer: fine)').matches) {
                return false;
            }

            if (!window.matchMedia('(min-width: ' + parseInt(this.getAttribute('breakpoint'), 10) + 'px)').matches) {
                return false;
            }

            return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        $enablePin: function () {
            if (this.$isPinned) {
                this.$measure();
                this.$update();
                return;
            }

            this.$isPinned = true;
            this.getElm().classList.add(pinnedClass);

            if (this.$Counter) {
                this.$Counter.removeAttribute('hidden');
            }

            window.addEventListener('scroll', this.$onScroll, {passive: true});
            this.$Track.addEventListener('focusin', this.$onFocusIn);

            if ('ResizeObserver' in window) {
                this.$Observer = new ResizeObserver(this.$onTrackResize);
                this.$Observer.observe(this.$Track);
            }

            this.$measure();
            this.$update();
        },

        $disablePin: function () {
            /*
             * The class is not owned by this control alone: the inline script
             * in the brick markup already sets it while the document is
             * parsed, so that a desktop paints the pinned presentation right
             * away. Dropping it must therefore happen before the $isPinned
             * guard - on a device that never pins, this method is the only
             * thing that takes the class off again.
             */
            this.getElm().classList.remove(pinnedClass);

            if (!this.$isPinned) {
                return;
            }

            this.$isPinned = false;

            if (this.$Counter) {
                this.$Counter.setAttribute('hidden', 'hidden');
            }

            window.removeEventListener('scroll', this.$onScroll);
            this.$Track.removeEventListener('focusin', this.$onFocusIn);

            if (this.$Observer) {
                this.$Observer.disconnect();
                this.$Observer = null;
            }

            if (this.$frame) {
                window.cancelAnimationFrame(this.$frame);
                this.$frame = null;
            }

            this.$progress = 0;
            this.$target = 0;
            this.$Track.style.transform = '';
        },

        /**
         * Scrolling only moves the target. The visible track eases towards it
         * in $tick, so the page keeps its native scroll behaviour while the
         * cards glide.
         */
        $onScroll: function () {
            this.$target = this.$getProgress();

            if (this.$frame) {
                return;
            }

            this.$lastFrame = 0;
            this.$frame = window.requestAnimationFrame(this.$tick);
        },

        /**
         * One easing step towards the target. The factor is derived from the
         * elapsed time, so the track settles after the same duration on a
         * 60 Hz and on a 120 Hz screen.
         *
         * @param {number} now - timestamp handed over by requestAnimationFrame
         */
        $tick: function (now) {
            this.$frame = null;

            if (!this.$isPinned) {
                return;
            }

            const elapsed = this.$lastFrame ? Math.min(now - this.$lastFrame, 4 * frameTime) : frameTime;
            const missing = this.$target - this.$progress;

            this.$lastFrame = now;

            // Below a fraction of a pixel the easing produces work, not
            // movement - so it ends on the exact target instead of creeping
            // towards it forever.
            if (Math.abs(missing) * this.$distance < 0.1) {
                this.$progress = this.$target;
                this.$apply();
                return;
            }

            this.$progress += missing * (1 - Math.pow(1 - smoothing, elapsed / frameTime));
            this.$apply();

            this.$frame = window.requestAnimationFrame(this.$tick);
        },

        /**
         * A changed window can flip every gate condition, so the whole mode is
         * re-evaluated. The track observer below only re-measures, which keeps
         * the class toggling out of the observer and avoids a feedback loop.
         */
        $onResize: function () {
            if (this.$resizeFrame) {
                return;
            }

            this.$resizeFrame = window.requestAnimationFrame(function () {
                this.$resizeFrame = null;
                this.$evaluateMode();
            }.bind(this));
        },

        $onTrackResize: function () {
            this.$measure();
            this.$update();
        },

        /**
         * Keyboard users tab through the cards while the section is pinned.
         * The browser cannot scroll a transformed track into view, so the page
         * is scrolled to the position at which the focused card is the active
         * one.
         *
         * @param {FocusEvent} event
         */
        $onFocusIn: function (event) {
            if (!this.$isPinned || this.$cards.length < 2) {
                return;
            }

            const index = this.$cards.findIndex(function (Card) {
                return Card.contains(event.target);
            });

            if (index < 0 || index === this.$index) {
                return;
            }

            if (this.$travel <= 0) {
                return;
            }

            const top = this.$PinWrapper.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: top + this.$travel * (index / (this.$cards.length - 1)),
                behavior: 'auto'
            });
        },

        /**
         * Horizontal travel of the track: the offset between the first and the
         * last card. Reading it from the DOM keeps card width, gap and track
         * padding in the CSS. The vertical travel of the pin is cached here as
         * well, it only changes with the layout.
         */
        $measure: function () {
            const last = this.$cards.length - 1;

            this.$distance = last > 0
                ? this.$cards[last].offsetLeft - this.$cards[0].offsetLeft
                : 0;

            this.$travel = this.$PinWrapper.offsetHeight - this.$Viewport.offsetHeight;
        },

        /**
         * Scroll progress inside the pin wrapper: 0 on the first, 1 on the
         * last card.
         *
         * @return {number}
         */
        $getProgress: function () {
            if (this.$travel <= 0) {
                return 0;
            }

            const scrolled = -this.$PinWrapper.getBoundingClientRect().top;

            return Math.min(Math.max(scrolled / this.$travel, 0), 1);
        },

        /**
         * Write the current progress to the track offset and to the active
         * card index.
         */
        $apply: function () {
            this.$Track.style.transform = 'translate3d(' + (-this.$progress * this.$distance) + 'px, 0, 0)';

            this.$setIndex(Math.round(this.$progress * (this.$cards.length - 1)));
        },

        /**
         * Jump to the current scroll position without easing. Used after every
         * layout change - easing a corrected measurement would read as a
         * glitch, not as motion.
         */
        $update: function () {
            if (!this.$isPinned) {
                return;
            }

            if (this.$frame) {
                window.cancelAnimationFrame(this.$frame);
                this.$frame = null;
            }

            this.$target = this.$getProgress();
            this.$progress = this.$target;

            this.$apply();
        },

        /**
         * @param {number} index - zero based index of the active card
         */
        $setIndex: function (index) {
            if (index === this.$index) {
                return;
            }

            this.$index = index;

            if (!this.$CounterCurrent) {
                return;
            }

            const current = index + 1;

            this.$CounterCurrent.textContent = this.$formatNumber(current);

            if (this.$CounterLive) {
                this.$CounterLive.textContent = QUILocale.get(lg, 'control.ScrollPinnedCards.counter.label', {
                    current: current,
                    total: this.$cards.length
                });
            }
        },

        /**
         * @param {number} value
         * @return {string} - two digit number, 1 becomes "01"
         */
        $formatNumber: function (value) {
            return value < 10 ? '0' + value : '' + value;
        },

        /**
         * The container name comes from editor content, so it is reduced to
         * characters that are safe inside an attribute selector.
         *
         * @param {string} value
         * @return {string}
         */
        $escapeSelectorValue: function (value) {
            return value.replace(/["'\\\]]/g, '');
        }
    });
});
