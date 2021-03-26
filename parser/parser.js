
var Line;

function Regexps () {
	// Authors
	//this.initialAuthorsExtractReg = /(\/((\s[А-ЯA-Z]\.)+\s[А-ЯA-Z][а-яa-z]+(\,|\.|\s\[и\sдр\.\]\.))+\s–)/;
	this.initialAuthorsExtractReg = /(([А-Я]\.\s)+[А-Я][а-я]+(\,|\.|\s\[и\sдр\.\]|\s\/\/))/g;
	this.singleAuthorExtractReg = /(([А-ЯA-Z]\.\s)+[А-ЯA-Z][а-яa-z]+)/;

	// Title
	this.initialTitleExtractReg = /((\s[А-ЯA-Z]\.\s|\[\d\]\s|)[А-ЯA-Z][A-Za-zА-Яа-я\s–\,:]+(:|\/|\[[A-ZА-Я][A-Za-zА-Яа-я\s]+\]))/;
	this.finalTitleExtractReg = /([А-ЯA-Z][[А-ЯA-Zа-яa-z][А-ЯA-Zа-яa-z\s\,\.\-\–]+)/;

	// Publisher info
	this.initialPublisherExtractReg = /\.\s\s[A-Za-zА-Яа-я-]+.\s:\s[A-Za-zА-Яа-я-\s]+.\s(\d)+\./;
	this.initialCityReg = /\.\s\–\s[A-Za-zА-Яа-я-]+.\s:/;
	this.finalCityReg = /[A-Za-zА-Яа-я-]+/;
	this.initialPublisherNameReg = /(:\s[А-ЯA-Z][А-ЯA-Zа-яa-z\s–]+\,)/;
	this.finalPublisherNameReg = /([А-ЯA-Z][А-ЯA-Zа-яa-z–\s]+)/;
	this.initialPublishingYearReg = /,\s(\d\d\d\d)./;
	this.finalPublishingYearReg = /\d+/;

	// Periodical info
	this.initialPeriodical = /(\/\/\s[A-ZА-Я][A-ZА-Яа-яa-z–\s]+\.\s–\s\d+\.\s–\s№\d+\.)/;
	this.initialPeriodicalTitle = /\/\/\s[A-ZА-Я][A-ZА-Яа-яa-z–\s]+\./;
	this.finalPeriodicalTitle = /[A-ZА-Я][A-ZА-Яа-яa-z–\s]+/;
	this.initialPeriodicalYear = /(–\s(\d\d\d\d).)/;
	this.initialPeriodicalNumber = /(–\s№\d+.)/;

	// Sequence number
	this.sequenceNumberReg = /(\[\d\])/;

	// Pageination
	this.pageinationExtractReg = /((С\.\s\d+\s–\s\d+\.)|(–\s\d+\sс\.))/;

	// Volume info
	this.initialVolumesNumberReg = /(:\s[а-я]+\.\sВ\s\d\sт\.\s\/)/;
	this.initialVolumeNumberReg = /(Т\.\s\d\.)/;


	this.numberReg = /\d+/g;

	this.yearReg = /(\d\d\d\d)/;

	this.initialDocTypeReg = /(:\s[А-ЯA-Zа-яa-z\.\s]+\/)/;
	this.finalDocTypeReg = /([A-Za-zА-Яа-я][A-Za-zА-Яа-я\s\.]+[A-Za-zА-Яа-я\.])/;

	// Material info
	this.initialMaterialInfo = /(\[[A-ZА-Я][A-Za-zА-Яа-я\s]+\])/;
	this.finalMaterialInfo = /([A-ZА-Я][A-Za-zА-Яа-я\s.]+)/;

	// URL 
	this.initialUrl = /(Режим\sдоступа\s:\s(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-?&=]*)*\/?)/;
	this.finalUrl = /((https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-?&=]*)*\/?)/;

	// Date of access
	this.initialAccessDate = /(Дата доступа\s:\s:\s\d\d.\d\d.(\d\d\d\d|\d\d))/;
	this.finalAccessDate = /(\d\d.\d\d.(\d\d\d\d|\d\d))/;
}

function getAuthors (regexps) {
	
	var matches = Line.match(regexps.initialAuthorsExtractReg);

	if (matches == null) {
		return null;
	}

	for (var i = 0; i < matches.length; i++) {
		var items = matches[i].match(regexps.singleAuthorExtractReg);
		matches[i] = items[0];
	}

	return matches;
}

function getTitle (regexps) {
	var matches = Line.match(regexps.initialTitleExtractReg);
	matches = matches[0].match(regexps.finalTitleExtractReg);//matches[0].slice(4, matches[0].length - 2);
    return matches[0];
}

function getSequenceNumber (regexps) {
	 var matches = Line.match(regexps.sequenceNumberReg);
	 if (matches == null) { return null; }
	 
	 matches = matches[0].match(regexps.numberReg);

	 return matches[0];
}

function getPlace (str, regexps) {

	var matches = str.match(regexps.finalCityReg);

    if (matches == null) { return null; }

	return matches[0];
}

function getYear (str, regexps) {

	var matches = str.match(regexps.yearReg);

    if (matches == null) { return null; }

	return matches[0];
}

function getPublisherName (str, regexps) {

	var matches = str.match(regexps.finalPublisherNameReg);

	if (matches == null) { return null; }

	return matches[0];
}

