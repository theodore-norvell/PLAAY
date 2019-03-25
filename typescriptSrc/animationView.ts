/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="treeView.ts" />
/// <reference path="values.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import labels = require('./labels');
import pnode = require('./pnode');
import treeView = require('./treeView');
import values = require('./values');
import vms = require('./vms');
import * as svg from "svg.js";

/** The animatorHelpers module looks after the conversion of trees to SVG.*/
module animationView 
{
    import list = collections.list;
    import List = collections.List;
    import Cons = collections.cons;
    import Nil = collections.nil;
    import Option = collections.Option;
    import some = collections.some;
    import none = collections.none;
    // path is an alias for list<number>
    import PNode = pnode.PNode;
    import ObjectV = values.ObjectV;
    import StringV = values.StringV;
    import ValueMap = vms.ValueMap;
    import Value = vms.Value;
    import ObjectI = vms.ObjectI;
    import TupleV = values.TupleV;
    import LocationV = values.LocationV;

    import stringIsInfixOperator = treeView.stringIsInfixOperator;
    import TRUEMARK  = treeView.TRUEMARK ;
    import FALSEMARK = treeView.FALSEMARK ;
    import WHILEMARK = treeView.WHILEMARK ;
    import LAMBDAMARK = treeView.LAMBDAMARK ;
    import NULLMARK = treeView.NULLMARK ;
    import FUNCTIONMARK = treeView.FUNCTIONTYPE ;

    const MAUVE : string = "rgb(190, 133, 197)";
    const ORANGE : string = "rgb(244, 140, 0)";
    const LIGHT_BLUE : string = "rgb(135, 206, 250)";
    const GHOSTWHITE : string = "rgb(248, 248, 255)";
    const WHITE : string = "rgb(255, 255, 255)";
    const GRAY : string = "rgb(153, 153, 153)";
    const RED : string = "rgb(200, 0, 0)";
    const GREEN : string = "rgb(0,200,0)";
    const YELLOW : string = "rgb(242, 231, 21)";

    const varStyle      = 'font-family: "Times New Roman", Times,serif; font-weight: normal; font-style: normal; font-size: large;' ;
    const textBoldStyle = 'font-family: "Times New Roman", Times,serif; font-weight: bold;   font-style: normal; font-size: large;' ;
    const textStyle     = 'font-family: "Times New Roman", Times,serif; font-weight: bold;   font-style: normal; font-size: large;' ;
    const literalStyle  = 'font-family: "Lucida Console", monospace;    font-weight: normal; font-style: normal; font-size: medium ;' ;
    const errorStyle    = 'font-family: "Times New Roman", Times,serif; font-weight: normal; font-style: normal; font-size: medium;' ;

    

    let objectsToDraw : Array<ObjectI> = new Array<ObjectI>();
    let arrowStartPoints : Map<ObjectI, Array<svg.Rect>> = new Map<ObjectI, Array<svg.Rect>>();
    let drawnObjectsMap : Map<ObjectI, svg.Rect> = new Map<ObjectI, svg.Rect>();

    export function clearObjectDrawingInfo() : void
    {
        objectsToDraw = new Array<ObjectV>();
        arrowStartPoints = new Map<ObjectV, Array<svg.Rect>>();
        drawnObjectsMap = new Map<ObjectI, svg.Rect>();
    }

    /**
     * 
     * @param node A tree node to render.
     * @param el A container to render the tree into.
     * @param currentPath The path to the current node relative to the root of an Evaluation.
     * @param pathToHighlight The path of the node to highlight relative to the root of an Evaluation.
     *                        If there is no highlight, list( -1 ) can be used.
     * @param valueMap A value map from the same Evaluation.
     * @param error  An error message.
     * @param errorPath The node that the message applies to. If there is no error, list( -1 ) can be used.
     */
    export function traverseAndBuild(node:PNode, el : svg.Container, currentPath : List<number>, pathToHighlight : List<number>,
                                     valueMap : ValueMap, error : string, errorPath : List<number>) : void
    {
        const children : svg.G = el.group();
        if(valueMap.isMapped(currentPath) ) 
        {
            buildSVGForMappedNode(children, valueMap.get(currentPath), true);
        }
        else {
            for(let i = 0; i < node.count(); i++)
            {
                traverseAndBuild(node.child(i), children, currentPath.cat( list(i) ), pathToHighlight, valueMap, error, errorPath);
            }
            const highlightMe : boolean = currentPath.equals(pathToHighlight);
            const optError : Option<string> = currentPath.equals(errorPath) ? some(error) : none() ;
            buildSVG(node, children, el, highlightMe, currentPath, optError);
        }
    }

