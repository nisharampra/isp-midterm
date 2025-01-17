let mySound;
let playStopButton;
let fft;
let analyzer;
let speechRec;

let currentShape = 'rect'; // Default shape is rectangle
let bgColor = 'black';
let rainbowHue = 0; // Starting hue value for the rainbow effect
let volumeSlider;

function preload() {
  soundFormats('wav', 'mp3');
  mySound = loadSound('/sounds/Ex2_sound1.wav'); // Load the initial sound
}

function setup() {
  createCanvas(600, 500);
  //background(0);

  // Initialize speech recognition
  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  speechRec.start(true, false);
  
  // Initialize FFT for real-time frequency analysis
  fft = new p5.FFT(0.2, 2048);
  
  // Initialize Meyda analyzer
  analyzer = Meyda.createMeydaAnalyzer({
    audioContext: getAudioContext(),
    source: mySound,
    bufferSize: 512,
    featureExtractors: ['rms', 'energy', 'zcr', 'loudness', 'spectralCentroid', 'spectralFlatness'],
    callback: features => {
      drawShapes(features); // Draw the shapes based on extracted features
    }
  });

  // Start Meyda analyzer
  analyzer.start();
  
  // Create Play/Stop button with custom styling
  playStopButton = createButton('Play');
  playStopButton.position(150, 20);
  playStopButton.style('padding', '10px 20px');
  playStopButton.style('background-color', '#4CAF50');
  playStopButton.style('color', 'white');
  playStopButton.style('border', 'none');
  playStopButton.style('border-radius', '5px');
  playStopButton.style('font-size', '16px');
  playStopButton.mousePressed(playStopSound);

  // Add Volume Slider
  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(20, height - 40);
  volumeSlider.style('width', '200px');
  volumeSlider.input(updateVolume);

  // Add Shape Selector
  let shapeSelect = createSelect();
  shapeSelect.position(20, 60);
  shapeSelect.option('Rectangle');
  shapeSelect.option('Triangle');
  shapeSelect.option('Pentagon');
  shapeSelect.option('Circle');
  shapeSelect.changed(changeShape);
}

function draw() {
  // Update rainbow background color
  updateRainbowBackground();

  // Continuously display feedback about the current sound and shape
  displayFeedback();
}

function gotSpeech() {
  if (speechRec.resultValue) {
    let command = speechRec.resultString.toLowerCase();
    executeCommand(command);
  }
}

function executeCommand(command) {
  switch (command) {
    case 'black':
      bgColor = [0, 0, 0];
      break;
    case 'white':
      bgColor = [255, 255, 255];
      break;
    case 'red':
      bgColor = [255, 0, 0];
      break;
    case 'blue':
      bgColor = [0, 0, 255];
      break;
    case 'green':
      bgColor = [0, 255, 0];
      break;
    case 'square':
      currentShape = 'rect';
      break;
    case 'triangle':
      currentShape = 'triangle';
      break;
    case 'pentagon':
      currentShape = 'pentagon';
      break;
      case 'circle':
      currentShape = 'circle';
      break;
    case 'sound 1':
      changeSound('/sounds/Ex2_sound1.wav');
      break;
    case 'sound 2':
      changeSound('/sounds/Ex2_sound2.wav');
      break;
    case 'sound 3':
      changeSound('/sounds/Ex2_sound3.wav');
      break;
    case 'kalte ohren':
      changeSound('/sounds/Kalte_Ohren_Remix.mp3');
      break;
  }
  background(0); 
}

function changeSound(soundPath) {
  if (mySound.isPlaying()) {
    mySound.stop();
  }

  // Load the new sound
  mySound = loadSound(soundPath, () => {
    if (mySound.isLoaded()) {
      // Set the new source for Meyda and restart the analyzer
      analyzer.setSource(mySound);
      mySound.loop(); // Start playing the new sound
    } else {
      console.error('Failed to load sound:', soundPath);
    }
  });
}


