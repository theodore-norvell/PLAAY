module Assert {
    export function check( b : Boolean, message : string ) {
        if( !b ) {
            if( message===undefined ) message = "Assertion failed" ;
            throw new Error( message ) ; } }
}