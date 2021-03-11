<?php
print_r($_FILES); //this will print out the received name, temp name, type, size, etc.


$size = $_FILES['audio_data']['size']; //the size in bytes
$input = $_FILES['audio_data']['tmp_name']; //temporary name that PHP gave to the uploaded file

$user = base64_decode($_GET["user"]);

if (is_file("../settings/" . $user . ".json")) {
	$meta = json_decode(file_get_contents("../settings/" . $user . ".json"), true);
	date_default_timezone_set($meta["timezone"]);
	$ftpname = "Drift " . date("Y.m.d H.i.s");
	if (isset($_GET["name"])) {
		$ftpname = $ftpname . " - " . filter_filename($_GET["name"]);
	}
	//$ftpname = $ftpname . ".wav";
	$tempname = generateRandomString();
	while (is_file("./upload/" . $tempname . ".wav")) {
		$tempname = generateRandomString();
	}
	$tempname = "./upload/" . $tempname . ".wav";

	$ftpConn = ftp_connect($meta["ftp"]["host"]);
	$login = ftp_login($ftpConn,$meta["ftp"]["user"],$meta["ftp"]["pass"]);

	if ((!$ftpConn) || (!$login)) {
 		echo 'FTP connection has failed!';
	} else {
 		echo 'FTP connection was a success.';
 		move_uploaded_file($input, $tempname);
		echo $tempname;
		echo $meta["ftp"]["directory"] . $ftpname . ".wav";
		if (ftp_put($ftpConn, $meta["ftp"]["directory"] . $ftpname . ".wav", $tempname, FTP_BINARY)) {
 			echo "successfully uploaded";
		} else {
 			echo "There was a problem while uploading";
		}
		unlink($tempname);
	}
	ftp_close($ftpConn);
} else {
	echo "fail";
}




function generateRandomString($length = 8) {
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