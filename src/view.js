define( [ 'Scene', 'PerspectiveCamera', 'WebGLRenderer' ], function ( Scene, PerspectiveCamera, WebGLRenderer ) {

    var View = Scene.extend( {

        defaults: Scene._.extend( {
            width: window.innerWidth,
            height: window.innerHeight
        }, Scene.prototype.defaults ),

        initialize: function( cid, options ){
            this.camera = new PerspectiveCamera( );
            this.renderer = new WebGLRenderer( );
            View.super.initialize.call( this, cid, options );
            this.__defineGetter__( 'width', function( ){
                return this.__width;
            } );
            this.__defineGetter__( 'height', function( ){
                return this.__height;
            } );
            this.render( );
        },

        init: function( options ){
            Scene.prototype.init.call( this, options );
            this.setSize( options.width, options.height );
        },

        setSize: function( w, h ){
            this.__width = w;
            this.__height = h;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix( );
            this.renderer.width = w;
            this.renderer.height = h;
        },

        setCamera: function( cid ){
            var camera = cid;
            if( typeof cid === 'string' ){
                camera = this.find( cid );
            }
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