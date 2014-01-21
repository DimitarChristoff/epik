(Slick is an official [MooTools](http://mootools.net) project)

## Slicker

Just the Slick parser for nodejs

## Slick CSS Selector Parser

Parse a CSS selector string into a JavaScript object

### Usage

### `.parse()` selector into object
Parse a CSS Selector String into a Selector Object.

Expects: `String`

Returns: `SelectorObject`

```javascript
var slicker = require('slick');

slicker.parse("#foo > bar.baz") → SelectorObject
```

### SelectorObject format

```javascript
slicker.parse('#foo > bar.baz');
{
	"raw":"#foo > bar.baz",
	"expressions": [[
		{ "combinator":" ", "tag":"*", "id":"foo" },
		{ "combinator":">", "tag":"bar", "classList": ["baz"], "classes": [{"value":"baz", "regexp":RegExp }]}
	]]
}

slicker.parse('h1, h2, ul > li, .things')
{
	"raw": "h1, h2, ul > li, .things",
	"expressions": [
		[{ "combinator":" ", "tag": "h1" }],
		[{ "combinator":" ", "tag": "h2" }],
		[{ "combinator":" ", "tag": "ul" }, { "combinator": ">", "tag": "li" }],
		[{ "combinator":" ", "tag": "*", "classList": ["things"], "classes": [{"value": "things", "regexp":RegExp }] }]
	]
}
```