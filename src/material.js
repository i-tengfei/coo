define( [ 'UUID', 'text!shader/basic.vertex', 'text!shader/basic.fragment' ], function ( UUID, basicVertex, basicFragment ) {

    var defaultShaders = {
        basic: {
            vertex: basicVertex,
            fragment: basicFragment
        }
    };

    var Material = UUID.extend( {

        defaults: {
            source: defaultShaders[ 'basic' ]
        },

        initialize: function( cid, options ){

            Material.super.initialize.call( this, cid, options );
            this.uniforms = {};

        },

        init: function( options ){
            if( typeof options.source === 'string' ){
                this.source = defaultShaders[ options.source ];
            }else{
                this.source = options.source;
            }
        },

        add: function( uniforms ){
            this.uniforms[ uniforms.name ] = uniforms;
        }

    } );

    return Material;

} );