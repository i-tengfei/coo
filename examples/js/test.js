define( [ 'View', 'Geometry', 'Material', 'Mesh', 'WebGLRenderer', 'Attribute' ], function ( View, Geometry, Material, Mesh, WebGLRenderer, Attribute ) {

    var geo = new Geometry( );
    geo.add( new Attribute( 'position', [
         0.0,  100.0,  0.0,
        -100.0, -100.0,  0.0,
         100.0, -100.0,  0.0,

         0.0,  100.0,  0.0,
         100.0, -100.0,  0.0,
         100.0,  100.0,  0.0
    ] ) );
    geo.count = 6;

    var mat = new Material( 'basic' );

    var mesh = new Mesh( {
        geometry: geo,
        material: mat
    } );

    var view = new View( );
    view.setRenderer( new WebGLRenderer( document.getElementById( 'coo' ) ) );
    view.camera.position.z = 500;

    view.add( mesh );

} );