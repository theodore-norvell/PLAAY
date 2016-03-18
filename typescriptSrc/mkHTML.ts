/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

import collections = require( './collections' );
import assert = require( './assert' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require('./treeManager');

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    import PNode = pnode.PNode;
    import TreeManager = treeManager.TreeManager;
    import Selection = pnodeEdits.Selection;
    import fromJSONToPNode = pnode.fromJSONToPNode;

    var undostack = [];
    var redostack = [];
    var currentSelection;
    var draggedSelection;
    var draggedObject;

    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var tree = new TreeManager();
    var select = new pnodeEdits.Selection(root,path(),0,0);
    currentSelection = select;

    export function onLoad() : void {
        //creates undo/redo buttons
        const undoblock = document.createElement("div");
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

        const redoblock = document.createElement("div");
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

        const playbutton = document.createElement("div");
        playbutton.setAttribute("id", "play");
        playbutton.setAttribute("class", "play");
        playbutton.setAttribute("onclick", "play()");
        playbutton.textContent = "Play";
        document.getElementById("body").appendChild(playbutton);
        var play = document.getElementById("play");
        play.onclick = function play()
        {
            //localStorage.setItem("currentSelection", serialize(currentSelection));
            window.location.href = "http://localhost:63342/PLAAY/typescriptSrc/playground.html";
        };

        const trash = document.createElement("div");
        trash.setAttribute("id", "trash");
        trash.setAttribute("class", "trash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);

        //creates side bar
        const sidebar = document.createElement("div");
        sidebar.setAttribute("id", "sidebar");
        sidebar.setAttribute("class", "sidebar");
        document.getElementById("body").appendChild(sidebar);

        const ifblock = document.createElement("div");
        ifblock.setAttribute("id", "if");
        ifblock.setAttribute("class", "block V palette");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);


        const whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "block V palette");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);

        const varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "block V palette");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);

        const stringlitblock = document.createElement("div");
        stringlitblock.setAttribute("id", "stringliteral");
        stringlitblock.setAttribute("class", "block V palette");
        stringlitblock.textContent = "String Literal";
        document.getElementById("sidebar").appendChild(stringlitblock);

        const worldblock = document.createElement("div");
        worldblock.setAttribute("id", "worldcall");
        worldblock.setAttribute("class", "block V palette");
        worldblock.textContent = "Call World";
        document.getElementById("sidebar").appendChild(worldblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assign");
        assignmentblock.setAttribute("class", "block V palette");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        const userBar = document.createElement("div");
        userBar.setAttribute("id", "userBar");
        userBar.setAttribute("class", "userBar");
        document.getElementById("body").appendChild(userBar);

        const loginButton = document.createElement("div");
        loginButton.setAttribute("id", "login");
        loginButton.setAttribute("class", "userOptions");
        loginButton.textContent = "Login/Register";
        document.getElementById("userBar").appendChild(loginButton);

        const logoutButton = document.createElement("div");
        logoutButton.setAttribute("id", "logout");
        logoutButton.setAttribute("class", "userOptions");
        logoutButton.textContent = "Logout";
        document.getElementById("userBar").appendChild(logoutButton);
        $("#logout").hide();

        const userSettings = document.createElement("div");
        userSettings.setAttribute("id", "userSettings");
        userSettings.setAttribute("class", "userOptions");
        userSettings.textContent = "User Settings";
        document.getElementById("userBar").appendChild(userSettings);
        $("#userSettings").hide();

        const saveProgram = document.createElement("div");
        saveProgram.setAttribute("id", "saveProgram");
        saveProgram.setAttribute("class", "userOptions");
        saveProgram.textContent = "Save Program";
        document.getElementById("userBar").appendChild(saveProgram);
        $("#saveProgram").hide();


        const loadProgram = document.createElement("div");
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

        $('#saveProgram').click(function() {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='getProgramList'>" +
                "<form name='saveProgramTree' onSubmit='return mkHTML.savePrograms()' method='get'>" +
                "Program Name: <input type='text' name='programname'><br>" +
                "<input type='submit' value='Submit Program'>" +
                "</form></div>");
            mkHTML.getPrograms();
        });
        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "block V palette");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        const lambdablock = document.createElement("div");
        lambdablock.setAttribute("id", "lambda");
        lambdablock.setAttribute("class", "block V palette");
        lambdablock.textContent = "Lambda Expression";
        document.getElementById("sidebar").appendChild(lambdablock);

        const selectionblock = document.createElement("div");
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
        const container = document.createElement("div");
        container.setAttribute("id", "container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);

        const seq = document.createElement("div");
        seq.setAttribute("id", "seq");
        seq.setAttribute("data-childNumber", "-1");
        document.getElementById("container").appendChild(seq);

        //creates empty dropzone <div id="dropZone" class="dropZone H droppable"></div>
        const div = document.createElement("div");
        div.setAttribute("id", "dropZone");
        div.setAttribute("class", "dropZone H droppable");
        document.getElementById("seq").appendChild(div);

        $( ".palette" ).draggable({
            helper:"clone" ,
            start : function(event, ui){
                ui.helper.animate({
                    width: 40,
                    height: 40
                });
                draggedObject = $(this).attr("class");
            },
            cursorAt: {left:20, top:20},
            appendTo:"body"
        });

        $(".droppable").droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));

                //createDialog($(this), ui.draggable.attr("id"));

                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
        });

        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            drop: function(event, ui){
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                currentSelection = tree.deleteNode(currentSelection);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
        });
        //$(".droppable" ).hover(function(e) {
        //    $(this).addClass("hover");
        //}, function (e) {
        //    $(this).removeClass("hover");
        //});
        enterBox();
    }

    function createCopyDialog(selectionArray) {
        return $("<div></div>")
            .dialog({
                resizable: false,
                dialogClass: 'no-close success-dialog',
                modal: true,
                height: 75,
                width: 75,
                open: function(event, ui)
                {
                    var markup = selectionArray[0][0];
                    $(this).html(markup);

                    setTimeout(function() {
                        $('.ui-dialog-content').dialog('destroy');
                    },3000);
                },
                buttons: {
                    "Copy": function()
                    {
                        generateHTML(selectionArray[1][2]);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        $( this ).dialog( "destroy" );
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
                buttons: {
                    "Move": function()
                    {
                        var markup = selectionArray[0][0];
                        $(this).html(markup);

                        setTimeout(function() {
                            $('.ui-dialog-content').dialog('destroy');
                        },3000);
                    },
                    "Swap": function()
                    {
                        generateHTML(selectionArray[2][2]);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        $( this ).dialog( "destroy" );
                    }
                }
            });
    }

    export function loginUser(){
        console.log('login');
        var inputs = $('form[name="loginUser"] :input');
        var usr = $('form[name="loginUser"] :input[name="username"]').val();
        var psw = $('form[name="loginUser"] :input[name="password"]').val();
        console.log($('form[name="loginUser"] #usrname').val());
        var response = $.post("/Login",{username:usr,password:psw},
            function(){
                var respText = $.parseJSON(response.responseText);
                if (respText.result == "SUCCESS")
                {
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
                    //alert(respText.username);
                }
                else if (respText.result == "WRONGCREDENTIALS")
                {
                    alert("Wrong username/password, please try again.");
                }
                else if (respText.result == "ERROR")
                {
                    alert("An error has occurred, please try again later.");
                }

            });
        return false;
    }

    export function registerNewUser(){
        console.log('register');
        var usr = $('form[name="registerNewUser"] :input[name="username"]').val();
        var psw = $('form[name="registerNewUser"] :input[name="password"]').val();
        var pswCon = $('form[name="registerNewUser"] :input[name="passwordConfirm"]').val();
        if(psw !== pswCon)
        {
            alert("Passwords do not match, please confirm match.");
        }
        else
        {
            var response = $.post("/Register",{username:usr,password:psw},
                function(){
                    var respText = $.parseJSON(response.responseText);
                    if (respText.result == "SUCCESS")
                    {
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
                        //$("#userSettings").val(user);
                        //alert(respText.username);
                    }
                    else if (respText.result == "NAMETAKEN")
                    {
                        alert("Username is taken, please try another.");
                    }
                    else if (respText.result == "ERROR")
                    {
                        alert("An error has occurred, please try again.");
                    }

                });
        }
        return false;
    }
    export function editUser()
    {
        console.log('register');
        var currentUser = $('#userSettings :input').val();
        var usr = $('form[name="editUserInfo"] :input[name="username"]').val();
        var oldpsw = $('form[name="editUserInfo"] :input[name="oldpassword"]').val();
        var newpsw = $('form[name="editUserInfo"] :input[name="newpassword"]').val();
        var newpswCon = $('form[name="editUserInfo"] :input[name="confirmnewpassword"]').val();
        var email = $('form[name="editUserInfo"] :input[name="email"]').val();
        if(usr.length == 0 && oldpsw.length == 0 && email.length == 0)
        {
            alert("No fields filled. Please fill at least one field.")
        }
        else if(oldpsw.length > 0 && newpsw.length >0 && newpsw !== newpswCon)
        {
            alert("Passwords do not match, please confirm match.");
        }
        else
        {
            var response = $.post("/EditUser",{username:usr,password:oldpsw},
                function(){
                    var respText = $.parseJSON(response.responseText);
                    if (respText.result == "SUCCESS")
                    {
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
                        //$("#userSettings").val(user);
                        //alert(respText.username);
                    }
                    else if (respText.result == "NAMETAKEN")
                    {
                        alert("Username is taken, please try another.");
                    }
                    else if (respText.result == "ERROR")
                    {
                        alert("An error has occurred, please try again.");
                    }

                });
        }
        return false;
    }

    export function getPrograms()
    {
        var currentUser = $('#userSettings :input').val();
        var response = $.get("/SavePrograms",{username:currentUser},
            function(){
                console.log(response.responseText);
            });
        return false;
    }

    export function savePrograms()
    {
        var currentUser = $('#userSettings :input').val();
        var programName = $('form[name="saveProgramTree"] :input[name="programname"]').val();
        var currentSel = currentSelection;
        var response = $.post("/SavePrograms",{username:currentUser,programname:programName,program:currentSel},
            function(){
                console.log(response.responseText);
            });
        return false;
    }

    export function generateHTML(select:Selection)
    {
        currentSelection = select;
        var children = document.getElementById("container");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(select.root(), select.root().count()));

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            greedy: true,
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui)
            {
                var selectionArray = [];
                currentSelection = getPathToNode(currentSelection, $(this));
                if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && ((/ifBox/i.test($(this).attr("class")))
                    || (/lambdaBox/i.test($(this).attr("class"))) || (/whileBox/i.test($(this).attr("class")))
                    || (/callWorld/i.test($(this).attr("class"))) || (/assign/i.test($(this).attr("class")))))
                {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    generateHTML(selectionArray[0][2]);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    createSwapDialog(selectionArray);
                }
                else if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && (/dropZone/i.test($(this).attr("class"))))
                {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    generateHTML(selectionArray[0][2]);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    createCopyDialog(selectionArray);
                }
                else
                {
                    console.log(ui.draggable.attr("id"));
                    undostack.push(currentSelection);
                    currentSelection = tree.createNode(ui.draggable.attr("id") /*id*/, currentSelection);
                    generateHTML(currentSelection);
                    $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                }
            }
        });
        enterBox();
    }

    function enterBox()
    {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                var text = $(this).val();
                currentSelection = tree.changeNodeString(getPathToNode(currentSelection, $(this)), text);
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
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

                $(".click").click(function(){
                    var label = $(this).attr("class");
                    var val = $(this).attr("data-childNumber");
                    if (/var/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="var H input"' + 'data-childNumber="' + val + '">');
                    }
                    else if (/stringLiteral/i.test(label))
                    {
                        $(this).replaceWith('<input type="text" class="stringLiteral H input"'+'data-childNumber="' + val + '">');
                    }
                    else if(/op/i.test(label))
                    {
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
            revert:'invalid',
            start: function(event,ui){
                draggedObject = $(this).attr("class");
                draggedSelection = getPathToNode(currentSelection, $(this));
            }
        });
    }

    function getPathToNode(select:Selection, self) : Selection
    {
        var array = [];
        var anchor;
        var focus;

        var parent = $(self);
        var child = Number(parent.attr("data-childNumber"));

        if (isNaN(child))
        {
            var index = parent.index();
            parent = parent.parent();
            var num = parent.children().eq(index).prevAll(".dropZone").length;
            child = Number(parent.attr("data-childNumber"));
            var place = index - num;

            var label = parent.attr("class");
            if (/placeHolder/i.test(label))
            {
                anchor = child;
                focus = anchor + 1;
                parent = parent.parent();
                child = Number(parent.attr("data-childNumber"));
            }
            else
            {
                anchor = place;
                focus = anchor;
            }
        }
        else
        {
            if(/var/i.test(parent.attr("class")) || /stringLiteral/i.test(parent.attr("class")))
            {
                anchor = 0;
                focus = anchor;
            }
            else
            {
                if ((/ifBox/i.test(parent.attr("class"))) || (/lambdaBox/i.test(parent.attr("class"))) ||
                    (/whileBox/i.test(parent.attr("class"))) || (/callWorld/i.test(parent.attr("class")))
                    || (/assign/i.test(parent.attr("class")))) {
                    anchor = child;
                    focus = child + 1;
                    parent = parent.parent();
                    child = Number(parent.attr("data-childNumber"));
                }
                else
                {
                    anchor = child;
                    focus = anchor;
                }
            }
        }
        while (child != -1) {
            if (!isNaN(child))
            {
                array.push(Number(parent.attr("data-childNumber")));
            }
            parent = parent.parent();
            child = Number(parent.attr("data-childNumber"));
        }
        var tree = select.root();
        var path = list<number>();
        var i ;
        for( i = 0 ; i < array.length ; i++ )
            path = collections.cons( array[i], path ) ;

        return new pnodeEdits.Selection(tree, path, anchor, focus);
    }

    function serialize(select : Selection) : string
    {
        var json = pnode.fromPNodeToJSON(currentSelection.root());
        return json;
    }

    function unserialize(string:string) : Selection
    {
        var path = list<number>();
        var newSelection = new Selection(fromJSONToPNode(string),path,0,0)
        return newSelection;


    }

    function traverseAndBuild(node:PNode, childNumber: number ) : HTMLElement
    {
        var children = new Array<HTMLElement>() ;
        for(var i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuild(node.child(i), i) ) ;
        }
        return buildHTML(node, children, childNumber);
    }

    function buildHTML(node:PNode, children : Array<HTMLElement>, childNumber : number) : HTMLElement
    {
        var label = node.label().toString();
        if(label.match('if'))
        {
            assert.check( children.length == 3 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "ifGuardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var elsebox = document.createElement("div");
            elsebox.setAttribute("class", "elseBox H workplace");
            elsebox.appendChild( children[2] ) ;

            var ifbox = document.createElement("div");
            ifbox.setAttribute("data-childNumber", childNumber.toString());
            ifbox.setAttribute("class", "ifBox V workplace canDrag droppable");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox ;
        }
        else if(label.match("seq"))
        {
            var seqBox = document.createElement("div");
            seqBox.setAttribute( "class", "seqBox V" ) ;
            seqBox.setAttribute("data-childNumber", childNumber.toString());
            seqBox["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZone H droppable");
                seqBox.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                seqBox.appendChild( children[i] ) ;
            }

            return seqBox ;
        }
        else if(label.match("expPH"))
        {
            var PHBox = document.createElement("div");
            PHBox.setAttribute( "class", "placeHolder V" ) ;
            PHBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                PHBox.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                PHBox.appendChild( children[i] ) ;
            }

            return PHBox ;
        }
        else if(label.match("while"))
        {
            assert.check( children.length == 2 ) ;

            var guardbox = document.createElement("div");
            guardbox.setAttribute("class", "whileGuardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var whileBox = document.createElement("div");
            whileBox.setAttribute("data-childNumber", childNumber.toString());
            whileBox.setAttribute("class", "whileBox V workplace canDrag droppable");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);

            return whileBox;
        }
        else if(label.match("callWorld"))
        {
            var WorldBox = document.createElement("div");
            WorldBox.setAttribute("class", "callWorld H canDrag droppable" );
            WorldBox.setAttribute("data-childNumber", childNumber.toString());
            WorldBox.setAttribute("type", "text");
            WorldBox.setAttribute("list", "oplist");

            var dropZone = document.createElement("div");
            dropZone.setAttribute("class", "dropZoneSmall H droppable");

            if((node.label().getVal().match(/\+/gi) || node.label().getVal().match(/\-/gi)
                || node.label().getVal().match(/\*/gi) || node.label().getVal().match(/\//gi) || (node.label().getVal().match(/==/gi))
                || (node.label().getVal().match(/>/gi)) || (node.label().getVal().match(/</gi)) || (node.label().getVal().match(/>=/gi))
                || (node.label().getVal().match(/<=/gi)) || (node.label().getVal().match(/&/gi)) || (node.label().getVal().match(/\|/gi)) )
                && node.label().getVal().length > 0)
            {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();

                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(opval);
                WorldBox.appendChild(children[1]);
            }
            else if(node.label().getVal().length > 0)
            {
                var opval = document.createElement("div");
                opval.setAttribute("class", "op H click");
                opval.textContent = node.label().getVal();

                WorldBox.appendChild(opval);
                WorldBox.appendChild(children[0]);
                WorldBox.appendChild(children[1]);
            }
            else
            {
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
        else if(label.match("assign"))
        {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "assign H canDrag droppable" );
            AssignBox.setAttribute("data-childNumber", childNumber.toString());

            var equals = document.createElement("div");
            equals.setAttribute("class", "op H");
            equals.textContent = ":=";

            AssignBox.appendChild(children[0]);
            AssignBox.appendChild(equals);
            AssignBox.appendChild(children[1]);

            return AssignBox;
        }
        else if(label.match("lambda"))
        {
            var lambdahead = document.createElement("div");
            lambdahead.setAttribute("class", "lambdaHeader V ");
            lambdahead.appendChild( children[0] ) ;

            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox");
            doBox.appendChild( children[1] ) ;

            var LambdaBox = document.createElement("div");
            LambdaBox.setAttribute("class", "lambdaBox V droppable");

            LambdaBox.appendChild(lambdahead);
            LambdaBox.appendChild(doBox);

            return LambdaBox;
        }
        else if(label.match("null"))
        {
            var NullBox = document.createElement("div");
            NullBox.setAttribute("class", "nullLiteral H droppable");
            NullBox.textContent = "-";

            return NullBox;
        }
        else if (label.match("var"))
        {
            var VarBox;
            if (node.label().getVal().length > 0)
            {
                VarBox = document.createElement("div");
                VarBox.setAttribute("class", "var H click");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.textContent = node.label().getVal();
            }
            else
            {
                VarBox = document.createElement("input");
                VarBox.setAttribute("class", "var H input");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.setAttribute("type", "text");
                VarBox.textContent = "";
            }
            return VarBox;
        }
        else if (label.match("string"))
        {
            var StringBox;
            if (node.label().getVal().length > 0)
            {
                StringBox = document.createElement("div");
                StringBox.setAttribute("class", "stringLiteral H click");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.textContent = node.label().getVal();
            }
            else
            {
                StringBox = document.createElement("input");
                StringBox.setAttribute("class", "stringLiteral H input");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.setAttribute("type", "text");
                StringBox.textContent = "";
            }
            return StringBox;
        }
        else if(label.match("noType"))
        {
            var noType = document.createElement("div");
            noType.setAttribute( "class", "noReturnType V" ) ;
            noType.setAttribute("data-childNumber", childNumber.toString());
            noType["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZone H droppable");
                noType.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                noType.appendChild( children[i] ) ;
            }

            return noType ;
        }
    }
}

export = mkHTML ;