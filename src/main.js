require.config( {
    
    baseUrl: '/src/',
    paths: {

        'text'          : '../bower_components/requirejs-text/text',
        'underscore'    : '../bower_components/underscore/underscore',
        'async'         : '../bower_components/async/lib/async',

        'Class' : 'core/class',
        'Events': 'core/events',
        'Base'  : 'core/base',
        
        'Vec2'      : 'math/vec2',
        'Vec3'      : 'math/vec3',
        'Vec4'      : 'math/vec4',
        'Mat3'      : 'math/mat3',
        'Mat4'      : 'math/mat4',
        'Box3'      : 'math/Box3',
        'Plane'     : 'math/Plane',
        'Sphere'    : 'math/Sphere',
        'Frustum'   : 'math/frustum',
        'Rotation'  : 'math/rotation',
        'Quaternion': 'math/quaternion',

        'Renderer'      : 'renderer/renderer',
        'WebGLRenderer' : 'renderer/webglrenderer',
        'CSS3DRenderer' : 'renderer/css3drenderer',
        
        'Camera'            : 'camera/camera',
        'PerspectiveCamera' : 'camera/perspectivecamera',
        
        'Display'   : 'display/display',
        'Mesh'      : 'display/mesh',
        'CSS3D'     : 'display/css3d',
        
        'Program'   : 'webgl/program',
        'Attribute' : 'webgl/attribute',
        'Uniform'   : 'webgl/uniform',
        'Pass'      : 'webgl/pass',
        
        'CONST': 'const',
        'Node': 'node',

        'Material': 'material',
        'View': 'view',
        'Loader': 'loader',
        'GLTFLoader': 'gltfloader',


        'jquery': '../bower_components/jquery/dist/jquery'
    }

} );