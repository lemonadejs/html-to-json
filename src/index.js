import parser from './parser.js';
import render from './render.js';

const sample = `<note>
<to>Tove</to>
<from>Jani</from>
<heading>Reminder</heading>
<body>Don't forget me this weekend!</body>
</note>`;

let converted = parser(sample);

console.log(converted);
