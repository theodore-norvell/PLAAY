/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="evaluationManager.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />
/// <reference path="seymour.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

import assert = require( './assert' );
import collections = require( './collections' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require('./treeManager');
import evaluationManager = require('./evaluationManager');
import valueTypes = require( './valueTypes' ) ;
import vms = require('./vms');
import seymour = require( './seymour' ) ;

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    import PNode = pnode.PNode;
    import TreeManager = treeManager.TreeManager;
    import Selection = pnodeEdits.Selection;
    import fromJSONToPNode = pnode.fromJSONToPNode;
    import EvaluationManager = evaluationManager.EvaluationManager;
    import ValueMap = vms.ValueMap;
    import VMS = vms.VMS;
    import VarStack = vms.VarStack;
    import arrayToList = collections.arrayToList;
    import Value = vms.Value ;
    import StringV = valueTypes.StringV;
    import BuiltInV = valueTypes.BuiltInV;

    var undostack = [];
    var redostack = [];
    var trashArray = [];
    var currentSelection;
    var draggedSelection;
    var draggedObject;

    var root = pnode.mkExprSeq([]);
    const turtleWorld = new seymour.TurtleWorld();
    var path : (  ...args : Array<number> ) => List<number> = list;
    var pathToTrash = list<number>();
    var tree = new TreeManager();
    var evaluation = new EvaluationManager();
    var select = new pnodeEdits.Selection(root,path(),0,0);
    var highlighted = false;
    var currentvms;
    var turtle : boolean = false ;
    currentSelection = select;

    export function onLoad() : void
    {
		const bodyConst = $("body");
		create("div", "sidebar evalHidden", "sidebar", bodyConst);
		const sidebarConst = $("#sidebar");
		
		createHidden("div", "stack evalVisible", "stackbar", bodyConst, null);
		create("table", null, "stackVal", $("#stackbar"));

		createTexted("div", "undo evalHidden", "undo", bodyConst, "Undo");
        $("#undo").click(function() {
			if (undostack.length != 0) {
				redostack.push(currentSelection);
				currentSelection = undostack.pop();
				generateHTML(currentSelection);
				$("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
			}
		});

		createTexted("div", "redo evalHidden", "redo", bodyConst, "Redo");
        $("#redo").click(function() {
			if (redostack.length != 0) {
                undostack.push(currentSelection);
                currentSelection = redostack.pop();
                generateHTML(currentSelection);
                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
            }
		});

		createTexted("div", "play evalHidden", "play", bodyConst, "Play").click(function() {evaluate();});
		createTexted("div", "turtle", "turtle", bodyConst, "Turtle World").click(function() {turtleGraphics();});
		createHidden("div", "quitworld", "quitworld", bodyConst, "Quit World").click(function() {leaveWorld();});
		createHidden("div", "edit evalVisible", "edit", bodyConst, "Edit").click(function() {editor();});
		createTexted("div", "trash evalHidden", "trash", bodyConst, "Trash").click(function() {visualizeTrash();});
		createHidden("div", "advance evalVisible", "advance", bodyConst, "Next").click(function() {advanceOneStep();});
		createHidden("div", "multistep evalVisible", "multistep", bodyConst, "Multi-Step").click(function() {multiStep();});
		createHidden("div", "run evalVisible", "run", bodyConst, "Run").click(function() {stepTillDone();});
		createTexted("div", "block V palette", "if", sidebarConst, "If"); 
		createTexted("div", "block V palette", "while", sidebarConst, "While"); 
		createTexted("div", "block V palette", "var", sidebarConst, "Var"); 
		createTexted("div", "block V palette", "stringliteral", sidebarConst, "String Literal"); 
		createTexted("div", "block V palette", "worldcall", sidebarConst, "Call World"); 
		createTexted("div", "block V palette", "assign", sidebarConst, "Assignment"); 
		create("div", "userBar", "userBar", bodyConst); 
		const userBarConst = $("#userBar");
		createTexted("div", "userOptions", "login", userBarConst, "Login/Register"); 
		createTexted("div", "userOptions", "logout", userBarConst, "Logout").hide();
		createTexted("div", "userOptions", "userSettings", userBarConst, "User Settings").hide();
		createTexted("div", "userOptions", "saveProgram", userBarConst, "Save Program").hide();
		createTexted("div", "userOptions", "loadProgram", userBarConst, "Load Program").hide();

        $('#login').click(function () {
            bodyConst.append("<div id='dimScreen'></div>");
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
                "<form name='saveProgramTree' onSubmit='return mkHTML.savePrograms()' method='post'>" +
                "Program Name: <input type='text' name='programname'><br>" +
                "<input type='submit' value='Submit Program'>" +
                "</form><div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
            //mkHTML.getPrograms();
        });

        $('#loadProgram').click(function() {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='getProgramList'><div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
            mkHTML.getPrograms();
        });

		createTexted("div", "block V palette", "vardecl", sidebarConst, "Var Declaration"); 
		createTexted("div", "block V palette", "lambda", sidebarConst, "Lambda Expression"); 
		create("datalist", null, "oplist", bodyConst); 

		var optionList = ["+", "-", "*", "/", ">", "<", "==", ">=", "<=", "&", "|"];
		for (var i = 0; i < optionList.length; i++) {
			createValued("option", $("#oplist"), optionList[i]);
		}

		create("div", "container evalHidden", "container", bodyConst); 
		createHidden("div", "vms evalVisible", "vms", bodyConst, null); 
		create("div", null, "seq", $("#container")).attr("data-childNumber", "-1");
		create("div", "dropZone H droppable", "dropZone", $("#seq")); 

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
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                var selection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                selection.choose(
                    sel => {
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
            }
        });

        $(".trash").droppable({
            accept: ".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event, ui){
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                var selection = tree.deleteNode(currentSelection);
                selection[1].choose(
                    sel => {
                        var trashselect = new Selection(selection[0][0],pathToTrash,0,0);
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        trashArray.push(trashselect);
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
            }
        });
        enterBox();
    }

	function create(elementType: string, className: string, idName: string, parentElement: JQuery) : JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (className) { obj.addClass(className); }
		if (idName) { obj.attr("id", idName); }
		if (parentElement) { obj.appendTo(parentElement); }
		return obj;
	}
	
	function createTexted(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string) : JQuery {
		var obj = create(elementType, className, idName, parentElement);
		if (textContent) { obj.text(textContent); }
		return obj;
	}

	function createValued(elementType: string, parentElement: JQuery, value: string) : JQuery {
		var obj = $("<" + elementType + "></" + elementType + ">");
		if (parentElement) { obj.appendTo(parentElement); }
		if (value) { obj.val(value); }
		return obj;
	}

	function createPrepended(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string, prependToThis: JQuery) : JQuery {
		var obj = createTexted(elementType, className, idName, parentElement, textContent);
		if (prependToThis) { obj.prependTo(prependToThis); }
		return obj;
	}

	function createHidden(elementType: string, className: string, idName: string, parentElement: JQuery, textContent: string) : JQuery {
		return createTexted(elementType, className, idName, parentElement, textContent).css("visibility", "hidden");
	}

    function redraw(vms:VMS) : void {
        turtleWorld.redraw() ;
    }

    function leaveWorld() : void
    {
		$("#turtle").css("visibility","visible");
		$("#quitworld").css("visibility","hidden");
		$(".removeFromSidebar").remove();
        $('.turtleFunc').remove();

        var canvas = document.getElementById("turtleGraphics");
        document.getElementById("body").removeChild(canvas);
    }

    function turtleGraphics() : void
    {
		$("#turtle").css("visibility","hidden");
		$("#quitworld").css("visibility","visible");
		
		const tempSidebar = $("#sidebar");
		createPrepended("div", "block V palette removeFromSidebar", "hide", null, "Hide", tempSidebar);
		createPrepended("div", "block V palette removeFromSidebar", "show", null, "Show", tempSidebar);
		createPrepended("div", "block V palette removeFromSidebar", "clear", null, "Clear", tempSidebar);
		createPrepended("div", "block V palette removeFromSidebar", "pen", null, "Pen", tempSidebar);
		createPrepended("div", "block V palette removeFromSidebar", "right", null, "Right", tempSidebar);
		createPrepended("div", "block V palette removeFromSidebar", "left", null, "Left", tempSidebar);
		createPrepended("div", "block V palette removeFromSidebar", "forward", null, "Forward", tempSidebar);

        const body = document.getElementById('body') ;
        const canv = turtleWorld.getCanvas() ;
        canv.setAttribute("id", "turtleGraphics");
        canv.setAttribute("class", "canv");
        canv.setAttribute('width','200') ;
        canv.setAttribute('height','200') ;
        body.appendChild(canv);

        turtle = true ;

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

        $( ".droppable" ).droppable({
            //accept: ".ifBox", //potentially only accept after function call?
            hoverClass: "hover",
            tolerance: "pointer",
            drop: function (event, ui) {
                console.log(ui.draggable.attr("id"));
                currentSelection = getPathToNode(currentSelection, $(this));
                undostack.push(currentSelection);
                var selection = tree.createNode(ui.draggable.attr("id"), currentSelection);
                selection.choose(
                    sel => {
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
            }
        });

        $( ".trash").droppable({
            accept:".canDrag",
            hoverClass: "hover",
            tolerance:'pointer',
            greedy: true,
            drop: function(event, ui){
                currentSelection = getPathToNode(currentSelection, ui.draggable);
                var selection = tree.deleteNode(currentSelection);
                selection[1].choose(
                    sel => {
                        var trashselect = new Selection(selection[0][0],pathToTrash,0,0);
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        trashArray.push(trashselect);
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    });
            }
        });
        enterBox();
    }
    
    function evaluate() : void
    {
		$(".evalHidden").css("visibility", "hidden");
		$(".evalVisible").css("visibility", "visible");
        currentvms = evaluation.PLAAY(currentSelection.root(), turtle ? turtleWorld : null );
        $("#vms").empty()
			.append(traverseAndBuild(currentSelection.root(), currentSelection.root().count(), true))
        	.find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();
    }

    function editor() : void
    {
		$(".evalHidden").css("visibility", "visible");
		$(".evalVisible").css("visibility", "hidden");
        $(".dropZone").show();
        $(".dropZoneSmall").show();
    }

    function visualizeStack(evalstack:VarStack) : void
    {
        for(let i = 0; i < evalstack.obj.numFields(); i++)
        {

            // TODO. This is really not good enough, since structured values should show in a structured way.
            const name = evalstack.obj.getFieldByNumber(i).getName() ;
            const val = evalstack.obj.getFieldByNumber(i).getValue() ;
            $("<tr><td>" + name + "</td>" +
                // TODO toString is not a good idea, as is may return strings that screw up the HTML.
                  "<td>" + val.toString() + "</td></tr>").appendTo($("#stackVal"));

        }
        if(evalstack.getNext() != null)
        {
            visualizeStack(evalstack.getNext());
        }
    }

    function visualizeTrash() : void {
        var dialogDiv = $('#trashDialog');

        if (dialogDiv.length == 0) {
            dialogDiv = $("<div id='dialogDiv' style='overflow:visible'><div/>").appendTo('body');
            for(var i = 0; i < trashArray.length; i++) {
				create("div", "trashitem", null, dialogDiv)
					.attr("data-trashitem", i.toString())
                	.append($(traverseAndBuild(trashArray[i].root(), trashArray[i].root().count(),false)));
            }
            dialogDiv.dialog({
                modal : true,
                dialogClass: 'no-close success-dialog',
            });
        }else{
            dialogDiv.dialog("destroy");
        }

        $(".canDrag").draggable({
            //helper:'clone',
            //appendTo:'body',
            revert:'invalid',
            appendTo: '#container',
            containment: false,
            start: function(event,ui){
                draggedObject = $(this).parent().attr("class");
                draggedSelection = trashArray[$(this).parent().attr("data-trashitem")];
            }
        });
	}

    function highlight(parent, pending) : void
    {
        if(pending.isEmpty())
        {
            var self = $(parent);
            if(self.index() == 0) {
				$("<div class='selected V'></div>").prependTo(self.parent());
			}
            else {
				$("<div class='selected V'></div>").insertBefore(self);
			}
            self.detach().appendTo($(".selected"));
        }
        else
        {
            var child = $(parent);
            if ( child.children('div[data-childNumber="' + pending.first() + '"]').length > 0 )
            {
                var index = child.find('div[data-childNumber="' + pending.first() + '"]').index();
                var check = pending.first();
                if(index != check) {
					highlight(parent.children[index], pending.rest());
				}
                else {
					highlight(parent.children[check], pending.rest());
				}
            }
            else
            {
                highlight(parent.children[pending.first()], pending);
            }
        }
    }

    function findInMap(root : HTMLElement, varmap : ValueMap) : void
    {
        for(let i=0; i < varmap.size; i++)
        {
            setHTMLValue(root, arrayToList(varmap.entries[i].getPath()), Object.create(varmap.entries[i].getValue()));
        }
    }

    function setHTMLValue(root :  HTMLElement, path:List<number>, value : Value ) : void 
    {
        if(path.isEmpty())
        {
            var self = $(root);
            // TODO. toString may not be the best function to call here,
            // since it could return any old crap that is not compatible with
            // HTML.
            self.replaceWith("<div class='inmap'>"+ value.toString() +"</div>");
        }
        else{
            var child = $(root);
            if ( child.children('div[data-childNumber="' + path.first() + '"]').length > 0 )
            {
                var index = child.find('div[data-childNumber="' + path.first() + '"]').index();
                var check = path.first();
                if(index != check) {
                    setHTMLValue(<HTMLElement>root.children[index], path.rest(), value);
				} else {
                    setHTMLValue(<HTMLElement>root.children[check], path.rest(), value);
				}
            }
            else
            {
                setHTMLValue(<HTMLElement>root.children[path.first()], path, value);
            }
        }
    }

    function advanceOneStep() : void
    {
        currentvms = evaluation.next();
		$("#stackVal").empty();
		$("#vms").empty()
			.append(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true))
			.find('.seqBox')[0].setAttribute("data-childNumber", "-1");
		var root = $("#vms :first-child").get(0);
        if (!highlighted && currentvms.getEval().ready) {
            const vms : HTMLElement = document.getElementById("vms") ;
            var list = arrayToList(currentvms.getEval().getPending());
            findInMap(root, currentvms.getEval().getVarMap());
            highlight(root, list);
            visualizeStack(currentvms.getEval().getStack());
            highlighted = true;
        } else {
            findInMap(root, currentvms.getEval().getVarMap());
            visualizeStack(currentvms.getEval().getStack());
            highlighted = false;
        }
        if(turtle) {
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
        while(!currentvms.getEval().isDone()) {
            currentvms = evaluation.next();
		}
		$("#vms").empty()
			.append(traverseAndBuild(currentvms.getEval().getRoot(), currentvms.getEval().getRoot().count(), true)) 
			.find('.seqBox')[0].setAttribute("data-childNumber", "-1");
		var root = $("#vms :first-child").get(0);
        var list = arrayToList(currentvms.getEval().getPath());
        var map = Object.create(currentvms.getEval().getVarMap());
        findInMap(root, map);
        highlight(root, list);
    }

    function createCopyDialog(selectionArray)  : JQuery {
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
                    },2000);
                },
                buttons: {
                    "Copy": function()
                    {
                        selectionArray[1][2].choose(
                            sel =>{
                                undostack.push(currentSelection);
                                currentSelection = sel;
                                generateHTML(currentSelection);
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            },
                            () =>{
                                generateHTML(currentSelection);
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            }
                        );
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
                open: function (event, ui) {
                    var markup = selectionArray[0][0];
                    $(this).html(markup);
                    setTimeout(function () {
                        $('.ui-dialog-content').dialog('destroy');
                    }, 2000);
                },
                buttons: {
                    "Swap": function () {
                        selectionArray[2][2].choose(
                            sel =>{
                                undostack.push(currentSelection);
                                currentSelection = sel;
                                generateHTML(currentSelection);
                                $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            },
                        () =>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        }
                        );
                        $(this).dialog("destroy");
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
            mkHTML.buildPage(response.responseText);
        });
        return false;
    }

    export function buildPage(json)
    {
        var result = $.parseJSON(json).programList;
        result.forEach(function(entry){
            $('#getProgramList').append("<div>" + entry +
                "<button type=\"button\" onclick=\"mkHTML.loadProgram(\'" + entry + "\')\">Select program</button>" +
                "<button type=\"button\" onclick=\"mkHTML.deleteProgram(\'" + entry + "\')\">Delete Program</button>" +
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
            mkHTML.getPrograms();
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

    export function generateHTML(select:Selection)
    {
        currentSelection = select;
		$("#container").empty()
			.append(traverseAndBuild(select.root(), select.root().count(), false));

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
                    selectionArray[0][2].choose(
                        sel => {
                            undostack.push(currentSelection);
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            createSwapDialog(selectionArray);
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                else if (((/ifBox/i.test(draggedObject)) || (/lambdaBox/i.test(draggedObject))
                    || (/whileBox/i.test(draggedObject)) || (/callWorld/i.test(draggedObject))
                    || (/assign/i.test(draggedObject))) && (/dropZone/i.test($(this).attr("class"))))
                {
                    selectionArray = tree.moveCopySwapEditList(draggedSelection, currentSelection);
                    selectionArray[0][2].choose(
                        sel => {
                            undostack.push(currentSelection);
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                            createCopyDialog(selectionArray);
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                else if((/trashitem/i.test(draggedObject)) && (/dropZone/i.test($(this).attr("class"))))
                {
                    undostack.push(currentSelection);
                    var selection = tree.appendChild(draggedSelection, currentSelection);
                    selection.choose(
                        sel => {
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
                }
                else
                {
                    console.log(ui.draggable.attr("id"));
                    undostack.push(currentSelection);
                    var selection = tree.createNode(ui.draggable.attr("id") /*id*/, currentSelection);
                    selection.choose(
                        sel => {
                            currentSelection = sel;
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        },
                        ()=>{
                            generateHTML(currentSelection);
                            $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                        });
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
                var selection = tree.changeNodeString(getPathToNode(currentSelection, $(this)), text);
                selection.choose(
                    sel => {
                        undostack.push(currentSelection);
                        currentSelection = sel;
                        generateHTML(currentSelection);
                        $("#container").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
                    },
                    ()=>{
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

    function getPathToNode(select:Selection, self ) : Selection
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
            if (/placeHolder/i.test(label) || /expOp/i.test(label))
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

    function traverseAndBuild(node:PNode, childNumber: number, evaluating:boolean) : HTMLElement
    {
        var children = new Array<HTMLElement>() ;
        for(var i = 0; i < node.count(); i++)
        {
            children.push( traverseAndBuild(node.child(i), i, evaluating) ) ;
        }
        return buildHTML(node, children, childNumber, evaluating);
    }

    function buildHTML(node:PNode, children : Array<HTMLElement>, childNumber : number, evaluating:boolean) : HTMLElement
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
            if(evaluating)
            {
                var seqBox = document.createElement("div");
                seqBox.setAttribute("class", "seqBox V");
                seqBox.setAttribute("data-childNumber", childNumber.toString());

                for (var i = 0; true; ++i) {
                    if (i == children.length) break;
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
                    if (i == children.length) break;
                    seqBox.appendChild(children[i]);
                }

                return seqBox;
            }
        }
        else if(label.match("expPH"))
        {
            var PHBox = document.createElement("div");
            PHBox.setAttribute("class", "placeHolder V");
            PHBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                PHBox.appendChild(dropZone);
                if (i == children.length) break;
                PHBox.appendChild(children[i]);
            }

            return PHBox;
        }
        else if(label.match("param"))
        {
            var paramBox = document.createElement("div");
            paramBox.setAttribute("class", "paramlistOuter H");
            paramBox.setAttribute("data-childNumber", childNumber.toString());
            //PHBox["childNumber"] = childNumber ;

            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                paramBox.appendChild(dropZone);
                if (i == children.length) break;
                paramBox.appendChild(children[i]);
            }

            return paramBox;
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
            lambdahead.appendChild(children[1]);

            var doBox = document.createElement("div");
            doBox.setAttribute("class", "doBox H");
            doBox.appendChild( children[2] ) ;

            var string;

            if (node.label().getVal().length > 0)
            {
                string = document.createElement("div");
                string.setAttribute("class", "stringLiteral H click canDrag");
                string.textContent = node.label().getVal();
            }
            else
            {
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
                VarBox.setAttribute("class", "var H click canDrag");
                VarBox.setAttribute("data-childNumber", childNumber.toString());
                VarBox.textContent = node.label().getVal();
            }
            else
            {
                VarBox = document.createElement("input");
                VarBox.setAttribute("class", "var H input canDrag");
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
                StringBox.setAttribute("class", "stringLiteral H click canDrag");
                StringBox.setAttribute("data-childNumber", childNumber.toString());
                StringBox.textContent = node.label().getVal();
            }
            else
            {
                StringBox = document.createElement("input");
                StringBox.setAttribute("class", "stringLiteral H input canDrag");
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
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                noType.appendChild( dropZone ) ;
                if( i == children.length ) break ;
                noType.appendChild( children[i] ) ;
            }

            return noType ;
        }
        else if(label.match("expOpt"))
        {
            var OptType = document.createElement("div");
            OptType.setAttribute("class", "expOp V");
            OptType.setAttribute("data-childNumber", childNumber.toString());

            for (var i = 0; true; ++i) {
                var dropZone = document.createElement("div");
                dropZone.setAttribute("class", "dropZoneSmall H droppable");
                OptType.appendChild(dropZone);
                if (i == children.length) break;
                OptType.appendChild(children[i]);
            }

            return OptType;
        }
        else if(label.match("vdecl"))
        {
            var VarDeclBox = document.createElement("div");
            VarDeclBox.setAttribute("class", "vardecl H canDrag droppable" );
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
        else if(label.match("forward"))
        {
            var forwardElement = document.createElement("div");
            forwardElement.setAttribute("class", "turtleFunc canDrag droppable");
            forwardElement.setAttribute("data-childNumber", childNumber.toString());
            forwardElement.textContent = "Forward";
            forwardElement.appendChild(children[0]);

            return forwardElement;
        }
        else if(label.match("right"))
        {
            var rightElement = document.createElement("div");
            rightElement.setAttribute("class", "turtleFunc canDrag droppable");
            rightElement.setAttribute("data-childNumber", childNumber.toString());
            rightElement.textContent = "Right";
            rightElement.appendChild(children[0]);

            return rightElement;
        }
        else if(label.match("left"))
        {
            var leftElement = document.createElement("div");
            leftElement.setAttribute("class", "turtleFunc canDrag droppable");
            leftElement.setAttribute("data-childNumber", childNumber.toString());
            leftElement.textContent = "Left";
            leftElement.appendChild(children[0]);

            return leftElement;
        }
        else if(label.match("pen"))
        {
            var penElement = document.createElement("div");
            penElement.setAttribute("class", "turtleFunc canDrag droppable");
            penElement.setAttribute("data-childNumber", childNumber.toString());
            penElement.textContent = "Pen";
            penElement.appendChild(children[0]);

            return penElement;
        }
        else if(label.match("clear"))
        {
            var clearElement = document.createElement("div");
            clearElement.setAttribute("class", "turtleFunc canDrag droppable");
            clearElement.setAttribute("data-childNumber", childNumber.toString());
            clearElement.textContent = "Clear";

            return clearElement;
        }
        else if(label.match("show"))
        {
            var showElement = document.createElement("div");
            showElement.setAttribute("class", "turtleFunc canDrag droppable");
            showElement.setAttribute("data-childNumber", childNumber.toString());
            showElement.textContent = "Show";

            return showElement;
        }
        else if(label.match("hide"))
        {
            var hideElement = document.createElement("div");
            hideElement.setAttribute("class", "turtleFunc canDrag droppable");
            hideElement.setAttribute("data-childNumber", childNumber.toString());
            hideElement.textContent = "Hide";

            return hideElement;
        }
    }
}

export = mkHTML ;
