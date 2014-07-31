define( [ 'Base' ], function ( Base ) {

    var Program = Base.extend( {

        defaults: Base._.extend( {
            vertexSource: '',
            fragmentSource: ''
        }, Base.prototype.defaults ),

        initialize: function( options ){

            Program.super.initialize.call( this, options );

            this.__vertexShader = null;
            this.__fragmentShader = null;
            this.__GLProgram = null;
            this.__usedTextureUnits = 0;

            this.__defineGetter__( 'GLProgram', function( ){
                return this.__GLProgram;
            } );

            this.__defineGetter__( 'GL', function( ){
                return this.__GL;
            } );

            this.__defineGetter__( 'usedTextureUnits', function( ){
                return this.__usedTextureUnits;
            } );

            this.__defineSetter__( 'usedTextureUnits', function( v ){
                this.__usedTextureUnits = v;
            } );

        },

        create: function( GL ){

            if( this.GLProgram === null ){
                
                this.__GL = GL;

                // 顶点着色器
                var vertexShader = this.__vertexShader = GL.createShader( GL.VERTEX_SHADER );
                GL.shaderSource( vertexShader, this.vertexSource );
                GL.compileShader( vertexShader );

                // 片元着色器
                var fragmentShader = this.__fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
                GL.shaderSource( fragmentShader, this.fragmentSource );
                GL.compileShader( fragmentShader );

                var program = this.__GLProgram = GL.createProgram( );
                GL.attachShader( program, vertexShader );
                GL.attachShader( program, fragmentShader );
                GL.linkProgram( program );

            }

            return this;

        },

        initOptions: function( options ){

            Program.super.initOptions.call( this, options );

            this.vertexSource = options.vertexSource;
            this.fragmentSource = options.fragmentSource;

        },

        use: function( ){
            this.__GL.useProgram( this.GLProgram );
            return this;
        }

    } );

    return Program;

} );