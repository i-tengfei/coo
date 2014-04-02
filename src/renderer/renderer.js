define( [ 'Base', 'Projector' ], function( Base, Projector ) {

    var Renderer = Base.extend( {

        initialize: function( element ){

            Renderer.super.initialize.call( this );
            element = element || document.createElement( 'canvas' );
            this.__element = element;
            this.__context = this.createContext( element );
            this.__width = element.clientWidth;
            this.__height = element.clientHeight;
            this.projector = new Projector( );
    
            this.__defineGetter__( 'element', function( ){
                return this.__element;
            } );
            this.__defineGetter__( 'context', function( ){
                return this.__context;
            } );
            this.__defineGetter__( 'width', function( ){
                return this.__width;
            } );
            this.__defineGetter__( 'height', function( ){
                return this.__height;
            } );
            this.__defineSetter__( 'width', function( w ){
                var element = this.element;
                this.__width = w;
                element.style.width = w + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( this.element.width = w );
            } );
            this.__defineSetter__( 'height', function( h ){
                var element = this.element;
                this.__height = h;
                this.element.style.height = h + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( this.element.height = h );
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