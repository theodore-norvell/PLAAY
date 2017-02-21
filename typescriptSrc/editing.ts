/// <reference path="collections.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="treeManager.ts" />


import sharedMkHtml = require('./sharedMkHtml');
import collections = require( './collections' );
import pnodeEdits = require( './pnodeEdits');
import treeManager = require( './treeManager');

module editing {

    import list = collections.list;
    import Selection = pnodeEdits.Selection;

    const redostack = [];
    const undostack = [];
    const trashArray = [];
    var pathToTrash = list<number>(); // TODO What is this for?
    var draggedObject;
    var draggedSelection;

    const treeMgr = new treeManager.TreeManager(); // TODO Rename

	export function editingActions () 
    {
        $("#undo").click(function() 
        {
			if (undostack.length != 0) 
            {
				redostack.push(sharedMkHtml.currentSelection);
				sharedMkHtml.currentSelection = undostack.pop();
				generateHTML(sharedMkHtml.currentSelection);
				$("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
			}
		});
        $("#redo").click(function() 
        {
			if (redostack.length != 0) 
            {
                undostack.push(sharedMkHtml.currentSelection);
                sharedMkHtml.currentSelection = redostack.pop();
                generateHTML(sharedMkHtml.currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
		});

        $(".droppable").droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                sharedMkHtml.currentSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection, $(this));
                undostack.push(sharedMkHtml.currentSelection);
                var selection = treeMgr.createNode(ui.draggable.attr("id"), sharedMkHtml.currentSelection);
                selection.choose(
                    sel => {
                        sharedMkHtml.currentSelection = sel;
                        generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
            }
        });

		$(".trash").click(function() {visualizeTrash();});
        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event, ui){
                sharedMkHtml.currentSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection, ui.draggable);
                var selection = treeMgr.deleteNode(sharedMkHtml.currentSelection);
                selection[1].choose(
                    sel => {
                        var trashselect = new Selection(selection[0][0],pathToTrash,0,0);
                        undostack.push(sharedMkHtml.currentSelection);
                        sharedMkHtml.currentSelection = sel;
                        trashArray.push(trashselect);
                        generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
            }
        });

        $( ".palette" ).draggable({
            helper:"clone" ,
            start : function(event, ui){
                ui.helper.animate({
                    width: 40,
                    height: 40
                });
                draggedObject = $(this).attr("class");
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
            dialogDiv = $("<div id='dialogDiv' style='overflow:visible'><div/>").appendTo('body');
            for(var i = 0; i < trashArray.length; i++) {
				create("div", "trashitem", null, dialogDiv)
					.attr("data-trashitem", i.toString())
                	.append($(sharedMkHtml.traverseAndBuild(trashArray[i].root(), trashArray[i].root().count(),false)));
            }
            dialogDiv.dialog({
                modal : true,
                dialogClass: 'no-close success-dialog',
            });
        }else{
            dialogDiv.dialog("destroy");
        }

        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert:'invalid',
            appendTo: '#container',
            containment: false,
            start: function(event,ui){
                draggedObject = $(this).parent().attr("class");
                draggedSelection = trashArray[$(this).parent().attr("data-trashitem")];
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
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            },
                            () =>{
                                generateHTML(sharedMkHtml.currentSelection);
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
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
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            },
                        () =>{
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
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
			.append(sharedMkHtml.traverseAndBuild(select.root(), select.root().count(), false));

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
                sharedMkHtml.currentSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection, $(this));
                // Case: Dragged object is dropped on a node.
                if (  (  (/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                      || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                      || (/assign/i.test(draggedObject)) )
                   && (   (/ifBox/i.test($(this).attr("class")))
                      || (/lambdaBox/i.test($(this).attr("class"))) || (/whileBox/i.test($(this).attr("class")))
                      || (/callWorld/i.test($(this).attr("class"))) || (/assign/i.test($(this).attr("class")) ) ) )
                {
                    // TODO fix the following
                    const selectionArray = treeMgr.moveCopySwapEditList(draggedSelection, sharedMkHtml.currentSelection);
                    selectionArray[0][2].choose(
                        sel => {
                            // Move is possible. Do the move and offer any others as alternatives.
                            undostack.push(sharedMkHtml.currentSelection);
                            sharedMkHtml.currentSelection = sel;
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            createSwapDialog(selectionArray);
                        },
                        ()=>{
                            // TODO This makes no sense. If move is not possible, then
                            // there are other possibilities.
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
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
                    const selectionArray = treeMgr.moveCopySwapEditList(draggedSelection, sharedMkHtml.currentSelection);
                    selectionArray[0][2].choose(
                        sel => {
                            undostack.push(sharedMkHtml.currentSelection);
                            sharedMkHtml.currentSelection = sel;
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            createCopyDialog(selectionArray);
                        },
                        ()=>{
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                // Case: Dragged object is dragged from the trash to a dropzone
                // TODO Why only dropzones?
                else if((/trashitem/i.test(draggedObject)) && (/dropZone/i.test($(this).attr("class"))))
                {
                    undostack.push(sharedMkHtml.currentSelection);
                    var selection = treeMgr.appendChild(draggedSelection, sharedMkHtml.currentSelection);
                    selection.choose(
                        sel => {
                            sharedMkHtml.currentSelection = sel;
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        },
                        ()=>{
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                // Case default.  I think this is used for pallette items.
                else
                {
                    console.log(ui.draggable.attr("id"));
                    // Add create a new node and use it to replace the current selection.
                    var selection = treeMgr.createNode(ui.draggable.attr("id") /*id*/, sharedMkHtml.currentSelection);
                    selection.choose(
                        sel => {
                            undostack.push(sharedMkHtml.currentSelection);
                            sharedMkHtml.currentSelection = sel;
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        },
                        ()=>{
                            generateHTML(sharedMkHtml.currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
            }
        });
        enterBox();
    }

    export function enterBox()
    {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                var text = $(this).val();
                var selection = treeMgr.changeNodeString( sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection, $(this)), 
                                                       text );
                selection.choose(
                    sel => {
                        undostack.push(sharedMkHtml.currentSelection);
                        sharedMkHtml.currentSelection = sel;
                        generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                var label = $(this).attr("class");
                if (/var/i.test(label)) {
                    $(this).replaceWith('<div class="var H click">' + text + '</div>');
                }
                else if (/stringLiteral/i.test(label)) {
                    $(this).replaceWith('<div class="stringLiteral H click">' + text + '</div>');
                }
                else if (/op/i.test(label)) {
                    $(this).replaceWith('<div class="op H click">' + text + '</div>');
                }

                $(".click").click(function(){
                    var label = $(this).attr("class");
                    var val = $(this).attr("data-childNumber");
                    if (/var/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="var H input"' + 'data-childNumber="' + val + '">');
                    }
                    else if (/stringLiteral/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="stringLiteral H input"'+'data-childNumber="' + val + '">');
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
            revert:'invalid',
            start: function(event,ui){
                draggedObject = $(this).attr("class");
                draggedSelection = sharedMkHtml.getPathToNode(sharedMkHtml.currentSelection, $(this));
            }
        });
    }


}

export = editing;
