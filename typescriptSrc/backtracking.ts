
module backtracking
{
    export class TVar<T>
    {
        private manager : TransactionManager;
        private currentValue : T;
        private alive : boolean = false;

        public get() : T 
        {
            if(this.alive === false && this.manager.getState() !== States.UNDOING)
            {
                throw new Error("Tried to get dead TVar")
            }
            return this.currentValue;
        }
        public set(val : T)
        {
            if(this.alive === false && this.manager.getState() !== States.UNDOING)
            {
                throw new Error("Tried to set dead TVar")
            }
            this.manager.notifyOfSet(this);
            this.currentValue = val;
        }

        public constructor(val : T, manager: TransactionManager)
        {
            this.manager = manager;
            this.alive = true;
            this.manager.notifyOfBirth(this);
            this.currentValue = val;
        }

        public kill()
        {
            if(this.alive === false)
            {
                throw new Error("Tried to kill a dead TVar");
            }
            this.manager.notifyOfDeath(this);
            this.alive = false;
        }

        public revive(val : T)
        {
            if(this.alive === true)
            {
                throw new Error("Tried to revive an alive variable");
            }
            this.manager.notifyOfBirth(this);
            this.alive = true;
            this.currentValue = val;
        }

        public isAlive()
        {
            return this.alive;
        }

        public setAlive(alive : boolean)
        {
            this.alive = alive;
        }
    }

    export class TArray<T>
    {
        private array : Array<TVar<T>>;
        private sizeVar : TVar<number>;
        private manager : TransactionManager

        public constructor(manager : TransactionManager)
        {
            this.manager = manager;
            this.array = new Array<TVar<T>>();
            this.sizeVar = new TVar<number>(0, manager);
        }

        public size() : number
        {
            return this.sizeVar.get();
        }

        public get(index : number) : T
        {
            if(!(0 <= index && index < this.sizeVar.get()))
            {
                throw new Error("Index of TArray out of range");
            }
            return this.array[index].get();
        }

        public set(index : number, val : T) : void
        {
            if(!(0 <= index && index < this.sizeVar.get()))
            {
                throw new Error("Index of TArray out of range");
            }
            this.array[index].set(val);
        }

        public push(val : T) : void
        {
            if(this.size() == this.array.length)
            {
                this.array.push(new TVar<T>(val, this.manager));
            }
            else
            {
                this.array[this.size()].revive(val);
            }
            this.sizeVar.set(this.sizeVar.get()+1);
        }

        public pop() : T
        {
            let size = this.size();
            if(!(1 <= size))
            {
                throw new Error("Tried to pop empty array");
            }
            let returnVal : T = this.array[size-1].get();
            this.array[size-1].kill();
            this.sizeVar.set(size-1);
            return returnVal;
        }

        public unshift(val : T) : void
        {
            let newVal : TVar<T> = new TVar<T>(val, this.manager);
            this.array.unshift(newVal);
            this.sizeVar.set(this.sizeVar.get()+1);
        }
    }

    export class TransactionManager
    {
        private undoStack : Array<Transaction>;
        private redoStack : Array<Transaction>;
        private currentTransaction : Transaction = new Transaction();
        private state : States;

        public constructor()
        {
            this.undoStack = [];
            this.redoStack = [];
            this.state = States.NOTDOING;
        }

        public getState() : States
        {
            return this.state;
        }

        public notifyOfSet(v : TVar<any>)
        {
            this.preNotify()
            this.currentTransaction.put(v);
        }

        public notifyOfBirth(v : TVar<any>)
        {
            this.preNotify();
            this.currentTransaction.birthPut(v);
        }

        public notifyOfDeath(v: TVar<any>)
        {
            this.preNotify();
            this.currentTransaction.deathPut(v);
        }

        public preNotify()
        {
            if(this.state === States.UNDOING)
            {
                return;
            }
            if(this.state === States.NOTDOING)
            {
                this.state = States.DOING;
                //this.currentTransaction = new Transaction();
                this.redoStack = [];
            }
        }

        public checkpoint() : void
        {
            if(this.state === States.DOING)
            {            
                this.state = States.NOTDOING;
                this.undoStack.unshift(this.currentTransaction);
                this.currentTransaction = new Transaction();
            }
        }

        public canUndo() : boolean {
            return (this.undoStack.length > 1 || (this.undoStack.length > 0 && this.state === States.DOING));
        }
            
        public canRedo() : boolean {
            return (this.redoStack.length > 0);
        }

        public getUndoStack() : Array<Transaction>
        {
            return this.undoStack;
        }

        public getRedoStack() : Array<Transaction>
        {
            return this.redoStack;
        }

        public undo() : void
        {
            this.checkpoint();
            if(this.canUndo())
            {
                let trans : Transaction = this.undoStack[0];
                this.undoStack.shift();
                this.state = States.UNDOING; //prevent setting TVars from making a new transaction until undo is done.
                trans.apply();
                this.redoStack.unshift(trans);
                this.state = States.NOTDOING;
                this.currentTransaction = new Transaction();
            }
        }

        public redo() : void
        {
            if(this.canRedo() && this.state === States.NOTDOING)
            {
                let trans : Transaction = this.redoStack[0];
                this.redoStack.shift();
                this.state = States.UNDOING; //prevent setting TVars from making a new transaction until redo is done.
                trans.apply();
                this.undoStack.unshift(trans);
                this.state = States.NOTDOING;
                this.currentTransaction = new Transaction();
            }
        }
    }

    export class Transaction
    {
        private map : Map<TVar<any>, TransactionEntry> = new Map<TVar<any>, TransactionEntry>();

        public getMap() : Map<TVar<any>, TransactionEntry>
        {
            return this.map;
        }

        public put(v : TVar<any>)
        {
            this.map.set(v, new TransactionEntry(true, v.get()));
        }

        public birthPut(v : TVar<any>)
        {
            this.map.set(v, new TransactionEntry(false, null));
        }

        public deathPut(v : TVar<any>)
        {
            this.map.set(v, new TransactionEntry(true, v.get()));
        }

        public apply()
        {
            for(let key of this.map.keys())
            {
                let val : any = key.get();
                let alive : boolean = key.isAlive();
                let entry : TransactionEntry|undefined = this.map.get(key);
                if(entry !== undefined)
                {
                    key.set(entry.val);
                    key.setAlive(entry.alive);
                }
                
                this.map.set(key, new TransactionEntry(alive, val));
            }
        }
    }

    export class TransactionEntry
    {
        public alive : boolean;
        public val : any;

        public constructor(alive : boolean, val : any)
        {
            this.alive = alive;
            this.val = val;
        }
    }

    export enum States
    {
        DOING,
        NOTDOING,
        UNDOING
    }
}
export = backtracking;
