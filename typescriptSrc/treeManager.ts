/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeView.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import edits = require('./edits');
import labels = require( './labels' ) ;
import pnode = require( './pnode' ) ;
import pnodeEdits = require ('./pnodeEdits');
import treeView = require( './treeView') ;

/** The treemanager provides to the UI an interface for editing a tree.
 */
module treeManager {

    import alt = edits.alt ;
    import compose = edits.compose ;
    import Edit = edits.Edit ;
    import id = edits.id ;
    import optionally = edits.optionally ;
    import testEdit = edits.testEdit ;
    import CallVarLabel = labels.CallVarLabel ;
    import Selection = pnodeEdits.Selection;
    import replaceOrEngulfTemplateEdit = pnodeEdits.replaceOrEngulfTemplateEdit ;
    import list = collections.list;
    import PNode = pnode.PNode;
    import Option = collections.Option;

    export enum Actions { IF, WHILE, STRING, NUMBER, TRUE, FALSE, NULL,
                          OBJECT, ARRAY, VAR, VAR_DECL, ASSIGN, CALL, LOC,
                          CALL_VAR, INDEX, DOT, LAMBDA, NO_TYPE, TUPLE,
                          STRING_TYPE, NUMBER_TYPE, NULL_TYPE, BOOLEAN_TYPE,
                          INTEGER_TYPE, NAT_TYPE, LOCATION_TYPE,
                          TOP_TYPE, BOTTOM_TYPE,
                          TUPLE_TYPE, FUNCTION_TYPE, FIELD_TYPE, JOIN_TYPE,
                          MEET_TYPE,
                          STRING_OR_STRING_TYPE,
                          NUMBER_OR_NUMBER_TYPE,
                          IF_OR_BOOL_TYPE,
                          LAMBDA_OR_FUNCTION_TYPE,
                          LOC_OR_LOCATION_TYPE,
                          ASSIGN_OR_ASSIGN_TYPE,
                          TUPLE_OR_TUPLE_TYPE,
                          AND_OR_MEET_TYPE,
                          OR_OR_JOIN_TYPE }
    

    const placeHolder = labels.mkExprPH() ;

    export class TreeManager {

        public createRoot() : Option<Selection>{
            
            const rootNode = labels.mkExprSeq( [] )  ;

            const sel = new Selection(rootNode, collections.list(0), 0, 1);
            const edit = pnodeEdits.insertChildrenEdit([placeHolder]);
            return edit.applyEdit(sel);

        }

