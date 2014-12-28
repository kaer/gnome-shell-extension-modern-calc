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
 *    Modern Calc 4, Kaer (C) 2014 Kaer
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
const Params = imports.misc.params;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();
const ModernCalcModule = Me.imports.modern_calc_module;
const Utils = Me.imports.utils;

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
            toolbar_button_label: 'Converter'
        };

        this._measurementList = null;
        this._activeMeasurement = false;
        this._loadMeasurementList();

        this._measurementListButton = null;

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
            text: "Measurement:",
            style_class: "m-label"
        });

        this._activeMeasurementLabel = new St.Label({
            text: "Undefined",
            style_class: "m-value"
        });

        this._btnChangeMeasurement = new St.Button({
            label: 'Change',
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
            text: "What to convert?"
        });

        this._measurementFilterEntry = new St.Entry({
            style_class: "measurement-filter-entry",
            hint_text: "Type a measurement",
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


    _measurementFilterEntryKeyPress: function(actor, event) {
        let key = event.get_key_symbol();
        if(key == Clutter.KEY_Return || key == Clutter.KEY_KP_Enter || key == Clutter.KEY_ISO_Enter){
            this._showMeasurements(this._measurementFilterEntry.text);
        }
    },

    _showMeasurements: function(term){
        if(this._measurementListButton !== null){

            if(term != undefined) term = term.toUpperCase();

            let listButton;
            for(let i=0; i< this._measurementListButton.length; i++){
                listButton = this._measurementListButton[i];

                if(term == undefined || listButton.label.toUpperCase().indexOf(term) != -1)
                    listButton.visible = true;
                else 
                    listButton.visible = false;                
            }
        }
    },

    _showPage: function(page_name){

        if(page_name && page_name != this._activePage){

            if(page_name == PAGES.MEASUREMENT_CHOOSER){
                this._conversionPage.visible = false;
                this._measurementChooserPage.visible = true;

                this._measurementFilterEntry.text = '';
                this._showMeasurements();

                this._activePage = page_name;
            }
            else if(page_name == PAGES.CONVERSION){
                this._measurementChooserPage.visible = false;
                this._conversionPage.visible = true;
                
                this._activePage = page_name;
            }
        }
    },



    // CONVERSION =============================================================

    _loadMeasurementList: function(){
        this._measurementList = [
            {
                name: 'Length',
                //units: 'm', 'mm', 'cm',...
                conv_function: function(value){

                }
            },
            {
                name: 'Speed',
                conv_function: function(value){

                }
            }
        ];
    },
    // ========================================================================


    on_activate: function(){
        // set focus
        if(this._activePage !== null){
            if(this._activePage == PAGES.MEASUREMENT_CHOOSER){
                this._measurementFilterEntry.grab_key_focus();
            }
        }

        this.parent();
    },

    on_deactivate: function(){
        this.parent();
    },

    destroy: function(){
        this.parent();
    },

});
