var renderer, scene, camera;

var particleSystem, uniforms, geometry;

var noParticles = 400;
var noParticlesShown = 100;
var radius;
var radiusSmall = 15;
var radiusBig = 30;
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
var noSpeed = new THREE.Vector3(0,0,0);

var gravity = 9.8;
var cameraz = 70;

var obstacleInScene = false;
var cubeInScene = false;
var cubeBigInScene = false;
init();
animate();

function init() {

  document.getElementById("firstButton").addEventListener("click", topParticlesButton);
  document.getElementById("column").addEventListener("click", columnParticlesButton);
  document.getElementById("box").addEventListener("click", boxParticlesButton);
  document.getElementById("obstacle").addEventListener("click", addObstacle);
  document.getElementById("sameLevel").addEventListener("click", sameLevelButton);
  document.getElementById("above").addEventListener("click", aboveLevelButton);
  document.getElementById("parabolic").addEventListener("click", paraboleButton);
  document.getElementById("streaming").addEventListener("click", streamingButton);
  document.getElementById("bigDemo").addEventListener("click", bigDemoButton);
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

  radius = 15;
  addObstacleInfo();
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
  for ( var i = 0; i < noParticles; i ++ ) {

    particlesInfo.push([]);

    if(i<noParticlesShown){
      if(i == 0){
        positions.push( createRandomParticle() );
        positions.push(yEl);
        positions.push( createRandomParticle() );
      }else{
        x = createRandomParticle();
        z = createRandomParticle();
        positions.push( x );
        positions.push(yEl);
        positions.push( z );
      }
      var counter = 0;
      for( var j = 0; j<i; j++){
        
        var changed = false
        while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[i*3] = createRandomParticle();
          positions[i*3+1] = yEl;
          positions[i*3+2] = createRandomParticle();
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
    } else{
      positions[i*3] =  NaN;
      positions[i*3+1] = NaN ;
      positions[i*3+2] = NaN;
    }
    particlesInfo[i].push(radius);

    color.setHSL( i / noParticles, 1.0, 0.5 );
    colors.push( 0.1, 0.62, 1.0 );
    // var speed = getRandomArbitrary(1,100)/200;
    // var direction = new THREE.Vector3(getRandomArbitrary(-radius,radius), getRandomArbitrary(-radius,radius), getRandomArbitrary(-radius,radius)).setLength(speed);

    var direction = new THREE.Vector3(0, -0.01, 0);
    particlesInfo[i].push(direction);
    // particlesInfo[i].push(getRandomArbitrary(1,100)/20000);
    particlesInfo[i].push(0.001);
    particlesInfo[i].push(false);
    particlesInfo[i].push(positions[i], positions[i+1], positions[i+2]);
    
    redirectionParticles.push(i);
    sizes.push( 20 );
  }
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage )  );
  geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ));

  particleSystem = new THREE.Points( geometry, shaderMaterial );

  scene.add( particleSystem );


  addCubeInfo();
  addCube();
  
  addCubeBigInfo();

  setBigDemoParam();
  

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  var container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  // camera.position.z += cameraz;

  acc = -0.0001;
  time = 0;
  obstacleInScene = false;
}

