var server = "//beatsturning.com/games/drift";
var maxLength = 5;

var timeoutRemove;

var sent = 0;

var checkingLength = 0;
var length = 0;
var lengthFunction;

var user = location.hash.substring(1);
$.get(server + "/send/getcolors.php?user=" + btoa(unescape(encodeURIComponent(user))), function(data) {
	if (data == "invalid") {
		alert("invalid");
	} else if (data == "unset") {
		alert("unset");
	} else {
		document.body.style.setProperty('--color', data["text"]);
		document.body.style.setProperty('--background', data["background"]);
		document.body.style.setProperty('--accent', data["accent"]);
	}
});

if (window.location !== window.parent.location) {
	console.log("page is embedded");
	document.getElementById("local").remove();
} else {
	console.log("page isn't embedded");
	
	document.getElementById("iframe").remove();
	//webkitURL is deprecated but nevertheless
	URL = window.URL || window.webkitURL;
	
	var gumStream; 						//stream from getUserMedia()
	var rec; 							//Recorder.js object
	var input; 							//MediaStreamAudioSourceNode we'll be recording
	
	// shim for AudioContext when it's not avb. 
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext //audio context to help us record
	
	var recordButton = document.getElementById("recordButton");
	var stopButton = document.getElementById("stopButton");
	
	//add events to those 2 buttons
	recordButton.addEventListener("click", startRecording);
	stopButton.addEventListener("click", stopRecording);
}

function openPage() {
	window.open(".#" + user, "_blank", "toolbar=no,scrollbars=no,resizable=no,top=450,left=500,width=550,height=400"); 
}

















function scanLength() {
	checkingLength = 0;
	var d = new Date();
	var startTime = d.getTime() / 1000;
	length = 0;
	lengthFunction = setInterval(function() {
		var d = new Date();
		var current = d.getTime() / 1000;
		length = current - startTime;
		var displaySeconds = Math.floor(length);
		var displayMilli = Math.floor((length - displaySeconds) * 10);
		if (displaySeconds < 10) {
			displaySeconds = "0" + displaySeconds;
		}
		document.getElementById("time").innerHTML = displaySeconds + ":" + displayMilli;
		if (length + 0.01 > maxLength) {
			stopRecording(1);
		}
	}, 0);
	
}

function startRecording() {
	document.getElementById("namegrouplabel").innerHTML = "Enter your name";
	document.getElementById("namegroup").style.display = "none";
	clearTimeout(timeoutRemove);
	document.getElementById("time").innerHTML = "Send a voice message!";
	document.getElementById("msg-time").innerHTML = "";
	sent = 0;
	document.getElementById("upload").style.display = "none";
	document.getElementById("upload").innerHTML = "<b>SEND</b>";
	document.getElementById("msg-record").innerHTML = "Select your microphone";
	document.getElementById("msg-send").innerHTML = "";
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device
		*/
		audioContext = new AudioContext();

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1})

		//start the recording process
		rec.record();
		document.getElementById("msg-record").innerHTML = "Click the microphone to stop recording";
		document.getElementById("time").style.display = "inline";
		scanLength();

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
	});
}

function stopRecording(forced) {
	clearInterval(lengthFunction);
	document.getElementById("namegroup").style.display = "block";
	var displaySeconds = Math.round(length);
	if (displaySeconds == 1) {
		document.getElementById("time").innerHTML = "1 second";
	} else {
		document.getElementById("time").innerHTML = displaySeconds + " seconds";
	}
	
	if (forced == 1) {
		document.getElementById("msg-time").innerHTML = "We finished your recording because you reached the maximum length of";
	}
	
	
	
	
	document.getElementById("msg-record").innerHTML = "Click the microphone to redo recording";
	document.getElementById("msg-send").innerHTML = "Send message!";
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	
	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.getElementById('recording');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	au.src = url;

	//add the new audio element to li
	
	//add the filename to the li

	
	//upload link
	var upload = document.getElementById('upload');
	upload.style.display = "inline-block";
	upload.href="#" + user;
	upload.addEventListener("click", function(event){
		if (sent == 0) {
			if (document.getElementById("name").value == "") {
				document.getElementById("namegrouplabel").innerHTML = "Please enter your name";
			} else {
				sent = 1;
				upload.innerHTML = "<b>SENDING</b>";
				var xhr = new XMLHttpRequest();
				xhr.onload = function(e) {
					if(this.readyState === 4) {
						upload.innerHTML = "<b>SENT!</b>";
						document.getElementById("msg-send").innerHTML = "";
						console.log("Server returned: ", e.target.responseText);
						document.getElementById("msg-record").innerHTML = "Click the microphone to send new recording";
						document.getElementById("namegroup").style.display = "none";
						timeoutRemove = setTimeout(function() {
							document.getElementById("time").innerHTML = "Send a voice message!";
						}, 1500);
					}
				};
				var fd = new FormData();
				fd.append("audio_data", blob, filename);
				xhr.open("POST", server + "/send/send.php?user=" + btoa(unescape(encodeURIComponent(user))) + "&name=" + btoa(unescape(encodeURIComponent(document.getElementById("name").value))), true);
				xhr.send(fd);
			}
		}
	});
}