<?php

//Get list of masters
$response = $client->get('',[
    'query'=> [
        'action'=>'parse', 'format'=>'json',
        'page' => 'Masters',
        'prop' => 'wikitext|images|text'
    ]
]);

$mastersPage = \GuzzleHttp\json_decode($response->getBody()->getContents(), true)['parse'];
$text = $mastersPage['wikitext']['*'];
$html = $mastersPage['text']['*'];

//Look for templates in code
preg_match_all('/{{MP icon\|(.*?)\|(.*?)}}/', $text, $matches);

//Loop on each template
foreach($matches[2] as $name){
    //Find image in parsed HTML
    preg_match('/<img.*?alt="'.$name.'".*?src="(.*?)"/i', $html, $match);
    //Create Master
    $masters[] = [
        'id' => strtolower(preg_replace('/[^a-zA-Z.]+/', '', $name)),
        'name' => $name,
        'image' => $match[1],
    ];
}

//Save to file
file_put_contents('masters.json', json_encode($masters));