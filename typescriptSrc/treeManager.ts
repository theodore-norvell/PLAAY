/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import edits = require('./edits');
import labels = require( './labels' ) ;
import pnode = require( './pnode' ) ;
import pnodeEdits = require ('./pnodeEdits');

/** The treemanager provides to the UI an interface for editing a tree.
 */
module treeManager {

    import ExprSeqLabel = labels.ExprSeqLabel;
    import Selection = pnodeEdits.Selection;
    import replaceOrEngulfTemplateEdit = pnodeEdits.replaceOrEngulfTemplateEdit ;
    import list = collections.list;
    import PNode = pnode.PNode;
    import Edit = edits.Edit;
    import Option = collections.Option;

    export class TreeManager {

        public createRoot() : Option<Selection>{
            
            const rootNode = labels.mkExprSeq( [] )  ;

            const placeholder = labels.mkExprPH();
            const sel = new Selection(rootNode, collections.list(0), 0, 1);
            const edit = pnodeEdits.insertChildrenEdit([placeholder]);
            return edit.applyEdit(sel);

        }

        public createNode(label:string, selection:Selection) : Option<Selection> {
            switch (label) {
                //loops & if
                case "if":
                    return this.makeIfNode(selection);
                case "while":
                    return this.makeWhileNode(selection);

                //literals
                case "stringliteral":
                    return this.makeStringLiteralNode(selection);
                case "numberliteral":
                    return this.makeNumberLiteralNode(selection);
                case "trueliteral":
                    return this.makeTrueBooleanLiteralNode(selection);
                case "falseliteral":
                    return this.makeFalseBooleanLiteralNode(selection);
                case "nullliteral":
                    return this.makeNullLiteralNode(selection);
                case "objectliteral":
                    return this.makeObjectLiteralNode(selection);
                case "arrayliteral":
                    return this.makeArrayLiteralNode(selection);

                //variables & variable manipulation
                case "var":
                    return this.makeVarNode(selection);
                case "locdecl":
                    return this.makeVarDeclNode(selection, false);
                case "condecl":
                    return this.makeVarDeclNode(selection, true);
                case "assign":
                    return this.makeAssignNode(selection);
                case "call":
                    return this.makeCallNode(selection);
                case "worldcall":
                    return this.makeWorldCallNode(selection, "", 0);
                case "accessor":
                    return this.makeAccessorNode(selection) ;
                    case "dot":
                        return this.makeDotNode(selection) ;

                //misc
                case "lambda":
                    return this.makeLambdaNode(selection);
                case "type":
                    return this.makeNoTypeNode(selection);
                default:
                    return assert.failedPrecondition("Unexpected parameter to createNode" ) ;
            }
        }

        //Only for nodes that can contain text, such as variables and strings.
        public createNodeWithText( label:string, selection:Selection, text: string ) : Option<Selection> {
            switch (label) {
                case "stringliteral":
                    return this.makeStringLiteralNode(selection, text);
                case "numberliteral":
                    return this.makeNumberLiteralNode(selection, text);
                case "var":
                    return this.makeVarNode(selection, text);
                case "worldcall":
                    return this.makeWorldCallNode(selection, text, 2);

                default:
                    return assert.failedPrecondition("Unexpected parameter to createNodeWithText" ) ;
            }
        }

        private makeVarNode(selection:Selection, text : string = "") : Option<Selection> {

            const varnode = labels.mkVar(text) ;
            const edit = pnodeEdits.insertChildrenEdit( [varnode] ) ;
            return edit.applyEdit(selection) ;
        }

