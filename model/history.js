var mysql   = require("mysql");

function history(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

history.prototype.handleRoutes = function(router,connection){
  var self = this;

  router.post("/history",function(req,res){
      connection.query("SELECT * FROM history WHERE driverId= "+req.body.objectId,function(err,rows){
          if(err){
              res.json({"message":"error"});
          }else{
              res.json({"message":rows});
          };
      });
  });

  //storing transaction detail to history table (transId)
  router.post("/toHistory",function(req,res){
      var query = "INSERT INTO ??(??,??,??,??,??,??,??,??,??) VALUES (?,?,?,?,?,?,?,?,?)";
      var transId = req.body.transId;
      var fee=0,pickup=0,destination=0,pickUpAdress=0,driverId=0,destinationAddress="",username="",promocode="";
      connection.query("SELECT * FROM transaction WHERE objectId = "+transId,function(err,rows){
          fee = rows[0].fee;
          pickup = rows[0].pickUp;
          destination = rows[0].destination;
          pickUpAddress = rows[0].pickUpAddress;
          driverId = rows[0].driverId;
          destinationAddress = rows[0].destinationAddress;
          username = rows[0].username;
          promocode = rows[0].promocode;

        var table = ["history","fee","pickUp","destination","pickUpAddress","driverId","destinationAddress","username","transId","promocode",fee,pickup,destination,pickUpAddress,driverId,destinationAddress,username,transId,promocode];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "Error executing MySQL query "+query});
            } else {
                  var mining = "INSERT INTO `action_log`(`username`, `driverId`, `action`) VALUES (?,?,'driver finish')";
                  var body = [username,driverId];
                  mining = mysql.format(mining,body);
                  connection.query(mining,function(err,action){
                      if(err){
                          res.json({"message":"err.."+mining});
                      }else{
                          res.json({"Error" : false, "message" : "history Added !"});
                      }
                  })
            }
        });
          //deleting transaction
          // connection.query("DELETE from transaction WHERE objectId= "+transId);
          connection.query("UPDATE `transaction` set status='finnish' WHERE objectId= "+transId);
      });
  });
}

module.exports = history;
