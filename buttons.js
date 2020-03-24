//BUTTONS FUNCTIONS------------------------------------------------------------------------------------------------------------------
//GENERAL FUNCTION TO UPDATE THE PARTICLES WHEN A BUTTON IS CLICKED GIVEN THE NEW POSITION
function updateParticlesChangeMode(yEl, x, z, newRadio){
    var positions = geometry.attributes.position.array;
    for ( var i = 0; i < noParticles; i ++ ) {
        if(i < noParticlesShown){
        particlesInfo[i][DIRECTION] = new THREE.Vector3(0, -0.01, 0);
        particlesInfo[i][ACCELERATION] = 0.001;
        if(i == 0){
            positions[i*3] =  getRandomArbitrary(-newRadio,newRadio);
            positions[i*3+1] = yEl ;
            positions[i*3+2] =  getRandomArbitrary(-newRadio,newRadio);
        }else{
            x = getRandomArbitrary(-newRadio,newRadio);
            z = getRandomArbitrary(-newRadio,newRadio);
            positions[i*3] =  x;
            positions[i*3+1] = yEl ;
            positions[i*3+2] =  z;
        }
        var counter = 0;
        for( var j = 0; j<i; j++){
            var changed = false
            while(distance(positions[i*3], positions[j*3], positions[i*3+1], positions[j*3+1], positions[i*3+2], positions[j*3+2]) <=  particleRad*2){
            positions[i*3] = getRandomArbitrary(-newRadio,newRadio);
            positions[i*3+1] = yEl;
            positions[i*3+2] = getRandomArbitrary(-newRadio,newRadio);
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
}

//ALL ON TOP BUTTON
function topParticlesButton(){
    state = 0;
    if(smallVersion){
        setSmallDemoParam();
    }else{
        setBigDemoParam();
    }
    var yEl = radius-1;
    var x,z;
    noParticlesShown = userNoParticles;
    updateParticlesChangeMode(yEl, x, z, radius);
    checked = false;
    stremingOn = false;
}

//COLUMN BUTTON
function columnParticlesButton(){
    state = 1;
    if(smallVersion){
        setSmallDemoParam();
    }else{
        setBigDemoParam();
    }
    var yEl = radius-1;
    var x,z;
    noParticlesShown = userNoParticles;
    updateParticlesChangeMode(yEl, x, z, radius/2);
    checked = false;
    stremingOn = false;
}

//ALL PARTICLES AS A BOX BUTTON
function boxParticlesButton(){
    state = 3;
    if(smallVersion){
        setSmallDemoParam();
    }else{
        setBigDemoParam();
    }
    var yEl = -radius;
    var x,z;
    noParticlesShown = userNoParticles;
    var positions = geometry.attributes.position.array;
    //In this case I can not use the function since this time the particles start from below upwards
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

//STREAMING BUTTON
function streamingButton(){
    state = 2;
    if(smallVersion){
        setSmallDemoParam();
    }else{
        setBigDemoParam();
    }
    var yEl = radius-1;
    var x,z;
    noParticlesShown = 5;
    var positions = geometry.attributes.position.array;
    var rangeMin = -radius/3;
    var rangeMax = 0
    //I can not use the function because in the case of the streaming I want the particles
    // to be in a particular spot and set different parameters
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
        positions[i*3] = NaN;
        positions[i*3+1] = NaN ;
        positions[i*3+2] = NaN;
        }
    }
    geometry.attributes.position.needsUpdate = true;
    checked = false;
    stremingOn = true;
}

//BUTTONS OF SINGLE CASE-------------------
//COLLISION ON SAME LEVEL
function sameLevelButton(){
    if(obstacleInScene){
        deleteObstacle();
    }
    if(!smallVersion){
        setSmallDemoParam();
    }
    //Set manually the parameters manually
    var yEl = -radius;
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

    //COLLISION WITH A PARTICLE BELOW
    function aboveLevelButton(){
    if(obstacleInScene){
        deleteObstacle();
    }
    if(!smallVersion){
        setSmallDemoParam();
    }
    noParticlesShown = 2;
    //Set parameters manually
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
        positions[i*3] = NaN;
        positions[i*3+1] = NaN ;
        positions[i*3+2] = NaN;
    }
    geometry.attributes.position.needsUpdate = true;
    checked = false;
    stremingOn = false;
}

//COLLISION AGAINST A WALL BUTTON
function collisionWallButton(){
    if(!smallVersion){
        setSmallDemoParam();
    }
    noParticlesShown = 2;
    //Set parameters manually
    var positions = geometry.attributes.position.array;
    particlesInfo[0][DIRECTION] = new THREE.Vector3(0.8, 0, 0);
    particlesInfo[0][ACCELERATION] = 0.001;
    positions[0*3] =  -radius/2;
    positions[0*3+1] = -radius;
    positions[0*3+2] =  -radius/2;
    particlesInfo[1][DIRECTION] = new THREE.Vector3(0.2, 0, 0);
    particlesInfo[1][ACCELERATION] = 0.001;
    positions[1*3] =  -radius/2;
    positions[1*3+1] = -radius ;
    positions[1*3+2] =  radius/2;
    for ( var i = 2; i < noParticles; i ++ ) {
        positions[i*3] = NaN;
        positions[i*3+1] = NaN ;
        positions[i*3+2] = NaN;
    }
    geometry.attributes.position.needsUpdate = true;
    checked = false;
    stremingOn = false;
    }

    //SHOW THE PARABOLIC MOVEMENT BUTTON
    function paraboleButton(){
    if(obstacleInScene){
        deleteObstacle();
    }
    if(radius != radiusSmall){
        setSmallDemoParam();
    }
    restartTimer = true;
    countingTime = true;
    noParticlesShown = 1;
    //Set parameters manually
    var positions = geometry.attributes.position.array;
    particlesInfo[0][DIRECTION] = new THREE.Vector3(0.1, 0.2, 0);
    particlesInfo[0][ACCELERATION] = 0.001;
    positions[0*3] =  -radius+1;
    positions[0*3+1] = -radius+1;
    positions[0*3+2] =  0;
    for ( var i = 1; i < noParticles; i ++ ) {
        positions[i*3] = NaN;
        positions[i*3+1] = NaN ;
        positions[i*3+2] = NaN;
    }
    geometry.attributes.position.needsUpdate = true;
    checked = false;
    stremingOn = false;
}

//CHECKBOX BUTTONS------------------------
//SCALING
function checkboxScale() {
    smallVersion = !smallVersion;
    //Change text
    if(smallVersion){
        document.getElementById("smallScaleText").innerHTML = "Small Scale: On";
    }else{
        document.getElementById("smallScaleText").innerHTML = "Small Scale: Off";
    }
    //Change obstacle to appropriate one
    if(obstacleInScene){
        if(smallVersion){
        addObstacle();
        deleteObstacleBig();
        }else{
        addObstacleBig();
        deleteObstacle();
        }
    }
    //Restart the scene
    if(state ==0){
        topParticlesButton();
    }else if(state ==1){
        columnParticlesButton();
    }else if(state == 2){
        streamingButton();
    }else{
        boxParticlesButton();
    }
}

//OBSTACLE
function checkboxObstacle() {
    obstacleInScene = !obstacleInScene;
    //Set the text
    if(obstacleInScene){
        document.getElementById("obstacleText").innerHTML = "Obstacle: On";
    }else{
        document.getElementById("obstacleText").innerHTML = "Obstacle: Off";
    }
    //Create the obstacle appropriately
    if(smallVersion){
        if(obstacleInScene){
        addObstacle()
        }else{
        deleteObstacle();
        }
    }else{
        if(obstacleInScene){
        addObstacleBig()
        }else{
        deleteObstacleBig();
        }
    }
}

//UPDATE PARTICLES BUTTONS-------------------------------------------------------
function updateParticles(){
    userNoParticles =  document.getElementById("quantityParticle").value;
    //Set a maximum of particles in the case of small scale set
    if(smallVersion && userNoParticles >500){
        document.getElementById("quantityParticle").value = 500;
        userNoParticles = 500;
    }
    document.getElementById("noParticles").innerHTML = "Number particles: " + userNoParticles;
    if(state ==0){
        topParticlesButton();
    }else if(state ==1){
        columnParticlesButton();
    }else if(state == 2){
        streamingButton();
    }else{
        boxParticlesButton();
    }
}
//SET THE PARAMETERS FOR SMALLER OR BIGGER SCALE---------------------------------------------------------
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