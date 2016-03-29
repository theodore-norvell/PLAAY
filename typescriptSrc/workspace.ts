/**
 * Created by Jessica on 3/16/2016.
 */
import world = require ('./world');

module workspace {
    import World = world.World;
    import TurtleWorld = world.TurtleWorld;

    export class Workspace {
        private world : World;
        private turtleWorld : TurtleWorld;

        constructor(){
            this.world = new World();
            this.turtleWorld = new TurtleWorld();
        }

        getWorld(){
            return this.world;
        }

        getTurtleWorld(){
            return this.turtleWorld;
        }

        setWorld(world : World) {
            this.world = world;
        }

    }
}

export = workspace