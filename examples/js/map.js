define( [ 'PerspectiveCamera', 'Geometry', 'Material', 'Mesh', 'WebGLRenderer', 'jquery', 'text!shader/map.vertex', 'text!shader/basic.fragment', 'Scene', 'Vec3', 'orbit', 'Attribute' ], function ( PerspectiveCamera, Geometry, Material, Mesh, WebGLRenderer, $, vertex, fragment, Scene, Vec3, Orbit, Attribute ) {

    $.ajax( 'http://localhost:3000/map/0/-132.493/-8949.95', {
        dataType: 'json'
    } ).done( function( data ){

        var camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
        var scene = new Scene( );
        var renderer = new WebGLRenderer( document.getElementById( 'coo' ) );

        var index = [];
        var num = 0;
        for( var i = 9; i < 145; i+=17 ){
            for( j = 0; j < 8; j++ ){
                var lod = i + j;
                index.push( lod, lod - 8, lod - 9 );
                index.push( lod, lod + 9, lod - 8 );
                index.push( lod, lod + 8, lod + 9 );
                index.push( lod, lod - 9, lod + 8 );
                num+= 4;
            }
        }
        var number = [];
        for( var i = 0; i < 145; i++ ){
            number.push( i );
        }

        console.log( data );

        for( var i = 0; i < 256; i++ ){
            
            var header = data.header[ i ],
                layer = data.layer[ i ],
                normal = data.normal[ i ],
                terrain = data.terrain[ i ],
                texture = data.texture[ i ];
            var mat = new Material( {
                vertex: vertex,
                fragment: fragment
            } );

            var geo = new Geometry( );
            geo.add( new Attribute( 'height', terrain, 1 ) );
            geo.add( new Attribute( 'number', number, 1 ) );
            geo.add( new Attribute( 'index', index ) );
            geo.count = num * 3;
            var mesh = new Mesh( geo, mat );

            mesh.position.val( header.x, header.y, header.z );
            scene.add( mesh );

        }

        camera.position.val( -132.493, 90.56, -8949.95 );

        var orbit = new Orbit( camera );
        orbit.target.val( -132.493, 83.56, -8949.95 );
        function render(  ){
            requestAnimationFrame( render )
            orbit.update( );
            renderer.render( scene, camera );
        }
        render( );

    } )

    // geo.data.push( {
    //     name: 'position',
    //     type: 'Float32Array',
    //     size: 3,
    //     data: [
    //          0.0,  1.0,  0.0,
    //         -1.0, -1.0,  0.0,
    //          1.0, -1.0,  0.0,

    //          0.0,  1.0,  0.0,
    //          1.0, -1.0,  0.0,
    //          1.0,  1.0,  0.0
    //     ]
    // } )
    // geo.count = 3;


} );