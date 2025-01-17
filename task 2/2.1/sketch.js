
let speech; // p5.Speech instance
let soundFile; // Pre-recorded sound file
let filter; // Audio filter
let digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
let letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
let captchaText = [];
let generatedCaptcha = '';

function preload() {
  // Load a pre-recorded sound file for background noise
  soundFile = loadSound('./Record (online-voice-recorder.com).mp3'); 
}

function setup() {
  // Initialize the canvas and p5.speech
  createCanvas(400, 200);
  speech = new p5.Speech();
  
  // Set up an audio filter
  filter = new p5.LowPass();
  soundFile.disconnect();
  soundFile.connect(filter);

  // Generate and play the CAPTCHA
  generateCaptcha();
}

function generateCaptcha() {
  // Create a random CAPTCHA with 4-6 characters
  captchaText = [];
  let captchaLength = int(random(4, 7)); // Random length between 4 and 6
  for (let i = 0; i < captchaLength; i++) {
    if (random() > 0.5) {
      let digit = int(random(10)); // Random digit 0-9
      captchaText.push(digits[digit]); // Use the digit's word representation
    } else {
      captchaText.push(random(letters)); // Random letter
    }
  }
  generatedCaptcha = captchaText.join('');
  speakCaptcha();
}

function speakCaptcha() {
  const captchaString = captchaText.join(' ');

  // Set random audio filter frequency
  filter.freq(random(500, 1500)); // Scramble the sound with a low-pass filter
  filter.res(random(0.5, 1)); // Randomize resonance

  // Play background noise
  soundFile.play();

  // Apply random speech synthesis parameters
  speech.setRate(random(0.8, 1.2)); // Vary speech speed
  speech.setPitch(random(0.5, 1.5)); // Vary pitch

  // Speak the CAPTCHA with pre-recorded noise overlay
  speech.speak(captchaString);
}

function validateCaptcha() {
  const userInput = document.getElementById('captchaInput').value.trim().toLowerCase();
  const expectedCaptcha = captchaText.join('').toLowerCase();

  // Validate user input
  if (/^[a-z0-9]+$/.test(userInput)) {
    if (userInput === expectedCaptcha) {
      alert('CAPTCHA validated successfully!');
    } else {
      alert('Incorrect CAPTCHA. Please try again.');
      generateCaptcha(); // Generate a new CAPTCHA
    }
  } else {
    alert('Please enter only letters or digits.');
  }
}

function draw() {
  background(220);
  textSize(16);
  textAlign(CENTER, CENTER);
  text('Audio CAPTCHA is being spoken. Check the console for details.', width / 2, height / 2);
  console.log('Generated CAPTCHA: ' + captchaText.join(' '));
}