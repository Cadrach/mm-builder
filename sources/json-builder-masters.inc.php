<?php



//Get list of masters
//https://minionmasters.gamepedia.com/api.php?action=query&format=json&prop=imageinfo%7Cpageimages%7Cimages&titles=Masters&iiprop=timestamp%7Cuser%7Curl
$response = $client->get('',[
    'query'=> [
        'action'=>'query', 'list'=>'categorymembers', 'cmtitle'=>'Category:Masters', 'cmlimit'=>500, 'format'=>'json',

//        'rvprop' => 'content', 'rvsection'=>'0', //get text content
//        'pithumbsize'=>'256', //get thumbnail at 256 height = real size
//        'prop' => 'info|imageinfo',
//        'iiprop' => 'url|size',
//        'iiurlwidth' => '256',
//        'iiurlheight' => '256',
    ]
]);

echo '<pre>';

$list = \GuzzleHttp\json_decode($response->getBody()->getContents(), true)['query']['categorymembers'];

$masters = [];

////Retrieve thumbnail of list
//foreach($list as $page){
//    $response = $client->get('',[
//        'query'=> [
//            'action'=>'query', 'pageids'=> $page['pageid'], 'format'=>'json',
//            'prop' => 'imageinfo',
//            'iiprop' => 'url|size',
//            'iiurlwidth' => '256',
//            'iiurlheight' => '256',
//            'rvprop' => 'content', 'rvsection'=>'0', //get text content
//            'pithumbsize'=>'256', //get thumbnail at 256 height = real size
//        ]
//    ]);
//
//    $data = \GuzzleHttp\json_decode($response->getBody()->getContents(), true)['query'];
//
//    print_r($data);
//    break;
//}

foreach($list as $page){

    $response = $client->get('',[
        'query'=> [
            'action'=>'query', 'pageids'=> $page['pageid'], 'format'=>'json',
            'rvprop' => 'content', 'rvsection'=>'0', //get text content
            'pithumbsize'=>'256', //get thumbnail at 256 height = real size
            'prop' => 'pageimages|revisions|templates'
        ]
    ]);

    $data = \GuzzleHttp\json_decode($response->getBody()->getContents(), true)['query']['pages'][$page['pageid']];

    print_r($data);
    break;
}

print_r($list);

die();