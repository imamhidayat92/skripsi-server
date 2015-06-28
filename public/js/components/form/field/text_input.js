var TextInput = React.createClass({
   render: function() {
      return(
         <input type='text' name='{this.props.name}' />
      );
   }
});

var TextInputComponent = function($container) {
   React.render(
      <TextInput />,
      document.getElementById(container)
   );
};
