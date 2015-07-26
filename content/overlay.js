// tools for common Komodo extension chores
xtk.load('chrome://beautifyjs/content/toolkit.js');
// Komodo console in Output Window
xtk.load('chrome://beautifyjs/content/konsole.js');
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
if (typeof(extensions.beautifyjs) === 'undefined') extensions.beautifyjs = { version : '1.0' };

(function() {
	var self = this,
		prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService).getBranch("extensions.beautifyjs.");
		
	if (!('beautifyjs' in ko)) ko.extensions = {}; 
	var myExt = "beautify-js@babobski.com" ; 
	if (!(myExt in ko.extensions)) ko.extensions[myExt] = {};
	if (!('myapp' in ko.extensions[myExt])) ko.extensions[myExt].myapp = {};
	var beautifyData = ko.extensions[myExt].myapp;
	
	// begin
	
	var the = {
		use_codemirror: (!window.location.href.match(/without-codemirror/)),
		beautify_in_progress: false,
		editor: null // codemirror editor
	};
	
	function run_tests() {
		var st = new SanityTest();
			run_javascript_tests(st, Urlencoded, js_beautify, html_beautify, css_beautify);
			run_css_tests(st, Urlencoded, js_beautify, html_beautify, css_beautify);
			run_html_tests(st, Urlencoded, js_beautify, html_beautify, css_beautify);
			JavascriptObfuscator.run_tests(st);
			P_A_C_K_E_R.run_tests(st);
			Urlencoded.run_tests(st);
			MyObfuscate.run_tests(st);
		var results = st.results_raw()
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/ /g, '&nbsp;')
			.replace(/\r/g, '·')
			.replace(/\n/g, '<br>');
		$('#testresults').html(results).show();
	}
	
	
	function any(a, b) {
		return a || b;
	}
	
	function read_settings_from_cookie() {
		$('#tabsize').val(any($.cookie('tabsize'), '4'));
		$('#brace-style').val(any($.cookie('brace-style'), 'collapse'));
		$('#detect-packers').prop('checked', $.cookie('detect-packers') !== 'off');
		$('#max-preserve-newlines').val(any($.cookie('max-preserve-newlines'), '5'));
		$('#keep-array-indentation').prop('checked', $.cookie('keep-array-indentation') === 'on');
		$('#break-chained-methods').prop('checked', $.cookie('break-chained-methods') === 'on');
		$('#indent-scripts').val(any($.cookie('indent-scripts'), 'normal'));
		$('#space-before-conditional').prop('checked', $.cookie('space-before-conditional') !== 'off');
		$('#wrap-line-length').val(any($.cookie('wrap-line-length'), '0'));
		$('#unescape-strings').prop('checked', $.cookie('unescape-strings') === 'on');
		$('#jslint-happy').prop('checked', $.cookie('jslint-happy') === 'on');
		$('#end-with-newline').prop('checked', $.cookie('end-with-newline') === 'on');
		$('#indent-inner-html').prop('checked', $.cookie('indent-inner-html') === 'on');
		$('#comma-first').prop('checked', $.cookie('comma-first') === 'on');
		$('#e4x').prop('checked', $.cookie('e4x') === 'on');
	}
	
	function store_settings_to_cookie() {
		var opts = {
			expires: 360
		};
		$.cookie('tabsize', $('#tabsize').val(), opts);
		$.cookie('brace-style', $('#brace-style').val(), opts);
		$.cookie('detect-packers', $('#detect-packers').prop('checked') ? 'on' : 'off', opts);
		$.cookie('max-preserve-newlines', $('#max-preserve-newlines').val(), opts);
		$.cookie('keep-array-indentation', $('#keep-array-indentation').prop('checked') ? 'on' : 'off', opts);
		$.cookie('break-chained-methods', $('#break-chained-methods').prop('checked') ? 'on' : 'off', opts);
		$.cookie('space-before-conditional', $('#space-before-conditional').prop('checked') ? 'on' : 'off',
			opts);
		$.cookie('unescape-strings', $('#unescape-strings').prop('checked') ? 'on' : 'off', opts);
		$.cookie('jslint-happy', $('#jslint-happy').prop('checked') ? 'on' : 'off', opts);
		$.cookie('end-with-newline', $('#end-with-newline').prop('checked') ? 'on' : 'off', opts);
		$.cookie('wrap-line-length', $('#wrap-line-length').val(), opts);
		$.cookie('indent-scripts', $('#indent-scripts').val(), opts);
		$.cookie('indent-inner-html', $('#indent-inner-html').prop('checked') ? 'on' : 'off', opts);
		$.cookie('comma-first', $('#comma-first').prop('checked') ? 'on' : 'off', opts);
		$.cookie('e4x', $('#e4x').prop('checked') ? 'on' : 'off', opts);
	
	}
	
	function unpacker_filter(source) {
		var trailing_comments = '',
			comment = '',
			unpacked = '',
			found = false;
		
		// cut trailing comments
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
		
		var unpackers = [P_A_C_K_E_R, Urlencoded, /*JavascriptObfuscator,*/ MyObfuscate];
		for (var i = 0; i < unpackers.length; i++) {
			if (unpackers[i].detect(source)) {
				unpacked = unpackers[i].unpack(source);
				if (unpacked != source) {
					source = unpacker_filter(unpacked);
				}
			}
		}
		
		return trailing_comments + source;
	}
	
	
	function beautify() {
		if (the.beautify_in_progress) return;
		
		store_settings_to_cookie();
		
		the.beautify_in_progress = true;
		
		var source = the.editor ? the.editor.getValue() : $('#source').val(),
			output,
			opts = {};
		
		opts.indent_size = prefs.getCharPref('indent');
		opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
		opts.max_preserve_newlines = $('#max-preserve-newlines').val();
		opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
		opts.keep_array_indentation = $('#keep-array-indentation').prop('checked');
		opts.break_chained_methods = $('#break-chained-methods').prop('checked');
		opts.indent_scripts = $('#indent-scripts').val();
		opts.brace_style = $('#brace-style').val();
		opts.space_before_conditional = $('#space-before-conditional').prop('checked');
		opts.unescape_strings = $('#unescape-strings').prop('checked');
		opts.jslint_happy = $('#jslint-happy').prop('checked');
		opts.end_with_newline = $('#end-with-newline').prop('checked');
		opts.wrap_line_length = $('#wrap-line-length').val();
		opts.indent_inner_html = $('#indent-inner-html').prop('checked');
		opts.comma_first = $('#comma-first').prop('checked');
		opts.e4x = $('#e4x').prop('checked');
		
		if (looks_like_html(source)) {
			output = html_beautify(source, opts);
		} else {
			if ($('#detect-packers').prop('checked')) {
				source = unpacker_filter(source);
			}
			output = js_beautify(source, opts);
		}
		if (the.editor) {
			the.editor.setValue(output);
		} else {
			$('#source').val(output);
		}
		
		the.beautify_in_progress = false;
	}
	
	function looks_like_html(source) {
		// <foo> - looks like html
		// <!--\nalert('foo!');\n--> - doesn't look like html
		
		var trimmed = source.replace(/^[ \t\n\r]+/, '');
		var comment_mark = '<' + '!-' + '-';
		return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
	}
	
	// einde
	
	

	this._log = function(message, style) {
		if (style == konsole.S_ERROR || prefs.getBoolPref('showMessages')) {
			konsole.popup();
			konsole.writeln('[Beautify js] ' + message, style);
		}
	};
	
	this._notifcation = function($message, error){
		$message =$message || false;
		error = error || false;
		
		var icon = error ? 'chrome://beautifyjs/content/beautifyjs-error-icon.png' : 'chrome://beautifyjs/content/beautifyjs-icon.png';
		if (!("Notification" in window)) {
		  alert("This browser does not support system notifications");
		}
		else if (Notification.permission === "granted") {
		  var options = {
			body: $message,
			icon: icon
		  }
		  var n = new Notification('Beautify js', options);
		  setTimeout(n.close.bind(n), 5000); 
		}
	  
		else if (Notification.permission !== 'denied') {
		  Notification.requestPermission(function (permission) {
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
	
	this._in_array = function (search, array) {
		for (i = 0; i < array.length; i++) {
			if(array[i] ==search ) {
				return true;
			}
		}
		return false;
	}
	
}).apply(extensions.beautifyjs);
