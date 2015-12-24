function ServiceFactory(config) {
   this._config = config;
}

ServiceFactory.prototype.getUserService = function() {
   var config = {};
   return new UserService(config);
};
