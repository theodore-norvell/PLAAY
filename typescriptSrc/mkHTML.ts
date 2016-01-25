/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    
    export function onLoad() : void {
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
        document.getElementById("sidebar").appendChild(ifblock);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
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
}

export = mkHTML ;