/**
 * Property in a node (attribute or text content)
 */
export interface NodeProp {
    name: string;
    value: string;
}

/**
 * Base node structure
 */
export interface BaseNode {
    type: string;
    props?: NodeProp[];
}

/**
 * Element node representing an HTML/XML tag
 */
export interface ElementNode extends BaseNode {
    type: string;
    props?: NodeProp[];
    children?: Node[];
}

/**
 * Text node
 */
export interface TextNode extends BaseNode {
    type: '#text';
    props: [{ name: 'textContent'; value: string }];
}

/**
 * Comment node
 */
export interface CommentNode extends BaseNode {
    type: '#comments';
    props: [{ name: 'text'; value: string }];
}

/**
 * Template wrapper node for multiple root elements
 */
export interface TemplateNode extends BaseNode {
    type: 'template';
    children: Node[];
}

/**
 * Union type for all possible node types
 */
export type Node = ElementNode | TextNode | CommentNode | TemplateNode;

/**
 * Options for the parser function
 */
export interface ParserOptions {
    /**
     * Array of tag names to ignore during parsing (case-insensitive)
     * @example ['script', 'style', 'iframe']
     */
    ignore?: string[];
}

/**
 * Options for the render function
 */
export interface RenderOptions {
    /**
     * Format output with newlines and indentation
     * @default false
     */
    pretty?: boolean;

    /**
     * Indentation string (used when pretty is true)
     * @default '  ' (two spaces)
     */
    indent?: string;

    /**
     * Override default void/self-closing elements list
     * @default ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']
     */
    selfClosingTags?: string[];

    /**
     * Self-close all empty elements using XML syntax (<tag />)
     * @default false
     */
    xmlMode?: boolean;
}

/**
 * Parse HTML or XML string into a JSON tree structure
 * @param html - The HTML or XML string to parse
 * @param options - Parser options
 * @returns Parsed JSON tree, or undefined if input has no elements
 * @throws {TypeError} If html is not a string
 *
 * @example
 * ```typescript
 * const tree = parser('<div class="card"><h1>Title</h1></div>');
 * ```
 *
 * @example
 * ```typescript
 * // Ignore script and style tags
 * const clean = parser(html, { ignore: ['script', 'style'] });
 * ```
 */
export function parser(html: string, options?: ParserOptions): Node | undefined;

/**
 * Render a JSON tree back into HTML or XML markup
 * @param tree - The JSON tree to render (single node or array of nodes)
 * @param options - Rendering options
 * @returns Rendered HTML/XML markup string
 *
 * @example
 * ```typescript
 * const html = render(tree);
 * ```
 *
 * @example
 * ```typescript
 * // Pretty print with custom indentation
 * const formatted = render(tree, { pretty: true, indent: '\t' });
 * ```
 *
 * @example
 * ```typescript
 * // XML mode
 * const xml = render(tree, { xmlMode: true });
 * ```
 */
export function render(tree: Node | Node[], options?: RenderOptions): string;
