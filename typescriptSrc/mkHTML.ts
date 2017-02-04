/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />
/// <reference path="treeManager.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />
/// <reference path="userRelated.ts" />
/// <reference path="executing.ts" />
/// <reference path="sharedMkHtml.ts" />

import collections = require( './collections' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require('./treeManager');
import valueTypes = require( './valueTypes' ) ;
import userRelated = require( './userRelated' ) ;
import executing = require( './executing' ) ;
import sharedMkHtml = require('./sharedMkHtml');

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    import TreeManager = treeManager.TreeManager;
    import Selection = pnodeEdits.Selection;
    import StringV = valueTypes.StringV;
    import BuiltInV = valueTypes.BuiltInV;
	import evaluate = executing.evaluate;
	import traverseAndBuild = sharedMkHtml.traverseAndBuild;

	var currentSelection = sharedMkHtml.currentSelection;

    var undostack = [];
    var redostack = [];
    var trashArray = [];
    var draggedSelection;
    var draggedObject;

    var pathToTrash = list<number>();
    var tree = new TreeManager();

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
		createTexted("div", "turtle", "turtle", bodyConst, "Turtle World");
		createHidden("div", "quitworld", "quitworld", bodyConst, "Quit World").click(function() {leaveWorld();});
		createHidden("div", "edit evalVisible", "edit", bodyConst, "Edit").click(function() {editor();});
		createTexted("div", "trash evalHidden", "trash", bodyConst, "Trash").click(function() {visualizeTrash();});
		createHidden("div", "advance evalVisible", "advance", bodyConst, "Next").click(function() {executing.advanceOneStep();});
		createHidden("div", "multistep evalVisible", "multistep", bodyConst, "Multi-Step").click(function() {executing.multiStep();});
		createHidden("div", "run evalVisible", "run", bodyConst, "Run").click(function() {executing.stepTillDone();});
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
            //userRelated.getPrograms();
        });

        $('#loadProgram').click(function() {
            $('body').append("<div id='dimScreen'></div>");
            $('#dimScreen').append("<div id='getProgramList'><div class='closewindow'>Close Window</div></div>");
            $('.closewindow').click(function () {
                $("#dimScreen").remove();
            });
            userRelated.getPrograms();
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

    function leaveWorld() : void
    {
		$("#turtle").css("visibility","visible");
		$("#quitworld").css("visibility","hidden");
		$(".removeFromSidebar").remove();
        $('.turtleFunc').remove();

        var canvas = document.getElementById("turtleGraphics");
        document.getElementById("body").removeChild(canvas);
    }

    function editor() : void
    {
		$(".evalHidden").css("visibility", "visible");
		$(".evalVisible").css("visibility", "hidden");
        $(".dropZone").show();
        $(".dropZoneSmall").show();
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
}

export = mkHTML ;
