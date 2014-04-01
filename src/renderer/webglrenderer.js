define( [ 'Renderer', 'Vec4', 'Shader', 'Uniform', 'CONST' ], function( Renderer, Vec4, Shader, Uniform, CONST ) {

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

        attrs: {

            webGLContextAttrs: {
                alpha: true,
                depth: true,
                stencil: false,
                antialias: true,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false
            },

            color: Vec4( )

        },

        initialize: function( canvas ){

            this.extensions = {};
            this.shader = null;

            WebGLRenderer.super.initialize.call( this, canvas );
            
            this.__GL = this.context;
            this.__defineGetter__( 'GL', function( ){
                return this.__GL;
            } );



            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            this.GL.viewport( 0, 0, canvas.width, canvas.height );

        },

        render: function( scene, camera ){
            
            WebGLRenderer.super.render.call( this, scene, camera );

            this.renderDisplayArray( this.projector.opaqueObjects );
            this.renderDisplayArray( this.projector.transparentObjects );

        },

        createContext: function( canvas ){

            try {

                var GL = canvas.getContext( 'webgl', this.get( 'webGLContextAttrs' ) ) || canvas.getContext( 'experimental-webgl', this.get( 'webGLContextAttrs' ) );
                // 添加扩展
                Renderer._.each( this.EXTENSIONS, function( x ){
                    
                    var ext = GL.getExtension( x );
                    if ( !ext ) {
                        ext = GL.getExtension( 'MOZ_' + x );
                    }
                    if ( !ext ) {
                        ext = GL.getExtension( 'WEBKIT_' + x );
                    }
                    this.extensions[ x ] = ext;
                    
                }, this );

                GL.clearColor.apply( GL, this.get( 'color' ) );

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
                this.renderDisplay( renderable );

            }

        },

        renderDisplay: function( display ){

            var GL = this.GL,
                projector = this.projector;

// console.log(GL.TEXTURE_2D)
// console.log(GL.TEXTURE)
// console.log(GL.INVALID_VALUE)
// console.log(GL.INVALID_OPERATION)
// console.log(GL.OUT_OF_MEMORY)
// console.log(GL.SCISSOR_TEST)
// console.log(GL.POLYGON_OFFSET_FILL)
// console.log(GL.SAMPLE_ALPHA_TO_COVERAGE)
// console.log(GL.SAMPLE_COVERAGE)

            var material    = display.material,
                geometry    = display.geometry;

            GL.enable( CONST.CULL_FACE );

            // ---------- ---------- | Shader | ---------- ---------- //
            var shader = this.buildShader( geometry, material );

            if( shader !== this.shader ) {

                this.disableAttribArrays( );
                this.shader = shader.use( );
                this.enableAttribArrays( );

            }

            // ---------- ---------- | Uniforms | ---------- ---------- //
            material.uniforms.modelMatrix.setData( new Float32Array( display.worldMatrix ) );
            material.uniforms.viewMatrix.setData( new Float32Array( projector.cameraViewMatrix ) );
            material.uniforms.projectionMatrix.setData( new Float32Array( projector.projectionMatrix ) );
            // WebGLRenderer._.each( material.uniforms, function( x ){
            //     x.setData( shader );
            // } );
            // -- 贴图 -- //
            var map = material.map;
            if( !!map && map.ready ) {

                if( !map.data ) {
                    this.processTexture( map );
                }

                GL.activeTexture( CONST.TEXTURE0 + map.index );
                GL.bindTexture( CONST.TEXTURE_2D, map.data );
                uniforms.map.makeValue( map.index, GL, shaderProgram );

            }
            // ---------- ---------- | Attributes | ---------- ---------- //
            WebGLRenderer._.each( geometry.attributes, function( x ){
                x.draw( );
            } );

            shader.draw( );

        },

        enableAttribArrays: function( ){
            if( this.shader ) {
                WebGLRenderer._.each( this.shader.geometry.attributes, function( x ){
                    x.enable( );
                } );
            }
        },

        disableAttribArrays: function( ){
            if( this.shader ) {
                WebGLRenderer._.each( this.shader.geometry.attributes, function( x ){
                    x.disable( );
                } );
            }
        },

        buildShader: function( geometry, material ){

            var GL = this.GL;

            if( !material.shader ){

                var shader = material.shader = new Shader( GL, geometry, material );
                // ---------- Uniforms ---------- //
                // 通用Uniforms
                material.add( new Uniform( 'modelMatrix', 'Matrix4fv' ) );
                material.add( new Uniform( 'viewMatrix', 'Matrix4fv' ) );
                material.add( new Uniform( 'projectionMatrix', 'Matrix4fv' ) );

                WebGLRenderer._.each( material.uniforms, function( x ){
                    x.create( shader );
                } );

                // ---------- Attributes ---------- //
                WebGLRenderer._.each( geometry.attributes, function( x ){
                    x.create( shader );
                } );

            }

            return material.shader;

        },

        clear: function( ){

            var GL = this.GL;
            GL.clear( GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT );

        }

    } );

    return WebGLRenderer;

} );