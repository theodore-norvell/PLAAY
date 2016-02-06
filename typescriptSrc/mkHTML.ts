/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
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
    import Selection = pnodeEdits.Selection;
    import TreeManager = treeManager.TreeManager;

    var undostack = [];
    var redostack = [];
    var root = pnode.mkExprSeq([]);
    var path = list;
    var tree = new TreeManager();
    var select = new Selection(root, path(0), 0 , 0);
    var currentSelection = select;

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
        }

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
        assignmentblock.setAttribute("id", "assignment");
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
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                createHTML(ui.draggable.attr("id"), this);
                tree.createNode("id");
                //$(ui.draggable).clone().appendTo($(this));
            }
        });
        //$(".droppable" ).hover(function(e) {
        //    $(this).addClass("hover");
        //}, function (e) {
        //    $(this).removeClass("hover");
        //});

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

        }
        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            drop: function (event, ui) {
                console.log($(this).attr("id"));
                createHTML(ui.draggable.attr("id"), this);
                //$(ui.draggable).clone().appendTo($(this));
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

        //select.root().

    }

    //public void visitNode(Node node) {
    //if(node.left != null) {
    //    visitNode(node.left);
    //}
    //if(node.right != null) {
    //    visitNode(node.right);
    //}
    //if(node.left == null && node.right == null) {
        //OMG! leaf!
    //}
    //}
}

export = mkHTML ;