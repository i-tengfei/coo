define( [ 'Base' ], function ( Base ) {

    var Geometry = Base.extend( {

        initialize: function( ){
            Geometry.super.initialize.call( this );
            this.count = undefined;
            this.attributes = {};
        },

        add: function( attribute ){
            this.attributes[ attribute.name ] = attribute;
        }

    } );

    return Geometry;

} );