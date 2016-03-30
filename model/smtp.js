var simplesmtp = require('simplesmtp');
var express = require('express');
var mysql   = require("mysql");
var app = express();

function smtp(router,connection,md5){
    var self = this;
    self.handleRoutes(router,connection,md5);
}

smtp.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;

    router.post("/web-reg-email",function(req,res){
        var mailto = req.body.mailto;
        var pass = req.body.pass;
        mail('info@node8.net',mailto,messageP(mailto,pass));
        res.json({"message":"yess"});
    });

    router.post("/smtp",function(req,res){
        var username = req.body.username;
        var password = randomString();
        connection.query("SELECT username FROM user WHERE username= '"+username+"'",function(err,rows){
            if(err){
                res.json({"message":"error"});
            }else{
                if(rows.length<1){
                    res.json({"message":"wrong email address"});
                }else{
                    mail('info@node8.net',username,message(username,password));
                    var query = "UPDATE user SET password= '"+md5(password)+"' WHERE username= '"+username+"'";
                    connection.query(query,function(err,rows){
                        if(err){
                            res.json({"message":"err.."+query});
                        }else{
                            res.json({"message":"successfully sent email "});
                        }
                    });

                }
            }
        });
    });

     router.post("/smtpBill",function(req,res){
        var username = req.body.username;
        var password = randomString();
        connection.query("SELECT username FROM user WHERE username= '"+username+"'",function(err,rows){
            if(err){
                res.json({"message":"error"});
            }else{
                if(rows.length<1){
                    res.json({"message":"wrong email address"});
                }else{
                    mail('info@node8.net',username,sendBill(username));
                    var query = "UPDATE user SET password= '"+md5(password)+"' WHERE username= '"+username+"'";
                    connection.query(query,function(err,rows){
                        if(err){
                            res.json({"message":"err.."+query});
                        }else{
                            res.json({"message":"successfully sent email "});
                        }
                    });

                }
            }
        });
    });

}

function message(username,randomString) {
    var intro = "hi "+username+"\n";
    var body = "Your password has been changed. Your new password is: \n\n"+randomString+"\n\n";
    var closing = "Thank you, \n valetuncle";
    return intro+body+closing;
}

function messageP(username,pass) {
    var intro = "hi "+username+"\n";
    var body = "Thanks For registering. Your password is: \n\n"+pass+"\n\n";
    var closing = "Thank you, \n valetuncle";
    return intro+body+closing;
}

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

function mail(from, to, message) {

    var client = simplesmtp.connect(587, 'smtp.gmail.com', {
        secureConnection: false,
        auth: {
            user: 'info@node8.net',
            pass: 'trqmlckyrvvaqzpr'
        },
        debug: true
    });

    client.once('idle', function() {
        client.useEnvelope({
            from: from,
            to: [].concat(to || [])
        });
    });

    client.on('message', function() {
        client.write(message.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..'));
        client.end();
    });

    client.on('ready', function(success) {
        client.quit();
    });

    client.on('error', function(err) {
        console.log('ERROR');
        console.log(err);
    });

    client.on('end', function() {
        console.log('DONE');
    });
}

app.listen(3360);
module.exports = smtp;
