// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
//Assignment grader notes: Most code based off of Professor's walkthrough videos. ChatGPT sometimes helped me debug, get unstuck with my code, and learn new stuff for my code. I made comments in my code indicating where it was used. Also recieved small help from course tutor.

var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`
//where pointsize changes the size of the squares.


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;     //use color
    }
    else if (u_whichTexture == -1){   //use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0){      //use texture
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else{                  //Error, put red
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  }` // add a line saying that if I don't want to use a specific texture or not in fragment shader.

//Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST); //Depth buffer will keep track of whats in front of something else.

}

function connectVariablesToGLSL(){

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix')
    return
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture){
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Set an initial value for this matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements); 
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);   //If professor's guides make things dissapear, probably forgot to initialize something. 
}


// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_yellowAngle = 0;
let g_yellowAngleRight = 0;
let g_magentaAngle = 0;
let g_left_footangle = 0;
let g_midLegAngle = 0;   //Chat gpt helped me debug my slider control for a second level joint (I originally had but got rid of and couldn't get it to work anymore when I tried implementing again). So it suggested me to add this line of code
let g_yellowAnimation=false;  //Always start without animation when starting up
let mouse_x = 0;
let mouse_y = 0;
let g_wattleAnimation = false;
let g_wattleAnimationrock = 0;
//let g_selectedSegment = 3;

function addActionForHTMLUI(){
  //Button Events
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};

  //Size Slider Events (chat gpt helped me fix this function, for some reason the professor's code was 
  // causing the program to draw when I simply just hovered my mouse over the slider, which I don't want)
  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = this.value; 
    renderAllShapes(); 
  });  //calls renderallshapes everytime the slider moves dynamically. Updates happen on the current state of the world.

//Chat gpt helped me debug my slider control for a second level joint (I originally had but got rid of and couldn't get it to work anymore when I tried implementing again). So it suggested me to add this line of code
  document.getElementById('angleSlideY').addEventListener('input', function() {
    g_globalAngleY = this.value; 
    renderAllShapes(); 
  });
  // Color Slider Events
  //document.getElementById('yellowSlide').addEventListener('input', function() {g_yellowAngle = this.value; renderAllShapes();});

  document.getElementById('yellowSlideRight').addEventListener('input', function() {g_yellowAngleRight = this.value; renderAllShapes();});


  document.getElementById('left_foot_Slide').addEventListener('input', function() {g_left_footangle = this.value; renderAllShapes();});

  //Chat gpt helped me debug my slider control for a second level joint (I originally had but got rid of and couldn't get it to work anymore when I tried implementing again). So it suggested me to add this snippet of code
  document.getElementById('midLegSlider').addEventListener('input', function() {
    // Update the rotation angle of the mid left leg and the foot
    g_midLegAngle = this.value;
    // Render all shapes with updated rotation angle
    renderAllShapes();
});

// Mouse control to rotate canvas(CHATGPT helped me with this):
canvas.addEventListener('mousedown', function(ev) {
  // Event listener for mouse move to handle rotation while dragging on canvas
  canvas.addEventListener('mousemove', mouseMoveHandler);
});

// handle mouse move for rotation of canvas(CHATGPT helped me with this):
function mouseMoveHandler(ev) {
  // Calculate movement delta
  let X = ev.clientX - mouse_x;
  let Y = ev.clientY - mouse_y;
  
  // Update rotation angles based on mouse movement
  g_globalAngle += X * 1; // Sensitivity of 1 to make it fast
  g_globalAngleY += Y * 1;
  
  // Store intermediate mouse position
  mouse_x = ev.clientX;
  mouse_y = ev.clientY;
  
  // Render shapes with updated rotation angles
  renderAllShapes(); //professor's code
}

// Function to handle mouse up event (rotate canvas) (CHATGPT helped me with this):
canvas.addEventListener('mouseup', function(ev) {
  // Remove the mouse move event listener when mouse is released
  canvas.removeEventListener('mousemove', mouseMoveHandler);
});
}

function initTextures() {
  var image = new Image();   // Create a texture object
  var image2 = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }

  //ChatGPT helped me debug this line of code to add new texture (add second parameter for texture unit)
  image.onload = function(){ sendTextureToGLSL(image,0); }; //this will setup function that will run when image is done laoding, runs after laoding is completed
  
  image.src = '../src/sky.jpg';

//ChatGPT helped me debug this line of code to add new texture (add second parameter for texture unit)
  image2.onload = function(){ sendTextureToGLSL(image2,1); }; //this will setup function that will run when image is done laoding, runs after laoding is completed
  
  image2.src = '../src/grass.jpg';

  return true;


// Add more texture loading
}

