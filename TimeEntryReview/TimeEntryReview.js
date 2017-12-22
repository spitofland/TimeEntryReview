var timeLabelSpan = 4;

// NOTE: This code does not handle entries that cross midnight

function AddTime(dateObj, hours, minutes)
{
  var result = new Date(dateObj);
  result.setHours(result.getHours()+hours);
  result.setMinutes(result.getMinutes()+minutes);
  return result;
}

function DiffMinutesIgnoringDate(startTime, endTime)
{
  return 60*(endTime.getHours()-startTime.getHours()) + endTime.getMinutes()-startTime.getMinutes();
}

function ShortTimeFormat(dateObj)
{
  return /^\d+:\d+/.exec(dateObj.toTimeString());
}

function FindEarliestStartTime(entries)
{
  return entries.reduce( function (startTime, entry) {
    if( DiffMinutesIgnoringDate(entry.startDateTime,startTime) >= 0 )
    {
      startTime = entry.startDateTime;
    }
    return startTime;
  }, new Date(2020,0,1,23,45) );  // Initial value
}

function FindLatestEndTime(entries)
{
  return entries.reduce( function (endTime, entry) {
    if( (DiffMinutesIgnoringDate(entry.endDateTime,endTime) <= 0 &&
        (endTime.getHours != 0 || endTime.getMinutes() != 0)) ||
      (entry.endDateTime.getHours() == 0 && entry.endDateTime.getMinutes() == 0) )
    {
      endTime = entry.endDateTime;
    }
    return endTime;
  }, new Date(2020,0,1,0,15) );  // Initial value
}

function RoundDownToHour(dateObj)
{
  var rounded = new Date(dateObj);
  rounded.setMinutes(0);
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);
  return rounded;
}

function RoundUpToHour(dateObj)
{
  var rounded = RoundDownToHour(dateObj);
  if( rounded < dateObj )
  {
    rounded.setHours(rounded.getHours()+1);
  }
  return rounded;
}

function RoundDownToDate(dateObj)
{
  var rounded = RoundDownToHour(dateObj);
  rounded.setHours(0);
  return rounded;
}

function FillGridWithEmptyCells(numSlices)
{
  var str = "";
  for( var j=0; j<8; j++ )
  {
    for( var i=0; i<numSlices; i++ )
    {
      str += "<div class='empty' style='grid-column:" + (j+1) + "/span 1; grid-row:" + (i+2) + "/span 1'></div>";
    }
  }
  return str;
}

function DrawDayOfWeekLabels(entry)
{
  var str = "";
  var day = new Date(entry.startDateTime);
  day.setDate(day.getDate()-day.getDay());
  for(var i=0; i<7; day.setDate(day.getDate()+1), i++ )
  {
    str += "<div class='DayOfWeekLabel' style='grid-column: " + (i+2) + "/span 1;'>" +
      /^\w+\s\w+\s\d+/.exec(day.toDateString()) + "</div>";
  }
  str += "<div class='timeLabel' style='grid-column: 1/span 1;'></div>";
  return str;
}

function DrawTimeList(startTime, numSlices)
{
  var str = "";
  for( var time=new Date(startTime), i = 0; i < numSlices;
    time = AddTime(time,0,15*timeLabelSpan), i += timeLabelSpan )
  {
    str += "<div class='timeLabel' style='grid-row: " + (i+2) + "/span " +
      timeLabelSpan + "'><span>" + ShortTimeFormat(time) + "</span></div>"
  }
  return str;
}

function DrawEntries(entries, startTime)
{
  var str = "";
  for( var e in entries )
  {
    var dayOfWeek = entries[e].startDateTime.getDay();
    var startTimeSlice = Math.ceil(DiffMinutesIgnoringDate(startTime,entries[e].startDateTime)/15);
    var endTimeSlice = Math.ceil(DiffMinutesIgnoringDate(startTime,entries[e].endDateTime)/15);
    if( endTimeSlice <= 0 )   // Handle Midnight
    {
      endTimeSlice += 96;
    }

    str += "<div class='" + entries[e].entryType + "' style='grid-column: " + (dayOfWeek+2) +
      "/span 1; grid-row: " + (startTimeSlice+2) + "/" + (endTimeSlice+2) + "'>" +
      entries[e].entryType + " : " + entries[e].duration + " Hr" +
      (entries[e].duration > 1 ? "s" : "") + "<br/>" +
      ShortTimeFormat(entries[e].startDateTime) + " - " +
      ShortTimeFormat(entries[e].endDateTime) + "<br/>" +
      entries[e].other + "</div>";
  }
  return str;
}

function DrawWeek(entries)
{
  var str = "<div class='week'>";
  var startTime = RoundDownToHour(FindEarliestStartTime(entries));
  var endTime = RoundUpToHour(FindLatestEndTime(entries));
  var numSlices = Math.ceil(DiffMinutesIgnoringDate(startTime,endTime)/15);
  if( numSlices <= 0 )   // Handle Midnight
  {
    numSlices += 96;
  }

  str += FillGridWithEmptyCells(numSlices); // This must come first for grid lines to work correctly
  str += DrawTimeList(startTime,numSlices);
  str += DrawDayOfWeekLabels(entries[0]);
  str += DrawEntries(entries,startTime);

  str += "</div>";
  document.getElementById("Planner").innerHTML += str;
}

function GetEntriesForWeek(entries,weekDate)
{
  var weekStartDate = new Date(weekDate);
  weekStartDate.setHours(0);
  weekStartDate.setDate(weekStartDate.getDate()-weekStartDate.getDay());
  var weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate()+7);

  var entriesForWeek = entries.filter( function (entry) {
    return entry.startDateTime
  });
}

function DrawPlanner(entries)
{
  document.getElementById("Planner").innerHTML = "";
  entries.sort( function (entry1,entry2) { return entry1.startDateTime - entry2.startDateTime; });
  var startDate = RoundDownToDate(entries[0].startDateTime);
  var endDate = RoundDownToDate(entries[entries.length-1].startDateTime);
  var date = new Date(startDate);
  date.setDate(date.getDate()-date.getDay());
  var weekEnd = new Date(date);
  weekEnd.setDate(weekEnd.getDate()+7);

  for( ; date < endDate; date.setDate(date.getDate()+7), weekEnd.setDate(weekEnd.getDate()+7) )
  {
    DrawWeek( entries.filter( function (entry) {
      return (entry.startDateTime > date) && (entry.startDateTime < weekEnd);
    }) );
  }
}

function ParseEntryTable()
{
  var entries = ParseEntries(document.getElementById("EntryText").value);
  DrawPlanner(entries);
}
