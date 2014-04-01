define( [ 'Base' ], function ( Base ) {

    var Uniform = Base.extend( {

        initialize: function( name, type ){

            Uniform.super.initialize.call( this );

            this.name = name;
            this.type = type;

        },

        create: function( shader ){

            var GL = this.GL = shader.GL;
            this.shader = shader;

            this.location = GL.getUniformLocation( shader.program, this.name );

        },

        setData: function( data ){

            Array.isArray( data ) || ( data = [ data ] );

            var GL = this.GL;
            if( this.type.indexOf( 'Matrix' ) === -1 ){
                data.unshift( this.location );
                GL[ 'uniform' + this.type ].apply( GL, data );
            }else{
                data.unshift( this.location, false );
                GL[ 'uniform' + this.type ].apply( GL, data );
            }

        }

    } );

    return Uniform;

} );