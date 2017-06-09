/// <reference path="seymour.ts" />

import seymour = require( './seymour' ) ;

function turtleTest() {
    console.log("running") ;
    const body = document.getElementById('body') as HTMLElement ;
    const turtleWorld = new seymour.TurtleWorld() 
    const canv = turtleWorld.getCanvas();
    canv.setAttribute('width','200') ;
    canv.setAttribute('height','200') ;
    body.appendChild( canv ) ;
    
    let playList : Array< () => void > = [
        () => {turtleWorld.setPenDown(true)},
        () => {turtleWorld.forward(20)},
        () => {turtleWorld.right(90)},
        () => {turtleWorld.forward(20)},
        () => {turtleWorld.right(90)},
        () => {turtleWorld.forward(20)},
        () => {turtleWorld.right(90)},
        () => {turtleWorld.forward(20)},
        () => {turtleWorld.right(90)},
        () => {turtleWorld.clear()},
        () => {turtleWorld.hide()},
        () => {turtleWorld.setPenDown(false)},       
        () => {turtleWorld.forward(-20)},
        () => {turtleWorld.show()},
        () => {turtleWorld.right(90)},  
        () => {turtleWorld.forward(10)}, 
        () => {turtleWorld.setPenDown(true)},
        
        () => {for(let i=0 ; i< 360 ; ++i) {turtleWorld.forward(0.2) ; turtleWorld.left(1) ; } },
        
        () => {turtleWorld.hide()}
    ] ;
    
    function playFrom( i : number ) {
        if( i < playList.length ) {
            playList[i]() ;
            setTimeout( ()=> playFrom(i+1), 500 ) ;
        }
    }
    
    setTimeout( () => playFrom(0), 0 ) ;
}

export = turtleTest ;