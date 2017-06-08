const Shortener = require('./index');

const shorten = new Shortener();
shorten.pick({url: 'https://github.com/', emoji: '👎👍'})
  .then(response => console.log(response))
  .catch(error => console.log(error))
