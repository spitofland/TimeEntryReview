var timeLabelSpan = 4;

// NOTE: This code does not handle entries that cross midnight

function AddTime(dateObj, hours, minutes) {
  var result = new Date(dateObj);
  result.setHours(result.getHours()+hours);
  result.setMinutes(result.getMinutes()+minutes);
  return result;
}

function DiffMinutesIgnoringDate(startTime, endTime) {
  return 60*(endTime.getHours()-startTime.getHours()) + endTime.getMinutes()-startTime.getMinutes();
}

function NumOfTimeSlices(startTime, endTime) {
  return Math.ceil(DiffMinutesIgnoringDate(startTime,endTime)/15);
}

function ShortTimeFormat(dateObj) {
  return /^\d+:\d+/.exec(dateObj.toTimeString());
}

function FindEarliestStartTime(entries, differences) {
  var MinStart = function (startTime, entry) {
    if( DiffMinutesIgnoringDate(entry.startDateTime,startTime) >= 0 ) {
      startTime = entry.startDateTime;
    }
    return startTime;
  };
  var prevStartTime = entries.reduce( MinStart, new Date(2020,0,1,23,45) );
  prevStartTime = differences.entries.reduce( MinStart, prevStartTime );
  return differences.processedEntries.reduce( MinStart, prevStartTime );
}

function FindLatestEndTime(entries, differences) {
  var MaxEnd = function (endTime, entry) {
    if( (DiffMinutesIgnoringDate(entry.endDateTime,endTime) <= 0 &&
          (endTime.getHours != 0 || endTime.getMinutes() != 0)) ||
          (entry.endDateTime.getHours() == 0 && entry.endDateTime.getMinutes() == 0) ) {
      endTime = entry.endDateTime;
    }
    return endTime;
  };
  var prevEndTime = entries.reduce( MaxEnd, new Date(2020,0,1,0,15) );
  prevEndTime = differences.entries.reduce( MaxEnd, prevEndTime );
  return differences.processedEntries.reduce( MaxEnd, prevEndTime );
}

function RoundDownToHour(dateObj) {
  var rounded = new Date(dateObj);
  rounded.setMinutes(0);
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);
  return rounded;
}

function RoundUpToHour(dateObj) {
  var rounded = RoundDownToHour(dateObj);
  if( rounded < dateObj ) {
    rounded.setHours(rounded.getHours()+1);
  }
  return rounded;
}

function RoundDownToDate(dateObj) {
  var rounded = RoundDownToHour(dateObj);
  rounded.setHours(0);
  return rounded;
}

function FillGridWithEmptyCells(numSlices) {
  var str = "";
  for( var j=0; j<8; j++ ) {
    for( var i=0; i<numSlices; i++ ) {
      str += "<div class='empty' style='grid-column:" + (j+1) + "/span 1; grid-row:" +
        (i+2) + "/span 1'></div>";
    }
  }
  return str;
}

function DrawDayOfWeekLabels(entry) {
  var str = "";
  var day = new Date(entry.startDateTime);
  day.setDate(day.getDate()-day.getDay());
  for(var i=0; i<7; day.setDate(day.getDate()+1), i++ ) {
    str += "<div class='DayOfWeekLabel' style='grid-column: " + (i+2) + "/span 1;'>" +
      /^\w+\s\w+\s\d+/.exec(day.toDateString()) + "</div>";
  }
  str += "<div class='timeLabel' style='grid-column: 1/span 1;'></div>";
  return str;
}

function DrawTimeList(startTime, numSlices) {
  var str = "";
  for( var time=new Date(startTime), i = 0; i < numSlices;
        time = AddTime(time,0,15*timeLabelSpan), i += timeLabelSpan ) {
    str += "<div class='timeLabel' style='grid-row: " + (i+2) + "/span " +
      timeLabelSpan + "'><span>" + ShortTimeFormat(time) + "</span></div>"
  }
  return str;
}

function GetEntryColRowStr(entry, startTime) {
  var endTimeSlice = NumOfTimeSlices(startTime,entry.endDateTime);
  if( endTimeSlice <= 0 ) {   // Handle Midnight
    endTimeSlice += 96;
  }
  return "style='grid-column: " + (entry.startDateTime.getDay()+2) + "/span 1; grid-row: " +
    (NumOfTimeSlices(startTime,entry.startDateTime)+2) + "/" + (endTimeSlice + 2) + "'";
}

