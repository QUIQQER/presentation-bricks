/**
 * @module package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings
 * @author www.pcsg.de (Michael Danielczok)
 */
define('package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings', [

    'qui/controls/elements/FormList',
    'utils/Controls',
    'Locale',
    'controls/icons/Confirm'  // for FontAwesome Icons
    // todo FontAwesome Iconauswahl Popup einbauen

//    'css!package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings.css'
    // todo settings per css / html anordnen (prefix - counter - suffix)

], function (QUIFormList, QUIControls, QUILocale, QUISelectIcon) {
    "use strict";

    var lg = 'quiqqer/presentation-bricks';

    return new Class({

        Extends: QUIFormList,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings',

        Binds: [
            '$onParsed'
        ],

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                onParsed  : this.$onParsed
            });

            this.setAttributes({
                buttonText: QUILocale.get(lg, 'CountUpBasicSettings.entries.button.text'),
                entry: '<div class="quiqqer-bricks-ContentSwitcher-entry" style="display: none;">' +
                           '<label>' +
                                '<span class="entry-title">' +
                                 QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue.prefix') +
                                '</span>' +
                                '<input type="text" name="counterValuePrefix" />' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                               QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue') +
                               '</span>' +
                               '<input type="text" name="counterValue" />' +
                           '</label>' +
                           '<label>' +
                                '<span class="entry-title">' +
                                QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue.suffix') +
                                '</span>' +
                                '<input type="text" name="counterValueSuffix" />' +
                           '</label>' +
                           /*'<label class="entry-image">' +
                               '<span class="entry-title">' +
                                 QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.picture') +
                               '</span>' +
                               '<input class="media-image" data-qui-options-selectable_types="image" name="img"/>' +
                           '</label>' +*/
                           '<label>' +
                               '<span class="entry-title">' +
                                 QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.icon') +
                               '</span>' +
                               '<input type="text" name="icon" />' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                               QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.title') +
                               '</span>' +
                               '<input type="text" name="title" />' +
                           '</label>' +
                           '<label>' +
                               '<span class="entry-title">' +
                                  QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.content') +
                               '</span>' +
                               '<textarea name="content" rows="10"></textarea>' +
                           '</label>' +
                       '</div>'
            });
        },

        /**
         * Parses QUI controls when a new entry is created
         *
         * Fired after (inherited) FormList has parsed the content
         *
         * @param event
         * @param Element - The element that was previously parsed by (inherited) FormList
         */
        $onParsed: function (event, Element) {
            Element.getElement('.quiqqer-bricks-ContentSwitcher-entry').show();
            //
            // QUIControls.parse(Element).then(function () {
            //     // Element is fully parsed so we can finally show it
            //     Element.getElement('.quiqqer-bricks-ContentSwitcher-entry').show();
            // });
        }
    });
});

