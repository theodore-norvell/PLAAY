
module backtracking
{
    export class TVar<T>
    {
        private manager : TransactionManager;
        private currentValue : T;

        public get() : T {return this.currentValue;}
        public set(val : T)
        {
            this.manager.notifyOfSet(this);
            this.currentValue = val;
        }

        public constructor(val : T, manager: TransactionManager)
        {
            this.manager = manager;
            this.set(val);
        }
    }

    export class TransactionManager
    {
        private undoStack : Array<Transaction>;
        private currentTransaction : Transaction;
        private state : States;

        public constructor()
        {
            this.undoStack = [];
            this.state = States.NOTDOING;
        }

        public notifyOfSet(v : TVar<any>)
        {
            if(this.state === States.UNDOING)
            {
                return;
            }
            if(this.state === States.NOTDOING)
            {
                this.state = States.DOING;
                this.currentTransaction = new Transaction();
            }
            this.currentTransaction.put(v);
        }
        public checkpoint() : void
        {
            if(this.state === States.DOING)
            {            
                this.state = States.NOTDOING;
                this.undoStack.unshift(this.currentTransaction);
            }
        }
        public undo() : void
        {
            this.checkpoint();
            if(this.undoStack.length !== 0)
            {
                let trans : Transaction = this.undoStack[0];
                this.undoStack.shift();
                this.state = States.UNDOING; //prevent setting TVars from making a new transaction until undo is done.
                trans.apply();
                this.state = States.NOTDOING;
            }
        }

        public getState() : States //meant for unit testing
        {
            return this.state;
        }

        public getUndoStack() : Array<Transaction> //meant for unit testing
        {
            return this.undoStack;
        }

        public getCurrentTransaction() : Transaction //meant for unit testing
        {
            return this.currentTransaction;
        }
    }

    export class Transaction
    {
        private map : Map<TVar<any>, any> = new Map<TVar<any>, any>();

        public put(v : TVar<any>)
        {
            this.map.set(v, v.get())
        }
        public apply()
        {
            for(let key of this.map.keys())
            {
                let val : any = key.get();
                key.set(this.map.get(key));
                this.map.set(key, val);
            }
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
