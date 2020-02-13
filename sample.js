var renderer, scene, camera;

var particleSystem, uniforms, geometry;

var noParticles = 100;
var radius = 15;
var particleRad = 1.5;
var redirectionParticles = [];
var particlesInfo = [];
var noInfoParam = 6;

var RADIO = 0;
var DIRECTION = 1;
var ACCELERATION = 2;
var POSITION = 3;

var acc = 1;
var accGr = 1;

var time = 0;
var xVector = new THREE.Vector3(1,0,0);
var yVector = new THREE.Vector3(0,1,0);
var zVector = new THREE.Vector3(0,0,1);
var xVectorNeg = new THREE.Vector3(-1,0,0);
var yVectorNeg = new THREE.Vector3(0,-1,0);
var zVectorNeg = new THREE.Vector3(0,0,-1);

var gravity = 9.8;
var cameraz = 70;
init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );

  scene = new THREE.Scene();

  uniforms = {

    pointTexture: { value: new THREE.TextureLoader().load( "textures/bubble.png" ) }

  };

  var shaderMaterial = new THREE.ShaderMaterial( {

    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

    blending: THREE.NormalBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true

  } );

  geometry = new THREE.BufferGeometry();

  var positions = [];
  var colors = [];
  var sizes = [];

  var color = new THREE.Color();
  var x,z;
  var yEl = radius;
  for ( var i = 0; i < noParticles; i ++ ) {

    particlesInfo.push([]);

    if(i == 0){
      positions.push(getRandomArbitrary(-radius,radius) );
      positions.push(yEl);
      positions.push( getRandomArbitrary(-radius,radius) );
    }else{
      x = getRandomArbitrary(-radius,radius);
      z = getRandomArbitrary(-radius,radius);
      positions.push( x );
      positions.push(yEl);
      positions.push( z );
    }
    var counter = 0;
    for( var j = 0; j<i; j++){
      
      var changed = false
      while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <  particleRad*2){

        // console.log(counter);
        // console.log(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]));
        positions[i*3] = getRandomArbitrary(-radius,radius);
        positions[i*3+1] = yEl;
        positions[i*3+2] = getRandomArbitrary(-radius,radius);
        // console.log(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]));
        counter++;
        var changed = true;
      }
      if(changed){
        j = -1;
        counter++;
        if(counter > ((radius+particleRad)/(2*particleRad))*((radius+particleRad)/(2*particleRad))){
          yEl -= particleRad/2;
          counter = 0;
        }
      }
    }
    particlesInfo[i].push(radius);

    color.setHSL( i / noParticles, 1.0, 0.5 );
    colors.push( 0.1, 0.62, 1.0 );
    // var speed = getRandomArbitrary(1,100)/200;
    // var direction = new THREE.Vector3(getRandomArbitrary(-radius,radius), getRandomArbitrary(-radius,radius), getRandomArbitrary(-radius,radius)).setLength(speed);

    var direction = new THREE.Vector3(0, -0.01, 0);
    particlesInfo[i].push(direction);
    // particlesInfo[i].push(getRandomArbitrary(1,100)/20000);
    particlesInfo[i].push(0.01);
    particlesInfo[i].push(positions[i], positions[i+1], positions[i+2]);
    particlesInfo[i].push(i);
    redirectionParticles.push(i);
    sizes.push( 20 );
  }
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage )  );
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ));

  particleSystem = new THREE.Points( geometry, shaderMaterial );

  scene.add( particleSystem );

  addCube();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  var container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  camera.position.z += cameraz;

  acc = -0.0001;
  time = 0;
}

function animate() {

  requestAnimationFrame( animate );

  render();

}

