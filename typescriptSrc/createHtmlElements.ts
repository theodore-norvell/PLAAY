/// <reference path="jquery.d.ts" />

/// <reference path="sharedMkHtml.ts" />

import sharedMkHtml = require('./sharedMkHtml');

/** Create the top level HTML and buttons.
 */
module createHtmlElements {

	import TRUEMARK  = sharedMkHtml.TRUEMARK ;
	import FALSEMARK = sharedMkHtml.FALSEMARK ;
	import WHILEMARK = sharedMkHtml.WHILEMARK ;
	import LAMBDAMARK = sharedMkHtml.LAMBDAMARK ;
	import NULLMARK = sharedMkHtml.NULLMARK ;
	
	export function createHtmls() : void {

		//  Overall structure
		//      body
		//          upperArea
		//              bannerArea
		//          contentArea

		const body = $("body");

		create("div", "", "upperArea", body);
		const upperArea = $("#upperArea");
		createUpperAreaHTML( upperArea )  ;

		create("div", "", "contentArea", body);
		const contentArea = $("#contentArea");

		createEditorHTML( contentArea ) ;
		createAnimatorHTML( contentArea ) ;

		createOutputArea( body ) ;
	}

	function createUpperAreaHTML( upperArea : JQuery ) : void {
		createTexted("div", "", "bannerArea", upperArea, "PLAAY - The Programming Language for Adults and Youngsters");
		//User-related elements. All added functionalities of the elements are in userRelated module.
		create("div", "userBar", "userBar", upperArea);
		const userBar = $("#userBar");
		createTexted("div", "", "login", userBar, "Login/Register");
		createTexted("div", "", "logout", userBar, "Logout").hide();
		createTexted("div", "", "userSettings", userBar, "User Settings").hide();
		createTexted("div", "", "saveProgram", userBar, "Save Program").hide();
		createTexted("div", "", "loadProgram", userBar, "Load Program").hide();
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
		const editorDiv = create("div", "tab", "editor", contentArea ) ;
		create("div", "leftSideArea", "editorLeftSideArea", editorDiv);
		const editorLeftSideArea = $("#editorLeftSideArea");
		create("div", "palette", "palette", editorLeftSideArea);
		const palette = $("#palette");
		create("div", "buttonArea", "editorButtonArea", editorLeftSideArea);
		const buttonArea = $("#editorButtonArea");

		//createTexted("div", "stack evalVisible", "stackbar", leftSideArea, null);
		//create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "leftSideButton editButton", "play", buttonArea, "Play");
		createTexted("div", "leftSideButton editButton", "undo", buttonArea, "Undo");
		createTexted("div", "leftSideButton editButton", "redo", buttonArea, "Redo");
		createTexted("div", "leftSideButton editButton", "trash", buttonArea, "Trash");
		createTexted("div", "leftSideButton", "toggleOutput", buttonArea, "Output");

		//createTexted("div", "quitworld", "quitworld", leftSideArea, "Quit World");

		createTexted("div", "leftSideButton paletteItem", "if", palette, "?");
		createTexted("div", "leftSideButton paletteItem", "while", palette, WHILEMARK);
		createTexted("div", "leftSideButton paletteItem", "condecl", palette, "con");
		createTexted("div", "leftSideButton paletteItem", "locdecl", palette, "loc");
		createTexted("div", "leftSideButton paletteItem", "assign", palette, ":=");
		createTexted("div", "leftSideButton paletteItem", "var", palette, "x");
		createTexted("div", "leftSideButton paletteItem", "worldcall", palette, "+ - ...");
		createTexted("div", "leftSideButton paletteItem", "call", palette, "call");
		createTexted("div", "leftSideButton paletteItem", "accessor", palette, "[ ]");
		createTexted("div", "leftSideButton paletteItem", "dot", palette, ".");
		createTexted("div", "leftSideButton paletteItem", "stringliteral", palette, '""');
		createTexted("div", "leftSideButton paletteItem", "numberliteral", palette, '123');
		createTexted("div", "leftSideButton paletteItem", "nullliteral", palette, NULLMARK);
		createTexted("div", "leftSideButton paletteItem", "lambda", palette, LAMBDAMARK);
		createTexted("div", "leftSideButton paletteItem", "objectliteral", palette, "$");
		createTexted("div", "leftSideButton paletteItem", "arrayliteral", palette, "array");
		createTexted("div", "leftSideButton paletteItem", "trueliteral", palette, TRUEMARK);
		createTexted("div", "leftSideButton paletteItem", "falseliteral", palette, FALSEMARK);

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
		const animatorDiv = create("div", "tab", "animator", contentArea ) ;
		create("div", "leftSideArea", "animatorLeftSideArea", animatorDiv);
		const animatorLeftSideArea = $("#animatorLeftSideArea");
		create("div", "buttonArea", "evalButtonArea", animatorLeftSideArea);
		const evalButtonArea = $("#evalButtonArea");
		createTexted("div", "leftSideButton", "edit", evalButtonArea, "Edit");
		createTexted("div", "leftSideButton", "advance", evalButtonArea, "Next");
		createTexted("div", "leftSideButton", "evalStepInto", evalButtonArea, "Into") ;
		createTexted("div", "leftSideButton", "evalStepOver", evalButtonArea, "Over");
		createTexted("div", "leftSideButton", "evalStepToReturn", evalButtonArea, "Return");
		createTexted("div", "leftSideButton", "run", evalButtonArea, "Run");
		createTexted("div", "leftSideButton", "evalUndo", evalButtonArea, "Undo");
		createTexted("div", "leftSideButton", "evalRedo", evalButtonArea, "Redo");
		createTexted("div", "leftSideButton", "evalToggleOutput", evalButtonArea, "Output");

		create("div", "vms", "vms", animatorDiv) ;

		hideAnimator() ;
	}

	function createOutputArea( body : JQuery ) : void {
		// body
		//     outputArea
		//          outputAreaCanvas
		const outputArea = create( "div", "outputArea", "outputArea", body ) ;
		create( "canvas", "outputAreaCanvas", "outputAreaCanvas", outputArea ) ;
		const canvas = $("#outputAreaCanvas")[0] as HTMLCanvasElement ;
		const clientWidth = canvas.clientWidth ;
		const clientHeight = canvas.clientHeight ;
		canvas.width = clientWidth ;
		canvas.height = clientHeight ;
		hideOutput() ;
	}

	export function hideAnimator() : void {
		hide( $("#animator") ) ;
	}

	export function showAnimator()  : void {
		show( $("#animator") ) ;
	}

	export function hideEditor() : void {
		hide( $("#editor") ) ;
	}

	export function showEditor()  : void{
		show( $("#editor") ) ;
	}

	export function hideOutput() : void {
		hide( $("#outputArea") ) ;
	}

	export function showOutput()  : void{
		show( $("#outputArea") ) ;
	}

	export function toggleOutput() : void {
		toggle( $("#outputArea") ) ;
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

	function hide( element: JQuery ): JQuery {
		return element.css("visibility", "hidden");
	}

	function show( element: JQuery ): JQuery {
		return element.css("visibility", "visible");
	}

	function toggle( element: JQuery ): JQuery {
		const val : String = element.css("visibility") ;
		if( val === "visible" ) {
			return element.css("visibility", "hidden"); }
		else {
			return element.css("visibility", "visible"); }
	}

}

export = createHtmlElements;
