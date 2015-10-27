var fs = require("fs");
var cheerio = require("cheerio");
var clone = require("clone");

global.MAKI_PREFIX = "maki-";

function withPrefix(str) {
	return global.MAKI_PREFIX + str;
}
function getValue(scope, attr) {
	with(scope) {
		var res;
		try {
			res = eval(attr);
		}
		catch (er) {
			res = null;
		}
		finally {
			return res;
		}
	}
}
exports.render = function (str, data, callback, viewContent) {
	if(typeof data == "function") {
		callback = data;
		data = undefined;
	}
	try {
		var $ = cheerio.load(str);
		$("[" + withPrefix("render") + "]").each(function () {
			if(!getValue(data, $(this).attr(withPrefix("render")))) {
				$(this).remove();
			}
			else {
				$(this).removeAttr(withPrefix("render"));
			}
		});
		$(withPrefix("repeat")).each(function () {
			var target = getValue(data, $(this).attr("target")),
				name = getValue(data, $(this).attr("value")),
				content = $(this).html(),
				result = "";
			if(typeof target == "Array") {
				target.forEach(function (val) {
					var tempData = clone(data);
					tempData[name] = val;
					exports.render(content, tempData, function (err, res) {
						if(!err) {
							result += res;
						}
					});
				});
			}
			$(this).replaceWith(result);
		});
		$(withPrefix("val")).each(function () {
			$(this).replaceWith(getValue(data, $(this).text()) || "");
		});
		// TODO need additional parsing
		if($(withPrefix("view")).length) {
			if(viewContent) {
				$(withPrefix("view")).replaceWith(viewContent);
			}
			else {
				$(withPrefix("view")).remove();
			}
		}
		if($(withPrefix("layout")).length) {
			exports.renderFile($(withPrefix("layout")).attr("src"), data, function (err, res) {
				callback(null, res);
			}, $.html());
			return null;
		}
		else {
			return callback(null, $.html());
		}
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
exports.init = function (app) {
	app.engine("maki", exports.renderFile);
};