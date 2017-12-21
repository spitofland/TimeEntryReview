# TimeEntryReview

TimeEntryReview is a simple web page application that can be used to convert a time entry text dump into a planner format that is easier to read. This can make reviewing time entries for correctness much faster.

# How Do I Use It?

Open TimeEntryReview.html in a modern browser (must support CSS Grid), paste the time entry text dump into the text box, and push the button.

If your time entry system uses different billing codes (RG, LA, etc), you can simply customize the CSS file to color code them to taste.

If your time entry system produces a text dump in a different format (likely), you will need to change the functions in ParseEntries.js to extract the information correctly.
