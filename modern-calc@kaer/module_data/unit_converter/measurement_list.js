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
 *    Modern Calc 4, Kaer (C) 2014-2015 Kaer
 *    Modern Calc comes with ABSOLUTELY NO WARRANTY.
 *
 *    Author: Kaer (the.thin.king.way+2014@gmail.com)
 *    Project url: https://github.com/kaer/gnome-shell-extension-modern-calc
 *
 */

var MeasurementList = [
        // Length
        {
            'name': 'Length',
            'available_units': [
                { 'name': 'meter', 'c_symbol': 'm', 'symbol': 'm' },
                { 'name': 'inch', 'c_symbol': 'in', 'symbol': 'in' },
                { 'name': 'foot', 'c_symbol': 'ft', 'symbol': 'ft' },
                { 'name': 'yard', 'c_symbol': 'yd', 'symbol': 'yd' },
                { 'name': 'mile', 'c_symbol': 'mi', 'symbol': 'mi' },
                { 'name': 'naut-mile', 'c_symbol': 'nmi', 'symbol': 'nmi' },
                { 'name': 'league', 'c_symbol': 'league', 'symbol': ['league','leagues'] },
                { 'name': 'furlong', 'c_symbol': 'furlong', 'symbol': ['furlong','furlongs'] },
                { 'name': 'rod', 'c_symbol': 'rd', 'symbol': 'rd' },
                { 'name': 'mil', 'c_symbol': 'mil', 'symbol': ['mil','mils'] },
                { 'name': 'angstrom', 'c_symbol': 'ang', 'symbol': 'ang' },
                { 'name': 'fathom', 'c_symbol': 'fathom', 'symbol': ['fathom','fathoms'] },
                { 'name': 'pica', 'c_symbol': 'pica', 'symbol': ['pica','picas'] },
                { 'name': 'redshift', 'c_symbol': 'z', 'symbol': 'z' },
                { 'name': 'Astronomical Unit', 'c_symbol': 'AU', 'symbol': 'AU' },
                { 'name': 'light-second', 'c_symbol': 'ls', 'symbol': 'ls' },
                { 'name': 'light-minute', 'c_symbol': 'lmin', 'symbol' : 'lmin' },
                { 'name': 'light-year', 'c_symbol': 'ly', 'symbol': 'ly' },
                { 'name': 'parsec', 'c_symbol': 'pc', 'symbol': 'pc' }
            ],
            'valid_expression': function(text){
                return true;
            },
            'replace_text': function(text){
                return text;
            },
            'format_result': function(result){
                parts = result.split(' ');

                // plural form
                if(parts[0] > 1){
                    if(
                        endsWith(result, 'league') || 
                        endsWith(result, 'furlong') || 
                        endsWith(result, 'mil') || 
                        endsWith(result, 'fathom') || 
                        endsWith(result, 'pica')
                    ){
                        result = result+'s';
                    }
                }
                return result;
            }
        },

        // Speed
        {
            'name': 'Speed',
            'available_units': [
                { 'name': 'kilometers per hour (kph)', 'c_symbol': 'km/h', 'symbol': ['km/h', 'kph'] },
                { 'name': 'miles per hour (mph)', 'c_symbol': 'mi/h', 'symbol': ['mi/h', 'mph'] },
                { 'name': 'knot', 'c_symbol': 'knot', 'symbol': 'kt' },
                { 'name': 'nautical mile per hour', 'c_symbol': 'nmi/h', 'symbol': 'nmi/h' },
                { 'name': 'feet per hour', 'c_symbol': 'feet/h', 'symbol': 'feet/h' }
            ],
            'valid_expression': function(text){
                return true;
            },
            'replace_text': function(text){
                return text;
            },
            'format_result': function(result){
                return result;
            }
        },

        // Temperature
        {
            'name': 'Temperature',
            'available_units': [
                { 'name': 'Celsius', 'c_symbol': 'tempC','symbol': 'ºC'},
                { 'name': 'Fahreinheit', 'c_symbol': 'tempF', 'symbol': 'ºF'},
                { 'name': 'Kelvin', 'c_symbol': 'tempK', 'symbol': 'K'},
                { 'name': 'Rankine', 'c_symbol': 'tempR', 'symbol': 'R'}
            ],
            'valid_expression': function(text){
                //TODO see how to permit prefixes like k, M, G, Qty didn't accept

                var pattern = /^\-?[0-9]+(\.[0-9]+)?\s?(º|temp)?[CRKF]( to (º|temp)?[CRKF])?$/;

                if(pattern.test(text)) return true;

                return false;
            },
            'replace_text': function(text){

                text = text.trim();

                // replaces all temp to avoid problems
                // when just one exists
                text = replaceAll(text, 'temp','');

                text = replaceAll(text, 'º', '');

                if(text.indexOf('deg') === -1 && text.indexOf('temp') === -1){
                    text = text.replace('C','tempC');
                    text = text.replace('F','tempF');
                    text = text.replace('K','tempK');
                    text = text.replace('R','tempR');    
                }

                return text;
            },
            'format_result': function(result){

                result = result.replace('temp', '');

                // put the centigrade symbol in C and F
                result = result.replace('C', 'ºC');
                result = result.replace('F', 'ºF');
                
                return result;
            }
        }
    ];






/* AUXILIARY FUNCTIONS  ============================================================== */


function getMeasurement(measurement){
  for(var i=0; i< MeasurementList.length; i++){

    if(MeasurementList[i].name == measurement){
      return MeasurementList[i];
    }
  }

  return null;
}


// functions for Strings ------------------------------------------------------

// replaces matches of a substring
function replaceAll(text, term, sub){
    if(text == undefined) return undefined;
    if(term == undefined) return text;
    if(sub == undefined) sub = '';

    return text.split(term).join(sub);
}

// check if a string ends with a given substring
function endsWith(text, substr){
    if (text == undefined || substr == undefined) return undefined;
    
    var textLen = text.length;
    var substrLen = substr.length;
    var pos = text.lastIndexOf(substr);

    if(pos+substrLen == textLen){ return true; }

    return false;
}