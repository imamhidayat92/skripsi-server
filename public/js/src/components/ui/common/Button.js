var Button = React.createClass({
   getInitialState: function() {
      return [];
   },
   render: function() {
      return(
         <div className='buttonContainer'>
            <a href='#' className={this.props.type}></a>
         </div>
      );
   }
});

function ButtonComponent(selector, props, options) {
   
}

ButtonComponent.prototype.render = function() {

};
