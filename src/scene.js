define( [ 'Node' ], function ( Node ) {

    var Scene = Node.extend( {

        defaults: Node._.extend( {}, Node.prototype.defaults ),

        initialize: function( options ){
            Scene.super.initialize.call( this, options );
        },

        initOptions: function( options ){

            Scene.super.initOptions.call( this, options );
            
        }

    } );

    return Scene;

} );