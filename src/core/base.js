define( [ 'Class', 'Events', 'underscore', 'CONST' ], function( Class, Events, _, CONST ) {

    var Base = Class.create( {

        Statics: {
            _: _
        },

        defaults: {
            name: ''
        },

        CONST: CONST,

        Implements: Events,

        initialize: function( options ){

            this.initOptions( _.extend( _.clone( this.defaults ), options ) );

        },

        initOptions: function( options ){
            this.name = options.name;
        },

        destroy: function( ){
            this.off( );
            for ( var p in this ) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            this.destroy = function() {};
        }

    } );

    return Base;

} );