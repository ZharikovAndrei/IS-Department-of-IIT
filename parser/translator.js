<<<<<<< HEAD
function translit (letter) {

	switch (letter) {
	   // case 'зг' : return 'zgh'
      //  case 'Зг' : return 'Zgh'
        case 'А': return 'A'
        case 'а': return 'a'
        case 'Б': return 'B'
        case 'б': return 'b'
        case 'В': return 'V'
        case 'в': return 'v'
        case 'Г': return 'G'
        case 'г': return 'g'
        case 'Ґ': return 'G'
        case 'ґ': return 'g'
        case 'Д': return 'D'
        case 'д': return 'd'
        case 'Е': return 'E'
        case 'е': return 'e'
        case 'Ё': return 'E'
        case 'ё': return 'e'
        case 'Є': return 'Ye'
        case 'є': return 'ie'
        case 'Ж': return 'Zh'
        case 'ж': return 'zh'
        case 'З': return 'Z'
        case 'з': return 'z'
        case 'И': return 'Y'
        case 'и': return 'y'
        case 'І': return 'I'
        case 'і': return 'i'
        case 'Ї': return 'Yi'
        case 'ї': return 'i'
        case 'Й': return 'Y'
        case 'й': return 'i'
        case 'К': return 'K'
        case 'к': return 'k'
        case 'Л': return 'L'
        case 'л': return 'l'
        case 'М': return 'M'
        case 'м': return 'm'
        case 'Н': return 'N'
        case 'н': return 'n'
        case 'О': return 'O'
        case 'о': return 'o'
        case 'П': return 'P'
        case 'п': return 'p'
        case 'Р': return 'R'
        case 'р': return 'r'
        case 'С': return 'S'
        case 'с': return 's'
        case 'Т': return 'T'
        case 'т': return 't'
        case 'У': return 'U'
        case 'у': return 'u'
        case 'Ф': return 'F'
        case 'ф': return 'f'
        case 'Х': return 'Kh'
        case 'х': return 'kh'
        case 'Ц': return 'Ts'
        case 'ц': return 'ts'
        case 'Ч': return 'Ch'
        case 'ч': return 'ch'
        case 'Ш': return 'Sh'
        case 'ш': return 'sh'
        case 'Щ': return 'Shch'
        case 'щ': return 'shch'
        case 'Ы': return 'Y'
        case 'ы': return 'y'
        case 'Э': return 'E'
        case 'э': return 'e'
        case 'Ю': return 'Yu'
        case 'ю': return 'iu'
        case 'Я': return 'Ya'
        case 'я': return 'ia'
        case 'Ь': return ''
        case 'ь': return ''
        case 'Ъ': return ''
        case 'ъ': return ''
        case '\'': return ''
        case '0': return '0'
        case '1': return '1'
        case '2': return '2'
        case '3': return '3'
        case '4': return '4'
        case '5': return '5'
        case '6': return '6'
        case '7': return '7'
        case '8': return '8'
        case '9': return '9'
        case ' ': return '_'
        case ':': return '_'
        case ',': return '_'
        case '–': return '_'
        case '.': return '_'
        case '-': return '_'
	}

    var matches = letter.match(/[A-Za-z]/);

    if (matches != null) { return letter; }
    return "_";
}

function convertString (str) {

    var newstr = "";

    for (var i = 0; i < str.length; i++) {
        newstr = newstr + translit(str[i]);
    }

    return newstr;
}

