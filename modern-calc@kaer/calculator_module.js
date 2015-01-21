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
 *    NOTE: The calculator core present in this file is credited to
 *     the author of GCalcSearch (https://github.com/war1025/GCalcSearch)
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
const BasicCalcButtonGrid = Me.imports.basic_calc_button_grid;
const CalculusHistory = Me.imports.calculus_history;
const Display = Me.imports.display;
const ModernCalcModule = Me.imports.modern_calc_module;
const PrefsKeys = Me.imports.prefs_keys;
const Utils = Me.imports.utils;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

let octal = /(^|\s|[^0-9a-fA-Fxb\.]+)0([0-7]+)/g;
let binary = /(^|\s|[^0-9a-fA-Fxb]+)0b([0-1]+)/g;
let hex = /(^|\s|[^0-9a-fA-Fxb]+)0x([0-9a-fA-F]+)/g;

let radians = /r(sin|cos|tan)\(/g;
let radians2 = /ra(sin|cos|tan)\(/g;

let changeBase = /in (hex|octal|binary)$/i;
let bases = {
    "hex" : 16,
    "octal" : 8,
    "binary" : 2
};
let prefixes = {
    "16" : "0x",
    "10" : "",
    "8" : "0",
    "2" : "0b"
};


const CalculatorModule = new Lang.Class({
    Name: "CalculatorModule",
    Extends: ModernCalcModule.ModernCalcModule,

    _init: function(params) {

        this.params = Params.parse(params, {
            app: false
        });

        let parentParams = {
            app: this.params.app,
            style_class: 'calc-module',
            module_name: 'calculator',
            toolbar_button_label: _("Calc")
        };
 
        this._history = null;
        this._display = null;
        this._basicCalcButtonGrid = null;

        this.parent(parentParams);

        this.actor.connect('key-press-event', Lang.bind(this, this._onKeyPressEvent));

        this._expFlag = false;
    },

    _prepareInterface: function(){
        // add history
        this._history = new CalculusHistory.CalculusHistory({
            calc_app: this
        });
        this.actor.add(this._history.actor, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        // add display
        this._display = new Display.Display({
            calc_app: this
        });
        this.actor.add(this._display.actor, {
            expand: false,
            y_align: St.Align.START,
            x_align: St.Align.START
        });

        // add button grid
        this._basicCalcButtonGrid = new BasicCalcButtonGrid.BasicCalcButtonGrid({
            calc_app: this
        });

        this.actor.add(this._basicCalcButtonGrid.actor, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
       
    },

    flag_exp: function(){
        this._expFlag = true;
    },

    remove_exp_flag: function(){
        this._expFlag = false;
    },

    _onKeyPressEvent: function(actor, event) {
        let key = event.get_key_symbol();
        if(key == Clutter.KEY_Return || key == Clutter.KEY_KP_Enter || key == Clutter.KEY_ISO_Enter){
            this.calculate();
            //this.emit('connect');
        }
    },

    _enableKeybindings: function() {

        if(this.params.app && this.params.app.preferences.get_boolean(PrefsKeys.ENABLE_SHORTCUTS_KEY)){

            // clear
            /*Main.wm.addKeybinding(
                PrefsKeys.CALC_CLEAR_SHORTCUT_KEY,
                Utils.SETTINGS,
                Meta.KeyBindingFlags.NONE,
                Shell.KeyBindingMode.NORMAL |
                Shell.KeyBindingMode.MESSAGE_TRAY |
                Shell.KeyBindingMode.OVERVIEW,
                Lang.bind(this, function() {
                   this._display.clear_entry();
                })
            );

            // copy displayed result
            Main.wm.addKeybinding(
                PrefsKeys.CALC_COPY_RESULT_SHORTCUT_KEY,
                Utils.SETTINGS,
                Meta.KeyBindingFlags.NONE,
                Shell.KeyBindingMode.NORMAL |
                Shell.KeyBindingMode.MESSAGE_TRAY |
                Shell.KeyBindingMode.OVERVIEW,
                Lang.bind(this, function() {
                    let result_value = this._display.get_result();
                    Clipboard.set_text(CLIPBOARD_TYPE, result_value);
                })
            );*/

            this.keybindings_enabled = true;
        }
    },

    _removeKeybindings: function() {
        if(this.keybindings_enabled){

            Main.wm.removeKeybinding(PrefsKeys.CALC_CLEAR_SHORTCUT_KEY);
            Main.wm.removeKeybinding(PrefsKeys.CALC_COPY_RESULT_SHORTCUT_KEY);
            this.keybindings_enabled = false;
        }
    },

    on_activate: function(){
        this.display.focus_entry();
        this.parent();
    },

    on_deactivate: function(){
        this._expFlag = false;
        this.parent();
    },

    on_key_press_event: function(o, e){
        let modifierState = e.get_state();
        let symbol = e.get_key_symbol();
        let keyCode = e.get_key_code();

        // CTRL
        if(modifierState == Clutter.ModifierType.CONTROL_MASK){

            // CTRL+Space Clear expression
            if(symbol === Clutter.KEY_space){
                this.clear_expression();
            }
            // CTRL+G History move left
            else if(keyCode == 42){
                this.history_move_left();
            }
            // CTRL+J History move right
            else if(keyCode == 44){
                this.history_move_right();
            }
            // CTRL+H Use history's current expression
            else if(keyCode == 43){
                this.use_history_current_expression();
            }
        }
        // CTRL+Shift
        else if(modifierState == Clutter.ModifierType.CONTROL_MASK + Clutter.ModifierType.SHIFT_MASK){
            
            // CTRL+Shift+C Copy result
            if(keyCode == 54){
                this.copy_result();
            }
            // CTRL+Shift+H Clear History
            else if(keyCode == 43){
                this.clear_history();
            }
        }

    },

    destroy: function(){
        his._history.destroy();
        this._display.destroy();
        this._basicCalcButtonGrid.destroy();
        this.parent();
    },

    clear_expression: function(){
        this.display.clear_entry();
        this.clear_status_message();
    },

    copy_result: function(){
        let result_value = this.display.get_result();
        this.copy_to_clipboard(result_value);
    },

    paste_data: function(){
        this.paste_from_clipboard();
    },

    handle_paste_data: function(clipboard, text){
        if(!Utils.is_blank(text) && text.length < 50) {
            this.display.insert_data(text);
        }
    },

    clear_history: function(){
        if(this.history !== null){
            this.history.clear_calculus_history();
        }
    },

    use_history_current_expression: function(){
        if(this.history !== null){
            this.history.use_current_expression();
        }
    },
    
    history_move_left: function(){
        if(this.history !== null){
            this.history.history_move_prev();
        }
    },
    history_move_right: function(){
        if(this.history !== null){
            this.history.history_move_next();
        }
    },


    //* CALCULATOR CORE ===========================================================================*/
    /**
     * Calculator Core based on GCalcSearch (gcalc-search@wrowclif.org)
     */
    _convertTable : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"],

    _toBase: function(number, base) {
        number = Math.floor(number);
        var string = "";
        var term = 1;
        while(term <= number) {
            term *= base;
        }
        term /= base;
        while(term > 1) {
            string += this._convertTable[Math.floor(number / term)];
            number = number % term;
            term /= base;
        }
        string += this._convertTable[Math.floor(number)];
        if(string == "") {
            string = "0";
        }
        return string;
    },
    _validExpression: function(expression) {
        //return /([0-9+\-*\/^!]|'pi')+/i.test(expression);
        return true;
    },

    calculate: function(){ 

        this.display.clear_result();
        

        let expression = this.display.get_entry_data();

        let continue_calculus = true;

        // check for decimal mark
        if(expression.indexOf('.') != -1 || expression.indexOf(',') != -1){
            continue_calculus = this._checkDecimalMark();
        }

        if(continue_calculus){
            // wait information
            this.set_status_message('information', _("Waiting answer..."));

            let calc_res = this._calculateResult(expression);
            this.display.set_current_result(calc_res);

            // status info
            if(calc_res.status == 'error'){
                this.set_status_message('error', calc_res.result); 
            } else {
                this.clear_status_message();
            }
        } else {
            this.set_status_message('warning', _("Was not possible to compute."));
        }
        
    },

    _checkDecimalMark: function(){
        let dMark = this.params.app.decimal_mark;

        if(dMark == ''){
            this.show_message('warning', 'Calculator', _("The decimal mark is undefined, you can't use this calculator for computing expressions with decimal numbers if the decimal mark is not defined. Please see section WARNING of README.md and later set the decimal mark in the settings of this extension at tab \"Calculator\"."), 'info');
            return false;

        } else {
            if(dMark == ',' || dMark == '.') return true;
        }

        return false;
    },

    _changeDecimalMark: function(expression){
        if(expression != undefined){
            let dmPat = /,/g, dMark = this.params.app.decimal_mark;
            if(dMark == ',') dmPat = /\./g;
            expression = expression.replace(dmPat, dMark);
        }

        return expression;
    },

    _formatInput: function(expression){
        //NOTICE: DO NOT change the case of text because some symbols like PI
        // are misunderstood by the calculator program

        // valid symbols: √, π, ², ³
        // valid texts: sqrt, pi and others valid for gnome-calculator


        // Join everything together, then replace commas with periods to support
        expression = expression.split(" ").join("");

        // change decimal mark
        expression = this._changeDecimalMark(expression);

        // replace ANS by the last answer
        if(expression.indexOf('ANS') != -1 || expression.indexOf('ans') !=-1){

            // exceptions ANS²,  √ANS 
            let syntaxError = false;

            //TODO for each ANS see if before and after there is number or letter
            // to avoid joining numbers with the ANS

            // don't replace ANS(s) to invalidate the expression if
            // ANS is preceded or succeded by illegal characters
            //if(!syntaxError){
                let lastAnswerResult = this.history.last_calculus_answer();
                //TODO maybe ANS should be put in scientific notation
                if(lastAnswerResult != undefined){
                    
                    expression = expression.replace(/ANS/gi, lastAnswerResult);
                }
            //}
        }


        // pi
        expression = expression.replace('pi', 'π');

        return expression;
    },

    _formatOutput: function(result){

        result = result.replace("\u2212", '-');

        result = this._changeDecimalMark(result);

        return result;
    },

    _calculateResult: function(expression) {
        
        let formattedExpression = this._formatInput(expression);
        let expr  = formattedExpression;        
        let finalBase = 10;

        if (this._validExpression(expr)) {
            expr = expr.replace(/'pi'/gi, "\u03C0");
            expr = expr.replace(octal, "$1$2\u2088");
            expr = expr.replace(hex, "$1$2\u2081\u2086");
            expr = expr.replace(binary, "$1$2\u2082");
            expr = expr.replace(radians, "$1((180/\u03C0) *");
            expr = expr.replace(radians2, "(\u03C0/180) * a$1(");
         
            if(changeBase.test(expr)) {
                finalBase = bases[changeBase.exec(expr)[1]];
                expr = expr.replace(changeBase, "");
            }

            try {

               let [success, out, err, error] = GLib.spawn_sync(null, ["gnome-calculator", "-s", expr], null, 4, null);

                if(error == 0 && out.length > 0) {
                    
                    let result = out.toString().replace("\n","");

                    if(finalBase != 10) {
                        let neg = false;
                        // \u2212 is a minus sign. Since it's unicode javascript doesn't recognize
                        // the result as a negative number.
                        if(result[0] == "\u2212") {
                            result = result.substring(1);
                            neg = true;
                        }
                        result = this._toBase(result, finalBase);
                        result = prefixes[finalBase] + result;
                        if(neg) {
                            result = "\u2212" + result;
                        }
                    }

                    let formmatedResult = this._formatOutput(result);

                    let response = {'expression': formattedExpression, 'result': formmatedResult};

                    // push to history the valid calculus
                    this.history.push_calculus(response);

                    response.status = 'success';

                    return response;
                }

            } catch(exp) {
                return {'status': 'error','expression': formattedExpression, 'result': exp};
            }
        }

        return {'status': 'error','expression': formattedExpression, 'result': _("Invalid Syntax")};
    },

    get display(){
        return this._display;
    },

    get history(){
        return this._history;
    },

    get has_exp_flag(){
        return this._expFlag;
    },

    get decimal_mark(){
        if(this.params.app)
            return this.params.app.decimal_mark;
        else 
            return '.';
    }

});
