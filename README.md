# TimeEntryReview

TimeEntryReview is a simple web page application that can be used to convert a time entry text dump into a planner format that is easier to read. This can make reviewing time entries for correctness much faster.

# How Do I Use It?

Open TimeEntryReview.html in a modern browser (must support CSS Grid), paste the time entry text dump into the text box, and push the button.

If your time entry system uses different billing codes (RG, LA, etc), you can simply customize the CSS file to color code them to taste.

If your time entry system produces a text dump in a different format (likely), you will need to change the functions in ParseEntries.js to extract the information correctly.

# The Parse Functions

ParseEntries.js has two functions: `ParseEntries` and `ParseEntry`.

`ParseEntries` splits up the text dump into 'lines' that are then given to `ParseEntry` one by one to be read. The results returned by `ParseEntry` are then stored in a list of entry objects. My sample data has one entry per line, so I just call the `split` function to divide the string at the newlines. I also included a commented-out line that shows how RegEx could be used to split the string with the `match` function. This form could be used to split text dumps that do not have one entry per line.

`ParseEntry` extracts the entry type, start time, end time, duration, and other information from the 'line' given to it. I use the RegEx `exec` function to extract this information from the string. Customizing this function would involve writing a regular expression that captures the correct information from the strings you give it.

My sample data assumes that the time keeping system does not create a separate 'Lunch' entry. That is why some of the entry durations are shorter than the difference between the start and end times. This data assumes a one hour lunch from 12:00 to 13:00.

The duration field is included because it is needed for a feature I intend to add later.

# Limitations

This application does not currently handle entries that span midnight.