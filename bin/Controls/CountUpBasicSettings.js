/**
 * @module package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings
 * @author www.pcsg.de (Michael Danielczok)
 */
define('package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Switch',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',

    'text!package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettingsEntry.html'

], function (QUI, QUIControl, QUIConfirm, QUISwitch, QUILocale, Mustache, Grid, ControlsUtils, template) {
    "use strict";

    var lg = 'quiqqer/presentation-bricks';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/presentation-bricks/bin/Controls/CountUpBasicSettings',

        Binds: [
            '$onImport',
            '$onDestroy',
            '$openAddDialog',
            '$openDeleteDialog',
            '$openEditDialog',
            '$toggleEntryStatus',
            'resize',
            'update'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Grid = null;
            this.$Elm = null;
            this.$Desktop = null;
            this.$Project = null;
            this.$data = [];

            this.addEvents({
                onImport : this.$onImport,
                onDestroy: this.$onDestroy
            });
        },

        $onImport: function () {
            this.$Input = this.getElm();

            this.$Elm = new Element('div', {
                'class': 'quiqqer-presentationBricks-countUpBasic-settings',
                styles : {
                    clear    : 'both',
                    'float'  : 'left',
                    height   : '100%',
                    minHeight: 400,
                    overflow : 'hidden',
                    position : 'relative',
                    margin   : 0,
                    width    : '100%'
                }
            }).wraps(this.$Input);

            var size = this.$getAvailableSize();

            this.$Elm.setStyles({
                height: size.y
            });

            this.$Desktop = new Element('div', {
                styles: {
                    height: size.y,
                    width : size.x
                }
            }).inject(this.$Elm);

            this.$Grid = new Grid(this.$Desktop, {
                height     : size.y,
                width      : size.x,
                buttons    : [
                    {
                        name    : 'up',
                        icon    : 'fa fa-angle-up',
                        disabled: true,
                        events  : {
                            onClick: function () {
                                this.$Grid.moveup();
                                this.$refreshSorting();
                            }.bind(this)
                        }
                    }, {
                        name    : 'down',
                        icon    : 'fa fa-angle-down',
                        disabled: true,
                        events  : {
                            onClick: function () {
                                this.$Grid.movedown();
                                this.$refreshSorting();
                            }.bind(this)
                        }
                    }, {
                        type: 'separator'
                    }, {
                        name     : 'add',
                        textimage: 'fa fa-plus',
                        text     : QUILocale.get('quiqqer/core', 'add'),
                        events   : {
                            onClick: this.$openAddDialog
                        }
                    }, {
                        type: 'separator'
                    }, {
                        name     : 'edit',
                        textimage: 'fa fa-edit',
                        text     : QUILocale.get('quiqqer/core', 'edit'),
                        disabled : true,
                        events   : {
                            onClick: this.$openEditDialog
                        }
                    }, {
                        name     : 'delete',
                        textimage: 'fa fa-trash',
                        text     : QUILocale.get('quiqqer/core', 'delete'),
                        disabled : true,
                        events   : {
                            onClick: this.$openDeleteDialog
                        }
                    }
                ],
                columnModel: [
                    {
                        header   : QUILocale.get(lg, 'brick.countUpBasic.entries.column.status'),
                        dataIndex: 'disabledDisplay',
                        dataType : 'QUI',
                        width    : 90
                    }, {
                        dataIndex: 'disabled',
                        hidden   : true
                    }, {
                        header   : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue.prefix'),
                        dataIndex: 'counterValuePrefix',
                        dataType : 'code',
                        width    : 120
                    }, {
                        header   : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue'),
                        dataIndex: 'counterValue',
                        dataType : 'code',
                        width    : 100
                    }, {
                        header   : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue.suffix'),
                        dataIndex: 'counterValueSuffix',
                        dataType : 'code',
                        width    : 120
                    }, {
                        header   : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.icon'),
                        dataIndex: 'icon',
                        dataType : 'code',
                        width    : 140
                    }, {
                        header   : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.title'),
                        dataIndex: 'title',
                        dataType : 'code',
                        width    : 220
                    }, {
                        dataIndex: 'content',
                        hidden   : true
                    }
                ]
            });

            this.$Grid.addEvents({
                onClick   : this.$toggleActionButtons.bind(this),
                onDblClick: this.$openEditDialog
            });

            this.$Grid.getElm().setStyles({
                position: 'absolute'
            });

            this.$parseInputValue();
            this.resize();
            QUI.addEvent('resize', this.resize);
        },

        $onDestroy: function () {
            QUI.removeEvent('resize', this.resize);
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

        $toggleEntryStatus: function (Caller) {
            if (!Caller) {
                return;
            }

            var row = Caller.getElm().getParent('li').get('data-row');

            if (!this.$data[row]) {
                return;
            }

            this.$data[row].disabled = Caller.getStatus() ? 1 : 0;
            this.update();
            this.refresh();
        },

        $toggleActionButtons: function () {
            var buttons = this.$Grid.getButtons();
            var edit = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'edit';
            })[0];
            var up = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'up';
            })[0];
            var down = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'down';
            })[0];
            var del = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'delete';
            })[0];

            up.enable();
            down.enable();
            edit.enable();
            del.enable();
        },

        $disableActionButtons: function () {
            var buttons = this.$Grid.getButtons();
            var edit = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'edit';
            })[0];
            var up = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'up';
            })[0];
            var down = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'down';
            })[0];
            var del = buttons.filter(function (Btn) {
                return Btn.getAttribute('name') === 'delete';
            })[0];

            up.disable();
            down.disable();
            edit.disable();
            del.disable();
        },

        $getAvailableSize: function () {
            var Container = this.$Elm.getParent('.quiqqer-bricks-container');
            var Parent = this.$Elm.getParent();
            var width = 0;
            var height = 0;

            if (Container) {
                var containerSize = Container.getSize();
                var top = this.$Elm.getPosition(Container).y;

                width = containerSize.x;
                height = containerSize.y - top;
            }

            if (!width && Parent) {
                width = Parent.getSize().x;
            }

            if (!height && Parent) {
                height = Parent.getSize().y;
            }

            if (!width) {
                width = this.$Elm.getSize().x;
            }

            return {
                x: Math.max(width, 400),
                y: Math.max(height, 400)
            };
        },

        resize: function () {
            if (!this.$Grid || !this.$Elm || !this.$Desktop) {
                return Promise.resolve();
            }

            var size = this.$getAvailableSize();

            this.$Elm.setStyles({
                height: size.y
            });

            this.$Desktop.setStyles({
                height: size.y,
                width : size.x
            });

            this.$Grid.setHeight(size.y);

            return this.$Grid.setWidth(size.x).then(function () {
                this.$Grid.resize();
            }.bind(this));
        },

        refresh: function () {
            var data = [];

            for (var i = 0, len = this.$data.length; i < len; i++) {
                var entry = this.$data[i];
                var disabled = this.$normalizeDisabled(entry);

                data.push({
                    disabled          : disabled,
                    disabledDisplay   : new QUISwitch({
                        status: disabled,
                        name  : i,
                        uid   : i,
                        events: {
                            onChange: this.$toggleEntryStatus
                        }
                    }),
                    counterValuePrefix: 'counterValuePrefix' in entry ? entry.counterValuePrefix : '',
                    counterValue      : 'counterValue' in entry ? entry.counterValue : '',
                    counterValueSuffix: 'counterValueSuffix' in entry ? entry.counterValueSuffix : '',
                    icon              : 'icon' in entry ? entry.icon : '',
                    title             : 'title' in entry ? entry.title : '',
                    content           : 'content' in entry ? entry.content : ''
                });
            }

            this.$Grid.setData({
                data: data
            });

            this.$disableActionButtons();
        },

        $normalizeDisabled: function (entry) {
            if (!entry || !('disabled' in entry)) {
                return 0;
            }

            if (entry.disabled === true || entry.disabled === 1 || entry.disabled === '1') {
                return 1;
            }

            return 0;
        },

        update: function () {
            this.$Input.value = JSON.encode(this.$data);
        },

        add: function (params) {
            this.$data.push({
                disabled          : 'disabled' in params ? parseInt(params.disabled) : 0,
                counterValuePrefix: 'counterValuePrefix' in params ? params.counterValuePrefix : '',
                counterValue      : 'counterValue' in params ? params.counterValue : '',
                counterValueSuffix: 'counterValueSuffix' in params ? params.counterValueSuffix : '',
                icon              : 'icon' in params ? params.icon : '',
                title             : 'title' in params ? params.title : '',
                content           : 'content' in params ? params.content : ''
            });

            this.refresh();
            this.update();
        },

        edit: function (index, params) {
            if (typeof index === 'undefined') {
                return;
            }

            this.$data[index] = {
                disabled          : 'disabled' in params ? parseInt(params.disabled) : 0,
                counterValuePrefix: 'counterValuePrefix' in params ? params.counterValuePrefix : '',
                counterValue      : 'counterValue' in params ? params.counterValue : '',
                counterValueSuffix: 'counterValueSuffix' in params ? params.counterValueSuffix : '',
                icon              : 'icon' in params ? params.icon : '',
                title             : 'title' in params ? params.title : '',
                content           : 'content' in params ? params.content : ''
            };

            this.refresh();
            this.update();
        },

        del: function (index) {
            var newList = [];

            if (typeOf(index) !== 'array') {
                index = [index];
            }

            for (var i = 0, len = this.$data.length; i < len; i++) {
                if (!index.contains(i)) {
                    newList.push(this.$data[i]);
                }
            }

            this.$data = newList;
        },

        setProject: function (Project) {
            this.$Project = Project;
            this.setAttribute('project', Project);
        },

        $refreshSorting: function () {
            var gridData = this.$Grid.getData();
            var data = [];

            for (var i = 0, len = gridData.length; i < len; i++) {
                data.push({
                    disabled          : parseInt(gridData[i].disabled) ? 1 : 0,
                    counterValuePrefix: gridData[i].counterValuePrefix,
                    counterValue      : gridData[i].counterValue,
                    counterValueSuffix: gridData[i].counterValueSuffix,
                    icon              : gridData[i].icon,
                    title             : gridData[i].title,
                    content           : gridData[i].content
                });
            }

            this.$data = data;
            this.update();
            this.refresh();
        },

        $openDeleteDialog: function () {
            new QUIConfirm({
                icon       : 'fa fa-trash',
                title      : QUILocale.get(lg, 'brick.countUpBasic.entries.delete.title'),
                text       : QUILocale.get(lg, 'brick.countUpBasic.entries.delete.text'),
                information: QUILocale.get(lg, 'brick.countUpBasic.entries.delete.information'),
                texticon   : false,
                maxWidth   : 600,
                maxHeight  : 400,
                ok_button  : {
                    text     : QUILocale.get('quiqqer/core', 'delete'),
                    textimage: 'fa fa-trash'
                },
                events     : {
                    onSubmit: function () {
                        var selected = this.$Grid.getSelectedIndices();

                        this.$Grid.deleteRows(selected);
                        this.del(selected);
                        this.update();
                        this.refresh();
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

            data = this.$data[index[0]];
            index = index[0];

            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Form = Dialog.getContent().getElement('form');

                    this.edit(index, {
                        disabled          : Dialog.DisabledSwitch.getStatus() ? 1 : 0,
                        counterValuePrefix: Form.elements.counterValuePrefix.value,
                        counterValue      : Form.elements.counterValue.value,
                        counterValueSuffix: Form.elements.counterValueSuffix.value,
                        icon              : Form.elements.icon.value,
                        title             : Form.elements.title.value,
                        content           : Form.elements.content.value
                    });

                    Dialog.close();
                }.bind(this));

                Dialog.addEvent('onOpenAfterCreate', function () {
                    var Form = Dialog.getContent().getElement('form');

                    if (this.$normalizeDisabled(data)) {
                        Dialog.DisabledSwitch.on();
                    } else {
                        Dialog.DisabledSwitch.off();
                    }

                    Form.elements.counterValuePrefix.value = data.counterValuePrefix !== undefined
                        ? data.counterValuePrefix
                        : '';
                    Form.elements.counterValue.value = data.counterValue !== undefined
                        ? data.counterValue
                        : '';
                    Form.elements.counterValueSuffix.value = data.counterValueSuffix !== undefined
                        ? data.counterValueSuffix
                        : '';
                    Form.elements.icon.value = data.icon !== undefined ? data.icon : '';
                    Form.elements.title.value = data.title !== undefined ? data.title : '';
                    Form.elements.content.value = data.content !== undefined ? data.content : '';
                }.bind(this));

                Dialog.setAttribute('title', QUILocale.get(lg, 'brick.countUpBasic.entries.editdialog.title'));
                Dialog.open();
            }.bind(this));
        },

        $openAddDialog: function () {
            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Form = Dialog.getContent().getElement('form');

                    this.add({
                        disabled          : Dialog.DisabledSwitch.getStatus() ? 1 : 0,
                        counterValuePrefix: Form.elements.counterValuePrefix.value,
                        counterValue      : Form.elements.counterValue.value,
                        counterValueSuffix: Form.elements.counterValueSuffix.value,
                        icon              : Form.elements.icon.value,
                        title             : Form.elements.title.value,
                        content           : Form.elements.content.value
                    });

                    Dialog.close();
                }.bind(this));

                Dialog.open();
            }.bind(this));
        },

        $createDialog: function () {
            return new Promise(function (resolve) {
                var Dialog = new QUIConfirm({
                    title    : QUILocale.get(lg, 'brick.countUpBasic.entries.adddialog.title'),
                    icon     : 'fa fa-edit',
                    maxWidth : 900,
                    maxHeight: 700,
                    autoclose: false,
                    events   : {
                        onOpen: function (Win) {
                            Win.Loader.show();
                            Win.getContent().set('html', '');

                            var Container = new Element('div', {
                                html   : Mustache.render(template, {
                                    fieldDisabled          : QUILocale.get(lg, 'brick.countUpBasic.entries.field.disabled'),
                                    fieldCounterValuePrefix: QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue.prefix'),
                                    fieldCounterValue      : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue'),
                                    fieldCounterValueSuffix: QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.counterValue.suffix'),
                                    fieldIcon              : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.icon'),
                                    fieldTitle             : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.title'),
                                    fieldContent           : QUILocale.get(lg, 'CountUpBasicSettings.entries.entry.content')
                                }),
                                'class': 'quiqqer-presentationBricks-countUpBasic-settings-dialog'
                            }).inject(Win.getContent());

                            Win.DisabledSwitch = new QUISwitch({
                                name  : 'disabled',
                                status: false
                            }).inject(Container.getElement('#disabledWrapper'));

                            QUI.parse(Container).then(function () {
                                return ControlsUtils.parse(Container);
                            }).then(function () {
                                if (this.$Project) {
                                    var controls = QUI.Controls.getControlsInElement(Container);

                                    controls.each(function (Control) {
                                        if ("setProject" in Control) {
                                            Control.setProject(this.$Project);
                                        }
                                    }.bind(this));
                                }

                                Win.fireEvent('openAfterCreate', [Win]);
                                Win.Loader.hide();
                                resolve(Dialog);
                            }.bind(this));
                        }.bind(this)
                    }
                });

                resolve(Dialog);
            }.bind(this));
        }
    });
});
