const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const shortid = require('shortid');
const emoji = require('./emoji');
const fetch = str => emoji(str).then(arr => arr.slice(0, 4).join(''));
const mongoose = require('mongoose');
const punycode = require('punycode');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/static', express.static('public'));

var Schema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  url: { type: String, unique: true, required: true },
});
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

var mongolabUri = process.env.MONGODB_URI;
mongoose.connect(mongolabUri, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

var Keys = mongoose.model('Keys', Schema);



app.get('/:key?', (req, res) => {
  console.log('DOMAIN',req.headers.host);
  console.log(req.params.key, req.params.key ? true : false);
  if (req.params.key) {
    Keys.findOne({ 'key': req.params.key }, function (err, key) {
      if (!err && key) {
        res.redirect(301, key.url)
      } else {
        console.log('Fallback home', err, key);
        res.redirect(301, 'http://🌍✌🏼.ws')
      }
    });
  } else {
    res.send(`
      <html>
        <head>
          <title>🌍✌🏼</title>
          <meta name="image" content="https://emojipedia-us.s3.amazonaws.com/cache/52/23/52230e8ab5779d3b28c53725672bad99.png">
          <link rel="icon" href="/static/favicon.ico">
          <!-- Schema.org for Google -->
          <meta itemprop="name" content="🌍✌🏼">
          <meta itemprop="description" content="Shitty url shortener, emoji and ai powered. 🌍✌🏼">
          <meta itemprop="image" content="https://emojipedia-us.s3.amazonaws.com/cache/52/23/52230e8ab5779d3b28c53725672bad99.png">
          <!-- Twitter -->
          <meta name="twitter:card" content="summary">
          <meta name="twitter:title" content="🌍✌🏼">
          <meta name="twitter:description" content="Shitty url shortener, emoji and ai powered.">
          <meta name="twitter:site" content="@cagataycali">
          <meta name="twitter:creator" content="@cagataycali">
          <!-- Open Graph general (Facebook, Pinterest & Google+) -->
          <meta name="og:title" content="🌍✌🏼">
          <meta name="og:description" content="Shitty url shortener, emoji and ai powered.">
          <meta name="og:image" content="https://emojipedia-us.s3.amazonaws.com/cache/52/23/52230e8ab5779d3b28c53725672bad99.png">
          <meta name="og:url" content="http://🌍✌🏼.ws">
          <meta name="og:site_name" content="🌍✌🏼">
          <meta name="og:locale" content="en_US">
          <meta name="og:type" content="website">
        </head>
        <body>
          Home, sweet home.. 🏡<br>
          I guess you have a shitty URL. That's why you're here. 💩 <br>
          Let's see what I can do. <br><br>
          <form method="post" action="/">
            <input type="text" name="url" placeholder="Your shitty URL." required><br>
            Emoji ? <input type="checkbox" name="emoji" value="true">
            <input type="submit" value="FUCK IT">
          </form>
          <br>
          No reporting, no follow-up. It just works. <br>
          World is ours, be contributor. 🌍✌🏼<br>
          <a href="https://github.com/cagataycali/url-shortener">GitHub</a>
        </body>
       </html>
      `)
  }
});

app.post('/', async (req, res) => {
  let key = req.body.emoji ? await fetch(req.body.url) : shortid.generate();
  console.log(req.body);
  var keys = new Keys({
    url : req.body.url,
    key,
  });
  res.json({
    "💩": punycode.toUnicode(req.body.url),
    "😻": `${punycode.toUnicode(req.headers.host)}/${key}`,
    "message": "Do not do bad things to the server. Contributions welcome. http://🌍✌🏼.ws/♥☎💻❤"
  });
  keys.save(function (err, doc) {
    if (err && err.code === 11000 && !req.body.emoji) {
      Keys.update({ url: req.body.url }, { $set: { key: key }}, (err) => {
        console.log(err ? err : 'Updated');
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log(`Example app listening on port ${process.env.PORT || 3000}!`)
})
