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
 *    Modern Calc, Kaer (C) 2014-2015 Kaer
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

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;
const Convenience = Me.imports.convenience;

const IndicatorButton = new Lang.Class({
    Name: 'IndicatorButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "ModernCalcIndicator");
        
        this._preferences = Utils.getSettings();

        this._modernCalc = new ModernCalc.ModernCalc();

        let icon = new St.Icon({icon_name: 'accessories-calculator-symbolic', style_class: 'system-status-icon'});
        this.actor.add_child(icon);


        this._createContextMenu();

        this._showingIndicator = false;
        this._indicatorAdded = false;
        this._showHideIndicator();
        
        this._keybindingsEnabled = false;

        this._enableKeybindings();

        this._signals = null;
        this._connectSignals();
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
    
    // GSHELL 3.14
    _onEvent: function(actor, event) {
        if (event.type() == Clutter.EventType.BUTTON_PRESS){
            
            switch(event.get_button()) {
                case Clutter.BUTTON_SECONDARY:
                    this.menu.toggle();
                    break;
                case Clutter.BUTTON_MIDDLE:
                    break;
                default:
                    this._modernCalc.toggle();
                    break;
            }
        }
    },

    _createContextMenu: function() {

        let preferences_item = new PopupMenu.PopupMenuItem(_("Preferences"));
        preferences_item.connect("activate", Lang.bind(this, function() {
            this._modernCalc.hide();
            Util.spawn(["gnome-shell-extension-prefs", Me.uuid]);
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

    _showHideIndicator: function(){

        if(Utils.getSettings().get_boolean(PrefsKeys.ENABLE_INDICATOR_KEY)){
            
            // show the indicator
            if(!this._indicatorAdded){
                Main.panel.addToStatusArea('ModernCalcIndicator', this);
                this._indicatorAdded = true;
                
            } else {
                this.actor.show();
            }

            this._showingIndicator = true;

        } else {

            // hide the indicator
            if(this._showingIndicator){
                if (this.menu)
                    this.menu.close();

                this.actor.hide();
            }

            this._showingIndicator = false;
        }
    },


    destroy: function() {
        this._disconnectSignals();

        this._removeKeybindings();
        this._modernCalc.destroy();
        this.parent();
    },

    _connectSignals: function(){
        if(this._signals === null)
                this._signals = [];

        this._signals.push (
            this._preferences.connect("changed::" + PrefsKeys.ENABLE_INDICATOR_KEY, Lang.bind(this, this._showHideIndicator))
        );
    },

    _disconnectSignals: function(){

        let pref = this._preferences;

        if (this._signals !== null) {
            this._signals.forEach(function(signal) {
                if (signal) 
                    pref.disconnect(signal);
            });
        }

        this._signals = null;
    }
});


// OVERRIDES --------------------------------------------------------------------------------------
let appButton = null;
function init(extension) { 
	Convenience.initTranslations("modern-calc");
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
