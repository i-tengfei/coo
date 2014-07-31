define( [ 'Base', 'Projector' ], function( Base, Projector ) {

    var Renderer = Base.extend( {

        defaults: Base._.extend( {
            element: null,
            width: undefined,
            height: undefined
        }, Base.prototype.defaults ),

        initialize: function( options ){
    
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
                element.tagName.toLowerCase( ) === 'canvas' && ( element.width = w );
            } );
            this.__defineSetter__( 'height', function( h ){
                var element = this.element;
                this.__height = h;
                element.style.height = h + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( element.height = h );
            } );

            Renderer.super.initialize.call( this, options );

            this.__context = this.createContext( this.element );
            this.projector = new Projector( );

        },

        initOptions: function( options ){

            Renderer.super.initOptions.call( this, options );
            this.__element = options.element || document.createElement( 'canvas' );
            this.width = options.width || this.element.clientWidth;
            this.height = options.height || this.element.clientHeight;

        },

        render: function( scene, camera ){
            this.clear( );
            this.projector.projectScene( scene, camera );
        },

        createContext: function( element ){
            console.error( '必须覆盖 createContext 方法！' );
        },

        clear: function( ){ }

    } );

    return Renderer;

} );