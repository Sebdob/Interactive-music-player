// Variables
var coverImg = document.getElementById('coverImg');
var bandName = document.getElementById('bandName');
var songName = document.getElementById('songName');
var playBtn = document.getElementById('playBtn');
var startLabel = document.getElementById('start');
var endLabel = document.getElementById('end');
var backBtn = document.getElementById('backBtn');
var nextBtn = document.getElementById('nextBtn');

// Playbar & remaining time elements
var playBar = document.querySelector('.bar');
var playBarRemaining = document.querySelector('.unplayed-progress');

// Playhead -> Slider Thumb Control
var playHead = document.querySelector('.playHead');

// Playbar globals
var playHeadGrabbing = false;
var playBarClicked = false;
var playHeadNewLocation = 0;

// Time variables
var currentTime = 0;
var durationTime = 0;

// Main variables
var currentAlbum = 0;
var menuIn = true;
var infoSectionIn = true;

// JSON for albums
var albumsList = {
	"albums":[
		{ 	
			"song":"media/Audio_1.mp3",
			"albumCover":"media/album1.png",
			"bandName":"Band Name 1",
			"songTitle":"The Famous Song"
		},
		{ 	
			"song":"media/Audio_2.mp3",
			"albumCover":"media/album2.png",
			"bandName":"Band Name 2",
			"songTitle":"The Other Song"
		}
	]
}

var howlerCustom = {
	duration : 0,
	current : null,
	preload : new Howl({
		src:[albumsList.albums[currentAlbum].song],
		onload: function(){
			document.getElementById('end').innerText = formatTime(howlerCustom.preload._duration);
		}
	}),
	autoplay : false,
	speed : 1,
	currentTime : 0,
	currentID : 0, 
	seek : 0,
	paused : true,
	pause : function() {
		howlerCustom.paused = true;
		if(howlerCustom.current && howlerCustom.current.playing()){
			howlerCustom.current.pause();
			howlerCustom.seek = howlerCustom.current.seek(howlerCustom.currentID);
		} else {
			return false;
		}
	},
	speedUpdate : function(speed) {
		howlerCustom.speed = speed;
	},
	play : function() {
		howlerCustom.paused = false;
		if(howlerCustom.current){
	        howlerCustom.current.play(howlerCustom.currentID);
	        howlerCustom.current.seek(howlerCustom.seek, howlerCustom.currentID);
		} else {
			howlerCustom.current = new Howl({
				src:[albumsList.albums[currentAlbum].song],
				onload: function(){
					console.log('howler loaded');
					document.getElementById('end').innerText = formatTime(howlerCustom.current._duration);
				},
				onplay: function(){
					console.log('howler played');
					howlerCustom.paused = false;
				},
				onend: function(){
					if(howlerCustom.autoplay){
						nextAudio();
					} else {
						console.log('howler ended');
						howlerCustom.paused = true;
						resetCurrent();
						howlerCustom.onended();
					}
				},
				onseek: function(){
					console.log('howler seek');
				}
			});
			howlerCustom.currentID = howlerCustom.current.play();
		}		
	},
	step : function(){
		if(howlerCustom.current && howlerCustom.current.playing()){
			howlerCustom.current.rate(howlerCustom.speed);
			var currentPosition = howlerCustom.current.seek() || 0;
			var totalPosition = howlerCustom.current.duration() || 0;

			// Can add events based actions here, or in the ontimeupdate function below

			howlerCustom.duration = totalPosition;
			howlerCustom.currentTime = currentPosition;
			howlerCustom.ontimeupdate();
			console.log(currentPosition, totalPosition);
		}
	}
};

setInterval(function(){
	howlerCustom.step();
},50);

function changeSpeed() {
	howlerCustom.speed = (howlerCustom.speed == 1) ? 1.2 : 1;
	document.getElementById("currentSpeed").innerText = howlerCustom.speed + 'x';
}

function toggleAutoplay() {
	howlerCustom.autoplay = !howlerCustom.autoplay;
	var textVal = (howlerCustom.autoplay) ? 'ON' : 'OFF';
	document.getElementById('autoPlaying').innerText = textVal;
}

// On load
howlerCustom.onloadedmetadata = function(){
	// Load the first album on load
	loadAlbum(currentAlbum);
}

howlerCustom.onloadedmetadata();

// Load album
function loadAlbum(e){
	coverImg.src = albumsList.albums[e].albumCover;
	bandName.innerHTML = albumsList.albums[e].bandName;
	songName.innerHTML = albumsList.albums[e].songTitle;

	if(currentAlbum >= 1){
		backBtn.classList.remove('disabled');
	} else{
		backBtn.classList.add('disabled');
	}

	// Disable next back
	disableNextBack();

	// Audio duration
	durationTime = formatTime(howlerCustom.duration);
	endLabel.innerHTML = durationTime;
}

