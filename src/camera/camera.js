define( [ 'Node', 'Mat4' ], function( Node, Mat4 ) {

    var Camera = Node.extend( {

        initialize: function( ){
            Camera.super.initialize.call( this );
            this.projectionMatrix = new Mat4( );
        },
        lookAt: function( vector ){

            vector = vector || this.target;
            var tmp = this.localMatrix.clone( );
            tmp.lookAt( this.position, vector, this.up );

            this.rotation.setFromRotationMatrix( tmp );

        }

    } );

    return Camera;

} );