define( [ 'Vec2', 'Vec3' ], function ( Vec2, Vec3 ) {

    function Orbit( object, domElement ){
        this.object = object;
        this.domElement = ( domElement !== undefined ) ? domElement : document;

        // API

        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the control orbits around
        // and where it pans with respect to.
        this.target = new Vec3();

        // center is old, deprecated; use "target" instead
        this.center = this.target;

        // This option actually enables dollying in and out; left as "zoom" for
        // backwards compatibility
        this.noZoom = false;
        this.zoomSpeed = 1.0;

        // Limits to how far you can dolly in and out
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // Set to true to disable this control
        this.noRotate = false;
        this.rotateSpeed = 1.0;

        // Set to true to disable this control
        this.noPan = false;
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // Set to true to disable use of the keys
        this.noKeys = false;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        ////////////
        // internals

        var scope = this;

        var EPS = 0.000001;

        var rotateStart = new Vec2();
        var rotateEnd = new Vec2();
        var rotateDelta = new Vec2();

        var panStart = new Vec2();
        var panEnd = new Vec2();
        var panDelta = new Vec2();
        var panOffset = new Vec3();

        var offset = new Vec3();

        var dollyStart = new Vec2();
        var dollyEnd = new Vec2();
        var dollyDelta = new Vec2();

        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var pan = new Vec3();

        var lastPosition = new Vec3();

        var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

        var state = STATE.NONE;

        // for reset

        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();

        // events

        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start'};
        var endEvent = { type: 'end'};


        this.rotateLeft = function ( angle ) {

            if ( angle === undefined ) {

                angle = getAutoRotationAngle();

            }

            thetaDelta -= angle;

        };

        this.rotateUp = function ( angle ) {

            if ( angle === undefined ) {

                angle = getAutoRotationAngle();

            }

            phiDelta -= angle;

        };

        this.panLeft = function ( distance ) {

            var te = this.object.localMatrix;

            // get X column of matrix
            panOffset.val( te[ 0 ], te[ 1 ], te[ 2 ] );
            panOffset.mul( - distance );
            
            pan.add( panOffset );

        };

        // pass in distance in world space to move up
        this.panUp = function ( distance ) {

            var te = this.object.matrix.elements;

            // get Y column of matrix
            panOffset.val( te[ 4 ], te[ 5 ], te[ 6 ] );
            panOffset.mul( distance );
            
            pan.add( panOffset );

        };
        this.pan = function ( deltaX, deltaY ) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( scope.object.fov !== undefined ) {

                // perspective
                var position = scope.object.position;
                var offset = position.clone().sub( scope.target );
                var targetDistance = offset.length1();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
                scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

            } else if ( scope.object.top !== undefined ) {

                // orthographic
                scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
                scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

            } else {

                // camera neither orthographic or perspective
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

            }

        };

            this.dollyIn = function ( dollyScale ) {

            if ( dollyScale === undefined ) {

                dollyScale = getZoomScale();

            }

            scale /= dollyScale;

        };

        this.dollyOut = function ( dollyScale ) {

            if ( dollyScale === undefined ) {

                dollyScale = getZoomScale();

            }

            scale *= dollyScale;

        };

        this.update = function () {

            var position = this.object.position;

            offset.val( position ).sub( this.target );

            // angle from z-axis around y-axis

            var theta = Math.atan2( offset.x, offset.z );

            // angle from y-axis

            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

            if ( this.autoRotate ) {

                this.rotateLeft( getAutoRotationAngle() );

            }

            theta += thetaDelta;
            phi += phiDelta;

            // restrict phi to be between desired limits
            phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

            // restrict phi to be betwee EPS and PI-EPS
            phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

            var radius = offset.length1() * scale;

            // restrict radius to be between desired limits
            radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );
            
            // move target to panned location
            this.target.add( pan );

            offset.x = radius * Math.sin( phi ) * Math.sin( theta );
            offset.y = radius * Math.cos( phi );
            offset.z = radius * Math.sin( phi ) * Math.cos( theta );

            position.val( this.target ).add( offset );

            this.object.lookAt( this.target );

            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.val( 0, 0, 0 );

            if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

                lastPosition.val( this.object.position );

            }

        };


        this.reset = function () {

            state = STATE.NONE;

            this.target.copy( this.target0 );
            this.object.position.copy( this.position0 );

            this.update();

        };

        function getAutoRotationAngle() {

            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

        }

        function getZoomScale() {

            return Math.pow( 0.95, scope.zoomSpeed );

        }

        function onMouseDown( event ) {

            if ( scope.enabled === false ) return;
            event.preventDefault();

            if ( event.button === 0 ) {
                if ( scope.noRotate === true ) return;

                state = STATE.ROTATE;

                rotateStart.val( event.clientX, event.clientY );

            } else if ( event.button === 1 ) {
                if ( scope.noZoom === true ) return;

                state = STATE.DOLLY;

                dollyStart.val( event.clientX, event.clientY );

            } else if ( event.button === 2 ) {
                if ( scope.noPan === true ) return;

                state = STATE.PAN;

                panStart.val( event.clientX, event.clientY );

            }

            scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
            scope.domElement.addEventListener( 'mouseup', onMouseUp, false );

        }

        function onMouseMove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( state === STATE.ROTATE ) {

                if ( scope.noRotate === true ) return;

                rotateEnd.val( event.clientX, event.clientY );
                rotateDelta.sub( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                rotateStart.val( rotateEnd );

            } else if ( state === STATE.DOLLY ) {

                if ( scope.noZoom === true ) return;

                dollyEnd.val( event.clientX, event.clientY );
                dollyDelta.sub( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    scope.dollyIn();

                } else {

                    scope.dollyOut();

                }

                dollyStart.val( dollyEnd );

            } else if ( state === STATE.PAN ) {

                if ( scope.noPan === true ) return;

                panEnd.val( event.clientX, event.clientY );
                panDelta.sub( panEnd, panStart );
                
                scope.pan( panDelta.x, panDelta.y );

                panStart.val( panEnd );

            }

            scope.update();

        }

        function onMouseUp( /* event */ ) {

            if ( scope.enabled === false ) return;

            scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
            scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );
            state = STATE.NONE;

        }

        function onMouseWheel( event ) {

            if ( scope.enabled === false || scope.noZoom === true ) return;

            event.preventDefault();

            var delta = 0;

            if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

                delta = event.wheelDelta;

            } else if ( event.detail !== undefined ) { // Firefox

                delta = - event.detail;

            }

            if ( delta > 0 ) {

                scope.dollyOut();

            } else {

                scope.dollyIn();

            }

            scope.update();

        }

        function onKeyDown( event ) {

            if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;
            
            switch ( event.keyCode ) {

                case scope.keys.UP:
                    scope.pan( 0, scope.keyPanSpeed );
                    scope.update();
                    break;

                case scope.keys.BOTTOM:
                    scope.pan( 0, - scope.keyPanSpeed );
                    scope.update();
                    break;

                case scope.keys.LEFT:
                    scope.pan( scope.keyPanSpeed, 0 );
                    scope.update();
                    break;

                case scope.keys.RIGHT:
                    scope.pan( - scope.keyPanSpeed, 0 );
                    scope.update();
                    break;

            }

        }

        function touchstart( event ) {

            if ( scope.enabled === false ) return;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.noRotate === true ) return;

                    state = STATE.TOUCH_ROTATE;

                    rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    break;

                case 2: // two-fingered touch: dolly

                    if ( scope.noZoom === true ) return;

                    state = STATE.TOUCH_DOLLY;

                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    var distance = Math.sqrt( dx * dx + dy * dy );
                    dollyStart.set( 0, distance );
                    break;

                case 3: // three-fingered touch: pan

                    if ( scope.noPan === true ) return;

                    state = STATE.TOUCH_PAN;

                    panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    break;

                default:

                    state = STATE.NONE;

            }


        }

        function touchmove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();
            event.stopPropagation();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.noRotate === true ) return;
                    if ( state !== STATE.TOUCH_ROTATE ) return;

                    rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    rotateDelta.subVectors( rotateEnd, rotateStart );

                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                    rotateStart.copy( rotateEnd );

                    scope.update();
                    break;

                case 2: // two-fingered touch: dolly

                    if ( scope.noZoom === true ) return;
                    if ( state !== STATE.TOUCH_DOLLY ) return;

                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    var distance = Math.sqrt( dx * dx + dy * dy );

                    dollyEnd.set( 0, distance );
                    dollyDelta.subVectors( dollyEnd, dollyStart );

                    if ( dollyDelta.y > 0 ) {

                        scope.dollyOut();

                    } else {

                        scope.dollyIn();

                    }

                    dollyStart.copy( dollyEnd );

                    scope.update();
                    break;

                case 3: // three-fingered touch: pan

                    if ( scope.noPan === true ) return;
                    if ( state !== STATE.TOUCH_PAN ) return;

                    panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    panDelta.subVectors( panEnd, panStart );
                    
                    scope.pan( panDelta.x, panDelta.y );

                    panStart.copy( panEnd );

                    scope.update();
                    break;

                default:

                    state = STATE.NONE;

            }

        }

        function touchend( /* event */ ) {

            if ( scope.enabled === false ) return;

            state = STATE.NONE;

        }

        this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        this.domElement.addEventListener( 'mousedown', onMouseDown, false );
        this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
        this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        window.addEventListener( 'keydown', onKeyDown, false );

    }

    return Orbit;

} );