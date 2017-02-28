/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="assert.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import pnode = require('./pnode');
import pnodeEdits = require('./pnodeEdits');

module sharedMkHtml 
{
    import list = collections.list;
    import List = collections.List;
    // path is an alias for list<number>
    const path : (  ...args : Array<number> ) => List<number> = list;
    import Selection = pnodeEdits.Selection;
    import PNode = pnode.PNode;

    // TODO Move this to the editor and make it private.
    export var currentSelection = new pnodeEdits.Selection(pnode.mkExprSeq([]),path(),0,0);

    export function traverseAndBuild(node:PNode, childNumber: number, evaluating:boolean) : HTMLElement
    {
        var children = new Array<HTMLElement>() ;
        for(var i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuild(node.child(i), i, evaluating) ) ;
        }
        return buildHTML(node, children, childNumber, evaluating);
    }

    function buildHTML(node:PNode, children : Array<HTMLElement>, childNumber : number, evaluating:boolean) : HTMLElement
    {
        var label = node.label().toString();
        if(label.match('if'))
        {
            assert.check( children.length == 3 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "ifGuardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var elsebox = document.createElement("div");
            elsebox.setAttribute("class", "elseBox H workplace");
            elsebox.appendChild( children[2] ) ;

            var ifbox = document.createElement("div");
            ifbox.setAttribute("data-childNumber", childNumber.toString());
            ifbox.setAttribute("class", "ifBox V workplace canDrag droppable");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox ;
        }
        else if(label.match("seq"))
        {
            if(evaluating)
            {
                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());

                for (var i = 0; true; ++i) {
                    if (i == children.length) break;
                    seqBox.appendChild(children[i]);
                }

                return seqBox;
            }
            else {

                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());
                seqBox["childNumber"] = childNumber;
                for (var i = 0; true; ++i) {
                    const dz = makeLargeDropZone(i) ;
                    seqBox.appendChild(dz);
                    if (i == children.length) break;
                    seqBox.appendChild(children[i]);
                }

                return seqBox;
            }
        }
        else if(label.match("expPH"))
        {
            var PHBox = document.createElement("div");
            PHBox.setAttribute("class", "placeHolder V");
            PHBox.setAttribute("data-childNumber", childNumber.toString());

            return PHBox;
        }
        else if(label.match("param"))
        {
            var paramBox = document.createElement("div");
            paramBox.setAttribute("class", "paramlistOuter H");
            paramBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for (var i = 0; true; ++i) {
                const dz = makeSmallDropZone(i) ;
                paramBox.appendChild(dz);
                if (i == children.length) break;
                paramBox.appendChild(children[i]);
            }

            return paramBox;
        }
        else if(label.match("while"))
        {
            assert.check( children.length == 2 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "whileGuardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var whileBox = document.createElement("div");
            whileBox.setAttribute("data-childNumber", childNumber.toString());
            whileBox.setAttribute("class", "whileBox V workplace canDrag droppable");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);

            return whileBox;
        }
        else if(label.match("callWorld"))
        {
            const callBox = document.createElement("div");
            callBox.setAttribute("class", "callWorld H canDrag droppable" );
            callBox.setAttribute("data-childNumber", childNumber.toString());
            callBox.setAttribute("type", "text");
            callBox.setAttribute("list", "oplist");

            if((node.label().getVal().match(/\+/gi) || node.label().getVal().match(/\-/gi)
                || node.label().getVal().match(/\*/gi) || node.label().getVal().match(/\//gi) || (node.label().getVal().match(/==/gi))
                || (node.label().getVal().match(/>/gi)) || (node.label().getVal().match(/</gi)) || (node.label().getVal().match(/>=/gi))
                || (node.label().getVal().match(/<=/gi)) || (node.label().getVal().match(/&/gi)) || (node.label().getVal().match(/\|/gi)) )
                && node.label().getVal().length > 0
                && children.length == 2)
            {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();

                callBox.appendChild(children[0]);
                callBox.appendChild(opval);
                callBox.appendChild(children[1]);
            }
            else {
                let opElement : Element ;
                if(node.label().getVal().length > 0)
                {
                    opElement = document.createElement("div");
                    opElement.setAttribute("class", "op H click");
                    opElement.textContent = node.label().getVal();
                }
                else {
                    var op = document.createElement("input");
                    opElement.setAttribute("class", "op H input");
                    opElement.setAttribute("type", "text");
                    opElement.setAttribute("list", "oplist");
                    opElement.textContent = "";
                }
                callBox.appendChild(opElement);
                for( let i=0 ; i < children.length ; ++i) {
                    callBox.appendChild( makeSmallDropZone(i) ) ;
                    callBox.appendChild( children[i] ) ;
                }
            }
            return callBox;
        }
        else if(label.match("assign"))
        {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "assign H canDrag droppable" );
            AssignBox.setAttribute("data-childNumber", childNumber.toString());

            var lebel = document.createElement("div");
            lebel.setAttribute("class", "op H");
            lebel.textContent = ":=";

            AssignBox.appendChild(children[0]);
            AssignBox.appendChild(lebel);
            AssignBox.appendChild(children[1]);

            return AssignBox;
        }
        else if(label.match("lambda"))
        {
            var lambdahead = document.createElement("div");
            lambdahead.setAttribute("class", "lambdaHeader V ");
            lambdahead.appendChild( children[0] ) ;
            lambdahead.appendChild(children[1]);

            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox H");
            doBox.appendChild( children[2] ) ;

            var string;

            if (node.label().getVal().length > 0)
            {
                string = document.createElement("div");
                string.setAttribute("class", "stringLiteral H click canDrag");
                string.textContent = node.label().getVal();
            }
            else
            {
                string = document.createElement("input");
                string.setAttribute("class", "stringLiteral H input canDrag");
                string.setAttribute("type", "text");
            }

            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V droppable");
            LambdaBox.setAttribute("data-childNumber", childNumber.toString());
            LambdaBox.appendChild(string);
            LambdaBox.appendChild(lambdahead);
            LambdaBox.appendChild(doBox);

            return LambdaBox;
        }
        else if(label.match("null"))
        {
            var NullBox = document.createElement("div");
            NullBox.setAttribute("class", "nullLiteral H droppable");
            NullBox.textContent = "-";

            return NullBox;
        }
        else if (label.match("var"))
        {
            var VarBox;
            if (node.label().getVal().length > 0)
            {
                VarBox = document.createElement("div");
                VarBox.setAttribute("class", "var H click canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.textContent = node.label().getVal();
            }
            else
            {
                VarBox = document.createElement("input");
                VarBox.setAttribute("class", "var H input canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.setAttribute("type", "text");
                VarBox.textContent = "";
            }
            return VarBox;
        }
        else if (label.match("string"))
        {
            var StringBox;
            if (node.label().getVal().length > 0)
            {
                StringBox = document.createElement("div");
                StringBox.setAttribute("class", "stringLiteral H click canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.textContent = node.label().getVal();
            }
            else
            {
                StringBox = document.createElement("input");
                StringBox.setAttribute("class", "stringLiteral H input canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.setAttribute("type", "text");
                StringBox.textContent = "";
            }
            return StringBox;
        }
        else if(label.match("noType"))
        {
            var noType = document.createElement("div");
            noType.setAttribute( "class", "noReturnType V" ) ;
            noType.setAttribute("data-childNumber", childNumber.toString());
            noType["childNumber"] = childNumber ;

            return noType ;
        }
        else if(label.match("expOpt"))
        {
            var expOpt = document.createElement("div");
            expOpt.setAttribute("class", "expOp V");
            expOpt.setAttribute("data-childNumber", childNumber.toString());

            return expOpt;
        }
        else if(label.match("vdecl"))
        {
            var VarDeclBox = document.createElement("div");
            VarDeclBox.setAttribute("class", "vardecl H canDrag droppable" );
            VarDeclBox.setAttribute("data-childNumber", childNumber.toString());

            var type = document.createElement("div");
            type.textContent = ":";

            var equals = document.createElement("div");
            equals.textContent = ":=";

            VarDeclBox.appendChild(children[0]);
            VarDeclBox.appendChild(type);
            VarDeclBox.appendChild(children[1]);
            VarDeclBox.appendChild(equals);
            VarDeclBox.appendChild(children[2]);

            return VarDeclBox;
        }
        else if(label.match("forward"))
        {
            var forwardElement = document.createElement("div");
            forwardElement.setAttribute("class", "turtleFunc canDrag droppable");
            forwardElement.setAttribute("data-childNumber", childNumber.toString());
            forwardElement.textContent = "Forward";
            forwardElement.appendChild(children[0]);

            return forwardElement;
        }
        else if(label.match("right"))
        {
            var rightElement = document.createElement("div");
            rightElement.setAttribute("class", "turtleFunc canDrag droppable");
            rightElement.setAttribute("data-childNumber", childNumber.toString());
            rightElement.textContent = "Right";
            rightElement.appendChild(children[0]);

            return rightElement;
        }
        else if(label.match("left"))
        {
            var leftElement = document.createElement("div");
            leftElement.setAttribute("class", "turtleFunc canDrag droppable");
            leftElement.setAttribute("data-childNumber", childNumber.toString());
            leftElement.textContent = "Left";
            leftElement.appendChild(children[0]);

            return leftElement;
        }
        else if(label.match("pen"))
        {
            var penElement = document.createElement("div");
            penElement.setAttribute("class", "turtleFunc canDrag droppable");
            penElement.setAttribute("data-childNumber", childNumber.toString());
            penElement.textContent = "Pen";
            penElement.appendChild(children[0]);

            return penElement;
        }
        else if(label.match("clear"))
        {
            var clearElement = document.createElement("div");
            clearElement.setAttribute("class", "turtleFunc canDrag droppable");
            clearElement.setAttribute("data-childNumber", childNumber.toString());
            clearElement.textContent = "Clear";

            return clearElement;
        }
        else if(label.match("show"))
        {
            var showElement = document.createElement("div");
            showElement.setAttribute("class", "turtleFunc canDrag droppable");
            showElement.setAttribute("data-childNumber", childNumber.toString());
            showElement.textContent = "Show";

            return showElement;
        }
        else if(label.match("hide"))
        {
            var hideElement = document.createElement("div");
            hideElement.setAttribute("class", "turtleFunc canDrag droppable");
            hideElement.setAttribute("data-childNumber", childNumber.toString());
            hideElement.textContent = "Hide";

            return hideElement;
        }
    }

    function makeLargeDropZone( childNumber : number ) : Element {
        var dropZone = document.createElement("div");
        dropZone.setAttribute("class", "dropZone H droppable");
        dropZone.setAttribute("data-isDropZone", "yes");
        dropZone.setAttribute("data-childNumber", childNumber.toString());
        return dropZone ;
    }

    function makeSmallDropZone( childNumber : number ) : Element {
        const dropZone = document.createElement("div");
        dropZone.setAttribute("class", "dropZoneSmall H droppable");
        dropZone.setAttribute("data-isDropZone", "yes");
        dropZone.setAttribute("data-childNumber", childNumber.toString());
        return dropZone ;
    }

    export function getPathToNode(root : PNode, self : JQuery ) : Selection
    {
        let anchor;
        let focus;
        //console.log( ">> getPathToNode" ) ;
        let jq : JQuery= $(self);
        let childNumber = Number(jq.attr("data-childNumber"));
        // Climb the tree until we reach a node with a data-childNumber attribute.
        while( jq.length > 0 && isNaN( childNumber ) ) {
            //console.log( "   going up jq is " + jq.prop('outerHTML')() ) ;
            //console.log( "Length is " + jq.length ) ;
            //console.log( "childNumber is " + childNumber ) ;
            jq = jq.parents() ;
            childNumber = Number(jq.attr("data-childNumber"));
        }
        if( jq.length == 0 ) {
            //TODO handle this case elegantly
            assert.check( false ) ;
        }
        if( childNumber == -1 ) {
            //TODO handle this case elegantly
            assert.check( false ) ;
        }
        // childNumber is a number.  Is this a dropzone or not?
        const isDropZone = jq.attr("data-isDropZone" ) ;
        if( isDropZone == "yes" ) {
            //console.log( "   it's a dropzone with number " +  childNumber) ;
            anchor = focus = childNumber ;
        } else {
            //console.log( "   it's a node with number " +  childNumber) ;
            anchor = childNumber ;
            focus = anchor+1 ;
        }
        // Go up one level
        jq = jq.parent() ;
        childNumber = Number(jq.attr("data-childNumber"));


        // Climb the tree until we reach a node with a data-childNumber attribute of -1.
        const array = [];
        while (jq.length > 0 && childNumber != -1 ) {
            if (!isNaN(childNumber))
            {
                array.push( childNumber );
                //console.log( "   pushing " +  childNumber) ;
            }
            // Go up one level
            jq = jq.parents() ;
            childNumber = Number(jq.attr("data-childNumber"));
        }
        assert.check( jq.length != 0 ) ; // Really should not happen
        // Now make a path out of the array.
        var path = list<number>();
        for( let i = 0 ; i < array.length ; i++ )
            path = collections.cons( array[i], path ) ;
        
        // If making the selection fails, then the root passed in was not the root
        // used to make the HTML.
        return new pnodeEdits.Selection(root, path, anchor, focus);
    }
}

export = sharedMkHtml;