        public createNode( action: Actions, selection:Selection) : Option<Selection> {
            console.log( "treeManager.createNode action is " + action.toString() ) ;
            let edit : Edit<Selection> ;
            switch ( action) {
                //loops & if
                case Actions.IF:
                    edit = this.makeIfNode();
                    break ;
                case Actions.WHILE:
                    edit = this.makeWhileNode();
                    break ;
                
                // Literals
                case Actions.STRING:
                    edit = this.makeStringLiteralNode();
                    break ;
                case Actions.NUMBER:
                    edit = this.makeNumberLiteralNode();
                    break ;
                case Actions.TRUE:
                    edit = this.makeTrueBooleanLiteralNode();
                    break ;
                case Actions.FALSE:
                    edit = this.makeFalseBooleanLiteralNode();
                    break ;
                case Actions.NULL:
                    edit = this.makeNullLiteralNode(false);
                    break ;
                case Actions.OBJECT:
                    edit = this.makeObjectLiteralNode();
                    break ;
                case Actions.ARRAY:
                    edit = this.makeArrayLiteralNode();
                    break ;
                //variables & variable manipulation
                case Actions.VAR:
                    edit = this.makeVarNode();
                    break ;
                case Actions.VAR_DECL:
                    edit = this.makeVarDeclNode();
                    break ;
                case Actions.ASSIGN:
                    edit = this.makeAssignNode()  ;
                    break ;
                case Actions.CALL:
                    edit = this.makeCallNode();
                    break ;
                case Actions.LOC:
                    edit = this.makeLocNode();
                    break ;
                case Actions.CALL_VAR:
                    edit = this.makeCallVarNode( "", 0);
                    break ;
                case Actions.INDEX:
                    edit = this.makeAccessorNode() ;
                    break ;
                case Actions.DOT:
                    edit = this.makeDotNode() ;

                //misc
                    break ;
                case Actions.LAMBDA:
                    edit = this.makeLambdaNode();
                    break ;
                case Actions.NO_TYPE:
                    edit = this.makeNoTypeNode();
                    break ;
                case Actions.TUPLE:
                    edit = this.makeTupleNode();

                //types
                    break ;
                case Actions.STRING_TYPE:
                    edit = this.makePrimitiveTypeNode("stringType") ;
                    break ;
                case Actions.NULL_TYPE :
                    edit = this.makeNullLiteralNode(true);
                    break ;
                case Actions.BOOLEAN_TYPE :
                    edit = this.makePrimitiveTypeNode("booleanType");
                    break ;
                case Actions.NAT_TYPE :
                    edit = this.makeNumberTypeNode( "0" ) ;
                    break ;
                case Actions.INTEGER_TYPE :
                    edit = this.makeNumberTypeNode( "1" ) ;
                    break ;
                case Actions.NUMBER_TYPE:
                    edit = this.makeNumberTypeNode( "2" ) ;
                    break ;
                case Actions.TOP_TYPE :
                    edit = this.makePrimitiveTypeNode("topType");
                    break ;
                case Actions.BOTTOM_TYPE :
                    edit = this.makePrimitiveTypeNode("bottomType");
                    break ;
                case Actions.TUPLE_TYPE :
                    edit = this.makeTupleType();
                    break ;
                case Actions.FUNCTION_TYPE :
                    edit = this.makeFunctionType() ;
                    break ;
                case Actions.LOCATION_TYPE :
                    edit = this.makeLocType();
                    break ;
                case Actions.FIELD_TYPE :
                    edit = this.makeFieldTypeNode();
                    break ;
                case Actions.JOIN_TYPE :
                    edit = this.makeJoinTypeNode();
                    break ;
                case Actions.MEET_TYPE :
                    edit = this.makeMeetTypeNode();
                    break ;


                // Actions that could have multiple meanings.
                case Actions.STRING_OR_STRING_TYPE:
                    edit = alt( [ this.makeStringLiteralNode(),
                                  this.makePrimitiveTypeNode("stringType") ]) ;
                    break ;
                case Actions.IF_OR_BOOL_TYPE:
                    edit = alt( [ this.makeIfNode(  ),
                                  this.makePrimitiveTypeNode("booleanType") ]) ;
                    break ;
                case Actions.LAMBDA_OR_FUNCTION_TYPE :
                    edit = alt( [ this.makeLambdaNode(),
                                  this.makeFunctionType() ] ) ;
                    break ;
                case Actions.LOC_OR_LOCATION_TYPE :
                    edit = alt( [ this.makeLocType(),
                                  this.makeLocNode() ] ) ;
                    break ;
                case Actions.ASSIGN_OR_ASSIGN_TYPE :
                    edit = alt( [ this.makeAssignNode(),
                                  this.makeFieldTypeNode() ] ) ;
                    break ;
                case Actions.TUPLE_OR_TUPLE_TYPE :
                    edit = alt( [ this.makeTupleNode(), this.makeTupleType() ] ) ;
                    break ;
                case Actions.AND_OR_MEET_TYPE :
                    edit = alt( [ this.makeCallVarNode("and", 2),
                                  this.makeMeetTypeNode() ] ) ;
                    break ;
                case Actions.OR_OR_JOIN_TYPE :
                    edit = alt( [ this.makeCallVarNode("or", 2),
                                  this.makeJoinTypeNode() ] ) ;
                    break ;
                default:
                    return assert.failedPrecondition("Unexpected parameter to createNode" ) ;
            }
            return edit.applyEdit(selection) ;
        }

