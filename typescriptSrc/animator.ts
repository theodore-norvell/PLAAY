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
    import Cons = collections.cons;
    import Nil = collections.nil;
    import arrayToList = collections.arrayToList;
    import ValueMap = vms.ValueMap;
    import MapEntry = vms.MapEntry ;
    import TransactionManager = backtracking.TransactionManager ;
    import VMS = vms.VMS;
    import VarStack = vms.VarStack;
    import Value = vms.Value ;

    const evaluationMgr = new EvaluationManager();
    const highlighted = false;
    let transactionMgr : TransactionManager;

    let turtleWorld : seymour.TurtleWorld ;
	
    export function executingActions() : void 
	{
        $("#play").click(evaluate);
        $("#advance").click(advanceOneStep);
        $("#evalUndo").click(undoStep);
        $("#evalRedo").click(redoStep);
        $("#run").click(stepTillDone);
        $("#edit").click(switchToEditor);
        $("#evalToggleOutput").click( createHTMLElements.toggleOutput ) ;
	}

    function evaluate() : void
    {
        createHTMLElements.hideEditor() ;
        createHTMLElements.showAnimator() ;
        const libraries : valueTypes.ObjectV[] = [] ;
        transactionMgr = new TransactionManager() ;
        const canv = $("#outputAreaCanvas")[0] as HTMLCanvasElement ;
        turtleWorld = new seymour.TurtleWorld(canv, transactionMgr ) ;
        libraries.push( new world.TurtleWorldObject(turtleWorld, transactionMgr) ) ;
        evaluationMgr.initialize( editor.getCurrentSelection().root(),
                                  libraries, transactionMgr );
        transactionMgr.checkpoint();
        // $("#vms").empty()
        // 	.append(traverseAndBuild(evaluationMgr.getVMS().getRoot(), -1, true)) ;
        $("#vms").empty().append("<div id='svgContainer'></div>");
        const animatorArea : svg.Doc = svg("svgContainer").size(1000, 1000);
        const animation : svg.G = animatorArea.group().move(10, 10);
        const stack : svg.G = animatorArea.group();
        traverseAndBuild(evaluationMgr.getVMS().getRoot(), animation, Nil<number>(), Cons<number>(-1, Nil<number>()), null, "", Cons<number>(-1, Nil<number>()));
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
        transactionMgr.checkpoint();
        if(!evaluationMgr.getVMS().canAdvance() && !evaluationMgr.getVMS().hasError())
        {
            return;
        }
        buildSVG();
        turtleWorld.redraw() ;
        //visualizeStack(evaluationMgr.getVMS().getStack());
        // const root = $("#vms :first-child").get(0);
        // if (!highlighted && evaluationMgr.getVMS().isReady() ) 
        // {
        //     const vms : HTMLElement = document.getElementById("vms") as HTMLElement ;
        //     const list = evaluationMgr.getVMS().getPending();
        //     findInMap(root, evaluationMgr.getVMS().getValMap());
        //     highlight($(root), list);
        //     visualizeStack(evaluationMgr.getVMS().getStack());
        //     highlighted = true;
        // } 
        // else 
        // {
        //     findInMap(root, evaluationMgr.getVMS().getValMap());
        //     visualizeStack(evaluationMgr.getVMS().getStack());
        //     highlighted = false;
        // }
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
        let errorPath : List<number> = Cons(-1, Nil<number>());
        if (evaluationMgr.getVMS().isReady() ) 
        {
            toHighlight = evaluationMgr.getVMS().getPending();
        }
        else
        {
            toHighlight = Cons(-1, Nil<number>());
        }
        
        if(evaluationMgr.getVMS().hasError())
        {
            errorPath = evaluationMgr.getVMS().getPending();
            error = evaluationMgr.getVMS().getError();
        }
        animatorHelpers.clearObjectDrawingInfo();
        traverseAndBuild(evaluationMgr.getVMS().getRoot(), animation, Nil<number>(), toHighlight, evaluationMgr.getVMS().getValMap(), error, errorPath);
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

    function undoStep() : void
    {
        if(!transactionMgr.canUndo())
        {
            return;
        }
        transactionMgr.undo();
        buildSVG();
        turtleWorld.redraw() ;
    }

    function redoStep() : void
    {
        if(!transactionMgr.canRedo())
        {
            return;
        }
        transactionMgr.redo();
        buildSVG();
        turtleWorld.redraw() ;    }

    function stepTillDone() : void 
	{
        const STEPLIMIT = 10000 ;
        for( let k = STEPLIMIT ; k >= 0 && !evaluationMgr.getVMS().isDone() ; --k) 
        {
            evaluationMgr.next();
            transactionMgr.checkpoint();
		}
        buildSVG();
        turtleWorld.redraw() ;
    }

    // function multiStep() : void
	// {
    //     $('#advance').trigger('click');
    //     $('#advance').trigger('click');
    //     $('#advance').trigger('click');
    // }

    function switchToEditor() : void
    {
        createHTMLElements.hideAnimator() ;
        createHTMLElements.showEditor() ;
    }

    // function redraw(vms:VMS) : void {
    //     turtleWorld.redraw() ;
    // }

    // function highlight(parent : JQuery, pending : List<number> ) : void
    // {
    //     if(pending.isEmpty())
    //     {
    //         const self = $(parent);
    //         if(self.index() === 0) 
    //         {
	// 			$("<div class='selected V'></div>").prependTo(self.parent());
	// 		}
    //         else 
    //         {
	// 			$("<div class='selected V'></div>").insertBefore(self);
	// 		}
    //         self.detach().appendTo($(".selected"));
    //     }
    //     else
    //     {
    //         const child = $(parent);
    //         if ( child.children('div[data-childNumber="' + pending.first() + '"]').length > 0 )
    //         {
    //             const index = child.find('div[data-childNumber="' + pending.first() + '"]').index();
    //             const check = pending.first();
    //             if(index !== check) {
	// 				highlight(parent.children[index], pending.rest());
	// 			}
    //             else 
    //             {
	// 				highlight(parent.children[check], pending.rest());
	// 			}
    //         }
    //         else
    //         {
    //             highlight(parent.children[pending.first()], pending);
    //         }
    //     }
    // }

    // function findInMap(root : HTMLElement, valueMap : ValueMap) : void
    // {
    //     for( const e of valueMap.getEntries() ) {
    //         setHTMLValue(root, e.getPath(), e.getValue());
    //     }
    // }

    // function visualizeStack( varStack : VarStack ) : void
    // {
    //     for( const frame of varStack.getAllFrames() ) {
    //         for( let i = frame.numFields()-1 ; i >= 0 ; --i ) {
    //             const field = frame.getFieldByNumber(i) ;
    //             const name = field.getName() ;
    //             // We need a better way to visualize values than just strings!
    //             const valString = field.getValue().toString() ;
    //             const row = $("<tr>").appendTo( $("#stackVal") ) ;
    //             $("<td>").text( name ).appendTo( row ) ;
    //             $("<td>").text( valString ).appendTo( row ) ;
    //         }
    //     }
    // }

    // function setHTMLValue(root :  HTMLElement, path:List<number>, value : Value ) : void 
    // {
    //     if(path.isEmpty())
    //     {
    //         const self = $(root);
    //         // TODO. toString may not be the best function to call here,
    //         // since it could return any old crap that is not compatible with
    //         // HTML.
    //         self.replaceWith("<div class='inmap'>"+ value.toString() +"</div>");
    //     }
    //     else
    //     {
    //         const child = $(root);
    //         if ( child.children('div[data-childNumber="' + path.first() + '"]').length > 0 )
    //         {
    //             const index = child.find('div[data-childNumber="' + path.first() + '"]').index();
    //             const check = path.first();
    //             if(index !== check) {
    //                 setHTMLValue( root.children[index] as HTMLElement,
    //                               path.rest(),
    //                               value);
	// 			} else {
    //                 setHTMLValue( root.children[check] as HTMLElement,
    //                               path.rest(),
    //                               value);
	// 			}
    //         }
    //         else
    //         {
    //             setHTMLValue( root.children[path.first()] as HTMLElement,
    //                           path,
    //                           value);
    //         }
    //     }
    // }
}

export = animator;
