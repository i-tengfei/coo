define( [ 'Base', 'CONST' ], function ( Base, CONST ) {

    var _ = Base._;

    var Pass = Base.extend( {

        defaults: _.extend( {
            blendEnable: false,
            cullFaceEnable: true,
            depthMask: true,
            depthTestEnable: true
        }, Base.prototype.defaults ),

        initialize: function( options, program ){

            Pass.super.initialize.call( this, options );

            this.program = program;

            this.uniforms = {};
            this.attributes = {};


            this.__defineGetter__( 'projectionMatrixUniform', function( ){
                var name = this.__projectionMatrixName;
                return name ? this.uniforms[ name ] : undefined;
            } );
            this.__defineSetter__( 'projectionMatrixUniform', function( uniform ){
                this.__projectionMatrixName = uniform.name;
                this.addUniform( uniform );
            } );


            this.__defineGetter__( 'cameraViewMatrixUniform', function( ){
                var name = this.__cameraViewMatrixName;
                return name ? this.uniforms[ name ] : undefined;
            } );
            this.__defineSetter__( 'cameraViewMatrixUniform', function( uniform ){
                this.__cameraViewMatrixName = uniform.name;
                this.addUniform( uniform );
            } );


            this.__defineGetter__( 'modelViewMatrixUniform', function( ){
                var name = this.__modelViewMatrixName;
                return name ? this.uniforms[ name ] : undefined;
            } );
            this.__defineSetter__( 'modelViewMatrixUniform', function( uniform ){
                this.__modelViewMatrixName = uniform.name;
                this.addUniform( uniform );
            } );


            this.__defineGetter__( 'normalMatrixUniform', function( ){
                var name = this.__normalMatrixName;
                return name ? this.uniforms[ name ] : undefined;
            } );
            this.__defineSetter__( 'normalMatrixUniform', function( uniform ){
                this.__normalMatrixName = uniform.name;
                this.addUniform( uniform );
            } );




            this.__defineGetter__( 'vertexAttribute', function( ){
                var name = this.__vertexName;
                return name ? this.attributes[ name ] : undefined;
            } );
            this.__defineSetter__( 'vertexAttribute', function( attribute ){
                this.__vertexName = attribute.name;
                this.addAttribute( attribute );
            } );


            this.__defineGetter__( 'texcoordAttribute', function( ){
                var name = this.__texcoordName;
                return name ? this.attributes[ name ] : undefined;
            } );
            this.__defineSetter__( 'texcoordAttribute', function( attribute ){
                this.__texcoordName = attribute.name;
                this.addAttribute( attribute );
            } );


            this.__defineGetter__( 'normalAttribute', function( ){
                var name = this.__normalName;
                return name ? this.attributes[ name ] : undefined;
            } );
            this.__defineSetter__( 'normalAttribute', function( attribute ){
                this.__normalName = attribute.name;
                this.addAttribute( attribute );
            } );

        },

        initOptions: function( options ){

            Pass.super.initOptions.call( this, options );

            this.blendEnable = options.blendEnable;
            this.cullFaceEnable = options.cullFaceEnable;
            this.depthMask = options.depthMask;
            this.depthTestEnable = options.depthTestEnable;

        },

        create: function( ){

            var program = this.program;

            _.each( this.uniforms, function( uniform ){
                uniform.create( program );
            } );

            _.each( this.attributes, function( attribute ){
                attribute.create( program );
            } );

        },

        addUniform: function( uniform ){
            this.uniforms[ uniform.name ] = uniform;
        },

        addAttribute: function( attribute ){
            this.attributes[ attribute.name ] = attribute;
        },

        find: function( name ){
            return this.uniforms[ name ] || this.attributes[ name ];
        },

        render: function( ){

            var program = this.program,
                GL = program.GL;

            _.each( this.uniforms, function( uniform ){

                if( uniform.type === CONST.SAMPLER_2D && uniform.data.ready && ~this.texcoordAttribute.location ){
   
                    var texture = uniform.data;

                    if( !texture.pointer ) {
                        this.processTexture( texture );
                    }

                    var textureUnit = program.usedTextureUnits++;
                    GL.activeTexture( GL.TEXTURE0 + textureUnit );
                    GL.bindTexture( GL.TEXTURE_2D, texture.pointer );
                    uniform.setData( textureUnit );

                }else{
                    uniform.setData( );
                }

            } );

            _.each( this.attributes, function( attribute ){
                attribute.setBufferData( );
                attribute.render( );
            } );

        },


        processTexture: function( texture ) {

            var GL = this.program.GL;

            texture.pointer = GL.createTexture( );

            GL.bindTexture( GL.TEXTURE_2D, texture.pointer ); // 绑定
            // GL.pixelStorei( GL.UNPACK_FLIP_Y_WEBGL, true ); // 垂直翻转
            GL.texImage2D( GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, texture.image ); // 上传到显卡端的纹理空间
            GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR );
            GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR );
            GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT );
            GL.texParameteri( GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT );
            GL.bindTexture( GL.TEXTURE_2D, null );

        }

    } );

    return Pass;

} );