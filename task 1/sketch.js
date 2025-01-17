
// playback controls
var pauseButton;
var playButton;
var stopButton;
var skipStartButton;
var skipEndButton;
var loopButton;
var recordButton;

// low-pass filter
var lp_cutOffSlider;
var lp_resonanceSlider;
var lp_dryWetSlider;
var lp_outputSlider;

// dynamic compressor
var dc_attackSlider;
var dc_kneeSlider;
var dc_releaseSlider;
var dc_ratioSlider;
var dc_thresholdSlider;
var dc_dryWetSlider;
var dc_outputSlider;

// master volume
var mv_volumeSlider;
// reverb
var rv_durationSlider;
var rv_decaySlider;
var rv_dryWetSlider;
var rv_outputSlider;
var rv_reverseButton;
// waveshaper distortion
var wd_amountSlider;
var wd_oversampleSlider;
var wd_dryWetSlider;
var wd_outputSlider;
// additional variables
var soundFile;
var lowPassFilter, waveshaper, compressor, reverb;
var fftIn, fftOut;
var recorder, soundBlob;
var isRecording = false;
var soundLooping = false; // To keep track of the looping state
var isReverse = false; 
var audioInputSelect;
var micInput;
var bgRedSlider, bgGreenSlider, bgBlueSlider;
var pianoSynth;
var pianoNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C5'];
var noteButtons = [];
var recorder, mediaRecorder;
var recordedChunks = [];
var isRecording = false;
var videoBlob, videoUrl;
var recordButton;
let filterTypeSelector; 
let delayEffect; 
let delayTimeSlider, delayFeedbackSlider, delayFilterSlider; 

function setup() {
    createCanvas(800, 800);
    background(180);
    pianoSynth = new p5.MonoSynth();

    // Initialize audio nodes
    lowPassFilter = new p5.LowPass();
    waveshaper = new p5.Distortion();
    compressor = new p5.Compressor();
    reverb = new p5.Reverb();
    micInput = new p5.AudioIn();
    micInput.start();
    
    // set up recorder
    recorder = new p5.SoundRecorder();
    recorder.setInput(); 
    soundBlob = new p5.SoundFile();
    
    // Load sound file
    soundFile = loadSound('./LISA - MONEY (Lyrics).mp3');

    // Audio source selection
    audioInputSelect = createSelect();
    audioInputSelect.position(10, 560);
    audioInputSelect.option('Microphone');
    audioInputSelect.option('Pre-recorded File');
    audioInputSelect.changed(changeAudioSource);
    
    // Connect the audio nodes in the specified signal flow
    changeAudioSource();
    soundFile.disconnect(); // Disconnect from master output
    soundFile.connect(lowPassFilter);
    lowPassFilter.connect(waveshaper);
    waveshaper.connect(compressor);
    compressor.connect(reverb);
    reverb.connect(p5.soundOut); // Connect to master output
  
    // Initialize spectrum analyzers
    fftIn = new p5.FFT();
    fftIn.setInput(soundFile);
    fftOut = new p5.FFT();
       
    // Create Piano keys (C major scale)
  createPianoKeys();
  recorder.setInput(micInput); // Use mic input by default or change based on audioInputSelect

    // Set up the Record button
    recordButton = createButton('Record');
    recordButton.position(690, 20);
    recordButton.style('font-size', '16px');
    recordButton.style('padding', '10px 20px');
    recordButton.style('background-color', '#FFD700');
    recordButton.style('color', 'white');
    recordButton.style('border', 'none');
    recordButton.style('border-radius', '8px');
    recordButton.style('cursor', 'pointer');
    recordButton.mousePressed(toggleRecording);

  // Create the filter type selector
  filterTypeSelector = createSelect();
  filterTypeSelector.position(10, 275); 
  filterTypeSelector.option('Low-Pass');
  filterTypeSelector.option('High-Pass');
  filterTypeSelector.option('Band-Pass');
  filterTypeSelector.selected('Low-Pass'); // Default to Low-Pass
  filterTypeSelector.changed(updateFilterType);

  // Set the initial filter type
  lowPassFilter.setType('lowpass');
  gui_configuration();


    // Initialize the delay effect
    delayEffect = new p5.Delay();

    // Connect the delay effect in the audio chain
    soundFile.disconnect(); // Disconnect from master output
    soundFile.connect(lowPassFilter);
    lowPassFilter.connect(delayEffect); 
    delayEffect.connect(compressor); // Connect delay to the compressor
    compressor.connect(reverb); // Existing chain
    reverb.connect(p5.soundOut); // Connect to master output

    // Create sliders for delay parameters
    createDelayControls();
}

