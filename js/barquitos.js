/**
 * Escena.js
 * 
 * Seminario AGM. Escena basica en three.js: 
 * Transformaciones, animacion basica y modelos importados
 * 
 * @author <rvivo@upv.es>, 2022
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import { TWEEN } from "../lib/tween.module.min.js";
import { GLTFLoader } from "../lib/GLTFLoader.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js";

// Variables estándar
let renderer, scene, camera;
let rayon, souris;

// Otras globales
let firstShipObject, missileObject, secondShipObject;
let ship1Clicked = false
let secondShipClicked = false
let positionFirstShip = 0;
let positionSecondShip = 0;
let rightFirstShip = true
let rightSecondShip = true
let cameraControls;

// Acciones
init();
loadScene();
render();

//! Inicializacion del entorno: motor, camara y escena
function init() {
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    // Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 7);
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    rayon = new THREE.Raycaster();
}

//! Carga de objetos y construccion del grafo
function loadScene() {
    const path = "./images/";

    const texsuelo = new THREE.TextureLoader().load(path + "sea.jpg");

    // Luces
    const ambiental = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambiental);
    const direccional = new THREE.DirectionalLight(0xFFFFFF, 1);
    direccional.position.set(1, 1, 1);
    direccional.castShadow = true;
    scene.add(direccional);

    // Suelo
    const matsuelo = new THREE.MeshStandardMaterial({ color: "rgb(150,150,150)", map: texsuelo });
    const suelo = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 3), matsuelo);
    suelo.position.y = 0.5;
    scene.add(suelo);

    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

    glloader.load('models/ship2/scene.gltf', function (gltf) {
        gltf.scene.scale.set(0.01, 0.01, 0.01)
        gltf.scene.position.y = 0.5;
        gltf.scene.position.z = 1.5
        gltf.scene.rotation.y = -Math.PI / 2;
        gltf.scene.rotation.z = -Math.PI / 2;
        firstShipObject.add(gltf.scene)

    }, undefined, function (error) {

        console.error(error);

    });

    glloader.load('models/ship3/scene.gltf', function (gltf) {
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        gltf.scene.position.y = 2.5;
        gltf.scene.position.z = 0.8;
        gltf.scene.rotation.y = -Math.PI / 2;
        gltf.scene.rotation.z = -Math.PI / 2;
        suelo.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

    glloader.load('models/ship6/scene.gltf', function (gltf) {
        gltf.scene.scale.set(0.0015, 0.0015, 0.0015)
        gltf.scene.position.y = -0.7;
        gltf.scene.position.z = 1.5;
        gltf.scene.rotation.y = -Math.PI / 2;
        gltf.scene.rotation.z = -Math.PI / 2;
        secondShipObject.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

    // Objeto contenedor
    firstShipObject = new THREE.Object3D();
    missileObject = new THREE.Object3D();
    secondShipObject = new THREE.Object3D();
    firstShipObject.name = 'firstShip'
    secondShipObject.name = 'secondShip'

    // Organizacion del grafo
    scene.add(firstShipObject);
    scene.add(missileObject)
    scene.add(secondShipObject)

    // Fondo
    const fondo = [];
    fondo.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(path + "sky5.jpg")
    }));
    fondo.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(path + "sky5.jpg")
    }));
    fondo.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(path + "sky5.jpg")
    }));
    fondo.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(path + "sky5.jpg")
    }));
    fondo.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(path + "sky5.jpg")
    }));
    fondo.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load(path + "sky5.jpg")
    }));
    const habitacion = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), fondo);
    scene.add(habitacion);
}

//! Etapa de actualizacion para cada frame
function update() {
    moveFirstShip()
    moveSecondShip()
    TWEEN.update()
}

function onDocumentMouseDown(e) {
    const glloader = new GLTFLoader();

    missileObject.visible = true
    glloader.load('models/missile/scene.gltf', function (gltf) {
        gltf.scene.scale.set(0.2, 0.2, 0.2)
        gltf.scene.position.y = 2.6;
        gltf.scene.position.x = -0.28
        gltf.scene.position.z = 2
        missileObject.add(gltf.scene)

    }, undefined, function (error) {

        console.error(error);

    });

    //1. sets the mouse position with a coordinate system where the center
    // of the screen is the origin
    souris = new THREE.Vector2();
    souris.x = (e.clientX / window.innerWidth) * 2 - 1;
    souris.y = - (e.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    rayon.setFromCamera(souris, camera);
    //3. compute intersections
    var intersections = rayon.intersectObjects(scene.children);

    const coords = { x: missileObject.position.x, y: missileObject.position.y }
    const tween = new TWEEN.Tween(coords).
        to({ x: 0, y: -4 }, 1000).
        interpolation(TWEEN.Interpolation.Linear).
        easing(TWEEN.Easing.Exponential.InOut)

    tween.onUpdate(function (object) {
        missileObject.position.x = object.x
        missileObject.position.y = object.y
    })

    tween.onComplete(() => {
        missileObject.position.x = 0
        missileObject.position.y = 0
        missileObject.position.z = 0
        missileObject.visible = false
    })

    tween.start()

    if (intersections.length > 1) {
        var found = false
        var parent = intersections[0].object.parent
        while (!found) {
            parent = parent.parent
            if (parent.name == 'firstShip') {
                setTimeout(() => {
                    ship1Clicked = true
                    found = true
                }, 500)
                break
            }

            if (parent.name == 'secondShip') {
                setTimeout(() => {
                    secondShipClicked = true
                    found = true
                }, 700)
                break
            }
        }
    }
}

function moveFirstShip() {
    if (firstShipObject.position.z <= -3) {
        firstShipObject.visible = false
    }

    if (ship1Clicked && firstShipObject.visible) {
        positionFirstShip = firstShipObject.position.z - 0.01
        firstShipObject.position.z = positionFirstShip
    }

    else {
        if (rightFirstShip) {
            positionFirstShip = firstShipObject.position.x + 0.01
        }

        else {
            positionFirstShip = firstShipObject.position.x - 0.01
        }

        if (firstShipObject.position.x >= 2.5) {
            rightFirstShip = false
        }

        if (firstShipObject.position.x <= -3) {
            rightFirstShip = true
        }

        firstShipObject.position.x = positionFirstShip
    }
}

function moveSecondShip() {
    if (secondShipObject.position.z <= -3) {
        secondShipObject.visible = false
    }

    if (secondShipClicked && secondShipObject.visible) {
        positionSecondShip = secondShipObject.position.z - 0.01
        secondShipObject.position.z = positionSecondShip
    }

    else {
        if (rightSecondShip) {
            positionSecondShip = secondShipObject.position.x + 0.02
        }

        else {
            positionSecondShip = secondShipObject.position.x - 0.02
        }

        if (secondShipObject.position.x >= 1.5) {
            rightSecondShip = false
        }

        if (secondShipObject.position.x <= -1.5) {
            rightSecondShip = true
        }

        secondShipObject.position.x = positionSecondShip
    }
}

//! Callback de refresco (se encola a si misma)
function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}