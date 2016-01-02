function UserService(config) {
   this._config = config;
   this.API_ADDRESS = Constants.API_ADDRESS;
}

// Public Functions

UserService.prototype.getAll = function(params, successCallback, errorCallback) {
   $.ajax({
      url: this.API_ADDRESS + '/users' + Utils.convertObjectToQueryString(params),
      method: 'GET'
   })
   .done(Utils.generateProperCallback(successCallback))
   .fail(Utils.generateProperCallback(errorCallback));
};

UserService.prototype.get = function(id, successCallback, errorCallback) {
   $.ajax({
      url: this.API_ADDRESS + '/users/' + id,
      method: 'GET'
   })
   .done(Utils.generateProperCallback(successCallback))
   .fail(Utils.generateProperCallback(errorCallback));
};

UserService.prototype.getAttendances = function(id, params, successCallback, errorCallback) {
   $.ajax({
      url: this.API_ADDRESS + '/users/' + id + '/attendances' + Utils.convertObjectToQueryString(params),
      method: 'GET'
   })
   .done(Utils.generateProperCallback(successCallback))
   .fail(Utils.generateProperCallback(errorCallback));
};