        // While nodes
        private makeWhileNode(selection:Selection) : Option<Selection> {

            const cond = labels.mkExprPH();
            const seq = labels.mkExprSeq([]);

            const whilenode = pnode.make(labels.WhileLabel.theWhileLabel, [cond, seq]);
            const template0 = new Selection( whilenode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( whilenode, list<number>(0), 0, 0 ) ;
            const edit = replaceOrEngulfTemplateEdit( [template0, template1] ) ;
            return edit.applyEdit(selection);
        }

        //objects
        private makeObjectLiteralNode(selection:Selection) : Option<Selection> {
            const objectnode = pnode.make(labels.ObjectLiteralLabel.theObjectLiteralLabel, []);
            const template = new Selection( objectnode, list<number>(), 0, 0 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);
        }

        //arrays
        private makeArrayLiteralNode(selection:Selection) : Option<Selection> {
            const arraynode = pnode.make(labels.ArrayLiteralLabel.theArrayLiteralLabel, []);
            const template = new Selection( arraynode, list<number>(), 0, 0 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);
        }

        //Object accessor
        private makeAccessorNode(selection:Selection) : Option<Selection> {

            const left = labels.mkExprPH();
            const right = labels.mkExprPH();

            const opt = pnode.tryMake(labels.AccessorLabel.theAccessorLabel, [left, right]);

            const accessorNode = opt.first() ;

            const template = new Selection( accessorNode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);

        }

        //Object accessor
        private makeDotNode(selection:Selection) : Option<Selection> {

            const left = labels.mkExprPH();

            const dotNode = labels.mkDot( "", true, left ) ;

            const template = new Selection( dotNode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);

        }

        // If nodes
        private makeIfNode(selection:Selection) : Option<Selection> {

            const guard = labels.mkExprPH();
            const thn = labels.mkExprSeq([]);
            const els = labels.mkExprSeq([]);

            const ifNode = pnode.make(labels.IfLabel.theIfLabel, [guard, thn, els]);

            // console.log( "makeIfNode: Making template") ;
            const template0 = new Selection( ifNode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( ifNode, list<number>(1), 0, 0 ) ;
            // console.log( "makeIfNode: Making edit") ;
            const edit = replaceOrEngulfTemplateEdit( [template0, template1]  ) ;
            // console.log( "makeIfNode: Applying edit") ;
            return edit.applyEdit(selection);
        }

        private makeLambdaNode(selection:Selection) : Option<Selection> {
            const paramList = labels.mkParameterList([]);
            const noTypeNode = labels.mkNoTypeNd() ;
            const body : PNode =labels.mkExprSeq([]);
            const lambdanode = labels.mkLambda( paramList, noTypeNode, body ) ;

            const template = new Selection( lambdanode, list(2), 0, 0 ) ;
            const edit = replaceOrEngulfTemplateEdit( template  ) ;
            return edit.applyEdit(selection);
        }

        private makeAssignNode(selection:Selection) : Option<Selection> {

            const left = labels.mkExprPH();
            const right = labels.mkExprPH();

            const opt = pnode.tryMake(labels.AssignLabel.theAssignLabel, [left, right]);

            const assignnode = opt.first() ;

            const template0 = new Selection( assignnode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( assignnode, list<number>(), 0, 2 ) ;
            const edit = replaceOrEngulfTemplateEdit( [template0, template1] ) ;
            return edit.applyEdit(selection) ;

        }

        private makeVarDeclNode(selection:Selection, isConstant : boolean ) : Option<Selection> {
            let varNode : PNode ;
            let typeNode : PNode ;
            let initNode : PNode ;
            // If the selection is a declNode, try changing it.
            if( selection.size() === 1
            && selection.selectedNodes()[0].isVarDeclNode() ) {
                const declNode = selection.selectedNodes()[0] ;
                varNode = declNode.child(0) ;
                typeNode = declNode.child(1) ;
                initNode = declNode.child(2) ;
            } // If the selection parent is a declNode, try changing it.
            else if( selection.parent().isVarDeclNode() ) {
                const declNode = selection.parent() ;
                varNode = declNode.child(0) ;
                typeNode = declNode.child(1) ;
                initNode = declNode.child(2) ;
                // Try going up.
                const upEdit = pnodeEdits.moveFocusUpEdit ;
                upEdit.applyEdit(selection).map( s => selection=s ) ;
            } // Otherwise try making a new node.
            else {
                varNode = labels.mkVar("");
                typeNode = labels.mkNoTypeNd();
                initNode = labels.mkNoExpNd();
            }

            const vardeclnode = isConstant
                 ? labels.mkConstDecl( varNode, typeNode, initNode ) 
                 : labels.mkVarDecl( varNode, typeNode, initNode );

            const template0 = new Selection( vardeclnode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( vardeclnode, list<number>(), 2, 3 ) ;
            const edit = replaceOrEngulfTemplateEdit( [template0, template1]  ) ;
            return edit.applyEdit(selection);
        }

        private makeWorldCallNode(selection:Selection, name : string, argCount : number ) : Option<Selection> {
            // TODO: Allow a variable number of place holders.
            // console.log( ">> Calling makeWorldCallNode") ;
            const args = new Array<PNode>() ;
            const ph = labels.mkExprPH();
            for( let i = 0 ; i < argCount ; ++i ) {
                args.push(ph) ;
            }
            let worldcallnode : PNode ;
            if(name === "")
            {
                worldcallnode = labels.mkCallWorld( name, args);
                const template = argCount === 0
                    ? new Selection( worldcallnode, list<number>(), 0, 0 )
                    : new Selection( worldcallnode, list<number>(), 0, 1 ) ;
                const edit = replaceOrEngulfTemplateEdit( template  ) ;
                return edit.applyEdit(selection);
            }
            else
            {
                worldcallnode = labels.mkClosedCallWorld(name, args);
                const template = argCount===0
                    ? new Selection( worldcallnode, list<number>(), 0, 0 )
                    : new Selection( worldcallnode, list<number>(), 0, 1 );
                const edit = replaceOrEngulfTemplateEdit( template  ) ;
                return edit.applyEdit(selection) ;
            }
        }

        private makeCallNode(selection:Selection) : Option<Selection> {

            const func = labels.mkExprPH();
            const callnode = labels.mkCall(func) ;

            const template = new Selection( callnode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template  ) ;
            return edit.applyEdit(selection);
        }

        private makeNoTypeNode(selection:Selection) : Option<Selection> {

            const typenode = labels.mkNoTypeNd() ;
            const edit = pnodeEdits.insertChildrenEdit([typenode]);
            return edit.applyEdit(selection);
        }

        private makeStringLiteralNode(selection:Selection, text : string = "hello") : Option<Selection> {

            const literalnode = labels.mkStringLiteral(text) ;
            const edit = pnodeEdits.insertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNumberLiteralNode(selection:Selection, text : string = "123") : Option<Selection> {

            const literalnode = labels.mkNumberLiteral(text) ;

            const edit = pnodeEdits.insertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeTrueBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = labels.mkNoTypeNd() ;
            const edit = pnodeEdits.insertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeFalseBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = labels.mkNoTypeNd() ;
            const edit = pnodeEdits.insertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNullLiteralNode(selection:Selection) : Option<Selection> {

            const opt = pnode.tryMake(labels.NullLiteralLabel.theNullLiteralLabel, []);

            const literalnode = opt.first() ;

            const edit = pnodeEdits.insertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        public changeNodeString(selection:Selection, newString:string) : Option<Selection> {
            const edit = new pnodeEdits.ChangeLabelEdit(newString);
            return edit.applyEdit(selection);
        }

        public selectAll( selection:Selection ) : Option<Selection> {
            const root = selection.root() ;
            const n = root.count() ;
            return collections.some( new Selection( root, list<number>(), 0, n ) ) ;
        }

        public moveOut( selection:Selection ) : Option<Selection> {
            return pnodeEdits.moveOutNormal.applyEdit(selection) ;
        }

        public moveLeft( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.leftEdit;
            return edit.applyEdit(selection);
        }

        public moveRight( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.rightEdit;
            return edit.applyEdit(selection);
        }

        public moveUp( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.upEdit;
            return edit.applyEdit(selection);
        }

        public moveDown( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.downEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusLeft( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusLeftEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusRight( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusRightEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusUp( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusUpEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusDown( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusDownEdit;
            return edit.applyEdit(selection);
        }

        public moveTabForward( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.tabForwardEdit;
            return edit.applyEdit(selection);
        }
         
        public moveTabBack( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.tabBackEdit;
            return edit.applyEdit(selection);
        }

        private standardBackFillList = [[labels.mkNoExpNd()], [labels.mkExprPH()], [labels.mkNoTypeNd()]] ;
        private deleteEdit = pnodeEdits.replaceWithOneOf( [[] as Array<PNode> ].concat(this.standardBackFillList) );
        private otherDeleteEdit = pnodeEdits.replaceWithOneOf( [[], [labels.mkExprPH()], [labels.mkNoTypeNd()]] );

        public delete(selection:Selection) : Option<Selection> {
            const nodes : Array<PNode> = selection.selectedNodes() ;
            if(nodes.length === 1 && nodes[0].label() instanceof labels.NoExprLabel ) {
                return this.otherDeleteEdit.applyEdit( selection ) ; }
            else {
                return this.deleteEdit.applyEdit(selection); }
        }

        public paste( srcSelection : Selection, trgSelection : Selection ) : Option<Selection> {
            const pasteEdit = pnodeEdits.pasteEdit(srcSelection, this.standardBackFillList );
            return pasteEdit.applyEdit( trgSelection ) ;
        }

        public swap( srcSelection : Selection, trgSelection : Selection ) : Option<Selection> {
            const swapEdit = new pnodeEdits.SwapEdit(srcSelection);
            return swapEdit.applyEdit( trgSelection ) ;
        }

        /** Create a list of up to three possible actions. */
        public pasteMoveSwapEditList(srcSelection : Selection, trgSelection : Selection) : Array< [string, string, Selection] > {

            const selectionList : Array< [string, string, Selection] > = [];

            const pasteEdit = pnodeEdits.pasteEdit( srcSelection, this.standardBackFillList );
            const pasteResult = pasteEdit.applyEdit( trgSelection ) ;
            pasteResult.map( newSel => selectionList.push(['Pasted', "Paste", newSel]) ) ;

            const moveEdit = pnodeEdits.moveEdit(srcSelection, this.standardBackFillList );
            const moveResult = moveEdit.applyEdit(trgSelection);
            // TODO: Suppress the push if newSel equals an earlier result
            moveResult.map( newSel => selectionList.push(['Moved', "Move", newSel]) ) ;

            const swapEdit = new pnodeEdits.SwapEdit(srcSelection);
            const swapResult = swapEdit.applyEdit( trgSelection ) ;
            // TODO: Suppress the push if newSel equals an earlier result
            swapResult.map( newSel => selectionList.push(['Swapped', "Swap", newSel]) ) ;

            return selectionList;

        }
    }
}

export = treeManager;
