var mysql   = require("mysql");
var GeoPoint = require("geopoint");
var gcm = require('node-gcm');
var apn = require ("apn");
var request = require('request');

function user(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

user.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;

    //push notif ios
    router.post("/pushNotif",function(req,res){

        var transId = req.body.transId;
        var query = "SELECT token FROM user JOIN transaction ON user.username=transaction.username WHERE transaction.objectId = "+transId;
         connection.query(query,function(err,success){

            if(err){
                res.json({"message":"err.. "+query});
            }else{

                var tokens = [success[0].token];

                //ini ditambahin || (tokens[0] === "-") awalnya cuma if(tokens[0] === "")
                if(tokens[0] === "") {
                    console.log("Please set token to a valid device token for the push notification service");
                    process.exit();
                }

                // Create a connection to the service using mostly default parameters.

                var service = new apn.connection({ production: true });

                service.on("connected", function() {
                    console.log("Connected");
                });

                service.on("transmitted", function(notification, device) {
                    console.log("Notification transmitted to:" + device.token.toString("hex"));
                });

                service.on("transmissionError", function(errCode, notification, device) {
                    console.error("Notification caused error: " + errCode + " for device ", device, notification);
                    if (errCode === 8) {
                        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
                    }
                });

                service.on("timeout", function () {
                    console.log("Connection Timeout");
                });

                service.on("disconnected", function() {
                    console.log("Disconnected from APNS");
                });

                service.on("socketError", console.error);

                //push it
                function pushSomeNotifications() {
                    console.log("Sending a tailored notification to %d devices", tokens.length);
                    tokens.forEach(function(token, i) {
                        var note = new apn.notification();
                        note.setAlertText("Your driver has arrived");
                        note.badge = i;

                        service.pushNotification(note, token);
                    });
                }

                pushSomeNotifications();
                res.json({"message":"Your driver has arrived"});
            }

        });
    });

    //push notif android
    router.post("/tryNotif",function(req,res){
       var message = new gcm.Message();
       var transId = req.body.transId;
        message.addData("key1","ABC");
        message.addNotification('title', 'ValetUncle');
        message.addNotification('icon', 'logo');
        message.addNotification('body', 'Your driver has arrived');

        var query = "SELECT token FROM user JOIN transaction ON user.username=transaction.username WHERE transaction.objectId = "+transId;

        connection.query(query,function(err,success){

            if(err){
                res.json({"message":"asdadada "+query});
            }else{
                //Replace your mobile device registration Id here
                var regIds = [success[0].token];
                //Replace your developer API key with GCM enabled here
                var sender = new gcm.Sender(req.body.apikey);

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
    router.post("/findMulti",function(req,res){
       var message = new gcm.Message();
       var transId = req.body.transId;

       var option = {
            url: 'http://52.76.211.241:3000/api/findNearestDriver',
            form: {
                transId: req.body.transId,
                token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTI0ODM4OTd9.u89Rk5KYnbLAcsGB-FasVKrIgIJQIaKrRaym4hm7r_0'
            }
        }
        request.post(option,function(error,httpResponse,body){
            if (!error && httpResponse.statusCode == 200) {
                // res.json({"message":"error :"+option});
                var query = "SELECT token FROM user JOIN transaction ON user.username=transaction.username WHERE transaction.objectId = "+transId;
                connection.query(query,function(err,success){

                    if(err){
                        res.json({"message":query});
                    }else{
                        //Replace your mobile device registration Id here
                        var regIds = [success[0].token];
                        //Replace your developer API key with GCM enabled here
                        var sender = new gcm.Sender(req.body.apikey);

                        sender.send(message, regIds ,function (err, result) {
                            if(err) {
                            console.error(err);
                                res.json({"message":"err.."});
                            } else {
                            console.log(result);
                                res.json({"message":body});
                            }
                        });
                    }

                });
            }else{
                res.json({"message":"error :"+error});
            }
        });
    });

    //push notif android
    router.post("/driverFoundNotif",function(req,res){
       var message = new gcm.Message();
       var transId = req.body.transId;

       var option = {
            url: 'http://52.76.211.241:3000/api/searchDriver',
            form: {
                username: req.body.username,
                transId: req.body.transId,
                token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NTI0ODM4OTd9.u89Rk5KYnbLAcsGB-FasVKrIgIJQIaKrRaym4hm7r_0'
            }
        }
        request.post(option,function(error,httpResponse,body){
            if (!error && httpResponse.statusCode == 200) {
                // res.json({"message":"error :"+option});
                 var query = "SELECT u.token, t.driverId FROM user u join transaction t ON u.username = t.username WHERE t.objectId = "+transId;
                connection.query(query,function(err,success){

                    if(err){
                        res.json({"message":query});
                    }else{
                        message.addData("find",success[0].driverId);
                        //Replace your mobile device registration Id here
                        var regIds = [success[0].token];
                        //Replace your developer API key with GCM enabled here
                        var sender = new gcm.Sender(req.body.apikey);

                        sender.send(message, regIds ,function (err, result) {
                            if(err) {
                            console.error(err);
                                res.json({"message":"err.."});
                            } else {
                            console.log(result);
                                res.json({"message":body});
                            }
                        });
                    }

                });
            }else{
            //    var query = "SELECT token FROM user JOIN transaction ON user.username=transaction.username WHERE transaction.objectId = "+transId;
                 res.json({"message":"error :"+error});
            }
        });
    });

    //push notif user for advance booking
    router.post("/addNotif",function(req,res){
       var message = new gcm.Message();
       var transId = req.body.transId;
       var devisit = req.body.devisit;

        message.addNotification('title', 'ValetUncle');
        message.addNotification('icon', 'logo');
        message.addNotification('body', 'Your advance booking is ready');

        // push with timeout
        var searching = setTimeout(function(){ pushit() }, Number(devisit));
        function pushit (){
            var query = "SELECT token FROM user JOIN transaction ON user.username=transaction.username WHERE transaction.objectId = "+transId;

            connection.query(query,function(err,success){

                if(err){
                    res.json({"message":"asdadada "+query});
                }else{
                    //Replace your mobile device registration Id here
                    var regIds = [success[0].token];
                    //Replace your developer API key with GCM enabled here
                    var sender = new gcm.Sender(req.body.apikey);

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
        }
        // end of push with timeout
    });

    //ISMS
    router.post("/isms",function(req,res){
        var option = {
            url: 'http://www.isms.com.my/isms_send.php',
            form: {
                un:"edwinslab",
                pwd:"edwinslab888",
                type:1,
                sendid:66300,
                dstno:req.body.dstno,
                msg:req.body.msg
            }
        }
        request.post(option,function(error,httpResponse,body){
            if (!error && httpResponse.statusCode == 200) {
                // console.log("success")
                res.json({"message":"success"})
            }else{
                // console.log(body)
                res.json({"message":err})
            }
        });
    });

   // REGISTER A USER (username,pass,number,name,home,confirm,code);
   router.post("/register",function(req,res){
       var username = req.body.username;
       var password = req.body.password;
       var email = username;
       var number = req.body.number;
       var name = req.body.name;
       var home = '';
       var code = req.body.code;
       var confirm = "notVerified";
        connection.query("SELECT username from user where username ='"+username+"'",function(err,temp){
           if(err){
               //res.json("err.. SELECT username from user where username ='"+username+"' "+err);
               res.json({"message":"err.."});
           } else {
                if(temp[0]==null){
                    var newUser = "INSERT INTO user(username,password,email,number,name,home,confirm,curPage,code) VALUES (?,?,?,?,?,?,?,?,?)";
                    var table = [username,md5(password),email,number,name,home,confirm,0,code];
                    newUser = mysql.format(newUser,table);
                    connection.query(newUser, function(err,success){
                        if(err){
                            res.json({"message":"ERROR"});
                            //res.json("ERROR");
                        }else{
                            res.json({"message":"Successfully Registered"});
                            //res.json("Success");
                        }
                    });
                }else {
                    res.json({"message":"your email has already been taken"});
                    //res.json("Email cannot be use");
                }
           }
        });
    });

    // LOGIN
    router.post("/login",function(req,res){
        var username = req.body.username;
        var password = req.body.password;
        var query = "SELECT username,password,statusLogin FROM user where username ='"+username+"'";
        connection.query(query,function(err,user){
            if(err){
                res.json({"message":"error"});
            }else {
                if (user.length <= 0) {
                  res.json({"message":"wrong username"});
                }else{
                  if(user[0].statusLogin == 1){
                      res.json({"message":"you have already login in another device"});
                  }else{
                      if(user.length>=1){
                          if (password != user[0].password){
                              res.json({"message":"password incorrect"});
                          }else{
                              connection.query("UPDATE `user` SET statusLogin='1' WHERE username= '"+username+"'",function(err,state){
                                  if(err){
                                      res.json({"message":"er.."});
                                  }else{
                                      connection.query("SELECT confirm FROM user where username ='"+username+"'",function(err,ver){
                                          if (ver[0].confirm=="verified"){
                                              res.json({"message":"verified"});
                                          }else {
                                              res.json({"message":"not verified"});
                                          }
                                      });
                                  }
                              });
                          }
                      }else{
                          res.json({"message":"wrong username"});
                      }
                  }
                }
            }
        });
    });

     router.post("/updateUser",function(req,res){
        var username = req.body.username;
        //things that user can change
        var input = req.body.input;
        var query = "UPDATE user SET "+input+" WHERE username = '"+username+"'";
        connection.query(query,function(err,success){
            if(err){
                res.json({"message":"error"});
            }else {
                res.json({"message":"success"});
            }
        });
    });

    // GET user from table user by specified id
    router.post("/users",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM user WHERE username='"+username+"'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "message" : "Success", "Users" : rows});
            }
        });
    });

    // getting user curpage
    router.post("/getCurPage",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT curPage FROM user WHERE username='"+username+"'";
        connection.query(query,function(err,success){
            if(err){
                res.json({"message":"error LALALALAL"});
            }else {
                res.json({"message":success[0].curPage});
            }
        });
    });

      //function reset
    router.post("/reset",function(req,res){
        var query = "UPDATE transaction SET driverId = ? WHERE objectId = ?";
        var table = ["no",req.body.transId];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message":"err .. error reseting transaction"});
            } else {
                res.json({"message":"BOOYAA"});
            }
        });
    });

    //function resetBanned
    router.post("/resetBanned",function(req,res){
        var query = "UPDATE transaction SET whosDecline = ? WHERE ?? = ? AND status = 'active'";
        var table = ["","username",req.body.username];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "cannot reset whosDecline"});
            } else {
                res.json({"Error" : false, "message" : "whosDecline has been reset"});
            }
        });
    });

    // check driverTemp
    router.post("/searchNear",function(req,res){
        var username = req.body.username;
        connection.query("SELECT driverTemp FROM transaction where username= '"+username+"'",function(err,rows){
            if(err){
                res.json("err..");
            }else{
                if((rows[0]!=null)&&(rows[0]!="")){
                    if(rows[0].driverTemp=="no"||rows[0].driverTemp==""||rows[0].driverTemp==null||rows[0].driverTemp=="u"){
                       res.json({"message":"keep searching"});
                    }else{
                        res.json({"message":"searchDriver"});
                    }
                }
            }
        });
    });

    //check driverID
    router.post("/searchDriver",function(req,res){
        var username = req.body.username;
        connection.query("SELECT driverId FROM transaction where username= '"+username+"' AND status= 'active' ",function(err,rows){
            if(err){
                res.json("err..");
            }else{
                if((rows[0]!=null)&&(rows[0]!="")){
                    if(rows[0].driverId=="no"||rows[0].driverId==""||rows[0].driverId==null){
                       res.json({"message":"keep searching"});
                    }else{
                        res.json({"message":"stop searching;"+rows[0].driverId});
                    }
                }
            }
        });
    });

    //deleteTemp(driverId)
    router.post("/deleteTemp",function(req,res){
        var driverId = req.body.driverId;
        connection.query("SELECT driverTemp,objectId FROM transaction",function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "cannot reset deleteTemp"});
            } else {
                for (var i = rows.length-1; i >= 0; i--) {
                    if (rows[i].driverTemp == driverId) {
                        connection.query("UPDATE transaction SET driverTemp = '' WHERE objectId = "+rows[i].objectId,function(err,rows){
                            if(err){
                                res.json({"message":"err.. s"});
                            }else {
                                res.json({"message":"successfully deleteTemp "});
                            }
                        });
                    }
                };
            }
        });
    });