var timeLastTime;
var checked = false; 
var restartTimer = true;
var countingTime = true;
var updatedDir;
var curDir
function render() {
  var positions = geometry.attributes.position.array;

  if(!checked){
    updatedDir = [];
    for ( var i = 0; i < noParticles; i++ ) {
      particlesInfo[i][POSITION] = positions[i*3];
      particlesInfo[i][POSITION+2] = positions[i*3+2];
      updatedDir.push(null);
    }
   
    checked = !checked
  }
  if(restartTimer){
    time= 0;
    restartTimer = false;
  }if(countingTime){
    time += (Date.now() - timeLastTime)/1000.0;
  }

  timeLastTime = Date.now();
  
  for ( var i = 0; i < noParticles; i++ ) {

    // console.log(particlesInfo[i][DIRECTION]);
    
    positions[i*3] += particlesInfo[i][DIRECTION].getComponent(0);
    positions[i*3+1] += particlesInfo[i][DIRECTION].getComponent(1);
    positions[i*3+2] += particlesInfo[i][DIRECTION].getComponent(2);
    
    particlesInfo[i][DIRECTION].setComponent(1, particlesInfo[i][DIRECTION].getComponent(1) - time * particlesInfo[i][ACCELERATION]);


    curDir = particlesInfo[i][DIRECTION];
    var collisionsAbove = [];
    var collisionsBelow = [];
    
    for( var j = 0; j<noParticles; j++){
      if(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) < particleRad*2 && positions[i*3+1] > positions[j*3+1]){
        // console.log("collisions moving");
        // collisions.push(findNewDirectionOnCollision([positions[j*3], positions[j*3+1], positions[j*3+2]], 
        //                                                             [positions[i*3], positions[i*3+1], positions[i*3+1]],
        //                                                             particlesInfo[i][DIRECTION].length()));
        // console.log(collisions);
        collisionsBelow.push(j);
      }
      if(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) < particleRad*2 && i !=j && positions[i*3+1] <= positions[j*3+1]){
        collisionsAbove.push(j)
      }
    } 

    curDir = particlesCollision([positions[i*3], positions[i*3+1], positions[i*3+2]], particlesInfo[i][DIRECTION], collisionsAbove, collisionsBelow, positions);
    // console.log(curDir);
    var collX = 0;
    var collZ = 0;
    if(Math.abs(positions[i*3+2]) > radius){
      if(positions[i*3+2] > radius){
        positions[i*3+2] = radius;
        collZ = 1
      }else{
        positions[i*3+2] = -radius;
        collZ = -1
      }
    } if(Math.abs(positions[i*3]) > radius){
      if(positions[i*3] > radius){
        positions[i*3] = radius;
        collX = 1
      }else{
        positions[i*3] = -radius;
        collX = -1
      }
    }

    if(Math.abs(positions[i*3+1]) > radius){
      if(positions[i*3+1] > radius){
        positions[i*3+1] = radius;
      }else{
        positions[i*3+1] = -radius;
      }
      curDir = collisionOnWallY(curDir, collX, collZ);
      // console.log(curDir);
    }

    if(collZ != 0){
      curDir = collisionOnWallZ(curDir);
    }
    if(collX != 0){
      curDir = collisionOnWallX(curDir);
    }
    

    if(curDir.getComponent(1) == 0){
      countingTime = false;
    }
    if(curDir.getComponent(1) != 0 && particlesInfo[i][DIRECTION].getComponent(1) == 0){
      particlesInfo[i][ACCELERATION] = 0.01;
      restartTimer = true;
      countingTime = true;
    }

    updatedDir[i] = curDir;
    
  }
  geometry.attributes.position.needsUpdate = true;


  for ( var i = 0; i < noParticles; i++ ) {
    particlesInfo[i][DIRECTION] = updatedDir[i];
  }

  renderer.render( scene, camera );

}

function updatePositionFalling(time, dirParticle){
  var initial = dirParticle.getComponent(1);
  dirParticle.setComponent(1, initial-((1/2)*gravity*time*time));
}

function collisionOnWallX(dirParticle){
  if(dirParticle.getComponent(1)<0){
    return new THREE.Vector3(0, dirParticle.getComponent(1) - Math.abs(dirParticle.getComponent(0)), dirParticle.getComponent(2));
  }
  return new THREE.Vector3(0, Math.abs(dirParticle.getComponent(0)), dirParticle.getComponent(2));
}

function collisionOnWallZ(dirParticle){
  if(dirParticle.getComponent(1)<0){
    return new THREE.Vector3(0, dirParticle.getComponent(1) - Math.abs(dirParticle.getComponent(2)), dirParticle.getComponent(2));
  }
  return new THREE.Vector3(dirParticle.getComponent(0), Math.abs(dirParticle.getComponent(2)), 0);
}

var vec;
var rand1;
function collisionOnWallY(dirParticle, collX, collZ){
  if(dirParticle.getComponent(0) == 0 && dirParticle.getComponent(2)==0){
    if(collX != 0 || collZ != 0){
      return new THREE.Vector3(-collX, 0, -collZ).setLength(dirParticle.length());
    }else{
      return new THREE.Vector3(getRandomArbitrary(-100,100), 0, getRandomArbitrary(-100,100)).setLength(dirParticle.length()/2);
    }
  }
  return new THREE.Vector3(dirParticle.getComponent(0), 0, dirParticle.getComponent(2));
}

