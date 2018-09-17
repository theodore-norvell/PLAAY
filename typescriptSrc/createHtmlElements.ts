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
		//                    pallette items  type items
		//                buttonArea
		//                    buttons for editing
		//            container
		const editorDiv = create("div", "tab", "editor", contentArea ) ;
		create("div", "leftSideArea", "editorLeftSideArea", editorDiv);
		const editorLeftSideArea = $("#editorLeftSideArea");
		create("div","paletteArea","paletteArea",editorLeftSideArea);
		const paletteArea = $('#paletteArea');
		create("div", "palette", "palette", paletteArea);
		const palette = $("#palette");
		create("div","typePalette","typePalette",paletteArea);
		const typePalette = $('#typePalette');
		create("div", "buttonArea", "editorButtonArea", editorLeftSideArea);
		const buttonArea = $("#editorButtonArea");

		//createTexted("div", "stack evalVisible", "stackbar", leftSideArea, null);
		//create("table", null, "stackVal", $("#stackbar"));
		createTexted("div", "leftSideButton editButton", "play", buttonArea, "Play", null);
		createTexted("div", "leftSideButton editButton", "undo", buttonArea, "Undo", null);
		createTexted("div", "leftSideButton editButton", "redo", buttonArea, "Redo", null);
		createTexted("div", "leftSideButton editButton", "trash", buttonArea, "Trash", null);
		createTexted("div", "leftSideButton", "toggleOutput", buttonArea, "Output", null);

		//createTexted("div", "quitworld", "quitworld", leftSideArea, "Quit World");

		createTexted("div", "leftSideButton paletteItem", "if", palette, "?", Actions.IF );
		createTexted("div", "leftSideButton paletteItem", "while", palette, WHILEMARK, Actions.WHILE );
		createTexted("div", "leftSideButton paletteItem", "condecl", palette, ": :=", Actions.VAR_DECL );
		createTexted("div", "leftSideButton paletteItem", "loc", palette, "loc", Actions.LOC);
		createTexted("div", "leftSideButton paletteItem", "assign", palette, ":=", Actions.ASSIGN);
		createTexted("div", "leftSideButton paletteItem", "var", palette, "x", Actions.VAR);
		createTexted("div", "leftSideButton paletteItem", "callvar", palette, "+ - ...", Actions.CALL_VAR);
		createTexted("div", "leftSideButton paletteItem", "call", palette, "call", Actions.CALL);
		createTexted("div", "leftSideButton paletteItem", "accessor", palette, "[ ]", Actions.INDEX);
		createTexted("div", "leftSideButton paletteItem", "dot", palette, ".", Actions.DOT);
		createTexted("div", "leftSideButton paletteItem", "stringliteral", palette, '""', Actions.STRING);
		createTexted("div", "leftSideButton paletteItem", "numberliteral", palette, '123', Actions.NUMBER);
		createTexted("div", "leftSideButton paletteItem", "nullliteral", palette, NULLMARK, Actions.NULL );
		createTexted("div", "leftSideButton paletteItem", "lambda", palette, LAMBDAMARK, Actions.LAMBDA);
		createTexted("div", "leftSideButton paletteItem", "objectliteral", palette, "$", Actions.OBJECT);
		createTexted("div", "leftSideButton paletteItem", "arrayliteral", palette, "array", Actions.ARRAY);
		createTexted("div", "leftSideButton paletteItem", "tuple", palette, "( )", Actions.TUPLE);
		createTexted("div", "leftSideButton paletteItem", "trueliteral", palette, TRUEMARK, Actions.TRUE);
		createTexted("div", "leftSideButton paletteItem", "falseliteral", palette, FALSEMARK, Actions.FALSE);

		// type palette items
		createTexted("div","leftSideButton paletteItem","booleanType",typePalette,BOOLEANTYPE, Actions.BOOLEAN_TYPE );
		createTexted("div","leftSideButton paletteItem","stringType",typePalette,STRINGTYPE, Actions.STRING_TYPE);
		createTexted("div","leftSideButton paletteItem","numberType",typePalette,NUMBERTYPE, Actions.NUMBER_TYPE);
		createTexted("div","leftSideButton paletteItem","integerType",typePalette,INTEGERTYPE, Actions.INTEGER_TYPE);
		createTexted("div","leftSideButton paletteItem","natType",typePalette,NATTYPE, Actions.NAT_TYPE);
		createTexted("div","leftSideButton paletteItem","nullType",typePalette,NULLMARK, Actions.NULL_TYPE) ;
		createTexted("div","leftSideButton paletteItem","topType",typePalette,TOPTYPE, Actions.TOP_TYPE);
		createTexted("div","leftSideButton paletteItem","bottomType",typePalette,BOTTOMTYPE, Actions.BOTTOM_TYPE);
		createTexted("div","leftSideButton paletteItem","tupleType",typePalette,"( )", Actions.TUPLE_TYPE);
		createTexted("div","leftSideButton paletteItem","locationType",typePalette,"loc", Actions.LOCATION_TYPE);
		createTexted("div","leftSideButton paletteItem","fieldType",typePalette,":", Actions.FIELD_TYPE);
		createTexted("div","leftSideButton paletteItem","functionType",typePalette,FUNCTIONTYPE, Actions.FUNCTION_TYPE);
		createTexted("div","leftSideButton paletteItem","joinType",typePalette,JOINTYPE, Actions.JOIN_TYPE);
		createTexted("div","leftSideButton paletteItem","meetType",typePalette,MEETTYPE, Actions.MEET_TYPE);


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
		createTexted("div", "leftSideButton", "edit", evalButtonArea, "Edit", null);
		createTexted("div", "leftSideButton", "advance", evalButtonArea, "Next", null );
		createTexted("div", "leftSideButton", "evalStepInto", evalButtonArea, "Into", null ) ;
		createTexted("div", "leftSideButton", "evalStepOver", evalButtonArea, "Over", null );
		createTexted("div", "leftSideButton", "evalStepToReturn", evalButtonArea, "Return", null );
		createTexted("div", "leftSideButton", "run", evalButtonArea, "Run", null );
		createTexted("div", "leftSideButton", "evalUndo", evalButtonArea, "Undo", null );
		createTexted("div", "leftSideButton", "evalRedo", evalButtonArea, "Redo", null );
		createTexted("div", "leftSideButton", "evalToggleOutput", evalButtonArea, "Output", null );

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
