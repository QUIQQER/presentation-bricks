/**
 * ScrollPinnedCards - pins the section while scrolling and moves the card
 * track horizontally, mapped 1:1 to the scroll progress inside the tall
 * pin wrapper.
 *
 * The pin is a progressive enhancement. It is only switched on when every
 * condition holds: a fine pointer, a desktop sized viewport, no
 * "prefers-reduced-motion" and at least two cards. In every other case the
 * PHP rendered stack of cards stays untouched. Eligible screens with oversized
 * content use the shared Carousel instead of pinning.
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards
 */
define('package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards', [

    'qui/controls/Control',
    'Locale',
    'package/quiqqer/slider/bin/Carousel'

], function (QUIControl, QUILocale, Carousel) {
    "use strict";

    const lg = 'quiqqer/presentation-bricks';
    const pinnedClass = 'quiqqer-presentationBricks-scrollPinnedCards--pinned';
    const sliderClass = 'quiqqer-presentationBricks-scrollPinnedCards--slider';
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
            '$onSliderSelect',
            '$onFocusIn',
            '$onFocusOut',
            '$resetViewportScroll',
            '$evaluateMode',
            '$update',
            '$tick'
        ],

        options: {
            countermode: 'inline',
            countertarget: '',
            breakpoint: 768,
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
            this.$ContentObserver = null;
            this.$Carousel = null;
            this.$isSlider = false;
            this.$cardsFocusable = false;
            this.$destroyed = false;
            this.$FocusedElement = null;

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
            this.$Viewport = Elm.querySelector('[data-name="pinViewport"]') || Elm.querySelector('[data-name="viewport"]');
            this.$Track = Elm.querySelector('[data-name="track"]');

            if (!this.$PinWrapper || !this.$Viewport || !this.$Track) {
                return;
            }

            this.$cards = Array.from(Elm.querySelectorAll('[data-name="card"]'));

            this.$setupCounter();
            this.$watchMediaQueries();

            window.addEventListener('resize', this.$onResize);

            this.$evaluateMode();
            this.$watchContent();

            // whatever the mode turned out to be, the presentation is final
            // now - the inline script may have held the track back until here
            this.getElm().classList.remove(restoringClass);
        },

        /**
         * event : on destroy
         */
        $onDestroy: function () {
            this.$destroyed = true;
            this.$disablePin();
            this.$disableSlider();

            if (this.$Carousel) {
                this.$Carousel.Embla.destroy();
            }

            this.$Observer?.disconnect();
            this.$ContentObserver?.disconnect();
            this.getElm().removeEventListener('load', this.$onResize, true);
            document.fonts?.removeEventListener('loadingdone', this.$onResize);
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

            Target.appendChild(Elm.querySelector('[data-name="navigation"]') || this.$Counter);
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
         * Measure in the pinned layout, then hand oversized cards to Carousel.
         * A temporary measurement must not change the active card or scroll position.
         */
        $evaluateMode: function () {
            if (this.$destroyed) {
                return;
            }

            const wasPinned = this.$isPinned;
            const wasSlider = this.$isSlider;
            const index = this.$index;
            const rect = this.$PinWrapper.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            this.$disableSlider();

            if (!this.$mayPin()) {
                this.$disablePin();
                this.$setCardsFocusable(false);
                return;
            }

            this.$enablePin();

            if (!this.$cardsFit()) {
                this.$disablePin();
                this.$enableSlider(index);

                // Removing the tall pin wrapper must not skip the section that
                // was being read. Changes elsewhere on the page do not move it.
                if (wasPinned && rect.top <= 0 && rect.bottom >= window.innerHeight) {
                    window.scrollTo({top: top, behavior: 'instant'});
                }

                // $enableSlider falls back to the stack for old cached markup
                this.$setCardsFocusable(this.$isSlider);
                return;
            }

            if (wasSlider && inView && this.$travel > 0) {
                window.scrollTo({
                    top: top + this.$travel * (index / (this.$cards.length - 1)),
                    behavior: 'instant'
                });
            }

            this.$setCardsFocusable(true);
            this.$update();
        },

        /**
         * Make every card a tab stop while pin or slider show one card at a
         * time. Otherwise a card without a link or button can not be reached
         * by keyboard at all - Tab would jump straight past it. $onFocusIn
         * (pin) and Embla (slider) then bring the focused card into view.
         *
         * Stacked cards need no stop of their own: they are all visible, and
         * a focusable element without a function is a dead stop in the tab
         * order. That is also why this lives in JavaScript and not in the
         * template.
         *
         * Only the final mode of $evaluateMode is written here, never the
         * temporary pin used for measuring: removing the tabindex from the
         * focused card would drop the focus on every resize.
         *
         * @param {boolean} focusable
         */
        $setCardsFocusable: function (focusable) {
            if (this.$cardsFocusable === focusable) {
                return;
            }

            this.$cardsFocusable = focusable;

            const total = this.$cards.length;

            this.$cards.forEach(function (Card, index) {
                if (!focusable) {
                    Card.removeAttribute('tabindex');
                    Card.removeAttribute('aria-label');
                    return;
                }

                // The card stays a list item: a role like "group" would break
                // the list semantics of the track. The label names the stop
                // on focus, the content stays readable inside it.
                Card.setAttribute('tabindex', '0');
                Card.setAttribute('aria-label', QUILocale.get(lg, 'control.ScrollPinnedCards.counter.label', {
                    current: index + 1,
                    total: total
                }));
            });
        },

        /**
         * Use the shared carousel for dragging, focus handling and arrow state.
         * Keep its instance between modes; inactive Embla releases DOM styles,
         * observers and input handlers before the pin owns the track again.
         */
        $enableSlider: function (index) {
            // Cached markup from before the carousel viewport was introduced
            // still has a safe stacked fallback.
            if (!this.$Viewport.querySelector('[data-name="viewport"]')) {
                return;
            }

            this.getElm().classList.add(sliderClass);
            this.$isSlider = true;
            this.$Counter?.removeAttribute('hidden');

            if (!this.$Carousel) {
                this.$Carousel = new Carousel({
                    align: 'center',
                    containscroll: '',
                    startindex: index,
                    loop: 0,
                    slidestoscroll: 1
                });
                this.$Carousel.imports(this.$Viewport);
                this.$Carousel.Embla.on('select', this.$onSliderSelect);
            } else {
                this.$Carousel.Embla.reInit({active: true, startIndex: index});
            }

            this.$onSliderSelect();
        },

        $disableSlider: function () {
            if (!this.$isSlider) {
                return;
            }

            this.$isSlider = false;
            this.$Carousel.Embla.reInit({active: false});
            this.getElm().classList.remove(sliderClass);
            this.$Counter?.setAttribute('hidden', 'hidden');
        },

        $onSliderSelect: function () {
            if (this.$isSlider) {
                this.$setIndex(this.$Carousel.Embla.selectedScrollSnap());
            }
        },

        /**
         * Content can change after import (images, fonts, dynamic text). Observe
         * final box sizes and actual content, never the animated track styles.
         */
        $watchContent: function () {
            const Elm = this.getElm();
            Elm.addEventListener('load', this.$onResize, true);
            document.fonts?.addEventListener('loadingdone', this.$onResize);

            if ('ResizeObserver' in window) {
                this.$Observer = new ResizeObserver(this.$onResize);
                this.$Observer.observe(this.$Track);
                const Header = Elm.querySelector('[data-name="header"]');

                if (Header) {
                    this.$Observer.observe(Header);
                }

                this.$cards.forEach((Card) => {
                    const Inner = Card.querySelector('[data-name="cardInner"]') || Card;
                    Array.from(Inner.children).forEach((Child) => this.$Observer.observe(Child));
                });
            }

            this.$ContentObserver = new MutationObserver(this.$onResize);
            this.$ContentObserver.observe(this.$Track, {childList: true, characterData: true, subtree: true});
        },

        /**
         * Measure content only; decorative overflow on the shell does not veto pinning.
         *
         * @return {boolean}
         */
        $cardsFit: function () {
            return !this.$cards.some(function (Card) {
                // The shell may carry overflowing decorative pseudo-elements.
                // Fall back to the card for markup from an older page cache.
                const Content = Card.querySelector('[data-name="cardInner"]') || Card;

                return Content.scrollHeight > Content.clientHeight + 1;
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
                return;
            }

            this.$isPinned = true;
            this.getElm().classList.add(pinnedClass);

            if (this.$Counter) {
                this.$Counter.removeAttribute('hidden');
            }

            window.addEventListener('scroll', this.$onScroll, {passive: true});
            this.$Viewport.addEventListener('scroll', this.$resetViewportScroll, {passive: true});
            this.$Track.addEventListener('focusin', this.$onFocusIn);
            this.$Track.addEventListener('focusout', this.$onFocusOut);

            this.$measure();
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
            this.$Viewport.removeEventListener('scroll', this.$resetViewportScroll);
            this.$Track.removeEventListener('focusin', this.$onFocusIn);
            this.$Track.removeEventListener('focusout', this.$onFocusOut);
            this.$FocusedElement = null;

            // the stacked and the slider presentation get the box as they
            // expect it, whatever a focus left behind here
            this.$resetViewportScroll();

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
         * Batch viewport and content changes. Measurement and restoration finish
         * in the same frame, so observers only see the final layout.
         */
        $onResize: function () {
            if (this.$destroyed || this.$resizeFrame) {
                return;
            }

            this.$resizeFrame = window.requestAnimationFrame(function () {
                this.$resizeFrame = null;
                this.$evaluateMode();
            }.bind(this));
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

            // Undo what the browser scrolled to reach the element before
            // anything else measures or paints - see $resetViewportScroll.
            this.$resetViewportScroll();

            // Restoring browser focus is not navigation to another card.
            const restoredFocus = event.target === this.$FocusedElement && event.relatedTarget === null;
            this.$FocusedElement = event.target;

            if (restoredFocus) {
                return;
            }

            /*
             * Only the keyboard navigates. A click already points at the card
             * it means, and moving the track out from under the pointer
             * between mousedown and mouseup would swallow the click that is
             * still to come.
             */
            if (!this.$isKeyboardFocus(event.target)) {
                return;
            }

            const index = this.$cards.findIndex(function (Card) {
                return Card.contains(event.target);
            });

            if (index < 0 || this.$travel <= 0) {
                return;
            }

            /*
             * Also when the focused card is the active one already: the index
             * is rounded, so it does not say that the track sits on that card
             * exactly. Between two cards the focused element hangs over the
             * edge of the viewport - which is what made the browser scroll the
             * viewport in the first place.
             */
            const top = this.$PinWrapper.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: top + this.$travel * (index / (this.$cards.length - 1)),
                behavior: 'instant'
            });

            // The page now sits where the focused card is the active one, so
            // the track belongs there too. Easing towards it would slide the
            // element the user just reached out from under the focus ring.
            this.$update();
        },

        /**
         * Did the focus come from the keyboard? ":focus-visible" is the
         * browser's own answer to that question, and it covers more than
         * tabbing: a text field keeps it when clicked, which is right - typing
         * there needs the card in view.
         *
         * @param {Element} Target
         * @return {boolean}
         */
        $isKeyboardFocus: function (Target) {
            try {
                return Target.matches(':focus-visible');
            } catch (e) {
                // a browser that does not know the selector cannot tell the
                // two apart - navigating too often beats not navigating
                return true;
            }
        },

        /**
         * The pinned viewport clips header and track with "overflow: hidden",
         * while the track is positioned with a transform. When the browser
         * focuses an element in a card that is off screen it cannot move that
         * transform, so it scrolls the clipping box instead - which shifts the
         * whole section including the header, and nothing ever puts it back,
         * not even a resize. The pin owns the position of the track, so this
         * box stays at zero.
         */
        $resetViewportScroll: function () {
            if (this.$Viewport.scrollLeft !== 0) {
                this.$Viewport.scrollLeft = 0;
            }

            if (this.$Viewport.scrollTop !== 0) {
                this.$Viewport.scrollTop = 0;
            }
        },

        $onFocusOut: function () {
            // Keep the element while focus leaves the browser, but forget it
            // after a real focus change or an explicit blur within the page.
            if (document.hasFocus()) {
                this.$FocusedElement = null;
            }
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
