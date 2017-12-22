function ParseEntries(textDump)
{
  // Get each line and call ParseEntry on that line
  var lines = textDump.split("\n");
  //var lines = textDump.match(/[^\n]*/g);  // Regex form
  return lines.reduce( function (entries, line) {
    var entry = ParseEntry(line);
    if( entry != undefined )
    {
      entries.push(entry);
    }
    return entries;
  }, [] );
}

function ParseEntry(line)
{
  //Match Something Like: "LH Dec 25, 2017 08:00 Dec 25, 2017 17:00 8.00 Automatic Holiday"
  var match = /(\w+)\s+([^:]+:\d+)\s+([^:]+:\d+)\s+(\d+\.\d*)\s+(.+)$/.exec(line);
  if( match == undefined )
  {
    return undefined;
  }
  return {entryType: match[1], startDateTime: new Date(Date.parse(match[2])),
    endDateTime: new Date(Date.parse(match[3])), duration: match[4], other: match[5]};
}
