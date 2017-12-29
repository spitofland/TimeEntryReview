var defaultStyles = [
  {type: "RG", style: "background-color: #66bb99; color: black;"}, // Normal Time Worked
  {type: "LA", style: "background-color: #ccffcc; color: black;"}, // Annual Leave
  {type: "SL", style: "background-color: #ffff99; color: black;"}, // Sick Leave
  {type: "CD", style: "background-color: #ccffff; color: black;"}, // Credit Hours Earned
  {type: "CN", style: "background-color: #99ccff; color: black;"}, // Credit Hours Used
  {type: "CE", style: "background-color: #00ccff; color: black;"}, // Comp Hours Earned
  {type: "CT", style: "background-color: #0050b0; color: white;"}, // Comp Hours Used
  {type: "CB", style: "background-color: #ccccff; color: black;"}, // Travel Comp Hours Earned
  {type: "CF", style: "background-color: #cc99ff; color: black;"}, // Travel Comp Hours Used
  {type: "OT", style: "background-color: #ff7c80; color: black;"}, // Overtime Worked
  {type: "CB", style: "background-color: #00bb50; color: black;"}, // Award Leave
  {type: "LN", style: "background-color: #ff6600; color: black;"}, // Administrative Leave
  {type: "LH", style: "background-color: #444444; color: white;"}, // Holiday Leave
];

function StoreStyles( styles ) {
  if( typeof(Storage) !== "undefined" ) {
    var timeEntryStyles = "";
    for( var s in styles ) {
      timeEntryStyles += StyleEntryToString(styles[s]);
    }
    try {
      localStorage.setItem('timeEntryStyles', timeEntryStyles);
    }
    catch (err) {}  // Fail silently
  }
}

function ReadStylesFromStorage() {
  var styles = [];
  if( typeof(Storage) !== "undefined" ) {
    try {
      var timeEntryStyles = localStorage.getItem( 'timeEntryStyles' );
      if( timeEntryStyles != undefined ) {
        var styleStrs = timeEntryStyles.match(/\.\w+\s+\{[^}]*\}/g);
        for( var s in styleStrs ) {
          var style = styleStrs[s].match(/\.(\w+)\s+\{([^}]*)\}/);
          styles.push({type: style[1], style: style[2]});
        }
      }
    }
    catch (err) {}  // Fail silently
  }
  return styles;
}

function StyleEntryToString( style ) {
  return "." + style.type + " {" + style.style + "} ";
}

function OutputStylesForHeader() {
  var styles = defaultStyles;
  if( typeof(Storage) !== "undefined" ) {
    try {
      if( localStorage.getItem( 'timeEntryStyles' ) == undefined ) {
        StoreStyles(styles);
      }
      styles = ReadStylesFromStorage();
    }
    catch (err) {}  // Fail silently
  }

  var styleStr = "<style>";
  for( var s in styles ) {
    styleStr += StyleEntryToString(styles[s]);
  }
  document.write(styleStr + "</style>");
}

OutputStylesForHeader();
