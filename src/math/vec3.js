define( function ( ) {

    function Vec3( x, y, z ){

        if( ! ( this instanceof Vec3 ) ){
            return new Vec3( x, y, z );
        }

        var arr = Array.apply( this, arguments );

        if( Array.isArray( x ) && y === undefined ){
            arr = x;
        }

        this[ 0 ] = arr[ 0 ] || 0;
        this[ 1 ] = arr[ 1 ] || 0;
        this[ 2 ] = arr[ 2 ] || 0;

        this.length = 3;

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

        this.__defineGetter__( 'z', function( ){
            return this[ 2 ];
        } );
        this.__defineSetter__( 'z', function( v ){
            this[ 2 ] = v;
        } );

        return this;

    }

    Vec3.prototype = new Array( );

    Vec3.prototype.val = function( x,y,z ){

        if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ){

            this.x = x;
            this.y = y;
            this.z = z;
            
            return this;

        }else if( x instanceof Array && x.length === 3 && y === undefined ){

            return this.val( x[ 0 ], x[ 1 ], x[ 2 ] );

        }

    };

    Vec3.prototype.clone = function( ){
        return Vec3( ).val( this );
    };

    Vec3.prototype.sub = function( x,y,z ){

        if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ){

            this.x = this.x - x;
            this.y = this.y - y;
            this.z = this.z - z;

            return this;

        }else if( x instanceof Vec3 && y instanceof Vec3 && z === undefined ){

            return this.val( x ).sub( y );

        }else if( x instanceof Array && y === undefined  ){

            return this.sub( x[ 0 ], x[ 1 ], x[ 2 ] );

        }

    };

    Vec3.prototype.add = function( x,y,z ){

        if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ){

            this.x = this.x + x;
            this.y = this.y + y;
            this.z = this.z + z;

            return this;

        }else if( x instanceof Vec3 && y instanceof Vec3 && z === undefined ){

            return this.val( x ).add( y );

        }else if( x instanceof Array && y === undefined  ){

            return this.add( x[ 0 ], x[ 1 ], x[ 2 ] );

        }

    };

    Vec3.prototype.distanceTo = function ( v ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    };

    Vec3.prototype.distanceToSquared = function ( v ) {
        
        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;

    };

    Vec3.prototype.dot = function( v ){

        return this.x * v.x + this.y * v.y + this.z * v.z;

    };

    Vec3.prototype.cross = function( v1, v2 ){

        if( v1 && v2 ){

            this.x = v1.y * v2.z - v1.z * v2.y;
            this.y = v1.z * v2.x - v1.x * v2.z;
            this.z = v1.x * v2.y - v1.y * v2.x;

            return this;

        }else if( v1 ){

            return this.cross( this, v1 );

        }

    };

    Vec3.prototype.length2 = function( ){

        return this.dot( this );

    };

    Vec3.prototype.length1 = function( ){

        return Math.sqrt( this.length2( ) );
    
    };

    Vec3.prototype.normalize = function( ){

        var len = 1 / ( this.length1( ) || 1 );

        this.x = this.x * len;
        this.y = this.y * len;
        this.z = this.z * len;

        return this;

    };

    return Vec3;

} );