function draw() {   
    
  background(255, 200, 200);
    fill(0, 0, 0);
    updateDelayEffect();

  // low-pass filter
  textSize(14);
  text('low-pass filter', 10,80);
  textSize(10);

  lowPassFilter.freq(lp_cutOffSlider.value() * 22050);
  text('cutoff frequency', 10,105);

  lp_resonanceSlider
  lowPassFilter.res(lp_resonanceSlider.value() * 20);
  text('resonance', 10,150);

  lowPassFilter.drywet(lp_dryWetSlider.value());
  text('dry/wet', 10,195);

  lowPassFilter.amp(lp_outputSlider.value());
  text('output level', 10,240);
  
  // dynamic compressor
  textSize(14);
  text('dynamic compressor', 210,80);
  textSize(10);
    
    compressor.attack(dc_attackSlider.value());
  text('attack', 210,105);

    compressor.knee(dc_kneeSlider.value());
  text('knee', 210,150);

    compressor.release(dc_releaseSlider.value());
  text('release', 210,195);

    compressor.ratio(dc_ratioSlider.value());
  text('ratio', 210,240);

    compressor.threshold(dc_thresholdSlider.value());
  text('threshold', 360,105);

  compressor.drywet(dc_dryWetSlider.value());
  text('dry/wet', 360,150);

  compressor.amp(dc_outputSlider.value());
  text('output level', 360,195);
  
  // master volume
  textSize(14);
  text('master volume', 560,80);
  textSize(10);

  soundFile.setVolume(mv_volumeSlider.value());
  text('level', 560,105)

  // reverb
  textSize(14);
  text('reverb', 10,305);
  textSize(10);
    
  rv_durationSlider.input(updateReverb);
  text('duration', 10,330); 

  rv_decaySlider.input(updateReverb);
  text('decay', 10,375);

  reverb.drywet(rv_dryWetSlider.value());
  text('dry/wet', 10,420);

  reverb.amp(rv_outputSlider.value());
  text('output level', 10,465);

  rv_reverseButton
  
  // waveshaper distortion
  textSize(14);
  text('waveshaper distortion', 210,305);
  textSize(10);
 
    wd_amountSlider.input(updateWaveshaper);
  text('distortion amount', 210,330);

  wd_oversampleSlider.input(updateDistortionOversampling);
  text('oversample', 210,375);

  waveshaper.drywet(wd_dryWetSlider.value());
  text('dry/wet', 210,420);

  waveshaper.amp(wd_outputSlider.value());
  text('output level', 210,465);
  
  // spectrums
  textSize(14);
  text('spectrum in', 560,200);
  text('spectrum out', 560,345);
    // Visualize the spectrum

    let spectrumIn = fftIn.analyze();
    let spectrumOut = fftOut.analyze();
    
    // Draw the input spectrum
    drawSpectrum(spectrumIn, 560, 300, 380, 40);
  
    // Draw the output spectrum
    drawSpectrum(spectrumOut, 560, 445, 380, 40);

  textSize(14);
  text('Piano C Major Scale', 10, height - 120);

    // Delay Effect Labels
    textSize(16);
    text('Delay Effect', 200, 530);

    textSize(12);
    text('Time (s)', 200, 545);  // Position label for delay time
    text('Feedback', 200, 590);  // Position label for feedback
    text('Filter (Hz)', 200, 635);  // Position label for filter


}

function changeAudioSource() {
    let selectedSource = audioInputSelect.value();

    // Disconnect any previous input
    soundFile.disconnect();
    micInput.disconnect();

    if (selectedSource === 'Microphone') {
        micInput.connect(lowPassFilter);
        recorder.setInput(micInput); // Use mic input
    } else if (selectedSource === 'Pre-recorded File') {
        soundFile.connect(lowPassFilter);
        recorder.setInput(soundFile); // Use pre-recorded file
    }
}



