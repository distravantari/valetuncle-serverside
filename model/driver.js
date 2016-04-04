var mysql   = require("mysql");
var request = require('request');
var gcm = require('node-gcm');

function driver(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

driver.prototype.handleRoutes = function(router,connection,md5) {
	var self = this;

    //register
    router.post("/re",function(req,res){
        var query = "INSERT INTO `driver` (name,alias,IMEI,phone,postalCode,photo,dateOfBirth,phoneModel,email,licenceNumber) VALUES (?,?,?,?,?,?,?,?,?,?)";
        //body
        var name = req.body.name;
        var alias = req.body.alias;
        var IMEI = req.body.IMEI;
        var phone = req.body.phone;
        var postalCode = req.body.postalCode;
        var date = req.body.dateOfBirth;
        var phoneModel = req.body.phoneModel;
        var email = req.body.email;
        var licenceNumber = req.body.licenceNumber;

        if(req.body.photo == '' || req.body.photo == undefined){
            var photo = 'http://backend.carto.sg/uploads/uncle.png';
        }else{
            var photo = req.body.photo;
        }

        //end of body
        var table = [name,alias,IMEI,phone,postalCode,photo,date,phoneModel,email,licenceNumber];
        query = mysql.format(query,table);

        connection.query(query,function(err,rows){
            if(err){
                res.json({"message":query});
            }else{
                res.json({"message":'success'});
            }
        });

    });

    //push notif android
    router.post("/driverNotif",function(req,res){
       var message = new gcm.Message();
       var driverId = req.body.driverId;
        message.addNotification('title', 'ValetUncle');
        message.addNotification('icon', 'logo');
        message.addNotification('body', 'testing');

        var query = "SELECT token FROM driver WHERE objectId = "+driverId;

        connection.query(query,function(err,success){

            if(err){
                res.json({"message":"asdadada "+query});
            }else{
                //Replace your mobile device registration Id here
                var regIds = [success[0].token];
                // var regIds = ['fNyYV0hne_Y:APA91bEb4JgmTFjKtzA3xE_L-l8Kd6VoB-v3tPejIrMDOmoKtPPdu0yGkyuXPoDUJ1PBRbPInBkgk5IGvVURmP0M5V1wRGQKM9-RTFx50701Q9bH6GYFRbxwYPNicmrLxBgPbAfeejDo'];
                //Replace your developer API key with GCM enabled here
                // var sender = new gcm.Sender(req.body.apikey);
                var sender =new gcm.Sender('AIzaSyB8focvKeAoehhEQtOpmIe6GbNmWCYH-LU');


                sender.send(message, regIds ,function (err, result) {
                    if(err) {
                      console.error(err);
                      res.json({"message":"err.."});
                    } else {
                      console.log(result);
                      res.json({"message":result});
                    }
                });
            }
        });
    });

    //push notif android
    router.post("/testNotif",function(req,res){
       var message = new gcm.Message();
    //    var driverId = req.body.driverId;
        message.addNotification('title', 'ValetUncle');
        message.addNotification('icon', 'logo');
        message.addNotification('body', 'testing');

        var regIds = [req.body.tokens];

        var sender =new gcm.Sender(req.body.senderId);

        sender.send(message, regIds ,function (err, result) {
            if(err) {
                console.error(err);
                res.json({"message":"err.."});
            } else {
                console.log(result);
                res.json({"message":result});
            }
        });
    });

    //GET all data from driver with cur driver id
    router.post("/driver",function(req,res){
        var objectId = req.body.driverId;
        var query = "SELECT * FROM driver WHERE objectId="+objectId;
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Success", "Driver" : rows});
            }
        });
    });

    //GET all data from driver with cur driver id
    router.post("/driverNumber",function(req,res){
        var username = req.body.objectId;
        var query = "SELECT * FROM driver WHERE objectId='"+username+"'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "message" : "Success", "Driver" : rows});
            }
        });
    });

    router.post("/checkStartJob",function(req,res){
        var transId = req.body.transId;
        var query = "SELECT startJob FROM transaction WHERE objectId="+transId+"";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "Error executing MySQL query"});
            } else {
                if(rows.length>=1)
                {
                    if(rows[0].startJob=="pickup")
                    {
                        res.json({"message":"pickup"});
                    }
                    else if(rows[0].startJob=="startJob")
                    {
                        res.json({"message":"startJob"});
                    }
                    else
                    {
                        res.json({"message":"no trans available"});
                    }
                }
                else
                {
                    res.json({"Error" : true, "message" : "Error no transaction"});
                }
            }
        });
    });

    // check is the usr is already been deleted
    router.post("/checkUsername",function(req,res){
        var username = req.body.username;
        var query = "SELECT username FROM transaction WHERE username='"+username+"' AND status= 'active'";
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

    //function updateRating (driverId,newRating) NOT FINNISHED
   router.post("/updateRating",function(req,res){
       var driverId = req.body.driverId;
       var review = req.body.review;
       var newRating = req.body.rating;
       var rating = 0, temp = 0;
       var driverHistory = 0;
       connection.query("SELECT rating,totalRating FROM driver WHERE objectId= "+driverId,function(err,driverR){
           if(err){
                res.json({"message":"err.."+err+"SELECT rating,totalRating FROM driver WHERE objectId= "+driverId});
           }else{
                temp = Number(newRating) + Number(driverR[0].totalRating);
                //update total rating to driver
                var q = "UPDATE `driver` SET totalRating = "+temp+" WHERE objectId= "+driverId;
                connection.query(q,function(err,succ){
                    if(err){
                        res.json({"message":q});
                    }else{
                        //take how many user has been take by this driver
                       connection.query("SELECT * FROM history WHERE driverId= "+driverId,function(err,hist){
                            if(err){
                                res.json({"message":"error accessing history"});
                            }else{
//                                total rating divided by user that he takes
                                if(hist.length<=0){
                                    driverHistory = hist.length+1;
                                    // hist.length += 1;
                                }else{
                                    driverHistory = hist.length+1;
                                }

                                rating = Number(temp) / Number(driverHistory);
                                var query = "UPDATE driver SET rating = ? WHERE objectId= "+driverId;
                                var table = [rating];
                                query = mysql.format(query,table);

                                connection.query(query,function(err,rows){
                                    if(err){
                                        res.json({"message":"error "+query});
                                    }else{
                                        res.json({"message":"successfully update rating"});
                                    }
                                });
                            }
                        });
                    }
                });
           }
       });
    });

     router.post("/review",function(req,res){
        var transId = req.body.transId;
        var review = req.body.review;

        var query = "UPDATE `transaction` SET review = ? WHERE objectId ="+transId;
        var table = [review];
        query = mysql.format(query,table);
        connection.query(query,function(err,success){
            if(err){
                res.json({"message":"error"});
            }else {
                // res.json({"message":"success"});
                var query2 = "UPDATE `history` SET review = ? WHERE transId ="+transId;
                var table2 = [review];
                query2 = mysql.format(query2,table2);
                connection.query(query2,function(err,success){
                    if(err){
                        res.json({"message":"err.."});
                    }else {
                        res.json({"message":"success"});
                    }
                });
            }
        });
    });


     //function setFlag(driverId)
    router.post("/setFlag",function(req,res){
        var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
        var id = req.body.driverId;
        var flag = 0,credit=0;
        // var status = 0
        connection.query("SELECT * from driver WHERE objectId = "+id,function(err,results){
            // status = results[0].status;
            //credit = results[0].credit;
            credit = results.credit;
//            if (status == 1) {
                if (credit>5) {
                    flag = 1;
                    var table = ["driver","flag",flag,"objectId",id];
                } else{
                    flag=0;
                    var table = ["driver","flag",flag,"objectId",id];
                };

            query = mysql.format(query,table);
            connection.query(query,function(err,rows){
                if(err) {
                    res.json({"Error" : true, "message" : "err.."});
                } else {
                    res.json({"Error" : false, "message" : "success"});
                }
            });
        });

    });

    router.post("/updateDriver",function(req,res){
        var username = req.body.objectId;
        //things that user can change
        var input = req.body.input;
        var query = "UPDATE driver SET "+input+" WHERE objectId = "+username;
        connection.query(query,function(err,success){
            if(err){
                res.json({"message":"error"});
            }else {
                res.json({"message":"success"});
            }
        });
    });

    //check if imei == imei
    router.post("/imei",function(req,res){
        var query = "SELECT statusLogin FROM driver WHERE IMEI= ?";
        var table = [req.body.imei];
        query = mysql.format(query,table);

        connection.query(query,function(err,rows){
            if(err){
                res.json({"message":"error "});
            }else {
                if(rows.length>0)
                {
                    res.json({"message":"success "});
                }
                else
                {
                    res.json({"message":"error "});
                }
            }
        });
    });

    // LOGIN
    router.post("/loginDriver",function(req,res){
        var imei = req.body.imei;
        var query = "SELECT idNumber,IMEI,objectId FROM driver where idNumber ='"+req.body.idNumber+"'";
        connection.query(query,function(err,user){
            if(err){
                res.json({"message":"err.."});
            }else {
              if (user[0].idNumber == 'undefined' || user[0].idNumber == '') {
                  res.json({"message":"error this user id "+user[0].objectId+" not recognize" });
              }else{
                if(user[0].IMEI == imei){
                    res.json({"message":"success "+user[0].objectId});
                }else{
                    res.json({"message":"error"});
                }
              }
            }
        });
    });

    //getDriverAnswer(transId,answer,driverId) BACKUP
    router.post("/getDriverAnswer",function(req,res){
        //punya distra
       //  var transId = req.body.transId;
       //  var driverId = req.body.driverId;
       //  var answer = req.body.answer;
       //  var driverIdTemp,query,table;
       //  //var query = "UPDATE transaction SET driverNearby=?,driverTemp=?,driverId=? WHERE objectId= ?";
       // query = "UPDATE transaction set driverTemp=?,driverId=? WHERE objectId= "+transId;

       //  if ((driverId == null)||(driverId == "")||(driverId == undefined)) {
       //      res.json("cannot access this transaction");
       //  } else{
       //      //if the driver say no
       //      if (answer == "no") {
       //          table=["no","no"];
       //          query = mysql.format(query,table);
       //      }
       //      //if the driver say yess
       //      else if(answer == "yes"){
       //          table=[driverId,driverId];
       //          query = mysql.format(query,table);
       //      }

       //      else if (answer == "home"){
       //        //transactionDecline
       //        var option = {
       //          url: 'http://52.76.73.21:3000/api/transactionDecline',
       //          form: {
       //            driverId:driverId,
       //            transId: transId,
       //            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NDgwODY2NTd9.IK0ZCmhno2M_JxaN4Gw8q1Zl1XfAGslCBtqIGxnOs-w'
       //          }
       //        }
       //        request.post(option,function(error,httpResponse,body){
       //            if (!error && httpResponse.statusCode == 200) {
       //              console.log(body)
       //            }else{
       //              console.log(body)
       //            }
       //        });
       //      }

       //      connection.query(query,function(err,test){
       //          if (err) {
       //              res.json({"message":"error"});
       //          } else{
       //            //new one check wether the driverid on table is already been updated
       //            connection.query("SELECT * FROM transaction where driverId !='' and objectId= "+transId,function(error,success){
       //              if(error){
       //                res.json({"message":"error"});
       //              }else {
       //                if(success.length == 0){
       //                  res.json({"message":"no"});
       //                }else {
       //                  if(answer == "yes"){

       //                      if(success[0].advanceTime == null){
       //                          //the old one
       //                          connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId+" and objectId != "+transId,function(err,suc){
       //                          if(err){
       //                              res.json({"message":"error updating driver temp "+err});
       //                          }else{
       //                              res.json({"message":"yes"});
       //                          }
       //                          });
       //                      }else{
       //                          // the newone advance
       //                          connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId,function(err,suc){
       //                          if(err){
       //                              res.json({"message":"error updating driver temp "+err});
       //                          }else{
       //                              if(success[0].advanceTime){
       //                                  //old one
       //                                  res.json({"message":"advance"});

       //                                  //new one
       //                                  // var insert = "INSERT advance (transId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime)";
       //                                  // var select = " SELECT objectId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime";
       //                                  // var from = " FROM transaction WHERE (driverId = "+driverId+") AND status = 'active'";

       //                                  // var insertIntoAdvace = insert+select+from;

       //                                  // connection.query(insertIntoAdvace,function(err,advance){
       //                                  //     if(err){
       //                                  //         res.json({"message" : "cannot insert into advance "+insertIntoAdvace});
       //                                  //     }else{
       //                                  //         connection.query("DELETE FROM transaction WHERE objectId = "+transId,function(err,succ){
       //                                  //             if(err){
       //                                  //                 res.json({"message" : "cannot delete transaction"});
       //                                  //             }else{
       //                                  //                 res.json({"message":"advance"});
       //                                  //             }
       //                                  //         });
       //                                  //     };
       //                                  // });
       //                                  // end of newone
       //                              }else{
       //                                  res.json({"message":"yes"});
       //                              }
       //                          }
       //                          });
       //                      }
       //                  }else{
       //                    var action = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
       //                    var log = [success[0].username,driverId,"driver cancel"];
       //                    action = mysql.format(action,log);
       //                    connection.query (action,function(err,rows){
       //                      if (err) {
       //                        res.json({"message":action});
       //                      }else{
       //                        res.json({"message":"no"});
       //                      }
       //                    })
       //                  }
       //                }
       //              }
       //            });
       //          };

       //      });
       //  };
        //sampe sini punya distra



        //punya mei
        var transId = req.body.transId;
        var driverId = req.body.driverId;
        var answer = req.body.answer;
        var driverIdTemp,query,table;
        //var query = "UPDATE transaction SET driverNearby=?,driverTemp=?,driverId=? WHERE objectId= ?";
       query = "UPDATE transaction set driverTemp=?,driverId=? WHERE objectId= "+transId;

        if ((driverId == null)||(driverId == "")||(driverId == undefined)) {
            res.json("cannot access this transaction");
        } else{
            //if the driver say no
            if (answer == "no") {
                table=["no","no"];
                query = mysql.format(query,table);
            }
            //if the driver say yess
            else if(answer == "yes"){
                table=[driverId,driverId];
                query = mysql.format(query,table);
            }

            else if (answer == "home"){
              //transactionDecline
              var option = {
                url: 'http://52.76.73.21:3000/api/transactionDecline',
                form: {
                  driverId:driverId,
                  transId: transId,
                  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NDgwODY2NTd9.IK0ZCmhno2M_JxaN4Gw8q1Zl1XfAGslCBtqIGxnOs-w'
                }
              }
              request.post(option,function(error,httpResponse,body){
                  if (!error && httpResponse.statusCode == 200) {
                    console.log(body)
                  }else{
                    console.log(body)
                  }
              });
            }

            connection.query(query,function(err,test){
                if (err) {
                    res.json({"message":"error"});
                } else{
                  //new one check wether the driverid on table is already been updated
                  connection.query("SELECT * FROM transaction where driverId !='' and objectId= "+transId,function(error,success){
                    if(error){
                      res.json({"message":"error"});
                    }else {
                      if(success.length == 0){
                        res.json({"message":"no"});
                      }else {
                        if(answer == "yes"){

                            if(success[0].advanceTime == null){
                                //the old one
                                connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId+" and objectId != "+transId,function(err,suc){
                                if(err){
                                    res.json({"message":"error updating driver temp "+err});
                                }else{
                                    res.json({"message":"yes"});
                                }
                                });
                            }else{
                                // the newone advance
                                //connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId,function(err,suc){
                                // connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE objectId = "+transId,function(err,suc){
                                connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId+" and objectId != "+transId,function(err,suc){
                                if(err){
                                    res.json({"message":"error updating driver temp "+err});
                                }else{
                                    if(success[0].advanceTime){
                                        //old one
                                        res.json({"message":"advance"});


                                        // connection.query("UPDATE transaction SET status = 'advance' WHERE objectId = "+transId,function(err,advance){
                                        //     if(err){
                                        //         res.json({"message" : "err.."});
                                        //     }else{
                                        //         res.json({"message" : "advance"});
                                        //     };
                                        // });

                                    }else{
                                        res.json({"message":"yes"});
                                    }
                                }
                                });
                            }
                        }else{
                          var action = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
                          var log = [success[0].username,driverId,"driver cancel"];
                          action = mysql.format(action,log);
                          connection.query (action,function(err,rows){
                            if (err) {
                              res.json({"message":action});
                            }else{
                              res.json({"message":"no"});
                            }
                          })
                        }
                      }
                    }
                  });
                };

            });
        };
        //sampe sini punya mei
    });

    router.post("/getDriverAnswer_edit",function(req,res){
        var transId = req.body.transId;
        var driverId = req.body.driverId;
        var answer = req.body.answer;
        var driverIdTemp,query,table;
        //var query = "UPDATE transaction SET driverNearby=?,driverTemp=?,driverId=? WHERE objectId= ?";
       query = "UPDATE transaction set driverTemp=?,driverId=? WHERE objectId= "+transId;

        if ((driverId == null)||(driverId == "")||(driverId == undefined)) {
            res.json("cannot access this transaction");
        } else{
            //if the driver say no
            if (answer == "no") {
                table=["no","no"];
                query = mysql.format(query,table);
            }
            //if the driver say yess
            else if(answer == "yes"){
                table=[driverId,driverId];
                query = mysql.format(query,table);
            }

            else if (answer == "home"){
              //transactionDecline
              var option = {
                url: 'http://52.76.73.21:3000/api/transactionDecline',
                form: {
                  driverId:driverId,
                  transId: transId,
                  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NDgwODY2NTd9.IK0ZCmhno2M_JxaN4Gw8q1Zl1XfAGslCBtqIGxnOs-w'
                }
              }
              request.post(option,function(error,httpResponse,body){
                  if (!error && httpResponse.statusCode == 200) {
                    console.log(body)
                  }else{
                    console.log(body)
                  }
              });
            }

            connection.query(query,function(err,test){
                if (err) {
                    res.json({"message":"error"});
                } else{
                  //new one check wether the driverid on table is already been updated
                  connection.query("SELECT * FROM transaction where driverId !='' and objectId= "+transId,function(error,success){
                    if(error){
                      res.json({"message":"error"});
                    }else {
                      if(success.length == 0){
                        res.json({"message":"no"});
                      }else {
                        if(answer == "yes"){

                            if(success[0].advanceTime == null){
                                //the old one
                                connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId+" and objectId != "+transId,function(err,suc){
                                if(err){
                                    res.json({"message":"error updating driver temp "+err});
                                }else{
                                    res.json({"message":"yes"});
                                }
                                });
                            }else{
                                // the newone advance
                                connection.query("UPDATE `transaction` SET driverTemp = 'no' WHERE driverTemp = "+driverId,function(err,suc){
                                if(err){
                                    res.json({"message":"error updating driver temp "+err});
                                }else{
                                    if(success[0].advanceTime){
                                        //old one
                                        res.json({"message":"advance"});


                                        connection.query("UPDATE transaction SET status = 'advance' WHERE objectId = "+transId,function(err,advance){
                                            if(err){
                                                res.json({"message" : "err.."});
                                            }else{
                                                res.json({"message" : "advance"});
                                            };
                                        });

                                    }else{
                                        res.json({"message":"yes"});
                                    }
                                }
                                });
                            }
                        }else{
                          var action = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
                          var log = [success[0].username,driverId,"driver cancel"];
                          action = mysql.format(action,log);
                          connection.query (action,function(err,rows){
                            if (err) {
                              res.json({"message":action});
                            }else{
                              res.json({"message":"no"});
                            }
                          })
                        }
                      }
                    }
                  });
                };

            });
        };
    });

    router.post("/transactionDecline",function(req,res){
        var driverId = req.body.driverId;
        var transId = req.body.transId;

          connection.query("SELECT whosDecline FROM transaction WHERE objectId ="+transId,function(err,rows){
            if(err){
                res.json({"message":"err.."});
            }else{
                var temp;
                if (rows.length==0){
                    temp = driverId;
                }else{
                    temp = rows[0].whosDecline+";"+driverId;
                }
                var query = "UPDATE transaction SET whosDecline = ?,driverTemp = ? WHERE objectId= "+transId;
                var table = [temp,"no"];
                query = mysql.format(query,table);
                connection.query(query,function(err,rows){
                    if(err){
                        res.json({"message":"error"});
                    }else{
                        res.json({"message":"success"});
                    }
                });
            }
        });
    });

    router.post("/balance",function(req,res){
        var driverId = req.body.driverId;
        connection.query("SELECT credit from driver WHERE objectId= "+driverId,function(err,rows){
            if(err){
                res.json({"message":"err.."});
            }else{
              var temp = rows[0].credit;
                  var remain = Number(temp)-5;
                  var query = "UPDATE driver SET credit = ? WHERE objectId= "+driverId;
                  var table = [remain];
                  query = mysql.format(query,table);
                  connection.query(query,function(err,rows){
                      if(err){
                          res.json({"message":"error"});
                      }else{
                          res.json({"message":"success"});
                      }
                  });
            }
        });
    });

    router.post("/cekDriver",function(req,res){
        var driverId = req.body.driverId;
        var transId = req.body.transId;
        var query = "SELECT driverId from transaction WHERE objectId= "+transId;
        var table = [driverId];
        connection.query(query,function(err,rows){
            if(err){
                res.json({"message":"error"});
            }else{
                if(rows[0].driverId == driverId){
                    res.json({"message":"success"});
                }else{
                    res.json({"message":"error"});
                }
            }
        });
    });

    router.post("/checkHere",function(req,res){
        var transId = req.body.transId;
        var query = "SELECT notif from transaction WHERE objectId= "+transId;
        connection.query(query,function(err,rows){
            if(err){
                res.json({"message":"error"});
            }
            else
            {
                if(rows.length>=1)
                {
                    res.json({"message":rows[0].notif});
                }
                else
                {
                    res.json({"message":"error"});
                }
            }
        });
    });

    router.post("/setDriverId",function(req,res){
        var transId = req.body.transId;
        var query = "SELECT * from transaction WHERE objectId= "+transId;
        connection.query(query,function(err,rows){
            if(err){
                res.json({"message":"error"});
            }
            else
            {
                if(rows.length>=1)
                {
                    var updateQuery = "UPDATE transaction set driverTemp = '',driverId=?,whosDecline=? WHERE objectId="+transId;
                    var table = ["no",rows[0].driverId];
                    updateQuery = mysql.format(updateQuery,table);
                    connection.query(updateQuery,function(err,test){
                        if(err){
                            res.json({"message":"error"});
                        }else{
                            // data mining (action_log)
                            var mining = "INSERT INTO `action_log`(`username`, `driverId`, `action`) VALUES (?,?,'driver cancel')";
                            var body = [rows[0].username,rows[0].driverId];
                            mining = mysql.format(mining,body);
                            connection.query(mining,function(err,action){
                                if(err){
                                    res.json({"message":"err.."+mining});
                                }else{
                                    res.json({"message":"success"});
                                }
                            })
                        }
                    });
                }
                else
                {
                    res.json({"message":"error"});
                }
            }
        });
    });
}
module.exports = driver;
