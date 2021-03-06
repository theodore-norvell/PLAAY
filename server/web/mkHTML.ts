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

    var undostack = [];
    var redostack = [];
    var currentSelection;

    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var tree = new TreeManager();
    var select = new pnodeEdits.Selection(root,path(),0,0);
    var replace = 1;
    currentSelection = select;

    export function onLoad() : void
    {
        //creates undo/redo buttons
        const undoblock = document.createElement("div");
        undoblock.setAttribute("id", "undo");
        undoblock.setAttribute("class","undo");
        undoblock.setAttribute("onclick", "undo()");
        undoblock.textContent = "Undo";
        document.getElementById("body").appendChild(undoblock);
        var undo = document.getElementById("undo");
        undo.onclick = function undo()
        {
            if(undostack.length != 0)
            {
                redostack.push(currentSelection);
                currentSelection = undostack.pop();
                generateHTML(currentSelection);
            }
        };

        const redoblock = document.createElement("div");
        redoblock.setAttribute("id", "redo");
        redoblock.setAttribute("class","redo");
        redoblock.setAttribute("onclick", "redo()");
        redoblock.textContent = "Redo";
        document.getElementById("body").appendChild(redoblock);
        var redo = document.getElementById("redo");
        redo.onclick = function redo()
        {
            if(redostack.length != 0)
            {
                undostack.push(currentSelection);
                currentSelection = redostack.pop();
                generateHTML(currentSelection);
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
            window.location.href = "http://localhost:63342/PLAAY/typescriptSrc/playground.html";
        };

        const trash = document.createElement("div");
        trash.setAttribute("id","trash");
        trash.setAttribute("class", "trash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);

        //creates side bar
        const sidebar = document.createElement("div");
        sidebar.setAttribute("id","sidebar");
        sidebar.setAttribute("class","sidebar");
        document.getElementById("body").appendChild(sidebar);

        const ifblock = document.createElement("div");
        ifblock.setAttribute("id","if");
        ifblock.setAttribute("class","ifBox V palette");
        ifblock.textContent = "If";
        document.getElementById("sidebar").appendChild(ifblock);


        const whileblock = document.createElement("div");
        whileblock.setAttribute("id", "while");
        whileblock.setAttribute("class", "whileBox V palette");
        whileblock.textContent = "While";
        document.getElementById("sidebar").appendChild(whileblock);

        const varblock = document.createElement("div");
        varblock.setAttribute("id", "var");
        varblock.setAttribute("class", "varBox V palette");
        varblock.textContent = "Var";
        document.getElementById("sidebar").appendChild(varblock);

        const assignmentblock = document.createElement("div");
        assignmentblock.setAttribute("id", "assign");
        assignmentblock.setAttribute("class", "assignmentBox V palette");
        assignmentblock.textContent = "Assignment";
        document.getElementById("sidebar").appendChild(assignmentblock);

        const userBar = document.createElement("div");
        userBar.setAttribute("id","userBar");
        userBar.setAttribute("class","userBar");
        document.getElementById("body").appendChild(userBar);

        const loginButton = document.createElement("div");
        loginButton.setAttribute("id","login");
        loginButton.setAttribute("class","login");
        loginButton.textContent = "Login/Register";
        document.getElementById("userBar").appendChild(loginButton);

        const logoutButton = document.createElement("div");
        logoutButton.setAttribute("id","logout");
        logoutButton.setAttribute("class","userOptions");
        logoutButton.textContent = "Logout";
        document.getElementById("userBar").appendChild(logoutButton);
        $("#logout").hide();

        const userSettings = document.createElement("div");
        userSettings.setAttribute("id","userSettings");
        userSettings.setAttribute("class","userOptions");
        userSettings.textContent = "User Settings";
        document.getElementById("userBar").appendChild(userSettings);
        $("#userSettings").hide();

        const saveProgram = document.createElement("div");
        saveProgram.setAttribute("id","saveProgram");
        saveProgram.setAttribute("class","userOptions");
        saveProgram.textContent = "Save Program";
        document.getElementById("userBar").appendChild(saveProgram);
        $("#saveProgram").hide();


        const loadProgram = document.createElement("div");
        loadProgram.setAttribute("id","loadProgram");
        loadProgram.setAttribute("class","userOptions");
        loadProgram.textContent = "Load Program";
        document.getElementById("userBar").appendChild(loadProgram);
        $("#loadProgram").hide();

        $('#login').click(function(){
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
            $('.closewindow').click(function()
            {
                $("#dimScreen").remove();
            });
        });

        $('#userSettings').click(function(){
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
            $('.closewindow').click(function()
            {
                $("#dimScreen").remove();
            });
        });

        $('#logout').click(function()
        {
            $("#login").show();
            $("#userSettings").hide();
            $("#saveProgram").hide();
            $("#loadProgram").hide();
            $("#userSettings :input").remove();
            $("#logout").hide();
        });
        const thisblock = document.createElement("div");
        thisblock.setAttribute("id", "this");
        thisblock.setAttribute("class", "thisBox V palette");
        thisblock.textContent = "This";
        document.getElementById("sidebar").appendChild(thisblock);

        const nullblock = document.createElement("div");
        nullblock.setAttribute("id", "null");
        nullblock.setAttribute("class", "nullBox V palette");
        nullblock.textContent = "Null";
        document.getElementById("sidebar").appendChild(nullblock);

        //creates container for code
        const container = document.createElement("div");
        container.setAttribute("id","container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);

        //creates empty dropzone <div id="dropZone" class="dropZone H droppable"></div>
        const div = document.createElement("div") ;
        div.setAttribute("id", "dropZone");
        div.setAttribute("class", "dropZone H droppable") ;
        div["childCount"] = 0 ;
        document.getElementById("container").appendChild( div ) ;

        $( ".palette" ).draggable({
            helper:"clone" ,
            appendTo:"body"
        });

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                //createHTML(ui.draggable.attr("id"), this);
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

        $( ".trash").droppable({
            accept:".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            drop: function(event, ui){
                ui.draggable.remove();
            }
        });
        //$(".droppable" ).hover(function(e) {
        //    $(this).addClass("hover");
        //}, function (e) {
        //    $(this).removeClass("hover");
        //});
        $(".click").click(function(){
            $(this).replaceWith('<input type="text" width="5" class="var H input">')
        });

        $(".input").keyup(function(e){
            if(e.keyCode == 13)
            {
                alert("Enter");
                $(this).replaceWith('<div class="var H click"></div>')
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

        if (response.responseText)
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

    export function createHTML(e, self) {
        if ('if' === e)
        {
            $(self).replaceWith('<div id="dropZone" class="dropZone H droppable"></div>' +
                '<div class="ifBox V workplace">' +
                '<div class="guardBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '<div class="thenBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '<div class="elseBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div></div>' +
                '<div id="dropZone" class="dropZone H droppable"></div>');
        }
        else if ('while' === e)
        {
            $(self).replaceWith('<div id="dropZone" class="dropZone H droppable"></div>' +
                '<div class="whileBox V workplace">' +
                '<div class="guardBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '<div class="thenBox H workplace">' +
                '<div id="dropZone" class="dropZone H droppable"></div></div>' +
                '</div>' +
                '<div id="dropZone" class="dropZone H droppable"></div>');
        }
        else if ('var' === e)
        {
            var VarBox = document.createElement("div");
            VarBox.setAttribute("class", "hCont H" );
            //VarBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var op = document.createElement("input");
            op.setAttribute("class", "op H");
            op.setAttribute("type", "text");
            op.setAttribute("list", "oplist");
            op.setAttribute("width", "5px");

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

            //op.textContent = "=";
            var value = document.createElement("div");
            value.setAttribute("class","var H click");

            VarBox.appendChild(name);
            VarBox.appendChild(op);
            VarBox.appendChild(list);
            VarBox.appendChild(value);

            var box = document.getElementById("container").appendChild(VarBox);
        }

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui) {
                console.log($(this).attr("id"));
                //createHTML(ui.draggable.attr("id"), this);
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

        $(".click").click(function(){
            $(this).replaceWith('<input type="text" width="5" class="var H input">')
        });

        $(".input").keyup(function(e){
            if(e.keyCode == 13)
            {
                alert("Enter");
                $(this).replaceWith('<div class="var H click"></div>')
            }
        });
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
            hoverClass: "hover",
            tolerance:"pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                //createHTML(ui.draggable.attr("id"), this);
                undostack.push(currentSelection);
                currentSelection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                generateHTML(currentSelection);
                //$(ui.draggable).clone().appendTo($(this));
            }
        });

        clickDiv();

        enterList();
    }

    function enterList()
    {
        $(".input").keyup(function (e) {
            if (e.keyCode == 13) {
                var text = $(this).val();
                $(this).replaceWith('<div class="var H click">' + text + '</div>')

                $(".click").click(function(){
                   $(this).replaceWith('<input type="text" class="op H input" list="oplist">');
                    enterList();
                });
            }
        });
        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert:'invalid'
        });
    }

    function clickDiv()
    {
        $(".click").click(function(){
            $(this).replaceWith('<input type="text" class="var H input">');

            $(".input").keyup(function(e){
                if(e.keyCode == 13)
                {
                    var text = $(this).val();
                    $(this).replaceWith('<div class="var H click">' + text + '</div>')
                    clickDiv();
                }
            });
        });
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
            guardbox.setAttribute("class", "guardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var elsebox = document.createElement("div");
            elsebox.setAttribute("class", "elseBox H workplace");
            elsebox.appendChild( children[2] ) ;

            var ifbox = document.createElement("div");
            ifbox["childNumber"] = childNumber ;
            ifbox.setAttribute("class", "ifBox V workplace canDrag");
            ifbox.appendChild(guardbox);
            ifbox.appendChild(thenbox);
            ifbox.appendChild(elsebox);
            return ifbox ;
        }
        else if(label.match("seq"))
        {
            var seqBox = document.createElement("div");
            seqBox.setAttribute( "class", "seqBox V" ) ;
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
            PHBox.setAttribute( "class", "PHBox V" ) ;
            PHBox["childNumber"] = childNumber ;

            for( var i=0 ; true ; ++i )
            {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZone H droppable");
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
            guardbox.setAttribute("class", "guardBox H workplace");
            guardbox.appendChild( children[0] ) ;

            var thenbox = document.createElement("div");
            thenbox.setAttribute("class", "thenBox H workplace");
            thenbox.appendChild( children[1] ) ;

            var whileBox = document.createElement("div");
            whileBox["childNumber"] = childNumber ;
            whileBox.setAttribute("class", "ifBox V workplace canDrag");
            whileBox.appendChild(guardbox);
            whileBox.appendChild(thenbox);

            return whileBox;
        }
        else if(label.match("var"))
        {
            var VarBox = document.createElement("div");
            VarBox.setAttribute("class", "hCont H canDrag" );
            VarBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var op = document.createElement("input");
            op.setAttribute("class", "op H input");
            op.setAttribute("type", "text");
            op.setAttribute("list", "oplist");

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

            var value = document.createElement("div");
            value.setAttribute("class","var H click ");

            VarBox.appendChild(name);
            VarBox.appendChild(op);
            VarBox.appendChild(list);
            VarBox.appendChild(value);

            return VarBox;
        }
        else if(label.match("assign"))
        {
            var AssignBox = document.createElement("div");
            AssignBox.setAttribute("class", "hCont H canDrag" );
            AssignBox["childNumber"] = childNumber;

            var name = document.createElement("div");
            name.setAttribute("class", "var H click");

            var equal = document.createElement("div");
            equal.setAttribute("class", "op H");
            equal.textContent = "=";

            var value = document.createElement("div");
            value.setAttribute("class","var H click");

            AssignBox.appendChild(name);
            AssignBox.appendChild(equal);
            AssignBox.appendChild(value);

            return AssignBox;
        }
    }
}

export = mkHTML ;