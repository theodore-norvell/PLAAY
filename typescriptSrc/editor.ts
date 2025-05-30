
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="createHtmlElements.ts" />
/// <reference path="labels.ts" />
/// <reference path="parsers.ts" />
/// <reference path="pnode.ts" />
/// <reference path="selection.ts" />
/// <reference path="treeView.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="treeView.ts" />


import assert = require('./assert') ;
import collections = require( './collections' );
import createHTMLElements = require('./createHtmlElements');
import labels = require( './labels');
import parsers = require( './parsers' ) ;
import pnode = require( './pnode');
import selection = require( './selection');
import treeManager = require( './treeManager');
import treeView = require('./treeView');

/** The UI of for editing program trees. */
module editor {

    import list = collections.list;
    import Option = collections.Option ;
    import some = collections.some ;
    import none = collections.none ;

    import helpFileName = createHTMLElements.helpFileName ;

    import Selection = selection.Selection;

    import Actions = treeManager.Actions ;


    type PSelection = Selection<pnode.PLabel, pnode.PNode> ;

    enum DragEnum { CURRENT_TREE, CLIPBOARD, PALLETTE, NONE }

    const redoStack : Array<PSelection> = [];
    const undoStack  : Array<PSelection> = [];
    const clipboardArray : Array<PSelection> = [];

    // Invariant: draggedObject===undefined if and only if dragKind===DragEnum.NONE 
    let draggedObject : string|undefined ; 
    let draggedSelection : PSelection ;
    let dragKind : DragEnum  = DragEnum.NONE ;

    let currentSelection = new  Selection(labels.mkExprSeq([]),list<number>(),0,0);

    const treeMgr = new treeManager.TreeManager(); // TODO Rename

    export function editingActions () : void {
        generateHTMLSoon();
        $("#undo").click( undo );
        $("#redo").click( redo ) ;
        $("#clipboard").click( toggleClipboard ) ;
        $("#toggleOutput").click( createHTMLElements.toggleOutput ) ;
        $("#cut").click( cut );
        $("#copy").click( copy );
        $("#paste").click( paste );
        $("#move").click( move );
        $("#swap").click( swap );
        

        makeClipboardDroppable( $("#clipboard") ) ;
        $( ".paletteItem" ).draggable( {
            helper:"clone",
            revert: true,
            revertDuration: 500,
            opacity: 0.5, 
            scroll: true,
            scrollSpeed: 10,
            cursorAt: {left:20, top:20},
            appendTo: "#container",
            start : function(event:Event, ui:JQueryUI.DraggableEventUIParams) : void {
                console.log( ">> Drag handler for things in pallette" ) ;
                ui.helper.animate({
                    width: 40,
                    height: 40
                });
                dragKind = DragEnum.PALLETTE ;
                /*tslint:disable:no-invalid-this*/
                draggedObject = $(this).attr("class");
                /*tslint:enable:no-invalid-this*/
                console.log( "<< Drag handler for things in pallette" ) ;
            } } ) ;

        // When a palette item is clicked, insert a node at the current selection.
        $( ".paletteItem" ).click(
            function(this : HTMLElement, evt : Event) : void {
                console.log( "click on " + $(this).attr("id") ) ;
                const action : Actions = $(this).data("action") as Actions ;
                createNodeOnCurrentSelection( action ) ; } ) ;

    }

    function create(elementType: string, className: string|null, idName: string|null, parentElement: JQuery|null) : JQuery {
		const obj = $("<" + elementType + "></" + elementType + ">");
		if (className !== null) { obj.addClass(className); }
		if (idName !== null) { obj.attr("id", idName); }
		if (parentElement !== null) { obj.appendTo(parentElement); }
		return obj;
	}

    function addToClipboard( sel : PSelection, position? = 0 ) : void {
        // Insert sel into the clipboardArray at the given position.
        clipboardArray.splice( position, 0, sel ) ;
        // The number of items in the clipboard is limited to 10.
        if( clipboardArray.length > 10 ) clipboardArray.length = 10 ;
        refreshTheClipboard() ;
    }

    function getFromClipboard( ) : Option< PSelection > {
        if( clipboardArray.length === 0 ) return none<PSelection>() ;
        else return some( clipboardArray[0] ) ;
    }

    function getFromDeepClipboard( depth : number ) : Option< PSelection > {
        if( clipboardArray.length <= depth ) return none<PSelection>() ;
        else return some( clipboardArray[depth] ) ;
    }


    function toggleClipboard() : void {
        let dialogDiv : JQuery = $('#clipboardDialog');
        if( dialogDiv.length === 0 ) {
            dialogDiv = $("<div id='clipboardDialog' style='overflow:visible'><div/>") ;
            dialogDiv.appendTo('body') ;
            dialogDiv.dialog({ dialogClass : 'no-close success-dialog', title: 'Clipboard' } );
            dialogDiv.dialog( 'close' ) ;
            return ; }
        
        if( dialogDiv.dialog( 'isOpen' )  ) {
            dialogDiv.dialog( 'close' ) ; 
        } else {
            dialogDiv.dialog( 'open' ) ; 
            refreshTheClipboard( ) ; 
            makeClipboardDroppable( dialogDiv ) ;
        }
	}

