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
 *
 *    Note: this file contains codes got from util.js of
 *    gpaste_integration@awamper.gmail.com and
 *    Gnote/Tomboy Integration
 */

const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

const SETTINGS = getSettings();



/**
 * getSettings:
 * @schema: (optional): the GSettings schema id
 *
 * Builds and return a GSettings schema for @schema, using schema files
 * in extensionsdir/schemas. If @schema is not provided, it is taken from
 * metadata['settings-schema'].
 */
function getSettings(schema) {
    let extension = ExtensionUtils.getCurrentExtension();

    schema = schema || extension.metadata['settings-schema'];

    const GioSSS = Gio.SettingsSchemaSource;

    // check if this extension was built with "make zip-file", and thus
    // has the schema files in a subfolder
    // otherwise assume that extension has been installed in the
    // same prefix as gnome-shell (and therefore schemas are available
    // in the standard folders)
    let schemaDir = extension.dir.get_child('schemas');
    let schemaSource;

    if(schemaDir.query_exists(null)) {
        schemaSource = GioSSS.new_from_directory(
            schemaDir.get_path(),
            GioSSS.get_default(),
            false
        );
    }
    else {
        schemaSource = GioSSS.get_default();
    }

    let schemaObj = schemaSource.lookup(schema, true);

    if(!schemaObj)
        throw new Error(
            _("Schema")+' '+schema+' '+_("could not be found for extension")+' '
            +extension.metadata.uuid+'. '+_("Please check your installation.")
        );

    return new Gio.Settings({ settings_schema: schemaObj });
}

function is_blank(str) {
    return (!str || /^\s*$/.test(str));
}

// replaces matches of a substring
function replaceAll(text, term, sub){
    if(text == undefined) return undefined;
    if(term == undefined) return text;
    if(sub == undefined) sub = '';

    return text.split(term).join(sub);
}


// removes spaces from both sides of a string
function trimText(term){
    if(term != undefined && term != null && term.length > 0){
        var pos = -1;

        // ltrim
        for(var i=0; i< term.length; i++){
            if(term.charAt(i) == ' '){
                pos++;
            } else {
                break;
            }
        }
        if(pos != -1){
            term = term.substring(pos+1);
        }

        // rtrim
        pos = term.length;
        for(var i = term.length-1; i >= 0; i--){
            if(term.charAt(i) == ' '){
                pos--;
            } else {
                break;
            }
        }
        if(pos != term.length){
            term = term.substring(0, pos);
        }
    }

    return term;
}