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
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Panel = imports.ui.panel;
const Params = imports.misc.params;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();
const Clipboard = St.Clipboard.get_default();
const Utils = Me.imports.utils;

const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;



const ModernCalcModule = new Lang.Class({
    Name: "ModernCalcModule",

    _init: function(params) {

        this.params = Params.parse(params, {
            app: false,
            module_name: 'abstract_module',
            style_class: 'module',
            vertical_mode: true,
            toolbar_button_label: 'button' //TODO change button settings later and put icon
        });

        this._moduleName = this.params.module_name;

        this.keybindings_enabled = false;

        // the button wich will be integrated to app toolbar
        this._prepareToolbarButton(this.params.toolbar_button_label);

        this._actor = new St.BoxLayout({
            style_class: this.params.style_class,
            vertical: this.params.vertical_mode
        });

        this._prepareInterface();


    },

    _prepareToolbarButton: function(label){
        this._toolbarButton = new St.Button({
            label: label,
            style_class: 'toolbar-button'
        });

        this._toolbarButton.connect("clicked", Lang.bind(this, this._toolbarButtonClick));
    },

    _prepareInterface: function(){

    },

    _toolbarButtonClick: function(){
        if(this.params.app){
            this.params.app.show_module(this._moduleName);
        }
    },

    get_toolbar_button: function(){
        return this._toolbarButton;
    },

    get_module_name: function(){
        return this._moduleName;
    },

    _enableKeybindings: function() {

    },

    _removeKeybindings: function() {

    },

    on_activate: function(){
        this._enableKeybindings();
    },

    on_deactivate: function(){
        this._removeKeybindings();
    },

    on_key_press_event: function(o, e){

    },

    copy_to_clipboard: function(text){
        if(text !== undefined && text !== null){
            Clipboard.set_text(CLIPBOARD_TYPE, text);
        }
    },

    paste_from_clipboard: function(){
        Clipboard.get_text(CLIPBOARD_TYPE, Lang.bind(this, function(clipboard, text) {
            this.handle_paste_data(clipboard, text);
        }));
    },

    handle_paste_data: function(clipboard, text){

    },

    destroy: function(){
        this._actor.destroy();
    },

    set_status_message: function(msg_type, msg){
        if(this.params.app){
            this.params.app.set_status_message(msg_type, msg);
        }
    },

    clear_status_message: function(){
        if(this.params.app){
            this.params.app.clear_status_message();
        }
    },

    show_message: function(messageType, title, message, buttonType){
        if(this.params.app){
            this.params.app.show_message(messageType, title, message, buttonType);
        }
    },

    get_message_result: function(){
        if(this.params.app){
            this.params.app.get_message_result();
        }
        
        return null;
    },

    set actor(actor){
        this._actor = actor;
    },

    get actor(){
        return this._actor;
    }
});
