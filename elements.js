//CUBES---------------------------------------------------------------------------------------------------
var toReturn
//The cube will be the actual geometry of the cube and the outline to help the viewer understand the scene
function cubeInfo( heightObstacle, widthObstacle, sizeCube, howMuchLower){
  toReturn = [];
  //Create as much of a cube in one line
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
  toReturn.push( new THREE.Line( geometryLine, materialLine ));

  //Create remaining lines
  var geometryLine1 = new THREE.Geometry();
  geometryLine1.vertices.push(new THREE.Vector3( widthObstacle, heightObstacle-howMuchLower, -sizeCube) );
  geometryLine1.vertices.push(new THREE.Vector3( -widthObstacle, heightObstacle-howMuchLower, -sizeCube) );
  toReturn.push( new THREE.Line( geometryLine1, materialLine ));
  var geometryLine2 = new THREE.Geometry();
  geometryLine2.vertices.push(new THREE.Vector3( widthObstacle, -heightObstacle-howMuchLower, -sizeCube) );
  geometryLine2.vertices.push(new THREE.Vector3( -widthObstacle, -heightObstacle-howMuchLower, -sizeCube) );
  toReturn.push( new THREE.Line( geometryLine2, materialLine ));
  var geometryLine3 = new THREE.Geometry();
  geometryLine3.vertices.push(new THREE.Vector3( widthObstacle, -heightObstacle-howMuchLower, sizeCube) );
  geometryLine3.vertices.push(new THREE.Vector3( -widthObstacle, -heightObstacle-howMuchLower, sizeCube) );
  toReturn.push( new THREE.Line( geometryLine3, materialLine ));

  //Create final cube
  var geometryBox = new THREE.BoxGeometry( widthObstacle*2, heightObstacle*2, sizeCube*2 );
  var materialBox = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true} );
  toReturn.push( new THREE.Mesh( geometryBox, materialBox ))
  return toReturn;
}

//Need variables outside to be able to delete and crete them
var line, line1, line2, line3;
var cube;
//Small cube
function addCubeInfo(){
  var sizeCube = radiusSmall+particleRad;
  var cubeInfoPar = cubeInfo(sizeCube, sizeCube, sizeCube, 0);
  line = cubeInfoPar[0];
  line1 = cubeInfoPar[1];
  line2 = cubeInfoPar[2];
  line3 = cubeInfoPar[3];
  cube = cubeInfoPar[4];
  scene.add( line );
  scene.add( line1 );
  scene.add( line2 );
  scene.add( line3 );
  scene.add( cube );
}

//Add small cube
function addCube(){
    scene.add( line );
    scene.add( line1 );
    scene.add( line2 );
    scene.add( line3 );
    scene.add( cube );
}

//Delete small cube
function deleteCube(){
  scene.remove( line );
  scene.remove( line1 );
  scene.remove( line2 );
  scene.remove( line3 );
  scene.remove( cube );
}

//Need to create the variacles outside to  delete and add
var lineB, lineB1, lineB2, lineB3;
var cubeB;
function addCubeBigInfo(){
  var sizeCube = radiusBig+particleRad;
  var cubeInfoPar = cubeInfo(sizeCube, sizeCube, sizeCube, 0);
  lineB = cubeInfoPar[0];
  lineB1 = cubeInfoPar[1];
  lineB2 = cubeInfoPar[2];
  lineB3 = cubeInfoPar[3];
  cubeB = cubeInfoPar[4];
  scene.add( lineB );
  scene.add( lineB1 );
  scene.add( lineB2 );
  scene.add( lineB3 );
  scene.add( cubeB );
}

function addCubeBig(){
    scene.add( lineB );
    scene.add( lineB1 );  
    scene.add( lineB2 );
    scene.add( lineB3 );
    scene.add( cubeB );
  
}

function deleteCubeBig(){
  scene.remove( lineB );
  scene.remove( lineB1 );
  scene.remove( lineB2 );
  scene.remove( lineB3 );
  scene.remove( cubeB );
}

//OBSTACLES----------------------------------------------------------------------------------------------
var lineOb, lineOb1, lineOb2, lineOb3;
var cubeOb;
//SMALL OBSTACLE INFO
function addObstacleInfo(){
  var sizeCube = radiusSmall+particleRad;
  var widthObstacle = radius/3 - particleRad;
  var heightObstacle = radius/3;
  var howMuchLower = radius*(3.25/4.25);
  var cubeInfoPar = cubeInfo(heightObstacle, widthObstacle, sizeCube, howMuchLower);
  lineOb = cubeInfoPar[0];
  lineOb1 = cubeInfoPar[1];
  lineOb2 = cubeInfoPar[2];
  lineOb3 = cubeInfoPar[3];
  cubeOb = cubeInfoPar[4];
  scene.add( lineOb );
  scene.add( lineOb1 );
  scene.add( lineOb2 );
  scene.add( lineOb3 );
  scene.add( cubeOb );

  cubeOb.position.y -= howMuchLower;
  deleteObstacle();
}
//ADD SMALL OBSTACLE
function addObstacle(){
    scene.add( lineOb );
    scene.add( lineOb1 );
    scene.add( lineOb2 );
    scene.add( lineOb3 );
    scene.add( cubeOb );
  
}

//DELETE SMALL OBSTACLE
function deleteObstacle(){
  scene.remove( lineOb );
  scene.remove( lineOb1 );
  scene.remove( lineOb2 );
  scene.remove( lineOb3 );
  scene.remove( cubeOb );
}

var lineObBig, lineObBig1, lineObBig2, lineObBig3;
var cubeObBig;
function addObstacleBigInfo(){
  var sizeCube = radiusBig+particleRad;
  var widthObstacle = radiusBig/3 - particleRad;
  var heightObstacle = radiusBig/3;

  var howMuchLower = radiusBig*(2.5/3.5);
  var cubeInfoPar = cubeInfo(heightObstacle, widthObstacle, sizeCube, howMuchLower);
  lineObBig = cubeInfoPar[0];
  lineObBig1 = cubeInfoPar[1];
  lineObBig2 = cubeInfoPar[2];
  lineObBig3 = cubeInfoPar[3];
  cubeObBig = cubeInfoPar[4];
  scene.add( lineObBig );
  scene.add( lineObBig1 );
  scene.add( lineObBig2 );
  scene.add( lineObBig3 );
  scene.add( cubeObBig );

  cubeObBig.position.y -= howMuchLower;
  deleteObstacleBig();
}

function addObstacleBig(){
    scene.add( lineObBig );
    scene.add( lineObBig1 );
    scene.add( lineObBig2 );
    scene.add( lineObBig3 );
    scene.add( cubeObBig );
  
}

function deleteObstacleBig(){
  scene.remove( lineObBig );
  scene.remove( lineObBig1 );
  scene.remove( lineObBig2 );
  scene.remove( lineObBig3 );
  scene.remove( cubeObBig );
}