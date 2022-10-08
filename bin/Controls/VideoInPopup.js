/**
 * QUIQQER Open Video in Popup
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup
 */
define('package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup', [

    'qui/controls/Control',
    'css!package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup.css'

], function (QUIControl) {
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
            videoUrl: '',
            poster: ''
        },

        initialize: function (options) {
            this.parent(options);

            this.isOpen = false;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm     = this.getElm();
            const buttons = Elm.querySelectorAll('.openVideoInPopupBtn');

            if (buttons.length < 1) {
                return;
            }

            let i   = 0,
                len = buttons.length;

            for (i; i < len; i++) {
                buttons[i].addEventListener('click', this.openVideo);
            }
        },

        /**
         * Open qui window with video
         * @param event
         */
        openVideo: function (event) {
            const self = this;

            event.preventDefault();

            if (this.isOpen) {
                return;
            }

            this.isOpen = true;

            require(['qui/controls/windows/Popup'], function (QUIPopup) {
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
                        onOpen : self.onWindowOpen,
                        onClose: () => {
                            self.isOpen = false;
                        }
                    }
                }).open();
            });
        },

        /**
         * On Window open
         *
         * @param Window
         */
        onWindowOpen: function (Window) {
            const Video = document.createElement('video');

            console.log(this.getAttribute('poster'))
            console.log(this.getAttribute('video'))

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
