var WebSocket = require( 'ws' ).WebSocket;
var nobleSecp256k1 = require( 'noble-secp256k1' );
var sha256 = nobleSecp256k1.utils.sha256;
var bytesToHex = bytes => bytes.reduce( ( str, byte ) => str + byte.toString( 16 ).padStart( 2, "0" ), "" );

var password = '';
var pubkey = nobleSecp256k1.getPublicKey( password, true ).substring( 2 );
var relay = `wss://junxingwang.org`;

console.log( "pubkey:" );
console.log( pubkey );

var sendEvent = ( event, relay ) => {
    var socket = new WebSocket( relay );
    socket.on( 'open', () => {
        console.log( 0 );
        var sendable = JSON.stringify( [ "EVENT", event ] );
        socket.send( sendable );
        setTimeout( () => {socket.close();}, 1000 );
    });
    return event.id;
}

var prepEvent = async ( privkey, msg, kind, tags ) => {
    var pubkey = nobleSecp256k1.getPublicKey( privkey, true ).substring( 2 );
    if ( !tags ) tags = [];
    var event = {
        "content": msg,
        "created_at": Math.floor( Date.now() / 1000 ),
        "kind": kind,
        "tags": tags,
        "pubkey": pubkey,
    }
    var signedEvent = await getSignedEvent( event, privkey );
    return signedEvent;
}

async function getSignedEvent( event, privateKey ) {
    var eventData = JSON.stringify([
        0,
        event['pubkey'],
        event['created_at'],
        event['kind'],
        event['tags'],
        event['content']
    ]);
    event.id = bytesToHex( await sha256( eventData ) );
    event.sig = await nobleSecp256k1.schnorr.sign( event.id, privateKey );
    return event;
}

var waitSomeSeconds = num => {
    var num = num.toString() + "000";
    num = Number( num );
    return new Promise( resolve => setTimeout( resolve, num ) );
}

var timer = async num_of_seconds => {
    await waitSomeSeconds( num_of_seconds );
    return "times up";
}

var getOperatorInfo = async ( name, addy ) => {
    var url = `http://${addy}.onion/api/info/`;
    if ( url.includes( ".onion/" ) ) url = `http://127.0.0.1:5000/?endpoint=${url}&pw=${password}`;
    var info_1 = await fetch( url );
    var info_2 = await info_1.json();
    info_2[ "operator_name" ] = name;
    return info_2;
}

var getIndexOfOperator = ( name, operators ) => {
    var index_i_seek = -1;
    operators.forEach( ( item, index ) => {
        if ( item[ 0 ] === name ) index_i_seek = index;
    });
    return index_i_seek;
}

var operators = [
    [ "the_big_lake", "4t4jxmivv6uqej6xzx2jx3fxh75gtt65v3szjoqmc4ugdlhipzdat6yd" ],
    [ "bitcoin_veneto", "mmhaqzuirth5rx7gl24d4773lknltjhik57k7ahec5iefktezv4b3uid" ],
    [ "satstralia", "satstraoq35jffvkgpfoqld32nzw2siuvowanruindbfojowpwsjdgad" ],
    [ "temple_of_sats", "ngdk7ocdzmz5kzsysa3om6du7ycj2evxp2f2olfkyq37htx3gllwp2yd" ],
    // [ "experimental", "robosats6tkf3eva7x2voqso3a5wcorsnw34jveyxfqi2fu7oyheasid" ],
];

var sendInfo = async info => {
    var event = await prepEvent( password, info, 1 );
    console.log( event, relay );
    var id = await sendEvent( event, relay );
}

var init = async () => {
    var waiting_for = operators.length;
    var time_is_up = null;
    var info = [];
    var inner_operators = JSON.parse( JSON.stringify( operators ) );
    var i; for ( i=0; i<waiting_for; i++ ) {
        if ( time_is_up ) return;
        var promises = [];
        var j; for ( j=0; j<inner_operators.length; j++ ) {
            var [ name, addy ] = inner_operators[ j ];
            promises.push( getOperatorInfo( name, addy ) );
        }
        promises.push( timer( 15 ) );
        var data = await Promise.any( promises );
        if ( data === "times up" ) {
            var sum = 0;
            var cum = 0;
            var buy = 0;
            var sel = 0;
            info.forEach( item => {
                sum = sum + item[ 1 ].last_day_volume;
                cum = cum + item[ 1 ].lifetime_volume;
                buy = buy + item[ 1 ].num_public_buy_orders;
                sel = sel + item[ 1 ].num_public_sell_orders;
            });
            sum = Number( sum.toFixed( 8 ) );
            cum = Number( cum.toFixed( 8 ) );
            console.log( "here you go 2:", sum, cum, buy, sel );
            sendInfo( JSON.stringify({sum, cum, buy, sel}) );
            await waitSomeSeconds( 86400 );
            return init();
        }
        var idx = getIndexOfOperator( data[ "operator_name" ], inner_operators );
        inner_operators.splice( idx, 1 );
        console.log( `got a response from ${data[ "operator_name" ]}` );
        info.push( [ data[ "operator_name" ], data ] );
    }
    var sum = 0;
    var cum = 0;
    var buy = 0;
    var sel = 0;
    info.forEach( item => {
        sum = sum + item[ 1 ].last_day_volume;
        cum = cum + item[ 1 ].lifetime_volume;
        buy = buy + item[ 1 ].num_public_buy_orders;
        sel = sel + item[ 1 ].num_public_sell_orders;
    });
    sum = Number( sum.toFixed( 8 ) );
    cum = Number( cum.toFixed( 8 ) );
    console.log( "here you go 1:", sum, cum, buy, sel );
    sendInfo( JSON.stringify({sum, cum, buy, sel}) );
    await waitSomeSeconds( 86400 );
    return init();
}
init();
