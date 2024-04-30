const fs = require('fs');

const BondCurveLinear = fs.readFileSync(__dirname + '/../contracts/BondCurveLinear.aes', 'utf-8');
fs.writeFileSync(__dirname + '/../generated/BondCurveLinear.aes.js', `module.exports = \`\n${BondCurveLinear.replace(/`/g, "\\`")}\`;\n`, 'utf-8');

