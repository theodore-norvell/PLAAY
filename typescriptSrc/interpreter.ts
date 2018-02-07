/// <reference path="assert.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="world.ts" />


import assert = require('./assert') ;
import labels = require('./labels') ;
import pnode = require('./pnode') ;
import valueTypes = require('./valueTypes') ;
import vms = require('./vms') ;
import world = require('./world') ;
import { Value } from './vms';

/** The interpreter module includes the various stepper and selector functions that
 * that define the meaning of each label.
 * 
 */
module interpreter {

    import Evaluation = vms.Evaluation;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;
    import StringV = valueTypes.StringV ;
    import ObjectV = valueTypes.ObjectV ;
    import ClosureV = valueTypes.ClosureV ;
    import NullV = valueTypes.NullV ;
    import DoneV = valueTypes.DoneV ;

    class PlaayInterpreter implements vms.Interpreter {

        public step( vms : VMS ) : void {
            assert.checkPrecondition( vms.isReady() ) ;
            const node = vms.getPendingNode() ;
            const label = node.label() ;
            const stepper = theStepperRegistry[ label.kind() ] ;
            assert.check( stepper !== undefined, "No stepper for labels of kind " + label.kind() ) ; 
            stepper( vms ) ;
        }

        public select( vms : VMS ) : void {
            assert.checkPrecondition( ! vms.isReady() ) ;
            const node = vms.getPendingNode() ;
            const label = node.label() ;
            const selector = theSelectorRegistry[ label.kind() ] ;
            assert.check( selector !== undefined, "No selector for labels of kind " + label.kind() ) ;
            selector( vms ) ;
            assert.check( vms.isReady() ) ;
        }
    }

    const theInterpreter = new PlaayInterpreter ;

    export function getInterpreter() : vms.Interpreter {
        return theInterpreter ;
    }

    type Stepper = ( vms : VMS ) => void ;
    
    type Selector = ( vms : VMS ) => void ;

    interface StepperRegistry { [key:string] : Stepper ; }

    const theStepperRegistry : StepperRegistry = {} ;

    interface SelectorRegistry { [key:string] : Selector ; }

    const theSelectorRegistry : SelectorRegistry = {} ;

    // Constants
    theSelectorRegistry[ labels.BooleanLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.BooleanLiteralLabel.kindConst ] = stringLiteralStepper ;

    theSelectorRegistry[ labels.NullLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.NullLiteralLabel.kindConst ] = nullLiteralStepper ;

    theSelectorRegistry[ labels.NumberLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.NumberLiteralLabel.kindConst ] = stringLiteralStepper ;
    
    theSelectorRegistry[ labels.StringLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.StringLiteralLabel.kindConst ] = stringLiteralStepper ;

    theSelectorRegistry[ labels.CallWorldLabel.kindConst ] = leftToRightSelector ;
    theStepperRegistry[ labels.CallWorldLabel.kindConst ] = callWorldStepper ;

    // Functions and calls
    theSelectorRegistry[ labels.LambdaLabel.kindConst ] = alwaysSelector ;

    theSelectorRegistry[ labels.CallLabel.kindConst ] = leftToRightSelector ;
    theSelectorRegistry[ labels.CallWorldLabel.kindConst ] = leftToRightSelector ;

    theStepperRegistry[ labels.ExprSeqLabel.kindConst ] = exprSeqStepper ;
    theSelectorRegistry[ labels.ExprSeqLabel.kindConst ] = leftToRightSelector ;

    theStepperRegistry[labels.IfLabel.kindConst] = ifStepper;
    theSelectorRegistry[labels.IfLabel.kindConst] = ifSelector;


    // Selectors.  Selectors take the state from not ready to ready.

    function alwaysSelector( vms : VMS ) : void {
        vms.setReady( true ) ;
    }

    function leftToRightSelector( vms : VMS ) : void {
        const node = vms.getPendingNode() ;
        const sz = node.count() ;
        let i = 0 ; 
        for( ; i < sz ; ++i ) {
            if( ! vms.isChildMapped(i) ) break ;
        }
        if( i===sz) {
            // All children have been evaluated.
            // So we pick the pending.
            vms.setReady( true ) ; }
        else {
            // Child i has not been evaluated.
            // recursively select from that child.
            vms.pushPending( i ) ;
            vms.getInterpreter().select( vms ) ;
        }
    }

    // Steppers

    interface StringCache { [key:string] : StringV ; }

    const theStringCache : StringCache = {} ;

    function stringLiteralStepper( vms : VMS ) : void {
        const label = vms.getPendingNode().label() ;
        const str = label.getVal() ;
        let result = theStringCache[ str ] ;
        if( result === undefined ) {
            // Normally steppers and selectors should make no changes to anything
            // other than the vms. This is so that undo and redo work.
            // Here we make a harmeless exception by updating the cache.
            result = theStringCache[ str ] = new StringV( str ) ;
        }
        vms.finishStep( result ) ;
    }
    
    const theNullValue = new NullV() ;

    function nullLiteralStepper( vms : VMS ) : void {
        vms.finishStep( theNullValue ) ;
    }

    function callWorldStepper( vms : VMS ) : void {
      const value = vms.getPendingNode().label().getVal();
      if (vms.getStack().hasField(value)) {
        let stepper = vms.getStepper(value);        
        stepper(vms);  
      }
    }

    function exprSeqStepper(vms : VMS) : void {
        //set it to the value of the last child node :)
        const numberOfChildren : number = vms.getPendingNode().count();
        vms.finishStep(vms.getChildVal(numberOfChildren - 1));
    }

    function ifSelector(vms : VMS) : void {
        //check if the condition node is mapped
        let choiceNode = -1;
        if (vms.isChildMapped(0)) {
            //if it is, get the result of the condition node
            assert.check(vms.getChildVal(0).isStringV(), "Condition is not a StringV.");
            const result : string = (<StringV> vms.getChildVal(0)).getVal();
            if (result === "true") {
                choiceNode = 1;
            }
            else if (result === "false") {
                choiceNode = 2;
            }

            assert.check(choiceNode === 1 || choiceNode === 2, "Condition is neither true nor false.");
            if (!vms.isChildMapped(choiceNode)) {
                vms.pushPending(choiceNode);
                vms.getInterpreter().select(vms);
            }

            else {
                vms.setReady(true);
            }
        }

        else {
            vms.pushPending(0);
            vms.getInterpreter().select(vms);
        }

    }
     function ifStepper(vms : VMS) : void {
        assert.checkPrecondition(vms.isChildMapped(0), "Condition is not ready.");
        assert.checkPrecondition(vms.getChildVal(0).isStringV(), "Condition is not a StringV.");
        const result : string = (<StringV> vms.getChildVal(0)).getVal();
        assert.checkPrecondition(result === "true" || result === "false", "Condition is neither true nor false.");
        const choice = result === "true" ? 1 : 2;
        vms.finishStep(vms.getChildVal(choice));

     }

}

export = interpreter ;