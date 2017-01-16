/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');

module playground
{
    import list = collections.list;
    import List = collections.List;
    import PNode = pnode.PNode;
    import Selection = pnodeEdits.Selection;
    import fromJSONToPNode = pnode.fromJSONToPNode;

    export function onLoad()
    {
        const sidebar = document.createElement("div");
        sidebar.setAttribute("id","sidebar");
        sidebar.setAttribute("class","sidebar");
        document.getElementById("body").appendChild(sidebar);

        const backbutton = document.createElement("div");
        backbutton.setAttribute("id", "stop");
        backbutton.setAttribute("class", "play");
        backbutton.setAttribute("onclick", "stop()");
        backbutton.textContent = "Back";
        document.getElementById("body").appendChild(backbutton);
        var back = document.getElementById("stop");
        back.onclick = function back()
        {
            window.location.href = "http://localhost:63342/PLAAY/typescriptSrc/test.html";
        }

        var json = localStorage.getItem("currentSelection");
        var currentSelection = unserialize(json);
    }

    function unserialize(string:string) : Selection
    {
        var path = list<number>();
        var newSelection = new Selection(fromJSONToPNode(string),path,0,0)
        return newSelection;
        //generateHTML(newSelection);
        //$("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
    }
}

export = playground ;