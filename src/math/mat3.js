define( function ( ) {

    function Mat3( m11, m12, m13, m21, m22, m23, m31, m32, m33 ){

        if( ! ( this instanceof Mat3 ) ){
            return new Mat3( m11, m12, m13, m21, m22, m23, m31, m32, m33 );
        }

        var arr = ( Array.isArray( m11 ) && m12 === undefined ) ? Array.apply( this, m11 ) : Array.apply( this, arguments );

        this[ 0 ] = ( arr[ 0 ] !== undefined ) ? arr[ 0 ] : 1;
        this[ 3 ] = arr[ 3 ] || 0;
        this[ 6 ] = arr[ 6 ] || 0;

        this[ 1 ] = arr[ 1 ] || 0;
        this[ 4 ] = ( arr[ 4 ] !== undefined ) ? arr[ 4 ] : 1;
        this[ 7 ] = arr[ 7 ] || 0;

        this[ 2 ] = arr[ 2 ] || 0;
        this[ 5 ] = arr[ 5 ] || 0;
        this[ 8 ] = ( arr[ 8 ] !== undefined ) ? arr[ 8 ] : 1;

        this.length = 9;

        for( var i = 1; i < 4; i++ )
        for( var j = 1; j < 4; j++ ){
            var m = '' + i + j,
                n = ( m/10|0 ) + ( m % 10 ) * 3 - 4;
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

    Mat3.prototype = new Array( );

    Mat3.prototype.val = function( m11, m12, m13, m21, m22, m23, m31, m32, m33 ){

        if( typeof m11 === 'number' && typeof m33 === 'number' ){

            this[ 0 ] = m11; this[ 3 ] = m12; this[ 6 ] = m13;
            this[ 1 ] = m21; this[ 4 ] = m22; this[ 7 ] = m23;
            this[ 2 ] = m31; this[ 5 ] = m32; this[ 8 ] = m33;

            return this;

        }else if( m11 instanceof Mat3 && m12 === undefined ){

            return this.val(
                m11.m11, m11.m12, m11.m13,
                m11.m21, m11.m22, m11.m23,
                m11.m31, m11.m32, m11.m33
            );

        }else{
            return this.val.apply( this, m11 );
        }

    };

    Mat3.prototype.valGL = function( n0, n1, n2, n3, n4, n5, n6, n7, n8 ){

        if( typeof n0 === 'number' && typeof n15 === 'number' ){
            this[ 0 ] = n0;  this[ 1 ] = n1;  this[ 2 ] = n2;
            this[ 3 ] = n3;  this[ 4 ] = n4;  this[ 5 ] = n5;
            this[ 6 ] = n6;  this[ 7 ] = n7;  this[ 8 ] = n8;
            return this;
        }else if( Array.isArray( n0 ) && n1 === undefined ){
            return this.valGL.apply( this, n0 );
        }

    };

    Mat3.prototype.clone = function( ){

        return new Mat3( ).val( this );

    };

    Mat3.prototype.zero = function( ) {

        for( var i = 0; i < 9; i++ ){
            this[ i ] = 0;
        }

        return this;

    };
    Mat3.prototype.identity = function( ) {

        this.zero( );

        this.m11 = 1;
        this.m22 = 1;
        this.m33 = 1;

        return this;

    };
    Mat3.prototype.determinant = function( ){

        var a = this[ 0 ], b = this[ 1 ], c = this[ 2 ],
            d = this[ 3 ], e = this[ 4 ], f = this[ 5 ],
            g = this[ 6 ], h = this[ 7 ], i = this[ 8 ];

        return a*e*i - a*f*h - b*d*i + b*f*g + c*d*h - c*e*g;

    };
    Mat3.prototype.transpose = function( ) {

        var tmp;

        tmp = this.m21; this.m21 = this.m12; this.m12 = tmp;
        tmp = this.m31; this.m31 = this.m13; this.m13 = tmp;
        tmp = this.m32; this.m32 = this.m23; this.m23 = tmp;

        return this;

    };


    Mat3.prototype.invertMat4 = function( m4 ){

        this[ 0 ] =   m4[ 10 ] * m4[ 5 ] - m4[ 6 ] * m4[ 9 ];
        this[ 1 ] = - m4[ 10 ] * m4[ 1 ] + m4[ 2 ] * m4[ 9 ];
        this[ 2 ] =   m4[ 6  ] * m4[ 1 ] - m4[ 2 ] * m4[ 5 ];
        this[ 3 ] = - m4[ 10 ] * m4[ 4 ] + m4[ 6 ] * m4[ 8 ];
        this[ 4 ] =   m4[ 10 ] * m4[ 0 ] - m4[ 2 ] * m4[ 8 ];
        this[ 5 ] = - m4[ 6  ] * m4[ 0 ] + m4[ 2 ] * m4[ 4 ];
        this[ 6 ] =   m4[ 9  ] * m4[ 4 ] - m4[ 5 ] * m4[ 8 ];
        this[ 7 ] = - m4[ 9  ] * m4[ 0 ] + m4[ 1 ] * m4[ 8 ];
        this[ 8 ] =   m4[ 5  ] * m4[ 0 ] - m4[ 1 ] * m4[ 4 ];

        var determinant = m4[ 0 ] * this[ 0 ] + m4[ 1 ] * this[ 3 ] + m4[ 2 ] * this[ 6 ];

        if( determinant === 0 ) {
            throw( "Matrix determinant is zero, can't invert." );
        }

        return this.multiply( 1 / determinant );
        
    };


    Mat3.prototype.multiply = function( m1, m2 ) {

        if( m1 instanceof Mat3 && m2 instanceof Mat3 ){

            // this.m11 = m1.m11 * m2.m11 + m1.m12 * m2.m21 + m1.m13 * m2.m31 + m1.m14 * m2.m41;
            // this.m12 = m1.m11 * m2.m12 + m1.m12 * m2.m22 + m1.m13 * m2.m32 + m1.m14 * m2.m42;
            // this.m13 = m1.m11 * m2.m13 + m1.m12 * m2.m23 + m1.m13 * m2.m33 + m1.m14 * m2.m43;
            // this.m14 = m1.m11 * m2.m14 + m1.m12 * m2.m24 + m1.m13 * m2.m34 + m1.m14 * m2.m44;

            // this.m21 = m1.m21 * m2.m11 + m1.m22 * m2.m21 + m1.m23 * m2.m31 + m1.m24 * m2.m41;
            // this.m22 = m1.m21 * m2.m12 + m1.m22 * m2.m22 + m1.m23 * m2.m32 + m1.m24 * m2.m42;
            // this.m23 = m1.m21 * m2.m13 + m1.m22 * m2.m23 + m1.m23 * m2.m33 + m1.m24 * m2.m43;
            // this.m24 = m1.m21 * m2.m14 + m1.m22 * m2.m24 + m1.m23 * m2.m34 + m1.m24 * m2.m44;

            // this.m31 = m1.m31 * m2.m11 + m1.m32 * m2.m21 + m1.m33 * m2.m31 + m1.m34 * m2.m41;
            // this.m32 = m1.m31 * m2.m12 + m1.m32 * m2.m22 + m1.m33 * m2.m32 + m1.m34 * m2.m42;
            // this.m33 = m1.m31 * m2.m13 + m1.m32 * m2.m23 + m1.m33 * m2.m33 + m1.m34 * m2.m43;
            // this.m34 = m1.m31 * m2.m14 + m1.m32 * m2.m24 + m1.m33 * m2.m34 + m1.m34 * m2.m44;

            // this.m41 = m1.m41 * m2.m11 + m1.m42 * m2.m21 + m1.m43 * m2.m31 + m1.m44 * m2.m41;
            // this.m42 = m1.m41 * m2.m12 + m1.m42 * m2.m22 + m1.m43 * m2.m32 + m1.m44 * m2.m42;
            // this.m43 = m1.m41 * m2.m13 + m1.m42 * m2.m23 + m1.m43 * m2.m33 + m1.m44 * m2.m43;
            // this.m44 = m1.m41 * m2.m14 + m1.m42 * m2.m24 + m1.m43 * m2.m34 + m1.m44 * m2.m44;

            return this;

        }else if( m1 instanceof Mat3 && m2 === undefined  ){

            return this.multiply( this, m1 );

        }else if( typeof m1 === 'number' && m2 === undefined ){
            
            this.m11 = this.m11 * m1; this.m12 = this.m12 * m1; this.m13 = this.m13 * m1;
            this.m21 = this.m21 * m1; this.m22 = this.m22 * m1; this.m23 = this.m23 * m1;
            this.m31 = this.m31 * m1; this.m32 = this.m32 * m1; this.m33 = this.m33 * m1;

            return this;

        }
    
    };

    return Mat3;

} );