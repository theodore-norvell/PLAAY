/// <reference path="jquery.d.ts" />

/// <reference path="assert.ts" />

import assert = require('./assert');

/** Make it easy to make HTML nodes.*/

module htmlMaker {
    
	export type ElementDesc = { tag: string ;
		id? : string ;
		class? : string ;
		attr? : { [key:string] : string ; } ;
		children? : Array<HTMLDesc> ;
	} ;
	export type HTMLDesc = String | ElementDesc | JQuery | Element | Text ;

	export function makeHTML( desc : HTMLDesc, parent : JQuery|null = null ) : JQuery {
		let result : JQuery ;
		if( typeof(desc) === "string" ) {
			result = $(document.createTextNode( desc as string )) ;
		} else if( desc instanceof jQuery ) {
			return desc as JQuery ;
		} else if( desc["nodeType"] === Node.TEXT_NODE  ) {
			return $(desc) ;
		} else if( desc["nodeType"] === Node.ELEMENT_NODE ) {
			return $(desc) ;
		} else {
			const elDesc : ElementDesc  = desc as ElementDesc ;
			assert.check( elDesc.tag !== undefined ) ;
			result = $(document.createElement( elDesc.tag ) ) ;
			if( elDesc.id !== undefined ) 
				result.attr("id", elDesc.id ) ;
			if( elDesc.class !== undefined ) 
				result.addClass( elDesc.class ) ;
			if( elDesc.attr !== undefined ) 
				for( var prop in elDesc.attr )
					result.attr( prop, elDesc.attr[prop] ) ;
			if( elDesc.children !== undefined ) 
				elDesc.children.forEach( child =>
					makeHTML( child, result ).appendTo(result) ) ;
		}
		if( parent !== null ) result.appendTo( parent ) ;
		return result ;
	}
}

export = htmlMaker;