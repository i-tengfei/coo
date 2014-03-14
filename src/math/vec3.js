define( [ 'Vec2' ], function ( Vec2 ) {

    function Vec3( x, y, z ){

        if( ! ( this instanceof Vec3 ) ){
            return new Vec3( x, y, z );
        }

        var arr = Vec2.apply( this, arguments );

        this[ 2 ] = arr[ 2 ] || 0;

        this.length = 3;

        this.__defineGetter__( 'z', function( ){
            return this[ 2 ];
        } );
        this.__defineSetter__( 'z', function( v ){
            this[ 2 ] = v;
        } );

        return this;

    }

    Vec3.prototype = new Vec2( );

    return Vec3;

} );