function GetEntryDescription(entry) {
  return entry.entryType + " : " + ShortTimeFormat(entry.startDateTime) + " - " +
    ShortTimeFormat(entry.endDateTime) + " : " + entry.duration +
    " Hr" + (entry.duration > 1 ? "s" : "") + "<span class='tooltip'><br/>" +
    entry.other + "</span>";
}

function DrawEntries(entries, startTime) {
  var str = "";
  for( var e in entries ) {
    str += "<div class='entry " + entries[e].entryType + "' " + GetEntryColRowStr(entries[e],startTime) +
      ">" + GetEntryDescription(entries[e]) + "</div>";
  }
  return str;
}

function DrawDifferences(differences, startTime) {
  var str = "";
  for( var e of differences.entries ) {
    str += "<div class='entryDiff' " + GetEntryColRowStr(e,startTime) +
      "><span class='tooltip'>Unmatched Entry<br/>" + GetEntryDescription(e) + "</span></div>";
  }
  for( var p of differences.processedEntries ) {
    str += "<div class='processedDiff' " + GetEntryColRowStr(p,startTime) +
      "><span class='tooltip'>Unmatched Processed Entry<br/>" + GetEntryDescription(p) +
      "</span></div>";
  }
  return str;
}

function DrawWeek(entries,differences) {
  var str = "<div class='week'>";
  var startTime = RoundDownToHour(FindEarliestStartTime(entries,differences));
  var endTime = RoundUpToHour(FindLatestEndTime(entries,differences));
  var numSlices = NumOfTimeSlices(startTime,endTime);
  if( numSlices <= 0 ) {   // Handle Midnight
    numSlices += 96;
  }

  str += FillGridWithEmptyCells(numSlices); // This must come first for grid lines to work correctly
  str += DrawTimeList(startTime,numSlices);
  str += DrawDayOfWeekLabels(entries[0]);
  str += DrawEntries(entries,startTime);
  str += DrawDifferences(differences,startTime);

  str += "</div>";
  document.getElementById("Planner").innerHTML += str;
}

function GetEntriesForWeek(entries,weekDate) {
  var weekStartDate = new Date(weekDate);
  weekStartDate.setHours(0);
  weekStartDate.setDate(weekStartDate.getDate()-weekStartDate.getDay());
  var weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate()+7);

  var entriesForWeek = entries.filter( function (entry) {
    return entry.startDateTime
  });
}

function DrawPlanner(entries,differences) {
  document.getElementById("Planner").innerHTML = "";
  entries.sort( function (entry1,entry2) { return entry1.startDateTime - entry2.startDateTime; });
  var startDate = RoundDownToDate(entries[0].startDateTime);
  var endDate = RoundDownToDate(entries[entries.length-1].startDateTime);
  var date = new Date(startDate);
  date.setDate(date.getDate()-date.getDay());
  var weekEnd = new Date(date);
  weekEnd.setDate(weekEnd.getDate()+7);

  for( ; date < endDate; date.setDate(date.getDate()+7), weekEnd.setDate(weekEnd.getDate()+7) ) {
    var IsInWeek = function (entry) {
      return (entry.startDateTime > date) && (entry.startDateTime < weekEnd);
    };
    var weekDiff = {entries: differences.entries.filter(IsInWeek),
      processedEntries: differences.processedEntries.filter(IsInWeek)};
    DrawWeek( entries.filter(IsInWeek), weekDiff );
  }
}

function ParseEntryTables() {
  var entries = ParseEntries(document.getElementById("EntryText").value);
  var differences = {entries: [], processedEntries: []};
  if( !document.getElementById("ProcessedEntryTextDiv").classList.contains("hidden") ) {
    var procEntries = ParseProcessedEntries(document.getElementById("ProcessedEntryText").value);
    differences = CompareEntryLists(entries,procEntries);
  }
  DrawPlanner(entries,differences);
}

function ToggleProcessedTable() {
  var processedTableClasses = document.getElementById("ProcessedEntryTextDiv").classList;
  var drawProcessedButton = document.getElementById("HideProcessed");
  if( processedTableClasses.contains("hidden") ) {
    processedTableClasses.remove("hidden");
    drawProcessedButton.innerHTML = "Hide Processed Entries Table";
  }
  else {
    processedTableClasses.add("hidden");
    drawProcessedButton.innerHTML = "Compare With Processed Entries";
  }
  ParseEntryTables();
}
