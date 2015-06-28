var TableHover = React.createClass({
   render: function() {
      var columnLabels = this.props.columnLabels;
      var rows = this.props.data;
      return (
         <table id="{this.props.id}" class="table table-hover">
            <thead>
               {columnLabels.map(function(columnLabel) {
                  return <ColumnLabel />;
               })}
            </thead>
            <tbody>
               {rows.map(function(row) {
                  return <Row />;
               })}
            </tbody>
         </table>
      );
   }
});

var TableHoverComponent = function(containerId, columnLabels, data) {

};
