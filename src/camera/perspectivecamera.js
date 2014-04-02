define( [ 'Camera' ], function( Camera ) {

    var PerspectiveCamera = Camera.extend( {

        defaults: Camera._.extend( {
            fov: 45,
            aspect: 1,
            near: 0.1,
            far: 2000
        }, Camera.prototype.defaults ),

        initialize: function( cid, options ){

            PerspectiveCamera.super.initialize.call( this, cid, options );
            
            this.updateProjectionMatrix( );

        },

        init: function( options ){
            Camera.prototype.init.call( this, options );
            this.fov = options.fov;
            this.aspect = options.aspect;
            this.near = options.near;
            this.far = options.far;
        },

        updateProjectionMatrix: function( ){
            this.projectionMatrix.perspective( this.fov, this.aspect, this.near, this.far );
        }

    } );

    return PerspectiveCamera;

} );