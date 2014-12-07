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
 *    Modern Calc 4, Kaer (C) 2014 Kaer
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
const ModernCalcModule = Me.imports.modern_calc_module;
const Utils = Me.imports.utils;


const UnitConverterModule = new Lang.Class({
    Name: "UnitConverterModule",
    Extends: ModernCalcModule.ModernCalcModule,

    _init: function(params) {

        this.params = Params.parse(params, {
            app: false
        });

        let parentParams = {
            app: this.params.app,
            style_class: 'unit-converter-module',
            module_name: 'unit_converter',
            toolbar_button_label: 'Converter'
        };
 
        this.parent(parentParams);
    },

    _prepareInterface: function(){
        // test
        this._testContent = new St.Label({
            text: 'UNIT CONVERTER LOADED'
        });

        this.actor.add(this._testContent, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
    }

});
