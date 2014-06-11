For a given last.fm group, gets all the members, and displays cover art for whoever is listening right now. Uses a lot of API calls, because I can't figure out a better way to do it.

Also, the code isn’t really great. Yet.

Here's how it works:

* Get all the members of a given Last.fm group
* For each member of the group, gets the last song that they have scrobbled
** If this song is "now playing", display it on the screen
*** If the album art isn't found for this track, do another API call to get the default artist art
* Repeat every 60 seconds
