var parse = require('csv-parse');
var request = require('request');

var url = 'https://docs.google.com/spreadsheets/d/16LcVmLS3Da94C4-KuX_ijAh8K0XUgkgQRwOP-5EIM2Y/pub?gid=1273153276&single=true&output=csv';

function fetchCoupons() {
  request.get(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
          parse(body, {comment: '#'}, (err, output) => {
            console.log('fcs', output);
          });
      }
  });
}

module.exports = fetchCoupons;
