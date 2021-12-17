const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.castShadow = true;
scene.add(directionalLight);
directionalLight.position.set(0, 1, 1);

camera.position.z = 6;
renderer.setClearColor(0xb7c3f3, 1);

const loader = new THREE.GLTFLoader();
let doll;

const start_position = 6;
const end_position = -start_position;

const text = document.querySelector(".text");

let DEAD_PLAYERS = 0;
let SAFE_PLAYERS = 0;

const startBtn = document.querySelector(".start-btn");

//musics
const bgMusic = new Audio("./music/bg.mp3");
bgMusic.loop = true;
const winMusic = new Audio("./music/win.mp3");
const loseMusic = new Audio("./music/lose.mp3");

loader.load("./model/scene.gltf", function (gltf) {
  scene.add(gltf.scene);
  doll = gltf.scene;
  gltf.scene.position.set(0, -1, 0);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  //   startBtn.innerText = "start";
});

function lookBackward() {
  gsap.to(doll.rotation, { duration: 0.45, y: -3.15 });
  setTimeout(() => (dallFacingBack = true), 150);
}
function lookForward() {
  gsap.to(doll.rotation, { duration: 0.45, y: 0 });
  setTimeout(() => (dallFacingBack = false), 450);
}

function createCube(size, posX, rotY = 0, color = 0xfbc851) {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(posX, 0, 0);
  cube.rotation.y = rotY;
  scene.add(cube);
  return cube;
}

//Creating runway
createCube(
  { w: start_position * 2 + 0.21, h: 1.5, d: 1 },
  0,
  0,
  0xe5a716
).position.z = -1;
createCube({ w: 0.2, h: 1.5, d: 1 }, start_position, -0.4);
createCube({ w: 0.2, h: 1.5, d: 1 }, end_position, 0.4);

class Player {
  constructor(name = "Player", radius = 0.25, posY = 2220, color = 0xffffff) {
    const geometry = new THREE.SphereGeometry(radius, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color });
    const player = new THREE.Mesh(geometry, material);
    scene.add(player);
    player.position.x = start_position - 0.4;
    player.position.z = 1;
    player.position.y = posY;
    this.player = player;
    this.playerInfo = {
      positionX: start_position - 0.4,
      velocity: 0,
      name,
      isDead: false,
    };
  }

  run() {
    if (this.playerInfo.isDead) return;
    this.playerInfo.velocity = 0.1;
  }

  stop() {
    gsap.to(this.playerInfo, { duration: 0.1, velocity: 0 });
  }

  check() {
    if (this.playerInfo.isDead) return;
    if (!dallFacingBack && this.playerInfo.velocity > 0) {
      text.innerText = this.playerInfo.name + " lost!!!";
      this.playerInfo.isDead = true;
      this.stop();
      DEAD_PLAYERS++;
      loseMusic.play();
      if (DEAD_PLAYERS == players.length) {
        text.innerText = "Game over!!!";
        gameState = "ended";
      }
      if (DEAD_PLAYERS + SAFE_PLAYERS == players.length) {
        gameState = "ended";
      }
    }
    if (this.playerInfo.positionX < end_position + 0.7) {
      text.innerText = this.playerInfo.name + " is safe!!!";
      this.playerInfo.isDead = true;
      this.stop();
      SAFE_PLAYERS++;
      winMusic.play();
      if (SAFE_PLAYERS == players.length) {
        text.innerText = "Everyone is safe!!!";
        gameState = "ended";
      }
      if (DEAD_PLAYERS + SAFE_PLAYERS == players.length) {
        gameState = "ended";
      }
    }
  }

  update() {
    this.check();
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const player1 = new Player("Player 1", 0.25, 0, 0xd1ffc6);
// const player2 = new Player("Player 2", 0.25, -0.3, 0xffcfd2);

const players = [
  {
    player: player1,
    key: "ArrowUp",
    name: "Player 1",
  },
  //   {
  //     player: player2,
  //     key: "w",
  //     name: "Player 2",
  //   },
];

const TIME_LIMIT = 30;
async function init() {
  await delay(500);
  text.innerText = "Starting in 3";
  await delay(500);
  text.innerText = "Starting in 2";
  await delay(500);
  text.innerText = "Starting in 1";
  lookBackward();
  await delay(500);
  text.innerText = "Gooo!!!";
  bgMusic.play();
  start();
}

let gameState = "loading";

function start() {
  gameState = "started";
  const progressBar = createCube({ w: 8, h: 0.1, d: 1 }, 0, 0, 0xebaa12);
  progressBar.position.y = 3.35;
  gsap.to(progressBar.scale, { duration: TIME_LIMIT, x: 0, ease: "none" });
  setTimeout(() => {
    if (gameState != "ended") {
      text.innerText = "Time Out!!!";
      loseMusic.play();
      gameState = "ended";
    }
  }, TIME_LIMIT * 1000);
  startDoll();
}

let dallFacingBack = true;
async function startDoll() {
  lookBackward();
  await delay(Math.random() * 1500 + 1500);
  lookForward();
  await delay(Math.random() * 750 + 750);
  startDoll();
}

startBtn.addEventListener("click", () => {
  if (startBtn.innerText == "START") {
    init();
    document.querySelector(".modal").style.display = "none";
  }
});

function animate() {
  renderer.render(scene, camera);
  players.map((player) => player.player.update());
  if (gameState == "ended") return;
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("keydown", function (e) {
  if (gameState != "started") return;
  let p = players.find((player) => player.key == e.key);
  if (p) {
    p.player.run();
  }
});
window.addEventListener("keyup", function (e) {
  let p = players.find((player) => player.key == e.key);
  if (p) {
    p.player.stop();
  }
});

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//add controls via hand gestures

const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 250;

let videoWidth,
  model,
  videoHeight,
  rafID,
  ctx,
  canvas,
  fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  };

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();
  startBtn.innerText = "start";
  return video;
}

async function main() {
  await tf.setBackend("webgl");
  model = await handpose.load();
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent = e.message;
    info.style.display = "block";
    throw e;
  }

  videoWidth = video.videoWidth || VIDEO_WIDTH;
  videoHeight = video.videoHeight;

  canvas = document.getElementById("output");
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  landmarksRealTime(video);
}

const landmarksRealTime = async (video) => {
  async function frameLandmarks() {
    ctx.drawImage(
      video,
      0,
      0,
      videoWidth,
      videoHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
    const predictions = await model.estimateHands(video);
    if (predictions.length > 0) {
      const result = predictions[0].landmarks;
      drawKeypoints(result, predictions[0].annotations);
    } else if (gameState === "started") {
      players[0].player.stop();
    }
    rafID = requestAnimationFrame(frameLandmarks);
  }

  frameLandmarks();
};

function drawPath(points, closePath) {
  console.log(ctx);
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

function drawPoint(y, x, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawKeypoints(keypoints) {
  if (gameState !== "started") {
    return;
  }
  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i][0];
    const x = keypointsArray[i][1];
    drawPoint(x - 2, y - 2, 3);
  }

  const fingers = Object.keys(fingerLookupIndices);

  let isPalmOpen = true;
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map((idx) => keypoints[idx]);

    if (points[1][1] < points[4][1]) {
      isPalmOpen = false;
    }
    drawPath(points, false);
  }
  console.log(isPalmOpen);
  if (isPalmOpen) {
    players[0].player.run();
  } else {
    players[0].player.stop();
  }
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

main();
