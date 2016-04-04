var mysql   = require("mysql");
var request = require('request');
var gcm = require('node-gcm');

function dashboard(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

dashboard.prototype.handleRoutes = function(router,connection,md5) {
	var self = this;

  router.get("/Allusers",function(req,res){
      var username = req.params.username || req.body.username;
      var query = "SELECT objectId FROM user";
      connection.query(query,function(err,rows){
          if(err) {
              res.json({"message":query});
          } else {
              res.json({"message":rows});
          }
      });
  });

  router.post("/allTransaction",function(req,res){
        connection.query("SELECT * FROM transaction where status = 'active' ORDER BY `objectId` DESC",function(err,rows){
            if(err){
                res.json({"message":"error"});
            }else{
                res.json({"message":rows});
            };
        });
    });

    router.post("/allHistory",function(req,res){
        connection.query("SELECT * FROM history ORDER BY `objectId` DESC",function(err,rows){
            if(err){
                res.json({"message":"error"});
            }else{
                res.json({"message":rows});
            };
        });
    });

    router.get("/driverC",function(req,res){
        var objectId = req.body.driverId;
        var query = "SELECT objectId,NAME,phone,rating,credit,photo FROM `driver`";
        connection.query(query,function(err,rows){
            if(err) {
                // res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                res.json({"Error" : true, "Message" : query});
            } else {
                res.json({"message" : rows});
            }
        });
    });

    router.get("/driverOn",function(req,res){
        var objectId = req.body.driverId;
        var query = "SELECT NAME,phone,rating,credit,photo,objectId FROM `driver` WHERE `status`='1'";
        connection.query(query,function(err,rows){
            if(err) {
                // res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                res.json({"Error" : true, "Message" : query});
            } else {
                res.json({"message" : rows});
            }
        });
    });

    router.get("/driverStartJob",function(req,res){
        var objectId = req.body.driverId;
        var query = "SELECT * FROM `transaction` WHERE `startjob`='startjob' AND `status`='active'";
        connection.query(query,function(err,rows){
            if(err) {
                // res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                res.json({"message" : query});
            } else {
                res.json({"message" : rows});
            }
        });
    });

    router.get("/driverLogFin",function(req,res){
        var transId = req.params.transId || req.body.transId;
        var query = "SELECT objectId,`action` FROM `action_log` WHERE `action` = 'driver finish'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"message" : rows});
                }
            }
        });
    });

    router.get("/userLogReq",function(req,res){
        var transId = req.params.transId || req.body.transId;
        var query = "SELECT objectId,`action` FROM `action_log` WHERE `action` = 'user request'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"message" : rows});
                }
            }
        });
    });

}
module.exports = dashboard;
