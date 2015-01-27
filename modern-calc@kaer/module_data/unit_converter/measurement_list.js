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

var MeasurementList = [
        // Acceleration
        {
            'name': 'Acceleration',
            'available_units': [
                { 'name': 'km/s2', 'c_symbol': 'km/s2', 'symbol': 'km/s²' },
                { 'name': 'm/s2', 'c_symbol': 'm/s2', 'symbol': 'm/s²' },
                { 'name': 'gee', 'c_symbol': 'gee', 'symbol': 'gee' }
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
        //Area
        {
            'name': 'Area',
            'available_units': [
                { 'name': 'acre', 'c_symbol': 'acre', 'symbol': ['acre','acres'] },
                { 'name': 'hectare', 'c_symbol': 'hectare', 'symbol': 'hectare' },
                //{ 'name': 'sqft', 'c_symbol': 'sqft', 'symbol': 'sqft' }
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
                        endsWith(result, 'acre')
                    ){
                        result = result+'s';
                    }
                }
                return result;
            }
        },
        // Energy
        {
            'name': 'Energy',
            'available_units': [
                { 'name': 'joule', 'c_symbol': 'J', 'symbol': ["J","joule","Joule","joules"] },
                { 'name': 'erg', 'c_symbol': 'erg', 'symbol': ["erg","ergs"] },
                { 'name': 'btu', 'c_symbol': 'BTU', 'symbol': ["BTU","btu","BTUs"] },
                { 'name': 'calorie', 'c_symbol': 'cal', 'symbol': ["cal","calorie","calories"] },
                { 'name': 'Calorie', 'c_symbol': 'Cal', 'symbol': ["Cal","Calorie","Calories"] },
                { 'name': 'therm-US', 'c_symbol': 'th', 'symbol': ["th","therm","therms","Therm"] }
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
                        endsWith(result, 'erg')
                    ){
                        result = result+'s';
                    }
                }
                return result;
            }
        },
        // Force
        {
            'name': 'Force',
            'available_units': [
                { 'name': 'newton', 'c_symbol': 'N', 'symbol': ["N","Newton","newton"] },
                { 'name': 'dyne', 'c_symbol': 'dyn', 'symbol': ["dyn","dyne"] },
                { 'name': 'pound-force', 'c_symbol': 'lbf', 'symbol': ["lbf","pound-force"] }
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
                { 'name': 'astronomical unit', 'c_symbol': 'AU', 'symbol': 'AU' },
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
        // Mass
        {
            'name': 'Mass',
            'available_units': [
                { 'name': 'kilogram', 'c_symbol':  'kg', 'symbol': 'kg' },
                { 'name': 'gram', 'c_symbol' : 'g', 'symbol': ['g', 'gram', 'grams'] },
                { 'name': 'grain', 'c_symbol': 'grain', 'symbol': ['grain','grains','gr'] },
                { 'name': 'AMU', 'c_symbol': 'u', 'symbol': ['u','AMU','amu'] },
                { 'name': 'dalton', 'c_symbol':  'Da', 'symbol': ['Da','Dalton','Daltons'] },
                { 'name': 'slug', 'c_symbol': 'slug', 'symbol': ['slug','slugs'] },
                { 'name': 'short-ton', 'c_symbol': 'tn', 'symbol': ['tn','ton'] },
                { 'name': 'metric-ton', 'c_symbol': 'tonne', 'symbol': 'tonne' },
                { 'name': 'carat', 'c_symbol': 'ct', 'symbol': ['ct','carat','carats'] },
                { 'name': 'pound', 'c_symbol': 'lbs', 'symbol': ['lbs','lb'] },
                { 'name': 'ounce', 'c_symbol': 'oz', 'symbol': ['oz','ounce','ounces'] },
                { 'name': 'dram',  'c_symbol': 'dram', 'symbol': ['dram','drams','dr'] },
                { 'name': 'stone', 'c_symbol': 'stone', 'symbol': ['stone','stones','st'] }
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
                        endsWith(result, 'grain') || 
                        endsWith(result, 'slug') || 
                        endsWith(result, 'dram') || 
                        endsWith(result, 'stone')
                    ){
                        result = result+'s';
                    }
                }
                return result;
            }
        },
        // Power
        {
            'name': 'Power',
            'available_units': [
                { 'name': 'watt', 'c_symbol': 'W', 'symbol': ["W","watt","watts"] },
                { 'name': 'horse power', 'c_symbol': 'hp', 'symbol': ["hp","horsepower"] }
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
        // Pressure
        {
            'name': 'Pressure',
            'available_units' : [
                { 'name': 'pascal', 'c_symbol': 'Pa', 'symbol': 'Pa' },
                { 'name': 'bar', 'c_symbol': 'bar', 'symbol': ['bar','bars'] },
                { 'name': 'mmHg', 'c_symbol': 'mmHg', 'symbol': 'mmHg' },
                { 'name': 'inHg', 'c_symbol': 'inHg', 'symbol': 'inHg' },
                { 'name': 'torr', 'c_symbol': 'torr', 'symbol': 'torr' },
                { 'name': 'atm', 'c_symbol': 'atm', 'symbol': 'atm' },
                { 'name': 'psi', 'c_symbol': 'psi', 'symbol': 'psi' },
                //{ 'name': 'cmh2o', 'c_symbol': 'cmH2O', 'symbol': 'cmH2O' },
                //{ 'name': 'inh2o', 'c_symbol': 'inH2O', 'symbol': 'inH2O' }
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
                        endsWith(result, 'bar')
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
                { 'name': 'kilometers per hour (kph)', 'c_symbol': 'kph', 'symbol': ['km/h', 'kph'] },
                { 'name': 'miles per hour (mph)', 'c_symbol': 'mph', 'symbol': ['mi/h', 'mph'] },
                { 'name': 'knot', 'c_symbol': 'kt', 'symbol': 'kt' },
                { 'name': 'nautical mile per hour', 'c_symbol': 'nmi/h', 'symbol': 'nmi/h' },
                { 'name': 'feet per hour', 'c_symbol': 'feet/h', 'symbol': 'feet/h' },
                { 'name': 'feet per second', 'c_symbol': 'fps', 'symbol': 'feet/s' }
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

                var pattern = /^\-?[0-9]+(\.[0-9]+)?\s?(º|temp)?[CRKF]( > (º|temp)?[CRKF])?$/;

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
        },
        // Time
        {
            'name': 'Time',
            'available_units': [
                { 'name': 'second', 'c_symbol': 's', 'symbol': ["s","sec","secs","second","seconds"] },
                { 'name': 'minute', 'c_symbol': 'min', 'symbol': ["min","mins","minute","minutes"] },
                { 'name': 'hour', 'c_symbol': 'h', 'symbol': ["h","hr","hrs","hour","hours"] },
                { 'name': 'day', 'c_symbol': 'd', 'symbol': ["d","day","days"] },
                { 'name': 'week', 'c_symbol': 'wk', 'symbol': ["wk","week","weeks"] },
                { 'name': 'fortnight', 'c_symbol': 'fortnight', 'symbol': ["fortnight","fortnights"] },
                { 'name': 'year', 'c_symbol': 'y', 'symbol': ["y","yr","year","years","annum"] },
                { 'name': 'decade', 'c_symbol': 'decade', 'symbol': ["decade","decades"] },
                { 'name': 'century', 'c_symbol': 'century', 'symbol': ["century","centuries"] }
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
                        endsWith(result, 'fortnight') || 
                        endsWith(result, 'decade')
                    ){
                        result = result+'s';
                    } else if(result.indexOf('century')){
                        result = result.replace('century', 'centuries');
                    }
                }
                return result;
            }
        },
        // Volume
        {
            'name': 'Volume',
            'available_units': [
                { 'name': 'liter' , 'c_symbol': 'l', 'symbol': 'l' },
                { 'name': 'gallon', 'c_symbol': 'gal', 'symbol': ['gal','gallon','gallons'] },
                { 'name': 'quart', 'c_symbol': 'qt', 'symbol': ['qt','quart','quarts'] },
                { 'name': 'pint', 'c_symbol': 'pt', 'symbol': ['pt','pint','pints'] },
                { 'name': 'cup', 'c_symbol': 'cu', 'symbol': ['cu','cup','cups'] },
                { 'name': 'fluid-ounce', 'c_symbol': 'floz', 'symbol': ['floz','fluid-ounce'] },
                { 'name': 'tablespoon', 'c_symbol': 'tbs', 'symbol': ['tbs','tablespoon','tablespoons'] },
                { 'name': 'teaspoon', 'c_symbol': 'tsp', 'symbol': ['tsp','teaspoon','teaspoons'] },
                { 'name': 'bushel', 'c_symbol': 'bu', 'symbol': ['bu','bsh','bushel','bushels'] }
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

    if(substrLen > textLen){ return false; }

    if(pos+substrLen == textLen){ return true; }

    return false;
}