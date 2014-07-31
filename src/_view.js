define( [ 'Scene', 'PerspectiveCamera', 'WebGLRenderer' ], function ( Scene, PerspectiveCamera, WebGLRenderer ) {

    var View = Scene.extend( {

        defaults: Scene._.extend( {
            width: window.innerWidth,
            height: window.innerHeight
        }, Scene.prototype.defaults ),

        initialize: function( options ){
            this.camera = new PerspectiveCamera( );
            this.renderer = new WebGLRenderer( );
            View.super.initialize.call( this, options );
            options && this.setSize( options.width, options.height );

            
            this.__defineGetter__( 'width', function( ){
                return this.__width;
            } );
            this.__defineGetter__( 'height', function( ){
                return this.__height;
            } );


            this.render( );
        },

        setSize: function( w, h ){
            this.__width = w;
            this.__height = h;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix( );
            this.renderer.width = w;
            this.renderer.height = h;
        },

        setCamera: function( camera ){
            this.camera = camera;
        },

        render: function( ){
            requestAnimationFrame( this.render.bind( this ) );
            this.renderer.render( this, this.camera );
        },

        setRenderer: function( renderer ){
            this.renderer = renderer;
            if( !renderer.element.parentNode ) document.body.appendChild( renderer.element );
            renderer.width = this.width;
            renderer.height = this.height;
        }

    } );

    return View;

} );