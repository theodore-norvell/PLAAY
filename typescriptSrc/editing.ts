/// <reference path="sharedMkHtml.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnodeEdits.ts" />

import sharedMkHtml = require('./sharedMkHtml');
import collections = require( './collections' );
import pnodeEdits = require( './pnodeEdits');

module editing {

    import list = collections.list;
    import Selection = pnodeEdits.Selection;

    var redostack = [];
    var trashArray = [];
    var pathToTrash = list<number>();

	export function editingActions () 
    {
        $("#undo").click(function() 
        {
			if (sharedMkHtml.undostack.length != 0) 
            {
				redostack.push(sharedMkHtml.currentSelection);
				sharedMkHtml.currentSelection = sharedMkHtml.undostack.pop();
				sharedMkHtml.generateHTML(sharedMkHtml.currentSelection);
				$("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
			}
		});
        $("#redo").click(function() 
        {
			if (redostack.length != 0) 
            {
                sharedMkHtml.undostack.push(sharedMkHtml.currentSelection);
                sharedMkHtml.currentSelection = redostack.pop();
                sharedMkHtml.generateHTML(sharedMkHtml.currentSelection);
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
                sharedMkHtml.undostack.push(sharedMkHtml.currentSelection);
                var selection = sharedMkHtml.tree.createNode(ui.draggable.attr("id"), sharedMkHtml.currentSelection);
                selection.choose(
                    sel => {
                        sharedMkHtml.currentSelection = sel;
                        sharedMkHtml.generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        sharedMkHtml.generateHTML(sharedMkHtml.currentSelection);
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
                var selection = sharedMkHtml.tree.deleteNode(sharedMkHtml.currentSelection);
                selection[1].choose(
                    sel => {
                        var trashselect = new Selection(selection[0][0],pathToTrash,0,0);
                        sharedMkHtml.undostack.push(sharedMkHtml.currentSelection);
                        sharedMkHtml.currentSelection = sel;
                        trashArray.push(trashselect);
                        sharedMkHtml.generateHTML(sharedMkHtml.currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        sharedMkHtml.generateHTML(sharedMkHtml.currentSelection);
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
                sharedMkHtml.draggedObject = $(this).attr("class");
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
                sharedMkHtml.draggedObject = $(this).parent().attr("class");
                sharedMkHtml.draggedSelection = trashArray[$(this).parent().attr("data-trashitem")];
            }
        });
	}

}

export = editing;