//ChatGPT helped me fix some lines of code in this function to accomodate and also helped me learn how to handle 2 textures in a program.
function sendTextureToGLSL(image, textureUnit) {
  var texture = gl.createTexture();
  if (!texture){
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

//ChatGPT helped me learn in these if-else statements how to handle using two textures (and additional ones if needed)
  if (textureUnit == 0) {
    gl.uniform1i(u_Sampler0, textureUnit);
  } else if (textureUnit == 1) {
    gl.uniform1i(u_Sampler1, textureUnit);
  }

  return texture;
}



function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { if(ev.buttons == 1) {click(ev) } };  //drag and move mouse on canvas

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1); //Chatgpt helped me calculate a good color for my background to allow the shadows to appear nicely (baby blue)

  // Register function (event handler) to be called on a mouse press
  //Code borrowed and learned from: https://people.ucsc.edu/~jrgu/asg2/blockyAnimal/BlockyAnimal.js
  canvas.onclick = function(ev) {if(ev.shiftKey) {if (g_wattleAnimation){g_wattleAnimation = false} g_wattleAnimation = true}}
  canvas.onmousedown = origin;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clears the color and the depths (Rohan the course tutor helped me with this line of code)

  //renderAllShapes();
  requestAnimationFrame(tick);

  //canvas.onmousemove = function(ev) {if(ev.buttons == 1)}
  document.onkeydown = keydown;

  initTextures();
}

//var g_shapesList = [];

//  var g_points = [];  // The array for the position of a mouse press
//  var g_colors = [1.0, 1.0, 1.0, 1.0];  // The array to store the color of a point
//  var g_sizes = [];

// Keep track of startime when program starts and the seconds
var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now/1000.0-g_startTime;

//Called by the broswer repeatedly whenever its time
function tick(){
  // Save the current time
  g_seconds = performance.now()/120.0-g_startTime;
  //console.log(g_seconds);

  //Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}


function click(ev) {
  //Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev); // grab the values of the click event and return it in WebGl coordinates.
  
  //Create and store the new point
  let point;
  if(g_selectedType==POINT){
    point = new Point();
  }
  else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  }
  else if (g_selectedType==CIRCLE){
    point = new Circle();
    // Set the segments property of the circle
    point.segments = g_selectedSegment;  //chat gpt helped me come up with this line of code, I was stuck debugging part 11 but it helped me come up with this code.
  }

  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
  
}

function updateAnimationAngles(){ //put all of the different angles that we are going to move with the on/off button here
  if (g_yellowAnimation){                             //g_yellowAnimation is currently being used to animate all of the objects
    g_yellowAngle = (-34*Math.sin(g_seconds));        //ChatGPT helped me figure out the math for the angle rotations for the animations
  }
  if(g_yellowAnimation){
    g_yellowAngleRight = (34*Math.sin(g_seconds));
  }
  if(g_wattleAnimation){
    g_wattleAnimationrock = (-34 * Math.sin(g_seconds));
  }
}

function keydown(ev) {
  if(ev.keyCode == 39) { // The right arrow key was pressed
    g_eye[0] += 0.2;
  } else 
  if (ev.keyCode == 37) { // The left arrow key was pressed
    g_eye[0] -= 0.2;
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

var g_eye=[0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0];



function renderAllShapes(){

  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat=new Matrix4();
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);  //(eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  //Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //Pass the matrix to u_ModelMatrix attribute (ChatGPT helped me create this y-axis slider part)
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>  (rendering points)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

// Draw the floor
  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum=-2;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  //Draw the sky
  var sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum= 0;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();
  
  //Draw a cube (red one)
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = -1;
  body.matrix.translate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, 0.3, 0.5);         //this one happens first! Right to left matrix multiplication
  body.render();


  //Draw a cube (red one)
  var body2 = new Cube();
  body2.color = [1.0, 0.0, 0.0, 1.0];
  body2.textureNum = -1;
  body2.matrix.translate(0.60, -0.75, 0.0);
  body2.matrix.rotate(-5,1,0,0);
  body2.matrix.scale(0.5, 0.3, 0.5);         //this one happens first! Right to left matrix multiplication
  body2.render();


  // Draw a yellow left arm
  var leftArm = new Cube();
  leftArm.color = [1,1,0,1];
  leftArm.matrix.setTranslate(0,-0.5,0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  // leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);  //2.6: rotate the yellow joint
  leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);  //2.6: rotate the yellow joint
  var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();

  //Test box (pink box)
  var box = new Cube();
  box.color = [1,0,1,1];
  box.textureNum = 1;
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0,0.65,0.0,0);
  box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  box.matrix.scale(0.3, 0.3, 0.3);
  box.matrix.translate(-0.5,0,-0.001);
  box.render();


  // //Party hat!!
  var hat = new Pyramid();
  hat.color = [0.0, 1.0, 0.0, 1.0];
  hat.textureNum = 1;
  hat.matrix.translate(-0.55, -0.5, 1.0);
  hat.matrix.scale(0.4, 0.4, 0.4);
  hat.render();

  //Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}


// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
