define( [ 'Vec3' ], function ( Vec3 ) {

    function Mat4( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ){

        if( ! ( this instanceof Mat4 ) ){
            return new Mat4( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 );
        }

        var arr = ( Array.isArray( m11 ) && m12 === undefined ) ? Array.apply( this, m11 ) : Array.apply( this, arguments );

        this[ 0  ] = ( arr[ 0 ] !== undefined ) ? arr[ 0 ] : 1;
        this[ 4  ] = arr[ 4  ] || 0;
        this[ 8  ] = arr[ 8  ] || 0;
        this[ 12 ] = arr[ 12 ] || 0;

        this[ 1  ] = arr[ 1  ] || 0;
        this[ 5  ] = ( arr[ 5 ] !== undefined ) ? arr[ 5 ] : 1;
        this[ 9  ] = arr[ 9  ] || 0;
        this[ 13 ] = arr[ 13 ] || 0;

        this[ 2  ] = arr[ 2  ] || 0;
        this[ 6  ] = arr[ 6  ] || 0;
        this[ 10 ] = ( arr[ 10 ] !== undefined ) ? arr[ 10 ] : 1;
        this[ 14 ] = arr[ 14 ] || 0;

        this[ 3  ] = arr[ 3  ] || 0;
        this[ 7  ] = arr[ 7  ] || 0;
        this[ 11 ] = arr[ 11 ] || 0;
        this[ 15 ] = ( arr[ 15 ] !== undefined ) ? arr[ 15 ] : 1;

        this.length = 16;

        for( var i = 1; i < 5; i++ )
        for( var j = 1; j < 5; j++ ){
            var m = '' + i + j,
                n = ( m/10|0 ) + ( m % 10 ) * 4 - 5;
            this.__defineGetter__( 'm' + m, ( function( n ){
                return function( ){
                    return this[ n ];
                }
            } )( n ) );
            this.__defineSetter__( 'm' + m, ( function( n ){
                return function( v ){
                    this[ n ] = v;
                }
            } )( n ) );
        }

        return this;

    }

    Mat4.prototype = new Array( );

    Mat4.prototype.val = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ){

        if( typeof m11 === 'number' && typeof m44 === 'number' ){

            this[ 0 ] = m11; this[ 4 ] = m12; this[ 8  ] = m13; this[ 12 ] = m14;
            this[ 1 ] = m21; this[ 5 ] = m22; this[ 9  ] = m23; this[ 13 ] = m24;
            this[ 2 ] = m31; this[ 6 ] = m32; this[ 10 ] = m33; this[ 14 ] = m34;
            this[ 3 ] = m41; this[ 7 ] = m42; this[ 11 ] = m43; this[ 15 ] = m44;

            return this;

        }else if( m11 instanceof Mat4 && m12 === undefined ){

            return this.val(
                m11.m11, m11.m12, m11.m13, m11.m14,
                m11.m21, m11.m22, m11.m23, m11.m24,
                m11.m31, m11.m32, m11.m33, m11.m34,
                m11.m41, m11.m42, m11.m43, m11.m44
            );

        }else{
            return this.val.apply( this, m11 );
        }

    };

    Mat4.prototype.valGL = function( n0, n1, n2, n3, n4, n5, n6, n7, n8, n9, n10, n11, n12, n13, n14, n15 ){

        if( typeof n0 === 'number' && typeof n15 === 'number' ){
            this[ 0  ] = n0;  this[ 1  ] = n1;  this[ 2  ] = n2;  this[ 3  ] = n3;
            this[ 4  ] = n4;  this[ 5  ] = n5;  this[ 6  ] = n6;  this[ 7  ] = n7;
            this[ 8  ] = n8;  this[ 9  ] = n9;  this[ 10 ] = n10; this[ 11 ] = n11;
            this[ 12 ] = n12; this[ 13 ] = n13; this[ 14 ] = n14; this[ 15 ] = n15;
            return this;
        }else if( Array.isArray( n0 ) && n1 === undefined ){
            return this.valGL.apply( this, n0 );
        }

    };

    Mat4.prototype.clone = function( ){

        return new Mat4( ).val( this );

    };

    Mat4.prototype.zero = function( ) {

        for( var i = 0; i < 16; i++ ){
            this[ i ] = 0;
        }

        return this;

    };
    Mat4.prototype.identity = function( ) {

        this.zero( );

        this.m11 = 1;
        this.m22 = 1;
        this.m33 = 1;
        this.m44 = 1;

        return this;

    };
    Mat4.prototype.determinant = function( ){

        var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14;
        var m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24;
        var m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34;
        var m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44;

        return (
            m41 * (
                + m14 * m23 * m32
                - m13 * m24 * m32
                - m14 * m22 * m33
                + m12 * m24 * m33
                + m13 * m22 * m34
                - m12 * m23 * m34
            ) +
            m42 * (
                + m11 * m23 * m34
                - m11 * m24 * m33
                + m14 * m21 * m33
                - m13 * m21 * m34
                + m13 * m24 * m31
                - m14 * m23 * m31
            ) +
            m43 * (
                + m11 * m24 * m32
                - m11 * m22 * m34
                - m14 * m21 * m32
                + m12 * m21 * m34
                + m14 * m22 * m31
                - m12 * m24 * m31
            ) +
            m44 * (
                - m13 * m22 * m31
                - m11 * m23 * m32
                + m11 * m22 * m33
                + m13 * m21 * m32
                - m12 * m21 * m33
                + m12 * m23 * m31
            )

        );

    };
    Mat4.prototype.transpose = function( ) {

        var tmp;

        tmp = this.m21; this.m21 = this.m12; this.m12 = tmp;
        tmp = this.m31; this.m31 = this.m13; this.m13 = tmp;
        tmp = this.m32; this.m32 = this.m23; this.m23 = tmp;

        tmp = this.m41; this.m41 = this.m14; this.m14 = tmp;
        tmp = this.m42; this.m42 = this.m24; this.m24 = tmp;
        tmp = this.m43; this.m43 = this.m34; this.m34 = tmp;

        return this;

    };
    Mat4.prototype.invert = function( m ) {

        if( m ){

            return this.val( m ).invert( );

        }else{

            var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14,
                m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24,
                m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34,
                m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44

            determinant = this.determinant( );

            if( determinant === 0 ) {
                throw( "Matrix determinant is zero, can't invert." );
            }

            this.m11 = m23 * m34 * m42 - m24 * m33 * m42 + m24 * m32 * m43 - m22 * m34 * m43 - m23 * m32 * m44 + m22 * m33 * m44;
            this.m12 = m14 * m33 * m42 - m13 * m34 * m42 - m14 * m32 * m43 + m12 * m34 * m43 + m13 * m32 * m44 - m12 * m33 * m44;
            this.m13 = m13 * m24 * m42 - m14 * m23 * m42 + m14 * m22 * m43 - m12 * m24 * m43 - m13 * m22 * m44 + m12 * m23 * m44;
            this.m14 = m14 * m23 * m32 - m13 * m24 * m32 - m14 * m22 * m33 + m12 * m24 * m33 + m13 * m22 * m34 - m12 * m23 * m34;
            this.m21 = m24 * m33 * m41 - m23 * m34 * m41 - m24 * m31 * m43 + m21 * m34 * m43 + m23 * m31 * m44 - m21 * m33 * m44;
            this.m22 = m13 * m34 * m41 - m14 * m33 * m41 + m14 * m31 * m43 - m11 * m34 * m43 - m13 * m31 * m44 + m11 * m33 * m44;
            this.m23 = m14 * m23 * m41 - m13 * m24 * m41 - m14 * m21 * m43 + m11 * m24 * m43 + m13 * m21 * m44 - m11 * m23 * m44;
            this.m24 = m13 * m24 * m31 - m14 * m23 * m31 + m14 * m21 * m33 - m11 * m24 * m33 - m13 * m21 * m34 + m11 * m23 * m34;
            this.m31 = m22 * m34 * m41 - m24 * m32 * m41 + m24 * m31 * m42 - m21 * m34 * m42 - m22 * m31 * m44 + m21 * m32 * m44;
            this.m32 = m14 * m32 * m41 - m12 * m34 * m41 - m14 * m31 * m42 + m11 * m34 * m42 + m12 * m31 * m44 - m11 * m32 * m44;
            this.m33 = m12 * m24 * m41 - m14 * m22 * m41 + m14 * m21 * m42 - m11 * m24 * m42 - m12 * m21 * m44 + m11 * m22 * m44;
            this.m34 = m14 * m22 * m31 - m12 * m24 * m31 - m14 * m21 * m32 + m11 * m24 * m32 + m12 * m21 * m34 - m11 * m22 * m34;
            this.m41 = m23 * m32 * m41 - m22 * m33 * m41 - m23 * m31 * m42 + m21 * m33 * m42 + m22 * m31 * m43 - m21 * m32 * m43;
            this.m42 = m12 * m33 * m41 - m13 * m32 * m41 + m13 * m31 * m42 - m11 * m33 * m42 - m12 * m31 * m43 + m11 * m32 * m43;
            this.m43 = m13 * m22 * m41 - m12 * m23 * m41 - m13 * m21 * m42 + m11 * m23 * m42 + m12 * m21 * m43 - m11 * m22 * m43;
            this.m44 = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;

            return this.multiply( 1 / determinant );
            
        }

    };



    Mat4.prototype.multiply = function( m1, m2 ) {

        if( m1 instanceof Mat4 && m2 instanceof Mat4 ){

            this.m11 = m1.m11 * m2.m11 + m1.m12 * m2.m21 + m1.m13 * m2.m31 + m1.m14 * m2.m41;
            this.m12 = m1.m11 * m2.m12 + m1.m12 * m2.m22 + m1.m13 * m2.m32 + m1.m14 * m2.m42;
            this.m13 = m1.m11 * m2.m13 + m1.m12 * m2.m23 + m1.m13 * m2.m33 + m1.m14 * m2.m43;
            this.m14 = m1.m11 * m2.m14 + m1.m12 * m2.m24 + m1.m13 * m2.m34 + m1.m14 * m2.m44;

            this.m21 = m1.m21 * m2.m11 + m1.m22 * m2.m21 + m1.m23 * m2.m31 + m1.m24 * m2.m41;
            this.m22 = m1.m21 * m2.m12 + m1.m22 * m2.m22 + m1.m23 * m2.m32 + m1.m24 * m2.m42;
            this.m23 = m1.m21 * m2.m13 + m1.m22 * m2.m23 + m1.m23 * m2.m33 + m1.m24 * m2.m43;
            this.m24 = m1.m21 * m2.m14 + m1.m22 * m2.m24 + m1.m23 * m2.m34 + m1.m24 * m2.m44;

            this.m31 = m1.m31 * m2.m11 + m1.m32 * m2.m21 + m1.m33 * m2.m31 + m1.m34 * m2.m41;
            this.m32 = m1.m31 * m2.m12 + m1.m32 * m2.m22 + m1.m33 * m2.m32 + m1.m34 * m2.m42;
            this.m33 = m1.m31 * m2.m13 + m1.m32 * m2.m23 + m1.m33 * m2.m33 + m1.m34 * m2.m43;
            this.m34 = m1.m31 * m2.m14 + m1.m32 * m2.m24 + m1.m33 * m2.m34 + m1.m34 * m2.m44;

            this.m41 = m1.m41 * m2.m11 + m1.m42 * m2.m21 + m1.m43 * m2.m31 + m1.m44 * m2.m41;
            this.m42 = m1.m41 * m2.m12 + m1.m42 * m2.m22 + m1.m43 * m2.m32 + m1.m44 * m2.m42;
            this.m43 = m1.m41 * m2.m13 + m1.m42 * m2.m23 + m1.m43 * m2.m33 + m1.m44 * m2.m43;
            this.m44 = m1.m41 * m2.m14 + m1.m42 * m2.m24 + m1.m43 * m2.m34 + m1.m44 * m2.m44;

            return this;

        }else if( m1 instanceof Mat4 && m2 === undefined  ){

            return this.multiply( this, m1 );

        }else if( typeof m1 === 'number' && m2 === undefined ){
            
            this.m11 = this.m11 * m1; this.m12 = this.m12 * m1; this.m13 = this.m13 * m1; this.m14 = this.m14 * m1;
            this.m21 = this.m21 * m1; this.m22 = this.m22 * m1; this.m23 = this.m23 * m1; this.m24 = this.m24 * m1;
            this.m31 = this.m31 * m1; this.m32 = this.m32 * m1; this.m33 = this.m33 * m1; this.m34 = this.m34 * m1;
            this.m41 = this.m41 * m1; this.m42 = this.m42 * m1; this.m43 = this.m43 * m1; this.m44 = this.m44 * m1;

            return this;

        }
    
    };



    // ---------- ---------- For Camera ---------- ---------- //
    Mat4.prototype.frustum = function ( left, right, bottom, top, near, far ) {

        var a =  ( right + left )   / ( right - left ),
            b =  ( top + bottom )   / ( top - bottom ),
            c = -( far + near )     / ( far - near   ),
            d = -2 * far * near     / ( far - near   ),
            x =  2 * near           / ( right - left ),
            y =  2 * near           / ( top - bottom );

        return this.val(
            x,  0,  a,  0,
            0,  y,  b,  0,
            0,  0,  c,  d,
            0,  0, -1,  0
        );

    };
    Mat4.prototype.perspective = function ( fov, aspect, near, far ) {

        var ymax = near * Math.tan( fov * Math.PI / 360 );
        var ymin = - ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        return this.frustum( xmin, xmax, ymin, ymax, near, far );

    };
    Mat4.prototype.lookAt = function( ) {

        var x = Vec3( ),
            y = Vec3( ),
            z = Vec3( );

        return function( eye, target, up ){

            z.sub( eye, target ).normalize( );

            if ( z.length1( ) === 0 ) {

                z.z = 1;

            }

            x.cross( up, z ).normalize( );

            if ( x.length1( ) === 0 ) {

                z.x += 0.0001;
                x.cross( up, z ).normalize( );

            }

            y.cross( z, x );

            this.m11 = x.x; this.m12 = y.x; this.m13 = z.x;
            this.m21 = x.y; this.m22 = y.y; this.m23 = z.y;
            this.m31 = x.z; this.m32 = y.z; this.m33 = z.z;

            return this;

        }


    }( );
    Mat4.prototype.maxScaleOnAxis = function ( ) {

        var scaleXSq = this[ 0 ] * this[ 0 ] + this[ 1 ] * this[ 1 ] + this[ 2  ] * this[ 2  ];
        var scaleYSq = this[ 4 ] * this[ 4 ] + this[ 5 ] * this[ 5 ] + this[ 6  ] * this[ 6  ];
        var scaleZSq = this[ 8 ] * this[ 8 ] + this[ 9 ] * this[ 9 ] + this[ 10 ] * this[ 10 ];

        return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

    };

    Mat4.prototype.setFromQuaternion = function( q ){

        var x = q.x, y = q.y, z = q.z, w = q.w;
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;

        this[0] = 1 - ( yy + zz );
        this[4] = xy - wz;
        this[8] = xz + wy;

        this[1] = xy + wz;
        this[5] = 1 - ( xx + zz );
        this[9] = yz - wx;

        this[2] = xz - wy;
        this[6] = yz + wx;
        this[10] = 1 - ( xx + yy );

        // last column
        this[3] = 0; this[7] = 0; this[11] = 0;

        // bottom row
        this[12] = 0;  this[13] = 0; this[14] = 0; this[15] = 1;

        return this;

    };

    Mat4.prototype.makeScale = function( v ){

        var x = v.x, y = v.y, z = v.z;

        this[0] *= x; this[4] *= y; this[8 ] *= z;
        this[1] *= x; this[5] *= y; this[9 ] *= z;
        this[2] *= x; this[6] *= y; this[10] *= z;
        this[3] *= x; this[7] *= y; this[11] *= z;

        return this;

    };

    Mat4.prototype.setPosition = function( v ){
        this[12] = v.x;
        this[13] = v.y;
        this[14] = v.z;
        return this;
    };

    Mat4.prototype.compose = function( position, rotation, scale ){
        this.setFromQuaternion( rotation.quaternion );
        this.makeScale( scale );
        this.setPosition( position );
        return this;
    };

    Mat4.prototype.getMaxScaleOnAxis = function () {

        var scaleXSq = this[0] * this[0] + this[1] * this[1] + this[2 ] * this[2 ];
        var scaleYSq = this[4] * this[4] + this[5] * this[5] + this[6 ] * this[6 ];
        var scaleZSq = this[8] * this[8] + this[9] * this[9] + this[10] * this[10];

        return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

    };

    return Mat4;

} );