var Table = React.createClass({
   propTypes: {
      columns: React.PropTypes.array,
      rows: React.PropTypes.array
   },
   render: function() {
      var columns = this.props.columns;
      var rows = this.props.rows;

      var tableBodyElement;
      if (rows.length > 0) {
         tableBodyElement = <tbody>
            {rows.map(function(cells) {
               return (
                  <tr>
                     {cells.map(function(cell) {
                        return <td>{cell}</td>
                     })}
                  </tr>
               );
            })}
         </tbody>;
      }
      else {
         tableBodyElement = <tbody>
            <tr>
               <td colspan={columns.length}><em>- no action available -</em></td>
            </tr>
         </tbody>;
      }

      return (
         <table className='table table-hover'>
            <thead>
               {columns.map(function(column) {
                  return (
                     <th>{column}</th>
                  );
               })}
            </thead>
            {tableBodyElement}
         </table>
      );
   }
});
