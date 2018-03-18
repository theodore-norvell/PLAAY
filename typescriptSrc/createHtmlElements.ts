/// <reference path="jquery.d.ts" />

/// <reference path="collections.ts" />

import collections = require('./collections');

/** Create the top level HTML and buttons.
 */
module createHtmlElements {

	import list = collections.list;

	export function createHtmls() : void {

		//  Overall structure
		//      body
		//          upperArea
		//              bannerArea
		//          contentArea
		
		const body = $("body");

		create("div", "", "upperArea", body);
		const upperArea = $("#upperArea");
		createTexted("div", "", "bannerArea", upperArea, "PLAAY - The Programming Language for Adults and Youngsters");

		create("div", "", "contentArea", body);
		const contentArea = $("#contentArea");

		createEditorHTML( contentArea ) ;
		createAnimatorHTML( contentArea ) ;

		//create("datalist", null, "oplist", contentArea);
		// const optionList = ["+", "-", "*", "/", ">", "<", "==", ">=", "<=", "&", "|"];
		// for (let i = 0; i < optionList.length; i++) {
		// 	createValued("option", $("#oplist"), optionList[i]);
		// }
	}

	function createEditorHTML( contentArea : JQuery ) : void {
				// Editor structure
		//    contentArea
		//        editor
		//            editorLeftSideArea
		//                pallette
		//                    pallette items
		//                buttonArea
		//                    buttons for editing
		//            container
		const editorDiv = create("div", "", "editor", contentArea ) ;
		create("div", "leftSideArea", "editorLeftSideArea", editorDiv);
		const editorLeftSideArea = $("#editorLeftSideArea");
		create("div", "palette", "palette", editorLeftSideArea);
		const palette = $("#palette");
		create("div", "buttonArea", "editorButtonArea", editorLeftSideArea);
		const buttonArea = $("#editorButtonArea");

		//createTexted("div", "stack evalVisible", "stackbar", leftSideArea, null);
		//create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "leftSideButton editButton", "play", buttonArea, "Play");
		createTexted("div", "leftSideButton editButton", "turtle", buttonArea, "Turtle World");
		createTexted("div", "leftSideButton editButton", "undo", buttonArea, "Undo");
		createTexted("div", "leftSideButton editButton", "redo", buttonArea, "Redo");
		createTexted("div", "leftSideButton editButton", "trash", buttonArea, "Trash");

		//createTexted("div", "quitworld", "quitworld", leftSideArea, "Quit World");

		createTexted("div", "leftSideButton paletteItem", "if", palette, "?");
		createTexted("div", "leftSideButton paletteItem", "while", palette, "\u27F3");
		createTexted("div", "leftSideButton paletteItem", "vardecl", palette, "\u03B4");
		createTexted("div", "leftSideButton paletteItem", "assign", palette, ":=");
		createTexted("div", "leftSideButton paletteItem", "var", palette, "x");
		createTexted("div", "leftSideButton paletteItem", "worldcall", palette, "+");
		createTexted("div", "leftSideButton paletteItem", "call", palette, "call");
		createTexted("div", "leftSideButton paletteItem", "stringliteral", palette, '""');
		createTexted("div", "leftSideButton paletteItem", "nullliteral", palette, "\u23da");
		createTexted("div", "leftSideButton paletteItem", "lambda", palette, "\u03BB");
		createTexted("div", "leftSideButton paletteItem", "objectliteral", palette, "$");
		createTexted("div", "leftSideButton paletteItem", "accessor", palette, "[ ]");

		// The container for the tree.
		create("div", "container", "container", editorDiv);
	}

	function createAnimatorHTML( contentArea : JQuery ) : void {

		//Executing-related elements. All added functionalities are in executing module.
		//  contentArea
		//     animator
		//          animatorLeftSideArea
		//              evalButtonArea
		//                  buttons
		//          vms
		//          outputcanvas
		const animatorDiv = create("div", "", "animator", contentArea ) ;
		create("div", "leftSideArea", "animatorLeftSideArea", animatorDiv);
		const animatorLeftSideArea = $("#animatorLeftSideArea");
		create("div", "buttonArea", "evalButtonArea", animatorLeftSideArea);
		const evalButtonArea = $("#evalButtonArea");
		createTexted("div", "leftSideButton", "edit", evalButtonArea, "Edit");
		createTexted("div", "leftSideButton", "advance", evalButtonArea, "Next");
		createTexted("div", "leftSideButton", "evalUndo", evalButtonArea, "Undo");
		createTexted("div", "leftSideButton", "evalRedo", evalButtonArea, "Redo");
		createTexted("div", "leftSideButton", "run", evalButtonArea, "Run");

		create("div", "vms", "vms", animatorDiv) ;

		hideAnimator() ;
	}

	export function hideAnimator() : void {
		hide( $("#animator") ) ;
	}

	export function showAnimator()  : void{
		show( $("#animator") ) ;
	}

	export function hideEditor() : void {
		hide( $("#editor") ) ;
	}

	export function showEditor()  : void{
		show( $("#editor") ) ;
	}

	function create( elementType: string,
	                 className: string | null,
	                 idName: string | null,
	                 parentElement: JQuery | null ) : JQuery {
		const obj = $("<" + elementType + "></" + elementType + ">");
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
		const obj = $("<" + elementType + "></" + elementType + ">");
		if (parentElement) { obj.appendTo(parentElement); }
		if (value) { obj.val(value); }
		return obj;
	}

	function createPrepended(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string, prependToThis: JQuery): JQuery {
		const obj = createTexted(elementType, className, idName, parentElement, textContent);
		if (prependToThis) { obj.prependTo(prependToThis); }
		return obj;
	}

	export function hide( element: JQuery ): JQuery {
		return element.css("visibility", "hidden");
	}

	export function show( element: JQuery ): JQuery {
		return element.css("visibility", "visible");
	}

}

export = createHtmlElements;