function initializeMediaRecorder() {
    // Capture the canvas stream at 30fps
    videoStream = canvas.captureStream(30);  
    // Set up the MediaRecorder to record video
    mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/webm'
    });

    // Store chunks of video data
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    // Once the recording stops, save the video and audio
    mediaRecorder.onstop = function() {
        // Save video as WebM
        videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        videoUrl = URL.createObjectURL(videoBlob);

        // Create a downloadable link for the video file
        let a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'screenRecording.webm';
        a.click();
        console.log('Screen recording saved as screenRecording.webm');

        // Save audio as WAV
        saveAudioRecording();
    };
}


function drawSpectrum(spectrum, x, y, w, h) {
  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
      let binAmplitude = spectrum[i];
      let binHeight = map(binAmplitude, 0, 255, 0, h);
      
      // Interpolate between red and blue for a gradient effect
      let spectrumColor = lerpColor(color(255, 0, 0), color(0, 0, 255), i / spectrum.length);
      fill(spectrumColor);
      
      rect(x + i * (w / spectrum.length), y, w / spectrum.length, -binHeight);
  }
}


function playSound() {
    if (!soundFile.isPlaying()) {
        soundFile.play();
    }
}

function pauseSound() {
    if (soundFile.isPlaying()) {
        soundFile.pause();
    }
}

function stopSound() {
    soundFile.stop();
}

function skipToStart() {
    soundFile.jump(0); // Sets the playback position to the start
}

function skipToEnd() {
    if (soundFile.isLoaded()) {
        const duration = soundFile.duration();
        soundFile.jump(duration - 0.1); // Jump to just before the end of the sound file
    }
}

function toggleLoop() {
    soundLooping = !soundLooping; // Toggle the looping state
    soundFile.setLoop(soundLooping); // Apply looping state to the sound file
    if (soundLooping) {
        loopButton.html('Disable Loop');
        console.log(soundLooping);
    } else {
        loopButton.html('Enable Loop');
        console.log(soundLooping);
    }
}



function toggleRecording() {
    if (!isRecording) {
        console.log("Recording started...");
        recorder.record(soundBlob); // Start recording
        recordButton.html("Stop Recording");
    } else {
        console.log("Recording stopped. Saving file...");
        recorder.stop(); // Stop recording

        // Save the recording only if there's valid data
        if (soundBlob.buffer && soundBlob.buffer.length > 0) {
            saveSound(soundBlob, 'recording.wav'); // Save as WAV
        } else {
            console.error("No audio data recorded.");
        }

        recordButton.html("Start Recording");
    }
    isRecording = !isRecording;
}

function reverseReverb(){
    isReverse = !isReverse;  // Only toggle once
    updateReverb();
}


function updateReverb() {
    var rvDuration = rv_durationSlider.value();
    var decay = rv_decaySlider.value();
    reverb.set(rvDuration, decay, isReverse);
}

var oversampleSetting = 'none';

function updateWaveshaper(){
    waveshaper.set(wd_amountSlider.value(), oversampleSetting);
}

function updateDistortionOversampling() {
    var sliderValue = wd_oversampleSlider.value();

    if (sliderValue < 0.33) {
        oversampleSetting = 'none';
    } else if (sliderValue < 0.66) {
        oversampleSetting = '2x';
    } else {
        oversampleSetting = '4x';
    }

    updateWaveshaper();
}

