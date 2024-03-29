/*
 *    Copyright (C) 2021  Kaer 
 *
 *    This program is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation; either version 2 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License along
 *    with this program; if not, write to the Free Software Foundation, Inc.,
 *    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 *    
 *    Modern Calc, Kaer (C) 2014-2021 Kaer
 *    Modern Calc comes with ABSOLUTELY NO WARRANTY.
 *
 *    Author: Kaer
 *    Project url: https://github.com/kaer/gnome-shell-extension-modern-calc
 *
 *    File based on pref.js of Gnote/Tomboy integration
 *
 */

const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Params = imports.misc.params;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const PrefsKeys = Me.imports.prefs_keys;
const Utils = Me.imports.utils;
const Constants = Me.imports.constants;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;
const Convenience = Me.imports.convenience;

var PrefsGrid = new GObject.Class({
    Name: 'Prefs.Grid',
    GTypeName: 'PrefsGrid',
    Extends: Gtk.Grid,

    _init: function(settings, params) {
        this.parent(params);
        this._settings = settings;
        this.margin = this.row_spacing = this.column_spacing = 10;
        this._rownum = 0;
    },

    add_entry: function(text, key) {
        let item = new Gtk.Entry({
            hexpand: false
        });
        item.text = this._settings.get_string(key);
        this._settings.bind(key, item, 'text', Gio.SettingsBindFlags.DEFAULT);

        return this.add_row(text, item);
    },

    add_shortcut: function(text, settings_key) {
        let item = new Gtk.Entry({
            hexpand: false
        });
        item.set_text(this._settings.get_strv(settings_key)[0]);
        item.connect('changed', Lang.bind(this, function(entry) {
            let [key, mods] = Gtk.accelerator_parse(entry.get_text());

            if(Gtk.accelerator_valid(key, mods)) {
                let shortcut = Gtk.accelerator_name(key, mods);
                this._settings.set_strv(settings_key, [shortcut]);
            }
        }));

        return this.add_row(text, item);
    },

    add_boolean: function(text, key) {
        let item = new Gtk.Switch({
            active: this._settings.get_boolean(key)
        });
        this._settings.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);

        return this.add_row(text, item);
    },

    add_combo: function(text, key, list, type) {
        let item = new Gtk.ComboBoxText();

        for(let i = 0; i < list.length; i++) {
            let title = list[i].title.trim();
            let id = list[i].value.toString();
            item.insert(-1, id, title);
        }

        if(type === 'string') {
            item.set_active_id(this._settings.get_string(key));
        }
        else {
            item.set_active_id(this._settings.get_int(key).toString());
        }

        item.connect('changed', Lang.bind(this, function(combo) {
            let value = combo.get_active_id();

            if(type === 'string') {
                if(this._settings.get_string(key) !== value) {
                    this._settings.set_string(key, value);
                }
            }
            else {
                value = parseInt(value, 10);

                if(this._settings.get_int(key) !== value) {
                    this._settings.set_int(key, value);
                }
            }
        }));

        return this.add_row(text, item);
    },

    add_spin: function(label, key, adjustment_properties, spin_properties) {
        adjustment_properties = Params.parse(adjustment_properties, {
            lower: 0,
            upper: 100,
            step_increment: 100
        });
        let adjustment = new Gtk.Adjustment(adjustment_properties);

        spin_properties = Params.parse(spin_properties, {
            adjustment: adjustment,
            numeric: true,
            snap_to_ticks: true
        }, true);
        let spin_button = new Gtk.SpinButton(spin_properties);

        spin_button.set_value(this._settings.get_int(key));
        spin_button.connect('value-changed', Lang.bind(this, function(spin) {
            let value = spin.get_value_as_int();

            if(this._settings.get_int(key) !== value) {
                this._settings.set_int(key, value);
            }
        }));

        return this.add_row(label, spin_button, true);
    },

    add_row: function(text, widget, wrap) {
        let label = new Gtk.Label({
            label: text,
            hexpand: true,
            halign: Gtk.Align.START
        });
        label.set_line_wrap(wrap || false);

        this.attach(label, 0, this._rownum, 1, 1); // col, row, colspan, rowspan
        this.attach(widget, 1, this._rownum, 1, 1);
        this._rownum++;

        return widget;
    },

    add_item: function(widget, col, colspan, rowspan) {
        this.attach(
            widget,
            col || 0,
            this._rownum,
            colspan || 2,
            rowspan || 1
        );
        this._rownum++;

        return widget;
    },

    add_range: function(label, key, range_properties) {
        range_properties = Params.parse(range_properties, {
            min: 0,
            max: 100,
            step: 10,
            mark_position: 0,
            add_mark: false,
            size: 200,
            draw_value: true
        });

        let range = Gtk.Scale.new_with_range(
            Gtk.Orientation.HORIZONTAL,
            range_properties.min,
            range_properties.max,
            range_properties.step
        );
        range.set_value(this._settings.get_int(key));
        range.set_draw_value(range_properties.draw_value);

        if(range_properties.add_mark) {
            range.add_mark(
                range_properties.mark_position,
                Gtk.PositionType.BOTTOM,
                null
            );
        }

        range.set_size_request(range_properties.size, -1);

        range.connect('value-changed', Lang.bind(this, function(slider) {
            this._settings.set_int(key, slider.get_value());
        }));

        return this.add_row(label, range, true);
    }
});

