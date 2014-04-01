define( [ 'Base', 'text!shader/basic.vertex', 'text!shader/basic.fragment' ], function ( Base, basicVertex, basicFragment ) {

    var defaultShaders = {
        basic: {
            vertex: basicVertex,
            fragment: basicFragment
        }
    };

    var Material = Base.extend( {

        source: {
            vertex: '',
            fragment: ''
        },

        initialize: function( shader ){

            Material.super.initialize.call( this );

            if( typeof shader === 'string' ){
                this.source = defaultShaders[ shader ];
            }else{
                this.source = shader;
            }

            this.uniforms = {};

        },

        add: function( uniforms ){
            this.uniforms[ uniforms.name ] = uniforms;
        }

    } );

    return Material;

} );