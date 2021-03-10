<?php

	$user = base64_decode($_GET["user"]);
	$pass = base64_decode($_GET["pass"]);


	if (isset($_GET["user"]) && isset($_GET["pass"])) {
		date_default_timezone_set("Pacific/Auckland");
		$filename = filter_filename($user);
		if (is_file("../settings/" . $filename . ".json")) {
			$data = json_decode(file_get_contents("../settings/" . $filename . ".json"), true);
			if ($data["user"] == $user && $data["pass"] == $pass) {
				$files = scandir("../settings");
				$i = 0;
				$accounts = array();
				while ($i < count($files)) {
					if (is_file("../settings/" . $files[$i])) {
						$accounts[count($accounts)] = "../settings/" . $files[$i];
					}
					$i++;
				}
				$i = 0;
				$tokens = array();
				while ($i < count($accounts)) {
					$meta = json_decode(file_get_contents($accounts[$i]), true);
					$a = 0;
					while ($a < count($meta["tokens"])) {
						$tokens[count($tokens)] = $meta["tokens"][$a];
						$a++;
					}
					$i++;
				}
				$token = generateRandomString();
				while (in_array($token, $tokens)) {
					$token = generateRandomString();
				}
				echo $token;
				date_default_timezone_set("Pacific/Auckland");
				$data["tokens"][count($data["tokens"])] = $token;
				$data["timestamps"][count($data["tokens"]) - 1] = time() + (30 * 86400);
				file_put_contents("../settings/" . $filename . ".json", json_encode($data));
			} else {
				die("invalid");
			}
		} else {
			die("invalid");
		}
	}






function generateRandomString($length = 30) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function beautify_filename($filename) {
	// reduce consecutive characters
	$filename = preg_replace(array(
		// "file   name.zip" becomes "file-name.zip"
		'/ +/',
		// "file___name.zip" becomes "file-name.zip"
		'/_+/',
		// "file---name.zip" becomes "file-name.zip"
		'/-+/'
	), '-', $filename);
	$filename = preg_replace(array(
		// "file--.--.-.--name.zip" becomes "file.name.zip"
		'/-*\.-*/',
		// "file...name..zip" becomes "file.name.zip"
		'/\.{2,}/'
	), '.', $filename);
	// lowercase for windows/unix interoperability
	// ".file-name.-" becomes "file-name"
	$filename = trim($filename, '.-');
	return $filename;
}
	
function filter_filename($filename, $beautify=true) {
	// sanitize filename
	$filename = preg_replace(
		'~
		[<>:"/\\|?*]|            # file system reserved https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
		[\x00-\x1F]|             # control characters http://msdn.microsoft.com/en-us/library/windows/desktop/aa365247%28v=vs.85%29.aspx
		[\x7F\xA0\xAD]|          # non-printing characters DEL, NO-BREAK SPACE, SOFT HYPHEN
		[#\[\]@!$&\'()+,;=]|     # URI reserved https://tools.ietf.org/html/rfc3986#section-2.2
		[{}^\~`]                 # URL unsafe characters https://www.ietf.org/rfc/rfc1738.txt
		~x',
		'-', $filename);
	// avoids ".", ".." or ".hiddenFiles"
	$filename = ltrim($filename, '.-');
	// optional beautification
	if ($beautify) $filename = beautify_filename($filename);
	// maximize filename length to 255 bytes http://serverfault.com/a/9548/44086
	$ext = pathinfo($filename, PATHINFO_EXTENSION);
	return $filename;
}
?>