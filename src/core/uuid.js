define( [ 'Base' ], function ( Base ) {

    var __POOL__ = {};

    var UUID = Base.extend( {

        defaults: {},

        initialize: function( cid, options ){
            
            UUID.super.initialize.call( this );

            this.__UUID = this.makeUUID( );
            this.__defineGetter__( 'UUID', function( ){
                return this.__UUID;
            } );

            if( typeof cid != 'string' && !options ){
                options = cid;
                cid = this.UUID;
            }

            this.__CID = cid;

            this.__defineGetter__( 'CID', function( ){
                return this.__CID;
            } );

            __POOL__[ cid ] = this;

            this.init( UUID._.extend( this.defaults, options ) );

        },

        init: function( options ){
            throw( '必须覆盖UUID:init方法！' );
        },

        find: function( cid ){
            return __POOL__[ cid ];
        },

        destroy: function( ){

            delete __POOL__[ this.CID ];

        },

        makeUUID: function( ){

            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = new Array(36);
            var rnd = 0, r;

            return function( ){

                for ( var i = 0; i < 36; i ++ ) {

                    if ( i == 8 || i == 13 || i == 18 || i == 23 ) {
                
                        uuid[ i ] = '-';
                
                    } else if ( i == 14 ) {
                
                        uuid[ i ] = '4';
                
                    } else {
                
                        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
                        r = rnd & 0xf;
                        rnd = rnd >> 4;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];

                    }
                }
                
                return uuid.join('');
            }

        }( )

    } );

    return UUID;

} );