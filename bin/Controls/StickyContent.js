/**
 * QUIQQER Sticky Content
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module Bricks\Controls\StickyContent
 *
 * @require qui/QUI
 * @require qui/controls/Control
 */
define('package/quiqqer/presentation-bricks/bin/Controls/StickyContent', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'Controls/StickyContent',

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
            var brick       = document.getElement('.qui-control-stickyContent'),
                images      = document.getElements('.qui-control-stickyContent-entry-image img'),
                counter  = 0,
                sections    = document.getElements('.qui-control-stickyContent-entry'),
                entryHeight = sections[0].getSize().y,
                top         = brick.getPosition().y,
                bottom      = top + brick.getSize().y - entryHeight,
                breakPoint  = top + (entryHeight / 2),
                posAbsolute = true,
                position    = 0;

            console.log("top " + top)
            console.log("bottom " + bottom)
            console.log("entryHeight " + entryHeight)
            console.log("breakPoint " + breakPoint);
            console.log(images);

            window.addEvent('scroll', function () {

                var scroll = window.getScroll().y;

                if (scroll > top && scroll < bottom) {

                    // set position of all images to fixed if not already done
                    if (posAbsolute) {
                        images.forEach(function (Elm) {
                            Elm.setStyle('position', 'fixed');
                            posAbsolute = false;
                        });
                    }


                    if (scroll > breakPoint && scroll < bottom) {
                        // hide current image...
                        images[counter].setStyle(
                            'opacity', 0
                        );
                        // ...and show the next
                        images[counter + 1].setStyle(
                            'opacity', 1
                        );

                        counter += 1;
                        breakPoint += entryHeight;
                        console.log("breakPoint " + breakPoint);

                    }
                    /*if (scroll > position) {
                        if (scroll > breakPoint && scroll < bottom) {
                            console.warn("counter " + counter)
                            console.warn("break point erreicht (scroll down)!");

                            // hide current image...
                            images[counter].setStyle(
                                'opacity', 0
                            );
                            // ...and show the next
                            images[counter + 1].setStyle(
                                'opacity', 1
                            );


                            counter += 1;
                            console.info("images.length ---------------- " + images.length)
                            console.info("counter ----------- " + counter + 1)
                            if (images.length - 1 == counter) {
                                console.log(11111111111111)
                                return;
                            }
                            breakPoint += entryHeight;
                            console.log("breakPoint " + breakPoint);

                        }
                    } else {
                        if (scroll < breakPoint && scroll > top) {
                            console.warn("counter " + counter)
                            console.warn("break point erreicht! Scroll up....");

                            // hide current image...
                            images[counter].setStyle(
                                'opacity', 0
                            );
                            // ...and show the previous
                            images[counter - 1].setStyle(
                                'opacity', 1
                            );

                            breakPoint -= entryHeight;
                            counter -= 1;
                            console.log("breakPoint " + breakPoint);
                        }
                    }*/


                    position = scroll;
                }

                if (scroll > bottom || scroll < top) {
                    images.forEach(function (Elm) {
                        Elm.setStyle('position', 'absolute');
                    });

                    posAbsolute = true;
                }
            });


        }
    });
});
