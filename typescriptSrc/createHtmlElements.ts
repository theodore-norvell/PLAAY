/// <reference path="collections.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="sharedMkHtml.ts" />

import collections = require( './collections' );
import sharedMkHtml = require('./sharedMkHtml');

module createHtmlElements {

    import list = collections.list;

	var currentSelection = sharedMkHtml.currentSelection;
	var undostack = sharedMkHtml.undostack;

	export function createHtmls () {
		
		const bodyConst = $("body");
		create("div", "sidebar evalHidden", "sidebar", bodyConst);
		const sidebarConst = $("#sidebar");
		
		createHidden("div", "stack evalVisible", "stackbar", bodyConst, null);
		create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "undo evalHidden", "undo", bodyConst, "Undo");
		createTexted("div", "redo evalHidden", "redo", bodyConst, "Redo");
		createTexted("div", "trash evalHidden", "trash", bodyConst, "Trash");

		//Executing-related elements. All added functionalities are in executing module.
		createTexted("div", "play evalHidden", "play", bodyConst, "Play");
		createHidden("div", "advance evalVisible", "advance", bodyConst, "Next");
		createHidden("div", "multistep evalVisible", "multistep", bodyConst, "Multi-Step");
		createHidden("div", "run evalVisible", "run", bodyConst, "Run");
		createTexted("div", "turtle", "turtle", bodyConst, "Turtle World");
		createHidden("div", "quitworld", "quitworld", bodyConst, "Quit World");
		createHidden("div", "edit evalVisible", "edit", bodyConst, "Edit");

		createTexted("div", "block V palette", "if", sidebarConst, "If"); 
		createTexted("div", "block V palette", "while", sidebarConst, "While"); 
		createTexted("div", "block V palette", "var", sidebarConst, "Var"); 
		createTexted("div", "block V palette", "stringliteral", sidebarConst, "String Literal"); 
		createTexted("div", "block V palette", "worldcall", sidebarConst, "Call World"); 
		createTexted("div", "block V palette", "assign", sidebarConst, "Assignment"); 

		//User-related elements. All added functionalities of the elements are in userRelated module.
		create("div", "userBar", "userBar", bodyConst); 
		const userBarConst = $("#userBar");
		createTexted("div", "userOptions", "login", userBarConst, "Login/Register"); 
		createTexted("div", "userOptions", "logout", userBarConst, "Logout").hide();
		createTexted("div", "userOptions", "userSettings", userBarConst, "User Settings").hide();
		createTexted("div", "userOptions", "saveProgram", userBarConst, "Save Program").hide();
		createTexted("div", "userOptions", "loadProgram", userBarConst, "Load Program").hide();

		createTexted("div", "block V palette", "vardecl", sidebarConst, "Var Declaration"); 
		createTexted("div", "block V palette", "lambda", sidebarConst, "Lambda Expression"); 
		create("datalist", null, "oplist", bodyConst); 

		create("div", "container evalHidden", "container", bodyConst); 
		createHidden("div", "vms evalVisible", "vms", bodyConst, null); 
		create("div", null, "seq", $("#container")).attr("data-childNumber", "-1");
		create("div", "dropZone H droppable", "dropZone", $("#seq")); 

		var optionList = ["+", "-", "*", "/", ">", "<", "==", ">=", "<=", "&", "|"];
		for (var i = 0; i < optionList.length; i++) {
			createValued("option", $("#oplist"), optionList[i]);
		}
	}

	function create(elementType: string, className: string, idName: string, parentElement: JQuery) : JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (className) { obj.addClass(className); }
		if (idName) { obj.attr("id", idName); }
		if (parentElement) { obj.appendTo(parentElement); }
		return obj;
	}
	
	function createTexted(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string) : JQuery {
		var obj = create(elementType, className, idName, parentElement);
		if (textContent) { obj.text(textContent); }
		return obj;
	}

	function createValued(elementType: string, parentElement: JQuery, value: string) : JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (parentElement) { obj.appendTo(parentElement); }
		if (value) { obj.val(value); }
		return obj;
	}

	function createPrepended(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string, prependToThis: JQuery) : JQuery {
		var obj = createTexted(elementType, className, idName, parentElement, textContent);
		if (prependToThis) { obj.prependTo(prependToThis); }
		return obj;
	}

	function createHidden(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string) : JQuery {
		return createTexted(elementType, className, idName, parentElement, textContent).css("visibility", "hidden");
	}

}

export = createHtmlElements;
