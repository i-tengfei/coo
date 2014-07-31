define( [ 'Base', 'CONST' ], function( Base, CONST ) {

    var Texture = Base.extend( {

        initialize: function( options, image ){

            Texture.super.initialize.call( this );

            this.ready = false;
            this.pointer = null;

            this.image = image;

            this.wrapS = CONST.CLAMP_TO_EDGE;
            this.wrapT = CONST.CLAMP_TO_EDGE;

            if( image.complete ){
                this.ready = true;
            }else{
                imate.addEventListener( 'load', function( ){
                    this.ready = true;
                }.bind( this ) )
            }

        },

        initOptions: function( options ){

        }

    } );

    return Texture;

} );