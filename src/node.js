define( [ 'UUID', 'Mat4', 'Vec3', 'Rotation' ], function ( UUID, Mat4, Vec3, Rotation ) {

    var Node = UUID.extend( {

        defaults: {
            position: [0,0,0],
            rotation: [0,0,0],
            target: [0,0,0],
            scale: [1,1,1],
            up: [0,1,0]
        },

        initialize: function( cid, options ){

            Node.super.initialize.call( this, cid, options );

            this.localMatrix = Mat4( );
            this.worldMatrix = Mat4( );

            this.parent = null;
            this.children = [];

            return this;

        },

        init: function( options ){

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

        }

    } );

    return Node;

} );