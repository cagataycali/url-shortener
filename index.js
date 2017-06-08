const request = require('request');

class Shortener {
  constructor(base) {
    this.base = base || 'http://👎👍.ws';
  }
  pick(obj) {
    return new Promise((resolve, reject) => {
      const url = obj.url;
      const emoji = obj.emoji;
      request.post({url: this.base, form: { url, emoji }}, (err, res, body) => {
        if (res.statusCode === 200) {
          resolve(body);
        } else {
          reject(res.statusCode);
        }
      })
    });
  }
}

module.exports = Shortener;
