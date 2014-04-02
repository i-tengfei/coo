( function( ){

    define( 'coo', [ 

        'View', 'CSS3DRenderer', 'CSS3D' 

    ], function ( View, CSS3DRenderer, CSS3D ) {

        return {
            View: View,
            CSS3DRenderer: CSS3DRenderer,
            CSS3D: CSS3D
        }

    } );

    require( [ 'coo' ] );
    
} )( )