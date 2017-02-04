/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import collections = require( './collections' );
import pnode = require('./pnode');
import pnodeEdits = require('./pnodeEdits');

module sharedMkHtml {
    import list = collections.list;
    import List = collections.List;
    import Selection = pnodeEdits.Selection;
	
    export var currentSelection;
    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var select = new pnodeEdits.Selection(root,path(),0,0);
    currentSelection = select;
}

export = sharedMkHtml;
