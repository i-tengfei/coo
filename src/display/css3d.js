define( [ 'Display' ], function ( Display ) {

    var CSS3D = Display.extend( {

        defaults: Display._.extend( {}, Display.prototype.defaults ),

        initialize: function( cid, options ){
            CSS3D.super.initialize.call( this, cid, options );
        },

        init: function( options ){
            Display.prototype.init.call( this, options );
            var element = this.element = options.element || document.createElement( 'div' );
            element.style.position = 'absolute';
            element.className += ' css3d';
        }

    } );

    return CSS3D;

} );