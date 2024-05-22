import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import displayCaseGLB from './display-case.glb';

import headGLB from './head.glb';
import robotGLB from './ihop-robot.glb';
import criticaGLB from './critica-phone.glb';
import forgeGLB from './anvil.glb';

import json from './models.json';

import leftarrow from './leftarrow.png';
import rightarrow from './rightarrow.png';

document.getElementById("left-arrow").children[0].src = leftarrow;
document.getElementById("right-arrow").children[0].src = rightarrow;

var current_index = 0;
var wanted_index = 0;

var global_scale = 1;
if (window.screen.width < 800){
    global_scale = 0.66;
}

// 3D Stuff
const models = [headGLB, criticaGLB, robotGLB, forgeGLB]

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true, precision:"highp"});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Configure renderer settings for high quality
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow mapping for smoother shadows
renderer.physicallyCorrectLights = true; // Physically correct lighting

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

var controls;
var prev_model = null;
var current_model = null;
var next_model = null;

//camera.position.y = 0.1;
camera.position.z = 5;

const loader = new GLTFLoader();

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(0.1, -0.1, 1); // Adjust the light position
scene.add(directionalLight);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 4);
directionalLight2.position.set(-0.1, -0.1, 1); // Adjust the light position
scene.add(directionalLight2);

var display_case;
loader.load( displayCaseGLB, function ( gltf ) {

	display_case = gltf.scene;
	scene.add( display_case );
	display_case.position.set(0, 0, -0.5);
	display_case.rotation.y = -3.14/2;
	display_case.scale.set(global_scale, global_scale, global_scale);

}, undefined, function ( error ) {
	console.error( error );
} );

/*                       INPUT                    */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isMouseDown = false;
let rotateStart = new THREE.Vector2();

document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);

function onMouseDown(event) {
    if (!event.target.closest('.no-drag')) {
      isMouseDown = true;
      rotateStart.set(event.clientX, event.clientY);
    }
}

function onMouseMove(event) {
    if (isMouseDown && current_model != null) {
      const rotateEnd = new THREE.Vector2(event.clientX, event.clientY);
      const delta = new THREE.Vector2().subVectors(rotateEnd, rotateStart);

      const theta = (2 * Math.PI * delta.x) / window.innerWidth;
      const phi = (2 * Math.PI * delta.y) / window.innerWidth;
      current_model.rotation.y += theta;
      current_model.rotation.x += phi;

      rotateStart.copy(rotateEnd);
    }
}

function onMouseUp() {
    isMouseDown = false;
}

function goToPrevModel(){
    wanted_index = current_index - 1;
}

function goToNextModel(){
    wanted_index = current_index + 1;
}

document.getElementById("left-arrow").onclick = goToPrevModel;
document.getElementById("right-arrow").onclick = goToNextModel;

function loadInfo(index){
    var modelInfo = json['models'][index];

    document.getElementById("model-name").innerHTML = modelInfo["title"];
    document.getElementById("model-description").innerHTML = modelInfo['description'];
    document.getElementById("model-subtitle").innerHTML = modelInfo['subtitle'];
    document.getElementById("model-date").innerHTML = modelInfo['date'];

    document.getElementById("model-video-left").style.visibility = 'visible';
    document.getElementById("model-video-right").style.visibility = 'visible';

    var left_video = document.getElementById("model-video-left");
    var right_video = document.getElementById("model-video-right");

    for(var i = left_video.children.length-1; i < 0; i--){
        left_video.children[i].remove();
    }
    for(var i = right_video.children.length-1; i < 0; i--){
        right_video.children[i].remove();
    }

    if(modelInfo['videos'].length > 0){

        left_video.style.visibility = 'visible';
//        var source = document.getElementById("model-video-left").children[0];
        var source = document.createElement('source');
        source.setAttribute('src', modelInfo['videos'][0]);
        source.setAttribute('type', 'video/mp4');
        left_video.appendChild(source);
    } else{
        document.getElementById("model-video-left").style.visibility = 'hidden';
    }

    if(modelInfo['videos'].length > 1){
        right_video.style.visibility = 'visible';
        var source = document.createElement('source');
        source.setAttribute('src', modelInfo['videos'][1]);
        source.setAttribute('type', 'video/mp4');
        right_video.appendChild(source);
    } else{
        document.getElementById("model-video-right").style.visibility = 'hidden';
    }

    // make the arrows invisible depending on if there is a next item to display
    if(index <= 0){
        document.getElementById("left-arrow").style.visibility = 'hidden';
    } else {
        document.getElementById("left-arrow").style.visibility = 'visible';
    }
    if(index >= models.length-1){
        document.getElementById("right-arrow").style.visibility = 'hidden';
    } else {
        document.getElementById("right-arrow").style.visibility = 'visible';
    }
}

