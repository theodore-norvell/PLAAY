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

module main {
    
    export function onLoad() : void
    {
		createHtmlElements.createHtmls();
		animator.executingActions();
		userRelated.userRelatedActions();
        editor.editingActions();
    }

}

export = main ;
