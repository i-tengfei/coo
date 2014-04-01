define( [ 'Base', 'CONST' ], function( Base, CONST ) {

    var Texture = Base.extend( {

        initialize: function( data ){

            Texture.super.initialize.call( this );

            this.data = data;
            this.ready = false;
            this.image = null;
            this.wrapS = CONST.CLAMP_TO_EDGE;
            this.wrapT = CONST.CLAMP_TO_EDGE;

        }

    } );

    return Texture;

} );