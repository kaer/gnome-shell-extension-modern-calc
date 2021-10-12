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

const ExtensionUtils = imports.misc.extensionUtils;
const Lang = imports.lang;
const Params = imports.misc.params;
const St = imports.gi.St;

const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

var CalculusHistory = new Lang.Class({
    Name: "CalculusHistory",

    _init: function(params) {
        this.params = Params.parse(params, {
            calc_app: false,
        });

        this.actor = new St.BoxLayout({
            style_class: 'history-group',
            vertical: true,
            x_expand: true,
        });

        this._prepareInterface();
        this._calculus_history = false;
        this._historyPos = undefined;

        this._refreshUI();
    },

    _prepareInterface: function(){

        this._historyTitle = new St.Label({
            style_class: 'history-title',
            text: _("History"),
            visible: true,
            x_expand: true,
            y_align: St.Align.START,
        });

        this.actor.add_child(this._historyTitle);

        // buttons
        this._btnHistClear = new St.Button({
            child: new St.Icon({icon_name: 'user-trash-symbolic', style_class: 'button-icon'}),
            label: _("clear history"), style_class: 'history-btn-clear',
            x_expand: true
        });

        this._btnHistClear.connect("clicked", Lang.bind(this, this.clear_calculus_history));
        /*
        this._btnClose = new St.Button({
            label: 'Close', style_class: 'history-btn-close',
            x_expand: true
        });*/

        // history buttons
        this._btnHistMovPrev = new St.Button({
            child: new St.Icon({icon_name: 'go-previous-symbolic', style_class: 'button-icon'}),
            label: _("prev"), style_class: 'history-btn-mover',
            x_expand: true
        });
        this._btnHistMovPrev.connect("clicked", Lang.bind(this, this.history_move_prev));

        this._btnHistMovNext = new St.Button({
            child: new St.Icon({icon_name: 'go-next-symbolic', style_class: 'button-icon'}),
            label: _("next"), style_class: 'history-btn-mover',
            x_expand: true
        });
        this._btnHistMovNext.connect("clicked", Lang.bind(this, this.history_move_next));


        this._exprTitle = new St.Label({
            style_class: 'expr-label',
            text: _("Expr."),
            visible: true,
            x_expand: false
        });

        this._exprValue = new St.Label({
            style_class: 'expr-value',
            text: '',
            visible: true,
            x_expand: true
        });

        this._btnUseExpr = new St.Button({
            label: _("Use"), style_class: 'history-use-expr', x_expand: false
        });
        this._btnUseExpr.connect("clicked", Lang.bind(this, this.use_current_expression));

        this._ansTitle = new St.Label({
            style_class: 'ans-label',
            text: _("ANS"),
            visible: true,
            x_expand: false
        });

        this._ansValue = new St.Label({
            style_class: 'ans-value',
            text: '',
            visible: true,
            x_expand: true
        });

        // containers
        this._hideableContainer = new St.BoxLayout({
            style_class: 'history-container',
            vertical: true,
            x_expand: true
        });

        this._buttonContainer = new St.BoxLayout({
            style_class: 'button-container',
            vertical: false,
            x_expand: true
        });

        this._exprContainer = new St.BoxLayout({
            style_class: 'expr-container',
            vertical: false,
            x_expand: true
        });

        this._ansContainer = new St.BoxLayout({
            style_class: 'ans-container',
            vertical: false,
            x_expand: true
        });

        this._buttonContainer.add(this._btnHistClear);
        //this._buttonContainer.add(this._btnClose);
        this._buttonContainer.add(this._btnHistMovPrev);
        this._buttonContainer.add(this._btnHistMovNext);

        this._exprContainer.add(this._exprTitle);
        this._exprContainer.add(this._exprValue);
        this._exprContainer.add(this._btnUseExpr);

        this._ansContainer.add(this._ansTitle);
        this._ansContainer.add(this._ansValue);


        this._hideableContainer.add(this._buttonContainer);
        this._hideableContainer.add(this._exprContainer);
        this._hideableContainer.add(this._ansContainer);

        this.actor.add_child(this._hideableContainer);
    },

    _enable_button: function(button){
        if(button !== null){
            button.set_reactive(true);
            button.remove_style_pseudo_class('disabled');
        }
    },

    _disable_button: function(button){
        if(button !== null){
            button.set_reactive(false);
            button.add_style_pseudo_class('disabled');
        }
    },

    _refreshUI: function(){

        let histItem = {
            expression: '',
            result: _("undefined")
        };

        if(this._historyPos != undefined && this._calculus_history){
            let item = this._getHistoryItem(this._historyPos);
            if(item != undefined){
                histItem = item;
            }
        }
        this._exprValue.text = histItem.expression;
        this._ansValue.text = histItem.result;


        // switch buttons -------------------------------------------------------
       if(this._calculus_history != false && this._calculus_history.length > 0){

            if(this._calculus_history.length == 1){
                this._disable_button(this._btnHistMovPrev);
                this._disable_button(this._btnHistMovNext);
            } else {

                // first pos
                if(this._historyPos == 0){
                    this._disable_button(this._btnHistMovPrev);
                } else {
                    this._enable_button(this._btnHistMovPrev);
                }

                // last pos
                if(this._historyPos == this._calculus_history.length-1){
                    this._disable_button(this._btnHistMovNext);
                } else {
                    this._enable_button(this._btnHistMovNext);
                }
            }

            this._enable_button(this._btnHistClear);
            this._enable_button(this._btnUseExpr);

        } else {
            this._disable_button(this._btnHistClear);
            this._disable_button(this._btnHistMovPrev);
            this._disable_button(this._btnHistMovNext);
            this._disable_button(this._btnUseExpr);
        }
    },

    history_move_prev: function(){

        if(this._calculus_history != false && this._calculus_history.length > 0){

            if(this._historyPos > 0){
                this._historyPos--;
            }

        } else {
            this._historyPos = undefined;
        }

        this._refreshUI();
    },

    history_move_next: function(){

        if(this._calculus_history != false && this._calculus_history.length > 0){

            if(this._historyPos < this._calculus_history.length-1){
                this._historyPos++;
            }

        } else {
            this._historyPos = undefined;
        }

        this._refreshUI();
    },


    _getHistoryItem: function(index){
        let hist = this._calculus_history;

        if(hist && index != undefined && index >=0){
            // check valid limits
            if(hist.length>0 && index < hist.length){
                return hist[index];
            }
        }
        return undefined;
    },

    _showLastHistoryItem: function(){
        if(this._calculus_history){
            if(this._calculus_history.length == 0){
                this._historyPos = undefined;
            }else {
                this._historyPos = this._calculus_history.length-1;
            }
        }

        this._refreshUI();
    },

    push_calculus: function(calc_object){

        if(this._calculus_history == false){
            this._calculus_history = new Array();
        }

        if(calc_object != undefined &&
            calc_object.hasOwnProperty('expression') &&
            calc_object.hasOwnProperty('result')
            ){

            // pushes to history an obj like:
            // {'expression': '10+44', 'result': '54', 'ans': 15 }
            this._calculus_history.push({
                expression: calc_object.expression,
                result: calc_object.result,
                ans: this.last_calculus_answer()
            });


            this._showLastHistoryItem();
        }
    },

    use_current_expression: function (){
        let histItem = this._getHistoryItem(this._historyPos);

        if(histItem != undefined){
            this.params.calc_app.display.clear_entry();
            this.params.calc_app.display.expression_entry.text = histItem.expression;
            this._showLastHistoryItem();
        }
    },

    clear_calculus_history: function(){
        this._calculus_history = false;
        this._historyPos = undefined;

        this._refreshUI();
    },

    last_calculus_answer: function(){
        if(this._calculus_history == false || this._calculus_history.length == 0){
            return undefined;
        } else {
            return this._calculus_history[this._calculus_history.length-1].result;
        }
    },

    destroy: function(){
        this.actor.destroy();
    }

});

//Signals.addSignalMethods(CalculusHistory.prototype);
