/// <reference path="collections.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="pnode.ts" />

import collections = require( './collections' );
import pnodeEdits = require( './pnodeEdits');
import pnode = require('./pnode');

module userRelated {

    import list = collections.list;
    import List = collections.List;
    import fromJSONToPNode = pnode.fromJSONToPNode;
    import Selection = pnodeEdits.Selection;
	
    var root = pnode.mkExprSeq([]);
    var path : (  ...args : Array<number> ) => List<number> = list;
    var currentSelection;
    var select = new pnodeEdits.Selection(root,path(),0,0);
    currentSelection = select;

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
        var response = $.post("/ProgramList",{username:currentUser}, function() {
            userRelated.buildPage(response.responseText);
        });
        return false;
    }

    export function buildPage(json)
    {
        var result = $.parseJSON(json).programList;
        result.forEach(function(entry){
            $('#getProgramList').append("<div>" + entry +
                "<button type=\"button\" onclick=\"userRelated.loadProgram(\'" + entry + "\')\">Select program</button>" +
                "<button type=\"button\" onclick=\"userRelated.deleteProgram(\'" + entry + "\')\">Delete Program</button>" +
                "</div>");
        });
    }

    export function deleteProgram(name)
    {
        var currentUser = $('#userSettings :input').val();
        var programName = name;
        var response = $.post("/DeleteProgram", {username: currentUser, programname: programName}, function() {
            $("#dimScreen").remove();
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='getProgramList'><div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
            userRelated.getPrograms();
        });
    }

    export function loadProgram(name)
    {
        var currentUser = $('#userSettings :input').val();
        var programName = name;
        var response = $.post("/LoadProgram", { username: currentUser, programname: programName }, function() {
            $("#dimScreen").remove();
            currentSelection = unserialize(response.responseText);
            generateHTML(currentSelection);
            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        });
    }

    export function savePrograms()
    {
        var currentUser = $('#userSettings :input').val();
        var programName = $('form[name="saveProgramTree"] :input[name="programname"]').val();
        var currentSel = serialize(currentSelection);
        var response = $.post("/SavePrograms",{username:currentUser,programname:programName,program:currentSel},
            function(){
                console.log(response.responseText);
                $('#dimScreen').remove();
            });
        return false;
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

}

export = userRelated;
