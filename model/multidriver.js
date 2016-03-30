var mysql   = require("mysql");
var request = require('request');
var gcm = require('node-gcm');

function multidriver(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

multidriver.prototype.handleRoutes = function(router,connection) {
	var self = this;

  //GET all data from transaction with cur transId
  router.post("/transaction_multipledriver",function(req,res){
      var transId = req.body.transId;
      var query = "SELECT * FROM transaction WHERE objectId='"+transId+"'";
      connection.query(query,function(err,rows){
          if(err) {
              res.json({"Error" : true, "Message" : "Error executing MySQL query"});
          } else {
              res.json({"Error" : false, "Message" : "Success", "Trans" : rows});
          }
      });
  });

  router.delete("/transaction_multipledriver",function(req,res){
      var transId = req.body.transId;
      var username = req.body.username;
      connection.query("SELECT * FROM `transaction` WHERE objectId= "+transId+"",function(err,rows){
        if (err) {
          res.json({"message":"1 "+err});
        }else{
          connection.query("UPDATE transaction SET status = 'cancel', drivertemp = 'no' WHERE objectId= "+transId+"",function(err,suc){
            if (err) {
              res.json({"message":"2 "+rows.length});
            }else{
              if (rows.length<=0) {
                res.json({"message":"err"});
              }else{
                // DATA MINING
                var cancel_mining = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
                var table = [username,"","user cancel"];
                cancel_mining = mysql.format(cancel_mining,table);
                connection.query(cancel_mining,function(err,suc){
                  if (err) {
                    res.json({"message":"3 "+err});
                  }else{
                    res.json({"message":"successfully delete transaction"}); //dont change the response
                  }
                })
              }
            }
          })
        }
      });
  });

  router.post("/cancelTransMulti",function(req,res){
      var transId = req.body.transId;
      var username = req.body.username;
      connection.query("SELECT * FROM `transaction` WHERE objectId= "+transId+"",function(err,rows){
        if (err) {
          res.json({"message":"1 "+err});
        }else{
          connection.query("UPDATE transaction SET status = 'cancel', drivertemp = 'no' WHERE objectId= "+transId+"",function(err,suc){
            if (err) {
              res.json({"message":"2 "+rows.length});
            }else{
              if (rows.length<=0) {
                res.json({"message":"err"});
              }else{
                // DATA MINING
                var cancel_mining = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
                var table = [username,"","user cancel"];
                cancel_mining = mysql.format(cancel_mining,table);
                connection.query(cancel_mining,function(err,suc){
                  if (err) {
                    res.json({"message":"3 "+err});
                  }else{
                    res.json({"message":"successfully delete transaction"}); //dont change the response
                  }
                })
              }
            }
          })
        }
      });
  });

  //create transaction
  router.post("/transactionInsert_multipledriver",function(req,res){
      var username = req.body.username;
      var actualLocation = req.body.actualLocation;
      var promocode = req.body.promoCode;
      connection.query("SELECT * FROM setting",function(err,fee){
          if(err){
               res.json({"message":"err .."});
          }else{
              var query = "INSERT INTO `transaction` (username,fee,notif,pickUp,remark,destination,pickUpAddress,actualLocation,promocode) VALUES (?,?,?,?,?,?,?,?,?)";
              var table = [username,req.body.fee,req.body.notif,req.body.pickUp,req.body.remark,req.body.destination,req.body.pickUpAddress,actualLocation,promocode];
              query = mysql.format(query,table);
              connection.query(query,function(err,rows){
                  if(err) {
                      res.json({"Error" : true, "message" : "error "+query});
                  } else {
                      connection.query("SELECT objectId FROM transaction WHERE username= '"+username+"' and status = 'active' and statusAdvance = '-'",function(err,id){
                          if(err){
                              res.json({"message":"error "+query});
                          }else {
                              res.json({"message":"success "+id[0].objectId});
                          }
                      });
                  }
              });
          }
      });
  });

  // check is the usr is already been deleted
  router.post("/checkUsername_multipledriver",function(req,res){
      var transId = req.body.transId;
      var query = "SELECT username FROM transaction WHERE objectId='"+transId+"' and status = 'active'";
      connection.query(query,function(err,rows){
          if(err) {
              res.json({"error" : true, "message" : "Error executing MySQL query"});
          } else {
              if(rows.length>0)
              {
                  res.json({"message":"error"}); //is not been deleted
              }
              else
              {
                  res.json({"message":"success"}); //is been deleted
              }
          }
      });
  });
}

module.exports = multidriver;
