/**
 * QUIQQER Open Video in Popup
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup
 *
 * @event onCloseVideo
 */
define('package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup', [

    'qui/controls/Control',
    'qui/controls/windows/Popup',
    'css!package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup.css'

], function (QUIControl, QUIPopup) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup',

        Binds: [
            '$onImport',
            'openVideo',
            'onWindowOpen'
        ],

        options: {
            video : '',
            poster: ''
        },

        initialize: function (options) {
            this.parent(options);
        },

        openPopup: function () {
            const self = this;

            new QUIPopup({
                'class'           : 'qui-videoInPopup',
                buttons           : false,
                maxWidth          : 5000,
                maxHeight         : 5000,
                resizable         : false,
                backgroundClosable: false,
                draggable         : false,
                content           : '<button class="qui-videoInPopup-close"><span class="fa fa-close"></span></button>',
                events            : {
                    onOpen: self.onWindowOpen,
                    onClose: () => {
                        this.fireEvent('closeVideo');
                    }
                }
            }).open();
        },

        /**
         * On Window open
         *
         * @param Window
         */
        onWindowOpen: function (Window) {
            const Video = document.createElement('video');

            Video.src      = this.getAttribute('video');
            Video.poster   = this.getAttribute('poster');
            Video.autoplay = true;
            Video.controls = true;
            Video.muted    = false;
            Video.height   = 1920;
            Video.width    = 1080;

            Window.getContent().appendChild(Video);

            Video.focus();

            Window.getContent().querySelector('.qui-videoInPopup-close').addEventListener('click',
                (event) => {
                    event.preventDefault();
                    Window.close();
                });
        }
    });
});
