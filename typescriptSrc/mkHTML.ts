/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;

module mkHTML {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    
    
    export function onLoad() : void {
        const div = document.createElement( "div" ) ;
        div.setAttribute( "class", "H" ) ;
        div["childCount"] = 3 ;
        const text = document.createTextNode( "Hello world. I am child "
                                           + div["childCount"] ) ;
        div.appendChild( text ) ;
        var body = document.getElementById( "body" ) ;
        body.appendChild( div ) ;
    }
}

export = mkHTML ;