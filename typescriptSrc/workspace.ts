/**
 * Created by Jessica on 3/16/2016.
 */
import world = require ('./world');

module workspace {
    import World = world.World;

    export class Workspace {
        private world : World;

        getWorld(){
            return this.world;
        }

        setWorld(world : World) {
            this.world = world;
        }

    }
}

export = workspace