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
    function cons(head, rest) {
        return new Cons(head, rest);
    }
    collections.cons = cons;
    function nil() { return new Nil(); }
    collections.nil = nil;
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
var evaluation;
(function (evaluation) {
    var ExecStack = stack.execStack;
    var VarMap = stack.VarMap;
    var Evaluation = (function () {
        function Evaluation(root, obj) {
            this.root = root;
            this.pending = [];
            this.ready = false;
            this.stack = new ExecStack(obj);
            this.varmap = new VarMap();
        }
        Evaluation.prototype.getRoot = function () {
            return this.root;
        };
        Evaluation.prototype.getNext = function () {
            return this.next;
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
                this.varmap.put(this.pending, v);
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
                var topNode = this.root.get(this.pending);
                if (this.ready) {
                    topNode.label().step(vms);
                }
                else {
                    topNode.label().select(vms); //strategy.select
                }
            }
        };
        return Evaluation;
    })();
    evaluation.Evaluation = Evaluation;
})(evaluation || (evaluation = {}));
module.exports = evaluation;

},{"./stackManager":9}],5:[function(require,module,exports){
var vms = require('./vms');
var evaluationManager;
(function (evaluationManager) {
    var VMS = vms.VMS;
    var EvaluationManager = (function () {
        function EvaluationManager() {
        }
        EvaluationManager.prototype.PLAAY = function (root) {
            this._vms = new VMS(root, this.workspace.getWorld());
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

},{"./vms":11}],6:[function(require,module,exports){
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="vms.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />
var collections = require('./collections');
var assert = require('./assert');
var pnode = require('./pnode');
var pnodeEdits = require('./pnodeEdits');
var treeManager = require('./treeManager');
var evaluationManager = require('./evaluationManager');
var mkHTML;
(function (mkHTML) {
    var list = collections.list;
    var TreeManager = treeManager.TreeManager;
    var Selection = pnodeEdits.Selection;
    var fromJSONToPNode = pnode.fromJSONToPNode;
    var EvaluationManager = evaluationManager.EvaluationManager;
    var undostack = [];
    var redostack = [];
    var currentSelection;
    var draggedSelection;
    var draggedObject;
    var root = pnode.mkExprSeq([]);
    var path = list;
    var tree = new TreeManager();
    var evaluation = new EvaluationManager();
    var select = new pnodeEdits.Selection(root, path(), 0, 0);
    var highlighted = false;
    currentSelection = select;
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
        trash.setAttribute("class", "trash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);
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
        var nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "block V palette");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);
        var lambdablock = document.createElement("div");
        lambdablock.setAttribute("id", "lambda");
        lambdablock.setAttribute("class", "block V palette");
        lambdablock.textContent = "Lambda Expression";
        document.getElementById("sidebar").appendChild(lambdablock);
        var selectionblock = document.createElement("div");
        selectionblock.setAttribute("id", "selection");
        selectionblock.setAttribute("class", "block V palette");
        selectionblock.textContent = "Selection";
        document.getElementById("sidebar").appendChild(selectionblock);
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
            drop: function (event, ui) {
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                var selection = tree.deleteNode(currentSelection);
                selection.choose(function (sel) {
                    undostack.push(currentSelection);
                    currentSelection = sel;
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
        document.getElementById("edit").style.visibility = "visible";
        //var vms = evaluation.PLAAY(currentSelection.root());
        var children = document.getElementById("vms");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(currentSelection.root(), currentSelection.root().count(), true)); //vms.getEval().getRoot(), vms.getEval().getRoot().count()));
        $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();
        //highlight($(".vms"), vms.getEval().pending);
        //var root = document.getElementById("vms").children[0];
        //var array = [0,0];
        //setValueHTMLTest(root, array);
    }
    function editor() {
        document.getElementById("trash").style.visibility = "visible";
        document.getElementById("redo").style.visibility = "visible";
        document.getElementById("undo").style.visibility = "visible";
        document.getElementById("sidebar").style.visibility = "visible";
        document.getElementById("container").style.visibility = "visible";
        document.getElementById("play").style.visibility = "visible";
        document.getElementById("vms").style.visibility = "hidden";
        document.getElementById("stackbar").style.visibility = "hidden";
        document.getElementById("advance").style.visibility = "hidden";
        document.getElementById("edit").style.visibility = "hidden";
        $(".dropZone").show();
        $(".dropZoneSmall").show();
    }
    function setHTMLValueTest(root, array) {
        if (array.length == 0) {
            var self = $(root);
            self.replaceWith("<div>23</div>");
        }
        else {
            setHTMLValueTest(root.children[array.pop()], array);
        }
    }
    function highlight(parent, pending) {
        if (pending.length == 0) {
            var self = $(parent);
            if (self.index() == 0)
                $("<div class='selected V'></div>").prependTo(self.parent());
            else
                $("<div class='selected V'></div>").appendTo(self.parent());
            self.detach().appendTo($(".selected"));
        }
        else {
            highlight(parent.children[pending.pop()], pending);
        }
    }
    function setValAndHighlight() {
        //evaluation.next();
        if (!highlighted) {
            var root = document.getElementById("vms").children[0];
            var array = [0, 0];
            highlight(root, array);
            highlighted = true;
        }
        else {
            var root = document.getElementById("vms").children[0];
            var array = [0, 0];
            setHTMLValueTest(root, array);
            highlighted = false;
        }
    }
    function findInMap(root, varmap) {
        var newMap = varmap;
        for (var i = 0; i < newMap.size; i++) {
            setHTMLValue(root, newMap.entries[i]);
        }
    }
    function setHTMLValue(root, map) {
        if (map.getPath().length == 0) {
            var self = $(root);
            self.replaceWith("<div>23</div>");
        }
        else {
            setHTMLValue(root.children[map.getPath().pop()], map);
        }
    }
    function advance() {
        //evaluation.next();
        if (!highlighted) {
            var root = document.getElementById("vms").children[0];
            var array = [0, 0];
            highlight(root, array);
        }
        else {
            var root = document.getElementById("vms").children[0];
            var array = [0, 0];
            setHTMLValueTest(root, array);
        }
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
            if (/placeHolder/i.test(label)) {
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
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(opval);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[1]);
                WorldBox.appendChild(dropZone);
            }
            else if (node.label().getVal().length > 0) {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();
                WorldBox.appendChild(opval);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(dropZone);
                WorldBox.appendChild(children[1]);
                WorldBox.appendChild(dropZone);
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
            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox");
            doBox.appendChild(children[1]);
            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V droppable");
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
                dropZone.setAttribute("class", "dropZone H droppable");
                noType.appendChild(dropZone);
                if (i == children.length)
                    break;
                noType.appendChild(children[i]);
            }
            return noType;
        }
    }
})(mkHTML || (mkHTML = {}));
module.exports = mkHTML;

},{"./assert":1,"./collections":2,"./evaluationManager":5,"./pnode":7,"./pnodeEdits":8,"./treeManager":10}],7:[function(require,module,exports){
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collections = require('./collections');
var assert = require('./assert');
var pnode;
(function (pnode) {
    var Some = collections.Some;
    var None = collections.None;
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
            return this._children[i];
        };
        PNode.prototype.label = function () {
            return this._label;
        };
        //return the node at the path
        PNode.prototype.get = function (path) {
            if (path.length <= 0) {
            }
            if (path.length == 1) {
                var p = path.shift();
                return this.child[p];
            }
            else {
                var p = path.shift();
                var childNode = this.child[p];
                var node = childNode.get(path);
                return node;
            }
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
        if (stack == null) {
            return null;
        }
        else {
            for (var i = 0; i < stack.top().fields.length; i++) {
                if (stack.top().fields[i].name.match(varName.toString())) {
                    return stack.top().fields[i];
                }
            }
        }
        return lookUp(varName, stack.next);
    }
    pnode.lookUp = lookUp;
    var lrStrategy = (function () {
        function lrStrategy() {
        }
        lrStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.pending;
            if (pending != null) {
                var node = evalu.root.get(pending);
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
                        evalu.pending = pending.concat([n]);
                        node.child[n].strategy.select(vms);
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
            var pending = evalu.pending;
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    //TODO how to highlight  look up the variable in the stack and highlight it.
                    if (evalu.getStack().inStack(label.getVal())) { } //error} //there is no variable in the stack with this name
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
        whileStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.pending;
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                }
            }
        };
        return whileStrategy;
    })();
    pnode.whileStrategy = whileStrategy;
    var ifStrategy = (function () {
        function ifStrategy() {
        }
        ifStrategy.prototype.select = function (vms, label) {
            var evalu = vms.stack.top();
            var pending = evalu.pending;
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
                                evalu.pending = thenPath;
                                node.children(1).label.select(vms);
                            }
                        }
                        else if (string.contents.match("false")) {
                            if (evalu.varmap.inMap(elsePath)) {
                                evalu.ready = true;
                            }
                            else {
                                evalu.pending = elsePath;
                                node.children(2).label().select(vms);
                            }
                        }
                        else { } //error
                    }
                    else {
                        evalu.pending = guardPath;
                        node.children(0).label().select(vms);
                    }
                }
            }
        };
        return ifStrategy;
    })();
    pnode.ifStrategy = ifStrategy;
    /* export class callStrategy implements nodeStrategy{
         select(){}
 
         step( vms : VMS, label : Label ){
             if( vms.stack.top().ready){
                 var eval = vms.stack.top();
                 if(eval.pending != null){
                     var node = eval.root.get(eval.pending);
                     if( node.label() == label ){
                         var functionPath = eval.pending ^ [0];
                         var c = eval.varmap.get( functionPath );
                         if (!c.isClosureV()){}//  error!
                         var c1 = <ClosureV>c;
                         var f : LambdaNode = c1.function;
 
                         argList : Array<PNode>;
 
                         for(var i = 0; i <)
                         var argList = [eval.varmap.get( eval.pending ^ [1] ),
                             eval.varmap.get( eval.pending ^ [2],.. ]//for all arguments TODO
 
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
                         newEval.pending = [];
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
                if (evalu.pending != null) {
                    var node = evalu.root.get(evalu.pending);
                    this.nodeStep(node, evalu);
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
        }
        ExprSeqLabel.prototype.isValid = function (children) {
            return children.every(function (c) {
                return c.isExprNode();
            });
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
        return TypeLabel;
    })();
    pnode.TypeLabel = TypeLabel;
    //Variable
    var VariableLabel = (function (_super) {
        __extends(VariableLabel, _super);
        /*private*/
        function VariableLabel(name) {
            _super.call(this);
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
            return new None();
        };
        VariableLabel.prototype.nodeStep = function (node, evalu) {
            var v = lookUp(name, evalu.stack).getValue(); //TODO not in pseudo code but would make sense to have this as a value
            //TODO how remove highlight from f
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
    var AssignLabel = (function (_super) {
        __extends(AssignLabel, _super);
        /*private*/
        function AssignLabel() {
            _super.call(this);
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
            //lValue = rValue;
            // evalu.finishStep(lValue);
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
        CallWorldLabel.prototype.nodeStep = function (node, evalu) {
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
    var LambdaLabel = (function (_super) {
        __extends(LambdaLabel, _super);
        /*private*/
        function LambdaLabel() {
            _super.call(this);
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
        LambdaLabel.prototype.nodeStep = function (node, evalu) {
        };
        LambdaLabel.prototype.toJSON = function () {
            return { kind: "LambdaLabel" };
        };
        LambdaLabel.fromJSON = function (json) {
            return LambdaLabel.theLambdaLabel;
        };
        // Singleton
        LambdaLabel.theLambdaLabel = new LambdaLabel();
        return LambdaLabel;
    })(ExprLabel);
    pnode.LambdaLabel = LambdaLabel;
    //While and If Labels
    var IfLabel = (function (_super) {
        __extends(IfLabel, _super);
        /*private*/
        function IfLabel() {
            _super.call(this);
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
            var guardPath = evalu.pending.concat([0]);
            var thenPath = evalu.pending.concat([1]);
            var elsePath = evalu.pending.concat([2]);
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
        CallLabel.prototype.nodeStep = function (node, evalu) {
        };
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
    //Placeholder Make
    function mkExprPH() {
        return make(ExprPHLabel.theExprPHLabel, []);
    }
    pnode.mkExprPH = mkExprPH;
    //Loop and If Make
    function mkIf(guard, thn, els) {
        return make(IfLabel.theIfLabel, [guard, thn, els]);
    }
    pnode.mkIf = mkIf;
    function mkWhile(cond, seq) {
        return make(WhileLabel.theWhileLabel, [cond, seq]);
    }
    pnode.mkWhile = mkWhile;
    function mkExprSeq(exprs) {
        return make(ExprSeqLabel.theExprSeqLabel, exprs);
    }
    pnode.mkExprSeq = mkExprSeq;
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

},{"./assert":1,"./collections":2}],8:[function(require,module,exports){
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
    var SwapNodeEdit = (function (_super) {
        __extends(SwapNodeEdit, _super);
        function SwapNodeEdit(firstSelection, secondSelection) {
            _super.call(this);
            this._firstSelection = firstSelection;
            this._secondSelection = secondSelection;
            this._newNode1 = this.getChildrenToSwap(firstSelection);
            this._newNode2 = this.getChildrenToSwap(secondSelection);
        }
        SwapNodeEdit.prototype.canApply = function () {
            return this.applyEdit().choose(function (a) { return true; }, function () { return false; });
        };
        SwapNodeEdit.prototype.getChildrenToSwap = function (selection) {
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
            var node = loop(selection.root(), selection.path(), start, end);
            return node;
        };
        SwapNodeEdit.prototype.applyEdit = function () {
            var edit1 = new pnodeEdits.InsertChildrenEdit(this._newNode1);
            var firstSel = edit1.applyEdit(this._secondSelection).choose(function (p) { return p; }, function () {
                assert.check(false, "Error applying edit to node");
                return null;
            });
            var sel = new Selection(firstSel._root, this._firstSelection.path(), this._firstSelection.anchor(), this._firstSelection.focus());
            var edit2 = new pnodeEdits.InsertChildrenEdit(this._newNode2);
            return edit2.applyEdit(sel);
        };
        return SwapNodeEdit;
    })(AbstractEdit);
    pnodeEdits.SwapNodeEdit = SwapNodeEdit;
})(pnodeEdits || (pnodeEdits = {}));
module.exports = pnodeEdits;

},{"./assert":1,"./collections":2,"./edits":3,"./pnode":7}],9:[function(require,module,exports){
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
        execStack.prototype.inStack = function (name) {
            for (var i = 0; i < this.obj.numFields(); i++) {
                if (name.match(this.obj.fields[i].getName().toString())) {
                    return true;
                }
            }
            var here = this.next.inStack(name);
            return here;
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
    /*   export class StackObject {
           next : StackObject;
           varmap : VarMap;
   
           constructor (name : String, value : String) {
               this.varmap = new VarMap();
               this.varmap.setName(name);
               this.varmap.setValue(value);
           }
   
   
           getNext(){
               return this.next;
           }
   
           getVarMap(){
               return this.varmap;
           }
   
           setNext(next : StackObject){
               this.next = next;
           }
           setVarMap(map : VarMap){
               this.varmap = map;
           }
       }
   */
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
            }
            if (this.samePath(tmp, p)) {
                return this.entries[i].getValue();
            }
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
                //                this.entries[this.size++] = new mapEntry(p, v); //would this go out of bounds for the array?
                this.entries.push(new mapEntry(p, v));
                this.size++;
            }
        };
        VarMap.prototype.remove = function (p) {
            for (var i = 0; i < this.size; i++) {
                var tmp = this.entries[i].getPath();
                if (this.samePath(tmp, p)) {
                    this.size--;
                    var j = i;
                    for (; j < this.size; j++) {
                        this.entries[j] = this.entries[j + 1]; //move all values down by one
                    }
                    this.entries[j] = null; //don't think this is necessary
                }
            }
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

},{}],10:[function(require,module,exports){
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
                //constants
                case "stringconstant":
                    break;
                case "numberconstant":
                    break;
                case "booleanconstant":
                    break;
                case "nullconstant":
                    break;
                //variables & variable manipulation
                case "var":
                    return this.makeVarNode(selection);
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
            }
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
            var header = pnode.mkExprSeq([]);
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
        TreeManager.prototype.changeNodeString = function (selection, newString) {
            var edit = new pnodeEdits.ChangeLabelEdit(newString);
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.deleteNode = function (selection) {
            var edit = new pnodeEdits.DeleteEdit();
            return edit.applyEdit(selection);
        };
        TreeManager.prototype.moveCopySwapEditList = function (oldSelection, newSelection) {
            var selectionList = [];
            var moveedit = new pnodeEdits.MoveNodeEdit(oldSelection);
            if (moveedit.canApply(newSelection)) {
                var sel = moveedit.applyEdit(newSelection);
                selectionList.push(["Moved", "Move", sel]);
            }
            var copyedit = new pnodeEdits.CopyNodeEdit(oldSelection);
            if (copyedit.canApply(newSelection)) {
                var sel = copyedit.applyEdit(newSelection);
                selectionList.push(['Copied', "Copy", sel]);
            }
            var swapedit = new pnodeEdits.SwapNodeEdit(oldSelection, newSelection);
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

},{"./assert":1,"./collections":2,"./pnode":7,"./pnodeEdits":8}],11:[function(require,module,exports){
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
        function VMS(root, world) {
            this.evalu = new Evaluation(root, world);
            this.stack = new Stack();
            this.stack.push(this.evalu);
            this.world = world;
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

},{"./evaluation":4,"./stackManager":9}]},{},[6])(6)
});