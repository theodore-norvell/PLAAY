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

import collections = require( './collections' );
import assert = require( './assert' );
import pnode = require('./pnode');
import pnodeEdits = require( './pnodeEdits');
import treeManager = require('./treeManager');
import evaluationManager = require('./evaluationManager');
import stack = require( './stackManager' ) ;
import vms = require('./vms');
import value = require('./value');
import seymour = require( './seymour' ) ;

module mkHTML {
    import list = collections.list;
    import List = collections.List;
    import PNode = pnode.PNode;
    import TreeManager = treeManager.TreeManager;
    import Selection = pnodeEdits.Selection;
    import fromJSONToPNode = pnode.fromJSONToPNode;
    import EvaluationManager = evaluationManager.EvaluationManager;
    import VarMap = stack.VarMap;
    import mapEntry = stack.mapEntry;
    import VMS = vms.VMS;
    import ExecStack = stack.execStack;
    import arrayToList = collections.arrayToList;
    import StringV = value.StringV;
    import BuiltInV = value.BuiltInV;
    import Point = seymour.Point;

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
    var penUp = true;
    var turtle = "";
    currentSelection = select;

    const canv = document.createElement('canvas');

    export function onLoad() : void
    {
        //creates side bar
        const sidebar = document.createElement("div");
        sidebar.setAttribute("id","sidebar");
        sidebar.setAttribute("class","sidebar");
        document.getElementById("body").appendChild(sidebar);

        const stackbar = document.createElement("div");
        stackbar.setAttribute("id", "stackbar");
        stackbar.setAttribute("class", "stack");
        document.getElementById("body").appendChild(stackbar);
        const table = document.createElement("table");
        table.setAttribute("id", "stackVal");
        document.getElementById("stackbar").appendChild(table);
        document.getElementById("stackVal").style.border = "thin solid black";
        document.getElementById("stackVal");
        document.getElementById("stackbar").style.visibility = "hidden";

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
            evaluate();
        };

        const turtlebutton = document.createElement("div");
        turtlebutton.setAttribute("id", "turtle");
        turtlebutton.setAttribute("class", "turtle");
        turtlebutton.setAttribute("onclick", "turtle()");
        turtlebutton.textContent = "Turtle World";
        document.getElementById("body").appendChild(turtlebutton);
        var turtleworld = document.getElementById("turtle");
        turtleworld.onclick = function turtle()
        {
            turtleGraphics();
        };

        const quitworldbutton = document.createElement("div");
        quitworldbutton.setAttribute("id", "quitworld");
        quitworldbutton.setAttribute("class", "quitworld");
        quitworldbutton.setAttribute("onclick", "quitworld()");
        quitworldbutton.textContent = "Quit World";
        document.getElementById("body").appendChild(quitworldbutton);
        var quitworld = document.getElementById("quitworld");
        quitworld.onclick = function quitprebuiltworld()
        {
            leaveWorld();
        };
        document.getElementById("quitworld").style.visibility = "hidden";

        const editorbutton = document.createElement("div");
        editorbutton.setAttribute("id", "edit");
        editorbutton.setAttribute("class", "edit");
        editorbutton.setAttribute("onclick", "edit()");
        editorbutton.textContent = "Edit";
        document.getElementById("body").appendChild(editorbutton);
        var edit = document.getElementById("edit");
        edit.onclick = function edit()
        {
            editor();
        };
        document.getElementById("edit").style.visibility = "hidden";

        const trash = document.createElement("div");
        trash.setAttribute("id","trash");
        trash.setAttribute("class", "trash clicktrash");
        trash.textContent = "Trash";
        document.getElementById("body").appendChild(trash);
        var garbage = document.getElementById("trash");
        garbage.onclick = function opendialog()
        {
            visualizeTrash();
        };

        const advancebutton = document.createElement("div");
        advancebutton.setAttribute("id", "advance");
        advancebutton.setAttribute("class","advance");
        advancebutton.setAttribute("onclick", "advance()");
        advancebutton.textContent = "Next";
        document.getElementById("body").appendChild(advancebutton);
        var advance = document.getElementById("advance");
        advance.onclick = function advance()
        {
            setValAndHighlight();
        };
        document.getElementById("advance").style.visibility = "hidden";

