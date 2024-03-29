//DMDR Report Generator was created by staff of the U.S. Securities and Exchange Commission.
//Data and content created by government employees within the scope of their employment
//are not subject to domestic copyright protection. 17 U.S.C. 105.

const NS = ''; /* null string */
const WS = ' '; /* one whitespace */
const ZWSP = '\u200B'; /* zero width space */
const NL = '\n';
const SEMI = ';'; /* one semicolon */
const AUTO = 'auto';
const TEXTSTYLE = 'textStyle';
const TABLEVALUE = 'tableValue';
const COMPRESS = false; /* For debugging, set false so as to inspect pdf output. */
const FILLCOLOR = '#CCE6FF'; /* blue */	
const FAILCOLOR = '#FFCCE6'; /* pink */
const GRAYCOLOR = '#CCCCCC'; /* gray */
var basename = null;

var xsdContent, xmlDoc, matrAspectsArr, detailData;
var hasTimeStamp = false;

/******* d m d r ******* based on b1 because it is kinda similar but without a top level split in three ****/

function createDailyMarketDataReportPDF() { /* d m d r */
	memoryStatInitialize();
	var docStyles = {
		header : { fontSize : 16, bold : true, alignment : 'center' },
		header3 : { fontSize : 10, bold : true, alignment : 'center', lineHeight: 1.2 },
		header4 : { fontSize : 8, bold : true, alignment : 'center', lineHeight: 1.2 },
		sectionHeader : { fontSize : 12, bold : true, alignment : 'left', lineHeight: 1.2 },
		subSectionHeader : { fontSize : 10, bold : true, alignment : 'left', lineHeight: 1.2 },
		textStyle : { fontSize : 8 },
		tableHeader : { fontSize : 7, bold : false, alignment : 'center', fillColor : FILLCOLOR },
		tableValue : { fontSize : 6, alignment : 'left' },
		tableNameValue : { fontSize : 7, alignment : 'left' },
		failHeader: { fontSize: 9, bold: true, alignment : 'center', fillColor : FAILCOLOR }
	}

	var body = getSbsData();
	var hasoutput = body.length > 0; /* not right */
	if (!hasoutput) {
		alert('No transactions in '+basename.name+', no output files.');
	}
	const outname = ((basename == null) ? 'DailyMarketData' : removeExtension(basename.name));
	const title = 'Daily Market Data Report';
	
	const docDefinition = {info: 
							{title: title, 
							 PageLayout: 'OneColumn'},
						 content: body, 
						 pageOrientation : 'landscape',
						 styles: docStyles};

	const pdf = pdfMake.createPdf(docDefinition);
	pdf.download(outname + '.pdf')
}

const dmdrFirstPage = [
	[ 'sbsef', 'left', 'SBSEF Name'],
	[ 'date', 'left', 'Market Data for Date'],
	[ 'generated', 'left', 'Generated']
];
const dmdrFirstPageElts = [];
for (i=0;i<dmdrFirstPage.length;i++) { dmdrFirstPageElts.push(dmdrFirstPage[i][0]); }
const dmdrFirstPageAlign = [];
for (i=0;i<dmdrFirstPage.length;i++) { dmdrFirstPageAlign.push(dmdrFirstPage[i][1]); }
const dmdrFirstPageHeaders = [];
for (i=0;i<dmdrFirstPage.length;i++) { dmdrFirstPageHeaders.push(dmdrFirstPage[i][2]); }

const dmdrLastPage = [
	[ 'mtdUsedToDtrmnNmnlPrc', 'left', 'Method used to determine nominal prices'],
	[ 'mtdUsedToDtrmnSttlmPrc', 'left', 'Method used to determine settlement prices'],
	[ 'dscrtnExpltn', 'left', 'Explanation that discretion may be employed'],
	[ 'dscrtnMnnrDesc', 'left', 'Description of the manner in which discretion may be employed']
];
const dmdrLastPageElts = [];
for (i=0;i<dmdrLastPage.length;i++) { dmdrLastPageElts.push(dmdrLastPage[i][0]); }
const dmdrLastPageAlign = [];
for (i=0;i<dmdrLastPage.length;i++) { dmdrLastPageAlign.push(dmdrLastPage[i][1]); }
const dmdrLastPageHeaders = [];
for (i=0;i<dmdrLastPage.length;i++) { dmdrLastPageHeaders.push(dmdrLastPage[i][2]); }

