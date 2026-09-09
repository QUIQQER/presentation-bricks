/**
 * Entry editor for the ScrollPinnedCards brick: a grid of cards with an
 * add / edit / delete dialog. The complete list is serialized as JSON into
 * the hidden "entries" setting.
 *
 * @author www.pcsg.de (Michael Danielczok)
 * @module package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCardsSettings
 */
define('package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCardsSettings', [
    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Switch',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',
    'text!package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCardsSettingsEntry.html'
], function (QUI,
             QUIControl,
             QUIConfirm,
             QUISwitch,
             QUILocale,
             Mustache,
             Grid,
             ControlsUtils,
             templateEntry
) {
    "use strict";

    const lg = 'quiqqer/presentation-bricks';
    const prefix = 'brick.scrollPinnedCards.entries.';

    const layouts = ['text', 'image', 'text-image', 'image-text', 'text-text'];
    const splitLayouts = ['text-image', 'image-text', 'text-text'];
    const imageLayouts = ['image', 'text-image', 'image-text'];
    const splitRatios = ['50-50', '60-40', '40-60'];
    const iconPositions = ['start', 'end'];
    const imageFits = ['cover', 'contain'];
    const verticalAligns = ['top', 'center', 'bottom'];
    const paddings = ['none', 'small', 'normal', 'large', 'extraLarge'];
    const imageCrops = [
        'left top',
        'top',
        'right top',
        'left',
        'center',
        'right',
        'left bottom',
        'bottom',
        'right bottom'
    ];
    const buttonTypes = [
        'primary',
        'primary-outline',
        'secondary',
        'secondary-outline',
        'success',
        'success-outline',
        'danger',
        'danger-outline',
        'warning',
        'warning-outline',
        'info',
        'info-outline',
        'dark',
        'dark-outline',
        'light',
        'light-outline',
        'white',
        'white-outline',
        'link',
        'link-body'
    ];

    return new Class({
        Extends: QUIControl,
        Type: 'package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCardsSettings',

        Binds: [
            '$onImport',
            '$openAddDialog',
            '$openEditDialog',
            '$openDeleteDialog',
            '$toggleEntryStatus',
            'update'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Elm = null;
            this.$Grid = null;
            this.$data = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        $onImport: function () {
            this.$Input = this.getElm();

            this.$Elm = new Element('div', {
                styles: {
                    clear: 'both',
                    'float': 'left',
                    height: 400,
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '10px 0 0 0',
                    width: '100%'
                }
            }).wraps(this.$Input);

            const size = this.$Elm.getSize();
            const Desktop = new Element('div', {
                styles: {
                    width: size.x
                }
            }).inject(this.$Elm);

            this.$Grid = new Grid(Desktop, {
                height: 400,
                width: size.x,
                buttons: [{
                    name: 'up',
                    icon: 'fa fa-angle-up',
                    disabled: true,
                    events: {
                        onClick: function () {
                            this.$Grid.moveup();
                            this.$refreshSorting();
                        }.bind(this)
                    }
                }, {
                    name: 'down',
                    icon: 'fa fa-angle-down',
                    disabled: true,
                    events: {
                        onClick: function () {
                            this.$Grid.movedown();
                            this.$refreshSorting();
                        }.bind(this)
                    }
                }, {
                    type: 'separator'
                }, {
                    name: 'add',
                    textimage: 'fa fa-plus',
                    text: QUILocale.get('quiqqer/core', 'add'),
                    events: {
                        onClick: this.$openAddDialog
                    }
                }, {
                    type: 'separator'
                }, {
                    name: 'edit',
                    textimage: 'fa fa-edit',
                    text: QUILocale.get('quiqqer/core', 'edit'),
                    disabled: true,
                    events: {
                        onClick: this.$openEditDialog
                    }
                }, {
                    name: 'delete',
                    textimage: 'fa fa-trash',
                    text: QUILocale.get('quiqqer/core', 'delete'),
                    disabled: true,
                    events: {
                        onClick: this.$openDeleteDialog
                    }
                }],
                columnModel: [{
                    header: QUILocale.get(lg, prefix + 'column.status'),
                    dataIndex: 'disabledDisplay',
                    dataType: 'QUI',
                    width: 80
                }, {
                    dataIndex: 'disabled',
                    hidden: true
                }, {
                    header: QUILocale.get(lg, prefix + 'layout'),
                    dataIndex: 'layoutDisplay',
                    dataType: 'string',
                    width: 180
                }, {
                    header: QUILocale.get(lg, prefix + 'eyebrow'),
                    dataIndex: 'eyebrow',
                    dataType: 'string',
                    width: 160
                }, {
                    header: QUILocale.get(lg, prefix + 'title'),
                    dataIndex: 'title',
                    dataType: 'string',
                    width: 260
                }, {
                    header: QUILocale.get(lg, prefix + 'buttonText'),
                    dataIndex: 'buttonText',
                    dataType: 'string',
                    width: 160
                }]
            });

            this.$Grid.addEvents({
                onClick: this.$enableRowButtons.bind(this),
                onDblClick: this.$openEditDialog
            });

            this.$Grid.getElm().setStyles({
                position: 'absolute'
            });

            this.$parseInputValue();
        },

        $parseInputValue: function () {
            try {
                this.$data = JSON.decode(this.$Input.value);

                if (typeOf(this.$data) !== 'array') {
                    this.$data = [];
                }
            } catch (e) {
                this.$data = [];
            }

            this.refresh();
        },

        resize: function () {
            const size = this.getElm().getSize();

            return this.$Grid.setWidth(size.x).then(function () {
                this.$Grid.resize();
            }.bind(this));
        },

        refresh: function () {
            const data = [];

            this.$data.each(function (entry, index) {
                entry = this.$normalizeEntry(entry);

                const row = Object.merge({}, entry);

                row.disabledDisplay = new QUISwitch({
                    status: !entry.disabled,
                    name: index,
                    uid: index,
                    events: {
                        onChange: this.$toggleEntryStatus
                    }
                });

                row.layoutDisplay = QUILocale.get(
                    lg,
                    prefix + 'layout.' + this.$layoutLocaleKey(entry.layout)
                );

                data.push(row);
            }.bind(this));

            this.$Grid.setData({
                data: data
            });

            this.$disableRowButtons();
        },

        update: function () {
            this.$Input.value = JSON.encode(this.$data);
        },

        add: function (params) {
            this.$data.push(this.$normalizeEntry(params));
            this.refresh();
            this.update();
        },

        edit: function (index, params) {
            if (typeof index === 'undefined') {
                return;
            }

            this.$data[index] = this.$normalizeEntry(params);
            this.refresh();
            this.update();
        },

        del: function (index) {
            const newList = [];

            if (typeOf(index) !== 'array') {
                index = [index];
            }

            this.$data.each(function (entry, i) {
                if (!index.contains(i)) {
                    newList.push(entry);
                }
            });

            this.$data = newList;
        },

        setProject: function (Project) {
            this.setAttribute('project', Project);

            QUI.Controls.getControlsInElement(this.getElm()).each(function (Control) {
                if (Control !== this && "setProject" in Control) {
                    Control.setProject(Project);
                }
            }.bind(this));
        },

        /**
         * The switch shows "active", the stored flag is "disabled".
         */
        $toggleEntryStatus: function (Caller) {
            if (!Caller) {
                return;
            }

            const row = Caller.getElm().getParent('li').get('data-row');

            if (!this.$data[row]) {
                return;
            }

            this.$data[row].disabled = !Caller.getStatus();
            this.update();
        },

        $refreshSorting: function () {
            const gridData = this.$Grid.getData();
            const data = [];

            gridData.each(function (entry) {
                data.push(this.$normalizeEntry(entry));
            }.bind(this));

            this.$data = data;
            this.update();
            this.refresh();
        },

        $openDeleteDialog: function () {
            new QUIConfirm({
                icon: 'fa fa-trash',
                title: QUILocale.get(lg, prefix + 'delete.title'),
                text: QUILocale.get(lg, prefix + 'delete.text'),
                information: QUILocale.get(lg, prefix + 'delete.information'),
                texticon: false,
                maxWidth: 600,
                maxHeight: 400,
                ok_button: {
                    text: QUILocale.get('quiqqer/core', 'delete'),
                    textimage: 'fa fa-trash'
                },
                events: {
                    onSubmit: function () {
                        const selected = this.$Grid.getSelectedIndices();

                        this.$Grid.deleteRows(selected);
                        this.del(selected);
                        this.update();
                        this.refresh();
                    }.bind(this)
                }
            }).open();
        },

        $openEditDialog: function () {
            const indices = this.$Grid.getSelectedIndices();

            if (!indices.length) {
                return Promise.resolve();
            }

            const index = indices[0];

            return this.$createDialog(this.$data[index]).then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    this.edit(index, this.$getDialogData(Dialog));
                    Dialog.close();
                }.bind(this));

                Dialog.setAttribute('title', QUILocale.get(lg, prefix + 'editdialog.title'));
                Dialog.open();
            }.bind(this));
        },

        $openAddDialog: function () {
            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    this.add(this.$getDialogData(Dialog));
                    Dialog.close();
                }.bind(this));

                Dialog.open();
            }.bind(this));
        },

        /**
         * A brand new card starts as text next to an image, split evenly -
         * the most common composition. The fallback of $normalizeEntry stays
         * the single text area: it has to be the most robust value, not the
         * most frequent one.
         */
        $newEntryDefaults: function () {
            return {
                layout: 'text-image',
                splitRatio: '50-50'
            };
        },

        $createDialog: function (initial) {
            const self = this;
            const entry = this.$normalizeEntry(initial || this.$newEntryDefaults());

            return Promise.resolve(new QUIConfirm({
                title: QUILocale.get(lg, prefix + 'adddialog.title'),
                icon: 'fa fa-edit',
                texticon: false,
                maxWidth: 960,
                maxHeight: 800,
                autoclose: false,
                events: {
                    onOpen: function (Win) {
                        Win.Loader.show();
                        Win.getContent().set('html', '');

                        const Container = new Element('div', {
                            'class': 'quiqqer-presentationBricks-scrollPinnedCards-settings-dialog',
                            html: Mustache.render(templateEntry, {
                                fieldActive: QUILocale.get(lg, prefix + 'active'),
                                fieldActiveDesc: QUILocale.get(lg, prefix + 'active.desc'),
                                fieldLayout: QUILocale.get(lg, prefix + 'layout'),
                                fieldLayoutDesc: QUILocale.get(lg, prefix + 'layout.desc'),
                                layoutText: QUILocale.get(lg, prefix + 'layout.text'),
                                layoutImage: QUILocale.get(lg, prefix + 'layout.image'),
                                layoutTextImage: QUILocale.get(lg, prefix + 'layout.textImage'),
                                layoutImageText: QUILocale.get(lg, prefix + 'layout.imageText'),
                                layoutTextText: QUILocale.get(lg, prefix + 'layout.textText'),
                                fieldSplitRatio: QUILocale.get(lg, prefix + 'splitRatio'),
                                fieldSplitRatioDesc: QUILocale.get(lg, prefix + 'splitRatio.desc'),
                                fieldImage: QUILocale.get(lg, prefix + 'image'),
                                fieldImageDesc: QUILocale.get(lg, prefix + 'image.desc'),
                                useGlobal: QUILocale.get(lg, prefix + 'useGlobal'),
                                fieldImageMaxHeight: QUILocale.get(lg, prefix + 'imageMaxHeight'),
                                fieldImageMaxHeightDesc: QUILocale.get(lg, prefix + 'imageMaxHeight.desc'),
                                fieldImageFit: QUILocale.get(lg, prefix + 'imageFit'),
                                fieldImageFitDesc: QUILocale.get(lg, prefix + 'imageFit.desc'),
                                imageFitCover: QUILocale.get(lg, prefix + 'imageFit.cover'),
                                imageFitContain: QUILocale.get(lg, prefix + 'imageFit.contain'),
                                fieldImageCrop: QUILocale.get(lg, prefix + 'imageCrop'),
                                fieldImageCropDesc: QUILocale.get(lg, prefix + 'imageCrop.desc'),
                                imageCropLeftTop: QUILocale.get(lg, prefix + 'imageCrop.leftTop'),
                                imageCropTop: QUILocale.get(lg, prefix + 'imageCrop.top'),
                                imageCropRightTop: QUILocale.get(lg, prefix + 'imageCrop.rightTop'),
                                imageCropLeft: QUILocale.get(lg, prefix + 'imageCrop.left'),
                                imageCropCenter: QUILocale.get(lg, prefix + 'imageCrop.center'),
                                imageCropRight: QUILocale.get(lg, prefix + 'imageCrop.right'),
                                imageCropLeftBottom: QUILocale.get(lg, prefix + 'imageCrop.leftBottom'),
                                imageCropBottom: QUILocale.get(lg, prefix + 'imageCrop.bottom'),
                                imageCropRightBottom: QUILocale.get(lg, prefix + 'imageCrop.rightBottom'),
                                fieldImageVerticalAlign: QUILocale.get(lg, prefix + 'imageVerticalAlign'),
                                fieldImageVerticalAlignDesc: QUILocale.get(lg, prefix + 'imageVerticalAlign.desc'),
                                verticalAlignTop: QUILocale.get(lg, prefix + 'verticalAlign.top'),
                                verticalAlignCenter: QUILocale.get(lg, prefix + 'verticalAlign.center'),
                                verticalAlignBottom: QUILocale.get(lg, prefix + 'verticalAlign.bottom'),
                                fieldImagePadding: QUILocale.get(lg, prefix + 'imagePadding'),
                                fieldImagePaddingDesc: QUILocale.get(lg, prefix + 'imagePadding.desc'),
                                paddingNone: QUILocale.get(lg, prefix + 'padding.none'),
                                paddingSmall: QUILocale.get(lg, prefix + 'padding.small'),
                                paddingNormal: QUILocale.get(lg, prefix + 'padding.normal'),
                                paddingLarge: QUILocale.get(lg, prefix + 'padding.large'),
                                paddingExtraLarge: QUILocale.get(lg, prefix + 'padding.extraLarge'),
                                fieldCardIcon: QUILocale.get(lg, prefix + 'cardIcon'),
                                fieldCardIconDesc: QUILocale.get(lg, prefix + 'cardIcon.desc'),
                                fieldEyebrow: QUILocale.get(lg, prefix + 'eyebrow'),
                                fieldEyebrowDesc: QUILocale.get(lg, prefix + 'eyebrow.desc'),
                                fieldTitle: QUILocale.get(lg, prefix + 'title'),
                                fieldTitleDesc: QUILocale.get(lg, prefix + 'title.desc'),
                                fieldContentPrimary: QUILocale.get(lg, prefix + 'contentPrimary'),
                                fieldContentPrimaryDesc: QUILocale.get(lg, prefix + 'contentPrimary.desc'),
                                fieldContentPrimaryPadding: QUILocale.get(lg, prefix + 'contentPrimaryPadding'),
                                fieldContentPrimaryPaddingDesc: QUILocale.get(lg, prefix + 'contentPrimaryPadding.desc'),
                                fieldContentSecondary: QUILocale.get(lg, prefix + 'contentSecondary'),
                                fieldContentSecondaryDesc: QUILocale.get(lg, prefix + 'contentSecondary.desc'),
                                fieldContentSecondaryPadding: QUILocale.get(lg, prefix + 'contentSecondaryPadding'),
                                fieldContentSecondaryPaddingDesc: QUILocale.get(lg, prefix + 'contentSecondaryPadding.desc'),
                                fieldButtonText: QUILocale.get(lg, prefix + 'buttonText'),
                                fieldButtonTextDesc: QUILocale.get(lg, prefix + 'buttonText.desc'),
                                fieldLink: QUILocale.get(lg, prefix + 'link'),
                                fieldLinkDesc: QUILocale.get(lg, prefix + 'link.desc'),
                                fieldLinkTarget: QUILocale.get(lg, prefix + 'linkTarget'),
                                linkTargetSelf: QUILocale.get(lg, prefix + 'linkTarget.self'),
                                linkTargetBlank: QUILocale.get(lg, prefix + 'linkTarget.blank'),
                                fieldLinkNofollow: QUILocale.get(lg, prefix + 'linkNofollow'),
                                fieldLinkNofollowDesc: QUILocale.get(lg, prefix + 'linkNofollow.desc'),
                                fieldBtnType: QUILocale.get(lg, prefix + 'btnType'),
                                fieldBtnTypeDesc: QUILocale.get(lg, prefix + 'btnType.desc'),
                                fieldButtonIcon: QUILocale.get(lg, prefix + 'buttonIcon'),
                                fieldButtonIconDesc: QUILocale.get(lg, prefix + 'buttonIcon.desc'),
                                fieldButtonIconPosition: QUILocale.get(lg, prefix + 'buttonIconPosition'),
                                fieldButtonIconPositionDesc: QUILocale.get(lg, prefix + 'buttonIconPosition.desc'),
                                buttonIconPositionStart: QUILocale.get(lg, prefix + 'buttonIconPosition.start'),
                                buttonIconPositionEnd: QUILocale.get(lg, prefix + 'buttonIconPosition.end'),
                                fieldCardClass: QUILocale.get(lg, prefix + 'cardClass'),
                                fieldCardClassDesc: QUILocale.get(lg, prefix + 'cardClass.desc'),
                                fieldButtonClass: QUILocale.get(lg, prefix + 'buttonClass'),
                                fieldButtonClassDesc: QUILocale.get(lg, prefix + 'buttonClass.desc'),
                                fieldButtonAriaLabel: QUILocale.get(lg, prefix + 'buttonAriaLabel'),
                                fieldButtonAriaLabelDesc: QUILocale.get(lg, prefix + 'buttonAriaLabel.desc'),
                                fieldButtonDataAttributes: QUILocale.get(lg, prefix + 'buttonDataAttributes'),
                                fieldButtonDataAttributesDesc: QUILocale.get(lg, prefix + 'buttonDataAttributes.desc'),
                                image: entry.image,
                                imageMaxHeight: entry.imageMaxHeight,
                                cardIcon: entry.cardIcon,
                                cardClass: entry.cardClass,
                                buttonClass: entry.buttonClass,
                                buttonAriaLabel: entry.buttonAriaLabel,
                                eyebrow: entry.eyebrow,
                                title: entry.title,
                                buttonText: entry.buttonText,
                                link: entry.link
                            })
                        }).inject(Win.getContent());

                        const Form = Container.getElement('form');

                        Form.elements.layout.value = entry.layout;
                        Form.elements.splitRatio.value = entry.splitRatio;
                        Form.elements.linkTarget.value = entry.linkTarget;
                        Form.elements.btnType.value = entry.btnType;
                        Form.elements.contentPrimary.value = entry.contentPrimary;
                        Form.elements.contentSecondary.value = entry.contentSecondary;
                        Form.elements.contentPrimaryPadding.value = entry.contentPrimaryPadding;
                        Form.elements.contentSecondaryPadding.value = entry.contentSecondaryPadding;
                        Form.elements.imageFit.value = entry.imageFit;
                        Form.elements.imageCrop.value = entry.imageCrop;
                        Form.elements.imageVerticalAlign.value = entry.imageVerticalAlign;
                        Form.elements.imagePadding.value = entry.imagePadding;
                        Form.elements.buttonIcon.value = entry.buttonIcon;
                        Form.elements.buttonIconPosition.value = entry.buttonIconPosition;

                        Container.getElements('.field-content').each(function (Field) {
                            Field.getParent().setStyles({
                                height: 260
                            });
                        });

                        Win.ActiveSwitch = new QUISwitch({
                            name: 'active',
                            status: !entry.disabled
                        }).inject(Container.getElement('#activeWrapper'));

                        Win.NofollowSwitch = new QUISwitch({
                            name: 'linkNofollow',
                            status: entry.linkNofollow
                        }).inject(Container.getElement('#linkNofollowWrapper'));

                        QUI.parse(Container).then(function () {
                            return ControlsUtils.parse(Container);
                        }).then(function () {
                            QUI.Controls.getControlsInElement(Container).each(function (Control) {
                                if (Control !== self && "setProject" in Control) {
                                    Control.setProject(self.getAttribute('project'));
                                }
                            });

                            Form.elements.contentPrimary.fireEvent('change');
                            Form.elements.contentSecondary.fireEvent('change');

                            const DataAttributes = self.$getDataAttributesControl(Container);

                            if (DataAttributes) {
                                DataAttributes.setValue(entry.buttonDataAttributes);
                            }

                            self.$bindDialogBehavior(Container);
                            Win.Loader.hide();
                        });
                    }
                }
            }));
        },

        /**
         * Show only the fields the chosen card layout actually uses.
         */
        $bindDialogBehavior: function (Container) {
            const Form = Container.getElement('form');
            const LayoutField = Form.elements.layout;

            const updateVisibility = function () {
                const layout = LayoutField.value;
                const hasText = layout !== 'image';
                const hasImage = imageLayouts.contains(layout);
                const hasSecondary = layout === 'text-text';
                const isSplit = splitLayouts.contains(layout);

                this.$toggleRow(Container, 'splitRatioRow', isSplit);

                [
                    'imageRow',
                    'imageMaxHeightRow',
                    'imageFitRow',
                    'imageCropRow',
                    'imageVerticalAlignRow',
                    'imagePaddingRow'
                ].forEach(function (name) {
                    this.$toggleRow(Container, name, hasImage);
                }.bind(this));

                [
                    'contentSecondaryRow',
                    'contentSecondaryPaddingRow'
                ].forEach(function (name) {
                    this.$toggleRow(Container, name, hasSecondary);
                }.bind(this));

                [
                    'cardIconRow',
                    'eyebrowRow',
                    'titleRow',
                    'contentPrimaryRow',
                    'contentPrimaryPaddingRow',
                    'buttonTextRow',
                    'linkRow',
                    'linkTargetRow',
                    'linkNofollowRow',
                    'btnTypeRow',
                    'buttonIconRow',
                    'buttonIconPositionRow',
                    'buttonClassRow',
                    'buttonAriaLabelRow',
                    'buttonDataAttributesRow'
                ].forEach(function (name) {
                    this.$toggleRow(Container, name, hasText);
                }.bind(this));
            }.bind(this);

            LayoutField.addEventListener('change', updateVisibility);
            updateVisibility();
        },

        $toggleRow: function (Container, name, visible) {
            const Row = Container.querySelector('[data-name="' + name + '"]');

            if (!Row) {
                return;
            }

            Row.style.display = visible ? '' : 'none';
        },

        $getDialogData: function (Dialog) {
            const Form = Dialog.getContent().getElement('form');
            const DataAttributes = this.$getDataAttributesControl(Dialog.getContent());

            return {
                disabled: !Dialog.ActiveSwitch.getStatus(),
                layout: Form.elements.layout.value,
                splitRatio: Form.elements.splitRatio.value,
                image: Form.elements.image.value,
                imageMaxHeight: Form.elements.imageMaxHeight.value,
                imageFit: Form.elements.imageFit.value,
                imageCrop: Form.elements.imageCrop.value,
                imageVerticalAlign: Form.elements.imageVerticalAlign.value,
                imagePadding: Form.elements.imagePadding.value,
                cardIcon: Form.elements.cardIcon.value,
                eyebrow: Form.elements.eyebrow.value,
                title: Form.elements.title.value,
                contentPrimary: Form.elements.contentPrimary.value,
                contentPrimaryPadding: Form.elements.contentPrimaryPadding.value,
                contentSecondary: Form.elements.contentSecondary.value,
                contentSecondaryPadding: Form.elements.contentSecondaryPadding.value,
                buttonText: Form.elements.buttonText.value,
                link: Form.elements.link.value,
                linkTarget: Form.elements.linkTarget.value,
                linkNofollow: Dialog.NofollowSwitch.getStatus(),
                btnType: Form.elements.btnType.value,
                buttonIcon: Form.elements.buttonIcon.value,
                buttonIconPosition: Form.elements.buttonIconPosition.value,
                cardClass: Form.elements.cardClass.value,
                buttonClass: Form.elements.buttonClass.value,
                buttonAriaLabel: Form.elements.buttonAriaLabel.value,
                buttonDataAttributes: DataAttributes ? DataAttributes.getValue() : []
            };
        },

        /**
         * The repeatable data-* attribute editor from quiqqer/components.
         */
        $getDataAttributesControl: function (scope) {
            if (!scope) {
                return null;
            }

            return QUI.Controls.getControlsInElement(scope).filter(function (Control) {
                return Control.getType() === 'package/quiqqer/components/bin/Controls/DataAttributes';
            })[0] || null;
        },

        /**
         * Recover from empty and partial entry data. The same schema is
         * normalized again in PHP.
         *
         * An empty string in one of the override fields means "use the
         * section setting", so it is kept as is instead of being replaced by
         * a default.
         */
        $normalizeEntry: function (entry) {
            entry = entry || {};

            return {
                disabled: !!(entry.disabled || entry.isDisabled),
                layout: layouts.contains(entry.layout) ? entry.layout : 'text',
                splitRatio: splitRatios.contains(entry.splitRatio) ? entry.splitRatio : '50-50',
                image: entry.image || '',
                imageMaxHeight: entry.imageMaxHeight || '',
                imageFit: imageFits.contains(entry.imageFit) ? entry.imageFit : '',
                imageCrop: imageCrops.contains(entry.imageCrop) ? entry.imageCrop : '',
                imageVerticalAlign: verticalAligns.contains(entry.imageVerticalAlign)
                    ? entry.imageVerticalAlign
                    : '',
                imagePadding: paddings.contains(entry.imagePadding) ? entry.imagePadding : '',
                cardIcon: entry.cardIcon || '',
                eyebrow: entry.eyebrow || '',
                title: entry.title || '',
                contentPrimary: entry.contentPrimary || '',
                contentPrimaryPadding: paddings.contains(entry.contentPrimaryPadding)
                    ? entry.contentPrimaryPadding
                    : '',
                contentSecondary: entry.contentSecondary || '',
                contentSecondaryPadding: paddings.contains(entry.contentSecondaryPadding)
                    ? entry.contentSecondaryPadding
                    : '',
                buttonText: entry.buttonText || '',
                link: entry.link || '',
                linkTarget: entry.linkTarget === '_blank' ? '_blank' : '_self',
                linkNofollow: !!entry.linkNofollow,
                btnType: buttonTypes.contains(entry.btnType) ? entry.btnType : 'primary',
                buttonIcon: entry.buttonIcon || '',
                buttonIconPosition: iconPositions.contains(entry.buttonIconPosition)
                    ? entry.buttonIconPosition
                    : 'start',
                cardClass: entry.cardClass || '',
                buttonClass: entry.buttonClass || '',
                buttonAriaLabel: entry.buttonAriaLabel || '',
                buttonDataAttributes: Array.isArray(entry.buttonDataAttributes)
                    ? entry.buttonDataAttributes
                    : []
            };
        },

        $layoutLocaleKey: function (layout) {
            switch (layout) {
                case 'image':
                    return 'image';

                case 'text-image':
                    return 'textImage';

                case 'image-text':
                    return 'imageText';

                case 'text-text':
                    return 'textText';

                default:
                    return 'text';
            }
        },

        $enableRowButtons: function () {
            this.$setRowButtonsEnabled(true);
        },

        $disableRowButtons: function () {
            this.$setRowButtonsEnabled(false);
        },

        $setRowButtonsEnabled: function (enabled) {
            this.$Grid.getButtons().each(function (Button) {
                if (!['up', 'down', 'edit', 'delete'].contains(Button.getAttribute('name'))) {
                    return;
                }

                if (enabled) {
                    Button.enable();
                } else {
                    Button.disable();
                }
            });
        }
    });
});
