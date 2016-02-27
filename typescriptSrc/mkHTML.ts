/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

import collections = require( './collections' );
import assert = require( './assert' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require('./treeManager');

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    import PNode = pnode.PNode;
    import TreeManager = treeManager.TreeManager;
    import Selection = pnodeEdits.Selection;

    var undostack = [];
    var redostack = [];
    var currentSelection;

    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var tree = new TreeManager();
    var select = new pnodeEdits.Selection(root,path(),0,0);
    var replace = 1;
    currentSelection = select;

    export function onLoad() : void
    {
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
            window.location.href = "http://localhost:63342/PLAAY/typescriptSrc/playground.html";
        };

        const trash = document.createElement("div");
        trash.setAttribute("id","trash");
        trash.setAttribute("class", "trash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);

        //creates side bar
        const sidebar = document.createElement("div");
        sidebar.setAttribute("id","sidebar");
        sidebar.setAttribute("class","sidebar");
        document.getElementById("body").appendChild(sidebar);

        const ifblock = document.createElement("div");
        ifblock.setAttribute("id","if");
        ifblock.setAttribute("class","ifBox V palette");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);


        const whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "whileBox V palette");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);

        const varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "varBox V palette");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assign");
        assignmentblock.setAttribute("class", "assignmentBox V palette");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        const thisblock = document.createElement("div");
        thisblock.setAttribute("id", "this");
        thisblock.setAttribute("class", "thisBox V palette");
        thisblock.textContent = "This";
        document.getElementById("sidebar").appendChild(thisblock);

        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "nullBox V palette");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);

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
            appendTo:"body"
        });

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

        $( ".trash").droppable({
            accept:".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            drop: function(event, ui){
                ui.draggable.remove();
            }
        });
        //$(".droppable" ).hover(function(e) {
        //    $(this).addClass("hover");
        //}, function (e) {
        //    $(this).removeClass("hover");
        //});
        $(".click").click(function(){
            $(this).replaceWith('<input type="text" width="5" class="var H input">')
        });

        $(".input").keyup(function(e){
            if(e.keyCode == 13)
            {
                alert("Enter");
                $(this).replaceWith('<div class="var H click"></div>')
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
        children.appendChild(traverseAndBuild(select.root(), select.root().count()));

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

        clickDiv();

        enterList();
    }

    function enterList()
    {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                var text = $(this).val();
                getPathToNode(currentSelection, $(this));
                $(this).replaceWith('<div class="var H click">' + text + '</div>')

                $(".click").click(function(){
                   $(this).replaceWith('<input type="text" class="op H input" list="oplist">');
                    enterList();
                });
            }
        });
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert:'invalid'
        });
    }

    function clickDiv()
    {
        $(".click").click(function(){
            $(this).replaceWith('<input type="text" class="var H input">');

            $(".input").keyup(function(e){
                if(e.keyCode == 13)
                {
                    var text = $(this).val();
                    getPathToNode(currentSelection, $(this));
                    $(this).replaceWith('<div class="var H click">' + text + '</div>')
                    clickDiv();
                }
            });
        });
    }

    function getPathToNode(select:Selection, self) : Selection
    {
        var array = [];
        var anchor;
        var focus;

        console.log(self.attr("data-childNumber"));

        var parent = $(self);
        var child = Number(parent.attr("data-childNumber"));

        if (isNaN(child))
        {
            var index = parent.index();
            parent = parent.parent();
            child = Number(parent.attr("data-childNumber"));
            if (parent.children().length === 1)
            {
                anchor = 0;
                focus = 0;
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

        if(array.length === 0)
            return new pnodeEdits.Selection(select.root(), path, 0, 0);
        else
            return new pnodeEdits.Selection(tree, path, anchor, anchor);
    }

    function traverseAndBuild(node:PNode, childNumber: number ) : HTMLElement
    {
        var children = new Array<HTMLElement>() ;
        for(var i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuild(node.child(i), i) ) ;
        }
        return buildHTML(node, children, childNumber);
    }

    function buildHTML(node:PNode, children : Array<HTMLElement>, childNumber : number) : HTMLElement
    {
        var label = node.label().toString();

        if(label.match('if'))
        {
            assert.check( children.length == 3 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "guardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var elsebox = document.createElement("div");
            elsebox.setAttribute("class", "elseBox H workplace");
            elsebox.appendChild( children[2] ) ;

            var ifbox = document.createElement("div");
            ifbox.setAttribute("data-childNumber", childNumber.toString());
            ifbox.setAttribute("class", "ifBox V workplace canDrag");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox ;
        }
        else if(label.match("seq"))
        {
            var seqBox = document.createElement("div");
            seqBox.setAttribute( "class", "seqBox V" ) ;
            seqBox.setAttribute("data-childNumber", childNumber.toString());
            //seqBox["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZone H droppable");
                seqBox.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                seqBox.appendChild( children[i] ) ;
            }

            return seqBox ;
        }
        else if(label.match("expPH"))
        {
            var PHBox = document.createElement("div");
            PHBox.setAttribute( "class", "PHBox V" ) ;
            PHBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZone H droppable");
                PHBox.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                PHBox.appendChild( children[i] ) ;
            }

            return PHBox ;
        }
        else if(label.match("while"))
        {
            assert.check( children.length == 2 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "guardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var whileBox = document.createElement("div");
            whileBox.setAttribute("data-childNumber", childNumber.toString());
            //whileBox["childNumber"] = childNumber ;
            whileBox.setAttribute("class", "ifBox V workplace canDrag");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);

            return whileBox;
        }
            //rename to world
        else if(label.match("var"))
        {
            var VarBox = document.createElement("div");
            VarBox.setAttribute("class", "hCont H canDrag" );
            VarBox.setAttribute("data-childNumber", childNumber.toString());
            //VarBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var op = document.createElement("input");
            op.setAttribute("class", "op H input");
            op.setAttribute("type", "text");
            op.setAttribute("list", "oplist");

            var list = document.createElement("datalist");
            list.setAttribute("id", "oplist");
            var optionplus = document.createElement("option");
            optionplus.value = "+";
            var optionminus = document.createElement("option");
            optionminus.value = "-";
            var optionmul = document.createElement("option");
            optionmul.value = "x";
            var optiondiv = document.createElement("option");
            optiondiv.value = "/";
            list.appendChild(optionplus);
            list.appendChild(optionminus);
            list.appendChild(optionmul);
            list.appendChild(optiondiv);

            var value = document.createElement("div");
            value.setAttribute("class","var H click ");

            VarBox.appendChild(name);
            VarBox.appendChild(op);
            VarBox.appendChild(list);
            VarBox.appendChild(value);

            return VarBox;
        }
        else if(label.match("assign"))
        {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "hCont H canDrag" );
            AssignBox.setAttribute("data-childNumber", childNumber.toString());
            //AssignBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var equal = document.createElement("div");
            equal.setAttribute("class", "op H");
            equal.textContent = "=";

            var value = document.createElement("div");
            value.setAttribute("class","var H click");

            AssignBox.appendChild(name);
            AssignBox.appendChild(equal);
            AssignBox.appendChild(value);

            return AssignBox;
        }
    }
}

export = mkHTML ;