# HTML/XML to JSON Converter

> A lightweight, zero-dependency library for bidirectional conversion between HTML/XML and JSON

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-58%20passing-brightgreen.svg)]()

Transform HTML/XML markup into clean JSON trees and render them back to markup with full fidelity. Perfect for parsing, manipulating, and generating HTML/XML programmatically.

## Features

- **Zero Dependencies** - Pure JavaScript, no external libraries required
- **TypeScript Support** - Fully typed with comprehensive type definitions
- **Bidirectional** - Parse HTML/XML to JSON and render JSON back to HTML/XML
- **High Fidelity** - Preserves structure, attributes, text nodes, and comments
- **Lightweight** - Minimal footprint, fast parsing
- **Flexible** - Works with HTML and XML, supports namespaces
- **Sanitization Ready** - Built-in option to ignore unwanted tags (script, style, etc.)
- **Pretty Printing** - Optional formatted output with customizable indentation
- **Well Tested** - 58 comprehensive tests covering all features

## Installation

```bash
npm install @lemonadejs/html-to-json
```

## Import Options

You can import both functions from the main package:

```javascript
// Recommended: Import both from main package
import { parser, render } from '@lemonadejs/html-to-json';
```

## TypeScript Usage

The library includes comprehensive type definitions:

```typescript
import { parser, render, type Node, type ParserOptions, type RenderOptions } from '@lemonadejs/html-to-json';

// Fully typed parser with options
const options: ParserOptions = { ignore: ['script', 'style'] };
const tree: Node | undefined = parser('<div>Hello</div>', options);

// Fully typed renderer with options
const renderOpts: RenderOptions = { pretty: true, indent: '  ' };
const html: string = render(tree, renderOpts);
```

## Quick Start

### Parse HTML/XML to JSON

```javascript
import { parser } from '@lemonadejs/html-to-json';

const html = '<div class="card"><h1>Title</h1><p>Content</p></div>';
const tree = parser(html);

console.log(JSON.stringify(tree, null, 2));
```

**Output:**
```json
{
  "type": "div",
  "props": [
    { "name": "class", "value": "card" }
  ],
  "children": [
    {
      "type": "h1",
      "children": [
        {
          "type": "#text",
          "props": [{ "name": "textContent", "value": "Title" }]
        }
      ]
    },
    {
      "type": "p",
      "children": [
        {
          "type": "#text",
          "props": [{ "name": "textContent", "value": "Content" }]
        }
      ]
    }
  ]
}
```

### Render JSON back to HTML/XML

```javascript
import { parser, render } from '@lemonadejs/html-to-json';

const tree = parser('<div class="greeting">Hello World</div>');
const html = render(tree);

console.log(html);
// Output: <div class="greeting">Hello World</div>
```

### Pretty Printing

```javascript
import { render } from '@lemonadejs/html-to-json';

const tree = {
  type: 'article',
  props: [{ name: 'class', value: 'post' }],
  children: [
    {
      type: 'h2',
      children: [
        { type: '#text', props: [{ name: 'textContent', value: 'Article Title' }] }
      ]
    },
    {
      type: 'p',
      children: [
        { type: '#text', props: [{ name: 'textContent', value: 'Article content here.' }] }
      ]
    }
  ]
};

const html = render(tree, { pretty: true, indent: '  ' });

console.log(html);
```

**Output:**
```html
<article class="post">
  <h2>
    Article Title
  </h2>
  <p>
    Article content here.
  </p>
</article>
```

## 📖 API Reference

### `parser(html, options)`

Parses HTML or XML string into a JSON tree structure.

**Parameters:**
- `html` (string) - The HTML or XML string to parse
- `options` (Object, optional) - Parser options

**Options:**

| Option   | Type     | Default | Description                                    |
|----------|----------|---------|------------------------------------------------|
| `ignore` | string[] | `[]`    | Array of tag names to ignore during parsing    |

**Returns:** `Object` - JSON tree representation

**Examples:**

```javascript
// Basic parsing
const tree = parser('<div id="app">Hello</div>');

// Ignore script and style tags
const clean = parser(html, { ignore: ['script', 'style'] });

// Case-insensitive tag matching
const tree = parser('<div><SCRIPT>bad</SCRIPT></div>', { ignore: ['script'] });
```

### `render(tree, options)`

Renders a JSON tree back into HTML or XML markup.

**Parameters:**
- `tree` (Object|Array) - The JSON tree to render
- `options` (Object, optional) - Rendering options

