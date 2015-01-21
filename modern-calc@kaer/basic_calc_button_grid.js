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

const BasicCalcButtonGrid = new Lang.Class({
    Name: "BasicCalcButtonGrid",
    
    _init: function(params) {
        this.params = Params.parse(params, {
            calc_app: false
        });

        this.actor = new St.BoxLayout({
            vertical: true
        });

        this._initButtons();
        this._initInterface();

        this._lastValidResult = false;
    },

    _initButtons: function(){

        this._btn0 = new St.Button({
            label: '0', style_class: 'normal-button'
        });
        this._btn0.connect("clicked", Lang.bind(this, function(){ this._pushValue('0');}));
        
        this._btn1 = new St.Button({
            label: '1', style_class: 'normal-button'
        });
        this._btn1.connect("clicked", Lang.bind(this, function(){ this._pushValue('1');}));

        this._btn2 = new St.Button({label: '2', style_class: 'normal-button'});
        this._btn2.connect("clicked", Lang.bind(this, function(){ this._pushValue('2');}));

        this._btn3 = new St.Button({
            label: '3', style_class: 'normal-button'
        });
        this._btn3.connect("clicked", Lang.bind(this, function(){ this._pushValue('3');}));

        this._btn4 = new St.Button({
            label: '4', style_class: 'normal-button'
        });
        this._btn4.connect("clicked", Lang.bind(this, function(){ this._pushValue('4');}));

        this._btn5 = new St.Button({
            label: '5', style_class: 'normal-button'
        });
        this._btn5.connect("clicked", Lang.bind(this, function(){ this._pushValue('5');}));

        this._btn6 = new St.Button({
            label: '6', style_class: 'normal-button'
        });
        this._btn6.connect("clicked", Lang.bind(this, function(){ this._pushValue('6');}));

        this._btn7 = new St.Button({
            label: '7', style_class: 'normal-button'
        });
        this._btn7.connect("clicked", Lang.bind(this, function(){ this._pushValue('7');}));

        this._btn8 = new St.Button({
            label: '8', style_class: 'normal-button'
        });
        this._btn8.connect("clicked", Lang.bind(this, function(){ this._pushValue('8');}));

        this._btn9 = new St.Button({
            label: '9', style_class: 'normal-button'
        });
        this._btn9.connect("clicked", Lang.bind(this, function(){ this._pushValue('9');}));


        // auxiliary buttons
        this._btnExp = new St.Button({
            label: _("EXP"), style_class: 'normal-button'
        });
        this._btnExp.connect("clicked", Lang.bind(this, this._btnExpClick));

        let dMark = this.params.calc_app.decimal_mark;
        if(dMark == '') dMark = '.';
        this._btnDecimalSep = new St.Button({
            label: dMark, style_class: 'normal-button'
        });
        this._btnDecimalSep.connect("clicked", Lang.bind(this, function(){ this._pushValue(dMark);}));

        
        // delete buttons
        this._btnClearLastChar = new St.Button({
            label: _("C"), style_class: 'delete-button'
        });
        this._btnClearLastChar.connect("clicked", Lang.bind(this, this._btnClearLastCharClick));

        this._btnclearExpression = new St.Button({
            child: new St.Icon({icon_name: 'edit-clear-symbolic', style_class: 'button-icon'}),
            label: _("Clear"), style_class: 'delete-button'
        });
        this._btnclearExpression.connect("clicked", Lang.bind(this, this._btnClearExpressionClick));


        // special buttons 
        this._btnPercent = new St.Button({
            label: '%', style_class: 'special-button'
        });
        this._btnPercent.connect("clicked", Lang.bind(this, function(){ this._pushValue('%');}));

        this._btnPI = new St.Button({
            label: 'π', style_class: 'special-button'
        });
        this._btnPI.connect("clicked", Lang.bind(this, function(){ this._pushValue('π');}));


        this._btnSquareRoot = new St.Button({
            label: '√', style_class: 'special-button'
        });
        this._btnSquareRoot.connect("clicked", Lang.bind(this, function(){ this._pushValue('√');}));

        this._btnPow2 = new St.Button({
            label: 'x²', style_class: 'special-button'
        });
        this._btnPow2.connect("clicked", Lang.bind(this, function(){ this._pushValue('²');}));

        this._btnOpenBracket = new St.Button({
            label: '(', style_class: 'special-button'
        });
        this._btnOpenBracket.connect("clicked", Lang.bind(this, function(){ this._pushValue('(');}));

        this._btnCloseBracket = new St.Button({
            label: ')', style_class: 'special-button'
        });
        this._btnCloseBracket.connect("clicked", Lang.bind(this, function(){ this._pushValue(')');}));


        // clipboard buttons
        this._btnCopyToClipboard = new St.Button({
            child: new St.Icon({icon_name: 'edit-copy-symbolic', style_class: 'button-icon'}),
            label: _("copy"), style_class: 'clipboard-button'
        });
        this._btnCopyToClipboard.connect("clicked", Lang.bind(this, this._btnClipboardCopyClick));

        this._btnPasteFromClipboard = new St.Button({
            child: new St.Icon({icon_name: 'edit-paste-symbolic', style_class: 'button-icon'}),
            label: _("paste"), style_class: 'clipboard-button'
        });
        this._btnPasteFromClipboard.connect("clicked", Lang.bind(this, this._btnClipboardPasteClick));




        // action buttons
        this._btnMinus = new St.Button({
            label: '-', style_class: 'normal-button'
        });
        this._btnMinus.connect("clicked", Lang.bind(this, function(){ this._pushValue('-');}));

        this._btnSum = new St.Button({
            label: '+', style_class: 'normal-button'
        });
        this._btnSum.connect("clicked", Lang.bind(this, function(){ this._pushValue('+');}));

        this._btnTimes = new St.Button({
            label: '\u00D7', style_class: 'normal-button'
        });
        this._btnTimes.connect("clicked", Lang.bind(this, function(){ this._pushValue('*');}));

        this._btnDiv = new St.Button({
            label: '\u00F7', style_class: 'normal-button'
        });
        this._btnDiv.connect("clicked", Lang.bind(this, function(){ this._pushValue('/');}));


        this._btnEqual = new St.Button({
            label: '=', style_class: 'normal-button'
        });
        this._btnEqual.connect("clicked", Lang.bind(this, this._btnEqualClick));

        this._btnANS = new St.Button({
            label: _("ANS"), style_class: 'ans-button'
        });
        this._btnANS.connect("clicked", Lang.bind(this, function(){ this._pushValue('ANS');}));

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

        this._buttonGrid = new St.Table({
            style_class: 'bc-button-group',
            homogeneous: false,
            reactive: true
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
        this.actor.add(this._buttonGrid, { 
            expand: false,
            y_align: St.Align.START,
            x_align: St.Align.START
        });

    },

    _addToGrid: function(btnActor, rowNum, colNum, rowSpan, colSpan){

        this._buttonGrid.add(btnActor, {
            row: rowNum,
            col: colNum,
            row_span: rowSpan,
            col_span: colSpan,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
    },


    destroy: function(){
        this.actor.destroy();
    }

});

//Signals.addSignalMethods(BasicCalcButtonGrid.prototype);
