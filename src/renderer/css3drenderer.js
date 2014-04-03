define( [ 'Renderer' ], function( Renderer ) {

    function epsilon( v ){
        return Math.abs( v ) < 0.000001 ? 0 : v;
    }

    function cameraCSSMatrix( matrix ){

        return 'matrix3d(' +
            epsilon(   matrix[ 0 ]  ) + ',' +
            epsilon( - matrix[ 1 ]  ) + ',' +
            epsilon(   matrix[ 2 ]  ) + ',' +
            epsilon(   matrix[ 3 ]  ) + ',' +
            epsilon(   matrix[ 4 ]  ) + ',' +
            epsilon( - matrix[ 5 ]  ) + ',' +
            epsilon(   matrix[ 6 ]  ) + ',' +
            epsilon(   matrix[ 7 ]  ) + ',' +
            epsilon(   matrix[ 8 ]  ) + ',' +
            epsilon( - matrix[ 9 ]  ) + ',' +
            epsilon(   matrix[ 10 ] ) + ',' +
            epsilon(   matrix[ 11 ] ) + ',' +
            epsilon(   matrix[ 12 ] ) + ',' +
            epsilon( - matrix[ 13 ] ) + ',' +
            epsilon(   matrix[ 14 ] ) + ',' +
            epsilon(   matrix[ 15 ] ) +
        ')';

    }

    function nodeMatrix( matrix ) {

        return 'translate3d(-50%,-50%,0) matrix3d(' +
            epsilon(   matrix[ 0 ]  ) + ',' +
            epsilon(   matrix[ 1 ]  ) + ',' +
            epsilon(   matrix[ 2 ]  ) + ',' +
            epsilon(   matrix[ 3 ]  ) + ',' +
            epsilon( - matrix[ 4 ]  ) + ',' +
            epsilon( - matrix[ 5 ]  ) + ',' +
            epsilon( - matrix[ 6 ]  ) + ',' +
            epsilon( - matrix[ 7 ]  ) + ',' +
            epsilon(   matrix[ 8 ]  ) + ',' +
            epsilon(   matrix[ 9 ]  ) + ',' +
            epsilon(   matrix[ 10 ] ) + ',' +
            epsilon(   matrix[ 11 ] ) + ',' +
            epsilon(   matrix[ 12 ] ) + ',' +
            epsilon(   matrix[ 13 ] ) + ',' +
            epsilon(   matrix[ 14 ] ) + ',' +
            epsilon(   matrix[ 15 ] ) +
        ')';

    };

    var CSS3DRenderer = Renderer.extend( {

        initialize: function( element ){

            CSS3DRenderer.super.initialize.call( this, element || document.createElement( 'div' ) );

            this.cameraElement = document.createElement( 'div' );

            this.cameraElement.style.WebkitTransformStyle = 'preserve-3d';
            this.cameraElement.style.MozTransformStyle = 'preserve-3d';
            this.cameraElement.style.oTransformStyle = 'preserve-3d';
            this.cameraElement.style.transformStyle = 'preserve-3d';

            element = this.element;
            element.style.overflow = 'hidden';

            element.style.WebkitTransformStyle = 'preserve-3d';
            element.style.MozTransformStyle = 'preserve-3d';
            element.style.oTransformStyle = 'preserve-3d';
            element.style.transformStyle = 'preserve-3d';

            element.appendChild( this.cameraElement );

            this.__defineSetter__( 'width', function( w ){
                this.__width = w;
            } );
            this.__defineSetter__( 'height', function( h ){
                this.__height = h;
            } );

        },

        render: function( scene, camera ){

            var fov = 0.5 / Math.tan( camera.fov * 0.5 * ( Math.PI / 180 ) ) * this.height;

            var element = this.element;

            element.style.WebkitPerspective = fov + 'px';
            element.style.MozPerspective = fov + 'px';
            element.style.oPerspective = fov + 'px';
            element.style.perspective = fov + 'px';

            var projector = this.projector;

            var objects = projector.projectScene( scene, camera ).css3DObjects;

            var style = 'translate3d(0,0,' + fov + 'px)' + cameraCSSMatrix( projector.cameraViewMatrix ) + 
                ' translate3d(' + this.width * 0.5 + 'px,' + this.height * 0.5 + 'px, 0)';

            var cameraElement = this.cameraElement;

            cameraElement.style.WebkitTransform = style;
            cameraElement.style.MozTransform = style;
            cameraElement.style.oTransform = style;
            cameraElement.style.transform = style;

            for ( var i = 0, il = objects.length; i < il; i ++ ) {

                var object = objects[ i ];

                var element = object.element;
 
                style = nodeMatrix( object.worldMatrix );

                element.style.WebkitTransform = style;
                element.style.MozTransform = style;
                element.style.oTransform = style;
                element.style.transform = style;

                if ( !element.parentNode ) {

                    this.cameraElement.appendChild( element );

                }

            }

        }

    } );

    return CSS3DRenderer;

} );