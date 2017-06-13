# PLAAY Coding Standard

## TypeScript

### Source file basics

#### Program structure

The module dependency must be acyclic. If module A depends, directly or indirectly, on module B, then module B must not depend, whether director or indirectly, on module A.

Module dependency should be documented in file "dependence.gv". Dependence at the javascript level should be documented in file "dependence-js.gv".

#### File names

Source file names should be the same as the module in the file.

One file per module. One module per file.

### Source File Structure

Each source file consists of

* References for external libraries
* References for other modules in alphabetical order
* Imports for external libraries
* Imports for other modules in alphabetical order
* One module declaration
* The export assignment

Example

~~~~typescript
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="treeManager.ts" />


import assert = require('./assert') ;
import sharedMkHtml = require('./sharedMkHtml');
import collections = require( './collections' );
import pnode = require( './pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require( './treeManager');

/** The editor module ... */
module editor {
	....
}

export = editor;
~~~~

### Formatting

#### Semicolons

Semicolons should be used even when they are optional.

#### Braces

Braces should be used even when they are optional.  An exception is  for short lambda expressions like `x : int => x+1`.

Where braces are placed is up to you. My preferred brace style is this

~~~~typescript

    function redo() : void {
        if (redostack.length != 0) {
            undostack.push(currentSelection);
            currentSelection = redostack.pop();
            generateHTMLSoon();
        } else {
        	beep() ;
        }
    }
~~~~

or even this

~~~~typescript
    function redo() : void {
        if (redostack.length != 0) {
            undostack.push(currentSelection);
            currentSelection = redostack.pop();
            generateHTMLSoon(); }
        else {
        	  beep() ; } }
~~~~

#### Line breaking

Lines shouldn't be longer than about 80 characters.

When breaking a statement over multiple lines, be careful of Typescript's rules for inserting semicolons.

Usually the best solution to long lines is to rewrite the code.

Usually the best way to break a long statement over multiple lines is to stack the arguments to a function.  In this case it's all or nothing.  Be sure to align the arguments. E.g.,

~~~~typescript
                // BAD Line is too long
                return opt.map( newNode =>
                    new Selection( newNode, cons( kTrg, newTrgSeln.path()), newTrgSeln.anchor(), newTrgSeln.focus() ) ) ;
                    
                // BAD. Mix of horizontal and vertical layout for args of same call.
                return opt.map( newNode =>
                    new Selection( newNode, cons( kTrg, newTrgSeln.path()),
                                   newTrgSeln.anchor(), newTrgSeln.focus() ) ) ;
                    
                // GOOD
                return opt.map( newNode =>
                    new Selection( newNode,
                                   cons( kTrg, newTrgSeln.path()),
                                   newTrgSeln.anchor(),
                                   newTrgSeln.focus() ) ) ;

~~~~

An exception is when the parameters are in logical groups. 

~~~~typescript
    return doubleReplaceOnePathEmpty( node,
                                      srcStart, srcEnd, newNodes4Src,
                                      trgPath, trgStart, trgEnd, newNodes4Trg,
                                      allowTrgAncestorOverwrite, true ) ;
~~~~

#### Indentation

4 spaces 

#### Variable declarations

One variable per declaration.

Use `const` or `let` for local variables. Never use `var`.

Prefer `const` to `let`.

Use `const` or `let` for module level variables.  (I think `var` is the same as `let` at the modules level, but use `let` anyway.)

### Naming

#### Use Camel Case

Use camel case. Avoid underscores.

An exception is enum members, which are all upper case with words separated by underscores.

#### Case of first letter

* modules (namespaces): lower case.
* classes, enums, type names: upper case
* type variable: upper case, usually one letter
* variables: lower case
* fields: either lower case or underscore
* functions: lower case
* methods: lower case

Method and Function names are usually verbs or verb phrases.  Exceptions can be made for accessors and pure functions. For example `squareRoot` is better than `computeSquareRoot`.

### Class declarations

The order of declarations is usually

* Fields
* Constructor
* Methods

Methods should either be accessors or mutators but not both.

Fields should usually be `private`. Where possible, fields should be declared `readonly`.  (`readonly` indicates that the field will not change after construction.)

Methods should be `private` unless there is a reason for them to not be `private`.

Object invariants should be carefully documented.

Consider checking object invariants after construction and after each mutator.

~~~~typescript
    /** A Selection indicates ...
    * 
    * Invariant:
    * 
    * * The path must identify a node under the root.
    *       I.e. the path can be empty or its first item must be
    *       the index of a child of the root and the rest of the path must
    *       identify a node under that child.
    * * The focus and anchor must both be integers greater or equal to 0 and
    *     less or equal to the number of children of the node identified by the path.
    */
    export class Selection {

        private readonly _root : PNode ;
        private readonly _path : List<number> ;
        private readonly _anchor : number ;
        private readonly _focus : number ;

        constructor( root : PNode, path : List<number>,
                    anchor : number, focus : number ) {
            assert.checkPrecondition( checkSelection( root, path, anchor, focus ), 
                                      "Attempt to make a bad selection" ) ;
            this._root = root;
            this._path = path;
            this._anchor = anchor ;
            this._focus = focus ; }
        
        root() : PNode { return this._root ; }
        
        path() : List<number> { return this._path ; }
        
        .
        .
        .
    }
~~~~

### Initialization

Local variables should almost always be initialized.  Delay declaring a variable until it is ready to be initialized.

### Types

#### Declare return types

All functions and methods should have a declared return type.  This includes functions with a return type of void.  For
example

~~~~typescript
    function redo() : void { ... } // GOOD
    
    function redo() { ... } // BAD
~~~~

An exception is short lambda expressions used as arguments.  For example in the method

~~~~typescript
        applyEdit( a : A ) : Option<A> {
            let result : Option<A> = this._first.applyEdit( a ) ;
            return result.choose(
                        (a : A) => result,
                        () => this._second.applyEdit( a ) ) ;
        }
~~~~

There is no need to write `(a:A) : Option<A> => result` because the compiler will infer the function's type from the type of its result.  However, there is no harm in putting in the return type here and it may be that putting in the type makes the code more readable. 


#### Declare parameter types

Parameters should always have declared types.

#### Declare module-level variable types

#### Declare field types in classes

#### Optionally declare local variable types

The compiler can infer the types of local variables if they are initialized.  For example in

~~~~typescript
    function foo( j : number ) : number {
        let i = j ; // GOOD
        i = "hello" ;  // Error reported.
        return i ;
    }
~~~~

The compiler will infer the type of `i` from the type of `j` and so the compiler will detect the error in the assignment.

However for readability it is often a good idea to declare the type of the variable any way.

For uninitialized variables, the type should always be given.  For example

~~~~typescript
    function foo( j : number ) : number {
        let i ;  // BAD
        i = 1 ;
        i = "hello" ; // No error reported.
        return i ;  // No error reported.
    }
~~~~

In the code above, no error is reported at compile time.  The variable `i` is inferred to have type `any`.


### Lambda expressions

Prefer the "fat arrow" form of lambda expressions to the `function`-keyword style of lambda expressions.

The expressions `(x : int) : int => x+1` and `function( x : int) : int {return x+1}` have the same meaning. However the first is shorter.

Whether to use the fat arrow or function keyword is often not a matter of style, but of correctness.

The treatment of the keyword `this` differs between the two syntaxes.  Usually the way that the fat arrow does it is what you want.  For example consider

~~~~typescript
// GOOD
let x : boolean[] = this._children.map(
    (a:PNode) : boolean =>
        a.label() === this._label ) ;
~~~~

Here the use of the keyword `this` within the lambda expression makes it necessary to use the fat arrow style of lambda expression.

Using the `function` keyword is incorrect

~~~~typescript
// VERY VERY BAD
let x : boolean[] = this._children.map(
    function(a:PNode) : boolean {
        return a.label() === this._label ; } ) ;
~~~~  

In the last example, the compiler *does* result in an error reported by the compiler.

However, in similar examples, using the `function`-keyword style will *not* result in the resulting type errors being reported for the error. That's because if the compiler can't figure out the type of `this` it uses `any` as its type.

Exceptions: For HTML or jQuery event handlers, the "this" object will be the event.  One should use the `function` keyword. For example 

~~~~typescript
inputs.keyup(function (e) {
            if (e.keyCode == 13) {
                console.log( ">>keyup handler") ;
                updateLabelHandler.call( this, e ) ;
                console.log( "<< keyup handler") ; } } );
~~~~

A similar case is in mocha tests.  In Mocha `this` is bound to the test context and so the `function`-keyword style is correct and the fat-arrow style is incorrect. The following is correct

~~~~typescript
describe( 'pnodeEdits.CopyEdit', function() : void {

    it( 'should copy a single node', function() : void {
        ....
    } ) ;
    .
    .
    .
} ) ;
~~~~

### Assertion checking

The check functions from the `assert.ts` module should be used as much as reasonable.

In particular, preconditions to functions should be checked using`assert.checkPrecondition`.

Class invariants should be checked at the end of each constructor and mutator using assert.checkInvariant`.

Other checks should use either `assert.check` or `assert.checkEqual`.

### Comments

Comments should be used to document modules, classes, and nonprivate methods.  We use `typedoc` to turn documentation into html, so comments should use the `typedoc` format, which is similar to `javadoc`.  See [http://typedoc.org/guides/doccomments/](http://typedoc.org/guides/doccomments/)