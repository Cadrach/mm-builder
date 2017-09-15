<?php
require 'vendor/autoload.php';

use Intervention\Image\ImageManagerStatic as Image;

$cards = json_decode(file_get_contents('cards.json'), true);

foreach($cards as $card){
    $image = Image::make($card['image']);
    $image->save('../app/images/cards/' . $card['iD'] . '.png');
    $image->widen(61);
    $image->save('../app/images/cards/' . $card['iD'] . 'x61.png');
}