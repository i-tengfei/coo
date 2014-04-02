define( [ 'Quaternion' ], function ( Quaternion ) {

    function Rotation( x, y, z, order ){

        if( ! ( this instanceof Rotation ) ){
            return new Rotation( x, y, z, order );
        }

        this.__quaternion = new Quaternion( );
        if( Array.isArray( x ) && y === undefined ){
            this.set( x[ 0 ], x[ 1 ], x[ 2 ], 'XYZ' )    
        }else{
            this.set( x||0, y||0, z||0, order||'XYZ' );
        }
    }

    Rotation.prototype = {

        __x: 0, __y: 0, __z: 0, __order: 'XYZ',

        __quaternion: new Quaternion( ),

        __updateQuaternion: function( ){
            this.__quaternion.setFromRotation( this, false );
        },

        updateFromQuaternion: function( ){
            this.setFromQuaternion( this.__quaternion );
        },

        get x( ){
            return this.__x;
        },

        set x( v ){
            this.__x = v;
            this.__updateQuaternion( );
        },

        get y( ){
            return this.__y;
        },

        set y( v ){
            this.__y = v;
            this.__updateQuaternion( );
        },

        get z( ){
            return this.__z;
        },

        set z( v ){
            this.__z = v;
            this.__updateQuaternion( );
        },

        get order( ){
            return this.__order;
        },

        set order( v ){
            this.__order = v;
            this.__updateQuaternion( );
        },

        get quaternion( ){
            return this.__quaternion;
        },

        set: function( x, y, z, order ){
            this.__x = x;
            this.__y = y;
            this.__z = z;
            this.__order = order;
            this.__updateQuaternion( );
        },

        setFromRotationMatrix: function( m, order ){

            order = order || this.__order;

            if ( order === 'XYZ' ) {

                this.__y = Math.asin( clamp( m.m13 ) );

                if ( Math.abs( m.m13 ) < 0.99999 ) {

                    this.__x = Math.atan2( - m.m23, m.m33 );
                    this.__z = Math.atan2( - m.m12, m.m11 );

                } else {

                    this.__x = Math.atan2( m.m32, m.m22 );
                    this.__z = 0;

                }

            }

            this.order = order;

            return this;

        },

        setFromQuaternion: function( q, order ){
            
            var sqx = q.x * q.x;
            var sqy = q.y * q.y;
            var sqz = q.z * q.z;
            var sqw = q.w * q.w;

            order = order || this.order;

            if ( order === 'XYZ' ) {
                this.__x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
                this.__y = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ) ) );
                this.__z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );
            }

            this.order = order;

            return this;

        },

        setFromAxisAngle: function( axis, angle ){

            this.quaternion.setFromAxisAngle( axis, angle )
            this.updateFromQuaternion( );
            return this;

        }

    };

    function clamp( x ) {
        return Math.min( Math.max( x, -1 ), 1 );
    }

    return Rotation;

} );