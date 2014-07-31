define( [ 'Display', 'CONST' ], function ( Display, CONST ) {

    var Line = Display.extend( {

        defaults: Display._.extend( {}, Display.prototype.defaults ),

        initialize: function( options, geometry, material ){

            Line.super.initialize.call( this, options );
            this.geometry = geometry;
            this.material = material;

        },

        initOptions: function( options ){
            Line.super.initOptions.call( this, options );
        }

    } );

    return Line;

} );