const KeybindingsWidget = new GObject.Class({
    Name: 'Keybindings.Widget',
    GTypeName: 'KeybindingsWidget',
    Extends: Gtk.Box,

    _init: function(keybindings) {
        this.parent();
        this.set_orientation(Gtk.Orientation.VERTICAL);

        this._keybindings = keybindings;

        let scrolled_window = new Gtk.ScrolledWindow();
        scrolled_window.set_policy(
            Gtk.PolicyType.AUTOMATIC,
            Gtk.PolicyType.AUTOMATIC
        );

        this._columns = {
            NAME: 0,
            ACCEL_NAME: 1,
            MODS: 2,
            KEY: 3
        };

        this._store = new Gtk.ListStore();
        this._store.set_column_types([
            GObject.TYPE_STRING,
            GObject.TYPE_STRING,
            GObject.TYPE_INT,
            GObject.TYPE_INT
        ]);

        this._tree_view = new Gtk.TreeView({
            model: this._store,
            hexpand: true,
            vexpand: true
        });
        this._tree_view.get_selection().set_mode(Gtk.SelectionMode.SINGLE);

        let action_renderer = new Gtk.CellRendererText();
        let action_column = new Gtk.TreeViewColumn({
            'title': _("Action"),
            'expand': true
        });
        action_column.pack_start(action_renderer, true);
        action_column.add_attribute(action_renderer, 'text', 1);
        this._tree_view.append_column(action_column);

        let keybinding_renderer = new Gtk.CellRendererAccel({
            'editable': true,
            'accel-mode': Gtk.CellRendererAccelMode.GTK
        });
        keybinding_renderer.connect('accel-edited',
            Lang.bind(this, function(renderer, iter, key, mods) {
                let value = Gtk.accelerator_name(key, mods);
                let [success, iterator ] =
                    this._store.get_iter_from_string(iter);

                if(!success) {
                    printerr("Can't change keybinding");
                }

                let name = this._store.get_value(iterator, 0);

                this._store.set(
                    iterator,
                    [this._columns.MODS, this._columns.KEY],
                    [mods, key]
                );
                Utils.SETTINGS.set_strv(name, [value]);
            })
        );

        let keybinding_column = new Gtk.TreeViewColumn({
            'title': _("Modify")
        });
        keybinding_column.pack_end(keybinding_renderer, false);
        keybinding_column.add_attribute(
            keybinding_renderer,
            'accel-mods',
            this._columns.MODS
        );
        keybinding_column.add_attribute(
            keybinding_renderer,
            'accel-key',
            this._columns.KEY
        );
        this._tree_view.append_column(keybinding_column);

        scrolled_window.add(this._tree_view);
        this.add(scrolled_window);

        this._refresh();
    },

    _refresh: function() {
        this._store.clear();

        for(let settings_key in this._keybindings) {
            let [key, mods] = Gtk.accelerator_parse(
                Utils.SETTINGS.get_strv(settings_key)[0]
            );

            let iter = this._store.append();
            this._store.set(iter,
                [
                    this._columns.NAME,
                    this._columns.ACCEL_NAME,
                    this._columns.MODS,
                    this._columns.KEY
                ],
                [
                    settings_key,
                    this._keybindings[settings_key],
                    mods,
                    key
                ]
            );
        }
    }
});

