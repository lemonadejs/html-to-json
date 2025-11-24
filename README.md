# html-to-json

Lightweight utilities to turn HTML/XML strings into a JSON tree and render that tree back to markup. Ships two functions: `parser(html)` and `render(tree, options)`.

- Author: Jspreadsheet Team
- License: MIT
- Repository: https://github.com/lemonadejs/html-to-json
- Package: `npm install @lemonadejs/html-to-json`

## Install
```sh
npm install @lemonadejs/html-to-json
```

## Usage
Parse markup to JSON:
```js
import parser from '@lemonadejs/html-to-json/src/parser.js';

const html = `<note>
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>`;

const tree = parser(html);
console.log(tree);
```

Render JSON back to markup:
```js
import parser from '@lemonadejs/html-to-json/src/parser.js';
import render from '@lemonadejs/html-to-json/src/render.js';

const tree = parser('<div class="greeting">Hello</div>');
const html = render(tree, { pretty: true, indent: '    ' });
console.log(html);
// <div class="greeting">
//     Hello
// </div>
```

Round-trip convenience:
```js
import parser from '@lemonadejs/html-to-json/src/parser.js';
import render from '@lemonadejs/html-to-json/src/render.js';

const input = '<div><!--c--><span>Hi</span></div>';
const json = parser(input);
const output = render(json);
```

## API
### `parser(html: string)` ? `Object`
- Parses HTML/XML into a plain JSON tree.
- Node shapes:
  - Element: `{ type: 'tagName', props: [{ name, value }], children: [...] }`
  - Text: `{ type: '#text', props: [{ name: 'textContent', value: '...' }] }`
  - Comment: `{ type: '#comments', props: [{ name: 'text', value: '...' }] }`
- For multiple root elements, returns a `{ type: 'template', children: [...] }` wrapper.

### `render(tree: Object|Array, options?: Object)` ? `string`
- Reconstructs HTML/XML from the JSON tree.
- Options:
  - `pretty` (boolean): format with newlines/indentation. Default `false`.
  - `indent` (string): indentation characters when `pretty` is true. Default two spaces.
  - `selfClosingTags` (string[]): override the default void-element list.
  - `xmlMode` (boolean): self-close all empty elements using `<tag />`.

## JSON structure example
```json
{
  "type": "div",
  "props": [
    { "name": "class", "value": "card" }
  ],
  "children": [
    {
      "type": "#text",
      "props": [{ "name": "textContent", "value": "Hello" }]
    }
  ]
}
```

## Testing
```sh
npm test
```
Runs the Mocha suite covering round-trip scenarios, comments, attributes, and XML cases.

## Limitations
- Entities are not decoded during parsing; they are stored as-is and escaped on render (round-tripping `&amp;` results in `&amp;`).
- Whitespace is preserved in text nodes; no normalization or trimming is applied.
- Only the provided `selfClosingTags` list is treated as void unless overridden.
- Parser is lenient: unclosed tags may still produce a tree; no detailed error reporting.
- Doctype, processing instructions, and CDATA sections are not parsed.
- Renderer always uses double quotes for attributes; attribute order may differ from the source.

## License
MIT © Jspreadsheet Team
