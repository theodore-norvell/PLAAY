/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import collections = require( './collections' );
import assert = require( './assert' );

module playground
{
    import list = collections.list;
    import List = collections.List;

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

    }
}

export = playground ;