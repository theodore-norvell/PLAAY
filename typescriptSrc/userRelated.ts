/// <reference path="jquery.d.ts" />

/// <reference path="collections.ts" />
/// <reference path="editor.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="pnode.ts" />
/// <reference path="sharedMkHtml.ts" />


import collections = require( './collections' );
import editor = require( './editor' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');

/** userRelated  provides the UI for communicating with the server. */
module userRelated 
{
    import list = collections.list;
    import fromJSONToPNode = pnode.fromJSONToPNode;
    import Selection = pnodeEdits.Selection;

    export function userRelatedActions () : void
    {
        sessionStorage.removeItem("programId");
        $('#login').click(loginAction);
        $('#logout').click(logoutAction);
        $('#clearProgram').click(clearProgramAction);
        $('#updateProgram').click(updateProgramAction);
        $('#saveProgram').click(saveProgramAction);
        $('#loadProgram').click(loadProgramAction);
    }

    function loginAction () : void
    {
        $("body").append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='registrationBox'>" +
            "<div id='loginSection'>" +
            "Login <br>" +
            "<form name='loginUser' id='loginUser' method='post' action='/login'>" +
            "Email: <input type='text' name='email' class='login-textbox' id='loginUsername' required><br>" +
            "Password: <input type='password' name='password' class='login-textbox' required><br>" +
            "<input type='submit' value='Login'>" +
            "</form></div>" +
            "<div id='registrationSection'>" +
            "Register <br>" +
            "<form name='registerNewUser' id='registerNewUser' method='post' action='/signup/'>" +
            "Email: <input type='text' name='email' class='login-textbox' required><br>" +
            "Password: <input type='password' name='password' class='login-textbox' required><br>" +
            "Confirm Password: <input type='password' name='confirmPassword' class='login-textbox' required><br>" +
            "<input type='submit' value='Register'></form></div>" +
            "<div class='closewindow'>Close Window</div></div>");
        $('.login-textbox').each(function (index, elem) {
            $(elem).keydown(function (e) {
                e.stopPropagation();
            });
        });
        // $('#loginUser').submit(loginUser);
        // $('#registerNewUser').submit(registerNewUser);
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
        window.location.href = '/logout';
    }

    function clearProgramAction () : void
    {
        window.location.href = '/';
    }

    function updateProgramAction () : void
    {
        if (sessionStorage.length > 0) {
            $.post('/update',
                {
                    identifier: sessionStorage.getItem("programId"),
                    program: serialize(editor.getCurrentSelection())
                });
        }
        else {
            saveProgramAction();
        }
    }

    function saveProgramAction () : void
    {
        $('body').append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='getProgramList'>" +
            "<form name='saveProgramTree' id='saveProgramForm' method='post'>" +
            "Program Name: <input type='text' name='programname' id='saveProgramName'><br>" +
            "Private? <input type='checkbox' name='private' id='isPrivate'><br>" +
            "<input type='submit' value='Submit Program'>" +
            "</form><div class='closewindow'>Close Window</div></div>");
        $('#saveProgramName').keydown(function (e) {
            e.stopPropagation();
        });
        $('#saveProgramForm').submit(savePrograms);
        $('.closewindow').click(function () : void {
            $("#dimScreen").remove();
        });
        //getPrograms();
    }

    function loadProgramAction() : void
    {
        $('body').append("<div id='dimScreen'></div>");
        $('#dimScreen').append("<div id='getProgramList'><button id='loadButton'>Load Program</button><div class='closewindow'>Close Window</div></div>");
        $('#loadButton').click(loadProgram);
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
            "/login",
            {email:usr,password:psw},
            function() : void {
                $('body').replaceWith(response.responseText);
                location.reload();
                // const  respText = $.parseJSON(response.responseText);
                // if (respText.result === "SUCCESS")
                // {
                //     const  user = respText.username;
                //     $("#dimScreen").remove();
                //     $("#login").hide();
                //     //$("#userSettings").show();
                //     $('<input>').attr({
                //         type: 'hidden',
                //         id: 'currentUser',
                //         value: user
                //     }).appendTo('#userSettings');
                //     $("#saveProgram").show();
                //     $("#loadProgram").show();
                //     $("#logout").show();
                //     $("#userSettings").val(user);
                //     //alert(respText.username);
                // }
                // else if (respText.result === "WRONGCREDENTIALS")
                // {
                //     alert("Wrong username/password, please try again.");
                // }
                // else if (respText.result === "ERROR")
                // {
                //     alert("An error has occurred, please try again later.");
                // }

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
                "/signup",{email:usr,password:psw,confirmPassword:pswCon},
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
        const  response = $.post(
                "/listPrograms",
                function() : void {
                    buildPage(JSON.parse(response.responseText));
        });
        return false;
    }

    function buildPage(result) : void
    {
        $('#getProgramList').append("<table id='programTable'><tr><th>Name</th><th>Version</th><th></th></tr>")
        result.forEach(function(entry) : void {
            $('#programTable').append("<tr><td>" + entry.name + "</td><td>" + entry.version
                + "</td><td><button id='" + entry.identifier +  "'>Load</button></td></tr>");
            $('#' + entry.identifier.replace(/\//g, "\\/").replace(/\+/g, "\\+")).click(function () {
                loadProgram(entry.identifier);
            })
        });
        $('#programTable').append("</table>");
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

    export function loadProgram(identifier : string) : void
    {
        const  response = $.post(
           "/load",
           { identifier: identifier },
           function() : void { // TODO Move this callback function to the editor.
               $("#dimScreen").remove();
               editor.update( unserialize(response.responseText) );
               sessionStorage.setItem("programId", identifier);
           });
    }

    function savePrograms() : boolean
    {
        const programName = $('form[name="saveProgramTree"] :input[name="programname"]').val();
        const isPrivate  = $("#isPrivate").is(":checked");
        const currentSel = serialize( editor.getCurrentSelection() );
        const response = $.post(
            "/save",
            {name:programName, program:currentSel, private: isPrivate},
            function() : void {
                let programId = response.responseText;
                sessionStorage.setItem("programId", programId)
                $('#dimScreen').append("Sharable link for this program: <a href='/p/" + programId + "/'>Link</a>")
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