    export function buildStack(stk : vms.EvalStack, el : svg.Container) : void
    {
        //const stkGroup : svg.G = el.group().attr('preserveAspectRatio', 'xMaxYMin meet');
        let y = 0;
        const padding : number = 15;
        
        if (stk.notEmpty()){
            const vars : vms.VarStack = stk.get(stk.getSize()-1).getStack();
            const varstackSize : number = vars.getAllFrames().length;
            const frameArray : ObjectI[] = vars.getAllFrames();
            
            for (let k = 0; k < varstackSize && k < 10; k++){
                if(k !== 0) { y += padding; }
                y += drawObject(frameArray[k], el, y).bbox().height;
            }
        }
    }

    function drawObject(object : ObjectI, element : svg.Container, y : number, drawNestedObjects : boolean = true) : svg.Rect
    {
        
        const result : svg.G = element.group();
        const numFields : number = object.numFields();
        for (let j = 0; j < numFields; j++){
            const field : vms.FieldI = object.getFieldByNumber(j);
            const subGroup : svg.G = result.group();
            const name : svg.Text = subGroup.text("  " + field.getName());
            name.style( varStyle ) ;
            const el : svg.G = subGroup.group();
            const optVal = field.getValue() ;
            if( optVal.isEmpty() ) {
                // Field not initialized. Do nothing.
            } else {
                buildSVGForMappedNode(el, optVal.first(), drawNestedObjects); }
            makeObjectFieldSVG(subGroup, name, el);
                          
            subGroup.dmove(10, y + 5);
            y += subGroup.bbox().height + 5;
        }
        let border : svg.Rect ;
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

    function drawLocation(loc : LocationV, element : svg.Container, x : number) : void
    {
        // TODO. Ensure that each location is drawn only once.
        const opt = loc.getValue() ;           
        const el : svg.G = element.group();
        opt.choose(
            (val : Value) => {

                buildSVGForMappedNode(el, val, true);  
            },
            () => {}
        ) ;
        makeLocationBorderSVG(element, el);
    }

    function drawTuple(tuple : TupleV, element : svg.Container, x : number) : svg.Rect
    {
        const children = Array<svg.G>() ;
        const itemCount : number = tuple.itemCount();
        for (let i = 0; i < itemCount; i++) {
            const value : Value = tuple.getItemByIndex(i);
            const el : svg.G = element.group();
            buildSVGForMappedNode(el, value, true);
            children.push( el ) ; 
        }
        const seqBox = layOutTuple( element, children, LIGHT_BLUE ) ;
        let border = makeObjectBorderSVG(element, seqBox);
        return border;
    }

    function layOutTuple(element : svg.Container, children : svg.Element[], colour : string) : svg.G
    {
        const spaceInsideBracket = 10 ;
        const spaceBeforeComma = 1 ;
        const spaceAfterComma = 7 ;
        const seqBox : svg.G = element.group();
        const leftBracketText : svg.Text= element.text( "(" ) ;
        leftBracketText.style( textStyle ) ;
        leftBracketText.fill( colour ) ;
        let seqBoxX : number = 0 ;
        seqBox.add(leftBracketText.dmove(seqBoxX, 0)) ; 
        seqBoxX += leftBracketText.bbox().width + spaceInsideBracket ; 

        for (let i = 0; i < children.length; i++) {
            const el : svg.Element = children[i] ;
            seqBox.add( el.dmove(seqBoxX, 0) ) ;  
            seqBoxX += el.bbox().width ;
            if(i !== children.length - 1) {
                const comma : svg.Text= element.text( "," ) ;
                comma.style( textStyle ) ;
                comma.fill( colour ) ;
                seqBoxX += spaceBeforeComma ;
                seqBox.add(comma.dmove(seqBoxX+1,0)) ;
                seqBoxX += comma.bbox().width + spaceAfterComma ; 
            }
        }
        if( children.length > 0 ) seqBoxX += spaceInsideBracket ;
        const rightBracketText : svg.Text= element.text( ")") ;
        rightBracketText.style( textStyle ) ;
        rightBracketText.fill( colour ) ;
        seqBox.add( rightBracketText.dmove(seqBoxX, 0)) ;
        return seqBox ;
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

    /** Translate a tree of nodes into SVG
     * 
     * @param node -- The tree to be rendered
     * @param element -- An SVG group initially containing the renderings of the children of the node.
     * @param parent -- A container that initially contains element and maybe other things.
     * @param shouldHighlight -- Should the tree be high-lighted. 
     * @param myPath -- The path for the tree relative to the root of the Evaluation
     * @param optError -- An optional error string.
     * 
     * By the end of the execution of buildSVG, the rendering of the node is added to the parent group
     * and the element has been removed.  (In at least one case the rendering is element and so it is not
     * removed from parent and nothing is added.  The first example below illustrates this. The second
     * example illustrates the typical case where element is moved under a new group and the new group is added.)
     * <p>
     * The rendering should have its upper left corner near the origin, but that corner may be above or to the right.
     * <p>
     * Example 0: consider rendering node ExprSeq( e0, e1 ). Suppose that e0 and e1 have already been rendered as
     * svg elements s0 and s1. The bounding boxes of s0 and s1 should have their upper left corner near (0,0).
     * (It seems to me that these corners should be exactly at (0,0), but the way the code is written they could be
     * slightly above or to the left of the origin.  This explains the various fixups to push elements right or down!)
     * When this routine starts we have
     * <pre>
     *           parent
     *          /      \
     *       element  others
     *         /   \
     *        s0    s1
     * </pre>
     * The other children of parent (shown as 'others' in the diagram) will typically be the rederings of
     * the node's left siblings in the tree.
     * <p>
     * On exit from the routine, we have exactly the same picture; s0 and s1 have been moved to the right if
      they are left of the origin.  s1 will have been moved down below s0.
     * <p>
     * Example 1: A more interesting example is Call( e0, e0 ) where again e0 and e1 have been rendered as s0 and s1.
     * The initial picture is as above. The final picture looks like this
     * <pre>
     *           parent
     *          /      \
     *       group  others
     *         / \
     *    element brect
     *     /   \
     *    s0    s1
     * </pre>
     * where group is a new group and brect is a new rectangle displaying the border.
     * s0 and s1 will have been moved appropriately.
     * <p>
     * Example 2: In Example 1, if shouldHighLight were true, there would be an additional rectagle
     * added to the group, like this
     * <pre>
     *             parent
     *            /      \
     *         group     others
     *         /  |  \
     *  element brect hrect
     *     /   \
     *    s0    s1
     * </pre>
     * where hrect is the higlighting rectangle.
     * <p>
     * Example 3: If in addition there was an error on this call we would end up in this situation
     * 
     * <pre>
     *             parent
     *            /      \
     *         group     others
     *         /  |  \
     *  element brect hrect
     *  / |  | \
     * s0 s1 t  r
     * </pre>
     * where t is a text element and r is a rectangle that supplies a border to the error message.
     * (I'm not sure why t and r are added to element rather than group. However since brect and hrect
     * are added first, they are positioned as if t and r weren't there, so it works out looking ok.)
     */
    function buildSVG(node : PNode, element : svg.G, parent : svg.Container, shouldHighlight : boolean, myPath : List<number>,
                      optError : Option<string>) : void
    {
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
                const textElement = guardBox.text(WHILEMARK).dmove(0, -5);
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
            case labels.CallVarLabel.kindConst :
            {
                const childArray = element.children();
                // result.addClass( "callVar" ) ;
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

                doCallVarLabelStylingSVG(opText);
                drawHighlightOn = makeCallVarBorderSVG(parent, element);
                
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
            case labels.LocLabel.kindConst :
            {
                const child = element.children()[0];
                const padding : number = 10;
                let x : number = 0;

                const opText : svg.Text = element.text("loc");
                opText.fill(ORANGE);
                opText.dmove(x, -5);
                x += opText.bbox().width + padding;

                child.dmove(x, 0);
                const childBBox : svg.BBox = child.bbox();
                if(childBBox.x < x)
                {
                    child.dx(-childBBox.x);
                }
                makeAssignLabelBorder(element);
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
                leftBracketText.style( textStyle );
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
                rightBracketText.style( textStyle );
                rightBracketText.fill(MAUVE);
                rightBracketText.dmove(x, -5);

                makeSimpleBorder(element, MAUVE, 10);
            }
            break ;
            case labels.DotLabel.kindConst :
            {
                const childArray = element.children();
                const padding: number = 0;
                let x : number = padding;
                x += childArray[0].bbox().width + padding;
                const dotText : svg.Text= element.text( "." + node.label().getVal() );
                dotText.style( varStyle );
                dotText.fill(MAUVE);
                dotText.dmove(x,-5);
                x += dotText.bbox().width + padding;
                
                makeSimpleBorder(element, MAUVE, 10);
            }
            break;
            case labels.LambdaLabel.kindConst :
            {

                const childArray = element.children();
                const paramterList: svg.Element = childArray[0] ;
                const returnType: svg.Element = childArray[1] ;
                const functionBody : svg.Element = childArray[2]
                element.dmove(10, 10) ;
                const padding : number = 15;
                let y : number = 0;

                const lambdahead : svg.G = element.group() ;
                // guardBox.addClass( "whileGuardBox") ;
                // guardBox.addClass( "H") ;
                // guardBox.addClass( "workplace") ;
                const textElement = lambdahead.text(LAMBDAMARK);
                lambdahead.add( paramterList.dmove(20, 10) ) ;
                y += paramterList.bbox().height + padding;
                if(y === padding) {y += padding;} //i.e. there are no arguments. This prevents the type from overlapping with the lambda symbol.
                const arrowSymbol = lambdahead.text( FUNCTIONMARK ) ;
                arrowSymbol.fill(LIGHT_BLUE); 
                arrowSymbol.style( textBoldStyle );
                lambdahead.add( arrowSymbol.dmove( 0, y ) ) ;
                lambdahead.add( returnType.dmove( arrowSymbol.bbox().width+5, y ) ) ;
                const len = findWidthOfLargestChild(childArray)+padding;
                y += returnType.bbox().height + padding;
                // lambdahead.addClass( "lambdaHeader") ;
                // lambdahead.addClass( "V") ;

                doGuardBoxStylingAndBorderSVG(textElement, lambdahead, LIGHT_BLUE, len, y);
                y += padding;

                const doBox :  svg.G = element.group().dmove(10, y) ;
                // doBox.addClass( "doBox") ;
                // doBox.addClass( "H") ;
                doBox.add( functionBody ) ;

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
                makeStringLiteralSVG(element, node.label().getVal());
                // result.addClass( "stringLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.NumberLiteralLabel.kindConst :
            {
                const text : svg.Text = element.text( node.label().getVal() );
                makeSimpleValueSVG(element, text);
                // result.addClass( "numberLiteral" ) ;
                // result.addClass( "H" ) ;
            }
            break ;
            case labels.TupleLabel.kindConst :
            {
                const childArray = element.children();
                const seqBox = layOutTuple( element, childArray, LIGHT_BLUE ) ;
                makeSimpleBorder(element, LIGHT_BLUE, 10);
            }
            break ;
            case labels.BooleanLiteralLabel.kindConst :
            {
                if(node.label().getVal() === "true") {
                    const text : svg.Text = element.text( TRUEMARK );
                    makeBooleanLiteralSVG(element,text,true);
                }
                else {
                    const text : svg.Text = element.text( FALSEMARK );
                    makeBooleanLiteralSVG(element,text,false);
                }
            }
            break;
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
                const variableSVG = childArray[0] ;
                const typeSVG = childArray[1] ;
                const initialValueSVG = childArray[2] ;

                const padding : number = 5;
                let x : number = 0;

                const label = node.label() as labels.VarDeclLabel ;
                const isConst = label.declaresConstant() ;
                const delta : svg.Text = element.text(isConst ? "" : "loc");
                delta.fill(ORANGE);

                x += delta.bbox().width + padding;
                variableSVG.dmove(x, 0); 

                x += variableSVG.bbox().width + padding;
                const colon : svg.Text = element.text(":");
                colon.fill(ORANGE).dmove(x, -10);

                x += colon.bbox().width + padding;
                typeSVG.dmove(x, 0);
                x += typeSVG.bbox().width + padding;

                if( node.child(2).isExprNode() ) {
                    const becomes : svg.Text = element.text(":=");
                    becomes.fill(ORANGE).dmove(x, -10);
                    x += becomes.bbox().width + padding;
                }
                initialValueSVG.dmove(x, 0);
                const childBBox : svg.BBox = initialValueSVG.bbox();
                if(childBBox.x < x)
                {
                    initialValueSVG.dx(-childBBox.x);
                }

                makeSimpleBorder(element, ORANGE, 10 );

                // result.addClass( "vardecl" ) ;
                // result.addClass( "H" ) ;;
            }
            break ;
            //types
            case labels.PrimitiveTypesLabel.kindConst :
            {
                const label = node.label() as labels.PrimitiveTypesLabel;
                let textElement : svg.Text;
                switch (label.type) {
                    case "stringType" :
                        textElement = element.text(treeView.STRINGTYPE);
                        break;
                    case "numberType" :
                        textElement = element.text(treeView.NUMBERTYPE);
                        break;
                    case "integerType" :
                        textElement = element.text(treeView.INTEGERTYPE);
                        break;
                    case "booleanType" :
                        textElement = element.text(treeView.BOOLEANTYPE);
                        break;
                    case "natType" :
                        textElement = element.text(treeView.NATTYPE);
                        break;
                    case "nullType" :
                        textElement = element.text(NULLMARK);
                        break;
                    case "topType" :
                        textElement = element.text(treeView.TOPTYPE);
                        break;
                    case "bottomType" :
                        textElement = element.text(treeView.BOTTOMTYPE);
                        break;
                    default:
                        assert.unreachable("Unknown primitive type in buildSVG: " + kind.toString() +".");
                        textElement = element.text("");
                }
                makePrimitiveTyeSVG(element,textElement);
            }
            break;
            case labels.TupleTypeLabel.kindConst :
            {
                const childArray = element.children();
                const seqBox = layOutTuple( element, childArray, YELLOW ) ;
                makeSimpleBorder(element, YELLOW, 10);
            }
            break;
            case labels.FunctionTypeLabel.kindConst :
            {
                const childArray = element.children();

                const padding : number = 5;
                let x : number = 0;

                x += childArray[0].bbox().width + padding;
                const arrow : svg.Text = element.text(treeView.FUNCTIONTYPE);
                arrow.fill(YELLOW).dmove(x, -5);

                x += arrow.bbox().width + padding;
                childArray[1].dmove(x, 0);

                x += childArray[1].bbox().width + padding;
                const childBBox : svg.BBox = childArray[1].bbox();
                if(childBBox.x < x)
                {
                    childArray[1].dx(-childBBox.x);
                }

                makeSimpleBorder(element, YELLOW );
            }
            break;
            case labels.LocationTypeLabel.kindConst :
            {
                const childArray = element.children();
                makeSimpleBorder(element,YELLOW);
            }
            break;
            case labels.FieldTypeLabel.kindConst :
            {
                const childArray = element.children();

                const padding : number = 5;
                let x : number = 0;

                x += childArray[0].bbox().width + padding;
                const colon : svg.Text = element.text(":");
                colon.fill(YELLOW).dmove(x, 0);

                x += colon.bbox().width + padding;
                childArray[1].dmove(x, 0);

                x += childArray[1].bbox().width + padding;
                const childBBox : svg.BBox = childArray[1].bbox();
                if(childBBox.x < x)
                {
                    childArray[1].dx(-childBBox.x);
                }

                makeSimpleBorder(element, YELLOW ); 
            }
            break;
            case labels.JoinTypeLabel.kindConst :
            {
                const childArray = element.children();
                let seqBoxX : number = 0;
                const padding : number = 15;
                const seqBox :  svg.G = element.group().dmove(10, 0) ;
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    seqBox.add(childArray[i].dmove(seqBoxX, 0));
                    if( i !== childArray.length - 1) {
                        const pipe : svg.Text= element.text(treeView.JOINTYPE);
                        pipe.style("font-family : 'Times New Roman', Times,serif;font-weight:bold;font-size:large;");
                        pipe.fill(YELLOW.toString());
                        seqBox.add(pipe.dmove(childArray[i].bbox().width +seqBoxX + 10 , -5));
                    }                    
                    seqBoxX += childArray[i].bbox().width + 25;
                    
                }
                if(seqBoxX === 0)
                {
                    seqBox.rect(10,10).opacity(0);
                }
                
                makeSimpleBorder(element,YELLOW,10);
                
            }
            break;
            case labels.MeetTypeLabel.kindConst :
            {
                const childArray = element.children();
                let seqBoxX : number = 0;
                const seqBox :  svg.G = element.group().dmove(10, 0) ;
                for (let i = 0; true; ++i) {
                    if (i === childArray.length) break;
                    seqBox.add(childArray[i].dmove(seqBoxX , 0));
                    if( i !== childArray.length - 1) {
                        const amp : svg.Text= element.text(treeView.MEETTYPE);
                        amp.style("font-family : 'Times New Roman', Times,serif;font-weight:bold;font-size:large;");
                        amp.fill(YELLOW.toString());
                        seqBox.add(amp.dmove(childArray[i].bbox().width +seqBoxX + 10 , -5));
                    }                    
                    seqBoxX += childArray[i].bbox().width + 35;
                    
                }
                if(seqBoxX === 0)
                {
                    seqBox.rect(10,10).opacity(0);
                }
                
                makeSimpleBorder(element,YELLOW,10);
            }
            break;
            default:
            {
                assert.unreachable( "Unknown label in buildSVG: " + kind.toString() + ".") ;
            } 
        }
        if(shouldHighlight)
        {
            highlightThis(drawHighlightOn);
        }
        optError.map( (errString) => makeErrorSVG(element, errString) ) ;
    }

    /**
     * @param element is an intially empty group that will be contain the SVG rendering of the value.
     */
    function buildSVGForMappedNode(element : svg.G, value : Value, drawNestedObjects : boolean) : void
    {
        if(value.isNullV())
        {
            makeNullLiteralSVG(element);
            return;
        }
        if(value.isTupleV())
        {   
            const tup : TupleV = value as TupleV;
            drawTuple(tup,element,0);

            return;
        } 
        if( value.isLocationV() ) {
            const loc = value as LocationV ;
            drawLocation(loc,element,0) ;

            return ;
        }
        if(value.isStringV())
        {
            makeStringLiteralSVG(element, (value as StringV).getVal() );
            return;
        }
        if(value.isNumberV())
        {
            // TODO. Use the correct unparsing routine.
            const num : svg.Text = element.text ( value.toString() );
            makeSimpleValueSVG(element, num);
            return;
        }
        if(value.isBoolV())
        {
            if(value === values.BoolV.trueValue) {
                const bool : svg.Text = element.text( TRUEMARK );
                makeBooleanLiteralSVG(element,bool,true);
            }
            else {
                const bool : svg.Text = element.text( FALSEMARK );
                makeBooleanLiteralSVG(element,bool,false);
            }  
            return;          
        }
        if(value.isClosureV())
        {
            const text : svg.Text = element.text("Closure");
            makeSimpleValueSVG(element, text);
            return;
        }
        if(value.isBuiltInV())
        {
            const text : svg.Text = element.text("Built-in");
            makeSimpleValueSVG(element, text);
            return;
        }
        if(value.isObjectV())
        {
            // If we haven't already decided to put this object in the 
            // objectsToDraw area and drawNestedObjects is false, we abbreviate it
            // with just a box drawn in place.
            if(!drawNestedObjects && !objectsToDraw.includes(value as ObjectV))
            {
                const text : svg.Text = element.text("Object");
                makeObjectSVG(element, text);
                return;
            }
            // Otherwise ensure the object will be drawn in the objects area
            if(!objectsToDraw.includes(value as ObjectV))
            {
                objectsToDraw.push(value as ObjectV);
            }
            // And draw an object from this spot to that drawing.
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
                if(k !== 0) { y += padding; }

                const obj : ObjectI = objectsToDraw[k];
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
                    arrow.marker("end", 10, 7, function(add : svg.Marker) : void {
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
            text.style( textBoldStyle );
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

    function doCallVarLabelStylingSVG(textElement : svg.Text) : void
    {
        textElement.fill(MAUVE);
        textElement.style( varStyle );
    }

    function makeCallVarBorderSVG(base : svg.Container, el : svg.Container) : svg.G
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

        textElement.style( varStyle );
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
        textElement.style( textStyle );
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: ORANGE, opacity: 1, width: 1.5});
    }


    //I assume textElement is already contained within base.
    function makeSimpleValueSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(WHITE);
        textElement.style( literalStyle );
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE, opacity: 1, width: 1.5});
    }
    
    function makeStringLiteralSVG(base : svg.Container,  str : string ) : void
    {
        const leftDoubleQuotationMark = "\u201C" ;
        const rightDoubleQuotationMark = "\u201D" ;
        const textElement : svg.Text = base.text( leftDoubleQuotationMark + str + rightDoubleQuotationMark );
        makeSimpleValueSVG( base, textElement ) ;
    }

    function makeBooleanLiteralSVG(base : svg.Container, textElement : svg.Text, isTrue : boolean) : void 
    {
        if(isTrue) {
            textElement.fill(GREEN);
        }
        else {
            textElement.fill(RED);
        }

        textElement.style( literalStyle );
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5 , bounds.height +5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: LIGHT_BLUE, opacity: 1, width: 1.5});
    }

    function makeErrorSVG(base : svg.Container, errString : string) : void
    {
        if(errString === "") { errString = "Unknown error"; }
        const elementBBox : svg.BBox = base.bbox();
        const textElement : svg.Text = base.text( "Error: " + errString );
        textElement.dy(elementBBox.height + 15);
        textElement.fill(WHITE);
        textElement.style( errorStyle );
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: RED, opacity: 1, width: 1.5});
    }

    function makeNullLiteralSVG(base : svg.Container) : void
    {
        const textElement : svg.Text = base.text( NULLMARK ) ;  // The Ground symbol. I hope.
        textElement.dy(10); //The ground character is very large. This makes it look a bit better.
        textElement.fill(WHITE);
        textElement.style( literalStyle );
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

    function makeSimpleBorder(el : svg.Container, color : string, margin : number = 0 ) : void
    {
        const bounds : svg.BBox = el.bbox();
        const boundsWidth = bounds.width + margin;
        const outline : svg.Rect = el.rect(boundsWidth, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: color, opacity: 1, width: 1.5});
    }

    function makeNoTypeLabelSVG(el: svg.Container) : void
    {
        const label = el.rect(10,10);
        label.radius(5);
        label.fill({opacity: 0});
        label.stroke({color: YELLOW, opacity: 0, width: 1});
    }

    function makeNoExprLabelSVG(el: svg.Container) : void
    {
        // const label = el.rect(20,20);
        // label.radius(5);
        // label.fill({opacity: 0});
        // label.stroke({color: GHOSTWHITE, opacity: 1, width: 1.5});
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

    function makeLocationBorderSVG(base : svg.Container, el : svg.Element) : void
    {
        const r = 4 ; // Radius
        const VPADDING = 2*r ;
        const HPADDING = 2*r ;
        const bounds : svg.BBox = el.bbox();
        el.dmove( -bounds.x+HPADDING, -bounds.y+VPADDING ) ;
        const w = Math.max( bounds.width, 10 ) + 2*HPADDING ;
        const h = Math.max( bounds.height, 10 ) + 2*VPADDING ;
        const path = "M0 0" +
                   " A" +r+ " " +r+ " 0 0 1 " +r+ " " +r+
                   " V" +(h-r)+
                   " A" +r+ " " +r+ " 0 0 0 " +(2*r)+ " " +h+
                   " H" +(w-2*r)+
                   " A" +r+ " " +r+ " 0 0 0 " +(w-r)+ " " +(h-r)+
                   " V" +r+
                   " A" +r+ " " +r+ " 0 0 1" +w+ " 0" ; 
        const outline : svg.Path = base.path( path );
        outline.fill( {opacity: 0} ) ;
        outline.stroke({color: LIGHT_BLUE.toString(), opacity: 1, width: 1.5});
    }

    //I assume textElement is already contained within base.
    function makeObjectSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.fill(ORANGE);
        textElement.style( literalStyle );
        const bounds : svg.BBox = textElement.bbox();
        const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({opacity: 0});
        outline.stroke({color: MAUVE, opacity: 1, width: 1.5});
    }

    function makePrimitiveTyeSVG(base : svg.Container, textElement : svg.Text) : void
    {
        textElement.dy(-5);
        textElement.fill(YELLOW);
        textElement.style("font-family:'Lucida Console', monospace;font-weight: bold ;font-size: large ;");
        // const bounds : svg.BBox = textElement.bbox();
        // const outline : svg.Rect = base.rect(bounds.width + 5, bounds.height + 5);
        // outline.center(bounds.cx, bounds.cy);
        // outline.radius(5);
        // outline.fill({opacity: 0});
        // outline.stroke({color: YELLOW, opacity: 1, width: 1.5});
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
        const outline : svg.Rect = el.rect(bounds.width, bounds.height);
        outline.center(bounds.cx, bounds.cy);
        outline.radius(5);
        outline.fill({color: WHITE, opacity: 0.4});
    }
}

export = animationView;
