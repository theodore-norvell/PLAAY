/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="selection.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import labels = require('./labels');
import pnode = require('./pnode');
import selection = require( './selection');

/** The treeView module looks after the conversion of trees to HTML.
 * It can also map HTML elements to paths and paths to HTML. */
module treeView 
{
    import list = collections.list;
    import List = collections.List;
    import Option = collections.Option;
    import some = collections.some;
    import none = collections.none;
    // path is an alias for list<number>
    const path : (  ...args : Array<number> ) => List<number> = list;
    import Selection = selection.Selection;
    import PNode = pnode.PNode;

    type PSelection = Selection<pnode.PLabel, pnode.PNode> ;

    export const TRUEMARK  = "\u2714" ; // HEAVY CHECK MARK
    export const FALSEMARK = "\u2718" ; // HEAVY BALLOT X
    export const WHILEMARK = "\u27F3" ; // CLOCKWISE GAPPED CIRCLE ARROW
    export const LAMBDAMARK = "\u03BB" ;
    export const NULLMARK = "\u23da" ; // EARTH GROUND
    export const OPENBOX = "\u2423" ; // VISIBLE SPACE symbol
    export const RIGHTDOUBLEQUOTATIONMARK = "\u201D" ;
    export const LEFTDOUBLEQUOTATIONMARK = "\u201C" ;

    export const BOOLEANTYPE = "\uD835\uDD39";
    export const STRINGTYPE = "\uD835\uDD4A";
    export const NUMBERTYPE = "\u211A";
    export const INTEGERTYPE = "\u2124";
    export const NATTYPE = "\u2115";
    export const TOPTYPE = "\u22A4";
    export const BOTTOMTYPE = "\u22A5";
    export const FUNCTIONTYPE = "\u2192";
    export const JOINTYPE = "\u007C";
    export const MEETTYPE = "\u0026";

    export function traverseAndBuild(node:PNode) : JQuery {
        return traverseAndBuildLocal( node, -1, 0 ) ;
    }