const PrefsWidget = new GObject.Class({
    Name: 'Prefs.Widget',
    GTypeName: 'PrefsWidget',
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);
        this._settings = Utils.getSettings();

        let notebook = new Gtk.Notebook({
            margin_left: 5,
            margin_top: 5,
            margin_bottom: 5,
            margin_right: 5,
            expand: true
        });

        let appearance_page = this._get_appearance_page();
        let module_page = this._get_modules_page();
        let shortcuts_page = this._get_shortcuts_page();
        let calc_page = this._get_calc_page();

        notebook.append_page(appearance_page.page, appearance_page.label);
        notebook.append_page(module_page.page, module_page.label);
        notebook.append_page(calc_page.page, calc_page.label);
        notebook.append_page(shortcuts_page.page, shortcuts_page.label);

        this.add(notebook);
    },

    _get_appearance_page: function() {
        let page_label = new Gtk.Label({
            label: _("Appearance")
        });
        let page = new PrefsGrid(this._settings);

        let themes = [
            {
                title: _("Default"),
                value: Constants.THEMES.DEFAULT
            },
            {
                title: _("Light"),
                value: Constants.THEMES.LIGHT
            }
        ];
        page.add_combo(
            _("Theme")+':',
            PrefsKeys.THEME_KEY,
            themes,
            'string'
        );

        page.add_boolean(
            _("Show indicator icon")+':',
            PrefsKeys.ENABLE_INDICATOR_KEY
        );

        page.add_boolean(
            _("Enable reveal animation")+':',
            PrefsKeys.ENABLE_REVEAL_ANIMATION_KEY
        );

        page.add_boolean(
            _("Enable general transparency")+':',
            PrefsKeys.ENABLE_TRANSPARENCY_KEY
        );

        page.add_range(
            _("General opacity [%]")+':',
            PrefsKeys.WINDOW_OPACITY_VALUE_KEY,
            {
                min: 20,
                max: 100,
                step: 1,
                size: 250
            }
        );

        page.add_boolean(
            _("Enable background transparency")+':',
            PrefsKeys.ENABLE_BACKGROUND_TRANSPARENCY_KEY
        );

        page.add_range(
            _("Background opacity [%]")+':',
            PrefsKeys.BACKGROUND_OPACITY_VALUE_KEY,
            {
                min: 0,
                max: 100,
                step: 1,
                size: 250
            }
        );

        page.add_range(
            _("Window width [%]")+':',
            PrefsKeys.WINDOW_WIDTH_VALUE_KEY,
            {
                min: 10,
                max: 50,
                step: 1,
                size: 250
            }
        );


        let result = {
            label: page_label,
            page: page
        };
        return result;
    },

    _get_modules_page: function() {
        let page_label = new Gtk.Label({
            label: _("Modules")
        });
        let page = new PrefsGrid(this._settings);

        let modules = [
            {
                title: _("Calculator"),
                value: Constants.MODULES.CALCULATOR
            },
            {
                title: _("Unit converter"),
                value: Constants.MODULES.UNIT_CONVERTER
            }
        ];
        page.add_combo(
            _("Default module")+':',
            PrefsKeys.DEFAULT_MODULE_KEY,
            modules,
            'string'
        );

        page.add_boolean(
            _("Enable Calculator")+':',
            PrefsKeys.CALCULATOR_ENABLED_KEY
        );

        page.add_boolean(
            _("Enable Unit Converter")+':',
            PrefsKeys.UNIT_CONVERTER_ENABLED_KEY
        );


        let result = {
            label: page_label,
            page: page
        };
        return result;
    },


    _get_shortcuts_page: function() {
        let page_label = new Gtk.Label({
            label: _("Shortcuts")
        });
        let page = new PrefsGrid(this._settings);

        let enable_shortcuts = page.add_boolean(
            _("Shortcuts")+':',
            PrefsKeys.ENABLE_SHORTCUTS_KEY
        );
        enable_shortcuts.connect('notify::active',
            Lang.bind(this, function(s) {
                let active = s.get_active();
                keybindings_widget.set_sensitive(active);
            })
        );

        let shortcuts_enabled = this._settings.get_boolean(
            PrefsKeys.ENABLE_SHORTCUTS_KEY
        );

        let keybindings = {};
        keybindings[PrefsKeys.SHOW_APP_SHORTCUT_KEY] = _("Show/hide the extension");

        //TODO remove calc not used keybinds
        // calc
        //keybindings[PrefsKeys.CALC_CLEAR_SHORTCUT_KEY] = 'Calculator: clear expression';
        //keybindings[PrefsKeys.CALC_COPY_RESULT_SHORTCUT_KEY] = 'Calculator: copy displayed result';


        let keybindings_widget = new KeybindingsWidget(keybindings);
        keybindings_widget.set_sensitive(shortcuts_enabled);
        page.add_item(keybindings_widget)

        let result = {
            label: page_label,
            page: page
        };
        return result;
    },

    _get_calc_page: function() {
        let page_label = new Gtk.Label({
            label: _("Calculator")
        });
        let page = new PrefsGrid(this._settings);

        let decimal_marks = [
            {
                title: _("Undefined"),
                value: Constants.DECIMAL_MARK.UNSET
            },
            {
                title: _("Dot"),
                value: Constants.DECIMAL_MARK.DOT
            },
            {
                title: _("Comma"),
                value: Constants.DECIMAL_MARK.COMMA
            }
        ];

        page.add_combo(
            _("Decimal Mark")+':',
            PrefsKeys.CALC_DECIMAL_MARK_KEY,
            decimal_marks,
            'string'
        );

        let result = {
            label: page_label,
            page: page
        };
        return result;
    }

});

function init(metadata) {
	Convenience.initTranslations("modern-calc");
}

function buildPrefsWidget() {
    let widget = new PrefsWidget();
    widget.show_all();

    return widget;
}