function translateToScs(bibleographicLineObject) {
    var finalString;
    var mainNode;

	if (bibleographicLineObject["Title"] != null) {
		mainNode = convertString(bibleographicLineObject["Title"]);
		finalString ="sc_node_not_relation -> " +
	    mainNode + ";;\n\n";
	    finalString = finalString + convertString(bibleographicLineObject["Title"]) +
	    "=> nrel_main_idtf: [" + bibleographicLineObject["Title"] +"]\n(*\n<- lang_ru;;\n*);;"
	}

	if (bibleographicLineObject["Authors"] != null) {
	
		for (var i = 0; i < bibleographicLineObject["Authors"].length; i++) {
				finalString = finalString + "\n=> nrel_author:" + convertString(bibleographicLineObject["Authors"][i]) + ";;\n";
		}
	}


	if (bibleographicLineObject["Publisher"]  != null) {
		finalString = finalString + "\n=>nrel_company:" + convertString(bibleographicLineObject["Publisher"]['name']) + ";;\n";
		finalString = finalString + "\n=>nrel_place_publication:" + convertString(bibleographicLineObject["Publisher"]['place']) + ";;\n";
		finalString = finalString + "\n=>nrel_year_of_publication:" + "[" + bibleographicLineObject["Publisher"]['year'] + "]" + ";;\n";

	}

	

	if (bibleographicLineObject["Pageination"] != null) {
		if (bibleographicLineObject["Pageination"].hasOwnProperty('Beginning')) {
			finalString = finalString + "\n=> nrel_number_start_page:" + " [" +
			 convertString(bibleographicLineObject["Pageination"]['Beginning']) +"] " + ";;\n";
			 finalString = finalString + "\n=> nrel_number_end_page:" + " [" +
			 convertString(bibleographicLineObject["Pageination"]['End']) +"] " + ";;\n";
		}
		else {
			finalString = finalString + "\n=> nrel_count_page:" + " [" +
			 convertString(bibleographicLineObject["Pageination"]) +"] " + ";;\n";
		}
		
	}

	if (bibleographicLineObject["DocType"] != null) {
		finalString = finalString + "\n=> nrel_information_publication: " +
                "[" + bibleographicLineObject["DocType"]+ ";]" + "(*<-lang_ru;;*);;\n";
	}

	if (bibleographicLineObject["Voluminosity"] != null) {
                finalString = finalString + "\n=> nrel_voluminosity: " +
                "[" + bibleographicLineObject["Voluminosity"]['Number']+ "]" + ";;\n";
                  
                 if (bibleographicLineObject["Voluminosity"]["Current"] != null) {
                     finalString = finalString + "\n=> nrel_volume: " +
                    "[" + bibleographicLineObject["Voluminosity"]['Current']+ "]" + ";;\n";
                 }
	}


	if (bibleographicLineObject["Periodical"] != null) {
                finalString = finalString + "\n<= nrel_periodical: ... \n" +
                "    (*\n" +
                "     -> rrel_periodical_name: [" + bibleographicLineObject["Periodical"]["title"] +  "] (*<-lang_ru;;*);;\n" + 
                "     -> rrel_periodical_number: [" + bibleographicLineObject["Periodical"]["number"] +  "];;\n" + 
                "     -> rrel_periodical_year: [" + bibleographicLineObject["Periodical"]["year"] +  "];;\n" +
                "    *);;\n";
	}

	//var material = getMaterialInfo(regExps);
	//if (material != null) {
	//	bibleographicLineObject["Material"] = material;
	//}

	if (bibleographicLineObject["Url"]  != null) {
		finalString = finalString + "=> nrel_reference_standard: [" + bibleographicLineObject["Url"] +
                + "] (*concept_link;;*);;\n"
	}

    var blob = new Blob([finalString], {type: "text/plain;charset=utf-8"});
    saveAs(blob, mainNode + ".scs")

	//var accessDate = getAccessDate(regExps);
        //if (accessDate != null) {
	//	bibleographicLineObject["AccessDate"] = accessDate;
	//	bibleographicLineObject["Material"] = "Электронный ресурс";
	//}
}




=======
function translit (letter) {

	switch (letter) {
	   // case 'зг' : return 'zgh'
      //  case 'Зг' : return 'Zgh'
        case 'А': return 'A'
        case 'а': return 'a'
        case 'Б': return 'B'
        case 'б': return 'b'
        case 'В': return 'V'
        case 'в': return 'v'
        case 'Г': return 'G'
        case 'г': return 'g'
        case 'Ґ': return 'G'
        case 'ґ': return 'g'
        case 'Д': return 'D'
        case 'д': return 'd'
        case 'Е': return 'E'
        case 'е': return 'e'
        case 'Ё': return 'E'
        case 'ё': return 'e'
        case 'Є': return 'Ye'
        case 'є': return 'ie'
        case 'Ж': return 'Zh'
        case 'ж': return 'zh'
        case 'З': return 'Z'
        case 'з': return 'z'
        case 'И': return 'Y'
        case 'и': return 'y'
        case 'І': return 'I'
        case 'і': return 'i'
        case 'Ї': return 'Yi'
        case 'ї': return 'i'
        case 'Й': return 'Y'
        case 'й': return 'i'
        case 'К': return 'K'
        case 'к': return 'k'
        case 'Л': return 'L'
        case 'л': return 'l'
        case 'М': return 'M'
        case 'м': return 'm'
        case 'Н': return 'N'
        case 'н': return 'n'
        case 'О': return 'O'
        case 'о': return 'o'
        case 'П': return 'P'
        case 'п': return 'p'
        case 'Р': return 'R'
        case 'р': return 'r'
        case 'С': return 'S'
        case 'с': return 's'
        case 'Т': return 'T'
        case 'т': return 't'
        case 'У': return 'U'
        case 'у': return 'u'
        case 'Ф': return 'F'
        case 'ф': return 'f'
        case 'Х': return 'Kh'
        case 'х': return 'kh'
        case 'Ц': return 'Ts'
        case 'ц': return 'ts'
        case 'Ч': return 'Ch'
        case 'ч': return 'ch'
        case 'Ш': return 'Sh'
        case 'ш': return 'sh'
        case 'Щ': return 'Shch'
        case 'щ': return 'shch'
        case 'Ы': return 'Y'
        case 'ы': return 'y'
        case 'Э': return 'E'
        case 'э': return 'e'
        case 'Ю': return 'Yu'
        case 'ю': return 'iu'
        case 'Я': return 'Ya'
        case 'я': return 'ia'
        case 'Ь': return ''
        case 'ь': return ''
        case 'Ъ': return ''
        case 'ъ': return ''
        case '\'': return ''
        case '0': return '0'
        case '1': return '1'
        case '2': return '2'
        case '3': return '3'
        case '4': return '4'
        case '5': return '5'
        case '6': return '6'
        case '7': return '7'
        case '8': return '8'
        case '9': return '9'
        case ' ': return '_'
        case ':': return '_'
        case ',': return '_'
        case '–': return '_'
        case '.': return '_'
        case '-': return '_'
	}

    var matches = letter.match(/[A-Za-z]/);

    if (matches != null) { return letter; }
    return "_";
}

