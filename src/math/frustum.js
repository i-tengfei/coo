define( [ 'Plane', 'Vec3', 'Sphere' ], function ( Plane, Vec3, Sphere ) {

    function Frustum( p0, p1, p2, p3, p4, p5 ){

        if( ! ( this instanceof Frustum ) ){
            return new Frustum( p0, p1, p2, p3, p4, p5 );
        }

        this.planes = [

            ( p0 !== undefined ) ? p0 : Plane( ),
            ( p1 !== undefined ) ? p1 : Plane( ),
            ( p2 !== undefined ) ? p2 : Plane( ),
            ( p3 !== undefined ) ? p3 : Plane( ),
            ( p4 !== undefined ) ? p4 : Plane( ),
            ( p5 !== undefined ) ? p5 : Plane( )

        ];

        return this;

    }

    Frustum.prototype = {

        constructor: Frustum,

        val: function ( p0, p1, p2, p3, p4, p5 ) {

            var planes = this.planes;

            planes[0].copy( p0 ); planes[1].copy( p1 );
            planes[2].copy( p2 ); planes[3].copy( p3 );
            planes[4].copy( p4 ); planes[5].copy( p5 );

            return this;

        },

        copy: function ( frustum ) {

            var planes = this.planes;

            for( var i = 0; i < 6; i ++ ) {

                planes[i].copy( frustum.planes[i] );

            }

            return this;

        },

        setFromMat: function ( m ) {

            var planes = this.planes;

            planes[ 0 ].setComponents( m.m41 - m.m11, m.m42 - m.m12, m.m43 - m.m13, m.m44 - m.m14 ).normalize( );
            planes[ 1 ].setComponents( m.m41 + m.m11, m.m42 + m.m12, m.m43 + m.m13, m.m44 + m.m14 ).normalize( );
            planes[ 2 ].setComponents( m.m41 + m.m21, m.m42 + m.m22, m.m43 + m.m23, m.m44 + m.m24 ).normalize( );
            planes[ 3 ].setComponents( m.m41 - m.m21, m.m42 - m.m22, m.m43 - m.m23, m.m44 - m.m24 ).normalize( );
            planes[ 4 ].setComponents( m.m41 - m.m31, m.m42 - m.m32, m.m43 - m.m33, m.m44 - m.m34 ).normalize( );
            planes[ 5 ].setComponents( m.m41 + m.m31, m.m42 + m.m32, m.m43 + m.m33, m.m44 + m.m34 ).normalize( );

            return this;

        },

        intersectsSphere: function ( sphere ) {

            var planes = this.planes;
            var center = sphere.center;
            var negRadius = -sphere.radius;

            for ( var i = 0; i < 6; i ++ ) {

                var distance = planes[ i ].distanceToPoint( center );

                if ( distance < negRadius ) {

                    return false;

                }

            }

            return true;

        },

        intersectsBox : function( ) {

            var p1 = Vec3( ),
                p2 = Vec3( );

            return function( box ) {

                var planes = this.planes;
                
                for ( var i = 0; i < 6 ; i ++ ) {
                
                    var plane = planes[i];
                    
                    p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
                    p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
                    p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
                    p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
                    p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
                    p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

                    var d1 = plane.distanceToPoint( p1 );
                    var d2 = plane.distanceToPoint( p2 );
                    
                    // if both outside plane, no intersection

                    if ( d1 < 0 && d2 < 0 ) {
                        
                        return false;
            
                    }
                }

                return true;
            };

        }( ),


        containsPoint: function ( point ) {

            var planes = this.planes;

            for ( var i = 0; i < 6; i ++ ) {

                if ( planes[ i ].distanceToPoint( point ) < 0 ) {

                    return false;

                }

            }

            return true;

        },

        clone: function ( ) {

            return Frustum( ).copy( this );

        }

    };

    return Frustum;

} );