var solDir;
var curPerc
var vector;
var vectorAdd;
var copyVector;
var middleColPoint;
function particlesCollision(posParticle, dirParticle, collisionsAbove, collisionsBelow, positions){
  solDir = dirParticle
  if(collisionsAbove.length){

    solDir = new THREE.Vector3(0,0,0);
    middleColPoint = [0,0,0];
    vectorAdd = new THREE.Vector3(0,0,0);
    copyVector = new THREE.Vector3();
    for(var i = 0; i<collisionsAbove.length; i++){
      curPerc = angleOfTwoCollidedParticles(posParticle, dirParticle, [positions[collisionsAbove[i]*3], positions[collisionsAbove[i]*3+1], positions[collisionsAbove[i]*3+2]], particlesInfo[collisionsAbove[i]][DIRECTION]);

      curPerc = 1 - (curPerc/(Math.PI/4));
      // curPerc = 1 ;
      copyVector.copy(particlesInfo[collisionsAbove[i]][DIRECTION]);
      copyVector.setLength(particlesInfo[collisionsAbove[i]][DIRECTION].length()*curPerc);

      vectorAdd.add(copyVector);

      middleColPoint[0] = positions[collisionsAbove[i]*3] * 1/collisionsAbove.length;
      middleColPoint[1] = positions[collisionsAbove[i]*3+1] * 1/collisionsAbove.length;
      middleColPoint[2] = positions[collisionsAbove[i]*3+2] * 1/collisionsAbove.length;
    }
    solDir.set(-(middleColPoint[0]-posParticle[0]), -(middleColPoint[1]-posParticle[1]), -(middleColPoint[2]-posParticle[2]));
    solDir.setLength(0.01);
    // console.log(dirParticle);
    if(Math.cos(solDir.angleTo(vectorAdd))>=0){
      solDir.setLength(solDir.length() + Math.cos(solDir.angleTo(vectorAdd))*vectorAdd.length());
    }
    if(Math.cos(solDir.angleTo(dirParticle))>=0){
      solDir.setLength(solDir.length() + Math.cos(solDir.angleTo(dirParticle))*dirParticle.length());
    }
    // console.log(solDir);
    
  }

  if(collisionsBelow.length == 2){
    var collisions = [findNewDirectionOnCollision([positions[collisionsBelow[0]*3], positions[collisionsBelow[0]*3+1], positions[collisionsBelow[0]*3+2]], 
                      posParticle,
                      particlesInfo[collisionsBelow[0]][DIRECTION].length(), solDir),
                      findNewDirectionOnCollision([positions[collisionsBelow[1]*3], positions[collisionsBelow[1]*3+1], positions[collisionsBelow[1]*3+2]], 
                      posParticle,
                      particlesInfo[collisionsBelow[1]][DIRECTION].length(), solDir)];

    var vec = new THREE.Vector3(0,0,0);
    vec.copy(collisions[0]);
    collisions[0].cross( collisions[1]);
    collisions[1].cross(vec);
    if(collisions[0].getComponent(1)< collisions[1].getComponent(1)){
      solDir = new THREE.Vector3(collisions[0].getComponent(0), collisions[0].getComponent(1), collisions[0].getComponent(2)).setLength(dirParticle.length);
    }else{
      solDir = new THREE.Vector3(collisions[1].getComponent(0), collisions[1].getComponent(1), collisions[1].getComponent(2)).setLength(dirParticle.length);
    }
  }else if (collisionsBelow.length == 1){
    solDir = findNewDirectionOnCollision([positions[collisionsBelow[0]*3], positions[collisionsBelow[0]*3+1], positions[collisionsBelow[0]*3+2]], 
      posParticle,
      particlesInfo[collisionsBelow[0]][DIRECTION].length(), solDir);
  }
  return solDir;
}

function angleOfTwoCollidedParticles(posParticleOriginal, dirParticleOriginal, posParticleCollided, dirParticleCollided){

  var normalPlane = new THREE.Vector3(posParticleOriginal[0] - posParticleCollided[0], posParticleOriginal[1] - posParticleCollided[1], posParticleOriginal[2] - posParticleCollided[2]);
  
  var angleColl = dirParticleCollided.angleTo(normalPlane);
  var angleOr = dirParticleOriginal.angleTo(normalPlane);
  while(angleColl > (Math.PI/4)) angleColl -= (Math.PI/4);
  while(angleOr > (Math.PI/4)) angleOr -= (Math.PI/4);

  return Math.min(angleColl, angleOr);
}

