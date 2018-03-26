/// <reference path="assert.ts" />
/// <reference path="backtracking.ts" />
/// <reference path="collections.ts" />

import assert = require( './assert' ) ;
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' ) ;

/** The seymour module provide the TurtleWorld class which represents the state
 * of a turtle world.
 */
module seymour {
    import TArray = backtracking.TArray ;
    import TVar = backtracking.TVar ;
    import TransactionManager = backtracking.TransactionManager ;


    class Point {
        private readonly _x : number ;
        private readonly _y : number ;

        constructor( x : number, y : number) {
            this._x = x ;
            this._y = y ; }
        
        public x() : number { return this._x ; }
        public y() : number { return this._y ; }
    }

    class Segment {
        private readonly _p0 : Point ;
        private readonly _p1 : Point ;
        private readonly _color : [number, number, number] ;

        constructor( p0 : Point, p1 : Point, color : [number, number, number]) {
            this._p0 = p0 ;
            this._p1 = p1 ;
            this._color = color ; }
        
        public p0() : Point { return this._p0 ; }
        public p1() : Point { return this._p1 ; }
        public color() : [number, number, number] { return this._color ; }
    }

    function filter( c : number ) : number {
        c = Math.floor(c) ;
        if( c > 255 ) c = 255 ;
        else if( c < 0 ) c = 0 ;
        return c ;
    }

    function colorToString( colour : [number, number, number] ) : string {
        const r = filter( colour[0] );
        const g = filter( colour[1] );
        const b = filter( colour[2] );
        return "rgb(" +r+ "," +g+ "," +b+ ")" ;
    }

    export class TurtleWorld {
        // Defining the world to view mapping
        // For now, these are immutable
        private readonly zoom : number = 1 ;
        private readonly worldWidth : number = 500 ;
        private readonly worldHeight : number = 500 ;
        
        // The turtle's position.
        private readonly posn : TVar<Point> ;
        // The turtle's orientation.
        //  Invariant: The orientation is in [0,360)
        private readonly orientation : TVar<number> ;
        // Is the turtle itself visible
        private readonly visible : TVar<boolean> ;
        // Is the pen down
        private readonly penIsDown : TVar<boolean> ;
        // The segments 
        private readonly segments : TArray<Segment> ;
        // The colour of the background. Each number should be 0 <= x < 255.
        private readonly backgroundColor : TVar<[number,number,number]> ;
        // The colour fo the turtle. Each number should be 0 <= x < 255.
        private readonly turtleColor : TVar<[number,number,number]> ;
        // The canvas
        private readonly canv : HTMLCanvasElement ;

        constructor( canv : HTMLCanvasElement, tMan : TransactionManager ) {
            this.canv = canv ;
            this.posn = new TVar<Point>(new Point(0,0), tMan) ;
            this.orientation = new TVar<number>( 0.0, tMan ) ;
            this.visible = new TVar<boolean>( true, tMan ) ;
            this.penIsDown = new TVar<boolean>( false, tMan ) ;
            this.segments = new TArray<Segment>( tMan ) ;
            this.backgroundColor = new TVar<[number,number,number]>( [255,255,255], tMan ) ;
            this.turtleColor = new TVar<[number,number,number]>( [0, 127, 0], tMan ) ;
        }
        
        public getCanvas() : HTMLCanvasElement { return this.canv ; }
        
        public forward( n : number ) : void  {
            const theta = this.orientation.get() / 180.0 * Math.PI ;
            const newx =this.posn.get().x() + n * Math.cos(theta) ;
            const newy =this.posn.get().y() + n * Math.sin(theta) ;
            const newPosn = new Point(newx, newy) ;
            if( this.penIsDown.get() ) { this.segments.push(
                    new Segment( this.posn.get(), newPosn, this.turtleColor.get() ) ) ; }
            this.posn.set( newPosn ) ;
        }
        
        public clear() : void { 
            this.segments.clear() ;
            this.posn.set( new Point(0,0) ) ;
            this.orientation.set( 0.0 ) ;
            this.penIsDown.set( false ) ;
            this.visible.set( true ) ;
        }
        
        public right( d : number ) :void { 
            let r = (this.orientation.get() + d) % 360 ;
            while( r < 0 ) r += 360 ; // Once should be enough. Note that if r == -0 to start then it equals +360 at end!
            while( r >= 360 ) r -= 360 ; // Once should be enough.
            this.orientation.set( r ) ;
         }
        
