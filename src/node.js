define( [ 'Base', 'Mat4', 'Vec3', 'Rotation' ], function ( Base, Mat4, Vec3, Rotation ) {

    var Node = Base.extend( {

        defaults: Base._.extend( {
            position:   [0,0,0],
            rotation:   [0,0,0],
            target:     [0,0,0],
            scale:      [1,1,1],
            up:         [0,1,0]
        }, Base.prototype.defaults ),

        initialize: function( options ){

            Node.super.initialize.call( this, options );

            this.localMatrix = Mat4( );
            this.worldMatrix = Mat4( );

            this.parent = null;
            this.children = [];

            return this;

        },

        initOptions: function( options ){

            Node.super.initOptions.call( this, options );

            this.position = Vec3( options.position );
            this.rotation = Rotation( options.rotation );
            this.target = Vec3( options.target );
            this.scale = Vec3( options.scale );
            this.up = Vec3( options.up );
            
        },

        add: function( child ){
            if( arguments.length > 1 ){

                for( var i = 0, il = arguments.length; i < il; i++ ){
                    this.add( arguments[i] );
                }

            }else if( Array.isArray( child ) ){

                for( var i = 0, il = child.length; i < il; i++ ){
                    this.add( child[i] );
                }

            } else if( child instanceof Node ) {

                if( !!child.parent ) {
                    child.parent.remove( child );
                }

                child.parent = this;
                this.children.push( child );

            } else {

                throw( '子对象必须继承于 Node' );

            }
            return this;
        },

        decomposeMatrix: function( ){

            var vector = Vec3( );
            var matrix = Mat4( );

            return function( m ){

                m = m || this.localMatrix;

                var sx = vector.val( m[0], m[1], m[2 ] ).length1( );
                var sy = vector.val( m[4], m[5], m[6 ] ).length1( );
                var sz = vector.val( m[8], m[9], m[10] ).length1( );

                var det = m.determinant( );
                if( det < 0 ) {
                    sx = -sx;
                }

                this.position.val( m[12], m[13], m[14] );

                matrix.val( m );

                var invSX = 1 / sx;
                var invSY = 1 / sy;
                var invSZ = 1 / sz;

                matrix[0 ] *= invSX;
                matrix[1 ] *= invSX;
                matrix[2 ] *= invSX;

                matrix[4 ] *= invSY;
                matrix[5 ] *= invSY;
                matrix[6 ] *= invSY;

                matrix[8 ] *= invSZ;
                matrix[9 ] *= invSZ;
                matrix[10] *= invSZ;

                this.rotation.setFromRotationMatrix( matrix );

                this.scale.val( sx, sy, sz );

                return this;

            };

        }( ),

        remove: function( child ){
            var ind = this.children.indexOf( child );

            if( ~ind ) {

                this.children.splice( ind, 1 );

            }
            return this;
        },

        updateLocalMatrix: function( ){
            this.localMatrix.compose( this.position, this.rotation, this.scale );
            this.__worldMatrixNeedsUpdate = true;
            return this;
        },

        updateWorldMatrix: function( force ){

            this.updateLocalMatrix( );

            if ( this.__worldMatrixNeedsUpdate || force ) {


                if ( !this.parent ) {

                    this.worldMatrix.val( this.localMatrix );

                } else {

                    this.worldMatrix.multiply( this.parent.worldMatrix, this.localMatrix );

                }

                this.__worldMatrixNeedsUpdate = false;
                force = true;

            }

            for ( var i = 0, l = this.children.length; i < l; i ++ ) {

                this.children[ i ].updateWorldMatrix( force );

            }
            return this;

        },

        clone: function( object, recursive ){

            if( object === undefined ) object = new Node( {
                position:   this.position,
                rotation:   this.rotation,
                target:     this.target,
                scale:      this.scale,
                up:         this.up,

                name: this.name,
            } );
            if ( recursive === undefined ) recursive = true;

            object.localMatrix.val( this.localMatrix );
            object.worldMatrix.val( this.worldMatrix );

            if ( recursive === true ) {

                for ( var i = 0; i < this.children.length; i ++ ) {

                    var child = this.children[ i ];
                    object.add( child.clone( ) );

                }

            }

            return object;

        }

    } );

    return Node;

} );