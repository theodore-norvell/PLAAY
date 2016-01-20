/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    
    export function onLoad() : void {
        const div = document.createElement( "div" ) ;
        div.setAttribute( "class", "H" ) ;
        div["childCount"] = 3 ;
        const text = document.createTextNode( "Hello world. I am child "
                                           + div["childCount"] ) ;
        div.appendChild( text ) ;
        var body = document.getElementById( "body" ) ;
        body.appendChild( div ) ;
        
        
        const l : List<string> = list( "This", "is", "more", "text" ) ;
        l.map( ( str : string ) => {
                       const p = document.createElement( "p" ) ;
                       const t = document.createTextNode( str ) ;
                       p.appendChild( t ) ;
                       body.appendChild( p ) ; } ) ;
    }
}

export = mkHTML ;