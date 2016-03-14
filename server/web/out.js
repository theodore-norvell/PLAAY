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
        None.prototype.toString = function () { return "None"; };
        return None;
    })();
    collections.None = None;
    function some(a) {
        return new Some(a);
    }
    collections.some = some;
    function none() { return new None(); }
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
/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />
var collections = require('./collections');
var assert = require('./assert');
var pnode = require('./pnode');
var pnodeEdits = require('./pnodeEdits');
var treeManager = require('./treeManager');
var mkHTML;
(function (mkHTML) {
    var list = collections.list;
    var TreeManager = treeManager.TreeManager;
    var undostack = [];
    var redostack = [];
    var currentSelection;
    var root = pnode.mkExprSeq([]);
    var path = list;
    var tree = new TreeManager();
    var select = new pnodeEdits.Selection(root, path(), 0, 0);
    var replace = 1;
    currentSelection = select;
    function onLoad() {
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
            window.location.href = "http://localhost:63342/PLAAY/typescriptSrc/playground.html";
        };
        var trash = document.createElement("div");
        trash.setAttribute("id", "trash");
        trash.setAttribute("class", "trash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);
        //creates side bar
        var sidebar = document.createElement("div");
        sidebar.setAttribute("id", "sidebar");
        sidebar.setAttribute("class", "sidebar");
        document.getElementById("body").appendChild(sidebar);
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
                "<form name='saveProgramTree' onSubmit='return mkHTML.savePrograms()' method='get'>" +
                "Program Name: <input type='text' name='programname'><br>" +
                "<input type='submit' value='Submit Program'>" +
                "</form></div>");
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
        var stringlitblock = document.createElement("div");
        stringlitblock.setAttribute("id", "stringliteral");
        stringlitblock.setAttribute("class", "block V palette");
        stringlitblock.textContent = "String Literal";
        document.getElementById("sidebar").appendChild(stringlitblock);
        var list = document.createElement("datalist");
        list.setAttribute("id", "oplist");
        var optionplus = document.createElement("option");
        optionplus.value = "+";
        var optionminus = document.createElement("option");
        optionminus.value = "-";
        var optionmul = document.createElement("option");
        optionmul.value = "x";
        var optiondiv = document.createElement("option");
        optiondiv.value = "/";
        list.appendChild(optionplus);
        list.appendChild(optionminus);
        list.appendChild(optionmul);
        list.appendChild(optiondiv);
        document.getElementById("body").appendChild(list);
        //creates container for code
        var container = document.createElement("div");
        container.setAttribute("id", "container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);
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
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                //$(ui.draggable).clone().appendTo($(this));
            }
        });
        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance: 'pointer',
            drop: function (event, ui) {
                ui.draggable.remove();
            }
        });
        //$(".droppable" ).hover(function(e) {
        //    $(this).addClass("hover");
        //}, function (e) {
        //    $(this).removeClass("hover");
        //});
        //clickDiv();
        enterList();
    }
    mkHTML.onLoad = onLoad;
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
        var response = $.get("/SavePrograms", { username: currentUser }, function () {
            console.log(response.responseText);
        });
        return false;
    }
    mkHTML.getPrograms = getPrograms;
    function savePrograms() {
        var currentUser = $('#userSettings :input').val();
        var programName = $('form[name="saveProgramTree"] :input[name="programname"]').val();
        var currentSel = currentSelection;
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
        children.appendChild(traverseAndBuild(select.root(), select.root().count()));
        $(".droppable").droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                //$(ui.draggable).clone().appendTo($(this));
            }
        });
        //clickDiv();
        enterList();
    }
    mkHTML.generateHTML = generateHTML;
    function enterList() {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                var text = $(this).val();
                getPathToNode(currentSelection, $(this));
                $(this).replaceWith('<div class="var H click">' + text + '</div>');
                $(".click").click(function () {
                    $(this).replaceWith('<input type="text" class="op H input" list="oplist">');
                    enterList();
                });
            }
        });
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert: 'invalid'
        });
    }
    /*function clickDiv()
    {
        //var self = $(this);
        $(".click").click(function () {
            var label = $(this).attr("class");
            if (/var/i.test(label)) {
                $(this).replaceWith('<input type="text" class="var H input">');
                $(".click").keyup(function (e) {
                    if (e.keyCode == 13) {
                        var text = $(this).val();
                        $(this).replaceWith('<div class="var H click">' + text + '</div>');
                        clickDiv();
                        getPathToNode(currentSelection, $(this));
                    }
                });
            }
            else if (/stringLiteral/i.test(label)) {
                $(this).replaceWith('<input type="text" class="stringLiteral H input">');
                $(".input").keyup(function (e) {
                    if (e.keyCode == 13) {
                        var text = $(this).val();
                        $(this).replaceWith('<div class="stringLiteral H clickstring">' + text + '</div>');
                        clickDiv();
                        getPathToNode(currentSelection, $(this));
                    }
                });
            }
        });
    }*/
    function getPathToNode(select, self) {
        var array = [];
        var anchor;
        var focus;
        console.log(self.attr("data-childNumber"));
        var parent = $(self);
        var child = Number(parent.attr("data-childNumber"));
        if (isNaN(child)) {
            var index = parent.index();
            parent = parent.parent();
            var num = parent.children().eq(index).prevAll(".dropZone").length;
            child = Number(parent.attr("data-childNumber"));
            var place = index - num;
            anchor = place;
            focus = anchor;
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
    function traverseAndBuild(node, childNumber) {
        var children = new Array();
        for (var i = 0; i < node.count(); i++) {
            children.push(traverseAndBuild(node.child(i), i));
        }
        return buildHTML(node, children, childNumber);
    }
    function buildHTML(node, children, childNumber) {
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
            ifbox.setAttribute("class", "ifBox V workplace canDrag");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox;
        }
        else if (label.match("seq")) {
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
        else if (label.match("expPH")) {
            var PHBox = document.createElement("div");
            PHBox.setAttribute("class", "placeHolder V");
            //PHBox.setAttribute("data-childNumber", childNumber.toString());
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
            whileBox.setAttribute("class", "whileBox V workplace canDrag");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);
            return whileBox;
        }
        else if (label.match("callWorld")) {
            var WorldBox = document.createElement("div");
            WorldBox.setAttribute("class", "callWorld H canDrag");
            WorldBox.setAttribute("data-childNumber", childNumber.toString());
            WorldBox.setAttribute("type", "text");
            WorldBox.setAttribute("list", "oplist");
            var op = document.createElement("input");
            op.setAttribute("class", "var H input");
            op.setAttribute("type", "text");
            op.setAttribute("list", "oplist");
            WorldBox.appendChild(children[0]);
            WorldBox.appendChild(op);
            WorldBox.appendChild(children[1]);
            return WorldBox;
        }
        else if (label.match("assign")) {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "assign H canDrag");
            AssignBox.setAttribute("data-childNumber", childNumber.toString());
            AssignBox.textContent = ":=";
            var equals = document.createElement("div");
            equals.setAttribute("class", "var H");
            equals.textContent = ":=";
            AssignBox.appendChild(children[0]);
            AssignBox.appendChild(equals);
            AssignBox.appendChild(children[1]);
            return AssignBox;
        }
        else if (label.match("lambda")) {
            var lambdahead = document.createElement("div");
            lambdahead.setAttribute("class", "lambdaHeader V");
            lambdahead.appendChild(children[0]);
            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox");
            doBox.appendChild(children[1]);
            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V");
            LambdaBox.appendChild(lambdahead);
            LambdaBox.appendChild(doBox);
            return LambdaBox;
        }
        else if (label.match("null")) {
            var NullBox = document.createElement("div");
            NullBox.setAttribute("class", "nullLiteral H");
            NullBox.textContent = "-";
            return NullBox;
        }
        else if (label.match("var")) {
            var VarBox = document.createElement("div");
            VarBox.setAttribute("class", "var H input");
            return VarBox;
        }
        else if (label.match("stringLiteral")) {
            var StringBox = document.createElement("div");
            StringBox.setAttribute("class", "stringLiteral H input");
            return StringBox;
        }
    }
})(mkHTML || (mkHTML = {}));
module.exports = mkHTML;

},{"./assert":1,"./collections":2,"./pnode":5,"./pnodeEdits":6,"./treeManager":7}],5:[function(require,module,exports){
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
        ExprLabel.prototype.isValid = function (children) {
            return true;
        };
        ExprLabel.prototype.getClass = function () {
            return ExprNode;
        };
        ExprLabel.prototype.changeValue = function (newString) {
            return new None();
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
        // Singleton
        TypeLabel.theTypeLabel = new TypeLabel();
        return TypeLabel;
    })();
    pnode.TypeLabel = TypeLabel;
    //Variable
    var VariableLabel = (function () {
        /*private*/
        function VariableLabel(name) {
            this._val = name;
        }
        VariableLabel.prototype.isValid = function (children) {
            if (children.length != 0)
                return false;
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
        VariableLabel.theVariableLabel = new VariableLabel("");
        return VariableLabel;
    })();
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
            if (this.con = false) {
                var newLabel = new NumberLiteralLabel(newString);
                return new Some(newLabel);
            }
            return new None();
        };
        // Singleton
        AssignLabel.theAssignLabel = new AssignLabel();
        return AssignLabel;
    })(ExprLabel);
    pnode.AssignLabel = AssignLabel;
    //Arithmetic Labels
    var callWorldLabel = (function () {
        /*private*/
        function callWorldLabel(name) {
            this._val = name;
        }
        callWorldLabel.prototype.isValid = function (children) {
            return children.every(function (c) { return c.isExprNode(); });
        };
        callWorldLabel.prototype.getClass = function () {
            return ExprNode;
        };
        callWorldLabel.prototype.toString = function () {
            return "callWorld";
        };
        callWorldLabel.prototype.getVal = function () {
            return this._val;
        };
        callWorldLabel.prototype.changeValue = function (newString) {
            if (newString.match("+") || newString.match("*") || newString.match("-") || newString.match("/")) {
                var newLabel = new callWorldLabel(newString);
                return new Some(newLabel);
            }
            return new None();
        };
        callWorldLabel.theCallWorldLabel = new callWorldLabel("");
        return callWorldLabel;
    })();
    pnode.callWorldLabel = callWorldLabel;
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
            return TypeNode;
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
        // Singleton
        WhileLabel.theWhileLabel = new WhileLabel();
        return WhileLabel;
    })(ExprLabel);
    pnode.WhileLabel = WhileLabel;
    //Const Labels
    var StringConstLabel = (function () {
        function StringConstLabel(val) {
            this._val = val;
        }
        StringConstLabel.prototype.getVal = function () {
            return this._val;
        };
        StringConstLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        StringConstLabel.prototype.getClass = function () {
            return ExprNode;
        };
        //constant can't be changed
        StringConstLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        StringConstLabel.prototype.toString = function () {
            return "string[" + this._val + "]";
        };
        return StringConstLabel;
    })();
    pnode.StringConstLabel = StringConstLabel;
    var NumberConstLabel = (function () {
        function NumberConstLabel(val) {
            this._val = val;
        }
        NumberConstLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        NumberConstLabel.prototype.getClass = function () {
            return ExprNode;
        };
        NumberConstLabel.prototype.getVal = function () {
            return this._val;
        };
        //constant can't be changed
        NumberConstLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        NumberConstLabel.prototype.toString = function () {
            return "string[" + this._val + "]";
        }; //will this work in TS?
        return NumberConstLabel;
    })();
    pnode.NumberConstLabel = NumberConstLabel;
    var BooleanConstLabel = (function () {
        function BooleanConstLabel(val) {
            this._val = val;
        }
        BooleanConstLabel.prototype.getVal = function () {
            return this._val;
        };
        BooleanConstLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        BooleanConstLabel.prototype.getClass = function () {
            return ExprNode;
        };
        //constant can't be changed
        BooleanConstLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        BooleanConstLabel.prototype.toString = function () {
            return "string[" + this._val + "]";
        }; //will this work in TS?
        return BooleanConstLabel;
    })();
    pnode.BooleanConstLabel = BooleanConstLabel;
    var AnyConstLabel = (function () {
        function AnyConstLabel(val) {
            this._val = val;
        }
        AnyConstLabel.prototype.val = function () {
            return this._val;
        };
        AnyConstLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        AnyConstLabel.prototype.getClass = function () {
            return ExprNode;
        };
        //constant can't be changed
        AnyConstLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        AnyConstLabel.prototype.getVal = function () {
            return this._val;
        };
        AnyConstLabel.prototype.toString = function () {
            return "string[" + this._val + "]";
        }; //will this work in TS?
        return AnyConstLabel;
    })();
    pnode.AnyConstLabel = AnyConstLabel;
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
        // Singleton
        NoTypeLabel.theNoTypeLabel = new NoTypeLabel();
        return NoTypeLabel;
    })();
    pnode.NoTypeLabel = NoTypeLabel;
    //Literal Labels
    var StringLiteralLabel = (function () {
        function StringLiteralLabel(val) {
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
        StringLiteralLabel.prototype.toString = function () { return "string"; };
        StringLiteralLabel.theStringLiteralLabel = new StringLiteralLabel("");
        return StringLiteralLabel;
    })();
    pnode.StringLiteralLabel = StringLiteralLabel;
    var NumberLiteralLabel = (function () {
        function NumberLiteralLabel(val) {
            this._val = val;
        }
        NumberLiteralLabel.prototype.val = function () { return this._val; };
        NumberLiteralLabel.prototype.isValid = function (children) {
            return children.length == 0;
            //TODO logic to make sure this is a number
        };
        NumberLiteralLabel.prototype.changeValue = function (newString) {
            var valid = true;
            for (var i = 0; i < newString.length; i++) {
                var character = newString.charAt(i);
                if (!(character.match("0") || character.match("1") ||
                    character.match("2") || character.match("3") ||
                    character.match("4") || character.match("5") ||
                    character.match("6") || character.match("7") ||
                    character.match("8") || character.match("9") ||
                    character.match("."))) {
                    valid = false;
                }
            }
            if (valid == true) {
                var newLabel = new NumberLiteralLabel(newString);
                return new Some(newLabel);
            }
            return new None();
        };
        NumberLiteralLabel.prototype.getVal = function () {
            return null;
        };
        NumberLiteralLabel.prototype.getClass = function () { return ExprNode; };
        NumberLiteralLabel.prototype.toString = function () { return "string[" + this._val + "]"; };
        NumberLiteralLabel.theNumberLiteralLabel = new NumberLiteralLabel("");
        return NumberLiteralLabel;
    })();
    pnode.NumberLiteralLabel = NumberLiteralLabel;
    var BooleanLiteralLabel = (function () {
        function BooleanLiteralLabel(val) {
            this._val = val;
        }
        BooleanLiteralLabel.prototype.val = function () { return this._val; };
        BooleanLiteralLabel.prototype.changeValue = function (newString) {
            if (newString.match("true") || newString.match("false")) {
                var newLabel = new BooleanLiteralLabel(newString);
                return new Some(newLabel);
            }
            return new None();
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
        BooleanLiteralLabel.prototype.toString = function () { return "string[" + this._val + "]"; };
        BooleanLiteralLabel.theBooleanLiteralLabel = new BooleanLiteralLabel("");
        return BooleanLiteralLabel;
    })();
    pnode.BooleanLiteralLabel = BooleanLiteralLabel;
    var NullLiteralLabel = (function () {
        function NullLiteralLabel() {
            this._val = "null";
        }
        NullLiteralLabel.prototype.val = function () { return null; };
        NullLiteralLabel.prototype.isValid = function (children) {
            return children.length == 0;
        };
        NullLiteralLabel.prototype.getClass = function () { return ExprNode; };
        NullLiteralLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        NullLiteralLabel.prototype.getVal = function () {
            return "null";
        };
        NullLiteralLabel.prototype.toString = function () { return "string[" + this._val + "]"; };
        NullLiteralLabel.theNullLiteralLabel = new NullLiteralLabel();
        return NullLiteralLabel;
    })();
    pnode.NullLiteralLabel = NullLiteralLabel;
    var MethodLabel = (function () {
        /*private*/
        function MethodLabel() {
        }
        MethodLabel.prototype.isValid = function (children) {
            return children.every(function (c) {
                return c.isTypeNode();
            });
        };
        MethodLabel.prototype.getClass = function () {
            return ExprNode;
        };
        MethodLabel.prototype.toString = function () {
            return "method";
        };
        MethodLabel.prototype.changeValue = function (newString) {
            return new None();
        };
        MethodLabel.prototype.getVal = function () {
            return null;
        };
        // Singleton
        MethodLabel.theMethodLabel = new MethodLabel();
        return MethodLabel;
    })();
    pnode.MethodLabel = MethodLabel;
    var CallLabel = (function () {
        /*private*/
        function CallLabel() {
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
            return this._id;
        };
        // Singleton
        CallLabel.theCallLabel = new CallLabel();
        return CallLabel;
    })();
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
    function mkStringConst(val) {
        return make(new StringConstLabel(val), []);
    }
    pnode.mkStringConst = mkStringConst;
    function mkNumberConst(val) {
        return make(new NumberConstLabel(val), []);
    }
    pnode.mkNumberConst = mkNumberConst; //
    function mkBooleanConst(val) {
        return make(new BooleanConstLabel(val), []);
    }
    pnode.mkBooleanConst = mkBooleanConst;
    function mkAnyConst(val) {
        return make(new AnyConstLabel(val), []);
    }
    pnode.mkAnyConst = mkAnyConst;
})(pnode || (pnode = {}));
module.exports = pnode;

},{"./assert":1,"./collections":2}],6:[function(require,module,exports){
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
            var edit = new pnodeEdits.InsertChildrenEdit([]);
            return edit.applyEdit(selection);
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
})(pnodeEdits || (pnodeEdits = {}));
module.exports = pnodeEdits;

},{"./assert":1,"./collections":2,"./edits":3}],7:[function(require,module,exports){
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
            var editResult = edit.applyEdit(sel);
            this.root = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            }).root();
            return this.root;
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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeWorldCallNode = function (selection) {
            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();
            var opt = pnode.tryMake(pnode.callWorldLabel.theCallWorldLabel, [left, right]);
            var worldcallnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([worldcallnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeCallNode = function (selection) {
            var opt = pnode.tryMake(pnode.CallLabel.theCallLabel, []);
            var callnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([callnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeTypeNode = function (selection) {
            var opt = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);
            var typenode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([typenode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeStringLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.StringLiteralLabel.theStringLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeNumberLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.NumberLiteralLabel.theNumberLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeBooleanLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.BooleanLiteralLabel.theBooleanLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.makeNullLiteralNode = function (selection) {
            var opt = pnode.tryMake(pnode.NullLiteralLabel.theNullLiteralLabel, []);
            var literalnode = opt.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Precondition violation on PNode.modify");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.changeNodeString = function (selection, newString) {
            var edit = new pnodeEdits.ChangeLabelEdit(newString);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Error applying edit to node");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        TreeManager.prototype.deleteNode = function (selection) {
            var edit = new pnodeEdits.DeleteEdit();
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(function (p) { return p; }, function () {
                assert.check(false, "Error applying edit to node");
                return null;
            });
            this.root = sel.root();
            return sel;
        };
        return TreeManager;
    })();
    treeManager.TreeManager = TreeManager;
})(treeManager || (treeManager = {}));
module.exports = treeManager;

},{"./assert":1,"./collections":2,"./pnode":5,"./pnodeEdits":6}]},{},[4])(4)
});