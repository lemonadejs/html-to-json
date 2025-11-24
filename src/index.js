const HTMLParser = function(html, values) {
    /**
     * process the scape chars
     * @param char
     * @returns {*|string}
     */
    function escape(char) {
        const escapeMap = {
            'n': String.fromCharCode(0x0A),
            'r': String.fromCharCode(0x0D),
            't': String.fromCharCode(0x09),
            'b': String.fromCharCode(0x08),
            'f': String.fromCharCode(0x0C),
            'v': String.fromCharCode(0x0B),
            '0': String.fromCharCode(0x00)
        };

        return escapeMap[char] || char;
    }

    /**
     * Check if is a self-closing tag
     * @param {string|function} type - Tag name or component function
     * @returns {boolean}
     */
    function isSelfClosing(type) {
        if (! type) {
            return false;
        } else {
            // List of self-closing or void HTML elements
            const selfClosingTags = [
                'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'
            ];
            // Convert tagName to lowercase to ensure case-insensitive comparison
            return typeof(type) === 'function' || selfClosingTags.includes(type.toLowerCase());
        }
    }

    /**
     * Create a text node and add it to current node's children
     * @param {Object} tag - Text node properties
     */
    const createTextNode = function(tag) {
        if (! this.current.children) {
            this.current.children = [];
        }

        this.current.children.push({
            type: '#text',
            parent: this.current,
            props: [tag],
        });
    }

    /**
     * Find the parent node by tag name
     * @param {Object} node - Current node
     * @param {string} type - Tag name to find
     * @returns {Object|undefined}
     */
    const findParentByTagName = function(node, type) {
        if (node && type) {
            if (node.type === type) {
                return node;
            } else {
                return findParentByTagName(node.parent, type);
            }
        }

        return undefined;
    }

    /**
     * Get expression value and update tag metadata
     * @param {Object} tag - Tag to update
     * @returns {*} Expression value
     */
    const getExpression = function(tag) {
        // Get value
        const v = values && values[this.index] !== undefined ? values[this.index] : '';
        if (tag) {
            // Keep the reference
            tag.expression = this.reference;
            // Keep the index
            tag.index = this.index;
        }
        // Move the value index
        this.index++;
        // Delete reference
        delete this.reference;
        // Return value
        return v;
    }

    /**
     * Handle the text node creation
     */
    const commitText = function() {
        if (typeof(this.text) !== 'undefined') {
            const text = this.text.replace(/\r?\n\s+/g, '');
            if (text) {
                createTextNode.call(this, { name: 'textContent', value: text });
            }
            delete this.text;
        }
    }

    const commitComments = function() {
        if (typeof(this.comments) !== 'undefined') {
            let comments = this.comments;
            if (comments) {
                comments = comments
                    .replace('<!--', '')
                    .replace('-->', '')

                if (! this.current.children) {
                    this.current.children = [];
                }

                this.current.children.push({
                    type: '#comments',
                    parent: this.current,
                    props: [{ name: 'text', value: comments }],
                });
            }
            delete this.comments;
        }
    }

    /**
     * Save the attribute to the tag
     */
    const commitAttribute = function() {
        if (this.tag.attributeName) {
            // Commit any current attribute
            if (! this.tag.props) {
                this.tag.props = [];
            }

            let k = this.tag.attributeName;
            let v = this.tag.attributeValue;

            if (typeof(v) === 'undefined') {
                v = k;
            }

            let tag = {
                name: k,
                value: v,
            };

            if (typeof(this.tag.expression) !== 'undefined') {
                tag.index = this.tag.index;
                tag.expression = this.tag.expression;
            }

            this.tag.props.push(tag);

            // Clean up temporary properties
            delete this.tag.attributeName;
            delete this.tag.attributeValue;
            delete this.tag.index;
            delete this.tag.expression;

            if (this.tag.attributeIsReadyToClose) {
                delete this.tag.attributeIsReadyToClose;
            }
        }
    }

    /**
     * Actions controller
     * @param {Object} control - Parser control object
     * @param {string} char - Current character
     */
    const actions = function(control, char) {
        const method = control.action || 'text';
        if (typeof actions[method] === 'function') {
            actions[method].call(control, char);
        }
    }

    /**
     * Extract content between expression markers, handling quoted content
     * @param {string} html - Full HTML string
     * @param {number} startIndex - Starting index (position after ${})
     * @returns {Object} Expression content and ending position
     */
    function extractExpressionContent(html, startIndex) {
        let text = '';
        let i = startIndex;
        let insideQuotes = null;

        while (i < html.length) {
            const char = html[i];

            // Handle quotes
            if ((char === '"' || char === "'" || char === '`')) {
                if (!insideQuotes) {
                    insideQuotes = char;
                } else if (char === insideQuotes) {
                    insideQuotes = null;
                }
            }

            // Found closing brace outside quotes
            if (char === '}' && !insideQuotes) {
                return {
                    content: text,
                    position: i
                };
            }

            text += char;
            i++;
        }

        return {
            content: text,
            position: i
        };
    }

    /**
     * Process a new tag
     * @param char
     */
    actions.processTag = function(char) {
        // Just to check if there are any text to commit
        commitText.call(this);

        // Process the tag
        if (char === '<') {
            // Create new tag
            this.tag = {
                type: '',
                parent: this.current
            };
        } else if (char.match(/[a-zA-Z0-9-]/)) {
            // Tag name
            this.tag.type += char;
        } else {
            if (char === '$' && this.reference) {
                // Custom tags
                this.tag.type = getExpression.call(this);
            }
            // Finished with tag name, move to attribute handling
            this.action = 'attributeName';
        }
    }

    /**
     * Handle tag closing
     * @param char
     */
    actions.closeTag = function(char) {
        // Make sure to commit attribute
        commitAttribute.call(this);
        // Close the tag
        if (char === '>') {
            // Get the new parent
            if (isSelfClosing(this.tag.type)) {
                // Push new tag to the parent
                if (! this.tag.parent.children) {
                    this.tag.parent.children = [];
                }
                this.tag.parent.children.push(this.tag);
            } else if (this.tag.closingTag) {
                // Need to find the parent on the chain
                const parentNode = findParentByTagName(this.tag.parent, this.tag.type);
                if (parentNode) {
                    this.current = parentNode.parent;
                }
            } else {
                if (this.tag.closing) {
                    // Current is the parent
                    this.current = this.tag.parent;
                } else {
                    this.current = this.tag;
                }

                // Push new tag to the parent
                if (! this.tag.parent.children) {
                    this.tag.parent.children = [];
                }
                this.tag.parent.children.push(this.tag);
            }

            // Remote temporary properties
            delete this.tag.insideQuote;
            delete this.tag.closingTag;
            delete this.tag.closing;
            // Finalize tag
            this.tag = null;
            // New action
            this.action = 'text';
        } else if (! this.tag.locked) {
            if (char === '/') {
                if (! this.tag.type) {
                    // This is a closing tag
                    this.tag.closingTag = true;
                }
                // Closing character is found
                this.tag.closing = true;
            } else if (char.match(/[a-zA-Z0-9-]/)) {
                // If is a closing tag, get the tag name
                if (this.tag.closingTag) {
                    this.tag.type += char;
                }
            } else {
                // Wait to the closing sign
                if (this.tag.type) {
                    this.locked = true;
                }
            }
        }
    }

    actions.attributeName = function(char) {
        // There is another attribute to commit
        if (this.tag.attributeIsReadyToClose) {
            commitAttribute.call(this);
        }

        // Build attribute name
        if (char.match(/[a-zA-Z0-9-:]/)) {
            if (! this.tag.attributeName) {
                this.tag.attributeName = '';
            }
            this.tag.attributeName += char;
        } else if (char === '=') {
            // Move to attribute value
            if (this.tag.attributeName) {
                this.action = 'attributeValue';
                delete this.tag.attributeIsReadyToClose;
            }
        } else if (char.match(/\s/)) {
            if (this.tag.attributeName) {
                this.tag.attributeIsReadyToClose = true;
            }
        }
    };

    actions.attributeValue = function(char) {
        if (! this.tag.attributeValue) {
            this.tag.attributeValue = '';
        }

        if (char === '"' || char === "'") {
            if (this.tag.insideQuote) {
                if (this.tag.insideQuote === char) {
                    this.tag.insideQuote = false;
                } else {
                    this.tag.attributeValue += char;
                }
            } else {
                this.tag.insideQuote = char;
            }
        } else {
            if (char === '$' && this.reference) {
                // Custom tags
                char = getExpression.call(this, this.tag);
            }
            // Inside quotes, keep appending to the attribute value
            if (this.tag.insideQuote) {
                if (this.tag.attributeValue) {
                    this.tag.attributeValue += char;
                } else {
                    this.tag.attributeValue = char;
                }
            } else if (typeof(char) === 'string' && char.match(/\s/)) {
                if (this.tag.attributeValue) {
                    this.action = 'attributeName';
                }
                this.tag.attributeIsReadyToClose = true;
            } else {
                if (this.tag.attributeIsReadyToClose) {
                    this.action = 'attributeName';
                    actions.attributeName.call(this, char);
                } else {
                    if (this.tag.attributeValue) {
                        this.tag.attributeValue += char;
                    } else {
                        this.tag.attributeValue = char;
                    }
                }
            }
        }
    }

    actions.text = function(char) {
        if (char === '$' && this.reference) {
            // Just to check if there are any text to commit
            commitText.call(this);
            // Custom tags
            let tag = { name: 'textContent' }
            tag.value = getExpression.call(this, tag);
            // Add node tag
            createTextNode.call(this, tag);
        } else {
            if (referenceControl === 1) {
                // Just to check if there are any text to commit
                commitText.call(this);
            }

            // Normal text processing
            if (! this.text) {
                this.text = '';
            }
            this.text += char; // Keep appending to text content

            if (referenceControl === 2) {
                // Just to check if there are any text to commit
                commitText.call(this);
            }
        }
    }

    actions.comments = function(char) {
        if (! this.comments) {
            this.comments = '';
        }
        this.comments += char;

        if (this.comments.endsWith('-->')) {
            commitComments.call(this);
            this.action = 'text';
        }
    }

    // Control the LemonadeJS native references
    let referenceControl = null;

    const result = { type: 'template' };
    const control = {
        current: result,
        action: 'text',
        index: 0,
    };

    // Input validation
    if (typeof html !== 'string') {
        throw new TypeError('HTML input must be a string');
    }

    // Main loop to process the HTML string
    for (let i = 0; i < html.length; i++) {
        // Current char
        let char = html[i];

        if (control.action === 'text' && char === '<' && html[i+1] === '!' && html[i+2] === '-' && html[i+3] === '-') {
            control.action = 'comments';
        }

        if (control.action !== 'comments') {
            let escaped = false;

            if (values !== null) {
                // Handle scape
                if (char === '\\') {
                    // This is a escaped char
                    escaped = true;
                    // Parse escape char
                    char = escape(html[i+1]);
                    // Move to the next char
                    i++;
                }
            }

            // Global control logic
            if (control.tag) {
                if (char === '>' || char === '/') {
                    // End of tag, commit any attributes and go back to text parsing
                    if (!control.tag.insideQuote) {
                        control.action = 'closeTag';
                    }
                }
            } else {
                if (char === '<') {
                    control.action = 'processTag';
                }
            }

            // Register references for a dynamic template
            if (!escaped && char === '$' && html[i + 1] === '{') {
                const result = extractExpressionContent(html, i + 2);
                control.reference = result.content;
                i = result.position;
            }

            // Control node references
            if (char === '{' && html[i + 1] === '{') {
                referenceControl = 1;
            } else if (char === '}' && html[i - 1] === '}') {
                referenceControl = 2;
            }
        }

        // Execute action
        actions(control, char);

        // Reference control
        referenceControl = null;
    }

    // Handle any remaining text
    commitText.call(control);

    return result.children && result.children[0];
}