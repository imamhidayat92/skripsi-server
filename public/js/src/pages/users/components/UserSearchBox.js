var UserSearchBox = React.createClass({
   // React Properties
   propTypes: {
      majors: React.PropTypes.array,
      roles: React.PropTypes.array
   },
   render: function() {
      return(
         <div className='search-box panel panel-default'>
            <div class='panel-body'>
               <div className='row'>
                  <div class='col-md-12'>
                     <h1>Search and Filter</h1>
                  </div>
               </div>
               <div className='row'>
                  <div className='col-md-4'>
                     <div class='form-group'>
                        <label>Name</label>
                        <input name='name' className='form-control' type='text' onKeyUp={this._signalChange} />
                     </div>
                  </div>
                  <div className='col-md-4'>
                     <div class='form-group'>
                        <label>E-mail</label>
                        <input name='email' className='form-control' type='text' onKeyUp={this._signalChange} />
                     </div>
                  </div>
                  <div className='col-md-2'>
                     <div class='form-group'>
                        <label>Major</label>
                        <select name='major' defaultValue=''>
                           <option value=''>- All Major -</option>
                           {this.props.majors.map(function(major) {
                              return <option value={major._id}>{major.name}</option>;
                           })}
                        </select>
                     </div>
                  </div>
                  <div className='col-md-2'>
                     <div class='form-group'>
                        <label>Role</label>
                        <select name='role' defaultValue=''>
                           <option value=''>- All Role -</option>
                           {{this.props.roles.map(function(role) {
                              return <option value={role}>{Utils.capitalizeFirstLetter(role)}</option>
                           })}}
                        </select>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   },
   shouldComponentUpdate: function() {
      if (this.state.status === 'IDLE') {
         return true;
      }
   },
   // Custom Properties
   _signalChange: function(event) {
      this.setState(function(previousState, props) {
         if (previousState.status === 'IDLE') {
            return { status: 'PREPARE_SERVICE_CALL' };
         }
         else if (previousState.status === 'PREPARE_SERVICE_CALL') {
            if (this._waitBeforeCall) {
               clearTimeout(this._waitBeforeCall);
            }
            this._waitBeforeCall = setTimeout(function() {
               this.setState({
                  status: 'CALLING_SERVICE'
               });
            }.bind(this), 2000)
            return {};
         }
         return {};
      }.bind(this));
   },
   _search: function(params) {
      UserService.getAll(this.state.params, this._successCallback, this._errorCallback);
   },
   _getParams: function() {
      return {

      }
   },
   _successCallback: function(data) {

   },
   _errorCallback: function(error) {

   }
});

UserSearchBoxUtility = {

};
