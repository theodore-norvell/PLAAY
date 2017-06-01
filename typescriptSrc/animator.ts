/// <reference path="jquery.d.ts" />

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="editor.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="seymour.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import editor = require('./editor');
import evaluationManager = require('./evaluationManager');
import seymour = require( './seymour' ) ;
import sharedMkHtml = require('./sharedMkHtml');
import valueTypes = require('./valueTypes');
import vms = require('./vms');
import world = require('./world') ;

module animator 
{
    import EvaluationManager = evaluationManager.EvaluationManager;
	import traverseAndBuild = sharedMkHtml.traverseAndBuild;
    import List = collections.List;
    import arrayToList = collections.arrayToList;
    import ValueMap = vms.ValueMap;
    import MapEntry = vms.MapEntry ;
    import VMS = vms.VMS;
    import VarStack = vms.VarStack;
    import Value = vms.Value ;

    const evaluationMgr = new EvaluationManager();
    var turtle : boolean = false ;
    var highlighted = false;

    const turtleWorld = new seymour.TurtleWorld();
	
	export function executingActions() 
	{
		$("#play").click(evaluate);
		$("#advance").click(advanceOneStep);
		$("#multistep").click(multiStep);
		$("#run").click(stepTillDone);
		$("#edit").click(switchToEditor);
	}

    function evaluate() : void
    {
		$(".evalHidden").css("visibility", "hidden");
		$(".evalVisible").css("visibility", "visible");
        let libraries : valueTypes.ObjectV[] = [] ;
        if( turtle ) libraries.push( new world.TurtleWorldObject(turtleWorld) ) ;
        evaluationMgr.initialize(editor.getCurrentSelection().root(),
            libraries );
        $("#vms").empty()
			.append(traverseAndBuild(evaluationMgr.getVMS().getRoot(), -1, true)) ;
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();
    }

    function advanceOneStep() : void
    {
        evaluationMgr.next();
		$("#stackVal").empty();
		$("#vms").empty()
			.append(traverseAndBuild(evaluationMgr.getVMS().getRoot(), -1, true)) ;
		var root = $("#vms :first-child").get(0);
        if (!highlighted && evaluationMgr.getVMS().isReady() ) 
        {
            const vms : HTMLElement = document.getElementById("vms") ;
            var list = evaluationMgr.getVMS().getPending();
            findInMap(root, evaluationMgr.getVMS().getValMap());
            highlight($(root), list);
            visualizeStack(evaluationMgr.getVMS().getStack());
            highlighted = true;
        } 
        else 
        {
            findInMap(root, evaluationMgr.getVMS().getValMap());
            visualizeStack(evaluationMgr.getVMS().getStack());
            highlighted = false;
        }
        if(turtle) 
        {
            redraw(evaluationMgr.getVMS());
        }
    }

    function stepTillDone() 
	{
        evaluationMgr.next();
        const STEPLIMIT = 10000 ;
        for( let k = STEPLIMIT ; k >= 0 && !evaluationMgr.getVMS().isDone() ; --k) 
        {
            evaluationMgr.next();
		}
		$("#vms").empty()
			.append(traverseAndBuild(evaluationMgr.getVMS().getRoot(), -1, true)) ;
		const root = $("#vms :first-child").get(0);
        const list : List<number>= evaluationMgr.getVMS().getPending();
        const map : ValueMap = evaluationMgr.getVMS().getValMap();
        findInMap(root, map);
        highlight($(root), list);
    }

    function multiStep() 
	{
        $('#advance').trigger('click');
        $('#advance').trigger('click');
        $('#advance').trigger('click');
    }

    function switchToEditor() : void
    {
		$(".evalHidden").css("visibility", "visible");
		$(".evalVisible").css("visibility", "hidden");
        $(".dropZone").show();
        $(".dropZoneSmall").show();
    }

    function redraw(vms:VMS) : void {
        turtleWorld.redraw() ;
    }

    function highlight(parent : JQuery, pending : List<number> ) : void
    {
        if(pending.isEmpty())
        {
            var self = $(parent);
            if(self.index() == 0) 
            {
				$("<div class='selected V'></div>").prependTo(self.parent());
			}
            else 
            {
				$("<div class='selected V'></div>").insertBefore(self);
			}
            self.detach().appendTo($(".selected"));
        }
        else
        {
            var child = $(parent);
            if ( child.children('div[data-childNumber="' + pending.first() + '"]').length > 0 )
            {
                var index = child.find('div[data-childNumber="' + pending.first() + '"]').index();
                var check = pending.first();
                if(index != check) {
					highlight(parent.children[index], pending.rest());
				}
                else 
                {
					highlight(parent.children[check], pending.rest());
				}
            }
            else
            {
                highlight(parent.children[pending.first()], pending);
            }
        }
    }

    function findInMap(root : HTMLElement, valueMap : ValueMap) : void
    {
        for( let e of valueMap.getEntries() ) {
            setHTMLValue(root, e.getPath(), e.getValue());
        }
    }

    function visualizeStack( varStack : VarStack ) : void
    {
        for( let frame of varStack.getAllFrames() ) {
            for( let i = frame.numFields()-1 ; i >= 0 ; --i ) {
                let field = frame.getFieldByNumber(i) ;
                const name = field.getName() ;
                // We need a better way to visualize values than just strings!
                const valString = field.getValue().toString() ;
                const row = $("<tr>").appendTo( $("#stackVal") ) ;
                $("<td>").text( name ).appendTo( row ) ;
                $("<td>").text( valString ).appendTo( row ) ;
            }
        }
    }

    function setHTMLValue(root :  HTMLElement, path:List<number>, value : Value ) : void 
    {
        if(path.isEmpty())
        {
            var self = $(root);
            // TODO. toString may not be the best function to call here,
            // since it could return any old crap that is not compatible with
            // HTML.
            self.replaceWith("<div class='inmap'>"+ value.toString() +"</div>");
        }
        else
        {
            var child = $(root);
            if ( child.children('div[data-childNumber="' + path.first() + '"]').length > 0 )
            {
                var index = child.find('div[data-childNumber="' + path.first() + '"]').index();
                var check = path.first();
                if(index != check) {
                    setHTMLValue(<HTMLElement>root.children[index], path.rest(), value);
				} else {
                    setHTMLValue(<HTMLElement>root.children[check], path.rest(), value);
				}
            }
            else
            {
                setHTMLValue(<HTMLElement>root.children[path.first()], path, value);
            }
        }
    }
}

export = animator;
