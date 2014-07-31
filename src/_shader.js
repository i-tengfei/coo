define( [ 'Base', 'Attribute', 'Uniform' ], function ( Base, Attribute, Uniform ) {

    var Shader = Base.extend( {

        attrs: {
            vertex: '',
            fragment: ''
        },

        initialize: function( GL, geometry, material ){

            this.GL = GL;
            this.geometry = geometry;
            this.material = material;

            Shader.super.initialize.call( this );

            this.vertexShader = null;
            this.fragmentShader = null;
            this.program = null;


            this.set( {
                vertex: [
                    'uniform mat4 projectionMatrix;',
                    'uniform mat4 modelMatrix;',
                    'uniform mat4 viewMatrix;',
                    material.source.vertex
                ].join( '\n' ),
                fragment: [
                    'precision highp float;',
                    material.source.fragment
                ].join( '\n' )
            } );

            var vertexShader = this.vertexShader = GL.createShader( GL.VERTEX_SHADER );
            GL.shaderSource( vertexShader, this.get( 'vertex' ) );
            GL.compileShader( vertexShader );

            var fragmentShader = this.fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
            GL.shaderSource( fragmentShader, this.get( 'fragment' ) );
            GL.compileShader( fragmentShader );

            var program = this.program = GL.createProgram( );
            GL.attachShader( program, vertexShader );
            GL.attachShader( program, fragmentShader );
            GL.linkProgram( program );

        },

        use: function( ){
            this.GL.useProgram( this.program );
            return this;
        },

        draw: function( ){

            var GL = this.GL;

            if( this.geometry.attributes.index ){
                GL.drawElements( GL.TRIANGLES, this.geometry.count, GL.UNSIGNED_SHORT, 0 );
            }else{
                GL.drawArrays( GL.TRIANGLES, 0, this.geometry.count );
            }

        }

    } );

    return Shader;

} );