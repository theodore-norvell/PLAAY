/// <reference path="collections.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="seymour.ts" />
/// <reference path="vms.ts" />
/// <reference path="jquery.d.ts" />

import collections = require( './collections' );
import sharedMkHtml = require('./sharedMkHtml');
import evaluationManager = require('./evaluationManager');
import seymour = require( './seymour' ) ;
import vms = require('./vms');

module executing 
{
    import EvaluationManager = evaluationManager.EvaluationManager;
	import traverseAndBuild = sharedMkHtml.traverseAndBuild;
    import List = collections.List;
    import arrayToList = collections.arrayToList;
    import ValueMap = vms.ValueMap;
    import VMS = vms.VMS;
    import VarStack = vms.VarStack;
    import Value = vms.Value ;

    var currentvms;
	var currentSelection = sharedMkHtml.currentSelection;
    var evaluation = new EvaluationManager();
    var turtle : boolean = false ;
    var highlighted = false;

    const turtleWorld = new seymour.TurtleWorld();
	
	export function executingActions() 
	{
		$("#play").click(evaluate);
		$("#advance").click(advanceOneStep);
		$("#multistep").click(multiStep);
		$("#run").click(stepTillDone);
		$("#edit").click(editor);
	}

    function evaluate() : void
    {
		$(".evalHidden").css("visibility", "hidden");
		$(".evalVisible").css("visibility", "visible");
        currentvms = evaluation.PLAAY(currentSelection.root(), turtle ? turtleWorld : null );
        $("#vms").empty()
			.append(traverseAndBuild(currentSelection.root(), currentSelection.root().count(), true))
        	.find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();
    }

    function advanceOneStep() : void
    {
        currentvms = evaluation.next();
		$("#stackVal").empty();
		$("#vms").empty()
			.append(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true))
			.find('.seqBox')[0].setAttribute("data-childNumber", "-1");
		var root = $("#vms :first-child").get(0);
        if (!highlighted && currentvms.getEval().ready) {
            const vms : HTMLElement = document.getElementById("vms") ;
            var list = arrayToList(currentvms.getEval().getPending());
            findInMap(root, currentvms.getEval().getVarMap());
            highlight(root, list);
            visualizeStack(currentvms.getEval().getStack());
            highlighted = true;
        } else {
            findInMap(root, currentvms.getEval().getVarMap());
            visualizeStack(currentvms.getEval().getStack());
            highlighted = false;
        }
        if(turtle) {
            redraw(currentvms);
        }
    }

    function stepTillDone() 
	{
        currentvms = evaluation.next();
        while(!currentvms.getEval().isDone()) {
            currentvms = evaluation.next();
		}
		$("#vms").empty()
			.append(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true)) 
			.find('.seqBox')[0].setAttribute("data-childNumber", "-1");
		var root = $("#vms :first-child").get(0);
        var list = arrayToList(currentvms.getEval().getPath());
        var map = Object.create(currentvms.getEval().getVarMap());
        findInMap(root, map);
        highlight(root, list);
    }

    function multiStep() 
	{
        $('#advance').trigger('click');
        $('#advance').trigger('click');
        $('#advance').trigger('click');
    }

    function editor() : void
    {
		$(".evalHidden").css("visibility", "visible");
		$(".evalVisible").css("visibility", "hidden");
        $(".dropZone").show();
        $(".dropZoneSmall").show();
    }

    function redraw(vms:VMS) : void {
        turtleWorld.redraw() ;
    }

    function highlight(parent, pending) : void
    {
        if(pending.isEmpty())
        {
            var self = $(parent);
            if(self.index() == 0) {
				$("<div class='selected V'></div>").prependTo(self.parent());
			}
            else {
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
                else {
					highlight(parent.children[check], pending.rest());
				}
            }
            else
            {
                highlight(parent.children[pending.first()], pending);
            }
        }
    }

    function findInMap(root : HTMLElement, varmap : ValueMap) : void
    {
        for(let i=0; i < varmap.size; i++)
        {
            setHTMLValue(root, arrayToList(varmap.entries[i].getPath()), Object.create(varmap.entries[i].getValue()));
        }
    }

    function visualizeStack(evalstack:VarStack) : void
    {
        for(let i = 0; i < evalstack.obj.numFields(); i++)
        {

            // TODO. This is really not good enough, since structured values should show in a structured way.
            const name = evalstack.obj.getFieldByNumber(i).getName() ;
            const val = evalstack.obj.getFieldByNumber(i).getValue() ;
            $("<tr><td>" + name + "</td>" +
                // TODO toString is not a good idea, as is may return strings that screw up the HTML.
                  "<td>" + val.toString() + "</td></tr>").appendTo($("#stackVal"));

        }
        if(evalstack.getNext() != null)
        {
            visualizeStack(evalstack.getNext());
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
        else{
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

export = executing;
