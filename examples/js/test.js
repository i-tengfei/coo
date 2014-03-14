define( [ 'Base', 'Vec4', 'Shader' ], function ( Base, Vec4, Shader ) {

    var Renderer = Base.extend( {
        
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

        extensions: {},

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

            Renderer.super.initialize.call( this );
            var GL = this.GL = canvas.getContext( 'experimental-webgl', this.get( 'webGLContextAttrs' ) );

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

            GL.viewport( 0, 0, canvas.width, canvas.height );

        },
        render: function( scene, camera ){

            var GL = this.GL;
            this.clearColor( );

            var vertexShaderS = [
            'attribute vec3 position;',

            'void main(void) {',
                'gl_Position = vec4( position, 1.0 );',
            '}' ].join( '\n' );

            var fragmentShaderS = [
            'precision highp float;',

            'void main(void) {',
                'gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );',
            '}' ].join( '\n' );

            var shader = new Shader( vertexShaderS, fragmentShaderS, GL );
            

            var vertices = [  
                 0.0,  1.0,  0.0,
                -1.0, -1.0,  0.0,
                 1.0, -1.0,  0.0
            ];

            var triangleVertexPositionBuffer = GL.createBuffer( );
            GL.bindBuffer( GL.ARRAY_BUFFER, triangleVertexPositionBuffer );
            GL.bufferData( GL.ARRAY_BUFFER, new Float32Array( vertices ), GL.STATIC_DRAW );
            triangleVertexPositionBuffer.itemSize = 3;
            triangleVertexPositionBuffer.numItems = 3;

            GL.bindBuffer( GL.ARRAY_BUFFER, triangleVertexPositionBuffer );
            GL.vertexAttribPointer( shader.attributes[ 'position' ] , triangleVertexPositionBuffer.itemSize, GL.FLOAT, false, 0, 0);
            
            shader.enableAttributes( );

            GL.drawArrays(GL.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


            // updateScene;
            // scene.trigger('beforerender', this, scene, camera);
            // 不透明队列与透明队列分别处理
            GL.disable( GL.BLEND );
            GL.enable( GL.DEPTH_TEST );
            // var opaqueRenderInfo = this.renderQueue(opaqueQueue, camera, sceneMaterial, preZ);
            GL.enable( GL.BLEND );
            // var transparentRenderInfo = this.renderQueue(transparentQueue, camera, sceneMaterial);
            // scene.trigger( 'afterrender', this, scene, camera, renderInfo );


        },
        clearColor: function( ){

            var GL = this.GL,
                color = this.get( 'color' );

            GL.clearColor( color.r, color.g, color.b, color.a );
            GL.clear( GL.COLOR_BUFFER_BIT );

        }

    } );

    var renderer = new Renderer( document.getElementById( 'coo' ) );

    renderer.render( );


} );