        //Only for nodes that can contain text, such as variables and strings.
        public createNodeWithText( action: Actions, selection: Selection, text: string ) : Option<Selection> {
            console.log( "treeManager.createNodeWithText action is " + action.toString() + " text is " + text ) ;
            let edit : Edit<Selection> ;
            switch (action) {
                case Actions.STRING:
                    edit = this.makeStringLiteralNode(text);
                    break ;
                case Actions.NUMBER:
                    edit = this.makeNumberLiteralNode(text);
                    break ;
                case Actions.NUMBER_OR_NUMBER_TYPE:
                    edit = alt( [
                        this.makeNumberLiteralNode(text),
                        this.makeNumberTypeNode( text )
                    ]) ;
                    break ;
                case Actions.VAR:
                    edit = this.makeVarNode(text);
                    break ;
                case Actions.CALL_VAR:
                    edit = this.makeCallVarNode(text, 2);
                    break ;
                default:
                    return assert.failedPrecondition("Unexpected parameter to createNodeWithText" ) ;
            }
            return edit.applyEdit(selection) ;
        }

        private makeVarNode(text : string = "") : Edit<Selection> {
            const varNode = labels.mkVar(text) ;
            const typeNode : PNode = labels.mkNoTypeNd();
            const initNode : PNode = labels.mkNoExpNd();
            const vardeclnode = labels.mkConstDecl( varNode, typeNode, initNode ) ;
            const edit0 = pnodeEdits.insertChildrenEdit( [varNode] ) ;
            const edit1 = pnodeEdits.insertChildrenEdit( [vardeclnode] ) ;
            return alt([edit0,edit1]) ;
        }

