/*
 *    Copyright (C) 2014  Kaer 
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
 *    Modern Calc 0.0.1, Kaer (C) 2014 Kaer
 *    Modern Calc comes with ABSOLUTELY NO WARRANTY.
 *
 *    Author: Kaer (the.thin.king.way+2014@gmail.com)
 *    Project url: https://github.com/kaer/gnome-shell-extension-modern-calc
 *
 */

const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Util = imports.misc.util;

const Me = ExtensionUtils.getCurrentExtension();
const ModernCalc = Me.imports.modern_calc;
const PrefsKeys = Me.imports.prefs_keys;
const Utils = Me.imports.utils;

const IndicatorButton = new Lang.Class({
    Name: 'IndicatorButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "ModernCalcIndicator");
        
        this._modernCalc = new ModernCalc.ModernCalc();

        let icon = new St.Icon({icon_name: Utils.ICONS.indicator, style_class: 'system-status-icon'});
        this.actor.add_child(icon);

        this._createContextMenu();

        if(Utils.getSettings().get_boolean(PrefsKeys.ENABLE_INDICATOR_KEY)){
            this._showIndicator();
        }
        this._keybindingsEnabled = false;

        this._enableKeybindings();
    },

    _onButtonPress: function(actor, event) {
        let button = event.get_button();

        switch(button) {
            case Clutter.BUTTON_SECONDARY:
                this.menu.toggle();
                break;
            case Clutter.BUTTON_MIDDLE:
                break;
            default:
                this._modernCalc.toggle();
                break;
        }
    },

    _createContextMenu: function() {

        let preferences_item = new PopupMenu.PopupMenuItem("Preferences");
        preferences_item.connect("activate", Lang.bind(this, function() {
            this._modernCalc.hide();
            Utils.launch_extension_prefs(Me.uuid);
        }));
        this.menu.addMenuItem(preferences_item);        
    },

    _enableKeybindings: function() {
        this._keybindingsEnabled = Utils.SETTINGS.get_boolean(PrefsKeys.ENABLE_SHORTCUTS_KEY);

        if(this._keybindingsEnabled){

            Main.wm.addKeybinding(
                PrefsKeys.SHOW_APP_SHORTCUT_KEY,
                Utils.SETTINGS,
                Meta.KeyBindingFlags.NONE,
                Shell.KeyBindingMode.NORMAL |
                Shell.KeyBindingMode.MESSAGE_TRAY |
                Shell.KeyBindingMode.OVERVIEW,
                Lang.bind(this, function() {
                    this._modernCalc.toggle();
                })
            );

        }
    },

    _removeKeybindings: function() {
        if(this._keybindingsEnabled){
            Main.wm.removeKeybinding(PrefsKeys.SHOW_APP_SHORTCUT_KEY);
        }
    },

    _showIndicator: function(){
        Main.panel.addToStatusArea('ModernCalcIndicator', this);
    },


    destroy: function() {
        this._removeKeybindings();
        this._modernCalc.destroy();
        this.parent();
    }
});


// OVERRIDES --------------------------------------------------------------------------------------
let appButton = null;
function init(extension) { 

}

function enable() {
    if(appButton === null) {
        appButton = new IndicatorButton();
    }
}

function disable() {
    if(appButton !== null) {
        appButton.destroy();
        appButton = null;
    }
}