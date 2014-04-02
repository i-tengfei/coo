define( [ 'Display' ], function ( Display ) {

    var Mesh = Display.extend( {

        defaults: Display._.extend( {
            mode: 'TRIANGLES'
        }, Display.prototype.defaults ),

        initialize: function( cid, options ){
            Mesh.super.initialize.call( this, cid, options );
        },

        init: function( options ){
            Display.prototype.init.call( this, options );
            this.mode = options.mode;
            this.geometry = options.geometry;
            this.material = options.material;
        }

    } );

    return Mesh;

} );