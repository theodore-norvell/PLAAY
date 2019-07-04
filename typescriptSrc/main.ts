/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/// <reference path="createHtmlElements.ts" />
/// <reference path="animator.ts" />
/// <reference path="userRelated.ts" />
/// <reference path="editor.ts" />

import animator = require('./animator');
import createHtmlElements = require('./createHtmlElements');
import editor = require('./editor');
import userRelated = require('./userRelated');

/** The main module is the entry point.  It creates the HTML and installs the 
 * initial set of event handlers.
*/
module main {
    
    export function onLoad(programId : string | undefined = undefined) : void {
        console.log(">> onLoad") ;
        createHtmlElements.createHtmls();
        animator.executingActions();
        userRelated.userRelatedActions();
        editor.editingActions();
        if (programId) {
            userRelated.loadProgram(programId);
        }
        console.log("<< onLoad") ;
    }
}

export = main ;
