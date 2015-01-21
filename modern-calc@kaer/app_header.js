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
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

const AppHeader = new Lang.Class({
    Name: "AppHeader",
    
    _init: function(params) {

        this.actor = new St.BoxLayout({
            style_class: 'header-group',
            vertical: true
        });

        this._initInterface();
    },

    _initInterface: function(){

        this._appNameLabel = new St.Label({
            style_class: 'app-name',
            text: _("Modern Calc")+' v0.0.1' //TODO get version
        });

        this.actor.add(this._appNameLabel,{
            expand: false,
            y_align: St.Align.START,
            x_align: St.Align.START
        });
    },

    destroy: function(){
        this.actor.destroy();
    }

});

//Signals.addSignalMethods(AppHeader.prototype);
