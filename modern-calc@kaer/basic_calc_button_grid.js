/*
 *    Copyright (C) 2021  Kaer 
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
 *    Modern Calc, Kaer (C) 2014-2021 Kaer
 *    Modern Calc comes with ABSOLUTELY NO WARRANTY.
 *
 *    Author: Kaer
 *    Project url: https://github.com/kaer/gnome-shell-extension-modern-calc
 *
 */

const St = imports.gi.St;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Params = imports.misc.params;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

var BasicCalcButtonGrid = new Lang.Class({
    Name: "BasicCalcButtonGrid",
    
    _init: function(params) {
        this.params = Params.parse(params, {
            calc_app: false
        });

        this.actor = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_align: St.Align.START
        });

        this._initButtons();
        this._initInterface();

        this._lastValidResult = false;
    },

    _newPushValueButton: function(label, className, pushValue){
        let btn = new St.Button({
            label: label, style_class: className, x_expand: true
        });

        btn.connect("clicked", Lang.bind(this, function(){ this._pushValue(pushValue); }));

        return btn;
    },

    _newCallbackButton: function(label, className, callback){
        let btn = new St.Button({
            label: label, style_class: className, x_expand: true
        });

        btn.connect("clicked", Lang.bind(this, callback));

        return btn;
    },

    _initButtons: function(){

        this._btn0 = this._newPushValueButton('0', 'normal-button', '0');
        this._btn1 = this._newPushValueButton('1', 'normal-button', '1');
        this._btn2 = this._newPushValueButton('2', 'normal-button', '2');
        this._btn3 = this._newPushValueButton('3', 'normal-button', '3');
        this._btn4 = this._newPushValueButton('4', 'normal-button', '4');
        this._btn5 = this._newPushValueButton('5', 'normal-button', '5');
        this._btn6 = this._newPushValueButton('6', 'normal-button', '6');
        this._btn7 = this._newPushValueButton('7', 'normal-button', '7');
        this._btn8 = this._newPushValueButton('8', 'normal-button', '8');
        this._btn9 = this._newPushValueButton('9', 'normal-button', '9');


        // auxiliary buttons
        this._btnExp = this._newCallbackButton(_("EXP"), 'normal-button', this._btnExpClick);

        let dMark = this.params.calc_app.decimal_mark;
        if(dMark == '') dMark = '.';
        this._btnDecimalSep = this._newPushValueButton(dMark, 'normal-button', dMark);


        // delete buttons
        this._btnClearLastChar = this._newCallbackButton(_("C"), 'delete-button', this._btnClearLastCharClick);

        this._btnclearExpression = this._newCallbackButton(_("Clear"), 'delete-button', this._btnClearExpressionClick);
        this._btnclearExpression.child = new St.Icon({icon_name: 'edit-clear-symbolic', style_class: 'button-icon'});


        // special buttons 
        this._btnPercent = this._newPushValueButton('%', 'special-button', '%');
        this._btnPI = this._newPushValueButton('π', 'special-button', 'π');
        this._btnSquareRoot = this._newPushValueButton('√', 'special-button', '√');
        this._btnPow2 = this._newPushValueButton('x²', 'special-button', '²');
        this._btnOpenBracket = this._newPushValueButton('(', 'special-button', '(');
        this._btnCloseBracket = this._newPushValueButton(')', 'special-button', ')');


        // clipboard buttons
        this._btnCopyToClipboard = this._newCallbackButton(_("copy"), 'clipboard-button', this._btnClipboardCopyClick);
        this._btnCopyToClipboard.child = new St.Icon({icon_name: 'edit-copy-symbolic', style_class: 'button-icon'});
        
        this._btnPasteFromClipboard = this._newCallbackButton(_("paste"), 'clipboard-button', this._btnClipboardPasteClick);
        this._btnPasteFromClipboard.child = new St.Icon({icon_name: 'edit-paste-symbolic', style_class: 'button-icon'});


        // action buttons
        this._btnMinus = this._newPushValueButton('-', 'normal-button', '-');
        this._btnSum = this._newPushValueButton('+', 'normal-button', '+');
        this._btnTimes = this._newPushValueButton('\u00D7', 'normal-button', '*');
        this._btnDiv = this._newPushValueButton('\u00F7', 'normal-button', '/');

        this._btnEqual = this._newCallbackButton('=', 'normal-button', this._btnEqualClick);

        this._btnANS = this._newPushValueButton(_("ANS"), 'ans-button', 'ANS');

    },

    _pushValue: function(value){

        let calc_app = this.params.calc_app;
        if(calc_app != false){

            if(/ANS/gi.test(value) == false){
                
                calc_app.display.insert_data(value);

            } else {

                // ANS
                if(calc_app.history.last_calculus_answer() == undefined){
                    calc_app.set_status_message('warning', _("ANS still undefined"));
                } else{
                    calc_app.display.insert_data(value);
                }
            }
        }
    },

    _btnExpClick: function(){
        this.params.calc_app.flag_exp();
    },

    _btnClearLastCharClick: function(){
        //FIXME
        if(this.params.calc_app.display){
            this.params.calc_app.display.delete_before_cursor();
        }        
    },

    _btnClearExpressionClick: function(){
        let calc_app = this.params.calc_app;
        
        if(calc_app != false){
            calc_app.clear_expression();
        }
    },

    _btnEqualClick: function(){

        if(this.params.calc_app){
            this.params.calc_app.calculate();
        }
    },

    _btnClipboardCopyClick: function(){

        if(this.params.calc_app){
            this.params.calc_app.copy_result();
        }
    },

    _btnClipboardPasteClick: function(){

        if(this.params.calc_app){
            this.params.calc_app.paste_data();
        }
    },

    _initInterface: function(){

        this._buttonGrid = new St.Widget({
            style_class: 'bc-button-group',
            layout_manager: new Clutter.GridLayout(),
            x_expand: false,
            y_align: St.Align.START
        });
        
        let line_first = 0,
            line_second = 1,
            line_7button = 2,
            line_4button = 3,
            line_1button = 4,
            line_0button = 5;

        // delete buttons
        this._addToGrid(this._btnClearLastChar, line_second, 4, 1, 1);
        this._addToGrid(this._btnclearExpression, line_first, 4, 1, 1);

        // btn nums
        this._addToGrid(this._btn7, line_7button, 0, 1, 1);
        this._addToGrid(this._btn8, line_7button, 1, 1, 1);
        this._addToGrid(this._btn9, line_7button, 2, 1, 1);

        // row
        this._addToGrid(this._btn4, line_4button, 0, 1, 1);
        this._addToGrid(this._btn5, line_4button, 1, 1, 1);
        this._addToGrid(this._btn6, line_4button, 2, 1, 1);

        // row
        this._addToGrid(this._btn1, line_1button, 0, 1, 1);
        this._addToGrid(this._btn2, line_1button, 1, 1, 1);
        this._addToGrid(this._btn3, line_1button, 2, 1, 1);
        this._addToGrid(this._btn0, line_0button, 1, 1, 1);


        // auxiliary buttons
        this._addToGrid(this._btnDecimalSep, line_0button, 2, 1, 1);
        this._addToGrid(this._btnExp, line_0button, 0, 1, 1);

        // action buttons
        this._addToGrid(this._btnMinus, line_4button, 4, 1, 1);
        this._addToGrid(this._btnSum, line_4button, 3, 2, 1);
        this._addToGrid(this._btnDiv, line_7button, 4, 1, 1);
        this._addToGrid(this._btnTimes, line_7button, 3, 1, 1);
        this._addToGrid(this._btnANS, line_1button, 4, 1, 1);
        this._addToGrid(this._btnEqual, line_0button, 3, 1, 2);

        // special buttons
        this._addToGrid(this._btnPercent, line_first, 0, 1, 1);
        this._addToGrid(this._btnPI, line_first, 1, 1, 1);
        
        this._addToGrid(this._btnSquareRoot, line_second, 0, 1, 1);
        this._addToGrid(this._btnPow2, line_second, 1, 1, 1);
        this._addToGrid(this._btnOpenBracket, line_second, 2, 1, 1);
        this._addToGrid(this._btnCloseBracket, line_second, 3, 1, 1);


        // clipboard buttons
        this._addToGrid(this._btnCopyToClipboard, line_first, 2, 1, 1);
        this._addToGrid(this._btnPasteFromClipboard, line_first, 3, 1, 1);
        
        // add to actor
        this.actor.add(this._buttonGrid);

    },

    _addToGrid: function(btnActor, rowNum, colNum, rowSpan, colSpan){
        this._buttonGrid.layout_manager.attach(btnActor, colNum, rowNum, colSpan, rowSpan);
    },

    destroy: function(){
        this.actor.destroy();
    }

});

//Signals.addSignalMethods(BasicCalcButtonGrid.prototype);
