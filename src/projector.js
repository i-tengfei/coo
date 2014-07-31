define( [ 'Base', 'Mat4', 'Display', 'Mesh', 'CSS3D', 'Frustum' ], function( Base, Mat4, Display, Mesh, CSS3D, Frustum ) {

    var Projector = Base.extend( {

        initialize: function( ){

            this.projectionMatrix = Mat4( );
            this.cameraViewMatrix = Mat4( );
            this.frustum = Frustum( );

            this.objects            = [ ];
            this.transparentObjects = [ ];
            this.opaqueObjects      = [ ];
            this.css3DObjects       = [ ];
            this.lights             = [ ];

        },

        projectScene: function( scene, camera ){

            camera.parent || scene.add( camera );

            scene.updateWorldMatrix( true );

            var projectionMatrix = this.projectionMatrix = camera.projectionMatrix;
            var cameraViewMatrix = this.cameraViewMatrix.invert( camera.worldMatrix );
            var frustum = this.frustum.setFromMat( Mat4( ).multiply( projectionMatrix, cameraViewMatrix ) );
            
            var objects             = this.objects              = [ ];
            var transparentObjects  = this.transparentObjects   = [ ];
            var opaqueObjects       = this.opaqueObjects        = [ ];
            var css3DObjects        = this.css3DObjects         = [ ];
            var lights              = this.lights               = [ ];

            ( function( node ){

                if( node instanceof Display ) {

                    if( !!node.visible ) {

                        if( frustum.intersectsSphere( node.sphere ) ){

                            if( node instanceof Mesh ){

                                // if( object3D.material.alpha !== 1 ) {

                                    // transparentObjects.push( object3D );

                                // } else {

                                    opaqueObjects.push( node );
                                
                                // }
                            }else if( node instanceof CSS3D ){
                                css3DObjects.push( node );
                            }

                        }

                    }

                }

                // if( object3D.__type__ === D3.objectTypes.LIGHT ) {

                //  lights.push( object3D );

                // }
                
                objects.push( node );

                if( !!node.children.length ) {

                    var c = node.children.length;
                    while( c-- ) {
                        arguments.callee( node.children[ c ] );
                    }

                }

            } )( scene );

            return this;

        }

    } );

    return Projector;

	// Projector.prototype.projectVector = function( vector, camera ){

	// 	__m4_1.val( camera.matrixWorld ).invert( );
	// 	__m4_2.multiply( camera.projectionMatrix, __m4_1 );
	// 	return vector.applyProjection( __m4_2 );

	// };

	// Projector.prototype.unprojectVector = function( vector, camera ){

	// 	__m4_1.invert( camera.projectionMatrix );
	// 	__m4_2.multiply( camera.matrixWorld, __m4_1 );
	// 	return vector.applyProjection( __m4_2 );

	// };

	// var __m4_1 = new Mat4( );
	// var __m4_2 = new Mat4( );

} );