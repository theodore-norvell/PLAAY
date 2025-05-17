/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="parsers.ts" />
/// <reference path="pnode.ts" />
/// <reference path="selection.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import labels = require('./labels');
import parsers = require( './parsers' ) ;
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

    export const MAPSTOMARK = "\u21a6" ; // Rightwards arrow from bar: ↦
    export const STOREMARK = "\u21a2" ; // Leftwards arrow with tail: ↢
    export const TRUEMARK  = "\u2714" ; // HEAVY CHECK MARK
    export const FALSEMARK = "\u2718" ; // HEAVY BALLOT X
    export const WHILEMARK = "\u27F3" ; // CLOCKWISE GAPPED CIRCLE ARROW
    export const LAMBDAMARK = "\u03BB" ;
    export const NULLMARK = "\u23da" ; // EARTH GROUND
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

    function traverseAndBuildLocal(node:PNode, childNumber: number, contextPrec : number) : JQuery
    {
        const label = node.label() ;
        const children = new Array<JQuery>() ;
        for(let i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuildLocal( node.child(i), i, label.getChildPrecedence(i) ) ) ;
        }
        const needsBorder = label.getPrecedence() < contextPrec ;
        return buildHTML(node, children, childNumber, needsBorder);
    }

    let compactMode : boolean = true ;

    function buildHTML(node:PNode, children : Array<JQuery>, childNumber : number, needsBorder : boolean ) : JQuery
    {
        let result : JQuery ;
        // dropZones usually contains 1 entry for each child + 1.
        // If it is shorter, nulls can be assumed.
        // Null means there is no drop zone for this place in the tree.
        const dropZones : Array<JQuery|null> = [] ;
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
                result.attr( "data-tooltip", "If expression") ;
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
                result.attr( "data-tooltip", "While expression") ;
            }
            break ;
            case labels.ExprSeqLabel.kindConst :
            {
                result = $( document.createElement("div") ) ;
                result.addClass( "seqBox" ).addClass( "V" ) ;
                // Add children and drop zones.
                layOutVerticalSequence( result, children, dropZones,
                                        "Drop zone for expression or declaration" ) ;
                result.data("help", "block") ;
            }
            break ;
            case labels.ExprPHLabel.kindConst :
            {
                result = $( document.createElement("div") ) ;
                result.addClass( "placeHolder" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                result.text("...") ;
                result.data("help", "expPlaceHolder") ;
                result.attr( "data-tooltip", "Expression place holder") ;
            }
            break ;
            case labels.TypePHLabel.kindConst :
            {
                result = $( document.createElement("div") ) ;
                result.addClass( "placeHolder" ) ;
                result.addClass( "typeItem" ) ;
                result.addClass( "typesBorder" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                result.text("...") ;
                result.data("help", "typePlaceHolder") ;
                result.attr( "data-tooltip", "Type place holder") ;
            }
            break ;
            case labels.ParameterListLabel.kindConst :
            {
                result = $( document.createElement("div") ) ;
                result.addClass( "seqBox" ).addClass( "V" ) ;
                // Add children and drop zones.
                layOutVerticalSequence( result, children, dropZones,
                    "Drop zone for parameter declaration" ) ;
                result.data("help", "parameterList") ;
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
                
                const name = parsers.unparseString(node.label().getString(), true) ;
                let opElement : JQuery ;
                if(! node.label().isOpen() )
                {
                    opElement = $(document.createElement("div") ) ;
                    opElement.addClass( "op" ) ;
                    opElement.addClass( "H" ) ;
                    opElement.addClass( "click" ) ;
                    opElement.text( name ) ;
                }
                else {
                    opElement = makeTextInputElement( node, ["op", "H", "input"], collections.none<number>() ) ;
                }
                result.append(opElement);
                for( let i=0 ; true ; ++i) {
                    const {dz: dz, cont: dzContainer}
                    = makeDropZone(i, false,  "Drop zone for argument") ;
                    dropZones.push( dz ) ;
                    result.append( dzContainer ) ;
                    if( i === children.length ) break ;
                    result.append( children[i] ) ;
                }
                // Binary infix operators
                if( ! node.label().isOpen() && children.length === 2 )
                {
                    const labelString = node.label().getString() ;
                    if( stringIsInfixOperator( labelString ) ) {
                        // 2 children means the result has [ opElement dz[0] children[0] dz[1] children[1] dz[2] ]
                        assert.check( result.children().length === 6 ) ;
                        // TODO: It might be nice to add an extra
                        // dropzone here.
                        // Move the opElement to after the first child
                        opElement.insertAfter( children[0]) ;
                        $("<div><div/>").addClass("skinny").insertBefore(opElement) ;
                    }
                }
                result.attr( "data-tooltip", "Call '"+name+"' expression") ;
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
                    if( node.hasDropZonesAt(i) ) {
                        const {dz: dz, cont: dzContainer}
                         = makeDropZone(i, false, "Drop zone for argument" ) ;
                        dropZones.push( dz ) ;
                        result.append( dzContainer ) ; }
                    else
                        dropZones.push( null ) ;
                    if( i === children.length ) break ;
                    result.append( children[i] ) ;
                }
                result.attr( "data-tooltip", "Call expression") ;
                result.data("help", "call") ;
                if( children.length === 1 ) needsBorder = true ;
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
                result.attr( "data-tooltip", "Location expression") ;
                result.data("help", "locExp") ;
            }
            break ;
            case labels.StoreLabel.kindConst :
            {
                result = $(document.createElement("div")) ;
                result.addClass( "store" ) ;
                result.addClass( "H" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;

                const opDiv : JQuery = $( document.createElement("div") ) ;
                opDiv.addClass( "upright" );
                opDiv.addClass( "op" );
                opDiv.text( STOREMARK ) ;

                result.append(children[0]);
                result.append(opDiv);
                result.append(children[1]);
                result.data("help", "store") ;
                result.attr( "data-tooltip", "Store expression") ;

            }
            break ;
            case labels.ObjectLiteralLabel.kindConst :
            {
                const guardBox : JQuery = $( document.createElement("div") ) ;
                guardBox.addClass( "objectGuardBox") ;
                guardBox.addClass( "H") ;
                guardBox.addClass( "workplace") ;

                const seqBox : JQuery = $( document.createElement("div") ) ;
                seqBox.addClass( "seqBox" ).addClass( "V" ) ;
                // Add children and drop zones.
                layOutVerticalSequence( seqBox, children, dropZones,
                    "Drop zone for expression or declaration" ) ;

                result  = $(document.createElement("div")) ;
                result.addClass( "objectBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( guardBox );
                result.append( seqBox );
                result.attr( "data-tooltip", "Object expression") ;
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
                seqBox.addClass( "seqBox" ).addClass( "V" ) ;
                // Add children and drop zones.
                layOutVerticalSequence( seqBox, children, dropZones,
                    "Drop zone for expression" ) ;

                result  = $(document.createElement("div")) ;
                result.addClass( "arrayBox" ) ;
                result.addClass( "V" ) ;
                result.addClass( "workplace" ) ;
                result.addClass( "canDrag" ) ;
                result.addClass( "droppable" ) ;
                result.append( guardBox );
                result.append( seqBox );
                result.attr( "data-tooltip", "Array expression") ;
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
                    suffix.text( "." + node.label().getString() ) ;
                    result.append(suffix);
                }
                result.attr( "data-tooltip", "Field selection expression") ;
                result.data("help", "dotExpression") ;

            }
            break ;
            case labels.LambdaLabel.kindConst :
            {
                //  div.{lambdaBox V candrag droppable workplace}
                //      div.{lambdaHeader, V}
                //          div.{parameterList H}
                //              child 0 (see ParamList)
                //          div.{lambdaResult H}
                //              child 1
                //      div.{doBox, H}
                //          child 2

                const parameterList = $( document.createElement("div") ) ;
                parameterList.addClass( "parameterList" ) ;
                parameterList.addClass( "H" ) ;
                parameterList.append( children[0] ) ;

                const lambdaResult = $( document.createElement("div") ) ;
                lambdaResult.addClass( "lambdaResult" ) ;
                lambdaResult.addClass( "H" ) ;
                lambdaResult.append( children[1] ) ;

                const lambdaHeader : JQuery = $( document.createElement("div") ) ;
                lambdaHeader.addClass( "lambdaHeader") ;
                lambdaHeader.addClass( "V") ;
                lambdaHeader.append( parameterList ) ;
                lambdaHeader.append( lambdaResult ) ;

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
                result.append( lambdaHeader ) ;
                result.append( doBox ) ;
                result.attr( "data-tooltip", "Function expression") ;
                result.data("help", "lambdaExpression") ;
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
                result.attr( "data-tooltip", "Null value") ;
                result.data("help", "nullExpression") ;
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
                    const name = parsers.unparseString(node.label().getString(), true) ;
                    result.text( name ) ;
                }
                else
                {
                    result = makeTextInputElement( node, ["var", "H", "input"], collections.some(childNumber) ) ;
                }
                result.attr( "data-tooltip", "Variable") ;
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
                const openQuote : JQuery = $( document.createElement("span") )
                                           .addClass( "quote" ) 
                                           .text(LEFTDOUBLEQUOTATIONMARK) ;
                result.append(openQuote) ;
                if ( node.label().isOpen() )
                {
                    const textField = makeTextInputElement( node, ["input"], collections.none() ) ;
                    result.append(textField) ;
                }
                else
                {
                    const str = parsers.unparseString( node.label().getString(), true ) ;
                    const textEl = $( document.createElement("span") ).text( str ) ;
                    result.append(textEl) ;
                }
                
                const closeQuote : JQuery = $( document.createElement("span") )
                                            .addClass( "quote" ) 
                                            .text(RIGHTDOUBLEQUOTATIONMARK) ;
                result.append(closeQuote) ;
                result.attr( "data-tooltip", "String value") ;
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
                    const text = parsers.unparseString( node.label().getString(), false ) ;
                    result.text( text ) ;
                }
                else
                {
                    result = $( makeTextInputElement(
                                   node,
                                   ["numberLiteral", "H", "input", "canDrag", "droppable"],
                                   collections.some(childNumber) ) ) ;
                }
                result.attr( "data-tooltip", "Numeric value") ;
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
                if( node.label().getString() === "true" ) {
                    mark = TRUEMARK ;
                    colorClass = "greenText" ; }
                else {
                    mark = FALSEMARK ;
                    colorClass = "redText" ; }
                result.text( mark ) ;
                result.addClass( colorClass ) ;
                result.attr( "data-tooltip", "Boolean value") ;
                result.data("help", "booleanLiteral") ;
            }
            break ;
            case labels.NoTypeLabel.kindConst :
            {
                // TODO. It would be nice if the
                // noType and noExp nodes where more 
                // like dropzones in the HTML.
                // I.e. the div.noType should be relative
                // and sit over a div.dzContainer.
                // To do so, this subroutine should return
                // a pair of elements. One that goes in the flow
                // and one that represents the pnode.
                result  = $(document.createElement("div")) ;
                result.addClass( "noType" ) ; 
                result.addClass( "V" ) ;
                result.addClass( "droppable" ) ;
                result.addClass( "canDrag" ) ;
                result.attr( "data-tooltip", "Absent type") ;
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
                result.attr( "data-tooltip", "Absent expression") ;
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
                    const mark = isConst ? MAPSTOMARK : STOREMARK ;
                    becomes.text( mark ) ;
                    becomes.addClass("op") ;
                    result.append(becomes);
                }
                result.append(children[2]);
                result.attr( "data-tooltip", "Declaration") ;
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
                    const {dz: dz, cont: dzContainer}
                    = makeDropZone(i, false, "Drop zone for tuple item" ) ;
                    dropZones.push( dz ) ;
                    result.append( dzContainer );
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
                result.attr( "data-tooltip",
                             children.length===1 ? "Parenthesized expression":"Tuple expression") ;
                result.data("help", "tupleExpression") ;
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
                let text : string ;
                let toolTip : string ;
                let helpString : string 
                switch(label.type) {
                    case "stringType" :
                        text = STRINGTYPE ;
                        toolTip = "String type" ;
                        helpString = "stringType" ;
                        break;
                    case "numberType" :
                        text = NUMBERTYPE ;
                        toolTip = "Number type" ;
                        helpString = "numberType" ;
                        break;
                    case "booleanType" :
                        text = BOOLEANTYPE ;
                        toolTip = "Boolean type" ;
                        helpString = "booleanType" ;
                        break;
                    case "nullType" :
                        text = NULLMARK ;
                        toolTip = "Null type" ;
                        helpString = "nullType" ;
                        break;
                    case "integerType" :
                        text = INTEGERTYPE ;
                        toolTip = "Integer type" ;
                        helpString = "integerType" ;
                        break;
                    case "natType" :
                        text = NATTYPE ;
                        toolTip = "Natural number type" ;
                        helpString = "natType" ;
                        break ;
                    case "topType" :
                        text = TOPTYPE ;
                        toolTip = "Top type" ;
                        helpString = "topType" ;
                        break;
                    case "bottomType" :
                        text = BOTTOMTYPE ;
                        toolTip = "Bottom type" ;
                        helpString = "bottomType" ;
                        break;
                    default :
                        assert.unreachable("Unknown primitive type in buildHTML.");
                        text = "" ;
                        toolTip = "" ;
                        helpString = "" ;
                }
                result.html( text );
                result.attr( "data-tooltip", toolTip) ;
                result.data("help", helpString) ;
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
                    const {dz: dz, cont: dzContainer}
                    = makeDropZone(i, false, "Drop zone for type" ) ;
                    dropZones.push( dz ) ;
                    result.append( dzContainer );
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
                result.attr( "data-tooltip", "Function type") ;
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
                result.attr( "data-tooltip", "Location type") ;
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
                result.attr( "data-tooltip", "Field type") ;
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
                    const {dz: dz, cont: dzContainer}
                    = makeDropZone(i, false, "Drop zone for type" ) ;
                    dropZones.push( dz ) ;
                    result.append( dzContainer );
                    if (i === children.length) break;
                    result.append(children[i]);
                    if( i < children.length -1 ) {
                        const pipe : JQuery = $( document.createElement("div") )
                                              .text(JOINTYPE)
                                              .addClass("op") ;
                        result.append( pipe ) ; }
                }
                result.attr( "data-tooltip", "Union type") ;
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
                    const {dz: dz, cont: dzContainer}
                    = makeDropZone(i, false, "Drop zone for type" ) ;
                    dropZones.push( dz ) ;
                    result.append( dzContainer );
                    if (i === children.length) break;
                    result.append(children[i]);
                    if( i < children.length -1 ) {
                        const amp : JQuery = $( document.createElement("div") )
                                             .text(MEETTYPE)
                                             .addClass("op") ;
                        result.append( amp ) ; }
                }
                result.attr( "data-tooltip", "Intersection type") ;
                result.data("help", "meetType") ;
            }
            break;
            default:
            {
                result = assert.unreachable( "Unknown label in buildHTML.") ;
            }
        }
        // Record the node that this element represents.
        result.data( "node", node ) ;
        // Give the result a number. // TODO Use data instead of attr.
        result.attr( "data-childNumber", childNumber.toString() ) ; 
        // Attach the JQueries representing the children elements to the root element representing this node.
        result.data("children", children ) ;
        // Attach the JQueries representing the dropzones to the root element representing this node.
        // Note these may not be present in which case they are nulls in the array or the array is short.
        result.data("dropzones", dropZones ) ;
        // Make it selectable by a click
        if( node.isSelectable() )result.addClass( "selectable" ) ;
        result.addClass( "codeBox" ) ;
        if( needsBorder ) result.addClass("bordered") ;
        return result ;
    }

    function layOutVerticalSequence( seqBox : JQuery, children : Array<JQuery>, dropZones : Array<JQuery|null>, dropZoneToolTip : string ) : void {
        if( compactMode ) {
            for (let i = 0; i < children.length ; ++i) {
                const hBox = $(document.createElement("div")) ;
                hBox.addClass( "H" ) ;
                hBox.addClass( "compactLine" ) ;
                seqBox.append( hBox ) ;
                const {dz: dz, cont: dzContainer}
                = makeDropZone(i, false, dropZoneToolTip) ;
                dropZones.push( dz ) ;
                hBox.append( dzContainer );
                const child = children[i] ;
                hBox.append(child); }
            const {dz: dz, cont: dzContainer}
            = makeDropZone(children.length, true, dropZoneToolTip ) ;
            dropZones.push( dz ) ;
            seqBox.append( dzContainer ) ;
        } else {
            for (let i = 0; true; ++i) {
                const {dz: dz, cont: dzContainer}
                = makeDropZone(i, true, "Drop zone for sequence member" ) ;
                dropZones.push( dz ) ;
                seqBox.append( dzContainer );
                if (i === children.length) break;
                const child = children[i] ;
                seqBox.append(child);
            } }
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

    function makeDropZone( childNumber : number, large : boolean, toolTip : string ) : {dz:JQuery, cont:JQuery} {
        const dropZone : JQuery = $( document.createElement("div") ) ;
        dropZone.addClass( "dropZone" ) ;
        dropZone.addClass( "droppable" ) ;
        // Make it selectable by a click
        dropZone.addClass( "selectable" ) ;
        dropZone.attr("data-isDropZone", "yes");
        dropZone.attr("data-tooltip", toolTip);
        dropZone.attr("data-childNumber", childNumber.toString());

        const container : JQuery = $( document.createElement("div") ) ;
        container.addClass( "dzContainer" ) ;
        container.append( dropZone ) ;
        return {dz: dropZone, cont: container} ;
    }

    function makeTextInputElement( node : PNode, classes : Array<string>, childNumber : collections.Option<number> ) : JQuery {
        const str = parsers.unparseString(node.label().getString(), false ) ;
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
        // console.log( ">> getPathToNode" ) ;
        let jq : JQuery = self;
        let childNumber : number = Number(jq.attr("data-childNumber"));
        // Climb the tree until we reach a node with a data-childNumber attribute.
        while( jq.length > 0 && isNaN( childNumber ) ) {
            // console.log( "   going up jq is " + jq.prop('outerHTML')() ) ;
            // console.log( "Length is " + jq.length ) ;
            // console.log( "childNumber is " + childNumber ) ;
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
            // console.log( "   it's a dropzone with number " +  childNumber) ;
            anchor = focus = childNumber ;
        } else {
            // console.log( "   it's a node with number " +  childNumber) ;
            anchor = childNumber ;
            focus = anchor+1 ;
        }
        // Go up one level
        jq = jq.parent() ;

        // Climb the tree again until we reach a node with a data-childNumber attribute of -1.
        childNumber = Number(jq.attr("data-childNumber"));
        const array : Array<number> = [];
        while (jq.length > 0 && childNumber !== -1 ) {
            if (!isNaN(childNumber))
            {
                array.push( childNumber );
                // console.log( "   pushing " +  childNumber) ;
            }
            // Go up one level
            jq = jq.parent() ;
            childNumber = Number(jq.attr("data-childNumber"));
        }
        // console.log( "At the top " + jq.length ) ;
        if( jq.length == 0) return none() ; // Really should not happen. If it does, there was no -1 and we hit the document.

        // We could be in the wrong tree alltogether!
        if( jq.data("node") !== root ) return none() ;
        // Now make a path out of the array.
        let thePath = list<number>();
        for( let i = 0 ; i < array.length ; i++ ) {
            thePath = collections.cons( array[i], thePath ) ; }
        
        return some( new Selection(root, thePath, anchor, focus) ) ;
    }

    export function stringIsInfixOperator( str : string ) : boolean {
        return str.match( /^(([+/!@<>#$%&*_+=?;:~&]|\-|\^|\\)+|[`].*|and|or|implies)$/ ) !== null ;
    } 
}

export = treeView;