function createRandomParticle(){
  return getRandomArbitrary(-radius/2,radius/2);
  return getRandomArbitrary(-radius,radius);
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

  if(!checked){
    updatedDir = [];
    // updatedPosition = [];
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
  if(restartTimer){
    time= 0;
    restartTimer = false;
  }if(countingTime){
    time += (Date.now() - timeLastTime)/1000.0;
  }

  
  if(stremingOn && noParticlesShown<160){
    timeStreaming += (Date.now() - timeLastTime)/1000.0
    // console.log(timeStreaming);
    if(timeStreaming > 0.1){
      // console.log("here");
      noParticlesShown++;

      var rangeMin = -radius/3;
      var rangeMax = 0
      positions[(noParticlesShown-1)*3] =  getRandomArbitrary(rangeMin,rangeMax);
      positions[(noParticlesShown-1)*3+1] = radius-1 ;
      positions[(noParticlesShown-1)*3+2] =  getRandomArbitrary(rangeMin,rangeMax);
      timeStreaming = 0;

      var counter = 0;
      var yEl = radius-1;
      for( var j = 0; j<(noParticlesShown-1); j++){
        var changed = false
        while(distance(positions[(noParticlesShown-1)*3], positions[j*3], positions[(noParticlesShown-1)*3+1], positions[j*3+1], positions[(noParticlesShown-1)*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[(noParticlesShown-1)*3] = getRandomArbitrary(rangeMin,rangeMax);
          positions[(noParticlesShown-1)*3+1] = yEl;
          positions[(noParticlesShown-1)*3+2] = getRandomArbitrary(rangeMin,rangeMax);
          counter++;
          var changed = true;
        }
      }
    }
  }

  timeLastTime = Date.now();
  // console.log(noParticlesShown)
  for ( var i = 0; i < noParticlesShown; i++ ) {

    particlesInfo[i][DIRECTION].setComponent(1, particlesInfo[i][DIRECTION].getComponent(1) - time * particlesInfo[i][ACCELERATION]);
    
    // console.log( particlesInfo[i][DIRECTION]);
    curDir = particlesInfo[i][DIRECTION];
    var collisionsAboveDir = [];
    var collisionsBelowDir = [];
    var collisionsAbovePos = [];
    var collisionsBelowPos = [];

    var collX = 0;
    var collZ = 0;
    var collY = 0;
    var minSpeed = 1;
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
    } if(Math.abs(positions[i*3]) > radius){
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
    }
    
    if(Math.abs(positions[i*3+1]) >= radius){
      if(positions[i*3+1] > radius){
       collY = 1;
      }else{
        collY = -1
      }
    }
    if(obstacleInScene){
      if((positions[i*3+1] <= -(radius/3)) && (Math.abs(positions[i*3]) < (radius/3)) && Math.abs(-radius/3 - positions[i*3+1]) < Math.abs(Math.abs(positions[i*3]) - (radius/3))){
        collY = -2
      }
    }

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

    if(collY == 1){
      positions[i*3+1] = radius-1;

      if(curDir.getComponent(0) != 0 || curDir.getComponent(2) != 0){
        curDir = collisionOnWallY(curDir, collX, collZ,[positions[i*3], positions[i*3+1], positions[i*3+2]]);
      }else{
        curDir.set(0,0,0);
      }
    }else if ( collY == -1){
      positions[i*3+1] = -radius;
      curDir = collisionOnWallY(curDir, collX, collZ, [positions[i*3], positions[i*3+1], positions[i*3+2]]);
    }
    if(collY == -2){
      positions[i*3+1] = -radius/3 ;
      curDir = collisionOnWallY(curDir, collX, collZ, [positions[i*3], positions[i*3+1], positions[i*3+2]]);
    }

    if(collZ != 0 && collX != 0){
      if(curDir.getComponent(1)<0){
        curDir.set(0,-curDir.length(),0)
      }else{
        curDir.set(0,curDir.length(),0)
      }
    }
    else if(collZ != 0){
      curDir = collisionOnWallZ(curDir);
    }
    else if(collX != 0){
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
  for ( var i = 0; i < noParticlesShown; i++ ) {
    particlesInfo[i][DIRECTION] = updatedDir[i];
    positions[i*3] += particlesInfo[i][DIRECTION].getComponent(0);
    positions[i*3+1] += particlesInfo[i][DIRECTION].getComponent(1);
    positions[i*3+2] += particlesInfo[i][DIRECTION].getComponent(2);
  }

  geometry.attributes.position.needsUpdate = true;

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
function collisionOnWallY(dirParticle, collX, collZ, posParticle){
  if(dirParticle.getComponent(0) == 0 && dirParticle.getComponent(2)==0){
    if(collX != 0 || collZ != 0){
      return new THREE.Vector3(-collX, 0, -collZ).setLength(dirParticle.length()/2);
    }else{
      // if(Math.abs(posParticle[0]) > radius || (Math.abs(posParticle[2]) > radius)){
      //   if(Math.abs(posParticle[0]) > radius && (Math.abs(posParticle[2]) > radius)){
      //     return new THREE.Vector3(-posParticle[0], 0, -posParticle[2]).setLength(dirParticle.length());
      //   }else if(Math.abs(posParticle[0]) > radius){
      //     return new THREE.Vector3(-posParticle[0], 0, posParticle[2]).setLength(dirParticle.length());
      //   }else{
      //     return new THREE.Vector3(posParticle[0], 0, -posParticle[2]).setLength(dirParticle.length());
      //   }
      // }else{
      //   return new THREE.Vector3(posParticle[0], 0, posParticle[2]).setLength(dirParticle.length());
      // }
      
      return new THREE.Vector3(getRandomArbitrary(-100,100), 0, getRandomArbitrary(-100,100)).setLength(dirParticle.length());

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
var straightColl = []
var toRotateAbove;
var distanceCenterMiddle;
var toCopy;
//[positions[i*3], positions[i*3+1], positions[i*3+2]], particlesInfo[i][DIRECTION], collisionsAboveDir, collisionsBelowDir, collisionsAbovePos, collisionsBelowPos
function particlesCollision(posParticle, dirParticle, collisionsAboveDir, collisionsBelowDir, collisionsAbovePos, collisionsBelowPos, collY){
  solDir = dirParticle;

  if(collisionsAboveDir.length){
    // console.log(collY);
    if(collY < 0 || collisionsBelowDir.length > 0){
      solDir = new THREE.Vector3(0,0,0);
      middleColPoint = [0,0,0];
      vectorAdd = new THREE.Vector3(0,0,0);
      copyVector = new THREE.Vector3();
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
      
      solDir.set(-(middleColPoint[0]-posParticle[0]), -(middleColPoint[1]-posParticle[1]), -(middleColPoint[2]-posParticle[2]));
      distanceCenterMiddle = solDir.length();
      solDir.setLength(0.01);
      
     
      if(distanceCenterMiddle < particleRad){
        // console.log("herererererer");
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

      if(Math.cos(solDir.angleTo(vectorAdd))>=0){
        solDir.setLength(solDir.length() + Math.cos(solDir.angleTo(vectorAdd))*vectorAdd.length());
      }
      if(Math.cos(solDir.angleTo(dirParticle))>=0){
        solDir.setLength(solDir.length() + Math.cos(solDir.angleTo(dirParticle))*dirParticle.length());
      }
      // console.log(solDir)
    }else{
      // if(collisionsBelowDir.length == 0){
        solDir.setComponent(0,0);
        solDir.setComponent(2,0);
      // }
      
    }
    
    
  }

  if(collisionsBelowDir.length > 0){
    var finalVec = new THREE.Vector3();
    finalVec.copy(solDir);
    var angleFinal = [] 
    for(var i = 0; i<collisionsBelowDir.length; i++){
      finalVec.add(collisionsBelowDir[i]);
      angleFinal.push(calculateVector(posParticle, [collisionsBelowPos[i*3], collisionsBelowPos[i*3+1], collisionsBelowPos[i*3+2]]).angleTo(finalVec));
    }
    
    var i = angleFinal.indexOf(Math.min(...angleFinal));

    solDir = findNewDirectionOnCollision([collisionsBelowPos[i*3], collisionsBelowPos[i*3+1], collisionsBelowPos[i*3+2]], 
      posParticle,
      solDir.length(), finalVec);
        
    // console.log(solDir);
    
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
var vector;
var xLeft;
var xRight;
var zLeft;
var zRight;
function findNewDirectionOnCollision(cSphereCollided, cSphereOriginal, radio, vectorToMatch) {
  vector = new THREE.Vector3()
  vector.copy(vectorToMatch);
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


function calculateVector(pointOrigin, pointEnd){
  return new THREE.Vector3(pointOrigin[0]-pointEnd[0], pointOrigin[1]-pointEnd[1],pointOrigin[2]-pointEnd[2]);
}

var toSubstract;
var division;
var crossProduct;
var finalVec
function projectVectorOntoPlane(vector, normalPlane){
  vector.projectOnPlane(normalPlane)
  return vector;
}

function topParticlesButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  var yEl = radius-1;
  var x,z;
  noParticlesShown = 100;
  var positions = geometry.attributes.position.array;
  for ( var i = 0; i < noParticles; i ++ ) {
    if(i < noParticlesShown){
      particlesInfo[i][DIRECTION] = new THREE.Vector3(0, -0.01, 0);
      particlesInfo[i][ACCELERATION] = 0.001;

      if(i == 0){
        positions[i*3] =  getRandomArbitrary(-radius,radius);
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  getRandomArbitrary(-radius,radius);
      }else{
        x = getRandomArbitrary(-radius,radius);
        z = getRandomArbitrary(-radius,radius);
        positions[i*3] =  x;
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  z;
      }
      var counter = 0;
      for( var j = 0; j<i; j++){
        
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
    }else{
      positions[i*3] =  NaN;
      positions[i*3+1] = NaN ;
      positions[i*3+2] = NaN;
    }

  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = false;
}

function columnParticlesButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  var yEl = radius-1;
  var x,z;
  noParticlesShown = 100;
  var positions = geometry.attributes.position.array;
  for ( var i = 0; i < noParticles; i ++ ) {
    if(i<noParticlesShown){
      particlesInfo[i][DIRECTION] = new THREE.Vector3(0, -0.01, 0);
      particlesInfo[i][ACCELERATION] = 0.001;

      if(i == 0){
        positions[i*3] =  getRandomArbitrary(-radius/2,radius/2);
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  getRandomArbitrary(-radius/2,radius/2);
      }else{
        x = getRandomArbitrary(-radius/2,radius/2);
        z = getRandomArbitrary(-radius/2,radius/2);
        positions[i*3] =  x;
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  z;
      }
      var counter = 0;
      for( var j = 0; j<i; j++){
        
        var changed = false
        while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[i*3] = getRandomArbitrary(-radius/2,radius/2);
          positions[i*3+1] = yEl;
          positions[i*3+2] = getRandomArbitrary(-radius/2,radius/2);
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
    }else{
      positions[i*3] =  NaN;
      positions[i*3+1] = NaN ;
      positions[i*3+2] = NaN;
    }
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = false;
}

function boxParticlesButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  var yEl = -radius;
  var x,z;
  noParticlesShown = 100;
  var positions = geometry.attributes.position.array;
  for ( var i = 0; i < noParticles; i ++ ) {
    particlesInfo[i][DIRECTION] = new THREE.Vector3(0, 0, 0);
    particlesInfo[i][ACCELERATION] = 0.001;

    if(i < noParticlesShown){
      
      if(i == 0){
        positions[i*3] =  getRandomArbitrary(-radius/3,radius/3);
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  getRandomArbitrary(-radius,radius);
      }else{
        x = getRandomArbitrary(-radius/3,radius/3);
        z = getRandomArbitrary(-radius,radius);
        positions[i*3] =  x;
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  z;
      }
      var counter = 0;
      for( var j = 0; j<i; j++){
        
        var changed = false
        while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[i*3] = getRandomArbitrary(-radius/3,radius/3);
          positions[i*3+1] = yEl;
          positions[i*3+2] = getRandomArbitrary(-radius,radius);
          counter++;
          var changed = true;
        }
        if(changed){
          j = -1;
          counter++;
          if(counter > ((radius+particleRad)/(2*particleRad))*((radius+particleRad)/(2*particleRad))){
            yEl += particleRad;
            counter = 0;
          }
        }
      }
    }else{
      positions[i*3] = NaN;
      positions[i*3+1] = NaN ;
      positions[i*3+2] = NaN;
    }
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = false;
}

function sameLevelButton(){
  if(obstacleInScene){
    deleteObstacle();
  }
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  var yEl = -radius;
  var x,z;
  noParticlesShown = 2;
  var positions = geometry.attributes.position.array;
  particlesInfo[0][DIRECTION] = new THREE.Vector3(0.1, 0, 0);
  particlesInfo[0][ACCELERATION] = 0;
  positions[0*3] =  -8;
  positions[0*3+1] = yEl ;
  positions[0*3+2] =  0;

  particlesInfo[1][DIRECTION] = new THREE.Vector3(0, 0, 0);
  particlesInfo[1][ACCELERATION] = 0;
  positions[1*3] =  0;
  positions[1*3+1] = yEl ;
  positions[1*3+2] =  0;

  for ( var i = 2; i < noParticles; i ++ ) {
      
    positions[i*3] = NaN;
    positions[i*3+1] = NaN ;
    positions[i*3+2] = NaN;
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = false;
}

function aboveLevelButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  var yEl = -radius;
  noParticlesShown = 2;
  var positions = geometry.attributes.position.array;
  particlesInfo[0][DIRECTION] = new THREE.Vector3(0.001, -0.1, 0);
  particlesInfo[0][ACCELERATION] = 0.001;
  positions[0*3] =  0;
  positions[0*3+1] = -radius/2;
  positions[0*3+2] =  0;

  particlesInfo[1][DIRECTION] = new THREE.Vector3(0, 0, 0);
  particlesInfo[1][ACCELERATION] = 0.001;
  positions[1*3] =  0;
  positions[1*3+1] = -radius ;
  positions[1*3+2] =  0;

  for ( var i = 2; i < noParticles; i ++ ) {
    particlesInfo[i][DIRECTION] = new THREE.Vector3(0, 0, 0);
    particlesInfo[i][ACCELERATION] = 0.001;
      
    positions[i*3] = NaN;
    positions[i*3+1] = NaN ;
    positions[i*3+2] = NaN;
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
}

function paraboleButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  restartTimer = true;
  countingTime = true;
  noParticlesShown = 1;
  var positions = geometry.attributes.position.array;
  particlesInfo[0][DIRECTION] = new THREE.Vector3(0.1, 0.2, 0);
  particlesInfo[0][ACCELERATION] = 0.001;
  positions[0*3] =  -radius+1;
  positions[0*3+1] = -radius+1;
  positions[0*3+2] =  0;


  for ( var i = 1; i < noParticles; i ++ ) {
    particlesInfo[i][DIRECTION] = new THREE.Vector3(0, 0, 0);
    particlesInfo[i][ACCELERATION] = 0.001;
      
    positions[i*3] = NaN;
    positions[i*3+1] = NaN ;
    positions[i*3+2] = NaN;
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = false;
}

function streamingButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  var yEl = radius-1;
  var x,z;
  noParticlesShown = 5;
  var positions = geometry.attributes.position.array;
  var rangeMin = -radius/3;
  var rangeMax = 0
  for ( var i = 0; i < noParticles; i ++ ) {
    if(i < noParticlesShown){
      particlesInfo[i][DIRECTION] = new THREE.Vector3(-0.0, -0.01, 0);
      particlesInfo[i][ACCELERATION] = 0.001;

      if(i == 0){
        positions[i*3] =  getRandomArbitrary(  rangeMin, rangeMax);
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  getRandomArbitrary(rangeMin,rangeMax);
      }else{
        x = getRandomArbitrary(rangeMin,rangeMax);
        z = getRandomArbitrary(rangeMin,rangeMax);
        positions[i*3] =  x;
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  z;
      }
      var counter = 0;
      for( var j = 0; j<i; j++){
        
        var changed = false
        while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[i*3] = getRandomArbitrary(rangeMin,rangeMax);
          positions[i*3+1] = yEl;
          positions[i*3+2] = getRandomArbitrary(rangeMin,rangeMax);
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
    }else{
      particlesInfo[i][DIRECTION] = new THREE.Vector3(-0.0, -0.05, 0);
      particlesInfo[i][ACCELERATION] = 0.001;
        
      positions[i*3] = NaN;
      positions[i*3+1] = NaN ;
      positions[i*3+2] = NaN;
    }
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = true;
}

function bigDemoButton(){
  if(radius != radiusSmall){
    setSmallDemoParam();
  }
  if(radius != radiusBig){
    setBigDemoParam();
  }
  var yEl = radius-1;
  var x,z;
  noParticlesShown = noParticles;
  var positions = geometry.attributes.position.array;
  for ( var i = 0; i < noParticles; i ++ ) {
    if(i<noParticlesShown){
      particlesInfo[i][DIRECTION] = new THREE.Vector3(0, -0.01, 0);
      particlesInfo[i][ACCELERATION] = 0.001;

      if(i == 0){
        positions[i*3] =  getRandomArbitrary(-radius/2,radius/2);
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  getRandomArbitrary(-radius/2,radius/2);
      }else{
        x = getRandomArbitrary(-radius/2,radius/2);
        z = getRandomArbitrary(-radius/2,radius/2);
        positions[i*3] =  x;
        positions[i*3+1] = yEl ;
        positions[i*3+2] =  z;
      }
      var counter = 0;
      for( var j = 0; j<i; j++){
        
        var changed = false
        while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
          positions[i*3] = getRandomArbitrary(-radius/2,radius/2);
          positions[i*3+1] = yEl;
          positions[i*3+2] = getRandomArbitrary(-radius/2,radius/2);
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
    }else{
      positions[i*3] =  NaN;
      positions[i*3+1] = NaN ;
      positions[i*3+2] = NaN;
    }
  }
  geometry.attributes.position.needsUpdate = true;
  checked = false;
  stremingOn = false;
}

function setSmallDemoParam(){
  noParticlesShown = 150;
  radius = 15;
  camera.position.z = 73.5;
  addCube();
  deleteCubeBig();
}

function setBigDemoParam(){
  noParticlesShown = noParticles;
  radius = 30;
  camera.position.z = 140;
  addCubeBig();
  deleteCube();
}

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

var line, line1, line2, line3;
var cube;
function addCubeInfo(){
  var sizeCube = radiusSmall+particleRad;

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
  line = new THREE.Line( geometryLine, materialLine );
  scene.add( line );

  var geometryLine1 = new THREE.Geometry();
  geometryLine1.vertices.push(new THREE.Vector3( sizeCube, sizeCube, -sizeCube) );
  geometryLine1.vertices.push(new THREE.Vector3( -sizeCube, sizeCube, -sizeCube) );
  line1 = new THREE.Line( geometryLine1, materialLine );
  scene.add( line1 );

  var geometryLine2 = new THREE.Geometry();
  geometryLine2.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, -sizeCube) );
  geometryLine2.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, -sizeCube) );
  line2 = new THREE.Line( geometryLine2, materialLine );
  scene.add( line2 );

  var geometryLine3 = new THREE.Geometry();
  geometryLine3.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, sizeCube) );
  geometryLine3.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, sizeCube) );
  line3 = new THREE.Line( geometryLine3, materialLine );
  scene.add( line3 );

  var geometryBox = new THREE.BoxGeometry( sizeCube*2, sizeCube*2, sizeCube*2 );
  var materialBox = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
  cube = new THREE.Mesh( geometryBox, materialBox );
  scene.add( cube );
}

function addCube(){
  if(cubeInScene){
    deleteCube();
  }else{
    cubeInScene = true;
    scene.add( line );
    scene.add( line1 );
    scene.add( line2 );
    scene.add( line3 );
    scene.add( cube );
  }
  
}

function deleteCube(){
  cubeInScene = false;
  scene.remove( line );
  scene.remove( line1 );
  scene.remove( line2 );
  scene.remove( line3 );
  scene.remove( cube );
}

var lineB, lineB1, lineB2, lineB3;
var cubeB;
function addCubeBigInfo(){
  var sizeCube = radiusBig+particleRad;

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
  lineB = new THREE.Line( geometryLine, materialLine );
  scene.add( lineB );

  var geometryLine1 = new THREE.Geometry();
  geometryLine1.vertices.push(new THREE.Vector3( sizeCube, sizeCube, -sizeCube) );
  geometryLine1.vertices.push(new THREE.Vector3( -sizeCube, sizeCube, -sizeCube) );
  lineB1 = new THREE.Line( geometryLine1, materialLine );
  scene.add( lineB1 );

  var geometryLine2 = new THREE.Geometry();
  geometryLine2.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, -sizeCube) );
  geometryLine2.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, -sizeCube) );
  lineB2 = new THREE.Line( geometryLine2, materialLine );
  scene.add( lineB2 );

  var geometryLine3 = new THREE.Geometry();
  geometryLine3.vertices.push(new THREE.Vector3( sizeCube, -sizeCube, sizeCube) );
  geometryLine3.vertices.push(new THREE.Vector3( -sizeCube, -sizeCube, sizeCube) );
  lineB3 = new THREE.Line( geometryLine3, materialLine );
  scene.add( lineB3 );

  var geometryBox = new THREE.BoxGeometry( sizeCube*2, sizeCube*2, sizeCube*2 );
  var materialBox = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
  cubeB = new THREE.Mesh( geometryBox, materialBox );
  scene.add( cubeB );
}

function addCubeBig(){
  if(cubeBigInScene){
    deleteCubeBig();
  }else{
    cubeBigInScene = true;
    scene.add( lineB );
    scene.add( lineB1 );
    scene.add( lineB2 );
    scene.add( lineB3 );
    scene.add( cubeB );
  }
  
}

function deleteCubeBig(){
  cubeBigInScene = false;
  scene.remove( lineB );
  scene.remove( lineB1 );
  scene.remove( lineB2 );
  scene.remove( lineB3 );
  scene.remove( cubeB );
}

var lineOb, lineOb1, lineOb2, lineOb3;
var cubeOb;
function addObstacleInfo(){
  var sizeCube = radiusSmall+particleRad;
  var widthObstacle = radius/3 - particleRad;
  var heightObstacle = radius/3;

  var howMuchLower = radius*(3.25/4.25);
  var geometryLine = new THREE.Geometry();
  geometryLine.vertices.push(new THREE.Vector3( widthObstacle, heightObstacle-howMuchLower, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( widthObstacle, heightObstacle-howMuchLower, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( widthObstacle, -heightObstacle-howMuchLower, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( widthObstacle, -heightObstacle-howMuchLower, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( widthObstacle, heightObstacle-howMuchLower, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -widthObstacle, heightObstacle-howMuchLower, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -widthObstacle, heightObstacle-howMuchLower, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -widthObstacle, -heightObstacle-howMuchLower, -sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -widthObstacle, -heightObstacle-howMuchLower, sizeCube) );
  geometryLine.vertices.push(new THREE.Vector3( -widthObstacle, heightObstacle-howMuchLower, sizeCube) );
  var materialLine = new THREE.LineBasicMaterial( { color: 0xffffff } );
  lineOb = new THREE.Line( geometryLine, materialLine );

  var geometryLine1 = new THREE.Geometry();
  geometryLine1.vertices.push(new THREE.Vector3( widthObstacle, heightObstacle-howMuchLower, -sizeCube) );
  geometryLine1.vertices.push(new THREE.Vector3( -widthObstacle, heightObstacle-howMuchLower, -sizeCube) );
  lineOb1 = new THREE.Line( geometryLine1, materialLine );

  var geometryLine2 = new THREE.Geometry();
  geometryLine2.vertices.push(new THREE.Vector3( widthObstacle, -heightObstacle-howMuchLower, -sizeCube) );
  geometryLine2.vertices.push(new THREE.Vector3( -widthObstacle, -heightObstacle-howMuchLower, -sizeCube) );
  lineOb2 = new THREE.Line( geometryLine2, materialLine );

  var geometryLine3 = new THREE.Geometry();
  geometryLine3.vertices.push(new THREE.Vector3( widthObstacle, -heightObstacle-howMuchLower, sizeCube) );
  geometryLine3.vertices.push(new THREE.Vector3( -widthObstacle, -heightObstacle-howMuchLower, sizeCube) );
  lineOb3 = new THREE.Line( geometryLine3, materialLine );

  var geometryBox = new THREE.BoxGeometry( widthObstacle*2, heightObstacle*2, sizeCube*2 );
  var materialBox = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
  cubeOb = new THREE.Mesh( geometryBox, materialBox );

  cubeOb.position.y -= howMuchLower;
  // cubeOb.position.z -= howMuchLower;
  // lineOb.position.z -= howMuchLower;
  // lineOb1.position.z -= howMuchLower;
  // lineOb2.position.z -= howMuchLower;
  // lineOb3.position.z -= howMuchLower;
}

function addObstacle(){
  if(obstacleInScene){
    deleteObstacle();
  }else{
    obstacleInScene = true;
    columnParticlesButton();
    scene.add( lineOb );
    scene.add( lineOb1 );
    scene.add( lineOb2 );
    scene.add( lineOb3 );
    scene.add( cubeOb );
  }
  
}

function deleteObstacle(){
  obstacleInScene = false;
  scene.remove( lineOb );
  scene.remove( lineOb1 );
  scene.remove( lineOb2 );
  scene.remove( lineOb3 );
  scene.remove( cubeOb );
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