// On Time Update
howlerCustom.ontimeupdate = function(){
	// Convert time
	currentTime = formatTime(howlerCustom.currentTime);
	// console.log(currentTime)
	startLabel.innerHTML = currentTime;

	var percent = howlerCustom.currentTime / howlerCustom.duration * 100;

    if(!playHeadGrabbing && !playBarClicked){
		updatePlayBarCSS(percent);
    	playHeadNewLocation = percent;
    }

	// Highlight 1
	if (currentTime >= "0:00" && currentTime <= "0:10") {
		document.getElementById('section1').classList.add('highlight')
	} else{
		document.getElementById('section1').classList.remove('highlight')
	}

	// Highlight 2
	if (currentTime >= "0:11" && currentTime <= "0:30") {
		document.getElementById('section2').classList.add('highlight')
	} else{
		document.getElementById('section2').classList.remove('highlight')
	}

	// Highlight 3
	if (currentTime >= "0:31" && currentTime <= "0:55") {
		document.getElementById('section3').classList.add('highlight')
	} else{
		document.getElementById('section3').classList.remove('highlight')
	}
}

function updatePlayBarCSS(percent) {
	playHead.style.left = percent + '%';
	playBarRemaining.style.left = percent + '%';
}

function updateAudioPosition(percent) {
	howlerCustom.currentTime = percent/100 * howlerCustom.duration;
	document.getElementById('start').innerText = formatTime(howlerCustom.currentTime);
	howlerCustom.seek = howlerCustom.currentTime;
	if(howlerCustom.current) {
		howlerCustom.current.seek(howlerCustom.currentTime);
	}
}


function updatePlayHeadPosition(e) {
	var percent = getPlayHeadPosition(e);
	updatePlayBarCSS(percent);
}

/* Returns number from 0 - 100 representing percentage 
position of PlayHead thumb */
function getPlayHeadPosition(e) {
	var barRect = playBar.getBoundingClientRect();
	var x = e.clientX - barRect.left;
	var percent = x / barRect.width * 100;
	percent = Math.min(100, percent);
	percent = Math.max(0, percent);
	playHeadNewLocation = percent;
	return percent;
}

playHead.onmousedown = function(){
	playHeadGrabbing = true;
};

playBar.onmousedown = function(e){
	playHeadGrabbing = true;
	playBarClicked = true;
	playHead.style.left = getPlayHeadPosition(e) + '%';
	updatePlayHeadPosition(e);
	setTimeout(function(){
		playBarClicked = false;
	},100);
};

document.onmousemove = function(e){
	if(playHeadGrabbing){
		updatePlayHeadPosition(e);
	}
};

document.onmouseup = function(){
	playHeadGrabbing = false;
	updateAudioPosition(playHeadNewLocation);
};

// Play audio
function playAudio(){
	if (howlerCustom.paused) {
		howlerCustom.play();
		playBtn.src = ('media/pause.png');
	} else{
		howlerCustom.pause();
		playBtn.src = ('media/play.png');
	}
}

function resetCurrent() {
	howlerCustom.pause();
	howlerCustom.current = null;
	howlerCustom.seek = 0;
	howlerCustom.currentTime = 0;
	document.getElementById('start').innerText = formatTime(0);
	updatePlayBarCSS(0);
}

// Next & Back Audio
function nextAudio(){
	resetCurrent();

	currentAlbum = currentAlbum + 1;

	disableNextBack();

	if (currentAlbum >= albumsList.albums.length) {
		alert('No more');
	} else {
		loadAlbum(currentAlbum);

		howlerCustom.src = albumsList.albums[currentAlbum].song;
		playAudio();
	}
}

function backAudio(){
	resetCurrent();

	currentAlbum = currentAlbum - 1;

	loadAlbum(currentAlbum);

	disableNextBack();

	howlerCustom.src = albumsList.albums[currentAlbum].song;
	playAudio();
}

function disableNextBack(){
	if (currentAlbum == albumsList.albums.length - 1) {
		nextBtn.classList.add('disabled');
	} else{
		nextBtn.classList.remove('disabled');
	}

	if (currentAlbum == 0) {
		backBtn.classList.add('disabled');
	} else{
		backBtn.classList.remove('disabled');
	}
}

// Audio end
howlerCustom.onended = function(){
	playBtn.src = ('media/play.png')
}

// Figure out time
function formatTime(e){
	var minutes = parseInt(e / 60, 10);
    var seconds = parseInt(e % 60);

    if (seconds <=9){
    	seconds = "0"+seconds;
    }

	var finalTime = minutes+":"+ seconds;
	return finalTime
    
}

// Animate Menu
function animateMenu(){
	if (menuIn) {
		$('.menuArea').animate({left: "0"}, 500);
		menuIn = false;
	} else{
		$('.menuArea').animate({left: "-380px"}, 500);
		menuIn = true;
	}
}

// Animate info section
function animateInfoSection(){
	if (infoSectionIn) {
		$('.infoSection').animate({bottom: "0"}, 500);
		infoSectionIn = false;
	} else{
		$('.infoSection').animate({bottom: "-540px"}, 500);
		infoSectionIn = true;
	}
}

// Menu item selected
function menuSelected(e){
	resetCurrent();
	currentAlbum = e;
	loadAlbum(e);
	animateMenu();
	howlerCustom.src = albumsList.albums[e].song;
	playAudio();
}