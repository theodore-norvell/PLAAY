/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="dnodeEdits.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="treeView.ts" />
/// <reference path="selection.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import dnodeEdits = require ('./dnodeEdits');
import edits = require('./edits');
import labels = require( './labels' ) ;
import pnode = require( './pnode' ) ;
import selection = require( './selection');
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
    import Selection = selection.Selection;
    import replaceOrEngulfTemplateEdit = dnodeEdits.replaceOrEngulfTemplateEdit ;
    import replaceOrEngulfTemplatesEdit = dnodeEdits.replaceOrEngulfTemplatesEdit ;
    import list = collections.list;
    import List = collections.List ;
    import PLabel = pnode.PLabel ;
    import PNode = pnode.PNode;
    import Option = collections.Option;

    type PSelection = Selection<PLabel, PNode> ;
    type PEdit = Edit<PSelection> ;

    export enum Actions { IF, WHILE, STRING, NUMBER, TRUE, FALSE, NULL,
                          OBJECT, ARRAY, VAR, VAR_DECL, STORE, CALL, LOC,
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
                          STORE_OR_FIELD_TYPE,
                          TUPLE_OR_TUPLE_TYPE,
                          CLOSE,
                          AND_OR_MEET_TYPE,
                          OR_OR_JOIN_TYPE }
    

    const exprPlaceHolder = labels.mkExprPH() ;
    const typePlaceHolder = labels.mkTypePH() ;

    export class TreeManager {

        public createNode( action: Actions, sel:PSelection) : Option<PSelection> {
            console.log( "treeManager.createNode action is " + Actions[action].toString() ) ;
            let edit : Edit<PSelection> ;
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
                case Actions.STORE:
                    edit = this.makeStoreNode()  ;
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
                case Actions.STORE_OR_FIELD_TYPE :
                    edit = alt( [ this.makeStoreNode(),
                                  this.makeFieldTypeNode() ] ) ;
                    break ;
                case Actions.TUPLE_OR_TUPLE_TYPE :
                    edit = alt( [ this.makeTupleNode(), this.makeTupleType() ] ) ;
                    break ;
                case Actions.CLOSE :
                    edit = this.finishOffThisNode() ;
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
            return edit.applyEdit(sel) ;
        }

        //Only for nodes that can contain text, such as variables and strings.
        public createNodeWithText( action: Actions, sel: PSelection, text: string ) : Option<PSelection> {
            console.log( "treeManager.createNodeWithText action is " + Actions[action].toString() + " text is " + text ) ;
            let edit : Edit<PSelection> ;
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
            return edit.applyEdit(sel) ;
        }

        private makeVarNode(text : string = "") : Edit<PSelection> {
            const varNode = labels.mkVar(text) ;
            const initNode : PNode = labels.mkNoExpNd();
            const varDeclNode = labels.mkConstDecl( varNode, typePlaceHolder, initNode ) ;
            const edit0 = dnodeEdits.insertChildrenEdit<PLabel,PNode>( [varNode] ) ;
            const edit1 = dnodeEdits.insertChildrenEdit( [varDeclNode] ) ;
            return alt([edit0,edit1]) ;
        }

        // While nodes
        private makeWhileNode() : Edit<PSelection> {

            const seq = labels.mkExprSeq([]);

            const whilenode = pnode.make(labels.WhileLabel.theWhileLabel, [exprPlaceHolder, seq]);
            const template0 = makeSelection( whilenode, list<number>(), 0, 1 ) ;
            const template1 = makeSelection( whilenode, list<number>(0), 0, 0 ) ;
            return replaceOrEngulfTemplatesEdit( [template0, template1] ) ;
        }

        //objects
        private makeObjectLiteralNode() : Edit<PSelection> {
            const objectnode = labels.mkObject([]);
            const template = makeSelection( objectnode, list<number>(), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;
        }

        //arrays
        private makeArrayLiteralNode() : Edit<PSelection> {
            const arraynode = pnode.make(labels.ArrayLiteralLabel.theArrayLiteralLabel, []);
            const template = makeSelection( arraynode, list<number>(), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;
        }

        //Object accessor
        private makeAccessorNode() : Edit<PSelection> {

            const opt = pnode.tryMake(labels.AccessorLabel.theAccessorLabel,
                                      [exprPlaceHolder, exprPlaceHolder]);

            const accessorNode = opt.first() ;

            const template = makeSelection( accessorNode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;

        }

        //Object accessor
        private makeDotNode() : Edit<PSelection> {

            const dotNode = labels.mkDot( "", true, exprPlaceHolder ) ;

            const template = makeSelection( dotNode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template ) ;

        }

        private makeTupleNode() : Edit<PSelection> {
            const tuplenode = labels.mkTuple([exprPlaceHolder,exprPlaceHolder]);
            const template0 = makeSelection( tuplenode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template0 ) ;
        }

        private finishOffThisNode() : Edit<PSelection> {
            const allArePH = ( sel : Selection<PLabel,PNode> ) => {
                return sel.selectedNodes().every( (ch : PNode) =>
                    ch.isPlaceHolder() );
            } ;
            const placeHolderFollows = ( sel : Selection<PLabel,PNode> ) => {
                const p = sel.parent() ;
                const end = sel.end() ;
                if( p.count() === end ) return false ;
                const q = p.child(end) ;
                return q.isPlaceHolder() ;
            } ;
            const expandMaybe = optionally( compose( testEdit(placeHolderFollows),
                                                     dnodeEdits.moveFocusRightEdit() ) ) ;
            return compose( alt([ testEdit(allArePH),
                                  compose( dnodeEdits.tabForwardEdit(),
                                           testEdit(allArePH) ) ] ),
                            expandMaybe, expandMaybe, expandMaybe,
                            this.deleteEdit, dnodeEdits.tabForwardEdit() ) ;
        }

        // If nodes
        private makeIfNode() : Edit<PSelection> {
            const emptSeq = labels.mkExprSeq([]);
            const ifNode = pnode.make(labels.IfLabel.theIfLabel, [exprPlaceHolder, emptSeq, emptSeq]);
            // console.log( "makeIfNode: Making template") ;
            const template0 = makeSelection( ifNode, list<number>(), 0, 1 ) ;
            const template1 = makeSelection( ifNode, list<number>(1), 0, 0 ) ;
            // console.log( "makeIfNode: Making edit") ;
            return replaceOrEngulfTemplatesEdit( [template0, template1]  ) ;
        }

        private makeLambdaNode() : Edit<PSelection> {
            const noTypeNode = labels.mkNoTypeNd() ;
            const paramList = labels.mkParameterList([]);
            const body : PNode =labels.mkExprSeq([]);
            const lambdaNode = labels.mkLambda( paramList, typePlaceHolder, body ) ;
            const template = makeSelection( lambdaNode, list(2), 0, 0 ) ;
            return replaceOrEngulfTemplateEdit( template  ) ;
        }

        private makeStoreNode() : Edit<PSelection> {

            const storeNode = labels.mkStore( exprPlaceHolder, exprPlaceHolder ) ;

            const template0 = makeSelection( storeNode, list<number>(), 0, 1 ) ;
            const template1 = makeSelection( storeNode, list<number>(), 0, 2 ) ;
            return replaceOrEngulfTemplatesEdit( [template0, template1] ) ;
        }

        private makeLocNode() : Edit<PSelection> {
            // We either make a new location operator or toggle a variable
            // declaration between being loc or nonloc.
            const operatorTempl = makeSelection( labels.mkLoc(exprPlaceHolder),                                                list<number>(), 0, 1 ) ;
            return alt( [ compose( dnodeEdits.toggleBooleanEdit(),
                                   dnodeEdits.tabForwardEdit() ),
                          replaceOrEngulfTemplateEdit( operatorTempl ),
                          compose( dnodeEdits.moveOutNormal(),
                                   dnodeEdits.toggleBooleanEdit(),
                                   dnodeEdits.tabForwardEdit() ) ] ) ;
        }

        private makeVarDeclNode( ) : Edit<PSelection> {
            // TODO. When the var node is empty,
            // declaration node should be selected, not (as now) the typeNode.
            // This is so that the Help is synchronized to the declaration node.
            const varNode : PNode = labels.mkVar("");
            const typeNode : PNode = typePlaceHolder;
            const initNode : PNode = exprPlaceHolder;

            const vardeclnode = labels.mkConstDecl( varNode, typeNode, initNode ) ;

            const template0 = makeSelection( vardeclnode, list<number>(), 0, 1 ) ;
            const template1 = makeSelection( vardeclnode, list<number>(), 2, 3 ) ;
            const templates = [template0, template1] ;
            const makeVarDeclEdit = replaceOrEngulfTemplatesEdit( templates  ) ;


            const makeTemplate2 = ( varNode : PNode ) =>  {
                const locVarDeclNode = labels.mkLocVarDecl( varNode, typeNode, initNode ) ;
                return makeSelection( locVarDeclNode, list<number>(), 0, 1 ) ; } 
            const isLoc = ( sel : Selection<PLabel,PNode> ) => {
                const p = sel.parent() ;
                const result = p.label() instanceof labels.LocLabel ;
                console.log( result ? "Yes p is a loc" : "No p is not a loc") ;
                return result ; 
            }
            const firstSelected = ( sel : Selection<PLabel,PNode> ) : Option<PNode> => {
                const nodes = sel.selectedNodes() ;
                if( nodes.length !== 1) return collections.none() ;
                else return collections.some(nodes[0]) ;
            }
            const extractVarNode = ( p : PNode ) : Option<PNode> => {
                console.log( "Hello from extractVarNode") ;
                console.log( p.label() instanceof labels.VariableLabel ? "node is a var" : "node is not a var") ;
                if( p.label() instanceof labels.VariableLabel ) return collections.some(p) ;
                else return collections.none() ;
            }
            const extractExprPHNode = ( p : PNode ) : Option<PNode> => {
                //console.log( "Hello from extractExprPHNode") ;
                //console.log( p.label() instanceof labels.ExprPHLabel ? "node is an ExprPH" : "node is not ExprPH") ;
                if( p.label() instanceof labels.ExprPHLabel )
                    return collections.some(p) ;
                else return collections.none() ;
            }

            const turnLocExpIntoVarDecl0 : Edit<Selection<PLabel,PNode>>
                = compose( testEdit( isLoc ),
                           edits.prefix(
                                (sel) => firstSelected(sel).bind(extractExprPHNode),
                                (p:PNode) => compose(
                                    dnodeEdits.moveOutNormal(),
                                    dnodeEdits.replaceWithTemplateEdit( [makeTemplate2(varNode)] ) ) ) ) ;

            const turnLocExpIntoVarDecl1 : Edit<Selection<PLabel,PNode>>
                = compose( testEdit( isLoc ),
                           edits.prefix(
                                (sel) => firstSelected(sel).bind(extractVarNode),
                                (p:PNode) => compose(
                                    dnodeEdits.moveOutNormal(),
                                    dnodeEdits.replaceWithTemplateEdit( [makeTemplate2(p)] ),
                                    dnodeEdits.tabForwardEdit() ) ) ) ;

            return alt( [   /* 0 If the first selected node is an ExprPH inside a LocationExpression,
                               we make a Var decl (for a location) with an open var node. */
                            turnLocExpIntoVarDecl0,
                            /* 1 If the first selected node is an var node inside a LocationExpression,
                            we make a Var decl (for a location) the same var node as the declaration's var node. */
                            turnLocExpIntoVarDecl1,
                            /* 2. Like case 0, but the first selected node is the location node. */
                            compose(dnodeEdits.rightEdit(),turnLocExpIntoVarDecl0),
                            /* 3. Like case 1, but the first selected node is the location node. */
                            compose(dnodeEdits.rightEdit(),turnLocExpIntoVarDecl1),
                            /* 4. The normal cases.
                               4a.  engulf or replace an var node.
                               4b.  engulf or replace an initialization expression. */
                            makeVarDeclEdit,
                        ] ) ;
        }

        private makeCallVarNode(name : string, argCount : number ) : Edit<PSelection> {
            // console.log( ">> Calling makeCallVarNode") ;
            const args = new Array<PNode>() ;
            for( let i = 0 ; i < argCount ; ++i ) {
                args.push(exprPlaceHolder) ;
            }
            let callVarNode : PNode ;
            if(name === "")
            {
                callVarNode = labels.mkOpenCallVar( name, args);
                const template = argCount === 0
                    ? makeSelection( callVarNode, list<number>(), 0, 0 )
                    : makeSelection( callVarNode, list<number>(), 0, 1 ) ;
                return replaceOrEngulfTemplateEdit( template  ) ;
            }
            else
            {
                callVarNode = labels.mkClosedCallVar(name, args);
                const template = argCount===0
                    ? makeSelection( callVarNode, list<number>(), 0, 0 )
                    : makeSelection( callVarNode, list<number>(), 0, 1 );
                return replaceOrEngulfTemplateEdit( template  ) ;
            }
        }

        private makeCallNode() : Edit<PSelection> {

            const callnode = labels.mkCall(exprPlaceHolder, exprPlaceHolder) ;

            const template = makeSelection( callnode, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template  ) ;
        }

        private makeNoTypeNode() : Edit<PSelection> {

            const typenode = labels.mkNoTypeNd() ;
            return dnodeEdits.insertChildrenEdit([typenode]);
        }

        private makeStringLiteralNode(text : string = "") : Edit<PSelection> {
            const literalnode = labels.mkStringLiteral(text);
            return dnodeEdits.insertChildrenEdit([literalnode]);

        }

        private makeNumberLiteralNode(text : string = "0") : Edit<PSelection> {
            const literalnode = labels.mkNumberLiteral(text);
            return dnodeEdits.insertChildrenEdit([literalnode]);

        }

        private makeTrueBooleanLiteralNode() : Edit<PSelection> {
            const literalnode = labels.mkTrueBooleanLiteral() ;
            return dnodeEdits.insertChildrenEdit([literalnode]);
        }

        private makeFalseBooleanLiteralNode() : Edit<PSelection> {
            const literalnode = labels.mkFalseBooleanLiteral() ;
            const edit0 = this.makePrimitiveTypeNode("booleanType");
            const edit1 = dnodeEdits.insertChildrenEdit([literalnode]);
            return edits.alt([edit0,edit1]);
        }

        private makeNullLiteralNode(isTypeNode:boolean) : Edit<PSelection> {
            const opt = pnode.tryMake(labels.NullLiteralLabel.theNullLiteralLabel, []);
            const literalnode = opt.first() ;
            const edit0 = dnodeEdits.insertChildrenEdit([literalnode]);
            const edit1 = this.makePrimitiveTypeNode("nullType");
            return edits.alt([edit0,edit1]);
            
        }

        private makeNumberTypeNode( digit : string )  : Edit<PSelection> {
            switch( digit ) {
                case "0" : return this.makePrimitiveTypeNode( "natType" ) ;
                case "1" : return this.makePrimitiveTypeNode( "integerType" ) ;
                default: return this.makePrimitiveTypeNode( "numberType" ) ;
            }
        }

        private makePrimitiveTypeNode( type : string ) : Edit<PSelection> {
            const typeNode = labels.mkPrimitiveTypeLabel(type);
            //return edits.compose( dNodeEdits.insertChildrenEdit([typeNode]),
            //                      edits.optionally(dNodeEdits.tabForwardEdit())) ;
            return dnodeEdits.insertChildrenEdit([typeNode]) ; }

        private makeTupleType() : Edit<PSelection> {
            const tupleType = labels.mkTupleType([typePlaceHolder,typePlaceHolder]);
            const template1 = makeSelection( tupleType, list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template1 ) ;
        }

        private makeLocType() : Edit<PSelection> {
            const typeTempl = makeSelection( labels.mkLocationType( typePlaceHolder ),
                                             list<number>(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( typeTempl ) ;
        }

        private makeFieldTypeNode() : Edit<PSelection> {
            const typeNode = labels.mkFieldType([exprPlaceHolder, typePlaceHolder]);
            const template0 = makeSelection(typeNode,list<number>(),0,1);
            const template1 = makeSelection(typeNode,list<number>(),1,2);
            return replaceOrEngulfTemplatesEdit([template0,template1]);
        }

        private makeFunctionType() : Edit<PSelection> {
            const typenode = labels.mkFunctionType(typePlaceHolder, typePlaceHolder);
            const template = makeSelection( typenode, list(), 0, 1 ) ;
            return replaceOrEngulfTemplateEdit( template  ) ;
        }

        private makeJoinTypeNode() : Edit<PSelection> {
            const typeNode = labels.mkJoinType([typePlaceHolder, typePlaceHolder]);
            const template = makeSelection(typeNode,list<number>(),0,1);
            return replaceOrEngulfTemplateEdit( template ) ; 
        }

        private makeMeetTypeNode() : Edit<PSelection> {
            const typeNode = labels.mkMeetType([typePlaceHolder, typePlaceHolder]);
            const template = makeSelection(typeNode,list<number>(),0,1);
            return replaceOrEngulfTemplateEdit( template ) ; 
        }

        public openLabel( sel: PSelection ) : Option<PSelection> {
            const ed : Edit<PSelection> = dnodeEdits.openLabelEdit() ;
            return ed.applyEdit( sel ) ;
        }

        public changeNodeString(sel: PSelection, newString: string, tabDirection: number ) : Option<PSelection> {
            // First change the label
            const oldLabelEmpty = sel.size() === 1
                               && sel.selectedNodes()[0].label().getString() === "" ;
            const changeLabel : Edit<PSelection> = new dnodeEdits.ChangeStringEdit(newString);
            // Next, if the newString is an infix operator, the node is a callVar
            // with no children, and the old string was empty ...
            const test0 = testEdit<PSelection>(
                (s:PSelection) => {
                    const nodes = s.selectedNodes() ;
                    if( nodes.length === 0 ) return false ;
                    const p = nodes[0] ;
                    return oldLabelEmpty
                          && treeView.stringIsInfixOperator( newString )
                          && p.label().kind() === CallVarLabel.kindConst 
                          && p.count() === 0 ; } ) ;
            // ... then add two placeholders as children and select callVar node.
            const addPlaceholders = dnodeEdits.insertChildrenEdit(
                                        [ exprPlaceHolder, exprPlaceHolder ] ) ;
            // Otherwise if the new string is not an infix operator, the node is a callVar
            // with no children, and the old string was empty ...
            const test1 = testEdit<PSelection>(
                (s:PSelection) => {
                    const nodes = s.selectedNodes() ;
                    if( nodes.length === 0 ) return false ;
                    const p = nodes[0] ;
                    return oldLabelEmpty
                          && ! treeView.stringIsInfixOperator( newString )
                          && p.label().kind() === CallVarLabel.kindConst 
                          && p.count() === 0 ; } ) ;
            // ... then add one placeholder.
            // Othewise leave it alone.
            const add1Placeholder = dnodeEdits.insertChildrenEdit( [ exprPlaceHolder ] ) ;
            // Finally we do an optional tab left or right or neither.
            const tab : Edit<PSelection> = tabDirection < 0
                      ? optionally(dnodeEdits.tabBackEdit())
                      : tabDirection > 0
                      ? optionally(dnodeEdits.tabForwardEdit())
                      : id<PSelection>() ;
            const a : Edit<PSelection> = compose( test0,
                dnodeEdits.rightEdit(),
                addPlaceholders,
                dnodeEdits.selectParentEdit() ) ;
            const b : Edit<PSelection> = compose( test1,
                dnodeEdits.rightEdit(),
                add1Placeholder,
                dnodeEdits.selectParentEdit() ) ;
            const c : Edit<PSelection>= id() ;
            const d : Edit<PSelection> = alt( [a, b, c] ) ;
            const edit : Edit<PSelection> =  compose( changeLabel,
                                                      d,
                                                      tab ) ;
            return edit.applyEdit( sel ) ;
        }

        public selectAll( sel:PSelection ) : Option<PSelection> {
            const root = sel.root() ;
            const n = root.count() ;
            return collections.some( makeSelection( root, list<number>(), 0, n ) ) ;
        }

        public moveOut( sel:PSelection ) : Option<PSelection> {
            const expand : Edit<PSelection> = dnodeEdits.expandEdit() ;
            const out : Edit<PSelection> = dnodeEdits.moveOutNormal() ;
            const edit = alt( [expand, out] ) ;
            return edit.applyEdit(sel) ;
        }

        public moveLeft( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.leftEdit();
            return edit.applyEdit(sel);
        }

        public moveRight( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.rightEdit();
            return edit.applyEdit(sel);
        }

        public moveUp( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.upEdit();
            return edit.applyEdit(sel);
        }

        public moveDown( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection>  = dnodeEdits.downEdit();
            return edit.applyEdit(sel);
        }

        public moveFocusLeft( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.moveFocusLeftEdit();
            return edit.applyEdit(sel);
        }

        public moveFocusRight( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.moveFocusRightEdit();
            return edit.applyEdit(sel);
        }

        public moveFocusUp( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.moveFocusUpEdit();
            return edit.applyEdit(sel);
        }

        public moveFocusDown( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.moveFocusDownEdit() ;
            return edit.applyEdit(sel);
        }

        public moveTabForward( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.tabForwardEdit() ;
            return edit.applyEdit(sel);
        }
         
        public moveTabBack( sel:PSelection ) : Option<PSelection> {
            const edit : Edit<PSelection> = dnodeEdits.tabBackEdit() ;
            return edit.applyEdit(sel);
        }

        private standardBackFillList : Array<Array<PNode>>
            = [[], [labels.mkNoExpNd()], [exprPlaceHolder], [labels.mkNoTypeNd()], [typePlaceHolder]] ;

        private deleteEdit = dnodeEdits.replaceWithOneOf( this.standardBackFillList );

        private otherBackFillList : Array<Array<PNode>>
            = [[], [exprPlaceHolder], [typePlaceHolder], [labels.mkNoTypeNd()]] ;

        private otherDeleteEdit = dnodeEdits.replaceWithOneOf( this.otherBackFillList );

        public delete(sel:PSelection) : Option<PSelection> {
            const nodes : Array<PNode> = sel.selectedNodes() ;
            if(nodes.length === 1
                && (nodes[0].label() instanceof labels.NoExprLabel
                    || nodes[0].label() instanceof labels.NoTypeLabel) ) {
                return this.otherDeleteEdit.applyEdit( sel ) ; }
            else {
                return this.deleteEdit.applyEdit(sel); }
        }

        public paste( srcSelection: PSelection, trgSelection: PSelection ) : Option<PSelection> {
            const pasteEdit = dnodeEdits.pasteEdit(srcSelection, this.standardBackFillList );
            return pasteEdit.applyEdit( trgSelection ) ;
        }

        public move( srcSelection : PSelection, trgSelection : PSelection ) : Option<PSelection> {
            const swapEdit = dnodeEdits.moveEdit(srcSelection, this.standardBackFillList);
            return swapEdit.applyEdit( trgSelection ) ;
        }

        public swap( srcSelection : PSelection, trgSelection : PSelection ) : Option<PSelection> {
            const swapEdit = dnodeEdits.swapEdit(srcSelection);
            return swapEdit.applyEdit( trgSelection ) ;
        }

        /** Create a list of up to three possible actions. */
        public pasteMoveSwapEditList(srcSelection : PSelection, trgSelection : PSelection) : Array< [string, string, PSelection] > {

            const selectionList : Array< [string, string, PSelection] > = [];

            const pasteEdit = dnodeEdits.pasteEdit( srcSelection, this.standardBackFillList );
            const pasteResult = pasteEdit.applyEdit( trgSelection ) ;
            pasteResult.map( newSel => selectionList.push(['Pasted', "Paste", newSel]) ) ;

            const moveEdit = dnodeEdits.moveEdit(srcSelection, this.standardBackFillList );
            const moveResult = moveEdit.applyEdit(trgSelection);
            // TODO: Suppress the push if newSel equals an earlier result
            moveResult.map( newSel => selectionList.push(['Moved', "Move", newSel]) ) ;

            const swapEdit = dnodeEdits.swapEdit(srcSelection);
            const swapResult = swapEdit.applyEdit( trgSelection ) ;
            // TODO: Suppress the push if newSel equals an earlier result
            swapResult.map( newSel => selectionList.push(['Swapped', "Swap", newSel]) ) ;

            return selectionList;

        }
    }

    function makeSelection( root : PNode, path : List<number>, anchor : number, focus : number ) : PSelection {
        return new Selection<PLabel,PNode>( root, path, anchor, focus ) ;
    }
}

export = treeManager;
