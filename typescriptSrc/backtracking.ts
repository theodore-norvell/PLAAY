
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
    }

    export class TransactionManager
    {
        private undoStack : Array<Transaction> = [];
        private currentTransaction : Transaction;
        private state : States = States.NOTDOING;

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
    }

    export class Transaction
    {
        private map : Map<TVar<any>, any>;

        public put(v : TVar<any>)
        {

        }
        public apply()
        {

        }
    }

    enum States
    {
        DOING,
        NOTDOING,
        UNDOING
    }
}
export = backtracking;
