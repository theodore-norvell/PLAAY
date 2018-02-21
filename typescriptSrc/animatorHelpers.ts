/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="assert.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import labels = require('./labels');
import pnode = require('./pnode');
import pnodeEdits = require('./pnodeEdits');
import * as svg from "svg.js";

/** The animatorHelpers module looks after the conversion of trees to SVG.*/
module animatorHelpers 
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

    export function traverseAndBuild(node:PNode, el : svg.Container, evaluating:boolean) : void
    {
        let children : svg.G = el.group();
        for(let i = 0; i < node.count(); i++)
        {
            traverseAndBuild(node.child(i), children,  evaluating);
        }
        buildSVG(node, children, evaluating);
    }

    function buildSVG(node:PNode, children : svg.G, evaluating:boolean) : void
    {
        let result : svg.G ;
        // Switch on the LabelKind
        const kind = node.label().kind() ;
        switch( kind ) {
        //     case labels.IfLabel.kindConst :
        //     {
        //         assert.check( children.length === 3 ) ;

        //         const guardbox : JQuery = $(document.createElement("div")) ;
        //         guardbox.addClass( "ifGuardBox" ) ;
        //         guardbox.addClass( "H" ) ;
        //         guardbox.addClass( "workplace" ) ;
        //         guardbox.append( children[0] ) ;

        //         const thenbox : JQuery = $(document.createElement("div")) ;
        //         thenbox.addClass( "thenBox" ) ;
        //         thenbox.addClass( "H" ) ;
        //         thenbox.addClass( "workplace" ) ;
        //         thenbox.append( children[1] ) ;

        //         const elsebox : JQuery = $(document.createElement("div")) ;
        //         elsebox.addClass( "elseBox" ) ;
        //         elsebox.addClass( "H" ) ;
        //         elsebox.addClass( "workplace" ) ;
        //         elsebox.append( children[2] ) ;

        //         result  = $(document.createElement("div")) ;
        //         result.addClass( "ifBox" ) ;
        //         result.addClass( "V" ) ;
        //         result.addClass( "workplace" ) ;
        //         result.addClass( "canDrag" ) ;
        //         result.addClass( "droppable" ) ;
        //         result.append( guardbox, thenbox, elsebox ) ;
        //     }
        //     break ;
            case labels.ExprSeqLabel.kindConst :
            {
                // TODO show only the unevaluated members during evaluation

                let childArray = children.children();
                result = children.group();
                // result.addClass( "seqBox" ) ;
                // result.addClass( "V" ) ;
                // Add children and drop zones.
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    childArray[i].dmove(0, i*40); //testing
                    result.add(childArray[i]);
                }
            }
            break ;
            case labels.ExprPHLabel.kindConst :
            {
                result = children.group() ;
                let text : svg.Text = result.text( "..." );
                makeExprPlaceholderSVG(result, text);
                // result.addClass( "placeHolder" ) ;
                // result.addClass( "V" ) ;
            }
            break ;
        //     case labels.ParameterListLabel.kindConst :
        //     {
        //         result = $( document.createElement("div") ) ;
        //         result.addClass( "paramlistOuter" ) ;
        //         result.addClass( "H" ) ;
        //         result.addClass( "droppable" ) ;
                
        //         // Add children and dropZones.
        //         for (let i = 0; true; ++i) {
        //             const dz = makeDropZone(i, false) ;
        //             dropzones.push( dz ) ;
        //             result.append(dz);
        //             if (i === children.length) break;
        //             result.append(children[i]);
        //         }
        //     }
        //     break ;
            case labels.WhileLabel.kindConst :
            {
                let childArray = children.children();
                assert.check( childArray.length === 2 ) ;

                let result  = children.group().dmove(10, 10) ;

                const guardBox : svg.G = result.group() ;
                // guardBox.addClass( "whileGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                let textElement = guardBox.text("\u27F3").dmove(0, -5);
                guardBox.add( childArray[0].dmove(30, 0) ) ;
                let len = findWidthOfLargestChild(childArray);
                if(len <= childArray[0].bbox().width + 20)
                {
                    len += 20; //account for extra space due to while symbol
                }

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, "rgb(190, 133, 197)", len)

                const doBox :  svg.G = result.group().dmove(10, 50) ;
                // doBox.addClass( "doBox") ;
                // doBox.addClass( "H") ;
                // doBox.addClass( "workplace") ;
                doBox.add( childArray[1] ) ;

                makeFancyBorderSVG(children, result, "rgb(190, 133, 197)");
                // result.addClass( "whileBox" ) ;
                // result.addClass( "V" ) ;
                // result.addClass( "workplace" ) ;
            }
            break ;
            case labels.CallWorldLabel.kindConst :
            {
                let childArray = children.children();
                let result  = children.group() ;
                // result.addClass( "callWorld" ) ;
                // result.addClass( "H" ) ;
                let opText = result.text(node.label().getVal());
                const labelString = node.label().getVal() ;

                if(childArray.length === 2 && labelString.match( /^([+/!@#$%&*_+=?;:`~&]|-|^|\\)+$/ ) !== null)
                {
                    result.add(childArray[0]);
                    result.add(opText.dmove(20, -5)); //dmoves are for testing purposes
                    result.add(childArray[1].dmove(40, 0));
                }
                else
                {
                    result.add(opText.dmove(0, -5));
                    for( let i=0 ; true ; ++i)
                    {
                        if( i === childArray.length ) break ;
                        childArray[i].dmove(20*(i+1), 0) //testing
                        result.add(childArray[i]) ;
                    }
                }

                doCallWorldLabelStylingSVG(opText);
                makeCallWorldBorderSVG(children, result);
                
            }
            break ;
        //     case labels.CallLabel.kindConst :
        //     {
        //         result  = $(document.createElement("div")) ;
        //         result.addClass( "call" ) ;
        //         result.addClass( "H" ) ;
        //         result.addClass( "canDrag" ) ;
        //         result.addClass( "droppable" ) ;

        //         result.attr("type", "text");

        //         for( let i=0 ; true ; ++i) {
        //             const dz : JQuery = makeDropZone(i, false) ;
        //             dropzones.push( dz ) ;
        //             result.append( dz ) ;
        //             if( i === children.length ) break ;
        //             result.append( children[i] ) ;
        //         }
        //     }
        //     break ;
            case labels.AssignLabel.kindConst :
            {
                
                let childArray = children.children();
                result = children.group();
                result.add(childArray[0]
                    .dmove(0, 0) //testing
                ); 

                const opText : svg.Text = result.text(":=");
                opText.fill("rgb(244, 140, 0)")
                opText.dmove(20, -5); //testing

                result.add(childArray[1]
                    .dmove(40, 0) //testing
                );
                
                makeAssignLabelBorder(result);
            }
            break ;
        //     case labels.LambdaLabel.kindConst :
        //     {
        //         const lambdahead : JQuery = $( document.createElement("div") ) ;
        //         lambdahead.addClass( "lambdaHeader") ;
        //         lambdahead.addClass( "V") ;
        //         lambdahead.append( children[0] ) ;
        //         lambdahead.append( children[1] ) ;

        //         const doBox : JQuery = $( document.createElement("div") ) ;
        //         doBox.addClass( "doBox") ;
        //         doBox.addClass( "H") ;
        //         doBox.append( children[2] ) ;

        //         result  = $(document.createElement("div")) ;
        //         result.addClass( "lambdaBox" ) ;
        //         result.addClass( "V" ) ;
        //         result.addClass( "droppable" ) ;
        //         result.append( lambdahead ) ;
        //         result.append( doBox ) ;
        //     }
        //     break ;
        //     case labels.NullLiteralLabel.kindConst :
        //     {
        //         result  = $(document.createElement("div")) ;
        //         result.addClass( "nullLiteral" ) ;
        //         result.addClass( "H" ) ;
        //         result.addClass( "droppable" ) ;
        //         result.text( "&#x23da;" ) ;  // The Ground symbol. I hope.
        //     }
        //     break ;
            case labels.VariableLabel.kindConst :
            {
                result = children.group() ;
                let text : svg.Text = result.text( node.label().getVal() );
                makeVariableLabelSVG(result, text);
                // result.addClass( "var" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.StringLiteralLabel.kindConst :
            {
                result = children.group() ;
                let text : svg.Text = result.text( node.label().getVal() );
                makeStringLiteralSVG(result, text);
                // result.addClass( "stringLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.NumberLiteralLabel.kindConst :
            {
                result  = children.group() ;
                let text : svg.Text = result.text( node.label().getVal() );
                makeNumberLiteralSVG(result, text);
                // result.addClass( "numberLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.NoTypeLabel.kindConst :
            {
                result  = children.group() ;
                makeNoTypeLabelSVG(result);
                // result.addClass( "noType" ) ; 
                // result.addClass( "V" ) ;
            }
            break ;
        //     case labels.NoExprLabel.kindConst :
        //     {
        //         result  = $(document.createElement("div")) ;
        //         result.addClass( "expOp" ) ; // Need a better class for this, I think.
        //         result.addClass( "V" ) ;
        //         result.addClass( "droppable" ) ;
        //         result.addClass( "canDrag" ) ;
        //     }
        //     break ;
            case labels.VarDeclLabel.kindConst :
            {

                let childArray = children.children();
                result = children.group();

                const delta : svg.Text = result.text("\u03B4");
                delta.fill("rgb(248, 248, 255)")
                delta.dmove(0, -5); //testing

                result.add(childArray[0]
                    .dmove(20, 0) //testing
                ); 

                const colon : svg.Text = result.text(":");
                colon.fill("rgb(248, 248, 255)")
                colon.dmove(40, -5); //testing

                result.add(childArray[1]
                    .dmove(55, 7) //testing
                );

                const becomes : svg.Text = result.text(":=");
                becomes.fill("rgb(248, 248, 255)")
                becomes.dmove(80, -5); //testing

                result.add(childArray[2]
                    .dmove(100, 0) //testing
                );

                makeVarDeclBorderSVG(result);

                // result.addClass( "vardecl" ) ;
                // result.addClass( "H" ) ;;
            }
            break ;
            default:
            {
                result = assert.unreachable( "Unknown label in buildSVG: " + kind.toString() + ".") ;
            }
        }
    }

    function doGuardBoxStylingAndBorderSVG(text: svg.Text | null, guardBox : svg.G, colour : String, lineLength : number)
    {
        if(text !== null)
        {
            text.fill(colour.toString()); //It would throw an error unless I did this
            text.style("font-size: large");
        }
        let bounds = guardBox.bbox();
        let line = guardBox.line(bounds.x - 5, bounds.y2 + 10, bounds.x + lineLength + 5, bounds.y2 + 10);
        line.stroke({color: colour.toString(), opacity: 1, width: 4});
        line.attr("stroke-dasharray", "10, 10");

    }

    function doCallWorldLabelStylingSVG(textElement : svg.Text)
    {
        textElement.fill("rgb(190, 133, 197)");
        textElement.style("font-family:'Times New Roman', Times,serif;font-weight: bold ;font-size: large ;");
    }

    function makeCallWorldBorderSVG(base : svg.Container, el : svg.Container)
    {
        let borderGroup = base.group(); //In order to keep it organized nicely
        borderGroup.add(el);
        let bounds : svg.BBox = el.bbox();
        let outline : svg.Rect = borderGroup.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(190, 133, 197)", opacity: 1, width: 1.5});
    }

    function makeFancyBorderSVG(base : svg.Container, el : svg.Container, colour : String)
    {
        let containerGroup = base.group(); //In order to keep it organized nicely
        containerGroup.add(el);
        let borderGroup = containerGroup.group()
        let bounds : svg.BBox = el.bbox();
        let x = bounds.x + 5;
        let y = bounds.y + 10;
        let x2 = bounds.x2 + 10;
        let y2 = bounds.y2 + 10;
        let topBorderPathString = "M" + (x + 5) + ',' + (y - 5) + " H" + (x2 - 5) + " A10,10 0 0,1 " + (x2 + 5) + ',' + (y + 5);
        let topBorder = borderGroup.path(topBorderPathString)
        topBorder.stroke({color: colour.toString(), opacity: 1, width: 4});
        let botBorderPathString = "M" + (x + 5) + ',' + (y2 + 15) + " H" + (x2 - 5) + " A10,10 0 0,0 " + (x2 + 5) + ',' + (y2 + 5);
        let botBorder = borderGroup.path(botBorderPathString)
        botBorder.stroke({color: colour.toString(), opacity: 1, width: 4});
        let rightBorder = borderGroup.line(x2 + 6, y2 + 5.5, x2 + 6, y + 4.5);
        rightBorder.stroke({color: colour.toString(), opacity: 1, width: 1.5});
        let leftBorderPathString = "M" + (x + 5.5) + ',' + (y - 7) + "A10,10 0 0,0 " + (x - 3) + ',' + (y + 3) + "V" + (y2 + 7)
                                 + "A10,10 0 0,0 " + (x + 5.5) + ',' + (y2 + 17) + 'Z'; //These odd numbers allow me to approximate the CSS representation pretty well.
        let leftBorder = borderGroup.path(leftBorderPathString);
        leftBorder.stroke({color: colour.toString(), opacity: 1, width: 0});
        leftBorder.fill(colour.toString());
    }

    function makeVariableLabelSVG(base : svg.Container, textElement : svg.Element)
    {
        textElement.fill("rgb(244, 140, 0)");
        let bounds : svg.BBox = textElement.bbox();
        let outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(244, 140, 0)", opacity: 1, width: 1.5})
    }

    function makeExprPlaceholderSVG(base : svg.Container, textElement : svg.Element)
    {
        textElement.fill("rgb(244, 140, 0)");
        textElement.style("font-weight: normal ;font-size: medium ;");
        let bounds : svg.BBox = textElement.bbox();
        let outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(244, 140, 0)", opacity: 1, width: 1.5})
    }

    function makeNumberLiteralSVG(base : svg.Container, textElement : svg.Element)
    {
        textElement.fill("rgb(244, 140, 0)");
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        let bounds : svg.BBox = textElement.bbox();
        let outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(135,206,250)", opacity: 1, width: 1.5})
    }
    
    function makeStringLiteralSVG(base : svg.Container, textElement : svg.Element)
    {
        textElement.fill("rgb(255, 255, 255)");
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        let bounds : svg.BBox = textElement.bbox();
        let outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(135,206,250)", opacity: 1, width: 1.5})
    }

    function makeAssignLabelBorder(el : svg.Container)
    {
        let bounds : svg.BBox = el.bbox();
        let outline : svg.Rect = el.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(244, 140, 0)", opacity: 1, width: 1.5})
    }
    
    function makeVarDeclBorderSVG(el : svg.Container)
    {
        let bounds : svg.BBox = el.bbox();
        let outline : svg.Rect = el.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: "rgb(248, 248, 255)", opacity: 1, width: 1.5})
    }

    function makeNoTypeLabelSVG(el: svg.Container)
    {
        let label = el.rect(20,20);
        label.radius(5);
        label.fill({opacity: 0});
        label.stroke({color: "rgb(153,153,153)", opacity: 1, width: 1.5})
    }

    function findWidthOfLargestChild(arr : svg.Element[])
    {
        let result : number = 0;
        for(let i = 0; i < arr.length; i++)
        {
            let width = arr[i].bbox().width
            if(width > result)
            {
                result = width;
            }
        }
        return result;
    }

//     export function  highlightSelection( sel : Selection, jq : JQuery ) : void {
//         assert.check( jq.attr( "data-childNumber" ) === "-1" ) ;
//         localHighlightSelection( sel.root(), sel.path(), sel.start(), sel.end(), jq ) ;
//     }

//     function  localHighlightSelection( pn : PNode, thePath : List<number>, start : number, end : number, jq : JQuery ) : void {
//         if( thePath.isEmpty() ) {
//             if( start === end ) {
//                 const zones : Array<JQuery> = jq.data( "dropzones" ) as Array<JQuery> ;
//                 assert.check( zones !== null ) ;
//                 const dz : JQuery|null = start < zones.length ? zones[start] : null ;
//                 if( dz!== null ) dz.addClass( "selected" ) ;
//             } else {
//                 const children : Array<JQuery> = jq.data( "children" ) as Array<JQuery> ;
//                 assert.check( children !== null ) ;
//                 for( let i = start ; i < end ; ++i ) {
//                     children[i].addClass( "selected" ) ;
//                 }
//             }
//         } else {
//             const i = thePath.first() ;
//             const children : Array<JQuery> = jq.data( "children" ) as Array<JQuery> ;
//             assert.check( children !== null ) ;
//             assert.check( i < children.length ) ;
//             localHighlightSelection( pn.child(i), thePath.rest(), start, end, children[i] ) ;
//         }
//     }

//     function makeDropZone( childNumber : number, large : boolean ) : JQuery {
//         const dropZone : JQuery = $( document.createElement("div") ) ;
//         dropZone.addClass( large ? "dropZone" : "dropZoneSmall" ) ;
//         dropZone.addClass( "H" ) ;
//         dropZone.addClass( "droppable" ) ;
//         // Make it selectable by a click
//         dropZone.addClass( "selectable" ) ;
//         dropZone.attr("data-isDropZone", "yes");
//         dropZone.attr("data-childNumber", childNumber.toString());
//         return dropZone ;
//     }

//     function makeTextInputElement( node : PNode, classes : Array<string>, childNumber : collections.Option<number> ) : JQuery {
//             let text = node.label().getVal() ;
//             text = text.replace( /&/g, "&amp;" ) ;
//             text = text.replace( /"/g, "&quot;") ;

//             const element : JQuery = $(document.createElement("input"));
//             for( let i=0 ; i < classes.length ; ++i ) {
//                 element.addClass( classes[i] ) ; }
//             childNumber.map( n => element.attr("data-childNumber", n.toString() ) ) ;
//             element.attr("type", "text");
//             element.attr("value", text) ;
//             element.focus().val(element.val()); //Set the caret to the end of the text.
//             return element ;
//     }

//     export function getPathToNode(root : PNode, self : JQuery ) : Option<Selection>
//     {
//         let anchor;
//         let focus;
//         //console.log( ">> getPathToNode" ) ;
//         let jq : JQuery= $(self);
//         let childNumber : number = Number(jq.attr("data-childNumber"));
//         // Climb the tree until we reach a node with a data-childNumber attribute.
//         while( jq.length > 0 && isNaN( childNumber ) ) {
//             //console.log( "   going up jq is " + jq.prop('outerHTML')() ) ;
//             //console.log( "Length is " + jq.length ) ;
//             //console.log( "childNumber is " + childNumber ) ;
//             jq = jq.parent() ;
//             childNumber = Number(jq.attr("data-childNumber"));
//         }
//         if( jq.length === 0 ) {
//             return none<Selection>() ;
//         }
//         if( childNumber === -1 ) {
//             return none<Selection>() ;
//         }
//         // childNumber is a number.  Is this a dropzone or not?
//         const isDropZone = jq.attr("data-isDropZone" ) ;
//         if( isDropZone === "yes" ) {
//             //console.log( "   it's a dropzone with number " +  childNumber) ;
//             anchor = focus = childNumber ;
//         } else {
//             //console.log( "   it's a node with number " +  childNumber) ;
//             anchor = childNumber ;
//             focus = anchor+1 ;
//         }
//         // Go up one level
//         jq = jq.parent() ;
//         childNumber = Number(jq.attr("data-childNumber"));


//         // Climb the tree until we reach a node with a data-childNumber attribute of -1.
//         const array : Array<number> = [];
//         while (jq.length > 0 && childNumber !== -1 ) {
//             if (!isNaN(childNumber))
//             {
//                 array.push( childNumber );
//                 //console.log( "   pushing " +  childNumber) ;
//             }
//             // Go up one level
//             jq = jq.parent() ;
//             childNumber = Number(jq.attr("data-childNumber"));
//         }
//         assert.check( jq.length !== 0, "Hit the top!" ) ; // Really should not happen. If it does, there was no -1 and we hit the document.
//         // Now make a path out of the array.
//         let thePath = list<number>();
//         for( let i = 0 ; i < array.length ; i++ ) {
//             thePath = collections.cons( array[i], thePath ) ; }
        
//         // If making the selection fails, then the root passed in was not the root
//         // used to make the HTML.
//         return some( new pnodeEdits.Selection(root, thePath, anchor, focus) ) ;
//     }
}

export = animatorHelpers;
