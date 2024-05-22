import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import fontJson from './SometypeMonoRegular.json';

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera( width / -200, width / 200, height / 200, height / -200, 1, 1000 );;

const renderer = new THREE.WebGLRenderer({antialias: true, precision:"highp"});
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

// Configure renderer settings for high quality
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow mapping for smoother shadows
renderer.physicallyCorrectLights = true; // Physically correct lighting
renderer.setClearColor(0xffDADADA);

const geometry = new THREE.BoxGeometry( 4, 6, 0.5 );
const buttonGeometry = new THREE.BoxGeometry( 4, 0.5, 0.5 );
let matrix = new THREE.Matrix4();

const Sxy = 0
const Syx = 0
const Sxz = 0
const Szx = -0.5
const Szy = -0.5
const Syz = 0

matrix.set(   1,   Syx,  Szx,  0,
            Sxy,     1,  Szy,  0,
            Sxz,   Syz,   1,   0,
              0,     0,   0,   1  );

geometry.applyMatrix4( matrix );
buttonGeometry.applyMatrix4( matrix );

// 3D Text / Words
const fontLoader = new FontLoader();

fontLoader.load( fontJson, function ( font ) {
    alert('PRE-TEXT');
    const text = new TextGeometry( "Get a 3D Website", {
        font: font,
        size: 60,
    } );
    alert('TEXT');

    scene.add( text );
});

const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );

// Create a depth render target
const depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
depthRenderTarget.texture.format = THREE.RGBAFormat;

// Render the scene to the depth render target
renderer.setRenderTarget(depthRenderTarget);
renderer.render( scene, camera );
renderer.setRenderTarget(null); // Reset render target to default

// OUTLINE
const uniforms = {
    depthTexture: { value: depthRenderTarget.texture },
    objectColor: { value: new THREE.Color(0.9,0.9,0.9) },
    screenSize: { value: new THREE.Vector2(width, height)}
}
//first a couple of place holders
const MY_VERTEX_SHADER = "varying vec3 vNormal;\n\nvoid main(){\nvNormal = normal;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);\n}"
const MY_FRAGMENT_SHADER = 'precision mediump float;\n\nuniform vec3 objectColor; // Color of the object\n\nvarying vec3 vNormal; // Normal vector interpolated from the vertex shader\n\nvoid main() {\n    // Calculate edge intensity based on the dot product of the normal and the view direction\n    float edgeIntensity = abs(dot(vNormal, normalize(vec3(gl_FragCoord.xy, 0.0) - vec3(gl_FragCoord.xy, -1.0))));\n\n    // Threshold for detecting edges\n    float edgeThreshold = 0.9999999; // Adjust as needed\n\n    // Check if edge intensity exceeds the threshold\n    if (edgeIntensity > edgeThreshold) {\n        gl_FragColor = vec4(1.0); // White color for edges\n    } else {\n        gl_FragColor = vec4(objectColor, 1.0); // Original color for non-edges\n    }\n}'
//the wrapper
const outlineMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: MY_VERTEX_SHADER,
  fragmentShader: MY_FRAGMENT_SHADER,
})
const cube = new THREE.Mesh( geometry, outlineMaterial );
const button = new THREE.Mesh( buttonGeometry, outlineMaterial );
scene.add( cube );
scene.add( button );
cube.position.y = 0.4;
button.position.y = -3.1;

camera.position.z = 8;

// LIGHT
var light = new THREE.PointLight(0xffffff);
light.position.set(0,150,100);
scene.add(light);

// OUTLINE
//var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
//var outlineMesh2 = new THREE.Mesh( geometry, outlineMaterial2 );
//outlineMesh2.position.set(cube.position);
//outlineMesh2.scale.multiplyScalar(2);
//scene.add( outlineMesh2 );

function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
}

if (WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}

// Handle window resize
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}