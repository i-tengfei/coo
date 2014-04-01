define( [ 'Node' ], function ( Node ) {

    var Display = Node.extend( {

        initialize: function( geometry, material ){

            Display.super.initialize.call( this );

            this.geometry = geometry;
            this.material = material;
            this.visible = true;
            this.mode = 'TRIANGLES';

        }
        
    } );

    return Display;

} );