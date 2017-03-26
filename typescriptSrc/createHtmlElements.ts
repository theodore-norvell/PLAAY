/// <reference path="collections.ts" />
/// <reference path="jquery.d.ts" />

import collections = require( './collections' );

module createHtmlElements 
{

    import list = collections.list;

	export function createHtmls () 
	{	
		const body = $("body");
		create("div", "sidebar evalHidden", "sidebar", body);
		const sidebar = $("#sidebar");
		
		createHidden("div", "stack evalVisible", "stackbar", body, null);
		create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "undo evalHidden", "undo", body, "Undo");
		createTexted("div", "redo evalHidden", "redo", body, "Redo");
		createTexted("div", "trash evalHidden", "trash", body, "Trash");

		//Executing-related elements. All added functionalities are in executing module.
		createTexted("div", "play evalHidden", "play", body, "Play");
		createHidden("div", "advance evalVisible", "advance", body, "Next");
		createHidden("div", "multistep evalVisible", "multistep", body, "Multi-Step");
		createHidden("div", "run evalVisible", "run", body, "Run");
		createTexted("div", "turtle", "turtle", body, "Turtle World");
		createHidden("div", "quitworld", "quitworld", body, "Quit World");
		createHidden("div", "edit evalVisible", "edit", body, "Edit");

		createTexted("div", "block V palette", "if", sidebar, "If"); 
		createTexted("div", "block V palette", "while", sidebar, "While"); 
		createTexted("div", "block V palette", "var", sidebar, "Var"); 
		createTexted("div", "block V palette", "stringliteral", sidebar, "String Literal"); 
		createTexted("div", "block V palette", "worldcall", sidebar, "Call World"); 
		createTexted("div", "block V palette", "assign", sidebar, "Assignment"); 

		//User-related elements. All added functionalities of the elements are in userRelated module.
		create("div", "userBar", "userBar", body); 
		const userBar = $("#userBar");
		createTexted("div", "userOptions", "login", userBar, "Login/Register"); 
		createTexted("div", "userOptions", "logout", userBar, "Logout").hide();
		createTexted("div", "userOptions", "userSettings", userBar, "User Settings").hide();
		createTexted("div", "userOptions", "saveProgram", userBar, "Save Program").hide();
		createTexted("div", "userOptions", "loadProgram", userBar, "Load Program").hide();

		createTexted("div", "block V palette", "vardecl", sidebar, "Var Declaration"); 
		createTexted("div", "block V palette", "lambda", sidebar, "Lambda Expression"); 
		create("datalist", null, "oplist", body); 

		create("div", "container evalHidden", "container", body); 
		createHidden("div", "vms evalVisible", "vms", body, null); 

		var optionList = ["+", "-", "*", "/", ">", "<", "==", ">=", "<=", "&", "|"];
		for (var i = 0; i < optionList.length; i++) {
			createValued("option", $("#oplist"), optionList[i]);
		}
	}

	function create(elementType: string, className: string, idName: string, parentElement: JQuery) : JQuery 
	{
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (className) { obj.addClass(className); }
		if (idName) { obj.attr("id", idName); }
		if (parentElement) { obj.appendTo(parentElement); }
		return obj;
	}
	
	function createTexted(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string) : JQuery 
	{
		var obj = create(elementType, className, idName, parentElement);
		if (textContent) { obj.text(textContent); }
		return obj;
	}

	function createValued(elementType: string, parentElement: JQuery, value: string) : JQuery 
	{
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (parentElement) { obj.appendTo(parentElement); }
		if (value) { obj.val(value); }
		return obj;
	}

	function createPrepended(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string, prependToThis: JQuery) : JQuery 
	{
		var obj = createTexted(elementType, className, idName, parentElement, textContent);
		if (prependToThis) { obj.prependTo(prependToThis); }
		return obj;
	}

	function createHidden(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string) : JQuery 
	{
		return createTexted(elementType, className, idName, parentElement, textContent).css("visibility", "hidden");
	}

}

export = createHtmlElements;