//cSphere = [x,y,z]
var point;
var vector;
var normalPlane;
var middleSpheres;
var normal;
var planeCirc;
var vectorForOperation;
var vectorForCopying;
function findNewDirectionOnCollision(cSphereCollided, cSphereOriginal, radio, vectorToMatch) {
  middleSpheres = [(cSphereCollided[0] + cSphereOriginal[0])/2, 
                      (cSphereCollided[1] + cSphereOriginal[1])/2, 
                      (cSphereCollided[2] + cSphereOriginal[2])/2]

  normalPlane = new THREE.Vector3(cSphereOriginal[0] - cSphereCollided[0], cSphereOriginal[1] - cSphereCollided[1], cSphereOriginal[2] - cSphereCollided[2]);

  planeCirc = new THREE.Plane(normalPlane, middleSpheres);

  vectorForOperation = new THREE.Vector3(0,0,0);
  vectorForCopying = new THREE.Vector3();
  planeCirc.projectPoint(vectorToMatch, vectorForCopying);
  planeCirc.projectPoint(vectorForOperation, vectorForOperation);
  return new THREE.Vector3(vectorForOperation.getComponent(0) - vectorForCopying.getComponent(0), 
                              vectorForOperation.getComponent(1) - vectorForCopying.getComponent(1), 
                              vectorForOperation.getComponent(2) - vectorForCopying.getComponent(2)).setLength(radio);

  // normal = new THREE.Vector3(0,1,0);

  // normal.cross(normalPlane);
  // normal.applyAxisAngle(normalPlane, Math.PI/2);
  // normal.setLength(radio);

  // if(middleSpheres[1]+normal.getComponent(1) < middleSpheres[1]-normal.getComponent(1)){
  //   point = [middleSpheres[0]+normal.getComponent(0), middleSpheres[1]+normal.getComponent(1), middleSpheres[2]+normal.getComponent(2)]
  // }else{
  //   point = [middleSpheres[0]-normal.getComponent(0), middleSpheres[1]-normal.getComponent(1), middleSpheres[2]-normal.getComponent(2)]
  // }

  // return new THREE.Vector3(point[0], point[1], point[2]);
};

function distance(x1, x2, y1, y2, z1, z2){
  var x = Math.abs(x1-x2);
  var y = Math.abs(y1-y2);
  var z = Math.abs(z1-z2);
  return Math.sqrt(x*x + y*y + z*z);
}

function distance2d(x1, x2, y1, y2){
  var x = Math.abs(x1-x2);
  var y = Math.abs(y1-y2);
  return Math.sqrt(x*x + y*y);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function addCube(){
  var sizeCube = radius+particleRad;

  var geometryLine = new THREE.Geometry();
  geometryLine.vertices.push(new THREE.Vector3( sizeCube, sizeCube, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( sizeCube, sizeCube, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( sizeCube, sizeCube, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -sizeCube, sizeCube, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -sizeCube, sizeCube, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -sizeCube, sizeCube, sizeCube) );
  var materialLine = new THREE.LineBasicMaterial( { color: 0xffffff } );
  var line = new THREE.Line( geometryLine, materialLine );
  scene.add( line );

  var geometryLine1 = new THREE.Geometry();
  geometryLine1.vertices.push(new THREE.Vector3( sizeCube, sizeCube, -sizeCube) );
  geometryLine1.vertices.push(new THREE.Vector3( -sizeCube, sizeCube, -sizeCube) );
  var line1 = new THREE.Line( geometryLine1, materialLine );
  scene.add( line1 );

  var geometryLine2 = new THREE.Geometry();
  geometryLine2.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, -sizeCube) );
  geometryLine2.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, -sizeCube) );
  var line2 = new THREE.Line( geometryLine2, materialLine );
  scene.add( line2 );

  var geometryLine3 = new THREE.Geometry();
  geometryLine3.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, sizeCube) );
  geometryLine3.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, sizeCube) );
  var line3 = new THREE.Line( geometryLine3, materialLine );
  scene.add( line3 );

  var geometryBox = new THREE.BoxGeometry( sizeCube*2, sizeCube*2, sizeCube*2 );
  var materialBox = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
  var cube = new THREE.Mesh( geometryBox, materialBox );
  scene.add( cube );
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onBorderMouseDown( ev ) {

  // activate draggable window resizing bar
  window.addEventListener( "mousemove", onBorderMouseMove );
  window.addEventListener( "mouseup", onBorderMouseUp );
  ev.stopPropagation();
  ev.preventDefault();

}

function onBorderMouseMove( ev ) {

  screensplit = Math.max( 0, Math.min( 1, ev.clientX / window.innerWidth ) );
  ev.stopPropagation();

}

function onBorderMouseUp() {

  window.removeEventListener( "mousemove", onBorderMouseMove );
  window.removeEventListener( "mouseup", onBorderMouseUp );

}

function onMouseMove( ev ) {

  mouse[ 0 ] = ev.clientX / window.innerWidth;
  mouse[ 1 ] = ev.clientY / window.innerHeight;

}
