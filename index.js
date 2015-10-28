var fs = require("fs");
var cheerio = require("cheerio");
var clone = require("clone");
var path = require("path");

global.MAKI_PREFIX = "maki-";
var viewPath = "./views";

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
function format(str, data) {
	str.replace(/[{](.+?)[}]/, function (attr) {
		return getValue(data, attr);
	});
	return str;
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
			var layoutSrc = $(withPrefix("layout")).attr("src");
			$(withPrefix("layout")).remove();
			exports.renderFile(layoutSrc, data, function (err, res) {
				callback(null, res);
			}, format($.html(), data));
			return null;
		}
		else {
			return callback(null, format($.html(), data));
		}
	}
	catch (er) {
		return callback(er);
	}
};
exports.renderFile = function (src, data, callback, viewContent) {
	if(src.split(".").length < 1) {
		src += ".maki";
	}
	fs.readFile(path.resolve(viewPath, src), function (err, dat) {
		if(!err) {
			exports.render(dat, data, callback, viewContent);
		}
		else {
			callback(err);
		}
	});
};
exports.__express = exports.renderFile;
exports.init = function (app) {
	app.engine("maki", exports.renderFile);
	viewPath = app.get("views");
};