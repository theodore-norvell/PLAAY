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

    export function check( b : Boolean, message? : string ) {
        if( !b ) {
            if( message===undefined ) message = "Assertion failed" ;
            else message = "Assertion failed: "+message ;
            raiseTheAlarm( message ) ;
        }
    }

    export function checkPrecondition( b : Boolean, message? : string ) {
        if( !b ) {
            if( message===undefined ) message = "Precondition failed" ;
            else message = "Precondition failed: "+message ;
            raiseTheAlarm( message ) ;
        }
    }

    export function checkInvariant( b : Boolean, message? : string ) {
        if( !b ) {
            if( message===undefined ) message = "Invariant failed" ;
            else message = "Invariant failed: "+message ;
            raiseTheAlarm( message ) ;
        }
    }
}

export = assert ;