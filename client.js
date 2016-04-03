var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , request = require('request');

// -------------------- for testing purpose -------------------------------

//52.76.73.21:3000/api/authenticate

var autoRequest = {
  url: 'http://52.76.73.21:3000/api/transactionInsert',
  form: {
    username:'autoRequest',
    remark: 'this is autoRequest',
    pickUp: '-6.9120728;107.5779945',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NDgwODY2NTd9.IK0ZCmhno2M_JxaN4Gw8q1Zl1XfAGslCBtqIGxnOs-w'
  }
};

var autoCancel = {
  url: 'http://52.76.73.21:3000/api/autoCancel',
  form: {
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NDgwODY2NTd9.IK0ZCmhno2M_JxaN4Gw8q1Zl1XfAGslCBtqIGxnOs-w'
  }
};

var autoAccept = {
  url: 'http://52.76.73.21:3000/api/autoAccept',
  form: {
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NDgwODY2NTd9.IK0ZCmhno2M_JxaN4Gw8q1Zl1XfAGslCBtqIGxnOs-w'
  }
};

function myFunction() {
    var option = autoRequest;
    request.post(option,function(error,httpResponse,body){
        if (!error && httpResponse.statusCode == 200) {
          console.log(body)
        }else{
          console.log(body)
        }
    });
}




myFunction();
