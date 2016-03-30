var mysql   = require("mysql");
var GeoPoint = require("geopoint");

function transaction(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

transaction.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;

    router.post("/updateTransaction",function(req,res){
        var transId = req.body.transId;
        //things that user can change
        var input = req.body.input;
        var query = "UPDATE transaction SET "+input+" WHERE objectId = "+transId;
        connection.query(query,function(err,success){
            if(err){
                res.json({"message":"error"});
            }else {
                res.json({"message":"success"});
            }
        });
    });

    router.post("/driverTemp",function(req,res){
        var driverId = req.body.driverId;
        connection.query("SELECT objectId FROM transaction WHERE driverId = "+driverId,function(err,suc){
            if(err){
                res.json({"message":"err.."});
            }else{
                res.json({"message":"success "+suc[0].objectId});
            }
        });
    });

    //GET all data from transaction with cur transId
    router.post("/transaction",function(req,res){
        var username = req.body.username;
        var query = "SELECT * FROM transaction WHERE username='"+username+"' AND status = 'active'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Success", "Trans" : rows});
            }
        });
    });

    router.post("/getTransaction",function(req,res){
        //punya distra
        // var driverId = req.body.driverId;
        // var query = "SELECT objectId,pickUpAddress,username,remark FROM transaction WHERE (driverTemp="+driverId+" OR driverId="+driverId+") AND status = 'active' LIMIT 1";
        // connection.query(query,function(err,rows){
        //     if(err) {
        //         res.json({"message" : query});
        //     } else {
        //         if(rows.length==1){
        //             res.json({"message" : "Success;"+rows[0].pickUpAddress+";"+rows[0].remark+";"+rows[0].objectId+";"+rows[0].username});
        //         }else{
        //             res.json({"message" : "error;"});
        //         }
        //     }
        // });


        // //punya mei
        // var driverId = req.body.driverId;
        // //cuma drivertemp soalnya kalo or driverid, bakal terus2an success jadi bakal looping terus d si driver
        // //jadi hrs ad 1 query tambahan yg d bedain untuk pindah activity
        // var query = "SELECT objectId,pickUpAddress,username,remark FROM transaction WHERE ((driverTemp="+driverId+") AND (status = 'active')) LIMIT 1";
        // connection.query(query,function(err,rows){
        //     if(err) {
        //         res.json({"message" : query});
        //     } else {
        //         if(rows.length==1){
        //             res.json({"message" : "Success;"+rows[0].pickUpAddress+";"+rows[0].remark+";"+rows[0].objectId+";"+rows[0].username});
        //         }else{
        //             res.json({"message" : "error;"});
        //         }
        //     }
        // });

        //punya mei pake yg buat pindah activity
        var driverId = req.body.driverId;
        //var query = "SELECT MAX(notif) FROM transaction WHERE (driverId="+driverId+" AND status = 'active') LIMIT 1";
        connection.query("SELECT notif FROM transaction WHERE (driverId="+driverId+" AND status = 'active') LIMIT 1 ;",function(err,rows){
            if(err){
                res.json({"message":"err.."});
            }else
            {
                if(rows.length==1)
                {
                    if(rows[0].notif == "1")
                    {
                        // res.json({"message":"changeactivity"});
                        var query = "SELECT objectId,pickUpAddress,username,remark,fee FROM transaction WHERE ((driverId="+driverId+") AND (status = 'active')) LIMIT 1";
                        connection.query(query,function(err,rows){
                            if(err) {
                                res.json({"message" : query});
                            } else {
                                if(rows.length==1){
                                    res.json({"message" : "changeactivity;"+rows[0].pickUpAddress+";"+rows[0].remark+";"+rows[0].objectId+";"+rows[0].username+";"+rows[0].fee});
                                }else{
                                    res.json({"message" : "errorCA;"});
                                }
                            }
                        });
                    }
                    else
                    {
                        res.json({"message":"err.."});
                    }
                }
                else{
                    var query = "SELECT objectId,pickUpAddress,username,remark,fee FROM transaction WHERE ((driverTemp="+driverId+") AND (status = 'active')) LIMIT 1";
                        connection.query(query,function(err,rows){
                            if(err) {
                                res.json({"message" : query});
                            } else {
                                if(rows.length==1){
                                    res.json({"message" : "Success;"+rows[0].pickUpAddress+";"+rows[0].remark+";"+rows[0].objectId+";"+rows[0].username+";"+rows[0].fee});
                                }else{
                                    res.json({"message" : "error;"});
                                }
                            }
                        });
                }
            }
        });
    });

    //fungsi buat pindah activity, dipanggil barengan sama gettransaction biasa
    router.post("/getTransaction_pindahactivity",function(req,res){
        var driverId = req.body.driverId;
        //var query = "SELECT MAX(notif) FROM transaction WHERE (driverId="+driverId+" AND status = 'active') LIMIT 1";
        connection.query("SELECT notif FROM transaction WHERE (driverId="+driverId+" AND status = 'active') ;",function(err,rows){
            if(err){
                res.json({"message":"err.."});
            }else {
                if(rows[0].notif == "1")
                {
                    res.json({"message":"success"});
                }
                else
                {
                    res.json({"message":"err.."});
                }
            }
        });
    });

    router.post("/getDistance",function(req,res){
        var driverLoc = req.body.driverLoc;
        var transId = req.body.transId;

        connection.query("SELECT pickUp FROM transaction WHERE objectId= "+transId,function(err,rows){
            if(err){
                res.json({"message":"err.."});
            }else {
                if(rows.length>=1)
                {
                    userLoc = rows[0].pickUp;

                     //driver
                    var dLocTemp = driverLoc.split(";");
                    var dlatitude = Number(dLocTemp[0]);
                    var dlongitude = Number(dLocTemp[1]);
                    var driver = new GeoPoint(dlatitude,dlongitude);

                    //user
                    var uLocTemp = userLoc.split(";");
                    var ulatitude = Number(uLocTemp[0]);
                    var ulongitude = Number(uLocTemp[1]);
                    var user = new GeoPoint(ulatitude,ulongitude);

                    var distance = driver.distanceTo(user,true);
                    res.json({"message":distance});
                }
                else
                {
                    res.json({"message":"err.."});
                }
            }
        });

    });

    router.delete("/transaction",function(req,res){
        var username = req.body.username;
        connection.query("SELECT * FROM `transaction` WHERE username= '"+username+"' AND status = 'active' ",function(err,rows){
          if (err) {
            res.json({"message":"1 "+err});
          }else{
            connection.query("UPDATE transaction SET status = 'cancel' WHERE username= '"+username+"' AND status = 'active' ",function(err,suc){
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
                      res.json({"message":"successfully delete transaction "}); //dont change the response
                    }
                  })
                }
              }
            })
          }
        });
    });

    router.post("/cancelTrans",function(req,res){
      var username = req.body.username;
      connection.query("SELECT * FROM `transaction` WHERE username= '"+username+"' AND status = 'active' ",function(err,rows){
        if (err) {
          res.json({"message":err});
        }else{
            var query = "UPDATE `transaction` SET status = 'cancel' WHERE username= '"+username+"' AND status = 'active' ";
          connection.query(query,function(err,suc){
            if (err) {
              res.json({"message":query});
            }else{
              if (rows.length<=0) {
                res.json({"message":"err "+query});
              }else{
                res.json({"message":"successfully delete transaction"}); //dont change the resnponse
              }
            }
          })
        }
      });

    });

    //create transaction
    router.post("/transactionInsert",function(req,res){
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
                        connection.query("SELECT objectId FROM transaction WHERE username= '"+username+"' and status = 'active'",function(err,id){
                            if(err){
                                res.json({"message":"error "+query});
                            }else {
                                if(id.length > 1){
                                    res.json({"message":"success "+id[0].objectId+" "+id[1].objectId});
                                }else{
                                    res.json({"message":"success "+id[0].objectId});
                                }
                            }
                        });
                    }
                });
            }
        });
    });

    //function cancelTransaction(transId,driverId)
    router.post("/cancelTransaction",function(req,res){
        var transId = req.body.transId;
        var query = "SELECT * FROM transaction WHERE objectId= ? and status = 'active'";
        var table = [transId];
        query = mysql.format(query,table);

        connection.query(query,function(err,rows){
            if (err) {
                res.json({"message" : "err.."});
            } else{
                if(rows.length > 0){
                    res.json({"message":"success"});
                }else{
                    res.json({"message":"error"});
                }
            };
        });
    });

    //storing transaction detail to history table (transId)
    router.post("/cancelDriver",function(req,res){
        var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
        var transId = req.body.transId;
        var reason = req.body.reason;
        var username="",driverId=0,pickUpAddress="";
        connection.query("SELECT username,pickUpAddress,driverId FROM transaction WHERE objectId= "+transId,function(err,rows){
            username = rows[0].username;
            pickUpAddress = rows[0].pickUpAddress;
            driverId = rows[0].driverId;
            var table = ["cancel","username","pickUpAddress","driverId","reason",username,pickUpAddress,driverId,reason];
            query = mysql.format(query,table);
            connection.query(query,function(err,rows){
                if(err) {
                    res.json({"Error" : true, "message" : "Error executing MySQL query "+query});
                } else {
                    res.json({"Error" : false, "message" : "Cancel Added !"});
                }
            });
            connection.query("DELETE from transaction WHERE objectId= "+transId);
        });
    });

    //MULTIPLE DRIVER STARTS FROM HERE

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

    // ================== TESTING PURPOSE =================================

    //auto cancel -- testing purpose --
    router.post("/autoCancel",function(req,res){
        connection.query("SELECT objectId FROM `transaction`",function(err,id){
            if(err){
              res.json({"message":err});
            }else{

              if (id[0] != null || id[0] != undefined) {
                connection.query("DELETE FROM `transaction` WHERE objectId= '"+id[0].objectId+"'",function(err,rows){
                    if(err){
                        res.json({"message":"error"});
                    }else{
                        res.json({"message":"successfully delete transaction"});
                    }
                });
              }else{
                res.json({"message":"no transaction available"});
              }
            }
        });
    });

    router.post("/autoAccept",function(req,res){
        connection.query("SELECT objectId FROM `transaction`",function(err,id){
            if(err){
              res.json({"message":err});
            }else{

              if (id[0] != null || id[0] != undefined) {
                var transId = id[0].objectId;
                var driverId = "autoAccept";
                var answer = "yes";
                var driverIdTemp,query,table;
                //var query = "UPDATE transaction SET driverNearby=?,driverTemp=?,driverId=? WHERE objectId= ?";
               query = "UPDATE transaction set driverTemp=?,driverId=? WHERE objectId= "+transId;

                if ((driverId == null)||(driverId == "")) {
                    res.json("cannot access this transaction");
                } else{
                    //if the driver say no
                    if (answer == "no") {
                        table=["no","no"];
                        query = mysql.format(query,table);
                    }
                    //if the driver say yess
                    else {
                        table=[driverId,driverId];
                        query = mysql.format(query,table);
                    }

                    connection.query(query,function(err,test){

                        if (err) {
                            res.json({"message":"error"});
                        } else{
                            if(answer == "yes"){
                                res.json({"message":"yes"});
                            }else{
                                res.json({"message":"no"});
                            }
                        };

                    });
                };
              }else{
                res.json({"message":"no transaction available"});
              }
            }
        });
    });

}
module.exports = transaction;
