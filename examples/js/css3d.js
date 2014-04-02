define( [ 'View', 'CSS3DRenderer', 'CSS3D' ], function ( View, CSS3DRenderer, CSS3D ) {

    var renderer = new CSS3DRenderer( );

    var view = new View( {
        width: 720,
        height: 1600
    } );

    view.camera.position.z = 960;

    view.setRenderer( renderer );

    view.add( new CSS3D( ) )

} );