    function refreshTheClipboard() : void {
        const dialogDiv : JQuery = $('#clipboardDialog');
        if( dialogDiv.dialog( 'isOpen' )  ) {
            dialogDiv.empty() ;
            for(let i = 0; i < clipboardArray.length; i++)
            {
                const clipboardItemDiv = create("div", "clipboardItem", null, dialogDiv).attr("data-clipboardItem", i.toString()) ;
                const clipboardSelection = clipboardArray[i] ;
                const a : Array<pnode.PNode> =  clipboardSelection.selectedNodes()  ;
                for( let j=0 ; j < a.length; ++j ) {
                    clipboardItemDiv.append($(treeView.traverseAndBuild(a[j]))); }
            }
            installClipboardItemDragHandler() ;
        }
    }

    function installClipboardItemDragHandler() : void {
        $(".clipboardItem").draggable({
            helper:'clone',
            //appendTo:'body',
            revert: true ,
            revertDuration: 100,
            opacity: 0.5, 
            appendTo: '#container',
            containment: false,
            start: function(event : Event,ui : JQueryUI.DraggableEventUIParams) : void {
                console.log( ">> Drag handler for things in clipboard" ) ;
                dragKind = DragEnum.CLIPBOARD ;
                draggedObject = $(this).parent().attr("class");
                draggedSelection = clipboardArray[$(this).attr("data-clipboardItem")];
                console.log( "<< Drag handler for things in clipboard" ) ;
            }
        });
    }

