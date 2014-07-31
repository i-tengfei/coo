define( [ 'GLTFLoader', 'PerspectiveCamera', 'WebGLRenderer', 'GLTFParser' ], function ( GLTFLoader, PerspectiveCamera, Renderer, GLTFParser ) {

    var loader = new GLTFLoader( );

    loader.load( {

        duck: '/examples/model/duck/duck.json',
        Rambler: '/examples/model/rambler/Rambler.json',
        SuperMurdoch: '/examples/model/SuperMurdoch/SuperMurdoch.json',
        wine: '/examples/model/wine/wine.json'

    }, function( err, results ){

        console.log( results.Rambler )

        var parser = new GLTFParser( );
        parser.parse( results.wine );


        var renderer = new Renderer( {
            element: document.getElementById( 'coo' )
        } );


        var camera;
        if( Object.keys( parser.cameras ).length ){
            camera = parser.cameras[ Object.keys( parser.cameras )[ 0 ] ];
        }else{

            camera = new PerspectiveCamera( );
            camera.position.x = 500;
            camera.position.y = 500;
            camera.position.z = 500;
            camera.lookAt( );

        }

        function render ( ){
            // requestAnimationFrame( render );
            renderer.render( parser.scene, camera );
        }

        render( );

        

    } );

} );