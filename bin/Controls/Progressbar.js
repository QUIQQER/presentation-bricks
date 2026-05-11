/**
 * Progressbar frontend control
 *
 * Reveals the bars by toggling the `is-in-view` class on the root element
 * once it enters the viewport. Only attached by the PHP control when
 * animation === 'once'.
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/Progressbar
 */
define('package/quiqqer/presentation-bricks/bin/Controls/Progressbar', [

    'qui/controls/Control'

], function (QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/Progressbar',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Observer = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        $onImport: function () {
            var Elm = this.getElm();

            if (!Elm) {
                return;
            }

            var modifier = 'quiqqer-presentationBricks-progressbar-control--animate-once';
            var Root = Elm.classList && Elm.classList.contains(modifier)
                ? Elm
                : Elm.querySelector('.' + modifier);

            if (!Root) {
                return;
            }

            if (!('IntersectionObserver' in window)) {
                Root.classList.add('is-in-view');
                return;
            }

            this.$Observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in-view');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.25 });

            this.$Observer.observe(Root);
        }
    });
});
