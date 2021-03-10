<?php
	header('Content-Type: application/json');
	$token = base64_decode($_GET["token"]);
	if (isset($_GET["token"]) && $token != "") {
		$accounts = scandir("../settings");
		$i = 0;
		$list = array();
		while ($i < count($accounts)) {
			if (is_file("../settings/" . $accounts[$i])) {
				$list[count($list)] = "../settings/" . $accounts[$i];
			}
			$i++;
		}
		$i = 0;
		$account = "";
		date_default_timezone_set("Pacific/Auckland");
		$stamp = time();
		while($i < count($list)) {
			$meta = json_decode(file_get_contents($list[$i]), true);
			if (in_array($token, $meta["tokens"])) {
				$account = $meta["user"];

				$position = array_search($token, $meta["tokens"]);
				$meta["timestamps"][$position] = $stamp + (30 * 86400);
				$tokenlist = array();
				$stamplist = array();
				$a = 0;
				while ($a < count($meta["tokens"])) {
					if ($meta["timestamps"][$a] > $stamp) {
						$tokenlist[count($tokenlist)] = $meta["tokens"][$a];
						$stamplist[count($stamplist)] = $meta["timestamps"][$a];
					}
					$a++;
				}
				if (count($tokenlist) != count($meta["tokens"])) {
					$meta["tokens"] = $tokenlist;
					$meta["timestamps"] = $stamplist;
					file_put_contents($list[$i], json_encode($meta));
				}
				$i = count($list);
			}
			$i++;
		}
		$response = array();
		if ($account != "") {
			$response["success"] = 1;
			$response["user"] = $account;
		} else {
			$response["success"] = 0;
		}
		
	} else {
		$response = array();
		$response["success"] = 0;
	}
	echo json_encode($response);
?>