function loadModel(index){
    /*          LOAD INFO           */
    var modelInfo = json['models'][index];

    loader.load( models[index], function ( gltf ) {
        current_model = gltf.scene;
        scene.add( current_model );
        console.log("LOADED ROBOT");
        current_model.position.set(0, 0, 0);
        current_model.scale.set(global_scale, global_scale, global_scale);
    }, undefined, function ( error ) {
        console.error( error );
    } );

    loadInfo(index);

    // load prev model (only the model)
    if(index > 0){
        loader.load( models[index-1], function ( gltf ) {
            prev_model = gltf.scene;
            scene.add( prev_model );
            prev_model.position.set(-4.5*global_scale, 0, 0);
            prev_model.scale.set(global_scale, global_scale, global_scale);
        }, undefined, function ( error ) {
            console.error( error );
        } );
    }

    // load next model (only the model)
    if(models.length > index+1){
        loader.load( models[index+1], function ( gltf ) {
            next_model = gltf.scene;
            scene.add( next_model );
            next_model.position.set(4.5*global_scale, 0, 0);
            next_model.scale.set(global_scale, global_scale, global_scale);
        }, undefined, function ( error ) {
            console.error( error );
        } );
    }
}

function slideToPrevModel(){
    /*          LOAD INFO           */
    loadInfo(current_index-1);
}

function slideToNextModel(){
    /*          LOAD INFO           */
    loadInfo(current_index+1);
}

loadModel(0);

// Handle window resize
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame( animate );

	// rotate current model
	if(current_model != null && !isMouseDown){
	    current_model.rotation.y -= 0.005;
	}

	if(display_case != null && current_model != null){
        if (wanted_index > current_index && next_model != null){
            slideToNextModel();
            // going forwards
            current_model.position.x -= 0.1;
            next_model.position.x -= 0.1;
            if (prev_model != null)
                prev_model.position.x -= 0.1;
            display_case.position.x -= 0.1;
            if(next_model.position.x <= 0){
                scene.remove(prev_model);
                current_index += 1;

                // transition variables
                prev_model = current_model;
                current_model = next_model;
                next_model = null;

                display_case.position.x = 0;

                // load next model (only the model)
                if(models.length > current_index+1){
                    loader.load( models[current_index+1], function ( gltf ) {
                        next_model = gltf.scene;
                        scene.add( next_model );
                        next_model.position.set(4.5*global_scale, 0, 0);
                        next_model.scale.set(global_scale, global_scale, global_scale);
                    }, undefined, function ( error ) {
                        console.error( error );
                    } );
                }

            }
        }

        if (wanted_index < current_index && prev_model != null){
            slideToPrevModel();
            // going backwards
            current_model.position.x += 0.1;
            prev_model.position.x += 0.1;
            if (next_model != null){
                next_model.position.x += 0.1;
            }

            display_case.position.x += 0.1;

            if(prev_model.position.x >= 0){
                scene.remove(next_model);
                current_index -= 1;

                // transition variables
                next_model = current_model;
                current_model = prev_model;
                prev_model = null;

                display_case.position.x = 0;

                // load prev model (only the model)
                if(current_index > 0){
                    loader.load( models[current_index-1], function ( gltf ) {
                        prev_model = gltf.scene;
                        scene.add( prev_model );
                        prev_model.position.set(-4.5*global_scale, 0, 0);
                        prev_model.scale.set(global_scale, global_scale, global_scale);
                    }, undefined, function ( error ) {
                        console.error( error );
                    } );
                }

            }
        }
	}

    if(controls != null){
	    controls.update();
	}

	renderer.render( scene, camera );
}

if (WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}