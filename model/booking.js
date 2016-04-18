var mysql   = require("mysql");
var GeoPoint = require("geopoint");
var gcm = require('node-gcm');
var request = require('request');

function booking(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

booking.prototype.handleRoutes = function(router,connection,md5) {
  //findNearestDriver(transId)
      router.post("/findNearestGroup",function(req,res){
          var transId = req.body.transId;
          var range = 0;

          // take the range from table setting for findNearestdriver that within setting range kilo
          connection.query("SELECT `range` FROM `setting` WHERE objectId = 0",function(err,jarak){
            if(err){
              res.json({"Error" : true, "Message" : "err.."});
            }else{
              // take the range and put it on variable
              range = jarak[0].range;
              // get all the shit from transaction table that objectId = body that client gave
              connection.query("SELECT * from transaction WHERE objectId= "+transId,function(err,rows){
                if(err){
                    res.json({"message":"err.."});
                }else {
                    // if no rows means no transaction for that objectid that the client gave
                    // return no transaction available
                    if(rows.length>=1){
                        if ((rows[0].driverTemp != null)&&(rows[0].driverTemp != "")&&(rows[0].driverTemp != "no")&&(rows[0].driverTemp != "u")) {
                            res.json({"message":"no transaction available"});
                        }
                    }
                    else{
                      // we are using kilometers
                      var inKilometers = 0;
                      // get all the driver table nifo that flag and status = 1
                      connection.query("SELECT * from driver where flag = 1 and status = 1 and objectId IN (SELECT driverId FROM transaction where status = 'advance' AND (advanceTime > NOW() + INTERVAL 9 HOUR)) UNION SELECT flag,status,location,objectId from driver where flag = 1 and status = 1 and objectId NOT IN (SELECT driverId FROM transaction where status = 'advance')",function(err,queryDriver){

                        if(err){
                            res.json({"message":"error"});
                        }else{
                          //located where user location is
                          var locTemp = rows[0].pickUp.split(";");
                          var latitude = Number(locTemp[0]);
                          var longitude = Number(locTemp[1]);
                          // userGeoPoint is a varible consist of user location
                          var userGeoPoint = new GeoPoint(latitude,longitude);

                          // only for driver within range kilo
                          var driverNearby = "";
                          for (var i = 0; i < queryDriver.length; i++) {
                              //located where driver location is
                              var getLocation=queryDriver[i].location
                              if((getLocation!="")&&(getLocation!=null)&&(getLocation!=undefined)){
                                  locTemp = getLocation.split(";");
                                  var latD = Number(locTemp[0]);
                                  var longD = Number(locTemp[1]);
                                  var driverGeoPoint = new GeoPoint(latD,longD);

                                  //check the distance in kilo
                                  inKilometers = driverGeoPoint.distanceTo(userGeoPoint, true);
                                  // if distance <= range kila then it will be push to an array
                                  if(inKilometers <= range){
                                      // an array that consist of driver in within range
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

                          // start of dividing driver group by priority
                          driverFirstGroup = 0;   // priority = 1
                          driverSecondGroup = 0;  // priority = 2
                          for (var i = 0; i < notbanned.length; i++) {
                            connection.query("SELECT * FROM driver WHERE objectId = "+notbanned[i],function(err,priorityDriver){
                              if (err) {
                                res.json({"message":"error selecting driver priority"});
                              }else{
                                if (priorityDriver[0].priority == 1) {
                                  driverFirstGroup = notbanned[i];
                                }else{
                                  driverSecondGroup = notbanned[i];
                                }
                              }
                            });
                          }
                          // end of dividing driver group by priority

                          // if no driver first priority group available
                          if (driverFirstGroup.length==1&&driverFirstGroup[0]=="") {
                            // if no driver second priority group available
                            if (driverSecondGroup.length==1&&driverSecondGroup[0]=="") {
                              res.json({"message":"no driver around you "});
                            }
                            // if there is driver first priority group available
                            else{
                              var query = "UPDATE transaction SET driverTemp = ? WHERE objectId = "+transId;
                              var table = [driverSecondGroup[0]];
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
                            }
                          }
                          // if there is driver first priority group available
                          else{
                            var query = "UPDATE transaction SET driverTemp = ? WHERE objectId = "+transId;
                            var table = [driverFirstGroup[0]];
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
                          }

                        }

                      });
                    }
                }
              });
            }
          });
      });
}

module.exports = booking;
