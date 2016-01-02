function AttendanceIndexPage(selectors) {
   this._selectors = selectors;

   this._containers = {};
}

AttendanceIndexPage.prototype._init = function() {
   for (var k in this._selectors) {
      this._containers[this._selectors[k]] = $(this._selectors[k])
   }

   this._fetchAndRenderTableUserAttendanceList();
};

AttendanceIndexPage.prototype._fetchAndRenderTableUserAttendanceList = function() {
   var successCallback = function(data) {
      if (data && data.success) {
         var columns = [
            'Created', 'Mode', 'Status', 'Remarks', 'Verified', 'Course', 'Actions'
         ];
         var rows = [];

         for (var i = 0; i < data.results.length; i++) {
            var attendance = data.results[i];
            rows.push(this._generateRowElement(attendance));
         }

         this._fetchAndRenderTableUserAttendanceList(columns, rows);
      }
   }.bind(this);
   var errorCallback = function(data) {
      this._renderErrorMessage();
   }.bind(this)
   var params = {};
   this._userService.getAllAttendance(params, successCallback, errorCallback);
};

AttendanceIndexPage.prototype._generateRowElement = function(attendance) {
   var row = [];

   row.push(
      <p>{attendance.created}</p>
   );
   row.push(
      <span className='label label-default'>{attendance.mode}</span>
   );
   row.push(
      <span className='label label-default'>{attendance.status}</span>
   );
   row.push(
      <p>{attendance.remarks}</p>
   );
   row.push(
      <span className={'label label-' + attendance.verified ? 'success' : 'default'}>{attendance.verified}</span>
   );
   row.push(
      <p>{attendance.schedule.course.name}</p>
   );
   row.push(
      <div>
         <a href='#' className='btn btn-sm btn-warning'>Edit Status</a>
      </div>
   );

   return row;
};

AttendanceIndexPage.prototype._renderErrorMessage = function() {
   var callback = function() {
      this._initTableUserList();
   }.bind(this);
   ReactDOM.render(
      <RetryActionContainer message='Failed while fetching attendance data.' caption='Try again?' handleClick={callback} />,
      this._containers[this._selectors.TABLE_USER_LIST][0]
   );
};

AttendanceIndexPage.prototype._renderTableUserAttendanceList = function(columns, rows) {
   ReactDOM.render(
      <Table columns={columns} rows={rows} />,
      this._containers[this._selectors.TABLE_USER_ATTENDANCE_LIST][0]
   );
};