const dmdrTable = [ /* xml name, alignment, width, pretty name.  ORDER is significant.  570.  */
/* pretty name has newlines because package does not support vertical-alignment. */
 [ 'sbsNm', 'left', 72, NL.repeat(6) + 'Name'],
 [ 'upi', 'left', 45, NL.repeat(6) + 'UPI'],
 [ 'tenor', 'left', 33, NL.repeat(6) + 'Tenor'],
 [ 'ccy', 'left', 20, NL.repeat(5) + 'Cur-' + NL + 'rency'],
 [ 'prcFrmt', 'left', 40, NL.repeat(5) + 'Price' + NL + 'Format'],
 [ 'tradCnt', 'right', 40, NL.repeat(5) + 'Trade' + NL + 'Count'],
 [ 'ttlNtnlAmtTraddUsd', 'right', 70, NL.repeat(5) + 'Total Notional Amount Traded (USD)'],
 [ 'ttlNtnlAmtBlckTradsUsd', 'right', 70, NL.repeat(4) + 'Total Notional Amount of Block Trades (USD)'],
 [ 'opngPrc', 'right', 25, NL.repeat(5) + 'Open Price'],
 [ 'clsgPrc', 'right', 25, NL.repeat(5) + 'Close Price'],
 [ 'sttlmPrc', 'right', 25, NL.repeat(4) + 'Settle-' + NL + 'ment Price'],
 [ 'lwstPrc', 'right', 25, NL.repeat(5) + 'Lowest Price'],
 [ 'lwstPrcTyp', 'center', 25, NL.repeat(4) + 'Low Price Type'],
 [ 'hgstPrc', 'right', 25, NL.repeat(5) + 'Highest Price'],
 [ 'hgstPrcTyp', 'center', 25, NL.repeat(4) + 'High Price Type'],
 [ 'dscrtnryAuthrtyApld', 'center', 25, NL.repeat(2) + 'Discre-' + NL + 'tionary Auth-' + NL + 'ority Applied'],
 [ 'dscrtnryAuthrtyApldFtnt', 'left', 25, NL.repeat(5) + 'Foot-' + NL + 'note']
];
const sbsCols = dmdrTable.length;
const sbsElts = [];
for (i=0;i<dmdrTable.length;i++) { sbsElts.push(dmdrTable[i][0]); }
const sbsAlign = [];
for (i=0;i<dmdrTable.length;i++) { sbsAlign.push(dmdrTable[i][1]); }
const sbsWidths = [];
for (i=0;i<dmdrTable.length;i++) { sbsWidths.push(dmdrTable[i][2]); }
const sbsHeaders = [];
for (i=0;i<dmdrTable.length;i++) { sbsHeaders.push(dmdrTable[i][3]); }

function getSbsData() { /* dmdr */
	preamble = [];
	preamble.push({text: "Daily Market Data Report", 
					style: 'header',
					tags: ['TITLE','/TITLE'] });	
	$.each(dmdrFirstPage, function(index, val) {
		var tag = val[0];
		var align = val[1];
		var label = val[2];
		var elts = xmlDoc.getElementsByTagName(tag);
		if (elts.length > 0) {
			var content = elts[0].textContent.trim();
			if (index == 0 || tag == 'sbsef') {
				preamble.push({
					text: content, style: 'header', tags: ['H','/H']});
			} else if (dmdrFirstPageElts.indexOf(elts[0].localName) >= 0) {
			preamble.push({
					text: label, style: 'sectionHeader', tags: ['H2','/H2']});
			var content = elts[0].textContent.trim();
			preamble.push({
					text: content, style: 'textStyle', tags: ['P', '/P']});
			}
		}})
	
	const lastCol = sbsCols - 1;
    var body = [];
	var row = [];
	const sbsRows = xmlDoc.getElementsByTagName('sbsTnr');
	const lastRow = sbsRows.length - 1;

	$.each(sbsHeaders, function(i, val) {
		isFirstCol = (i == 0);
		isLastCol = (i == lastCol);
		row.push({
			text: val,
			tags: []
                .concat(isFirstCol ? ['Table','TR'] : [])
                .concat(['TH','/TH'])
                .concat(isLastCol ? ['/TR'] : [] ),
			style: 'tableHeader', unbreakable:true
		});
	});
	body.push(row);

	$.each(sbsRows, function (j, sbsRow) {
		row = [];
        isFirstRow = (j == 0);
		isLastRow = (j == lastRow);
		$.each(sbsElts, function(i, local_name) {
			isFirstCol = (i == 0);
			isLastCol = (i == lastCol);
			content = WS; /* really empty cells aren't handled by the tagging code */
			/* columns might be empty so first see if there is a value in the XML */
			nodes = sbsRow.getElementsByTagName(local_name);
			if (nodes.length > 0) {
				child = nodes[0]
				content = child.textContent.trim(); 
				if (sbsAlign[i] == 'right') {
					content = addCommas(content);
				}
			}
			row.push({ 
				text: content,
				tags: []
					.concat(isFirstCol ? ['TR'] : [])
					.concat(['TD','/TD'])
					.concat(isLastCol ? ['/TR'] : [] )
					.concat(isLastCol && isLastRow ? ['/Table'] : [] ),
				style: 'tableValue', 
				unbreakable:true, 
				alignment: sbsAlign[i]
			});
		});
		body.push(row);
	});
    
	postamble = [];
	$.each(dmdrLastPage, function(index, val) {
		var tag = val[0];
		var align = val[1];
		var label = val[2];
		var elts = xmlDoc.getElementsByTagName(tag);
		if (elts.length > 0) {
			var content = elts[0].textContent.trim();
			if (dmdrLastPageElts.indexOf(elts[0].localName) >= 0) {
			postamble.push({
					text: label, style: 'sectionHeader', tags: ['H2','/H2']});
			var content = elts[0].textContent.trim();
			postamble.push({
					text: content, style: 'textStyle', tags: ['P', '/P']});
			}
		}})
	
	return [preamble, NL,
			{table: { body : body,
						headerRows : 1, 
						dontBreakRows: true,
						widths : sbsWidths
					}
				},
			NL, postamble]
}

