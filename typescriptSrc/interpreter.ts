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

    // Functions and calls
    theSelectorRegistry[ labels.LambdaLabel.kindConst ] = alwaysSelector ;

    theSelectorRegistry[ labels.CallLabel.kindConst ] = leftToRightSelector ;
    theSelectorRegistry[ labels.CallWorldLabel.kindConst ] = leftToRightSelector ;

    theStepperRegistry[ labels.CallWorldLabel.kindConst ] = callWorldStepper ;

    // Assignment statements and variables
    theSelectorRegistry[ labels.VarDeclLabel.kindConst ] = leftToRightSelector ;
    theStepperRegistry[ labels.VarDeclLabel.kindConst ] = variableDeclarationStepper ;

    theSelectorRegistry[ labels.AssignLabel.kindConst ] = leftToRightSelector ;

    theSelectorRegistry[ labels.VariableLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.VariableLabel.kindConst ] = variableLabelStepper ;

    // Expression Sequence
    theSelectorRegistry[ labels.ExprSeqLabel.kindConst ] = leftToRightSelector ;
    theStepperRegistry[ labels.ExprSeqLabel.kindConst ] = exprSeqStepper ;

    // Types
    theSelectorRegistry[ labels.NoTypeLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.NoTypeLabel.kindConst ] = nullLiteralStepper ; //TODO: make this an actual function


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

    // temporary stepper function for this
    function exprSeqStepper( vms : VMS ) : void {
        vms.finishStep( theNullValue ) ;
    }

    interface VariableNameCache { [key:string] : StringV }

    const theVariableNameCache : VariableNameCache = {} ;

    function variableLabelStepper( vms : VMS ) : void {
        const label = vms.getPendingNode().label() ;
        const variableName = label.getVal() ;
        let result = theVariableNameCache[ variableName ] ;
        if( result === undefined ) {
            result = theVariableNameCache[ variableName ] = new StringV( variableName ) ;
        }
        vms.finishStep( result ) ;
    }

    function variableDeclarationStepper( vms : VMS ) : void {
        const label = vms.getPendingNode().label() ;
        const varStack = vms.getStack() ;

    }

    //this does not currently work with embedded operations
    function callWorldStepper( vms : VMS ) : void {
        const label = vms.getPendingNode().label() ;
        const operands = vms.getPendingNode().children() ;
        const operation = label.getVal() ;
        let result = +( operands[0].label().getVal() ) ;
        switch ( operation ) {
            case ( "+" ) :
                for( let i = 1; i < operands.length; i++ ) {
                    let operand = +( operands[i].label().getVal() ) ;
                    result = result + operand ;
                }
                break ;
            case ( "-" ) :
                for ( let i = 1; i < operands.length; i++ ) {
                    let operand = +( operands[i].label().getVal() ) ;
                    result = result - operand ;
                }
                break ;
            case ( "*" ) :
                for ( let i = 1; i < operands.length; i++ ) {
                    let operand = +( operands[i].label().getVal() ) ;
                    result = result * operand ;
                }
                break ;
            case ( "/" ) :
                for ( let i = 1; i < operands.length; i++ ) {
                    let operand = +( operands[i].label().getVal() ) ;
                    result = result / operand ;
                }
                break ;
        }
        let stringResult = theStringCache[ String(result) ];
        if( stringResult === undefined ) {
            stringResult = theStringCache [ String(result) ] = new StringV( String( result ) ) ;
        }
        alert( stringResult ) ;
        vms.finishStep( stringResult ) ;
    }
}

export = interpreter ;