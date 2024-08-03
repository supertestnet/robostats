# requires two dependencies:
# sudo apt install python3-flask python3-socks
# or pip3 install flask socks

import requests
from flask import Flask, request, url_for, make_response, send_file
app = Flask(__name__)

#make sure your password matches the one in index.js
password=""

proxies = {
    'http': 'socks5h://127.0.0.1:9050',
    'https': 'socks5h://127.0.0.1:9050'
}

#call with a command like this one: http://localhost:5000/?endpoint=http://something.onion&pw=whatever

@app.route( "/", methods=[ 'GET', 'POST' ] )
def main_fn():
    from flask import request
    pw = request.args.get( "pw" )
    if str( pw ) != password:
        print( str( pw ) )
        print( password )
        print( password == str( pw ) )
        return '{"status":"error","message":"wrong password"}'
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
    if ( endpoint_is_tor_address ):
        r = requests.get( url, headers=headers, data=None, proxies=proxies, verify=False )
    else:
        r = requests.get( url, headers=headers, data=None )
    return r.text

if __name__ == "__main__":
    app.run( port=5000 )
