
/* Prefixes -------------------------------------------------------------------
 * the interpreter will do a case insensitive check
 * the translations should be inline
 */
var prefix_list = [
	[['Yotta','yottâ'], 'yotta'],
	[['Zetta','zettâ'], 'zetta'],
	[['Exa','exâ'], 'exa'],
	[['Peta','petâ'], 'peta'],
	[['Tera','terâ'], 'tera'],
	[['Giga','gigâ'], 'giga'],
	[['Mega','megâ'], 'mega'],
	[['kilo'], 'kilo'],
	[['Hecto','hectô'], 'hecto'],
	[['Deca','decâ','deka'], 'deca'],
	[['Deci','decí'], 'deci'],
	[['Centi','centí'], 'centi'],
	[['Milli','mili', 'milí'], 'milli'],
	[['Micro','micrô'], 'micro'],
	[['Nano','nanô'],'nano'],
	[['Pico','picô'], 'pico'],
	[['Femto','femtô'], 'femto'],
	[['Atto','attô'], 'atto'],
	[['Zepto','zeptô'], 'zepto'],
	[['Yocto','yoctô'], 'yocto']
];


var translation_list = [
	
	// Portuguese ========================================================== */
	// Acceleration
	// Area
	// Energy
	[['caloria', 'calorias'], 'calorie'],
	[['Caloria', 'Calorias'], 'Calorie'],

	// Force
	[['Newton'], 'newton'],
	[['dina'], 'dyne'],
	[['libra-força'], 'pound-force'],

	// Length
	[['metro', 'metros'], 'meter'],
	[['polegada', 'polegadas'], 'inch'],
	[['pé', 'pés'], 'foot'],
	[['jarda', 'jardas'], 'yard'],
	[['milha', 'milhas'], 'mile'],
	[['milha náutica', 'milhas náuticas', 'milha-náutica', 'milhas-náuticas'], 'nmi'],
	[['légua', 'léguas'], 'league'],
	[['Ângstrom'], 'angstrom'],
	[['braça', 'braças'], 'fathom'],
	[['unidade astronômica'], 'AU'],
	[['segundo-luz'], 'light-second'],
	[['minuto-luz'], 'light-minute'],
	[['ano-luz'], 'light-year'],
		
	// Mass
	[['kilograma', 'kilogramas'], 'kilogram'],
	[['grama', 'gramas'], 'gram'],
	[['u.m.a'], 'AMU'],
	[['Dalton'], 'dalton'],
	[['libra-massa'], 'slug'],
	//[[''], 'short-ton'],
	[['tonelada', 'toneladas'], 'tonne'],
	[['quilate', 'quilates'], 'carat'],
	[['libra', 'libras'], 'pound'],
	[['onça', 'onças'], 'ounce'],
	[['dracma','dracmas'], 'dram'],
	[['pedra', 'pedras'], 'stone'],

	// Power
	[['HP', 'Horse Power'], 'hp'],

	// Pressure
	[['Pascal'], 'pascal'],

	// Speed
	[['milha/h'], 'mph'],
	[['nó', 'nós'], 'knot'],
	[['milha náutica/h'], 'nmi/h'],
	[['pés/s'], 'feet/s'],

	// Temperature
	
	// Time
	[['segundo', 'segundos'], 'second'],
	[['minuto', 'minutos'], 'minute'],
	[['hora', 'horas'], 'hour'],
	[['dia', 'dias'], 'day'],
	[['semana', 'semanas'], 'week'],
	[['quinzena', 'quinzenas'], 'fortnight'],
	[['ano', 'anos'], 'year'],
	[['década', 'décadas'], 'decade'],
	[['século', 'séculos'], 'century'],

	// Volume
	[['litro','litros'],'liter'],
	[['galão','galões'],'gallon'],
	[['quarto de galão','quartos de galão'], 'quart'],
	[['pinta'], 'pint'],
	[['xícara', 'xícaras'], 'cup'],
	[['onça-líquida'], 'fluid-ounce'],
	[['colher','colheres'], 'tablespoon'],
	[['colher de chá','colheres de chá'], 'teaspoon'],
	[['alqueire', 'alqueires'], 'bushel']

	// ===================================================================== */

];








