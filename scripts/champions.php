<?php

$versionurl = "https://ddragon.leagueoflegends.com/realms/na.json";
$versions = json_decode(file_get_contents($versionurl), true);
$cdn = $versions["cdn"];
$version = $versions["dd"];
$language = $versions["l"];
$championurl = "$cdn/$version/data/$language/champion.json";
$champions = json_decode(file_get_contents($championurl), true);

$lines = [];
$championdata = [];
foreach ($champions["data"] as $champion) {
  $championid = $champion["id"];
  $detailurl = "$cdn/$version/data/$language/champion/$championid.json";
  $details = json_decode(file_get_contents($detailurl), true);
  $skins = $details["data"][$championid]["skins"];
  $skinnames = [];
  foreach ($skins as $skin) {
    $skinid = $championid . "_" . $skin["num"];
    $lines[] = $skinid . ': "' . "$cdn/img/champion/splash/" . $skinid . '.jpg"';
    $reqlevel = 0;
    if ($skin["num"] > 0) {
      $reqlevel = hexdec(substr(md5($skinid), 0, 6)) % 7 + 1;
    }
    $skinnames[] = [$skinid, $skin["name"], $reqlevel];
  }
  echo $championid . "\n";
  $championdata[$championid] = [
    "id" => $championid,
    "key" => 0 + $details["data"][$championid]["key"],
    "name" => $details["data"][$championid]["name"],
    "skins" => $skinnames,
    "icon" => "$cdn/$version/img/champion/" . $championid . '.png'];
}

file_put_contents("../public/sass/skins.scss", "\$skins: (\n  ". implode(",\n  ", $lines) . "\n);");
file_put_contents("../champions.js", "module.exports = " . json_encode($championdata));
file_put_contents("../public/javascripts/champions.js", "Champions = " . json_encode($championdata));
