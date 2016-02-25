/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;


module evaluation {

    import Stack = stack.Stack;
    import ExprNode = pnode.ExprNode;

    export class Evaluation {
        root : ExprNode;
        stack : Stack;
        //map : Map;
        pending : Array<Number>;
        ready : Boolean;

    }



}