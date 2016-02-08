var UserRow = React.createClass({
   propTypes: {
      _id: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      email: React.PropTypes.string.isRequired,
      major: React.PropTypes.object.isRequired,
      role: React.PropTypes.string.isRequired
   },
   render: function() {
      var actions, roleLabel;
      if (this.props.role === 'student') {
         actions = <div>
            <a className='btn btn-sm btn-info' href={'/users/' + this.props._id + '/enrollments'}>Enrollments</a>{' '}
            <a className='btn btn-sm btn-default' href={'/users/' + this.props._id + '/attendances'}>Attendances</a>
         </div>;
      }
      else {
         actions = <p><em>- no action available</em></p>;
      }
      switch(this.props.role) {
         case 'administrator':
            roleLabel = <span className='label label-danger'>{Utils.capitalizeFirstLetter(this.props.role)}</span>;
         case 'lecturer':
            roleLabel = <span className='label label-warning'>{Utils.capitalizeFirstLetter(this.props.role)}</span>;
         case 'student':
            roleLabel = <span className='label label-success'>{Utils.capitalizeFirstLetter(this.props.role)}</span>
         case 'staff':
         default:
            roleLabel = <span className='label label-default'>{Utils.capitalizeFirstLetter(this.props.role)}</span>;
      }
      return (
         <tr>
            <td>{this.props.name}</td>
            <td><code>{this.props.email}</code></td>
            <td><span className='label' style={{ 'background-color': this.props.major.color }}>{this.props.major.name}</span></td>
            <td>{roleLabel}</td>
            <td>{actions}</td>
         </tr>
      );
   }
});

UserRowUtility = {
   getDefaultColumnNames: function() {
      return ['Name', 'E-mail', 'Major', 'Role', 'Action'];
   },
   createElementFromData: function(user) {
      return <UserRow {...user}/>;
   },
   createElementsFromData: function(users) {
      var results = [];
      for (var i = 0; i < users.length; i++) {
         results.push(this.createElementFromData(users[i]));
      }
      return results;
   }
};
