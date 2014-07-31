define( [ 'Loader', 'async' ], function ( Loader, async ) {

    var GLTFLoader = Loader.extend( {

        defaults: Loader._.extend( {}, Loader.prototype.defaults ),

        initialize: function( options ){
            options = options || {};
            GLTFLoader.super.initialize.call( this, options );
        },

        load: function( urls, callback ){

            var __this__ = this;

            function loadOne( url, callback ){

                var options = {
                    crossOrigin: __this__.crossOrigin
                };

                var loader = new Loader( options );

                loader.load( url, function( err, results ){

                    var data = results[ url ].data;

                    function loadData( data, callback ){

                        var urls = {};
                        Object.keys( data ).forEach( function( n ){
                            urls[ n ] = url.slice( 0, url.lastIndexOf( '/' ) ) + '/' + data[ n ].path;
                        } )
                        var loader = new Loader( options );
                        loader.load( urls, callback );

                    }

                    var fns = [];

                    var resources = data.resources = {};

                    data.buffers && fns.push( function( next ){
                        loadData( data.buffers, function( err, result ){
                            resources.buffers = result;
                            next( err );
                        } );
                    } );

                    data.images && fns.push( function( next ){
                        loadData( data.images, function( err, result ){
                            resources.images = result;
                            next( err );
                        } );
                    } );
                    data.shaders && fns.push( function( next ){
                        loadData( data.shaders, function( err, result ){
                            resources.shaders = result;
                            next( err );
                        } );
                    } );

                    async.parallel( fns, function( err, results ){

                        callback( null, data );

                    } )


                } );

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

            } );

        }

    } );


    return GLTFLoader;

} );