function IndexPage(selectors, options) {
   this._selectors = selectors;

   this._containers = {};
   this._reactElements = {};

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
         var userRoleLabel = function(user) {
            var capitalizeFirstLetter = function(str) {
               var strSplit = str.split('');
               strSplit[0] = strSplit[0].toUpperCase();
               return strSplit.join('');
            };
            switch(user.role) {
               case 'administrator':
                  return <span className='label label-danger'>{capitalizeFirstLetter(user.role)}</span>;
               case 'lecturer':
                  return <span className='label label-warning'>{capitalizeFirstLetter(user.role)}</span>;
               case 'student':
                  return <span className='label label-success'>{capitalizeFirstLetter(user.role)}</span>
               case 'staff':
               default:
                  return <span className='label label-default'>{capitalizeFirstLetter(user.role)}</span>;
            }
         };

         var columns = [
            'Name', 'E-mail', 'Major', 'Role', 'Action'
         ];
         var rows = [];
         for (var i = 0; i < data.results.length; i++) {
            var cells = [];
            var user = data.results[i];
            cells.push(
               <p>{user.name}</p>
            );
            cells.push(
               <code>{user.email}</code>
            );
            cells.push(
               <span className='label' style={{ 'background-color': user.major.color }}>{user.major.name}</span>
            );
            cells.push(
               userRoleLabel(user)
            );
            cells.push(
               (
                  function() {
                     if (user.role == 'student') {
                        return <a className='btn btn-m btn-info' href={'/users/' + user._id + '/enrollments'}>Enrollments</a>
                     }
                     else {
                        return <p><em>- no action available</em></p>
                     }
                  }
               )()
            );

            rows.push(cells);
         }
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
   this._reactElements['tableUserList'] = ReactDOM.render(
      <Table columns={columns} rows={rows} />,
      this._containers[this._selectors.TABLE_USER_LIST][0]
   );
};
