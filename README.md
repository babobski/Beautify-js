# Beautify js
js beautify for komodo edit/ide.

This little beautifier will reformat css, html and javascript.  
Based on the the <a href="http://jsbeautifier.org/" target="_blank">jsbeautifier.org</a>.

<h2>Usage</h2>
<p><b>Goto to Tools</b> -&gt; <b>Beautify js</b> and select an option, or right-click on your file</p>
<ul>
<li><strong><em>Beautify (auto detect)</em></strong><br>
Beautify selected HTML/CSS/javascript (this will be auto-detected).</li>
<li><strong><em>Beautify HTML</em></strong><br>
Beautify selected HTML.</li>
<li><strong><em>Beautify CSS</em></strong><br>
Beautify selected CSS.</li>
<li><strong><em>Beautify Javascript</em></strong><br> 
Beautify selected javascript.</li>
</ul>

<h2>Options</h2>
The option panel is accessible true the add on screen.<br><br>
![screenshot option panel](https://raw.githubusercontent.com/babobski/Beautify-js/master/screenshot.png)

<h2>Macro's/key bindings</h2>
To trigger Beautify js on a key binding, you have to set up a macro(this macro auto detects html/css/javascript).

```javascript
if (extensions.beautifyjs) {
    extensions.beautifyjs.beautify();
}
```
For the marco you can set up a key binding as trigger.

You can also set up key bindings for the type specific marcro's
```javascript
// HTML
if (extensions.beautifyjs) {
    extensions.beautifyjs.beautify_HTML();
}

// CSS
if (extensions.beautifyjs) {
    extensions.beautifyjs.beautify_CSS();
}

// Javascript
if (extensions.beautifyjs) {
    extensions.beautifyjs.beautify_JS();
}
```