**Options:**

| Option            | Type     | Default    | Description                                          |
|-------------------|----------|------------|------------------------------------------------------|
| `pretty`          | boolean  | `false`    | Format output with newlines and indentation          |
| `indent`          | string   | `'  '`     | Indentation string (used when `pretty` is `true`)    |
| `selfClosingTags` | string[] | See below* | Override default void elements list                  |
| `xmlMode`         | boolean  | `false`    | Self-close all empty elements using `<tag />` syntax |

*Default self-closing tags: `area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `source`, `track`, `wbr`

**Returns:** `string` - Rendered HTML/XML markup

**Examples:**

```javascript
// Basic rendering
const html = render(tree);

// Pretty printing
const formatted = render(tree, { pretty: true });

// Custom indentation
const tabbed = render(tree, { pretty: true, indent: '\t' });

// XML mode
const xml = render(tree, { xmlMode: true });

// Custom self-closing tags
const custom = render(tree, {
  selfClosingTags: ['br', 'hr', 'img', 'custom-element']
});
```

## 🎯 JSON Tree Structure

### Element Node
```json
{
  "type": "tagName",
  "props": [
    { "name": "attributeName", "value": "attributeValue" }
  ],
  "children": [...]
}
```

### Text Node
```json
{
  "type": "#text",
  "props": [
    { "name": "textContent", "value": "text content here" }
  ]
}
```

### Comment Node
```json
{
  "type": "#comments",
  "props": [
    { "name": "text", "value": " comment text " }
  ]
}
```

### Template Wrapper (Multiple Root Elements)
```json
{
  "type": "template",
  "children": [
    { "type": "div", ... },
    { "type": "span", ... }
  ]
}
```

## 📦 TypeScript Types

The library exports the following TypeScript types:

### Core Types
- **`Node`** - Union type for all possible node types (ElementNode | TextNode | CommentNode | TemplateNode)
- **`ElementNode`** - HTML/XML element with type, props, and children
- **`TextNode`** - Text content node with `type: '#text'`
- **`CommentNode`** - Comment node with `type: '#comments'`
- **`TemplateNode`** - Wrapper for multiple root elements with `type: 'template'`
- **`NodeProp`** - Property object with name and value

### Options Types
- **`ParserOptions`** - Options for the parser function
- **`RenderOptions`** - Options for the render function

```typescript
import type {
  Node,
  ElementNode,
  TextNode,
  CommentNode,
  TemplateNode,
  NodeProp,
  ParserOptions,
  RenderOptions
} from '@lemonadejs/html-to-json';
```

## 💡 Use Cases

### 1. HTML Sanitization

```javascript
import { parser, render } from '@lemonadejs/html-to-json';

// Remove potentially dangerous tags using the ignore option
function sanitizeHTML(html) {
  const tree = parser(html, {
    ignore: ['script', 'style', 'iframe', 'object', 'embed']
  });
  return render(tree);
}

const dirty = '<div>Hello<script>alert("xss")</script><style>bad{}</style>World</div>';
const clean = sanitizeHTML(dirty);
console.log(clean); // <div>HelloWorld</div>
```

### 2. HTML Transformation

```javascript
// Add class to all divs
function addClassToAllDivs(tree, className) {
  if (tree.type === 'div') {
    if (!tree.props) tree.props = [];
    const classAttr = tree.props.find(p => p.name === 'class');
    if (classAttr) {
      classAttr.value += ` ${className}`;
    } else {
      tree.props.push({ name: 'class', value: className });
    }
  }

  if (tree.children) {
    tree.children.forEach(child => addClassToAllDivs(child, className));
  }

  return tree;
}

const html = '<div><div>Nested</div></div>';
const tree = parser(html);
addClassToAllDivs(tree, 'highlight');
console.log(render(tree));
// <div class="highlight"><div class="highlight">Nested</div></div>
```

### 3. XML Processing

```javascript
// Parse and extract data from XML
const xml = `
<catalog>
  <book isbn="978-0-123456-78-9">
    <title>Sample Book</title>
    <author>John Doe</author>
    <price>29.99</price>
  </book>
</catalog>`;

const tree = parser(xml);

function extractBooks(node) {
  if (node.type === 'book') {
    const isbn = node.props?.find(p => p.name === 'isbn')?.value;
    const title = node.children?.find(c => c.type === 'title')
      ?.children?.[0]?.props?.[0]?.value;
    const author = node.children?.find(c => c.type === 'author')
      ?.children?.[0]?.props?.[0]?.value;

    return { isbn, title, author };
  }

  if (node.children) {
    return node.children.map(extractBooks).filter(Boolean).flat();
  }

  return [];
}

