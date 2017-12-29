# TimeEntryReview

TimeEntryReview is a simple web page application that can be used to convert a time entry text dump into a planner format that is easier to read. This can make reviewing time entries for correctness much faster.

This tool can also compare time entries from two time keeping systems to ensure that the entries match up. The second list of time entries are called 'processed entries' in this document and in the code. This naming convention is based on the assumption that entries were processed in some way while being ported from one system to another. In my examples, this processing results in consecutive entries of the same type being combined into a single 'processed entry' of that type.

I expect this tool is only useful to a small number of people. I hope that most time entry systems are easier to use and have better interfaces than the ones I currently use. If that is the case, then this project can serve as an example of some of the things that can be done with CSS and particularly CSS Grid.

# How Do I Use It?

Open TimeEntryReview.html in a modern browser (must support CSS Grid), paste the time entry text dump into the text box, and push the "Draw Entries" button. Hovering over entries in the planner view will cause them to expand and reveal extra information about the entry.

In order to compare logged time entries and processed time entries, the "Compare With Processed Entries" button can be clicked. This will provide a second text box for the processed entries. When this box is open, "Draw Entries" will add a comparison between the two tables. Differences will be shown as red bars. The red bars will expand with more information about the mismatch when you hover over them.

If your time entry system uses different billing codes (RG, LA, etc), you can simply customize the CSS file to color code them to taste.

If your time entry system produces a text dump in a different format (likely), you will need to change the functions in ParseEntries.js to extract and compare the information correctly.

A live demo can be found here: https://spitofland.github.io/TimeEntryReview/TimeEntryReview/TimeEntryReview.html

# The Parse Functions

ParseEntries.js has several functions that need to be defined.

* `ParseEntries` splits up the text dump into 'lines' that are then given to `ParseEntry` one by one to be read. The results returned by `ParseEntry` are then stored in a list of entry objects. My sample data has one entry per line, so I just call the `split` function to divide the string at the newlines. I also included a commented-out line that shows how RegEx could be used to split the string with the `match` function. This form could be used to split text dumps that do not have one entry per line.
* `ParseEntry` extracts the entry type, start time, end time, duration, and other information from the 'line' given to it. I use the RegEx `exec` function to extract this information from the string. Customizing this function would involve writing a regular expression that captures the correct information from the strings you give it.
* `ParseProcessedEntries` is just like `ParseEntries`, but for processed entries.
* `ParseProcessedEntry` is just like `ParseEntry`, but for processed entries.
* `CompareEntryLists` finds entries and processed entries that don't have a match within the opposite list. My sample data assumes that multiple entries may contribute to a single processed entry, but each entry may only contribute to a single processed entry.

My sample data assumes that the time keeping system does not create a separate 'Lunch' entry. That is why some of the entry durations are shorter than the difference between the start and end times. The sample data assumes a one hour lunch from 12:00 to 13:00.

The duration field is included because it is needed to match with the processed entries, which do not have end times given in my sample data.

# Limitations

* This application does not currently handle entries that span midnight.
* This application assumes that multiple entries may contribute to one processed entry, but multiple processed entries may not be created from one entry.
* This application assumes that any processed entries will be no more than one year in the future and no more than a handful of years in the past. (This means my sample data will need to be updated every few years to prevent odd errors.)