function drawShapes(features) {

  background(bgColor);
  let numShapes = 5;
  let shapeWidth = width / numShapes;
  let maxShapeHeight = height / 2;

  for (let i = 0; i < numShapes; i++) {
    let shapeHeight, opacity, fillRed, fillGreen, fillBlue, rotation, borderSize, borderOpacity;

    // Set shape properties based on audio features like RMS, Energy, etc.
    switch (i) {
      case 0: // RMS
        shapeHeight = map(features.rms, 0, 0.25, 20, maxShapeHeight);
        fillRed = 0; fillGreen = 0; fillBlue = 255; // Blue for RMS
        opacity = map(features.rms, 0, 0.25, 50, 255);
        rotation = map(features.rms, 0, 0.25, -PI / 4, PI / 4);
        borderSize = 2;
        borderOpacity = 255;
        break;
      case 1: // Energy
        shapeHeight = map(features.energy, 0, 50, 20, maxShapeHeight);
        fillRed = 0; fillGreen = 255; fillBlue = 0; // Green for Energy
        opacity = 255;
        rotation = map(features.energy, 0, 50, -PI / 6, PI / 6);
        borderSize = 2;
        borderOpacity = 255;
        break;
      case 2: // Spectral Centroid
        shapeHeight = map(features.spectralCentroid, 0, 1000, 20, maxShapeHeight);
        fillRed = map(features.spectralCentroid, 0, 1000, 50, 255);
        fillGreen = map(features.spectralCentroid, 0, 1000, 50, 255);
        fillBlue = map(features.spectralCentroid, 0, 1000, 50, 255);
        opacity = 255;
        rotation = map(features.spectralCentroid, 0, 1000, -PI / 4, PI / 4);
        borderSize = 2;
        borderOpacity = 255;
        break;
      case 3: // Spectral Flatness
        shapeHeight = map(features.spectralFlatness, 0, 1, 20, maxShapeHeight);
        fillRed = 255; fillGreen = 165; fillBlue = 0; // Orange for Spectral Flatness
        opacity = map(features.spectralFlatness, 0, 1, 50, 255);
        rotation = map(features.spectralFlatness, 0, 1, -PI / 6, PI / 6);
        borderSize = 3;
        borderOpacity = 200;
        break;
      case 4: // Loudness
        shapeHeight = map(features.loudness.total, 0, 50, 20, maxShapeHeight);
        fillRed = 255; fillGreen = 0; fillBlue = 0; // Red for Loudness
        opacity = map(features.loudness.total, 0, 50, 50, 255);
        rotation = 0;
        borderSize = 1;
        borderOpacity = map(features.loudness.total, 0, 50, 50, 255);
        break;
    }

    // Apply fill, stroke, and opacity
    fill(fillRed, fillGreen, fillBlue, opacity);
    stroke(255, 255, 255, borderOpacity);
    strokeWeight(borderSize);
    
    // Draw the shape with rotation
    push();
    translate(shapeWidth * i + shapeWidth / 2, height / 2);
    rotate(rotation);
    rectMode(CENTER);
    
    // Switch for different shapes
    switch (currentShape) {
      case 'rect':
        rect(0, 0, shapeWidth, shapeHeight);
        break;
      case 'triangle':
        triangle(-shapeWidth / 2, shapeHeight / 2, shapeWidth / 2, shapeHeight / 2, 0, -shapeHeight);
        break;
      case 'pentagon':
        beginShape();
        for (let j = 0; j < 5; j++) {
          let angle = TWO_PI / 5 * j;
          let x = cos(angle) * shapeWidth / 2;
          let y = sin(angle) * shapeWidth / 2;
          vertex(x, y);
        }
        endShape(CLOSE);
        break;
        case 'circle': 
        ellipse(0, 0, shapeWidth, shapeHeight);
        break;
    }
    pop();
  }

  // Particle effect: Bass pulse
  if (features.energy > 150) {
    createParticleEffect();
  }
}

function createParticleEffect() {
  for (let i = 0; i < 10; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(5, 15);
    let colorShift = random(255);
    fill(colorShift, 100, 255);
    noStroke();
    ellipse(x, y, size, size);
  }
}

function displayFeedback() {
  fill(255);
  textSize(16);
  textAlign(CENTER, TOP);
  text('Current Sound: ' + mySound._url.split('/').pop(), width / 2, 10); 
  text('Current Shape: ' + currentShape, width / 2, 30);
}

// Play/Stop button functionality
function playStopSound() {
  if (mySound.isPlaying()) {
    mySound.stop();
    playStopButton.html('Play');
  } else {
    mySound.loop();
    playStopButton.html('Stop');
  }
}

// Volume slider input function
function updateVolume() {
  mySound.setVolume(volumeSlider.value());
}

// Change shape from dropdown
function changeShape() {
  currentShape = this.value().toLowerCase();
}

// Function to update the rainbow background
function updateRainbowBackground() {
  rainbowHue += 0.5;
  if (rainbowHue > 360) {
    rainbowHue = 0; 
  }
  let bgColor = color(rainbowHue, 255, 255); // HSV to RGB conversion
  background(bgColor);
}


