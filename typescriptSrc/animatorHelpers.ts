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
            case labels.IfLabel.kindConst :
            {
                let childArray = children.children();
                assert.check( childArray.length === 3 ) ;

                result = children.group().dmove(10,10);

                let padding : number = 15;
                let y : number = 0;
                const guardBox : svg.G = result.group() ;
                // guardbox.addClass( "ifGuardBox" ) ;
                // guardbox.addClass( "H" ) ;
                // guardbox.addClass( "workplace" ) ;
                let textElement = guardBox.text("?").dmove(0, -5);
                guardBox.add( childArray[0].dmove(20, 5) ) ;
                y += childArray[0].bbox().height + padding;
                let len = findWidthOfLargestChild(childArray);
                len += padding; //account for extra space due to question mark symbol

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, "rgb(190, 133, 197)", len, y);

                y += padding;
                const thenBox :  svg.G = result.group().dmove(10, y) ;
                // thenbox.addClass( "thenBox" ) ;
                // thenbox.addClass( "H" ) ;
                // thenbox.addClass( "workplace" ) ;
                thenBox.add( childArray[1] ) ;
                y += thenBox.bbox().height + (padding*2); //leave room for the separator

                const elseBox : svg.G = result.group().dmove(10, y) ;
                // elsebox.addClass( "elseBox" ) ;
                // elsebox.addClass( "H" ) ;
                // elsebox.addClass( "workplace" ) ;
                elseBox.add( childArray[2] ) ;

                makeFancyBorderSVG(children, result, "rgb(190, 133, 197)");
                makeThenBoxSeparatorSVG(result, y - padding);
                // result.addClass( "ifBox" ) ;
                // result.addClass( "V" ) ;
                // result.addClass( "workplace" ) ;
            }
            break ;
            case labels.ExprSeqLabel.kindConst :
            {
                // TODO show only the unevaluated members during evaluation

                let childArray = children.children();
                result = children.group();
                // result.addClass( "seqBox" ) ;
                // result.addClass( "V" ) ;
                // Add children and drop zones.
                let padding : number = 15;
                let y : number = 0;
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    childArray[i].dmove(0, y); //testing
                    y += childArray[i].bbox().height + padding;
                    result.add(childArray[i]);
                }
                if(y === 0) //i.e. there are no elements in this node
                {
                    result.rect(10,10).opacity(0); //enforce a minimum size for ExprSeq nodes.
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
            case labels.ParameterListLabel.kindConst :
            {
                let childArray = children.children();
                result = children.group() ;
                // result.addClass( "paramlistOuter" ) ;
                // result.addClass( "H" ) ;
                
                let padding : number = 15;
                let x : number = 0;
                // Add children and dropZones.
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    childArray[i].dmove(x, 0); //testing
                    x += childArray[i].bbox().width + padding;
                    result.add(childArray[i]);
                }
            }
            break ;
            case labels.WhileLabel.kindConst :
            {
                let childArray = children.children();
                assert.check( childArray.length === 2 ) ;

                let result  = children.group().dmove(10, 10) ;
                let padding : number = 15;
                let y = 0;

                const guardBox : svg.G = result.group() ;
                // guardBox.addClass( "whileGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                let textElement = guardBox.text("\u27F3").dmove(0, -5);
                guardBox.add( childArray[0].dmove(30, 0) ) ;
                y += childArray[0].bbox().height + padding;
                let len = findWidthOfLargestChild(childArray)+padding;

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, "rgb(190, 133, 197)", len, y)

                y += padding;
                const doBox :  svg.G = result.group().dmove(10, y) ;
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

                let padding : number = 10;
                let x : number = 0;
                if(childArray.length === 2 && labelString.match( /^([+/!@#$%&*_+=?;:`~&]|-|^|\\)+$/ ) !== null)
                {
                    result.add(childArray[0]);
                    x += childArray[0].bbox().width + padding;
                    result.add(opText.dmove(x, -5)); //dmoves are for testing purposes
                    x += opText.bbox().width + padding;
                    result.add(childArray[1].dmove(x, 0));
                }
                else
                {
                    result.add(opText.dmove(0, -5));
                    x += opText.bbox().width + padding;
                    for( let i=0 ; true ; ++i)
                    {
                        if( i === childArray.length ) break ;
                        childArray[i].dmove(x, 0) //testing
                        x += childArray[i].bbox().width + padding;
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
                let padding : number = 10;
                let x : number = 0;
                result.add(childArray[0]); 

                x += childArray[0].bbox().width + padding;
                const opText : svg.Text = result.text(":=");
                opText.fill("rgb(244, 140, 0)")
                opText.dmove(x, -5);
                x += opText.bbox().width + padding;

                result.add(childArray[1].dmove(x, 0));
                
                makeAssignLabelBorder(result);
            }
            break ;
            case labels.LambdaLabel.kindConst :
            {

                let childArray = children.children();
                let result  = children.group().dmove(10, 10) ;
                let padding : number = 15;
                let y : number = 0;

                const lambdahead : svg.G = result.group() ;
                // guardBox.addClass( "whileGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                let textElement = lambdahead.text("\u03BB");
                lambdahead.add( childArray[0].dmove(20, 10) ) ;
                y += childArray[0].bbox().height + padding;
                lambdahead.add( childArray[1].dmove(0, y) ) ;
                let len = findWidthOfLargestChild(childArray)+padding;
                y += childArray[1].bbox().height + padding;
                // lambdahead.addClass( "lambdaHeader") ;
                // lambdahead.addClass( "V") ;

                doGuardBoxStylingAndBorderSVG(textElement, lambdahead, "rgb(135,206,250)", len, y);
                y += padding;

                const doBox :  svg.G = result.group().dmove(10, y) ;
                // doBox.addClass( "doBox") ;
                // doBox.addClass( "H") ;
                doBox.add( childArray[2] ) ;

                makeFancyBorderSVG(children, result, "rgb(135,206,250)");

                // result.addClass( "lambdaBox" ) ;
                // result.addClass( "V" ) ;
            }
            break ;
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
            case labels.NoExprLabel.kindConst :
            {
                result  = children.group() ;
                makeNoExprLabelSVG(result);
                // result.addClass( "expOp" ) ; // Need a better class for this, I think.
                // result.addClass( "V" ) ;
            }
            break ;
            case labels.VarDeclLabel.kindConst :
            {

                let childArray = children.children();
                result = children.group();

                let padding : number = 10;
                let x : number = 0;

                const delta : svg.Text = result.text("\u03B4");
                delta.fill("rgb(248, 248, 255)")
                delta.dmove(0, -5); //testing

                x += delta.bbox().width + padding;
                result.add(childArray[0].dmove(x, 0)); 

                x += childArray[0].bbox().width + padding;
                const colon : svg.Text = result.text(":");
                colon.fill("rgb(248, 248, 255)").dmove(x, -5);

                x += colon.bbox().width + padding;
                result.add(childArray[1].dmove(x, 7));

                x += childArray[1].bbox().width + padding;
                const becomes : svg.Text = result.text(":=");
                becomes.fill("rgb(248, 248, 255)").dmove(x, -5);

                x += becomes.bbox().width + padding;
                result.add(childArray[2].dmove(x, 0));

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

    function doGuardBoxStylingAndBorderSVG(text: svg.Text | null, guardBox : svg.G, colour : String, lineLength : number, lineY : number)
    {
        if(text !== null)
        {
            text.fill(colour.toString()); //It would throw an error unless I did this
            text.style("font-size: large");
        }
        let bounds = guardBox.bbox();
        let line = guardBox.line(bounds.x - 5, lineY, bounds.x + lineLength + 5, lineY);
        line.stroke({color: colour.toString(), opacity: 1, width: 4});
        line.attr("stroke-dasharray", "10, 10");
    }
    
    function makeThenBoxSeparatorSVG(ifBox : svg.G, y : number)
    {
        let sepX1 = ifBox.bbox().x;
        let sepX2 = ifBox.bbox().x2;
        let line = ifBox.line(sepX1, y, sepX2, y);
        line.stroke({color: "rgb(190, 133, 197)", opacity: 1, width: 4});
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

    function makeNoExprLabelSVG(el: svg.Container)
    {
        let label = el.rect(20,20);
        label.radius(5);
        label.fill({opacity: 0});
        label.stroke({color: "rgb(248, 248, 255)", opacity: 1, width: 1.5})
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
