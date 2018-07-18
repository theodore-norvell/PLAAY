/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />
/// <reference path="world.ts" />


import assert = require('./assert') ;
import collections = require( './collections' ) ;
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
    import NumberV = valueTypes.NumberV ;
    import BoolV = valueTypes.BoolV ;
    import ObjectV = valueTypes.ObjectV ;
    import ClosureV = valueTypes.ClosureV ;
    import NullV = valueTypes.NullV ;
    import TupleV = valueTypes.TupleV ;
    import Field = valueTypes.Field;
    import NonEmptyVarStack = vms.NonEmptyVarStack;

    class PlaayInterpreter implements vms.Interpreter {

        public step( vm : VMS ) : void {
            assert.checkPrecondition( vm.canAdvance() && vm.isReady() ) ;
            const node = vm.getPendingNode() ;
            const label = node.label() ;
            const stepper = theStepperRegistry[ label.kind() ] ;
            assert.check( stepper !== undefined, "No stepper for labels of kind " + label.kind() ) ; 
            stepper( vm ) ;
        }

        public select( vm : VMS ) : void {
            assert.checkPrecondition( vm.canAdvance() && ! vm.isReady() ) ;
            const node = vm.getPendingNode() ;
            const label = node.label() ;
            const selector = theSelectorRegistry[ label.kind() ] ;
            assert.check( selector !== undefined, "No selector for labels of kind " + label.kind() ) ;
            selector( vm ) ;
            assert.check( vm.hasError() || vm.canAdvance() && vm.isReady() ) ;
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
    theStepperRegistry[ labels.BooleanLiteralLabel.kindConst ] = booleanLiteralStepper ;

    theSelectorRegistry[ labels.NullLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.NullLiteralLabel.kindConst ] = nullLiteralStepper ;

    theSelectorRegistry[ labels.NumberLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.NumberLiteralLabel.kindConst ] = numberLiteralStepper ;
    
    theSelectorRegistry[ labels.StringLiteralLabel.kindConst ] = alwaysSelector ;
    theStepperRegistry[ labels.StringLiteralLabel.kindConst ] = stringLiteralStepper ;

    theSelectorRegistry[ labels.TupleLabel.kindConst ] = leftToRightSelector ;
    theStepperRegistry[ labels.TupleLabel.kindConst ] = tupleStepper ;


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

    // Objects and Arrays
    theSelectorRegistry[labels.ObjectLiteralLabel.kindConst] = exprSeqSelector;
    theStepperRegistry[labels.ObjectLiteralLabel.kindConst] = objectStepper;

    theSelectorRegistry[labels.AccessorLabel.kindConst] = leftToRightSelector;
    theStepperRegistry[labels.AccessorLabel.kindConst] = accessorStepper;

    theSelectorRegistry[labels.DotLabel.kindConst] = leftToRightSelector;
    theStepperRegistry[labels.DotLabel.kindConst] = dotStepper;

    theSelectorRegistry[labels.ArrayLiteralLabel.kindConst] = leftToRightSelector;
    theStepperRegistry[labels.ArrayLiteralLabel.kindConst] = arrayStepper;

    // Placeholders
    theSelectorRegistry[labels.ExprPHLabel.kindConst] = alwaysSelector ;
    theStepperRegistry[labels.ExprPHLabel.kindConst] = placeHolderStepper ;

    // Selectors.  Selectors take the state from not ready to ready.

    function alwaysSelector( vm : VMS ) : void {
        vm.setReady( true ) ;
    }

    function leftToRightSelector( vm : VMS ) : void {
        const node = vm.getPendingNode() ;
        const sz = node.count() ;
        let i = 0 ; 
        for( ; i < sz ; ++i ) {
            if( ! vm.isChildMapped(i) ) break ;
        }
        if( i===sz) {
            // All children have been evaluated.
            // So we pick the pending.
            vm.setReady( true ) ; }
        else {
            // Child i has not been evaluated.
            // recursively select from that child.
            vm.pushPending( i ) ;
            vm.getInterpreter().select( vm ) ;
        }
    }

    function exprSeqSelector(vm : VMS) : void {
        // ExprSeqLabels are usually stepped twice. Once on a previsit to 
        // create the stack frame.  Then on a postvisit when the value of
        // the last expression becomes the value of the sequence.
        // TODO Optimize the case where there are no variable declarations.
        if( ! vm.hasExtraInformation() ) {
            // Must previsit.
            vm.setReady( true ) ; }
        else {
            leftToRightSelector( vm ) ;
        }
    }

    function ifSelector(vm : VMS) : void {
        //check if the condition node is mapped
        if (vm.isChildMapped(0)) {
            //if it is, get the result of the condition node
            if( ! vm.getChildVal(0).isBoolV() ) {
                vm.reportError( "Guard is neither true nor false." );
                return ; }
            const result : boolean = (vm.getChildVal(0) as BoolV).getVal();
            const choiceNode = result ? 1 : 2 ;
            if (!vm.isChildMapped(choiceNode)) {
                // More work to do on child. Recurse
                vm.pushPending(choiceNode);
                vm.getInterpreter().select(vm);
            }
            else {
                // The If node is ripe.
                vm.setReady(true);
            }
        }

        else {
            vm.pushPending(0);
            vm.getInterpreter().select(vm);
        }

    }

    function whileSelector(vm : VMS) : void {
        //check if the body is mapped and reset everything if it is
        if (vm.isChildMapped(1)) {
            vm.scrub(vm.getPending());
        }
        //check if the guard node is mapped
        if (vm.isChildMapped(0)) {
            if( ! vm.getChildVal(0).isBoolV() ) {
                vm.reportError("Guard is neither true nor false!") ;
                return ;
            }
            const result : boolean = (vm.getChildVal(0) as BoolV).getVal();
            //check if true or false, if true, check select the body
            if (result) {
                vm.pushPending(1);
                vm.getInterpreter().select(vm);
            }
            //otherwise, if it is false, set this node to ready
            else {
                vm.setReady(true);
            }
        }
        //if it isn't selected, select the guard node
        else {
            vm.pushPending(0);
            vm.getInterpreter().select(vm);
        }
    }

    function assignSelector(vm : VMS) : void {
        const varNode : PNode = vm.getPendingNode().child(0);
        if (!vm.isChildMapped(1)) {
            vm.pushPending(1);
            vm.getInterpreter().select(vm);
        }
        // when assigning to field of an object
        else if (varNode.label().kind() === labels.AccessorLabel.kindConst) {
            // check if children of accessor have been evaluated
            const path = vm.getPending();
            const pathToObject = path.cat(collections.list<number>(0,0));
            const pathToField = path.cat(collections.list<number>(0,1));
            if (!vm.isMapped(pathToObject) || !vm.isMapped(pathToField)) {
              vm.pushPending(0);
              vm.getInterpreter().select(vm);
            } 
            else {
              vm.setReady(true);
            }         
        }
        else if (varNode.label().kind() === labels.DotLabel.kindConst) {
            const path = vm.getPending();
            const pathToObject = path.cat(collections.list<number>(0,0));
            if(!vm.isMapped(pathToObject)) {
                vm.pushPending(0);
                vm.getInterpreter().select(vm);
            }
            else {
                vm.setReady(true);
            }             
        }
        else {
            vm.setReady(true);
        }
    }

    function varDeclSelector(vm : VMS) : void {
        const variableNode : PNode = vm.getPendingNode().child(0);
        assert.check(variableNode.label().kind() === labels.VariableLabel.kindConst, "Attempting to declare something that isn't a variable name.");
        const initializerNode : PNode = vm.getPendingNode().child(2) ;
        if ( ! (initializerNode.label() instanceof labels.NoExprLabel )
         &&  !vm.isChildMapped(2) ) {
            vm.pushPending(2);
            vm.getInterpreter().select(vm);
        }
        else {
            vm.setReady(true);
        }
    }

    // Steppers

    interface StringCache { [key:string] : StringV ; }
    interface NumberCache { [key:number] : NumberV ; }
    
    const theStringCache : StringCache = {} ;
    const theNumberCache : NumberCache = {} ;

    function booleanLiteralStepper( vm: VMS ) : void {
        const label = vm.getPendingNode().label() ;
        assert.check( label.kind() === labels.BooleanLiteralLabel.kindConst ) ;
        const str = label.getVal();
        const result = str==="true" ? BoolV.trueValue : BoolV.falseValue ;
        vm.finishStep( result ) ;
    }
    
    function stringLiteralStepper( vm : VMS ) : void {
        const label = vm.getPendingNode().label() ;
        const str = label.getVal() ;
        let result = theStringCache[ str ] ;
        if( result === undefined ) {
            // Normally steppers and selectors should make no changes to anything
            // other than the vms. This is so that undo and redo work.
            // Here we make a harmeless exception by updating the cache.
            result = theStringCache[ str ] = new StringV( str ) ;
        }
        vm.finishStep( result ) ;
    }

    function numberLiteralStepper( vm : VMS ) : void {
        const label  = vm.getPendingNode().label() ;
        const str = label.getVal() ;
        // TODO use the proper parser.
        const regexp = /(\d+(\.\d+)?)/g ;
        if( regexp.test(str) ) {
            const num = Number(str) ;
            let result = theNumberCache[ num ] ; 
            if(result === undefined) {
                result = theNumberCache[ num ] = new NumberV( num ) ;
            }
            vm.finishStep( result ) ;
        }
        else {
            vm.reportError("Not a valid number.") ;
        }
    }
 
    function nullLiteralStepper( vm : VMS ) : void {
        vm.finishStep( NullV.theNullValue ) ;
    }

    function lambdaStepper(vm: VMS) : void {
        const node = vm.getPendingNode();
        const paramlist = node.child(0);
        //Check for duplicate parameter names
        const paramNames: String[] = [];
        for (let i = 0; i < paramlist.count(); i++) {
          const name = paramlist.child(i).child(0).label().getVal();
          if (paramNames.includes(name)) {
            vm.reportError("Lambda contains duplicate parameter names.");
            return;
          }
          else {
            paramNames.push(name);
          }
        }
        const closure = new ClosureV(node, vm.getStack());
        vm.finishStep(closure);
    }

    function callWorldStepper( vm : VMS ) : void {
        const node = vm.getPendingNode();
        const fieldName = node.label().getVal();
        if (vm.getStack().hasField(fieldName)) {
            const functionValue : Value = vm.getStack().getField(fieldName).getValue();
            const args : Array<Value> = [];
            for (let i = 0; i < node.count(); i++) {
                args.push(vm.getChildVal(i)); }
            completeCall( vm, functionValue, args ) ;
        } 
        else {
            vm.reportError("No variable named '" + fieldName + "' is in scope.");
        } 
    }

    function callStepper(vm: VMS) : void {
        const node = vm.getPendingNode();
        const functionValue = vm.getChildVal(0) ;
        const args: Value[] = [];
        for (let i = 1; i < node.count(); i++) {
            args.push(vm.getChildVal(i)); }
        completeCall( vm, functionValue, args ) ;
    }

    function completeCall( vm : VMS, functionValue : Value, args : Array<Value> ) : void {
        if( args.length === 1 && args[0] instanceof TupleV ) {
            args = (args[0] as TupleV).getItems() ;
        }
        if (functionValue instanceof BuiltInV) {
            const stepper = functionValue.getStepper();
            stepper(vm, args);
        } 
        else if (functionValue instanceof ClosureV) {
            callClosure(args, functionValue, vm);
        } 
        else {
            vm.reportError("Attempt to call a value that is neither a closure nor a built-in function.");
        } 
    }

    function callClosure(args: Value[], closure: ClosureV, vm: VMS) : void {
        const lambda = closure.getLambdaNode();
        const paramlist = lambda.child(0);
        const returnType = lambda.child(1) ;
        const body = lambda.child(2) ;
        const context = closure.getContext() ;
        // Check for the wrong number of arguments.
        // This only applies if the number of parameters is not 1.
        if(args.length !== paramlist.count() && paramlist.count() !== 1 ) {
            vm.reportError("Call has the wrong number of arguments: expected " +paramlist.count()+ ".");
            return;
        }
        // If the number of parameters is 1, but the number of arguments is not, 
        // then make a tuple.
        if( args.length !== 1 && paramlist.count() === 1) {
            args = [ TupleV.createTuple( args ) ] ;
        }
        const manager = vm.getTransactionManager();
        const stackFrame = new ObjectV(manager);
        for (let i = 0; i < args.length; i++) {
            const varName = paramlist.child(i).child(0).label().getVal();
            const val = args[i];
            //TODO: check that the types of val and vardecl are the same
            const field = new Field(varName, val, Type.ANY, true, true, manager);
            field.setIsDeclared();
            stackFrame.addField(field);
        }
        vm.pushEvaluation(body, new NonEmptyVarStack(stackFrame, context));
    }

    function exprSeqStepper(vm : VMS) : void {
        // We must step the node twice. Once on a previsit and once on a postvisit.
        if( ! vm.hasExtraInformation() ) {
          previsitNode(vm);
        }
        else {
            // Postvisit.
            // Set it to the value of the last child node if there is one and pop the stack frame.
            const numberOfChildren : number = vm.getPendingNode().count();
            const value : Value = (numberOfChildren === 0
                                   ? TupleV.theDoneValue
                                   : vm.getChildVal( numberOfChildren - 1) ) ;
            vm.finishStep( value );
            vm.getEval().popFromVarStack() ; }
    }

    function objectStepper(vm : VMS) : void {
      // We must step the node twice. Once on a previsit and once on a postvisit.
      if( ! vm.hasExtraInformation() ) {          
          previsitNode(vm);
      }
      else {
          // Postvisit.
          const value = (vm.getStack() as NonEmptyVarStack).getTop();
          vm.finishStep( value );
          vm.getEval().popFromVarStack() ; }
    }

    function arrayStepper(vm: VMS)  : void {
        const manager = vm.getTransactionManager() ;
        const array = new ObjectV( manager ) ;
        const node = vm.getPendingNode() ;
        const sz = node.count() ;
        for(let i = 0; i < sz ; ++i) {
            const val = vm.getChildVal(i);
            const name : string = i+"";
            const type : Type = Type.NOTYPE ;
            const field = new Field(name, val, type, false, true, manager);
            array.addField(field) ;
        }
        vm.finishStep(array);
    }

    function previsitNode(vm: VMS) : void {
      // Previsit. Build and push stack frame
      const manager = vm.getTransactionManager() ;
      const stackFrame = new ObjectV( manager ) ;
      const node = vm.getPendingNode() ;
      const sz = node.count() ;
      const names = new Array<string>() ;
      for( let i=0; i < sz ; ++i ) {
          const childNode = node.child(i) ;
          if( childNode.label() instanceof labels.VarDeclLabel ) {
              const varDeclLabel = childNode.label() as labels.VarDeclLabel ;
              const isConstant = varDeclLabel.declaresConstant() ;
              const firstChild = childNode.child(0) ;
              assert.check( firstChild.label() instanceof labels.VariableLabel ) ;
              const varLabel = firstChild.label() as labels.VariableLabel ;
              const name : string = varLabel.getVal() ;
              const type : Type = Type.NOTYPE ; // TODO compute the type from the 2nd child of the childNode
              const field = new Field( name, NullV.theNullValue, type, isConstant, false, manager ) ;
              if( names.some( (v : string) => v===name ) ) {
                  vm.reportError( "Variable '" +name+ "' is declared twice." ) ;
                  return ;
              } else {
                  stackFrame.addField( field ) ;
                  names.push( name ) ; }
          }
      } // end for
      vm.getEval().pushOntoVarStack( stackFrame ) ;
      // Now map this node to say it's been previsited.
      vm.putExtraInformation( stackFrame ) ;
      vm.setReady( false ) ;
    }

    function accessorStepper(vm: VMS) : void {
      const node = vm.getPendingNode();
      const object = vm.getChildVal(0);
      const field = vm.getChildVal(1);
      if (object instanceof ObjectV) {
        if (field instanceof StringV) {
          const fieldName = field.getVal();
          if (object.hasField(fieldName)) {
            const val = object.getField(fieldName).getValue();
            vm.finishStep(val);
          }
          else {
            vm.reportError("No field named '" + fieldName +"'.") ;
            return;
          }
        } 
        else {
          vm.reportError("The operand of the index operator must be a string.");
          return;
        }
      }
      else if( object instanceof TupleV) {
          if( field instanceof NumberV) {
              const index : number = field.converToNumber();
              if( index < 0 || index > object.itemCount() - 1 ) {
                vm.reportError("Invalid index value: "+index);
              }
              else {
                  const val = object.getItemByIndex(index);
                  vm.finishStep(val);
              }
          }
          else {
              vm.reportError("The operand of the index operator must be a number.");
              return;
          }
      }
      else {
        vm.reportError("The index operator may only be applied to objects and tuples.");
        return;
      }
    }

    function dotStepper(vm: VMS) : void {
        const node : PNode  = vm.getPendingNode();
        assert.check( node.label().kind() === labels.DotLabel.kindConst ) ;
        const object : Value = vm.getChildVal(0); 
        const name : string = node.label().getVal() ;
        if(object instanceof ObjectV) {
            if(object.hasField(name)) {
                const val = object.getField(name).getValue();
                vm.finishStep(val);
            }
            else {
                vm.reportError("No field named '" + name + "'.");
            }
        } else {
            vm.reportError( "The dot operator may only be applied to objects." );
        }
    }

    function tupleStepper( vm:VMS) : void{
        const node = vm.getPendingNode() ;
        const length = node.count() ;
        if( length === 1) {
            const val = vm.getChildVal(0) ;
            vm.finishStep(val);
        } else {
            const vals = new Array<Value>();
            for(let i = 0; i < length ; ++i) {
                const val = vm.getChildVal(i);
                vals.push(val);
            }
            const tuple = TupleV.createTuple(vals);
            vm.finishStep(tuple); }
    }

    function ifStepper(vm : VMS) : void {
        assert.checkPrecondition(vm.isChildMapped(0), "Guard is not ready.");
        assert.checkPrecondition(vm.getChildVal(0).isBoolV(), "Guard is not a BoolV.");
        const result : boolean = (vm.getChildVal(0) as BoolV).getVal();
        const choice = result === true ? 1 : 2;
        assert.checkPrecondition(vm.isChildMapped(choice), "'If' not ripe.");
        vm.finishStep(vm.getChildVal(choice));
    }

    function whileStepper(vm : VMS) : void {
        //use the value of the body if it is mapped, otherwise use null
        if (vm.isChildMapped(1)) {
            vm.finishStep(vm.getChildVal(1));
        }
        else {
            vm.finishStep( TupleV.theDoneValue ) ;
        }
    }

    function assignStepper(vm : VMS) : void {
        const assignNode : PNode = vm.getPendingNode();
        const variableNode : PNode = assignNode.child(0);
        let field : vms.FieldI ;
        let fieldName : string ;
        //Handle the case when we are assigning to a field of an object
        if (variableNode.label().kind() === labels.AccessorLabel.kindConst
           || variableNode.label().kind() === labels.DotLabel.kindConst) {
            const path = vm.getPending();
            const pathToObject = path.cat(collections.list<number>(0,0));
            const object = vm.getVal(pathToObject);
            if (!(object instanceof ObjectV)) {
                vm.reportError("First operand is not an object value.");
                return;
            }
            if( variableNode.label().kind() === labels.AccessorLabel.kindConst ) {
                const pathToField = path.cat(collections.list<number>(0,1));
                const fieldValue = vm.getVal(pathToField);
                if (!(fieldValue instanceof StringV)) {
                vm.reportError("Fields of object must be identified with a string value.");
                return;
                }
                fieldName = fieldValue.getVal() ;
            } else {
                fieldName = variableNode.label().getVal() ;
            }
            if (!object.hasField(fieldName)) {
                vm.reportError("Object has no field named '" + fieldName +"'.");
                return;
            }
            field = object.getField(fieldName) ;
        }
        //Handle the case when assigning to a variable
        else {
            if( variableNode.label().kind() !== labels.VariableLabel.kindConst ) {
                vm.reportError("Attempting to assign to something that isn't a variable.");
                return ; }
            fieldName = variableNode.label().getVal();
            const variableStack : VarStack = vm.getStack();
            if( ! variableStack.hasField(fieldName) ) {
                vm.reportError( "No variable named '" + fieldName + "' is in scope." ) ;
                return ;
            }
            field = variableStack.getField(fieldName) ;
        }
        if( ! field.getIsDeclared() ) {
            vm.reportError( "The variable named '" + fieldName + "' has not been declared yet." ) ;
            return ;
        }
        if( field.getIsConstant() ) {
            vm.reportError( "The variable named '" + fieldName + "' is a constant and may not be assigned." ) ;
            return ;
        }
        const value : Value = vm.getChildVal(1);
        // TODO Check that the value is assignable to the field.
        field.setValue( value ) ;
        vm.finishStep( TupleV.theDoneValue ) ;
    }

    function variableStepper(vm : VMS) : void {
        const variableNode : PNode = vm.getPendingNode();
        const variableName : string = variableNode.label().getVal();
        const variableStack : VarStack = vm.getStack();
        if( ! variableStack.hasField(variableName) ) {
            vm.reportError( "No variable named '" + variableName + "' is in scope." ) ;
            return ;
        }
        const field = variableStack.getField(variableName) ;
        if( ! field.getIsDeclared() ) {
            vm.reportError( "The variable named '" + variableName + "' has not been declared yet." ) ;
            return ;
        }
        vm.finishStep(field.getValue());
    }

    function varDeclStepper(vm : VMS) : void {
        const variableNode : PNode = vm.getPendingNode().child(0);
        assert.checkPrecondition(variableNode.label().kind() === labels.VariableLabel.kindConst, "Attempting to declare something that isn't a variable name.");
        
        const variableName : string = variableNode.label().getVal();
        const variableStack : VarStack = vm.getStack();
        assert.check( variableStack.hasField(variableName) ) ;
        const field = variableStack.getField(variableName) ;
        assert.check( ! field.getIsDeclared() ) ;
        field.setIsDeclared() ;

        const initializerNode : PNode = vm.getPendingNode().child(2) ;
        if( !(initializerNode.label() instanceof labels.NoExprLabel) ) {
            const value : Value = vm.getChildVal(2);
            // TODO Check that the value is assignable to the field.
            field.setValue( value ) ;
        } 
        vm.finishStep( TupleV.theDoneValue ) ;
    }

    function placeHolderStepper(vm : VMS) : void {
        vm.reportError( "Missing code." ) ;
    }
}

export = interpreter ;