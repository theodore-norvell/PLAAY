/**
 * Created by Jessica on 3/16/2016.
 */

/// <reference path="world.ts" />

import world = require ('./world');

module workspace {
    import World = world.World;

    export class Workspace {
        private world : World;

        constructor(){
            this.world = new World();
        }

        getWorld(){
            return this.world;
        }

        setWorld(world : World) {
            this.world = world;
        }

    }
}

export = workspace