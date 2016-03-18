/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="vms.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

import collections = require( './collections' );
import assert = require( './assert' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require('./treeManager');
import evaluationManager = require('./evaluationManager');
import stack = require( './stackManager' ) ;
import vms = require('./vms');

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    import PNode = pnode.PNode;
    import TreeManager = treeManager.TreeManager;
    import Selection = pnodeEdits.Selection;
    import fromJSONToPNode = pnode.fromJSONToPNode;
    import EvaluationManager = evaluationManager.EvaluationManager;
    import VarMap = stack.VarMap;
    import mapEntry = stack.mapEntry;
    import VMS = vms.VMS;

    var undostack = [];
    var redostack = [];
    var currentSelection;
    var draggedSelection;
    var draggedObject;

    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var tree = new TreeManager();
    var evaluation = new EvaluationManager();
    var select = new pnodeEdits.Selection(root,path(),0,0);
    var highlighted = false;
    currentSelection = select;

    export function onLoad() : void
    {
        //creates side bar
        const sidebar = document.createElement("div");
        sidebar.setAttribute("id","sidebar");
        sidebar.setAttribute("class","sidebar");
        document.getElementById("body").appendChild(sidebar);

        const stackbar = document.createElement("div");
        stackbar.setAttribute("id", "stackbar");
        stackbar.setAttribute("class", "stack");
        document.getElementById("body").appendChild(stackbar);
        document.getElementById("stackbar").style.visibility = "hidden";

        //creates undo/redo buttons
        const undoblock = document.createElement("div");
        undoblock.setAttribute("id", "undo");
        undoblock.setAttribute("class","undo");
        undoblock.setAttribute("onclick", "undo()");
        undoblock.textContent = "Undo";
        document.getElementById("body").appendChild(undoblock);
        var undo = document.getElementById("undo");
        undo.onclick = function undo()
        {
            if(undostack.length != 0)
            {
                redostack.push(currentSelection);
                currentSelection = undostack.pop();
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
        };

        const redoblock = document.createElement("div");
        redoblock.setAttribute("id", "redo");
        redoblock.setAttribute("class","redo");
        redoblock.setAttribute("onclick", "redo()");
        redoblock.textContent = "Redo";
        document.getElementById("body").appendChild(redoblock);
        var redo = document.getElementById("redo");
        redo.onclick = function redo()
        {
            if(redostack.length != 0)
            {
                undostack.push(currentSelection);
                currentSelection = redostack.pop();
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
        };

        const playbutton = document.createElement("div");
        playbutton.setAttribute("id", "play");
        playbutton.setAttribute("class", "play");
        playbutton.setAttribute("onclick", "play()");
        playbutton.textContent = "Play";
        document.getElementById("body").appendChild(playbutton);
        var play = document.getElementById("play");
        play.onclick = function play()
        {
            evaluate();
        };

        const editorbutton = document.createElement("div");
        editorbutton.setAttribute("id", "edit");
        editorbutton.setAttribute("class", "edit");
        editorbutton.setAttribute("onclick", "edit()");
        editorbutton.textContent = "Edit";
        document.getElementById("body").appendChild(editorbutton);
        var edit = document.getElementById("edit");
        edit.onclick = function edit()
        {
            editor();
        };
        document.getElementById("edit").style.visibility = "hidden";

        const trash = document.createElement("div");
        trash.setAttribute("id","trash");
        trash.setAttribute("class", "trash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);

        const advancebutton = document.createElement("div");
        advancebutton.setAttribute("id", "advance");
        advancebutton.setAttribute("class","advance");
        advancebutton.setAttribute("onclick", "advance()");
        advancebutton.textContent = "Next";
        document.getElementById("body").appendChild(advancebutton);
        var advance = document.getElementById("advance");
        advance.onclick = function advance()
        {
            setValAndHighlight();
        };
        document.getElementById("advance").style.visibility = "hidden";

        const ifblock = document.createElement("div");
        ifblock.setAttribute("id","if");
        ifblock.setAttribute("class","block V palette");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);

        const whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "block V palette");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);

        const varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "block V palette");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);

        const stringlitblock = document.createElement("div");
        stringlitblock.setAttribute("id", "stringliteral");
        stringlitblock.setAttribute("class", "block V palette");
        stringlitblock.textContent = "String Literal";
        document.getElementById("sidebar").appendChild(stringlitblock);

        const worldblock = document.createElement("div");
        worldblock.setAttribute("id", "worldcall");
        worldblock.setAttribute("class", "block V palette");
        worldblock.textContent = "Call World";
        document.getElementById("sidebar").appendChild(worldblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assign");
        assignmentblock.setAttribute("class", "block V palette");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "block V palette");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        const lambdablock = document.createElement("div");
        lambdablock.setAttribute("id", "lambda");
        lambdablock.setAttribute("class", "block V palette");
        lambdablock.textContent = "Lambda Expression";
        document.getElementById("sidebar").appendChild(lambdablock);

        const selectionblock = document.createElement("div");
        selectionblock.setAttribute("id", "selection");
        selectionblock.setAttribute("class", "block V palette");
        selectionblock.textContent = "Selection";
        document.getElementById("sidebar").appendChild(selectionblock);

        var list = document.createElement("datalist");
        list.setAttribute("id", "oplist");
        var optionplus = document.createElement("option");
        optionplus.value = "+";
        var optionminus = document.createElement("option");
        optionminus.value = "-";
        var optionmul = document.createElement("option");
        optionmul.value = "*";
        var optiondiv = document.createElement("option");
        optiondiv.value = "/";
        var optiongreater = document.createElement("option");
        optiongreater.value = ">";
        var optionless = document.createElement("option");
        optionless.value = "<";
        var optioneq = document.createElement("option");
        optioneq.value = "==";
        var optiongreatereq = document.createElement("option");
        optiongreatereq.value = ">=";
        var optionlesseq = document.createElement("option");
        optionlesseq.value = "<=";
        var optionand = document.createElement("option");
        optionand.value = "&";
        var optionor = document.createElement("option");
        optionor.value = "|";

        list.appendChild(optionplus);
        list.appendChild(optionminus);
        list.appendChild(optionmul);
        list.appendChild(optiondiv);
        list.appendChild(optiongreater);
        list.appendChild(optiongreatereq);
        list.appendChild(optionless);
        list.appendChild(optionlesseq);
        list.appendChild(optioneq);
        list.appendChild(optionand);
        list.appendChild(optionor);
        document.getElementById("body").appendChild(list);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);

        const vms = document.createElement("div");
        vms.setAttribute("id","vms");
        vms.setAttribute("class", "vms");
        document.getElementById("body").appendChild(vms);
        document.getElementById("vms").style.visibility = "hidden";

        const seq = document.createElement("div");
        seq.setAttribute("id", "seq");
        seq.setAttribute("data-childNumber", "-1");
        document.getElementById("container").appendChild(seq);

        //creates empty dropzone <div id="dropZone" class="dropZone H droppable"></div>
        const div = document.createElement("div") ;
        div.setAttribute("id", "dropZone");
        div.setAttribute("class", "dropZone H droppable") ;
        document.getElementById("seq").appendChild( div ) ;

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

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                var selection = tree.createNode(ui.draggable.attr("id"), currentSelection);
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
        });

        $( ".trash").droppable({
            accept:".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            drop: function(event, ui){
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                var selection = tree.deleteNode(currentSelection);
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
            }
        });
        enterBox();
    }

    function evaluate()
    {
        document.getElementById("trash").style.visibility = "hidden";
        document.getElementById("redo").style.visibility = "hidden";
        document.getElementById("undo").style.visibility = "hidden";
        document.getElementById("sidebar").style.visibility = "hidden";
        document.getElementById("container").style.visibility = "hidden";
        document.getElementById("play").style.visibility = "hidden";
        document.getElementById("vms").style.visibility = "visible";
        document.getElementById("stackbar").style.visibility = "visible";
        document.getElementById("advance").style.visibility = "visible";
        document.getElementById("edit").style.visibility = "visible";

        var vms = evaluation.PLAAY(currentSelection.root());
        var children = document.getElementById("vms");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }

        children.appendChild(traverseAndBuild(currentSelection.root(), currentSelection.root().count(), true));//vms.getEval().getRoot(), vms.getEval().getRoot().count()));
        $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();

        //highlight($(".vms"), vms.getEval().pending);
        //var root = document.getElementById("vms").children[0];
        //var array = [0,0];
        //setValueHTMLTest(root, array);
    }

    function editor()
    {
        document.getElementById("trash").style.visibility = "visible";
        document.getElementById("redo").style.visibility = "visible";
        document.getElementById("undo").style.visibility = "visible";
        document.getElementById("sidebar").style.visibility = "visible";
        document.getElementById("container").style.visibility = "visible";
        document.getElementById("play").style.visibility = "visible";
        document.getElementById("vms").style.visibility = "hidden";
        document.getElementById("stackbar").style.visibility = "hidden";
        document.getElementById("advance").style.visibility = "hidden";
        document.getElementById("edit").style.visibility = "hidden";

        $(".dropZone").show();
        $(".dropZoneSmall").show();
    }

    function setHTMLValueTest(root, array)
    {
        if(array.length == 0)
        {
            var self = $(root);
            self.replaceWith("<div>23</div>");
        }
        else{
            setHTMLValueTest(root.children[array.pop()], array);
        }
    }

    function highlight(parent, pending:Array<number>)
    {
        if(pending.length == 0)
        {
            var self = $(parent);
            if(self.index() == 0)
                $("<div class='selected V'></div>").prependTo(self.parent());
            else
                $("<div class='selected V'></div>").appendTo(self.parent());
            self.detach().appendTo($(".selected"));
        }
        else
        {
            highlight(parent.children[pending.pop()], pending);
        }
    }

    function setValAndHighlight()
    {
        //evaluation.next();
        if (!highlighted) {
            var root = document.getElementById("vms").children[0];
            var array = [0, 0];
            highlight(root, array);
            highlighted = true;
        }
        else {
            var root = document.getElementById("vms").children[0];
            var array = [0, 0];
            setHTMLValueTest(root, array);
            highlighted = false;
        }
    }

    function findInMap(root, varmap:VarMap)
    {
        var newMap = varmap;
        for(var i=0; i < newMap.size; i++)
        {
            setHTMLValue(root, newMap.entries[i]);
        }
    }

    function setHTMLValue(root, map:mapEntry)
    {
        if(map.getPath().length == 0)
        {
            var self = $(root);
            self.replaceWith("<div>23</div>");
        }
        else{
            setHTMLValue(root.children[map.getPath().pop()], map)
        }
    }

    function advance()
    {
        //evaluation.next();
        if(!highlighted)
        {
            var root = document.getElementById("vms").children[0];
            var array = [0,0];
            highlight(root, array);
        }
        else
        {
            var root = document.getElementById("vms").children[0];
            var array = [0,0];
            setHTMLValueTest(root, array);
        }
    }

    function createCopyDialog(selectionArray) {
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

    function createSwapDialog(selectionArray) {
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
        var children = document.getElementById("container");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(select.root(), select.root().count(), false));

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

    function enterBox()
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

    function getPathToNode(select:Selection, self) : Selection
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
            if (/placeHolder/i.test(label))
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

    function serialize(select : Selection) : string
    {
        var json = pnode.fromPNodeToJSON(currentSelection.root());
        return json;
    }

    function unserialize(string:string) : Selection
    {
        var path = list<number>();
        var newSelection = new Selection(fromJSONToPNode(string),path,0,0)
        return newSelection;
    }

    function traverseAndBuild(node:PNode, childNumber: number, evaluating:boolean) : HTMLElement
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

                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(opval);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[1]);
                WorldBox.appendChild(dropZone);
            }
            else if(node.label().getVal().length > 0)
            {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();

                WorldBox.appendChild(opval);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[1]);
                WorldBox.appendChild(dropZone);
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

            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox");
            doBox.appendChild( children[1] ) ;

            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V droppable");

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
                dropZone.setAttribute("class", "dropZone H droppable");
                noType.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                noType.appendChild( children[i] ) ;
            }

            return noType ;
        }
    }
}

export = mkHTML ;