function trimText(term){
	if(term != undefined && term != null && term.length > 0){
		var pos = -1;

		// ltrim
		for(var i=0; i< term.length; i++){
			if(term.charAt(i) == ' '){
				pos++;
			} else {
				break;
			}
		}
		if(pos != -1){
			term = term.substring(pos+1);
		}

		// rtrim
		pos = term.length;
		for(var i = term.length-1; i >= 0; i--){
			if(term.charAt(i) == ' '){
				pos--;
			} else {
				break;
			}
		}
		if(pos != term.length){
			term = term.substring(0, pos);
		}
	}

	return term;
}

var cached_translations = null;

function inArray(arr, term){
	if(arr != null && term != null){
		for(var i = 0; i < arr.length; i++){
			if(arr[i] == term){
				return true;
			}
		}
	}
	
	return false;
}

function addToCache(term, value){
	if(term != undefined && term != null){
		if(cached_translations == null)
			cached_translations = new Array();

		if(inArray(cached_translations, term) != true){
			cached_translations.push([term, value]);
		}
	}
}

function getCachedValue(term){
	if(term != undefined && term != null && cached_translations != null){

		for(var i = 0; i < cached_translations.length; i++){
			if(cached_translations[i][0] == term){
				return cached_translations[i][1];
			}
		}
	}
	
	return null;
}

function fetchAcceptedTerm(term){

	if(term != undefined && term != null && term.length > 1){
		
		// get a cached value
		var cache = getCachedValue(term);
		if(cache != null){
			return cache;
		} else {
			var termList, acceptedValue;
			for(var i=0; i < translation_list.length; i++){
				termList = translation_list[i][0];
				acceptedValue = translation_list[i][1];

				if(inArray(termList, term)){
					addToCache(term, acceptedValue);

					return acceptedValue;
				}
			}
		}
	}

	return term;
}


// return the position where a prefix ends
function prefixEnd(text, prefixArray){

    if(text != undefined && prefixArray != undefined){
        text = text.toLowerCase();

        var prefix, pos;
        for(var i=0; i < prefixArray.length; i++){
            prefix = prefixArray[i].toLowerCase();

            if(text.indexOf(prefix) == 0){
                return prefix.length;
            }
        }
    }
    
    return 0;
}

function translateUnit(term){

	if(term != undefined && term != null && term.length > 1){

		var acceptedPrefix = '', unitName = '';
		
		if(term.length > 2){

			var termList, pEnd;
			for(var i=0; i < prefix_list.length; i++){
				
				termList = prefix_list[i][0];
				acceptedValue = prefix_list[i][1];
				
				pEnd = prefixEnd(term, termList);

				if(pEnd > 0){
					acceptedPrefix = acceptedValue;

					unitName = term.substring(pEnd);
				}
			}
		}

		if(acceptedPrefix == ''){
			return fetchAcceptedTerm(term);
		} else {
			return acceptedPrefix + fetchAcceptedTerm(unitName);
		}
	}

	return term;
}

function translate(term){

	if(term != undefined && term != null && term.length > 1){

		var unitPos = -1, termValue, unitName, hasValue = false;

		term = trimText(term);

		if(/[0-9|\.]/.test(term.charAt(0))){
			hasValue = true;
		}

		if(hasValue){
			// find the position where value ends
			for(var i=0; i < term.length; i++){
				if(/[0-9|\.|\/]/.test(term.charAt(i)) == false){
					unitPos = i;
					break;
				}
			}

			if(unitPos != -1){
				unitName = term.substring(unitPos);
				unitName = trimText(unitName);

				termValue = term.substring(0, unitPos);

				try {
					termValue = eval(termValue);
				} catch(e){
					throw new Error("Invalid value");
				}

				return termValue + ' '+ translateUnit(unitName);
			}
		} else {
			term = trimText(term);
			return translateUnit(term);
		}
	}

	return term;
}