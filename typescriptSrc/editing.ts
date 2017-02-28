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
    var pathToTrash = list<number>(); // TODO What is this for?
    var draggedObject : string ; 
    var draggedSelection : Selection ;
    var dragKind : DragEnum  = DragEnum.NONE ;

    const treeMgr = new treeManager.TreeManager(); // TODO Rename

	export function editingActions () 
    {
        generateHTML(sharedMkHtml.currentSelection);

        $("#undo").click(function() 
        {
			if (undostack.length != 0) 
            {
				redostack.push(sharedMkHtml.currentSelection);
				sharedMkHtml.currentSelection = undostack.pop();
				generateHTML(sharedMkHtml.currentSelection);
			}
		});
        $("#redo").click(function() 
        {
			if (redostack.length != 0) 
            {
                undostack.push(sharedMkHtml.currentSelection);
                sharedMkHtml.currentSelection = redostack.pop();
                generateHTML(sharedMkHtml.currentSelection);
            }
		});

        // $(".droppable").droppable({
        //     hoverClass: "hover",
        //     tolerance: "pointer",
        //     drop: function (event, ui) {
        //         // TODO Why do we need this hendler?
        //         console.log(">> Dropping into something of class .droppable. (Mystery Handler)" );
        //         console.log('ui.draggable.attr("id") is ' + ui.draggable.attr("id") );
        //         console.log( "dragKind is " + dragKind ) ;
        //         console.log( "draggedObject is " + draggedObject ) ;
        //         console.log( "draggedSelection is " + draggedSelection ) ;
        //         sharedMkHtml.currentSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection.root(), $(this));
        //         undostack.push(sharedMkHtml.currentSelection);
        //         var selection = treeMgr.createNode(ui.draggable.attr("id"), sharedMkHtml.currentSelection);
        //         assert.check( selection !== undefined ) ;
        //         selection.choose(
        //             sel => {
        //                 sharedMkHtml.currentSelection = sel;
        //                 generateHTML(sharedMkHtml.currentSelection);
        //             },
        //             ()=>{
        //                 generateHTML(sharedMkHtml.currentSelection);
        //             });
        //         console.log("<< Dropping into something of class .droppable." );
        //     }
        // });

		$(".trash").click(function() {visualizeTrash();});
        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event, ui){
                console.log(">> Dropping into trash" );
                if( dragKind != DragEnum.CURRENT_TREE ) { return ; }
                console.log("   JQuery is " + ui.draggable.toString()  );
                sharedMkHtml.currentSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection.root(), ui.draggable);
                console.log("   Dropping selection. " + sharedMkHtml.currentSelection.toString() );
                var opt = treeMgr.delete(sharedMkHtml.currentSelection);
                assert.check( opt !== undefined ) ;
                opt.choose(
                    sel => {
                        console.log("   Dropping into trash a" );
                        console.log("   New selection is. " + sharedMkHtml.currentSelection.toString() );                
                        trashArray.push(sharedMkHtml.currentSelection);
                        undostack.push(sharedMkHtml.currentSelection);
                        sharedMkHtml.currentSelection = sel;
                        generateHTML(sharedMkHtml.currentSelection);
                        console.log("   Dropping into trash b" );
                        console.log("   Dropping into trash c" );
                    },
                    ()=>{
                        console.log("   Deletion failed." );
                        generateHTML(sharedMkHtml.currentSelection);
                    });
                console.log("<< Dropping into trash" );
            }
        });

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

    function visualizeTrash() : void {
        var dialogDiv = $('#trashDialog');

        if (dialogDiv.length == 0) {
            dialogDiv = $("<div id='dialogDiv' style='overflow:visible'><div/>").appendTo('body') ;
            for(let i = 0; i < trashArray.length; i++) {
				const trashItemDiv = create("div", "trashitem", null, dialogDiv).attr("data-trashitem", i.toString()) ;
                const trashedSelection = trashArray[i] ;
                const a : Array<pnode.PNode> =  trashedSelection.selectedNodes()  ;
                for( let j=0 ; j < a.length; ++j ) {
                	trashItemDiv.append($(sharedMkHtml.traverseAndBuild(a[j], -1, false))); }
            }
            dialogDiv.dialog({
                modal : true,
                dialogClass : 'no-close success-dialog',
            });
        }else{
            dialogDiv.dialog("destroy");
        }

        $(".trashitem").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert: true ,
            revertDuration: 500,
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

    function createCopyDialog(selectionArray)  : JQuery 
    {
        return $("<div></div>")
            .dialog({
                resizable: false,
                dialogClass: 'no-close success-dialog',
                modal: true,
                height: 75,
                width: 75,
                open: function(event, ui)
                {
                    var markup = selectionArray[0][0];
                    $(this).html(markup);

                    setTimeout(function() {
                        $('.ui-dialog-content').dialog('destroy');
                    },2000);
                },
                buttons: {
                    "Copy": function()
                    {
                        selectionArray[1][2].choose(
                            sel =>{
                                undostack.push(sharedMkHtml.currentSelection);
                                sharedMkHtml.currentSelection = sel;
                                generateHTML(sharedMkHtml.currentSelection);
                            },
                            () =>{
                                generateHTML(sharedMkHtml.currentSelection);
                            }
                        );
                        $( this ).dialog( "destroy" );
                    }
                }
            });
    }

    function createSwapDialog(selectionArray) 
    {
        return $("<div></div>")
            .dialog({
                resizable: false,
                dialogClass: 'no-close success-dialog',
                modal: true,
                height: 75,
                width: 75,
                open: function (event, ui) {
                    var markup = selectionArray[0][0];
                    $(this).html(markup);
                    setTimeout(function () {
                        $('.ui-dialog-content').dialog('destroy');
                    }, 2000);
                },
                buttons: {
                    "Swap": function () {
                        selectionArray[2][2].choose(
                            sel =>{
                                undostack.push(sharedMkHtml.currentSelection);
                                sharedMkHtml.currentSelection = sel;
                                generateHTML(sharedMkHtml.currentSelection);
                            },
                        () =>{
                            generateHTML(sharedMkHtml.currentSelection);
                        }
                        );
                        $(this).dialog("destroy");
                    }
                }
            });
    }

    // TODO: Make this function nonexported.
    export function generateHTML(select:Selection)
    {
        sharedMkHtml.currentSelection = select;
		$("#container").empty()
			.append(sharedMkHtml.traverseAndBuild(select.root(), -1, false));

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            greedy: true,
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui)
            {
                // TODO: Simplify the drag and drop code.
                // It's not clear to me why the first two cases are different.
                // Nor why we need to list so many box types in these if commands.
                // Note that the way drag and drop should work when a selection is 
                // dragged from one part of the main tree to another is given in the
                // requirement in Trello.  Essentially the idea is that such a drag and
                // drop represents one of the following operations move, copy, swap.
                // If none of these is possible, the drop is a no-op.
                // If one of these is possible, then that operation proceeds.
                // If more than one is possible, then the first of these three (move, copy, swap)
                // is done and the others are offered as alternatives in a popup dialog that
                // disappears.

                // First change the current selection to be the the drop target.
                console.log(">> Dropping into something of class .droppable. (Main drop handler)" );
                console.log('ui.draggable.attr("id") is ' + ui.draggable.attr("id") );
                console.log( "dragKind is " + dragKind ) ;
                console.log( "draggedObject is " + draggedObject ) ;
                console.log( "draggedSelection is " + draggedSelection ) ;
                console.log(">> Dropping " + ui.draggable.attr("id") );
                sharedMkHtml.currentSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection.root(), $(this));
                console.log("  on current selection " + sharedMkHtml.currentSelection.toString() ) ;
                // Case: Dragged object is dropped on a node.
                // TODO: Use dragKind
                if (  (  (/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                      || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                      || (/assign/i.test(draggedObject)) )
                   && (   (/ifBox/i.test($(this).attr("class")))
                      || (/lambdaBox/i.test($(this).attr("class"))) || (/whileBox/i.test($(this).attr("class")))
                      || (/callWorld/i.test($(this).attr("class"))) || (/assign/i.test($(this).attr("class")) ) ) )
                {
                    // TODO fix the following
                    console.log("  First case" ) ;
                    const selectionArray = treeMgr.moveCopySwapEditList(draggedSelection, sharedMkHtml.currentSelection);
                    assert.check( selectionArray[0][2] !== undefined ) ;
                    selectionArray[0][2].choose(
                        sel => {
                            // Move is possible. Do the move and offer any others as alternatives.
                            console.log("  Move is possible." ) ;
                            undostack.push(sharedMkHtml.currentSelection);
                            sharedMkHtml.currentSelection = sel;
                            console.log("  New current selection " + sharedMkHtml.currentSelection.toString() ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                            createSwapDialog(selectionArray);
                            console.log("  Back from createSwapDialog." ) ;
                        },
                        ()=>{
                            // TODO This makes no sense. If move is not possible, then
                            // there are other possibilities.
                            console.log("  Move is NOT possible." ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                        });
                }
                // Case: Dragged object is dropped on a dropzone.
                else if (  (  (/ifBox/i.test(draggedObject))
                           || (/lambdaBox/i.test(draggedObject))
                           || (/whileBox/i.test(draggedObject))
                           || (/callWorld/i.test(draggedObject))
                           || (/assign/i.test(draggedObject)))
                        && (/dropZone/i.test($(this).attr("class"))))
                {
                    // TODO fix the following.
                    // Also, why is this case different from the previous?
                    console.log("  Second case" ) ;
                    const selectionArray = treeMgr.moveCopySwapEditList(draggedSelection, sharedMkHtml.currentSelection);
                    assert.check( selectionArray[0][2] !== undefined ) ;
                    selectionArray[0][2].choose(
                        sel => {
                            console.log("  Move is possible." ) ;
                            undostack.push(sharedMkHtml.currentSelection);
                            sharedMkHtml.currentSelection = sel;
                            console.log("  New current selection " + sharedMkHtml.currentSelection.toString() ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                            createCopyDialog(selectionArray);
                            console.log("  Back from createCopyDialog." ) ;
                        },
                        ()=>{
                            console.log("  Move is NOT possible." ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                        });
                }
                else if( dragKind == DragEnum.TRASH ) 
                {
                    console.log("  Third case. (Drag from trash)." ) ;
                    console.log("  Current Selection is " +  sharedMkHtml.currentSelection.toString() ) ;
                    undostack.push(sharedMkHtml.currentSelection);
                    console.log("  Dragged Selection is " +  draggedSelection.toString() ) ;
                    var opt = treeMgr.copy(draggedSelection, sharedMkHtml.currentSelection);
                    console.log("  opt is " + opt ) ;
                    assert.check( opt !== undefined ) ;
                    opt.choose(
                        sel => {
                            console.log("  Insertion is possible." ) ;
                            sharedMkHtml.currentSelection = sel;
                            console.log("  New current selection " + sharedMkHtml.currentSelection.toString() ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                        },
                        ()=> {
                            console.log("  Insertion is NOT possible." ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                        });
                }
                else if( dragKind == DragEnum.PALLETTE ) 
                {
                    console.log("  Fourth case." ) ;
                    console.log("  " + ui.draggable.attr("id"));
                    // Add create a new node and use it to replace the current selection.
                    var selection = treeMgr.createNode(ui.draggable.attr("id") /*id*/, sharedMkHtml.currentSelection);
                    console.log("  selection is " + selection );
                    assert.check( selection !== undefined ) ;
                    selection.choose(
                        sel => {
                            console.log("  createNode is possible." ) ;
                            undostack.push(sharedMkHtml.currentSelection);
                            sharedMkHtml.currentSelection = sel;
                            console.log("  New current selection " + sharedMkHtml.currentSelection.toString() ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                        },
                        ()=>{
                            console.log("  createNode is NOT possible." ) ;
                            generateHTML(sharedMkHtml.currentSelection);
                            console.log("  HTML generated" ) ;
                        });
                } else {
                    console.log("  Fifth case.  This really should not happen." ) ;
                    generateHTML(sharedMkHtml.currentSelection);
                    console.log("  HTML generated" ) ;
                }
                console.log("<< Leaving drop handler" ) ;
            }
        });
        enterBox();
    }

    export function enterBox()
    {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                console.log( ">>keyup handler")
                const text = $(this).val();
                const locationOfTarget : Selection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection.root(), $(this) )  ;
                console.log( "  locationOfTarget is " + locationOfTarget ) ;
                const opt = treeMgr.changeNodeString( locationOfTarget, text );
                console.log( "  opt is " + opt) ;
                opt.choose(
                    sel => {
                        undostack.push(sharedMkHtml.currentSelection);
                        sharedMkHtml.currentSelection = sel;
                        generateHTML(sharedMkHtml.currentSelection);
                    },
                    ()=>{
                        generateHTML(sharedMkHtml.currentSelection);
                    });
                const label = $(this).attr("class");
                const childNumber = $(this).attr("data-childNumber") ;
                console.log( "  opt is " + opt) ;
                if (/var/i.test(label)) {
                    $(this).replaceWith('<div class="var H click" data-childNumber ="' + childNumber + '">' + text + '</div>');
                }
                else if (/stringLiteral/i.test(label)) {
                    $(this).replaceWith('<div class="stringLiteral H click" data-childNumber ="' + childNumber + '">' + text + '</div>');
                }
                else if (/op/i.test(label)) {
                    $(this).replaceWith('<div class="op H click">' + text + '</div>');
                }

                $(".click").click(function(){
                    var label = $(this).attr("class");
                    var val = $(this).attr("data-childNumber");
                    if (/var/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="var H input" data-childNumber="' + val + '">');
                    }
                    else if (/stringLiteral/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="stringLiteral H input" data-childNumber="' + val + '">');
                    }
                    else if(/op/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="op H input" list="oplist">');
                    }
                    enterBox();
                    //enterList();
                });
            }
        });
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert: false ,
            opacity: 0.5, 
            start: function(event,ui){
                console.log( ">> Drag handler for things in tree" ) ;                
                draggedObject = $(this).attr("class");
                dragKind = DragEnum.CURRENT_TREE ;
                draggedSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection.root(), $(this));
                console.log( "<< Drag handler for things in tree" ) ;     
            }
        });
    }


}

export = editing;