function gui_configuration() {
  // Playback controls
  pauseButton = createButton('pause');
  pauseButton.position(50, 20);
  pauseButton.style('font-size', '16px');
  pauseButton.style('padding', '10px 20px');
  pauseButton.style('background-color', '#FF6347');
  pauseButton.style('color', 'white');
  pauseButton.style('border', 'none');
  pauseButton.style('border-radius', '8px');
  pauseButton.style('cursor', 'pointer');
  pauseButton.mousePressed(pauseSound);
  
  playButton = createButton('play');
  playButton.position(`140`, 20);
  playButton.style('font-size', '16px');
  playButton.style('padding', '10px 20px');
  playButton.style('background-color', '#32CD32');
  playButton.style('color', 'white');
  playButton.style('border', 'none');
  playButton.style('border-radius', '8px');
  playButton.style('cursor', 'pointer');
  playButton.mousePressed(playSound);
  
  stopButton = createButton('stop');
  stopButton.position(220, 20);
  stopButton.style('font-size', '16px');
  stopButton.style('padding', '10px 20px');
  stopButton.style('background-color', '#FF4500');
  stopButton.style('color', 'white');
  stopButton.style('border', 'none');
  stopButton.style('border-radius', '8px');
  stopButton.style('cursor', 'pointer');
  stopButton.mousePressed(stopSound);
  
  skipStartButton = createButton('skip to start');
  skipStartButton.position(300, 20);
  skipStartButton.style('font-size', '16px');
  skipStartButton.style('padding', '10px 20px');
  skipStartButton.style('background-color', '#4169E1');
  skipStartButton.style('color', 'white');
  skipStartButton.style('border', 'none');
  skipStartButton.style('border-radius', '8px');
  skipStartButton.style('cursor', 'pointer');
  skipStartButton.mousePressed(skipToStart);
  
  skipEndButton = createButton('skip to end');
  skipEndButton.position(430, 20);
  skipEndButton.style('font-size', '16px');
  skipEndButton.style('padding', '10px 20px');
  skipEndButton.style('background-color', '#4169E1');
  skipEndButton.style('color', 'white');
  skipEndButton.style('border', 'none');
  skipEndButton.style('border-radius', '8px');
  skipEndButton.style('cursor', 'pointer');
  skipEndButton.mousePressed(skipToEnd);
  
  loopButton = createButton('Enable loop');
  loopButton.position(560, 20);
  loopButton.style('font-size', '16px');
  loopButton.style('padding', '10px 20px');
  loopButton.style('background-color', '#32CD32');
  loopButton.style('color', 'white');
  loopButton.style('border', 'none');
  loopButton.style('border-radius', '8px');
  loopButton.style('cursor', 'pointer');
  loopButton.mousePressed(toggleLoop);
  
  recordButton = createButton('record');
  recordButton.position(690, 20);
  recordButton.style('font-size', '16px');
  recordButton.style('padding', '10px 20px');
  recordButton.style('background-color', '#FFD700');
  recordButton.style('color', 'white');
  recordButton.style('border', 'none');
  recordButton.style('border-radius', '8px');
  recordButton.style('cursor', 'pointer');
  recordButton.mousePressed(toggleRecording);

  
  rv_reverseButton = createButton('reverb reverse');
  rv_reverseButton.position(10, 510);
  rv_reverseButton.style('font-size', '16px');
  rv_reverseButton.style('padding', '10px 20px');
  rv_reverseButton.style('background-color', '#8A2BE2');
  rv_reverseButton.style('color', 'white');
  rv_reverseButton.style('border', 'none');
  rv_reverseButton.style('border-radius', '8px');
  rv_reverseButton.style('cursor', 'pointer');
  rv_reverseButton.mousePressed(reverseReverb);

 


  // Low-pass filter sliders
lp_cutOffSlider = createSlider(0, 1, 0.5, 0.01);
lp_cutOffSlider.position(10, 110);
lp_cutOffSlider.style('width', '150px'); 

lp_resonanceSlider = createSlider(0, 1, 0.5, 0.01);
lp_resonanceSlider.position(10, 155);
lp_resonanceSlider.style('width', '150px'); 

lp_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
lp_dryWetSlider.position(10, 200);
lp_dryWetSlider.style('width', '150px'); 

lp_outputSlider = createSlider(0, 1, 0.5, 0.01);
lp_outputSlider.position(10, 245);
lp_outputSlider.style('width', '150px'); 

// Dynamic compressor sliders
dc_attackSlider = createSlider(0, 1, 0.5, 0.01);
dc_attackSlider.position(210, 110);
dc_attackSlider.style('width', '150px'); 

dc_kneeSlider = createSlider(0, 40, 30, 1);
dc_kneeSlider.position(210, 155);
dc_kneeSlider.style('width', '150px'); 

dc_releaseSlider = createSlider(0, 1, 0.25, 0.01);
dc_releaseSlider.position(210, 200);
dc_releaseSlider.style('width', '150px'); 

dc_ratioSlider = createSlider(0, 20, 12, 1);
dc_ratioSlider.position(210, 245);
dc_ratioSlider.style('width', '150px'); 

dc_thresholdSlider = createSlider(-100, 0, -24, 1);
dc_thresholdSlider.position(360, 110);
dc_thresholdSlider.style('width', '150px'); 

dc_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
dc_dryWetSlider.position(360, 155);
dc_dryWetSlider.style('width', '150px'); 

dc_outputSlider = createSlider(0, 1, 0.5, 0.01);
dc_outputSlider.position(360, 200);
dc_outputSlider.style('width', '150px'); 

// Master volume slider
mv_volumeSlider = createSlider(0, 1, 0.5, 0.01);
mv_volumeSlider.position(560, 110);
mv_volumeSlider.style('width', '150px'); 

// Reverb sliders and reverse button
rv_durationSlider = createSlider(0, 10, 3, 0.5);
rv_durationSlider.position(10, 335);
rv_durationSlider.style('width', '150px'); 

rv_decaySlider = createSlider(0, 100, 2, 1);
rv_decaySlider.position(10, 380);
rv_decaySlider.style('width', '150px');

rv_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
rv_dryWetSlider.position(10, 425);
rv_dryWetSlider.style('width', '150px'); 

rv_outputSlider = createSlider(0, 1, 0.5, 0.01);
rv_outputSlider.position(10, 470);
rv_outputSlider.style('width', '150px'); 

// Waveshaper distortion sliders
wd_amountSlider = createSlider(0, 1, 0.5, 0.01);
wd_amountSlider.position(210, 335);
wd_amountSlider.style('width', '150px'); 

wd_oversampleSlider = createSlider(0, 1, 0.5, 0.01);
wd_oversampleSlider.position(210, 380);
wd_oversampleSlider.style('width', '150px');

wd_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
wd_dryWetSlider.position(210, 425);
wd_dryWetSlider.style('width', '150px'); 

wd_outputSlider = createSlider(0, 1, 0.5, 0.01);
wd_outputSlider.position(210, 470);
wd_outputSlider.style('width', '150px'); 

}



