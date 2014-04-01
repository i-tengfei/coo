define( function ( ) {

    function Quaternion( x, y, z, w ){

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = ( w !== undefined ) ? w : 1;

    }

    Quaternion.prototype = {

        setFromRotation: function( v ){
            
            var c1 = Math.cos( v.__x / 2 );
            var c2 = Math.cos( v.__y / 2 );
            var c3 = Math.cos( v.__z / 2 );
            var s1 = Math.sin( v.__x / 2 );
            var s2 = Math.sin( v.__y / 2 );
            var s3 = Math.sin( v.__z / 2 );

            if ( v.order === 'XYZ' ) {

                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;

            }
            return this;
        },

        setFromAngle: function( axis, angle ){

            var halfAngle = angle / 2,
                s = Math.sin( halfAngle );

            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = Math.cos( halfAngle );

            return this;

        }

    };

    return Quaternion;

} );