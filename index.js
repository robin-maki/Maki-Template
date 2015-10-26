var fs = require("fs");
var cheerio = require("cheerio");

global.MAKI_PREFIX = "maki-";

function withPrefix(str) {
	return global.MAKI_PREFIX + str;
}
exports.render = function (str, data, callback) {
	if(typeof data == "function") {
		callback = data;
		data = undefined;
	}
	try {
		var $ = cheerio.load(str);
		$("[" + withPrefix("render") + "]").each(function (i, elem) {
			if(!eval.call(data, elem.attr("cond"))) {
				elem.remove();
			}
			else {
				elem.removeAttr("cond");
			}
		});
		// TODO need additional parsing
		return callback(null, $.html());
	}
	catch (er) {
		return callback(er);
	}
};
exports.renderFile = function (path, data, callback) {
	fs.readFile(path, function (err, dat) {
		if(!err) {
			exports.render(dat, data, callback);
		}
		else {
			callback(err);
		}
	});
};
exports.__express = exports.renderFile;