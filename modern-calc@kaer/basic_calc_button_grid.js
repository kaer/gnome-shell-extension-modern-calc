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
const Clipboard = St.Clipboard.get_default();
const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;
const Utils = Me.imports.utils;


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
            label: 'EXP', style_class: 'normal-button'
        });
        this._btnExp.connect("clicked", Lang.bind(this, this._btnExpClick));

        this._btnDecimalSep = new St.Button({
            label: '.', style_class: 'normal-button'  //TODO trocar ponto por virg dependendo da loc de exibição do usuário
        });
        this._btnDecimalSep.connect("clicked", Lang.bind(this, function(){ this._pushValue('.');})); //TODO trocar pelo separador decimal do computador do usuario

        
        // delete buttons
        this._btnClearLastChar = new St.Button({
            label: 'C', style_class: 'delete-button'
        });
        this._btnClearLastChar.connect("clicked", Lang.bind(this, this._btnClearLastCharClick));

        this._btnclearExpression = new St.Button({
            label: 'Clear', style_class: 'delete-button'  //TODO put a symbol
        });
        this._btnclearExpression.connect("clicked", Lang.bind(this, this._btnClearExpressionClick));


        // special buttons 
        this._btnPercent = new St.Button({
            label: '%', style_class: 'special-button'
        });
        this._btnPercent.connect("clicked", Lang.bind(this, function(){ this._pushValue('%');}));

        this._btnPI = new St.Button({
            label: 'π', style_class: 'special-button' //TODO put an icon /  symbol
        });
        this._btnPI.connect("clicked", Lang.bind(this, function(){ this._pushValue('π');}));


        this._btnSquareRoot = new St.Button({
            label: '√', style_class: 'special-button' //TODO put an icon /  symbol
        });
        this._btnSquareRoot.connect("clicked", Lang.bind(this, function(){ this._pushValue('√');}));

        this._btnPow2 = new St.Button({
            label: 'x²', style_class: 'special-button'
        });
        this._btnPow2.connect("clicked", Lang.bind(this, function(){ this._pushValue('²');}));

        this._btnOpenBracket = new St.Button({
            label: '(', style_class: 'special-button' //TODO change font
        });
        this._btnOpenBracket.connect("clicked", Lang.bind(this, function(){ this._pushValue('(');}));

        this._btnCloseBracket = new St.Button({
            label: ')', style_class: 'special-button' //TODO change font
        });
        this._btnCloseBracket.connect("clicked", Lang.bind(this, function(){ this._pushValue(')');}));


        // clipboard buttons
        this._btnCopyToClipboard = new St.Button({
            label: 'copy', style_class: 'clipboard-button'
        });
        this._btnCopyToClipboard.connect("clicked", Lang.bind(this, this._btnClipboardCopyClick));

        this._btnPasteFromClipboard = new St.Button({
            label: 'paste', style_class: 'clipboard-button'
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
            label: '×', style_class: 'normal-button' //TODO change to times symbol
        });
        this._btnTimes.connect("clicked", Lang.bind(this, function(){ this._pushValue('*');}));

        this._btnDiv = new St.Button({
            label: '/', style_class: 'normal-button'  //TODO put an icon
        });
        this._btnDiv.connect("clicked", Lang.bind(this, function(){ this._pushValue('/');}));


        this._btnEqual = new St.Button({
            label: '=', style_class: 'normal-button'
        });
        this._btnEqual.connect("clicked", Lang.bind(this, this._btnEqualClick));

        this._btnANS = new St.Button({
            label: 'ANS', style_class: 'ans-button'
        });
        this._btnANS.connect("clicked", Lang.bind(this, function(){ this._pushValue('ANS');}));

    },

    _pushValue: function(value){
        if(this.params.calc_app.display){
            this.params.calc_app.display.insert_data(value);
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
        if(this.params.calc_app.display){
            this.params.calc_app.display.clear_entry();
        }
    },


    _btnEqualClick: function(){

        if(this.params.calc_app){
            this.params.calc_app.calculate();
        }
    },

    _btnClipboardCopyClick: function(){

        if(this.params.calc_app.display){
            let result_value = this.params.calc_app.display.get_result();
            Clipboard.set_text(CLIPBOARD_TYPE, result_value);
        }
        
    },

    _btnClipboardPasteClick: function(){
        
        if(this.params.calc_app.display){
            Clipboard.get_text(CLIPBOARD_TYPE, Lang.bind(this, function(clipboard, text) {
                if(!Utils.is_blank(text) && text.length < 50) {
                    this.params.calc_app.display.insert_data(text);
                }
            }));
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
        this._buttonGrid.add(this._btnClearLastChar, {
            row: line_second,
            col: 4,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnclearExpression, {
            row: line_first,
            col: 4,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        // btn nums
        this._buttonGrid.add(this._btn7, {
            row: line_7button,
            col: 0,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        this._buttonGrid.add(this._btn8, {
            row: line_7button,
            col: 1,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        this._buttonGrid.add(this._btn9, {
            row: line_7button,
            col: 2,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        // row
        this._buttonGrid.add(this._btn4, {
            row: line_4button,
            col: 0,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        this._buttonGrid.add(this._btn5, {
            row: line_4button,
            col: 1,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        this._buttonGrid.add(this._btn6, {
            row: line_4button,
            col: 2,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        // row
        this._buttonGrid.add(this._btn1, {
            row: line_1button,
            col: 0,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        this._buttonGrid.add(this._btn2, {
            row: line_1button,
            col: 1,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        this._buttonGrid.add(this._btn3, {
            row: line_1button,
            col: 2,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btn0, {
            row: line_0button,
            col: 1,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        // auxiliary buttons
        this._buttonGrid.add(this._btnDecimalSep, {
            row: line_0button,
            col: 2,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnExp, {
            row: line_0button,
            col: 0,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        

        // action buttons
        this._buttonGrid.add(this._btnMinus, {
            row: line_4button,
            col: 4,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnSum, {
            row: line_4button,
            col: 3,
            col_span: 1,
            row_span: 2,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnDiv, {
            row: line_7button,
            col: 4,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnTimes, {
            row: line_7button,
            col: 3,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        this._buttonGrid.add(this._btnANS, {
            row: line_1button,
            col: 4,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        this._buttonGrid.add(this._btnEqual, {
            row: line_0button,
            col: 3,
            col_span: 2,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        // special buttons
        this._buttonGrid.add(this._btnPercent, {
            row: line_first,
            col: 0,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnPI, {
            row: line_first,
            col: 1,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnSquareRoot, {
            row: line_second,
            col: 0,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnPow2, {
            row: line_second,
            col: 1,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        
        this._buttonGrid.add(this._btnOpenBracket, {
            row: line_second,
            col: 2,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnCloseBracket, {
            row: line_second,
            col: 3,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        // clipboard buttons
        this._buttonGrid.add(this._btnCopyToClipboard, {
            row: line_first,
            col: 2,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        this._buttonGrid.add(this._btnPasteFromClipboard, {
            row: line_first,
            col: 3,
            col_span: 1,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });
        
        // add to actor
        this.actor.add(this._buttonGrid, { 
            expand: false,
            y_align: St.Align.START,
            x_align: St.Align.START
        });

    },


    destroy: function(){
        this.actor.destroy();
    }

});

//Signals.addSignalMethods(BasicCalcButtonGrid.prototype);
