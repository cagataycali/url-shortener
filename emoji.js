// Code original source : https://github.com/sindresorhus/emoj/blob/master/index.js
'use strict';
const got = require('got');

module.exports = str => got('emoji.getdango.com/api/emoji', {
	json: true,
	query: {
		q: str
	}
})
.then(res => res.body.results.map(x => x.text))
.catch(err => console.log(err))
