// Beautify js 
xtk.load('chrome://beautifyjs/content/js/lib/beautify.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-css.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-html.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/javascriptobfuscator_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/urlencode_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/p_a_c_k_e_r_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/unpackers/myobfuscate_unpacker.js');
xtk.load('chrome://beautifyjs/content/js/lib/jsmin.js');
xtk.load('chrome://beautifyjs/content/js/lib/cssmin.js');

/**
 * Namespaces
 */
if (typeof(extensions) === 'undefined') extensions = {};
if (typeof(extensions.beautifyjs) === 'undefined') extensions.beautifyjs = {
	version: '3.2'
};

(function() {
	var self = this,
		notify = require("notify/notify"),
		prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService).getBranch("extensions.beautifyjs.");

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
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			buffer = false,
			output,
			opts = {};

		the.beautify_in_progress = true;
		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}

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

		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}
	}

	this.beautify_CSS = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			buffer = false,
			output,
			opts = {};

		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}

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

		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}

	}

	this.beautify_JS = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			buffer = false,
			output,
			opts = {};


		the.beautify_in_progress = true;
		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}

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

		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}
	}

	this.beautify = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			buffer = false,
			output,
			opts = {};


		the.beautify_in_progress = true;
		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}

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
		} else if (self.looks_like_css(source)) {
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

		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}
	}
	
	this.jsMin = function() {
		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			buffer = false,
			level = prefs.getIntPref('jsmin'),
			output;
			
		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}
		
		output = jsmin('', source, level);
		
		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}
	}
	
	this.jsMinSave = function(){
		var view = ko.views.manager.currentView,
			kodoc = view.koDoc,
			bufferText = kodoc.buffer,
			level = prefs.getIntPref('jsmin'),
			output;
			
		if (!view) {
			return false;
		}
		
		if (!kodoc) {
			return false;
		}
		
		if (kodoc.file.ext !== '.js') {
			notify.send('Please select a Javascript file', 'tools');
			return false;
		}
		
		if (bufferText.length === 0) {
			return;
		}
		
		output = jsmin('', bufferText, level);
		var path = kodoc.file.displayPath;
		var newUrl = path.substr(0, (path.length - 3)) + '.min.js';
		
		self._saveFile(newUrl, output);
	}
	
	this.cssMin = function() {
		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			buffer = false,
			output;
			
		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}
		
		output = YAHOO.compressor.cssmin(source);
		
		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}
	}
	
	this.cssMinSave = function() {
		var view = ko.views.manager.currentView,
			kodoc = view.koDoc,
			bufferText = kodoc.buffer,
			output;
			
		if (!view) {
			return false;
		}
		
		if (!kodoc) {
			return false;
		}
		
		if (kodoc.file.ext !== '.css') {
			notify.send('Please select a CSS file', 'tools');
			return false;
		}
		
		if (bufferText.length === 0) {
			return;
		}
		
		output = YAHOO.compressor.cssmin(bufferText);
		
		var path = kodoc.file.displayPath;
		var newUrl = path.substr(0, (path.length - 4)) + '.min.css';
		
		self._saveFile(newUrl, output);
	}
	
	this._saveMinified = function(){
		var view = ko.views.manager.currentView,
			kodoc = view.koDoc;
			
		if (!view) {
			return false;
		}
		
		if (!kodoc) {
			return false;
		}
		
		var file = kodoc.file;
		
		if (!file) {
			return false;
		}
		
		switch (file.ext) {
			case '.js':
				self.jsMinSave();
				break;
			case '.css':
				self.cssMinSave();
				break;
			default:
				notify.send('Please select a JS or CSS file', 'tools');
				break;
		}
	}
	
	this.settings = function(){
		var features = "chrome,titlebar,toolbar,centerscreen"; 
		window.openDialog('chrome://beautifyjs/content/pref-overlay.xul', "beautifyjs", features);
	}

	this.looks_like_html = function(source) {
		var trimmed = source.replace(/^[ \t\n\r]+/, '');
		var comment_mark = '<' + '!-' + '-';
		return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
	}

	this.looks_like_css = function(source) {
		var cleanSource = source.replace(/(\/\*[^\*]+\*\/|\/.[^\s]+\/)/g, ''); //remove reggex and comments
		return /[a-z0-9%)](\s{|{)/gi.test(cleanSource) && /(\sif(\s|\()|(}|\s)else(\s|{)|[^#.-]function|this\.)/gi.test(cleanSource) == false;
	}

	this.test_eol = function(source) {
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
	
	this._saveFile = function(filepath, filecontent) {

		var file = Components
			.classes["@activestate.com/koFileEx;1"]
			.createInstance(Components.interfaces.koIFileEx);
		file.path = filepath;

		file.open('w');

		file.puts(filecontent);
		file.close();

		return;
	};
	
	this._getSelection = function(scimoz) {
		var selText = scimoz.selText;
		
		if (selText.length > 0) {
			var selStart = scimoz.selectionStart,
				selStartLine = scimoz.lineFromPosition(selStart),
				startLineStart = scimoz.positionFromLine(selStartLine);
			
			if (selStart !== startLineStart) {
				scimoz.setSel(startLineStart, scimoz.selectionEnd);
				selText = scimoz.selText;
			}
		}
		
		return selText;
	}

}).apply(extensions.beautifyjs);

