// Based on http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
exports.getURLParameter = function (urlString, name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(urlString)||[,""])[1].replace(/\+/g, '%20'))||null
}

exports.getSubURI = function (urlString) {
  return (new RegExp('/([^/&\?]+)').exec(urlString)||[,""])[1]||null
}

exports.getenv  = function (keyarg) {
	var system = require('system'),
    env = system.env;
	
	if (env.hasOwnProperty(keyarg) ) {
		return env[keyarg];
	}
	
	return null;
	
}

// Convert a JS object to a query string suitable for an url
// Taken from http://stackoverflow.com/questions/3308846/serialize-object-to-query-string-in-javascript-jquery
exports.jsonToQueryString =  function (json) {
    return '?' + 
        Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

// https://gist.github.com/creationix/7435851
// Joins path segments.  Preserves initial "/" and resolves ".." and "."
// Does not support using ".." to go above/outside the root.
// This means that join("foo", "../../bar") will not resolve to "../bar"
exports.join = function (/* path segments */) {
  // Split the inputs into a list of path commands.
  var parts = [];
  for (var i = 0, l = arguments.length; i < l; i++) {
    parts = parts.concat(arguments[i].split("/"));
  }
  // Interpret the path commands to get the new resolved path.
  var newParts = [];
  for (i = 0, l = parts.length; i < l; i++) {
    var part = parts[i];
    // Remove leading and trailing slashes
    // Also remove "." segments
    if (!part || part === ".") continue;
    // Interpret ".." to pop the last segment
    if (part === "..") newParts.pop();
    // Push new path segments.
    else newParts.push(part);
  }
  // Preserve the initial slash if there was one.
  if (parts[0] === "") newParts.unshift("");
  // Turn back into a single string path.
  return newParts.join("/") || (newParts.length ? "/" : ".");
}

exports.randomString = function (length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