/**** *****/


/****** utilities ******/

function formatDate(timestamp) {
	var date = new Date(timestamp);
	return date.toString();
}

function removeExtension(filename){
	var lastDotPosition = filename.lastIndexOf('.');
	if (lastDotPosition === -1) return filename;
	else return filename.substr(0, lastDotPosition);
}

function loadXML() {
	var oFiles = document.getElementById('xmlFile').files;
	var isValid;
	try {
		var reader = new FileReader();
		basename = oFiles[0];
		reader.readAsText(oFiles[0]);
	} catch (err) {
		alert(err);
	}
	reader.onloadend = function() {
		try {
			if (xsdContent != null) {
				isValid = validateXMLContent(reader.result, oFiles[0].name);
			}
			if (isValid) {
				if (window.DOMParser) {
					var parser = new DOMParser();
					xmlDoc = $.parseXML(reader.result);
				} else if (window.ActiveXObject) {
					xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
					xmlDoc.async = false;
					xmlDoc.loadXML(reader.result);
				}
				if (xmlDoc.getElementsByTagName('timestamp')[0] != null) {
					hasTimeStamp = true;
				}
				if (xmlDoc.getElementsByTagName('notHeldOrderHandlingCustomerReport')[0] != null) {
					/* b3 */
					createNotHeldOrderHandlingCustomerReportPDF({});
				} else if (xmlDoc.getElementsByTagName('heldOrderRoutingPublicReport')[0] != null) {
					// a1
					createHeldOrderRoutingPublicReportPDF();
				} else if (xmlDoc.getElementsByTagName('heldExemptNotHeldOrderRoutingCustomerReport')[0] != null) {
					// b1
					createHeldExemptNotHeldOrderRoutingCustomerReport();
				} else if (xmlDoc.getElementsByTagName('dailyMarketDataReport')[0] != null) {
					// d m d r
					createDailyMarketDataReportPDF();
				} else {
					alert('NO MATCH');
				}
			}
			document.getElementById('rule606Form').reset();
		} catch (err) {
			alert(err);
		}
	}
}

function validateXMLContent(xmlContent, xmlFileName) {
	var isValid = true;
	var Module = {
		xml : xmlContent,
		schema : xsdContent,
		arguments : [ '--noout', '--schema', 'oh-20160630.xsd', xmlFileName ]
	};
	var validationMessage = validateXML(Module);
	if (validationMessage.indexOf('fails') >= 0) {
		isValid = false;
		alert(validationMessage);
	}
	return isValid;
}

function loadXSD() {
	var oFiles = document.getElementById('xsdFile').files;
	try {
		var reader = new FileReader();
		reader.readAsText(oFiles[0]);
		reader.onloadend = function() {xsdContent = reader.result;};
	} catch (err) {
		alert(err);
	}
}

function addCommas(number) {
	var x = number.split('.');
	var y = x[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
	if (x[1] != null) {
		y = y + '.' + x[1];
	}
	return y;
}

/**** memory metering ****/

var memoryMessages = [{used:0}];

function memoryStatInitialize() {
	memoryMessages = [{used:0}];
}

function memoryStat(msg,popup) {
	if (window.performance == undefined || window.performance.memory == undefined) return;
	var memory = window.performance.memory;
	var used = Math.round(memory.usedJSHeapSize/(1024*1024));
	var total = Math.round(memory.totalJSHeapSize/(1024*1024));
	var previous = memoryMessages[memoryMessages.length-1]
	var change = used - previous.used;
	var record = {msg:msg,used:used,total:total,change:change};
	memoryMessages.push(record);
	if (popup) {
		alert(JSON.stringify(record));
	}
}
