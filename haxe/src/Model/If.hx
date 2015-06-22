package model;

class If extends Expression{
    public function new()
    {
        //Pass expressions and store here TODO
    }

    public function If(functionName:Array<String>,logic:Array<Expression>,expression:Array<Expression>):Expression
    {
        if(functionName[0]=="If" || functionName[0]=="Else If")
        {
            if(logic[0])
            {
                return expression[0];
            }
            else
            {
                if(functionName.length>1)
                {
                    If(functionName.slice(1),logic.slice(1),expression.slice(1));
                }
            }
        }
        else
        {
            return expression[0];
        }
    }

}
