define( [ 'Node' ], function ( Node ) {

    var Display = Node.extend( {

        defaults: Node._.extend( {
            visible: true
        }, Node.prototype.defaults ),

        initialize: function( options ){

            Display.super.initialize.call( this, options );

            this.__sphere = null;

            this.__defineGetter__( 'sphere', function( ){

                this.__sphere || ( this.__sphere = this.__computeSphere( ).applyMat4( this.worldMatrix ) );
                return this.__sphere;

            } );

        },

        initOptions: function( options ){

            Display.super.initOptions.call( this, options );
            this.visible = options.visible;
            
        },

        __computeSphere: function( ){

            console.error( '必须覆盖__computeSphere方法！' );

        },

        clone: function( object, recursive ){

            if ( object === undefined ) object = new Display( {
                visible: this.visible
            } );

            Node.prototype.clone.call( this, object, recursive );

            return object;

        }
        
    } );

    return Display;

} );