        const multistepbutton = document.createElement("div");
        multistepbutton.setAttribute("id", "multistep");
        multistepbutton.setAttribute("class","multistep");
        multistepbutton.setAttribute("onclick", "multistep()");
        multistepbutton.textContent = "Multi-Step";
        document.getElementById("body").appendChild(multistepbutton);
        var multistep = document.getElementById("multistep");
        multistep.onclick = function multistep()
        {
            multiStep();
        };
        document.getElementById("multistep").style.visibility = "hidden";

        const runbutton = document.createElement("div");
        runbutton.setAttribute("id", "run");
        runbutton.setAttribute("class","run");
        runbutton.setAttribute("onclick", "run()");
        runbutton.textContent = "Run";
        document.getElementById("body").appendChild(runbutton);
        var runfunc = document.getElementById("run");
        runfunc.onclick = function run()
        {
            stepTillDone();
        };
        document.getElementById("run").style.visibility = "hidden";

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

        const vardecblock = document.createElement("div");
        vardecblock.setAttribute("id", "vardecl");
        vardecblock.setAttribute("class", "block V palette");
        vardecblock.textContent = "Var Declaration";
        document.getElementById("sidebar").appendChild(vardecblock);

        const lambdablock = document.createElement("div");
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
        const container = document.createElement("div");
        container.setAttribute("id", "container");
        container.setAttribute("class", "container");
        document.getElementById("body").appendChild(container);

        const vms = document.createElement("div");
        vms.setAttribute("id","vms");
        vms.setAttribute("class", "vms");
        document.getElementById("body").appendChild(vms);
        document.getElementById("vms").style.visibility = "hidden";

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

