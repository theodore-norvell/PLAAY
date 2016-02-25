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

        const forblock = document.createElement("div");
        forblock.setAttribute("id", "for");
        forblock.setAttribute("class", "forBox V palette");
        forblock.textContent = "For";
        document.getElementById("sidebar").appendChild(forblock);

        const thisblock = document.createElement("div");
        thisblock.setAttribute("id", "this");
        thisblock.setAttribute("class", "thisBox V palette");
        thisblock.textContent = "This";
        document.getElementById("sidebar").appendChild(thisblock);

        const trueblock = document.createElement("div");
        trueblock.setAttribute("id", "true");
        trueblock.setAttribute("class", "trueBox V palette");
        trueblock.textContent = "True";
        document.getElementById("sidebar").appendChild(trueblock);

        const falseblock = document.createElement("div");
        falseblock.setAttribute("id", "false");
        falseblock.setAttribute("class", "falseBox V palette");
        falseblock.textContent = "False";
        document.getElementById("sidebar").appendChild(falseblock);

        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "nullBox V palette");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assign");
        assignmentblock.setAttribute("class", "assignmentBox V palette");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);

        //creates empty dropzone <div id="dropZone" class="dropZone H droppable"></div>
        const div = document.createElement("div") ;
        div.setAttribute("id", "dropZone");
        div.setAttribute("class", "dropZone H droppable") ;
        div["childCount"] = 0 ;
        document.getElementById("container").appendChild( div ) ;

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
                //createHTML(ui.draggable.attr("id"), this);
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
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

    export function createHTML(e, self) {
        if ('if' === e)
        {
            $(self).replaceWith('<div id="dropZone" class="dropZone H droppable"></div>' +
                '<div class="ifBox V workplace">' +
                '<div class="guardBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '<div class="thenBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '<div class="elseBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div></div>' +
                '<div id="dropZone" class="dropZone H droppable"></div>');
        }
        else if ('while' === e)
        {
            $(self).replaceWith('<div id="dropZone" class="dropZone H droppable"></div>' +
                '<div class="whileBox V workplace">' +
                '<div class="guardBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '<div class="thenBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '</div>' +
                '<div id="dropZone" class="dropZone H droppable"></div>');
        }
        else if ('var' === e)
        {
            var VarBox = document.createElement("div");
            VarBox.setAttribute("class", "hCont H" );
            //VarBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var op = document.createElement("input");
            op.setAttribute("class", "op H");
            op.setAttribute("type", "text");
            op.setAttribute("list", "oplist");
            op.setAttribute("width", "5px");

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

            //op.textContent = "=";
            var value = document.createElement("div");
            value.setAttribute("class","var H click");

            VarBox.appendChild(name);
            VarBox.appendChild(op);
            VarBox.appendChild(list);
            VarBox.appendChild(value);

            var box = document.getElementById("container").appendChild(VarBox);
        }

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui) {
                console.log($(this).attr("id"));
                //createHTML(ui.draggable.attr("id"), this);
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

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
                //createHTML(ui.draggable.attr("id"), this);
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

        $(".click").click(function(){
            $(this).replaceWith('<input type="text" class="var H input">')
        });

        $(".input").keyup(function(e){
            if(e.keyCode == 13)
            {
                alert("Enter");
                $(this).replaceWith('<div class="var H click"></div>')
            }
        });
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert:'invalid'
        });
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
            ifbox["childNumber"] = childNumber ;
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
            seqBox["childNumber"] = childNumber ;

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
            PHBox["childNumber"] = childNumber ;

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
            whileBox["childNumber"] = childNumber ;
            whileBox.setAttribute("class", "ifBox V workplace");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);

            return whileBox;
        }
        else if(label.match("var"))
        {
            var VarBox = document.createElement("div");
            VarBox.setAttribute("class", "hCont H" );
            VarBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var op = document.createElement("input");
            op.setAttribute("class", "op H");
            op.setAttribute("type", "text");
            op.setAttribute("list", "oplist");
            op.setAttribute("width", "5px");

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
            value.setAttribute("class","var H click");

            VarBox.appendChild(name);
            VarBox.appendChild(op);
            VarBox.appendChild(list);
            VarBox.appendChild(value);

            return VarBox;
        }
        else if(label.match("assign"))
        {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "hCont H" );
            AssignBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H");

            var equal = document.createElement("input");
            equal.setAttribute("class", "op H");
            equal.textContent = "=";

            var value = document.createElement("div");
            value.setAttribute("class","var H");

            AssignBox.appendChild(name);
            AssignBox.appendChild(equal);
            AssignBox.appendChild(value);

            return AssignBox;
        }
    }
}

export = mkHTML ;