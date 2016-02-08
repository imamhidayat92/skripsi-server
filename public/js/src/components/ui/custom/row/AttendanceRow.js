var AttendanceRow = React.createClass({
   propTypes: {
      id: React.PropTypes.string,
      mode: React.PropTypes.string,
      status: React.PropTypes.string,
      remarks: React.PropTypes.string,
      verified: React.PropTypes.string,
   },
   render: function() {
      var modeLabel, statusLabel, verifiedLabel;

      switch (this.props.mode) {

      }
      switch (this.props.status) {

      }
      if (this.props.verified) {

      }

      return (
         <tr>
            <td>{modeLabel}</td>
            <td>{statusLabel}</td>
            <td>{verifiedLabel}</td>
            <td><p>{this.props.remarks}</p></td>
            <td>
               <a href={'/attendances/' + this.props.id} className=''>Edit</a>
            </td>
         </tr>
      );
   }
});

AttendanceRowUtility = {
   createElementFromData: function(attendance) {
      return <AttendanceRow {...attendance}/>;
   },
   createElementsFromData: function(attendances) {
      var results = [];
      for (var i = 0; i < attendances.length; i++) {
         results.push(this.createElementsFromData(attendances[i]));
      }
      return results;
   }
};
