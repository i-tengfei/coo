define( [ 'Base', 'Projector' ], function( Base, Projector ) {

    var Renderer = Base.extend( {

        initialize: function( element ){

            Renderer.super.initialize.call( this );
            element = element || document.createElement( 'canvas' );
            this.__element = element;
            this.__context = this.createContext( element );
            this.projector = new Projector( );
    
            this.__defineGetter__( 'element', function( ){
                return this.__element;
            } );
            this.__defineGetter__( 'context', function( ){
                return this.__context;
            } );

        },

        render: function( scene, camera ){
            this.clear( );
            this.projector.projectScene( scene, camera );
        },

        createContext: function( element ){ },

        clear: function( ){ }

    } );

    return Renderer;

} );