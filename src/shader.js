define( [ 'Base' ], function ( Base ) {

    var Shader = Base.extend( {

        attrs: {
            vertex: '',
            fragment: ''
        },

        vertexShader: null,
        fragmentShader: null,
        shaderProgram: null,

        attributes: {},

        initialize: function( vertex, fragment, GL ){

            this.set( {
                vertex: vertex,
                fragment: fragment
            } );

            this.GL = GL;

            this.compile( );

        },

        compile: function( ){

            var GL = this.GL;

            var vertexShader = this.vertexShader = GL.createShader( GL.VERTEX_SHADER );
            GL.shaderSource( vertexShader, this.get( 'vertex' ) );
            GL.compileShader( vertexShader );

            var fragmentShader = this.fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
            GL.shaderSource( fragmentShader, this.get( 'fragment' ) );
            GL.compileShader( fragmentShader );

            var shaderProgram = this.shaderProgram = GL.createProgram( );
            GL.attachShader( shaderProgram, vertexShader );
            GL.attachShader( shaderProgram, fragmentShader );
            GL.linkProgram( shaderProgram );
            GL.useProgram( shaderProgram );

            this.attributes[ 'position' ] = GL.getAttribLocation( shaderProgram, 'position' );

            return this;

        },

        enableAttributes: function( ){

            var GL = this.GL;
            Shader._.each( this.attributes, function( x, i ){
                GL.enableVertexAttribArray( x );
            } );

        }

    } );

    return Shader;

} );