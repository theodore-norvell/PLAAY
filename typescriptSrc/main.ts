/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/// <reference path="createHtmlElements.ts" />
/// <reference path="animator.ts" />
/// <reference path="userRelated.ts" />
/// <reference path="editor.ts" />

import createHtmlElements = require('./createHtmlElements');
import animator = require('./animator');
import editor = require('./editor');
import userRelated = require('./userRelated');
import {identifier} from "../tsServer/node_modules/@types/babel-types";

/** The main module is the entry point.  It creates the HTML and installs the 
 * initial set of event handlers.
*/
module main {
    
    export function onLoad(programId : string | undefined = undefined) : void {
        createHtmlElements.createHtmls();
        animator.executingActions();
        userRelated.userRelatedActions();
        editor.editingActions();
        if (programId) {
            userRelated.loadProgram(programId);
        }
    }


}

export = main ;
