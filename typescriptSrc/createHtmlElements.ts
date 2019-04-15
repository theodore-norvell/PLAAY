/// <reference path="jquery.d.ts" />

/// <reference path="assert.ts" />
/// <reference path="htmlMaker.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="treeView.ts" />


import htmlMaker = require('./htmlMaker');
import treeManager = require('./treeManager');
import treeView = require('./treeView');
import assert = require('./assert');

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

	import makeHTML = htmlMaker.makeHTML ;

	export const helpFileName = "help-en.html" ;

	export abstract class Screen {
		/** Called once to create the content of the screen.
		 * Initially the screen should be hidden.
		*/
		abstract createScreen(contentArea : JQuery) : void ;

		/** Hide the screen.
		 * Typically this just sets the visibility of the html
		 * to invisible.
		*/
		abstract hideScreen() : void ;
		
		/** Show the screen.
		* Typically this just sets the visibility of the html
		* to visible and changes the keyboard map to 
		* that of the screen.
	 */
		abstract showScreen() : void ;
	}

	class EditorScreen extends Screen {
		createScreen(contentArea : JQuery) : void {
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
			//            helpPanel
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
			const helpPanel = create("div", "helpPanel", "editorHelpPanel", editorDiv ) ;
			const helpFrame = create("iframe", "helpFrame", "editorHelpFrame", helpPanel) ;
			helpFrame.attr( "src", helpFileName ) ;
		}

		hideScreen() : void {
			hide( $("#editor") ) ;
		}

		showScreen() : void {
			show( $("#editor") ) ;
		}
	}
	
	class AnimatorScreen extends Screen {
		createScreen(contentArea : JQuery) : void {
			//Executing-related elements. All added functionalities are in executing module.
			//  contentArea
			//     animator
			//          animatorLeftSideArea
			//              evalButtonArea
			//                  buttons
			//          vms
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

		}
		hideScreen() : void {
			hide( $("#animator") ) ;
		}
		showScreen() : void {	
			show( $("#animator") ) ;
		}
	}
	
	class LoginScreen extends Screen {
		createScreen(contentArea : JQuery) : void {
			makeHTML(
				{ tag: "div", id: "loginScreen", class: "tab",
				  children: [
					{ tag: "div", id: "registrationBox",
					  children : [
						{ tag: "div", id: "loginSection",
						  children: [
							  "Login ",
							  { tag: "br" },
							  { tag: "form", id: "loginUser",
								attr: {name: "loginUser", method:"post" , action: "/login" },
								children : [
								  "Email: ",
								  { tag: "input", id: "loginUsername", class: "login-textbox",
									attr: {type: "text", name: "email", required: "true" } },
								  { tag: "br" },
								  "Password: ",
								  { tag: "input", class: "login-textbox",
									attr: {type: "password", name: "password", required: "true" } },
								  { tag: "br" },
								  { tag: "input",
								    attr: {type: "submit", value: "Login"} }
								]
							  }
						  ]
						},
						{ tag: "div", id: "registrationSection",
						children: [
						  "Register ",
						  { tag: "br" },
						  { tag: "form", id: "registerNewUser",
							attr: {name: "registerNewUser", method:"post" , action: "/signup/" },
							children : [
							  "Email: ",
							  { tag: "input", class: "login-textbox",
								attr: {type: "text", name: "email", required: "true" } },
							  { tag: "br" },
							  "Password: ",
							  { tag: "input", class: "login-textbox",
								attr: {type: "password", name: "password", required: "true" } },
							  { tag: "br" },
							  "Confirm Password: ",
							  { tag: "input", class: "login-textbox",
								attr: {type: "password", name: "confirmPassword", required: "true" } },
							  { tag: "br" },
							  { tag: "input", class: "login-textbox",
								attr: {type: "submit", value: "Register"} }
							]
						  }
						]
						},
						{ tag: "div", class: "closewindow",
						  children: [
							"Close Window"
						  ]
						}
					  ]
				    } 
				  ]
				},
				contentArea
			) ;
		}

		hideScreen() : void {
			hide( $("#loginScreen") ) ;
		}
		showScreen() : void {	
			show( $("#loginScreen") ) ;
		}
	}

	

	const editorScreen : Screen = new EditorScreen() ;
	const animatorScreen : Screen = new AnimatorScreen() ;
	const loginScreen : Screen = new LoginScreen() ;
	let currentScreen : Screen = editorScreen ;


	export function createHtmls() : void {

		//  Overall structure
		//      body
		//          upperArea
		//              bannerArea
		//          contentArea

		const body = $("body");
		body.children().remove() ;
		createUpperArea( body )  ;

		create("div", "", "contentArea", body);
		const contentArea = $("#contentArea");

		editorScreen.createScreen( contentArea ) ;
		animatorScreen.createScreen( contentArea ) ;
		animatorScreen.hideScreen() ;
		loginScreen.createScreen( contentArea ) ;
		loginScreen.hideScreen() ;
		showEditor() ;

		createOutputArea( body ) ;
	}

	function createUpperArea( body : JQuery ) : void {
		
		const upperArea = create("div", "", "upperArea", body);
		const bannerArea = create( "div", null, "bannerArea", upperArea ) ;
		const logo = create("img", null, null, bannerArea ) ;
		logo.attr("src", "/logo-small.png") ;
		logo.attr("alt", "PLAAY") ;
		logo.attr("align", "middle" ) ;
		bannerArea.append( " -- The Programming Language for Adults and Youngsters") ;
		const userBar = create("div", "userBar", "userBar", upperArea ) ;
		const login = create( "div", "barButtons", "login", userBar ) ;
		login.text( "Login/Register" ) ;
		const load = create( "div", "barButtons", "loadProgram", userBar ) ;
		load.text( "Load" ) ;
		const clear = create( "div", "barButtons", "clearProgram", userBar ) ;
		clear.text( "Clear" ) ;
		const save = create( "div", "barButtons", "saveProgram", userBar ) ;
		save.text( "Save" ) ;
		const saveAs = create( "div", "barButtons", "saveAs", userBar ) ;
		saveAs.text( "Save As" ) ;
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

	export function showAnimator()  : void {
		currentScreen.hideScreen() ;
		animatorScreen.showScreen() ;
		currentScreen = animatorScreen ;
	}

	export function showEditor()  : void{
		currentScreen.hideScreen() ;
		editorScreen.showScreen() ;
		currentScreen = editorScreen ;
	}

	export function showLoginScreen()  : void{
		currentScreen.hideScreen() ;
		loginScreen.showScreen() ;
		currentScreen = loginScreen ;
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
