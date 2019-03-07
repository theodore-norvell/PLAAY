/// <reference path="jquery.d.ts" />

/// <reference path="treeManager.ts" />
/// <reference path="treeView.ts" />

import treeManager = require('./treeManager');
import treeView = require('./treeView');

/** Create the top level HTML and buttons.
 */
module createHtmlElements {

	import TRUEMARK  = treeView.TRUEMARK ;
	import FALSEMARK = treeView.FALSEMARK ;
	import WHILEMARK = treeView.WHILEMARK ;
	import LAMBDAMARK = treeView.LAMBDAMARK ;
	import NULLMARK = treeView.NULLMARK ;

	import BOOLEANTYPE = treeView.BOOLEANTYPE;
	import STRINGTYPE = treeView.STRINGTYPE;
	import NUMBERTYPE = treeView.NUMBERTYPE;
	import INTEGERTYPE = treeView.INTEGERTYPE;
	import NATTYPE = treeView.NATTYPE;
	import TOPTYPE = treeView.TOPTYPE;
	import BOTTOMTYPE = treeView.BOTTOMTYPE;
	import FUNCTIONTYPE = treeView.FUNCTIONTYPE;
	import JOINTYPE = treeView.JOINTYPE;
	import MEETTYPE = treeView.MEETTYPE;

	import Actions = treeManager.Actions ;
	
	export function createHtmls() : void {

		//  Overall structure
		//      body
		//          upperArea
		//              bannerArea
		//          contentArea

		const body = $("body");

		// create("div", "", "upperArea", body);
		// const upperArea = $("#upperArea");
		// createUpperAreaHTML( upperArea )  ;

		create("div", "", "contentArea", body);
		const contentArea = $("#contentArea");

		createEditorHTML( contentArea ) ;
		createAnimatorHTML( contentArea ) ;

		createOutputArea( body ) ;
	}

	// function createUpperAreaHTML( upperArea : JQuery ) : void {
	// 	createTexted("div", "", "bannerArea", upperArea, "PLAAY - The Programming Language for Adults and Youngsters");
	// 	//User-related elements. All added functionalities of the elements are in userRelated module.
	// 	create("div", "userBar", "userBar", upperArea);
	// 	const userBar = $("#userBar");
	// 	createTexted("div", "", "login", userBar, "Login/Register");
	// 	createTexted("div", "", "logout", userBar, "Logout").hide();
	// 	createTexted("div", "", "userSettings", userBar, "User Settings").hide();
	// 	createTexted("div", "", "saveProgram", userBar, "Save Program").hide();
	// 	createTexted("div", "", "loadProgram", userBar, "Load Program").hide();
	// }

