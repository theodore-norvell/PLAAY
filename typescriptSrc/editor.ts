
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="createHtmlElements.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="selection.ts" />
/// <reference path="treeView.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="treeView.ts" />


import assert = require('./assert') ;
import collections = require( './collections' );
import createHTMLElements = require('./createHtmlElements');
import labels = require( './labels');
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

    import Selection = selection.Selection;

    import Actions = treeManager.Actions ;

    enum DragEnum { CURRENT_TREE, TRASH, PALLETTE, NONE }

    const redostack : Array<Selection> = [];
    const undostack  : Array<Selection> = [];
    const trashArray : Array<Selection> = [];

    // Invariant: draggedObject===undefined if and only if dragKind===DragEnum.NONE 
    let draggedObject : string|undefined ; 
    let draggedSelection : Selection ;
    let dragKind : DragEnum  = DragEnum.NONE ;

    let currentSelection = new Selection(labels.mkExprSeq([]),list<number>(),0,0);

    const treeMgr = new treeManager.TreeManager(); // TODO Rename

    export function editingActions () : void {
        generateHTMLSoon();
        $("#undo").click( undo );
        $("#redo").click( redo ) ;
        $("#trash").click( toggleTrash ) ;
        $("#toggleOutput").click( createHTMLElements.toggleOutput ) ;

        makeTrashDroppable( $("#trash") ) ;
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

    function addToTrash( sel : Selection ) : void {                
        trashArray.unshift( sel ) ;
        if( trashArray.length > 10 ) trashArray.length = 10 ;
        refreshTheTrash() ;
    }

    function getFromTrash( ) : Option< Selection > {
        if( trashArray.length === 0 ) return none<Selection>() ;
        else return some( trashArray[0] ) ;
    }

    function getFromDeepTrash( depth : number ) : Option< Selection > {
        if( trashArray.length <= depth ) return none<Selection>() ;
        else return some( trashArray[depth] ) ;
    }


    function toggleTrash() : void {
        let dialogDiv : JQuery = $('#trashDialog');
        if( dialogDiv.length === 0 ) {
            dialogDiv = $("<div id='trashDialog' style='overflow:visible'><div/>") ;
            dialogDiv.appendTo('body') ;
            dialogDiv.dialog({ dialogClass : 'no-close success-dialog', title: 'Trash' } );
            dialogDiv.dialog( 'close' ) ;
            return ; }
        
        if( dialogDiv.dialog( 'isOpen' )  ) {
            dialogDiv.dialog( 'close' ) ; 
        } else {
            dialogDiv.dialog( 'open' ) ; 
            refreshTheTrash( ) ; 
            makeTrashDroppable( dialogDiv ) ;
        }
	}

    function refreshTheTrash() : void {
        const dialogDiv : JQuery = $('#trashDialog');
        if( dialogDiv.dialog( 'isOpen' )  ) {
            dialogDiv.empty() ;
            for(let i = 0; i < trashArray.length; i++)
            {
                const trashItemDiv = create("div", "trashitem", null, dialogDiv).attr("data-trashitem", i.toString()) ;
                const trashedSelection = trashArray[i] ;
                const a : Array<pnode.PNode> =  trashedSelection.selectedNodes()  ;
                for( let j=0 ; j < a.length; ++j ) {
                    trashItemDiv.append($(treeView.traverseAndBuild(a[j], -1, false))); }
            }
            installTrashItemDragHandler() ;
        }
    }

    function installTrashItemDragHandler() : void {
        $(".trashitem").draggable({
            helper:'clone',
            //appendTo:'body',
            revert: true ,
            revertDuration: 100,
            opacity: 0.5, 
            appendTo: '#container',
            containment: false,
            start: function(event : Event,ui : JQueryUI.DraggableEventUIParams) : void {
                console.log( ">> Drag handler for things in trash" ) ;
                dragKind = DragEnum.TRASH ;
                draggedObject = $(this).parent().attr("class");
                draggedSelection = trashArray[$(this).attr("data-trashitem")];
                console.log( "<< Drag handler for things in trash" ) ;
            }
        });
    }

    function makeTrashDroppable( trash : JQuery ) : void {
        trash.droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event : Event,ui : JQueryUI.DroppableEventUIParam) : void {
                console.log(">> Dropping into trash" );
                if( dragKind !== DragEnum.CURRENT_TREE ) { return ; }
                console.log("   ui is " + ui.draggable.toString()  );
                const optSelectionToDelete : Option<Selection>
                    = treeView.getPathToNode(currentSelection.root(), ui.draggable);
                console.log("   Dropping selection. " + optSelectionToDelete.toString() );
                const opt = optSelectionToDelete.bind(
                    selectionToDelete => treeMgr.delete( selectionToDelete ) ) ;
                assert.check( opt !== undefined ) ;
                opt.map(
                    sel => {
                        console.log("   Dropping into trash a" );
                        console.log("   New selection is. " + sel.toString() );
                        addToTrash( optSelectionToDelete.first() ) ;
                        update( sel ) ;
                        console.log("   Dropping into trash b" );
                        console.log("   Dropping into trash c" );
                    } );
                console.log("<< Dropping into trash" );
            }
        });
    }

    function showAlternativesDialog(selectionArray : Array< [string, string, Selection] >)  : void
    {
        if( selectionArray.length < 1 ) return ;

        // Make an object representing all the buttons we need.
        const buttonsObj = {} ;
        for( let i = 1 ; i < selectionArray.length ; ++i ) {
            buttonsObj[ selectionArray[i][1] ]
                = function () : void { update( selectionArray[i][2] ) ; } ;
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
        const newHTML : JQuery = treeView.traverseAndBuild(currentSelection.root(), -1, false) ;
        $("#container").empty().append(newHTML);
        treeView.highlightSelection( currentSelection, newHTML ) ;
        // Handle drops
        $( "#container .droppable" ).droppable({
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
                const optDropTarget : Option<Selection>  = treeView.getPathToNode(currentSelection.root(), $(this)) ;
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
                                console.log("  Doing a " + selectionArray[0][0] ) ;
                                update( selectionArray[0][2] ) ;
                                console.log("  HTML generated" ) ;
                                showAlternativesDialog(selectionArray);
                        }
                    }
                    else if( dragKind === DragEnum.TRASH ) 
                    {
                        console.log("  Second case. (Drag from trash)." ) ;
                        console.log("  Dragged Selection is " +  draggedSelection.toString() ) ;
                        const opt = treeMgr.paste( draggedSelection, dropTarget ) ;
                        console.log("  opt is " + opt ) ;
                        assert.check( opt !== undefined ) ;
                        opt.map(
                            sel => {
                                console.log("  Insertion is possible." ) ;
                                update( sel ) ;
                                console.log("  HTML generated" ) ;
                            } );
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
                console.log( ">> Drag handler for things in or in the trash" ) ;   
                const optDraggedSelection : Option<Selection> = treeView.getPathToNode(currentSelection.root(), $(this));
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
                    const optClickTarget :  Option<Selection>
                    = treeView.getPathToNode(currentSelection.root(), $(this)) ;
                    optClickTarget.map( clickTarget => update( clickTarget ) ) ;
                    evt.stopPropagation(); 
                    console.log( "<< Click Handler") ;
                } );

            // TODO Rather than double click, perhaps a click on a selected
            // node should open it.
            $("#container .click").dblclick(
                function(this : HTMLElement, evt : Event) : void {
                    console.log( ">> Double Click Handler") ;
                    const optClickTarget : Option<Selection> 
                    = treeView.getPathToNode(currentSelection.root(), $(this)) ;
                    optClickTarget.map( clickTarget => {
                        const opt = treeMgr.openLabel(clickTarget) ;
                        opt.map( (sel : Selection) => update( sel ) ) ; } ) ;
                    evt.stopPropagation(); 
                    console.log( "<< Double Click Handler") ;
                });
        }
    }

    function updateLabelHelper( element: HTMLElement, tabDirection : number ) : void {
        //console.log( ">>updateLabelHelper") ;
        const text = $(element).val();
        const optLocationOfTarget : Option<Selection>
            = treeView.getPathToNode(currentSelection.root(), $(element) )  ;
        //console.log( "  locationOfTarget is " + optLocationOfTarget ) ;
        
        optLocationOfTarget.bind(
            locationOfTarget => treeMgr.changeNodeString( locationOfTarget, text, tabDirection ) )
        .map( (result : Selection) => update( result ) ) ;
        //console.log( "<< updateLabelHelper " + result.toString() ) ;
    }

    
    const updateLabelHandler = function (this : HTMLElement, e : Event ) : void {
            console.log( ">>updateLabelHandler") ;
            updateLabelHelper( this, 1 ) ;
            console.log( "<< updateLabelHandler") ; } ;

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
                // TODO: Might be nice to handle space and operators specially when entering a number.
                e.stopPropagation() ;
                e.preventDefault();
                console.log( "<<input keydown handler") ;
            } } ;

    const keyDownHandler
        =  function(this : HTMLElement, e : JQueryKeyEventObject ) : void { 
            console.log( ">>keydown handler." ) ;
            console.log( "  e.which is " +e.which+ "e.ctrlKey is " +e.ctrlKey+ ", e.metaKey is " +e.metaKey+ ", e.shiftKey is " +e.shiftKey + ", e.altKey is" +e.altKey ) ;
            // Cut: Control X, command X, delete, backspace, etc.
            if ((e.ctrlKey || e.metaKey) && e.which === 88 || e.which === 8 || e.which === 46 ) 
            {
                const opt = treeMgr.delete( currentSelection ) ;
                opt.map( (sel : Selection) => {
                    addToTrash(currentSelection) ;
                    update( sel ) ;
                } ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Copy: Cntl-C or Cmd-C
            else if ((e.ctrlKey || e.metaKey) && e.which === 67 ) 
            {
                addToTrash(currentSelection);
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Paste: Cntl-V or Cmd-V
            else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.which === 86) 
            {
                getFromTrash().map( (src : Selection) =>
                     treeMgr.paste( src, currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Paste from deep trash: Cntl-number key or Cmd-number key
            else if ((e.ctrlKey || e.metaKey) && ((e.which >= 49 && e.which <= 57) || e.which >= 97 && e.which <= 105)) 
            {
                let num : number = e.which;
                if(num >= 96)
                {
                    num -= 48; //Convert numpad key to number key
                }
                num -= 48; //convert from ASCII code to the number
                getFromDeepTrash(num).map( (src : Selection) =>
                     treeMgr.paste( src, currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }

            // Swap: Cntl-B or Cmd-B
            else if ((e.ctrlKey || e.metaKey) && e.which === 66) 
            {
            
                getFromTrash().map( (src : Selection) =>
                     treeMgr.swap( src, currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Select all: Cntl-A or Cmd-A
            else if ((e.ctrlKey || e.metaKey) && e.which === 65) 
            {
                treeMgr.selectAll( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Undo: Cntl-Z or Cmd-Z
            else if ((e.ctrlKey || e.metaKey) && !e.shiftKey &&  e.which === 90) 
            {
                keyboardUndo();
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Redo: Cntl-Y or Cmd-Y (or Ctrl-Shift-Z or Cmd-Shift-Z)
            else if ((e.ctrlKey || e.metaKey) && (e.which === 89 || (e.shiftKey && e.which === 90))) 
            {
                keyboardRedo();
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.which === 32) // space bar
            {
                treeMgr.moveOut( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.which === 38 && ! e.shiftKey ) // up arrow
            {
                treeMgr.moveUp( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.which === 40 && ! e.shiftKey) // down arrow
            {
                treeMgr.moveDown( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.which === 37 && ! e.shiftKey) // left arrow
            {
                treeMgr.moveLeft( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }            
            else if (e.which === 39 && ! e.shiftKey) // right arrow
            {
                treeMgr.moveRight( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }else if (e.which === 38 && e.shiftKey ) // shifted up arrow
            {
                treeMgr.moveFocusUp( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.which === 40 && e.shiftKey) // shifted down arrow
            {
                treeMgr.moveFocusDown( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.which === 37 && e.shiftKey) // shifted left arrow
            {
                treeMgr.moveFocusLeft( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }            
            else if (e.which === 39 && e.shiftKey) // shifted right arrow
            {
                treeMgr.moveFocusRight( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (!e.shiftKey && e.which === 9) // tab
            {
                treeMgr.moveTabForward( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (e.shiftKey && e.which === 9) // shift+tab
            {
                treeMgr.moveTabBack( currentSelection ).map( (sel : Selection) =>
                         update( sel ) ) ;
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            else if (! e.shiftKey && e.which === 13) // enter
            {
                const opt = treeMgr.openLabel( currentSelection ) ;
                opt.map( (sel : Selection) => update( sel ) ) ;
                e.stopPropagation() ;
                e.preventDefault() ;
            }
            else 
            {
                tryKeyboardNodeCreation(e);
            }
            console.log( "<<keydown handler") ;
    };

    function tryKeyboardNodeCreation(e : JQueryKeyEventObject ) : void
    {
            console.log( "Shift is " + e.shiftKey + " which is " + e.which) ;
            // Create location decl node: ;  
            if ( (!e.shiftKey && e.which===59) ) 
            {
                createNode( Actions.LOC_OR_LOCATION_TYPE, currentSelection );
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            // Create constant decl node: , or Cntl-Shift-C or Cmd-Shift-C 
            else if ( (!e.shiftKey && e.which===188)
              || (e.ctrlKey || e.metaKey) && e.shiftKey && e.which === 67) 
            {
                createNode( Actions.VAR_DECL, currentSelection );
                e.stopPropagation(); 
                e.preventDefault(); 
            }
            //Create assignment node: shift+; (aka :)
            else if (e.shiftKey && (e.which === 59 || e.which === 186))
            {
                createNode(Actions.ASSIGN_OR_ASSIGN_TYPE, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create numeric literal node: any digit key (including numpad keys)
            else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && ((e.which >= 48 && e.which <= 57)
                   || e.which >= 96 && e.which <= 105))
            {
                let charCode : number = e.which;
                if(charCode >= 96)
                {
                    charCode -= 48; //Convert numpad key to number key
                }
                createNode(Actions.NUMBER_OR_NUMBER_TYPE, currentSelection, String.fromCharCode(charCode) );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create if node: shift+/ (aka ?)
            else if (e.shiftKey && e.which === 191)
            {
                createNode(Actions.IF_OR_BOOL_TYPE, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create while node: shift+2 (aka @)
            else if (e.shiftKey && e.which === 50)
            {
                createNode(Actions.WHILE, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create lambda node: with the \ key
            else if (!e.shiftKey && e.which === 220)
            {
                createNode(Actions.LAMBDA_OR_FUNCTION_TYPE, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create call node: with the shift - key (aka _)
            else if (e.shiftKey && (e.which === 189 || e.which === 173) )
            {
                createNode(Actions.CALL, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create string literal node: shift+' (aka ")
            else if (e.shiftKey && e.which === 222)
            {
                createNode(Actions.STRING_OR_STRING_TYPE, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create variable node: any letter
            else if (!(e.ctrlKey || e.metaKey) && e.which >= 65 && e.which <= 90)
            {
                let charCode : number = e.which;
                if(!e.shiftKey) //Handle capital vs lowercase letters.
                {
                    charCode += 32;
                }
                createNode(Actions.VAR, currentSelection, String.fromCharCode(charCode) );
                e.stopPropagation();
                e.preventDefault();
            }
            else if( !e.shiftKey && e.which === 192 ) {  // Backquote
                createNode(Actions.CALL_VAR, currentSelection );
                e.stopPropagation();
                e.preventDefault();
            }
            //Create call world node: shift+= (aka +), shift+8 (aka *), /, -, or numpad equivalents.
            // TODO:  What for shifts (and lack of shifts) here.
            else if (
                   (e.shiftKey && (e.which === 61         // Shift 61  +
                                   || e.which === 187     // Shift 187 +
                                   || e.which === 56      // Shift 56  *
                                   || e.which === 188     // Shift 188 <
                                   || e.which ===190      // Shift 190 >
                                   || e.which === 53      // Shift 53  %
                                   || e.which === 55      // Shift 55 &
                                   || e.which === 220 ))  // Shift 220 |
                   || (!e.shiftKey && (e.which === 191    // No shift 191 /
                                      || e.which === 173  // No shift 173  -
                                      || e.which === 189  // No shift 189  -
                                      || e.which === 107  // No shift 107  +
                                      || e.which === 106  // No shift 106 *
                                      || e.which === 111  // No shift 111 /
                                      || e.which === 61 // No shift 61 =
                                      || e.which === 109 ) ) ) // No shift 109 -
            {
                const charCode : number = e.which;
                if(e.shiftKey && charCode === 61 || charCode === 107 || charCode === 187)
                {
                    createNode(Actions.CALL_VAR, currentSelection, "+");
                }
                else if(charCode === 61)
                {
                    createNode(Actions.CALL_VAR, currentSelection, "=");
                }
                else if(charCode === 109 || charCode === 173 || charCode === 189)
                {
                    createNode(Actions.CALL_VAR, currentSelection, "-");
                }
                else if(charCode === 56 || charCode === 106)
                {
                    createNode(Actions.CALL_VAR, currentSelection, "*");
                }
                else if( charCode === 188 ) {
                    createNode(Actions.CALL_VAR, currentSelection, "<");
                }
                else if( charCode === 190 ) {
                    createNode(Actions.CALL_VAR, currentSelection, ">");
                }
                else if( charCode === 53 ) {
                    createNode(Actions.CALL_VAR, currentSelection, "%");
                }
                else if( charCode === 55 ) {
                    createNode(Actions.AND_OR_MEET_TYPE, currentSelection );
                }
                else if( charCode === 220 ) {
                    createNode(Actions.OR_OR_JOIN_TYPE, currentSelection );
                }
                else //only the codes for /  can possibly remain.
                {
                    createNode(Actions.CALL_VAR, currentSelection, "/");
                }
                e.stopPropagation();
                e.preventDefault();
            }
            // Create Object Literal node: $
            else if (e.shiftKey && e.which === 52)
            {
                createNode(Actions.OBJECT, currentSelection);
                e.stopPropagation();
                e.preventDefault();
            }
            //Create accessor node: [
            else if(!e.shiftKey && e.which === 219)
            {
                createNode(Actions.INDEX, currentSelection);
                e.stopPropagation();
                e.preventDefault();
            }
            //Create dot node: .
            else if(!e.shiftKey && (e.which === 190 || e.which === 110) )
            {
                createNode(Actions.DOT, currentSelection);
                e.stopPropagation();
                e.preventDefault();
            }
            //Create tuple node: (
            else if(e.shiftKey && (e.which === 57 )) 
            {
                createNode(Actions.TUPLE_OR_TUPLE_TYPE, currentSelection);
                e.stopPropagation();
                e.preventDefault();
            }
            return;
    }

    export function update( sel : Selection ) : void {
            undostack.push(currentSelection);
            currentSelection = sel ;
            redostack.length = 0 ;
            generateHTMLSoon();
            if (sessionStorage.length > 0) {
                save();
            }
    }

    export function getCurrentSelection() : Selection {
        return currentSelection ;
    }

    function createNodeOnCurrentSelection(action: Actions, nodeText?: string) : void
    {
        createNode( action, getCurrentSelection(), nodeText) ;
    }

    function createNode(action : Actions, sel : Selection, nodeText?: string) : void
    {
        const opt : Option<Selection> =
            (nodeText !== undefined) 
            ? treeMgr.createNodeWithText(action, sel, nodeText)
            : treeMgr.createNode(action, sel );
        //console.log("  opt is " + opt );
        opt.map(
            sel0 => {
                // console.log("  createNode is possible." ) ;
                update( sel0 ) ;
                // console.log("  HTML generated" ) ;
            } );
    }

    function undo() : void {
        if (undostack.length !== 0)  {
            redostack.push(currentSelection);
            currentSelection = undostack.pop() as Selection ;
            generateHTMLSoon();
        }
    }

    function redo() : void {
        if (redostack.length !== 0) {
            undostack.push(currentSelection);
            currentSelection = redostack.pop() as Selection ;
            generateHTMLSoon();
        }
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
                                                           
    //This version of undo is meant to be called by the keyboard shortcut.
    //It skips open nodes, which would otherwise reopen themselves and disable keyboard shortcuts until closed.
    function keyboardUndo() : void {
        let finished : boolean = false;
        let sel : Selection = currentSelection;
        while (undostack.length !== 0 && !finished)  {
            redostack.push(sel);
            sel = undostack.pop() as Selection ;
            finished = hasOpenNodes(sel) ;
        }
        currentSelection = sel;
        generateHTMLSoon();
        return;
    }

    //This version of redo is meant to be called by the keyboard shortcut.
    function keyboardRedo() : void {
        let finished : boolean = false;
        let sel : Selection = currentSelection;
        while (redostack.length !== 0 && !finished)  {
            undostack.push(sel);
            sel = redostack.pop() as Selection;
            finished = hasOpenNodes(sel) ;
        }
        currentSelection = sel;
        generateHTMLSoon();
        return;
    }

    function hasOpenNodes(sel: Selection) : boolean
    {
            if(Math.abs(sel.anchor() - sel.focus()) === 1)
            {
                if(sel.selectedNodes()[0].label().isOpen())
                { //Keep going if the selected node is open.
                    return false;
                }
                for(const child of sel.selectedNodes()[0].children())
                { //deal with cases where a child of the selected node is open, but not the selected node itself.
                    if(child.label().isOpen())
                    {
                        return false;
                    }
                }
            }
            return true;
    }

    let pendingAction : number|null = null ;
    function generateHTMLSoon( ) : void {
        if( pendingAction !== null ) {
            window.clearTimeout( pendingAction as number ) ; }
        pendingAction = window.setTimeout(
            function() : void { generateHTML() ; scrollIntoView(); }, 20) ;
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
}

export = editor;
