var mysql   = require("mysql"),
Waterline = require('waterline'),
mysqlAdapter = require('sails-mysql');

function promo(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

promo.prototype.handleRoutes = function(router,connection){
  var self = this;

  //client get a promo by giving a code
  router.post("/getPromo",function(req,res){
      var promocode = req.body.promocode;
      var query = "SELECT * FROM `promo` WHERE CODE = '"+promocode+"'";
      connection.query(query,function(err,rows){
          if(err){
              res.json({"message":query});
          }else{
              if(rows.length == 0){
                  res.json({"message":"you have entered a wrong promo code"});
              }else{
                  res.json({"message":rows});
              }
          }
      });
  });

  router.post("/checkPromo",function(req,res){
      var promocode = req.body.promocode;
      var username = req.body.username;
      var query = "SELECT * FROM `history` WHERE username = '"+username+"' AND promocode = '"+promocode+"'";
      var proquery = "SELECT * FROM `promo` WHERE code = '"+promocode+"'";
      connection.query(query,function(err,rows){
          if(err){
              res.json({"message":query});
          }else{
              var val = "true";

              // old one
              // for (var i = 0; i < rows.length; i++) {
              //     if(promocode == rows[i].promocode){
              //         val = "false";
              //         i = rows.length;
              //     }else{
              //         val = "true";
              //     }
              // }
              // res.json({"message":val});

              // new one
              connection.query(proquery,function(err,prows){
                 if(err){
                     res.json({"message":proquery});
                 }else{
                  //  is prows.length == 0 ?
                   if (prows.length == 0) {
                     val = "false no available promo";
                   }else{
                     //  prows[0].day == null ?
                     if (prows[0].day == null || prows[0].day == undefined) {
                      //  prows[0].limit >= rows.length ?
                      if (Number(prows[0].limit) >= rows.length) {
                        val = "true";
                      }else{
                        val = "false limit promo exceeded";
                      }
                     }
                     //  prows[0].day != null ?
                     else{
                       var today = new Date();
                       var todayInt = today.getDay();
                      //  prows[0].day != null ? todayInt ?
                      if (prows[0].day == todayInt ) {
                        val = "true";
                      }else{
                        //  prows[0].limit >= rows.length ?
                        val = "false promo day is not valid "+todayInt;
                      }
                     }
                   }
                   res.json({"message":val});
                  //  end of prows.length

                 }
              });
              // res.json({"message":val});
          }
      });
  });

  //set a promo code
  router.post("/makePromo",function(req,res){
      var promocode = req.body.promocode;
      var desc = req.body.description;
      var query = "INSERT INTO `promo` SET CODE = ?, description = ?";
      var table = [promocode,desc];
      query = mysql.format(query,table);
      connection.query(query,function(err,rows){
          if(err){
              res.json({"message":query});
          }else{
              res.json({"message":"success"});
          }
      });
  });
}

module.exports = promo;
