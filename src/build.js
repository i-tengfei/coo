( function( ){

    define( 'coo', [ 

        'View', 'Node', 'Display', 'CSS3DRenderer', 'CSS3D' 

    ], function ( View, Node, Display, CSS3DRenderer, CSS3D ) {

        return {
            View: View,
            Node: Node,
            Display: Display,
            CSS3DRenderer: CSS3DRenderer,
            CSS3D: CSS3D
        }

    } );

    require( [ 'coo' ] );
    
} )( )