function convertString (str) {

    var newstr = "";

    for (var i = 0; i < str.length; i++) {
        newstr = newstr + translit(str[i]);
    }

    return newstr;
}

function translateToScs(bibleographicLineObject) {
    var finalString;
    var mainNode;

	if (bibleographicLineObject["Title"] != null) {
		mainNode = convertString(bibleographicLineObject["Title"]);
		finalString ="sc_node_not_relation -> " +
	    mainNode + ";;\n\n";
	    finalString = finalString + convertString(bibleographicLineObject["Title"]) +
	    "=> nrel_main_idtf: [" + bibleographicLineObject["Title"] +"]\n(*\n<- lang_ru;;\n*);;"
	}

	if (bibleographicLineObject["Authors"] != null) {
	
		for (var i = 0; i < bibleographicLineObject["Authors"].length; i++) {
				finalString = finalString + "\n=> nrel_author:" + convertString(bibleographicLineObject["Authors"][i]) + ";;\n";
		}
	}


	if (bibleographicLineObject["Publisher"]  != null) {
		finalString = finalString + "\n=>nrel_company:" + convertString(bibleographicLineObject["Publisher"]['name']) + ";;\n";
		finalString = finalString + "\n=>nrel_place_publication:" + convertString(bibleographicLineObject["Publisher"]['place']) + ";;\n";
		finalString = finalString + "\n=>nrel_year_of_publication:" + "[" + bibleographicLineObject["Publisher"]['year'] + "]" + ";;\n";

	}

	

	if (bibleographicLineObject["Pageination"] != null) {
		if (bibleographicLineObject["Pageination"].hasOwnProperty('Beginning')) {
			finalString = finalString + "\n=> nrel_number_start_page:" + " [" +
			 convertString(bibleographicLineObject["Pageination"]['Beginning']) +"] " + ";;\n";
			 finalString = finalString + "\n=> nrel_number_end_page:" + " [" +
			 convertString(bibleographicLineObject["Pageination"]['End']) +"] " + ";;\n";
		}
		else {
			finalString = finalString + "\n=> nrel_count_page:" + " [" +
			 convertString(bibleographicLineObject["Pageination"]) +"] " + ";;\n";
		}
		
	}

	if (bibleographicLineObject["DocType"] != null) {
		finalString = finalString + "\n=> nrel_information_publication: " +
                "[" + bibleographicLineObject["DocType"]+ ";]" + "(*<-lang_ru;;*);;\n";
	}

	if (bibleographicLineObject["Voluminosity"] != null) {
                finalString = finalString + "\n=> nrel_voluminosity: " +
                "[" + bibleographicLineObject["Voluminosity"]['Number']+ "]" + ";;\n";
                  
                 if (bibleographicLineObject["Voluminosity"]["Current"] != null) {
                     finalString = finalString + "\n=> nrel_volume: " +
                    "[" + bibleographicLineObject["Voluminosity"]['Current']+ "]" + ";;\n";
                 }
	}


	if (bibleographicLineObject["Periodical"] != null) {
                finalString = finalString + "\n<= nrel_periodical: ... \n" +
                "    (*\n" +
                "     -> rrel_periodical_name: [" + bibleographicLineObject["Periodical"]["title"] +  "] (*<-lang_ru;;*);;\n" + 
                "     -> rrel_periodical_number: [" + bibleographicLineObject["Periodical"]["number"] +  "];;\n" + 
                "     -> rrel_periodical_year: [" + bibleographicLineObject["Periodical"]["year"] +  "];;\n" +
                "    *);;\n";
	}

	//var material = getMaterialInfo(regExps);
	//if (material != null) {
	//	bibleographicLineObject["Material"] = material;
	//}

	if (bibleographicLineObject["Url"]  != null) {
		finalString = finalString + "=> nrel_reference_standard: [" + bibleographicLineObject["Url"] +
                + "] (*concept_link;;*);;\n"
	}

    var blob = new Blob([finalString], {type: "text/plain;charset=utf-8"});
    saveAs(blob, mainNode + ".scs")

	//var accessDate = getAccessDate(regExps);
        //if (accessDate != null) {
	//	bibleographicLineObject["AccessDate"] = accessDate;
	//	bibleographicLineObject["Material"] = "Электронный ресурс";
	//}
}




>>>>>>> 9700d26c227e4807154c62b5d00f6e97843f7396
