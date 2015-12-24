var LoadingIndicator = React.createClass({
   render: function() {
      return (
         <div className="loading-indicator">
            <p>{this.props.message}</p>
         </div>
      );
   }
});
