define( [ 'Vec3' ], function ( Vec3 ) {

    function Vec4( x, y, z, w ){

        if( ! ( this instanceof Vec4 ) ){
            return new Vec4( x, y, z, w );
        }

        var arr = Vec3.apply( this, arguments );

        this[ 3 ] = arr[ 3 ] || 1;

        this.length = 4;

        this.__defineGetter__( 'w', function( ){
            return this[ 3 ];
        } );
        this.__defineSetter__( 'w', function( v ){
            this[ 3 ] = v;
        } );

        this.__defineGetter__( 'r', function( ){
            return this[ 0 ];
        } );
        this.__defineSetter__( 'r', function( v ){
            this[ 0 ] = v;
        } );

        this.__defineGetter__( 'g', function( ){
            return this[ 1 ];
        } );
        this.__defineSetter__( 'g', function( v ){
            this[ 1 ] = v;
        } );

        this.__defineGetter__( 'b', function( ){
            return this[ 2 ];
        } );
        this.__defineSetter__( 'b', function( v ){
            this[ 2 ] = v;
        } );

        this.__defineGetter__( 'a', function( ){
            return this[ 3 ];
        } );
        this.__defineSetter__( 'a', function( v ){
            this[ 3 ] = v;
        } );

        return this;

    }

    Vec4.prototype = new Vec3( );

    return Vec4;

} );