//findNearestDriver(transId)
    router.post("/findNearestDriver",function(req,res){
        var transId = req.body.transId;
        var range = 0;
        connection.query("SELECT `range` FROM `setting` WHERE objectId = 0",function(err,jarak){
          if(err){
            res.json({"Error" : true, "Message" : "err.."});
          }else{
            range = jarak[0].range;
            connection.query("SELECT username,driverTemp,pickUp,whosDecline from transaction WHERE objectId= "+transId,function(err,rows){
              if(err){
                  res.json({"message":"err.."});
              }else {
                  if(rows.length>=1)
                  {
                      if ((rows[0].driverTemp != null)&&(rows[0].driverTemp != "")&&(rows[0].driverTemp != "no")&&(rows[0].driverTemp != "u")) {
                          //res.json("no transaction available");
                          res.json({"message":"no transaction available"});
                      } else{
                          // we are using kilometers
                          var inKilometers = 0;
                            //connection.query("SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 Order by RAND()",function(err,queryDriver){
                            connection.query("SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 Order by priority ASC,RAND()",function(err,queryDriver){
                            //connection.query("SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 and objectId IN (SELECT driverId FROM transaction where status = 'advance' AND (advanceTime > NOW() + INTERVAL 2 HOUR)) Order by RAND()",function(err,queryDriver){
                              if(err){
                                  res.json({"message":"error"});
                              }else{
                                  //located where user location is
                                  var locTemp = rows[0].pickUp.split(";");
                                  var latitude = Number(locTemp[0]);
                                  var longitude = Number(locTemp[1]);
                                  var userGeoPoint = new GeoPoint(latitude,longitude); //success
      //                            res.json({"message":latitude});

                                  // only for driver within 5km
                                  var driverNearby = "";
                                  for (var i = 0; i < queryDriver.length; i++) {
                                      //located where driver location is
                                      var getLocation=queryDriver[i].location
                                      if((getLocation!="")&&(getLocation!=null)&&(getLocation!=undefined))
                                      {
                                          locTemp = getLocation.split(";");
                                          var latD = Number(locTemp[0]);
                                          var longD = Number(locTemp[1]);
                                          var driverGeoPoint = new GeoPoint(latD,longD);

                                          //check the distance in kilo
                                          inKilometers = driverGeoPoint.distanceTo(userGeoPoint, true);
                                          // if distance <= 5KM then it will be push to an array
                                            if(inKilometers <= range){
                                                driverNearby+=queryDriver[i].objectId+";";
                                            }
                                      }
                                  };

                                  // is the driver banned ?
                                  var banned,driver;
                                  var notbanned = [""];
                                  var whosDecline = rows[0].whosDecline;
                                  //split whosdecline and driver nearby
                                  driver = driverNearby.split(";");
                                  // check whosDecline , if there is banned driver
                                  if ((whosDecline != null)&&(whosDecline != "")&&(whosDecline != undefined)) {

                                      banned = whosDecline.split(";");

                                      j=0;
                                      for (var i=0; i < driver.length; ++i){
                                          if (banned.indexOf(driver[i]) == -1){
                                              // insert no banned driver to an array (notbanned)
                                              notbanned[j++] = driver[i];
                                          };
                                      };

                                  }
                                  // if there is no driver banned
                                  else{
                                      // insert all driver to not banned array
                                      notbanned = driver;
                                  }

                                  if(notbanned.length==1&&notbanned[0]==""){
                                      res.json({"message":"no driver around you "});
                                  }else{
                                      var query = "UPDATE transaction SET driverTemp = ? WHERE objectId = "+transId;
                                      var table = [notbanned[0]];
                                      query = mysql.format(query,table);
                                      connection.query(query,function(err,shh){
                                          if(err){
                                              res.json({"message":"err.. "+query});
                                          }else{
                                            //   res.json({"message":"success "});
                                             // DATA MINING
                                                var cancel_mining = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
                                                var table = [rows[0].username,"","user request"];
                                                cancel_mining = mysql.format(cancel_mining,table);
                                                connection.query(cancel_mining,function(err,suc){
                                                  if (err) {
                                                    res.json({"message":"3 "+err});
                                                  }else{
                                                    res.json({"message":"success "}); //dont change the resnponse
                                                  }
                                                })
                                          }
                                      });
                                  };

                              }
                          });
                      }
                  }
                  else
                  {
                      res.json({"message":"no transaction available"});
                  }
              }
          });
          }
        })
    });

    //version
    router.post("/version",function(req,res){
        var username = req.body.username;
        connection.query("SELECT version FROM `setting`",function(err,rows){
            if(err){
                res.json({"message":"bitches"});
            }else {
                res.json({"message":rows[0].version});
            }
        })
    });

    // advance booking
    //advance (delete it from transaction and put it on advance)
    router.post("/isAdvance",function(req,res){
        var username = req.body.username;
        connection.query("SELECT * FROM transaction WHERE username = '"+username+"' AND status = 'active' LIMIT 1",function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "err.."});
            } else {
                if(rows[0].advanceTime == null || rows[0].advanceTime == "") {
                    res.json({"message" : "regular"});
                } else {
                    //delete transaction and add it to advance table

                    // var insert = "INSERT advance (transId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime)";
                    // var select = " SELECT objectId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime";
                    // var from = " FROM transaction WHERE username = '"+username+"' AND status = 'active'";

                    // var insertIntoAdvace = insert+select+from;

                    // connection.query(insertIntoAdvace,function(err,advance){
                    //     if(err){
                    //         res.json({"message" : "cannot insert into advance "+insertIntoAdvace});
                    //     }else{
                    //         connection.query("DELETE FROM transaction WHERE objectId = "+rows[0].objectId,function(err,succ){
                    //             if(err){
                    //                 res.json({"message" : "cannot delete transaction"});
                    //             }else{
                    //                 res.json({"message" : "success"});
                    //             }
                    //         });
                    //     };
                    // });
                    connection.query("UPDATE transaction SET status = 'advance' WHERE username= '"+username+"' AND status = 'active' LIMIT 1",function(err,advance){
                        if(err){
                            res.json({"message" : "err.."});
                        }else{
                            res.json({"message" : "success"});
                        };
                    });
                }
            }
        });
    });

    router.post("/isAdvance_edit",function(req,res){
        var username = req.body.username;
        connection.query("SELECT * FROM transaction WHERE username = '"+username+"' AND status = 'active' ",function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "err.."});
            } else {
                if(rows[0].advanceTime == null) {
                    res.json({"message" : "regular"});
                } else {
                    //delete transaction and add it to advance table

                    // var insert = "INSERT advance (transId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime)";
                    // var select = " SELECT objectId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime";
                    // var from = " FROM transaction WHERE username = '"+username+"' AND status = 'active'";

                    // var insertIntoAdvace = insert+select+from;

                    // connection.query(insertIntoAdvace,function(err,advance){
                    //     if(err){
                    //         res.json({"message" : "cannot insert into advance "+insertIntoAdvace});
                    //     }else{
                    //         connection.query("DELETE FROM transaction WHERE objectId = "+rows[0].objectId,function(err,succ){
                    //             if(err){
                    //                 res.json({"message" : "cannot delete transaction"});
                    //             }else{
                    //                 res.json({"message" : "success"});
                    //             }
                    //         });
                    //     };
                    // });

                    //res.json({"message" : "success"});

                    connection.query("UPDATE transaction SET status = 'advance' WHERE username= '"+username+"' AND status = 'active'",function(err,advance){
                        if(err){
                            res.json({"message" : "err.."});
                        }else{
                            res.json({"message" : "success"});
                        };
                    });
                }
            }
        });
    });

    // check if devisit > 1 allow, else cannot do advance booking
     router.post("/checkTime",function(req,res){
        var time = req.body.time;
        var username = req.body.username;
        connection.query("SELECT advanceTime FROM advance WHERE username = '"+username+"'",function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "err.."});
            } else {
                if(rows.length<=0) {
                    res.json({"message" : "success"});
                } else {
                    var response = 'success';

                    for (var i = rows.length-1; i >= 0; i--) {
                        var str = rows[i].advanceTime;
                        var kambing = str.substring(11, 13);// only take the hour
                        var temp = Math.abs(Number(kambing)-Number(time)); // devisit with all db advancetime

                        // res.json({"message" : "db "+kambing+" + input "+time+" ="+temp});

                        if(temp <= 1){
                            //to-do list
                           response = 'error';
                        }
                    };
                    res.json({"message" : response});
                }
            }
        });
    });

    router.post("/checkTime_edit",function(req,res){
        var time = req.body.time;
        var username = req.body.username;
        connection.query("SELECT advanceTime FROM transaction WHERE (username = '"+username+"' and status = 'advance')",function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "err.."});
            } else {
                if(rows.length<=0) {
                    res.json({"message" : "success"});
                } else {
                    var response = 'success';

                    for (var i = rows.length-1; i >= 0; i--) {
                        var str = rows[i].advanceTime;
                        var kambing = str.substring(11, 13);// only take the hour
                        var temp = Math.abs(Number(kambing)-Number(time)); // devisit with all db advancetime

                        // res.json({"message" : "db "+kambing+" + input "+time+" ="+temp});

                        if(temp <= 1){
                            //to-do list
                           response = 'error';
                        }
                    };
                    res.json({"message" : response});
                }
            }
        });
    });


    //GET all data from transaction with cur transId
    router.post("/fee",function(req,res){
//        var username = req.body.username;
        var query = "SELECT * FROM setting";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Success", "Trans" : rows});
            }
        });
    });

    router.post("/feeMessageWhenTryAgain",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * from transaction where username = '"+username+"' and status = 'active' ;";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } 
            else if(rows[0].promocode==null || rows[0].promocode=="" || rows[0].promocode=="-")
            {
                var query = "SELECT * FROM setting";
                connection.query(query,function(err,rows){
                    if(err) {
                        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                    } else {
                        res.json({"Error" : false, "Message" : "Success", "Trans" : rows});
                    }
                });
            }
            else
            {
                var query = "SELECT * FROM promo where code = '"+rows[0].promocode+"'";
                connection.query(query,function(err,rows){
                    if(err) {
                        res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                    } else {
                        res.json({"Error" : false, "Message" : "Success", "Trans" : rows});
                    }
                });
            } 
        });
    });

    // cek if the devisit <= 1, yes -> push, no -> keep looping
     router.post("/checkTurnAdvance",function(req,res){
        var driverId = req.body.driverId;
        var time = req.body.time;
        connection.query("SELECT time FROM advance WHERE username = '"+username+"'",function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "cannot reset deleteTemp"});
            } else {
                if(rows.length<=0) {
                    res.json({"Error" : true, "Message" : "err .."});
                } else {
                    for (var i = rows.length-1; i >= 0; i--) {
                        var temp = Math.abs(Number(time)-Number(rows[i].time)); // find the devisit

                        if (temp <= 1) {
                            res.json({"message" : "send push"});
                        }else{
                            res.json({"message" : "not yet"});
                        }
                    };
                }
            }
        });
    });

    //select advance booking that specified user has and has the minimum devisit on it
    router.post("/advance",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM advance WHERE TIME = (SELECT MIN(TIME) FROM advance WHERE username = '"+username+"');";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                res.json({"message" : "success", "Trans" : rows});
            }
        });
    });

    router.post("/advance_edit",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * from transaction t1, (select min(time) as min_time from transaction where username = '"+username+"' and status = 'active') t2 WHERE t1.time = t2.min_time AND username = '"+username+"' AND status = 'active' limit 1;";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            }
            else if(rows.length>=1)
            {
                res.json({"message" : "success", "Trans" : rows});
            }
            else
            {
                //res.json({"message" : "error"});
                var query = "SELECT * from transaction t1, (select min(time) as min_time from transaction where username = '"+username+"' and status = 'advance') t2 WHERE t1.time = t2.min_time AND username = '"+username+"' AND status = 'advance' limit 1;";
                connection.query(query,function(err,rows){
                    if(err) {
                        res.json({"message" : "error"});
                    } else {
                        res.json({"message" : "success", "Trans" : rows});
                    }
                });
            }
        });
    });

    //select all advance booking that specified user has and has the minimum devisit on it and transfer to transaction
    router.post("/toTransaction",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM advance WHERE TIME = (SELECT MIN(TIME) FROM advance WHERE username = '"+username+"');";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {

                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    // var insert = "INSERT transaction (objectId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime)";
                    // var select = " SELECT transId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime";
                    // var from = " FROM advance WHERE TIME = (SELECT MIN(TIME) FROM advance WHERE username = '"+username+"');";

                    //  var insertIntoAdvace = insert+select+from;
                    // connection.query(insertIntoAdvace,function(err,advance){
                    //     if(err){
                    //         res.json({"message" : "cannot insert into advance "+insertIntoAdvace});
                    //     }else{
                    //         connection.query("DELETE FROM advance WHERE transId = "+rows[0].transId,function(err,succ){
                    //             if(err){
                    //                 res.json({"message" : "cannot delete transaction"});
                    //             }else{
                    //                 var lastQuery = "UPDATE user SET curLatLong = ?,completeAddress = ?,curTransId = ?,curDriver = ? WHERE username = ?";
                    //                 var table = [rows[0].pickUp,rows[0].pickUpAddress,rows[0].transId,rows[0].driverId,username];
                    //                 lastQuery = mysql.format(lastQuery,table);
                    //                 connection.query(lastQuery,function(err,succ){
                    //                     if(err){
                    //                         res.json({"message" : "cannot delete transaction "+lastQuery});
                    //                     }else{
                    //                         res.json({"message" : "success"});
                    //                     }
                    //                 });
                    //             }
                    //         });
                    //     };
                    // });
                    connection.query("UPDATE transaction SET status = 'active' WHERE username= '"+username+"' AND status = 'advance'",function(err,advance){
                        if(err){
                            res.json({"message" : "err.."});
                        }else{
                            res.json({"message" : "success"});
                        };
                    });
                }
            }
        });
    });

    router.post("/toTransaction_edit",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * from transaction t1, (select min(time) as min_time from transaction where username = '"+username+"' and status = 'advance') t2 WHERE t1.time = t2.min_time AND username = '"+username+"' AND status = 'advance' ;";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "errorLA"});
            } else {

                if(rows<1){
                    res.json({"message" : "errorHA"});
                }else{
                    // var insert = "INSERT transaction (objectId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime)";
                    // var select = " SELECT transId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime";
                    // var from = " FROM advance WHERE TIME = (SELECT MIN(TIME) FROM advance WHERE username = '"+username+"');";

                    //  var insertIntoAdvace = insert+select+from;
                    // connection.query(insertIntoAdvace,function(err,advance){
                    //     if(err){
                    //         res.json({"message" : "cannot insert into advance "+insertIntoAdvace});
                    //     }else{
                    //         connection.query("DELETE FROM advance WHERE transId = "+rows[0].transId,function(err,succ){
                    //             if(err){
                    //                 res.json({"message" : "cannot delete transaction"});
                    //             }else{
                    //                 var lastQuery = "UPDATE user SET curLatLong = ?,completeAddress = ?,curTransId = ?,curDriver = ? WHERE username = ?";
                    //                 var table = [rows[0].pickUp,rows[0].pickUpAddress,rows[0].transId,rows[0].driverId,username];
                    //                 lastQuery = mysql.format(lastQuery,table);
                    //                 connection.query(lastQuery,function(err,succ){
                    //                     if(err){
                    //                         res.json({"message" : "cannot delete transaction "+lastQuery});
                    //                     }else{
                    //                         res.json({"message" : "success"});
                    //                     }
                    //                 });
                    //             }
                    //         });
                    //     };
                    // });

                    //from here
                    //UPDATE transaction t1, (SELECT MIN(TIME) as min_time FROM transaction WHERE username = 'ef@gmail.com' AND status = 'advance') t2 SET t1.status = 'active', t1.statusAdvance = 'advance' WHERE t1.TIME=t2.min_time
                    connection.query("UPDATE transaction t1, (SELECT MIN(TIME) as min_time FROM transaction WHERE username = '"+username+"' AND status = 'advance') t2 SET t1.status = 'active', t1.statusAdvance = 'advance' WHERE t1.TIME=t2.min_time AND username = '"+username+"' AND status = 'advance' ;",function(err,advance){
                        if(err){
                            res.json({"message" : "err.."});
                        }else{
                            //res.json({"message" : "success"});
                            var query2 = "SELECT * FROM transaction WHERE username = '"+username+"' AND status = 'active' AND statusAdvance = 'advance' LIMIT 1;";
                            connection.query(query2,function(errs,rows_){
                                if(errs) {
                                    res.json({"message" : "errorblabla"+query});
                                } else {
                                       // res.json({"message" : "second success"});
                                        var lastQuery = "UPDATE user SET curLatLong = ?,completeAddress = ?,curTransId = ?,curDriver = ? WHERE username = ?";
                                        var table = [rows_[0].pickUp,rows_[0].pickUpAddress,rows_[0].objectId,rows_[0].driverId,username];
                                        lastQuery = mysql.format(lastQuery,table);


                                        connection.query(lastQuery,function(err,succ){
                                            if(err){
                                                res.json({"message" : "cannot delete transaction "+lastQuery});
                                            }else{
                                                res.json({"message" : "success updated data"});
                                            }
                                        });

                                    // if(rows_<1){
                                    //     res.json({"message" : "error2"+query});
                                    // }else{

                                    // }
                                }
                            });
                        };
                    });
                    //to here
                }
            }
        });
    });

     router.post("/checkUsernameAdvance",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM advance WHERE username = '"+username+"'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"message" : "success"});
                }
            }
        });
    });

     router.post("/checkUsernameAdvance_edit",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM transaction WHERE username = '"+username+"' AND status = 'advance'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"message" : "success"});
                }
            }
        });
    });

    //select all advance booking that specified user has
     router.post("/userAdvance",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM advance WHERE username = '"+username+"'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"Error" : false, "Message" : "Success", "Trans" : rows.length});
                }
            }
        });
    });

     //select all advance booking that specified user has
     router.post("/allAdvance",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM advance WHERE username = '"+username+"'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"Error" : false, "Message" : "Success", "Trans" : rows});
                }
            }
        });
    });

     router.post("/allAdvance_edit",function(req,res){
        var username = req.params.username || req.body.username;
        var query = "SELECT * FROM transaction WHERE username = '"+username+"' and status = 'advance'";
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"Error" : false, "message" : "Success", "Trans" : rows});
                }
            }
        });
    });

    router.post("/getDriverId",function(req,res){
        var transId = req.params.transId || req.body.transId;
        var query = "SELECT driverId FROM transaction WHERE transId="+transId;
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"message" : "error"});
            } else {
                if(rows<1){
                    res.json({"message" : "error"});
                }else{
                    res.json({"message" : rows[0].driverId});
                }
            }
        });
    });

    // end of advance

    //MULTIPLE DRIVER STARTS FROM HERE
    //findNearestDriver(transId)
    router.post("/findNearestDriver_multipledriver",function(req,res){
        var transId = req.body.transId;
        var range = 0;
        connection.query("SELECT `range` FROM `setting` WHERE objectId = 0",function(err,jarak){
          if(err){
            res.json({"Error" : true, "Message" : "err.."});
          }else{
            range = jarak[0].range;
            connection.query("SELECT username,driverTemp,pickUp,whosDecline from transaction WHERE objectId= "+transId,function(err,rows){
              if(err){
                  res.json({"message":"err.."});
              }else {
                  if(rows.length>=1)
                  {
                      if ((rows[0].driverTemp != null)&&(rows[0].driverTemp != "")&&(rows[0].driverTemp != "no")&&(rows[0].driverTemp != "u")) {
                          //res.json("no transaction available");
                          res.json({"message":"no transaction available"});
                      } else{
                          // we are using kilometers
                          var inKilometers = 0;
                          //connection.query("SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 Order by RAND()",function(err,queryDriver){
                          connection.query("SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 and objectId IN (SELECT driverId FROM transaction where status = 'advance' AND (advanceTime > NOW() + INTERVAL 9 HOUR)) UNION SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 and objectId NOT IN (SELECT driverId FROM transaction where status = 'advance')",function(err,queryDriver){
                          //connection.query("SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 and objectId IN (SELECT driverId FROM transaction where status = 'advance' AND (advanceTime > NOW() + INTERVAL 2 HOUR)) Order by RAND()",function(err,queryDriver){
                              if(err){
                                  res.json({"message":"error"});
                              }else{
                                  //located where user location is
                                  var locTemp = rows[0].pickUp.split(";");
                                  var latitude = Number(locTemp[0]);
                                  var longitude = Number(locTemp[1]);
                                  var userGeoPoint = new GeoPoint(latitude,longitude); //success
      //                            res.json({"message":latitude});

                                  // only for driver within 5km
                                  var driverNearby = "";
                                  for (var i = 0; i < queryDriver.length; i++) {
                                      //located where driver location is
                                      var getLocation=queryDriver[i].location
                                      if((getLocation!="")&&(getLocation!=null)&&(getLocation!=undefined))
                                      {
                                          locTemp = getLocation.split(";");
                                          var latD = Number(locTemp[0]);
                                          var longD = Number(locTemp[1]);
                                          var driverGeoPoint = new GeoPoint(latD,longD);

                                          //check the distance in kilo
                                          inKilometers = driverGeoPoint.distanceTo(userGeoPoint, true);
                                          // if distance <= 5KM then it will be push to an array
                                            if(inKilometers <= range){
                                                driverNearby+=queryDriver[i].objectId+";";
                                            }
                                      }
                                  };

                                  // is the driver banned ?
                                  var banned,driver;
                                  var notbanned = [""];
                                  var whosDecline = rows[0].whosDecline;
                                  //split whosdecline and driver nearby
                                  driver = driverNearby.split(";");
                                  // check whosDecline , kalo kosong seua masuk ke notbanned
                                  if ((whosDecline != null)&&(whosDecline != "")&&(whosDecline != undefined)) {

                                      banned = whosDecline.split(";");

                                      j=0;
                                      for (var i=0; i < driver.length; ++i){
                                          if (banned.indexOf(driver[i]) == -1){
                                              notbanned[j++] = driver[i];
                                          };
                                      };

                                  }else{
                                      notbanned = driver;
                                  }
      //                            res.json({"asdad":notbanned});

                                  if(notbanned.length==1&&notbanned[0]==""){
                                      res.json({"message":"no driver around you "});
                                  }else{
                                      // res.json({"message":"ULALA"});
                                      var query = "UPDATE transaction SET driverTemp = ? WHERE objectId = "+transId;
                                      var table = [notbanned[0]];
                                      query = mysql.format(query,table);
                                      connection.query(query,function(err,shh){
                                          if(err){
                                              res.json({"message":"err.. "+query});
                                          }else{
                                            //   res.json({"message":"success "});
                                             // DATA MINING
                                                var cancel_mining = "INSERT INTO action_log(username,driverId,action) VALUES (?,?,?)";
                                                var table = [rows[0].username,"","user request"];
                                                cancel_mining = mysql.format(cancel_mining,table);
                                                connection.query(cancel_mining,function(err,suc){
                                                  if (err) {
                                                    res.json({"message":"3 "+err});
                                                  }else{
                                                    res.json({"message":"success "}); //dont change the resnponse
                                                  }
                                                })
                                          }
                                      });
                                  };
                              }
                          });
                      }
                  }
                  else
                  {
                      res.json({"message":"no transaction available"});
                  }
              }
          });
          }
        })
    });

    //check driverID
    router.post("/searchDriver_multipledriver",function(req,res){
        var transId = req.body.transId;
        connection.query("SELECT driverId FROM transaction where objectId= "+transId+"",function(err,rows){
            if(err){
                res.json("err..");
            }else{
                if((rows[0]!=null)&&(rows[0]!="")){
                    if(rows[0].driverId=="no"||rows[0].driverId==""||rows[0].driverId==null){
                       res.json({"message":"keep searching"});
                    }else{
                        res.json({"message":"stop searching;"+rows[0].driverId});
                    }
                }
            }
        });
    });

    //check driverTemp = driverId ?
    //SELECT * FROM transaction WHERE transaction.username = 'ef@gmail.com' AND status <> 'cancel' AND status <> 'finnish' AND driverTemp IN (SELECT driverId from transaction where transaction.username = 'ef@gmail.com' AND status <> 'cancel' AND status <> 'finnish')
    router.post("/checkDriverTemp_multipledriver",function(req,res){
        var username = req.body.username;
        connection.query("SELECT * FROM transaction WHERE transaction.username = '"+username+"' AND status <> 'cancel' AND status <> 'finnish' AND driverTemp IN (SELECT driverId from transaction where transaction.username = '"+username+"' AND status <> 'cancel' AND status <> 'finnish')",function(err,rows){
            if(err){
                res.json("err..");
            }else{
                if(rows<1){
                    res.json({"message":"keep searching"});
                }else{
                    res.json({"message":"stop searching;"+rows[0].driverTemp});
                }
                // if((rows[0]!=null)&&(rows[0]!="")){
                //     if(rows[0].driverId=="no"||rows[0].driverId==""||rows[0].driverId==null){
                //        res.json({"message":"keep searching"});
                //     }else{
                //         res.json({"message":"stop searching;"+rows[0].driverId});
                //     }
                // }
            }
        });
    });

    //function resetBanned
    router.post("/resetBanned_multipledriver",function(req,res){
        var query = "UPDATE transaction SET whosDecline = ? WHERE ?? = ?";
        var table = ["","objectId",req.body.transId];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "cannot reset whosDecline"});
            } else {
                res.json({"Error" : false, "message" : "whosDecline has been reset"});
            }
        });
    });

    // advance booking
    //advance (delete it from transaction and put it on advance)
    router.post("/isAdvance_multipledriver",function(req,res){
        var transId = req.body.transId;
        connection.query("SELECT * FROM transaction WHERE objectId = "+transId,function(err,rows){
            if(err) {
                res.json({"Error" : true, "message" : "err.."});
            } else {
                if(rows[0].advanceTime == null) {
                    res.json({"message" : "regular"});
                } else {
                    //delete transaction and add it to advance table

                    // var insert = "INSERT advance (transId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime)";
                    // var select = " SELECT objectId,username,fee,pickUp,remark,destination,driverTemp,driverId,startJob,whosDecline,pickUpAddress,notif,destinationAddress,time,advanceTime";
                    // var from = " FROM transaction WHERE username = '"+username+"' AND status = 'active'";

                    // var insertIntoAdvace = insert+select+from;

                    // connection.query(insertIntoAdvace,function(err,advance){
                    //     if(err){
                    //         res.json({"message" : "cannot insert into advance "+insertIntoAdvace});
                    //     }else{
                    //         connection.query("DELETE FROM transaction WHERE objectId = "+rows[0].objectId,function(err,succ){
                    //             if(err){
                    //                 res.json({"message" : "cannot delete transaction"});
                    //             }else{
                    //                 res.json({"message" : "success"});
                    //             }
                    //         });
                    //     };
                    // });
                    connection.query("UPDATE transaction SET status = 'advance' WHERE objectId = "+transId,function(err,advance){
                        if(err){
                            res.json({"message" : "err.."});
                        }else{
                            res.json({"message" : "success"});
                        };
                    });
                }
            }
        });
    });


}

module.exports = user;
