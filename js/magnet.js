/*******************************************************************************
*                                   IMPORTANT
* This script is not in the public domain. It is distributed with the GNU
* General Public License which lets you do pretty much anything you want with it
* but there are some restrictions -the most important of which is the fact that
* this script comes with ABSOLUTELY NO WARRANTY. Please read ./LICENSE for more
* information. Other than that, please feel free to modify the following in any
* way you please. If you think that you've improved it, let me know by creating
* a pull request on my GitHub, egefeyzioglu.
*
* Also, this script was created for Lock Bypass Village in DEFCON 28 SAFE MODE.
* Drop by our village the next time if you are interested in stuff like this, we
* have many more demos along these lines. Check us out at bypasvillage.org for
* more information.
*
* NB: Lock Bypass Village is allowed to distribute this product under a
*     different license than described in ./LICENSE ; granted the terms about
*     absolutely no warranty, and the terms about distributing the work under
*     the same license stay in the license they choose to distribute this work
*     under. IF YOU RECEIVED THIS WORK THROUGH THEM, THEIR LICENSE APPLIES.
*     
*                                                               -Ege Feyzioglu
*
*******************************************************************************/

import { GLTFLoader } from './GLTFLoader.js';

//Magnetic permeability of free space, unit is Newtons per square Ampere (base SI)
const mu_0 = 1.2566370614E-6;

//Used by bField(), returns the magnetic field induced by the magnetic dipole m: Vector, at a displacement r: Vector away from the moment
function bFieldFromMomentAndR(r, m){
  //3 * unit(r) * (m dot unit(r) - m) / r^3
  return (r.unit().multiply(3).multiply(m.dot(r.unit())).subtract(m)).divide(Math.pow(r.length(), 3)).multiply(mu_0/4*Math.PI);
}

//Returns the magnetic field at coords: Vector, given the dipoles: Object[] (dipoles defined below)
function bField(dipoles, coords){
  var total = new Vector(0,0,0);
  for (var i = 0; i < dipoles.length; i++) {
    total = total.add(bFieldFromMomentAndR(coords.subtract(dipoles[i].coords), dipoles[i].m));
  }
  return total;
}

var planeY = 5.55; //This is the y-value which defines the plane the stick is moving on. The sensor and the door magnet is also defined relative to this

//dipoles[0] is the door magnet, dipoles[1] is the stick magnet
var dipoles = [
  {
    m: new Vector(0, 0.006, 0),
    coords: new Vector(-1.65,planeY - 0.05,0.04)
  }, {
    m: new Vector(0, 0.006, 0),
    coords: new Vector(-1.3, planeY, 0.5)
  }
];

//Stores information about the sensor in the door fame
var sensor = {
  location: new Vector(-1.65,planeY + 0.05,0.04),
  bField: new Vector(0),
  threshold: 10E-6,
  triggered: false,
  alongAxis: "y",
  invert: false //Whether the sensor is pointing toward +(alongAxis) or -(alongAxis)
};

//How many radians the door is rotated from its closed position. Read by the renderer, set by setDoorOpen
var doorOpenAngle = 0;

var door; //Reference to the door object
var stick; //Reference to the stick object

var viewDiv; //Reference to the div holding the 3D view
var scene; //Reference to the 3D scene
var renderer; //Reference to the 3D renderer
var camera; //Reference to the 3D camera

function xyToTheta(x, y){
  return Math.atan(y/x) * 360 / (2 * 3.14);
}

function xyToAlpha(x, y){
  return Math.sqrt(x*x + y*y)/max;
}

//Returns an HTML formatted stringified representation of the dipoles array
function dipolesAsHTMLString() {
  var str = "[<br/>\n";
  for(var i = 0; i < dipoles.length; i++){
    str += "    " + i + ": {m: " + dipoles[i].m.toString() + ", coords: " + dipoles[i].coords.toString() + "}<br/>\n";
  }
  return str + "]";
}

//Calculates the new position of the door magnet based on the given angle of closedness (1.5094 [86.48 deg] - pi/2 rad.)
//Triggers updates to the sensor and info div
function setDoorOpen(angle) {
  var alpha = Math.log(Math.log($('input#door-closedness')[0].value));
  dipoles[0].coords = new Vector(-0.95 - 0.7*Math.sin(alpha), planeY - 0.05,0.04 - 0.7*Math.cos(alpha));
  doorOpenAngle = Math.PI/2 - alpha;
  updateSensor();
  updateInfo();
  updateDoorLinks();
}

//Updates the info div based on the information stored in sensor
function updateInfo() {
    $('div#info div#text span#By').html((sensor.bField.y * 1E6).toFixed(2) + " mT");
    $('div#info div#text span#threshold').html((sensor.threshold * (sensor.invert ? -1 : 1) * 1E6).toFixed(2) + " mT");
    $('div#info div#text span#state').html(sensor.triggered ? "OK" : "Alarm");


    //Debug div
    $('div#debug div#content').html(
      "<b>Door open angle</b>: " + (typeof alpha == "undefined" ? "Not Set" : (alpha + " rad (" + (alpha * 180 / Math.PI) + " deg)")) + "<br>" +
      "<b>Dipoles:</b> " + dipolesAsHTMLString() + "<br/>" +
      "<b>Sensor Coordinates:</b> " + sensor.location.toString() + "<br/>" +
      "<b>Sensor B Field</b>: " + sensor.bField.toString()
    );
}

