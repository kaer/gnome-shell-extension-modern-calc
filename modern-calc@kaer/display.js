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
            hint_text: "Type your Expression",
            track_hover: true,
            can_focus: true
        });
        
        
        this._expression_entry.clutter_text.connect('key-press-event', Lang.bind(this, this._entryKeyPress));

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

    insert_data: function(value){
        //TODO improve
        if(this._expression_entry){
            // cursor pos
            let cursor_pos = this._expression_entry.clutter_text.get_cursor_position();
            
            let entryValue = this._expression_entry.text;

            // if isnt a number nor brackets and the last symbol is equal current, didn't insert 
            // to avoid a future syntax error
            if ( value.length == 1   && /^[0-9()]+$/.test(value) == false && 
                entryValue.substring(entryValue.length-1, entryValue.length) == value ){
                return;

            }

            this._expression_entry.grab_key_focus();
            this._expression_entry.clutter_text.insert_text(value, cursor_pos);
            this._lastInsertedChar = value;
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

    waitingMode: function(){
        this._display_result.text = 'Waiting answer...';
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

    delete_before_cursor: function(){

        if(this._expression_entry){
            //FIXME erase the text or command before the cursor's position
            let text = this._expression_entry.text;

            if(text.length>0){
                // remove a char before caret
                let cursor_pos = this._expression_entry.clutter_text.get_cursor_position();

                if(cursor_pos>0){
                    /*
                    this._expression_entry.grab_key_focus();
                    */
                }
                
            }
        }
    },

    clear_entry: function(){
        if(this._expression_entry){
            this._expression_entry.text = '';

            this._display_result.text = '0';
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

//Signals.addSignalMethods(Display.prototype);
