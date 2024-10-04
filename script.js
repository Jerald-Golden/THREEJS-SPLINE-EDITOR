import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/TransformControls.js';
import { CatmullRomCurve3 } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/src/extras/curves/CatmullRomCurve3.js';

let currentMesh, transformControl;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

let instructionsShown = false;
function showInstructions() {
    if (!instructionsShown) {
        instructionsShown = true;
        const instructions = document.getElementById('instructions');
    }
}

showInstructions();

//scene
var scene = new THREE.Scene();

//camera
var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 250, 1000);

//renderer
var renderer = new THREE.WebGLRenderer({ canvas: my_canvas, antialiasing: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//controls
var controls = new OrbitControls(camera, renderer.domElement);

//background
scene.background = new THREE.Color(0xf0f0f0);

//light
var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(50, 200, 0);
scene.add(light);

//materials
var redMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000 });
var blueMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF, emissive: 0x0000FF });

//meshes
var planeGeometry = new THREE.PlaneGeometry(1500, 1500);
var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
scene.add(plane);

//crate objects[]
var objects = [];
objects.push(plane);
let createobject = null;
var connects = [];

//choose object

$(".object").click(function () {
    if (($(this).attr("id")) === "box") {
        createobject = "box";
    }
    if (($(this).attr("id")) === "sphere") {
        createobject = "sphere";
    }
    if (($(this).attr("id")) === "connect") {
        connectObjects();
    }
});

//click events
transformControl = new TransformControls(camera, renderer.domElement);
transformControl.showY = false
transformControl.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
});
scene.add(transformControl);

document.addEventListener('mousedown', onPointerDown);
document.addEventListener('mouseup', onPointerUp);
document.addEventListener('contextmenu', onRightClick);
document.addEventListener('dblclick', onPointerClick);
window.addEventListener('resize', onWindowResize);

function onPointerDown(event) {
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;
}

function onPointerUp(event) {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if (onDownPosition.distanceTo(onUpPosition) === 0) {
        transformControl.detach();
        render();
    }
}
let tubeMesh;
function connectObjects() {
    if (connects.length >= 2) {
        const points = [];

        for (let i = 0; i < connects.length; i++) {
            const object = connects[i];
            points.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
        }
        const curve = new CatmullRomCurve3(points);
        if (tubeMesh) {
            scene.remove(tubeMesh);
        }
        const tubeGeometry = new THREE.TubeGeometry(curve, 1000, 1, 10, false); //(path,tubularSegments , radius,radialSegments , closed )
        const tubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        scene.add(tubeMesh);

        render();
    } else {
        scene.remove(tubeMesh);
        console.log("At least two objects are required to connect.");
    }
}

function onPointerClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    let intersects = raycaster.intersectObjects(objects, false);

    const intersectionPoint = intersects[0].point;
    // console.log('Grid Position:', intersectionPoint);

    placeobject(intersects, intersectionPoint);
}

function placeobject(intersects, intersectionPoint) {
    if (intersects.length > 1) {
        const object = intersects[0].object;
        if (transformControl) {
            transformControl.attach(object);
            // console.log(object);
        }
    } else {
        if (transformControl) {
            transformControl.detach();

            if (createobject === "sphere") {
                var sphereGeometry = new THREE.SphereGeometry(10);
                currentMesh = new THREE.Mesh(sphereGeometry, redMaterial);
                currentMesh.position.set(intersectionPoint.x, 10, intersectionPoint.z);
                scene.add(currentMesh);
                objects.push(currentMesh);
            } else if (createobject === "box") {
                var boxGeometry = new THREE.BoxGeometry(20, 20, 20);
                currentMesh = new THREE.Mesh(boxGeometry, blueMaterial);
                currentMesh.position.set(intersectionPoint.x, 10, intersectionPoint.z);
                scene.add(currentMesh);
                objects.push(currentMesh);
            }
            render();
        }
    }
}

function onRightClick(event) {
    if (event.altKey) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        let intersects = raycaster.intersectObjects(objects, false);
        if (intersects.length > 1) {
            const object = intersects[0].object;
            scene.remove(object);
            objects = objects.filter(item => item !== object);
            connects = connects.filter(item => item !== object);
            connectObjects();
            console.log(intersects);
            render();
        }
    }
    else {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        let intersects = raycaster.intersectObjects(objects, false);

        // const intersectionPoint = intersects[0].point;

        if (intersects.length > 1) {
            const object = intersects[0].object;
            // console.log(object);
            connects.push(object);
            // console.log(connects);
        }
    }
}




function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

//Render
function render() {
    requestAnimationFrame(render);
    if (tubeMesh && connects.length >= 2) {
        const points = [];
        for (let i = 0; i < connects.length; i++) {
            const object = connects[i];
            points.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
        }
        const curve = new CatmullRomCurve3(points);
        tubeMesh.geometry.dispose();
        tubeMesh.geometry = new THREE.TubeGeometry(curve, 100, 1, 10, false);
    } else {
        scene.remove(tubeMesh);
    }
    renderer.render(scene, camera);
}

render();
