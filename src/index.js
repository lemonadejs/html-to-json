import parser from './parser';
import render from './render';

const sample = `<note>
<to>Tove</to>
<from>Jani</from>
<heading>Reminder</heading>
<body>Don't forget me this weekend!</body>
</note>`;

let converted = parser(sample);

console.log(converted);
