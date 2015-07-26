// Beautify js 
xtk.load('chrome://beautifyjs/content/js/lib/beautify.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-css.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-html.js');
xtk.load('chrome://beautifyjs/content/js/test/sanitytest.js');
xtk.load('chrome://beautifyjs/content/js/test/beautify-javascript-tests.js');
xtk.load('chrome://beautifyjs/content/js/test/beautify-css-tests.js');
xtk.load('chrome://beautifyjs/content/js/test/beautify-html-tests.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/javascriptobfuscator_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/urlencode_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/p_a_c_k_e_r_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/myobfuscate_unpacker.js');

/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.beautifyjs) === 'undefined') extensions.beautifyjs = {
	version: '1.0'
};

(function() {
	var self = this,
		prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService).getBranch("extensions.beautifyjs.");

	if (!('beautifyjs' in ko)) ko.extensions = {};
	var myExt = "beautify-js@babobski.com";
	if (!(myExt in ko.extensions)) ko.extensions[myExt] = {};
	if (!('myapp' in ko.extensions[myExt])) ko.extensions[myExt].myapp = {};
	var beautifyData = ko.extensions[myExt].myapp;

	var the = {
		beautify_in_progress: false
	};

	this.unpacker_filter = function(source) {
		var trailing_comments = '',
			comment = '',
			unpacked = '',
			found = false;

		do {
			found = false;
			if (/^\s*\/\*/.test(source)) {
				found = true;
				comment = source.substr(0, source.indexOf('*/') + 2);
				source = source.substr(comment.length).replace(/^\s+/, '');
				trailing_comments += comment + "\n";
			} else if (/^\s*\/\//.test(source)) {
				found = true;
				comment = source.match(/^\s*\/\/.*/)[0];
				source = source.substr(comment.length).replace(/^\s+/, '');
				trailing_comments += comment + "\n";
			}
		} while (found);

		var unpackers = [P_A_C_K_E_R, Urlencoded, MyObfuscate];
		for (var i = 0; i < unpackers.length; i++) {
			if (unpackers[i].detect(source)) {
				unpacked = unpackers[i].unpack(source);
				if (unpacked != source) {
					source = self.unpacker_filter(unpacked);
				}
			}
		}

		return trailing_comments + source;
	}

	this.beautify_HTML = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			text = scimoz.selText,
			source = text,
			output,
			opts = {};

		if (source.length > 0) {
			the.beautify_in_progress = true;

			opts.indent_size = prefs.getIntPref('indent');
			opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
			opts.max_preserve_newlines = prefs.getIntPref('maxPreserveNewlines');
			opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
			opts.keep_array_indentation = prefs.getBoolPref('indentation');
			opts.break_chained_methods = prefs.getBoolPref('breakLine');
			opts.indent_scripts = prefs.getCharPref('indentScripts');
			opts.brace_style = prefs.getCharPref('braceStyle');
			opts.space_before_conditional = prefs.getBoolPref('spaceConditional');
			opts.unescape_strings = prefs.getBoolPref('unescapePrint');
			opts.jslint_happy = prefs.getBoolPref('lintHappy');
			opts.end_with_newline = prefs.getBoolPref('newLine');
			opts.wrap_line_length = prefs.getIntPref('wrapLineLength');
			opts.indent_inner_html = prefs.getBoolPref('IndentHeadBody');
			opts.comma_first = prefs.getBoolPref('commaFirst');
			opts.e4x = prefs.getBoolPref('e4x');

			output = html_beautify(source, opts);
			the.beautify_in_progress = false;

			scimoz.replaceSel(output);
		} else {
			this._notifcation('Please make a selection first', true);
		}
	}

	this.beautify_CSS = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			text = scimoz.selText,
			source = text,
			output,
			opts = {};

		if (source.length > 0) {
			the.beautify_in_progress = true;

			opts.indent_size = prefs.getIntPref('indent');
			opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
			opts.max_preserve_newlines = prefs.getIntPref('maxPreserveNewlines');
			opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
			opts.keep_array_indentation = prefs.getBoolPref('indentation');
			opts.break_chained_methods = prefs.getBoolPref('breakLine');
			opts.indent_scripts = prefs.getCharPref('indentScripts');
			opts.brace_style = prefs.getCharPref('braceStyle');
			opts.space_before_conditional = prefs.getBoolPref('spaceConditional');
			opts.unescape_strings = prefs.getBoolPref('unescapePrint');
			opts.jslint_happy = prefs.getBoolPref('lintHappy');
			opts.end_with_newline = prefs.getBoolPref('newLine');
			opts.wrap_line_length = prefs.getIntPref('wrapLineLength');
			opts.indent_inner_html = prefs.getBoolPref('IndentHeadBody');
			opts.comma_first = prefs.getBoolPref('commaFirst');
			opts.e4x = prefs.getBoolPref('e4x');

			output = css_beautify(source, opts);
			the.beautify_in_progress = false;

			scimoz.replaceSel(output);
		} else {
			this._notifcation('Please make a selection first', true);
		}
	}

	this.beautify_JS = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			text = scimoz.selText,
			source = text,
			output,
			opts = {};

		if (source.length > 0) {
			the.beautify_in_progress = true;

			opts.indent_size = prefs.getIntPref('indent');
			opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
			opts.max_preserve_newlines = prefs.getIntPref('maxPreserveNewlines');
			opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
			opts.keep_array_indentation = prefs.getBoolPref('indentation');
			opts.break_chained_methods = prefs.getBoolPref('breakLine');
			opts.indent_scripts = prefs.getCharPref('indentScripts');
			opts.brace_style = prefs.getCharPref('braceStyle');
			opts.space_before_conditional = prefs.getBoolPref('spaceConditional');
			opts.unescape_strings = prefs.getBoolPref('unescapePrint');
			opts.jslint_happy = prefs.getBoolPref('lintHappy');
			opts.end_with_newline = prefs.getBoolPref('newLine');
			opts.wrap_line_length = prefs.getIntPref('wrapLineLength');
			opts.indent_inner_html = prefs.getBoolPref('IndentHeadBody');
			opts.comma_first = prefs.getBoolPref('commaFirst');
			opts.e4x = prefs.getBoolPref('e4x');

			if (prefs.getBoolPref('packers')) {
				source = self.unpacker_filter(source);
			}
			output = js_beautify(source, opts);
			the.beautify_in_progress = false;

			scimoz.replaceSel(output);
		} else {
			this._notifcation('Please make a selection first', true);
		}
	}

	this.beautify = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			text = scimoz.selText,
			source = text,
			output,
			opts = {};

		if (source.length > 0) {
			the.beautify_in_progress = true;
			opts.indent_size = prefs.getIntPref('indent');
			opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
			opts.max_preserve_newlines = prefs.getIntPref('maxPreserveNewlines');
			opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
			opts.keep_array_indentation = prefs.getBoolPref('indentation');
			opts.break_chained_methods = prefs.getBoolPref('breakLine');
			opts.indent_scripts = prefs.getCharPref('indentScripts');
			opts.brace_style = prefs.getCharPref('braceStyle');
			opts.space_before_conditional = prefs.getBoolPref('spaceConditional');
			opts.unescape_strings = prefs.getBoolPref('unescapePrint');
			opts.jslint_happy = prefs.getBoolPref('lintHappy');
			opts.end_with_newline = prefs.getBoolPref('newLine');
			opts.wrap_line_length = prefs.getIntPref('wrapLineLength');
			opts.indent_inner_html = prefs.getBoolPref('IndentHeadBody');
			opts.comma_first = prefs.getBoolPref('commaFirst');
			opts.e4x = prefs.getBoolPref('e4x');

			if (self.looks_like_html(source)) {
				output = html_beautify(source, opts);
			} else {
				if (prefs.getBoolPref('packers')) {
					source = self.unpacker_filter(source);
				}
				output = js_beautify(source, opts);
			}

			the.beautify_in_progress = false;

			scimoz.replaceSel(output);
		} else {
			this._notifcation('Please make a selection first', true);
		}
	}

	this.looks_like_html = function(source) {
		var trimmed = source.replace(/^[ \t\n\r]+/, '');
		var comment_mark = '<' + '!-' + '-';
		return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
	}

	this._notifcation = function($message, error) {
		$message = $message || false;
		error = error || false;

		var icon = error ? 'chrome://beautifyjs/content/beautifyjs-error-icon.png' : 'chrome://beautifyjs/content/beautifyjs-icon.png';
		if (!("Notification" in window)) {
			alert("This browser does not support system notifications");
		} else if (Notification.permission === "granted") {
			var options = {
				body: $message,
				icon: icon
			}
			var n = new Notification('Beautify js', options);
			setTimeout(n.close.bind(n), 5000);
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function(permission) {
				if (permission === "granted") {
					var options = {
						body: $message,
						icon: icon
					}
					var n = new Notification('Beautify js', options);
					setTimeout(n.close.bind(n), 5000);
				}
			});
		}
	}

}).apply(extensions.beautifyjs);