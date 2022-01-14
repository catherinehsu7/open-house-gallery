window.addEventListener('load', init); // Wait for loading
window.addEventListener('resize', onResize); // When window resized
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      toggleFullScreen();
    }
  }, false);

let renderer, scene, camera;
let webCam;
let particles;

function init() {  
    // Get window size
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Create webgl renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas'),
    });
    renderer2 = new THREE.WebGLRenderer({
        imgcanvas: document.querySelector('#imgcanvas'),
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);
    // renderer.outputEncoding = THREE.GammaEncoding;

    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.autoRotate=true;
    camera.position.set( -5, 14, 15 );
    controls.update(); // must be called after any manual changes to the camera's transform
    scene.add(camera);

    // Create light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    scene.add(directionalLight);

    // Init webcam & particle
    // getDevices()
    initWebCam();

    // Render loop
    const render = () => {
        drawParticles();
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    };
    render();
}

// Get videoinput device info
function getDevices(){
    console.log("getDevices...");
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
        devices.forEach(function(device) {
            if(device.kind == "videoinput"){
                console.log("device:",device);
            }
        });
    })
    .catch(function(err) {
        console.error('ERROR:', err);
    });
}

function initWebCam(){
    console.log("initWebCam...");
    webCam = document.createElement('video');
    webCam.id = 'webcam';
    webCam.autoplay = true;
    webCam.width    = 512; //640
    webCam.height   = 480;

    const option = {
        video: true,
        audio: false,
    }

    // Get image from camera
    media = navigator.mediaDevices.getUserMedia(option)
    .then(function(stream) {
        webCam.srcObject = stream;
        createParticles();
    }).catch(function(e) {
        alert("ERROR: " + e.message);
        // console.error('ERROR:', e.message);
    });
}

function getImageData(image){

    const w = image.width;
    const h = image.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    // // Invert image
    // ctx.translate(w, 0);
    // ctx.scale(-1, 1);

    ctx.drawImage(image, 0, 0,);
    const imageData = ctx.getImageData(0, 0, w, h);
//    console.log(imageData);
    return imageData;
}

function createParticles(){
    console.log("createParticles...");
    const imageData = getImageData(webCam);

    const geometry = new THREE.BufferGeometry();
    const vertices_base = [];
    const colors_base = [];

    const width = imageData.width;
    const height = imageData.height;

    // Set particle info
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const posX = 0.035*(-x + width / 2);
            const posY = 0; //0.1*(-y + height / 2)
            const posZ = 0.035*(y - height / 2);
            vertices_base.push(posX, posY, posZ);

            const r = 1.0;
            const g = 1.0;
            const b = 1.0;
            colors_base.push(r, g, b);
        }
    }
    const vertices = new Float32Array(vertices_base);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const colors = new Float32Array(colors_base);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Set shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: 'f',
                value: 0.0
            },
            size: {
                type: 'f',
                value: 5.0
            },
        },
        vertexShader: vertexSource,
        fragmentShader: fragmentSource,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

//image get colour
var arrayImg = [
 //   '/assets/0_1_sample.png',
 //   '/assets/0_1_sample2.png',
 //   '/assets/1_1_distracted.png',
  //  '/assets/2_1_joke.png',
  //  '/assets/3_1_outsider.png',
//    '/assets/4_1_books.png',
  //  '/assets/5_1_introvert.png',
 //  '/assets/6_1_stubborn.png',
  //  '/assets/7_1_interest.png',
   //'/assets/8_1_dreams.png',
    '/assets/9_1_believe.png'
    ]; 

var index = 0;
var counter = 0;

function drawParticles(t){
    
    // Update particle info
    if (particles) {
        const imageData = getImageData(webCam);
        if(counter >= 200) {
            if(index < arrayImg.length-1){
                var path = arrayImg[index];      // If not, use the index
                //console.log(index,path);
                index++;                      // Then, increment it
            } else {
                index = 0; // If so, reset the index
                var path = arrayImg[index];
            }
            counter=0;
        }   else {  
            counter++;
            var path = arrayImg[index];
        }

        base_image = new Image();
        base_image.src = path;    
    
        const canvas = document.getElementById('imgcanvas');
        const ctx = canvas.getContext('2d');
        
        base_image.onload = function(){
    
            const w = base_image.width;
            const h = base_image.height;
    
            canvas.width = w;
            canvas.height = h;
    
            //console.log(w,h);
    
            ctx.drawImage(base_image, 0, 0,);
            //console.log(base_image.src);
            
            const picData = ctx.getImageData(0, 0, w, h);
            //console.log(picData);          

            const length = particles.geometry.attributes.position.count;
            for (let i = 0; i < length; i++) {
                const index = i * 4;

                const r = imageData.data[index]/255;
                const g = imageData.data[index+1]/255;
                const b = imageData.data[index+2]/255;
                const gray = (r+g+b) / 3;

                const rP = picData.data[index]/255;
                const gP = picData.data[index+1]/255;
                const bP = picData.data[index+2]/255;
                

                particles.geometry.attributes.position.setY( i , gray*7);
                
                particles.geometry.attributes.color.setX( i , rP);
                particles.geometry.attributes.color.setY( i , gP);
                particles.geometry.attributes.color.setZ( i , bP);

                
            }}
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
    }
}

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

//===================================================
// Shader Souce
//===================================================

const vertexSource = `
attribute vec3 color;
uniform float time;
uniform float size;
varying vec3 vColor;
varying float vGray;
void main() {
    // To fragmentShader
    vColor = color;
    vGray = (vColor.x + vColor.y + vColor.z) / 3.0;

    // Set vertex size
    gl_PointSize = size * vGray * 1.7;
    // gl_PointSize = size;

    // Set vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.1);
}
`;

const fragmentSource = `
varying vec3 vColor;
varying float vGray;
void main() {
    float gray = vGray;

    // Decide whether to draw particle
    if(gray > 0.5){
        gray = 0.3;
    }else{
        gray = 1.0;
    }

    // Set vertex color
    gl_FragColor = vec4(vColor, gray);
}
`;