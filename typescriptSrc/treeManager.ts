/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="sharedMkHtml.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import edits = require('./edits');
import labels = require( './labels' ) ;
import pnode = require( './pnode' ) ;
import pnodeEdits = require ('./pnodeEdits');
import sharedMkHtml = require( './sharedMkHtml') ;

/** The treemanager provides to the UI an interface for editing a tree.
 */
module treeManager {

    import alt = edits.alt ;
    import compose = edits.compose ;
    import Edit = edits.Edit ;
    import id = edits.id ;
    import optionally = edits.optionally ;
    import testEdit = edits.testEdit ;
    import CallWorldLabel = labels.CallWorldLabel ;
    import mkExprPH = labels.mkExprPH ;
    import Selection = pnodeEdits.Selection;
    import replaceOrEngulfTemplateEdit = pnodeEdits.replaceOrEngulfTemplateEdit ;
    import list = collections.list;
    import PNode = pnode.PNode;
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
                    return this.makeNullLiteralNode(selection,false);
                case "objectliteral":
                    return this.makeObjectLiteralNode(selection);
                case "arrayliteral":
                    return this.makeArrayLiteralNode(selection);

                //variables & variable manipulation
                case "var":
                    return this.makeVarNode(selection);
                case "condecl":
                    return this.makeVarDeclNode(selection);
                case "assign":
                    return this.makeAssignNode(selection);
                case "call":
                    return this.makeCallNode(selection);
                case "loc":
                    return this.makeLocNode(selection);
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
                case "tuple":
                    return this.makeTupleNode(selection);

                //types
                case "stringType":
                    return this.makeStringLiteralNode(selection);
                case "numberType":
                    return this.makeNumberLiteralNode(selection);
                case "nullType" :
                    return this.makeNullLiteralNode(selection,true);
                case "booleanType" :
                    return this.makeTrueBooleanLiteralNode(selection);
                case "integerType" :
                    return this.makePrimitiveTypeNode(selection,"integerType");
                case "natType" :
                    return this.makePrimitiveTypeNode(selection,"natType");
                case "topType" :
                    return this.makePrimitiveTypeNode(selection,"topType");
                case "bottomType" :
                    return this.makePrimitiveTypeNode(selection,"bottomType");
                case "tupleType" :
                    return this.makeTupleNode(selection);
                case "functionType" :
                    return this.makeLambdaNode(selection);
                case "locationType" :
                    return this.makeVarDeclNode(selection);
                case "fieldType" :
                    return this.makeFieldTypeNode(selection);
                case "joinType" :
                    return this.makeJoinTypeNode(selection);
                case "meetType" :
                    return this.makeMeetTypeNode(selection);
                
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

            const varNode = labels.mkVar(text) ;
            const typeNode : PNode = labels.mkNoTypeNd();
            const initNode : PNode = labels.mkNoExpNd();
            const vardeclnode = labels.mkConstDecl( varNode, typeNode, initNode ) ;
            const edit0 = pnodeEdits.insertChildrenEdit( [varNode] ) ;
            const edit1 = pnodeEdits.insertChildrenEdit( [vardeclnode] ) ;
            return alt([edit0,edit1]).applyEdit(selection) ;
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
            const objectnode = labels.mkObject([]);
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

