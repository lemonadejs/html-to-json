/**
 * Convert a parsed JSON tree (from HTMLParser) back into HTML/XML markup.
 * This is a clean implementation without LemonadeJS events, bindings, or dynamic features.
 * It simply reconstructs the original HTML/XML from the parsed JSON structure.
 *
 * @param {Object|Array} tree - Parsed node or list of nodes to render.
 * @param {Object} options - Rendering options.
 * @param {boolean} [options.pretty=false] - Format output with newlines and indentation.
 * @param {string} [options.indent='  '] - Indentation string when pretty printing.
 * @param {string[]} [options.selfClosingTags] - Optional override for void/self-closing elements.
 * @param {boolean} [options.xmlMode=false] - Use XML self-closing syntax for all empty elements.
 * @returns {string} HTML/XML markup string created from the tree.
 */
export default function render(tree, options = {}) {
    // Void elements default list (can be overridden via options.selfClosingTags)
    const voidElements = new Set(
        (options.selfClosingTags || [
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'source', 'track', 'wbr'
        ]).map(tag => tag.toLowerCase())
    );

    const settings = {
        pretty: !!options.pretty,
        indent: options.indent || '  ',
        xmlMode: !!options.xmlMode,
    };

    const newline = settings.pretty ? '\n' : '';

    /**
     * Escape special characters in attribute values
     * @param {*} value - Attribute value
     * @returns {string} Escaped value
     */
    const escapeAttribute = function(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;');
    };

    /**
     * Escape special characters in text content
     * @param {*} value - Text content
     * @returns {string} Escaped text
     */
    const escapeText = function(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    /**
     * Normalize props to an array of name/value pairs
     * @param {*} props - Props from node (array or object)
     * @returns {Array<{name: string, value: *}>} Normalized props array
     */
    const normalizeProps = function(props) {
        if (!props) {
            return [];
        }

        if (Array.isArray(props)) {
            return props;
        }

        if (typeof props === 'object') {
            return Object.keys(props).map(key => ({ name: key, value: props[key] }));
        }

        return [];
    };

    /**
     * Get a property value from node props by name
     * @param {Object} node - Node object
     * @param {string} propName - Property name to find
     * @returns {*} Property value or empty string
     */
    const getPropValue = function(node, propName) {
        const props = normalizeProps(node?.props);
        const prop = props.find(p => p.name === propName);
        return prop ? prop.value : '';
    };

    /**
     * Render element attributes as a string
     * @param {Object} node - Node object
     * @returns {string} Attributes string (with leading space if not empty)
     */
    const renderAttributes = function(node) {
        const props = normalizeProps(node?.props);
        if (!props.length) {
            return '';
        }

        const attrs = props
            .filter(prop => prop && typeof prop.name === 'string' && prop.name.length && prop.name !== 'textContent')
            .map(prop => {
                const value = typeof prop.value === 'undefined' ? prop.name : prop.value;
                return `${prop.name}="${escapeAttribute(value)}"`;
            })
            .filter(Boolean);

        return attrs.length ? ' ' + attrs.join(' ') : '';
    };

    /**
     * Render child nodes
     * @param {Array} children - Array of child nodes
     * @param {number} depth - Current indentation depth
     * @returns {string} Rendered children
     */
    const renderChildren = function(children, depth) {
        if (!children || !Array.isArray(children) || !children.length) {
            return '';
        }

        return children
            .map(child => renderNode(child, depth))
            .filter(fragment => fragment !== '')
            .join(settings.pretty ? '\n' : '');
    };

    /**
     * Render a single node
     * @param {*} node - Node to render
     * @param {number} depth - Current indentation depth
     * @returns {string} Rendered HTML/XML
     */
    const renderNode = function(node, depth = 0) {
        if (!node) {
            return '';
        }

        // Handle array of nodes
        if (Array.isArray(node)) {
            return node.map(child => renderNode(child, depth)).join(settings.pretty ? '\n' : '');
        }

        const indent = settings.pretty ? settings.indent.repeat(depth) : '';

        // Handle template wrapper (skip rendering, just render children)
        if (node.type === 'template') {
            return renderChildren(node.children, depth);
        }

        // Handle text nodes
        if (node.type === '#text') {
            return indent + escapeText(getPropValue(node, 'textContent'));
        }

        // Handle comment nodes
        if (node.type === '#comments') {
            const text = getPropValue(node, 'text');
            return `${indent}<!--${text}-->`;
        }

        // Handle element nodes
        const tagName = node.type;

        // Invalid node - tag name is required
        if (!tagName || typeof tagName !== 'string') {
            return '';
        }

        const attributes = renderAttributes(node);
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const children = hasChildren ? renderChildren(node.children, depth + 1) : '';
        const tag = String(tagName);

        // Decide if element should be self-closing
        const canSelfClose = !hasChildren && (settings.xmlMode || voidElements.has(tag.toLowerCase()));

        if (canSelfClose) {
            return `${indent}<${tag}${attributes} />`;
        }

        if (settings.pretty && hasChildren && children.length) {
            return `${indent}<${tag}${attributes}>${newline}${children}${newline}${indent}</${tag}>`;
        }

        return `${indent}<${tag}${attributes}>${children}</${tag}>`;
    };

    return renderNode(tree);
};
