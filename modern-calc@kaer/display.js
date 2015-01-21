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

const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const Tweener = imports.ui.tweener;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Panel = imports.ui.panel;
const Params = imports.misc.params;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;


const Display = new Lang.Class({
    Name: "Display",
    
    _init: function(params) {

        this.params = Params.parse(params, {
            calc_app: false
        });

        this.actor = new St.BoxLayout({
            style_class: 'display-group',
            vertical: true
        });

        this._expression_entry = false;

        this._initControls();
        this._initInterface();

        this._lastInsertedChar = undefined;
    },

    _initControls: function() {
        this._expression_entry = new St.Entry({
            style_class: "calc-entry",
            hint_text: _("Type your Expression"),
            track_hover: true,
            can_focus: true
        });
        
        
        this._expression_entry.clutter_text.connect('key-press-event', Lang.bind(this, this._entryKeyPress));
        this._expression_entry.clutter_text.connect('text-changed', Lang.bind(this, this._expressionChanged));

        this._display_result = new St.Label({
            style_class: 'display-result',
            text: '0'
        });

    },

    _initInterface: function(){

        this.actor.add(this._expression_entry,{
            expand: true,
            y_align: St.Align.START,
            x_align: St.Align.START
        });

        this.actor.add(this._display_result,{
             expand: true,
            y_align: St.Align.START,
            x_align: St.Align.START
        });
    },


    //TODO improve
    insert_data: function(value){
        if(value == undefined) return;

        
        if(this._expression_entry){
            
            // EXP (fill with n zeros) if it is a number
            // otherwise EXP function will be ignored
            if(this.params.calc_app.has_exp_flag){
                this.params.calc_app.remove_exp_flag();

                // fill with zeros if the last inserted char is a number
                if(this.last_inserted_char !== undefined && /^[0-9]+$/.test(this.last_inserted_char)){

                    // verify if value is a number and greater than 0
                    if (/^[0-9]$/.test(value) && value > 0){

                        let zeroes = '';

                        for(let i=0; i<value; i++){ zeroes += '0'; }
                            this._insert_value(zeroes, true);
                        return;
                    }
                }
            }

            
            let entryValue = this._expression_entry.text;

            // if isnt a number nor brackets and the last symbol is equal current, didn't insert 
            // to avoid a future syntax error
            if ( value.length == 1   && /^[0-9()]+$/.test(value) == false && 
                entryValue.substring(entryValue.length-1, entryValue.length) == value ){
                return;

            }

            this._insert_value(value, true);
        }

    },

    _insert_value: function(value, memorize_last_char){
        let cursor_pos = this._expression_entry.clutter_text.get_cursor_position();
            
        this.focus_entry();
        this._expression_entry.clutter_text.insert_text(value, cursor_pos);

        if(memorize_last_char){
            this._lastInsertedChar = value;
        } else {
            this._lastInsertedChar = '';
        }
    },

    focus_entry: function(){
        this._expression_entry.grab_key_focus();
    },

    _expressionChanged: function(){
        if(this.params.calc_app){
            this.params.calc_app.clear_status_message();
        }
    },

    _entryKeyPress: function(actor, event) {
        let key = event.get_key_symbol();
        // Enter
        if(key == Clutter.KEY_Return || key == Clutter.KEY_KP_Enter || key == Clutter.KEY_ISO_Enter){
            if(this.params.calc_app){
                this.params.calc_app.calculate();
            }
        }
    },

    get_entry_data: function(){
        return this._expression_entry.text;
    },

    set_current_result: function(result){
        if(result){
            if(result.hasOwnProperty('expression') && result.hasOwnProperty('result')){
            this._expression_entry.text = result.expression;

            this._display_result.text = result.result;
            }
        }
    },

    get_result: function(){
        return this._display_result.text;
    },

    clear_result: function(){
        this._display_result.text = '';
    },

    delete_before_cursor: function(){

        if(this._expression_entry){
            //FIXME erase the text or command before the cursor's position
            let text = this._expression_entry.text;

            if(text.length>0){
                // remove a char before caret
                let cursor_pos = this._expression_entry.clutter_text.get_cursor_position();

                if(cursor_pos>0){
                    /*
                    this.focus_entry();
                    */
                }
                
            }
        }
    },

    clear_entry: function(){
        if(this._expression_entry){
            this._expression_entry.text = '';
            this._display_result.text = '0';
            this._lastInsertedChar = undefined;
        }
    },


    destroy: function(){
        this.actor.destroy();
    },

    get expression_entry(){
        return this._expression_entry;
    },

    get last_inserted_char(){
        if(this._lastInsertedChar == undefined)
            return '';
        else
            return this._lastInsertedChar;
    }
    
});
