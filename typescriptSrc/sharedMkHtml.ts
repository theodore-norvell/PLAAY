/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import labels = require('./labels');
import pnode = require('./pnode');
import pnodeEdits = require('./pnodeEdits');

/** The sharedMkHtml module looks after the conversion of trees to HTML.
 * It can also map HTML elements to paths and paths to HTML. */
module sharedMkHtml 
{
    import list = collections.list;
    import List = collections.List;
    import Option = collections.Option;
    import some = collections.some;
    import none = collections.none;
    // path is an alias for list<number>
    const path : (  ...args : Array<number> ) => List<number> = list;
    import Selection = pnodeEdits.Selection;
    import PNode = pnode.PNode;

    export function traverseAndBuild(node:PNode, childNumber: number, evaluating:boolean) : JQuery
    {
        const children = new Array<JQuery>() ;
        for(let i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuild(node.child(i), i, evaluating) ) ;
        }
        return buildHTML(node, children, childNumber, evaluating);
    }

    function buildHTML(node:PNode, children : Array<JQuery>, childNumber : number, evaluating:boolean) : JQuery
    {
        let result : JQuery ;
        const dropzones : Array<JQuery> = [] ;
        // Switch on the LabelKind
        const kind = node.label().kind() ;
        switch( kind ) {
            case labels.IfLabel.kindConst :
            {
                assert.check( children.length === 3 ) ;

                const guardbox : JQuery = $(document.createElement("div")) ;
                guardbox.addClass( "ifGuardBox" ) ;
                guardbox.addClass( "H" ) ;
                guardbox.addClass( "workplace" ) ;
                guardbox.append( children[0] ) ;

                const thenbox : JQuery = $(document.createElement("div")) ;
                thenbox.addClass( "thenBox" ) ;
                thenbox.addClass( "H" ) ;
                thenbox.addClass( "workplace" ) ;
                thenbox.append( children[1] ) ;

                const elsebox : JQuery = $(document.createElement("div")) ;
                elsebox.addClass( "elseBox" ) ;
                elsebox.addClass( "H" ) ;
                elsebox.addClass( "workplace" ) ;
                elsebox.append( children[2] ) ;

                result  = $(document.createElement("div")) ;
                result.addClass( "ifBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( guardbox, thenbox, elsebox ) ;
            }
            break ;
            case labels.ExprSeqLabel.kindConst :
            {
                // TODO show only the unevaluated members during evaluation

                result = $( document.createElement("div") ) ;
                result.addClass( "seqBox" ) ;
                result.addClass( "V" ) ;
                // Add children and drop zones.
                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, true ) ;
                    dropzones.push( dz ) ;
                    result.append(dz);
                    if (i === children.length) break;
                    result.append(children[i]);
                }
            }
            break ;
            case labels.ExprPHLabel.kindConst :
            {
                result = $( document.createElement("div") ) ;
                result.addClass( "placeHolder" ) ;
                result.addClass( "V" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                result.text("...") ;
            }
            break ;
            case labels.ParameterListLabel.kindConst :
            {
                result = $( document.createElement("div") ) ;
                result.addClass( "paramlistOuter" ) ;
                result.addClass( "H" ) ;
                result.addClass( "droppable" ) ;
                
                // Add children and dropZones.
                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, false) ;
                    dropzones.push( dz ) ;
                    result.append(dz);
                    if (i === children.length) break;
                    result.append(children[i]);
                }
            }
            break ;
            case labels.WhileLabel.kindConst :
            {
                assert.check( children.length === 2 ) ;

                const guardBox : JQuery = $( document.createElement("div") ) ;
                guardBox.addClass( "whileGuardBox") ;
                guardBox.addClass( "H") ;
                guardBox.addClass( "workplace") ;
                guardBox.append( children[0] ) ;

                const doBox : JQuery = $( document.createElement("div") ) ;
                doBox.addClass( "doBox") ;
                doBox.addClass( "H") ;
                doBox.addClass( "workplace") ;
                doBox.append( children[1] ) ;

                result  = $(document.createElement("div")) ;
                result.addClass( "whileBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( guardBox );
                result.append( doBox );
            }
            break ;
            case labels.CallWorldLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "callWorld" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                result.attr("type", "text");
                result.attr("list", "oplist");
                
                let opElement : JQuery ;
                if(! node.label().isOpen() )
                {
                    opElement = $(document.createElement("div") ) ;
                    opElement.addClass( "op" ) ;
                    opElement.addClass( "H" ) ;
                    opElement.addClass( "click" ) ;
                    opElement.text( node.label().getVal() ) ;
                }
                else {
                    opElement = makeTextInputElement( node, ["op", "H", "input"], collections.none<number>() ) ;
                }
                result.append(opElement);
                for( let i=0 ; true ; ++i) {
                    const dz : JQuery = makeDropZone(i, false) ;
                    dropzones.push( dz ) ;
                    result.append( dz ) ;
                    if( i === children.length ) break ;
                    result.append( children[i] ) ;
                }
                // Binary infix operators
                if( ! node.label().isOpen() && children.length === 2 )
                {
                    const labelString = node.label().getVal() ;
                    if( stringIsInfixOperator( labelString ) ) {
                        // 2 children means the result has [ opElement dz[0] children[0] dz[1] children[1] dz[2] ]
                        assert.check( result.children().length === 6 ) ;
                        // Move the opElement to after the first child
                        opElement.insertAfter( children[0]) ;
                        // TODO: Find a way to make dropzone[1] very skinny. Maybe by adding a class to it.
                    }
                }
            }
            break ;
            case labels.CallLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "call" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                result.attr("type", "text");

                for( let i=0 ; true ; ++i) {
                    const dz : JQuery = makeDropZone(i, false) ;
                    dropzones.push( dz ) ;
                    result.append( dz ) ;
                    if( i === children.length ) break ;
                    result.append( children[i] ) ;
                }
            }
            break ;
            case labels.AssignLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "assign" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const opDiv : JQuery = $( document.createElement("div") ) ;
                opDiv.addClass( "op" );
                opDiv.text( ":=" ) ;

                result.append(children[0]);
                result.append(opDiv);
                result.append(children[1]);

            }
            break ;
            case labels.ObjectLiteralLabel.kindConst :
            {
                const guardBox : JQuery = $( document.createElement("div") ) ;
                guardBox.addClass( "objectGuardBox") ;
                guardBox.addClass( "H") ;
                guardBox.addClass( "workplace") ;

                const seqBox : JQuery = $( document.createElement("div") ) ;
                seqBox.addClass( "seqBox" ) ;
                seqBox.addClass( "V" ) ;
                seqBox.addClass( "workplace") ;
                // Add children and drop zones.
                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, true ) ;
                    dropzones.push( dz ) ;
                    seqBox.append(dz);
                    if (i === children.length) break;
                    seqBox.append(children[i]);
                }

                result  = $(document.createElement("div")) ;
                result.addClass( "objectBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( guardBox );
                result.append( seqBox );
            }
            break ;
            case labels.ArrayLiteralLabel.kindConst :
            {
                const guardBox : JQuery = $( document.createElement("div") ) ;
                guardBox.addClass( "arrayGuardBox") ;
                guardBox.addClass( "H") ;
                guardBox.addClass( "workplace") ;

                const seqBox : JQuery = $( document.createElement("div") ) ;
                seqBox.addClass( "seqBox" ) ;
                seqBox.addClass( "V" ) ;
                seqBox.addClass( "workplace") ;
                // Add children and drop zones.
                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, true ) ;
                    dropzones.push( dz ) ;
                    seqBox.append(dz);
                    if (i === children.length) break;
                    seqBox.append(children[i]);
                }

                result  = $(document.createElement("div")) ;
                result.addClass( "arrayBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( guardBox );
                result.append( seqBox );
            }
            break ;
            case labels.AccessorLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "accessor" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const leftBracket : JQuery = $( document.createElement("div") ) ;
                leftBracket.addClass( "op" );
                leftBracket.text( "[" ) ;

                const rightBracket : JQuery = $( document.createElement("div") ) ;
                rightBracket.addClass( "op" );
                rightBracket.text( "]" ) ;

                result.append(children[0]);
                result.append(leftBracket);
                result.append(children[1]);
                result.append(rightBracket);

            }
            break ;
            case labels.DotLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "dot" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const suffix : JQuery = $( document.createElement("div") ) ;
                suffix.addClass( "op" );
                suffix.text( "." + node.label().getVal() ) ;

                result.append(children[0]);
                result.append(suffix);

            }
            break ;
            case labels.LambdaLabel.kindConst :
            {
                const lambdahead : JQuery = $( document.createElement("div") ) ;
                lambdahead.addClass( "lambdaHeader") ;
                lambdahead.addClass( "V") ;
                lambdahead.append( children[0] ) ;
                lambdahead.append( children[1] ) ;

                const doBox : JQuery = $( document.createElement("div") ) ;
                doBox.addClass( "doBox") ;
                doBox.addClass( "H") ;
                doBox.append( children[2] ) ;

                result  = $(document.createElement("div")) ;
                result.addClass( "lambdaBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( lambdahead ) ;
                result.append( doBox ) ;
            }
            break ;
            case labels.NullLiteralLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "nullLiteral" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.html( "&#x23da;" ) ;  // The Ground symbol. I hope.
            }
            break ;
            case labels.VariableLabel.kindConst :
            {
                if( ! node.label().isOpen() ) 
                {
                    result  = $(document.createElement("div")) ;
                    result.addClass( "var" ) ;
                    result.addClass( "H" ) ;
                    result.addClass( "droppable" ) ;
                    result.addClass( "click" ) ;
                    result.addClass( "canDrag" ) ;
                    result.text( node.label().getVal() ) ;
                }
                else
                {
                    result = makeTextInputElement( node, ["var", "H", "input", "canDrag", "droppable"], collections.some(childNumber) ) ;
                }
            }
            break ;
            case labels.StringLiteralLabel.kindConst :
            {

                if (! node.label().isOpen() )
                {
                    result  = $(document.createElement("div")) ;
                    result.addClass( "stringLiteral" ) ;
                    result.addClass( "H" ) ;
                    result.addClass( "droppable" ) ;
                    result.addClass( "click" ) ;
                    result.addClass( "canDrag" ) ;
                    result.text( node.label().getVal() ) ;
                }
                else
                {
                    result = $( makeTextInputElement( node, ["stringLiteral", "H", "input", "canDrag", "droppable"], collections.some(childNumber) ) ) ;
                }
            }
            break ;
            case labels.NumberLiteralLabel.kindConst :
            {

                if (! node.label().isOpen() )
                {
                    result  = $(document.createElement("div")) ;
                    result.addClass( "numberLiteral" ) ;
                    result.addClass( "H" ) ;
                    result.addClass( "droppable" ) ;
                    result.addClass( "click" ) ;
                    result.addClass( "canDrag" ) ;
                    result.text( node.label().getVal() ) ;
                }
                else
                {
                    result = $( makeTextInputElement( node, ["numberLiteral", "H", "input", "canDrag", "droppable"], collections.some(childNumber) ) ) ;
                }
            }
            break ;
            case labels.NoTypeLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "noType" ) ; 
                result.addClass( "V" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
            }
            break ;
            case labels.NoExprLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "expOp" ) ; // Need a better class for this, I think.
                result.addClass( "V" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
            }
            break ;
            case labels.VarDeclLabel.kindConst :
            {

                result  = $(document.createElement("div")) ;
                result.addClass( "vardecl" ) ; // Need a better class for this, I think.
                result.addClass( "H" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;

                const colon : JQuery = $( document.createElement("div") );
                colon.text(":") ;

                const becomes : JQuery = $( document.createElement("div") );
                becomes.text(":=") ;

                result.append(children[0]);
                result.append(colon);
                result.append(children[1]);
                result.append(becomes);
                result.append(children[2]);
            }
            break ;
            default:
            {
                result = assert.unreachable( "Unknown label in buildHTML.") ;
            }
        }
        // Give the result a number. // TODO Use data instead of attr.
        result.attr( "data-childNumber", childNumber.toString() ) ; 
        // Attach the JQueries representing the children elements to the root element representing this node.
        result.data("children", children ) ;
        // Attach the JQueries representing the dropzones to the root element representing this node.
        // Note these may not be present in which case they are nulls in the array or the array is short.
        result.data("dropzones", dropzones ) ;
        // Make it selectable by a click
        result.addClass( "selectable" ) ;
        return result ;
    }

    export function  highlightSelection( sel : Selection, jq : JQuery ) : void {
        assert.check( jq.attr( "data-childNumber" ) === "-1" ) ;
        localHighlightSelection( sel.root(), sel.path(), sel.start(), sel.end(), jq ) ;
    }

    function  localHighlightSelection( pn : PNode, thePath : List<number>, start : number, end : number, jq : JQuery ) : void {
        if( thePath.isEmpty() ) {
            if( start === end ) {
                const zones : Array<JQuery> = jq.data( "dropzones" ) as Array<JQuery> ;
                assert.check( zones !== null ) ;
                const dz : JQuery|null = start < zones.length ? zones[start] : null ;
                if( dz!== null ) dz.addClass( "selected" ) ;
            } else {
                const children : Array<JQuery> = jq.data( "children" ) as Array<JQuery> ;
                assert.check( children !== null ) ;
                for( let i = start ; i < end ; ++i ) {
                    children[i].addClass( "selected" ) ;
                }
            }
        } else {
            const i = thePath.first() ;
            const children : Array<JQuery> = jq.data( "children" ) as Array<JQuery> ;
            assert.check( children !== null ) ;
            assert.check( i < children.length ) ;
            localHighlightSelection( pn.child(i), thePath.rest(), start, end, children[i] ) ;
        }
    }

    function makeDropZone( childNumber : number, large : boolean ) : JQuery {
        const dropZone : JQuery = $( document.createElement("div") ) ;
        dropZone.addClass( large ? "dropZone" : "dropZoneSmall" ) ;
        dropZone.addClass( "H" ) ;
        dropZone.addClass( "droppable" ) ;
        // Make it selectable by a click
        dropZone.addClass( "selectable" ) ;
        dropZone.attr("data-isDropZone", "yes");
        dropZone.attr("data-childNumber", childNumber.toString());
        return dropZone ;
    }

    function makeTextInputElement( node : PNode, classes : Array<string>, childNumber : collections.Option<number> ) : JQuery {
            let text = node.label().getVal() ;
            text = text.replace( /&/g, "&amp;" ) ;
            text = text.replace( /"/g, "&quot;") ;

            const element : JQuery = $(document.createElement("input"));
            for( let i=0 ; i < classes.length ; ++i ) {
                element.addClass( classes[i] ) ; }
            childNumber.map( n => element.attr("data-childNumber", n.toString() ) ) ;
            element.attr("type", "text");
            element.attr("value", text) ;
            // Give the element focus and move the caret to the end of the text.
            const len = text.length ;
            setSelection(element, len, len) ;
            return element ;
    }

    function setSelection( element : JQuery, start : number, end : number ) : void {
        // Precondition: element should contain one input element of type text
        // Code based on https://www.sitepoint.com/6-jquery-cursor-functions/
        const input = element[0] ;
        input.focus() ;
        if( input["setSelectionRange"] !== "undefined" ) {
            input["setSelectionRange"]( start, end ) ;
        }
    }

    export function getPathToNode(root : PNode, self : JQuery ) : Option<Selection>
    {
        let anchor;
        let focus;
        //console.log( ">> getPathToNode" ) ;
        let jq : JQuery= $(self);
        let childNumber : number = Number(jq.attr("data-childNumber"));
        // Climb the tree until we reach a node with a data-childNumber attribute.
        while( jq.length > 0 && isNaN( childNumber ) ) {
            //console.log( "   going up jq is " + jq.prop('outerHTML')() ) ;
            //console.log( "Length is " + jq.length ) ;
            //console.log( "childNumber is " + childNumber ) ;
            jq = jq.parent() ;
            childNumber = Number(jq.attr("data-childNumber"));
        }
        if( jq.length === 0 ) {
            return none<Selection>() ;
        }
        if( childNumber === -1 ) {
            return none<Selection>() ;
        }
        // childNumber is a number.  Is this a dropzone or not?
        const isDropZone = jq.attr("data-isDropZone" ) ;
        if( isDropZone === "yes" ) {
            //console.log( "   it's a dropzone with number " +  childNumber) ;
            anchor = focus = childNumber ;
        } else {
            //console.log( "   it's a node with number " +  childNumber) ;
            anchor = childNumber ;
            focus = anchor+1 ;
        }
        // Go up one level
        jq = jq.parent() ;
        childNumber = Number(jq.attr("data-childNumber"));


        // Climb the tree until we reach a node with a data-childNumber attribute of -1.
        const array : Array<number> = [];
        while (jq.length > 0 && childNumber !== -1 ) {
            if (!isNaN(childNumber))
            {
                array.push( childNumber );
                //console.log( "   pushing " +  childNumber) ;
            }
            // Go up one level
            jq = jq.parent() ;
            childNumber = Number(jq.attr("data-childNumber"));
        }
        assert.check( jq.length !== 0, "Hit the top!" ) ; // Really should not happen. If it does, there was no -1 and we hit the document.
        // Now make a path out of the array.
        let thePath = list<number>();
        for( let i = 0 ; i < array.length ; i++ ) {
            thePath = collections.cons( array[i], thePath ) ; }
        
        // If making the selection fails, then the root passed in was not the root
        // used to make the HTML.
        return some( new pnodeEdits.Selection(root, thePath, anchor, focus) ) ;
    }

    export function stringIsInfixOperator( str : string ) : boolean {
        return str.match( /^([+/!@<>#$%&*_+=?;:~&]|\-|\^|\\)+$|^[`].*$/ ) !== null ;
    }  
}

export = sharedMkHtml;
