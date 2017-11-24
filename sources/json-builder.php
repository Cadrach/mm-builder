<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\FileCookieJar;
use Tuna\CloudflareMiddleware;

//Create Client
$client = new Client([
    // Base URI is used with relative requests
    'base_uri' => 'https://minionmasters.gamepedia.com/api.php',
    // You can set any number of default request options.
    'timeout'  => 15.0,
    'cookies' => new FileCookieJar('cookies.txt'),
]);

$client->getConfig('handler')->push(CloudflareMiddleware::create());

include 'json-builder-masters.inc.php';

//List of keys we track on cards
$keys = [
    'name',
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
    'duration',
    'delay',
    'radius',
];

//What we should convert to numbers
$numbers = ['iD', 'manacost', 'count', 'health', 'speed', 'attackspeed', 'damage', 'range', 'dps'];
$booleans = ['isRanged', 'flying', 'hitsFlying', 'attackOnlyStationary', 'isAOE'];

/**
 * FIRST WE READ ORIGINAL CARDS INFORMATION
 */
//Original file reading
$officialCards = \GuzzleHttp\json_decode(file_get_contents('cardsOfficial.json'), true);

//Proper field typing
foreach($officialCards as &$card){

    //Fix case for key fields
    foreach($card as $key=>$value){
        if($key != strtolower($key) && in_array(strtolower($key), $keys)){
            $card[strtolower($key)] = $value;
            unset($card[$key]);
        }
    }

    //Fix numbers
    foreach($numbers as $field){
        if(isset($card[$field])){
            $card[$field] = floatval($card[$field]);
        }
    }

    //Fix booleans
    foreach($booleans as $field){
        if(isset($card[$field])){
            $card[$field] = $card[$field] !== 'False';
        }
    }
    if(isset($card['count']) && $card['count'] === 0){
        $card['count'] = 1;
    }

    //Fix Spell type
    if(strpos($card['type'], 'Spell')){
        $card['type'] = 'Spell';
    }

    //Fix "isAOE"
    if(isset($card['radius']) && $card['radius']>0){
        $card['isAOE'] = true;
    }

}

$officialCards = collect($officialCards)->keyBy(function($card){return strtolower($card['name']);})->toArray();

//var_dump($cards); die();

/**
 * NOW WE UPDATE FROM THE WIKI TO AT LEAST GET IMAGES
 */
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

    //Analyse content
    preg_match_all('/\|(.*)=(.*)/i', $text, $matches);

    //Associate matches
    $fieldsFound = [];
    foreach($matches[1] as $id=>$key){
        if(in_array($key, $keys)){
            if(in_array($key, $numbers)){
                $fieldsFound[$key] = floatval($matches[2][$id]);
            }
            else{
                $fieldsFound[$key] = trim($matches[2][$id]);
            }
        }
    }

    //Check card existence in official cards
    $name = strtolower($fieldsFound['name']);
    if( ! isset($officialCards[$name])){
        continue;
        var_dump($fieldsFound);
        throw new \Exception('Unknow card: ' . $name);
    }

    //Create card
    $card = $officialCards[$name];

    //Add specific keys
    $card['pageid'] = $data['pageid'];
    $card['image'] = $data['thumbnail']['source'];
    if(isset($fieldsFound['targets'])) $card['targets'] = $fieldsFound['targets'];

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