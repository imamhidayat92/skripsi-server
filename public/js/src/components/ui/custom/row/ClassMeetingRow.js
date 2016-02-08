var ClassMeetingRow = React.createClass({
   render: function() {
      return (
         <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
         </tr>
      );
   }
});

ClassMeetingRowUtility = {
   createElementFromData: function(classMeeting) {
      return <ClassMeetingRow {...classMeeting}/>;
   },
   createElementsFromData: function(classMeetings) {
      var results = [];
      for (var i = 0; i < classMeetings.length; i++) {
         results.push(this.createElementsFromData(classMeetings[i]));
      }
      return results;
   }
};
