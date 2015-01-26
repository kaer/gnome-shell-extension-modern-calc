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
 *    NOTE: This file is credited to the creator of Gnote/Tomboy Integration
 *    few changes were made: animation type, layout type and reveal direction
 */
 
const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const Panel = imports.ui.panel;
const Params = imports.misc.params;

const CONNECTION_IDS = {
    captured_event: 0
};

const Dialog = new Lang.Class({
    Name: "Dialog",

    _init: function(params) {
        this.params = Params.parse(params, {
            width_percents: 45,
            height_percents: 95,
            animation_time: 0.5,
            enable_reveal_animation: true,
            style_class: ''
        });
        this.actor = new St.BoxLayout({
            reactive: true,
            track_hover:true,
            can_focus: true
        });
        this.actor.connect(
            'key-press-event',
            Lang.bind(this, this._on_key_press_event)
        );
        this.actor.connect(
            'key-release-event',
            Lang.bind(this, this._on_key_release_event)
        );

        Main.uiGroup.add_actor(this.actor);
        Main.uiGroup.set_child_below_sibling(
            this.actor,
            Main.layoutManager.panelBox
        );

        this.boxLayout = new St.BoxLayout({
            style_class: this.params.style_class,
            vertical: true
        });
        this.actor.add_child(this.boxLayout);

        this._open = false;
        this.resize();
    },

    update_param: function(param, value){
        if(this.params !== null && this.params.hasOwnProperty(param)){
            this.params[param] = value;
        }
    },

    _connect_captured_event: function() {
        CONNECTION_IDS.captured_event = global.stage.connect(
            'captured-event',
            Lang.bind(this, this.on_captured_event)
        );
    },

    _disconnect_captured_event: function() {
        if(CONNECTION_IDS.captured_event > 0) {
            global.stage.disconnect(CONNECTION_IDS.captured_event);
        }
    },

    _on_key_press_event: function(o, e) {
        let symbol = e.get_key_symbol()

        if(symbol === Clutter.Escape) {
            this.hide();
            return true;
        }

        return false;
    },

    _on_key_release_event: function(o, e) {
        return false;
    },

    _disconnect_all: function() {
        this._disconnect_captured_event();
    },

    is_point_outside_dialog: function(x, y) {
        if(x < this.actor.x || y > (this.actor.y + this.actor.height)) {
            return true;
        }

        return false;
    },

    on_captured_event: function(object, event) {
        if(event.type() !== Clutter.EventType.BUTTON_PRESS) return;

        let [x, y, mods] = global.get_pointer();

        if(this.is_point_outside_dialog(x, y)) this.hide();
    },

    resize: function() {
        // primary monitor
        let monitor = Main.layoutManager.primaryMonitor;

        let available_height = monitor.height - Main.panel.actor.height;

        let my_width = monitor.width / 100 * this.params.width_percents;
        let my_height = available_height / 100 * this.params.height_percents;

        this._hidden_x = monitor.width;
        this._target_x = this._hidden_x - my_width;

        this._hidden_y = monitor.y - my_height;
        this._target_y = this._hidden_y + Main.panel.actor.height + my_height;

        if(Main.layoutManager.monitors.length == 1){
            this.actor.x = this._hidden_x;
            this.actor.y = Main.panel.actor.height;
        } else {
            this.actor.x = (monitor.width + monitor.x) - my_width;
            this.actor.y = this._hidden_y;
        }

        this.actor.width = my_width;
        this.actor.height = my_height;

        this.boxLayout.width  = my_width;
        this.boxLayout.height  = my_height;

    },

    show: function(animation, on_complete) {
        if(this._open) return;

        animation = animation ===
            undefined
            ? true
            : animation;
        let push_result = Main.pushModal(this.actor, {
            keybindingMode: Shell.KeyBindingMode.NORMAL
        });

        if(!push_result) return;

        this._open = true;
        this.actor.show();
        this.resize();

        if(this.params.enable_reveal_animation && animation) {
            if(Main.layoutManager.monitors.length == 1){
                Tweener.removeTweens(this.actor);
                Tweener.addTween(this.actor, {
                    time: this.params.animation_time / St.get_slow_down_factor(),
                    transition: 'easeOutExpo',
                    x: this._target_x,
                    onComplete: Lang.bind(this, function() {
                        if(typeof on_complete === 'function') on_complete();
                    })
                });
            } else {
                Tweener.removeTweens(this.actor);
                Tweener.addTween(this.actor, {
                    time: this.params.animation_time / St.get_slow_down_factor(),
                    transition: 'easeOutExpo',
                    y: this._target_y,
                    onComplete: Lang.bind(this, function() {
                        if(typeof on_complete === 'function') on_complete();
                    })
                });
            }
        }
        else {
            if(Main.layoutManager.monitors.length == 1){
                this.actor.x = this._target_x;
            } else {
                this.actor.y = this._target_y;
            }
            
            if(typeof on_complete === 'function') on_complete();
        }

        this._connect_captured_event();
    },

    hide: function(animation, on_complete) {
        if(!this._open) return;

        Main.popModal(this.actor);
        this._open = false;
        this._disconnect_captured_event();
        animation = animation ===
            undefined
            ? true
            : animation;

        if(this.params.enable_reveal_animation && animation) {
            if(Main.layoutManager.monitors.length == 1){
                Tweener.removeTweens(this.actor);
                Tweener.addTween(this.actor, {
                    time: this.params.animation_time / St.get_slow_down_factor(),
                    transition: 'easeInOutQuint',
                    x: this._hidden_x,
                    onComplete: Lang.bind(this, function() {
                        this.actor.hide();
                        if(typeof on_complete === 'function') on_complete();
                    })
                });
            } else {
                Tweener.removeTweens(this.actor);
                Tweener.addTween(this.actor, {
                    time: this.params.animation_time / St.get_slow_down_factor(),
                    transition: 'easeInOutQuint',
                    y: this._hidden_y,
                    onComplete: Lang.bind(this, function() {
                        this.actor.hide();
                        if(typeof on_complete === 'function') on_complete();
                    })
                });
            }
        }
        else {
            this.actor.hide();

            if(Main.layoutManager.monitors.length == 1){
                this.actor.x = this._hidden_x;
            } else {
                this.actor.y = this._hidden_y;
            }

            if(typeof on_complete === 'function') on_complete();
        }
    },

    toggle: function() {
        if(this._open) {
            this.hide();
        }
        else {
            this.show();
        }
    },

    destroy: function() {
        this._disconnect_all();
        this.actor.destroy();
    },

    get is_open() {
        return this._open;
    }
});
