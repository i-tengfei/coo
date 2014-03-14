define( function ( ) {

    function Vec2( x, y ){

        if( ! ( this instanceof Vec2 ) ){
            return new Vec2( x, y );
        }

        var arr = Array.apply( this, arguments );

        this[ 0 ] = arr[ 0 ] || 0;
        this[ 1 ] = arr[ 1 ] || 0;

        this.length = 2;

        this.__defineGetter__( 'x', function( ){
            return this[ 0 ];
        } );
        this.__defineSetter__( 'x', function( v ){
            this[ 0 ] = v;
        } );

        this.__defineGetter__( 'y', function( ){
            return this[ 1 ];
        } );
        this.__defineSetter__( 'y', function( v ){
            this[ 1 ] = v;
        } );

        return this;

    }

    Vec2.prototype = new Array( );

    return Vec2;

} );