	function createEditorHTML( contentArea : JQuery ) : void {
				// Editor structure
		//    contentArea
		//        editor
		//            editorLeftSideArea
		//                palletteArea
		//                    pallette
		//                       items
		//                    typePallete
		//                       type items
		//                buttonArea
		//                    buttons for editing
		//            container
		const editorDiv = create("div", "tab", "editor", contentArea ) ;
		const editorLeftSideArea = create("div", "leftSideArea", "editorLeftSideArea", editorDiv);
		const paletteArea = create("div","paletteArea","paletteArea",editorLeftSideArea);
		const palette = create("div", "palette", "palette", paletteArea);
		const typePalette = create("div","palette","typePalette",paletteArea);
		const buttonArea = create("div", "paletteArea", "buttonArea", editorLeftSideArea);
		const leftButtonsPalette = create("div", "palette", "leftButtonsPalette", buttonArea);
		const rightButtonsPalette = create("div", "palette", "rightButtonsPalette", buttonArea);

		//createTexted("div", "stack evalVisible", "stackbar", leftSideArea, null);
		//create("table", null, "stackVal", $("#stackbar"));
		createButton( "leftSideButton", "play", leftButtonsPalette, "play-48x24.png", "Play", null);
		createButton("leftSideButton", "undo", leftButtonsPalette, "undo-48x24.png", "Undo", null);
		createButton("leftSideButton", "redo", leftButtonsPalette, "redo-48x24.png", "Redo", null);
		createButton("leftSideButton", "clipboard", leftButtonsPalette, "clipboard-48x24.png", "Clipboard", null);
		createTexted("div", "leftSideButton", "toggleOutput", leftButtonsPalette, "Output", null);
		
		createButton("leftSideButton", "cut", rightButtonsPalette, "cut-48x24.png", "Cut", null);
		createButton("leftSideButton", "copy", rightButtonsPalette, "copy-48x24.png", "Copy", null);
		createButton("leftSideButton", "paste", rightButtonsPalette, "paste-48x24.png", "Paste", null);
		createButton("leftSideButton", "move", rightButtonsPalette, "move-48x24.png", "Move", null);
		createButton("leftSideButton", "swap", rightButtonsPalette, "swap-48x24.png", "Swap",  null);
		
		//createTexted("div", "quitworld", "quitworld", leftSideArea, "Quit World");

		createTexted("div", "leftSideButton paletteItem", "callvar", palette, "+ - ...", Actions.CALL_VAR);
		createTexted("div", "leftSideButton paletteItem", "call", palette, "call", Actions.CALL);
		createTexted("div", "leftSideButton paletteItem dataItem", "stringliteral", palette, '""', Actions.STRING);
		createTexted("div", "leftSideButton paletteItem dataItem", "numberliteral", palette, '123', Actions.NUMBER);
		createTexted("div", "leftSideButton paletteItem dataItem", "nullliteral", palette, NULLMARK, Actions.NULL );
		createTexted("div", "leftSideButton paletteItem dataItem", "lambda", palette, LAMBDAMARK, Actions.LAMBDA);
		createTexted("div", "leftSideButton paletteItem dataItem", "objectliteral", palette, "$", Actions.OBJECT);
		createTexted("div", "leftSideButton paletteItem dataItem", "arrayliteral", palette, "array", Actions.ARRAY);
		createTexted("div", "leftSideButton paletteItem dataItem", "tuple", palette, "( )", Actions.TUPLE);
		createTexted("div", "leftSideButton paletteItem greenText", "trueliteral", palette, TRUEMARK, Actions.TRUE);
		createTexted("div", "leftSideButton paletteItem redText", "falseliteral", palette, FALSEMARK, Actions.FALSE);
		createTexted("div", "leftSideButton paletteItem varItem", "condecl", palette, ": :=", Actions.VAR_DECL );
		createTexted("div", "leftSideButton paletteItem varItem", "var", palette, "x", Actions.VAR);
		createTexted("div", "leftSideButton paletteItem varItem", "loc", palette, "loc", Actions.LOC);
		createTexted("div", "leftSideButton paletteItem varItem", "assign", palette, ":=", Actions.ASSIGN);
		createTexted("div", "leftSideButton paletteItem", "accessor", palette, "[ ]", Actions.INDEX);
		createTexted("div", "leftSideButton paletteItem", "dot", palette, ".", Actions.DOT);
		createTexted("div", "leftSideButton paletteItem", "if", palette, "?", Actions.IF );
		createTexted("div", "leftSideButton paletteItem", "while", palette, WHILEMARK, Actions.WHILE );
				
		// type palette items
		createTexted("div","leftSideButton paletteItem typeItem","booleanType",typePalette,BOOLEANTYPE, Actions.BOOLEAN_TYPE );
		createTexted("div","leftSideButton paletteItem typeItem","stringType",typePalette,STRINGTYPE, Actions.STRING_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","numberType",typePalette,NUMBERTYPE, Actions.NUMBER_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","integerType",typePalette,INTEGERTYPE, Actions.INTEGER_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","natType",typePalette,NATTYPE, Actions.NAT_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","nullType",typePalette,NULLMARK, Actions.NULL_TYPE) ;
		createTexted("div","leftSideButton paletteItem typeItem","topType",typePalette,TOPTYPE, Actions.TOP_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","bottomType",typePalette,BOTTOMTYPE, Actions.BOTTOM_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","tupleType",typePalette,"( )", Actions.TUPLE_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","locationType",typePalette,"loc", Actions.LOCATION_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","fieldType",typePalette,":", Actions.FIELD_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","functionType",typePalette,FUNCTIONTYPE, Actions.FUNCTION_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","joinType",typePalette,JOINTYPE, Actions.JOIN_TYPE);
		createTexted("div","leftSideButton paletteItem typeItem","meetType",typePalette,MEETTYPE, Actions.MEET_TYPE);


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
		const evalButtonsPalette = create("div", "palette", "evalButtonsPalette", evalButtonArea);
		
		createButton("leftSideButton", "run", evalButtonsPalette, "run-48x24.png", "Run", null );
		createButton("leftSideButton", "advance", evalButtonsPalette, "next-48x24.png", "Step", null );
		createButton("leftSideButton", "evalStepInto", evalButtonsPalette, "into-48x24.png", "Step Into", null ) ;
		createButton("leftSideButton", "evalStepOver", evalButtonsPalette, "over-48x24.png", "Step Over", null );
		createButton("leftSideButton", "evalStepToReturn", evalButtonsPalette, "out-48x24.png", "Step Out", null );
		createButton("leftSideButton", "evalUndo", evalButtonsPalette, "undo-48x24.png", "Undo", null );
		createButton("leftSideButton", "evalRedo", evalButtonsPalette, "redo-48x24.png", "Redo", null );
		createTexted("div", "leftSideButton", "evalToggleOutput", evalButtonsPalette, "Output", null );
		createButton( "leftSideButton", "restart", evalButtonsPalette, "play-48x24.png", "Restart Animator", null);
		createButton( "leftSideButton", "edit", evalButtonsPalette, "edit-48x24.png", "Edit", null);

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

	function createButton( className: string|null,
                           idName: string|null,
                           parentElement: JQuery|null,
                           source : string,
                           altText: string,
                           action : Actions|null): JQuery {
		const obj = create("img", className, idName, parentElement);
		obj.attr( "src", source ) ;
		obj.attr( "alt", altText);
		obj.attr( "title", altText ) ;
		if ( action !== null) { obj.data("action", action) ; }
		return obj;
	}

	function createTexted( elementType: string,
	                       className: string|null,
	                       idName: string|null,
	                       parentElement: JQuery|null,
	                       textContent: string|null,
	                       action : Actions|null): JQuery {
		const obj = create(elementType, className, idName, parentElement);
		if (textContent!==null) { obj.text(textContent); }
		if ( action !== null) { obj.data("action", action) ; }
		return obj;
	}

	function createValued(elementType: string, parentElement: JQuery, value: string): JQuery {
		const obj = $("<" + elementType + "></" + elementType + ">");
		if (parentElement) { obj.appendTo(parentElement); }
		if (value) { obj.val(value); }
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
