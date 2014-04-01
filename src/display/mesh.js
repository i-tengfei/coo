define( [ 'Display' ], function ( Display ) {

    var Mesh = Display.extend( {

        initialize: function( geometry, material ){
            Mesh.super.initialize.call( this, geometry, material );
            this.mode = 'TRIANGLES';
        }

    } );

    return Mesh;

} );