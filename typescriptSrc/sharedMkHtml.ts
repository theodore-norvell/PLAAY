/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="assert.ts" />
/// <reference path="treeManager.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import pnode = require('./pnode');
import pnodeEdits = require('./pnodeEdits');
import treeManager = require('./treeManager');

module sharedMkHtml 
{
    import list = collections.list;
    import List = collections.List;
    import Selection = pnodeEdits.Selection;
    import PNode = pnode.PNode;

    export var currentSelection;
    export var undostack = [];
    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var select = new pnodeEdits.Selection(root,path(),0,0);
    currentSelection = select;

    export var draggedObject;
    export var draggedSelection;

    export var tree = new treeManager.TreeManager();

    export function traverseAndBuild(node:PNode, childNumber: number, evaluating:boolean) : HTMLElement
    {
        var children = new Array<HTMLElement>() ;
        for(var i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuild(node.child(i), i, evaluating) ) ;
        }
        return buildHTML(node, children, childNumber, evaluating);
    }

    function buildHTML(node:PNode, children : Array<HTMLElement>, childNumber : number, evaluating:boolean) : HTMLElement
    {
        var label = node.label().toString();
        if(label.match('if'))
        {
            assert.check( children.length == 3 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "ifGuardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var elsebox = document.createElement("div");
            elsebox.setAttribute("class", "elseBox H workplace");
            elsebox.appendChild( children[2] ) ;

            var ifbox = document.createElement("div");
            ifbox.setAttribute("data-childNumber", childNumber.toString());
            ifbox.setAttribute("class", "ifBox V workplace canDrag droppable");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox ;
        }
        else if(label.match("seq"))
        {
            if(evaluating)
            {
                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());

                for (var i = 0; true; ++i) {
                    if (i == children.length) break;
                    seqBox.appendChild(children[i]);
                }

                return seqBox;
            }
            else {

                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());
                seqBox["childNumber"] = childNumber;

                for (var i = 0; true; ++i) {
                    var dropZone = document.createElement("div");
                    dropZone.setAttribute("class", "dropZone H droppable");
                    seqBox.appendChild(dropZone);
                    if (i == children.length) break;
                    seqBox.appendChild(children[i]);
                }

                return seqBox;
            }
        }
        else if(label.match("expPH"))
        {
            var PHBox = document.createElement("div");
            PHBox.setAttribute("class", "placeHolder V");
            PHBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                PHBox.appendChild(dropZone);
                if (i == children.length) break;
                PHBox.appendChild(children[i]);
            }

            return PHBox;
        }
        else if(label.match("param"))
        {
            var paramBox = document.createElement("div");
            paramBox.setAttribute("class", "paramlistOuter H");
            paramBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                paramBox.appendChild(dropZone);
                if (i == children.length) break;
                paramBox.appendChild(children[i]);
            }

            return paramBox;
        }
        else if(label.match("while"))
        {
            assert.check( children.length == 2 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "whileGuardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var whileBox = document.createElement("div");
            whileBox.setAttribute("data-childNumber", childNumber.toString());
            whileBox.setAttribute("class", "whileBox V workplace canDrag droppable");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);

            return whileBox;
        }
        else if(label.match("callWorld"))
        {
            var WorldBox = document.createElement("div");
            WorldBox.setAttribute("class", "callWorld H canDrag droppable" );
            WorldBox.setAttribute("data-childNumber", childNumber.toString());
            WorldBox.setAttribute("type", "text");
            WorldBox.setAttribute("list", "oplist");

            var dropZone = document.createElement("div");
            dropZone.setAttribute("class", "dropZoneSmall H droppable");

            if((node.label().getVal().match(/\+/gi) || node.label().getVal().match(/\-/gi)
                || node.label().getVal().match(/\*/gi) || node.label().getVal().match(/\//gi) || (node.label().getVal().match(/==/gi))
                || (node.label().getVal().match(/>/gi)) || (node.label().getVal().match(/</gi)) || (node.label().getVal().match(/>=/gi))
                || (node.label().getVal().match(/<=/gi)) || (node.label().getVal().match(/&/gi)) || (node.label().getVal().match(/\|/gi)) )
                && node.label().getVal().length > 0)
            {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();

                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(opval);
                WorldBox.appendChild(children[1]);
            }
            else if(node.label().getVal().length > 0)
            {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();

                WorldBox.appendChild(opval);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(children[1]);
            }
            else
            {
                var op = document.createElement("input");
                op.setAttribute("class", "op H input");
                op.setAttribute("type", "text");
                op.setAttribute("list", "oplist");
                op.textContent = "";

                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(op);
                WorldBox.appendChild(children[1]);
            }

            return WorldBox;
        }
        else if(label.match("assign"))
        {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "assign H canDrag droppable" );
            AssignBox.setAttribute("data-childNumber", childNumber.toString());

            var equals = document.createElement("div");
            equals.setAttribute("class", "op H");
            equals.textContent = ":=";

            AssignBox.appendChild(children[0]);
            AssignBox.appendChild(equals);
            AssignBox.appendChild(children[1]);

            return AssignBox;
        }
        else if(label.match("lambda"))
        {
            var lambdahead = document.createElement("div");
            lambdahead.setAttribute("class", "lambdaHeader V ");
            lambdahead.appendChild( children[0] ) ;
            lambdahead.appendChild(children[1]);

            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox H");
            doBox.appendChild( children[2] ) ;

            var string;

            if (node.label().getVal().length > 0)
            {
                string = document.createElement("div");
                string.setAttribute("class", "stringLiteral H click canDrag");
                string.textContent = node.label().getVal();
            }
            else
            {
                string = document.createElement("input");
                string.setAttribute("class", "stringLiteral H input canDrag");
                string.setAttribute("type", "text");
            }

            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V droppable");
            LambdaBox.setAttribute("data-childNumber", childNumber.toString());
            LambdaBox.appendChild(string);
            LambdaBox.appendChild(lambdahead);
            LambdaBox.appendChild(doBox);

            return LambdaBox;
        }
        else if(label.match("null"))
        {
            var NullBox = document.createElement("div");
            NullBox.setAttribute("class", "nullLiteral H droppable");
            NullBox.textContent = "-";

            return NullBox;
        }
        else if (label.match("var"))
        {
            var VarBox;
            if (node.label().getVal().length > 0)
            {
                VarBox = document.createElement("div");
                VarBox.setAttribute("class", "var H click canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.textContent = node.label().getVal();
            }
            else
            {
                VarBox = document.createElement("input");
                VarBox.setAttribute("class", "var H input canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.setAttribute("type", "text");
                VarBox.textContent = "";
            }
            return VarBox;
        }
        else if (label.match("string"))
        {
            var StringBox;
            if (node.label().getVal().length > 0)
            {
                StringBox = document.createElement("div");
                StringBox.setAttribute("class", "stringLiteral H click canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.textContent = node.label().getVal();
            }
            else
            {
                StringBox = document.createElement("input");
                StringBox.setAttribute("class", "stringLiteral H input canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.setAttribute("type", "text");
                StringBox.textContent = "";
            }
            return StringBox;
        }
        else if(label.match("noType"))
        {
            var noType = document.createElement("div");
            noType.setAttribute( "class", "noReturnType V" ) ;
            noType.setAttribute("data-childNumber", childNumber.toString());
            noType["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                noType.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                noType.appendChild( children[i] ) ;
            }

            return noType ;
        }
        else if(label.match("expOpt"))
        {
            var OptType = document.createElement("div");
            OptType.setAttribute("class", "expOp V");
            OptType.setAttribute("data-childNumber", childNumber.toString());

            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                OptType.appendChild(dropZone);
                if (i == children.length) break;
                OptType.appendChild(children[i]);
            }

            return OptType;
        }
        else if(label.match("vdecl"))
        {
            var VarDeclBox = document.createElement("div");
            VarDeclBox.setAttribute("class", "vardecl H canDrag droppable" );
            VarDeclBox.setAttribute("data-childNumber", childNumber.toString());

            var type = document.createElement("div");
            type.textContent = ":";

            var equals = document.createElement("div");
            equals.textContent = ":=";

            VarDeclBox.appendChild(children[0]);
            VarDeclBox.appendChild(type);
            VarDeclBox.appendChild(children[1]);
            VarDeclBox.appendChild(equals);
            VarDeclBox.appendChild(children[2]);

            return VarDeclBox;
        }
        else if(label.match("forward"))
        {
            var forwardElement = document.createElement("div");
            forwardElement.setAttribute("class", "turtleFunc canDrag droppable");
            forwardElement.setAttribute("data-childNumber", childNumber.toString());
            forwardElement.textContent = "Forward";
            forwardElement.appendChild(children[0]);

            return forwardElement;
        }
        else if(label.match("right"))
        {
            var rightElement = document.createElement("div");
            rightElement.setAttribute("class", "turtleFunc canDrag droppable");
            rightElement.setAttribute("data-childNumber", childNumber.toString());
            rightElement.textContent = "Right";
            rightElement.appendChild(children[0]);

            return rightElement;
        }
        else if(label.match("left"))
        {
            var leftElement = document.createElement("div");
            leftElement.setAttribute("class", "turtleFunc canDrag droppable");
            leftElement.setAttribute("data-childNumber", childNumber.toString());
            leftElement.textContent = "Left";
            leftElement.appendChild(children[0]);

            return leftElement;
        }
        else if(label.match("pen"))
        {
            var penElement = document.createElement("div");
            penElement.setAttribute("class", "turtleFunc canDrag droppable");
            penElement.setAttribute("data-childNumber", childNumber.toString());
            penElement.textContent = "Pen";
            penElement.appendChild(children[0]);

            return penElement;
        }
        else if(label.match("clear"))
        {
            var clearElement = document.createElement("div");
            clearElement.setAttribute("class", "turtleFunc canDrag droppable");
            clearElement.setAttribute("data-childNumber", childNumber.toString());
            clearElement.textContent = "Clear";

            return clearElement;
        }
        else if(label.match("show"))
        {
            var showElement = document.createElement("div");
            showElement.setAttribute("class", "turtleFunc canDrag droppable");
            showElement.setAttribute("data-childNumber", childNumber.toString());
            showElement.textContent = "Show";

            return showElement;
        }
        else if(label.match("hide"))
        {
            var hideElement = document.createElement("div");
            hideElement.setAttribute("class", "turtleFunc canDrag droppable");
            hideElement.setAttribute("data-childNumber", childNumber.toString());
            hideElement.textContent = "Hide";

            return hideElement;
        }
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
                                undostack.push(currentSelection);
                                currentSelection = sel;
                                generateHTML(currentSelection);
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            },
                            () =>{
                                generateHTML(currentSelection);
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
                                undostack.push(currentSelection);
                                currentSelection = sel;
                                generateHTML(currentSelection);
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            },
                        () =>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        }
                        );
                        $(this).dialog("destroy");
                    }
                }
            });
    }

    export function generateHTML(select:Selection)
    {
        currentSelection = select;
		$("#container").empty()
			.append(sharedMkHtml.traverseAndBuild(select.root(), select.root().count(), false));

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            greedy: true,
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui)
            {
                var selectionArray = [];
                currentSelection = getPathToNode(currentSelection, $(this));
                if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && ((/ifBox/i.test($(this).attr("class")))
                    || (/lambdaBox/i.test($(this).attr("class"))) || (/whileBox/i.test($(this).attr("class")))
                    || (/callWorld/i.test($(this).attr("class"))) || (/assign/i.test($(this).attr("class")))))
                {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    selectionArray[0][2].choose(
                        sel => {
                            undostack.push(currentSelection);
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            createSwapDialog(selectionArray);
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                else if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && (/dropZone/i.test($(this).attr("class"))))
                {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    selectionArray[0][2].choose(
                        sel => {
                            undostack.push(currentSelection);
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            createCopyDialog(selectionArray);
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                else if((/trashitem/i.test(draggedObject)) && (/dropZone/i.test($(this).attr("class"))))
                {
                    undostack.push(currentSelection);
                    var selection = tree.appendChild(draggedSelection, currentSelection);
                    selection.choose(
                        sel => {
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                else
                {
                    console.log(ui.draggable.attr("id"));
                    undostack.push(currentSelection);
                    var selection = tree.createNode(ui.draggable.attr("id") /*id*/, currentSelection);
                    selection.choose(
                        sel => {
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        },
                        ()=>{
                            generateHTML(currentSelection);
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
                var selection = tree.changeNodeString(getPathToNode(currentSelection, $(this)), text);
                selection.choose(
                    sel => {
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(currentSelection);
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
                draggedSelection = getPathToNode(currentSelection, $(this));
            }
        });
    }

    export function getPathToNode(select:Selection, self ) : Selection
    {
        var array = [];
        var anchor;
        var focus;

        var parent = $(self);
        var child = Number(parent.attr("data-childNumber"));

        if (isNaN(child))
        {
            var index = parent.index();
            parent = parent.parent();
            var num = parent.children().eq(index).prevAll(".dropZone").length;
            child = Number(parent.attr("data-childNumber"));
            var place = index - num;

            var label = parent.attr("class");
            if (/placeHolder/i.test(label) || /expOp/i.test(label))
            {
                anchor = child;
                focus = anchor + 1;
                parent = parent.parent();
                child = Number(parent.attr("data-childNumber"));
            }
            else
            {
                anchor = place;
                focus = anchor;
            }
        }
        else
        {
            if(/var/i.test(parent.attr("class")) || /stringLiteral/i.test(parent.attr("class")))
            {
                anchor = 0;
                focus = anchor;
            }
            else
            {
                if ((/ifBox/i.test(parent.attr("class"))) || (/lambdaBox/i.test(parent.attr("class"))) ||
                    (/whileBox/i.test(parent.attr("class"))) || (/callWorld/i.test(parent.attr("class")))
                    || (/assign/i.test(parent.attr("class")))) {
                    anchor = child;
                    focus = child + 1;
                    parent = parent.parent();
                    child = Number(parent.attr("data-childNumber"));
                }
                else
                {
                    anchor = child;
                    focus = anchor;
                }
            }
        }
        while (child != -1) {
            if (!isNaN(child))
            {
                array.push(Number(parent.attr("data-childNumber")));
            }
            parent = parent.parent();
            child = Number(parent.attr("data-childNumber"));
        }
        var tree = select.root();
        var path = list<number>();
        var i ;
        for( i = 0 ; i < array.length ; i++ )
            path = collections.cons( array[i], path ) ;

        return new pnodeEdits.Selection(tree, path, anchor, focus);
    }
}

export = sharedMkHtml;
