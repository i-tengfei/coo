define( [ 'Node' ], function ( Node ) {

    var Display = Node.extend( {

        defaults: Node._.extend( {
            visible: true
        }, Node.prototype.defaults ),

        initialize: function( cid, options ){

            Display.super.initialize.call( this, cid, options );

        },

        init: function( options ){
            Node.prototype.init.call( this, options );
            this.visible = options.visible;
        }
        
    } );

    return Display;

} );