function AttendanceService(config) {
   this._config = config;
}

AttendanceService.prototype.getAll = function(data, successCallback, errorCallback) {
   $.ajax({
      url: this.API_ADDRESS + '/users' + Utils.convertObjectToQueryString(params),
      method: 'GET'
   })
   .done(Utils.generateProperCallback(successCallback))
   .fail(Utils.generateProperCallback(errorCallback));
};

AttendanceService.prototype.get = function(id, successCallback, errorCallback) {
   $.ajax({
      url: this.API_ADDRESS + '/users/' + id,
      method: 'GET'
   })
   .done(Utils.generateProperCallback(successCallback))
   .fail(Utils.generateProperCallback(errorCallback));
};
