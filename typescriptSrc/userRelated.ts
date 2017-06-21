/// <reference path="collections.ts" />
/// <reference path="editor.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="pnode.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="jquery.d.ts" />

import collections = require( './collections' );
import editor = require( './editor' );
import pnodeEdits = require( './pnodeEdits');
import pnode = require('./pnode');
import sharedMkHtml = require('./sharedMkHtml');

/** userRelated  provides the UI for communicating with the server. */
module userRelated 
{
    import list = collections.list;
    import fromJSONToPNode = pnode.fromJSONToPNode;
    import Selection = pnodeEdits.Selection;

    export function userRelatedActions () : void
    {
        $('#login').click(loginAction);
        $('#userSettings').click(userSettingsAction);
        $('#logout').click(logoutAction);
        $('#saveProgram').click(saveProgramAction);
        $('#loadProgram').click(loadProgramAction);
    }

    function loginAction () : void
    {
        $("body").append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='registrationBox'>" +
            "<div id='loginSection'>" +
            "Login <br>" +
            "<form name='loginUser' onSubmit='return loginUser()' method='post'>" +
            "Username: <input type='text' name='username' required><br>" +
            "Password: <input type='password' name='password' required><br>" +
            "<input type='submit' value='Login'>" +
            "</form></div>" +
            "<div id='registrationSection'>" +
            "Register <br>" +
            "<form name='registerNewUser' onSubmit='return registerNewUser()' method='post'>" +
            "Username: <input type='text' name='username' required><br>" +
            "Password: <input type='password' name='password' required><br>" +
            "Confirm Password: <input type='password' name='passwordConfirm' required><br>" +
            "<input type='submit' value='Register'></form></div>" +
            "<div class='closewindow'>Close Window</div></div>");
        $('.closewindow').click(function () : void {
            $("#dimScreen").remove();
        });
    }

    function userSettingsAction ()  : void
    {
        $('body').append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='userSettingsChange'>" +
            "<div id='editAccountTitle'>Edit Account Info:</div>" +
            "<form name='editUserInfo' onSubmit='return editUser()' method='post'>" +
            "Username: <input type='text' name='username'><br>" +
            "Password:<br>&emsp;Old: <input type='password' name='oldpassword'><br>" +
            "&emsp;New: <input type='password' name='newpassword'><br>" +
            "&emsp;Confirm New: <input type='password' name='confirmnewpassword'><br>" +
            "Email: <input> type='text' name='email'><br>" +
            "<input type='submit' value='Submit Changes'></form>" +
            "<div class='closewindow'>Close Window</div></div>");
        $('.closewindow').click(function () : void {
            $("#dimScreen").remove();
        });
    }

    function logoutAction () : void
    {
        $("#login").show();
        $("#userSettings").hide();
        $("#saveProgram").hide();
        $("#loadProgram").hide();
        $("#userSettings :input").remove();
        $("#logout").hide();
    }

    function saveProgramAction () : void
    {
        $('body').append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='getProgramList'>" +
            "<form name='saveProgramTree' onSubmit='return savePrograms()' method='post'>" +
            "Program Name: <input type='text' name='programname'><br>" +
            "<input type='submit' value='Submit Program'>" +
            "</form><div class='closewindow'>Close Window</div></div>");
        $('.closewindow').click(function () : void {
            $("#dimScreen").remove();
        });
        //getPrograms();
    }

    function loadProgramAction() : void
    {
        $('body').append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='getProgramList'><div class='closewindow'>Close Window</div></div>");
        $('.closewindow').click(function ()  : void {
            $("#dimScreen").remove();
        });
        getPrograms();
    }

    function loginUser() : boolean
    {
        console.log('login');
        const  inputs = $('form[name="loginUser"] :input');
        const  usr = $('form[name="loginUser"] :input[name="username"]').val();
        const  psw = $('form[name="loginUser"] :input[name="password"]').val();
        console.log($('form[name="loginUser"] #usrname').val());
        const  response = $.post(
            "/Login",
            {username:usr,password:psw},
            function() : void {
                const  respText = $.parseJSON(response.responseText);
                if (respText.result === "SUCCESS")
                {
                    const  user = respText.username;
                    $("#dimScreen").remove();
                    $("#login").hide();
                    //$("#userSettings").show();
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
                else if (respText.result === "WRONGCREDENTIALS")
                {
                    alert("Wrong username/password, please try again.");
                }
                else if (respText.result === "ERROR")
                {
                    alert("An error has occurred, please try again later.");
                }

            });
        return false;
    }

    function registerNewUser() : boolean
    {
        console.log('register');
        const  usr = $('form[name="registerNewUser"] :input[name="username"]').val();
        const  psw = $('form[name="registerNewUser"] :input[name="password"]').val();
        const  pswCon = $('form[name="registerNewUser"] :input[name="passwordConfirm"]').val();
        if(psw !== pswCon)
        {
            alert("Passwords do not match, please confirm match.");
        }
        else
        {
            const  response = $.post(
                "/Register",{username:usr,password:psw},
                function() : void {
                    const  respText = $.parseJSON(response.responseText);
                    if (respText.result === "SUCCESS")
                    {
                        const  user = respText.username;
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
                    else if (respText.result === "NAMETAKEN")
                    {
                        alert("Username is taken, please try another.");
                    }
                    else if (respText.result === "ERROR")
                    {
                        alert("An error has occurred, please try again.");
                    }

                });
        }
        return false;
    }

    function editUser() : boolean
    {
        console.log('register');
        const  currentUser = $('#userSettings :input').val();
        const  usr = $('form[name="editUserInfo"] :input[name="username"]').val();
        const  oldpsw = $('form[name="editUserInfo"] :input[name="oldpassword"]').val();
        const  newpsw = $('form[name="editUserInfo"] :input[name="newpassword"]').val();
        const  newpswCon = $('form[name="editUserInfo"] :input[name="confirmnewpassword"]').val();
        const  email = $('form[name="editUserInfo"] :input[name="email"]').val();
        if(usr.length === 0 && oldpsw.length === 0 && email.length === 0)
        {
            alert("No fields filled. Please fill at least one field.") ;
        }
        else if(oldpsw.length > 0 && newpsw.length >0 && newpsw !== newpswCon)
        {
            alert("Passwords do not match, please confirm match.");
        }
        else
        {
            const  response = $.post(
                "/EditUser",
                {username:usr,password:oldpsw},
                function() : void {
                    const  respText = $.parseJSON(response.responseText);
                    if (respText.result === "SUCCESS")
                    {
                        const  user = respText.username;
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
                    else if (respText.result === "NAMETAKEN")
                    {
                        alert("Username is taken, please try another.");
                    }
                    else if (respText.result === "ERROR")
                    {
                        alert("An error has occurred, please try again.");
                    }

                });
        }
        return false;
    }

    function getPrograms() : boolean
    {
        const  currentUser = $('#userSettings :input').val();
        const  response = $.post(
                "/ProgramList",
                {username:currentUser},
                function() : void {
                    buildPage(response.responseText);
        });
        return false;
    }

    function buildPage(json : string) : void
    {
        const  result = $.parseJSON(json).programList;
        result.forEach(function(entry : string) : void {
            $('#getProgramList').append("<div>" + entry +
                "<button type=\"button\" onclick=\"loadProgram(\'" + entry + "\')\">Select program</button>" +
                "<button type=\"button\" onclick=\"deleteProgram(\'" + entry + "\')\">Delete Program</button>" +
                "</div>");
        });
    }

    function deleteProgram(name : string) : void
    {
        const  currentUser = $('#userSettings :input').val();
        const  programName = name;
        const  response = $.post(
                "/DeleteProgram",
                {username: currentUser, programname: programName},
                function() : void {
                    $("#dimScreen").remove();
                    $('body').append("<div id='dimScreen'></div>");
                    $('#dimScreen').append("<div id='getProgramList'><div class='closewindow'>Close Window</div></div>");
                    $('.closewindow').click(
                        function () : void {
                            $("#dimScreen").remove(); } ) ;
                    getPrograms();
                });
    }

    function loadProgram(name:string) : void
    {
        const  currentUser = $('#userSettings :input').val();
        const  programName = name;
        const  response = $.post(
           "/LoadProgram",
           { username: currentUser, programname: programName },
           function() : void { // TODO Move this callback function to the editor.
               $("#dimScreen").remove();
               editor.update( unserialize(response.responseText) );
           });
    }

    function savePrograms() : boolean
    {
        const  currentUser = $('#userSettings :input').val();
        const  programName = $('form[name="saveProgramTree"] :input[name="programname"]').val();
        const  currentSel = serialize( editor.getCurrentSelection() );
        const  response = $.post(
            "/SavePrograms",
            {username:currentUser,programname:programName,program:currentSel},
            function() : void {
                console.log(response.responseText);
                $('#dimScreen').remove();
            });
        return false;
    }

    function serialize(select : Selection) : string
    {
        return pnode.fromPNodeToJSON(select.root());
    }

    function unserialize(str:string) : Selection
    {
        const path = list<number>();
        return new Selection(fromJSONToPNode(str), path, 0, 0) ;
    }

}

export = userRelated;
