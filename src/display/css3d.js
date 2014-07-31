define( [ 'Display' ], function ( Display ) {

    var CSS3D = Display.extend( {

        defaults: Display._.extend( {
            element: null
        }, Display.prototype.defaults ),

        initialize: function( options ){
            
            CSS3D.super.initialize.call( this, options );

        },

        initOptions: function( options ){

            CSS3D.super.initOptions.call( this, options );

            var element = this.element = options.element || document.createElement( 'div' );
            element.style.position = 'absolute';
            element.className += ' css3d';

        }

    } );

    return CSS3D;

} );