        // While nodes
        private makeWhileNode() : Edit<Selection> {

            const seq = labels.mkExprSeq([]);

            const whilenode = pnode.make(labels.WhileLabel.theWhileLabel, [placeHolder, seq]);
            const template0 = new Selection( whilenode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( whilenode, list<number>(0), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( [template0, template1] ) ;
        }

        //objects
        private makeObjectLiteralNode() : Edit<Selection> {
            const objectnode = labels.mkObject([]);
            const template = new Selection( objectnode, list<number>(), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;
        }

        //arrays
        private makeArrayLiteralNode() : Edit<Selection> {
            const arraynode = pnode.make(labels.ArrayLiteralLabel.theArrayLiteralLabel, []);
            const template = new Selection( arraynode, list<number>(), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;
        }

        //Object accessor
        private makeAccessorNode() : Edit<Selection> {

            const opt = pnode.tryMake(labels.AccessorLabel.theAccessorLabel,
                                      [placeHolder, placeHolder]);

            const accessorNode = opt.first() ;

            const template = new Selection( accessorNode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;

        }

        //Object accessor
        private makeDotNode() : Edit<Selection> {

            const dotNode = labels.mkDot( "", true, placeHolder ) ;

            const template = new Selection( dotNode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;

        }

        private makeTupleNode() : Edit<Selection> {
            const tuplenode = labels.mkTuple([placeHolder,placeHolder]);
            const template0 = new Selection( tuplenode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( [template0] ) ;
        }

        private makeTupleType() : Edit<Selection> {
            const tupleType = labels.mkTupleType([placeHolder,placeHolder]);
            const template1 = new Selection( tupleType, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( [template1] ) ;
        }

        // If nodes
        private makeIfNode() : Edit<Selection> {

            const emptSeq = labels.mkExprSeq([]);

            const ifNode = pnode.make(labels.IfLabel.theIfLabel, [placeHolder, emptSeq, emptSeq]);

            // console.log( "makeIfNode: Making template") ;
            const template0 = new Selection( ifNode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( ifNode, list<number>(1), 0, 0 ) ;
            // console.log( "makeIfNode: Making edit") ;
            return replaceOrEngulfTemplateEdit( [template0, template1]  ) ;
        }

        private makeLambdaNode() : Edit<Selection> {
            const noTypeNode = labels.mkNoTypeNd() ;
            const paramList = labels.mkParameterList([]);
            const body : PNode =labels.mkExprSeq([]);
            const lambdanode = labels.mkLambda( paramList, noTypeNode, body ) ;
            const template = new Selection( lambdanode, list(2), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( template  ) ;
        }

        private makeAssignNode() : Edit<Selection> {

            const assignnode = labels.mkAssign( placeHolder, placeHolder ) ;

            const template0 = new Selection( assignnode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( assignnode, list<number>(), 0, 2 ) ;
            return replaceOrEngulfTemplateEdit( [template0, template1] ) ;
        }

        private makeLocNode() : Edit<Selection> {
            // We either make a new location operator or toggle a variable
            // declaration between being loc or nonloc.
            const operatorTempl = new Selection( labels.mkLoc(placeHolder),                                                list<number>(), 0, 1 ) ;
            return alt( [ compose( pnodeEdits.toggleVarDecl,
                                   pnodeEdits.tabForwardEdit ),
                          replaceOrEngulfTemplateEdit( operatorTempl ),
                          compose( pnodeEdits.moveOutNormal,
                                   pnodeEdits.toggleVarDecl,
                                   pnodeEdits.tabForwardEdit) ] ) ;
        }

        private makeVarDeclNode( ) : Edit<Selection> {
            const varNode : PNode = labels.mkVar("");
            const typeNode : PNode = labels.mkNoTypeNd();
            const initNode : PNode = labels.mkNoExpNd();

            const vardeclnode = labels.mkConstDecl( varNode, typeNode, initNode ) ;

            const template0 = new Selection( vardeclnode, list<number>(), 0, 1 ) ;
            const template1 = new Selection( vardeclnode, list<number>(), 2, 3 ) ;
            const templates = [template0, template1] ;

            return replaceOrEngulfTemplateEdit( templates  ) ;
        }

        private makeCallVarNode(name : string, argCount : number ) : Edit<Selection> {
            // console.log( ">> Calling makeCallVarNode") ;
            const args = new Array<PNode>() ;
            for( let i = 0 ; i < argCount ; ++i ) {
                args.push(placeHolder) ;
            }
            let callVarNode : PNode ;
            if(name === "")
            {
                callVarNode = labels.mkOpenCallVar( name, args);
                const template = argCount === 0
                    ? new Selection( callVarNode, list<number>(), 0, 0 )
                    : new Selection( callVarNode, list<number>(), 0, 1 ) ;
                return replaceOrEngulfTemplateEdit( template  ) ;
            }
            else
            {
                callVarNode = labels.mkClosedCallVar(name, args);
                const template = argCount===0
                    ? new Selection( callVarNode, list<number>(), 0, 0 )
                    : new Selection( callVarNode, list<number>(), 0, 1 );
                return replaceOrEngulfTemplateEdit( template  ) ;
            }
        }

        private makeCallNode() : Edit<Selection> {

            const callnode = labels.mkCall(placeHolder) ;

            const template = new Selection( callnode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template  ) ;
        }

        private makeNoTypeNode() : Edit<Selection> {

            const typenode = labels.mkNoTypeNd() ;
            return pnodeEdits.insertChildrenEdit([typenode]);
        }

        private makeStringLiteralNode(text : string = "") : Edit<Selection> {
            const literalnode = labels.mkStringLiteral(text);
            return pnodeEdits.insertChildrenEdit([literalnode]);

        }

        private makeNumberLiteralNode(text : string = "0") : Edit<Selection> {
            const literalnode = labels.mkNumberLiteral(text);
            return pnodeEdits.insertChildrenEdit([literalnode]);

        }

        private makeTrueBooleanLiteralNode() : Edit<Selection> {
            const literalnode = labels.mkTrueBooleanLiteral() ;
            return pnodeEdits.insertChildrenEdit([literalnode]);
        }

        private makeFalseBooleanLiteralNode() : Edit<Selection> {
            const literalnode = labels.mkFalseBooleanLiteral() ;
            const edit0 = this.makePrimitiveTypeNode("booleanType");
            const edit1 = pnodeEdits.insertChildrenEdit([literalnode]);
            return edits.alt([edit0,edit1]);
        }

        private makeNullLiteralNode(isTypeNode:boolean) : Edit<Selection> {
            const opt = pnode.tryMake(labels.NullLiteralLabel.theNullLiteralLabel, []);
            const literalnode = opt.first() ;
            const edit0 = pnodeEdits.insertChildrenEdit([literalnode]);
            const edit1 = this.makePrimitiveTypeNode("nullType");
            return edits.alt([edit0,edit1]);
            
        }

        private makeNumberTypeNode( digit : string )  : Edit<Selection> {
            switch( digit ) {
                case "0" : return this.makePrimitiveTypeNode( "natType" ) ;
                case "1" : return this.makePrimitiveTypeNode( "integerType" ) ;
                default: return this.makePrimitiveTypeNode( "numberType" ) ;
            }
        }

        private makePrimitiveTypeNode( type : string ) : Edit<Selection> {
            const typeNode = labels.mkPrimitiveTypeLabel(type);
            //return edits.compose( pnodeEdits.insertChildrenEdit([typeNode]),
            //                      edits.optionally(pnodeEdits.tabForwardEdit)) ;
            return pnodeEdits.insertChildrenEdit([typeNode]) ; }

        private makeLocType() : Edit<Selection> {
            const typeTempl = new Selection( labels.mkLocationType( placeHolder ),
                                             list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( typeTempl ) ;
        }

        private makeFieldTypeNode() : Edit<Selection> {
            const typeNode = labels.mkFieldType([placeHolder, placeHolder]);
            const template0 = new Selection(typeNode,list<number>(),0,1);
            const template1 = new Selection(typeNode,list<number>(),1,2);
            return replaceOrEngulfTemplateEdit([template0,template1]);
        }

        private makeFunctionType() : Edit<Selection> {
            const typenode = labels.mkFunctionType(placeHolder, placeHolder);
            const template = new Selection( typenode, list(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template  ) ;
        }

        private makeJoinTypeNode() : Edit<Selection> {
            const typeNode = labels.mkJoinType([placeHolder, placeHolder]);
            const template = new Selection(typeNode,list<number>(),0,1);
            return replaceOrEngulfTemplateEdit( template ) ; 
        }

        private makeMeetTypeNode() : Edit<Selection> {
            const typeNode = labels.mkMeetType([placeHolder, placeHolder]);
            const template = new Selection(typeNode,list<number>(),0,1);
            return replaceOrEngulfTemplateEdit( template ) ; 
        }

        public changeNodeString(selection: Selection, newString: string, tabDirection: number ) : Option<Selection> {
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
                          && treeView.stringIsInfixOperator( newString )
                          && p.label().kind() === CallVarLabel.kindConst 
                          && p.count() === 0 ; } ) ;
            // ... then add two placeholders as children and select callVar node.
            const addPlaceholders = pnodeEdits.insertChildrenEdit(
                                        [ placeHolder, placeHolder ] ) ;
            // Otherwise if the new string is not an infix operator, the node is a callVar
            // with no children, and the old string was empty ...
            const test1 = testEdit<Selection>(
                (s:Selection) => {
                    const nodes = s.selectedNodes() ;
                    if( nodes.length === 0 ) return false ;
                    const p = nodes[0] ;
                    return oldLabelEmpty
                          && ! treeView.stringIsInfixOperator( newString )
                          && p.label().kind() === CallVarLabel.kindConst 
                          && p.count() === 0 ; } ) ;
            // ... then add one placeholder.
            // Othewise leave it alone.
            const add1Placeholder = pnodeEdits.insertChildrenEdit( [ placeHolder ] ) ;
            // Finally we do an optional tab left or right or neither.
            const tab = tabDirection < 0
                      ? optionally(pnodeEdits.tabBackEdit)
                      : tabDirection > 0
                      ? optionally(pnodeEdits.tabForwardEdit)
                      : id<Selection>() ;
            const edit =  compose( changeLabel,
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
            return edit.applyEdit( selection ) ;
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

        private standardBackFillList = [[labels.mkNoExpNd()], [placeHolder], [placeHolder], [labels.mkNoTypeNd()]] ;

        private deleteEdit = pnodeEdits.replaceWithOneOf( [[] as Array<PNode> ].concat(this.standardBackFillList) );

        private otherDeleteEdit = pnodeEdits.replaceWithOneOf( [[], [placeHolder], [labels.mkNoTypeNd()]] );

        public delete(selection:Selection) : Option<Selection> {
            const nodes : Array<PNode> = selection.selectedNodes() ;
            if(nodes.length === 1 && nodes[0].label() instanceof labels.NoExprLabel ) {
                return this.otherDeleteEdit.applyEdit( selection ) ; }
            else {
                return this.deleteEdit.applyEdit(selection); }
        }

        public paste( srcSelection: Selection, trgSelection: Selection ) : Option<Selection> {
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
