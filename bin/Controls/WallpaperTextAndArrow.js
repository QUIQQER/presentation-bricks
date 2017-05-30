/**
 * QUIQQER Wallapper with text and arrow
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\SimpleContact
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/presentation-bricks/bin/Controls/WallpaperTextAndArrow', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/WallpaperTextAndArrow',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Brick    = null;
            this.$Arrow    = null;
            this.$ScrollTo = null;

            this.addEvents({
                onImport: this.$onImport
            });

            console.log(this);
        },

        /**
         * event : on import
         */
        $onImport: function () {

            this.$Brick    = document.getElement('div[data-quiid="' + this.$uid + '"]');
            this.$Arrow    = this.$Brick.getElement('.wallpaper-text-arrow-fa');
            this.$ScrollTo = this.$Brick.getElement('.wallpaper-text-scrollTo');

            this.$Arrow.addEvent('click', function () {
                new Fx.Scroll(window).toElement(this.$ScrollTo);
            }.bind(this))

        }
    });
});
