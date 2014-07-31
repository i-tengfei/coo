define( [ 'Camera' ], function( Camera ) {

    var PerspectiveCamera = Camera.extend( {

        defaults: Camera._.extend( {
            fov: 45,
            aspect: 1,
            near: 0.1,
            far: 2000
        }, Camera.prototype.defaults ),

        initialize: function( options ){

            PerspectiveCamera.super.initialize.call( this, options );
            
            this.updateProjectionMatrix( );

        },

        initOptions: function( options ){

            this.fov = options.fov;
            this.aspect = options.aspect;
            this.near = options.near;
            this.far = options.far;

            PerspectiveCamera.super.initOptions.call( this, options );
            
        },

        updateProjectionMatrix: function( ){
            this.projectionMatrix.perspective( this.fov, this.aspect, this.near, this.far );
        }

    } );

    return PerspectiveCamera;

} );