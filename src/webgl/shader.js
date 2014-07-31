define( [ 'Base' ], function ( Base ) {

    var Shader = Base.extend( {

        defaults: Base._.extend( {
            vertexSource: '',
            fragmentSource: ''
        }, Base.prototype.defaults ),

        initialize: function( options, GL ){

            Shader.super.initialize.call( this, options );
            this.GL = GL;

            this.vertexShader = null;
            this.fragmentShader = null;
            this.program = null;

            var vertexShader = this.vertexShader = GL.createShader( GL.VERTEX_SHADER );
            GL.shaderSource( vertexShader, this.vertexSource );
            GL.compileShader( vertexShader );

            var fragmentShader = this.fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
            GL.shaderSource( fragmentShader, this.fragmentSource );
            GL.compileShader( fragmentShader );

            var program = this.program = GL.createProgram( );
            GL.attachShader( program, vertexShader );
            GL.attachShader( program, fragmentShader );
            GL.linkProgram( program );

        },

        initOptions: function( options ){

            Shader.super.initOptions.call( this, options );

            this.vertexSource = options.vertexSource;
            this.fragmentSource = options.fragmentSource;

        },

        use: function( ){
            this.GL.useProgram( this.program );
            return this;
        }

    } );

    return Shader;

} );