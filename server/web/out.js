(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mkHTML = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var assert;
(function (assert) {
    function check(b, message) {
        if (!b) {
            if (message === undefined)
                message = "Assertion failed";
            throw new Error(message);
        }
    }
    assert.check = check;
})(assert || (assert = {}));
module.exports = assert;

},{}],2:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collections;
(function (collections) {
    var Some = (function () {
        function Some(val) {
            this._val = val;
        }
        Some.prototype.isEmpty = function () { return false; };
        Some.prototype.size = function () { return 1; };
        Some.prototype.first = function () { return this._val; };
        Some.prototype.choose = function (f, g) {
            return f(this._val);
        };
        Some.prototype.map = function (f) {
            return new Some(f(this._val));
        };
        Some.prototype.bind = function (f) {
            return f(this._val);
        };
        Some.prototype.toString = function () { return "Some(" + this._val.toString() + ")"; };
        return Some;
    })();
    collections.Some = Some;
    var None = (function () {
        function None() {
        }
        None.prototype.isEmpty = function () { return true; };
        None.prototype.size = function () { return 0; };
        None.prototype.first = function () { throw Error("first applied to an empty option"); };
        None.prototype.choose = function (f, g) {
            return g();
        };
        None.prototype.map = function (f) {
            return new None();
        };
        None.prototype.bind = function (f) {
            return new None();
        };
        None.prototype.toString = function () { return "None"; };
        return None;
    })();
    collections.None = None;
    function some(a) {
        return new Some(a);
    }
    collections.some = some;
    function none() {
        return new None();
    }
    collections.none = none;
    /** Lisp-like lists */
    var List = (function () {
        function List() {
        }
        List.prototype.bind = function (f) {
            return this.map(f).fold(function (a, b) { return a.cat(b); }, function () { return nil(); });
        };
        List.prototype.cat = function (other) {
            return this.fold(function (a, b) { return cons(a, b); }, function () { return other; });
        };
        return List;
    })();
    collections.List = List;
    var Cons = (function (_super) {
        __extends(Cons, _super);
        function Cons(head, tail) {
            _super.call(this);
            this._head = head;
            this._tail = tail;
        }
        Cons.prototype.isEmpty = function () { return false; };
        Cons.prototype.size = function () { return 1 + this._tail.size(); };
        Cons.prototype.first = function () { return this._head; };
        Cons.prototype.rest = function () { return this._tail; };
        Cons.prototype.map = function (f) {
            return new Cons(f(this._head), this._tail.map(f));
        };
        Cons.prototype.fold = function (f, g) {
            return f(this._head, this._tail.fold(f, g));
        };
        Cons.prototype.toString = function () {
            return "( " +
                this.fold(function (h, x) { return h.toString() + " " + x; }, function () { return ")"; });
        };
        return Cons;
    })(List);
    var Nil = (function (_super) {
        __extends(Nil, _super);
        function Nil() {
            _super.call(this);
        }
        Nil.prototype.isEmpty = function () { return true; };
        Nil.prototype.size = function () { return 0; };
        Nil.prototype.fold = function (f, g) {
            return g();
        };
        Nil.prototype.map = function (f) {
            return new Nil();
        };
        Nil.prototype.first = function () { throw Error("first applied to an empty list"); };
        Nil.prototype.rest = function () { throw Error("rest applied to an empty list"); };
        Nil.prototype.toString = function () { return "()"; };
        return Nil;
    })(List);
    function list() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var acc = new Nil();
        var i = args.length;
        while (i > 0) {
            i -= 1;
            acc = new Cons(args[i], acc);
        }
        return acc;
    }
    collections.list = list;
    function arrayToList(a) {
        return list.apply(void 0, a);
    }
    collections.arrayToList = arrayToList;
    function cons(head, rest) {
        return new Cons(head, rest);
    }
    collections.cons = cons;
    function nil() { return new Nil(); }
    collections.nil = nil;
    function snoc(xs, x) {
        return xs.fold(function (y, ys) { return cons(y, ys); }, function () { return cons(x, nil()); });
    }
    collections.snoc = snoc;
    function butLast(xs) {
        if (xs.rest().isEmpty())
            return nil();
        else
            return cons(xs.first(), butLast(xs.rest()));
    }
    collections.butLast = butLast;
})(collections || (collections = {}));
module.exports = collections;

},{}],3:[function(require,module,exports){
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collections = require('./collections');
var edits;
(function (edits) {
    var Some = collections.Some;
    var AbstractEdit = (function () {
        function AbstractEdit() {
        }
        // A correct but possibly expensive way to tell whether
        // applyEdit will be successful.
        AbstractEdit.prototype.canApply = function (a) {
            return this.applyEdit(a).choose(function (a) { return true; }, function () { return false; });
        };
        return AbstractEdit;
    })();
    edits.AbstractEdit = AbstractEdit;
    var CompositeEdit = (function (_super) {
        __extends(CompositeEdit, _super);
        function CompositeEdit(first, second) {
            _super.call(this);
            this._first = first;
            this._second = second;
        }
        CompositeEdit.prototype.applyEdit = function (a) {
            var result = this._first.applyEdit(a);
            return result.choose(this._second.applyEdit, function () { return result; });
        };
        CompositeEdit.prototype.canApply = function (a) {
            var result = this._first.applyEdit(a);
            return result.choose(this._second.canApply, function () { return false; });
        };
        return CompositeEdit;
    })(AbstractEdit);
    /** The composition of two edits does one edit and then the other.
    * Given <code>var z = compose(x,y) ;</code> then
         z.applyEdit(a)  applies x to a and then applies y to the result of that; but
         z.applyEdit(a)  fails if either either application fails.
    */
    function compose(first, second) {
        return new CompositeEdit(first, second);
    }
    edits.compose = compose;
    var AlternateEdit = (function (_super) {
        __extends(AlternateEdit, _super);
        function AlternateEdit(first, second) {
            _super.call(this);
            this._first = first;
            this._second = second;
        }
        AlternateEdit.prototype.applyEdit = function (a) {
            var _this = this;
            var result = this._first.applyEdit(a);
            return result.choose(function (a) { return result; }, function () { return _this._second.applyEdit(a); });
        };
        AlternateEdit.prototype.canApply = function (a) {
            return this._first.canApply(a) || this._second.canApply(a);
        };
        return AlternateEdit;
    })(AbstractEdit);
    /** A biased choice between two edits.
    *  Given  <code>var z = alt(x,y) ;</code>
    *      z.applyEdit(a)  is the same as x.applyEdit(a) if that is successful.
    *      z.applyEdit(a)  is the same as y.applyEdit(a) if
    *                           x.applyEdit(a) is not successful.
    */
    function alt(first, second) {
        return new AlternateEdit(first, second);
    }
    edits.alt = alt;
    var IdentityEdit = (function (_super) {
        __extends(IdentityEdit, _super);
        function IdentityEdit() {
            _super.call(this);
        }
        IdentityEdit.prototype.applyEdit = function (a) { return new Some(a); };
        IdentityEdit.prototype.canApply = function (a) { return true; };
        return IdentityEdit;
    })(AbstractEdit);
    /** An edit that does nothing.
    * This is useful in combination with alt. For example given
    *  val z = alt( x, id() )
    *  z.applyEdit( a )  is the same as x.applyEdit(a) if that succeeds and is
    *  x.applyEdit(a)  is  Some( a ) if x.applyEdit(a) fails.
    */
    function id() {
        return new IdentityEdit();
    }
    edits.id = id;
})(edits || (edits = {}));
module.exports = edits;

},{"./collections":2}],4:[function(require,module,exports){
/**
 * Created by Jessica on 2/22/2016.
 */
var stack = require('./stackManager');
var value = require('./value');
var world = require('./world');
var evaluation;
(function (evaluation) {
    var ExecStack = stack.execStack;
    var VarMap = stack.VarMap;
    var ObjectV = value.ObjectV;
    var TurtleFields = world.TurtleFields;
    var Evaluation = (function () {
        function Evaluation(root, obj, stack) {
            this.root = root;
            this.turtleFields = new TurtleFields();
            this.pending = new Array();
            this.ready = false;
            for (var i = 0; i < obj.length; i++) {
                var stackpiece = new ExecStack(obj[i]);
                if (this.stack == null) {
                    this.stack = stackpiece;
                }
                else {
                    stackpiece.setNext(this.stack);
                    this.stack = stackpiece;
                }
            }
            if (stack == null) {
                var evalObj = new ObjectV();
                var s = new ExecStack(evalObj);
                s.setNext(this.stack);
                this.stack = s;
            }
            else {
                if (stack.getNext() == null) {
                    stack.setNext(this.stack);
                }
                else {
                    stack.getNext().setNext(this.stack);
                }
                this.stack = stack;
            }
            /*
            
                        if(obj != null){
                            var st = new ExecStack(obj)
                            st.setNext(this.stack.setNext());
                            this.stack.setNext(st);
                        }
            */
            this.varmap = new VarMap();
        }
        Evaluation.prototype.addToStack = function () {
            var evalObj = new ObjectV();
            var newstack = new ExecStack(evalObj);
            newstack.next = this.stack;
            this.stack = newstack;
        };
        Evaluation.prototype.popfromStack = function () {
            this.stack = this.stack.getNext();
        };
        Evaluation.prototype.getTurtleFields = function () {
            return this.turtleFields;
        };
        Evaluation.prototype.getRoot = function () {
            return this.root;
        };
        Evaluation.prototype.getNext = function () {
            return this.next;
        };
        Evaluation.prototype.getPending = function () {
            return this.pending;
        };
        Evaluation.prototype.setPending = function (pending) {
            this.pending = pending;
        };
        Evaluation.prototype.getVarMap = function () {
            return this.varmap;
        };
        Evaluation.prototype.getStack = function () {
            return this.stack;
        };
        Evaluation.prototype.setNext = function (next) {
            this.next = next;
        };
        Evaluation.prototype.finishStep = function (v) {
            if (this.pending != null && this.ready) {
                var pending2 = new Array();
                for (var i = 0; i < this.pending.length; i++) {
                    pending2.push(this.pending[i]);
                }
                this.varmap.put(pending2, v);
                if (this.pending.length == 0) {
                    this.pending = null;
                }
                else {
                    this.pending.pop();
                }
                this.ready = false;
            }
        };
        Evaluation.prototype.setResult = function (value) {
            var node = this.root.get(this.pending);
            var closurePath = this.pending.concat([0]);
            var closure = this.varmap.get(closurePath);
            var lambda = closure.function;
            //TODO check if lambda has return type and make sure it is the same as value's type
            this.finishStep(value);
        };
        Evaluation.prototype.setVarMap = function (map) {
            this.varmap = map;
        };
        Evaluation.prototype.isDone = function () {
            return this.pending == null; //check if pending is null
        };
        Evaluation.prototype.advance = function (vms) {
            if (!this.isDone()) {
                var pending2 = Object.create(this.pending);
                var topNode = this.root.get(pending2);
                if (this.ready) {
                    topNode.label().step(vms);
                }
                else {
                    topNode.label().strategy.select(vms, topNode.label()); //strategy.select
                }
            }
        };
        return Evaluation;
    })();
    evaluation.Evaluation = Evaluation;
})(evaluation || (evaluation = {}));
module.exports = evaluation;

},{"./stackManager":10,"./value":12,"./world":15}],5:[function(require,module,exports){
var vms = require('./vms');
var workspace = require('./workspace');
var evaluationManager;
(function (evaluationManager) {
    var VMS = vms.VMS;
    var Workspace = workspace.Workspace;
    var EvaluationManager = (function () {
        function EvaluationManager() {
            this.workspace = new Workspace();
        }
        EvaluationManager.prototype.PLAAY = function (root, worlddecl) {
            var worlds = new Array();
            worlds.push(this.workspace.getWorld());
            if (worlddecl == "turtle") {
                worlds.push(this.workspace.getTurtleWorld());
            }
            this._vms = new VMS(root, worlds);
            return this._vms;
        };
        EvaluationManager.prototype.next = function () {
            this._vms.advance();
            return this._vms;
        };
        return EvaluationManager;
    })();
    evaluationManager.EvaluationManager = EvaluationManager;
})(evaluationManager || (evaluationManager = {}));
module.exports = evaluationManager;

},{"./vms":13,"./workspace":14}],6:[function(require,module,exports){
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="vms.ts" />
/// <reference path="value.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />
var collections = require('./collections');
var assert = require('./assert');
var pnode = require('./pnode');
var pnodeEdits = require('./pnodeEdits');
var treeManager = require('./treeManager');
var evaluationManager = require('./evaluationManager');
var seymour = require('./seymour');
var mkHTML;
(function (mkHTML) {
    var list = collections.list;
    var TreeManager = treeManager.TreeManager;
    var Selection = pnodeEdits.Selection;
    var fromJSONToPNode = pnode.fromJSONToPNode;
    var EvaluationManager = evaluationManager.EvaluationManager;
    var arrayToList = collections.arrayToList;
    var Point = seymour.Point;
    var undostack = [];
    var redostack = [];
    var trashArray = [];
    var currentSelection;
    var draggedSelection;
    var draggedObject;
    var root = pnode.mkExprSeq([]);
    var turtleWorld = new seymour.TurtleWorld();
    var path = list;
    var pathToTrash = list();
    var tree = new TreeManager();
    var evaluation = new EvaluationManager();
    var select = new pnodeEdits.Selection(root, path(), 0, 0);
    var highlighted = false;
    var currentvms;
    var penUp = true;
    var turtle = "";
    currentSelection = select;
    var canv = document.createElement('canvas');
    function onLoad() {
        //creates side bar
        var sidebar = document.createElement("div");
        sidebar.setAttribute("id", "sidebar");
        sidebar.setAttribute("class", "sidebar");
        document.getElementById("body").appendChild(sidebar);
        var stackbar = document.createElement("div");
        stackbar.setAttribute("id", "stackbar");
        stackbar.setAttribute("class", "stack");
        document.getElementById("body").appendChild(stackbar);
        var table = document.createElement("table");
        table.setAttribute("id", "stackVal");
        document.getElementById("stackbar").appendChild(table);
        document.getElementById("stackVal").style.border = "thin solid black";
        document.getElementById("stackVal");
        document.getElementById("stackbar").style.visibility = "hidden";
        //creates undo/redo buttons
        var undoblock = document.createElement("div");
        undoblock.setAttribute("id", "undo");
        undoblock.setAttribute("class", "undo");
        undoblock.setAttribute("onclick", "undo()");
        undoblock.textContent = "Undo";
        document.getElementById("body").appendChild(undoblock);
        var undo = document.getElementById("undo");
        undo.onclick = function undo() {
            if (undostack.length != 0) {
                redostack.push(currentSelection);
                currentSelection = undostack.pop();
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
        };
        var redoblock = document.createElement("div");
        redoblock.setAttribute("id", "redo");
        redoblock.setAttribute("class", "redo");
        redoblock.setAttribute("onclick", "redo()");
        redoblock.textContent = "Redo";
        document.getElementById("body").appendChild(redoblock);
        var redo = document.getElementById("redo");
        redo.onclick = function redo() {
            if (redostack.length != 0) {
                undostack.push(currentSelection);
                currentSelection = redostack.pop();
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
        };
        var playbutton = document.createElement("div");
        playbutton.setAttribute("id", "play");
        playbutton.setAttribute("class", "play");
        playbutton.setAttribute("onclick", "play()");
        playbutton.textContent = "Play";
        document.getElementById("body").appendChild(playbutton);
        var play = document.getElementById("play");
        play.onclick = function play() {
            evaluate();
        };
        var turtlebutton = document.createElement("div");
        turtlebutton.setAttribute("id", "turtle");
        turtlebutton.setAttribute("class", "turtle");
        turtlebutton.setAttribute("onclick", "turtle()");
        turtlebutton.textContent = "Turtle World";
        document.getElementById("body").appendChild(turtlebutton);
        var turtleworld = document.getElementById("turtle");
        turtleworld.onclick = function turtle() {
            turtleGraphics();
        };
        var quitworldbutton = document.createElement("div");
        quitworldbutton.setAttribute("id", "quitworld");
        quitworldbutton.setAttribute("class", "quitworld");
        quitworldbutton.setAttribute("onclick", "quitworld()");
        quitworldbutton.textContent = "Quit World";
        document.getElementById("body").appendChild(quitworldbutton);
        var quitworld = document.getElementById("quitworld");
        quitworld.onclick = function quitprebuiltworld() {
            leaveWorld();
        };
        document.getElementById("quitworld").style.visibility = "hidden";
        var editorbutton = document.createElement("div");
        editorbutton.setAttribute("id", "edit");
        editorbutton.setAttribute("class", "edit");
        editorbutton.setAttribute("onclick", "edit()");
        editorbutton.textContent = "Edit";
        document.getElementById("body").appendChild(editorbutton);
        var edit = document.getElementById("edit");
        edit.onclick = function edit() {
            editor();
        };
        document.getElementById("edit").style.visibility = "hidden";
        var trash = document.createElement("div");
        trash.setAttribute("id", "trash");
        trash.setAttribute("class", "trash clicktrash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);
        var garbage = document.getElementById("trash");
        garbage.onclick = function opendialog() {
            visualizeTrash();
        };
        var advancebutton = document.createElement("div");
        advancebutton.setAttribute("id", "advance");
        advancebutton.setAttribute("class", "advance");
        advancebutton.setAttribute("onclick", "advance()");
        advancebutton.textContent = "Next";
        document.getElementById("body").appendChild(advancebutton);
        var advance = document.getElementById("advance");
        advance.onclick = function advance() {
            setValAndHighlight();
        };
        document.getElementById("advance").style.visibility = "hidden";
        var multistepbutton = document.createElement("div");
        multistepbutton.setAttribute("id", "multistep");
        multistepbutton.setAttribute("class", "multistep");
        multistepbutton.setAttribute("onclick", "multistep()");
        multistepbutton.textContent = "Multi-Step";
        document.getElementById("body").appendChild(multistepbutton);
        var multistep = document.getElementById("multistep");
        multistep.onclick = function multistep() {
            multiStep();
        };
        document.getElementById("multistep").style.visibility = "hidden";
        var runbutton = document.createElement("div");
        runbutton.setAttribute("id", "run");
        runbutton.setAttribute("class", "run");
        runbutton.setAttribute("onclick", "run()");
        runbutton.textContent = "Run";
        document.getElementById("body").appendChild(runbutton);
        var runfunc = document.getElementById("run");
        runfunc.onclick = function run() {
            stepTillDone();
        };
        document.getElementById("run").style.visibility = "hidden";
        var ifblock = document.createElement("div");
        ifblock.setAttribute("id", "if");
        ifblock.setAttribute("class", "block V palette");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);
        var whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "block V palette");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);
        var varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "block V palette");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);
        var stringlitblock = document.createElement("div");
        stringlitblock.setAttribute("id", "stringliteral");
        stringlitblock.setAttribute("class", "block V palette");
        stringlitblock.textContent = "String Literal";
        document.getElementById("sidebar").appendChild(stringlitblock);
        var worldblock = document.createElement("div");
        worldblock.setAttribute("id", "worldcall");
        worldblock.setAttribute("class", "block V palette");
        worldblock.textContent = "Call World";
        document.getElementById("sidebar").appendChild(worldblock);
        var assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assign");
        assignmentblock.setAttribute("class", "block V palette");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);
        var userBar = document.createElement("div");
        userBar.setAttribute("id", "userBar");
        userBar.setAttribute("class", "userBar");
        document.getElementById("body").appendChild(userBar);
        var loginButton = document.createElement("div");
        loginButton.setAttribute("id", "login");
        loginButton.setAttribute("class", "userOptions");
        loginButton.textContent = "Login/Register";
        document.getElementById("userBar").appendChild(loginButton);
        var logoutButton = document.createElement("div");
        logoutButton.setAttribute("id", "logout");
        logoutButton.setAttribute("class", "userOptions");
        logoutButton.textContent = "Logout";
        document.getElementById("userBar").appendChild(logoutButton);
        $("#logout").hide();
        var userSettings = document.createElement("div");
        userSettings.setAttribute("id", "userSettings");
        userSettings.setAttribute("class", "userOptions");
        userSettings.textContent = "User Settings";
        document.getElementById("userBar").appendChild(userSettings);
        $("#userSettings").hide();
        var saveProgram = document.createElement("div");
        saveProgram.setAttribute("id", "saveProgram");
        saveProgram.setAttribute("class", "userOptions");
        saveProgram.textContent = "Save Program";
        document.getElementById("userBar").appendChild(saveProgram);
        $("#saveProgram").hide();
        var loadProgram = document.createElement("div");
        loadProgram.setAttribute("id", "loadProgram");
        loadProgram.setAttribute("class", "userOptions");
        loadProgram.textContent = "Load Program";
        document.getElementById("userBar").appendChild(loadProgram);
        $("#loadProgram").hide();
        $('#login').click(function () {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='registrationBox'>" +
                "<div id='loginSection'>" +
                "Login <br>" +
                "<form name='loginUser' onSubmit='return mkHTML.loginUser()' method='post'>" +
                "Username: <input type='text' name='username' required><br>" +
                "Password: <input type='password' name='password' required><br>" +
                "<input type='submit' value='Login'>" +
                "</form></div>" +
                "<div id='registrationSection'>" +
                "Register <br>" +
                "<form name='registerNewUser' onSubmit='return mkHTML.registerNewUser()' method='post'>" +
                "Username: <input type='text' name='username' required><br>" +
                "Password: <input type='password' name='password' required><br>" +
                "Confirm Password: <input type='password' name='passwordConfirm' required><br>" +
                "<input type='submit' value='Register'></form></div>" +
                "<div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
        });
        $('#userSettings').click(function () {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='userSettingsChange'>" +
                "<div id='editAccountTitle'>Edit Account Info:</div>" +
                "<form name='editUserInfo' onSubmit='return mkHTML.editUser()' method='post'>" +
                "Username: <input type='text' name='username'><br>" +
                "Password:<br>&emsp;Old: <input type='password' name='oldpassword'><br>" +
                "&emsp;New: <input type='password' name='newpassword'><br>" +
                "&emsp;Confirm New: <input type='password' name='confirmnewpassword'><br>" +
                "Email: <input> type='text' name='email'><br>" +
                "<input type='submit' value='Submit Changes'></form>" +
                "<div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
        });
        $('#logout').click(function () {
            $("#login").show();
            $("#userSettings").hide();
            $("#saveProgram").hide();
            $("#loadProgram").hide();
            $("#userSettings :input").remove();
            $("#logout").hide();
        });
        $('#saveProgram').click(function () {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='getProgramList'>" +
                "<form name='saveProgramTree' onSubmit='return mkHTML.savePrograms()' method='post'>" +
                "Program Name: <input type='text' name='programname'><br>" +
                "<input type='submit' value='Submit Program'>" +
                "</form><div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
            //mkHTML.getPrograms();
        });
        $('#loadProgram').click(function () {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='getProgramList'><div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
            mkHTML.getPrograms();
        });
        var vardecblock = document.createElement("div");
        vardecblock.setAttribute("id", "vardecl");
        vardecblock.setAttribute("class", "block V palette");
        vardecblock.textContent = "Var Declaration";
        document.getElementById("sidebar").appendChild(vardecblock);
        var lambdablock = document.createElement("div");
        lambdablock.setAttribute("id", "lambda");
        lambdablock.setAttribute("class", "block V palette");
        lambdablock.textContent = "Lambda Expression";
        document.getElementById("sidebar").appendChild(lambdablock);
        var list = document.createElement("datalist");
        list.setAttribute("id", "oplist");
        var optionplus = document.createElement("option");
        optionplus.value = "+";
        var optionminus = document.createElement("option");
        optionminus.value = "-";
        var optionmul = document.createElement("option");
        optionmul.value = "*";
        var optiondiv = document.createElement("option");
        optiondiv.value = "/";
        var optiongreater = document.createElement("option");
        optiongreater.value = ">";
        var optionless = document.createElement("option");
        optionless.value = "<";
        var optioneq = document.createElement("option");
        optioneq.value = "==";
        var optiongreatereq = document.createElement("option");
        optiongreatereq.value = ">=";
        var optionlesseq = document.createElement("option");
        optionlesseq.value = "<=";
        var optionand = document.createElement("option");
        optionand.value = "&";
        var optionor = document.createElement("option");
        optionor.value = "|";
        list.appendChild(optionplus);
        list.appendChild(optionminus);
        list.appendChild(optionmul);
        list.appendChild(optiondiv);
        list.appendChild(optiongreater);
        list.appendChild(optiongreatereq);
        list.appendChild(optionless);
        list.appendChild(optionlesseq);
        list.appendChild(optioneq);
        list.appendChild(optionand);
        list.appendChild(optionor);
        document.getElementById("body").appendChild(list);
        //creates container for code
        var container = document.createElement("div");
        container.setAttribute("id", "container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);
        var vms = document.createElement("div");
        vms.setAttribute("id", "vms");
        vms.setAttribute("class", "vms");
        document.getElementById("body").appendChild(vms);
        document.getElementById("vms").style.visibility = "hidden";
        var seq = document.createElement("div");
        seq.setAttribute("id", "seq");
        seq.setAttribute("data-childNumber", "-1");
        document.getElementById("container").appendChild(seq);
        //creates empty dropzone <div id="dropZone" class="dropZone H droppable"></div>
        var div = document.createElement("div");
        div.setAttribute("id", "dropZone");
        div.setAttribute("class", "dropZone H droppable");
        document.getElementById("seq").appendChild(div);
        $(".palette").draggable({
            helper: "clone",
            start: function (event, ui) {
                ui.helper.animate({
                    width: 40,
                    height: 40
                });
                draggedObject = $(this).attr("class");
            },
            cursorAt: { left: 20, top: 20 },
            appendTo: "body"
        });
        $(".droppable").droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                var selection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                selection.choose(function (sel) {
                    currentSelection = sel;
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                }, function () {
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                });
            }
        });
        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance: 'pointer',
            greedy: true,
            drop: function (event, ui) {
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                var selection = tree.deleteNode(currentSelection);
                selection[1].choose(function (sel) {
                    var trashselect = new Selection(selection[0][0], pathToTrash, 0, 0);
                    undostack.push(currentSelection);
                    currentSelection = sel;
                    trashArray.push(trashselect);
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                }, function () {
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                });
            }
        });
        enterBox();
    }
    mkHTML.onLoad = onLoad;
    function redraw(vms) {
        var ctx = canv.getContext("2d");
        var w = canv.width;
        var h = canv.height;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < vms.getEval().getTurtleFields().getSegments().length; ++i) {
            var p0v = vms.getEval().getTurtleFields().world2View(vms.getEval().getTurtleFields().getSegments()[i].p0, w, h);
            var p1v = vms.getEval().getTurtleFields().world2View(vms.getEval().getTurtleFields().getSegments()[i].p1, w, h);
            ctx.beginPath();
            ctx.moveTo(p0v.x(), p0v.y());
            ctx.lineTo(p1v.x(), p1v.y());
            ctx.stroke();
        }
        if (vms.getEval().getTurtleFields().getVisible()) {
            // Draw a little triangle
            var theta = vms.getEval().getTurtleFields().getOrientation() / 180.0 * Math.PI;
            var x = vms.getEval().getTurtleFields().getPosn().x();
            var y = vms.getEval().getTurtleFields().getPosn().y();
            var p0x = x + 4 * Math.cos(theta);
            var p0y = y + 4 * Math.sin(theta);
            var p1x = x + 5 * Math.cos(theta + 2.5);
            var p1y = y + 5 * Math.sin(theta + 2.5);
            var p2x = x + 5 * Math.cos(theta - 2.5);
            var p2y = y + 5 * Math.sin(theta - 2.5);
            var p0v = vms.getEval().getTurtleFields().world2View(new Point(p0x, p0y), w, h);
            var p1v = vms.getEval().getTurtleFields().world2View(new Point(p1x, p1y), w, h);
            var p2v = vms.getEval().getTurtleFields().world2View(new Point(p2x, p2y), w, h);
            var base_image = new Image();
            base_image.src = "turtle1.png";
            //base_image.src = "Turtles/"+ vms.getEval().getTurtleFields().getOrientation() + ".png";
            base_image.width = 25;
            base_image.height = 25;
            var hscale = canv.width / vms.getEval().getTurtleFields().getWorldWidth() * vms.getEval().getTurtleFields().getZoom();
            var vscale = canv.height / vms.getEval().getTurtleFields().getWorldHeight() * vms.getEval().getTurtleFields().getZoom();
            var newx = vms.getEval().getTurtleFields().getPosn().x() * hscale + canv.width / 2 - 12.5;
            var newy = vms.getEval().getTurtleFields().getPosn().y() * vscale + canv.height / 2 - 12.5;
            ctx.drawImage(base_image, newx, newy);
            ctx.beginPath();
            ctx.moveTo(p0v.x(), p0v.y());
            ctx.lineTo(p1v.x(), p1v.y());
            ctx.lineTo(p2v.x(), p2v.y());
            ctx.lineTo(p0v.x(), p0v.y());
            ctx.stroke();
        }
    }
    function leaveWorld() {
        document.getElementById("turtle").style.visibility = "visible";
        document.getElementById("quitworld").style.visibility = "hidden";
        var forward = document.getElementById("forward");
        document.getElementById("sidebar").removeChild(forward);
        var left = document.getElementById("left");
        document.getElementById("sidebar").removeChild(left);
        var right = document.getElementById("right");
        document.getElementById("sidebar").removeChild(right);
        var pen = document.getElementById("pen");
        document.getElementById("sidebar").removeChild(pen);
        var clear = document.getElementById("clear");
        document.getElementById("sidebar").removeChild(clear);
        var show = document.getElementById("show");
        document.getElementById("sidebar").removeChild(show);
        var hide = document.getElementById("hide");
        document.getElementById("sidebar").removeChild(hide);
        $('.turtleFunc').remove();
        var canvas = document.getElementById("turtleGraphics");
        document.getElementById("body").removeChild(canvas);
    }
    function turtleGraphics() {
        document.getElementById("turtle").style.visibility = "hidden";
        document.getElementById("quitworld").style.visibility = "visible";
        var sidebar = $('#sidebar');
        var hideblock = document.createElement("div");
        hideblock.setAttribute("id", "hide");
        hideblock.setAttribute("class", "block V palette");
        hideblock.textContent = "Hide";
        sidebar.prepend(hideblock);
        var showblock = document.createElement("div");
        showblock.setAttribute("id", "show");
        showblock.setAttribute("class", "block V palette");
        showblock.textContent = "Show";
        sidebar.prepend(showblock);
        var clearblock = document.createElement("div");
        clearblock.setAttribute("id", "clear");
        clearblock.setAttribute("class", "block V palette");
        clearblock.textContent = "Clear";
        sidebar.prepend(clearblock);
        var penblock = document.createElement("div");
        penblock.setAttribute("id", "pen");
        penblock.setAttribute("class", "block V palette");
        penblock.textContent = "Pen";
        sidebar.prepend(penblock);
        var rightblock = document.createElement("div");
        rightblock.setAttribute("id", "right");
        rightblock.setAttribute("class", "block V palette");
        rightblock.textContent = "Right";
        sidebar.prepend(rightblock);
        var leftblock = document.createElement("div");
        leftblock.setAttribute("id", "left");
        leftblock.setAttribute("class", "block V palette");
        leftblock.textContent = "Left";
        sidebar.prepend(leftblock);
        var forwardblock = document.createElement("div");
        forwardblock.setAttribute("id", "forward");
        forwardblock.setAttribute("class", "block V palette");
        forwardblock.textContent = "Forward";
        sidebar.prepend(forwardblock);
        var body = document.getElementById('body');
        canv.setAttribute("id", "turtleGraphics");
        canv.setAttribute("class", "canv");
        canv.setAttribute('width', '1024');
        canv.setAttribute('height', '768');
        body.appendChild(canv);
        turtle = "turtle";
        $(".palette").draggable({
            helper: "clone",
            start: function (event, ui) {
                ui.helper.animate({
                    width: 40,
                    height: 40
                });
                draggedObject = $(this).attr("class");
            },
            cursorAt: { left: 20, top: 20 },
            appendTo: "body"
        });
        $(".droppable").droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                var selection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                selection.choose(function (sel) {
                    currentSelection = sel;
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                }, function () {
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                });
            }
        });
        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance: 'pointer',
            greedy: true,
            drop: function (event, ui) {
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                var selection = tree.deleteNode(currentSelection);
                selection[1].choose(function (sel) {
                    var trashselect = new Selection(selection[0][0], pathToTrash, 0, 0);
                    undostack.push(currentSelection);
                    currentSelection = sel;
                    trashArray.push(trashselect);
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                }, function () {
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                });
            }
        });
        enterBox();
    }
    function penDown() {
        if (penUp) {
            turtleWorld.penDown();
            penUp = false;
        }
        else {
            turtleWorld.penUp();
            penUp = true;
        }
    }
    function rightturn() {
        turtleWorld.right(10);
    }
    function leftturn() {
        turtleWorld.right(-10);
    }
    function forwardmarch() {
        turtleWorld.forward(10);
    }
    function backward() {
        turtleWorld.forward(-10);
    }
    function evaluate() {
        document.getElementById("trash").style.visibility = "hidden";
        document.getElementById("redo").style.visibility = "hidden";
        document.getElementById("undo").style.visibility = "hidden";
        document.getElementById("sidebar").style.visibility = "hidden";
        document.getElementById("container").style.visibility = "hidden";
        document.getElementById("play").style.visibility = "hidden";
        document.getElementById("vms").style.visibility = "visible";
        document.getElementById("stackbar").style.visibility = "visible";
        document.getElementById("advance").style.visibility = "visible";
        document.getElementById("multistep").style.visibility = "visible";
        document.getElementById("run").style.visibility = "visible";
        document.getElementById("edit").style.visibility = "visible";
        currentvms = evaluation.PLAAY(currentSelection.root(), turtle);
        var children = document.getElementById("vms");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(currentSelection.root(), currentSelection.root().count(), true)); //vms.getEval().getRoot(), vms.getEval().getRoot().count()));
        $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();
    }
    function editor() {
        document.getElementById("trash").style.visibility = "visible";
        document.getElementById("redo").style.visibility = "visible";
        document.getElementById("undo").style.visibility = "visible";
        document.getElementById("sidebar").style.visibility = "visible";
        document.getElementById("container").style.visibility = "visible";
        document.getElementById("play").style.visibility = "visible";
        document.getElementById("play").style.visibility = "visible";
        document.getElementById("vms").style.visibility = "hidden";
        document.getElementById("stackbar").style.visibility = "hidden";
        document.getElementById("advance").style.visibility = "hidden";
        document.getElementById("multistep").style.visibility = "hidden";
        document.getElementById("edit").style.visibility = "hidden";
        $(".dropZone").show();
        $(".dropZoneSmall").show();
    }
    function visualizeStack(evalstack) {
        for (var i = 0; i < evalstack.obj.numFields(); i++) {
            if (evalstack.top().fields[i].getName().match(/\+/gi) || evalstack.top().fields[i].getName().match(/\-/gi)
                || evalstack.top().fields[i].getName().match(/\*/gi) || evalstack.top().fields[i].getName().match(/\//gi)
                || evalstack.top().fields[i].getName().match(/>/gi) || evalstack.top().fields[i].getName().match(/</gi)
                || evalstack.top().fields[i].getName().match(/==/gi) || evalstack.top().fields[i].getName().match(/>=/gi)
                || evalstack.top().fields[i].getName().match(/<=/gi) || evalstack.top().fields[i].getName().match(/&/gi)
                || evalstack.top().fields[i].getName().match(/\|/gi)) {
                var builtInV = evalstack.top().fields[i].getValue();
                $("<tr><td>" + evalstack.top().fields[i].getName() + "</td>" +
                    "<td>" + builtInV.getVal() + "</td></tr>").appendTo($("#stackVal"));
            }
            else {
                var stringV = evalstack.top().fields[i].getValue();
                $("<tr><td>" + evalstack.top().fields[i].getName() + "</td>" +
                    "<td>" + stringV.getVal() + "</td></tr>").appendTo($("#stackVal"));
            }
        }
        if (evalstack.getNext() == null) {
            return;
        }
        else {
            visualizeStack(evalstack.getNext());
        }
    }
    function visualizeTrash() {
        var dialogDiv = $('#trashDialog');
        if (dialogDiv.length == 0) {
            dialogDiv = $("<div id='dialogDiv' style='overflow:visible'><div/>").appendTo('body');
            for (var i = 0; i < trashArray.length; i++) {
                var trashdiv = document.createElement("div");
                trashdiv.setAttribute("class", "trashitem");
                trashdiv.setAttribute("data-trashitem", i.toString());
                $(traverseAndBuild(trashArray[i].root(), trashArray[i].root().count(), false)).appendTo($(trashdiv));
                $(trashdiv).appendTo(dialogDiv);
            }
            dialogDiv.dialog({
                modal: true,
                dialogClass: 'no-close success-dialog'
            });
        }
        else {
            dialogDiv.dialog("destroy");
        }
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert: 'invalid',
            appendTo: '#container',
            containment: false,
            start: function (event, ui) {
                draggedObject = $(this).parent().attr("class");
                draggedSelection = trashArray[$(this).parent().attr("data-trashitem")];
            }
        });
    }
    function highlight(parent, pending) {
        if (pending.isEmpty()) {
            var self = $(parent);
            if (self.index() == 0)
                $("<div class='selected V'></div>").prependTo(self.parent());
            else
                $("<div class='selected V'></div>").insertBefore(self);
            self.detach().appendTo($(".selected"));
        }
        else {
            var child = $(parent);
            if (child.children('div[data-childNumber="' + pending.first() + '"]').length > 0) {
                var index = child.find('div[data-childNumber="' + pending.first() + '"]').index();
                var check = pending.first();
                if (index != check)
                    highlight(parent.children[index], pending.rest());
                else
                    highlight(parent.children[check], pending.rest());
            }
            else {
                highlight(parent.children[pending.first()], pending);
            }
        }
    }
    function findInMap(root, varmap) {
        for (var i = 0; i < varmap.size; i++) {
            var list = arrayToList(varmap.entries[i].getPath());
            var value = Object.create(varmap.entries[i].getValue());
            setHTMLValue(root, list, value);
        }
    }
    function setHTMLValue(root, path, value) {
        if (path.isEmpty()) {
            var self = $(root);
            self.replaceWith("<div class='inmap'>" + value.getVal() + "</div>");
        }
        else {
            var child = $(root);
            if (child.children('div[data-childNumber="' + path.first() + '"]').length > 0) {
                var index = child.find('div[data-childNumber="' + path.first() + '"]').index();
                var check = path.first();
                if (index != check)
                    setHTMLValue(root.children[index], path.rest(), value);
                else
                    setHTMLValue(root.children[check], path.rest(), value);
            }
            else {
                setHTMLValue(root.children[path.first()], path, value);
            }
        }
    }
    function setValAndHighlight() {
        currentvms = evaluation.next();
        if (!highlighted && currentvms.getEval().ready) {
            var children = document.getElementById("vms");
            while (children.firstChild) {
                children.removeChild(children.firstChild);
            }
            var remove = document.getElementById("stackVal");
            while (remove.firstChild) {
                remove.removeChild(remove.firstChild);
            }
            children.appendChild(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true)); //vms.getEval().getRoot(), vms.getEval().getRoot().count()));
            $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            var root = document.getElementById("vms").children[0];
            var list = arrayToList(currentvms.getEval().getPending());
            findInMap(root, currentvms.getEval().getVarMap());
            highlight(root, list);
            visualizeStack(currentvms.getEval().getStack());
            highlighted = true;
        }
        else {
            var children = document.getElementById("vms");
            while (children.firstChild) {
                children.removeChild(children.firstChild);
            }
            var remove = document.getElementById("stackVal");
            while (remove.firstChild) {
                remove.removeChild(remove.firstChild);
            }
            children.appendChild(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true)); //vms.getEval().getRoot(), vms.getEval().getRoot().count()));
            $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            var root = document.getElementById("vms").children[0];
            findInMap(root, currentvms.getEval().getVarMap());
            visualizeStack(currentvms.getEval().getStack());
            highlighted = false;
        }
        if (turtle.match("turtle")) {
            redraw(currentvms);
        }
    }
    function multiStep() {
        $('#advance').trigger('click');
        $('#advance').trigger('click');
        $('#advance').trigger('click');
    }
    function stepTillDone() {
        currentvms = evaluation.next();
        while (!currentvms.getEval().isDone())
            currentvms = evaluation.next();
        var children = document.getElementById("vms");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true)); //vms.getEval().getRoot(), vms.getEval().getRoot().count()));
        $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        var root = document.getElementById("vms").children[0];
        var list = arrayToList(currentvms.getEval().getPath());
        var map = Object.create(currentvms.getEval().getVarMap());
        findInMap(root, map);
        highlight(root, list);
    }
    function createCopyDialog(selectionArray) {
        return $("<div></div>")
            .dialog({
            resizable: false,
            dialogClass: 'no-close success-dialog',
            modal: true,
            height: 75,
            width: 75,
            open: function (event, ui) {
                var markup = selectionArray[0][0];
                $(this).html(markup);
                setTimeout(function () {
                    $('.ui-dialog-content').dialog('destroy');
                }, 2000);
            },
            buttons: {
                "Copy": function () {
                    selectionArray[1][2].choose(function (sel) {
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    }, function () {
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                    $(this).dialog("destroy");
                }
            }
        });
    }
    function createSwapDialog(selectionArray) {
        return $("<div></div>")
            .dialog({
            resizable: false,
            dialogClass: 'no-close success-dialog',
            modal: true,
            height: 75,
            width: 75,
            open: function (event, ui) {
                var markup = selectionArray[0][0];
                $(this).html(markup);
                setTimeout(function () {
                    $('.ui-dialog-content').dialog('destroy');
                }, 2000);
            },
            buttons: {
                "Swap": function () {
                    selectionArray[2][2].choose(function (sel) {
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    }, function () {
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                    $(this).dialog("destroy");
                }
            }
        });
    }
    function loginUser() {
        console.log('login');
        var inputs = $('form[name="loginUser"] :input');
        var usr = $('form[name="loginUser"] :input[name="username"]').val();
        var psw = $('form[name="loginUser"] :input[name="password"]').val();
        console.log($('form[name="loginUser"] #usrname').val());
        var response = $.post("/Login", { username: usr, password: psw }, function () {
            var respText = $.parseJSON(response.responseText);
            if (respText.result == "SUCCESS") {
                var user = respText.username;
                $("#dimScreen").remove();
                $("#login").hide();
                $("#userSettings").show();
                $('<input>').attr({
                    type: 'hidden',
                    id: 'currentUser',
                    value: user
                }).appendTo('#userSettings');
                $("#saveProgram").show();
                $("#loadProgram").show();
                $("#logout").show();
                $("#userSettings").val(user);
            }
            else if (respText.result == "WRONGCREDENTIALS") {
                alert("Wrong username/password, please try again.");
            }
            else if (respText.result == "ERROR") {
                alert("An error has occurred, please try again later.");
            }
        });
        return false;
    }
    mkHTML.loginUser = loginUser;
    function registerNewUser() {
        console.log('register');
        var usr = $('form[name="registerNewUser"] :input[name="username"]').val();
        var psw = $('form[name="registerNewUser"] :input[name="password"]').val();
        var pswCon = $('form[name="registerNewUser"] :input[name="passwordConfirm"]').val();
        if (psw !== pswCon) {
            alert("Passwords do not match, please confirm match.");
        }
        else {
            var response = $.post("/Register", { username: usr, password: psw }, function () {
                var respText = $.parseJSON(response.responseText);
                if (respText.result == "SUCCESS") {
                    var user = respText.username;
                    $("#dimScreen").remove();
                    $("#login").hide();
                    $("#userSettings").show();
                    $('<input>').attr({
                        type: 'hidden',
                        id: 'currentUser',
                        value: user
                    }).appendTo('#userSettings');
                    $("#saveProgram").show();
                    $("#loadProgram").show();
                    $("#logout").show();
                }
                else if (respText.result == "NAMETAKEN") {
                    alert("Username is taken, please try another.");
                }
                else if (respText.result == "ERROR") {
                    alert("An error has occurred, please try again.");
                }
            });
        }
        return false;
    }
    mkHTML.registerNewUser = registerNewUser;
    function editUser() {
        console.log('register');
        var currentUser = $('#userSettings :input').val();
        var usr = $('form[name="editUserInfo"] :input[name="username"]').val();
        var oldpsw = $('form[name="editUserInfo"] :input[name="oldpassword"]').val();
        var newpsw = $('form[name="editUserInfo"] :input[name="newpassword"]').val();
        var newpswCon = $('form[name="editUserInfo"] :input[name="confirmnewpassword"]').val();
        var email = $('form[name="editUserInfo"] :input[name="email"]').val();
        if (usr.length == 0 && oldpsw.length == 0 && email.length == 0) {
            alert("No fields filled. Please fill at least one field.");
        }
        else if (oldpsw.length > 0 && newpsw.length > 0 && newpsw !== newpswCon) {
            alert("Passwords do not match, please confirm match.");
        }
        else {
            var response = $.post("/EditUser", { username: usr, password: oldpsw }, function () {
                var respText = $.parseJSON(response.responseText);
                if (respText.result == "SUCCESS") {
                    var user = respText.username;
                    $("#dimScreen").remove();
                    $("#login").hide();
                    $("#userSettings").show();
                    $('<input>').attr({
                        type: 'hidden',
                        id: 'currentUser',
                        value: user
                    }).appendTo('#userSettings');
                    $("#saveProgram").show();
                    $("#loadProgram").show();
                }
                else if (respText.result == "NAMETAKEN") {
                    alert("Username is taken, please try another.");
                }
                else if (respText.result == "ERROR") {
                    alert("An error has occurred, please try again.");
                }
            });
        }
        return false;
    }
    mkHTML.editUser = editUser;
    function getPrograms() {
        var currentUser = $('#userSettings :input').val();
        var response = $.post("/ProgramList", { username: currentUser }, function () {
            mkHTML.buildPage(response.responseText);
        });
        return false;
    }
    mkHTML.getPrograms = getPrograms;
    function buildPage(json) {
        var result = $.parseJSON(json).programList;
        result.forEach(function (entry) {
            $('#getProgramList').append("<div>" + entry +
                "<button type=\"button\" onclick=\"mkHTML.loadProgram(\'" + entry + "\')\">Select program</button></div>");
        });
    }
    mkHTML.buildPage = buildPage;
    function loadProgram(name) {
        var currentUser = $('#userSettings :input').val();
        var programName = name;
        var response = $.post("/LoadProgram", { username: currentUser, programname: programName }, function () {
            $("#dimScreen").remove();
            currentSelection = unserialize(response.responseText);
            generateHTML(currentSelection);
            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        });
    }
    mkHTML.loadProgram = loadProgram;
    function savePrograms() {
        var currentUser = $('#userSettings :input').val();
        var programName = $('form[name="saveProgramTree"] :input[name="programname"]').val();
        var currentSel = serialize(currentSelection);
        var response = $.post("/SavePrograms", { username: currentUser, programname: programName, program: currentSel }, function () {
            console.log(response.responseText);
            $('#dimScreen').remove();
        });
        return false;
    }
    mkHTML.savePrograms = savePrograms;
    function generateHTML(select) {
        currentSelection = select;
        var children = document.getElementById("container");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(select.root(), select.root().count(), false));
        $(".droppable").droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            greedy: true,
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                var selectionArray = [];
                currentSelection = getPathToNode(currentSelection, $(this));
                if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && ((/ifBox/i.test($(this).attr("class")))
                    || (/lambdaBox/i.test($(this).attr("class"))) || (/whileBox/i.test($(this).attr("class")))
                    || (/callWorld/i.test($(this).attr("class"))) || (/assign/i.test($(this).attr("class"))))) {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    selectionArray[0][2].choose(function (sel) {
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        createSwapDialog(selectionArray);
                    }, function () {
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                }
                else if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && (/dropZone/i.test($(this).attr("class")))) {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    selectionArray[0][2].choose(function (sel) {
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        createCopyDialog(selectionArray);
                    }, function () {
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                }
                else if ((/trashitem/i.test(draggedObject)) && (/dropZone/i.test($(this).attr("class")))) {
                    undostack.push(currentSelection);
                    var selection = tree.appendChild(draggedSelection, currentSelection);
                    selection.choose(function (sel) {
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    }, function () {
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                }
                else {
                    console.log(ui.draggable.attr("id"));
                    undostack.push(currentSelection);
                    var selection = tree.createNode(ui.draggable.attr("id") /*id*/, currentSelection);
                    selection.choose(function (sel) {
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    }, function () {
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
                }
            }
        });
        enterBox();
    }
    mkHTML.generateHTML = generateHTML;
    function enterBox() {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                var text = $(this).val();
                var selection = tree.changeNodeString(getPathToNode(currentSelection, $(this)), text);
                selection.choose(function (sel) {
                    undostack.push(currentSelection);
                    currentSelection = sel;
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                }, function () {
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                });
                var label = $(this).attr("class");
                if (/var/i.test(label)) {
                    $(this).replaceWith('<div class="var H click">' + text + '</div>');
                }
                else if (/stringLiteral/i.test(label)) {
                    $(this).replaceWith('<div class="stringLiteral H click">' + text + '</div>');
                }
                else if (/op/i.test(label)) {
                    $(this).replaceWith('<div class="op H click">' + text + '</div>');
                }
                $(".click").click(function () {
                    var label = $(this).attr("class");
                    var val = $(this).attr("data-childNumber");
                    if (/var/i.test(label)) {
                        $(this).replaceWith('<input type="text" class="var H input"' + 'data-childNumber="' + val + '">');
                    }
                    else if (/stringLiteral/i.test(label)) {
                        $(this).replaceWith('<input type="text" class="stringLiteral H input"' + 'data-childNumber="' + val + '">');
                    }
                    else if (/op/i.test(label)) {
                        $(this).replaceWith('<input type="text" class="op H input" list="oplist">');
                    }
                    enterBox();
                    //enterList();
                });
            }
        });
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert: 'invalid',
            start: function (event, ui) {
                draggedObject = $(this).attr("class");
                draggedSelection = getPathToNode(currentSelection, $(this));
            }
        });
    }
    function getPathToNode(select, self) {
        var array = [];
        var anchor;
        var focus;
        var parent = $(self);
        var child = Number(parent.attr("data-childNumber"));
        if (isNaN(child)) {
            var index = parent.index();
            parent = parent.parent();
            var num = parent.children().eq(index).prevAll(".dropZone").length;
            child = Number(parent.attr("data-childNumber"));
            var place = index - num;
            var label = parent.attr("class");
            if (/placeHolder/i.test(label) || /expOp/i.test(label)) {
                anchor = child;
                focus = anchor + 1;
                parent = parent.parent();
                child = Number(parent.attr("data-childNumber"));
            }
            else {
                anchor = place;
                focus = anchor;
            }
        }
        else {
            if (/var/i.test(parent.attr("class")) || /stringLiteral/i.test(parent.attr("class"))) {
                anchor = 0;
                focus = anchor;
            }
            else {
                if ((/ifBox/i.test(parent.attr("class"))) || (/lambdaBox/i.test(parent.attr("class"))) ||
                    (/whileBox/i.test(parent.attr("class"))) || (/callWorld/i.test(parent.attr("class")))
                    || (/assign/i.test(parent.attr("class")))) {
                    anchor = child;
                    focus = child + 1;
                    parent = parent.parent();
                    child = Number(parent.attr("data-childNumber"));
                }
                else {
                    anchor = child;
                    focus = anchor;
                }
            }
        }
        while (child != -1) {
            if (!isNaN(child)) {
                array.push(Number(parent.attr("data-childNumber")));
            }
            parent = parent.parent();
            child = Number(parent.attr("data-childNumber"));
        }
        var tree = select.root();
        var path = list();
        var i;
        for (i = 0; i < array.length; i++)
            path = collections.cons(array[i], path);
        return new pnodeEdits.Selection(tree, path, anchor, focus);
    }
    function serialize(select) {
        var json = pnode.fromPNodeToJSON(currentSelection.root());
        return json;
    }
    function unserialize(string) {
        var path = list();
        var newSelection = new Selection(fromJSONToPNode(string), path, 0, 0);
        return newSelection;
    }
    function traverseAndBuild(node, childNumber, evaluating) {
        var children = new Array();
        for (var i = 0; i < node.count(); i++) {
            children.push(traverseAndBuild(node.child(i), i, evaluating));
        }
        return buildHTML(node, children, childNumber, evaluating);
    }
    function buildHTML(node, children, childNumber, evaluating) {
        var label = node.label().toString();
        if (label.match('if')) {
            assert.check(children.length == 3);
            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "ifGuardBox H workplace");
            guardbox.appendChild(children[0]);
            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild(children[1]);
            var elsebox = document.createElement("div");
            elsebox.setAttribute("class", "elseBox H workplace");
            elsebox.appendChild(children[2]);
            var ifbox = document.createElement("div");
            ifbox.setAttribute("data-childNumber", childNumber.toString());
            ifbox.setAttribute("class", "ifBox V workplace canDrag droppable");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox;
        }
        else if (label.match("seq")) {
            if (evaluating) {
                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());
                for (var i = 0; true; ++i) {
                    if (i == children.length)
                        break;
                    seqBox.appendChild(children[i]);
                }
                return seqBox;
            }
            else {
                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());
                seqBox["childNumber"] = childNumber;
                for (var i = 0; true; ++i) {
                    var dropZone = document.createElement("div");
                    dropZone.setAttribute("class", "dropZone H droppable");
                    seqBox.appendChild(dropZone);
                    if (i == children.length)
                        break;
                    seqBox.appendChild(children[i]);
                }
                return seqBox;
            }
        }
        else if (label.match("expPH")) {
            var PHBox = document.createElement("div");
            PHBox.setAttribute("class", "placeHolder V");
            PHBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;
            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                PHBox.appendChild(dropZone);
                if (i == children.length)
                    break;
                PHBox.appendChild(children[i]);
            }
            return PHBox;
        }
        else if (label.match("param")) {
            var paramBox = document.createElement("div");
            paramBox.setAttribute("class", "paramlistOuter H");
            paramBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;
            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                paramBox.appendChild(dropZone);
                if (i == children.length)
                    break;
                paramBox.appendChild(children[i]);
            }
            return paramBox;
        }
        else if (label.match("while")) {
            assert.check(children.length == 2);
            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "whileGuardBox H workplace");
            guardbox.appendChild(children[0]);
            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild(children[1]);
            var whileBox = document.createElement("div");
            whileBox.setAttribute("data-childNumber", childNumber.toString());
            whileBox.setAttribute("class", "whileBox V workplace canDrag droppable");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);
            return whileBox;
        }
        else if (label.match("callWorld")) {
            var WorldBox = document.createElement("div");
            WorldBox.setAttribute("class", "callWorld H canDrag droppable");
            WorldBox.setAttribute("data-childNumber", childNumber.toString());
            WorldBox.setAttribute("type", "text");
            WorldBox.setAttribute("list", "oplist");
            var dropZone = document.createElement("div");
            dropZone.setAttribute("class", "dropZoneSmall H droppable");
            if ((node.label().getVal().match(/\+/gi) || node.label().getVal().match(/\-/gi)
                || node.label().getVal().match(/\*/gi) || node.label().getVal().match(/\//gi) || (node.label().getVal().match(/==/gi))
                || (node.label().getVal().match(/>/gi)) || (node.label().getVal().match(/</gi)) || (node.label().getVal().match(/>=/gi))
                || (node.label().getVal().match(/<=/gi)) || (node.label().getVal().match(/&/gi)) || (node.label().getVal().match(/\|/gi)))
                && node.label().getVal().length > 0) {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(opval);
                WorldBox.appendChild(children[1]);
            }
            else if (node.label().getVal().length > 0) {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();
                WorldBox.appendChild(opval);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(children[1]);
            }
            else {
                var op = document.createElement("input");
                op.setAttribute("class", "op H input");
                op.setAttribute("type", "text");
                op.setAttribute("list", "oplist");
                op.textContent = "";
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(op);
                WorldBox.appendChild(children[1]);
            }
            return WorldBox;
        }
        else if (label.match("assign")) {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "assign H canDrag droppable");
            AssignBox.setAttribute("data-childNumber", childNumber.toString());
            var equals = document.createElement("div");
            equals.setAttribute("class", "op H");
            equals.textContent = ":=";
            AssignBox.appendChild(children[0]);
            AssignBox.appendChild(equals);
            AssignBox.appendChild(children[1]);
            return AssignBox;
        }
        else if (label.match("lambda")) {
            var lambdahead = document.createElement("div");
            lambdahead.setAttribute("class", "lambdaHeader V ");
            lambdahead.appendChild(children[0]);
            lambdahead.appendChild(children[1]);
            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox H");
            doBox.appendChild(children[2]);
            var string;
            if (node.label().getVal().length > 0) {
                string = document.createElement("div");
                string.setAttribute("class", "stringLiteral H click canDrag");
                string.textContent = node.label().getVal();
            }
            else {
                string = document.createElement("input");
                string.setAttribute("class", "stringLiteral H input canDrag");
                string.setAttribute("type", "text");
            }
            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V droppable");
            LambdaBox.setAttribute("data-childNumber", childNumber.toString());
            LambdaBox.appendChild(string);
            LambdaBox.appendChild(lambdahead);
            LambdaBox.appendChild(doBox);
            return LambdaBox;
        }
        else if (label.match("null")) {
            var NullBox = document.createElement("div");
            NullBox.setAttribute("class", "nullLiteral H droppable");
            NullBox.textContent = "-";
            return NullBox;
        }
        else if (label.match("var")) {
            var VarBox;
            if (node.label().getVal().length > 0) {
                VarBox = document.createElement("div");
                VarBox.setAttribute("class", "var H click canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.textContent = node.label().getVal();
            }
            else {
                VarBox = document.createElement("input");
                VarBox.setAttribute("class", "var H input canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.setAttribute("type", "text");
                VarBox.textContent = "";
            }
            return VarBox;
        }
        else if (label.match("string")) {
            var StringBox;
            if (node.label().getVal().length > 0) {
                StringBox = document.createElement("div");
                StringBox.setAttribute("class", "stringLiteral H click canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.textContent = node.label().getVal();
            }
            else {
                StringBox = document.createElement("input");
                StringBox.setAttribute("class", "stringLiteral H input canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.setAttribute("type", "text");
                StringBox.textContent = "";
            }
            return StringBox;
        }
        else if (label.match("noType")) {
            var noType = document.createElement("div");
            noType.setAttribute("class", "noReturnType V");
            noType.setAttribute("data-childNumber", childNumber.toString());
            noType["childNumber"] = childNumber;
            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                noType.appendChild(dropZone);
                if (i == children.length)
                    break;
                noType.appendChild(children[i]);
            }
            return noType;
        }
        else if (label.match("expOpt")) {
            var OptType = document.createElement("div");
            OptType.setAttribute("class", "expOp V");
            OptType.setAttribute("data-childNumber", childNumber.toString());
            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                OptType.appendChild(dropZone);
                if (i == children.length)
                    break;
                OptType.appendChild(children[i]);
            }
            return OptType;
        }
        else if (label.match("vdecl")) {
            var VarDeclBox = document.createElement("div");
            VarDeclBox.setAttribute("class", "vardecl H canDrag droppable");
            VarDeclBox.setAttribute("data-childNumber", childNumber.toString());
            var type = document.createElement("div");
            type.textContent = ":";
            var equals = document.createElement("div");
            equals.textContent = ":=";
            VarDeclBox.appendChild(children[0]);
            VarDeclBox.appendChild(type);
            VarDeclBox.appendChild(children[1]);
            VarDeclBox.appendChild(equals);
            VarDeclBox.appendChild(children[2]);
            return VarDeclBox;
        }
        else if (label.match("forward")) {
            var forwardElement = document.createElement("div");
            forwardElement.setAttribute("class", "turtleFunc canDrag droppable");
            forwardElement.setAttribute("data-childNumber", childNumber.toString());
            forwardElement.textContent = "Forward";
            forwardElement.appendChild(children[0]);
            return forwardElement;
        }
        else if (label.match("right")) {
            var rightElement = document.createElement("div");
            rightElement.setAttribute("class", "turtleFunc canDrag droppable");
            rightElement.setAttribute("data-childNumber", childNumber.toString());
            rightElement.textContent = "Right";
            rightElement.appendChild(children[0]);
            return rightElement;
        }
        else if (label.match("left")) {
            var leftElement = document.createElement("div");
            leftElement.setAttribute("class", "turtleFunc canDrag droppable");
            leftElement.setAttribute("data-childNumber", childNumber.toString());
            leftElement.textContent = "Left";
            leftElement.appendChild(children[0]);
            return leftElement;
        }
        else if (label.match("pen")) {
            var penElement = document.createElement("div");
            penElement.setAttribute("class", "turtleFunc canDrag droppable");
            penElement.setAttribute("data-childNumber", childNumber.toString());
            penElement.textContent = "Pen";
            penElement.appendChild(children[0]);
            return penElement;
        }
        else if (label.match("clear")) {
            var clearElement = document.createElement("div");
            clearElement.setAttribute("class", "turtleFunc canDrag droppable");
            clearElement.setAttribute("data-childNumber", childNumber.toString());
            clearElement.textContent = "Clear";
            return clearElement;
        }
        else if (label.match("show")) {
            var showElement = document.createElement("div");
            showElement.setAttribute("class", "turtleFunc canDrag droppable");
            showElement.setAttribute("data-childNumber", childNumber.toString());
            showElement.textContent = "Show";
            return showElement;
        }
        else if (label.match("hide")) {
            var hideElement = document.createElement("div");
            hideElement.setAttribute("class", "turtleFunc canDrag droppable");
            hideElement.setAttribute("data-childNumber", childNumber.toString());
            hideElement.textContent = "Hide";
            return hideElement;
        }
    }
})(mkHTML || (mkHTML = {}));
module.exports = mkHTML;

},{"./assert":1,"./collections":2,"./evaluationManager":5,"./pnode":7,"./pnodeEdits":8,"./seymour":9,"./treeManager":11}],7:[function(require,module,exports){
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collections = require('./collections');
var assert = require('./assert');
var evaluation = require('./evaluation');
var stack = require('./stackManager');
var value = require('./value');
var pnode;
(function (pnode) {
    var Some = collections.Some;
    var None = collections.None;
    var Evaluation = evaluation.Evaluation;
    var execStack = stack.execStack;
    var Field = value.Field;
    var ClosureV = value.ClosureV;
    var StringV = value.StringV;
    var arrayToList = collections.arrayToList;
    var Type = value.Type;
    var ObjectV = value.ObjectV;
    var PNode = (function () {
        /** Construct a PNode.
         *  Precondition: label.isValid( children )
         * @param label A Label for the node.
         * @param children: A list (Array) of children
         */
        /*protected*/
        function PNode(label, children) {
            //Precondition  would not need to be checked if the constructor were private.
            assert.check(label.isValid(children), "Attempted to make an invalid program node");
            this._label = label;
            this._children = children.slice();
        }
        PNode.prototype.count = function () {
            return this._children.length;
        };
        PNode.prototype.children = function (start, end) {
            if (start === undefined)
                start = 0;
            if (end === undefined)
                end = this._children.length;
            return this._children.slice(start, end);
        };
        PNode.prototype.child = function (i) {
            assert.check(0 <= i && i < this.count());
            return this._children[i];
        };
        PNode.prototype.label = function () {
            return this._label;
        };
        //return the node at the path
        PNode.prototype.get = function (path) {
            if (path instanceof Array)
                return this.listGet(collections.arrayToList(path));
            else if (path instanceof collections.List) {
                return this.listGet(path);
            }
            else {
                assert.check(false, "Unreachable");
                return null;
            }
        };
        PNode.prototype.listGet = function (path) {
            if (path.isEmpty())
                return this;
            else
                return this.child(path.first()).listGet(path.rest());
        };
        /** Possibly return a copy of the node in which the children are replaced.
         * The result will have children
         *    [c[0], c[1], c[start-1]] ++ newChildren ++ [c[end], c[end+1], ...]
         * where c is this.children().
         * I.e. the segment c[ start,.. end] is replaced by newChildren.
         * The method succeeds iff the node required to be constructed would be valid.
         * Node that start and end can be number value including negative.
         * Negative numbers k are treated as length + k, where length
         * is the number of children.
         * @param newChildren An array of children to be added
         * @param start The first child to omit. Default 0.
         * @param end The first child after start to not omit. Default this.children().length.
         */
        PNode.prototype.tryModify = function (newChildren, start, end) {
            if (start === undefined)
                start = 0;
            if (end === undefined)
                end = this._children.length;
            var firstPart = this._children.slice(0, start);
            var lastPart = this._children.slice(end, this._children.length);
            var allChildren = firstPart.concat(newChildren, lastPart);
            //console.log("tryModify: start is " +start+ " end is " +end ) ; 
            //console.log("          firstPart is " +firstPart+ " lastPart is " +lastPart );
            //console.log("          newChildren is " +newChildren+ " allChildren is " +allChildren );
            return tryMake(this._label, allChildren);
        };
        /** Would tryModify succeed?
         */
        PNode.prototype.canModify = function (newChildren, start, end) {
            return !this.tryModify(newChildren, start, end).isEmpty();
        };
        /** Return a copy of the node in which the children are replaced.
         * Precondition: canModify( newChildren, start, end )
         */
        PNode.prototype.modify = function (newChildren, start, end) {
            var opt = this.tryModify(newChildren, start, end);
            return opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
        };
        PNode.prototype.tryModifyLabel = function (newLabel) {
            return tryMake(newLabel, this._children);
        };
        PNode.prototype.canModifyLabel = function (newLabel) {
            return !this.tryModifyLabel(newLabel).isEmpty();
        };
        PNode.prototype.modifyLabel = function (newLabel) {
            var opt = this.tryModifyLabel(newLabel);
            return opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modifyLabel");
                return null;
            });
        };
        PNode.prototype.toString = function () {
            var strs = this._children.map(function (p) { return p.toString(); });
            var args = strs.reduce(function (a, p) { return a + " " + p.toString(); }, "");
            return this._label.toString() + "(" + args + ")";
        };
        /** Convert a node to a simple object that can be stringified with JSON */
        PNode.prototype.toJSON = function () {
            var result = {};
            result.label = this._label.toJSON();
            result.children = [];
            var i;
            for (i = 0; i < this._children.length; ++i)
                result.children.push(this._children[i].toJSON());
            return result;
        };
        /** Convert a simple object created by toJSON to a PNode */
        PNode.fromJSON = function (json) {
            var label = fromJSONToLabel(json.label);
            var children = json.children.map(PNode.fromJSON);
            return make(label, children);
        };
        return PNode;
    })();
    pnode.PNode = PNode;
    function tryMake(label, children) {
        if (label.isValid(children)) {
            //console.log("tryMake: label is " +label+ " children.length is " +children.length ) ; 
            var cls = label.getClass();
            return new Some(new cls(label, children));
        }
        else {
            return new None();
        }
    }
    pnode.tryMake = tryMake;
    function canMake(label, children) {
        return label.isValid(children);
    }
    pnode.canMake = canMake;
    function make(label, children) {
        var cls = label.getClass();
        return new cls(label, children);
    }
    pnode.make = make;
    function lookUp(varName, stack) {
        return stack.getField(varName);
    }
    pnode.lookUp = lookUp;
    var lrStrategy = (function () {
        function lrStrategy() {
        }
        lrStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    var flag = true;
                    for (var i = 0; i < node.count(); i++) {
                        var p = pending.concat([i]);
                        if (!evalu.varmap.inMap(p)) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        evalu.ready = true; // Select this node.
                    }
                    else {
                        var n;
                        for (var i = 0; i < node.count(); i++) {
                            var p = pending.concat([i]);
                            if (!evalu.varmap.inMap(p)) {
                                n = i;
                                break;
                            }
                        }
                        vms.stack.top().setPending(pending.concat([n]));
                        node.child(n).label().strategy.select(vms, node.child(n).label());
                    }
                }
            }
        };
        return lrStrategy;
    })();
    pnode.lrStrategy = lrStrategy;
    var varStrategy = (function () {
        function varStrategy() {
        }
        varStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    //TODO how to highlight  look up the variable in the stack and highlight it.
                    if (!evalu.getStack().inStack(label.getVal())) { } //error} //there is no variable in the stack with this name TODO THIS FUNCTION IS BROKEN
                    else {
                        evalu.ready = true;
                    }
                }
            }
        };
        return varStrategy;
    })();
    pnode.varStrategy = varStrategy;
    var whileStrategy = (function () {
        function whileStrategy() {
        }
        whileStrategy.prototype.deletefromMap = function (vms, path) {
            for (var i = 0; i < vms.getEval().getRoot().get(path).count(); i++) {
                var childPath = path.concat([i]);
                this.deletefromMap(vms, childPath);
            }
            vms.getEval().getVarMap().remove(path);
        };
        whileStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var guardPath = pending.concat([0]);
                    var loopPath = pending.concat([1]);
                    if (evalu.varmap.inMap(guardPath)) {
                        var string = evalu.varmap.get(guardPath);
                        if (string.contents.match("true")) {
                            if (evalu.varmap.inMap(loopPath)) {
                                evalu.popfromStack();
                                this.deletefromMap(vms, loopPath);
                            }
                            this.deletefromMap(vms, guardPath);
                            evalu.addToStack();
                            evalu.setPending(loopPath);
                            node.child(1).label().strategy.select(vms, node.child(1).label());
                        }
                        else if (string.contents.match("false")) {
                            evalu.ready = true;
                        }
                        else {
                            throw new Error("Error evaluating " + string.contents + " as a conditional value.");
                        }
                    }
                    else {
                        evalu.setPending(guardPath);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        };
        return whileStrategy;
    })();
    pnode.whileStrategy = whileStrategy;
    var lambdaStrategy = (function () {
        function lambdaStrategy() {
        }
        lambdaStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    evalu.ready = true;
                }
            }
        };
        return lambdaStrategy;
    })();
    pnode.lambdaStrategy = lambdaStrategy;
    var assignStrategy = (function () {
        function assignStrategy() {
        }
        assignStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    var p = pending.concat([1]);
                    if (!evalu.varmap.inMap(p)) {
                        vms.stack.top().setPending(p);
                        node.child(1).label().strategy.select(vms, node.child(1).label());
                    }
                    else {
                        evalu.ready = true; // Select this node.
                    }
                }
            }
        };
        return assignStrategy;
    })();
    pnode.assignStrategy = assignStrategy;
    var LiteralStrategy = (function () {
        function LiteralStrategy() {
        }
        LiteralStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    vms.stack.top().ready = true;
                }
            }
        };
        return LiteralStrategy;
    })();
    pnode.LiteralStrategy = LiteralStrategy;
    var ifStrategy = (function () {
        function ifStrategy() {
        }
        ifStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var guardPath = pending.concat([0]);
                    var thenPath = pending.concat([1]);
                    var elsePath = pending.concat([2]);
                    if (evalu.varmap.inMap(guardPath)) {
                        var string = evalu.varmap.get(guardPath);
                        if (string.contents.match("true")) {
                            if (evalu.varmap.inMap(thenPath)) {
                                evalu.ready = true;
                            }
                            else {
                                evalu.setPending(thenPath);
                                node.child(1).label().strategy.select(vms, node.child(1).label());
                            }
                        }
                        else if (string.contents.match("false")) {
                            if (evalu.varmap.inMap(elsePath)) {
                                evalu.ready = true;
                            }
                            else {
                                evalu.setPending(elsePath);
                                node.child(2).label().strategy.select(vms, node.child(2).label());
                            }
                        }
                        else {
                            throw new Error("Error evaluating " + string.contents + " as a conditional value.");
                        }
                    }
                    else {
                        evalu.setPending(guardPath);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        };
        return ifStrategy;
    })();
    pnode.ifStrategy = ifStrategy;
    var varDeclStrategy = (function () {
        function varDeclStrategy() {
        }
        varDeclStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var nameofVar = pending.concat([0]);
                    var valueofVar = pending.concat([2]);
                    if (evalu.varmap.inMap(nameofVar)) {
                        var name = evalu.varmap.get(nameofVar);
                        if (!lookUp(name.getVal(), evalu.getStack())) {
                            if (evalu.varmap.inMap(valueofVar)) {
                                evalu.ready = true;
                            }
                            else {
                                evalu.setPending(valueofVar);
                                node.child(2).label().strategy.select(vms, node.child(2).label());
                            }
                        }
                        else {
                            throw new Error("Variable name already exists!");
                        }
                    }
                    else {
                        evalu.setPending(nameofVar);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        };
        return varDeclStrategy;
    })();
    pnode.varDeclStrategy = varDeclStrategy;
    var TurtleStrategy = (function () {
        function TurtleStrategy() {
        }
        TurtleStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var value = pending.concat([0]);
                    if (evalu.varmap.inMap(value)) {
                        evalu.ready = true;
                    }
                    else {
                        evalu.setPending(value);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        };
        return TurtleStrategy;
    })();
    pnode.TurtleStrategy = TurtleStrategy;
    /* export class callStrategy implements nodeStrategy{
         select(){}
 
         step( vms : VMS, label : Label ){
             if( vms.stack.top().ready){
                 var eval = vms.stack.top();
                 if(eval.getPending() != null){
                     var node = eval.root.get(eval.getPending());
                     if( node.label() == label ){
                         var functionPath = eval.getPending() ^ [0];
                         var c = eval.varmap.get( functionPath );
                         if (!c.isClosureV()){}//  error!
                         var c1 = <ClosureV>c;
                         var f : LambdaNode = c1.function;
 
                         argList : Array<PNode>;
 
                         for(var i = 0; i <)
                         var argList = [eval.varmap.get( eval.getPending() ^ [1] ),
                             eval.varmap.get( eval.getPending() ^ [2],.. ]//for all arguments TODO
 
                         if( the length of arglist not= the length of f.params.children){} //error!
                         if (any argument has a value not compatible with the corresponding parameter type){}
                         // error!
                         var params = f.params.children; //TODO make params
                         var arFields := [ new Field( params[0].name, argList[0] ),
                             new Field( params[1].name, argList[1] ),
                             .. ] //for all f.params.children
                         var activationRecord = new ObjectV( arFields );
                         var stack = new Stack( activationRecord, cl.context );
 
                         var newEval = new Evaluation();
                         newEval.root = f.body; //TODO what is the body
                         newEval.stack = stack;
                         newEval.varmap = new varMap();
                         newEval.getPending() = [];
                         newEval.ready = false;
 
                         vms.stack.push( newEval );
                     }
                 }
             }
         }
     }
 */
    //Node Declarations
    var ExprNode = (function (_super) {
        __extends(ExprNode, _super);
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        function ExprNode(label, children) {
            _super.call(this, label, children);
        }
        ExprNode.prototype.isExprNode = function () {
            return true;
        };
        ExprNode.prototype.isExprSeqNode = function () {
            return false;
        };
        ExprNode.prototype.isTypeNode = function () {
            return false;
        };
        return ExprNode;
    })(PNode);
    pnode.ExprNode = ExprNode;
    var ExprSeqNode = (function (_super) {
        __extends(ExprSeqNode, _super);
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        function ExprSeqNode(label, children) {
            _super.call(this, label, children);
        }
        ExprSeqNode.prototype.isExprNode = function () {
            return false;
        };
        ExprSeqNode.prototype.isExprSeqNode = function () {
            return true;
        };
        ExprSeqNode.prototype.isTypeNode = function () {
            return false;
        };
        return ExprSeqNode;
    })(PNode);
    pnode.ExprSeqNode = ExprSeqNode;
    var TypeNode = (function (_super) {
        __extends(TypeNode, _super);
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        function TypeNode(label, children) {
            _super.call(this, label, children);
        }
        TypeNode.prototype.isExprNode = function () {
            return false;
        };
        TypeNode.prototype.isExprSeqNode = function () {
            return false;
        };
        TypeNode.prototype.isTypeNode = function () {
            return true;
        };
        return TypeNode;
    })(PNode);
    pnode.TypeNode = TypeNode;
    var LambdaNode = (function (_super) {
        __extends(LambdaNode, _super);
        function LambdaNode(label, children) {
            _super.call(this, label, children);
        }
        return LambdaNode;
    })(ExprNode);
    pnode.LambdaNode = LambdaNode;
    //Node Labels
    var ExprLabel = (function () {
        /*private*/
        function ExprLabel() {
        }
        ExprLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ExprLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        ExprLabel.prototype.getVal = function () {
            return null;
        };
        ExprLabel.prototype.select = function (vms) {
            this.strategy.select(vms, this);
        };
        //Template
        ExprLabel.prototype.step = function (vms) {
            if (vms.stack.top().ready == true) {
                var evalu = vms.stack.top();
                var pending = evalu.getPending();
                if (pending != null) {
                    var node = evalu.root.get(arrayToList(pending));
                    this.nodeStep(node, evalu, vms);
                }
                else { } //error
            }
        };
        return ExprLabel;
    })();
    pnode.ExprLabel = ExprLabel;
    var ExprSeqLabel = (function () {
        /*private*/
        function ExprSeqLabel() {
            this.strategy = new lrStrategy();
        }
        ExprSeqLabel.prototype.isValid = function (children) {
            return children.every(function (c) {
                return c.isExprNode();
            });
        };
        ExprSeqLabel.prototype.step = function (vms) {
            var pending = vms.getEval().getPending();
            var thisNode = vms.getEval().getRoot().get(arrayToList(pending));
            var valpath = pending.concat([thisNode.count() - 1]);
            var v = vms.getEval().varmap.get(valpath);
            vms.getEval().finishStep(v);
        };
        ExprSeqLabel.prototype.getClass = function () {
            return ExprSeqNode;
        };
        ExprSeqLabel.prototype.toString = function () {
            return "seq";
        };
        ExprSeqLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        ExprSeqLabel.prototype.getVal = function () {
            return null;
        };
        ExprSeqLabel.prototype.select = function (vms) {
            this.strategy.select(vms, this);
        };
        ExprSeqLabel.prototype.toJSON = function () {
            return { kind: "ExprSeqLabel" };
        };
        ExprSeqLabel.fromJSON = function (json) {
            return ExprSeqLabel.theExprSeqLabel;
        };
        // Singleton
        ExprSeqLabel.theExprSeqLabel = new ExprSeqLabel();
        return ExprSeqLabel;
    })();
    pnode.ExprSeqLabel = ExprSeqLabel;
    var ParameterListLabel = (function () {
        /*private*/
        function ParameterListLabel() {
            this.strategy = new lrStrategy();
        }
        ParameterListLabel.prototype.isValid = function (children) {
            return children.every(function (c) {
                return c.isExprNode();
            });
        };
        ParameterListLabel.prototype.step = function (vms) {
            //TODO should the parameter list do anything? I don't think it does - JH
        };
        ParameterListLabel.prototype.getClass = function () {
            return ExprSeqNode;
        };
        ParameterListLabel.prototype.toString = function () {
            return "param";
        };
        ParameterListLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        ParameterListLabel.prototype.getVal = function () {
            return null;
        };
        ParameterListLabel.prototype.select = function (vms) {
            this.strategy.select(vms, this);
        };
        ParameterListLabel.prototype.toJSON = function () {
            return { kind: "ParamLabel" };
        };
        ParameterListLabel.fromJSON = function (json) {
            return ParameterListLabel.theParameterListLabel;
        };
        // Singleton
        ParameterListLabel.theParameterListLabel = new ParameterListLabel();
        return ParameterListLabel;
    })();
    pnode.ParameterListLabel = ParameterListLabel;
    var TypeLabel = (function () {
        /*private*/
        function TypeLabel() {
        }
        TypeLabel.prototype.getClass = function () {
            return TypeNode;
        };
        TypeLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        TypeLabel.prototype.getVal = function () {
            return null;
        };
        TypeLabel.prototype.step = function (vms) {
            //TODO not sure yet
        };
        return TypeLabel;
    })();
    pnode.TypeLabel = TypeLabel;
    //Variable
    var VariableLabel = (function (_super) {
        __extends(VariableLabel, _super);
        /*private*/
        function VariableLabel(name) {
            _super.call(this);
            this.strategy = new varStrategy();
            this._val = name;
        }
        VariableLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        VariableLabel.prototype.getClass = function () {
            return ExprNode;
        };
        VariableLabel.prototype.toString = function () {
            return "variable";
        };
        VariableLabel.prototype.getVal = function () {
            return this._val;
        };
        VariableLabel.prototype.changeValue = function (newString) {
            var newLabel = new VariableLabel(newString);
            return new Some(newLabel);
        };
        VariableLabel.prototype.nodeStep = function (node, evalu) {
            var v = lookUp(this._val, evalu.stack).getValue();
            evalu.finishStep(v);
        };
        VariableLabel.prototype.toJSON = function () {
            return { kind: "VariableLabel", name: this._val };
        };
        VariableLabel.fromJSON = function (json) {
            return new VariableLabel(json.name);
        };
        VariableLabel.theVariableLabel = new VariableLabel("");
        return VariableLabel;
    })(ExprLabel);
    pnode.VariableLabel = VariableLabel;
    var VarDeclLabel = (function (_super) {
        __extends(VarDeclLabel, _super);
        /*private*/
        function VarDeclLabel(name) {
            _super.call(this);
            this.strategy = new varDeclStrategy();
            this._val = name;
        }
        VarDeclLabel.prototype.isValid = function (children) {
            if (children.length != 3)
                return false;
            if (!children[0].isExprNode())
                return false;
            if (!children[1].isTypeNode())
                return false;
            return true;
        };
        VarDeclLabel.prototype.getClass = function () {
            return ExprNode;
        };
        VarDeclLabel.prototype.toString = function () {
            return "vdecl";
        };
        VarDeclLabel.prototype.changeValue = function (newString) {
            var newLabel = new VarDeclLabel(newString);
            return new Some(newLabel);
        };
        VarDeclLabel.prototype.nodeStep = function (node, evalu) {
            var varNamePath = evalu.getPending().concat([0]);
            var typePath = evalu.getPending().concat([1]);
            var varValuePath = evalu.getPending().concat([2]);
            var name = evalu.varmap.get(varNamePath);
            var value = evalu.varmap.get(varValuePath);
            var typelabel = evalu.getRoot().get(arrayToList(typePath)).label();
            var type = Type.NULL;
            if (typelabel.toString() == "noType") {
                type = Type.ANY;
            }
            var isConst = false; //TODO false for now for testing purposes
            if (this._val == "true") {
                isConst = true;
            }
            else {
                isConst = false;
            }
            var v = new Field(name.getVal(), value, type, isConst);
            evalu.getStack().top().addField(v);
            evalu.finishStep(v.getValue());
        };
        VarDeclLabel.prototype.toJSON = function () {
            return { kind: "VarDeclLabel" };
        };
        VarDeclLabel.fromJSON = function (json) {
            return VarDeclLabel.theVarDeclLabel;
        };
        // Singleton
        VarDeclLabel.theVarDeclLabel = new VarDeclLabel("");
        return VarDeclLabel;
    })(ExprLabel);
    pnode.VarDeclLabel = VarDeclLabel;
    var AssignLabel = (function (_super) {
        __extends(AssignLabel, _super);
        /*private*/
        function AssignLabel() {
            _super.call(this);
            this.strategy = new assignStrategy();
        }
        AssignLabel.prototype.isValid = function (children) {
            if (children.length != 2)
                return false;
            if (!children[0].isExprNode())
                return false;
            if (!children[1].isExprNode())
                return false;
            return true;
        };
        AssignLabel.prototype.getClass = function () {
            return ExprNode;
        };
        AssignLabel.prototype.toString = function () {
            return "assign";
        };
        AssignLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        AssignLabel.prototype.nodeStep = function (node, evalu) {
            var leftside = evalu.getPending().concat([0]);
            var rightside = evalu.getPending().concat([1]);
            var rs = evalu.varmap.get(rightside);
            var lNode = evalu.getRoot().get(leftside);
            //make sure left side is var
            if (lNode.label().toString() == VariableLabel.theVariableLabel.toString()) {
                //if in stack
                if (evalu.getStack().inStack(lNode.label().getVal())) {
                    evalu.getStack().setField(lNode.label().getVal(), rs);
                }
                else {
                    throw new Error("Variable is not in map! Declare it first!");
                }
                evalu.finishStep(rs);
            }
            else {
            }
        };
        AssignLabel.prototype.toJSON = function () {
            return { kind: "AssignLabel" };
        };
        AssignLabel.fromJSON = function (json) {
            return AssignLabel.theAssignLabel;
        };
        // Singleton
        AssignLabel.theAssignLabel = new AssignLabel();
        return AssignLabel;
    })(ExprLabel);
    pnode.AssignLabel = AssignLabel;
    //Arithmetic Labels
    var CallWorldLabel = (function (_super) {
        __extends(CallWorldLabel, _super);
        /*private*/
        function CallWorldLabel(name) {
            _super.call(this);
            this.strategy = new lrStrategy();
            this._val = name;
        }
        CallWorldLabel.prototype.isValid = function (children) {
            return children.every(function (c) { return c.isExprNode(); });
        };
        CallWorldLabel.prototype.getClass = function () {
            return ExprNode;
        };
        CallWorldLabel.prototype.toString = function () {
            return "callWorld";
        };
        CallWorldLabel.prototype.getVal = function () {
            return this._val;
        };
        CallWorldLabel.prototype.changeValue = function (newString) {
            var newLabel = new CallWorldLabel(newString);
            return new Some(newLabel);
        };
        CallWorldLabel.prototype.nodeStep = function (node, evalu, vms) {
            if (evalu.getStack().inStack(this._val.toString())) {
                var field = evalu.getStack().getField(this._val.toString());
                if (field.getValue().isBuiltInV()) {
                    return field.getValue().step(node, evalu);
                }
                else {
                    var c = field.getValue;
                    // if (!c.isClosureV()){}//  error!
                    var c1 = c;
                    var f = c1.function;
                    //a bunch of pNodes(non parameter children)
                    var argList = new Array();
                    var i = 0;
                    while (evalu.varmap.get(evalu.getPending().concat(i)) != null) {
                        argList.push(evalu.varmap.get(evalu.getPending().concat(i)));
                        i++;
                    }
                    if (argList.length != f.child(0).count()) { } //error
                    //		if (any argument has a value not compatible with the corresponding parameter type){}
                    // error!
                    //list of parameters (I think)
                    var param = f.child(0).children; //TODO
                    var arFields; //fields to go in the stack
                    arFields = new Array();
                    for (var j = 0; j < f.child(0).count(); j++) {
                        //name, val, type, isConst
                        var fields = new Field(param[j].name, argList[j], Type.ANY, false); //TODO, what should argList be giving? Values?
                        //Also, do we even know the values? Do we look them up?
                        arFields.push(fields);
                    }
                    var activationRecord = new ObjectV();
                    for (var k = 0; k < arFields.length; k++) {
                        activationRecord.addField(arFields[k]);
                    }
                    var stack = new execStack(activationRecord); //might have to take a look at how execution stack is made
                    stack.setNext(c1.context);
                    var newEval = new Evaluation(f, null, stack);
                    newEval.setPending([]);
                    vms.stack.push(newEval);
                }
            }
        };
        CallWorldLabel.prototype.toJSON = function () {
            return { kind: "CallWorldLabel", name: this._val };
        };
        CallWorldLabel.fromJSON = function (json) {
            return new CallWorldLabel(json.name);
        };
        CallWorldLabel.theCallWorldLabel = new CallWorldLabel("");
        return CallWorldLabel;
    })(ExprLabel);
    pnode.CallWorldLabel = CallWorldLabel;
    //Placeholder Labels
    var ExprPHLabel = (function (_super) {
        __extends(ExprPHLabel, _super);
        /*private*/
        function ExprPHLabel() {
            _super.call(this);
        }
        ExprPHLabel.prototype.isValid = function (children) {
            if (children.length != 0)
                return false;
            return true;
        };
        ExprPHLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ExprPHLabel.prototype.toString = function () {
            return "expPH";
        };
        ExprPHLabel.prototype.nodeStep = function (node, evalu) { }; //Placeholders don't need to to step
        ExprPHLabel.prototype.toJSON = function () {
            return { kind: "ExprPHLabel" };
        };
        ExprPHLabel.fromJSON = function (json) {
            return ExprPHLabel.theExprPHLabel;
        };
        // Singleton
        ExprPHLabel.theExprPHLabel = new ExprPHLabel();
        return ExprPHLabel;
    })(ExprLabel);
    pnode.ExprPHLabel = ExprPHLabel;
    var ExprOptLabel = (function (_super) {
        __extends(ExprOptLabel, _super);
        /*private*/
        function ExprOptLabel() {
            _super.call(this);
            this.strategy = new LiteralStrategy();
        }
        ExprOptLabel.prototype.isValid = function (children) {
            if (children.length != 0)
                return false;
            return true;
        };
        ExprOptLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ExprOptLabel.prototype.toString = function () {
            return "expOpt";
        };
        ExprOptLabel.prototype.nodeStep = function (node, evalu) {
            //add in a null value to signify that it is null to signify that
            var v = new StringV("null");
            evalu.finishStep(v);
        };
        ExprOptLabel.prototype.toJSON = function () {
            return { kind: "ExprOptLabel" };
        };
        ExprOptLabel.fromJSON = function (json) {
            return ExprOptLabel.theExprOptLabel;
        };
        // Singleton
        ExprOptLabel.theExprOptLabel = new ExprOptLabel();
        return ExprOptLabel;
    })(ExprLabel);
    pnode.ExprOptLabel = ExprOptLabel;
    var LambdaLabel = (function (_super) {
        __extends(LambdaLabel, _super);
        /*private*/
        function LambdaLabel(val) {
            _super.call(this);
            this.strategy = new lambdaStrategy();
            this._val = val;
        }
        LambdaLabel.prototype.isValid = function (children) {
            if (children.length != 3)
                return false;
            if (!children[0].isExprSeqNode())
                return false;
            if (!children[1].isTypeNode())
                return false;
            if (!children[2].isExprSeqNode())
                return false;
            return true;
        };
        LambdaLabel.prototype.getClass = function () {
            return ExprNode;
        };
        LambdaLabel.prototype.toString = function () {
            return "lambda";
        };
        LambdaLabel.prototype.changeValue = function (newString) {
            var newLabel = new LambdaLabel(newString);
            return new Some(newLabel);
        };
        LambdaLabel.prototype.getVal = function () {
            return this._val;
        };
        LambdaLabel.prototype.nodeStep = function (node, evalu) {
            var clo = new ClosureV();
            clo.context = evalu.getStack(); //TODO this is the correct stack?
            clo.function = node;
            //            var name = <StringV> node.label().getVal();
            var v = new Field(node.label().getVal(), clo, Type.ANY, true);
            evalu.getStack().top().addField(v);
            evalu.finishStep(clo);
            //TODO should there be anything about creating a new stack in here, or is this for call?
            /* var paramPath = evalu.getPending().concat([0]);
             var functionPath = evalu.getPending().concat([2]);
 
             var paramNode = evalu.getRoot().get(arrayToList(paramPath));
             var argList = new Array();
             for (var i = 0; i < paramNode.count(); i++){
                 argList.push(evalu.getVarMap().get(paramPath.concat([i])));
             }
 */
        };
        LambdaLabel.prototype.toJSON = function () {
            return { kind: "LambdaLabel" };
        };
        LambdaLabel.fromJSON = function (json) {
            return LambdaLabel.theLambdaLabel;
        };
        // Singleton
        LambdaLabel.theLambdaLabel = new LambdaLabel("");
        return LambdaLabel;
    })(ExprLabel);
    pnode.LambdaLabel = LambdaLabel;
    //While and If Labels
    var IfLabel = (function (_super) {
        __extends(IfLabel, _super);
        /*private*/
        function IfLabel() {
            _super.call(this);
            this.strategy = new ifStrategy();
        }
        IfLabel.prototype.isValid = function (children) {
            if (children.length != 3)
                return false;
            if (!children[0].isExprNode())
                return false;
            if (!children[1].isExprSeqNode())
                return false;
            if (!children[2].isExprSeqNode())
                return false;
            return true;
        };
        IfLabel.prototype.getClass = function () {
            return ExprNode;
        };
        IfLabel.prototype.toString = function () {
            return "if";
        };
        IfLabel.prototype.nodeStep = function (node, evalu) {
            var guardPath = evalu.getPending().concat([0]);
            var thenPath = evalu.getPending().concat([1]);
            var elsePath = evalu.getPending().concat([2]);
            var v;
            var string = evalu.varmap.get(guardPath);
            if (string.contents.match("true")) {
                v = evalu.varmap.get(thenPath);
            }
            else {
                v = evalu.varmap.get(elsePath);
            }
            evalu.finishStep(v);
        };
        IfLabel.prototype.toJSON = function () {
            return { kind: "IfLabel" };
        };
        IfLabel.fromJSON = function (json) {
            return IfLabel.theIfLabel;
        };
        // Singleton
        IfLabel.theIfLabel = new IfLabel();
        return IfLabel;
    })(ExprLabel);
    pnode.IfLabel = IfLabel;
    var WhileLabel = (function (_super) {
        __extends(WhileLabel, _super);
        /*private*/
        function WhileLabel() {
            _super.call(this);
            this.strategy = new whileStrategy();
        }
        WhileLabel.prototype.isValid = function (children) {
            if (children.length != 2)
                return false;
            if (!children[0].isExprNode())
                return false;
            if (!children[1].isExprSeqNode())
                return false;
            return true;
        };
        WhileLabel.prototype.getClass = function () {
            return ExprNode;
        };
        WhileLabel.prototype.toString = function () {
            return "while";
        };
        WhileLabel.prototype.nodeStep = function (node, evalu) {
            var loopPath = evalu.getPending().concat([1]);
            var v = evalu.varmap.get(loopPath);
            evalu.finishStep(v);
        };
        WhileLabel.prototype.toJSON = function () {
            return { kind: "WhileLabel" };
        };
        WhileLabel.fromJSON = function (json) {
            return WhileLabel.theWhileLabel;
        };
        // Singleton
        WhileLabel.theWhileLabel = new WhileLabel();
        return WhileLabel;
    })(ExprLabel);
    pnode.WhileLabel = WhileLabel;
    //Type Labels
    var NoTypeLabel = (function () {
        /*private*/
        function NoTypeLabel() {
        }
        NoTypeLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        NoTypeLabel.prototype.getClass = function () {
            return TypeNode;
        };
        NoTypeLabel.prototype.toString = function () {
            return "noType";
        };
        NoTypeLabel.prototype.step = function (vms) {
        };
        NoTypeLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        NoTypeLabel.prototype.getVal = function () {
            return null;
        };
        NoTypeLabel.prototype.toJSON = function () {
            return { kind: "NoTypeLabel" };
        };
        NoTypeLabel.fromJSON = function (json) {
            return NoTypeLabel.theNoTypeLabel;
        };
        // Singleton
        NoTypeLabel.theNoTypeLabel = new NoTypeLabel();
        return NoTypeLabel;
    })();
    pnode.NoTypeLabel = NoTypeLabel;
    //Literal Labels
    var StringLiteralLabel = (function (_super) {
        __extends(StringLiteralLabel, _super);
        function StringLiteralLabel(val) {
            _super.call(this);
            this.strategy = new LiteralStrategy();
            this._val = val;
        }
        StringLiteralLabel.prototype.val = function () { return this._val; };
        StringLiteralLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        StringLiteralLabel.prototype.getClass = function () { return ExprNode; };
        StringLiteralLabel.prototype.changeValue = function (newString) {
            var newLabel = new StringLiteralLabel(newString);
            return new Some(newLabel);
        };
        StringLiteralLabel.prototype.getVal = function () {
            return this._val;
        };
        StringLiteralLabel.prototype.toString = function () { return "string[" + this._val + "]"; };
        StringLiteralLabel.prototype.nodeStep = function (node, evalu) {
            evalu.finishStep(new StringV(this._val));
        };
        StringLiteralLabel.prototype.toJSON = function () {
            return { kind: "StringLiteralLabel", val: this._val };
        };
        StringLiteralLabel.fromJSON = function (json) {
            return new StringLiteralLabel(json.val);
        };
        StringLiteralLabel.theStringLiteralLabel = new StringLiteralLabel("");
        return StringLiteralLabel;
    })(ExprLabel);
    pnode.StringLiteralLabel = StringLiteralLabel;
    var NumberLiteralLabel = (function (_super) {
        __extends(NumberLiteralLabel, _super);
        function NumberLiteralLabel(val) {
            _super.call(this);
            this._val = val;
        }
        NumberLiteralLabel.prototype.val = function () { return this._val; };
        NumberLiteralLabel.prototype.isValid = function (children) {
            return children.length == 0;
            //TODO logic to make sure this is a number
        };
        NumberLiteralLabel.prototype.changeValue = function (newString) {
            var newLabel = new NumberLiteralLabel(newString);
            return new Some(newLabel);
        };
        NumberLiteralLabel.prototype.getVal = function () {
            return this._val;
        };
        NumberLiteralLabel.prototype.getClass = function () { return ExprNode; };
        NumberLiteralLabel.prototype.toString = function () { return "number[" + this._val + "]"; };
        NumberLiteralLabel.prototype.nodeStep = function (node, evalu) {
        };
        NumberLiteralLabel.prototype.toJSON = function () {
            return { kind: "NumberLiteralLabel", val: this._val };
        };
        NumberLiteralLabel.fromJSON = function (json) {
            return new NumberLiteralLabel(json.val);
        };
        NumberLiteralLabel.theNumberLiteralLabel = new NumberLiteralLabel("");
        return NumberLiteralLabel;
    })(ExprLabel);
    pnode.NumberLiteralLabel = NumberLiteralLabel;
    var BooleanLiteralLabel = (function (_super) {
        __extends(BooleanLiteralLabel, _super);
        function BooleanLiteralLabel(val) {
            _super.call(this);
            this._val = val;
        }
        BooleanLiteralLabel.prototype.val = function () { return this._val; };
        BooleanLiteralLabel.prototype.changeValue = function (newString) {
            var newLabel = new BooleanLiteralLabel(newString);
            return new Some(newLabel);
        };
        BooleanLiteralLabel.prototype.isValid = function (children) {
            if (children.length != 0) {
                return false;
            }
            if (this.val() != "true" && this.val() != "false") {
                return false;
            }
            return true;
        };
        BooleanLiteralLabel.prototype.getVal = function () {
            return this._val;
        };
        BooleanLiteralLabel.prototype.getClass = function () { return ExprNode; };
        BooleanLiteralLabel.prototype.toString = function () { return "boolean[" + this._val + "]"; };
        BooleanLiteralLabel.prototype.nodeStep = function (node, evalu) {
        };
        BooleanLiteralLabel.prototype.toJSON = function () {
            return { kind: "BooleanLiteralLabel", val: this._val };
        };
        BooleanLiteralLabel.fromJSON = function (json) {
            return new BooleanLiteralLabel(json.val);
        };
        // The following line makes no sense.
        BooleanLiteralLabel.theBooleanLiteralLabel = new BooleanLiteralLabel("");
        return BooleanLiteralLabel;
    })(ExprLabel);
    pnode.BooleanLiteralLabel = BooleanLiteralLabel;
    var NullLiteralLabel = (function (_super) {
        __extends(NullLiteralLabel, _super);
        function NullLiteralLabel() {
            _super.call(this);
        }
        NullLiteralLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        NullLiteralLabel.prototype.getClass = function () { return ExprNode; };
        NullLiteralLabel.prototype.toString = function () { return "null"; };
        NullLiteralLabel.prototype.nodeStep = function (node, evalu) {
        };
        NullLiteralLabel.prototype.toJSON = function () {
            return { kind: "NullLiteralLabel" };
        };
        NullLiteralLabel.fromJSON = function (json) {
            return NullLiteralLabel.theNullLiteralLabel;
        };
        NullLiteralLabel.theNullLiteralLabel = new NullLiteralLabel();
        return NullLiteralLabel;
    })(ExprLabel);
    pnode.NullLiteralLabel = NullLiteralLabel;
    var CallLabel = (function (_super) {
        __extends(CallLabel, _super);
        /*private*/
        function CallLabel() {
            _super.call(this);
            this.strategy = new lrStrategy();
        }
        CallLabel.prototype.isValid = function (children) {
            //TODO check if child 0 is a method
            return children.every(function (c) {
                return c.isExprNode();
            });
        };
        CallLabel.prototype.getClass = function () {
            return ExprNode;
        };
        CallLabel.prototype.toString = function () {
            return "call";
        };
        CallLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        CallLabel.prototype.getVal = function () {
            return null;
        };
        CallLabel.prototype.nodeStep = function (node, evalu, vms) { };
        CallLabel.prototype.toJSON = function () {
            return { kind: "CallLabel" };
        };
        CallLabel.fromJSON = function (json) {
            return CallLabel.theCallLabel;
        };
        // Singleton
        CallLabel.theCallLabel = new CallLabel();
        return CallLabel;
    })(ExprLabel);
    pnode.CallLabel = CallLabel;
    var PenLabel = (function (_super) {
        __extends(PenLabel, _super);
        function PenLabel(val) {
            _super.call(this);
            this.strategy = new TurtleStrategy();
            this._val = val;
        }
        PenLabel.prototype.val = function () {
            return this._val;
        };
        PenLabel.prototype.changeValue = function (newString) {
            var newLabel = new PenLabel(newString);
            return new Some(newLabel);
        };
        PenLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        PenLabel.prototype.getVal = function () {
            return this._val;
        };
        PenLabel.prototype.getClass = function () {
            return ExprNode;
        };
        PenLabel.prototype.toString = function () {
            return "penup";
        };
        PenLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("penup")) {
                var f = evalu.getStack().getField("penup");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        PenLabel.prototype.toJSON = function () {
            return { kind: "PenLabel" };
        };
        PenLabel.fromJSON = function (json) {
            return PenLabel.thePenLabel;
        };
        // Singleton
        PenLabel.thePenLabel = new PenLabel("");
        return PenLabel;
    })(ExprLabel);
    pnode.PenLabel = PenLabel;
    var ForwardLabel = (function (_super) {
        __extends(ForwardLabel, _super);
        function ForwardLabel(val) {
            _super.call(this);
            this.strategy = new TurtleStrategy();
            this._val = val;
        }
        ForwardLabel.prototype.val = function () {
            return this._val;
        };
        ForwardLabel.prototype.changeValue = function (newString) {
            var newLabel = new ForwardLabel(newString);
            return new Some(newLabel);
        };
        ForwardLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        ForwardLabel.prototype.getVal = function () {
            return this._val;
        };
        ForwardLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ForwardLabel.prototype.toString = function () {
            return "forward";
        };
        ForwardLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("forward")) {
                var f = evalu.getStack().getField("forward");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        ForwardLabel.prototype.toJSON = function () {
            return { kind: "forward" };
        };
        ForwardLabel.fromJSON = function (json) {
            return ForwardLabel.theForwardLabel;
        };
        // Singleton
        ForwardLabel.theForwardLabel = new ForwardLabel("");
        return ForwardLabel;
    })(ExprLabel);
    pnode.ForwardLabel = ForwardLabel;
    var RightLabel = (function (_super) {
        __extends(RightLabel, _super);
        function RightLabel(val) {
            _super.call(this);
            this.strategy = new TurtleStrategy();
            this._val = val;
        }
        RightLabel.prototype.val = function () {
            return this._val;
        };
        RightLabel.prototype.changeValue = function (newString) {
            var newLabel = new RightLabel(newString);
            return new Some(newLabel);
        };
        RightLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        RightLabel.prototype.getVal = function () {
            return this._val;
        };
        RightLabel.prototype.getClass = function () {
            return ExprNode;
        };
        RightLabel.prototype.toString = function () {
            return "right";
        };
        RightLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("right")) {
                var f = evalu.getStack().getField("right");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        RightLabel.prototype.toJSON = function () {
            return { kind: "RightLabel" };
        };
        RightLabel.fromJSON = function (json) {
            return RightLabel.theRightLabel;
        };
        // Singleton
        RightLabel.theRightLabel = new RightLabel("");
        return RightLabel;
    })(ExprLabel);
    pnode.RightLabel = RightLabel;
    var ClearLabel = (function (_super) {
        __extends(ClearLabel, _super);
        function ClearLabel() {
            _super.call(this);
            this.strategy = new LiteralStrategy();
        }
        ClearLabel.prototype.val = function () {
            return this._val;
        };
        ClearLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        ClearLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        ClearLabel.prototype.getVal = function () {
            return this._val;
        };
        ClearLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ClearLabel.prototype.toString = function () {
            return "clear";
        };
        ClearLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("clear")) {
                var f = evalu.getStack().getField("clear");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        ClearLabel.prototype.toJSON = function () {
            return { kind: "ClearLabel" };
        };
        ClearLabel.fromJSON = function (json) {
            return ClearLabel.theClearLabel;
        };
        // Singleton
        ClearLabel.theClearLabel = new ClearLabel();
        return ClearLabel;
    })(ExprLabel);
    pnode.ClearLabel = ClearLabel;
    var HideLabel = (function (_super) {
        __extends(HideLabel, _super);
        function HideLabel() {
            _super.call(this);
            this.strategy = new LiteralStrategy();
        }
        HideLabel.prototype.val = function () {
            return this._val;
        };
        HideLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        HideLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        HideLabel.prototype.getVal = function () {
            return this._val;
        };
        HideLabel.prototype.getClass = function () {
            return ExprNode;
        };
        HideLabel.prototype.toString = function () {
            return "hide";
        };
        HideLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("hide")) {
                var f = evalu.getStack().getField("hide");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        HideLabel.prototype.toJSON = function () {
            return { kind: "HideLabel" };
        };
        HideLabel.fromJSON = function (json) {
            return HideLabel.theHideLabel;
        };
        // Singleton
        HideLabel.theHideLabel = new HideLabel();
        return HideLabel;
    })(ExprLabel);
    pnode.HideLabel = HideLabel;
    var ShowLabel = (function (_super) {
        __extends(ShowLabel, _super);
        function ShowLabel() {
            _super.call(this);
            this.strategy = new LiteralStrategy();
        }
        ShowLabel.prototype.val = function () {
            return this._val;
        };
        ShowLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        ShowLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        ShowLabel.prototype.getVal = function () {
            return this._val;
        };
        ShowLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ShowLabel.prototype.toString = function () {
            return "show";
        };
        ShowLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("show")) {
                var f = evalu.getStack().getField("show");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        ShowLabel.prototype.toJSON = function () {
            return { kind: "ShowLabel" };
        };
        ShowLabel.fromJSON = function (json) {
            return ShowLabel.theShowLabel;
        };
        // Singleton
        ShowLabel.theShowLabel = new ShowLabel();
        return ShowLabel;
    })(ExprLabel);
    pnode.ShowLabel = ShowLabel;
    var LeftLabel = (function (_super) {
        __extends(LeftLabel, _super);
        function LeftLabel(val) {
            _super.call(this);
            this.strategy = new TurtleStrategy();
            this._val = val;
        }
        LeftLabel.prototype.val = function () {
            return this._val;
        };
        LeftLabel.prototype.changeValue = function (newString) {
            var newLabel = new LeftLabel(newString);
            return new Some(newLabel);
        };
        LeftLabel.prototype.isValid = function (children) {
            if (children.length != 1) {
                return false;
            }
            return true;
        };
        LeftLabel.prototype.getVal = function () {
            return this._val;
        };
        LeftLabel.prototype.getClass = function () {
            return ExprNode;
        };
        LeftLabel.prototype.toString = function () {
            return "left";
        };
        LeftLabel.prototype.nodeStep = function (node, evalu) {
            if (evalu.getStack().inStack("left")) {
                var f = evalu.getStack().getField("left");
                if (f.getValue().isBuiltInV()) {
                    return f.getValue().step(node, evalu);
                }
            }
        };
        LeftLabel.prototype.toJSON = function () {
            return { kind: "LeftLabel" };
        };
        LeftLabel.fromJSON = function (json) {
            return LeftLabel.theLeftLabel;
        };
        // Singleton
        LeftLabel.theLeftLabel = new LeftLabel("");
        return LeftLabel;
    })(ExprLabel);
    pnode.LeftLabel = LeftLabel;
    //Placeholder Make
    function mkExprPH() {
        return make(ExprPHLabel.theExprPHLabel, []);
    }
    pnode.mkExprPH = mkExprPH;
    function mkExprOpt() {
        return make(ExprOptLabel.theExprOptLabel, []);
    }
    pnode.mkExprOpt = mkExprOpt;
    //Loop and If Make
    function mkIf(guard, thn, els) {
        return make(IfLabel.theIfLabel, [guard, thn, els]);
    }
    pnode.mkIf = mkIf;
    function mkWorldCall(left, right) {
        return make(CallWorldLabel.theCallWorldLabel, [left, right]);
    }
    pnode.mkWorldCall = mkWorldCall;
    function mkWhile(cond, seq) {
        return make(WhileLabel.theWhileLabel, [cond, seq]);
    }
    pnode.mkWhile = mkWhile;
    function mkExprSeq(exprs) {
        return make(ExprSeqLabel.theExprSeqLabel, exprs);
    }
    pnode.mkExprSeq = mkExprSeq;
    function mkParameterList(exprs) {
        return make(ParameterListLabel.theParameterListLabel, exprs);
    }
    pnode.mkParameterList = mkParameterList;
    function mkType() {
        return make(new NoTypeLabel(), []);
    }
    pnode.mkType = mkType;
    //Const Make
    function mkStringLiteral(val) {
        return make(new StringLiteralLabel(val), []);
    }
    pnode.mkStringLiteral = mkStringLiteral;
    function mkNumberLiteral(val) {
        return make(new NumberLiteralLabel(val), []);
    }
    pnode.mkNumberLiteral = mkNumberLiteral;
    function mkBooleanLiteral(val) {
        return make(new BooleanLiteralLabel(val), []);
    }
    pnode.mkBooleanLiteral = mkBooleanLiteral;
    function mkVar(val) {
        return make(new VariableLabel(val), []);
    }
    pnode.mkVar = mkVar;
    function mkLambda(val, param, type, func) {
        return make(new LambdaLabel(val), [param, type, func]);
    }
    pnode.mkLambda = mkLambda;
    // JSON support
    function fromPNodeToJSON(p) {
        var json = p.toJSON();
        return JSON.stringify(json);
    }
    pnode.fromPNodeToJSON = fromPNodeToJSON;
    function fromJSONToPNode(s) {
        var json = JSON.parse(s);
        return PNode.fromJSON(json);
    }
    pnode.fromJSONToPNode = fromJSONToPNode;
    function fromJSONToLabel(json) {
        // There is probably a reflective way to do this
        //   Perhaps
        //       var labelClass = pnode[json.kind] ;
        //       check that labelClass is not undefined
        //       var  fromJSON : any => Label = labelClass["fromJSON"] ;
        //       check that fromJSON is not undefined
        //       return fromJSON( json ) ;
        var labelClass = pnode[json.kind]; // This line relies on
        //  (a) the json.kind field being the name of the concrete label class.
        //  (b) that all the concrete label classes are exported from the pnode module.
        assert.check(labelClass !== undefined); //check that labelClass is not undefined
        var fromJSON = labelClass["fromJSON"]; //
        assert.check(fromJSON !== undefined); // check that fromJSON is not undefined
        return fromJSON(json);
        // If the code above doesn't work, then make a big ugly switch like this:
        // switch( json.kind ) {
        // case "VariableLabel" : return VariableLabel.fromJSON( json ) ;
        // // and so on.
        // default : assert.check(false ) ;
        // }
    }
})(pnode || (pnode = {}));
module.exports = pnode;

},{"./assert":1,"./collections":2,"./evaluation":4,"./stackManager":10,"./value":12}],8:[function(require,module,exports){
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="edits.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collections = require('./collections');
var assert = require('./assert');
var pnode = require('./pnode');
var edits = require('./edits');
var pnodeEdits;
(function (pnodeEdits) {
    var None = collections.None;
    var Some = collections.Some;
    var AbstractEdit = edits.AbstractEdit;
    /** A Selection indicates a set of selected nodes within a tree.
    * The path must identify some node under the root in the following way.
    * If the path is empty, the root is identified. Otherwise the first
    * item of the path must identify a child of the root and the rest of
    * the path indicates a node equal to or under than child in the same way.
    * Let p be the node identified by the path.  The selected nodes are the
    * children of p numbered between the focus and the anchor.
    * We require 0 <= focus <= p.count() and 0 <= focus <= p.count().
    * <ul>
    * <li> If focus == anchor, no nodes are selected but the selection
    * defines a selection point.
    * <li> If focus < anchor, the selected nodes are the children of p numbered k
    * where focus <= k < anchor.
    * <li> If anchor < focus, the selected nodes are the children of p numbered k
    * where anchor <= k < focus.
    * </ul>
    * Invariant:
    *   - The path must identify a node under the root.
    *       I.e. the path can be empty or its first item must be
    *       the index of a child of the root and the rest of the path must
    *       identify a node under that child.
    *   - The focus and anchor must both be integers greater or equal to 0 and
    *     less or equal to the number of children of the node identified by the path.
    */
    var Selection = (function () {
        function Selection(root, path, anchor, focus) {
            assert.check(checkSelection(root, path, anchor, focus), "Attempt to make a bad selection");
            this._root = root;
            this._path = path;
            this._anchor = anchor;
            this._focus = focus;
        }
        Selection.prototype.root = function () { return this._root; };
        Selection.prototype.path = function () { return this._path; };
        Selection.prototype.anchor = function () { return this._anchor; };
        Selection.prototype.focus = function () { return this._focus; };
        Selection.prototype.toString = function () {
            return "Selection( " + "_root:" + this._root.toString() +
                " _path:" + this._path.toString() +
                " _anchor: " + this._anchor +
                " _focus: " + this._focus + ")";
        };
        return Selection;
    })();
    pnodeEdits.Selection = Selection;
    function isInteger(n) {
        return isFinite(n) && Math.floor(n) === n;
    }
    /** Checks the invariant of Selection.  See the documentation of Selection. */
    function checkSelection(tree, path, anchor, focus) {
        if (path.isEmpty()) {
            var start, end;
            if (anchor < focus) {
                start = anchor;
                end = focus;
            }
            else {
                start = focus;
                end = anchor;
            }
            return isInteger(start) && isInteger(end)
                && 0 <= start && end <= tree.count();
        }
        else {
            var head = path.first();
            return isInteger(head)
                && 0 <= head && head < tree.count()
                && checkSelection(tree.child(head), path.rest(), anchor, focus);
        }
    }
    pnodeEdits.checkSelection = checkSelection;
    var InsertChildrenEdit = (function (_super) {
        __extends(InsertChildrenEdit, _super);
        function InsertChildrenEdit(newNodes) {
            _super.call(this);
            this._newNodes = newNodes;
        }
        InsertChildrenEdit.prototype.applyEdit = function (selection) {
            var _this = this;
            // The following function dives down the tree following the path
            // until it reaches the node to be changed.
            // As it climbs back out of the recursion it generates new
            // nodes along the path it followed.
            var loop = function (node, path, start, end) {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    return node.tryModify(_this._newNodes, start, end);
                }
                else {
                    var k = path.first();
                    var len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    var opt_1 = loop(node.child(k), path.rest(), start, end);
                    return opt_1.choose(function (newChild) {
                        return node.tryModify([newChild], k, k + 1);
                    }, function () { return new None(); });
                }
            };
            // Determine the start and end
            var start;
            var end;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            var opt = loop(selection.root(), selection.path(), start, end);
            // If successful, build a new Selection object.
            return opt.choose(function (newRoot) {
                var f = start + _this._newNodes.length;
                var newSelection = new Selection(newRoot, selection.path(), f, f);
                return new Some(newSelection);
            }, function () { return new None(); });
        };
        return InsertChildrenEdit;
    })(AbstractEdit);
    pnodeEdits.InsertChildrenEdit = InsertChildrenEdit;
    var DeleteEdit = (function (_super) {
        __extends(DeleteEdit, _super);
        function DeleteEdit() {
            _super.call(this);
        }
        DeleteEdit.prototype.applyEdit = function (selection) {
            var noPH = new pnodeEdits.InsertChildrenEdit([]);
            var withPH = new pnodeEdits.InsertChildrenEdit([pnode.mkExprPH()]);
            var alt = edits.alt(noPH, withPH);
            return alt.applyEdit(selection);
        };
        return DeleteEdit;
    })(AbstractEdit);
    pnodeEdits.DeleteEdit = DeleteEdit;
    //changes the id inside the label
    var ChangeLabelEdit = (function (_super) {
        __extends(ChangeLabelEdit, _super);
        function ChangeLabelEdit(newString) {
            _super.call(this);
            this._newString = newString;
        }
        ChangeLabelEdit.prototype.applyEdit = function (selection) {
            var _this = this;
            var loop = function (node, path, start, end) {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    var opt = node.label().changeValue(_this._newString);
                    return opt.choose(function (label) {
                        return node.tryModifyLabel(label);
                    }, function () {
                        return new None();
                    });
                }
                else {
                    var k = path.first();
                    var len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    var opt_2 = loop(node.child(k), path.rest(), start, end);
                    return opt_2.choose(function (newChild) {
                        return node.tryModify([newChild], k, k + 1);
                    }, function () {
                        return new None();
                    });
                }
            };
            // Determine the start and end
            var start;
            var end;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            var opt = loop(selection.root(), selection.path(), start, end);
            // If successful, build a new Selection object.
            return opt.choose(function (newRoot) {
                var f = start;
                var newSelection = new Selection(newRoot, selection.path(), f, f);
                return new Some(newSelection);
            }, function () {
                return new None();
            });
        };
        return ChangeLabelEdit;
    })(AbstractEdit);
    pnodeEdits.ChangeLabelEdit = ChangeLabelEdit;
    var CopyNodeEdit = (function (_super) {
        __extends(CopyNodeEdit, _super);
        function CopyNodeEdit(selection) {
            var _this = this;
            _super.call(this);
            var loop = function (node, path, start, end) {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    _this._newNodes = node.children(start, end);
                }
                else {
                    var k = path.first();
                    var len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    loop(node.child(k), path.rest(), start, end);
                }
            };
            // Determine the start and end
            var start;
            var end;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            loop(selection.root(), selection.path(), start, end);
        }
        CopyNodeEdit.prototype.applyEdit = function (selection) {
            var edit = new pnodeEdits.InsertChildrenEdit(this._newNodes);
            return edit.applyEdit(selection);
        };
        return CopyNodeEdit;
    })(AbstractEdit);
    pnodeEdits.CopyNodeEdit = CopyNodeEdit;
    var MoveNodeEdit = (function (_super) {
        __extends(MoveNodeEdit, _super);
        function MoveNodeEdit(selection) {
            var _this = this;
            _super.call(this);
            var loop = function (node, path, start, end) {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    _this._newNodes = node.children(start, end);
                }
                else {
                    var k = path.first();
                    var len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    loop(node.child(k), path.rest(), start, end);
                }
            };
            // Determine the start and end
            var start;
            var end;
            this._oldSelection = selection;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            loop(selection.root(), selection.path(), start, end);
        }
        MoveNodeEdit.prototype.applyEdit = function (selection) {
            if (selection.root().get(selection.path()).children(selection.anchor(), selection.focus()).length != 0) {
                //if you are moving to an occupied space, you cannot move
                return new None();
            }
            var edit = new InsertChildrenEdit(this._newNodes);
            var selwithchildren = edit.applyEdit(selection).choose(function (p) { return p; }, function () {
                assert.check(false, "Error applying edit to node");
                return null;
            });
            var newSel = new Selection(selwithchildren.root(), this._oldSelection.path(), this._oldSelection.anchor(), this._oldSelection.focus());
            var edit2 = new DeleteEdit();
            return edit2.applyEdit(newSel);
        };
        return MoveNodeEdit;
    })(AbstractEdit);
    pnodeEdits.MoveNodeEdit = MoveNodeEdit;
    var SwapEdit = (function (_super) {
        __extends(SwapEdit, _super);
        function SwapEdit(srcSelection, trgSelection) {
            _super.call(this);
            this._srcSelection = srcSelection;
            this._trgSelection = trgSelection;
            this._srcNodes = this.getChildrenToSwap(srcSelection);
            this._trgNodes = this.getChildrenToSwap(trgSelection);
            if (this._srcNodes == null) {
                this._srcNodes = []; //TODO why would this ever be a thing??? It's been happening
            }
            if (this._trgNodes == null) {
                this._trgNodes = [];
            }
        }
        SwapEdit.prototype.canApply = function () {
            return this.applyEdit().choose(function (a) { return true; }, function () { return false; });
        };
        SwapEdit.prototype.getChildrenToSwap = function (selection) {
            var loop = function (node, path, start, end) {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    return node.children(start, end);
                }
                else {
                    var k = path.first();
                    var len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    loop(node.child(k), path.rest(), start, end);
                }
            };
            // Determine the start and end
            var start;
            var end;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            return loop(selection.root(), selection.path(), start, end);
        };
        SwapEdit.prototype.applyEdit = function () {
            var _this = this;
            // The following function dives down the tree following the path
            // until it reaches the node to be changed.
            // As it climbs back out of the recursion it generates new
            // nodes along the path it followed.
            var loop = function (srcnode, srcpath, trgpath, srcstart, srcend, trgstart, trgend) {
                if (srcpath.isEmpty() && trgpath.isEmpty()) {
                    if (srcend <= trgstart) {
                        var newchildren = srcnode.children(0, srcstart).concat(_this._srcNodes).concat(srcnode.children(srcend, trgstart)).concat(_this._trgNodes).concat(srcnode.children(trgend, srcnode.count()));
                        return srcnode.tryModify(newchildren, 0, srcnode.count());
                    }
                    else if (trgstart <= srcend) {
                        var newchildren = srcnode.children(0, trgstart).concat(_this._srcNodes).concat(srcnode.children(trgend, srcstart)).concat(_this._trgNodes).concat(srcnode.children(srcend, srcnode.count()));
                        return srcnode.tryModify(newchildren, 0, srcnode.count());
                    }
                    else {
                        //they overlap, fail
                        return new None();
                    }
                }
                else if (srcpath.isEmpty() && !trgpath.isEmpty()) {
                    if (trgpath.first() < srcstart) {
                        var singleReplaceTest = new InsertChildrenEdit(_this._trgNodes);
                        var sel = new Selection(srcnode.child(trgpath.first()), trgpath.rest(), trgstart, trgend);
                        var opt = singleReplaceTest.applyEdit(sel);
                        var sel1 = opt.choose(function (p) { return p; }, function () {
                            return null;
                        });
                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, trgpath.first()).concat(sel1.root()).concat(srcnode.children(trgpath.first() + 1, srcstart)).concat(_this._srcNodes).concat(srcnode.children(srcend, srcnode.count()));
                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }
                    }
                    else if (srcend <= trgpath.first()) {
                        var singleReplaceTest = new InsertChildrenEdit(_this._trgNodes);
                        var sel = new Selection(srcnode.child(trgpath.first()), trgpath.rest(), trgstart, trgend);
                        var opt = singleReplaceTest.applyEdit(sel);
                        var sel1 = opt.choose(function (p) { return p; }, function () {
                            return null;
                        });
                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, srcstart).concat(_this._srcNodes).concat(srcnode.children(srcend, trgpath.first())).concat(sel1.root()).concat(srcnode.children(trgpath.first() + 1, srcnode.count()));
                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }
                    }
                    else {
                        // srcstart <= trgpath.first() and trgpath.first() < srcend
                        return new None();
                    }
                }
                else if (!srcpath.isEmpty() && trgpath.isEmpty()) {
                    if (srcpath.first() < trgstart) {
                        var singleReplaceTest = new InsertChildrenEdit(_this._trgNodes);
                        var sel = new Selection(srcnode.child(srcpath.first()), srcpath.rest(), srcstart, srcend);
                        var opt = singleReplaceTest.applyEdit(sel);
                        var sel1 = opt.choose(function (p) { return p; }, function () {
                            return null;
                        });
                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, srcpath.first()).concat(sel1.root()).concat(srcnode.children(srcpath.first() + 1, trgstart)).concat(_this._srcNodes).concat(srcnode.children(trgend, srcnode.count()));
                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }
                    }
                    else if (trgend <= srcpath.first()) {
                        var singleReplaceTest = new InsertChildrenEdit(_this._trgNodes);
                        var sel = new Selection(srcnode.child(srcpath.first()), srcpath.rest(), srcstart, srcend);
                        var opt = singleReplaceTest.applyEdit(sel);
                        var sel1 = opt.choose(function (p) { return p; }, function () {
                            return null;
                        });
                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, trgstart).concat(_this._srcNodes).concat(srcnode.children(trgend, srcpath.first())).concat(sel1.root()).concat(srcnode.children(srcpath.first() + 1, srcnode.count()));
                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }
                        else {
                            // trgstart <= src.first() and src.first() < trgend
                            return new None();
                        }
                    }
                    else if (srcpath.first() != trgpath.first()) {
                        var singleReplaceTest = new InsertChildrenEdit(_this._srcNodes);
                        var sel = new Selection(srcnode.child(srcpath.first()), trgpath.rest(), trgstart, trgend);
                        var opt = singleReplaceTest.applyEdit(sel);
                        var sel1 = opt.choose(function (p) { return p; }, function () {
                            return null;
                        });
                        if (sel1 != null) {
                            var replace2 = new InsertChildrenEdit(_this._trgNodes);
                            var sel2 = new Selection(sel1.root(), srcpath.rest(), srcstart, srcend);
                            var opt2 = singleReplaceTest.applyEdit(sel2);
                            var sel3 = opt2.choose(function (p) { return p; }, function () {
                                return null;
                            });
                            if (sel3 != null) {
                                return new Some(sel3);
                            }
                        }
                        return new None();
                    }
                }
                else {
                    var srck = srcpath.first();
                    var srclen = srcnode.count();
                    var trgk = trgpath.first();
                    assert.check(0 <= srck && 0 <= trgk, "Bad Path. k < 0 in applyEdit");
                    assert.check(srck < srclen && trgk < srclen, "Bad Path. k >= len in applyEdit");
                    var opt_3 = loop(srcnode.child(srck), srcpath.rest(), trgpath.rest(), srcstart, srcend, trgstart, trgend);
                    return opt_3.choose(function (newChild) {
                        return srcnode.tryModify([newChild], trgk, trgk + 1);
                    }, function () {
                        return new None();
                    });
                }
            };
            if (this._trgNodes.length == 0) {
                //if the space you are moving to is unoccupied, then you can't swap
                return new None();
            }
            // Determine the start and end
            var srcstart;
            var srcend;
            var trgstart;
            var trgend;
            if (this._srcSelection.anchor() <= this._srcSelection.focus()) {
                srcstart = this._srcSelection.anchor();
                srcend = this._srcSelection.focus();
            }
            else {
                srcstart = this._srcSelection.focus();
                srcend = this._srcSelection.anchor();
            }
            if (this._trgSelection.anchor() <= this._trgSelection.focus()) {
                trgstart = this._trgSelection.anchor();
                trgend = this._trgSelection.focus();
            }
            else {
                trgstart = this._trgSelection.focus();
                trgend = this._trgSelection.anchor();
            }
            // Loop down to find and modify the selections target node.
            var opt = loop(this._srcSelection.root(), this._srcSelection.path(), this._trgSelection.path(), srcstart, srcend, trgstart, trgend);
            // If successful, build a new Selection object.
            return opt.choose(function (newRoot) {
                var f = srcstart;
                var newSelection = new Selection(newRoot, _this._srcSelection.path(), f, f);
                return new Some(newSelection);
            }, function () {
                return new None();
            });
        };
        return SwapEdit;
    })(AbstractEdit);
    pnodeEdits.SwapEdit = SwapEdit;
})(pnodeEdits || (pnodeEdits = {}));
module.exports = pnodeEdits;

},{"./assert":1,"./collections":2,"./edits":3,"./pnode":7}],9:[function(require,module,exports){
var seymour;
(function (seymour) {
    var Point = (function () {
        function Point(x, y) {
            this._x = 0;
            this._y = 0;
            this._x = x;
            this._y = y;
        }
        Point.prototype.x = function () { return this._x; };
        Point.prototype.y = function () { return this._y; };
        return Point;
    })();
    seymour.Point = Point;
    var TurtleWorld = (function () {
        function TurtleWorld() {
            // Defining the world to view mapping
            this.zoom = 1;
            this.worldWidth = 1024;
            this.worldHeight = 768;
            // The turtle
            this.posn = new Point(0, 0);
            // Invariant: The orientation is in [0,360)
            this.orientation = 0.0;
            this.visible = true;
            this.penIsDown = false;
            // The segments 
            this.segments = new Array();
            // The canvas
            this.canv = document.createElement('canvas');
        }
        TurtleWorld.prototype.getCanvas = function () { return this.canv; };
        TurtleWorld.prototype.forward = function (n) {
            var theta = this.orientation / 180.0 * Math.PI;
            var newx = this.posn.x() + n * Math.cos(theta);
            var newy = this.posn.y() + n * Math.sin(theta);
            var newPosn = new Point(newx, newy);
            if (this.penIsDown) {
                this.segments.push({ p0: this.posn, p1: newPosn });
            }
            ;
            this.posn = newPosn;
            this.redraw();
        };
        TurtleWorld.prototype.clear = function () {
            this.segments = new Array();
        };
        TurtleWorld.prototype.right = function (d) {
            var r = (this.orientation + d) % 360;
            while (r < 0)
                r += 360; // Once should be enough. Note that if r == -0 to start then it equals +360 to end!
            while (r >= 360)
                r -= 360; // Once should be enough.
            this.orientation = r;
            this.redraw();
        };
        TurtleWorld.prototype.left = function (d) {
            this.right(-d);
        };
        TurtleWorld.prototype.penUp = function () { this.penIsDown = false; };
        TurtleWorld.prototype.penDown = function () { this.penIsDown = true; };
        TurtleWorld.prototype.hide = function () { this.visible = false; this.redraw(); };
        TurtleWorld.prototype.show = function () { this.visible = true; this.redraw(); };
        TurtleWorld.prototype.redraw = function () {
            var ctx = this.canv.getContext("2d");
            var w = this.canv.width;
            var h = this.canv.height;
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < this.segments.length; ++i) {
                var p0v = this.world2View(this.segments[i].p0, w, h);
                var p1v = this.world2View(this.segments[i].p1, w, h);
                ctx.beginPath();
                ctx.moveTo(p0v.x(), p0v.y());
                ctx.lineTo(p1v.x(), p1v.y());
                ctx.stroke();
            }
            if (this.visible) {
                // Draw a little triangle
                var theta = this.orientation / 180.0 * Math.PI;
                var x = this.posn.x();
                var y = this.posn.y();
                var p0x = x + 4 * Math.cos(theta);
                var p0y = y + 4 * Math.sin(theta);
                var p1x = x + 5 * Math.cos(theta + 2.5);
                var p1y = y + 5 * Math.sin(theta + 2.5);
                var p2x = x + 5 * Math.cos(theta - 2.5);
                var p2y = y + 5 * Math.sin(theta - 2.5);
                var p0v = this.world2View(new Point(p0x, p0y), w, h);
                var p1v = this.world2View(new Point(p1x, p1y), w, h);
                var p2v = this.world2View(new Point(p2x, p2y), w, h);
                var base_image = new Image();
                base_image.src = "turtle1.png";
                base_image.width = 25;
                base_image.height = 25;
                var hscale = this.canv.width / this.worldWidth * this.zoom;
                var vscale = this.canv.height / this.worldHeight * this.zoom;
                var newx = this.posn.x() * hscale + this.canv.width / 2 - 12.5;
                var newy = this.posn.y() * vscale + this.canv.height / 2 - 12.5;
                ctx.drawImage(base_image, newx, newy);
                ctx.beginPath();
                ctx.moveTo(p0v.x(), p0v.y());
                ctx.lineTo(p1v.x(), p1v.y());
                ctx.lineTo(p2v.x(), p2v.y());
                ctx.lineTo(p0v.x(), p0v.y());
                ctx.stroke();
            }
        };
        TurtleWorld.prototype.world2View = function (p, viewWidth, viewHeight) {
            var hscale = viewWidth / this.worldWidth * this.zoom;
            var vscale = viewHeight / this.worldHeight * this.zoom;
            var x = p.x() * hscale + viewWidth / 2;
            var y = p.y() * vscale + viewHeight / 2;
            return new Point(x, y);
        };
        return TurtleWorld;
    })();
    seymour.TurtleWorld = TurtleWorld;
})(seymour || (seymour = {}));
module.exports = seymour;

},{}],10:[function(require,module,exports){
var stack;
(function (stack_1) {
    var execStack = (function () {
        function execStack(object) {
            this.obj = object;
            this.next = null;
        }
        execStack.prototype.setNext = function (stack) {
            this.next = stack;
        };
        execStack.prototype.top = function () {
            return this.obj;
        };
        execStack.prototype.getNext = function () {
            return this.next;
        };
        //Return true if value was correctly set
        execStack.prototype.setField = function (name, val) {
            for (var i = 0; i < this.obj.numFields(); i++) {
                if (name == this.obj.fields[i].getName()) {
                    this.obj.fields[i].setValue(val);
                    return true;
                }
            }
            if (this.next == null) {
                return false;
            }
            else {
                var here = this.next.setField(name, val);
                return here;
            }
        };
        execStack.prototype.getField = function (name) {
            for (var i = 0; i < this.obj.numFields(); i++) {
                //                if(name.match(this.obj.fields[i].getName().toString())){
                if (name == this.obj.fields[i].getName()) {
                    return this.obj.fields[i];
                }
            }
            if (this.next == null) {
                return null;
            }
            else {
                return this.next.getField(name);
            }
        };
        execStack.prototype.inStack = function (name) {
            for (var i = 0; i < this.obj.numFields(); i++) {
                //                if(name.match(this.obj.fields[i].getName().toString())){
                if (name == this.obj.fields[i].getName()) {
                    return true;
                }
            }
            if (this.next == null) {
                return false;
            }
            else {
                return this.next.inStack(name);
            }
        };
        return execStack;
    })();
    stack_1.execStack = execStack;
    var Stack = (function () {
        function Stack() {
            this.head = null;
        }
        Stack.prototype.push = function (val) {
            if (this.notEmpty()) {
                val.next = this.head;
                this.head = val;
            }
            else {
                this.head = val;
            }
        };
        Stack.prototype.pop = function () {
            var it = this.head;
            this.head = this.head.getNext();
            return it;
        };
        Stack.prototype.top = function () {
            return this.head;
        };
        Stack.prototype.notEmpty = function () {
            if (this.head == null) {
                return false;
            }
            else {
                return true;
            }
        };
        return Stack;
    })();
    stack_1.Stack = Stack;
    var mapEntry = (function () {
        function mapEntry(key, value) {
            this.path = key;
            this.val = value;
        }
        mapEntry.prototype.getPath = function () { return this.path; };
        mapEntry.prototype.getValue = function () { return this.val; };
        mapEntry.prototype.setValue = function (v) { this.val = v; };
        return mapEntry;
    })();
    stack_1.mapEntry = mapEntry;
    var VarMap = (function () {
        function VarMap() {
            this.entries = new Array();
            this.size = 0;
        }
        VarMap.prototype.samePath = function (a, b) {
            var flag = true;
            for (var p = 0; p < Math.max(a.length, b.length); p++) {
                if (a[p] != b[p]) {
                    flag = false;
                }
            }
            return flag;
        };
        VarMap.prototype.get = function (p) {
            for (var i = 0; i < this.size; i++) {
                var tmp = this.entries[i].getPath();
                if (this.samePath(tmp, p)) {
                    return this.entries[i].getValue();
                }
            }
            return null;
        };
        VarMap.prototype.put = function (p, v) {
            var notIn = true;
            for (var i = 0; i < this.size; i++) {
                var tmp = this.entries[i].getPath();
                if (this.samePath(tmp, p)) {
                    this.entries[i].setValue(v);
                    notIn = false;
                }
            }
            if (notIn) {
                var me = new mapEntry(p, v);
                this.entries.push(me);
                this.size++;
            }
        };
        VarMap.prototype.remove = function (p) {
            for (var i = 0; i < this.size; i++) {
                var tmp = this.entries[i].getPath();
                if (this.samePath(tmp, p)) {
                    this.size--;
                    var firstPart = this.entries.slice(0, i);
                    var lastPart = this.entries.slice(i + 1, this.entries.length);
                    this.entries = firstPart.concat(lastPart);
                }
            }
            return;
        };
        VarMap.prototype.inMap = function (p) {
            for (var i = 0; i < this.size; i++) {
                var tmp = this.entries[i].getPath();
                if (this.samePath(tmp, p)) {
                    return true;
                }
            }
            return false;
        };
        return VarMap;
    })();
    stack_1.VarMap = VarMap;
})(stack || (stack = {}));
module.exports = stack;

},{}],11:[function(require,module,exports){
var pnode = require('./pnode');
var assert = require('./assert');
var pnodeEdits = require('./pnodeEdits');
var collections = require('./collections');
var treeManager;
(function (treeManager) {
    var ExprSeqLabel = pnode.ExprSeqLabel;
    var Selection = pnodeEdits.Selection;
    var TreeManager = (function () {
        function TreeManager() {
        }
        TreeManager.prototype.getRoot = function () {
            return this.root;
        };
        TreeManager.prototype.createRoot = function () {
            var testroot = pnode.tryMake(ExprSeqLabel.theExprSeqLabel, []);
            // not sure how option works but will keep this
            this.root = testroot.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var placeholder = pnode.mkExprPH();
            var sel = new Selection(this.root, collections.list(0), 0, 1);
            var edit = new pnodeEdits.InsertChildrenEdit([placeholder]);
            return edit.applyEdit(sel);
        };
        TreeManager.prototype.createNode = function (label, selection) {
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
                case "booleanliteral":
                    return this.makeBooleanLiteralNode(selection);
                case "nullliteral":
                    return this.makeNullLiteralNode(selection);
                //variables & variable manipulation
                case "var":
                    return this.makeVarNode(selection);
                case "vardecl":
                    return this.makeVarDeclNode(selection);
                case "assign":
                    return this.makeAssignNode(selection);
                case "call":
                    return this.makeCallNode(selection);
                case "worldcall":
                    return this.makeWorldCallNode(selection);
                //misc
                case "lambda":
                    return this.makeLambdaNode(selection);
                case "method":
                    break;
                case "type":
                    return this.makeTypeNode(selection);
                //turtleworldfunctions
                case "pen":
                    return this.makePenNode(selection);
                case "forward":
                    return this.makeForwardNode(selection);
                case "right":
                    return this.makeRightNode(selection);
                case "left":
                    return this.makeLeftNode(selection);
                case "hide":
                    return this.makeHideNode(selection);
                case "show":
                    return this.makeShowNode(selection);
                case "clear":
                    return this.makeClearNode(selection);
            }
        };
        TreeManager.prototype.appendChild = function (srcSelection, trgSelection) {
            var edit = new pnodeEdits.InsertChildrenEdit([srcSelection.root()]);
            return edit.applyEdit(trgSelection);
        };
        TreeManager.prototype.makeVarNode = function (selection) {
            var opt = pnode.tryMake(pnode.VariableLabel.theVariableLabel, []);
            var varnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([varnode]);
            return edit.applyEdit(selection);
        };
        // Loop and If Nodes
        TreeManager.prototype.makeWhileNode = function (selection) {
            var cond = pnode.mkExprPH();
            var seq = pnode.mkExprSeq([]);
            var opt = pnode.tryMake(pnode.WhileLabel.theWhileLabel, [cond, seq]);
            var whilenode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([whilenode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeIfNode = function (selection) {
            var guard = pnode.mkExprPH();
            var thn = pnode.mkExprSeq([]);
            var els = pnode.mkExprSeq([]);
            var opt = pnode.tryMake(pnode.IfLabel.theIfLabel, [guard, thn, els]);
            var ifnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([ifnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeLambdaNode = function (selection) {
            var header = pnode.mkParameterList([]);
            var lambdatype = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);
            var dothis = pnode.mkExprSeq([]);
            var ltype = lambdatype.choose(function (p) { return p; }, function () {
                return null;
            });
            var opt = pnode.tryMake(pnode.LambdaLabel.theLambdaLabel, [header, ltype, dothis]);
            var lambdanode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([lambdanode]);
            return edit.applyEdit(selection);
        };
        //Arithmetic Nodes
        TreeManager.prototype.makeAssignNode = function (selection) {
            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.AssignLabel.theAssignLabel, [left, right]);
            var assignnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([assignnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeVarDeclNode = function (selection) {
            var varNode = pnode.mkStringLiteral("");
            var typeNode = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);
            var val = pnode.mkExprOpt();
            var ttype = typeNode.choose(function (p) { return p; }, function () {
                return null;
            });
            var opt = pnode.tryMake(pnode.VarDeclLabel.theVarDeclLabel, [varNode, ttype, val]);
            var vardeclnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([vardeclnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeWorldCallNode = function (selection) {
            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.CallWorldLabel.theCallWorldLabel, [left, right]);
            var worldcallnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([worldcallnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeCallNode = function (selection) {
            var opt = pnode.tryMake(pnode.CallLabel.theCallLabel, []);
            var callnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([callnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeTypeNode = function (selection) {
            var opt = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);
            var typenode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([typenode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeStringLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.StringLiteralLabel.theStringLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeNumberLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.NumberLiteralLabel.theNumberLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeBooleanLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.BooleanLiteralLabel.theBooleanLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeNullLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.NullLiteralLabel.theNullLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makePenNode = function (selection) {
            var val = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.PenLabel.thePenLabel, [val]);
            var pennode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([pennode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeForwardNode = function (selection) {
            var val = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.ForwardLabel.theForwardLabel, [val]);
            var forwardnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([forwardnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeRightNode = function (selection) {
            var val = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.RightLabel.theRightLabel, [val]);
            var rightnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([rightnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeLeftNode = function (selection) {
            var val = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.LeftLabel.theLeftLabel, [val]);
            var leftnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([leftnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeHideNode = function (selection) {
            var opt = pnode.tryMake(pnode.HideLabel.theHideLabel, []);
            var hidenode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([hidenode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeShowNode = function (selection) {
            var opt = pnode.tryMake(pnode.ShowLabel.theShowLabel, []);
            var showLabelnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([showLabelnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.makeClearNode = function (selection) {
            var opt = pnode.tryMake(pnode.ClearLabel.theClearLabel, []);
            var clearnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([clearnode]);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.changeNodeString = function (selection, newString) {
            var edit = new pnodeEdits.ChangeLabelEdit(newString);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.deleteNode = function (selection) {
            var deletedNode = selection.root().get(selection.path()).children(selection.anchor(), selection.focus());
            var edit = new pnodeEdits.DeleteEdit();
            return [deletedNode, edit.applyEdit(selection)];
        };
        TreeManager.prototype.moveCopySwapEditList = function (srcSelection, trgSelection) {
            var selectionList = [];
            var moveedit = new pnodeEdits.MoveNodeEdit(srcSelection);
            if (moveedit.canApply(trgSelection)) {
                var sel = moveedit.applyEdit(trgSelection);
                selectionList.push(["Moved", "Move", sel]);
            }
            var copyedit = new pnodeEdits.CopyNodeEdit(srcSelection);
            if (copyedit.canApply(trgSelection)) {
                var sel = copyedit.applyEdit(trgSelection);
                selectionList.push(['Copied', "Copy", sel]);
            }
            var swapedit = new pnodeEdits.SwapEdit(srcSelection, trgSelection);
            if (swapedit.canApply()) {
                var sel = swapedit.applyEdit();
                selectionList.push(['Swapped', "Swap", sel]);
            }
            return selectionList;
        };
        return TreeManager;
    })();
    treeManager.TreeManager = TreeManager;
})(treeManager || (treeManager = {}));
module.exports = treeManager;

},{"./assert":1,"./collections":2,"./pnode":7,"./pnodeEdits":8}],12:[function(require,module,exports){
var value;
(function (value_1) {
    var Field = (function () {
        function Field(name, value, type, isConstant) {
            this.name = name;
            this.value = value;
            this.type = type;
            this.isConstant = isConstant;
        }
        // getters and setters
        Field.prototype.getName = function () {
            return this.name;
        };
        Field.prototype.setName = function (name) {
            this.name = name;
        };
        Field.prototype.getValue = function () {
            return this.value;
        };
        Field.prototype.setValue = function (value) {
            this.value = value;
        };
        Field.prototype.getType = function () {
            return this.type;
        };
        Field.prototype.setType = function (type) {
            this.type = type;
        };
        Field.prototype.getIsConstant = function () {
            return this.isConstant;
        };
        Field.prototype.setIsConstant = function (isConstant) {
            this.isConstant = isConstant;
        };
        return Field;
    })();
    value_1.Field = Field;
    var StringV = (function () {
        function StringV(val) {
            this.contents = val;
        }
        StringV.prototype.getVal = function () {
            return this.contents;
        };
        StringV.prototype.setVal = function (val) {
            this.contents = val;
        };
        StringV.prototype.isClosureV = function () {
            return false;
        };
        StringV.prototype.isBuiltInV = function () {
            return false;
        };
        return StringV;
    })();
    value_1.StringV = StringV;
    var ObjectV = (function () {
        function ObjectV() {
            this.fields = new Array();
        }
        ObjectV.prototype.numFields = function () {
            return this.fields.length;
        };
        ObjectV.prototype.addField = function (field) {
            this.fields.push(field);
        };
        ObjectV.prototype.deleteField = function (fieldName) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() == fieldName) {
                    this.fields.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        ObjectV.prototype.getField = function (fieldName) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() == fieldName) {
                    return this.fields[i];
                }
            }
            return null;
        };
        ObjectV.prototype.isClosureV = function () {
            return false;
        };
        ObjectV.prototype.isBuiltInV = function () {
            return false;
        };
        return ObjectV;
    })();
    value_1.ObjectV = ObjectV;
    var ClosureV = (function () {
        function ClosureV() {
        }
        ClosureV.prototype.isClosureV = function () {
            return true;
        };
        ClosureV.prototype.isBuiltInV = function () {
            return false;
        };
        ClosureV.prototype.getVal = function () {
            return "function";
        };
        return ClosureV;
    })();
    value_1.ClosureV = ClosureV;
    var NullV = (function () {
        function NullV() {
        }
        NullV.prototype.isClosureV = function () {
            return false;
        };
        NullV.prototype.isBuiltInV = function () {
            return false;
        };
        return NullV;
    })();
    value_1.NullV = NullV;
    var DoneV = (function () {
        function DoneV() {
        }
        DoneV.prototype.isClosureV = function () {
            return false;
        };
        DoneV.prototype.isBuiltInV = function () {
            return false;
        };
        return DoneV;
    })();
    value_1.DoneV = DoneV;
    var BuiltInV = (function () {
        function BuiltInV(step) {
            this.step = step;
        }
        BuiltInV.prototype.isClosureV = function () {
            return false;
        };
        BuiltInV.prototype.isBuiltInV = function () {
            return true;
        };
        BuiltInV.prototype.getVal = function () {
            return "BuiltInV";
        };
        return BuiltInV;
    })();
    value_1.BuiltInV = BuiltInV;
    (function (Type) {
        Type[Type["STRING"] = 0] = "STRING";
        Type[Type["BOOL"] = 1] = "BOOL";
        Type[Type["NUMBER"] = 2] = "NUMBER";
        Type[Type["ANY"] = 3] = "ANY";
        Type[Type["METHOD"] = 4] = "METHOD";
        Type[Type["NULL"] = 5] = "NULL";
    })(value_1.Type || (value_1.Type = {}));
    var Type = value_1.Type;
})(value || (value = {}));
module.exports = value;

},{}],13:[function(require,module,exports){
/**
 * Created by Ryne on 24/02/2016.
 */
var stack = require('./stackManager');
var evaluation = require('./evaluation');
var vms;
(function (vms) {
    var Stack = stack.Stack;
    var Evaluation = evaluation.Evaluation;
    var VMS = (function () {
        function VMS(root, worlds) {
            this.evalu = new Evaluation(root, worlds, null);
            this.stack = new Stack();
            this.stack.push(this.evalu);
            this.world = worlds[0];
        }
        VMS.prototype.canAdvance = function () {
            return this.stack.notEmpty(); //TODO add notEmpty to stack why can't this file see members?
        };
        VMS.prototype.getEval = function () {
            return this.evalu;
        };
        VMS.prototype.getWorld = function () {
            return this.world;
        };
        VMS.prototype.advance = function () {
            if (this.canAdvance()) {
                if (this.stack.top().isDone()) {
                    // eval = stack.top();
                    var value = this.stack.pop().getVarMap().get([]); //TODO get value from evaluation?
                    if (this.stack.notEmpty()) {
                        this.stack.top().setResult(value);
                    }
                }
                else {
                    this.stack.top().advance(this);
                }
            }
        };
        return VMS;
    })();
    vms.VMS = VMS;
})(vms || (vms = {}));
module.exports = vms;

},{"./evaluation":4,"./stackManager":10}],14:[function(require,module,exports){
/**
 * Created by Jessica on 3/16/2016.
 */
var world = require('./world');
var workspace;
(function (workspace) {
    var World = world.World;
    var TurtleWorld = world.TurtleWorld;
    var Workspace = (function () {
        function Workspace() {
            this.world = new World();
            this.turtleWorld = new TurtleWorld();
        }
        Workspace.prototype.getWorld = function () {
            return this.world;
        };
        Workspace.prototype.getTurtleWorld = function () {
            return this.turtleWorld;
        };
        Workspace.prototype.setWorld = function (world) {
            this.world = world;
        };
        return Workspace;
    })();
    workspace.Workspace = Workspace;
})(workspace || (workspace = {}));
module.exports = workspace;

},{"./world":15}],15:[function(require,module,exports){
/**
 * Created by Jessica on 2/22/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var value = require('./value');
var seymour = require('./seymour');
var world;
(function (world) {
    var ObjectV = value.ObjectV;
    var Field = value.Field;
    var BuiltInV = value.BuiltInV;
    var Type = value.Type;
    var StringV = value.StringV;
    var Point = seymour.Point;
    var World = (function (_super) {
        __extends(World, _super);
        function World() {
            _super.call(this);
            console.log("World's fields array is length: " + this.fields.length);
            function addstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) + Number(rs.getVal())));
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " + " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var plus = new BuiltInV(addstep);
            var addf = new Field("+", plus, Type.NUMBER, true);
            this.fields.push(addf);
            function substep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) - Number(rs.getVal())));
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " - " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var sub = new BuiltInV(substep);
            var subf = new Field("-", sub, Type.NUMBER, true);
            this.fields.push(subf);
            function multstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) * Number(rs.getVal())));
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " * " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var mult = new BuiltInV(multstep);
            var multf = new Field("*", mult, Type.NUMBER, true);
            this.fields.push(multf);
            function divstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) / Number(rs.getVal())));
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " / " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var div = new BuiltInV(divstep);
            var divf = new Field("/", div, Type.NUMBER, true);
            this.fields.push(divf);
            function greaterthanstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) > Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " > " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var greaterthan = new BuiltInV(greaterthanstep);
            var greaterf = new Field(">", greaterthan, Type.BOOL, true);
            this.fields.push(greaterf);
            function greaterthanequalstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) >= Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaluating " + ls.getVal() + " >= " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var greaterthanequal = new BuiltInV(greaterthanequalstep);
            var greaterequalf = new Field(">=", greaterthanequal, Type.BOOL, true);
            this.fields.push(greaterequalf);
            function lessthanstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) < Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " < " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var lessthan = new BuiltInV(lessthanstep);
            var lessf = new Field("<", lessthan, Type.BOOL, true);
            this.fields.push(lessf);
            function lessthanequalstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length; i++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length; i++) {
                    //then check right side
                    if (!(rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")) {
                        isNum = false;
                    }
                }
                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) <= Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " <= " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }
            var lessequalthan = new BuiltInV(lessthanequalstep);
            var lessequalf = new Field("<=", lessequalthan, Type.BOOL, true);
            this.fields.push(lessequalf);
            function equalstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var v;
                if (ls.getVal() == rs.getVal()) {
                    v = new StringV("true");
                }
                else {
                    v = new StringV("false");
                }
                evalu.finishStep(v);
            }
            var equal = new BuiltInV(equalstep);
            var equalf = new Field("==", equal, Type.BOOL, true);
            this.fields.push(equalf);
            function andstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                var v;
                if (ls.getVal() != ("true" || "false")) {
                    throw new Error("Error evaulating " + ls.getVal() + " as a logical value!");
                }
                if (rs.getVal() != ("true" || "false")) {
                    throw new Error("Error evaulating " + rs.getVal() + " as a logical value!");
                }
                if (ls.getVal() == "true" && rs.getVal() == "true") {
                    v = new StringV("true");
                }
                else {
                    v = new StringV("false");
                }
                evalu.finishStep(v);
            }
            var and = new BuiltInV(andstep);
            var andf = new Field("&", and, Type.BOOL, true);
            this.fields.push(andf);
            function orstep(node, evalu) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);
                var ls = evalu.varmap.get(leftside);
                var rs = evalu.varmap.get(rightside);
                if (ls.getVal() != ("true" || "false")) {
                    throw new Error("Error evaulating " + ls.getVal() + " as a logical value!");
                }
                if (rs.getVal() != ("true" || "false")) {
                    throw new Error("Error evaulating " + rs.getVal() + " as a logical value!");
                }
                var v;
                if (ls.getVal() == "true" || rs.getVal() == "true") {
                    v = new StringV("true");
                }
                else {
                    v = new StringV("false");
                }
                evalu.finishStep(v);
            }
            var or = new BuiltInV(orstep);
            var orf = new Field("|", or, Type.BOOL, true);
            this.fields.push(orf);
        }
        //this.values = new ObjectV();
        World.prototype.numFields = function () {
            return this.fields.length;
        };
        World.prototype.addField = function (field) {
            this.fields.push(field);
        };
        World.prototype.deleteField = function (fieldName) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() === fieldName) {
                    this.fields.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        World.prototype.getField = function (fieldName) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() === fieldName) {
                    return this.fields[i];
                }
            }
            return null;
        };
        return World;
    })(ObjectV);
    world.World = World;
    var TurtleFields = (function () {
        function TurtleFields() {
            // Defining the world to view mapping
            this.zoom = 1;
            this.worldWidth = 1024;
            this.worldHeight = 768;
            // The turtle
            this.posn = new Point(0, 0);
            // Invariant: The orientation is in [0,360)
            this.orientation = 0.0;
            this.visible = true;
            this.penIsDown = false;
            // The segments
            this.segments = new Array();
        }
        // The canvas
        //private canv : HTMLCanvasElement = document.createElement('canvas');
        TurtleFields.prototype.getpenIsDown = function () {
            return this.penIsDown;
        };
        TurtleFields.prototype.setpenIsDown = function (penIsDown) {
            this.penIsDown = penIsDown;
        };
        TurtleFields.prototype.getZoom = function () {
            return this.zoom;
        };
        TurtleFields.prototype.setZoom = function (zoom) {
            this.zoom = zoom;
        };
        TurtleFields.prototype.getWorldWidth = function () {
            return this.worldWidth;
        };
        TurtleFields.prototype.setWorldWidth = function (worldWidth) {
            this.worldWidth = worldWidth;
        };
        TurtleFields.prototype.getWorldHeight = function () {
            return this.worldHeight;
        };
        TurtleFields.prototype.setWorldHeight = function (worldHeight) {
            this.worldHeight = worldHeight;
        };
        TurtleFields.prototype.getPosn = function () {
            return this.posn;
        };
        TurtleFields.prototype.setPosn = function (posn) {
            this.posn = posn;
        };
        TurtleFields.prototype.getOrientation = function () {
            return this.orientation;
        };
        TurtleFields.prototype.setOrientation = function (orientation) {
            this.orientation = orientation;
        };
        TurtleFields.prototype.getVisible = function () {
            return this.visible;
        };
        TurtleFields.prototype.setVisible = function (visible) {
            this.visible = visible;
        };
        TurtleFields.prototype.getSegments = function () {
            return this.segments;
        };
        TurtleFields.prototype.setSegments = function (segments) {
            this.segments = segments;
        };
        TurtleFields.prototype.world2View = function (p, viewWidth, viewHeight) {
            var hscale = viewWidth / this.worldWidth * this.zoom;
            var vscale = viewHeight / this.worldHeight * this.zoom;
            var x = p.x() * hscale + viewWidth / 2;
            var y = p.y() * vscale + viewHeight / 2;
            return new Point(x, y);
        };
        return TurtleFields;
    })();
    world.TurtleFields = TurtleFields;
    var TurtleWorld = (function (_super) {
        __extends(TurtleWorld, _super);
        function TurtleWorld() {
            _super.call(this);
            console.log("World's fields array is length: " + this.fields.length);
            //mutators
            var pen = new BuiltInV(this.penUp);
            var penf = new Field("penup", pen, Type.NUMBER, true);
            this.fields.push(penf);
            var forw = new BuiltInV(this.forward);
            var forwardf = new Field("forward", forw, Type.NUMBER, true);
            this.fields.push(forwardf);
            var right = new BuiltInV(this.right);
            var rightf = new Field("right", right, Type.NUMBER, true);
            this.fields.push(rightf);
            var left = new BuiltInV(this.left);
            var leftf = new Field("left", left, Type.NUMBER, true);
            this.fields.push(leftf);
            var clear = new BuiltInV(this.clear);
            var clearf = new Field("clear", clear, Type.NUMBER, true);
            this.fields.push(clearf);
            var show = new BuiltInV(this.show);
            var showf = new Field("show", show, Type.NUMBER, true);
            this.fields.push(showf);
            var hide = new BuiltInV(this.hide);
            var hidef = new Field("hide", hide, Type.NUMBER, true);
            this.fields.push(hidef);
        }
        TurtleWorld.prototype.forward = function (node, evalu) {
            var valuepath = evalu.getPending().concat([0]);
            var val = evalu.varmap.get(valuepath);
            var isNum = true;
            for (var i = 0; i < val.getVal().length; i++) {
                //then check right side
                if (!(val.getVal().charAt(i) == "0" || val.getVal().charAt(i) == "1"
                    || val.getVal().charAt(i) == "2" || val.getVal().charAt(i) == "3"
                    || val.getVal().charAt(i) == "4" || val.getVal().charAt(i) == "5"
                    || val.getVal().charAt(i) == "6" || val.getVal().charAt(i) == "7"
                    || val.getVal().charAt(i) == "8" || val.getVal().charAt(i) == "9"
                    || val.getVal().charAt(0) == "-")) {
                    isNum = false;
                }
            }
            if (isNum) {
                var theta = evalu.getTurtleFields().getOrientation() / 180.0 * Math.PI;
                var newx = evalu.getTurtleFields().getPosn().x() + Number(val.getVal()) * Math.cos(theta);
                var newy = evalu.getTurtleFields().getPosn().y() + Number(val.getVal()) * Math.sin(theta);
                var newPosn = new Point(newx, newy);
                if (evalu.getTurtleFields().getpenIsDown()) {
                    evalu.getTurtleFields().getSegments().push({ p0: evalu.getTurtleFields().getPosn(), p1: newPosn });
                }
                ;
                evalu.getTurtleFields().setPosn(newPosn);
                evalu.finishStep(val);
            }
            else {
                throw new Error("Error evaluating " + val.getVal() + "! Make sure this value is a number.");
            }
        };
        TurtleWorld.prototype.clear = function (node, evalu) {
            evalu.getTurtleFields().setSegments(new Array());
            evalu.finishStep(new StringV(""));
        };
        TurtleWorld.prototype.right = function (node, evalu) {
            var valuepath = evalu.getPending().concat([0]);
            var val = evalu.varmap.get(valuepath);
            var isNum = true;
            for (var i = 0; i < val.getVal().length; i++) {
                //then check right side
                if (!(val.getVal().charAt(i) == "0" || val.getVal().charAt(i) == "1"
                    || val.getVal().charAt(i) == "2" || val.getVal().charAt(i) == "3"
                    || val.getVal().charAt(i) == "4" || val.getVal().charAt(i) == "5"
                    || val.getVal().charAt(i) == "6" || val.getVal().charAt(i) == "7"
                    || val.getVal().charAt(i) == "8" || val.getVal().charAt(i) == "9"
                    || val.getVal().charAt(0) == "-")) {
                    isNum = false;
                }
            }
            if (isNum) {
                var r = (evalu.getTurtleFields().getOrientation() + Number(val.getVal())) % 360;
                while (r < 0)
                    r += 360; // Once should be enough. Note that if r == -0 to start then it equals +360 to end!
                while (r >= 360)
                    r -= 360; // Once should be enough.
                evalu.getTurtleFields().setOrientation(r);
                evalu.finishStep(val);
            }
            else {
                throw new Error("Error evaluating " + val.getVal() + "! Make sure this value is a number.");
            }
        };
        TurtleWorld.prototype.left = function (node, evalu) {
            var valuepath = evalu.getPending().concat([0]);
            var val = evalu.varmap.get(valuepath);
            var isNum = true;
            for (var i = 0; i < val.getVal().length; i++) {
                //then check right side
                if (!(val.getVal().charAt(i) == "0" || val.getVal().charAt(i) == "1"
                    || val.getVal().charAt(i) == "2" || val.getVal().charAt(i) == "3"
                    || val.getVal().charAt(i) == "4" || val.getVal().charAt(i) == "5"
                    || val.getVal().charAt(i) == "6" || val.getVal().charAt(i) == "7"
                    || val.getVal().charAt(i) == "8" || val.getVal().charAt(i) == "9"
                    || val.getVal().charAt(0) == "-")) {
                    isNum = false;
                }
            }
            if (isNum) {
                var l = (evalu.getTurtleFields().getOrientation() - Number(val.getVal())) % 360;
                while (l < 0)
                    l += 360; // Once should be enough. Note that if r == -0 to start then it equals +360 to end!
                while (l >= 360)
                    l -= 360; // Once should be enough.
                evalu.getTurtleFields().setOrientation(l);
                evalu.finishStep(val);
            }
            else {
                throw new Error("Error evaluating " + val.getVal() + "! Make sure this value is a number.");
            }
        };
        TurtleWorld.prototype.penUp = function (node, evalu) {
            var valuepath = evalu.getPending().concat([0]);
            var val = evalu.varmap.get(valuepath);
            if (val.getVal() == "true") {
                evalu.getTurtleFields().setpenIsDown(true);
                evalu.finishStep(val);
            }
            else if (val.getVal() == "false") {
                evalu.getTurtleFields().setpenIsDown(false);
                evalu.finishStep(val);
            }
            else {
                throw new Error("Error evaulating " + val.getVal() + " as a logical value!");
            }
        };
        TurtleWorld.prototype.hide = function (node, evalu) {
            evalu.getTurtleFields().setVisible(false);
            evalu.finishStep(new StringV(""));
        };
        TurtleWorld.prototype.show = function (node, evalu) {
            evalu.getTurtleFields().setVisible(true);
            evalu.finishStep(new StringV(""));
        };
        return TurtleWorld;
    })(ObjectV);
    world.TurtleWorld = TurtleWorld;
})(world || (world = {}));
module.exports = world;

},{"./seymour":9,"./value":12}]},{},[6])(6)
});