
/// <reference path="assert.ts" />

import assert = require( './assert' );

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
        public set(val : T) : void
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

        public kill() : void 
        {
            if(this.alive === false)
            {
                throw new Error("Tried to kill a dead TVar");
            }
            this.manager.notifyOfDeath(this);
            this.alive = false;
        }

        public revive(val : T) : void 
        {
            if(this.alive === true)
            {
                throw new Error("Tried to revive an alive variable");
            }
            this.manager.notifyOfBirth(this);
            this.alive = true;
            this.currentValue = val;
        }

        public isAlive() : boolean
        {
            return this.alive;
        }

        public setAlive(alive : boolean) : void 
        {
            this.alive = alive;
        }
    }

    export class TArray<T>
    {
        // TODO. Reimplement this with a TVar<Array<TVar<T>>> or a TVar<Array<T>> .
        private array : TVar<Array<TVar<T>>> ;
        private manager : TransactionManager ;

        public constructor(manager : TransactionManager)
        {
            this.manager = manager;
            const emptyArray = new Array<TVar<T>>() ;
            this.array = new TVar<Array<TVar<T>>>(emptyArray, manager);
        }

        public size() : number
        {
            return this.array.get().length ;
        }

        public get(index : number) : T
        {
            if(!(0 <= index && index < this.size()))
            {
                throw new Error("Index of TArray out of range");
            }
            return this.array.get()[index].get();
        }

        public set(index : number, val : T) : void
        {
            if(!(0 <= index && index < this.size()))
            {
                throw new Error("Index of TArray out of range");
            }
            this.array.get()[index].set(val);
        }

        public push(val : T) : void
        {
            const oldArray = this.array.get() ;
            const len = oldArray.length ;
            const newArray = new Array<TVar<T>>( len+1 ) ;
            for( let i = 0 ; i < len; ++i ) newArray[i] = oldArray[i] ;
            newArray[len] = new TVar(val, this.manager ) ;
            this.array.set( newArray ) ;
        }

        public pop() : T
        {
            const oldArray = this.array.get() ;
            const len = oldArray.length ;
            const newArray = oldArray.slice(0, len-1) ;
            this.array.set( newArray ) ;
            return oldArray[len-1].get() ;
        }

        public cutItem( i : number ) : void { 
            if(!(0 <= i && i < this.size()))
            {
                throw new Error("Index of TArray out of range");
            }
            const oldArray = this.array.get() ;
            const len = oldArray.length ;
            const newArrayA = oldArray.slice(0, i) ;
            const newArrayB = oldArray.slice(i+1, len) ;
            const newArray = newArrayA.concat( newArrayB ) ;
            this.array.set( newArray ) ;
        }
    }

    export class TMap<K,T>
    {
        private map : Map<K, TVar<T>>;
        private manager : TransactionManager;
        public constructor(manager : TransactionManager)
        {
            this.map = new Map<K, TVar<T>>();
            this.manager = manager;
        }

        public keys() : Array<K>
        {
            let returnArray : Array<K> = new Array<K>();
            for(let key of this.map.keys())
            {
                let myVal : TVar<T> | undefined = this.map.get(key);
                if(myVal !== undefined && myVal.isAlive())
                {
                    returnArray.push(key);
                }
            }
            return returnArray;
        }

        public values() : Array<T>
        {
            let returnArray : Array<T> = new Array<T>();
            for(let key of this.map.keys())
            {
                let myVal : TVar<T> | undefined = this.map.get(key);
                if(myVal !== undefined && myVal.isAlive())
                {
                    returnArray.push(myVal.get());
                }
            }
            return returnArray;        }

        public size() : number
        {
            let size : number = 0;
            for(let val of this.map.values())
            {
                if(val.isAlive())
                {
                    size++;
                }
            }
            return size;
        }

        public get(K : K) : T | null
        {
            let myTVar : TVar<T> | undefined = this.map.get(K);
            if(myTVar === undefined || !myTVar.isAlive())
            {
                return null;
            }
            else
            {
                return myTVar.get();
            } 
        }

        public set(key: K, val : T) : void
        {
            let myTVar : TVar<T> | undefined = this.map.get(key);
            if(myTVar === undefined || !myTVar.isAlive())
            {
                myTVar = new TVar<T>(val, this.manager);
                this.map.set(key, myTVar);
            }
            else
            {
                myTVar.set(val);
            }
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
