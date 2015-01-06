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
const Mainloop = imports.mainloop;
const Panel = imports.ui.panel;
const Params = imports.misc.params;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();


const StatusBar = new Lang.Class({
    Name: "StatusBar",
    
    _init: function(params) {
        this.params = Params.parse(params, {
            calc_app: false,
        });

        this.actor = new St.BoxLayout({
            style_class: 'status-bar',
            vertical: false
        });

        this._prepareInterface();

        this._iconPseudoClass = '';
    },

    _prepareInterface: function(){
        
        this._statusIcon = new St.Icon({
            icon_name: '',
            style_class: 'icon',
            visible: false
        });

        this._statusLabel = new St.Label({
            style_class: 'message',
            text: '',
            visible: false
        });

        this.actor.add(this._statusIcon, {
            expand: false,
            y_align: St.Align.MIDDLE,
            x_align: St.Align.START
        });

        this.actor.add(this._statusLabel, { 
            expand: true,
            y_align: St.Align.START,
            x_align: St.Align.START
        });
    },

    set_message: function(message_type, message){
        // valid message types: information, error,
        // question and warning

        if(message_type == undefined || message == undefined) return;

        this._statusLabel.text = message;
        this._statusLabel.visible = true;

        this._setMessageIcon(message_type);
    },

    clear_message: function(){
        this._statusIcon.visible = false;
        this._statusLabel.visible = false;
        this._statusLabel.text = '';

        this._statusIcon.remove_style_pseudo_class(this._iconPseudoClass); //TODO verify if there is a function to remove all pseudo classes of an actor
        this._iconPseudoClass = '';
    },

    _setMessageIcon: function(icon_name){
        this._statusIcon.remove_style_pseudo_class(this._iconPseudoClass);

        if(icon_name == undefined) return;

        if(icon_name == 'error' || icon_name == 'information' ||
            icon_name == 'warning' || icon_name == 'question'){

            if(icon_name == 'error' || icon_name == 'warning'){
                this._statusIcon.add_style_pseudo_class(icon_name);

                this._iconPseudoClass = icon_name;
            }

            this._statusIcon.set_icon_name('dialog-'+icon_name+'-symbolic');
            this._statusIcon.visible = true;
        }
    },

    destroy: function(){
        this.actor.destroy();
    }

});

//Signals.addSignalMethods(StatusBar.prototype);
