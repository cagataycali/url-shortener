#!/usr/bin/env node
var program = require('commander');
const Shortener = require('./index');

program
  .version('1.5.0')
  .arguments('<url> <emoji>')
  .action((url, emoji) => {
    const shorten = new Shortener();
    shorten.pick({url, emoji})
      .then(response => console.log(response))
      .catch(error => console.log(error.message))

  });

program.parse(process.argv);
