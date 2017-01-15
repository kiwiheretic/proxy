var port, server, service,
    system = require('system'),
	fs = require('fs'),
	webpage = require('webpage'),
//    cheerio = require('./cheerio.js'),
    optparse = require('./optparse-js/lib/optparse.js'),
    sprintfjs = require('./sprintf.js/src/sprintf.js'),
    sprintf = sprintfjs.sprintf,
	utils = require('./util-fns');


var page = webpage.create();

// All three switch options are need but the first may be an empty string
var switches = [
    ['-p', '--port PORT', 'specify listening port'],
    ['-h', '--help', 'Shows help sections']
];


// Create a new OptionParser.
var parser = new optparse.OptionParser(switches);

// Hook the help option. The callback will be executed when the OptionParser 
// hits the switch `-h` or `--help`. 
parser.on('help', function() {
    console.log(parser.banner);
    console.log(parser.options_title);
    for (var i=0; i<switches.length; i++) {
        var shortopt = switches[i][0];
        var longopt = switches[i][1];
        var desc = switches[i][2];
        var line = sprintf("%-10s %-10s %-s", shortopt, longopt, desc);
        console.log(line);
    }

    console.log('Usage: phantomjs '+system.args[0]+' <[ipaddress:]portnumber>');
    phantom.exit(0);
});

parser.on('port', function(opt, value) {
    port = parseInt(value);
    console.log(opt + "=" + port.toString());
});


parser.parse(system.args);

if (typeof port == 'undefined') {
    console.log('--port is required')
    phantom.exit()
}


var env_test = utils.getenv('PRXY_OUTPUT_DIR');

if (env_test == null) {
	console.log('PRXY_OUTPUT_DIR not set');
	phantom.exit();
	
}
	
	
function run_server(port) {
    server = require('webserver').create();
	page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36';
    service = server.listen(port, function (request, response) {

        console.log('Request at ' + new Date());
        //console.log(JSON.stringify(request, null, 4));
		
        response.statusCode = 200;
        response.headers = {
            'Cache': 'no-cache',
            'Content-Type': 'text/html'
        };
		
		var subURI = utils.getSubURI(request.url);
		// check if fn_[subURI] exists as a function then call italics
		if(typeof this["fn_"+subURI] == "function") {
			console.log('calling fn_'+subURI);
		  this["fn_"+subURI](request, response); //it exists, call it
		} else {
			standard_response(request, response);
		}
    });

    if (service) {
        console.log('Web Proxy server running on port ' + port);
    } else {
        console.log('Error: Could not create web proxy server listening on port ' + port);
        phantom.exit();
    }
}


function standard_response(request, response) {
    if (request.method == 'GET') {
        var contents = fs.read('index.html', {mode:'r'} );
        response.write(contents);
        response.close();
    } else if (request.method == 'POST') {
        var url = request.post.url;
        console.log("POST = " + JSON.stringify(request.post))
        console.log('url = '+ url);
        page.open(url, function(status) {
            console.log('Status: ' + status);
            if (status == "success") {
                o = {content:page.content};
                respdata = JSON.stringify(o);
                response.write(respdata);
                response.setHeader('Content-Type', 'application/json');
                response.close();
            } else {
                response.write("Page open via proxy failed");
                response.close();
            }
        });
    }
}

function fn_json(request, response) {
	response.write('<html>');
	response.write('<head>');
	response.write('<title>My Proxy!</title>');
	response.write('</head>');
	response.write('<body>');
	response.write('<p>This is from PhantomJS web server.</p>');
	response.write('<p>url param = ' + utils.getURLParameter(request.url, 'url') + '</p>');
	response.write('<p>subURI param = ' + utils.getSubURI(request.url) + '</p>');
	response.write('<p>Request data:</p>');
	response.write('<pre>');
	response.write(JSON.stringify(request, null, 4));
	response.write('</pre>');
	response.write('</body>');
	response.write('</html>');
	response.close();
	
	
}

function fn_render(request, response) {
	console.log('fn_render ' + request.url);
}

function fn_png(request, response) {
	console.log('fn_png ' + request.url);
	var url = utils.getURLParameter(request.url, 'url');
	console.log('fn_png, url = '+url);
	page.open(url, function(status) {
	  console.log("Status: " + status);
	  if(status === "success") {
		var output_dir = utils.getenv('PRXY_OUTPUT_DIR');
		var image_filename = 'rendered_page.png';
		var output_file = utils.join(output_dir, image_filename);
		page.render(output_file);
		console.log("Page rendered");
		var json_data = {filename: output_file};
		var json_s = JSON.stringify(json_data, null, 4);
		response.headers = {"Content-Type":"application/json",
							"Content-Length":json_s.length}
		response.statusCode = 200;
		
		
		response.write(json_s);
		response.close();			
	  } else {
		var json_data = {'result':'fail'}
		var json_s = JSON.stringify(json_data, null, 4);
		
		response.headers = {"Content-Type":"application/json",
							"Content-Length":json_s.length}
		response.statusCode = 200;
		
		
		response.write(json_s);
		response.close();			  
	  }
	});	
	
}

function fn_html(request, response) {
	var url = utils.getURLParameter(request.url, 'url');
	var page_responses = [];
	
	page.onResourceReceived = function(response) {
	  page_responses.push(response);
	};
		
	page.open(url, function(status) {
	  console.log("Status: " + status);
	  if(status === "success") {
		var output_dir = utils.getenv('PRXY_OUTPUT_DIR');
        var timeInMs = Date.now();
		var output_file = utils.join(output_dir, 'page_'+timeInMs.toString()+'.html');
		var json = {'html_file':output_file,
                    'request': request,
					'responses':page_responses};
		var json_s = JSON.stringify(json, null, 4);
		
		response.headers = {"Content-Type":"application/json",
					"Content-Length":json_s.length};
		response.statusCode = 200;
		response.write(json_s);
		response.close();	
		

		fs.write(output_file, page.content, 'w');		
	  }
	});	
	
}

function fn_random(request, response) {
	var json_data = {'random':utils.randomString(10)};
	response.headers = {"Content-Type":"application/json"};
	response.statusCode = 200;
	response.write(JSON.stringify(json_data, null, 4));
	response.close();
	
}

run_server(port);
