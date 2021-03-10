<?php
	if (isset($_GET["user"])) {
		$user = base64_decode($_GET["user"]);
		if (is_file("../settings/" . $user . ".json")) {
			$meta = json_decode(file_get_contents("../settings/" . $user . ".json"), true);
			header('Content-Type: application/json');
			echo json_encode($meta["color"]);
		} else {
			echo "invalid";
		}
	} else {
		echo "unset";
	}
?>