function createPianoKeys() {
    let keyWidth = 60;  // Width of each piano key
    let keyHeight = 60; // Height of each piano key
    let startX = 10;    // X position to start the first key
    let startY = height - 100; // Y position to place the keys
    
    // Create buttons for each piano note
    for (let i = 0; i < pianoNotes.length; i++) {
      let note = pianoNotes[i];
      let noteButton = createButton(note);
      noteButton.position(startX + i * (keyWidth + 10), startY);
      noteButton.size(keyWidth, keyHeight);
      noteButton.mousePressed(() => playPianoNote(note));
      noteButton.style('font-size', '16px');
      noteButton.style('background-color', '#A9A9A9');
      noteButton.style('color', 'black');
      noteButton.style('border', 'none');
      noteButton.style('border-radius', '4px');
      noteButton.style('cursor', 'pointer');
      noteButtons.push(noteButton);
    }
  }
  
  function playPianoNote(note) {
    // Map note to frequency
    let noteFreq;
    switch (note) {
        case 'C': noteFreq = 261.63; break;  // C4
        case 'D': noteFreq = 293.66; break;  // D4
        case 'E': noteFreq = 329.63; break;  // E4
        case 'F': noteFreq = 349.23; break;  // F4
        case 'G': noteFreq = 392.00; break;  // G4
        case 'A': noteFreq = 440.00; break;  // A4
        case 'B': noteFreq = 493.88; break;  // B4
        case 'C5': noteFreq = 523.25; break; // C5
    }

    // Trigger the note using the piano synthesizer
    pianoSynth.play(noteFreq, 1, 0, 0.5); // Play at full volume, medium duration

    
}


function stopRecordingAndDownload() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop(); // Stop screen recording
    }

    recorder.stop(); // Stop audio recording

    setTimeout(() => {
        if (soundBlob.buffer && soundBlob.buffer.length > 0) {
            saveSound(soundBlob, 'recorded_audio.wav'); // Save the audio as WAV file
        } else {
            console.error('No audio data found.');
        }

        if (recordedChunks.length > 0) {
            let videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            let videoUrl = URL.createObjectURL(videoBlob);

            // Automatically prompt a download for the video file
            let a = document.createElement('a');
            a.href = videoUrl;
            a.download = 'screenRecording.webm';
            a.click();

            console.log('Screen recording saved as screenRecording.webm');
        }
    }, 1000); // Wait a second to ensure recording stops
}

