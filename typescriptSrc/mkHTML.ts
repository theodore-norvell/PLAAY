/// <reference path="jquery.d.ts" />
/// <reference path="jqueryui.d.ts" />

/// <reference path="createHtmlElements.ts" />
/// <reference path="executing.ts" />
/// <reference path="sharedMkHtml.ts" />
/// <reference path="userRelated.ts" />
/// <reference path="editing.ts" />


import createHtmlElements = require('./createHtmlElements');
import executing = require('./executing');
import sharedMkHtml = require('./sharedMkHtml');
import userRelated = require('./userRelated');
import editing = require('./editing');

module mkHTML {
    
    export function onLoad() : void
    {
		createHtmlElements.createHtmls();
		executing.executingActions();
		userRelated.userRelatedActions();
        editing.editingActions();
		sharedMkHtml.enterBox();
    }

}

export = mkHTML ;
