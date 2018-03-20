/// <reference path="assert.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />
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
    import Type = vms.Type ;
    import Value = vms.Value ;
    import VarStack = vms.VarStack ;
    import VMS = vms.VMS;
    import BuiltInV = valueTypes.BuiltInV ;
    import StringV = valueTypes.StringV ;
    import ObjectV = valueTypes.ObjectV ;
    import ClosureV = valueTypes.ClosureV ;
    import NullV = valueTypes.NullV ;
    import DoneV = valueTypes.DoneV ;
    import Field = valueTypes.Field;
    import NonEmptyVarStack = vms.NonEmptyVarStack;

    class PlaayInterpreter implements vms.Interpreter {

        public step( vms : VMS ) : void {
            assert.checkPrecondition( vms.canAdvance() && vms.isReady() ) ;
            const node = vms.getPendingNode() ;
            const label = node.label() ;
            const stepper = theStepperRegistry[ label.kind() ] ;
            assert.check( stepper !== undefined, "No stepper for labels of kind " + label.kind() ) ; 
            stepper( vms ) ;
        }

        public select( vms : VMS ) : void {
            assert.checkPrecondition( vms.canAdvance() && ! vms.isReady() ) ;
            const node = vms.getPendingNode() ;
            const label = node.label() ;
            const selector = theSelectorRegistry[ label.kind() ] ;
            assert.check( selector !== undefined, "No selector for labels of kind " + label.kind() ) ;
            selector( vms ) ;
            assert.check( vms.hasError() || vms.canAdvance() && vms.isReady() ) ;
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
    theStepperRegistry[labels.LambdaLabel.kindConst] = lambdaStepper;

    theSelectorRegistry[ labels.CallWorldLabel.kindConst ] = leftToRightSelector ;
    theStepperRegistry[ labels.CallWorldLabel.kindConst ] = callWorldStepper ;

    theSelectorRegistry[ labels.CallLabel.kindConst ] = leftToRightSelector ;
    theStepperRegistry[labels.CallLabel.kindConst] = callStepper;

    // Control Labels
    theStepperRegistry[labels.ExprSeqLabel.kindConst] = exprSeqStepper ;
    theSelectorRegistry[labels.ExprSeqLabel.kindConst] = exprSeqSelector ;

    theStepperRegistry[labels.IfLabel.kindConst] = ifStepper;
    theSelectorRegistry[labels.IfLabel.kindConst] = ifSelector;

    theStepperRegistry[labels.WhileLabel.kindConst] = whileStepper;
    theSelectorRegistry[labels.WhileLabel.kindConst] = whileSelector;

    // Variable Labels
    theStepperRegistry[labels.AssignLabel.kindConst] = assignStepper;
    theSelectorRegistry[labels.AssignLabel.kindConst] = assignSelector;

    theSelectorRegistry[labels.VariableLabel.kindConst] = alwaysSelector;
    theStepperRegistry[labels.VariableLabel.kindConst] = variableStepper;

    theSelectorRegistry[labels.VarDeclLabel.kindConst] = varDeclSelector;
    theStepperRegistry[labels.VarDeclLabel.kindConst] = varDeclStepper;

    // Objects
    theSelectorRegistry[labels.ObjectLiteralLabel.kindConst] = exprSeqSelector;
    theStepperRegistry[labels.ObjectLiteralLabel.kindConst] = objectStepper;

    theSelectorRegistry[labels.AccessorLabel.kindConst] = leftToRightSelector;
    theStepperRegistry[labels.AccessorLabel.kindConst] = accessorStepper;


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

    function exprSeqSelector(vms : VMS) : void {
        // ExprSeqLabels are usually stepped twice. Once on a previsit to 
        // create the stack frame.  Then on a postvisit when the value of
        // the last expression becomes the value of the sequence.
        // TODO Optimize the case where there are no variable declarations.
        if( ! vms.hasExtraInformation() ) {
            // Must previsit.
            vms.setReady( true ) ; }
        else {
            leftToRightSelector( vms ) ;
        }
    }

    function ifSelector(vms : VMS) : void {
        //check if the condition node is mapped
        if (vms.isChildMapped(0)) {
            //if it is, get the result of the condition node
            if( ! vms.getChildVal(0).isStringV() ) {
                vms.reportError( "Condition is not a StringV." );
                return ; }
            const result : string = (<StringV> vms.getChildVal(0)).getVal();
            let choiceNode = -1;
            if (result === "true") {
                choiceNode = 1;
            }
            else if (result === "false") {
                choiceNode = 2;
            } else {
                vms.reportError("Condition is neither true nor false.") ;
                return ; }

            assert.check(choiceNode === 1 || choiceNode === 2, );
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

    function whileSelector(vms : VMS) : void {
        //check if the body is mapped and reset everything if it is
        if (vms.isChildMapped(1)) {
            vms.scrub(vms.getPending());
        }
        //check if the guard node is mapped
        if (vms.isChildMapped(0)) {
            if( ! vms.getChildVal(0).isStringV() ) {
                vms.reportError("Guard is not a StringV") ;
                return ;
            }
            const result : string = (<StringV> vms.getChildVal(0)).getVal();
            //check if true or false, if true, check select the body
            if (result === "true") {
                vms.pushPending(1);
                vms.getInterpreter().select(vms);
            }
            //otherwise, if it is false, set this node to ready
            else if (result === "false"){
                vms.setReady(true);
            }
            //otherwise, report an error!
            else {
                vms.reportError( "Guard is neither true nor false!" ) ;
            }
        }
        //if it isn't selected, select the guard node
        else {
            vms.pushPending(0);
            vms.getInterpreter().select(vms);
        }
    }

    function assignSelector(vms : VMS) : void {
        if (!vms.isChildMapped(1)) {
            vms.pushPending(1);
            vms.getInterpreter().select(vms);
        }
        else {
            vms.setReady(true);
        }

    }

    function varDeclSelector(vms : VMS) : void {
        const variableNode : PNode = vms.getPendingNode().child(0);
        assert.check(variableNode.label().kind() === labels.VariableLabel.kindConst, "Attempting to declare something that isn't a variable name.");
        if (!vms.isChildMapped(2)) {
            vms.pushPending(2);
            vms.getInterpreter().select(vms);
        }
        else {
            vms.setReady(true);
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

    function nullLiteralStepper( vms : VMS ) : void {
        vms.finishStep( NullV.theNullValue ) ;
    }

    function lambdaStepper(vms: VMS) {
        const node = vms.getPendingNode();
        const paramlist = node.child(0);
        //Check for duplicate parameter names
        let paramNames: String[] = [];
        for (let i = 0; i < paramlist.count(); i++) {
          let name = paramlist.child(i).child(0).label().getVal();
          if (paramNames.includes(name)) {
            vms.reportError("Lambda contains duplicate parameter names.");
            return;
          }
          else {
            paramNames.push(name);
          }
        }
        const closure = new ClosureV(node, vms.getStack());
        vms.finishStep(closure);
    }

    function callWorldStepper( vms : VMS ) : void {
        const node = vms.getPendingNode();
        const fieldName = node.label().getVal();
        if (vms.getStack().hasField(fieldName)) {
            const functionValue : Value = vms.getStack().getField(fieldName).getValue();
            const args : Array<Value> = [];
            for (let i = 0; i < node.count(); i++) {
                args.push(vms.getChildVal(i)); }
            completeCall( vms, functionValue, args ) ;
        } 
        else {
            vms.reportError("No variable named " + fieldName + "is in scope.");
        } 
    }

    function callStepper(vms: VMS) : void {
        const node = vms.getPendingNode();
        const functionValue = vms.getChildVal(0) ;
        let args: Value[] = [];
        for (let i = 1; i < node.count(); i++) {
            args.push(vms.getChildVal(i)); }
        completeCall( vms, functionValue, args ) ;
    }

    function completeCall( vms : VMS, functionValue : Value, args : Array<Value> ) {
        if (functionValue instanceof BuiltInV) {
            const stepper = functionValue.getStepper();
            stepper(vms, args);
        } 
        else if (functionValue instanceof ClosureV) {
            const lambda = functionValue.getLambdaNode();
            const paramlist = lambda.child(0);
            processAndPushArgs(args, paramlist, lambda.child(2), vms);
        } 
        else {
            vms.reportError("Attempt to call a value that is neither a closure nor a built-in function.");
        } 
    }

    function processAndPushArgs(args: Value[], paramlist: PNode, root: PNode, vms: VMS) {
      if(args.length != paramlist.children(0, paramlist.count()).length) {
        vms.reportError("Number of arguments for lambda does not match parameter list.");
        return;
      }
      const manager = vms.getTransactionManager();
      const stackFrame = new ObjectV(manager);
      for (let i = 0; i < args.length; i++) {
        const varName = paramlist.child(i).child(0).label().getVal();
        const val = args[i];
        //TODO: check that the types of val and vardecl are the same
        const field = new Field(varName, val, Type.ANY, true, true, manager);
        field.setIsDeclared();
        stackFrame.addField(field);
      }
      vms.pushEvaluation(root, new NonEmptyVarStack(stackFrame, vms.getStack()));
    }

    function exprSeqStepper(vms : VMS) : void {
        // We must step the node twice. Once on a previsit and once on a postvisit.
        if( ! vms.hasExtraInformation() ) {
          previsitNode(vms);
        }
        else {
            // Postvisit.
            // Set it to the value of the last child node if there is one and pop the stack frame.
            const numberOfChildren : number = vms.getPendingNode().count();
            const value : Value = (numberOfChildren === 0
                                   ? DoneV.theDoneValue
                                   : vms.getChildVal( numberOfChildren - 1) ) ;
            vms.finishStep( value );
            vms.getEval().popFromVarStack() ; }
    }

    function objectStepper(vms : VMS) : void {
      // We must step the node twice. Once on a previsit and once on a postvisit.
      if( ! vms.hasExtraInformation() ) {          
          previsitNode(vms);
      }
      else {
          // Postvisit.
          const value = (vms.getStack() as NonEmptyVarStack).getTop();
          vms.finishStep( value );
          vms.getEval().popFromVarStack() ; }
    }

  function previsitNode(vms: VMS) {
    // Previsit. Build and push stack frame
    const manager = vms.getTransactionManager() ;
      const stackFrame = new ObjectV( manager ) ;
      const node = vms.getPendingNode() ;
      const sz = node.count() ;
      const names = new Array<string>() ;
      for( let i=0; i < sz ; ++i ) {
          const childNode = node.child(i) ;
          if( childNode.label() instanceof labels.VarDeclLabel ) {
              const name : string = childNode.child(0).label().getVal() ;
              const initialValue = null ;
              const type : Type = Type.NOTYPE ;
              const field = new Field( name, NullV.theNullValue, type, false, false, manager ) ;
              if( names.some( (v : string) => v===name ) ) {
                  vms.reportError( "Variable " +name+ " is declared twice." ) ;
                  return ;
              } else {
                  stackFrame.addField( field ) ;
                  names.push( name ) ; }
          }
      } // end for
      vms.getEval().pushOntoVarStack( stackFrame ) ;
      // Now map this node to say it's been previsited.
      vms.putExtraInformation( stackFrame ) ;
      vms.setReady( false ) ;
  }

  function accessorStepper(vms: VMS) {
    const node = vms.getPendingNode();
    const object = vms.getChildVal(0);
    const field = vms.getChildVal(1);
    if (object instanceof ObjectV) {
      if (field instanceof StringV) {
        const val = object.getField(field.getVal()).getValue();
        vms.finishStep(val);
      } 
      else {
        vms.reportError("Fields of an object must be identified by a string value.");
        return;
      }
    }
    else {
      vms.reportError("Attempted to access field of non-object value.");
      return;
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

    function whileStepper(vms : VMS) : void {
        //use the value of the body if it is mapped, otherwise use null
        if (vms.isChildMapped(1)) {
            vms.finishStep(vms.getChildVal(1));
        }
        else {
            vms.finishStep( DoneV.theDoneValue ) ;
        }
    }

    function assignStepper(vms : VMS) : void {
        const assignNode : PNode = vms.getPendingNode();
        const variableNode : PNode = assignNode.child(0);
        if( variableNode.label().kind() !== labels.VariableLabel.kindConst ) {
            vms.reportError("Attempting to assign to something that isn't a variable.");
            return ; }
        const variableName : string = variableNode.label().getVal();
        const value : Value = vms.getChildVal(1);
        const variableStack : VarStack = vms.getStack();
        if( ! variableStack.hasField(variableName) ) {
            vms.reportError( "No variable named " + variableName + " is in scope." ) ;
            return ;
        }
        const field = variableStack.getField(variableName) ;
        if( ! field.getIsDeclared() ) {
            vms.reportError( "The variable named " + variableName + " has not been declared yet." ) ;
            return ;
        }
        // TODO Check that the value is assignable to the field.
        field.setValue( value ) ;
        vms.finishStep( DoneV.theDoneValue ) ;
    }

    function variableStepper(vms : VMS) : void {
        const variableNode : PNode = vms.getPendingNode();
        const variableName : string = variableNode.label().getVal();
        const variableStack : VarStack = vms.getStack();
        if( ! variableStack.hasField(variableName) ) {
            vms.reportError( "No variable named " + variableName + " is in scope." ) ;
            return ;
        }
        const field = variableStack.getField(variableName) ;
        if( ! field.getIsDeclared() ) {
            vms.reportError( "The variable named " + variableName + " has not been declared yet." ) ;
            return ;
        }
        vms.finishStep(field.getValue());
    }

    function varDeclStepper(vms : VMS) : void {
        const variableNode : PNode = vms.getPendingNode().child(0);
        assert.checkPrecondition(variableNode.label().kind() === labels.VariableLabel.kindConst, "Attempting to declare something that isn't a variable name.");
        const variableName : string = variableNode.label().getVal();
        const value : Value = vms.getChildVal(2);
        // TODO. Variable should be added to the frame at the start when the stack frame is created.
            //const type : Type = Type.NOTYPE; //TODO: actually select the type based on the type entered
            //const isConstant : boolean = false;
            //vms.addVariable(name, value, type, isConstant);
        
        const variableStack : VarStack = vms.getStack();
        assert.check( variableStack.hasField(variableName) ) ;
        const field = variableStack.getField(variableName) ;
        assert.check( ! field.getIsDeclared() ) ;
        field.setIsDeclared() ;
        // TODO Check that the value is assignable to the field.
        field.setValue( value ) ;
        vms.finishStep( DoneV.theDoneValue ) ;
    }
}

export = interpreter ;