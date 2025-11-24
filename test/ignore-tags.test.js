import assert from 'assert';
import parser from '../src/parser.js';
import render from '../src/render.js';

describe('Ignore Tags Option', function() {

    it('should ignore script tags', function() {
        const html = '<div>Before<script>alert("xss")</script>After</div>';
        const tree = parser(html, { ignore: ['script'] });
        const output = render(tree);

        assert.ok(!output.includes('<script'), 'Should not include script tag');
        assert.ok(!output.includes('alert'), 'Should not include script content');
        assert.ok(output.includes('Before'), 'Should include text before script');
        assert.ok(output.includes('After'), 'Should include text after script');
    });

    it('should ignore style tags', function() {
        const html = '<div><style>.red { color: red; }</style><p>Text</p></div>';
        const tree = parser(html, { ignore: ['style'] });
        const output = render(tree);

        assert.ok(!output.includes('<style'), 'Should not include style tag');
        assert.ok(!output.includes('.red'), 'Should not include style content');
        assert.ok(output.includes('<p>Text</p>'), 'Should include other elements');
    });

    it('should ignore multiple tag types', function() {
        const html = '<div><script>bad()</script><style>bad{}</style><p>Good</p></div>';
        const tree = parser(html, { ignore: ['script', 'style'] });
        const output = render(tree);

        assert.ok(!output.includes('script'), 'Should not include script');
        assert.ok(!output.includes('style'), 'Should not include style');
        assert.ok(!output.includes('bad'), 'Should not include bad content');
        assert.ok(output.includes('Good'), 'Should include good content');
    });

    it('should ignore nested script tags', function() {
        const html = '<div><div><script>nested()</script></div><span>Text</span></div>';
        const tree = parser(html, { ignore: ['script'] });
        const output = render(tree);

        assert.ok(!output.includes('script'), 'Should not include nested script');
        assert.ok(!output.includes('nested'), 'Should not include nested script content');
        assert.ok(output.includes('Text'), 'Should include text content');
    });

    it('should ignore case-insensitive tag names', function() {
        const html = '<div><SCRIPT>bad()</SCRIPT><Script>bad()</Script><p>Good</p></div>';
        const tree = parser(html, { ignore: ['script'] });
        const output = render(tree);

        assert.ok(!output.includes('SCRIPT'), 'Should ignore uppercase SCRIPT');
        assert.ok(!output.includes('Script'), 'Should ignore mixed case Script');
        assert.ok(!output.includes('bad'), 'Should not include any script content');
        assert.ok(output.includes('Good'), 'Should include good content');
    });

    it('should work without ignore option', function() {
        const html = '<div><script>code()</script><p>Text</p></div>';
        const tree = parser(html);
        const output = render(tree);

        // Without ignore option, script should be included
        assert.ok(output.includes('<script'), 'Should include script tag');
        assert.ok(output.includes('code'), 'Should include script content');
    });

    it('should handle empty ignore array', function() {
        const html = '<div><script>code()</script><p>Text</p></div>';
        const tree = parser(html, { ignore: [] });
        const output = render(tree);

        // With empty ignore array, everything should be included
        assert.ok(output.includes('<script'), 'Should include script tag');
        assert.ok(output.includes('code'), 'Should include script content');
    });

    it('should preserve structure when ignoring tags', function() {
        const html = `
            <div class="container">
                <header>Title</header>
                <script>ignored()</script>
                <main>
                    <p>Content</p>
                    <style>ignored</style>
                    <p>More</p>
                </main>
                <footer>End</footer>
            </div>`;

        const tree = parser(html, { ignore: ['script', 'style'] });
        const output = render(tree);

        assert.ok(output.includes('Title'), 'Should include header');
        assert.ok(output.includes('Content'), 'Should include first paragraph');
        assert.ok(output.includes('More'), 'Should include second paragraph');
        assert.ok(output.includes('End'), 'Should include footer');
        assert.ok(!output.includes('ignored'), 'Should not include ignored content');
        assert.ok(output.includes('<main>'), 'Should preserve structure');
    });

    it('should handle comments inside ignored tags', function() {
        const html = '<div><script><!-- comment --></script><p>Text</p></div>';
        const tree = parser(html, { ignore: ['script'] });
        const output = render(tree);

        assert.ok(!output.includes('comment'), 'Should ignore comments in ignored tags');
        assert.ok(output.includes('Text'), 'Should include normal content');
    });

    it('should roundtrip correctly with ignore option', function() {
        const html = '<div><p>Keep</p><script>Remove</script><span>Keep</span></div>';
        const expected = '<div><p>Keep</p><span>Keep</span></div>';

        const tree = parser(html, { ignore: ['script'] });
        const output = render(tree);

        assert.strictEqual(
            output.replace(/\s+/g, ''),
            expected.replace(/\s+/g, ''),
            'Should match expected output'
        );
    });
});
