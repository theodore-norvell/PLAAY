/// <reference path="jquery.d.ts" />

/// <reference path="collections.ts" />

import collections = require('./collections');

/** Create the top level HTML and buttons.
 */
module createHtmlElements {

	import list = collections.list;

	export function createHtmls() {

		const body = $("body");

		create("div", "", "upperArea", body);
		const upperArea = $("#upperArea");
		createTexted("div", "", "bannerArea", upperArea, "PLAAY - The Programming Language for Adults and Youngsters");

		create("div", "", "contentArea", body);
		const contentArea = $("#contentArea");
		create("div", "", "leftSideArea", contentArea);
		const leftSideArea = $("#leftSideArea");
		create("div", "", "buttonArea", leftSideArea);
		const buttonArea = $("#buttonArea");
		create("div", "evalHidden", "sidebar", leftSideArea);
		const sidebar = $("#sidebar");

		createHidden("div", "stack evalVisible", "stackbar", leftSideArea, null);
		create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "leftSideButton editButton evalHidden", "play", buttonArea, "Play");
		createTexted("div", "leftSideButton editButton", "turtle", buttonArea, "Turtle World");
		createTexted("div", "leftSideButton editButton evalHidden", "undo", buttonArea, "Undo");
		createTexted("div", "leftSideButton editButton evalHidden", "redo", buttonArea, "Redo");
		createTexted("div", "leftSideButton editButton evalHidden", "trash", buttonArea, "Trash");

		//Executing-related elements. All added functionalities are in executing module.

		createHidden("div", "advance evalVisible", "advance", leftSideArea, "Next");
		createHidden("div", "multistep evalVisible", "multistep", leftSideArea, "Multi-Step");
		createHidden("div", "run evalVisible", "run", leftSideArea, "Run");

		createHidden("div", "quitworld", "quitworld", leftSideArea, "Quit World");
		createHidden("div", "edit evalVisible", "edit", leftSideArea, "Edit");

		createTexted("div", "leftSideButton buildingBlockButton palette", "if", sidebar, "?");
		createTexted("div", "leftSideButton buildingBlockButton palette", "while", sidebar, "\u27F3");
		createTexted("div", "leftSideButton buildingBlockButton palette", "var", sidebar, "x");
		createTexted("div", "leftSideButton buildingBlockButton palette", "stringliteral", sidebar, '""');
		createTexted("div", "leftSideButton buildingBlockButton palette", "worldcall", sidebar, "+");
		createTexted("div", "leftSideButton buildingBlockButton palette", "assign", sidebar, ":=");

		//User-related elements. All added functionalities of the elements are in userRelated module.
		create("div", "userBar", "userBar", upperArea);
		const userBar = $("#userBar");
		createTexted("div", "", "login", userBar, "Login/Register");
		createTexted("div", "", "logout", userBar, "Logout").hide();
		createTexted("div", "", "userSettings", userBar, "User Settings").hide();
		createTexted("div", "", "saveProgram", userBar, "Save Program").hide();
		createTexted("div", "", "loadProgram", userBar, "Load Program").hide();

		createTexted("div", "leftSideButton buildingBlockButton palette", "vardecl", sidebar, "\u03B4");
		createTexted("div", "leftSideButton buildingBlockButton palette", "lambda", sidebar, "\u03BB");
		create("datalist", null, "oplist", contentArea);

		create("div", "container evalHidden", "container", contentArea);
		createHidden("div", "vms evalVisible", "vms", contentArea, null);

		var optionList = ["+", "-", "*", "/", ">", "<", "==", ">=", "<=", "&", "|"];
		for (var i = 0; i < optionList.length; i++) {
			createValued("option", $("#oplist"), optionList[i]);
		}
	}

	function create(elementType: string,
		className: string | null,
		idName: string | null,
		parentElement: JQuery | null): JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (className !== null) { obj.addClass(className); }
		if (idName !== null) { obj.attr("id", idName); }
		if (parentElement !== null) { obj.appendTo(parentElement); }
		return obj;
	}

	function createTexted( elementType: string,
	                       className: string|null,
						   idName: string|null,
						   parentElement: JQuery|null,
						   textContent: string|null): JQuery {
		const obj = create(elementType, className, idName, parentElement);
		if (textContent!==null) { obj.text(textContent); }
		return obj;
	}

	function createValued(elementType: string, parentElement: JQuery, value: string): JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (parentElement) { obj.appendTo(parentElement); }
		if (value) { obj.val(value); }
		return obj;
	}

	function createPrepended(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string, prependToThis: JQuery): JQuery {
		const obj = createTexted(elementType, className, idName, parentElement, textContent);
		if (prependToThis) { obj.prependTo(prependToThis); }
		return obj;
	}

	function createHidden( elementType: string,
	                       className: string|null,
	                       idName: string|null,
	                       parentElement: JQuery|null,
	                       textContent: string|null): JQuery {
		return createTexted(elementType, className, idName, parentElement, textContent).css("visibility", "hidden");
	}

}

export = createHtmlElements;
