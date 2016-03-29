

module seymour {
    class Point {   
        private _x : number = 0 ;
        private _y : number = 0 ;
        constructor( x : number, y : number) { this._x = x ; this._y = y ; }
        
        public x() { return this._x ; }
        public y() { return this._y ; }
    }
    interface Segment {   
        p0 : Point ;
        p1 : Point ;
    }
    export class TurtleWorld {
        // Defining the world to view mapping
        private zoom : number = 1 ;
        private worldWidth : number = 1024 ;
        private worldHeight : number = 768 ;
        
        // The turtle
        private posn : Point = new Point(0,0) ;
        // Invariant: The orientation is in [0,360)
        private orientation : number = 0.0 ;
        private visible = true ;
        private penIsDown = false ;
        
        // The segments 
        private segments = new Array<Segment>() ;
        
        // The canvas
        private canv : HTMLCanvasElement = document.createElement('canvas');
        
        getCanvas() { return this.canv ; }
        
        forward( n : number ) {
            const theta = this.orientation / 180.0 * Math.PI ;
            const newx =this.posn.x() + n * Math.cos(theta) ;
            const newy =this.posn.y() + n * Math.sin(theta) ;
            const newPosn = new Point(newx, newy) ;
            if( this.penIsDown ) { this.segments.push( {p0 : this.posn, p1:newPosn})} ;
            this.posn = newPosn ;
            this.redraw() ;
        }
        
        clear() { 
            this.segments = new Array<Segment>() ;
        }
        
        right( d : number ) { 
            var r = (this.orientation + d) % 360 ;
            while( r < 0 ) r += 360 ; // Once should be enough. Note that if r == -0 to start then it equals +360 to end!
            while( r >= 360 ) r -= 360 ; // Once should be enough.
            this.orientation = r ;
            this.redraw() ;
         }
        
        left( d : number ) { 
            this.right( - d ) ;
         }
         
         penUp() { this.penIsDown = false ; }
         
         penDown() { this.penIsDown = true ; }
         
         hide() { this.visible = false ; this.redraw() ; }
         
         show() { this.visible = true ; this.redraw() ;  }
         
         redraw() {
             const ctx = this.canv.getContext("2d") ;
             const w = this.canv.width ;
             const h = this.canv.height ;
             ctx.clearRect(0, 0, w, h);
             for( let i = 0 ; i < this.segments.length ; ++i ) {
                 const p0v = this.world2View( this.segments[i].p0, w, h ) ;
                 const p1v = this.world2View( this.segments[i].p1, w, h ) ;
                 ctx.beginPath() ;
                 ctx.moveTo( p0v.x(), p0v.y() ) ;
                 ctx.lineTo( p1v.x(), p1v.y() ) ;
                 ctx.stroke() ;
             }
             if( this.visible ) {
                 // Draw a little triangle
                 const theta = this.orientation / 180.0 * Math.PI ;
                 const x = this.posn.x() ;
                 const y = this.posn.y() ;
                 const p0x = x + 4 *  Math.cos(theta) ;
                 const p0y = y + 4 *  Math.sin(theta) ;
                 const p1x = x + 5 * Math.cos(theta+2.5) ;
                 const p1y = y + 5 * Math.sin(theta+2.5) ;
                 const p2x = x + 5 * Math.cos(theta-2.5) ;
                 const p2y = y + 5 * Math.sin(theta-2.5) ;
                 const p0v = this.world2View( new Point(p0x,p0y), w, h ) ;
                 const p1v = this.world2View( new Point(p1x,p1y), w, h ) ;
                 const p2v = this.world2View( new Point(p2x,p2y), w, h ) ;
                 var base_image = new Image();
                 base_image.src = "turtle1.png";
                 base_image.width = 25;
                 base_image.height = 25;
                 const hscale = this.canv.width / this.worldWidth * this.zoom ;
                 const vscale = this.canv.height / this.worldHeight * this.zoom ;
                 const newx = this.posn.x() * hscale + this.canv.width/2 -12.5;
                 const newy = this.posn.y() * vscale + this.canv.height/2 - 12.5;
                 ctx.drawImage(base_image, newx, newy);
                 ctx.beginPath() ;
                 ctx.moveTo(p0v.x(),p0v.y()) ;
                 ctx.lineTo(p1v.x(),p1v.y()) ;
                 ctx.lineTo(p2v.x(),p2v.y()) ;
                 ctx.lineTo(p0v.x(),p0v.y()) ;
                 ctx.stroke() ;
             }
         }
         
         private world2View( p : Point, viewWidth : number, viewHeight : number ) {
             const hscale = viewWidth / this.worldWidth * this.zoom ;
             const vscale = viewHeight / this.worldHeight * this.zoom ;
             const x = p.x() * hscale + viewWidth/2 ;
             const y = p.y() * vscale + viewHeight/2 ;
             return new Point( x, y ) ;
         }
    }
}

export = seymour ;