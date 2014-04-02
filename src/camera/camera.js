define( [ 'Node', 'Mat4' ], function( Node, Mat4 ) {

    var Camera = Node.extend( {

        defaults: Node._.extend( {}, Node.prototype.defaults ),

        initialize: function( cid, options ){
            Camera.super.initialize.call( this, cid, options );
            this.projectionMatrix = new Mat4( );
        },
        init: function( options ){
            Node.prototype.init.call( this, options );
        },
        lookAt: function( vector ){

            vector = vector || this.target;
            var tmp = this.localMatrix.clone( );
            tmp.lookAt( this.position, vector, this.up );

            this.rotation.setFromRotationMatrix( tmp );

            return this;

        }

    } );

    return Camera;

} );