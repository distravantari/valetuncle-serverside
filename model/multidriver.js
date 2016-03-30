var mysql   = require("mysql");
var request = require('request');
var gcm = require('node-gcm');

function multidriver(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

multidriver.prototype.handleRoutes = function(router,connection) {
	var self = this;
}

module.exports = multidriver;
