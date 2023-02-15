const yargsParser = require('yargs-parser');

const {
  argv = []
} = process;

const args = argv.slice(2);

module.exports = new Map(Object.entries(yargsParser(args)));
