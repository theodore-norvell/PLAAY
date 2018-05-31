/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="assert.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import labels = require('./labels');
import pnode = require('./pnode');
import pnodeEdits = require('./pnodeEdits');
import sharedMkHtml = require('./sharedMkHtml');
import valueTypes = require('./valueTypes');
import vms = require('./vms');
import * as svg from "svg.js";

/** The animatorHelpers module looks after the conversion of trees to SVG.*/
module animatorHelpers 
{
    import list = collections.list;
    import List = collections.List;
    import Cons = collections.cons;
    import Nil = collections.nil;
    import Option = collections.Option;
    import some = collections.some;
    import none = collections.none;
    // path is an alias for list<number>
    const path : (  ...args : Array<number> ) => List<number> = list;
    import Selection = pnodeEdits.Selection;
    import PNode = pnode.PNode;
    import ValueMap = vms.ValueMap;
    import Value = vms.Value;
    import ObjectV = valueTypes.ObjectV;
    import ObjectI = vms.ObjectI;
    import stringIsInfixOperator = sharedMkHtml.stringIsInfixOperator;

    const MAUVE : string = "rgb(190, 133, 197)";
    const ORANGE : string = "rgb(244, 140, 0)";
    const LIGHT_BLUE : string = "rgb(135, 206, 250)";
    const GHOSTWHITE : string = "rgb(248, 248, 255)";
    const WHITE : string = "rgb(255, 255, 255)";
    const GRAY : string = "rgb(153, 153, 153)";
    const RED : string = "rgb(200, 0, 0)";

    let objectsToDraw : Array<ObjectV> = new Array<ObjectV>();
    let arrowStartPoints : Map<ObjectV, Array<svg.Rect>> = new Map<ObjectV, Array<svg.Rect>>();
    let drawnObjectsMap : Map<ObjectI, svg.Rect> = new Map<ObjectI, svg.Rect>();

    export function clearObjectDrawingInfo() : void
    {
        objectsToDraw = new Array<ObjectV>();
        arrowStartPoints = new Map<ObjectV, Array<svg.Rect>>();
        drawnObjectsMap = new Map<ObjectI, svg.Rect>();
    }

    export function traverseAndBuild(node:PNode, el : svg.Container, currentPath : List<number>, pathToHighlight : List<number>,
                                     valueMap : ValueMap | null, error : string, errorPath : List<number>) : void
    {
        const children : svg.G = el.group();
        if(valueMap === null || (valueMap !== null && !valueMap.isMapped(currentPath))) //prevent children of mapped nodes or errors from being drawn.
        {
            for(let i = 0; i < node.count(); i++)
            {
                traverseAndBuild(node.child(i), children, currentPath.cat(Cons<number>(i, Nil<number>())), pathToHighlight, valueMap, error, errorPath);
            }
        }
        const highlightMe : boolean = currentPath.equals(pathToHighlight);
        const isError : boolean = currentPath.equals(errorPath);
        buildSVG(node, children, el, highlightMe, currentPath, valueMap, isError, error);
    }

    export function buildStack(stk : vms.EvalStack, el : svg.Container) : void
    {
        //const stkGroup : svg.G = el.group().attr('preserveAspectRatio', 'xMaxYMin meet');
        let y = 0;
        let padding : number = 15;
        
        if (stk.notEmpty()){
                let vars : vms.VarStack = stk.get(stk.getSize()-1).getStack();
                let varstackSize : number = vars.getAllFrames().length;
                let frameArray : ObjectI[] = vars.getAllFrames();
                
                for (let k = 0; k < varstackSize - 1 && k < 10; k++){
                    const obj : ObjectI = frameArray[k];
                    if(k !== 0)
                    {
                        y += padding;
                    }
                    y += drawObject(obj, el, y).bbox().height;
                }
        }
    }

    function drawObject(object : ObjectI, element : svg.Container, y : number, drawNestedObjects : boolean = true) : svg.Rect
    {
        const padding : number = 15;
        const result : svg.G = element.group();
        const numFields : number = object.numFields();
        for (let j = 0; j < numFields; j++){
            const field : vms.FieldI = object.getFieldByNumber(j);
            const subGroup : svg.G = result.group();
            const name : svg.Text = subGroup.text("  " + field.getName());
            const value : svg.G = subGroup.group();
            buildSVGForMappedNode(value, subGroup, field.getValue(), drawNestedObjects);
            makeObjectFieldSVG(subGroup, name, value);
                          
            subGroup.dmove(10, y + 5);
            y += subGroup.bbox().height + 5;
        }
        let border;
        if(result.children().length !== 0)
        {
            border = makeObjectBorderSVG(element, result);
        }
        else
        {
            border = element.rect(0,0);
        }
        return border;
    }

