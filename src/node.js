define( [ 'Base', 'Mat4', 'Vec3', 'Rotation' ], function ( Base, Mat4, Vec3, Rotation ) {

    var Node = Base.extend( {

        initialize: function( ){

            Node.super.initialize.call( this );

            this.localMatrix = Mat4( );
            this.worldMatrix = Mat4( );

            this.parent = null;
            this.children = [];

            this.up = new Vec3( 0,1,0 );

            this.position = new Vec3( );
            this.rotation = new Rotation( );
            this.scale = new Vec3( 1,1,1 );

            this.target = new Vec3( );
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
        },

        remove: function( child ){
            var ind = this.children.indexOf( child );

            if( ~ind ) {

                this.children.splice( ind, 1 );

            }
        },

        updateLocalMatrix: function( ){
            this.localMatrix.compose( this.position, this.rotation, this.scale );
            this.__worldMatrixNeedsUpdate = true;
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

        }

    } );

    return Node;

} );