/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

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

        //create elements
        //can't move div's yet so we will use images as a placeholder
        const ifblock = document.createElement("div");
        ifblock.setAttribute("id","if");
        ifblock.setAttribute("class","ifBox V");
        ifblock.setAttribute("draggable","true");
        ifblock.setAttribute("ondragstart","drag(event)");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);

        const whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "whileBox V");
        whileblock.setAttribute("draggable", "true");
        whileblock.setAttribute("ondragstart", "drag(event)");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);

        const varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "varBox V");
        varblock.setAttribute("draggable", "true");
        varblock.setAttribute("ondragstart", "drag(event)");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);

        const forblock = document.createElement("div");
        forblock.setAttribute("id", "for");
        forblock.setAttribute("class", "forBox V");
        forblock.setAttribute("draggable", "true");
        forblock.setAttribute("ondragstart", "drag(event)");
        forblock.textContent = "For";
        document.getElementById("sidebar").appendChild(forblock);

        const thisblock = document.createElement("div");
        thisblock.setAttribute("id", "this");
        thisblock.setAttribute("class", "thisBox V");
        thisblock.setAttribute("draggable", "true");
        thisblock.setAttribute("ondragstart", "drag(event)");
        thisblock.textContent = "This";
        document.getElementById("sidebar").appendChild(thisblock);

        const trueblock = document.createElement("div");
        trueblock.setAttribute("id", "true");
        trueblock.setAttribute("class", "trueBox V");
        trueblock.setAttribute("draggable", "true");
        trueblock.setAttribute("ondragstart", "drag(event)");
        trueblock.textContent = "True";
        document.getElementById("sidebar").appendChild(trueblock);

        const falseblock = document.createElement("div");
        falseblock.setAttribute("id", "false");
        falseblock.setAttribute("class", "falseBox V");
        falseblock.setAttribute("draggable", "true");
        falseblock.setAttribute("ondragstart", "drag(event)");
        falseblock.textContent = "False";
        document.getElementById("sidebar").appendChild(falseblock);

        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "nullBox V");
        nullblock.setAttribute("draggable", "true");
        nullblock.setAttribute("ondragstart", "drag(event)");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assignment");
        assignmentblock.setAttribute("class", "assignmentBox V");
        assignmentblock.setAttribute("draggable", "true");
        assignmentblock.setAttribute("ondragstart", "drag(event)");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
        container.setAttribute("ondrop", "drop(event)");
        container.setAttribute("ondragover","allowDrop(event)");
        document.getElementById("body").appendChild(container);

        //creates empty dropzone
        const div = document.createElement("div") ;
        div.setAttribute("class", "dropZone H") ;
        div.setAttribute("ondrop", "drop(event)");
        div.setAttribute("ondragover","allowDrop(event)");
        div["childCount"] = 0 ;
        document.getElementById("container").appendChild( div ) ;
    }

    export function allowDrop(ev) {
        ev.preventDefault();
    }

    export function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    export function drop(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(data));
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