function toggleRecording() {
    if (!isRecording) {
        // Start recording
        console.log('Recording started...');
        recorder.record(soundBlob);
        isRecording = true;
        recordButton.html('Stop Recording');
    } else {
        // Stop recording
        console.log('Recording stopped. Saving file...');
        recorder.stop(); // Stops recording
        isRecording = false;
        recordButton.html('Start Recording');

        // Ensure there is data in the soundBlob before saving
        if (soundBlob.buffer && soundBlob.buffer.length > 0) {
            soundBlob.save('recording.wav');
        } else {
            console.error('Recording failed. No audio data found.');
        }
    }
}



// Function to download the recorded video
function downloadRecording() {
    if (videoUrl) {
        let a = createA(videoUrl, 'Download Recording');
        a.attribute('download', 'screenRecording.webm');
        a.mousePressed(function() {
            a.remove();
        });
        a.show();
    }
}

function initializeMediaRecorder() {
    let stream = canvas.captureStream(30);  // Capture at 30 FPS
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'  // Save as .webm
    });

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        let videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        let videoUrl = URL.createObjectURL(videoBlob);

        // Create a downloadable link for the video file
        let a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'screenRecording.webm';
        a.click();

        console.log('Screen recording saved as screenRecording.webm');
    };
}

function saveAudioRecording() {
    // Use p5.SoundRecorder to save the audio as WAV
    audioRecorder.stop();
    setTimeout(() => {
        audioBlob = audioRecorder.getBlob();
        audioUrl = URL.createObjectURL(audioBlob);

        // Create a downloadable link for the audio file
        let a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'audioRecording.wav';
        a.click();
        console.log('Audio recording saved as audioRecording.wav');
    }, 1000); // Wait a second to ensure audio stops
}

function startScreenRecording() {
    recordedChunks = [];  // Clear any previous recordings
    mediaRecorder.start();
    console.log("Screen recording started");
}

function stopScreenRecording() {
    mediaRecorder.stop();
    console.log("Screen recording stopped");
}

function saveRecordedFile() {
    let blob = new Blob(recordedChunks, { type: 'video/webm' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.href = url;
    link.download = 'recorded-video.webm';
    link.click();
    URL.revokeObjectURL(url);
}


function saveAudioRecording() {
    // Use p5.SoundRecorder to save the audio as WAV
    audioRecorder.stop();
    setTimeout(() => {
        audioBlob = audioRecorder.getBlob();
        audioUrl = URL.createObjectURL(audioBlob);

        // Create a downloadable link for the audio file
        let a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'audioRecording.wav';
        a.click();
        console.log('Audio recording saved as audioRecording.wav');
    }, 1000); // Wait a second to ensure audio stops
}

function updateFilterType() {
    let selectedType = filterTypeSelector.value();
    if (selectedType === 'Low-Pass') {
        lowPassFilter.setType('lowpass');
    } else if (selectedType === 'High-Pass') {
        lowPassFilter.setType('highpass');
    } else if (selectedType === 'Band-Pass') {
        lowPassFilter.setType('bandpass');
    }
}


function createDelayControls() {
    // Delay time slider (0 - 1 second)
    delayTimeSlider = createSlider(0, 1, 0.5, 0.01);
    delayTimeSlider.position(200, 550);
    delayTimeSlider.style('width', '150px');

    // Feedback slider (0 - 0.99)
    delayFeedbackSlider = createSlider(0, 0.99, 0.5, 0.01);
    delayFeedbackSlider.position(200, 595);
    delayFeedbackSlider.style('width', '150px');

    // Filter slider (0 - 22050 Hz)
    delayFilterSlider = createSlider(0, 22050, 22050, 1);
    delayFilterSlider.position(200, 640);
    delayFilterSlider.style('width', '150px');
}

// Function to update the delay effect parameters
function updateDelayEffect() {
    let delayTime = delayTimeSlider.value(); // Delay time
    let delayFeedback = delayFeedbackSlider.value(); // Feedback level
    let delayFilter = delayFilterSlider.value(); // Filter frequency

    // Update the delay effect
    delayEffect.delayTime(delayTime);
    delayEffect.feedback(delayFeedback);
    delayEffect.filter(delayFilter);
}