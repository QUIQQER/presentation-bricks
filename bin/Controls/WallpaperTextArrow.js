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

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Brick = document.getElement('div[data-quiid="' + this.$uid + '"]');
            const Btn = Brick.getElement('.wallpaperTextArrow__arrowContainer button');

            if (!Btn || !Brick) {
                return;
            }

            Btn.addEvent('click', function () {
                new Fx.Scroll(window).start(0, Brick.offsetTop + Brick.getSize().y);
            }.bind(this));
        }
    });
});
