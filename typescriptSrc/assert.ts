/** Functions for self checking code.
 * These functions should be used to help ensure that the code base is error free.
 * Assertion failures indicate an internal error in our software and should never be
 * used where the fault is with the user input or some external circumstance beyond
 * our control.
 */
module assert {
    var doAlert = true ;
    if(doAlert) try{eval('alert'); doAlert=true;} catch(e) {doAlert = false;}

    function raiseTheAlarm( message : string ) {
        const err = new Error( message ) ;
        if( console.error !== undefined && err['stack'] !== undefined ) {
            console.error( err['stack'] ) ; }
        if( doAlert ) alert( message ) ;
        throw err ;
    }

    /** Check that an expected condition is true.
     * 
     * @param b    a condition that should be true.
     * @param message  an optional message to accompany the Error.
     */
    export function check( b : Boolean, message? : string ) : void {
        if( !b ) {
            if( message===undefined ) message = "Assertion failed" ;
            else message = "Assertion failed: "+message ;
            raiseTheAlarm( message ) ;
        }
    }


    /** Check that an expected condition is true at the start of a method.
     * This function should be used when the fault is with the code that
     * called the current function.
     * 
     * @param b    condition that should be true.
     * @param message  an optional message to accompany the Error.
     */
    export function checkPrecondition( b : Boolean, message? : string ) : void {
        if( !b ) {
            if( message===undefined ) message = "Precondition failed" ;
            else message = "Precondition failed: "+message ;
            raiseTheAlarm( message ) ;
        }
    }

    /** Check that an object invariatn holds.
     * 
     * @param b    a condition that should be true.
     * @param message  an optional message to accompany the Error.
     */
    export function checkInvariant( b : Boolean, message? : string ) {
        if( !b ) {
            if( message===undefined ) message = "Invariant failed" ;
            else message = "Invariant failed: "+message ;
            raiseTheAlarm( message ) ;
        }
    }
    
    /** Check that two things are equal by === 
     * 
     * @param a a thing
     * @param b  another thing
     */
    export function checkEqual( a, b ) {
        if( !( a===b) ) {
            let message = "Assertion failed: Expected " ;
            if( a===undefined ) message += "undefined" ;
            else if( a===null) message += "null" ;
            else message += a.toString() ;
            message += " === " ;
            if( b===undefined ) message += "undefined" ;
            else if( b===null) message += "null" ;
            else message += b.toString() ;
            raiseTheAlarm( message ) ;
        }
    }
}

export = assert ;