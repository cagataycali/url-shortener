const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const punycode = require('punycode');
const subdomain = require('subdomain');
const check = require('ch3ck');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(subdomain({ base : '🌍✌🏼', removeWWW : true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

var Schema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  url: { type: String, unique: true, required: true },
});

var mongolabUri = process.env.MONGODB_URI;
mongoose.connect(mongolabUri, err => console.log(err ? err : 'Mongo connected.'));

var Keys = mongoose.model('Sites', Schema);

const find = (key) => {
  return new Promise((resolve, reject) => {
    console.log(key);
    Keys.findOne({ 'key': key }, (err, key) => {
      console.log(key);
      if (key && key.url.length > 0) {
        resolve(key);
      } else {
        reject(true);
      }
    });
  });
}

app.get('/check/:key', async (req, res) => {
  try {
    let response = await find(req.params.key);
      response.message = `Aww, ${res.url} grabbed it first.!`
      res.json(response);
  } catch (e) {
    if (req.params.key.length === 2) {
      res.json('If you want to use this emoji, you should open an issue.')
    } else {
      res.json('Available for purchase! Haha, It\'s joke. But contributions is welcome.')
    }
  }
});

app.get('/subdomain/:key/', async (req, res) => {
  try {
    req.params.key = punycode.toUnicode(req.params.key);
    const response = await find(req.params.key);
    console.log('REDIRECT', response);
    res.redirect(301, response.url);
  } catch (e) {
    res.json({message:'Available for purchase! Haha, It\'s joke. But contributions is welcome.'});
  }
});

app.get('/', (req, res) => res.sendFile('index.html'));

app.get('/:key', async (req, res) => {
  try {
    const response = await find(req.params.key);
    console.log('REDIRECT', response);
    res.redirect(301, response.url);
  } catch (e) {
    res.json({message:'Available for purchase! Haha, It\'s joke. But contributions is welcome.'});
  }
})

app.post('/', async (req, res) => {
  if (check(req.body.url) !== false) {
    let url = check(req.body.url);
    console.log(url);
    let emoji = req.body.emoji;

    if (emoji.length === 2) {
      res.json({status:false, message: 'If you want to use this emoji, you should open an issue.'})
    } else {
      let keys = new Keys({
       url,
       key: emoji,
     });

     keys.save((err, doc) => {
       if (err) {
         res.json({status:false, message: 'Somebody grabbed your emoji or you already shortened your url.'})
       } else {
         io.sockets.emit('new', `${emoji} grabbed by ${url} now.`)
         res.json({status:true, url: `http://${req.headers.host}/${emoji}`, subdomain: `http://${emoji}.${req.headers.host}`})
       }
     });
    }
 } else {
   res.json({status:false, message: 'Gimme valid url.'})
 }
});

http.listen(process.env.PORT || 3000, () => console.log(`Example app listening on port ${process.env.PORT || 3000}!`));
