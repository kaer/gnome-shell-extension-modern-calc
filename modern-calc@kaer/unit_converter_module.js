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

const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Panel = imports.ui.panel;
const Pango = imports.gi.Pango;
const Params = imports.misc.params;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();
const ModernCalcModule = Me.imports.modern_calc_module;
const Utils = Me.imports.utils;

const Gettext = imports.gettext.domain('modern-calc');
const _ = Gettext.gettext;

const Qty = Me.imports.module_data.unit_converter.quantities15;
const MeasurementList = Me.imports.module_data.unit_converter.measurement_list;
const UnitTranslation = Me.imports.module_data.libs.unit_translation;
const TranslateExpression = UnitTranslation.translate;

const PAGES = {
    CONVERSION: 'conversion-page',
    MEASUREMENT_CHOOSER: 'measurement-chooser-page'
};

const UnitConverterModule = new Lang.Class({
    Name: "UnitConverterModule",
    Extends: ModernCalcModule.ModernCalcModule,

    _init: function(params) {

        this.params = Params.parse(params, {
            app: false
        });

        let parentParams = {
            app: this.params.app,
            style_class: 'unit-converter-module',
            module_name: 'unit_converter',
            toolbar_button_label: _("Converter")
        };

        this._measurementList = null;
        this._activeMeasurement = null;
        this._loadMeasurementList();

        this._measurementListButton = null;

        this._visibleMeasurementButtonNameList = null;

        this._availableUnitsInfoBox = null;
        this._loadedMeasurementInfo = null;

        this._extraConvList = null;

        this.parent(parentParams);

        this._activePage = null;
        this._showPage(PAGES.MEASUREMENT_CHOOSER);
    },

    _prepareInterface: function(){

        this._initConversionInfoBox();
        this._initMeasurementChooserPage();
        this._initConversionPage();

        this.actor.add(this._conversionInfoBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this.actor.add(this._measurementChooserPage, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this.actor.add(this._conversionPage, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
    },

    _initConversionInfoBox: function(){
        this._conversionInfoBox = new St.BoxLayout({
            style_class: "conv-info-box",
            vertical: false
        });

        this._measurementLabel = new St.Label({
            text: _("Measurement")+":",
            style_class: "m-label"
        });

        this._activeMeasurementLabel = new St.Label({
            text: _("Undefined"),
            style_class: "m-value"
        });

        this._btnChangeMeasurement = new St.Button({
            label: _("Change"),
            style_class: "btn-change"
        });
        this._btnChangeMeasurement.connect("clicked", Lang.bind(this, function(){
            this._showPage(PAGES.MEASUREMENT_CHOOSER);
        }));


        this._conversionInfoBox.add(this._measurementLabel, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
        this._conversionInfoBox.add(this._activeMeasurementLabel, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
        this._conversionInfoBox.add(this._btnChangeMeasurement, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this.actor.add(this._conversionInfoBox, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
    },

    _initMeasurementChooserPage: function(){
        
        this._measurementChooserPage = new St.BoxLayout({
            style_class: 'measurement-chooser-page',
            vertical: true,
            visible: false
        });

        this._measurementChooserTitle = new St.Label({
            style_class: "measurement-chooser-title",
            text: _("What to convert?")
        });

        this._measurementFilterEntry = new St.Entry({
            style_class: "measurement-filter-entry",
            hint_text: _("Type a measurement"),
            track_hover: true,
            can_focus: true
        });
        this._measurementFilterEntry.clutter_text.connect('key-press-event', Lang.bind(this, this._measurementFilterEntryKeyPress));

        this._measurementListBox = new St.BoxLayout({
            style_class: 'measurement-list',
            vertical: true,
        });

        this._measurementChooserPage.add(this._measurementChooserTitle, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._measurementChooserPage.add(this._measurementFilterEntry, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._measurementChooserPage.add(this._measurementListBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });


        // load measurement list
        this._loadMeasurementListButton();
    },

    _initConversionPage: function(){
        this._conversionPage = new St.BoxLayout({
            style_class: 'conversion-page',
            vertical: true,
            visible: false
        });

        this._expressionLabel = new St.Label({
            text: _("Expression"),
            style_class: "expression-label"
        });

        this._expressionEntry = new St.Entry({
            text: "",
            hint_text: _("Type your Expression"),
            style_class: "expression-entry",
            track_hover: true,
            can_focus: true
        });
        this._expressionEntry.clutter_text.connect('key-press-event', Lang.bind(this, this._expressionEntryKeyPress));
        this._expressionEntry.clutter_text.connect('text-changed', Lang.bind(this, this._expressionChanged));


        // Available units
        this._availableUnitsInfoBox = new St.BoxLayout({
            style_class: 'available-units-info',
            vertical: true,
            visible: false
        });

        this._availableUnitsLabel = new St.Label({
            text: _("Available units for conversion")+":",
            style_class: "info-label"
        });
        
        this._availableUnitListBox = new St.BoxLayout({
            style_class: 'unit-list',
            vertical: true,
            visible: true
        });


        this._availableUnitsInfoBox.add(this._availableUnitsLabel, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._availableUnitsInfoBox.add(this._availableUnitListBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        // Conv Result
        this._resultBox = new St.BoxLayout({
            style_class: 'result-box',
            vertical: true,
            visible: false
        });
        this._resultTitleLabel = new St.Label({
            text: _("Conversion result")+":",
            style_class: "result-title"
        });

        this._resultHBox = new St.BoxLayout({
            style_class: '',
            vertical: false,
            visible: true
        });

        this._resultBox.add(this._resultTitleLabel, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._resultBox.add(this._resultHBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });


        this._resultLabel = new St.Label({
            text: "",
            style_class: "result-label"
        });

        this._btnCopyResult = new St.Button({
            label: _("Copy"),
            style_class: "result-btn-copy"
        });
        this._btnCopyResult.connect("clicked", Lang.bind(this, this._copyMainResult));

        this._resultHBox.add(this._resultLabel, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._resultHBox.add(this._btnCopyResult, {
            expand: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });        

        // Additional conv
        this._additionalConvBox = new St.BoxLayout({
            style_class: 'extra-conv',
            vertical: true,
            visible: false
        });

        this._additionalConvLabel = new St.Label({
            text: _("Additional Conversion")+":",
            style_class: "extra-conv-title"
        });
        
        this._additionalConvListBox = new St.BoxLayout({
            style_class: "conv-list",
            vertical: true,
            visible: true
        });

        this._additionalConvBox.add(this._additionalConvLabel, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._additionalConvBox.add(this._additionalConvListBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        //
        this._conversionPage.add(this._expressionLabel, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
        this._conversionPage.add(this._expressionEntry, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
        this._conversionPage.add(this._availableUnitsInfoBox, {
            expand: true,
            x_fill: true,
            y_fill: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._conversionPage.add(this._resultBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });
        this._conversionPage.add(this._additionalConvBox, {
            expand: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

    },

    _showAvailableUnitsInfo: function(){

        if(this._availableUnitListBox !== null){

            this._availableUnitsInfoBox.visible = true;
            this._resultBox.visible = false;

            this._availableUnitListBox.remove_all_children();

            let availableUnitInfoActor = this._loadMeasurementInfo();
            if(availableUnitInfoActor !== null){
                this._availableUnitListBox.add(availableUnitInfoActor, {
                    expand: true,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });   
            }
        }
    },

    _loadMeasurementInfo: function(){
        if(this._loadedMeasurementInfo === null){
            this._loadedMeasurementInfo = new Array();
        }

        let measurement = this._activeMeasurement;
        if(measurement !== null){

            // verify if was already loaded and return it
            if(this._loadedMeasurementInfo.length > 0){

                for(let i=0; i < this._loadedMeasurementInfo.length; i++){
                    storedInfo = this._loadedMeasurementInfo[i];
                    if(storedInfo !== null && storedInfo.name == measurement.name){
                        return storedInfo.info_actor;
                    }
                }
            }

            // create it
            let infoBox = new St.BoxLayout({
                style_class: "",
                vertical: false
            });

            if(measurement.hasOwnProperty('available_units') && measurement.available_units.length > 0){
                
                let symbolBox = new St.BoxLayout({
                    style_class: "symbol-box",
                    vertical: true
                });
                let nameBox = new St.BoxLayout({
                    style_class: "name-box",
                    vertical: true
                });

                let units = measurement.available_units;
                for(let k=0; k < units.length; k++){

                    let symbol = units[k].symbol;
                    if(typeof symbol == 'object'){
                        symbol = symbol[0];
                    }

                    let symbolLabel = new St.Label({
                        text: symbol,
                        style_class: "l-symbol"
                    });
                    
                    let nameLabel = new St.Label({
                        text: _(units[k].name),
                        style_class: "l-name"
                    });
                    
                    if(k % 2 == 0){
                        symbolLabel.add_style_pseudo_class('even');
                        nameLabel.add_style_pseudo_class('even');
                    } else {
                        symbolLabel.add_style_pseudo_class('odd');
                        nameLabel.add_style_pseudo_class('odd');
                    }

                    symbolBox.add(symbolLabel, {
                        expand: false,
                        x_align: St.Align.START,
                        y_align: St.Align.START
                    });

                    nameBox.add(nameLabel, {
                        expand: true,
                        x_align: St.Align.START,
                        y_align: St.Align.START
                    });
                }

                infoBox.add(symbolBox, {
                    expand: false,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });

                infoBox.add(nameBox, {
                    expand: true,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });

            } else {
                let label = new St.Label({
                    text: _("The active measurement doesn't have information about available units"),
                    style_class: "empty-list-info"
                });

                label.clutter_text.set_single_line_mode(false);
                label.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD);
                label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
                label.clutter_text.set_line_wrap(true);

                infoBox.add(label, {
                    expand: true,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });
            }

            // store for future use
            this._loadedMeasurementInfo.push({
                name: measurement.name,
                info_actor: infoBox 
            });

            return infoBox;   
        }

        return null;
    },

    _showAdditionalConversion: function(){

        if(this._extraConvList !== null && this._extraConvList.length > 0){

            this._additionalConvListBox.destroy_all_children();
            this._additionalConvBox.visible = true;

            let conv_result;
            for(let k=0; k < this._extraConvList.length; k++){
                
                conv_result = this._extraConvList[k];

                let label = new St.Label({
                    text: conv_result,
                    style_class: "list-item"
                });
                
                if(k % 2 == 0){
                    label.add_style_pseudo_class('even');
                } else {
                    label.add_style_pseudo_class('odd');
                }

                this._additionalConvListBox.add(label, {
                    expand: true,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });
            }
        }
    },

    _loadMeasurementListButton: function(){
        if(this._measurementListButton === null){
            this._measurementListButton = new Array();

            if(this._measurementList !== null){
                this._measurementListBox.destroy_all_children();

                let measurement;
                for(let i=0; i< this._measurementList.length; i++){
                    measurement = this._measurementList[i];

                    let listButton = new St.Button({
                        label: measurement.name,
                        style_class: 'list-item'
                    });
                    listButton.connect("clicked", Lang.bind(this, function(){
                        this._setActiveMeasurement(listButton.label);
                    }));

                    this._measurementListBox.add(listButton, {
                        expand: false,
                        x_align: St.Align.START,
                        y_align: St.Align.START
                    });
                    
                    this._measurementListButton[i] = listButton;
                }
            }
        }
    },

    _setActiveMeasurement: function(name){

        if(name != undefined){
            if(this._measurementList !== null){

                let measurement;
                for(let i=0; this._measurementList.length; i++){
                    measurement = this._measurementList[i];

                    if(measurement.name == name){
                        // set the choosen measurement
                        this._activeMeasurementLabel.text = name;
                        this._activeMeasurement = this._measurementList[i];

                        // load the conversion page
                        this._showPage(PAGES.CONVERSION);
                        break;
                    }
                }
            }
        }
    },

    _clearMeasurementFilter: function(){
        this._measurementFilterEntry.text = "";
        this._showMeasurements();
        this.clear_status_message();
    },

    _measurementFilterEntryKeyPress: function(actor, event) {
        let key = event.get_key_symbol();
        if(key == Clutter.KEY_Return || key == Clutter.KEY_KP_Enter || key == Clutter.KEY_ISO_Enter){

            if(this._visibleMeasurementButtonNameList !== null && this._visibleMeasurementButtonNameList.length == 1){
                this._setActiveMeasurement(this._visibleMeasurementButtonNameList[0]);
            } else {
                this._showMeasurements(this._measurementFilterEntry.text);    
            }
        }
    },

    _expressionChanged: function(){
        this.clear_status_message();

        this._additionalConvBox.visible = false;
        this._resultBox.visible = false;

        if(this._expressionEntry.text == ""){
            this._showAvailableUnitsInfo();
        }
    },

    _expressionEntryKeyPress: function(actor, event) {
        let key = event.get_key_symbol();
        if(key == Clutter.KEY_Return || key == Clutter.KEY_KP_Enter || key == Clutter.KEY_ISO_Enter){

            // trim spaces
            this._expressionEntry.text = Utils.trimText(this._expressionEntry.text);

            this._convert();

            if(this._expressionEntry.text == ""){
                this._showAvailableUnitsInfo();
            }
        }
    },

    _clearExpression: function(){
        this._expressionEntry.text = "";
        this._expressionEntry.grab_key_focus();

        this._extraConvList = null;
        this._additionalConvBox.visible = false;
        this._showAvailableUnitsInfo();
        this.clear_status_message();
    },

    _clearExtraConversion: function(){

    },

    _showMeasurements: function(term){
        if(this._measurementListButton !== null){

            this._visibleMeasurementButtonNameList = new Array();

            if(term != undefined) term = term.toUpperCase();

            let listButton, count = 0;
            for(let i=0; i< this._measurementListButton.length; i++){
                listButton = this._measurementListButton[i];

                if(term == undefined || listButton.label.toUpperCase().indexOf(term) != -1){
                    listButton.visible = true;
                    this._visibleMeasurementButtonNameList.push(listButton.label);
                    count++;
                } else {
                    listButton.visible = false;
                }
            }

            if(count == 0){
                this.set_status_message("information", _("Nothing found"));
            } else if(count == 1) {
                this.set_status_message("information", _("One measurement was found"));
            } else {
                this.set_status_message("information", count+ " "+_("measurements were found"));
            }
        }
    },

    _clearActiveMeasurement: function(){
         this._activeMeasurement = null;
         this._activeMeasurementLabel.text = '';
    },

    _showPage: function(page_name){

        if(page_name && page_name != this._activePage){

            if(page_name == PAGES.MEASUREMENT_CHOOSER){
                this._conversionPage.visible = false;
                this._measurementChooserPage.visible = true;
                this._resultBox.visible = false;

                this._clearMeasurementFilter();

                this._measurementFilterEntry.grab_key_focus();

                this._clearActiveMeasurement();

                this._activePage = page_name;
            }
            else if(page_name == PAGES.CONVERSION){
                this._clearExpression();

                this._measurementChooserPage.visible = false;
                this._conversionPage.visible = true;
                
                this._activePage = page_name;
            }
        }

        this.clear_status_message();
    },



    // CONVERSION =============================================================

    _loadMeasurementList: function(){
        this._measurementList = MeasurementList.MeasurementList;

        // translate measurement names
        for(let k=0; k < this._measurementList.length; k++){
            let measurement = this._measurementList[k];

            if(measurement.hasOwnProperty('name')){
                measurement.name = _(measurement.name);
            }
        }
    },

    _parseExpression: function(expr){
        if(expr && expr != ""){

            if(expr.indexOf(' to ') != -1){ return false; }

            if(this._activeMeasurement !== null && 
                this._activeMeasurement.valid_expression(expr)
            ){
                return true;
            }
        }

        return false;
    },

    _convert: function(){

        this._availableUnitsInfoBox.visible = false;
        this._clearResult();

        let expr = this._expressionEntry.text;

        // replaces  commas by dots
        expr = Utils.replaceAll(expr, ',', '.');

        if(this._activeMeasurement === null){
            this.set_status_message("error", _("Select a Measurement first"));

        } else if(expr != ""){

            if(this._parseExpression(expr)){

                try {
                    
                    expr = this._activeMeasurement.replace_text(expr);

                    let parts = expr.split('>');
                    let source = TranslateExpression(parts[0]);
                    let dest = TranslateExpression(parts[1]);
                    
                    let qty = Qty.Qty(source);
                    let result = qty.toString(dest);

                    result = this._activeMeasurement.format_result(result);
                    result = this._translateResultUnitName(result);

                    // fill the extra conv list
                    if(this._activeMeasurement.hasOwnProperty('available_units') &&
                        this._activeMeasurement.available_units.length > 0
                    ){
                        this._extraConvList = new Array();

                        // loop for conversion
                        let extra_result, units = this._activeMeasurement.available_units;
                        for(let k=0; k < units.length; k++){

                            if(units[k].hasOwnProperty('c_symbol')){
                                extra_result = qty.toString(units[k].c_symbol);

                                extra_result = this._activeMeasurement.format_result(extra_result);
                                extra_result = this._translateResultUnitName(extra_result);

                                this._extraConvList.push(extra_result);
                            }
                        }
                    }

                    // show the result
                    this._showResult(result);

                    qty = null;

                } catch(e) {
                    
                    if(e instanceof Qty.Qty.Error) {
                        this.set_status_message("error", _(e.message));
                    }
                    else {
                        this.set_status_message("error", _("Errors happened when trying to convert"));
                    }
                }

            } else {
                this.set_status_message("error", _("The expression was not recognized"));
            }
        } else {
            this.set_status_message("information", _("Insert an expression to convert"));
        }
    },

    _translateResultUnitName: function(result){
        if(result != undefined && result != null && result != "" && result.indexOf(' ') > 0){
            let parts = result.split(' ');

            if(parts.length == 2){
                result = parts [0] + ' ' + _(parts[1]);
            }
        }

        return result;
    },

    _showResult: function(result){

        if(result){
            this._resultBox.visible = true;

            this._resultLabel.text = result;

            this._showAdditionalConversion();            
        }
    },

    _copyMainResult: function(){
        let result = this._resultLabel.text;
        this.copy_to_clipboard(result);
    },

    _clearResult: function(){
        this._resultLabel.text = "";

        if(this._extraConvList!== null){
            for(let i=0; i < this._extraConvList.length;i++)
                this._extraConvList.pop();
        }

        this._extraConvList = null;
        this._additionalConvBox.visible = false;
    },
    // ========================================================================


    on_activate: function(){
        // set focus
        if(this._activePage !== null){
            if(this._activePage == PAGES.MEASUREMENT_CHOOSER){
                this._measurementFilterEntry.grab_key_focus();
            } else if(this._activePage == PAGES.CONVERSION){
                this._expressionEntry.grab_key_focus();
            }

        }

        this.parent();
    },

    on_deactivate: function(){
        this.parent();
    },

    on_key_press_event: function(o, e){
        let modifierState = e.get_state();
        let symbol = e.get_key_symbol();
        let keyCode = e.get_key_code();

        // CTRL
        if(modifierState == Clutter.ModifierType.CONTROL_MASK){

            // CTRL+Space Clear entries
            if(symbol === Clutter.KEY_space){

                if(this._activePage == PAGES.MEASUREMENT_CHOOSER){
                    this._clearMeasurementFilter();
                } else if(this._activePage == PAGES.CONVERSION){
                    this._clearExpression();
                }

            }
            // CTRL+M Show measurement chooser
            else if(keyCode == 58){
                this._showPage(PAGES.MEASUREMENT_CHOOSER);
            }
        }
        // CTRL+Shift
        else if(modifierState == Clutter.ModifierType.CONTROL_MASK + Clutter.ModifierType.SHIFT_MASK){
            
            // CTRL+Shift+C Copy main result
            if(keyCode == 54){
                this._copyMainResult();
            }
        }

    },

    destroy: function(){
        this._measurementList = null;
        this._extraConvList = null;
        this._measurementListButton = null;
        this._availableUnitsInfoBox = null;

        this.parent();
    },

});
