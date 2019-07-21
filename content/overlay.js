// Beautify js 
xtk.load('chrome://beautifyjs/content/js/lib/beautify.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-css.js');
xtk.load('chrome://beautifyjs/content/js/lib/beautify-html.js?v=2');
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
	version: '4.0.3'
};

(function() {
	var self = this,
		notify = require("notify/notify"),
		selStart,
		prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService).getBranch("extensions.beautifyjs.");

	var the = {
		beautify_in_progress: false
	},
	collumn = 0;

	this.unpacker_filter = function(source) {
		var leading_comments = '',
			comment = '',
			unpacked = '',
			found = false;

		// cuts leading comments
		do {
			found = false;
			if (/^\s*\/\*/.test(source)) {
				found = true;
				comment = source.substr(0, source.indexOf('*/') + 2);
				source = source.substr(comment.length);
				leading_comments += comment;
			} else if (/^\s*\/\//.test(source)) {
				found = true;
				comment = source.match(/^\s*\/\/.*/)[0];
				source = source.substr(comment.length);
				leading_comments += comment;
			}
		} while (found);
		leading_comments += '\n';
		source = source.replace(/^\s+/, '');

		var unpackers = [P_A_C_K_E_R, Urlencoded, JavascriptObfuscator /*, MyObfuscate*/ ];
		for (var i = 0; i < unpackers.length; i++) {
			if (unpackers[i].detect(source)) {
				unpacked = unpackers[i].unpack(source);
				if (unpacked !== source) {
					source = unpacker_filter(unpacked);
				}
			}
		}

		return leading_comments + source;
	}

	this.beautify_HTML = function() {
		if (the.beautify_in_progress) return;

		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			indentSize = prefs.getIntPref('indent'),
			text = self._getSelection(scimoz, indentSize),
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
		opts.indent_size = indentSize;
		opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
		if (opts.indent_size == 1) {
			opts.indent_with_tabs = true;
		}
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
		opts.indent_level =collumn;

		output = html_beautify(source, opts);
		the.beautify_in_progress = false;
		collumn = 0;
		
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
			indentSize = prefs.getIntPref('indent'),
			text = self._getSelection(scimoz, indentSize),
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
		opts.indent_size = indentSize;
		opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
		if (opts.indent_size == 1) {
			opts.indent_with_tabs = true;
		}
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
		opts.indent_level = collumn;

		output = css_beautify(source, opts);
		the.beautify_in_progress = false;
		collumn = 0;

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
			indentSize = prefs.getIntPref('indent'),
			text = self._getSelection(scimoz, indentSize),
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
		opts.indent_size = indentSize;
		opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
		if (opts.indent_size == 1) {
			opts.indent_with_tabs = true;
		}
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
		opts.indent_level = collumn;

		if (prefs.getBoolPref('packers')) {
			source = self.unpacker_filter(source);
		}
		output = js_beautify(source, opts);
		the.beautify_in_progress = false;
		collumn = 0;

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
			indentSize = prefs.getIntPref('indent'),
			text = self._getSelection(scimoz, indentSize),
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
		opts.indent_size = indentSize;
		opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
		if (opts.indent_size == 1) {
			opts.indent_with_tabs = true;
		}
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
		opts.indent_level = collumn;

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
		collumn = 0;

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
		
		try {
			output = jsmin('', source, level);
			collumn = 0;
			
			if (buffer) {
				kodoc.buffer = output;
			} else {
				scimoz.replaceSel(output);
			}
		} catch(e) {
			notify.send('Error while compiling file', 'tools');
			console.error(e);
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
		try {
			output = jsmin('', bufferText, level);
			var path = kodoc.file.displayPath;
			var newUrl = path.substr(0, (path.length - 3)) + '.min.js';
			
			self._saveFile(newUrl, output);
		} catch(e) {
			notify.send('Error while compiling file', 'tools');
			console.error(e);
		}
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
		
		try {
			output = YAHOO.compressor.cssmin(source);
			collumn = 0;
			
			if (buffer) {
				kodoc.buffer = output;
			} else {
				scimoz.replaceSel(output);
			}
		} catch(e) {
			notify.send('Error while compiling file', 'tools');
			console.error(e);
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
		
		try {
			output = YAHOO.compressor.cssmin(bufferText);
			
			var path = kodoc.file.displayPath;
			var newUrl = path.substr(0, (path.length - 4)) + '.min.css';
			
			self._saveFile(newUrl, output);
		} catch(e) {
			notify.send('Error while compiling file', 'tools');
			console.error(e);
		}
	}
	
	this.htmlMin = function() {
		var view = ko.views.manager.currentView,
			scimoz = view.scintilla.scimoz,
			kodoc = view.koDoc,
			text = self._getSelection(scimoz),
			bufferText = kodoc.buffer,
			source = text,
			useHTML5 = prefs.getBoolPref('comp_html5'),
			buffer = false,
			output;
			
		if (text.length == 0) {
			buffer = true;
			source = bufferText;
		}

		if (source.length === 0) {
			return;
		}
		
		output = source.replace(/<!--[^]+?->|\r|\n/gi, '').replace(/([^'"])[\s]{2,}([^'"])/g, '$1 $2').replace(/(\>)\s([a-z0-9])/gi, '$1$2');
		output = output.replace(/(\>)\s(<)/gi, '$1$2');
		
		// html5 stuff
		if (useHTML5) {
			output = output.replace(/<\/(html|head|body|p|dt|dd|li|option|thead|th|tbody|tr|td|tfoot|colgroup)>/gi, '');
			output = output.replace(/<br[\s]*\/>/g, '<br>').replace(/<(meta[^/]+)\/>/, '<$1>');
		}
		
		collumn = 0;
		
		if (buffer) {
			kodoc.buffer = output;
		} else {
			scimoz.replaceSel(output);
		}
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
	
	this._getSelection = function(scimoz, indentSize) {
		var selText = scimoz.selText;
	
		if (selText.length > 0) {
			var selStart = scimoz.selectionStart;
				selEnd = scimoz.selectionEnd;
				selStartLine = scimoz.lineFromPosition(selStart);
				startLineStart = scimoz.positionFromLine(selStartLine);
	
			collumn = scimoz.getColumn(selStart);
	
			if (collumn === 0) {
				scimoz.gotoPos(selStart);
				scimoz.vCHome();
				collumn = scimoz.getColumn(scimoz.currentPos);
				scimoz.setSel(scimoz.currentPos, selEnd);
				selStart = scimoz.selectionStart;
				selStartLine = scimoz.lineFromPosition(selStart);
				startLineStart = scimoz.positionFromLine(selStartLine);
			}
			
			if (indentSize !== 1) {
				collumn = Math.round(collumn / indentSize);
			}
	
			if (selStart !== startLineStart) {
				if (indentSize === 1) {
					collumn = collumn / scimoz.indent;
				}
				scimoz.setSel(startLineStart, selEnd);
				selText = scimoz.selText;
	
			}
		}
	
		return selText;
	}
	
	this._addDynamicToolbarButton = function() {
		const db = require('ko/dynamic-button');

		const view = () => {
			return ko.views.manager.currentView && ko.views.manager.currentView.title !== "New Tab";
		};
		
		const button = db.register({
			label: "Beautify JS",
			tooltip: "Beautify JS",
			icon: "paint-brush",
			events: [
				"current_view_changed",
			],
			menuitems: [
				{
					label: "Beautify",
					name: "beautify",
					command: () => {
						extensions.beautifyjs.beautify();
					}
				},
				{
					label: "Beautify HTML",
					name: "beautify-html",
					command: () => {
						extensions.beautifyjs.beautify_HTML();
					}
				},
				{
					label: "Beautify CSS",
					name: "beautify-css",
					command: () => {
						extensions.beautifyjs.beautify_CSS();
					}
				},
				{
					label: "Beautify JS",
					name: "beautify-js",
					command: () => {
						extensions.beautifyjs.beautify_JS();
					}
				},
				{
					label: "Minify CSS",
					name: "beautify-minify-css",
					command: () => {
						extensions.beautifyjs.cssMin();
					}
				},
				{
					label: "Minify JS",
					name: "beautify-minify-js",
					command: () => {
						extensions.beautifyjs.jsMin();
					}
				},
				{
					label: "Minify HTML",
					name: "beautify-minify-html",
					command: () => {
						extensions.beautifyjs.htmlMin();
					}
				},
				{
					label: "Minify CSS save as .min",
					name: "beautify-minify-save-css",
					command: () => {
						extensions.beautifyjs.cssMinSave();
					},
				},
				{
					label: "Minify JS save as .min",
					name: "beautify-minify-save-js",
					command: () => {
						extensions.beautifyjs.jsMinSave();
					},
				},
				{
					label: "Settings",
					name: "beautify-settings",
					command: () => {
						extensions.beautifyjs.settings();
					}
				},
			],
			isEnabled: () => {
				return view();
			},
		});
	};
	self._addDynamicToolbarButton();
}).apply(extensions.beautifyjs);
