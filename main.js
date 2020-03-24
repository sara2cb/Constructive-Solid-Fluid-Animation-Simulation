var renderer, scene, camera;

//VARIABLES INFORMATION FOR SYSTEM
var particleSystem, uniforms, geometry;
var noParticles = 2000;
var noParticlesShown = 100;
var radius;
var radiusSmall = 15;
var radiusBig = 30;
var particleRad = 1.5;

//PARTICLES INFORMATION ARRAY
var particlesInfo = [];
var RADIO = 0;
var DIRECTION = 1;
var ACCELERATION = 2;
var POSITION = 3;

//USEFUL
var time = 0;
var xVector = new THREE.Vector3(1,0,0);
var yVector = new THREE.Vector3(0,1,0);
var zVector = new THREE.Vector3(0,0,1);
var xVectorNeg = new THREE.Vector3(-1,0,0);
var yVectorNeg = new THREE.Vector3(0,-1,0);
var zVectorNeg = new THREE.Vector3(0,0,-1);
var noSpeed = new THREE.Vector3(0,0,0);

//VARICLES TO KEEP TRACK OF STATE
var cameraz;
var userNoParticles;
var obstacleInScene = false;
var smallVersion = false;
var state;
init();
animate();

function init() {

  document.getElementById("updateButton").addEventListener("click", updateParticles);
  document.getElementById("sliderScene").addEventListener("click", checkboxScale);
  document.getElementById("sliderObstacle").addEventListener("click", checkboxObstacle);
  document.getElementById("firstButton").addEventListener("click", topParticlesButton);
  document.getElementById("column").addEventListener("click", columnParticlesButton);
  document.getElementById("box").addEventListener("click", boxParticlesButton);
  document.getElementById("sameLevel").addEventListener("click", sameLevelButton);
  document.getElementById("above").addEventListener("click", aboveLevelButton);
  document.getElementById("parabolic").addEventListener("click", paraboleButton);
  document.getElementById("streaming").addEventListener("click", streamingButton);
  document.getElementById("wall").addEventListener("click", collisionWallButton);

  //Set scene size and prepare buffers
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

  //Initialise variables
  radius = 15;
  addObstacleInfo();
  addObstacleBigInfo();
  noParticlesShown = noParticles;
  radius = 30;
  cameraz = 130
  var positions = [];
  var colors = [];
  var sizes = [];
  var color = new THREE.Color();
  var x,z;
  var yEl = radius-1;
  noParticlesShown = noParticles;
  //Loop to create particles parameters
  for ( var i = 0; i < noParticles; i ++ ) {

    particlesInfo.push([]);
    if(i == 0){
      positions.push( getRandomArbitrary(-radius,radius) );
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
      //Check particles do not collide with each other in which case create them in a separate point
      var changed = false
      while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
        positions[i*3] = getRandomArbitrary(-radius,radius);
        positions[i*3+1] = yEl;
        positions[i*3+2] = getRandomArbitrary(-radius,radius);
        counter++;
        var changed = true;
      }
      if(changed){
        j = -1;
        counter++;
        if(counter > ((radius+particleRad)/(2*particleRad))*((radius+particleRad)/(2*particleRad))){
          yEl -= particleRad;
          counter = 0;
        }
      }
    }
    particlesInfo[i].push(radius);

    color.setHSL( i / noParticles, 1.0, 0.5 );
    colors.push( 0.1, 0.62, 1.0 );

    //Set initial direction
    var direction = new THREE.Vector3(0, -0.01, 0);
    particlesInfo[i].push(direction);
    particlesInfo[i].push(0.001);
    particlesInfo[i].push(false);
    particlesInfo[i].push(positions[i], positions[i+1], positions[i+2]);
    sizes.push( 20 );
  }
  //Create particle system's geometry
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage )  );
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ));
  particleSystem = new THREE.Points( geometry, shaderMaterial );
  scene.add( particleSystem );

  //Create the external cube information and set it
  addCubeInfo();
  addCube();
  addCubeBigInfo();
  setBigDemoParam();
  
  //Set renderer and container
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  var container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  //So that the scene occupies the window  size
  window.addEventListener( 'resize', onWindowResize, false );

  //Initialise variables
  time = 0;
  obstacleInScene = false;
  state = 0;
  userNoParticles = 100;
  
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
var updatedPosition;
var curDir
var stremingOn = false
var timeStreaming;