    function makeClipboardDroppable( clipboard : JQuery ) : void {
        clipboard.droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event : Event,ui : JQueryUI.DroppableEventUIParam) : void {
                console.log(">> Dropping into clipboard" );
                if( dragKind !== DragEnum.CURRENT_TREE ) { return ; }
                console.log("   ui is " + ui.draggable.toString()  );
                const optSelectionToDelete : Option<PSelection>
                    = treeView.getPathToNode(currentSelection.root(), ui.draggable);
                console.log("   Dropping selection. " + optSelectionToDelete.toString() );
                optSelectionToDelete.bind( selectionToDelete =>
                    treeMgr.delete( selectionToDelete ).map( sel => {
                        //console.log("   Dropping into clipboard a" );
                        //console.log("   New selection is. " + sel.toString() );
                        addToClipboard( selectionToDelete ) ;
                        update( sel ) ;
                        //console.log("   Dropping into clipboard b" );
                        //console.log("   Dropping into clipboard c" );
                    } ) ) ;
                console.log("<< Dropping into clipboard" );
            }
        });
    }

    function showAlternativesDialog(selectionArray : Array< [string, string, PSelection] >)  : void
    {
        if( selectionArray.length < 1 ) return ;

        // Make an object representing all the buttons we need.
        // One button for each alternative except the first. The first
        // is the action already made.
        const buttonsObj : { [key:string] : () => void ; } = {} ;

        for( let i = 1 ; i < selectionArray.length ; ++i ) {
            buttonsObj[ selectionArray[i][1] ] = () => update( selectionArray[i][2] );
        }

        const dialogDiv : JQuery = $("<div></div>") ;
        dialogDiv.dialog({
                title: selectionArray[0][0],
                resizable: false,
                dialogClass: 'no-close success-dialog',
                modal: false,
                show: "slideDown",
                height: 25,
                width: 75,
                open: function (event : Event, ui : JQueryUI.DialogUIParams) : void {
                    const markup = selectionArray[0][0];
                    $(this).html(markup);
                    setTimeout( function () : void  {
                                    dialogDiv.dialog('destroy');
                                    dialogDiv.remove() ; },
                                5000);
                },
                buttons: buttonsObj 
            });
    }

    function generateHTML() : void
    {
        // Refresh the view of the current selection
        console.log( "Building HTML") ;
        const newHTML : JQuery = treeView.traverseAndBuild(currentSelection.root() ) ;
        console.log( "Done building HTML") ;
        $("#container").empty().append(newHTML);
        treeView.highlightSelection( currentSelection, newHTML ) ;
        const helpStr = treeView.findHelpString( currentSelection, newHTML ) ;
        const location = helpFileName + "#" + helpStr ;
        console.log( "Setting help to " + location ) ;
        $("#editorHelpFrame").attr("src", location) ;
        // Handle drops
        $( "#container .droppable" ).droppable( {
            greedy: true,
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event : Event, ui : JQueryUI.DroppableEventUIParam) : void
            {
                console.log(">> Dropping into something of class .droppable. (Main drop handler)" );
                console.log('ui.draggable.attr("id") is ' + ui.draggable.attr("id") );
                console.log( "dragKind is " + dragKind ) ;
                console.log( "draggedObject is " + draggedObject ) ;
                console.log( "draggedSelection is " + draggedSelection ) ;
                const optDropTarget : Option<PSelection>  = treeView.getPathToNode(currentSelection.root(), $(this)) ;
                console.log("  on current selection " + optDropTarget.toString() ) ;
                // Case: Dragged object is dropped on a node or drop zone of the current tree.
                optDropTarget.map( dropTarget => {
                    if (  dragKind === DragEnum.CURRENT_TREE )
                    {
                        console.log("  First case" ) ;
                        const selectionArray = treeMgr.pasteMoveSwapEditList( draggedSelection, dropTarget );
                        console.log("  Back from moveCopySwapEditList" ) ;
                        // Pick the first action that succeeded, if any
                        if(  selectionArray.length > 0 ) {
                                // Do the first action.
                                update( selectionArray[0][2] ) ;
                                // Show the user what was done and also the alternatives.
                                showAlternativesDialog(selectionArray);
                        }
                    }
                    else if( dragKind === DragEnum.CLIPBOARD ) 
                    {
                        console.log("  Second case. (Drag from clipboard)." ) ;
                        console.log("  Dragged Selection is " +  draggedSelection.toString() ) ;
                        const opt = treeMgr.paste( draggedSelection, dropTarget ) ;
                        console.log("  opt is " + opt ) ;
                        assert.check( opt !== undefined ) ;
                        opt.map( update ) ;
                    }
                    else if( dragKind === DragEnum.PALLETTE ) 
                    {
                        console.log("  Third case." ) ;
                        console.log("  " + ui.draggable.attr("id"));
                        // Add create a new node and use it to replace the current selection.
                        const action : Actions = ui.draggable.data( "action" ) as Actions ;
                        createNode( action, dropTarget );
                    } else {
                        assert.check( false, "Drop without a drag.") ;
                    } } ) ;
                console.log("<< Leaving drop handler" ) ;
            }
        });


        // Handle drags
        $("#container .canDrag").draggable({
            helper:'clone',
            //appendTo:'body',
            revert: true,
            opacity: 0.5, 
            start: function(event : Event, ui : JQueryUI.DraggableEventUIParams) : void {
                console.log( ">> Drag handler for things in or in the clipboard" ) ;   
                const optDraggedSelection : Option<PSelection> = treeView.getPathToNode(currentSelection.root(), $(this));
                optDraggedSelection.map( ds => {
                    dragKind = DragEnum.CURRENT_TREE ;            
                    draggedObject = undefined ;
                    draggedSelection = ds ; } ) ;
                console.log( "<< Drag handler for things in tree" ) ;     
            }
        });

        // Set focus to any elements of class "input" in the tree
        const inputs : JQuery = $("#container .input") ;
        if( inputs.length > 0 ) {
            inputs.focus(); // Set the focus to the first item in inputs
            $(document).off( "keydown" ) ;
            inputs.keydown(keyDownHandlerForInputs) ;
            // If there is any change to the input controls
            // then update the label on the next blur.
            inputs.change( function( ev : JQueryEventObject) : void {
                inputs.blur( updateLabelHandler ) ;
            }) ;
            // TODO Scroll the container so that the element in focus is visible.
        } else {
            $(document).off( "keydown" ) ;
            $(document).keydown( keyDownHandler ) ;

            // Single clicks on the view should change the current selection.
            $("#container .selectable").click(
                function(this : HTMLElement, evt : Event) : void {
                    console.log( ">> Click Handler") ;
                    const optClickTarget :  Option<PSelection>
                    = treeView.getPathToNode(currentSelection.root(), $(this)) ;
                    optClickTarget.map( update )  ;
                    evt.stopPropagation(); 
                    console.log( "<< Click Handler") ;
                } );

            // TODO Rather than double click, perhaps a click on a selected
            // node should open it.
            $("#container .click").dblclick(
                function(this : HTMLElement, evt : Event) : void {
                    console.log( ">> Double Click Handler") ;
                    const optClickTarget : Option<PSelection> 
                    = treeView.getPathToNode(currentSelection.root(), $(this)) ;
                    optClickTarget.map( clickTarget => {
                        const opt = treeMgr.openLabel(clickTarget) ;
                        opt.map( update ) ; } ) ;
                    evt.stopPropagation(); 
                    console.log( "<< Double Click Handler") ;
                });
        }
    }

    function updateLabelHelper( element: HTMLElement, tabDirection : number ) : void {
        //console.log( ">>updateLabelHelper") ;
        const text = parsers.parseString( $(element).val() ) ;
        const optLocationOfTarget : Option<PSelection>
            = treeView.getPathToNode(currentSelection.root(), $(element) )  ;
        //console.log( "  locationOfTarget is " + optLocationOfTarget ) ;
        
        optLocationOfTarget.bind( locationOfTarget =>
            treeMgr.changeNodeString( locationOfTarget, text, tabDirection ) )
        .map( update ) ;
        //console.log( "<< updateLabelHelper " + result.toString() ) ;
    }

    
    const updateLabelHandler = function (this : HTMLElement, e : Event ) : void {
            //console.log( ">>updateLabelHandler") ;
            updateLabelHelper( this, 1 ) ;
            //console.log( "<< updateLabelHandler") ;
        } ;

    const keyDownHandlerForInputs 
        = function(this : HTMLElement, e : JQueryKeyEventObject ) : void { 
            if (e.keyCode === 13 || e.keyCode === 9) {
                console.log( ">>input keydown handler") ;
                const tabDirection = e.keyCode !== 9 ? 0 : e.shiftKey ? -1 : +1 ;
                updateLabelHelper( this, tabDirection ) ;
                // TODO: It would be nice to have special handling of
                //   up and down arrows (for example). However that
                //   requires handling of the event before it gets
                //   intercepted by the field.
                e.stopPropagation() ;
                e.preventDefault();
                console.log( "<<input keydown handler") ;
            } } ;

    const cut_keh = function( e : JQueryKeyEventObject ) : boolean {
        cut();
        return true ;
      }

    const copy_keh = function( e : JQueryKeyEventObject ) : boolean {
        copy();
        return true ;
    }

    const paste_keh = function( e : JQueryKeyEventObject ) : boolean {
        paste();
        return true ;
    }

   const deep_paste_keh = function ( depth : number ) : KeyEventHandler {
        return function( e : JQueryKeyEventObject ) : boolean {
            deep_paste(depth) ;
            return true ;
        }
    } 

    const swap_keh = function( e : JQueryKeyEventObject ) : boolean {
        swap();
        return true ;
    } 

    const selectAll_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.selectAll( currentSelection ).map( update ) ;
        return true ;
    } 

    const undo_keh = function( e : JQueryKeyEventObject ) : boolean {
        keyboardUndo();
        return true ;
    } 

    const redo_keh = function( e : JQueryKeyEventObject ) : boolean {
        keyboardRedo();
        return true ;
    }
    
    const moveOut_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveOut( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveUp_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveUp( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveDown_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveDown( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveLeft_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveLeft( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveRight_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveRight( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveFocusUp_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveFocusUp( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveFocusDown_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveFocusDown( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveFocusLeft_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveFocusLeft( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveFocusRight_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveFocusRight( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveTabForward_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveTabForward( currentSelection ).map( update ) ;
        return true ;
    }
    
    const moveTabBack_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.moveTabBack( currentSelection ).map( update ) ;
        return true ;
    }
    
    const openLabel_keh = function( e : JQueryKeyEventObject ) : boolean {
        treeMgr.openLabel( currentSelection ).map( update ) ;
        return true ;
    }



    const emptyVar_keh = function( e : JQueryKeyEventObject ) : boolean {
        createNode(Actions.VAR, currentSelection ) ;
        return true ;
    }

    const var_keh = function( e : JQueryKeyEventObject, character : string ) : boolean {
        createNode(Actions.VAR, currentSelection, character ) ;
        return true ;
    }

    const createNode_keh = function( act : Actions, str? : string ) : KeyEventHandler {
        return function( e : JQueryKeyEventObject ) : boolean {
            createNode( act, currentSelection, str );
            return true ; }
    }

    // This (incomplete) set of codes indicates keys that
    // are not generally used to produce characters.
    // I include space so that Shift_Space etc are included.
    const specialCodes = {
        ArrowUp:0, ArrowDown:0, ArrowLeft:0, ArrowRight:0,
        Tab:0, Enter:0, NumpadEnter:0, Space:0, Escape:0,
        Insert:0, Delete:0, BackSpace:0, End:0, Home:0,
        PageDown:0, PageUp:0, Help:0,
        F1:0, F2:0, F3:0, F4:0, F5:0, F6:0, F7:0,
        F8:0, F9:0, F10:0, F11:0, F12:0,
    } ;
    
    const keyDownHandler
        =  function(this : HTMLElement, e : JQueryKeyEventObject ) : void { 
            // See https://www.w3.org/TR/uievents/
            // and https://www.w3.org/TR/uievents-code/
            // and https://www.w3.org/TR/uievents-key/
            // Note that W3C uses the words "key" and "code" counter-intuitively.
            // *  The "key" is the character that is being entered. E.g. if you
            //    hit the Q key on a QUERTY keyboard it will be "q" (or "Q" if shifted)
            //    hitting the same key on a AZERTY keyboard generates a "a" or "A".
            // *  Code represents the position of the key on the board.
            //    E.g. hitting Q on a QUERTY keyboard gives KeyQ.
            //    But on an AZERTY keyboard hitting the A key gives KeyQ.
            console.log( ">>keydown handler." ) ;
            // Older JQuery does not copy the code field.
            // So we get it from the original event
            const orig = e.originalEvent as KeyboardEvent
            let code = orig.code ; 
            if( typeof(code) == 'undefined') code = "" ;
            // Older browsers might follow an older standard.
            switch( code ) {
                case "Up" : code = "ArrowUp" ; break ;
                case "Down" : code = "ArrowDown" ; break ;
                case "Left" : code = "ArrowLeft" ; break ;
                case "Right" : code = "ArrowRight" ; break ;
            }
            let key = e.key ; 
            if( typeof(key) == 'undefined') key = "" ;
            console.log( "  e.key is " +e.key+ ", e.originalEvent.code is " +orig.code+
                         ", e.ctrlKey is " +e.ctrlKey+ ", e.metaKey is " +e.metaKey+
                         ", e.shiftKey is " +e.shiftKey + ", e.altKey is" +e.altKey ) ;

            // (0) Make a string out of the event

            const isSpecialCode = typeof( specialCodes[code] ) !== 'undefined' ;
            let str = "" ;
            if( e.ctrlKey || e.metaKey || isSpecialCode )
            {
                // In these cases we pay attention to the physical keyboard key rather than
                // the character it happens to represent.
                // E.g. Hitting Psi on a greek keyboard when the 
                // control key is down produces "Control_KeyC".
                if( e.altKey ) str += "Alt_" ;
                if( e.ctrlKey ) str += "Control_" ;
                if( e.metaKey ) str += "Meta_" ;
                if( e.shiftKey ) str += "Shift_" ;
                str += code ;
            } else {
                // No control or meta modifier. We just use the
                // value of the key attribute.
                // In this case the alt, shift, control, and meta
                // keys are ignored.
                str += key ;
            }
            console.log( "The keydown event maps to string '" + str +"'" ) ;
            
            // (1) Look up and execute the KeyEventHandler for this string
            let ok : boolean ;
            const keh : KeyEventHandler | undefined = keyEventMap[str] ;
            if( typeof(keh) !== 'undefined' ) {
                ok = keh(e, key) ;
            } else if( str.length === 1 && isLetter(str) ) {
                // Since there are too many letters to map
                // we use a catch-all handler for all letters.
                // and pass the actual letter as another argument.
                const keh : KeyEventHandler = keyEventMap["letter"] ;
                ok = keh(e, key) ;
            } else {
                console.log( "No handler found." + str ) ;
                ok = false ;
            }
            if( ok ) {
                e.stopPropagation(); 
                e.preventDefault(); 
            }
    }

    export function update( sel : PSelection ) : void {
            undoStack.push(currentSelection);
            redoStack.length = 0 ;
            setCurrentSelection( sel ) ;
    }

    export function getCurrentSelection() : PSelection {
        return currentSelection ;
    }

    function setCurrentSelection( sel : PSelection ) : void {
        currentSelection = sel ;
        generateHTMLSoon();
        if (sessionStorage.length > 0) {
            save();
        }
    }

    function createNodeOnCurrentSelection(action: Actions, nodeText?: string) : void
    {
        createNode( action, getCurrentSelection(), nodeText) ;
    }

    function createNode(action : Actions, sel : PSelection, nodeText?: string) : void
    {
        const opt : Option<PSelection> =
            (nodeText !== undefined) 
            ? treeMgr.createNodeWithText(action, sel, nodeText)
            : treeMgr.createNode(action, sel );
        opt.map( update );
    }

    function undo() : void {
        undoRedo( undoStack, redoStack, false )
    }

    function redo() : void {
        undoRedo( redoStack, undoStack, false ) ;
    }

    // TODO: Make cut, copy, paste, and move use system clipboard
    // as well as the local clipboard

    function cut() : void {
        const opt = treeMgr.delete(currentSelection);
        opt.map((sel: PSelection) => {
            addToClipboard(currentSelection);
            // TODO. The value currentSelection should be added to the
            // system clipboard
            update(sel);
        });
    }

    function copy() : void {
        addToClipboard(currentSelection);
        // The current selection should be added to the system clipboard
    }

    function paste() : void {
        // TODO At this point if item 0 of the clipboard does not
        // match the system clipboard, then the contents of the system
        // clipboard should be converted to a PSelection and added to the
        // editor's clipboard.
        deep_paste(0) ;
    }

    function deep_paste( depth : number ) : void {
        // Deep-paste does not affect or use the system
        // clipboard.  In this way Cntl-0 and Cntl-V (will) differ.

        getFromDeepClipboard(depth).map( (src : PSelection) => {
            treeMgr.paste( src, currentSelection ).map( (newSelection : PSelection ) => {
                // Push the current selection as the second item of the clipboard.
                // This allows you rotate 3 or more things. E.g. Select the first. Copy
                // Select the second, paste, select the third deep-paste 1, select the fourth
                // deep-paste 1 ... select the first and deep-paste 1.
                addToClipboard( currentSelection, 1 ) ;
                update(newSelection) ;
            })
        }) ;
    }

    function move() : void {
        getFromClipboard().map((src: PSelection) =>
            treeMgr.move(src, currentSelection)
                   .map(update));
    }
    
    function swap() : void {
        getFromClipboard().map((src: PSelection) =>
            treeMgr.swap(src, currentSelection)
                   .map(update));
    }

    // Scroll container to make a selected element fully visible
    function scrollIntoView() : void {
        const container : JQuery | null = $("#container ");
        const sel : JQuery | null = $(".selected");
        if (sel.get(0) === undefined) { return; } //Return if no selected nodes

        const selectionHeight : number | null = sel.outerHeight(); // Height of selected node     
        const selectionTop : number | null = sel.position().top; // Relative to visible container top
        const selectionBot : number | null = (selectionHeight + selectionTop); 
        const visibleHeight : number | null = container.outerHeight(); // Height of visible container   
        const visibleTop : number | null = container.scrollTop(); // Top of visible container
        const scrollBarWidth: number | null = container[0].offsetWidth - container[0].clientWidth;
        const scrollSpeed : number = 50;

        // If the bottom edge of an element is not visible, scroll up to meet the bottom edge 
        if ( selectionBot > (visibleHeight-scrollBarWidth) && selectionHeight < visibleHeight) {
            container.animate(
                { scrollTop: (visibleTop + selectionBot - visibleHeight + 10 + scrollBarWidth)},
                scrollSpeed );

        // If the top edge of an element is not visible or element is too large, scroll to the top edge
        // selectionTop is referenced from the top of the visible container; will be < 0 if above this point)
        } else if ( selectionTop < 0 || selectionHeight > visibleHeight) {
            container.animate(
                { scrollTop: (selectionTop + visibleTop - 10)},
                scrollSpeed );
        }
    }
                                                           
    
    //This version of redo is meant to be called by the keyboard shortcut.
    function keyboardUndo() : void {
        undoRedo( undoStack, redoStack, true ) ;
    }

    function keyboardRedo() : void {
        undoRedo( redoStack, undoStack, true ) ;
    }

    // Undo or redo one or more changes.
    // When skipOpenNodes is true, it skips trees with open nodes;
    // this is because the text boxes associated
    // with open nodes hijack the keyboard focus and subsequent uses of the keyboard
    // shortcut are directed to the open text box.
    //
    // It groups, when possible,
    // changes that don't change the root, i.e. selection changes.
    //
    // Example: (Assuming skipOpenNodes is false)
    // Selections that are the result of a move are shown as M. Selections
    // with open nodes are shown with an O. The current selection is shown with a ^.
    // Initially
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                                      ^
    // undo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                               ^ 
    // undo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                           ^
    // undo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                       ^
    // undo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                   ^
    // undo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //      ^
    // redo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                   ^
    // redo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                       ^
    // redo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                           ^
    // redo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                               ^
    // redo
    //      0   1M   2M  3M  4O  5   6  7M  8M
    //                                      ^
    function undoRedo( fromStack : Array<PSelection>, toStack : Array<PSelection>, skipOpenNodes : boolean ) : void {
        function nextRoot() { return fromStack[ fromStack.length - 1].root() } 
        if( fromStack.length === 0 ) return ;
        let sel : PSelection = currentSelection;
        let firstChangeIsAMove = sel.root() == nextRoot() ;
        let finished : boolean = false;
        while ( true ) { // Invariant fromStack.length > 0
            toStack.push(sel);
            sel = fromStack.pop() as PSelection;

            if( fromStack.length === 0 ) break ;
            let nextChangeIsAMove = sel.root() === nextRoot()
            if( (skipOpenNodes && hasOpenNodes( sel.root() ) )
                || firstChangeIsAMove && nextChangeIsAMove ) {
                    // no break
            } else {
                break ; }
        }
        setCurrentSelection( sel ) ;
    }

    function hasOpenNodes( node : pnode.PNode) : boolean
    {
            return node.label().isOpen()
                || node.children().some( hasOpenNodes ) ;
    }

    let pendingAction : number|null = null ;

    function generateHTMLSoon( ) : void {
        //console.log( ">>generateHTMLSoon") ;
        if( pendingAction !== null ) {
            window.clearTimeout( pendingAction as number ) ; }
        pendingAction = window.setTimeout(
            function() : void {
                generateHTML() ; scrollIntoView();
            },
            20) ;
        //console.log( "<<generateHTMLSoon") ;
    }

    let saving : boolean = false;
    function save() : void {
        if (!saving) {
            saving = true;
            setTimeout(function () : void {
                            $.post('/update/',
                                   {
                                        identifier: sessionStorage.getItem("programId"),
                                        program: pnode.fromPNodeToJSON(currentSelection.root())
                                   },
                                   function () : void {
                                       saving = false;
                                   }); },
                       15000);
        }
    }
    type KeyEventHandler = (e:JQueryKeyEventObject, character? : String) => boolean ;
    interface KeyEventMap { [key:string] : KeyEventHandler ; }

    const keyEventMap : KeyEventMap = { }
    keyEventMap.Control_KeyX = cut_keh ; // Cntl-X
    keyEventMap.Meta_KeyX = cut_keh ; // Meta-X
    keyEventMap.Delete = cut_keh ; // Delete
    keyEventMap.Backspace = cut_keh ; // Backspace
    keyEventMap.Control_KeyC = copy_keh ; // Cntl-C
    keyEventMap.Meta_KeyC = copy_keh ; // Meta-C
    keyEventMap.Control_KeyV = paste_keh ; // Cntl-V
    keyEventMap.Meta_KeyV = paste_keh ; // Meta-V
    keyEventMap.Control_KeyB = swap_keh ; // Cntl-B
    keyEventMap.Meta_KeyB = swap_keh ; // Meta-B
    for( let i=0 ; i<10 ; i++) {
        const deep_paste_i = deep_paste_keh(i) ;
        keyEventMap["Control_Digit"+i] = deep_paste_i ; 
        keyEventMap["Meta_Digit"+i] = deep_paste_i ; 
        keyEventMap["Control_Numpad"+i] = deep_paste_i ; 
        keyEventMap["Meta_Numpad"+i] = deep_paste_i ; 
    }
    keyEventMap.Control_KeyA = selectAll_keh ; // Cntl-A
    keyEventMap.Meta_KeyA = selectAll_keh ; // Meta-A
    keyEventMap.Control_KeyZ = undo_keh ; // Cntl-Z
    keyEventMap.Meta_KeyZ = undo_keh ; // Meta-Z
    keyEventMap.Control_Shift_KeyZ = redo_keh ; // Cntl-Shift-Z
    keyEventMap.Meta_Shift_KeyZ = redo_keh ; // Meta-Shift-Z
    keyEventMap.Control_KeyY = redo_keh ; // Cntl-Y
    keyEventMap.Meta_KeyY = redo_keh ; // Meta-Y
    keyEventMap.Space = moveOut_keh ; // spacebar
    keyEventMap.ArrowUp = moveUp_keh ; // up arrow
    keyEventMap.ArrowDown = moveDown_keh ; // down arrow
    keyEventMap.ArrowLeft = moveLeft_keh ; // left arrow
    keyEventMap.ArrowRight = moveRight_keh ; // right arrow
    keyEventMap.Shift_ArrowUp = moveFocusUp_keh ; // shift up arrow
    keyEventMap.Shift_ArrowDown = moveFocusDown_keh ; // shift down arrow
    keyEventMap.Shift_ArrowLeft = moveFocusLeft_keh ; // shift left arrow
    keyEventMap.Shift_ArrowRight = moveFocusRight_keh ; // shift right arrow
    keyEventMap.Tab = moveTabForward_keh ; // Tab
    keyEventMap.Shift_Tab = moveTabBack_keh ; // Shift Tab
    keyEventMap.Enter = openLabel_keh ; // Enter
    keyEventMap[";"] = createNode_keh( Actions.LOC_OR_LOCATION_TYPE ) ; 
    keyEventMap[","] = createNode_keh( Actions.VAR_DECL ) ;
    keyEventMap[":"] = createNode_keh( Actions.STORE_OR_FIELD_TYPE ) ;
    for( let i=0 ; i<10 ; i++) {
        const digit = String.fromCharCode(i+48) ;
        keyEventMap[digit] = createNode_keh( Actions.NUMBER_OR_NUMBER_TYPE, digit ) ; // i
    }
    keyEventMap["?"] = createNode_keh( Actions.IF_OR_BOOL_TYPE ) ;
    keyEventMap["@"] = createNode_keh( Actions.WHILE ) ;
    keyEventMap["\\"] = createNode_keh( Actions.LAMBDA_OR_FUNCTION_TYPE ) ;
    keyEventMap["_"] = createNode_keh( Actions.CALL ) ;
    keyEventMap["\""] = createNode_keh( Actions.STRING_OR_STRING_TYPE ) ; //Double quote
    keyEventMap["$"] = createNode_keh( Actions.OBJECT ) ;
    keyEventMap["["] = createNode_keh( Actions.INDEX ) ;
    keyEventMap["."] = createNode_keh( Actions.DOT ) ;
    keyEventMap["("] = createNode_keh( Actions.TUPLE_OR_TUPLE_TYPE ) ;
    keyEventMap[")"] = createNode_keh( Actions.CLOSE ) ;
    keyEventMap["`"] = createNode_keh( Actions.CALL_VAR ) ; // Back quote
    // TODO Check that these work with numberpad
    ["+", "-", "*", "<", ">", "=", "%", "&", "|", "/"].forEach( (s) =>
        keyEventMap[s] = createNode_keh( Actions.CALL_VAR, s ) 
    ) ;
    keyEventMap["'"] = emptyVar_keh ; 
    keyEventMap["letter"] = var_keh ;

    // The table below indicates whether a character is
    // a letter or not. The first 65 characters are not,
    // the next 26 are, then 6 are not, then 26 are, then 47 are
    // not and so on.  This table covers the first 65,536 unicode
    // characters. It was generated using Java's Character.isLetter
    // method.
    const runLength = [65,26,6,26,47,1,10,1,4,1,
        5,23,1,31,1,458,4,12,14,5,
        7,1,1,1,129,5,1,2,2,4,
        8,1,1,3,1,1,1,20,1,83,
        1,139,8,158,9,38,2,1,7,39,
        72,27,5,3,45,43,35,2,1,99,
        1,1,15,2,7,2,10,3,2,1,
        16,1,1,30,29,89,11,1,24,33,
        9,2,4,1,5,22,4,1,9,1,
        3,1,23,25,171,54,3,1,18,1,
        7,10,15,7,1,7,5,8,2,2,
        2,22,1,7,1,1,3,4,3,1,
        16,1,13,2,1,3,14,2,19,6,
        4,2,2,22,1,7,1,2,1,2,
        1,2,31,4,1,1,19,3,16,9,
        1,3,1,22,1,7,1,2,1,5,
        3,1,18,1,15,2,35,8,2,2,
        2,22,1,7,1,2,1,5,3,1,
        30,2,1,3,15,1,17,1,1,6,
        3,3,1,4,3,2,1,1,1,2,
        3,2,3,3,3,12,22,1,52,8,
        1,3,1,23,1,10,1,5,3,1,
        26,2,6,2,35,8,1,3,1,23,
        1,10,1,5,3,1,32,1,1,2,
        15,2,18,8,1,3,1,41,2,1,
        16,1,17,2,24,6,5,18,3,24,
        1,9,1,1,2,7,58,48,1,2,
        12,7,58,2,1,1,2,2,1,1,
        2,1,6,4,1,7,1,3,1,1,
        1,1,2,2,1,4,1,2,9,1,
        2,5,1,1,21,2,34,1,63,8,
        1,36,27,5,115,43,20,1,16,6,
        4,4,3,1,3,2,7,3,4,13,
        12,1,17,38,10,43,1,1,3,329,
        1,4,2,7,1,1,1,4,2,41,
        1,4,2,33,1,4,2,7,1,1,
        1,4,2,15,1,57,1,4,2,67,
        37,16,16,85,12,620,2,17,1,26,
        5,75,21,13,1,4,14,18,14,18,
        14,13,1,3,15,52,35,1,4,1,
        67,88,8,41,1,1,5,70,10,29,
        51,30,2,5,11,44,21,7,56,23,
        9,53,82,1,93,47,17,7,55,30,
        13,2,16,38,26,36,41,3,10,36,
        107,4,1,4,14,192,64,278,2,6,
        2,38,2,6,2,8,1,1,1,1,
        1,1,1,31,2,53,1,7,1,1,
        3,3,1,7,3,4,2,6,4,13,
        5,3,1,7,116,1,13,1,16,13,
        101,1,4,1,2,10,1,1,3,5,
        6,1,1,1,1,1,1,4,1,11,
        2,4,5,5,4,1,52,2,2683,47,
        1,47,1,133,6,4,17,38,10,54,
        9,1,16,23,9,7,1,7,1,7,
        1,7,1,7,1,7,1,7,1,7,
        80,1,469,2,42,5,5,2,4,86,
        6,3,1,90,1,4,5,41,3,94,
        17,27,53,16,512,6582,74,20940,52,1165,
        67,46,2,269,3,16,10,2,20,47,
        16,25,8,70,49,9,2,103,2,4,
        1,2,14,10,80,8,1,3,1,4,
        1,23,29,52,14,50,62,6,3,1,
        14,28,10,23,25,29,7,47,28,1,
        48,41,23,3,1,8,20,23,3,1,
        5,48,1,1,3,2,2,5,2,1,
        1,1,24,3,35,6,2,6,2,6,
        9,7,1,7,145,35,29,11172,12,23,
        4,49,8452,302,2,62,2,106,38,7,
        12,5,5,1,1,10,1,13,1,5,
        1,1,1,2,1,2,1,108,33,363,
        18,64,2,54,40,12,116,5,1,135,
        36,26,6,26,11,89,3,6,2,6,
        2,6,2,3,35] ;
    
    const letterCache : { [key:string] : boolean ; } = {} ;

    /** Is the first code point of this string a letter in the basic multilingual plane?
     * Note:  Whether a code point is a letter or not is based on 
     * Java's Character.isLetter function.
     * Precondition: The string should represent (using UTF-16) a sequence
     *               of at least one unicode code points.
     */
    function isLetter( str : string ) : boolean {
        if( typeof(letterCache[str]) !== 'undefined' ) letterCache[str] ;
        // 
        // I think the rest of this function could be simplified to 
        //   
        //     var result = str.match( /\p{L}/u ) != null ;
        //     letterCache[str] = isLetter ;
        //     return isLetter ;
        //
        // with the added benefit that it would work also for characters outside the
        // basic multilingual plane. The question is: how well how do various browsers implement
        // character classes for unicode?
        //
        const codePoint = str.codePointAt(0) ;
        if( typeof codePoint !== 'number' ) return false ;

        // codePoint is a number between 0 and 0x10FFFF (1,114,111) inclusive.
        let sum = 0 ;
        let isLetter = false ;
        for( let i=0 ; i < runLength.length ; ++i ) {
            sum += runLength[i] ;
            if( sum > codePoint ) {
                letterCache[str] = isLetter ;
                return isLetter ; }
            isLetter = !isLetter ; }
        // If control escapes the above loop, then codePoint is greater than
        // 0xFFFF (65,535) and is not in the basic multilingual plane.
        // Thus we return false, even if the codePoint really is a letter.
        letterCache[str] = false ;
        return false ;
    }
}

export = editor;
