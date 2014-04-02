define( [ 'Node' ], function ( Node ) {

    var Scene = Node.extend( {

        defaults: Node._.extend( {}, Node.prototype.defaults ),

        initialize: function( cid, options ){
            Scene.super.initialize.call( this, cid, options );
        },

        init: function( options ){
            Node.prototype.init.call( this, options );
        }

    } );

    return Scene;

} );