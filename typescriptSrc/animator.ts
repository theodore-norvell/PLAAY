/// <reference path="jquery.d.ts" />

/// <reference path="animationView.ts" />
/// <reference path="assert.ts" />
/// <reference path="backtracking.ts" />
/// <reference path="collections.ts" />
/// <reference path="createHtmlElements.ts" />
/// <reference path="editor.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="library.ts" />
/// <reference path="seymour.ts" />
/// <reference path="values.ts" />
/// <reference path="vms.ts" />

import animationView = require('./animationView');
import assert = require( './assert' );
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' );
import createHTMLElements = require('./createHtmlElements');
import editor = require('./editor');
import evaluationManager = require('./evaluationManager');
import library = require('./library') ;
import seymour = require( './seymour' ) ;
import values = require('./values');
import vms = require('./vms');
import * as svg from "svg.js";

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
    import traverseAndBuild = animationView.traverseAndBuild;
    import buildStack = animationView.buildStack;
    import buildObjectArea = animationView.buildObjectArea;
    import drawArrows = animationView.drawArrows;
    import List = collections.List;
    import list = collections.list;
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
        $("#restart").click(evaluate);
        $("#edit").click(switchToEditor);
        $("#evalToggleOutput").click( createHTMLElements.toggleOutput ) ;
	}

    function evaluate() : void
    {
        createHTMLElements.hideEditor() ;
        createHTMLElements.showAnimator() ;
        const libraries : values.ObjectV[] = [] ;
        const transactionMgr = new TransactionManager() ;
        const canv = $("#outputAreaCanvas")[0] as HTMLCanvasElement ;
        turtleWorld = new seymour.TurtleWorld(canv, transactionMgr ) ;
        libraries.push( new library.TurtleWorldObject(turtleWorld, transactionMgr) ) ;
        evaluationMgr.initialize( editor.getCurrentSelection().root(),
                                  libraries, transactionMgr );
        transactionMgr.checkpoint();
        
        buildSVG() ;
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
        $("#vms").empty().append("<div id='svgContainer'></div>");
        const animatorArea : svg.Doc =
            svg("svgContainer").size(animatorWidth, animatorHeight);
        const animation : svg.G = animatorArea.group().move(10, 10);

        const toHighlight : List<number> = 
                evaluationMgr.getVMS().isReady()
            ?   evaluationMgr.getVMS().getPending()
            :   list(-1) ;
        const error : string =
                evaluationMgr.getVMS().hasError()
            ?   evaluationMgr.getVMS().getError()
            :   "" ;
        const errorPath : List<number> = 
                evaluationMgr.getVMS().hasError()
            ?   evaluationMgr.getVMS().getPending()
            :   list( -1 ) ;

        animationView.clearObjectDrawingInfo();
        traverseAndBuild( evaluationMgr.getVMS().getRoot(),
                          animation,
                          nil(),
                          toHighlight,
                          evaluationMgr.getVMS().getValMap(),
                          error,
                          errorPath);

        const stack : svg.G = animatorArea.group();
        buildStack(evaluationMgr.getVMS().getEvalStack(), stack);

        const objectArea : svg.G = animatorArea.group();
        buildObjectArea(objectArea);
        const animationBBox : svg.BBox = animation.bbox();
        const stackBBox : svg.BBox = stack.bbox();
        let stackOffset : number = 800;
        const objectAreaBBox : svg.BBox = objectArea.bbox();
        let objectAreaOffset : number = 400;

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

        const arrowGroup : svg.G = animatorArea.group();
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
