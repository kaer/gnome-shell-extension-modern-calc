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
 *
 *    Note: this file contains codes got from util.js of
 *    gpaste_integration@awamper.gmail.com and
 *    Gnote/Tomboy Integration
 */

const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;

const ICONS = {
    indicator: 'list-add-symbolic', //TODO change by a calculator icon
};

function launch_extension_prefs(uuid) {
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    app.launch(global.display.get_current_time_roundtrip(),
               ['extension:///' + uuid], -1, null);
}


function is_blank(str) {
    return (!str || /^\s*$/.test(str));
}

