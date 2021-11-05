/**
 * @module package/quiqqer/bricks/bin/Controls/Slider/TextAndImageMultipleSettings
 * @author Dominik Chrzanowski
 *
 */
define('package/quiqqer/presentation-bricks/bin/Controls/ProgressbarSettings', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'qui/controls/buttons/Button',
    'qui/controls/buttons/Switch',
    'Locale',
    'Mustache',
    'controls/grid/Grid',
    'utils/Controls',

    'text!package/quiqqer/presentation-bricks/bin/Controls/ProgressbarSettingsEntry.html',
    // 'css!package/quiqqer/bricks/bin/Controls/TextAndImageMultipleSettings.css'

], function (QUI,
             QUIControl,
             QUIConfirm,
             QUIButton,
             QUISwitch,
             QUILocale,
             Mustache,
             Grid,
             ControlsUtils,
             templateEntry
) {
    "use strict";

    var pb = 'quiqqer/presentation-bricks';

    return new Class({
        Extends: QUIControl,
        Type: 'package/quiqqer/bricks/bin/Controls/Slider/PromosliderSettings',

        Binds: [
            '$onImport',
            '$openAddDialog',
            '$openDeleteDialog',
            '$openEditDialog',
            '$toggleSlideStatus',
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

        /**
         * event: on import
         */
        $onImport: function () {
            this.$Input = this.getElm();

            this.$Elm = new Element('div', {
                'class': 'quiqqer-presentationBricks-progressbar-settings',
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

            // grid and sizes
            var size = this.$Elm.getSize();

            var Desktop = new Element('div', {
                styles: {
                    width: size.x
                }
            }).inject(this.$Elm);

            this.$Grid = new Grid(Desktop, {
                height: 400,
                width: size.x,
                buttons: [
                    {
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
                    }
                ],
                columnModel: [{
                    header: QUILocale.get('quiqqer/quiqqer', 'title'),
                    dataIndex: 'title',
                    dataType: 'string',
                    width: 300
                }, {
                    header: QUILocale.get('quiqqer/presentation-bricks', 'brick.progressbar.settings.add.percent'),
                    dataIndex: 'percent',
                    dataType: 'number',
                    width: 300
                }
                ]
            });

            this.$Grid.addEvents({
                onClick: function () {
                    var buttons = this.$Grid.getButtons(),

                        Edit = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'edit';
                        })[0],

                        Up = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'up';
                        })[0],

                        Down = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'down';
                        })[0],

                        Delete = buttons.filter(function (Btn) {
                            return Btn.getAttribute('name') === 'delete';
                        })[0];

                    Up.enable();
                    Down.enable();
                    Edit.enable();
                    Delete.enable();
                }.bind(this),

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

                this.refresh();
            } catch (e) {
            }
        },

        /**
         * Toggles the slide's status between enabled and disabled
         *
         * @param {Object} [Caller] - the object calling this event
         */
        $toggleSlideStatus: function (Caller) {
            if (!Caller) {
                return;
            }

            // get cell number
            var row = Caller.getElm().getParent('li').get('data-row');

            this.$data[row].isDisabled = Caller.getStatus();
            this.update();
        },

        /**
         * Resize the control
         *
         * @return {Promise}
         */
        resize: function () {
            var size = this.getElm().getSize();

            return this.$Grid.setWidth(size.x).then(function () {
                this.$Grid.resize();
            }.bind(this));
        },

        /**
         * refresh the display
         */
        refresh: function () {
            var i, len, entry, insert;
            var data = [];

            for (i = 0, len = this.$data.length; i < len; i++) {
                entry = this.$data[i];
                insert = {};

                entry.isDisabled = parseInt(entry.isDisabled);

                insert.isDisabledDisplay = new QUISwitch({
                    status: entry.isDisabled,
                    name: i,
                    uid: i,
                    events: {
                        onChange: this.$toggleSlideStatus
                    }
                });

                if ("title" in entry) {
                    insert.title = entry.title;
                }

                if ("percent" in entry) {
                    insert.percent = entry.percent;

                    if (entry.percent > 100) {
                        insert.percent = 100;
                    }

                    if (entry.percent === '' ||
                        entry.percent < 0) {
                        insert.percent = 0;
                    }
                }

                data.push(insert);
            }

            this.$Grid.setData({
                data: data
            });

            var buttons = this.$Grid.getButtons(),

                Edit = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'edit';
                })[0],

                Up = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'up';
                })[0],

                Down = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'down';
                })[0],

                Delete = buttons.filter(function (Btn) {
                    return Btn.getAttribute('name') === 'delete';
                })[0];

            Up.disable();
            Down.disable();
            Edit.disable();
            Delete.disable();
        },

        /**
         * Update the field
         */
        update: function () {
            this.$Input.value = JSON.encode(this.$data);
        },

        /**
         * Add an entry
         *
         * @param {Object} params
         */
        add: function (params) {
            var entry = {
                title: '',
                percent: '',
            };

            if ("title" in params) {
                entry.title = params.title;
            }

            if ("percent" in params) {
                entry.percent = params.percent;
            }

            this.$data.push(entry);
            this.refresh();
            this.update();
        },

        /**
         * Edit an entry
         *
         * @param {number} index
         * @param {object} params
         */
        edit: function (index, params) {
            if (typeof index === 'undefined') {
                return;
            }

            var entry = {
                title: '',
                percent: '',
            };

            if ("title" in params) {
                entry.title = params.title;
            }

            if ("percent" in params) {
                entry.percent = params.percent;
            }

            this.$data[index] = entry;

            this.refresh();
            this.update();
        },

        /**
         * Delete one entry or multiple entries
         *
         * @param {number|array} index
         */
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

        /**
         * Set the used project
         *
         * @param {string|object} Project
         */
        setProject: function (Project) {
            this.setAttribute('project', Project);

            var controls = QUI.Controls.getControlsInElement(this.getElm());

            controls.each(function (Control) {
                if (Control === this) {
                    return;
                }

                if ("setProject" in Control) {
                    Control.setProject(Project);
                }
            }.bind(this));
        },

        /**
         * Refresh the data sorting in dependence of the grid
         */
        $refreshSorting: function () {
            var gridData = this.$Grid.getData(),
                data = [];

            for (var i = 0, len = gridData.length; i < len; i++) {
                data.push({
                    title: gridData[i].title,
                    percent: gridData[i].percent
                });
            }

            this.$data = data;
            this.update();
        },

        /**
         * opens the delete dialog
         *
         * @return {Promise}
         */
        $openDeleteDialog: function () {
            new QUIConfirm({
                icon: 'fa fa-icon',
                title: QUILocale.get(pb, 'brick.progressbar.entires.delete.title'),
                text: QUILocale.get(pb, 'brick.progressbar.entires.delete.text'),
                information: QUILocale.get(pb, 'brick.progressbar.entires.delete.information'),
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

        /**
         * Open edit dialog
         *
         * @retrun {Promise}
         */
        $openEditDialog: function () {
            var self = this,
                data = this.$Grid.getSelectedData(),
                index = this.$Grid.getSelectedIndices();

            if (!data.length) {
                return Promise.resolve();
            }

            data = data[0];
            index = index[0];

            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Content = Dialog.getContent();
                    var Form = Content.getElement('form');

                    var Title = Form.elements.title;
                    var Percent = Form.elements.percent;

                    self.edit(index, {
                        title: Title.value,
                        percent: Percent.value,
                    });

                    Dialog.close();
                });

                Dialog.addEvent('onOpenAfterCreate', function () {
                    var Content = Dialog.getContent();
                    var Form = Content.getElement('form');

                    var Title = Form.elements.title;
                    var Percent = Form.elements.percent;

                    Title.value = data.title;
                    Percent.value = data.percent;

                    Percent.fireEvent('change');
                });

                Dialog.setAttribute('title', QUILocale.get(pb, 'brick.progressbar.entires.editdialog.title'));
                Dialog.open();
            });
        },

        /**
         * opens the add dialog
         *
         * @return {Promise}
         */
        $openAddDialog: function () {
            var self = this;

            return this.$createDialog().then(function (Dialog) {
                Dialog.addEvent('onSubmit', function () {
                    Dialog.Loader.show();

                    var Content = Dialog.getContent();
                    var Form = Content.getElement('form');

                    var Title = Form.elements.title;
                    var Percent = Form.elements.percent;

                    self.add({
                        title: Title.value,
                        percent: Percent.value,
                    });

                    Dialog.close();
                });

                Dialog.open();
            });
        },

        /**
         * Create a edit / add entry dialog
         *
         * @return {Promise}
         */
        $createDialog: function () {
            var self = this;

            return new Promise(function (resolve) {
                var Dialog = new QUIConfirm({
                    title: QUILocale.get(pb, 'brick.progressbar.entires.adddialog.title'),
                    icon: 'fa fa-edit',
                    maxWidth: 800,
                    maxHeight: 600,
                    events: {
                        onOpen: function (Win) {
                            Win.Loader.show();
                            Win.getContent().set('html', '');


                            var prefix = 'bricks.progressbar.settings.createPopup.',
                                Container = new Element('div', {
                                    html: Mustache.render(templateEntry, {
                                        fieldTitle: QUILocale.get(pb, prefix + 'title'),
                                        fieldPercent: QUILocale.get(pb, prefix + 'percent'),
                                    }),
                                    'class': 'quiqqer-bricks-progressbar-settings-entry'
                                }).inject(Win.getContent());

                            Win.IsDisabledSwitch = new QUISwitch({
                                name: 'isDisabled',
                                status: false
                            }).inject(Container.getElement('#isDisabledWrapper'));

                            Win.NewTabSwitch = new QUISwitch({
                                name: 'newTab'
                            }).inject(Container.getElement('#newTabWrapper'));


                            QUI.parse(Container).then(function () {
                                return ControlsUtils.parse(Container);
                            }).then(function () {
                                var controls = QUI.Controls.getControlsInElement(Container),
                                    project = self.getAttribute('project');

                                controls.each(function (Control) {
                                    if (Control === self) {
                                        return;
                                    }

                                    if ("setProject" in Control) {
                                        Control.setProject(project);
                                    }
                                });

                                Win.fireEvent('openAfterCreate', [Win]);

                                moofx(Container).animate({
                                    opacity: 1,
                                    top: 0
                                }, {
                                    duration: 250,
                                    callback: function () {
                                        resolve(Container);
                                        Win.Loader.hide();
                                    }
                                });
                            });
                        }
                    }
                });

                resolve(Dialog);
            });
        }
    });
});
