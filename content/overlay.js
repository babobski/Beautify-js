// Beautify js 
xtk.load('chrome://beautifyjs/content/js/lib/beautify.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-css.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-html.js');
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
		notify	= require("notify/notify"),
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
			
			opts.eol = self.test_eol(source);
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
			notify.send(
				'Beautify js: Please make a selection first',
				'tools'
			);
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
			
			opts.eol = self.test_eol(source);
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
			notify.send(
				'Beautify js: Please make a selection first',
				'tools'
			);
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
			
			opts.eol = self.test_eol(source);
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
			notify.send(
				'Beautify js: Please make a selection first',
				'tools'
			);
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
			
			opts.eol = self.test_eol(source);
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
				notify.send(
					'Beautify js: Beutify HTML',
					'tools'
				);
			} else if(self.looks_like_css(source)) {
				output = css_beautify(source, opts);
				notify.send(
					'Beautify js: Beutify CSS',
					'tools'
				);
			} else {
				if (prefs.getBoolPref('packers')) {
					source = self.unpacker_filter(source);
				}
				output = js_beautify(source, opts);
				notify.send(
					'Beautify js: Beutify JS',
					'tools'
				);
			}

			the.beautify_in_progress = false;

			scimoz.replaceSel(output);
		} else {
			notify.send(
				'Beautify js: Please make a selection first',
				'tools'
			);
		}
	}

	this.looks_like_html = function(source) {
		var trimmed = source.replace(/^[ \t\n\r]+/, '');
		var comment_mark = '<' + '!-' + '-';
		return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
	}
	
	this.looks_like_css = function(source) {
		var cleanSource = source.replace(/(\/\*[^\*]+\*\/|\/.[^\s]+\/)/g,''); //remove reggex and comments
		return /[a-z0-9%)](\s{|{)/gi.test(cleanSource) && /(\sif(\s|\()|(}|\s)else(\s|{)|[^#.-]function|this\.)/gi.test(cleanSource) == false;
	}
	
	this.test_eol = function(source){
		var cleanSource = source.replace(/(\/\*[^\*]+\*\/|\/.[^\s]+\/)/g, ''); //remove reggex and comments
		if (/\r\n/i.test(cleanSource)) {
			return '\r\n';
		} else if (/\r/i.test(cleanSource) && /\n/i.test(cleanSource) == false) {
			return '\r';
		} else if (/\n/i.test(cleanSource) && /\r/i.test(cleanSource) == false) {
			return '\n';
		}
		return prefs.getCharPref('eol');
	}

}).apply(extensions.beautifyjs);