    function redraw(vms:VMS) {
        const ctx = canv.getContext("2d");
        const w = canv.width;
        const h = canv.height;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < vms.getEval().getTurtleFields().getSegments().length; ++i) {
            const p0v = vms.getEval().getTurtleFields().world2View(vms.getEval().getTurtleFields().getSegments()[i].p0, w, h);
            const p1v = vms.getEval().getTurtleFields().world2View(vms.getEval().getTurtleFields().getSegments()[i].p1, w, h);
            ctx.beginPath();
            ctx.moveTo(p0v.x(), p0v.y());
            ctx.lineTo(p1v.x(), p1v.y());
            ctx.stroke();
        }
        if (vms.getEval().getTurtleFields().getVisible()) {
            // Draw a little triangle
            const theta = vms.getEval().getTurtleFields().getOrientation() / 180.0 * Math.PI;
            const x = vms.getEval().getTurtleFields().getPosn().x();
            const y = vms.getEval().getTurtleFields().getPosn().y();
            const p0x = x + 4 * Math.cos(theta);
            const p0y = y + 4 * Math.sin(theta);
            const p1x = x + 5 * Math.cos(theta + 2.5);
            const p1y = y + 5 * Math.sin(theta + 2.5);
            const p2x = x + 5 * Math.cos(theta - 2.5);
            const p2y = y + 5 * Math.sin(theta - 2.5);
            const p0v = vms.getEval().getTurtleFields().world2View(new Point(p0x, p0y), w, h);
            const p1v = vms.getEval().getTurtleFields().world2View(new Point(p1x, p1y), w, h);
            const p2v = vms.getEval().getTurtleFields().world2View(new Point(p2x, p2y), w, h);
            var base_image = new Image();
            base_image.src = "turtle1.png";
            //base_image.src = "Turtles/"+ vms.getEval().getTurtleFields().getOrientation() + ".png";
            base_image.width = 25;
            base_image.height = 25;
            const hscale = canv.width / vms.getEval().getTurtleFields().getWorldWidth() * vms.getEval().getTurtleFields().getZoom() ;
            const vscale = canv.height / vms.getEval().getTurtleFields().getWorldHeight() * vms.getEval().getTurtleFields().getZoom() ;
            const newx = vms.getEval().getTurtleFields().getPosn().x() * hscale + canv.width/2 -12.5;
            const newy = vms.getEval().getTurtleFields().getPosn().y() * vscale + canv.height/2 - 12.5;
            ctx.drawImage(base_image, newx, newy);
            ctx.beginPath();
            ctx.moveTo(p0v.x(), p0v.y());
            ctx.lineTo(p1v.x(), p1v.y());
            ctx.lineTo(p2v.x(), p2v.y());
            ctx.lineTo(p0v.x(), p0v.y());
            ctx.stroke();

        }
    }

    function leaveWorld()
    {
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

    function turtleGraphics()
    {
        document.getElementById("turtle").style.visibility = "hidden";
        document.getElementById("quitworld").style.visibility = "visible";

        var sidebar = $('#sidebar');

        const hideblock = document.createElement("div");
        hideblock.setAttribute("id", "hide");
        hideblock.setAttribute("class", "block V palette");
        hideblock.textContent = "Hide";
        sidebar.prepend(hideblock);

        const showblock = document.createElement("div");
        showblock.setAttribute("id", "show");
        showblock.setAttribute("class", "block V palette");
        showblock.textContent = "Show";
        sidebar.prepend(showblock);

        const clearblock = document.createElement("div");
        clearblock.setAttribute("id", "clear");
        clearblock.setAttribute("class", "block V palette");
        clearblock.textContent = "Clear";
        sidebar.prepend(clearblock);

        const penblock = document.createElement("div");
        penblock.setAttribute("id", "pen");
        penblock.setAttribute("class", "block V palette");
        penblock.textContent = "Pen";
        sidebar.prepend(penblock);

        const rightblock = document.createElement("div");
        rightblock.setAttribute("id", "right");
        rightblock.setAttribute("class", "block V palette");
        rightblock.textContent = "Right";
        sidebar.prepend(rightblock);

        const leftblock = document.createElement("div");
        leftblock.setAttribute("id", "left");
        leftblock.setAttribute("class", "block V palette");
        leftblock.textContent = "Left";
        sidebar.prepend(leftblock);

        const forwardblock = document.createElement("div");
        forwardblock.setAttribute("id", "forward");
        forwardblock.setAttribute("class", "block V palette");
        forwardblock.textContent = "Forward";
        sidebar.prepend(forwardblock);

        const body = document.getElementById('body') ;
        canv.setAttribute("id", "turtleGraphics");
        canv.setAttribute("class", "canv");
        canv.setAttribute('width','1024') ;
        canv.setAttribute('height','768') ;
        body.appendChild(canv);

        turtle = "turtle";

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

    function penDown()
    {
        if(penUp)
        {
            turtleWorld.penDown();
            penUp = false;
        }
        else
        {
            turtleWorld.penUp();
            penUp = true;
        }
    }

    function rightturn()
    {
        turtleWorld.right(10);
    }

    function leftturn()
    {
        turtleWorld.right(-10);
    }

    function forwardmarch()
    {
        turtleWorld.forward(10);
    }

    function backward()
    {
        turtleWorld.forward(-10);
    }
    
    function evaluate()
    {
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

        children.appendChild(traverseAndBuild(currentSelection.root(), currentSelection.root().count(), true));//vms.getEval().getRoot(), vms.getEval().getRoot().count()));
        $("#vms").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
        $(".dropZone").hide();
        $(".dropZoneSmall").hide();
    }

    function editor()
    {
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

    function visualizeStack(evalstack:ExecStack)
    {
        for(var i = 0; i < evalstack.obj.numFields(); i++)
        {
            if(evalstack.top().fields[i].getName().match(/\+/gi) || evalstack.top().fields[i].getName().match(/\-/gi)
            || evalstack.top().fields[i].getName().match(/\*/gi) || evalstack.top().fields[i].getName().match(/\//gi)
            || evalstack.top().fields[i].getName().match(/>/gi) || evalstack.top().fields[i].getName().match(/</gi)
            || evalstack.top().fields[i].getName().match(/==/gi) || evalstack.top().fields[i].getName().match(/>=/gi)
            || evalstack.top().fields[i].getName().match(/<=/gi) || evalstack.top().fields[i].getName().match(/&/gi)
            || evalstack.top().fields[i].getName().match(/\|/gi))
            {
                var builtInV = <BuiltInV>evalstack.top().fields[i].getValue()
                $("<tr><td>" + evalstack.top().fields[i].getName() + "</td>" +
                    "<td>" + builtInV.getVal() + "</td></tr>").appendTo($("#stackVal"));
            }
            else
            {
                var stringV = <StringV>evalstack.top().fields[i].getValue()
                $("<tr><td>" + evalstack.top().fields[i].getName() + "</td>" +
                    "<td>" + stringV.getVal() + "</td></tr>").appendTo($("#stackVal"));
            }

        }
        if(evalstack.getNext() == null)
        {
            return;
        }
        else
        {
            visualizeStack(evalstack.getNext());
        }
    }

    function visualizeTrash() {
        var dialogDiv = $('#trashDialog');

        if (dialogDiv.length == 0) {
            dialogDiv = $("<div id='dialogDiv' style='overflow:visible'><div/>").appendTo('body');
            for(var i = 0; i < trashArray.length; i++) {
                var trashdiv = document.createElement("div");
                trashdiv.setAttribute("class", "trashitem");
                trashdiv.setAttribute("data-trashitem", i.toString());
                $(traverseAndBuild(trashArray[i].root(), trashArray[i].root().count(),false)).appendTo($(trashdiv));
                $(trashdiv).appendTo(dialogDiv);
                //$(".trashitem").find('.seqBox')[0].setAttribute("data-childNumber", "-1");
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

    function highlight(parent, pending)
    {
        if(pending.isEmpty())
        {
            var self = $(parent);
            if(self.index() == 0)
                $("<div class='selected V'></div>").prependTo(self.parent());
            else
                $("<div class='selected V'></div>").insertBefore(self);
            self.detach().appendTo($(".selected"));
        }
        else
        {
            var child = $(parent);
            if ( child.children('div[data-childNumber="' + pending.first() + '"]').length > 0 )
            {
                var index = child.find('div[data-childNumber="' + pending.first() + '"]').index();
                var check = pending.first();
                if(index != check)
                    highlight(parent.children[index], pending.rest());
                else
                    highlight(parent.children[check], pending.rest());
            }
            else
            {
                highlight(parent.children[pending.first()], pending);
            }
        }
    }

    function findInMap(root, varmap:VarMap)
    {
        for(var i=0; i < varmap.size; i++)
        {
            var list = arrayToList(varmap.entries[i].getPath())
            var value = Object.create(varmap.entries[i].getValue());
            setHTMLValue(root, list, value);
        }
    }

    function setHTMLValue(root, path:List<number>, value)
    {
        if(path.isEmpty())
        {
            var self = $(root);
            self.replaceWith("<div class='inmap'>"+ value.getVal() +"</div>");
        }
        else{
            var child = $(root);
            if ( child.children('div[data-childNumber="' + path.first() + '"]').length > 0 )
            {
                var index = child.find('div[data-childNumber="' + path.first() + '"]').index();
                var check = path.first();
                if(index != check)
                    setHTMLValue(root.children[index], path.rest(), value);
                else
                    setHTMLValue(root.children[check], path.rest(), value);
            }
            else
            {
                setHTMLValue(root.children[path.first()], path, value);
            }
        }
    }

    function setValAndHighlight()
    {
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
        else{
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
        if(turtle.match("turtle"))
        {
            redraw(currentvms);
        }
    }

    function multiStep() {
        $('#advance').trigger('click');
        $('#advance').trigger('click');
        $('#advance').trigger('click');
    }

    function stepTillDone()
    {
        currentvms = evaluation.next();
        while(!currentvms.getEval().isDone())
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
        var children = document.getElementById("container");
        while (children.firstChild) {
            children.removeChild(children.firstChild);
        }
        children.appendChild(traverseAndBuild(select.root(), select.root().count(), false));

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