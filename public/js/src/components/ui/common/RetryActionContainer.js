var RetryActionContainer = React.createClass({
   propTypes: {
      message: React.PropTypes.string,
      caption: React.PropTypes.string,

      handleClick: React.PropTypes.func
   }
   render: function() {
      return (
         <div>
            {this.props.message + ' '}
            <a href='#' onClick={this.props.handleClick}>{this.props.caption}</a>
         </div>
      );
   }
});