function getPublisher (regexps) {
	var publisher = {};

	var initNameLine = Line.match(regexps.initialPublisherNameReg);

	if (initNameLine != null) {
		publisher['name'] = getPublisherName(initNameLine[0], regexps);
	}

    var initYearLine = Line.match(regexps.initialPublishingYearReg);

    if (initYearLine  != null) {
    	publisher['year'] = getYear(initYearLine[0], regexps);
    }

    var initPlaceLine = Line.match(regexps.initialCityReg);

        if (initPlaceLine  != null) {
        	publisher['place'] = getPlace(initPlaceLine[0], regexps);
        }
    
    if (jQuery.isEmptyObject(publisher)) { return null; }

    return publisher;
}

function getPeriodicalTitle (str, regexps) {

	var matches = str.match(regexps.finalPeriodicalTitle);

	if (matches == null) { return null; }

	return matches[0];
}

function getPeriodical (regexps) {
	var periodical = {};

	var initTitleLine = Line.match(regexps.initialPeriodicalTitle);

	if (initTitleLine != null) {
		periodical['title'] = getPeriodicalTitle(initTitleLine[0], regexps);
	}

    var initYearLine = Line.match(regexps.initialPeriodicalYear);

    if (initYearLine  != null) {
    	periodical['year'] = getYear(initYearLine[0], regexps);
    }

    var initNumberLine = Line.match(regexps.initialPeriodicalNumber);

        if (initNumberLine  != null) {
        	matches = initNumberLine[0].match(regexps.numberReg)
        	if (matches != null) {
        		periodical['number'] = matches[0]
        }
    }
    
    if (jQuery.isEmptyObject(periodical)) { return null; }

    return periodical;
}

function getPageination (regexps) {

	var matches = Line.match(regexps.pageinationExtractReg);

	if (matches == null) { return null; }
	matches = matches[0].match(regexps.numberReg);

	if (matches.length == 2) {
		var pageination = {};
		pageination["Beginning"] = matches[0];
		pageination["End"] = matches[1];

		return pageination;
	}

	return matches[0];
}

function getDocType (regexps) {

	var matches = Line.match(regexps.initialDocTypeReg);

	if (matches == null) { return null; }
	matches = matches[0].match(regexps.finalDocTypeReg);

	return matches[0];
}

function getVolumesNumber (regexps) {

	var matches = Line.match(regexps.initialVolumesNumberReg);

	if (matches == null) { return null; }
	matches = matches[0].match(regexps.numberReg);

	return matches[0];
}

function getVolumeNumber (regexps) {

	var matches = Line.match(regexps.initialVolumeNumberReg);

	if (matches == null) { return null; }
	matches = matches[0].match(regexps.numberReg);

	return matches[0];
}

function getVoluminosity (regexps) {
	var volumesNumber = getVolumesNumber(regexps);
	var currentVolume = getVolumeNumber (regexps);
	var voluminosity = {};

	if (volumesNumber != null) {
		voluminosity["Number"] = volumesNumber;
	}

	if (currentVolume != null) {
		voluminosity["Current"] = currentVolume;
	}

	if(!jQuery.isEmptyObject(voluminosity)) { return voluminosity; }
}

function getMaterialInfo (regexps) {

	var matches = Line.match(regexps.initialTitleExtractReg);
    if (matches == null) { return null; }

    matches = matches[0].match(regexps.initialMaterialInfo);
    if (matches == null) { return null; }


	matches = matches[0].match(regexps.finalMaterialInfo);
	if (matches == null) { return null; }

	return matches[0];    
}

function getUrl (regexps) {

     var matches = Line.match(regexps.initialUrl);
     if (matches == null) { return null; }

     matches = matches[0].match(regexps.finalUrl);
     if (matches == null) { return null; }

     return matches[0];
}

function getAccessDate (regexps) {
	var matches = Line.match(regexps.initialAccessDate);
	if (matches == null) { return null; }

	matches = matches[0].match(regexps.finalAccessDate);
	if (matches == null) { return null; }

	return matches[0];

}

function bibLineParse(str) {
	Line = str;

	var BibleographicLine = {};
	var regExps = new Regexps();

	var seqNumber = getSequenceNumber(regExps);
	if (seqNumber != null) {
		BibleographicLine["SequenceNumber"] = seqNumber;
	}

	var authors = getAuthors(regExps);
	if (authors != null) {
		BibleographicLine["Authors"] = authors;
	}

	var publisher = getPublisher(regExps);
	if (publisher != null) {
		BibleographicLine["Publisher"] = publisher;
	}

	var title = getTitle(regExps);
	if (title != null) {
		BibleographicLine["Title"] = title;
	}

	var pageination = getPageination(regExps);
	if (pageination != null) {
		BibleographicLine["Pageination"] = pageination;
	}

	var docType = getDocType(regExps);
	if (docType != null) {
		BibleographicLine["DocType"] = docType;
	}

	var voluminosity = getVoluminosity(regExps);
	if (voluminosity != null) {
		BibleographicLine["Voluminosity"] = voluminosity;
	}

	var periodical = getPeriodical(regExps);
	if (periodical != null) {
		BibleographicLine["Periodical"] = periodical;
	}

	var material = getMaterialInfo(regExps);
	if (material != null) {
		BibleographicLine["Material"] = material;
	}

	var url = getUrl(regExps);
	if (url != null) {
		BibleographicLine["Url"] = url;
	}

	var accessDate = getAccessDate(regExps);
	if (accessDate != null) {
		BibleographicLine["AccessDate"] = accessDate;
		BibleographicLine["Material"] = "Электронный ресурс";
	}

	translateToScs(BibleographicLine);

	return JSON.stringify(BibleographicLine);
}


