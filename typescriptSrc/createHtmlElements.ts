/// <reference path="collections.ts" />
/// <reference path="jquery.d.ts" />

import collections = require( './collections' );

module createHtmlElements 
{

    import list = collections.list;

	export function createHtmls () 
	{	
		const body = $("body");
		create("div", "", "contentArea", body);
		const contentArea = $("#contentArea");
		create("div", "", "leftSideArea", contentArea);
		const leftSideArea = $("#leftSideArea");
		create("div", "", "buttonArea", leftSideArea);
		const buttonArea = $("#buttonArea");
		create("div", "sidebar evalHidden", "sidebar", leftSideArea);
		const sidebar = $("#sidebar");
		
		createHidden("div", "stack evalVisible", "stackbar", leftSideArea, null);
		create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "leftSideButton editButton play evalHidden", "play", buttonArea, "Play");
		createTexted("div", "leftSideButton editButton turtle", "turtle", buttonArea, "Turtle World");
		createTexted("div", "leftSideButton editButton undo evalHidden", "undo", buttonArea, "Undo");
		createTexted("div", "leftSideButton editButton redo evalHidden", "redo", buttonArea, "Redo");
		createTexted("div", "leftSideButton editButton trash evalHidden", "trash", buttonArea, "Trash");

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
		create("div", "userBar", "userBar", body); 
		const userBar = $("#userBar");
		createTexted("div", "userOptions", "login", userBar, "Login/Register"); 
		createTexted("div", "userOptions", "logout", userBar, "Logout").hide();
		createTexted("div", "userOptions", "userSettings", userBar, "User Settings").hide();
		createTexted("div", "userOptions", "saveProgram", userBar, "Save Program").hide();
		createTexted("div", "userOptions", "loadProgram", userBar, "Load Program").hide();

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
