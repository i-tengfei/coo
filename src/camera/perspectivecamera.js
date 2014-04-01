define( [ 'Camera' ], function( Camera ) {

    var PerspectiveCamera = Camera.extend( {

        initialize: function( fov, aspect, near, far ){

            PerspectiveCamera.super.initialize.call( this );

            this.fov = fov || 45;
            this.aspect = aspect || 1;
            this.near = near || 0.1;
            this.far = far || 2000;
            
            this.updateProjectionMatrix( );

        },

        updateProjectionMatrix: function( ){
            this.projectionMatrix.perspective( this.fov, this.aspect, this.near, this.far );
        }

    } );

    return PerspectiveCamera;

} );