//Updates sensor based on its properties and dipoles. B Field calculation is done here
function updateSensor() {
  sensor.bField = bField(dipoles, sensor.location);
  sensor.triggered = eval("bField(dipoles, sensor.location)." + sensor.alongAxis) * (sensor.invert ? -1 : 1) > sensor.threshold;
}

//Used to render the 3D view
var animate = function(){
  requestAnimationFrame(animate);
  scene.traverse(function(child) {
    if(child.constructor.name == "SkinnedMesh"){
      child.skeleton.bones[1].rotation.y = doorOpenAngle;
    }
    if(child.name == "Cube"){
      child.position.x = dipoles[1].coords.x;
      child.position.y = dipoles[1].coords.y;
      child.position.z = dipoles[1].coords.z;
    }
  });
  renderer.render(scene, camera);
}


//Updates the open and close door links' visibilities based on the range input value
function updateDoorLinks(){
  console.log("updateDoorLinks called");
  if($('div#info div#controls input')[0].value == $('div#info div#controls input')[0].min){
    $('div#info div#controls a#open-door').css("display", "none");
    $('div#info div#controls a#close-door').css("display", "inline");
  } else if($('div#info div#controls input')[0].value == $('div#info div#controls input')[0].max){
    $('div#info div#controls a#close-door').css("display", "none");
    $('div#info div#controls a#open-door').css("display", "inline");
  }
}

$(function() {
  //Initialise and bind the 3D Library (three.js)
  viewDiv = $('div#view')[0];
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  camera = new THREE.PerspectiveCamera(45, viewDiv.offsetWidth / viewDiv.offsetHeight, 0.1, 100);
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(viewDiv.offsetWidth, viewDiv.offsetHeight);
  viewDiv.appendChild(renderer.domElement);

  //Create and add the lights. These are positioned below after the camera
  var keyLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(keyLight);
  var fillerLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  // scene.add(fillerLight1);
  var fillerLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
  // scene.add(fillerLight2);

  //Load models
  var loader = new GLTFLoader();
  loader.load('glb/Door_1.1.glb', function(obj) {
    door = obj;
    var texture = new THREE.TextureLoader().load("texture/purty_wood@2X.png");
    scene.add(door.scene);
  });
  loader.load('glb/stick-scaled.glb', function(obj) {
    stick = obj;
    scene.add(stick.scene);
  });

  // The X axis is red. The Y axis is green. The Z axis is blue.
  // scene.add(new THREE.AxesHelper( 6.6 ));

  //Position the camera
  camera.position.x = -3.5;
  camera.position.y = 5.8;
  camera.position.z = 2;
  camera.rotation.y = -1.5*Math.PI/6;

  //Position the lights
  keyLight.position.x = 10*camera.position.x;
  keyLight.position.z = 10*camera.position.z;
  fillerLight1.position.x = 0;
  fillerLight1.position.z = 1;
  fillerLight2.position.x = 1;
  fillerLight2.position.z = 0;

  //Start the renderer
  animate();

  $('input#door-closedness').on("input", function() { //When the open slider changes, calculate new magnet position and update stuff (done inside the function)
    setDoorOpen(this.value);
  });

  $('html').on("keypress", function(e){ //Move the stick when the user presses WASD
    e = e || event; //Deal with IE
    switch(e.originalEvent.code){
      case "KeyW":
        if(dipoles[1].coords.x < 0.89) //Restrict movement to the door area
          dipoles[1].coords.x += 0.01;
        break;
      case "KeyA":
        dipoles[1].coords.z -= 0.01;
        break;
      case "KeyS":
        if(dipoles[1].coords.x > -1.78) //Restrict movement to the door area
        dipoles[1].coords.x -= 0.01;
        break;
      case "KeyD":
        dipoles[1].coords.z += 0.01;
        break;
      // case "KeyZ":
      //   dipoles[1].coords.y += 0.1;
      //   break;
      // case "KeyX":
      //   dipoles[1].coords.y -= 0.1;
    }
    updateSensor();
    updateInfo();
  });

  $(window).on("resize", function() { //When the window is resized, resize the renderer and camera
    camera.aspect = viewDiv.offsetWidth / viewDiv.offsetHeight;
    renderer.setSize(viewDiv.offsetWidth, viewDiv.offsetHeight);
  });

  $('div#info div#controls a#open-door').on("click", function() { //Open the door and hide the link if the open door link is clicked
    var interval = setInterval(function () {
        $('div#info div#controls input').val($('div#info div#controls input')[0].value - 1).trigger("input");
        if($('div#info div#controls input')[0].value == $('div#info div#controls input')[0].min){
          clearInterval(interval);
          updateDoorLinks();
        }
      }, 1);
  });

  $('div#info div#controls a#close-door').on("click", function() { //Close the door and hide the link if the close door link is clicked
    var intervalClose = setInterval(function () {
      $('div#info div#controls input').val($('div#info div#controls input')[0].value - 0 + 1).trigger("input");
      if($('div#info div#controls input')[0].value == $('div#info div#controls input')[0].max){
        clearInterval(intervalClose);
        updateDoorLinks();
      }
    }, 1);
  });

  updateSensor();
  updateInfo();
});