    function makeObjectFieldSVG(base : svg.Container, name : svg.Text, value : svg.G) : void
    {
        let x : number = 0;
        const padding : number = 20;

        name.fill(GHOSTWHITE.toString());
        const valueBox : svg.G = base.group();
        valueBox.add(value);
        x += name.bbox().width + padding;
        if (x < 35){
            x = 35;
        }
        valueBox.dmove(x, 0);
    }

    function makeStackFrameElement(base : svg.Container, el : svg.Element) : void
    {
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 8, bounds.height + 8);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(2);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE.toString(), opacity: 1, width: 1.5});
    }

    //I assume element is a child of parent
    function buildSVG(node : PNode, element : svg.G, parent : svg.Container, shouldHighlight : boolean, myPath : List<number>,
                      valueMap : ValueMap | null, isError : boolean, error : string) : void
    {
        if(valueMap !== null && valueMap.isMapped(myPath))
        {
            buildSVGForMappedNode(element, parent, valueMap.get(myPath));
            return;
        }

        let drawHighlightOn : svg.G = element;
        // Switch on the LabelKind
        const kind = node.label().kind() ;
        switch( kind ) {
            case labels.IfLabel.kindConst :
            {
                const childArray = element.children();
                assert.check( childArray.length === 3 ) ;

                element.dmove(10,10);

                const padding : number = 15;
                let y : number = 0;
                const guardBox : svg.G = element.group() ;
                // guardbox.addClass( "ifGuardBox" ) ;
                // guardbox.addClass( "H" ) ;
                // guardbox.addClass( "workplace" ) ;
                const textElement = guardBox.text("?").dmove(0, -5);
                guardBox.add( childArray[0].dmove(20, 5) ) ;
                const childBBox : svg.BBox = childArray[0].bbox();
                if(childBBox.y < 5)
                {
                    const childY : number = childBBox.y;
                    childArray[0].dy(5-childY);
                    y += 5-childY;
                }
                if(childBBox.x < 0)
                {
                    childArray[0].dx(-childBBox.x);
                }
                y += childBBox.height + padding;
                let len = findWidthOfLargestChild(childArray);
                len += padding; //account for extra space due to question mark symbol

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, MAUVE, len, y);

                y += padding;
                const thenBox :  svg.G = element.group().dmove(10, y) ;
                // thenbox.addClass( "thenBox" ) ;
                // thenbox.addClass( "H" ) ;
                // thenbox.addClass( "workplace" ) ;
                thenBox.add( childArray[1] ) ;
                y += thenBox.bbox().height + (padding*2); //leave room for the separator

                const elseBox : svg.G = element.group().dmove(10, y) ;
                // elsebox.addClass( "elseBox" ) ;
                // elsebox.addClass( "H" ) ;
                // elsebox.addClass( "workplace" ) ;
                elseBox.add( childArray[2] ) ;

                drawHighlightOn = makeFancyBorderSVG(parent, element, MAUVE);
                makeThenBoxSeparatorSVG(element, y - padding);
                // result.addClass( "ifBox" ) ;
                // result.addClass( "V" ) ;
                // result.addClass( "workplace" ) ;
            }
            break ;
            case labels.ExprSeqLabel.kindConst :
            {
                const childArray = element.children();
                // result.addClass( "seqBox" ) ;
                // result.addClass( "V" ) ;
                const padding : number = 15;
                let y : number = 0;
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    childArray[i].dmove(0, y);
                    const bbox = childArray[i].bbox();
                    if(bbox.x < 0)
                    {
                        childArray[i].dx(-bbox.x);
                    }
                    if(bbox.y < y)
                    {
                        childArray[i].dy(-bbox.y);
                    }
                    if(childArray[i].bbox().height > 0) //i.e. the child has an SVG presence (should only be false for nodes mapped to DoneV currently.)
                    {
                        y += childArray[i].bbox().height + padding;
                    }
                }
                if(y === 0) //i.e. there are no elements in this node
                {
                    element.rect(10,10).opacity(0); //enforce a minimum size for ExprSeq nodes.
                }
            }
            break ;
            case labels.ExprPHLabel.kindConst :
            {
                makeExprPlaceholderSVG(element);
                // result.addClass( "placeHolder" ) ;
                // result.addClass( "V" ) ;
            }
            break ;
            case labels.ParameterListLabel.kindConst :
            {
                const childArray = element.children();
                // result.addClass( "paramlistOuter" ) ;
                // result.addClass( "H" ) ;
                
                const padding : number = 15;
                let x : number = 0;
                // Add children and dropZones.
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    childArray[i].dmove(x, 0);
                    const childBBox : svg.BBox = childArray[i].bbox();
                    if(childBBox.y < 0)
                    {
                        const childY : number = childBBox.y;
                        childArray[i].dy(-childY);
                    }
                    x += childArray[i].bbox().width + padding;
                }
            }
            break ;
            case labels.WhileLabel.kindConst :
            {
                const childArray = element.children();
                assert.check( childArray.length === 2 ) ;

                element.dmove(10, 10) ;
                const padding : number = 15;
                let y = 0;

                const guardBox : svg.G = element.group() ;
                // guardBox.addClass( "whileGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                const textElement = guardBox.text("\u27F3").dmove(0, -5);
                guardBox.add( childArray[0].dmove(30, 5) ) ;
                const childBBox : svg.BBox = childArray[0].bbox();
                if(childBBox.y < 5)
                {
                    const childY : number = childBBox.y;
                    childArray[0].dy(5-childY);
                    y += 5-childY;
                }
                if(childBBox.x < 0)
                {
                    childArray[0].dx(-childBBox.x);
                }
                y += childBBox.height + padding;
                const len = findWidthOfLargestChild(childArray)+padding;

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, MAUVE, len, y);

                y += padding;
                const doBox :  svg.G = element.group().dmove(10, y) ;
                // doBox.addClass( "doBox") ;
                // doBox.addClass( "H") ;
                // doBox.addClass( "workplace") ;
                doBox.add( childArray[1] ) ;

                drawHighlightOn = makeFancyBorderSVG(parent, element, MAUVE);
                // result.addClass( "whileBox" ) ;
                // result.addClass( "V" ) ;
                // result.addClass( "workplace" ) ;
            }
            break ;
            case labels.CallWorldLabel.kindConst :
            {
                const childArray = element.children();
                // result.addClass( "callWorld" ) ;
                // result.addClass( "H" ) ;
                const opText = element.text(node.label().getVal());
                const labelString = node.label().getVal() ;

                const padding : number = 10;
                let x : number = 0;
                if(childArray.length === 2 && stringIsInfixOperator(labelString))
                {
                    x += childArray[0].bbox().width + padding;
                    opText.dmove(x, -5);
                    x += opText.bbox().width + padding;
                    childArray[1].dmove(x, 0);
                    const childBBox : svg.BBox = childArray[1].bbox();
                    if(childBBox.x < x)
                    {
                        childArray[1].dx(-childBBox.x);
                    }
                }
                else
                {
                    opText.dmove(0, -5);
                    x += opText.bbox().width + padding;
                    for( let i=0 ; true ; ++i)
                    {
                        if( i === childArray.length ) break ;
                        childArray[i].dmove(x, 0);
                        const bbox = childArray[i].bbox();
                        if(bbox.x < x)
                        {
                            childArray[i].dx(-bbox.x);
                        }
                        x += bbox.width + padding;
                    }
                }

                doCallWorldLabelStylingSVG(opText);
                drawHighlightOn = makeCallWorldBorderSVG(parent, element);
                
            }
            break ;
            case labels.CallLabel.kindConst :
            {
                const childArray = element.children();
                // result.addClass( "call" ) ;
                // result.addClass( "H" ) ;
                // result.attr("type", "text");

                let x : number = 0;
                const padding : number = 10;
                for( let i=0 ; true ; ++i) {
                    if( i === childArray.length ) break ;
                    childArray[i].dmove(x, 0);
                    const bbox = childArray[i].bbox();
                    if(bbox.x < x)
                    {
                        childArray[i].dx(-bbox.x);
                    }
                    x += childArray[i].bbox().width + padding;
                }
                drawHighlightOn = makeCallBorderSVG(parent, element);
            }
            break ;
            case labels.AssignLabel.kindConst :
            {
                const childArray = element.children();
                const padding : number = 10;
                let x : number = 0;

                x += childArray[0].bbox().width + padding;
                const opText : svg.Text = element.text(":=");
                opText.fill(ORANGE);
                opText.dmove(x, -5);
                x += opText.bbox().width + padding;

                childArray[1].dmove(x, 0);
                const childBBox : svg.BBox = childArray[1].bbox();
                if(childBBox.x < x)
                {
                    childArray[1].dx(-childBBox.x);
                }
                makeAssignLabelBorder(element);
            }
            break ;
            case labels.ObjectLiteralLabel.kindConst :
            {
                const childArray = element.children();

                element.dmove(10, 10) ;
                const padding : number = 15;
                let y = 0;

                const guardBox : svg.G = element.group() ;
                // guardBox.addClass( "objectGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                const textElement = guardBox.text("$").dmove(0, -5);
                y += textElement.bbox().height + padding;
                let len = findWidthOfLargestChild(childArray)+padding;
                if(textElement.bbox().width + padding > len)
                {
                    len = textElement.bbox().width + padding;
                }

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, LIGHT_BLUE, len, y);

                y += padding;
                let seqBoxY : number = 0;
                const seqBox :  svg.G = element.group().dmove(10, y) ;
                // doBox.addClass( "seqBox") ;
                // doBox.addClass( "V") ;
                // doBox.addClass( "workplace") ;
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    seqBox.add(childArray[i].dmove(0, seqBoxY));
                    if(childArray[i].bbox().height > 0)
                    {
                        seqBoxY += childArray[i].bbox().height + padding;
                    }
                }
                if(seqBoxY === 0) //i.e. there are no elements in this node
                {
                    seqBox.rect(10,10).opacity(0); //enforce a minimum size for ExprSeq-like nodes.
                }

                drawHighlightOn = makeFancyBorderSVG(parent, element, LIGHT_BLUE);
            }
            break ;
            case labels.ArrayLiteralLabel.kindConst :
            {
                const childArray = element.children();

                element.dmove(10, 10) ;
                const padding : number = 15;
                let y = 0;

                const guardBox : svg.G = element.group() ;
                // guardBox.addClass( "arrayGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                const textElement = guardBox.text("array").dmove(0, -5);
                y += textElement.bbox().height + padding;
                let len = findWidthOfLargestChild(childArray)+padding;
                if(textElement.bbox().width + padding > len)
                {
                    len = textElement.bbox().width + padding;
                }

                doGuardBoxStylingAndBorderSVG(textElement, guardBox, LIGHT_BLUE, len, y);

                y += padding;
                let seqBoxY : number = 0;
                const seqBox :  svg.G = element.group().dmove(10, y) ;
                // doBox.addClass( "seqBox") ;
                // doBox.addClass( "V") ;
                // doBox.addClass( "workplace") ;
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    seqBox.add(childArray[i].dmove(0, seqBoxY));
                    seqBoxY += childArray[i].bbox().height + padding;
                }
                if(seqBoxY === 0) //i.e. there are no elements in this node
                {
                    seqBox.rect(10,10).opacity(0); //enforce a minimum size for ExprSeq-like nodes.
                }

                makeFancyBorderSVG(parent, element, LIGHT_BLUE);
            }
            break ;
            case labels.AccessorLabel.kindConst :
            {
                const childArray = element.children();
                const padding : number = 10;
                let x : number = 0;

                x += childArray[0].bbox().width + padding;
                const leftBracketText : svg.Text = element.text("[");
                leftBracketText.style("font-family : 'Times New Roman', Times,serif;font-weight:bold;font-size:large;");
                leftBracketText.fill(MAUVE.toString());
                leftBracketText.dmove(x, -5);
                x += leftBracketText.bbox().width + padding;

                childArray[1].dmove(x, 0);
                const childBBox : svg.BBox = childArray[1].bbox();
                if(childBBox.x < x)
                {
                    childArray[1].dx(-childBBox.x);
                }
                x += childBBox.width + padding;

                const rightBracketText : svg.Text = element.text("]");
                rightBracketText.style("font-family : 'Times New Roman', Times,serif;font-weight:bold;font-size:large;");
                rightBracketText.fill(MAUVE);
                rightBracketText.dmove(x, -5);

                
                makeSimpleBorder(element, MAUVE);

            }
            break ;
            case labels.DotLabel.kindConst :
            {
                const childArray = element.children();
                const padding: number = 10;
                let x : number = 0;

                x += childArray[0].bbox().width + padding;
                const dotText : svg.Text= element.text( "." + node.label().getVal() );
                dotText.style("font-family : 'Times New Roman', Times,serif;font-weight:bold;font-size:large;");
                dotText.fill(MAUVE.toString());
                dotText.dmove(x,-5);
                x += dotText.bbox().width + padding;
                
                makeSimpleBorder(element, MAUVE);

            }
            break;
            case labels.LambdaLabel.kindConst :
            {

                const childArray = element.children();
                element.dmove(10, 10) ;
                const padding : number = 15;
                let y : number = 0;

                const lambdahead : svg.G = element.group() ;
                // guardBox.addClass( "whileGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                const textElement = lambdahead.text("\u03BB");
                lambdahead.add( childArray[0].dmove(20, 10) ) ;
                y += childArray[0].bbox().height + padding;
                if(y === padding) {y += padding;} //i.e. there are no arguments. This prevents the type from overlapping with the lambda symbol.
                lambdahead.add( childArray[1].dmove(0, y) ) ;
                const len = findWidthOfLargestChild(childArray)+padding;
                y += childArray[1].bbox().height + padding;
                // lambdahead.addClass( "lambdaHeader") ;
                // lambdahead.addClass( "V") ;

                doGuardBoxStylingAndBorderSVG(textElement, lambdahead, LIGHT_BLUE, len, y);
                y += padding;

                const doBox :  svg.G = element.group().dmove(10, y) ;
                // doBox.addClass( "doBox") ;
                // doBox.addClass( "H") ;
                doBox.add( childArray[2] ) ;

                drawHighlightOn = makeFancyBorderSVG(parent, element, LIGHT_BLUE);

                // result.addClass( "lambdaBox" ) ;
                // result.addClass( "V" ) ;
            }
            break ;
            case labels.NullLiteralLabel.kindConst :
            {
                makeNullLiteralSVG(element);
                // result.addClass( "nullLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.VariableLabel.kindConst :
            {
                const text : svg.Text = element.text( node.label().getVal() );
                makeVariableLabelSVG(element, text);
                // result.addClass( "var" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.StringLiteralLabel.kindConst :
            {
                const text : svg.Text = element.text( node.label().getVal() );
                makeStringLiteralSVG(element, text);
                // result.addClass( "stringLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.NumberLiteralLabel.kindConst :
            {
                const text : svg.Text = element.text( node.label().getVal() );
                makeNumberLiteralSVG(element, text);
                // result.addClass( "numberLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.NoTypeLabel.kindConst :
            {
                makeNoTypeLabelSVG(element);
                // result.addClass( "noType" ) ; 
                // result.addClass( "V" ) ;
            }
            break ;
            case labels.NoExprLabel.kindConst :
            {
                makeNoExprLabelSVG(element);
                // result.addClass( "expOp" ) ; // Need a better class for this, I think.
                // result.addClass( "V" ) ;
            }
            break ;
            case labels.VarDeclLabel.kindConst :
            {

                const childArray = element.children();

                const padding : number = 10;
                let x : number = 0;

                const delta : svg.Text = element.text("\u03B4");
                delta.fill(GHOSTWHITE);
                delta.dmove(0, -5); //testing

                x += delta.bbox().width + padding;
                childArray[0].dmove(x, 0); 

                x += childArray[0].bbox().width + padding;
                const colon : svg.Text = element.text(":");
                colon.fill(GHOSTWHITE).dmove(x, -5);

                x += colon.bbox().width + padding;
                childArray[1].dmove(x, 7);

                x += childArray[1].bbox().width + padding;
                const becomes : svg.Text = element.text(":=");
                becomes.fill(GHOSTWHITE).dmove(x, -5);

                x += becomes.bbox().width + padding;
                childArray[2].dmove(x, 0);
                const childBBox : svg.BBox = childArray[2].bbox();
                if(childBBox.x < x)
                {
                    childArray[2].dx(-childBBox.x);
                }

                makeSimpleBorder(element, GHOSTWHITE );

                // result.addClass( "vardecl" ) ;
                // result.addClass( "H" ) ;;
            }
            break ;
            default:
            {
                assert.unreachable( "Unknown label in buildSVG: " + kind.toString() + ".") ;
            } 
        }
        if(shouldHighlight)
        {
            highlightThis(drawHighlightOn);
        }
        if(isError)
        {
            if(error === "")
            {
                error = "Unknown error";
            }
            const elementBBox : svg.BBox = element.bbox();
            const text : svg.Text = element.text( "Error: " + error );
            text.dy(elementBBox.height + 15);
            makeErrorSVG(element, text);
            return;
        }
    }

    function buildSVGForMappedNode(element : svg.G, parent : svg.Container, value : Value, drawNestedObjects : boolean = true) : void
    {
        if(value.isNullV())
        {
            makeNullLiteralSVG(element);
            return;
        }
        if(value.isDoneV())
        {
            // const text : svg.Text = element.text( "Done" );
            // makeDoneSVG(element, text);
            return;
        }
        if(value.isStringV())
        {
            const text : svg.Text = element.text( value.toString() );
            makeStringLiteralSVG(element, text);
            return;
        }
        if(value.isClosureV())
        {
            const text : svg.Text = element.text("Closure");
            makeClosureSVG(element, text);
            return;
        }
        if(value.isBuiltInV())
        {
            const text : svg.Text = element.text("Built-in");
            makeBuiltInSVG(element, text);
            return;
        }
        if(value.isObjectV())
        {
            if(!drawNestedObjects && !objectsToDraw.includes(value as ObjectV))
            {
                const text : svg.Text = element.text("Object");
                makeObjectSVG(element, text);
                return;
            }
            if(!objectsToDraw.includes(value as ObjectV))
            {
                objectsToDraw.push(value as ObjectV);
            }
            const arrowStartPoint : svg.Rect = element.rect(10, 10).fill(WHITE).opacity(1).dy(10);
            if(!arrowStartPoints.has(value as ObjectV))
            {
                arrowStartPoints.set(value as ObjectV, new Array<svg.Rect>());
            }
            const myArray : Array<svg.Rect> = arrowStartPoints.get(value as ObjectV) as Array<svg.Rect>;
            myArray.push(arrowStartPoint);
            return;
        }
        assert.unreachable("Found value with unknown type");
    }

    export function buildObjectArea(element : svg.G) : void
    {
        let y = 0;
        const padding : number = 15;
        
        if (objectsToDraw.length !== 0)
        {
            //As the object area is drawn, more objects may be discovered to draw. If we have a very large tree, this could be an issue as it would take up
            //a lot of space. As more objects are found that need to be drawn, the objectsToDraw array will grow. By storing the original length, we can
            //know when we've stopped drawing objects that were found outside of the object area. If we use this knowledge to stop drawing more objects
            //once we've hit objects that were not found outside of the object area, we can effectively limit the object search to a depth of 2 objects from the
            //main code or stack.
            const originalLength = objectsToDraw.length;
            for (let k = 0; k < objectsToDraw.length; k++){
                const obj : ObjectI = objectsToDraw[k];
                if(k !== 0)
                {
                    y += padding;
                }
                const drawNestedObjects : boolean = (k < originalLength);
                const objectGroup : svg.Rect = drawObject(obj, element, y, drawNestedObjects);
                drawnObjectsMap.set(obj, objectGroup);
                y += objectGroup.bbox().height;
            }
        }
        return;
    }

    // I assume at this point that all objects which need to be drawn have been drawn.
    export function drawArrows(element : svg.G, parent : svg.Container) : void
    {
        for(const obj of objectsToDraw)
        {
            if(drawnObjectsMap.has(obj as ObjectI) && arrowStartPoints.has(obj))
            {
                const objectGroup : svg.Rect = drawnObjectsMap.get(obj as ObjectI) as svg.Rect;
                const arrowStarts : Array<svg.Rect> = arrowStartPoints.get(obj) as Array<svg.Rect>;
                //This awful looking assignment gets the coordinates of the object's SVG representation relative to the parent document.
                const objectGroupRBox : svg.Box = objectGroup.rbox().transform(parent.screenCTM().inverse());
                for(const start of arrowStarts)
                {
                    const startRBox : svg.Box = start.rbox().transform(parent.screenCTM().inverse());
                    let arrowPathString = "M" + startRBox.cx + "," +  startRBox.cy + " L" + (objectGroupRBox.x - 25) + "," + (objectGroupRBox.y + 5) + " H" + (objectGroupRBox.x - 6);
                    //The arrow points to the top left corner of the box by default.
                    if(startRBox.cx >= objectGroupRBox.cx && startRBox.cy <= objectGroupRBox.y2) //The arrow needs to point to the top right corner
                    {
                        arrowPathString = "M" + startRBox.cx + "," +  startRBox.cy + " L" + (objectGroupRBox.x2 + 25) + "," + (objectGroupRBox.y + 5) + " H" + (objectGroupRBox.x2 + 6);
                    }
                    else if(startRBox.cx <= objectGroupRBox.cx && startRBox.cy >= objectGroupRBox.y2) //The arrow needs to point to the bottom left corner
                    {
                        arrowPathString = "M" + startRBox.cx + "," +  startRBox.cy + " L" + (objectGroupRBox.x - 25) + "," + (objectGroupRBox.y2 - 5) + " H" + (objectGroupRBox.x - 6);
                    }
                    else if(startRBox.cx >= objectGroupRBox.cx && startRBox.cy >= objectGroupRBox.y2) //The arrow needs to point to the bottom right corner
                    {
                        arrowPathString = "M" + startRBox.cx + "," +  startRBox.cy + " L" + (objectGroupRBox.x2 + 25) + "," + (objectGroupRBox.y2 - 5) + " H" + (objectGroupRBox.x2 + 6);
                    }
                    const arrow : svg.Path = element.path(arrowPathString);
                    arrow.stroke({color: WHITE, opacity: 1, width: 1.5});
                    arrow.fill({opacity : 0});
                    arrow.marker("end", 10, 7, function(add){
                        add.polygon("0,0 10,3.5 0,7");
                        add.fill(WHITE);
                    });
                }
            }
            else
            {
                assert.check(false, "Failed to draw object.");
            }
        }
        return;
    }

    function doGuardBoxStylingAndBorderSVG(text: svg.Text | null, guardBox : svg.G, colour : string, lineLength : number, lineY : number) : void
    {
        if(text !== null)
        {
            text.fill(colour); //It would throw an error unless I did this
            text.style("font-size: large");
        }
        const bounds = guardBox.bbox();
        const line = guardBox.line(bounds.x - 5, lineY, bounds.x + lineLength + 5, lineY);
        line.stroke({color: colour, opacity: 1, width: 4});
        line.attr("stroke-dasharray", "10, 10");
    }
    
    function makeThenBoxSeparatorSVG(ifBox : svg.G, y : number) : void
    {
        const sepX1 = ifBox.bbox().x;
        const sepX2 = ifBox.bbox().x2;
        const line = ifBox.line(sepX1, y, sepX2, y);
        line.stroke({color: MAUVE, opacity: 1, width: 4});
    }

    function doCallWorldLabelStylingSVG(textElement : svg.Text) : void
    {
        textElement.fill(MAUVE);
        textElement.style("font-family:'Times New Roman', Times,serif;font-weight: bold ;font-size: large ;");
    }

    function makeCallWorldBorderSVG(base : svg.Container, el : svg.Container) : svg.G
    {
        const borderGroup = base.group(); //In order to keep it organized nicely
        borderGroup.add(el);
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = borderGroup.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
        return borderGroup;
    }

    function makeCallBorderSVG(base : svg.Container, el : svg.Container) : svg.G
    {
        const borderGroup = base.group(); //In order to keep it organized nicely
        borderGroup.add(el);
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = borderGroup.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
        return borderGroup;
    }

    function makeFancyBorderSVG(base : svg.Container, el : svg.Container, colour : string) : svg.G
    {
        const containerGroup = base.group(); //In order to keep it organized nicely
        containerGroup.add(el);
        const borderGroup = containerGroup.group();
        const bounds : svg.BBox = el.bbox();
        const x = bounds.x + 5;
        const y = bounds.y + 10;
        const x2 = bounds.x2 + 10;
        const y2 = bounds.y2 + 10;
        const topBorderPathString = "M" + (x + 5) + ',' + (y - 5) + " H" + (x2 - 5) + " A10,10 0 0,1 " + (x2 + 5) + ',' + (y + 5);
        const topBorder = borderGroup.path(topBorderPathString);
        topBorder.stroke({color: colour, opacity: 1, width: 4}).fill({opacity:0});
        const botBorderPathString = "M" + (x + 5) + ',' + (y2 + 15) + " H" + (x2 - 5) + " A10,10 0 0,0 " + (x2 + 5) + ',' + (y2 + 5);
        const botBorder = borderGroup.path(botBorderPathString);
        botBorder.stroke({color: colour, opacity: 1, width: 4}).fill({opacity:0});
        const rightBorder = borderGroup.line(x2 + 6, y2 + 5.5, x2 + 6, y + 4.5);
        rightBorder.stroke({color: colour, opacity: 1, width: 1.5});
        const leftBorderPathString = "M" + (x + 5.5) + ',' + (y - 7) + "A10,10 0 0,0 " + (x - 3) + ',' + (y + 3) + "V" + (y2 + 7)
                                 + "A10,10 0 0,0 " + (x + 5.5) + ',' + (y2 + 17) + 'Z'; //These odd numbers allow me to approximate the CSS representation pretty well.
        const leftBorder = borderGroup.path(leftBorderPathString);
        leftBorder.stroke({color: colour, opacity: 1, width: 0});
        leftBorder.fill(colour);
        return containerGroup;
    }

    //I assume textElement is already contained within base.
    function makeVariableLabelSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: ORANGE, opacity: 1, width: 1.5});
    }

    function makeExprPlaceholderSVG(base : svg.Container) : void
    {
        const textElement : svg.Text = base.text( "..." );
        textElement.fill(ORANGE);
        textElement.style("font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: ORANGE, opacity: 1, width: 1.5});
    }

    //I assume textElement is already contained within base.
    function makeNumberLiteralSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE, opacity: 1, width: 1.5});
    }
    
    //I assume textElement is already contained within base.
    function makeStringLiteralSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(WHITE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE, opacity: 1, width: 1.5});
    }

    //I assume textElement is already contained within base.
    function makeErrorSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(WHITE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: RED, opacity: 1, width: 1.5});
    }

    function makeNullLiteralSVG(base : svg.Container) : void
    {
        const textElement : svg.Text = base.text( "\u23da" ) ;  // The Ground symbol. I hope.
        textElement.dy(10); //The ground character is very large. This makes it look a bit better.
        textElement.fill(WHITE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: bold ;font-size: x-large ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE, opacity: 1, width: 1.5});
    }

    function makeAssignLabelBorder(el : svg.Container) : void
    {
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = el.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: ORANGE, opacity: 1, width: 1.5});
    }

    function makeSimpleBorder(el : svg.Container, color : string ) : void
    {
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = el.rect(bounds.width + 10, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: color, opacity: 1, width: 1.5});
    }

    function makeNoTypeLabelSVG(el: svg.Container) : void
    {
        const label = el.rect(20,20);
        label.radius(5);
        label.fill({opacity: 0});
        label.stroke({color: GRAY, opacity: 1, width: 1.5});
    }

    function makeNoExprLabelSVG(el: svg.Container) : void
    {
        const label = el.rect(20,20);
        label.radius(5);
        label.fill({opacity: 0});
        label.stroke({color: GHOSTWHITE, opacity: 1, width: 1.5});
    }

    function makeObjectBorderSVG(base : svg.Container, el : svg.Element) : svg.Rect
    {
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 8, bounds.height + 8);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(2);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE.toString(), opacity: 1, width: 1.5});
        return outline;
}

    //I assume textElement is already contained within base.
    function makeClosureSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
    }

    //I assume textElement is already contained within base.
    function makeBuiltInSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
    }

    //I assume textElement is already contained within base.
    function makeObjectSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
    }

    //I assume textElement is already contained within base.
    function makeDoneSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: normal ;font-size: medium ;");
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
    }

    function findWidthOfLargestChild(arr : svg.Element[]) : number
    {
        let result : number = 0;
        for(let i = 0; i < arr.length; i++)
        {
            const width = arr[i].bbox().width;
            if(width > result)
            {
                result = width;
            }
        }
        return result;
    }

    function findCombinedHeight(arr : svg.Element[]) : number
    {
        let result : number = 0;
        for(let i = 0; i < arr.length; i++)
        {
            result = result + arr[i].bbox().height;
            
        }
        return result;
    }

    function highlightThis(el : svg.Container) : void
    {
        const bounds : svg.BBox = el.bbox();
        const outline : svg.Rect = el.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: WHITE, opacity: 1, width: 1.5});
    }
}

export = animatorHelpers;