const books = extractBooks(tree);
console.log(books);
// [{ isbn: '978-0-123456-78-9', title: 'Sample Book', author: 'John Doe' }]
```

### 4. Complex HTML with Inline CSS

```javascript
const complexHTML = `
<div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <h1 style="color: white; margin: 0;">Welcome</h1>
  <p style="color: rgba(255,255,255,0.9);">Beautiful styled content</p>
</div>`;

const tree = parser(complexHTML);
const rendered = render(tree, { pretty: true });

console.log(rendered);
// Perfectly preserves all inline CSS with gradients, rgba colors, etc.
```

## 🔍 Advanced Features

### XML Namespaces Support

```javascript
const xml = '<root xmlns:custom="http://example.com"><custom:element>Value</custom:element></root>';
const tree = parser(xml);
const output = render(tree);
// Preserves namespace colons in tag names
```

### Self-Closing Tags

```javascript
const html = '<div><br /><img src="test.jpg" /><input type="text" /></div>';
const tree = parser(html);
const output = render(tree);
// Properly handles void elements
```

### Comments Preservation

```javascript
const html = '<div><!-- Important comment --><span>Content</span></div>';
const tree = parser(html);
const output = render(tree);
// Comments are preserved in the output
```

### Multiple Root Elements

```javascript
const html = '<div>First</div><span>Second</span>';
const tree = parser(html);
// Returns: { type: 'template', children: [...] }
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

**Test Coverage:**
- ✅ Basic HTML elements (div, span, nested structures)
- ✅ Self-closing tags (br, img, input, hr, meta, link)
- ✅ Attributes (single, multiple, special characters, quotes)
- ✅ Text content with escaping
- ✅ HTML comments
- ✅ XML documents with namespaces
- ✅ Complex real-world examples (forms, navigation, tables)
- ✅ Edge cases (empty input, whitespace, consecutive tags)
- ✅ Parser behavior (no parent references, unclosed tags)
- ✅ Parser options (ignore tags - script, style, nested, case-insensitive)
- ✅ Renderer options (pretty printing, XML mode)
- ✅ Complex HTML with extensive inline CSS (11,000+ characters)

**58 tests passing** • 1 skipped

## ⚡ Performance

The parser is designed for speed and efficiency:

- **Streaming parser** - Single-pass character-by-character parsing
- **No regex in main loop** - Only simple character matching
- **Minimal allocations** - Reuses objects where possible
- **Stack-based** - Efficient memory usage for deeply nested structures

Typical performance:
- Small HTML (< 1KB): < 1ms
- Medium HTML (10KB): ~5ms
- Large HTML (100KB+): ~50ms
- Complex HTML with CSS (11KB): ~10ms

## ⚠️ Known Limitations

1. **HTML Entities**: Not decoded during parsing. They are stored as-is and escaped on render.
   - Input: `<p>&amp;</p>` → Stored: `"&amp;"` → Output: `<p>&amp;amp;</p>`
   - **Workaround**: Use raw characters instead of entities in source

2. **Whitespace**: Fully preserved in text nodes, no normalization applied.

3. **Doctype**: `<!DOCTYPE html>` declarations are parsed as text nodes, not special nodes.

4. **CDATA**: `<![CDATA[...]]>` sections are not specially handled.

5. **Processing Instructions**: `<?xml ...?>` are not parsed.

6. **Error Reporting**: Parser is lenient and produces a tree even for malformed HTML. No detailed error messages.

7. **Attribute Order**: May differ from source in rendered output.

8. **Quotes**: Renderer always uses double quotes for attributes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/lemonadejs/html-to-json.git
cd html-to-json

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📄 License

MIT © [Jspreadsheet Team](https://github.com/lemonadejs)

## 🔗 Links

- **Repository**: https://github.com/lemonadejs/html-to-json
- **NPM Package**: https://www.npmjs.com/package/@lemonadejs/html-to-json
- **Issues**: https://github.com/lemonadejs/html-to-json/issues
- **Documentation**: https://github.com/lemonadejs/html-to-json#readme

## 🙏 Acknowledgments

Built with ❤️ by the [Jspreadsheet Team](https://jspreadsheet.com/)

---

**Star this repo** ⭐ if you find it useful!
