( function( ){

    define( 'COO', [ 

        'View', 'CSS3DRenderer', 'CSS3D' 

    ], function ( View, CSS3DRenderer, CSS3D ) {

        COO.View = view;
        COO.CSS3DRenderer = CSS3DRenderer;
        COO.CSS3D = CSS3D;

        return {
            View: View,
            CSS3DRenderer: CSS3DRenderer,
            CSS3D: CSS3D
        }

    } );

    require( [ 'COO' ] );
    
} )( )