/// <reference path="jquery.d.ts" />

/// <reference path="animatorHelpers.ts" />
/// <reference path="assert.ts" />
/// <reference path="backtracking.ts" />
/// <reference path="collections.ts" />
/// <reference path="createHtmlElements.ts" />
/// <reference path="editor.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="seymour.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />

import animatorHelpers = require('./animatorHelpers');
import assert = require( './assert' );
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' );
import createHTMLElements = require('./createHtmlElements');
import editor = require('./editor');
import evaluationManager = require('./evaluationManager');
import seymour = require( './seymour' ) ;
import * as svg from "svg.js";
import valueTypes = require('./valueTypes');
import vms = require('./vms');
import world = require('./world') ;

/** The animator is the execution pane of the application.
 * 
 * <p>It displays the current state of the virtual machine and provides controls
 * for the user to step through the code at a variety of granularities.
 *
 * <p>It also displays widgets associated with libraries. For example a canvas
 * for the turtle world library.
 */
module animator 
{
    import EvaluationManager = evaluationManager.EvaluationManager;
    import traverseAndBuild = animatorHelpers.traverseAndBuild;
    import buildStack = animatorHelpers.buildStack;
    import buildObjectArea = animatorHelpers.buildObjectArea;
    import drawArrows = animatorHelpers.drawArrows;
    import List = collections.List;
    import cons = collections.cons;
    import nil = collections.nil;
    import arrayToList = collections.arrayToList;
    import ValueMap = vms.ValueMap;
    import MapEntry = vms.MapEntry ;
    import TransactionManager = backtracking.TransactionManager ;
    import VMS = vms.VMS;
    import VarStack = vms.VarStack;
    import Value = vms.Value ;

    const animatorWidth = 1000 ;
    const animatorHeight = 1000 ;
    const evaluationMgr = new EvaluationManager() ;
    const highlighted = false;

    let turtleWorld : seymour.TurtleWorld ;
	
    export function executingActions() : void 
	{
        $("#play").click(evaluate);
        $("#advance").click(advanceOneStep);
        $("#evalUndo").click(undoStep);
        $("#evalRedo").click(redoStep);
        $("#evalStepOver").click(stepOver);
        $("#evalStepInto").click(stepInto);
        $("#evalStepToReturn").click(stepToReturn);
        $("#run").click(stepTillDone);
        $("#edit").click(switchToEditor);
        $("#evalToggleOutput").click( createHTMLElements.toggleOutput ) ;
	}

    function evaluate() : void
    {
        createHTMLElements.hideEditor() ;
        createHTMLElements.showAnimator() ;
        const libraries : valueTypes.ObjectV[] = [] ;
        const transactionMgr = new TransactionManager() ;
        const canv = $("#outputAreaCanvas")[0] as HTMLCanvasElement ;
        turtleWorld = new seymour.TurtleWorld(canv, transactionMgr ) ;
        libraries.push( new world.TurtleWorldObject(turtleWorld, transactionMgr) ) ;
        evaluationMgr.initialize( editor.getCurrentSelection().root(),
                                  libraries, transactionMgr );
        transactionMgr.checkpoint();
        // $("#vms").empty()
        // 	.append(traverseAndBuild(evaluationMgr.getVMS().getRoot(), -1, true)) ;
        $("#vms").empty().append("<div id='svgContainer'></div>");
        const animatorArea : svg.Doc = svg("svgContainer").size(animatorWidth, animatorHeight);
        const animation : svg.G = animatorArea.group().move(10, 10);
        const stack : svg.G = animatorArea.group();
        traverseAndBuild( evaluationMgr.getVMS().getRoot(),
                          animation,
                          nil(),
                          cons(-1, nil()),
                          null,
                          "",
                          cons(-1, nil()));
        buildStack(evaluationMgr.getVMS().getEvalStack(), stack);
        const animationBBox : svg.BBox = animation.bbox();
        const stackBBox : svg.BBox = stack.bbox();
        let stackOffset : number = 400;
        //keep stack spacing consistent unless animation too large
        if (stackOffset < animationBBox.width){
            stackOffset = animationBBox.width + 100;
        }
        stack.dmove(stackOffset, 0);
        
        animatorArea.size(animationBBox.width + stackBBox.width + stackOffset, animationBBox.height + stackBBox.height + 50);
        turtleWorld.redraw() ;
    }

    function advanceOneStep() : void
    {
        evaluationMgr.next();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function undoStep() : void
    {
        evaluationMgr.undo();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function redoStep() : void
    {
        evaluationMgr.redo();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function stepTillDone() : void 
	{
        evaluationMgr.stepTillFinished();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function stepOver() : void
    {
        evaluationMgr.stepOver();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function stepInto() : void 
    {
        evaluationMgr.stepInto();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function stepToReturn() : void
    {
        evaluationMgr.stepToReturn();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function switchToEditor() : void
    {
        createHTMLElements.hideAnimator() ;
        createHTMLElements.showEditor() ;
    }

    function buildSVG() : void
    {
        $("#stackVal").empty();
        $("#vms").empty().append("<div id='svgContainer'></div>");
        const animatorArea : svg.Doc = svg("svgContainer").size(1000, 1000);
        const animation : svg.G = animatorArea.group().move(10, 10);
        const objectArea : svg.G = animatorArea.group();
        const stack : svg.G = animatorArea.group();
        const arrowGroup : svg.G = animatorArea.group();

        let toHighlight : List<number>;
        let error : string = "";
        let errorPath : List<number> = cons(-1, nil());
        if (evaluationMgr.getVMS().isReady() ) 
        {
            toHighlight = evaluationMgr.getVMS().getPending();
        }
        else
        {
            toHighlight = cons(-1, nil());
        }
        
        if(evaluationMgr.getVMS().hasError())
        {
            errorPath = evaluationMgr.getVMS().getPending();
            error = evaluationMgr.getVMS().getError();
        }
        animatorHelpers.clearObjectDrawingInfo();
        traverseAndBuild( evaluationMgr.getVMS().getRoot(),
                          animation,
                          nil(),
                          toHighlight,
                          evaluationMgr.getVMS().getValMap(),
                          error,
                          errorPath);
        buildStack(evaluationMgr.getVMS().getEvalStack(), stack);
        buildObjectArea(objectArea);
        const animationBBox : svg.BBox = animation.bbox();
        const stackBBox : svg.BBox = stack.bbox();
        const objectAreaBBox : svg.BBox = objectArea.bbox();
        let objectAreaOffset : number = 400;
        let stackOffset : number = 800;
        let neededHeight : number = 100;

        //keep object area spacing consistent unless animation too large
        if (objectAreaOffset < animationBBox.width){
            objectAreaOffset = animationBBox.width + 100;
        }
        objectArea.dmove(objectAreaOffset, 0);
        
        //keep stack spacing consistent unless animation too large
        if (stackOffset < objectAreaBBox.width + animationBBox.width){
            stackOffset = objectAreaBBox.width + animationBBox.width + 100;
        }
        stack.dmove(stackOffset, 0);

        drawArrows(arrowGroup, animatorArea);

        if(neededHeight < animationBBox.height)
        {
            neededHeight = animationBBox.height;
        }
        if(neededHeight < stackBBox.height)
        {
            neededHeight = stackBBox.height;
        }
        if(neededHeight < objectAreaBBox.height)
        {
            neededHeight = objectAreaBBox.height;
        }
        animatorArea.size(animationBBox.width + objectAreaBBox.width + objectAreaOffset + stackBBox.width + stackOffset, neededHeight + 100);
    }
}

export = animator;
