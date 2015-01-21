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
const Clutter = imports.gi.Clutter;
const Panel = imports.ui.panel;
const Pango = imports.gi.Pango;
const Params = imports.misc.params;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

const MessageType = {
    INFORMATION : 'information',
    ERROR: 'error',
    WARNING: 'warning',
    QUESTION: 'question'
};

const ButtonType = {
    ASK: 'ask',
    INFO: 'info'
};

const MessageView = new Lang.Class({
    Name: "MessageView",
    
    _init: function(params) {

        this.params = Params.parse(params, {
            app: null
        });

        this.actor = new St.BoxLayout({
            style_class: 'message-view',
            vertical: true,
            visible: false
        });

        this._result = null;
        this._iconPseudoClass = '';
        this._prepareInterface();
    },

    _prepareInterface: function(){
        
        this._messageGroupLayout = new St.BoxLayout({
            style_class: 'mbox',
            vertical: true
        });

        // title
        this._titleLabel = new St.Label({
            style_class: 'm-title',
            text: ''
        });
        this._titleLabel.clutter_text.set_single_line_mode(false);
        this._titleLabel.clutter_text.set_line_wrap(true);
        this._titleLabel.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD);

        this._messageGroupLayout.add_child(this._titleLabel, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        // content
        this._messageContentGroup = new St.BoxLayout({
            style_class: 'm-group',
            vertical: false
        });

        this._icon = new St.Icon({
            icon_name: '',
            style_class: 'icon',
            visible: true
        });

        this._contentLabel = new St.Label({
            style_class: 'm-content',
            text: ''
        });
        this._contentLabel.clutter_text.set_single_line_mode(false);
        this._contentLabel.clutter_text.set_line_wrap(true);
        this._contentLabel.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD);


        this._messageContentGroup.add_child(this._icon, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        this._messageContentGroup.add_child(this._contentLabel, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        this._messageGroupLayout.add_child(this._messageContentGroup, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });
    
        // buttons
        this._buttonGroupLayout = new St.BoxLayout({
            style_class: 'button-group',
            vertical: false
        });


        this._okButton = new St.Button({
            label: _("Ok"), style_class: 'm-button'
        });
        this._okButton.connect("clicked", Lang.bind(this, this._okButtonClick));

        this._yesButton = new St.Button({
            label: _("Yes"), style_class: 'm-button'
        });
        this._yesButton.connect("clicked", Lang.bind(this, this._yesButtonClick));

        this._noButton = new St.Button({
            label: _("No"), style_class: 'm-button'
        });
        this._noButton.connect("clicked", Lang.bind(this, this._noButtonClick));

        this._bcOk = new St.BoxLayout({style_class: 'button-container', visible: false });
        this._bcYes = new St.BoxLayout({style_class: 'button-container', visible: false });
        this._bcNo = new St.BoxLayout({style_class: 'button-container', visible: false });
        
        this._bcOk.add_child(this._okButton, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        this._bcYes.add_child(this._yesButton, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        this._bcNo.add_child(this._noButton, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });


        this._buttonGroupLayout.add_child(this._bcOk, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._buttonGroupLayout.add_child(this._bcYes, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._buttonGroupLayout.add_child(this._bcNo, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });


        this._messageGroupLayout.add_child(this._buttonGroupLayout, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
        
        this.actor.add_child(this._messageGroupLayout, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });
    },

    _okButtonClick: function(){
        this._result = null;
        this.hide_message();
    },

    _yesButtonClick: function(){
        this._result = true;
        this.hide_message();
    },

    _noButtonClick: function(){
        this._result = false;
        this.hide_message();
    },

    on_key_press_event: function(o, e){
        let modifierState = e.get_state();
        let symbol = e.get_key_symbol();
        let keyCode = e.get_key_code();

        // N
        if(keyCode == 57){
            if(this._bcNo.visible)
                this._noButtonClick();
        }
        // Y
        else if(keyCode == 29){
            if(this._bcYes.visible)
                this._yesButtonClick();
        }
        // O
        else if(keyCode == 32 ||
            (symbol == Clutter.KEY_Return || symbol == Clutter.KEY_KP_Enter || symbol == Clutter.KEY_ISO_Enter)
        ){
            if(this._bcOk.visible)
                this._okButtonClick();
        }
    },

    _prepareIcon: function(icon_name){
        this._icon.remove_style_pseudo_class(this._iconPseudoClass);

        switch(icon_name){
            case MessageType.INFORMATION:
                break;
            case MessageType.QUESTION:
                break;
            case MessageType.ERROR:
            case MessageType.WARNING:
                this._icon.add_style_pseudo_class(icon_name);
                this._iconPseudoClass = icon_name;
                break;
            default:
                icon_name = MessageType.INFORMATION
                break;
        }

        this._icon.set_icon_name('dialog-'+icon_name+'-symbolic');
    },

    _showButtons: function(buttonType){
    
        if(buttonType == ButtonType.ASK){
            this._bcOk.visible = false;
            this._bcYes.visible = true;
            this._bcNo.visible = true;
        } else  {
            // info
            this._bcOk.visible = true;
            this._bcYes.visible = false;
            this._bcNo.visible = false    
        }
    },

    _clearMessage: function(){
        this._titleLabel.text = '';
        this._contentLabel.text = '';
    },

    show_message: function(messageType, title, message, buttonType){
        this._clearMessage();

        if(!messageType) messageType = MessageType.INFORMATION;
        if(!title) title = '';
        if(!message) messsage = '';
        if(!buttonType) buttonType = ButtonType.INFO;

        this._prepareIcon(messageType);
        this._titleLabel.text = title;
        this._contentLabel.text = message;
        this._showButtons(buttonType);

        // show
        this.actor.visible = true;
    },

    hide_message: function(){
        this.actor.visible = false;

        if(this.params.app !== null){
            this.params.app.hide_message_view();
        }
    },

    destroy: function(){
        this.parent();
    },

    get_result: function(){
        return this._result;
    }

});

//Signals.addSignalMethods(MessageView.prototype);
