/**
 * QUIQQER Wallpaper with text and an arrow
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\WallpaperTextArrow
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/presentation-bricks/bin/Controls/WallpaperTextArrow', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/WallpaperTextArrow',

        Binds: [
            '$onImport'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Brick = null;
            this.$Arrow = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            this.$Brick = document.getElement('div[data-quiid="' + this.$uid + '"]');
            this.$Arrow = this.$Brick.getElement('.wallpaperTextArrow-arrow-fa');

            this.$Arrow.addEvent('click', function () {
                new Fx.Scroll(window).start(0, this.$Brick.offsetTop + this.$Brick.getSize().y);
            }.bind(this));
        }
    });
});
