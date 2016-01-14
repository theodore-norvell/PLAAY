/// <reference path="Assert.ts" />
/// <reference path="Collections.ts" />

import Option = Collections.Option;
import Some = Collections.Some;
import None = Collections.None;

interface Label {
    isValid : ( children : Array<PNode> ) => boolean ;
}

class PNode {
    private _label : Label ;
    private _children : Array<PNode> ;
    
    /** Construct a PNode.
    *  Precondition: label.isValid( children )
    * @param label A Label for the node.
    * @param children: A list (Array) of children 
    */
    public constructor( label : Label, children : Array<PNode> ) {
        Assert.check( label.isValid( children ),
                      "Attempted to make an invalid program node" ) ;
        this._label = label ;
        this._children = children.slice() ;
    }    
    public count() : number {
        return this._children.length ; }
        
    public children(start : number, end : number ) : Array<PNode> {
        if( start===undefined ) start = 0 ;
        if( end===undefined ) end = this._children.length ;
        return this._children.slice(start, end ) ; }
    public child( i : number ) : PNode {
        return this._children[i] }
    public label() : Label {
        return this._label ; }
    
    /** Possibly return a copy of the node in which the children are replaced.
    * The result will have children
    *    [c[0], c[1], c[start-1]] ++ newChildren ++ [c[end], c[end+1], ...]
    * where c is this.children().
    * I.e. the segment c[ start,.. end] is replaced by newChildren.
    * The method succeeds iff the node required to be constructed would be valid.
    * @param newChildren An array of children to be added
    * @param start The first child to omit. Default 0.
    * @param end The first child after start to not omit. Default this.children().length.
    */
    public tryModify( newChildren : Array<PNode>, start : number, end : number )
    : Option<PNode> {  
        if( start===undefined ) start = 0 ;
        if( end===undefined ) end = this._children.length ;
        var cs = this._children.slice(0,start)
                 .concat( newChildren,
                          this._children.slice(end, this._children.length ) ) ;
        return PNode.tryMake( this._label, cs ) ;
    }
    
    /** Would tryModify succeed?
    */
    public canModify( newChildren : Array<PNode>, start : number, end : number )
    : boolean {  
        return this.tryModify( newChildren, start, end ).isNonempty() ;
    }
    
    /** Return a copy of the node in which the children are replaced.
    * Precondition: canModify( newChildren, start, end )
    */
    public modify( newChildren : Array<PNode>, start : number, end : number )
    : PNode {  
        var opt = this.tryModify( newChildren, start, end ) ;
        return opt.choose(
                    function( p ) { return p ; },
                    function() {
                        Assert.check(false, "Precondition violation on PNode.modify" ) ;
                        return null ; } )
    }
    
    public tryModifyLabel( newLabel : Label )
    : Option<PNode> {  
        return PNode.tryMake( newLabel, this._children ) ;
    }
    
    public canModifyLabel( newLabel : Label )
    : boolean {  
        return this.tryModifyLabel( newLabel ).isNonempty() ;
    }
    
    public modifyLabel( newLabel : Label ) : PNode {  
        var opt = this.tryModifyLabel( newLabel ) ;
        return opt.choose(
                    function( p ) { return p ; },
                    function() {
                        Assert.check(false, "Precondition violation on PNode.modifyLabel" ) ;
                        return null ; } )
    }
    
    static tryMake( label : Label, children : Array<PNode> ) : Option<PNode> {
        if( label.isValid( children ) ) {
            return new Some( new PNode( label, children ) ) ; }
        else {
            return new None<PNode>() ; } }
}
