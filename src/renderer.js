define( [ 'Base', 'Vec4', 'Shader', 'Mat4', 'Material', 'Projector' ], function ( Base, Vec4, Shader, Mat4, Material, Projector ) {

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

            this.projector = new Projector( );

            this.extensions = {};
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

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            GL.viewport( 0, 0, canvas.width, canvas.height );

        },
        render: function( scene, camera ){

            var GL = this.GL,
                projector = this.projector;
            this.clearColor( );

            projector.projectScene( scene, camera );

            GL.disable( GL.BLEND );
            GL.enable( GL.DEPTH_TEST );
            // GL.enable( GL.CULL_FACE );
            // GL.enable( GL.FRONT );
            Renderer._.each( projector.opaqueObjects, this.renderMesh, this );

            // updateScene;
            // scene.trigger('beforerender', this, scene, camera);
            // 不透明队列与透明队列分别处理
            // var opaqueRenderInfo = this.renderQueue(opaqueQueue, camera, sceneMaterial, preZ);
            GL.enable( GL.BLEND );
            // var transparentRenderInfo = this.renderQueue(transparentQueue, camera, sceneMaterial);
            // scene.trigger( 'afterrender', this, scene, camera, renderInfo );


        },

        renderMesh: function( mesh ){

            var GL = this.GL,
                projector = this.projector;

            var geometry = mesh.geometry,
                material = mesh.material;

            var shader;

            if( material.shader ){
                shader = material.shader;
            }else{
                shader = material.shader = new Shader( material.source.vertex, material.source.fragment, GL );
                shader.compile( [ {
                    name: 'modelMatrix',
                    type: 'Matrix4fv'
                }, {
                    name: 'viewMatrix',
                    type: 'Matrix4fv'
                }, {
                    name: 'projectionMatrix',
                    type: 'Matrix4fv'
                } ], geometry.data );
            }

            if( this.currentShader !== shader ){
                shader.use( );
                this.currentShader = shader;
            }

            Renderer._.each( geometry.data, function( x ){
                this.currentShader.setAttributeData( x.name, x.data );
            }, this );


            this.currentShader.draw( );
            
            // shader.setUniformData( 'viewMatrix', new Float32Array( projector.cameraViewMatrix ) );
            // shader.setUniformData( 'modelMatrix', new Float32Array( mesh.worldMatrix ) );
            // shader.setUniformData( 'projectionMatrix', new Float32Array( projector.projectionMatrix ) );

            // shader.draw( geometry.count );

        },

        clearColor: function( ){

            var GL = this.GL,
                color = this.get( 'color' );

            GL.clearColor( color.r, color.g, color.b, color.a );
            GL.clear( GL.COLOR_BUFFER_BIT );

        }

    } );

    return Renderer;

} );