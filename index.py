# requires two dependencies:
# sudo apt install python3-flask python3-socks python3-requests
# or pip3 install flask socks requests[socks]

import requests
from flask import Flask, request, url_for, make_response, send_file
from flask_cors import CORS
app = Flask(__name__)
CORS( app )

proxies = {
    'http': 'socks5h://127.0.0.1:9050',
    'https': 'socks5h://127.0.0.1:9050',
}

operators = [
    "http://ngdk7ocdzmz5kzsysa3om6du7ycj2evxp2f2olfkyq37htx3gllwp2yd.onion",
    "http://4t4jxmivv6uqej6xzx2jx3fxh75gtt65v3szjoqmc4ugdlhipzdat6yd.onion",
    "http://otmoonrndnrddqdlhu6b36heunmbyw3cgvadqo2oqeau3656wfv7fwad.onion",
    "http://dqmmejfmtlve7d4ccohk4usriifdtci6xk4wv7igxn2fyaduh25s6did.onion",
    "http://s4usqbcf2pk2xwghdzaggrxd3paiqpvnl4lm2dxp6dec3wbclgbdyiyd.onion",
    "http://alice7bqexhtnkiqhtgkuwgtzzfkishw23ac4sfwpznrwlmnipxlomyd.onion",
    "http://librebazovfmmkyi2jekraxsuso3mh622avuuzqpejixdl5dhuhb4tid.onion",
    # "mmhaqzuirth5rx7gl24d4773lknltjhik57k7ahec5iefktezv4b3uid.onion",
    # "robosats6tkf3eva7x2voqso3a5wcorsnw34jveyxfqi2fu7oyheasid.onion",
];

#call with a command like this one: http://localhost:5000/?endpoint=http://something.onion&pw=whatever

@app.route( "/", methods=[ 'GET', 'POST' ] )
def main_fn():
    from flask import request
    endpoint = request.args.get( "endpoint" )
    path_start = endpoint.find( "/", 9 )
    endpoint_has_path = path_start >= 0
    if ( endpoint_has_path ):
        endpoint_path = endpoint[ endpoint.find( "/", 9 ): ]
        endpoint_without_path = endpoint[ :endpoint.find( "/", 9 ) ]
    else:
        endpoint_path = ""
        endpoint_without_path = endpoint
    endpoint = endpoint_without_path
    print( endpoint )
    if endpoint not in operators:
        return '{"status":"error","message":"invalid endpoint"}'
    port_start = endpoint.find( ":", 6 )
    endpoint_has_port = port_start >= 0
    if ( endpoint_has_port ):
        endpoint_without_port = endpoint[ :endpoint.find( ":", 6 ) ]
    else:
        endpoint_without_port = endpoint
        endpoint = endpoint + ":80"
    endpoint_is_tor_address = ( endpoint_without_port[ -6: ] == ".onion" )
    url = endpoint + endpoint_path
    headers = {}
    print( 'test' )
    print( url, headers, proxies )
    if ( endpoint_is_tor_address ):
        r = requests.get( url, headers=headers, data=None, proxies=proxies, verify=False )
    else:
        r = requests.get( url, headers=headers, data=None )
    return r.text

if __name__ == "__main__":
    app.run( port=5000 )
