define( [ 'Base', 'async' ], function ( Base, async ) {

    var Loader = Base.extend( {

        defaults: Base._.extend( {
            crossOrigin: undefined
        }, Base.prototype.defaults ),

        initialize: function( options ){
            Loader.super.initialize.call( this, options );
        },

        initOptions: function( options ){
            this.crossOrigin = options.crossOrigin;
        },

        get: function( url, start, progress, load, error ){

            var request = new XMLHttpRequest( );
            
            start && request.addEventListener( 'loadstart', function ( event ) {

                start( request, event );

            }, false );

            progress && request.addEventListener( 'progress', function ( event ) {

                progress( request, event );

            }, false );

            load && request.addEventListener( 'load', function ( event ) {

                load( request, event );

            }, false );

            error && request.addEventListener( 'error', function ( event ) {

                error( request, event );

            }, false );

            if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;
            request.responseType = 'blob';

            request.open( 'GET', url, true );
            request.send( null );

        },

        /*
        参数可以是{key:value}或[value,value]或'value'
        */
        load: function( urls, callback ){

            function classify( url, blob, callback ){

                function getType( url ){
                    var t = url.slice( url.lastIndexOf( '.' ) + 1 );
                    switch( t.toLowerCase( ) ){
                        case 'json':
                            return 'json';
                        case 'png':
                        case 'jpg':
                            return 'image';
                        case 'bin':
                            return 'binary';
                        case 'glsl':
                            return 'shader';
                    }
                }

                function next( err, data ){
                    callback( null, {
                        type: type,
                        objectURL: URL.createObjectURL( blob ),
                        url: url,
                        blob: blob,
                        data: data
                    } );
                }

                var type = getType( url ),
                    result = blob;

                switch( type ){
                    case 'json':
                        blobToJson( blob, next );
                        break;
                    case 'image':
                        blobToImage( blob, next );
                        break;
                    case 'binary':
                        blobToArrayBuffer( blob, next );
                        break;
                    case 'shader':
                        blobToString( blob, next );
                        break;
                }

            }

            function loadOne( url, callback ){

                Loader.prototype.get( url, function( req, event ){

                }, function( req, event ){

                }, function( req, event ){

                    classify( url, req.response, callback )

                }, function( req, event ){

                } )

            }

            var results = {},
                names = urls;

            if( typeof urls === 'string' ){
                names = urls = [ urls ];
            }else if( !Array.isArray( urls ) ){
                names = Object.keys( urls );
                urls = names.map( function( x ){
                    return urls[ x ];
                } );
            }

            async.map( urls, loadOne, function( err, data ){

                data.forEach( function( x, i ){
                    results[ names[ i ] ] = x;
                } );

                callback( null, results );

            } )

        }

    } );

    function blobToJson( blob, callback ) {
        var reader = new FileReader( );
        reader.onload = function( ) {
            callback( null, JSON.parse( reader.result ) );
        };
        reader.readAsText(blob);
    };

    function blobToString( blob, callback ) {
        var reader = new FileReader( );
        reader.onload = function( ) {
            callback( null, reader.result );
        };
        reader.readAsText(blob);
    };

    function blobToArrayBuffer( blob, callback ) {
        var reader = new FileReader( );
        reader.onload = function( ) {
            callback( null, reader.result );
        };
        reader.readAsArrayBuffer(blob);
    };

    function blobToImage( blob, callback ) {
        var image = new Image( );
        image.src = URL.createObjectURL( blob );
        image.onload = function( ){
            callback( null, image );
        };
    };

    return Loader;

} );