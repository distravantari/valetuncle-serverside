var mysql   = require("mysql");
var request = require('request');
var gcm = require('node-gcm');

function dashboard(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

dashboard.prototype.handleRoutes = function(router,connection,md5) {
	var self = this;
  
}
module.exports = dashboard;
