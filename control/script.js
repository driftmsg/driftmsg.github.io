var server = "//beatsturning.com/games/drift";

var user;

var iframeSrc = "";

function checkCookie() {
	var checkingToken = getCookie("logintoken");
	if (checkingToken == "") {
		alert("not found");
		//window.location.replace("../login");
	} else {
		$.get(server + "/login/checkToken.php?token=" + btoa(checkingToken), function(data) {
			if (data["success"] == 1) {
				console.log("token accepted");
				iframeSrc = "<iframe src='//" + window.location.hostname + "/send#" + data["user"] + "'></iframe>";
				console.log(iframeSrc);
				setTimeout(function() {
					checkCookie();
				}, 30000);
			} else {
				document.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
				alert("wrong");
				//window.location.replace("../login");
			}
		});
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