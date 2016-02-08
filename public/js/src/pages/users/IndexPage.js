function IndexPage(selectors, options) {
   this._selectors = selectors;

   this._containers = {};

   this._userService = new UserService();

   this._init();
}

IndexPage.prototype._init = function() {
   // All selectors should be unique.
   for (var k in this._selectors) {
      this._containers[this._selectors[k]] = $(this._selectors[k]);
   }

   this._initTableUserList();
};

IndexPage.prototype._initTableUserList = function() {
   ReactDOM.render(
      <LoadingIndicator message='Please wait...' />,
      this._containers[this._selectors.TABLE_USER_LIST][0]
   );

   var successCallback = function(data) {
      if (data && data.success) {
         var columns = UserRowUtility.getDefaultColumnNames();
         var rows = UserRowUtility.createElementsFromData(data.results);
         this._renderTableUserList(columns, rows);
      }
   }.bind(this);

   var errorCallback = function() {
      this._renderErrorMessage();
   }.bind(this);

   var params = {};

   this._userService.getAll(params, successCallback, errorCallback);
};

IndexPage.prototype._renderErrorMessage = function() {
   var callback = function() {
      this._initTableUserList();
   }.bind(this);
   ReactDOM.render(
      <RetryActionContainer message='' caption='' handleClick={callback} />,
      this._containers[this._selectors.TABLE_USER_LIST][0]
   );
}

IndexPage.prototype._renderTableUserList = function(columns, rows) {
   ReactDOM.render(
      <TableWithCustomRow columns={columns} rows={rows} />,
      this._containers[this._selectors.TABLE_USER_LIST][0]
   );
};