function render() {
  var positions = geometry.attributes.position.array;

  //The first time render runs, we will set the positions of the particle to our universal 
  //  array of all particle's info
  if(!checked){
    updatedDir = [];
    for ( var i = 0; i < noParticlesShown; i++ ) {
      particlesInfo[i][POSITION] = positions[i*3];
      particlesInfo[i][POSITION+2] = positions[i*3+2];
      updatedDir.push(null);
    }
   
    checked = !checked
    if(stremingOn){
      timeStreaming = 0;
    }
  }

  //Restart timer
  if(restartTimer){
    time= 0;
    restartTimer = false;
  }
  //Count time
  if(countingTime){
    time += (Date.now() - timeLastTime)/1000.0;
  }

  //When streaming mode is on
  var maxStream = userNoParticles;
  if(stremingOn && noParticlesShown<maxStream){
    //Update every 0.1s
    timeStreaming += (Date.now() - timeLastTime)/1000.0
    if(timeStreaming > 0.1){
      //Assign a position that is not colliding
      noParticlesShown++;
      var rangeMin = -radius/3;
      var rangeMax = 0
      positions[(noParticlesShown-1)*3] =  getRandomArbitrary(rangeMin,rangeMax);
      positions[(noParticlesShown-1)*3+1] = radius-1 ;
      positions[(noParticlesShown-1)*3+2] =  getRandomArbitrary(rangeMin,rangeMax);
      timeStreaming = 0;
      var yEl = radius-1;
      for( var j = 0; j<(noParticlesShown-1); j++){
        while(distance(positions[(noParticlesShown-1)*3], positions[j*3], positions[(noParticlesShown-1)*3+1], positions[j*3+1], positions[(noParticlesShown-1)*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[(noParticlesShown-1)*3] = getRandomArbitrary(rangeMin,rangeMax);
          positions[(noParticlesShown-1)*3+1] = yEl;
          positions[(noParticlesShown-1)*3+2] = getRandomArbitrary(rangeMin,rangeMax);
        }
      }
    }
  }

  timeLastTime = Date.now();


  //----------------------------------------------------------------------------------------------------------------------------
  //UPDATE EVERY PARTICLE-------------------------------------------------------------------------------------------------------
  for ( var i = 0; i < noParticlesShown; i++ ) {
    //Update gravity
    particlesInfo[i][DIRECTION].setComponent(1, particlesInfo[i][DIRECTION].getComponent(1) - time * particlesInfo[i][ACCELERATION]);
    
    //The Direction will only be updated after the direction has been set
    curDir = particlesInfo[i][DIRECTION];
    var collisionsAboveDir = [];
    var collisionsBelowDir = [];
    var collisionsAbovePos = [];
    var collisionsBelowPos = [];
    var collX = 0;
    var collZ = 0;
    var collY = 0;
    var minSpeed = 0.8;

    //WALL COLLISIONT-------------------------
    //ZWALL
    if(Math.abs(positions[i*3+2]) > radius){
      if(positions[i*3+2] > radius){
        positions[i*3+2] = radius;
        if(curDir.length() > minSpeed || Math.abs(positions[i*3+1]) > radius){
          collZ = 1
        }else{
          collisionsAboveDir.push(noSpeed);
          collisionsAbovePos.push(positions[i*3], positions[i*3+1], positions[i*3+2]+particleRad*2);
        }
      }else{
        positions[i*3+2] = -radius;
        if(curDir.length() > minSpeed || Math.abs(positions[i*3+1]) > radius){
          collZ = -1
        }else{
          collisionsAboveDir.push(noSpeed);
          collisionsAbovePos.push(positions[i*3], positions[i*3+1], positions[i*3+2]-particleRad*2);
        }
      }
    }
    //X-WALL 
    if(Math.abs(positions[i*3]) > radius){
      if(positions[i*3] > radius){
        positions[i*3] = radius;
        if(curDir.length() > minSpeed || Math.abs(positions[i*3+1]) > radius){
          collX = 1
        }else{
          collisionsAboveDir.push(noSpeed);
          collisionsAbovePos.push(positions[i*3]+particleRad*2, positions[i*3+1], positions[i*3+2]);
        }
      }else{
        positions[i*3] = -radius;
        if(curDir.length() > minSpeed || Math.abs(positions[i*3+1]) > radius){
          collX = -1
        }else{
          collisionsAboveDir.push(noSpeed);
          collisionsAbovePos.push(positions[i*3]-particleRad*2, positions[i*3+1], positions[i*3+2]);
        }
      }
    }
    //COLLISION WITH OBSTACLE
    if(obstacleInScene){
      if((positions[i*3+1] < -(radius/3)) && (Math.abs(positions[i*3]) < (radius/3)) && Math.abs(-radius/3 - positions[i*3+1]) > Math.abs(Math.abs(positions[i*3]) - (radius/3))){
        if(positions[i*3] > 0){
          positions[i*3] = radius/3;
          if(curDir.length() > minSpeed || Math.abs(positions[i*3+1]) > radius){
            collX = -1
          }else{
            collisionsAboveDir.push(noSpeed);
            collisionsAbovePos.push(positions[i*3]-particleRad*2, positions[i*3+1], positions[i*3+2]);
          }
        }else{
          positions[i*3] = -radius/3;
          if(curDir.length() > minSpeed || Math.abs(positions[i*3+1]) > radius){
            collX = 1
          }else{
            collisionsAboveDir.push(noSpeed);
            collisionsAbovePos.push(positions[i*3]+particleRad*2, positions[i*3+1], positions[i*3+2]);
          }
        }
      }
      if((positions[i*3+1] <= -(radius/3)) && (Math.abs(positions[i*3]) < (radius/3)) && Math.abs(-radius/3 - positions[i*3+1]) < Math.abs(Math.abs(positions[i*3]) - (radius/3))){
        collY = -2
      }
    }
    //Y-WALL
    if(Math.abs(positions[i*3+1]) >= radius){
      if(positions[i*3+1] > radius){
       collY = 1;
      }else{
        collY = -1
      }
    }

    //PARTICLE-TO-PARTICLE COLLISION------------------------------------
    for( var j = 0; j<noParticlesShown; j++){
      if(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) < particleRad*2 && i !=j){
        if( positions[i*3+1] > positions[j*3+1] ){
          collisionsBelowDir.push(particlesInfo[j][DIRECTION]);
          collisionsBelowPos.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
        }
        if( positions[i*3+1] <= positions[j*3+1]){
          collisionsAboveDir.push(particlesInfo[j][DIRECTION]);
          collisionsAbovePos.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
        }
      }
    } 
    curDir = particlesCollision([positions[i*3], positions[i*3+1], positions[i*3+2]], particlesInfo[i][DIRECTION], collisionsAboveDir, collisionsBelowDir, collisionsAbovePos, collisionsBelowPos, collY);

    //UPDATE WALLCOLLISION
    //It needs to be afterwards since the direction of the particle-to-particle collision should not be as definitive as the wall collision
    if(collY == 1){
      positions[i*3+1] = radius-0.1;
      if(curDir.getComponent(0) != 0 || curDir.getComponent(2) != 0){
        curDir = collisionOnWallY(curDir,[positions[i*3], positions[i*3+1], positions[i*3+2]]);
      }else{
        curDir.set(0,0,0);
      }
    }else if ( collY == -1){
      positions[i*3+1] = -radius;
      curDir = collisionOnWallY(curDir, [positions[i*3], positions[i*3+1], positions[i*3+2]]);
    }

    if(collY == -2){
      positions[i*3+1] = -radius/3 ;
      curDir = collisionOnWallY(curDir, [positions[i*3], positions[i*3+1], positions[i*3+2]]);
    }

    if(collZ != 0 && collX != 0){
      if(curDir.getComponent(1)<0){
        curDir.set(0,-curDir.length(),0)
      }else{
        curDir.set(0,curDir.length(),0)
      }
    }else if(collZ != 0){
      curDir = collisionOnWallZ(curDir);
    }else if(collX != 0){
      curDir = collisionOnWallX(curDir);
    }
    

    //Set the timers appropriately
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
  //Update the directions and the positions, the reason we wait until after the loop is done is because we want to update
  //  all particles at the same time, so that particles do not interact with other particles for collisions happening ahead
  //  of time
  for ( var i = 0; i < noParticlesShown; i++ ) {
    particlesInfo[i][DIRECTION] = updatedDir[i];
    positions[i*3] += particlesInfo[i][DIRECTION].getComponent(0);
    positions[i*3+1] += particlesInfo[i][DIRECTION].getComponent(1);
    positions[i*3+2] += particlesInfo[i][DIRECTION].getComponent(2);
  }
  geometry.attributes.position.needsUpdate = true;
  renderer.render( scene, camera );
}

function collisionOnWallX(dirParticle){
    return new THREE.Vector3(0, dirParticle.getComponent(1) + Math.abs(dirParticle.getComponent(0)), dirParticle.getComponent(2));
}

function collisionOnWallZ(dirParticle){
    return new THREE.Vector3(dirParticle.getComponent(0), dirParticle.getComponent(1) + Math.abs(dirParticle.getComponent(2)), 0);
}

function collisionOnWallY(dirParticle, posParticle){
  var collX = 0;
  var collZ = 0;
  if(posParticle[0] > radius-2){
    collX = 1;
  }else if(posParticle[0] < -radius+2){
    collX = -1;
  }if(posParticle[2] > radius-2){
    collZ = 1;
  }else if(posParticle[2] < -radius+2){
    collZ = -1;
  }
  if(dirParticle.getComponent(0) == 0 && dirParticle.getComponent(2)==0){
    if(posParticle != 0 || collZ != 0){
      return new THREE.Vector3(-collX, 0, -collZ).setLength(dirParticle.length()/2);
    }else{
      return new THREE.Vector3(getRandomArbitrary(-100,100), 0, getRandomArbitrary(-100,100)).setLength(dirParticle.length());

    }
  }
  return new THREE.Vector3(dirParticle.getComponent(0), 0, dirParticle.getComponent(2));
}

//PARTICLE-TO-PARTICLE COLLISION FUNCTION ----------------------------------------------------------------------------------------------------
var solDir;
var curPerc
var vector;
var vectorAdd;
var copyVector;
var middleColPoint;
var straightColl = []
var toRotateAbove;
var distanceCenterMiddle;
var toCopy;
function particlesCollision(posParticle, dirParticle, collisionsAboveDir, collisionsBelowDir, collisionsAbovePos, collisionsBelowPos, collY){
  //soldir is the variable to store the final solution
  solDir = dirParticle;
  //COLLISIONS ABOVE OR AT THE SAME LEVEL-------------------
  if(collisionsAboveDir.length){
    //WE DO NOT WANT TO DEAL WITH COLLISIONS AT THE SAME LEVEL IF WE ARE NOT ON THE FLOOR AND WE DO NOT HAVE COLLISIONS
    // BELOW
    if(collY < 0 || collisionsBelowDir.length > 0){
      solDir = new THREE.Vector3(0,0,0);
      middleColPoint = [0,0,0];
      vectorAdd = new THREE.Vector3(0,0,0);
      copyVector = new THREE.Vector3();
      //Find the average point of all collisions o
      for(var i = 0; i<collisionsAboveDir.length; i++){
        curPerc = angleOfTwoCollidedParticles(posParticle, dirParticle, [collisionsAbovePos[i*3], collisionsAbovePos[i*3+1], collisionsAbovePos[i*3+2]], collisionsAboveDir[i]);

        curPerc = 1 - (curPerc/(Math.PI/2));
        copyVector.copy(collisionsAboveDir[i]);
        copyVector.setLength(collisionsAboveDir[i].length()*curPerc);

        vectorAdd.add(copyVector);

        middleColPoint[0] += collisionsAbovePos[i*3] * 1/collisionsAboveDir.length;
        middleColPoint[1] += collisionsAbovePos[i*3+1] * 1/collisionsAboveDir.length;
        middleColPoint[2] += collisionsAbovePos[i*3+2] * 1/collisionsAboveDir.length;
      }
      //The direction will be where there is least amount of particles
      solDir.set(-(middleColPoint[0]-posParticle[0]), -(middleColPoint[1]-posParticle[1]), -(middleColPoint[2]-posParticle[2]));
      distanceCenterMiddle = solDir.length();
      solDir.setLength(0.01);
      
      //IF EVERY SIDE HAS PARTICLES, MOVE UPWARDS
      if(distanceCenterMiddle < particleRad){
        toRotateAbove = new THREE.Vector3();
        toCopy = new THREE.Vector3();
        toCopy.copy(solDir);
        toCopy.setComponent(1,0);
        toRotateAbove.copy(toCopy);
        toRotateAbove.applyAxisAngle(yVector, Math.PI/2);
        toRotateAbove.normalize();
        toCopy.applyAxisAngle(toRotateAbove, 1-(distanceCenterMiddle/particleRad) * (Math.PI/2));
        if(toCopy.getComponent(1)< 0){
          toCopy.copy(solDir);
          toCopy.setComponent(1,0);
          toCopy.applyAxisAngle(toRotateAbove, -(1-(distanceCenterMiddle/particleRad) * (Math.PI/2)));
        }
        solDir.copy(toCopy)
      }

      //Increase the speed appropriately
      if(Math.cos(solDir.angleTo(vectorAdd))>=0){
        solDir.setLength(solDir.length() + Math.cos(solDir.angleTo(vectorAdd))*vectorAdd.length());
      }
      if(Math.cos(solDir.angleTo(dirParticle))>=0){
        solDir.setLength(solDir.length() + Math.cos(solDir.angleTo(dirParticle))*dirParticle.length());
      }
    }else{
        solDir.setComponent(0,0);
        solDir.setComponent(2,0);
    }
  }
  //COLLISIONS BELOW-------------------------------
  if(collisionsBelowDir.length > 0){
    var finalVec = new THREE.Vector3();
    finalVec.copy(solDir);
    var angleFinal = [] 
    //Calculate vector when there are multiple collisions
    for(var i = 0; i<collisionsBelowDir.length; i++){
      finalVec.add(collisionsBelowDir[i]);
      angleFinal.push(calculateVector(posParticle, [collisionsBelowPos[i*3], collisionsBelowPos[i*3+1], collisionsBelowPos[i*3+2]]).angleTo(finalVec));
    }
    var i = angleFinal.indexOf(Math.min(...angleFinal));
    //Final angle
    solDir = findNewDirectionOnCollision([collisionsBelowPos[i*3], collisionsBelowPos[i*3+1], collisionsBelowPos[i*3+2]], 
      posParticle,
      solDir.length(), finalVec);
    
  }
  
  return solDir;
}

//Calculates angle of two vectors given their point of origin
function angleOfTwoCollidedParticles(posParticleOriginal, dirParticleOriginal, posParticleCollided, dirParticleCollided){

  var normalPlane = new THREE.Vector3(posParticleOriginal[0] - posParticleCollided[0], posParticleOriginal[1] - posParticleCollided[1], posParticleOriginal[2] - posParticleCollided[2]);
  var angleColl = dirParticleCollided.angleTo(normalPlane);
  var angleOr = dirParticleOriginal.angleTo(normalPlane);
  while(angleColl > (Math.PI/4)) angleColl -= (Math.PI/4);
  while(angleOr > (Math.PI/4)) angleOr -= (Math.PI/4);

  return Math.min(angleColl, angleOr);
}

var vector;
var xLeft;
var xRight;
var zLeft;
var zRight;
//METHOD TO FIND VECTOR TANGENT TO ANOTHER SPHERE
function findNewDirectionOnCollision(cSphereCollided, cSphereOriginal, radio, vectorToMatch) {
  vector = new THREE.Vector3()
  vector.copy(vectorToMatch);
  //When the Sphere is directly below the original vector
  if(calculateVector(cSphereCollided, cSphereOriginal).angleTo(vector) == 0){
    xLeft = -100
    xRight = 100;
    if(cSphereOriginal[0]<=-radius) xLeft = 0;
    if(cSphereOriginal[0]>=radius) xRight = 0;
    zLeft = -100
    zRight = 100;
    if(cSphereOriginal[2]<=-radius) zLeft = 0;
    if(cSphereOriginal[2]>=radius) zRight = 0;
    return new THREE.Vector3(getRandomArbitrary(xLeft,xRight), 0, getRandomArbitrary(zLeft,zRight)).setLength(radio);
  }
  vector.projectOnPlane(calculateVector(cSphereCollided, cSphereOriginal)).setLength(radio);
  return vector;
};

//OTHER NECESSARY FUNCTIONS-------------------------------------------------------------------------------------------
//Calculate vector given two points
function calculateVector(pointOrigin, pointEnd){
  return new THREE.Vector3(pointOrigin[0]-pointEnd[0], pointOrigin[1]-pointEnd[1],pointOrigin[2]-pointEnd[2]);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


function distance(x1, x2, y1, y2, z1, z2){
  var x = Math.abs(x1-x2);
  var y = Math.abs(y1-y2);
  var z = Math.abs(z1-z2);
  return Math.sqrt(x*x + y*y + z*z);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}