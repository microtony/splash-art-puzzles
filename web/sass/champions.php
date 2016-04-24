<?php

$versionurl = "https://ddragon.leagueoflegends.com/realms/na.json";
$versions = json_decode(file_get_contents($versionurl), true);
$cdn = $versions["cdn"];
$version = $versions["dd"];
$language = $versions["l"];
$championurl = "$cdn/$version/data/$language/champion.json";
$champions = json_decode(file_get_contents($championurl), true);
$imageurl = "$cdn/img/champion/splash/";

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
    $lines[] = $skinid . ': "' . $imageurl . $skinid . '.jpg"';
    $skinnames[] = [$skinid, $skin["name"]];
  }
  echo $championid . "\n";
  $championdata[] = ["id" => $championid, "name" => $details["data"][$championid]["name"], "skins" => $skinnames];
}

file_put_contents("sass/skins.scss", "\$skins: (\n  ". implode(",\n  ", $lines) . "\n);");
file_put_contents("js/data.js", "Champion = " . json_encode($championdata));