        private makeTupleNode(selection:Selection) : Option<Selection> {
            const ph = labels.mkExprPH() ;
            const tuplenode = labels.mkTuple([ph,ph]);
            const tupleType = labels.mkTupleType([ph,ph]);
            const template0 = new Selection( tuplenode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( tupleType, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( [template0, template1] ) ;
            return edit.applyEdit(selection);
        }

        // If nodes
        private makeIfNode(selection:Selection) : Option<Selection> {

            const guard = labels.mkExprPH();
            const emptSeq = labels.mkExprSeq([]);

            const ifNode = pnode.make(labels.IfLabel.theIfLabel, [guard, emptSeq, emptSeq]);

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
            const exprPH = labels.mkExprPH();
            const body : PNode =labels.mkExprSeq([]);
            const lambdanode = labels.mkLambda( paramList, noTypeNode, body ) ;

            const typenode = labels.mkFunctionType(exprPH,exprPH); //notype node or exprPH
            

            const template0 = new Selection( lambdanode, list(2), 0, 0 ) ;
            const template1 = new Selection( typenode, list(), 0, 0 ) ;
            const edit0 = replaceOrEngulfTemplateEdit( template0  ) ;
            const edit1 = replaceOrEngulfTemplateEdit( template1  ) ;
            const edit = edits.alt([edit0,edit1]);
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

        private makeLocNode( selection : Selection ) : Option<Selection> {
            // We either make a new location operator or toggle a variable
            // declaration between being loc or nonloc.
            const template = new Selection( labels.mkLoc( labels.mkExprPH()), list<number>(), 0, 1 ) ;
            const edit = alt( [ compose(pnodeEdits.toggleVarDecl, pnodeEdits.tabForwardEdit ),
                                replaceOrEngulfTemplateEdit( template ),
                                compose( pnodeEdits.moveOutNormal,
                                         pnodeEdits.toggleVarDecl,
                                         pnodeEdits.tabForwardEdit) ] ) ;
            return edit.applyEdit( selection ) ;
        }

        private makeVarDeclNode(selection:Selection ) : Option<Selection> {
            const varNode : PNode = labels.mkVar("");
            const typeNode : PNode = labels.mkNoTypeNd();
            const initNode : PNode = labels.mkNoExpNd();

            const vardeclnode = labels.mkConstDecl( varNode, typeNode, initNode ) ;

            const template0 = new Selection( vardeclnode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( vardeclnode, list<number>(), 2, 3 ) ;
            const templates = [template0, template1] ;

            const edit = replaceOrEngulfTemplateEdit( templates  ) ;
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

        private makeStringLiteralNode(selection:Selection, text : string = "") : Option<Selection> {
            const literalnode = labels.mkStringLiteral(text);
            const edit0 = pnodeEdits.insertChildrenEdit([literalnode]);
            const edit1 = this.insertPrimitiveTypeEdit("stringType");
            const edit = edits.alt([edit0,edit1]);
            return edit.applyEdit(selection);

        }

        private makeNumberLiteralNode(selection:Selection, text : string = "0") : Option<Selection> {
            const literalnode = labels.mkNumberLiteral(text);
            const edit0 = pnodeEdits.insertChildrenEdit([literalnode]);
            const str = text === "0" ? "natType" : text === "1"  ? "integerType" : "numberType" ;
            const edit1 = this.insertPrimitiveTypeEdit( str ) ;
            const edit = edits.alt([edit0,edit1]);
            return edit.applyEdit(selection);

        }

        private makeTrueBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = labels.mkTrueBooleanLiteral() ;
            const edit0 = this.insertPrimitiveTypeEdit("booleanType");
            const edit1 = pnodeEdits.insertChildrenEdit([literalnode]);
            const edit = edits.alt([edit0,edit1]);
            return edit.applyEdit(selection);
        }

        private makeFalseBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = labels.mkFalseBooleanLiteral() ;
            const edit0 = this.insertPrimitiveTypeEdit("booleanType");
            const edit1 = pnodeEdits.insertChildrenEdit([literalnode]);
            const edit = edits.alt([edit0,edit1]);
            return edit.applyEdit(selection);
        }

        private makeNullLiteralNode(selection:Selection, isTypeNode:boolean) : Option<Selection> {
            const opt = pnode.tryMake(labels.NullLiteralLabel.theNullLiteralLabel, []);
            const literalnode = opt.first() ;
            const edit0 = pnodeEdits.insertChildrenEdit([literalnode]);
            const edit1 = this.insertPrimitiveTypeEdit("nullType");
            const edit = edits.alt([edit0,edit1]);
            return edit.applyEdit(selection);
            
        }

        private insertPrimitiveTypeEdit( type : string ) : Edit<Selection> {
            const typeNode = labels.mkPrimitiveTypeLabel(type);
            return edits.compose( pnodeEdits.insertChildrenEdit([typeNode]),
                                  edits.optionally(pnodeEdits.tabForwardEdit)) ;
        }

        private makePrimitiveTypeNode(selection:Selection, type : string) : Option<Selection> {
            return this.insertPrimitiveTypeEdit(type).applyEdit(selection);
        }

        private makeFieldTypeNode(selection:Selection) : Option<Selection> {
            const child0 = labels.mkExprPH();
            const child1 = labels.mkExprPH();

            const typeNode = labels.mkFieldType([child0,child1]);
            const template = new Selection(typeNode,list<number>(),0,1);
            const edit = replaceOrEngulfTemplateEdit([template]);
            return edit.applyEdit(selection);
        }

        private makeJoinTypeNode(selection:Selection) : Option<Selection> {
            const typeNode = labels.mkJoinType([labels.mkExprPH(),labels.mkExprPH()]);
            const template = new Selection(typeNode,list<number>(),0,1);
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection); 
        }

        private makeMeetTypeNode(selection:Selection) : Option<Selection> {
            const typeNode = labels.mkMeetType([labels.mkExprPH(),labels.mkExprPH()]);
            const template = new Selection(typeNode,list<number>(),0,1);
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection); 
        }

        public changeNodeString(selection:Selection, newString:string, tabDirection : number ) : Option<Selection> {
            // First change the label
            const oldLabelEmpty = selection.size() === 1
                               && selection.selectedNodes()[0].label().getVal() === "" ;
            const changeLabel = new pnodeEdits.ChangeLabelEdit(newString);
            // Next, if the newString is an infix operator, the node is a callVar
            // with no children, and the old string was empty ...
            const test0 = testEdit<Selection>(
                (s:Selection) => {
                    const nodes = s.selectedNodes() ;
                    if( nodes.length === 0 ) return false ;
                    const p = nodes[0] ;
                    return oldLabelEmpty
                          && sharedMkHtml.stringIsInfixOperator( newString )
                          && p.label().kind() === CallWorldLabel.kindConst 
                          && p.count() === 0 ; } ) ;
            // ... then add two placeholders as children and select callVar node.
            const addPlaceholders = pnodeEdits.insertChildrenEdit( [ mkExprPH(), mkExprPH() ] ) ;
            // Otherwise if the new string is not an infix operator, the node is a callVar
            // with no children, and the old string was empty ...
            const test1 = testEdit<Selection>(
                (s:Selection) => {
                    const nodes = s.selectedNodes() ;
                    if( nodes.length === 0 ) return false ;
                    const p = nodes[0] ;
                    return oldLabelEmpty
                          && ! sharedMkHtml.stringIsInfixOperator( newString )
                          && p.label().kind() === CallWorldLabel.kindConst 
                          && p.count() === 0 ; } ) ;
            // ... then add one placeholder.
            // Othewise leave it alone.
            const add1Placeholder = pnodeEdits.insertChildrenEdit( [ mkExprPH() ] ) ;
            // Finally we do an optional tab left or right or neither.
            const tab = tabDirection < 0
                      ? optionally(pnodeEdits.tabBackEdit)
                      : tabDirection > 0
                      ? optionally(pnodeEdits.tabForwardEdit)
                      : id<Selection>() ;
            const edit = compose( changeLabel,
                                  alt( [compose( test0,
                                                 pnodeEdits.rightEdit,
                                                 addPlaceholders,
                                                 pnodeEdits.selectParentEdit ),
                                        compose( test1,
                                                 pnodeEdits.rightEdit,
                                                 add1Placeholder,
                                                 pnodeEdits.selectParentEdit ),
                                        id()] ),
                                  tab ) ;
            return edit.applyEdit(selection) ;
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
