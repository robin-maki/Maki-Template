var fs = require("fs");
var cheerio = require("cheerio");
var clone = require("clone");
var path = require("path");
var es = require("./lib/html-escape");

var viewPath = "./views";

function getValue(scope, attr) {
	with(scope) {
		var res;
		try {
			res = eval(es.unEscape(attr));
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
	return str.replace(/[{](.+?)[}]/g, function (attr) {
		return es.escape(getValue(data, attr));
	});
}
exports.render = function (str, data, callback, viewContent) {
	try {
		var $ = cheerio.load(str);
		$("maki-if,maki-switch,maki-each").each(function () {
			var th = $(this);
			switch(this.name) {
				case "maki-if":
					if(!getValue(data, th.attr("cond"))) {
						th.remove();
					}
					else {
						th.replaceWith(th.children());
					}
				break;
				case "maki-switch":
					var res = th.find("maki-case[value=" + getValue(data, th.attr("target")) + "]");
					if(res.length) {
						th.replaceWith(res);
					}
					else {
						th.replaceWith(th.find("maki-default").children());
					}
				break;
				case "maki-each":
					var target = getValue(data, th.attr("target"));
					var name = th.attr("value");
					var result = "";
					var targetLength = target.length;
					var copyData = clone(data);
					for(var i = 0;i < targetLength;i++) {
						copyData[name] = target[i];
						exports.render(th.html(), copyData, function (err, res) {
							result += res;
						});
					}
					th.replaceWith(result);
				break;
				// TODO need additional parsing
			}
		});
		if($("maki-view").length) {
			if(viewContent) {
				$("maki-view").replaceWith(viewContent);
			}
			else {
				$("maki-view").remove();
			}
		}
		if($("maki-layout").length) {
			var layoutSrc = $("maki-layout").attr("src");
			$("maki-layout").remove();
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