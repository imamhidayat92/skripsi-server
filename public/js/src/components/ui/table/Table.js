var Table = React.createClass({
   propTypes: {
      columns: React.PropTypes.array,
      rows: React.PropTypes.array
   },
   render: function() {
      var columns = this.props.columns;
      var rows = this.props.rows;
      return (
         <table className='table table-hover'>
            <thead>
               {columns.map(function(column) {
                  return (
                     <th>{column}</th>
                  );
               })}
            </thead>
            <tbody>
               {rows.map(function(cells) {
                  return (
                     <tr>
                        {cells.map(function(cell) {
                           return <td>{cell}</td>
                        })}
                     </tr>
                  );
               })}
            </tbody>
         </table>
      );
   }
});
