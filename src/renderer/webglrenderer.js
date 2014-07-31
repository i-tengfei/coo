define( [ 'Renderer', 'Uniform', 'CONST', 'Mat3', '' ], function( Renderer, Uniform, CONST, Mat3 ) {

    var _ = Renderer._;

    var WebGLRenderer = Renderer.extend( {

        EXTENSIONS: [
            'OES_texture_float',
            'OES_texture_half_float',
            'OES_texture_float_linear',
            'OES_texture_half_float_linear',
            'OES_standard_derivatives',
            'OES_vertex_array_object',
            'OES_element_index_uint',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_depth_texture',
            'EXT_texture_filter_anisotropic',
            'WEBGL_draw_buffers'
        ],

        defaults: _.extend( {
            webGLContextAttrs: {
                alpha: true,
                depth: true,
                stencil: false,
                antialias: true,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false
            }
        }, Renderer.prototype.defaults ),

        initialize: function( options ){

            this.__extensions = {};
            this.shader = null;

            WebGLRenderer.super.initialize.call( this, options );
            
            this.__GL = this.context;
            this.__defineGetter__( 'GL', function( ){
                return this.__GL;
            } );

            this.__programPool = {};

            this.GL.viewport( 0, 0, this.width, this.height );

        },

        initOptions: function( options ){

            WebGLRenderer.super.initOptions.call( this, options );
            this.webGLContextAttrs = options.webGLContextAttrs;

        },

        render: function( scene, camera ){
            
            WebGLRenderer.super.render.call( this, scene, camera );

            this.renderDisplayArray( this.projector.opaqueObjects );
            // this.renderDisplayArray( this.projector.transparentObjects );

        },

        createContext: function( canvas ){

            try {

                var GL = canvas.getContext( 'webgl', this.webGLContextAttrs ) || canvas.getContext( 'experimental-webgl', this.webGLContextAttrs );
                // 添加扩展
                _.each( this.EXTENSIONS, function( x ){
                    
                    var ext = GL.getExtension( x );
                    if ( !ext ) {
                        ext = GL.getExtension( 'MOZ_' + x );
                    }
                    if ( !ext ) {
                        ext = GL.getExtension( 'WEBKIT_' + x );
                    }
                    this.__extensions[ x ] = ext;
                    
                }, this );

                // GL.clearColor.apply( GL, this.get( 'color' ) );

                this.__context = GL;
                return GL;

            } catch ( exception ) {

                console.error( 'WebGL Context Creation Failed!' );

            }

        },

        renderDisplayArray: function( displayArray ){

            var len = displayArray.length,
                renderable  = null;

            while( len-- ) {

                renderable = displayArray[ len ];
                // this.renderDisplay( renderable );

            }

            this.renderDisplay( displayArray[2] );

        },

        renderDisplay: function( display ){

            console.log( display );

            var GL = this.GL,
                projector = this.projector;

            var material    = display.material,
                geometry    = display.geometry;

            var pass = this.buildPass( material, geometry );

            var usedTextureUnits = 0;

            pass.program.use( );

            // projectionMatrixUniform
            if( pass.projectionMatrixUniform ){
                pass.projectionMatrixUniform.data = projector.projectionMatrix;
            }
            // cameraViewMatrixUniform
            if( pass.cameraViewMatrixUniform ){
                pass.cameraViewMatrixUniform.data = projector.cameraViewMatrix;
            }
            // modelViewMatrixUniform
            if( pass.modelViewMatrixUniform ){
                pass.modelViewMatrixUniform.data = projector.cameraViewMatrix.clone( ).multiply( display.worldMatrix );
            }
            // normalMatrixUniform
            if( pass.normalMatrixUniform ){
                pass.normalMatrixUniform.data = Mat3( ).invertMat4( display.worldMatrix ).transpose( );
            }

            material.render( );
            
            pass.render( );



            geometry.setData( GL );

            geometry.drawElements( GL );


        },

        buildPass: function( material, geometry ){

            var GL = this.GL,
                pass = material.pass,
                program = pass.program;

            program.create( GL );

            pass.create( );

            // TODO: 
            geometry.createIndex( GL );

            return pass;

        },

        enableAttribArrays: function( ){
            if( this.shader ) {
                _.each( this.shader.geometry.attributes, function( x ){
                    x.enable( );
                } );
            }
        },

        disableAttribArrays: function( ){
            if( this.shader ) {
                _.each( this.shader.geometry.attributes, function( x ){
                    x.disable( );
                } );
            }
        },

        clear: function( ){

            var GL = this.GL;
            GL.clear( GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT );

        }

    } );

    return WebGLRenderer;

} );