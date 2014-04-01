define( [ 'PerspectiveCamera', 'Geometry', 'Material', 'Mesh', 'WebGLRenderer', 'Attribute' ], function ( PerspectiveCamera, Geometry, Material, Mesh, WebGLRenderer, Attribute ) {

    var camera = new PerspectiveCamera( 75, 300 / 150, 1, 1000 );

    var renderer = new WebGLRenderer( document.getElementById( 'coo' ) );

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

    var mesh = new Mesh( geo, mat );

    camera.position.z = 500;
    // camera.lookAt( );

    // camera.projectionMatrix.identity( );

    renderer.render( mesh, camera );

} );