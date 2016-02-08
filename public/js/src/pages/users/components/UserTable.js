var UserTable = React.createClass({
   // React Properties
   componentDidMount: function() {

   },
   componentWillUnmount: function() {
      if (this._waitBeforeCall) {
         clearTimeout(this._waitBeforeCall);
      }
   },
   getInitialState: function() {
      return {
         // Available status are: IDLE, PREPARE_SERVICE_CALL, CALLING_SERVICE
         // State transition:
         //   IDLE => PREPARE_SERVICE_CALL => CALLING_SERVICE
         status: 'IDLE',
         params: {
            name: '',
            email: '',
            major: '',
            role: ''
         }
      };
   },
   propTypes: {
      columns: React.PropTypes.array,
      rows: React.PropTypes.array
   },
   render: function() {
      return (
         <div>
            <UserSearchBox  />
            <TableWithCustomRow columns={this.props.columns} rows={this.props.rows} />
         </div>
      );
   },
   // Custom Properties
   
});
