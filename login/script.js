var server = "//beatsturning.com/games/drift";

function checkCookie() {
	var checkingToken = getCookie("logintoken");
	if (checkingToken != "") {
		$.get(server + "/login/checkToken.php?token=" + btoa(checkingToken), function(data) {
			if (data["success"] == 1) {
				window.location.replace("../control");
			} else {
				document.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
				setTimeout(function() {
					checkCookie();
				}, 30000);
			}
		});
	} else {
		setTimeout(function() {
			checkCookie();
		}, 30000);
	}
}

checkCookie();

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
  return "";
}

function login() {
	if (document.getElementById("user").value != "" && document.getElementById("pass").value != "") {
		var senduser = btoa(unescape(encodeURIComponent(document.getElementById("user").value)));
		var sendpass = btoa(unescape(encodeURIComponent(document.getElementById("pass").value)));
		console.log(senduser);
		console.log(sendpass);
		$.get(server + "/login/login.php?user=" + senduser + "&pass=" + sendpass, function(data) {
			if (data == "invalid") {
				alert("invalid user or pass");
			} else {
				if (data.length != 30) {
					alert("error");
				} else {
					document.cookie = "logintoken=" + data; 
					window.location.replace("../control");
				}
			}
		});
	} else {
		alert("incomplete login");
	}
}
