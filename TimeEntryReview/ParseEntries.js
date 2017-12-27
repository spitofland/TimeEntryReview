function ParseEntries( textDump ) {
  // This uses a string delimiter, an equivalent RegEx would be /[^\n]*/g
  return ParseLines("\n",textDump,ParseEntry);
}

function ParseProcessedEntries( textDump ) {
  // This uses a string delimiter, an equivalent RegEx would be /[^\n]*/g
  return ParseLines("\n",textDump,ParseProcessedEntry);
}

// ParseLines can take a string delimiter or a RegEx for 'splitter'
function ParseLines( splitter, textDump, Parser ) {
  var lines;
  if( splitter instanceof RegExp ) {
    lines = textDump.match(splitter);
  }
  else {
    lines = textDump.split(splitter);
  }

  return lines.reduce( function ( entries, line ) {
    var entry = Parser(line);
    if( entry != undefined ) {
      entries.push(entry);
    }
    return entries;
  }, [] );
}

function ParseEntry( line ) {
  //Match Something Like: "LH Dec 25, 2017 08:00 Dec 25, 2017 17:00 8.00 Automatic Holiday"
  var regEx = /(\w+)\s+([^:]+:\d+(\s+[AP]M)?)\s+([^:]+:\d+(\s+[AP]M)?)\s+(\d+\.?\d*)\s+(.*)$/;
  var match = regEx.exec(line);
  if( match == undefined ) {
    return undefined;
  }
  return {entryType: match[1], startDateTime: new Date(Date.parse(match[2])),
    endDateTime: new Date(Date.parse(match[4])), duration: match[6], other: match[7]};
}

// This is unfortunately English specific
function GetWeekDayFromStr(dayOfWeekStr) {
  var weekDay = 0;
  var upperStr = dayOfWeekStr.toUpperCase();
  if( upperStr[0] == 'S' ) {
    if( upperStr[1] == 'U' ) {
      weekDay = 0;
    }
    else {
      weekDay = 6;
    }
  }
  else if( upperStr[0] == 'M' ) {
    weekDay = 1;
  }
  else if( upperStr[0] == 'T' ) {
    if( upperStr[1] == 'U' ) {
      weekDay = 2;
    }
    else {
      weekDay = 4;
    }
  }
  else if( upperStr[0] == 'W' ) {
    weekDay = 3;
  }
  else {
    weekDay = 5;
  }
  return weekDay;
}

// Processed Entries don't list the year, so try to figure it out
function DetermineCorrectDate(startingDate, dayOfWeek) {
  var weekDay = GetWeekDayFromStr(dayOfWeek);
  var date = new Date(startingDate);
  while( date.getDay() != weekDay ) {
    date.setFullYear(date.getFullYear()-1);
  }
  return date;
}

function ParseProcessedEntry( line ) {
  //Match Something Like: "10/17  TUE  00000  0  1375  RG  0200  0000  0000  0000  0000"
  //                  Or: "10/18  WED  00000  0  1500  CD  0000  0000  0000  0000  0100"
  //                      |   Date   |          |Time|Type|         Duration           |
  var regEx = /0?(\d+)\/(\d+)\s+(\w+)\s+\w+\s+\w+\s+(\d+)(\d\d)\s+(\w+)[^1-9]+([1-9]\d*)(\D|$)/;
  var match = regEx.exec(line);
  if( match == undefined ) {
    return undefined;
  }

  // Use weekday string to match year
  var now = new Date();
  var entryYear = now.getFullYear()+1;
  var dateStr = match[1]+"\/"+match[2]+"\/"+entryYear+" "+match[4]+":"+(match[5]*0.6);
  var startDateTime = DetermineCorrectDate(Date.parse(dateStr), match[3]);

  return {entryType: match[6], startDateTime: startDateTime, endDateTime: undefined,
    duration: (match[7]/100), other: ""};
}

function CompareEntryLists( entries, processedEntries ) {
  var entryIndex = 0;
  var differences = {entries: [], processedEntries: []};

  // Add non-matching entries to 'differences'
  for( var procIndex = 0; procIndex < processedEntries.length; procIndex++ ) {
    var procEntry = processedEntries[procIndex];
    var unmatchedDuration = procEntry.duration;
    var procEntryAdded = false;

    for( entryIndex; entryIndex < entries.length &&
          entries[entryIndex].startDateTime < procEntry.startDateTime; entryIndex++ ) {
      differences.entries.push(entries[entryIndex]);
    }

    // Multiple consecutive 'entries' may contribute to the same 'processed entry'
    for( var lastEndTime = procEntry.startDateTime;
          (entryIndex < entries.length) && (entries[entryIndex].duration <= unmatchedDuration) &&
          (entries[entryIndex].startDateTime.getTime() == lastEndTime.getTime()); entryIndex++ ) {
      lastEndTime = entries[entryIndex].endDateTime;
      unmatchedDuration -= entries[entryIndex].duration;
      if( entries[entryIndex].entryType != procEntry.entryType ) {
        differences.entries.push(entries[entryIndex]);
        if( !procEntryAdded ) {
          procEntryAdded = true;
          differences.processedEntries.push(procEntry);
        }
      }
    }
    procEntry.endDateTime = AddTime(lastEndTime, 0, 60*unmatchedDuration);  // Best guess end time

    if( unmatchedDuration > 0 && !procEntryAdded ) {
      differences.processedEntries.push(procEntry);
    }
  }

  for( entryIndex; entryIndex < entries.length; entryIndex++ ) {
    differences.entries.push(entries[entryIndex]);
  }

  return differences;
}