        public left( d : number ) :void { 
            this.right( - d ) ;
         }
         
        public getPenIsDown() : boolean {
            return this.penIsDown.get() ; }
         
        public setPenDown( newValue : boolean ) : void {
            this.penIsDown.set( newValue ) ; }
         
        public penDown() : void {
            this.penIsDown.set( true ) ; }
         
        public penUp() : void {
            this.penIsDown.set( false ) ; }
         
        public hide() : void {
            this.visible.set( false ) ; }
         
        public show() : void  {
            this.visible.set( true ) ;  }
         
        public setBackground( r : number, g : number, b : number ) : void  {
            this.backgroundColor.set( [r,g,b] ) ;  }
         
        public setTurtleColor( r : number, g : number, b : number ) : void  {
            this.turtleColor.set( [r,g,b] ) ;  }
         
        public redraw() : void {
             const ctxOrNot = this.canv.getContext("2d") ;
             assert.check( ctxOrNot !== null ) ;
             const ctx = ctxOrNot as CanvasRenderingContext2D ;
             ctx.lineWidth = 1.0 ;
             const w = this.canv.width ;
             const h = this.canv.height ;
             ctx.clearRect(0, 0, w, h);
             ctx.fillStyle = colorToString( this.backgroundColor.get() ) ;
             ctx.fillRect(0, 0, w, h ) ;
             for( let i = 0 ; i < this.segments.size() ; ++i ) {
                 const segment = this.segments.get(i) ;
                 const p0v = this.world2View( segment.p0(), w, h ) ;
                 const p1v = this.world2View( segment.p1(), w, h ) ;
                 ctx.beginPath() ;
                 ctx.moveTo( p0v.x(), p0v.y() ) ;
                 ctx.lineTo( p1v.x(), p1v.y() ) ;
                 ctx.strokeStyle = colorToString( segment.color() ) ;
                 ctx.stroke() ;
             }
             if( this.visible.get() ) {
                 ctx.strokeStyle = colorToString( this.turtleColor.get() ) ; 
                 // Draw a little triangle
                 const theta = this.orientation.get() / 180.0 * Math.PI ;
                 const x = this.posn.get().x() ;
                 const y = this.posn.get().y() ;
                 const p0x = x + 20 *  Math.cos(theta) ;
                 const p0y = y + 20 *  Math.sin(theta) ;
                 const p1x = x + 25 * Math.cos(theta+2.5) ;
                 const p1y = y + 25 * Math.sin(theta+2.5) ;
                 const p2x = x + 25 * Math.cos(theta-2.5) ;
                 const p2y = y + 25 * Math.sin(theta-2.5) ;
                 const p0v = this.world2View( new Point(p0x,p0y), w, h ) ;
                 const p1v = this.world2View( new Point(p1x,p1y), w, h ) ;
                 const p2v = this.world2View( new Point(p2x,p2y), w, h ) ;
                 // The following commented out code draws an image of seymour the turtle.
                 //var base_image = new Image();
                 //base_image.src = "turtle1.png";
                 //base_image.width = 25;
                 //base_image.height = 25;
                 //const hscale = this.canv.width / this.worldWidth * this.zoom ;
                 //const vscale = this.canv.height / this.worldHeight * this.zoom ;
                 //const newx = this.posn.x() * hscale + this.canv.width/2 -12.5;
                 //const newy = this.posn.y() * vscale + this.canv.height/2 - 12.5;
                 //ctx.drawImage(base_image, newx, newy);
                 ctx.fillStyle = colorToString( this.turtleColor.get() ) ;
                 ctx.beginPath() ;
                 ctx.moveTo(p0v.x(),p0v.y()) ;
                 ctx.lineTo(p1v.x(),p1v.y()) ;
                 ctx.lineTo(p2v.x(),p2v.y()) ;
                 ctx.lineTo(p0v.x(),p0v.y()) ;
                 ctx.stroke() ;
             }
         }
         
        private world2View( p : Point, viewWidth : number, viewHeight : number ) : Point {
             const hscale = viewWidth / this.worldWidth * this.zoom ;
             const vscale = viewHeight / this.worldHeight * this.zoom ;
             const x = p.x() * hscale + viewWidth/2 ;
             const y = p.y() * vscale + viewHeight/2 ;
             return new Point( x, y ) ;
        }
    }
}

export = seymour ;