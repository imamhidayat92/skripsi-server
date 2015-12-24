var Label = React.createClass({
   render: function() {
      return (
         <span className={this.props.type}></span>
      );
   }
});

function LabelComponent(selectors, props, options) {
   this._containers = $(selectors);
   this._props = props;
}
