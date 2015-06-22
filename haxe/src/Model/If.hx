package model;

class If extends Expression{

    var logic:Array<Expression>; // will have an array of n logic expressions
    var expression:Array<Expression>; // will have an array of up to n
    var functionName:Array<Expression>; // an array of if/else, will include else if's later

    public function new(functionName:Array<Expression>, logic:Array<Expression>, expression:Array<Expression>)
    {
        super();

        this.logic = new Array<Expression>();
        this.logic = logic;
        this.expression = new Array<Expression>();
        this.expression = expression;
        this.functionName = new Array<Expression>();
        this.functionName = functionName;
    }

    public function If():Expression
    {
            if(logic[0]) // if logic inside if statement evaluates to "true"
            {
                return expression[0]; // return expression inside if statement
            }
            else
            {
                if(functionName[1].length>1)
                {
                    return expression[1];
                }

                return
            }
    }

}
