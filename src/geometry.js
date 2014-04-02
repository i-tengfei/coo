define( [ 'UUID' ], function ( UUID ) {

    var Geometry = UUID.extend( {

        initialize: function( cid, options ){
            Geometry.super.initialize.call( this, cid, options );
            this.count = undefined;
            this.attributes = {};
        },

        init: function( ){

        },

        add: function( attribute ){
            this.attributes[ attribute.name ] = attribute;
        }

    } );

    return Geometry;

} );