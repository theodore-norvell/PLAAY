
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="treeManager.ts" />


import assert = require('./assert') ;
import sharedMkHtml = require('./sharedMkHtml');
import collections = require( './collections' );
import pnode = require( './pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require( './treeManager');

module editing {

    import list = collections.list;
    import Selection = pnodeEdits.Selection;

    enum DragEnum { CURRENT_TREE, TRASH, PALLETTE, NONE } ;

    const redostack : Array<Selection> = [];
    const undostack  : Array<Selection> = [];
    const trashArray : Array<Selection> = [];
    var draggedObject : string ; 
    var draggedSelection : Selection ;
    var dragKind : DragEnum  = DragEnum.NONE ;

    var currentSelection = new pnodeEdits.Selection(pnode.mkExprSeq([]),list<number>(),0,0);

    const treeMgr = new treeManager.TreeManager(); // TODO Rename

	export function editingActions () 
    {
        
        $(document).keydown(function(e) { 
            if (e.ctrlKey && e.which == 88) //Ctrl-x
            {
                //TODO: push the current selection to the trash and delete it
            }
            else if (e.ctrlKey && e.which == 67) //Ctrl-c
            {
                //TODO: push the current selection to the trash
            }
            else if (e.ctrlKey && e.which == 86) //Ctrl-v
            {
                //TODO: should insert the top selection on the trash at the current selection
            }
            else if (e.ctrlKey && e.which == 66) //Ctrl-b
            {
                //TODO: swap the current selection with the top of the trash. I.e. we should be able to do Cntl-C, move the selection, Cntl-B to swap
            }
            else if (e.which == 38) // up arrow
            {
                //TODO: set selection above as the current selection
            }
            else if (e.which == 40) // down arrow
            {
                //TODO: set selection down as the current selection
            }
            e.preventDefault(); 
        });
        
        generateHTML();

        $("#undo").click( function()  { undo() ; } );
        $("#redo").click(function() { redo() ; } ) ;
		$(".trash").click(function() {toggleTrash();});

        makeTrashDroppable( $(".trash") ) ;
        $( ".palette" ).draggable({
            helper:"clone" ,
            revert: true ,
            revertDuration: 500,
            opacity: 0.5, 
            start : function(event, ui){
                console.log( ">> Drag handler for things in pallette" ) ;
                ui.helper.animate({
                    width: 40,
                    height: 40
                });
                dragKind = DragEnum.PALLETTE ;
                draggedObject = $(this).attr("class");
                console.log( "<< Drag handler for things in pallette" ) ;
            },
            cursorAt: {left:20, top:20},
            appendTo:"body"
        });

    }

    function create(elementType: string, className: string, idName: string, parentElement: JQuery) : JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (className) { obj.addClass(className); }
		if (idName) { obj.attr("id", idName); }
		if (parentElement) { obj.appendTo(parentElement); }
		return obj;
	}

    function addToTrash( sel : Selection ) {                
        trashArray.unshift( sel ) ;
        if( trashArray.length > 10 ) trashArray.length = 10 ;
        refreshTheTrash() ;
    }

    function toggleTrash() : void {
        let dialogDiv : JQuery = $('#trashDialog');
        if( dialogDiv.length == 0 ) {
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
        
        // Make a dialog
	}

    function refreshTheTrash() {
        let dialogDiv : JQuery = $('#trashDialog');
        if( dialogDiv.dialog( 'isOpen' )  ) {
            dialogDiv.empty() ;
            for(let i = 0; i < trashArray.length; i++)
            {
                const trashItemDiv = create("div", "trashitem", null, dialogDiv).attr("data-trashitem", i.toString()) ;
                const trashedSelection = trashArray[i] ;
                const a : Array<pnode.PNode> =  trashedSelection.selectedNodes()  ;
                for( let j=0 ; j < a.length; ++j ) {
                    trashItemDiv.append($(sharedMkHtml.traverseAndBuild(a[j], -1, false))); }
            }    
            installTrashItemDragHandler() ;
        }
    }

    function installTrashItemDragHandler() {
        $(".trashitem").draggable({
            helper:'clone',
            //appendTo:'body',
            revert: true ,
            revertDuration: 100,
            opacity: 0.5, 
            appendTo: '#container',
            containment: false,
            start: function(event,ui){
                console.log( ">> Drag handler for things in trash" ) ;
                dragKind = DragEnum.TRASH ;
                draggedObject = $(this).parent().attr("class");
                draggedSelection = trashArray[$(this).attr("data-trashitem")];
                console.log( "<< Drag handler for things in trash" ) ;
            }
        });
    }

    function makeTrashDroppable( trash : JQuery ) {
        trash.droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event, ui){
                console.log(">> Dropping into trash" );
                if( dragKind != DragEnum.CURRENT_TREE ) { return ; }
                console.log("   JQuery is " + ui.draggable.toString()  );
                const selectionToDelete = sharedMkHtml.getPathToNode(currentSelection.root(), ui.draggable);
                console.log("   Dropping selection. " + selectionToDelete.toString() );
                var opt = treeMgr.delete( selectionToDelete );
                assert.check( opt !== undefined ) ;
                opt.map(
                    sel => {
                        console.log("   Dropping into trash a" );
                        console.log("   New selection is. " + sel.toString() );
                        addToTrash( selectionToDelete ) ;
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
            buttonsObj[ selectionArray[i][1] ] = function () { update( selectionArray[i][2] ) ; }
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
                open: function (event, ui) {
                    var markup = selectionArray[0][0];
                    $(this).html(markup);
                    setTimeout(function () {
                        dialogDiv.dialog('destroy');
                        dialogDiv.remove() ;
                    }, 5000);
                },
                buttons: buttonsObj 
            });
    }

    function generateHTML() : void
    {
        // Refresh the view of the current selection
		$("#container").empty()
			.append(sharedMkHtml.traverseAndBuild(currentSelection.root(), -1, false));
        
        // Handle drops
        $( "#container .droppable" ).droppable({
            greedy: true,
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui)
            {
                console.log(">> Dropping into something of class .droppable. (Main drop handler)" );
                console.log('ui.draggable.attr("id") is ' + ui.draggable.attr("id") );
                console.log( "dragKind is " + dragKind ) ;
                console.log( "draggedObject is " + draggedObject ) ;
                console.log( "draggedSelection is " + draggedSelection ) ;
                const dropTarget : Selection = sharedMkHtml.getPathToNode(currentSelection.root(), $(this)) ;
                console.log("  on current selection " + dropTarget.toString() ) ;
                // Case: Dragged object is dropped on a node or drop zone of the current tree.
                if (  dragKind == DragEnum.CURRENT_TREE )
                {
                    console.log("  First case" ) ;
                    const selectionArray = treeMgr.moveCopySwapEditList( draggedSelection, dropTarget );
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
                else if( dragKind == DragEnum.TRASH ) 
                {
                    console.log("  Second case. (Drag from trash)." ) ;
                    console.log("  Dragged Selection is " +  draggedSelection.toString() ) ;
                    var opt = treeMgr.copy( draggedSelection, dropTarget ) ;
                    console.log("  opt is " + opt ) ;
                    assert.check( opt !== undefined ) ;
                    opt.map(
                        sel => {
                            console.log("  Insertion is possible." ) ;
                            update( sel ) ;
                            console.log("  HTML generated" ) ;
                        } );
                }
                else if( dragKind == DragEnum.PALLETTE ) 
                {
                    console.log("  Third case." ) ;
                    console.log("  " + ui.draggable.attr("id"));
                    // Add create a new node and use it to replace the current selection.
                    var selection = treeMgr.createNode(ui.draggable.attr("id") /*id*/, dropTarget );
                    console.log("  selection is " + selection );
                    assert.check( selection !== undefined ) ;
                    selection.map(
                        sel => {
                            console.log("  createNode is possible." ) ;
                            update( sel ) ;
                            console.log("  HTML generated" ) ;
                        } );
                } else {
                    assert.check( false, "Drop without a drag.") ;
                }
                console.log("<< Leaving drop handler" ) ;
            }
        });

        // Handle Returns on input items.
        $("#container .input").keyup(keyUpHandler);

        // Handle drags
        $("#container .canDrag").draggable({
            helper:'clone',
            //appendTo:'body',
            revert: true,
            opacity: 0.5, 
            start: function(event,ui){
                console.log( ">> Drag handler for things in or in the trash" ) ;   
                // TODO Check that we are in the main tree. 
                dragKind = DragEnum.CURRENT_TREE ;            
                draggedObject = undefined ;
                draggedSelection = sharedMkHtml.getPathToNode(currentSelection.root(), $(this));
                console.log( "<< Drag handler for things in tree" ) ;     
            }
        });

        // Handle clicks on vars etc.
        $("#container .click").click(function(){
            console.log( ">> Click Handler") ;
            // TODO: A better way to do this is to change the label to a state of being edited.
            const label = $(this).attr("class");
            let text = $(this).text() ;
            text = text.replace( /&/g, "&amp;" ) ;
            text = text.replace( /"/g, "&quot;") ;
            const val = $(this).attr("data-childNumber");
            // TODO The following is very ugly.  HTML generation is the responsibility of the sharedMkHTML module.
            if (/var/i.test(label))
            {
                $(this).replaceWith('<input type="text" class="var H input" data-childNumber="' + val + '" value="' + text +'">');
            }
            else if (/stringLiteral/i.test(label))
            {
                $(this).replaceWith('<input type="text" class="stringLiteral H input" data-childNumber="' + val + '" value="' + text +'">');
            }
            else if(/op/i.test(label))
            {
                $(this).replaceWith('<input type="text" class="op H input" list="oplist" value="' + text +'">');
            }
            $("#container .input").keyup(keyUpHandler);
            console.log( "<< Click Handler") ;
        });
    }

    const keyUpHandler = function (e) {
            if (e.keyCode == 13) {
                console.log( ">>keyup handler")
                const text = $(this).val();
                const locationOfTarget : Selection = sharedMkHtml.getPathToNode(currentSelection.root(), $(this) )  ;
                console.log( "  locationOfTarget is " + locationOfTarget ) ;
                const opt = treeMgr.changeNodeString( locationOfTarget, text );
                console.log( "  opt is " + opt) ;
                opt.map( sel => update(sel) );
                console.log( "<< keyup handler") ;
            } } ;

    export function update( sel : Selection ) : void {
            undostack.push(currentSelection);
            currentSelection = sel ;
            redostack.length = 0 ;
            generateHTML();
    }

    export function getCurrentSelection() : Selection {
        return currentSelection ;
    }

    function undo() : void {
        if (undostack.length != 0)  {
            redostack.push(currentSelection);
            currentSelection = undostack.pop();
            generateHTML();
        }
    }

    function redo() : void {
        if (redostack.length != 0) {
            undostack.push(currentSelection);
            currentSelection = redostack.pop();
            generateHTML();
        }
    }


}

export = editing;
