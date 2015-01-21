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
 *    Note: the theme system is based on GnoMenu extension stylesheet loader,
 *    Signals code based on todo.txt
 */

const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Panel = imports.ui.panel;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;
const Util = imports.misc.util;

const Me = ExtensionUtils.getCurrentExtension();
const AppHeader = Me.imports.app_header;
const Constants = Me.imports.constants;
const Dialog = Me.imports.dialog;
const MessageView = Me.imports.message_view;
const PrefsKeys = Me.imports.prefs_keys;
const StatusBar = Me.imports.status_bar;
const Utils = Me.imports.utils;

const Notify = Utils.showMessage;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

// will be loaded on demand
let CalculatorModule;
let UnitConverterModule;

const ModernCalc = new Lang.Class({
    Name: "ModernCalc",
    Extends: Dialog.Dialog,
    
    _init: function() {

        this._preferences = Utils.getSettings();

        let params = {
            width_percents: this._preferences.get_int(PrefsKeys.WINDOW_WIDTH_VALUE_KEY),
            height_percents: 100, 
            animation_time: 0.5,
            enable_reveal_animation: this._preferences.get_boolean(PrefsKeys.ENABLE_REVEAL_ANIMATION_KEY),
            style_class: 'mc-' + this._preferences.get_string(PrefsKeys.THEME_KEY)
        };
        this.parent(params);

        this._decimalMark = '';
        this._updateDecimalMark();

        this._showingMessageView = false;
        this._messageView = new MessageView.MessageView({
            app: this
        });

        this._appHeader = null;
        this._statusBar = null;

        this._loadedModules = false;
        this._activeModule = false;
        this._activeModuleIndex = null;

        this._prepareInterface();

        this._stylesheet = null;

        this._updateTheme();

        this._setGeneralOpacity();

        this._backgroundHasTransparency = false;
        this._setBackgroundOpacity();

        this._signals = null;
        this._connectSignals();
    },

    _updateDecimalMark: function(){
        this._decimalMark = this._preferences.get_string(PrefsKeys.CALC_DECIMAL_MARK_KEY);
    },

    _prepareInterface: function(){
        // add header
        /*this._appHeader = new AppHeader.AppHeader();
        this.boxLayout.add(this._appHeader.actor, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });*/

        this.boxLayout.add(this._messageView.actor, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        // add toolbar
        this._toolbar = new St.BoxLayout({
            style_class: 'toolbar',
            vertical: false
        });

        this._prefButton = new St.Button({
            child: new St.Icon({ icon_name: 'emblem-system-symbolic', style_class: 'button-icon' }),
            label: 'Settings', style_class: 'toolbar-button'
        });
        this._prefButton.connect("clicked", Lang.bind(this, function(){
            Util.spawn(["gnome-shell-extension-prefs", Me.uuid]);
            this.hide();
        }));


        this.boxLayout.add(this._toolbar, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        this._moduleContainer = new St.BoxLayout({
            style_class: 'module-container',
            vertical: true
        });

        // load modules
        this._loadModules();

        this.boxLayout.add(this._moduleContainer, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        // spacer
        this.boxLayout.add(new St.Label({ text: '' }), {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        // status
        this._statusBar = new StatusBar.StatusBar({ calc_app: this });
        this.boxLayout.add(this._statusBar.actor, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.END
        });
    },

    _loadModules: function(){

        let module_to_activate = false;
        let loaded_module_name;
        let default_module = this._preferences.get_string(PrefsKeys.DEFAULT_MODULE_KEY);

        this._loadedModules = new Array();


        if(this._preferences.get_boolean(PrefsKeys.CALCULATOR_ENABLED_KEY) == 1){
            CalculatorModule = Me.imports.calculator_module;

            this._loadedModules.push(
                new CalculatorModule.CalculatorModule({
                    app:this
                })
            );

            loaded_module_name = this._loadedModules[this._loadedModules.length-1].get_module_name();
            if(!module_to_activate && default_module != undefined && default_module == loaded_module_name){
                module_to_activate = loaded_module_name;
            }
        }

        if(this._preferences.get_boolean(PrefsKeys.UNIT_CONVERTER_ENABLED_KEY) == 1){
            UnitConverterModule = Me.imports.unit_converter_module;

            this._loadedModules.push(
                new UnitConverterModule.UnitConverterModule({
                    app:this
                })
            );

            loaded_module_name = this._loadedModules[this._loadedModules.length-1].get_module_name();
            if(!module_to_activate && default_module != undefined && default_module == loaded_module_name){
                module_to_activate = loaded_module_name;
            }    
        }

        this._initToolbar();

        // show default module
        if(module_to_activate != false){
            this.show_module(module_to_activate);
        } else {
            // if at least one module was loaded the first is activated
            if(this._loadedModules.length>0){
                this._showModuleByIndex(0);
            }
        }
    },

    _initToolbar: function(){
        if(this._toolbar && this._loadedModules){
            // load toolbar buttons
            let toolbarButton;
            let currModule;
            for(let i = 0; i < this._loadedModules.length; i++){
                currModule = this._loadedModules[i];

                if(currModule){
                    toolbarButton = currModule.get_toolbar_button();

                    this._toolbar.add(toolbarButton, {
                        expand: false,
                        x_align: St.Align.START,
                        y_align: St.Align.START
                    });
                }
            }
        }

        // spacer
        this._toolbar.add(new St.Label({ text: '' }), {
                expand: true,
                x_align: St.Align.MIDDLE,
                y_align: St.Align.MIDDLE
            });

        // preferences button
        this._toolbar.add(this._prefButton, {
                expand: false,
                x_align: St.Align.END,
                y_align: St.Align.START
            });
    },

    _removeActiveModule: function(){
        if(this._activeModule){

            // get the keyfocus of focused elements before
            // removing it to avoid problems like 
            // shortcuts don't work
            this.actor.grab_key_focus();

            //TODO animate
            this._activeModule.on_deactivate();
            this._moduleContainer.remove_child(this._activeModule.actor);
                
            let toolbarButton = this._activeModule.get_toolbar_button();
            toolbarButton.remove_style_pseudo_class('active');

            this._activeModuleIndex = null;
        }
    },

    _showModuleByIndex: function(index){

        if(index !== null && index >= 0 && this._activeModuleIndex != index){
            
            // remove last shown module
            this._removeActiveModule();

            let module = this._loadedModules[index];

            if(module !== null){
                
                // load the found module
                this._moduleContainer.add(module.actor, {
                    expand: false,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });

                // highlight module's toolbar button
                let toolbarButton = module.get_toolbar_button();
                toolbarButton.add_style_pseudo_class('active');

                // set the active module
                this._activeModule = module;

                if(this.is_open){
                    this._activeModule.on_activate();
                }

                this._activeModuleIndex = index;
            }

        }
    },

    show_module: function(module_name){
  
        if(module_name != false){

            let module = false;
            let currModule;
            for(let k=0; k < this._loadedModules.length; k++){
                currModule = this._loadedModules[k];

                if(currModule && module_name == currModule.get_module_name()){
                    // show the module
                    this._showModuleByIndex(k);

                    break;
                }
            }
        }
    },

    _changeActiveModule: function(direction){

        if(this._loadedModules !== false && this._activeModule !== false && this._loadedModules.length > 0){

            let loadedModulesCount = this._loadedModules.length;

            let index = 0;

            if(loadedModulesCount > 1){
                let activeModuleIndex = this._activeModuleIndex;

                if(activeModuleIndex !== null){
                    
                    index = (direction == 'left') ? activeModuleIndex-1 : activeModuleIndex+1;

                    if(index < 0)
                        index = loadedModulesCount-1;
                    else if(index > loadedModulesCount-1)
                        index = 0;

                }
            }

            // show the module
            this._showModuleByIndex(index);
        }
    },

    _setGeneralOpacity: function(){
        if(this._preferences.get_boolean(PrefsKeys.ENABLE_TRANSPARENCY_KEY)){
            let opacity = this._preferences.get_int(PrefsKeys.WINDOW_OPACITY_VALUE_KEY);
            opacity = (opacity / 100) * 255
            this.actor.opacity = opacity;

        } else {
            this.actor.opacity = 255;
        }
    },

    _setBackgroundOpacity: function() {

        if(this._preferences.get_boolean(PrefsKeys.ENABLE_BACKGROUND_TRANSPARENCY_KEY)){
            // enable transparency
            let opacity = this._preferences.get_int(PrefsKeys.BACKGROUND_OPACITY_VALUE_KEY);
            opacity = opacity / 100;
            let currBC  = this.boxLayout.get_theme_node().get_background_color();
            let background = 'rgba('+currBC.red+','+currBC.green+','+currBC.blue+','+opacity+ ')';
            this.boxLayout.set_style('background-color:'+ background);

            this._backgroundHasTransparency = true;
        } else {
            // remove background transparency if it has
            if(this._backgroundHasTransparency){
                
                let currBC  = this.boxLayout.get_theme_node().get_background_color();
                let background = 'rgb('+currBC.red+','+currBC.green+','+currBC.blue+')';
                this.boxLayout.set_style('background-color:'+ background);
            
                this._backgroundHasTransparency = false;
            }
        }
        
    },

     _updateTheme: function(){
        // this code is based on GnoMenu extension

        let theme_name = this._preferences.get_string(PrefsKeys.THEME_KEY);

        // stylesheet of theme
        let theme_stylesheet = Me.path + "/themes/" + theme_name + "/stylesheet.css";

        if (!GLib.file_test(theme_stylesheet, GLib.FileTest.EXISTS)) {
            throw new Error(_("Theme not found."));
            return false;
        }

        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        if (!themeContext) return false;

        let theme = themeContext.get_theme();
        if (!theme) return false;

        // unload previous stylesheet
        if(this._stylesheet)
            theme.unload_stylesheet(this._stylesheet);

        
        // load stylesheet
        theme.load_stylesheet(theme_stylesheet);
        this._stylesheet = theme_stylesheet;

        this.boxLayout.set_style_class_name("mc-"+theme_name);
        this._setBackgroundOpacity();

        return true;
    },

    _onShow: function(){
        if(this._showingMessageView){

        } else {
            if(this._activeModule !== false){
                // execute module's on_activate instructions
                this._activeModule.on_activate();
            }
        }
    },

    _onHide: function(){
        if(this._showingMessageView){

        } else {
            if(this._activeModule !== false){
                this._activeModule.on_deactivate();
            }
        }
    },

    show: function(){
        this.parent(true, Lang.bind(this, this._onShow));
    },

    hide: function(){
        this.parent(true, Lang.bind(this, this._onHide));
    },

    destroy: function(){
        this._disconnectSignals();
        this._toolbar.destroy();
        this._moduleContainer.destroy();

        this.parent();
    },

    _connectSignals: function(){
        if(this._signals === null)
                this._signals = [];

        // decimal mark
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.CALC_DECIMAL_MARK_KEY, Lang.bind(this, this._updateDecimalMark))
        );

        // theme
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.THEME_KEY, Lang.bind(this, this._updateTheme))
        );

        // reveal animation
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.ENABLE_REVEAL_ANIMATION_KEY, Lang.bind(this, function(){
                this.update_param(
                    'enable_reveal_animation', 
                    this._preferences.get_boolean(PrefsKeys.ENABLE_REVEAL_ANIMATION_KEY)
                );
            }))
        );

        // enable general transparency
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.ENABLE_TRANSPARENCY_KEY,
                Lang.bind(this, this._setGeneralOpacity)
            )
        );

        // general opacity
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.WINDOW_OPACITY_VALUE_KEY,
                Lang.bind(this, this._setGeneralOpacity)
            )
        );

        // enable background transparency
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.ENABLE_BACKGROUND_TRANSPARENCY_KEY,
                Lang.bind(this, this._setBackgroundOpacity)
            )
        );

        // background opacity
        this._signals.push(
            this._preferences.connect("changed::" + PrefsKeys.BACKGROUND_OPACITY_VALUE_KEY,
                Lang.bind(this, this._setBackgroundOpacity)
            )
        );

    },

    _disconnectSignals: function(){

        let pref = this._preferences;

        if (this._signals !== null) {
            this._signals.forEach(function(signal) {
                if (signal) 
                    pref.disconnect(signal);
            });
        }

        this._signals = null;
    },

    _on_key_press_event: function(o, e) {
        let modifierState = e.get_state();
        let symbol = e.get_key_symbol();

        if(symbol === Clutter.Escape) {
            this.hide();
            return true;
        }
        
        if (modifierState && Clutter.ModifierType.CONTROL_MASK){
            if (symbol === Clutter.KEY_Page_Up){
                this._changeActiveModule('left');

            } else if (symbol === Clutter.KEY_Page_Down){
                this._changeActiveModule('right');
            }
        }


        if(this._showingMessageView){
            this._messageView.on_key_press_event(o, e);
        } else {
            // module key press
            if(this._activeModule !== false){
                this._activeModule.on_key_press_event(o, e);
            }    
        }
        
        return false;
    },

    set_status_message: function(msg_type, msg){
        if(this._statusBar !== null && msg_type != undefined && msg != undefined){
            this.status_bar.set_message(msg_type, msg);
        }
    },

    clear_status_message: function(){
        if(this._statusBar !== null)
            this.status_bar.clear_message();
    },

    _showMessageView: function (){
        // deactivate module
        if(this._activeModule){
            this.actor.grab_key_focus();

            this._activeModule.on_deactivate();
        }

        this._toolbar.visible = false;
        this._moduleContainer.visible = false;
        this._statusBar.visible = false;

        this._messageView.visible = true;
        
        this._showingMessageView = true;
    },

    hide_message_view: function(){
        this._toolbar.visible = true;
        this._moduleContainer.visible = true;
        this._statusBar.visible = true;

        this._messageView.visible = false;

        // activate module
        if(this._activeModule){
            this._activeModule.on_activate();
        }

        this._showingMessageView = false;
    },

    show_message: function(messageType, title, message, buttonType){
        if(messageType != undefined && title != undefined && message != undefined){
            this._showMessageView();
            this._messageView.show_message(messageType, title, message, buttonType);
        }
    },

    get_message_result: function(){
        return this._messageView.get_result();
    },

    get preferences(){
        return this._preferences;
    },

    get status_bar(){
        return this._statusBar;
    },

    get active_module(){
        return this._activeModule;
    },

    get decimal_mark(){
        return this._decimalMark;
    }


});
