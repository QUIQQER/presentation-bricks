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
            autoplay           : 1,
            delayvideoload     : 0,
            delayvideoloaddelay: 250,
            inlinevideo        : '',
            loop               : 1,
            muted              : 1,
            openinpopup        : 0,
            playsinline        : 1,
            playifinview       : true,
            poster             : '',
            video              : ''
        },

        initialize: function (options) {
            this.parent(options);

            this.isOpen = false;
            this.Video  = false;
            this.playIfInViewInitialized = false;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * event : on import
         */
        $onImport: function () {
            const Elm     = this.getElm();
            const buttons = Elm.querySelectorAll('[data-name="start-video"], [data-name="start-video-wrapper"]');

            this.Video = Elm.querySelector('[data-name="video-element"], video');

            if (buttons.length > 0) {
                let i   = 0,
                    len = buttons.length;

                for (i; i < len; i++) {
                    buttons[i].addEventListener('click', this.$handleVideoButtonClick);
                }
            }

            if (parseInt(this.getAttribute('delayvideoload'), 10) === 1) {
                this.delayVideoLoad();
                return;
            }

            if (!this.Video) {
                return;
            }

            this.initDelayedVideoFeatures();
        },

        /**
         * Handle button click
         */
        $handleVideoButtonClick: function (event) {
            event.stopPropagation();

            if (this.getElm().get('data-qui-options-openinpopup') === '1') {
                this.openVideoInPopup();
                return;
            }

            if (!this.Video) {
                this.Video = this.createVideoElement();
                this.initDelayedVideoFeatures();
            }

            if (!this.Video) {
                return;
            }

            const BtnWrapper = this.getElm().querySelector('[data-name="start-video-wrapper"], .quiqqer-presentationBricks-video-buttonWrapper');

            if (BtnWrapper) {
                BtnWrapper.style.pointerEvents = 'none';
                this.Video.style.filter        = 'none';
                this.Video.setAttribute('controls', "1");
                this.Video.play();
                BtnWrapper.remove();
            } else {
                this.Video.setAttribute('controls', "1");
                this.Video.play();
            }
        },

        delayVideoLoad: function () {
            const startLoading = () => {
                window.setTimeout(() => {
                    if (!this.Video) {
                        this.Video = this.createVideoElement();
                    }

                    if (!this.Video) {
                        return;
                    }

                    this.initDelayedVideoFeatures();
                }, parseInt(this.getAttribute('delayvideoloaddelay'), 10) || 0);
            };

            if (document.readyState === 'complete') {
                startLoading();
                return;
            }

            window.addEventListener('load', startLoading, {once: true});
        },

        createVideoElement: function () {
            const container = this.getElm().querySelector('.quiqqer-presentationBricks-video-videoContainer');
            const placeholderWrapper = container?.querySelector('[data-name="video-poster-wrapper"]');
            const placeholder = container?.querySelector('[data-name="video-poster"]');
            const src = this.getAttribute('inlinevideo');

            if (!container || !src) {
                return false;
            }

            const Video = document.createElement('video');
            const placeholderRect = placeholder?.getBoundingClientRect();
            const placeholderWidth = placeholder?.getAttribute('width') || Math.round(placeholderRect?.width || 0);
            const placeholderHeight = placeholder?.getAttribute('height') || Math.round(placeholderRect?.height || 0);

            Video.setAttribute('data-name', 'video-element');
            Video.setAttribute('preload', 'none');
            Video.src = src;

            if (placeholderWidth) {
                Video.setAttribute('width', String(placeholderWidth));
            }

            if (placeholderHeight) {
                Video.setAttribute('height', String(placeholderHeight));
            }

            if (this.getAttribute('poster')) {
                Video.setAttribute('poster', this.getAttribute('poster'));
            }

            if (parseInt(this.getAttribute('autoplay'), 10) === 1) {
                Video.setAttribute('autoplay', '');
                Video.autoplay = true;
            }

            if (parseInt(this.getAttribute('loop'), 10) === 1) {
                Video.setAttribute('loop', '');
                Video.loop = true;
            }

            if (parseInt(this.getAttribute('muted'), 10) === 1) {
                Video.setAttribute('muted', '');
                Video.muted = true;
                Video.defaultMuted = true;
            }

            if (parseInt(this.getAttribute('playsinline'), 10) === 1) {
                Video.setAttribute('playsinline', '');
                Video.setAttribute('webkit-playsinline', '');
            }

            if (placeholderWrapper) {
                placeholderWrapper.replaceWith(Video);
            } else if (placeholder?.closest('picture')) {
                placeholder.closest('picture').replaceWith(Video);
            } else if (placeholder) {
                placeholder.replaceWith(Video);
            } else {
                container.appendChild(Video);
            }

            return Video;
        },

        initDelayedVideoFeatures: function () {
            if (!this.Video) {
                return;
            }

            if (this.getAttribute('playifinview')) {
                this.initPlayIfInView();
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
            if (this.playIfInViewInitialized || !this.Video) {
                return;
            }

            this.playIfInViewInitialized = true;

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
