<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client([
    // Base URI is used with relative requests
    'base_uri' => 'https://minionmasters.gamepedia.com/api.php',
    // You can set any number of default request options.
    'timeout'  => 5.0,
]);

//List of keys we track on cards
$keys = [
    'name',
    //'image',
    'manacost',
    'rarity',
    'type',
    'description',
    'count',
    'targets',
    'health',
    'attackspeed',
    'damage',
    'range',
    'speed',
];

//What we should convert to numbers
$numbers = ['manacost', 'count', 'health', 'speed'];

//Get list of cards
$response = $client->get('',[
    'query'=> [
        'action'=>'query', 'list'=>'categorymembers', 'cmtitle'=>'Category:Cards', 'cmlimit'=>500, 'format'=>'json'
    ]
]);

$list = \GuzzleHttp\json_decode($response->getBody()->getContents(), true)['query']['categorymembers'];

//Loop on each card to get its information
$cards = [];
foreach($list as $page){

    //Create card
    $card = [];

    $response = $client->get('',[
        'query'=> [
            'action'=>'query', 'pageids'=> $page['pageid'], 'format'=>'json',
            'rvprop' => 'content', 'rvsection'=>'0', //get text content
            'pithumbsize'=>'256', //get thumbnail at 256 height = real size
            'prop' => 'pageimages|revisions'
        ]
    ]);

    //Data array
    $data = \GuzzleHttp\json_decode($response->getBody()->getContents(), true)['query']['pages'][$page['pageid']];

    //Content text
    $text = $data['revisions'][0]['*'];

    //
    preg_match_all('/\|(.*)=(.*)/i', $text, $matches);

    //Add common keys
    foreach($matches[1] as $id=>$key){
        if(in_array($key, $keys)){
            if(in_array($key, $numbers)){
                $card[$key] = floatval($matches[2][$id]);
            }
            else{
                $card[$key] = trim($matches[2][$id]);
            }
        }
    }

    //Add specific keys
    $card['pageid'] = $data['pageid'];
    $card['image'] = $data['thumbnail']['source'];

    //Rework some stats
    if(isset($card['damage'])){
        preg_match('/([0-9]+) \(DPS: ([0-9\.]+)\)/i', $card['damage'], $matches);
        if(count($matches)){
            $card['damage'] = floatval($matches[1]);
            $card['dps'] = floatval($matches[2]);
        }
    }
    if(isset($card['attackspeed'])){preg_match('/([0-9\.]+)/i', $card['attackspeed'], $matches);
        if(count($matches)){
            $card['attackspeed'] = floatval($matches[1]);
        }
    }
    if(isset($card['range']) && $card['range'] == 'Melee'){
        $card['range'] = 0;
    }

    //Add to cards list
    $cards[] = $card;

    //Log
    echo "{$card['name']}..........";

}

//Log
echo "\n\n\n" . count($cards) . " DONE";

//Store
file_put_contents('cards.json', json_encode($cards));