    export function traverseAndBuildLocal(node:PNode, childNumber: number, contextPrec : number) : JQuery
    {
        const label = node.label() ;
        const children = new Array<JQuery>() ;
        for(let i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuildLocal(node.child(i), i, label.getChildPrecedence(i) ) ) ;
        }
        const needsBorder = label.getPrecedence() < contextPrec ;
        return buildHTML(node, children, childNumber, needsBorder);
    }

    function buildHTML(node:PNode, children : Array<JQuery>, childNumber : number, needsBorder : boolean ) : JQuery
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
                result.data("help", "if") ;
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
                result.data("help", "block") ;
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
                result.data("help", "expPlaceHolder") ;
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
                result.data("help", "parameterList") ;
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
                result.data("help", "while") ;
            }
            break ;
            case labels.CallVarLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "callVar" ) ;
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
                        // TODO: It might be nice to add an extra
                        // dropzone here.
                        // Move the opElement to after the first child
                        opElement.insertAfter( children[0]) ;
                        $("<div><div/>").addClass("skinny").insertBefore(opElement) ;
                        dropzones[1].addClass("skinny") ;
                    }
                }
                result.data("help", "callVar") ;
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
                dropzones[0].addClass("skinny") ;
                result.data("help", "call") ;
            }
            break ;
            case labels.LocLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "loc" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const opDiv : JQuery = $( document.createElement("div") ) ;
                opDiv.addClass( "upright" ) ;
                opDiv.addClass( "op" );
                opDiv.text( "loc" ) ;

                result.append(opDiv);
                result.append(children[0]) ;
                result.data("help", "locExp") ;
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
                opDiv.addClass( "upright" );
                opDiv.addClass( "op" );
                opDiv.text( ":=" ) ;

                result.append(children[0]);
                result.append(opDiv);
                result.append(children[1]);
                result.data("help", "assign") ;

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
                result.data("help", "objectLiteral") ;
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
                result.data("help", "arrayLiteral") ;
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
                leftBracket.addClass( "upright" );
                leftBracket.addClass( "op" );
                leftBracket.text( "[" ) ;

                const rightBracket : JQuery = $( document.createElement("div") ) ;
                rightBracket.addClass( "upright" );
                rightBracket.addClass( "op" );
                rightBracket.text( "]" ) ;

                result.append(children[0]);
                result.append(leftBracket);
                result.append(children[1]);
                result.append(rightBracket);
                result.data("help", "accessor") ;

            }
            break ;
            case labels.DotLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "dot" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;


                result.append(children[0]);

                const suffix : JQuery = $( document.createElement("div") ) ;
                suffix.addClass( "op" );
                if( node.label().isOpen() ) {
                    suffix.text( "." ) ;
                    result.append(suffix);
                    const textElem : JQuery = makeTextInputElement( node, ["input"], collections.none<number>() ) ;
                    result.append( textElem ) ;
                } else {
                    suffix.text( "." + node.label().getVal() ) ;
                    result.append(suffix);
                }
                result.data("help", "dot") ;

            }
            break ;
            case labels.LambdaLabel.kindConst :
            {
                //  div.{lambdaBox V candrag droppable workplace}
                //      div.{lambdaHeader, V}
                //          child 0 (see ParamList)
                //          div.{lambdaResult H}
                //              child 1

                const lambdaResult = $( document.createElement("div") ) ;
                lambdaResult.addClass( "lambdaResult" ) ;
                lambdaResult.addClass( "H" ) ;
                lambdaResult.append( children[1] ) ;
                const lambdahead : JQuery = $( document.createElement("div") ) ;
                lambdahead.addClass( "lambdaHeader") ;
                lambdahead.addClass( "V") ;
                lambdahead.append( children[0] ) ;
                lambdahead.append( lambdaResult ) ;

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
                result.data("help", "lambda") ;
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
                result.data("help", "null") ;
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
                    const text = node.label().getVal().replace(/ /g, OPENBOX) ;
                    result.text( text ) ;
                }
                else
                {
                    result = makeTextInputElement( node, ["var", "H", "input", "canDrag", "droppable"], collections.some(childNumber) ) ;
                }
                result.data("help", "variable") ;
            }
            break ;
            case labels.StringLiteralLabel.kindConst :
            {

                result  = $(document.createElement("div")) ;
                result.addClass( "literal" ) ;
                result.addClass( "H" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "click" ) ;
                result.addClass( "canDrag" ) ;
                const openQuote : JQuery = $( document.createElement("span") ).text(LEFTDOUBLEQUOTATIONMARK) ;
                result.append(openQuote) ;
                if ( node.label().isOpen() )
                {
                    const textField = makeTextInputElement( node, ["input"], collections.none() ) ;
                    result.append(textField) ;
                }
                else
                {
                    const str = node.label().getVal().replace(/ /g, OPENBOX ) ;
                    const textEl = $( document.createElement("span") ).text( str ) ;
                    result.append(textEl) ;
                }
                
                const closeQuote : JQuery = $( document.createElement("span") ).text(RIGHTDOUBLEQUOTATIONMARK) ;
                result.append(closeQuote) ;
                result.data("help", "stringLiteral") ;
            }
            break ;
            case labels.NumberLiteralLabel.kindConst :
            {

                if (! node.label().isOpen() )
                {
                    result  = $(document.createElement("div")) ;
                    result.addClass( "literal" ) ;
                    result.addClass( "H" ) ;
                    result.addClass( "droppable" ) ;
                    result.addClass( "click" ) ;
                    result.addClass( "canDrag" ) ;
                    const text = node.label().getVal().replace(/ /g, OPENBOX) ;
                    result.text( text ) ;
                }
                else
                {
                    result = $( makeTextInputElement( node, ["numberLiteral", "H", "input", "canDrag", "droppable"], collections.some(childNumber) ) ) ;
                }
                result.data("help", "numberLiteral") ;
            }
            break ;
            case labels.BooleanLiteralLabel.kindConst :
            {

                result  = $(document.createElement("div")) ;
                result.addClass( "literal" ) ;
                result.addClass( "H" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "click" ) ;
                result.addClass( "canDrag" ) ;
                let mark : string ;
                let colorClass : string ;
                if( node.label().getVal() === "true" ) {
                    mark = TRUEMARK ;
                    colorClass = "greenText" ; }
                else {
                    mark = FALSEMARK ;
                    colorClass = "redText" ; }
                result.text( mark ) ;
                result.addClass( colorClass ) ;
                result.data("help", "booleanLiteral") ;
            }
            break ;
            case labels.NoTypeLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "noType" ) ; 
                result.addClass( "V" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                result.data("help", "noType") ;
            }
            break ;
            case labels.NoExprLabel.kindConst :
            {
                result  = $(document.createElement("div")) ;
                result.addClass( "noExp" ) ; // Need a better class for this, I think.
                result.addClass( "V" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                result.data("help", "noExpr") ;
            }
            break ;
            case labels.VarDeclLabel.kindConst :
            {
                const label = node.label() as labels.VarDeclLabel ;
                const isConst = label.declaresConstant() ;
                result  = $(document.createElement("div")) ;
                result.addClass( isConst ? "condecl" : "locdecl" ) ;
                result.addClass( "H" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;

                const colon : JQuery = $( document.createElement("div") );
                colon.text(":") ;
                colon.addClass("op") ;

                result.append(children[0]);
                result.append(colon);
                result.append(children[1]);
                if( node.child(2).isExprNode() ) {
                    const becomes : JQuery = $( document.createElement("div") );
                    becomes.text(":=") ;
                    becomes.addClass("op") ;
                    result.append(becomes);
                }
                result.append(children[2]);
                result.data("help", "varDecl") ;
            }
            break ;
            case labels.TupleLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "tuple" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                
                const openPar : JQuery = $( document.createElement("div") )
                                        .text("(")
                                        .addClass("op") ;
                result.append( openPar ) ;
                // Add children and drop zones.
                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, false ) ;
                    dropzones.push( dz ) ;
                    result.append(dz);
                    if (i === children.length) break;
                    result.append(children[i]);
                    if( i < children.length -1 ) {
                        const comma : JQuery = $( document.createElement("div") )
                                               .text(",")
                                               .addClass("op") ;
                        result.append( comma ) ; }
                }
                const closePar : JQuery = $( document.createElement("div") )
                                          .text(")")
                                          .addClass("op") ; ;
                openPar.addClass("op") ;
                result.append( closePar ) ; 
                result.data("help", "tuple") ;
            }
            break ;
            case labels.PrimitiveTypesLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "types" ) ;
                result.addClass( "H" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                
                const label = node.label() as labels.PrimitiveTypesLabel;
                switch(label.type) {
                    case "stringType" :
                        result.html(STRINGTYPE);
                        result.data("help", "stringType") ;
                        break;
                    case "numberType" :
                        result.html(NUMBERTYPE);
                        result.data("help", "numberType") ;
                        break;
                    case "booleanType" :
                        result.html(BOOLEANTYPE);
                        result.data("help", "booleanType") ;
                        break;
                    case "nullType" :
                        result.html(NULLMARK);
                        result.data("help", "nullType") ;
                        break;
                    case "integerType" :
                        result.html(INTEGERTYPE);
                        result.data("help", "integerType") ;
                        break;
                    case "natType" :
                        result.html(NATTYPE);
                        result.data("help", "natType") ;
                        break ;
                    case "topType" :
                        result.html(TOPTYPE);
                        result.data("help", "topType") ;
                        break;
                    case "bottomType" :
                        result.html(BOTTOMTYPE);
                        result.data("help", "bottomType") ;
                        break;
                    default :
                        result = assert.unreachable("Unknown primitive type in buildHTML.");
                }
            }
            break;
            case labels.TupleTypeLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "types" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                
                const openPar : JQuery = $( document.createElement("div") )
                                         .text("(")
                                         .addClass("op") ;
                result.append( openPar ) ;
                // Add children and drop zones.
                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, false ) ;
                    dropzones.push( dz ) ;
                    result.append(dz);
                    if (i === children.length) break;
                    result.append(children[i]);
                    if( i < children.length -1 ) {
                        const comma : JQuery = $( document.createElement("div") )
                                               .text(",")
                                               .addClass("op") ;
                        result.append( comma ) ; }
                }
                const closePar : JQuery = $( document.createElement("div") )
                                          .text(")")
                                          .addClass("op") ;
                result.append( closePar ) ; 
                result.data("help", "tupleType") ;
            }
            break;
            case labels.FunctionTypeLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "typesBorder" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const arrow : JQuery = $( document.createElement("div") )
                                       .text(FUNCTIONTYPE)
                                       .addClass("op") ;
                result.append(children[0]);
                result.append(arrow);
                result.append(children[1]);
                result.data("help", "functionType") ;
                
            }
            break;
            case labels.LocationTypeLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "locationType" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append(children[0]);
                result.data("help", "locationType") ;
            }
            break;
            case labels.FieldTypeLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "types" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const colon : JQuery = $( document.createElement("div") )
                                      .text(":")
                                      .addClass("op");

                result.append(children[0]);
                result.append(colon);
                result.append(children[1]);
                result.data("help", "fieldType") ;
            }
            break;
            case labels.JoinTypeLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "typesBorder" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, false ) ;
                    dropzones.push( dz ) ;
                    result.append(dz);
                    if (i === children.length) break;
                    result.append(children[i]);
                    if( i < children.length -1 ) {
                        const pipe : JQuery = $( document.createElement("div") )
                                              .text(JOINTYPE)
                                              .addClass("op") ;
                        result.append( pipe ) ; }
                }
                result.data("help", "joinType") ;
            }
            break;
            case labels.MeetTypeLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "typesBorder" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                for (let i = 0; true; ++i) {
                    const dz = makeDropZone(i, false ) ;
                    dropzones.push( dz ) ;
                    result.append(dz);
                    if (i === children.length) break;
                    result.append(children[i]);
                    if( i < children.length -1 ) {
                        const amp : JQuery = $( document.createElement("div") )
                                             .text(MEETTYPE)
                                             .addClass("op") ;
                        result.append( amp ) ; }
                }
                result.data("help", "meetType") ;
            }
            break;
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
        result.addClass( "codeBox" ) ;
        if( needsBorder ) result.addClass("bordered") ;
        return result ;
    }

    export function  highlightSelection( sel : PSelection, jq : JQuery ) : void {
        assert.check( jq.attr( "data-childNumber" ) === "-1" ) ;
        localHighlightSelection( sel.root(), sel.path(), sel.start(), sel.end(), jq ) ;
    }

    function  localHighlightSelection( pn : PNode, thePath : List<number>, start : number, end : number, jq : JQuery ) : void {
        if( thePath.isEmpty() ) {
            if( start === end ) {
                const zones : Array<JQuery> = jq.data( "dropzones" ) as Array<JQuery> ;
                assert.check( zones !== null ) ;
                const dz : JQuery|null = start < zones.length ? zones[start] : null ;
                if( dz !== null ) dz.addClass( "selected" ) ;
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

    export function findHelpString( sel : PSelection, jq : JQuery ) : string {
        assert.check( jq.attr( "data-childNumber" ) === "-1" ) ;
        const element = findHTMLForPath( sel.root(), sel.path(), sel.start(), sel.end(), jq ) ;
        return helpStringForElement( element ) ;
    }
    
    function  findHTMLForPath( pn : PNode, thePath : List<number>, start : number, end : number, jq : JQuery ) : JQuery {
        if( thePath.isEmpty() ) {
            if( start === end ) {
                const zones : Array<JQuery> = jq.data( "dropzones" ) as Array<JQuery> ;
                assert.check( zones !== null ) ;
                const dz : JQuery|null = start < zones.length ? zones[start] : null ;
                if( dz === null ) return jq ;
                else return dz ;
            } else {
                const children : Array<JQuery> = jq.data( "children" ) as Array<JQuery> ;
                assert.check( children !== null ) ;
                return children[ start ] ;
            }
        } else {
            const i = thePath.first() ;
            const children : Array<JQuery> = jq.data( "children" ) as Array<JQuery> ;
            assert.check( children !== null ) ;
            assert.check( i < children.length ) ;
            return findHTMLForPath( pn.child(i), thePath.rest(), start, end, children[i] ) ;
        }
    }

    function helpStringForElement( jq : JQuery ) {
        while( true ) {
            const helpString = jq.data( "help" ) ;
            if( helpString ) return helpString ;
            jq = jq.parent() ; }
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
        const str = node.label().getVal() ;
        const element : JQuery = $(document.createElement("input"));
        for( let i=0 ; i < classes.length ; ++i ) {
            element.addClass( classes[i] ) ; }
        childNumber.map( n => element.attr("data-childNumber", n.toString() ) ) ;
        element.attr("type", "text");
        element.attr("value", str) ;
        // Give the element focus and move the caret to the end of the text.
        const len = str.length ;
        setSelection(element, len, len) ;
        return element ;
    }

    function setSelection( element : JQuery, start : number, end : number ) : void {
        // Precondition: element should contain one input element of type text
        // Code based on https://www.sitepoint.com/6-jquery-cursor-functions/
        const input = element[0] ;
        input.focus() ;
        if( typeof( input["setSelectionRange"] ) !== "undefined" ) {
            input["setSelectionRange"]( start, end ) ;
        }
    }

    export function getPathToNode(root : PNode, self : JQuery ) : Option<PSelection>
    {
        let anchor : number ;
        let focus : number ;
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
            return none<PSelection>() ;
        }
        if( childNumber === -1 ) {
            return none<PSelection>() ;
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
        return some( new Selection(root, thePath, anchor, focus) ) ;
    }

    export function stringIsInfixOperator( str : string ) : boolean {
        return str.match( /^(([+/!@<>#$%&*_+=?;:~&]|\-|\^|\\)+|[`].*|and|or|implies)$/ ) !== null ;
    }  
}

export = treeView;
