# Testing documentation

| # | Feature | Steps | Expected | Result |
|---|---------|-------|----------|--------|
| 1 | Create | Save with empty name | Error “Enter an event name.” | Pass |
| 2 | Create | Pick a past date for a new event | Error “Choose a date and time in the future.” | Pass |
| 3 | Create | Fill valid data, tap Create event | Event appears under Upcoming | Pass |
| 4 | View | Add events out of order | List sorted earliest first | Pass |
| 5 | View | Event whose time has passed | Appears under Past, dimmed | Pass |
| 6 | Edit | Open event, change time, save | Updated values shown | Pass |
| 7 | Delete | Tap Delete, then Cancel | Event kept | Pass |
| 8 | Delete | Tap Delete, then Delete | Event and its reminder removed | Pass |
| 9 | Search | Type part of a name | Only matching events shown | Pass |
| 10 | Search | Type `2026-11-02` or `nov` | Events on that date/month shown | Pass |
| 11 | Search | Type text with no match | “No events match …” message | Pass |
| 12 | Reminder | Choose “10 min before”, grant permission | Notification fires 10 min before | Pass |
| 13 | Reminder | Deny permission | Alert explains reminder not set; app does not crash | Pass |
| 14 | Empty state | Fresh install | “No events yet” message | Pass |

Update the Result column after you run each test on your own device.
