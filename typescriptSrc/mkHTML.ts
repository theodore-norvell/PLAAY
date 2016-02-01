/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

import collections = require( './collections' );
import assert = require( './assert' );

module mkHTML {
    import list = collections.list;
    import List = collections.List;

    var undostack = [];
    var redostack = [];
    var currentSelection;

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
        //var $sidebar = $('#sidebar');
        //$sidebar.bind('scroll', function() {
        //    if($sidebar.scrollLeft() !== 0){      //May need to prevent scrolling the palette
        //        $sidebar.scrollLeft(0);
        //    }
        //});
        //create elements
        //can't move div's yet so we will use images as a placeholder
        const ifblock = document.createElement("div");
        ifblock.setAttribute("id","if");
        ifblock.setAttribute("class","ifBox V palette");
        //ifblock.setAttribute("draggable","true");
        //ifblock.setAttribute("ondragstart","drag(event)");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);


        const whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "whileBox V palette");
        whileblock.setAttribute("draggable", "true");
        whileblock.setAttribute("ondragstart", "drag(event)");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);

        const varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "varBox V palette");
        varblock.setAttribute("draggable", "true");
        varblock.setAttribute("ondragstart", "drag(event)");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);

        const forblock = document.createElement("div");
        forblock.setAttribute("id", "for");
        forblock.setAttribute("class", "forBox V palette");
        forblock.setAttribute("draggable", "true");
        forblock.setAttribute("ondragstart", "drag(event)");
        forblock.textContent = "For";
        document.getElementById("sidebar").appendChild(forblock);

        const thisblock = document.createElement("div");
        thisblock.setAttribute("id", "this");
        thisblock.setAttribute("class", "thisBox V palette");
        thisblock.setAttribute("draggable", "true");
        thisblock.setAttribute("ondragstart", "drag(event)");
        thisblock.textContent = "This";
        document.getElementById("sidebar").appendChild(thisblock);

        const trueblock = document.createElement("div");
        trueblock.setAttribute("id", "true");
        trueblock.setAttribute("class", "trueBox V palette");
        trueblock.setAttribute("draggable", "true");
        trueblock.setAttribute("ondragstart", "drag(event)");
        trueblock.textContent = "True";
        document.getElementById("sidebar").appendChild(trueblock);

        const falseblock = document.createElement("div");
        falseblock.setAttribute("id", "false");
        falseblock.setAttribute("class", "falseBox V palette");
        falseblock.setAttribute("draggable", "true");
        falseblock.setAttribute("ondragstart", "drag(event)");
        falseblock.textContent = "False";
        document.getElementById("sidebar").appendChild(falseblock);

        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "nullBox V palette");
        nullblock.setAttribute("draggable", "true");
        nullblock.setAttribute("ondragstart", "drag(event)");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assignment");
        assignmentblock.setAttribute("class", "assignmentBox V palette");
        assignmentblock.setAttribute("draggable", "true");
        assignmentblock.setAttribute("ondragstart", "drag(event)");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
        //container.setAttribute("ondrop", "drop(event)");
        //container.setAttribute("ondragover","allowDrop(event)");
        document.getElementById("body").appendChild(container);

        //creates empty dropzone <div id="dropZone" class="dropZone H droppable"></div>
        const div = document.createElement("div") ;
        div.setAttribute("id", "dropZone");
        div.setAttribute("class", "dropZone H droppable") ;
        //div.setAttribute("ondrop", "drop(event)");
        //div.setAttribute("ondragover","allowDrop(event)");
        div["childCount"] = 0 ;
        document.getElementById("container").appendChild( div ) ;

        $( ".palette" ).draggable({
            helper:"clone",
            appendTo:"body"
        });

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            drop: function (event, ui) {
                console.log($(this).attr("id"));
                createHTML(ui.draggable.attr("id"), this);
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

    }
}

export = mkHTML ;
