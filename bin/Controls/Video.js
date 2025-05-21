/**
 * ...
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/Video
 */
define('package/quiqqer/presentation-bricks/bin/Controls/Video', [

    'qui/controls/Control'

], function (QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/Video',

        Binds: [
            '$onImport',
            'openVideoInPopup',
            '$handleVideoButtonClick',
            'onWindowOpen'
        ],

        options: {
            video       : '',
            poster      : '',
            playifinview: true,
            openinpopup : 0
        },

        initialize: function (options) {
            this.parent(options);

            this.isOpen = false;
            this.Video  = false;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm     = this.getElm();
            const buttons = Elm.querySelectorAll('[data-js="startVideo"]');
            this.Video    = Elm.querySelector('video');

            if (!this.Video) {
                return;
            }

            if (this.getAttribute('playifinview')) {
                this.initPlayIfInView();
            }

            if (buttons.length > 0) {
                let i   = 0,
                    len = buttons.length;

                for (i; i < len; i++) {
                    buttons[i].addEventListener('click', this.$handleVideoButtonClick);
                }
            }
        },

        /**
         * Handle button click
         */
        $handleVideoButtonClick: function () {
            if (this.getElm().get('data-qui-options-openinpopup') === '1') {
                this.openVideoInPopup();
                return;
            }

            const BtnWrapper = this.getElm().querySelector('.quiqqer-presentationBricks-video-buttonWrapper');

            if (BtnWrapper) {
                BtnWrapper.style.pointerEvents = 'none';
                this.Video.style.filter        = 'none';
                this.Video.setAttribute('controls', "1");
                this.Video.play();
                BtnWrapper.destroy();
            } else {
                this.Video.setAttribute('controls', "1");
                this.Video.play();
            }
        },

        /**
         * Open video in a popup
         */
        openVideoInPopup: function () {
            const self = this;

            if (this.isOpen) {
                return;
            }
            this.isOpen = true;

            require(['package/quiqqer/presentation-bricks/bin/Controls/VideoInPopup'], function (VideoPopup) {
                var Popup = new VideoPopup({
                    video : self.getAttribute('video'),
                    poster: self.getAttribute('poster'),
                    events: {
                        onCloseVideo: function () {
                            self.isOpen = false;
                        }
                    }
                });

                Popup.openPopup();
            });
        },

        /**
         * Init play if in view function
         */
        initPlayIfInView: function () {
            let throttleTimer = false;

            /**
             * Check if element is in view
             * scrollOffset = 100px means:
             * "The element is in view if the top element border is away equal or more than 100px from bottom window edge
             * AND the bottom element border is away equal or less than 100px from top window edge."
             *
             * @param el
             * @param scrollOffset
             * @return {boolean}
             */
            const elementInView = (el, scrollOffset = 0) => {
                const elementTop    = el.getBoundingClientRect().top,
                      elementBottom = el.getBoundingClientRect().bottom,
                      windowHeight  = (window.innerHeight || document.documentElement.clientHeight);

                return (elementTop <= windowHeight - scrollOffset && elementBottom > scrollOffset);
            };

            /**
             * Play or pause video
             * @param offset
             */
            const handleVideoState = (offset = 100) => {
                if (elementInView(this.Video, offset)) {
                    if (this.Video.paused) {
                        this.Video.play();
                    }
                } else {
                    this.Video.pause();
                }
            };

            /**
             * Reduce the number of function calling
             *
             * @param callback
             * @param time
             */
            const throttle = (callback, time) => {
                //don't run the function while throttle timer is true
                if (throttleTimer) {
                    return;
                }

                //first set throttle timer to true so the function doesn't run
                throttleTimer = true;

                setTimeout(() => {
                    //call the callback function in the setTimeout and set the throttle timer to false after the indicated time has passed
                    callback();
                    throttleTimer = false;
                }, time);
            };

            window.addEventListener('scroll', () => {
                throttle(function () {
                    handleVideoState(100);
                }, 250);
            });

            // on load
            setTimeout(() => {
                handleVideoState(100);
            }, 250);
        }
    });
});
