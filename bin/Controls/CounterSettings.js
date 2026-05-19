/**
 * @module package/quiqqer/presentation-bricks/bin/Controls/CounterSettings
 */
define('package/quiqqer/presentation-bricks/bin/Controls/CounterSettings', [
    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Switch',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',
    'text!package/quiqqer/presentation-bricks/bin/Controls/CounterSettingsEntry.html'
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

    var lg = 'quiqqer/presentation-bricks';

    return new Class({
        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/CounterSettings',

        Binds: [
            '$onImport',
            '$openAddDialog',
            '$openDeleteDialog',
            '$openEditDialog',
            '$toggleEntryStatus',
            'update'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
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

            var size = this.$Elm.getSize();
            var Desktop = new Element('div', {
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
                    text: QUILocale.get('quiqqer/quiqqer', 'add'),
                    events: {
                        onClick: this.$openAddDialog
                    }
                }, {
                    type: 'separator'
                }, {
                    name: 'edit',
                    textimage: 'fa fa-edit',
                    text: QUILocale.get('quiqqer/quiqqer', 'edit'),
                    disabled: true,
                    events: {
                        onClick: this.$openEditDialog
                    }
                }, {
                    name: 'delete',
                    textimage: 'fa fa-trash',
                    text: QUILocale.get('quiqqer/quiqqer', 'delete'),
                    disabled: true,
                    events: {
                        onClick: this.$openDeleteDialog
                    }
                }],
                columnModel: [{
                    header: QUILocale.get(lg, 'brick.counter.entries.column.status'),
                    dataIndex: 'disabledDisplay',
                    dataType: 'QUI',
                    width: 80
                }, {
                    dataIndex: 'disabled',
                    hidden: true
                }, {
                    header: QUILocale.get(lg, 'brick.counter.entries.startValue'),
                    dataIndex: 'startValue',
                    dataType: 'number',
                    width: 100
                }, {
                    header: QUILocale.get(lg, 'brick.counter.entries.endValue'),
                    dataIndex: 'endValue',
                    dataType: 'number',
                    width: 100
                }, {
                    header: QUILocale.get(lg, 'brick.counter.entries.prefix'),
                    dataIndex: 'prefix',
                    dataType: 'string',
                    width: 100
                }, {
                    header: QUILocale.get(lg, 'brick.counter.entries.suffix'),
                    dataIndex: 'suffix',
                    dataType: 'string',
                    width: 100
                }, {
                    header: QUILocale.get(lg, 'brick.counter.entries.icon'),
                    dataIndex: 'icon',
                    dataType: 'string',
                    width: 120
                }, {
                    header: QUILocale.get(lg, 'brick.counter.entries.title'),
                    dataIndex: 'title',
                    dataType: 'string',
                    width: 250
                }]
            });

            this.$Grid.addEvents({
                onClick: this.$enableRowButtons.bind(this),
                onDblClick: this.$openEditDialog
            });

            this.$Grid.getElm().setStyles({
                position: 'absolute'
            });

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
            var size = this.getElm().getSize();

            return this.$Grid.setWidth(size.x).then(function () {
                this.$Grid.resize();
            }.bind(this));
        },

        refresh: function () {
            var data = [];

            this.$data.each(function (entry, index) {
                entry = this.$normalizeEntry(entry);

                data.push({
                    disabledDisplay: new QUISwitch({
                        status: entry.disabled,
                        name: index,
                        uid: index,
                        events: {
                            onChange: this.$toggleEntryStatus
                        }
                    }),
                    disabled: entry.disabled,
                    startValue: entry.startValue,
                    endValue: entry.endValue,
                    prefix: entry.prefix,
                    suffix: entry.suffix,
                    icon: entry.icon,
                    title: entry.title,
                    content: entry.content
                });
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
            var newList = [];

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

        $toggleEntryStatus: function (Caller) {
            if (!Caller) {
                return;
            }

            var row = Caller.getElm().getParent('li').get('data-row');

            this.$data[row].disabled = Caller.getStatus();
            this.update();
        },

        $refreshSorting: function () {
            var gridData = this.$Grid.getData();
            var data = [];

            gridData.each(function (entry) {
                data.push(this.$normalizeEntry(entry));
            }.bind(this));

            this.$data = data;
            this.update();
        },

        $openDeleteDialog: function () {
            new QUIConfirm({
                icon: 'fa fa-trash',
                title: QUILocale.get(lg, 'brick.counter.entries.delete.title'),
                text: QUILocale.get(lg, 'brick.counter.entries.delete.text'),
                information: QUILocale.get(lg, 'brick.counter.entries.delete.information'),
                texticon: false,
                maxWidth: 600,
                maxHeight: 400,
                ok_button: {
                    text: QUILocale.get('quiqqer/quiqqer', 'delete'),
                    textimage: 'fa fa-trash'
                },
                events: {
                    onSubmit: function () {
                        var selected = this.$Grid.getSelectedIndices();

                        this.$Grid.deleteRows(selected);
                        this.del(selected);
                        this.update();
                    }.bind(this)
                }
            }).open();
        },

        $openEditDialog: function () {
            var data = this.$Grid.getSelectedData();
            var index = this.$Grid.getSelectedIndices();

            if (!data.length) {
                return Promise.resolve();
            }

            data = data[0];
            index = index[0];

            return this.$createDialog(data).then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    var params = this.$getDialogData(Dialog);

                    this.edit(index, params);
                    Dialog.close();
                }.bind(this));

                Dialog.setAttribute('title', QUILocale.get(lg, 'brick.counter.entries.editdialog.title'));
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

        $createDialog: function (initial) {
            var self = this;

            initial = this.$normalizeEntry(initial || {});

            return new Promise(function (resolve) {
                resolve(new QUIConfirm({
                    title: QUILocale.get(lg, 'brick.counter.entries.adddialog.title'),
                    icon: 'fa fa-edit',
                    maxWidth: 960,
                    maxHeight: 760,
                    events: {
                        onOpen: function (Win) {
                            Win.Loader.show();
                            Win.getContent().set('html', '');

                            var prefix = 'brick.counter.entries.';
                            var Container = new Element('div', {
                                html: Mustache.render(templateEntry, {
                                    fieldDisabled: QUILocale.get(lg, prefix + 'disabled'),
                                    fieldStartValue: QUILocale.get(lg, prefix + 'startValue'),
                                    fieldEndValue: QUILocale.get(lg, prefix + 'endValue'),
                                    fieldEndValueDesc: QUILocale.get(lg, prefix + 'endValue.desc'),
                                    fieldPrefix: QUILocale.get(lg, prefix + 'prefix'),
                                    fieldPrefixDesc: QUILocale.get(lg, prefix + 'prefix.desc'),
                                    fieldSuffix: QUILocale.get(lg, prefix + 'suffix'),
                                    fieldSuffixDesc: QUILocale.get(lg, prefix + 'suffix.desc'),
                                    fieldIcon: QUILocale.get(lg, prefix + 'icon'),
                                    fieldTitle: QUILocale.get(lg, prefix + 'title'),
                                    fieldTitleDesc: QUILocale.get(lg, prefix + 'title.desc'),
                                    fieldContent: QUILocale.get(lg, prefix + 'content'),
                                    fieldContentDesc: QUILocale.get(lg, prefix + 'content.desc'),
                                    startValue: initial.startValue,
                                    endValue: initial.endValue,
                                    prefix: initial.prefix,
                                    suffix: initial.suffix,
                                    icon: initial.icon,
                                    title: initial.title,
                                    content: initial.content
                                })
                            }).inject(Win.getContent());

                            Win.DisabledSwitch = new QUISwitch({
                                name: 'disabled',
                                status: initial.disabled
                            }).inject(Container.getElement('#disabledWrapper'));

                            QUI.parse(Container).then(function () {
                                return ControlsUtils.parse(Container);
                            }).then(function () {
                                QUI.Controls.getControlsInElement(Container).each(function (Control) {
                                    if (Control !== self && "setProject" in Control) {
                                        Control.setProject(self.getAttribute('project'));
                                    }
                                });

                                Win.Loader.hide();
                            });
                        }
                    }
                }));
            });
        },

        $getDialogData: function (Dialog) {
            var Form = Dialog.getContent().getElement('form');

            return {
                disabled: Dialog.DisabledSwitch.getStatus(),
                startValue: Form.elements.startValue.value,
                endValue: Form.elements.endValue.value,
                prefix: Form.elements.prefix.value,
                suffix: Form.elements.suffix.value,
                icon: Form.elements.icon.value,
                title: Form.elements.title.value,
                content: Form.elements.content.value
            };
        },

        $normalizeEntry: function (entry) {
            entry = entry || {};

            return {
                disabled: !!(entry.disabled || entry.isDisabled),
                startValue: typeof entry.startValue !== 'undefined' ? entry.startValue : 0,
                endValue: typeof entry.endValue !== 'undefined' ? entry.endValue : '',
                prefix: entry.prefix || '',
                suffix: entry.suffix || '',
                icon: entry.icon || '',
                title: entry.title || '',
                content: entry.content || ''
            };
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
