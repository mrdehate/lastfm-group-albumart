This project is designed to display the album art from currently played songs of a single Last.fm group. I'm using in an office setting, running constantly on a dedicated display, so people in the office can see what everybody else is currently listening to!

It's also got a couple of bonus features (feature creep). In addition to album art, the artist chart for the group is displayed, plus a tiny map with current traffic conditions.

It uses a lot of Last.fm API calls, mostly because the group API is fairly limited. Here's how it works:

* Get all the members of a given Last.fm group
* For each member of the group, get the last song that they have scrobbled
** If this song is "now playing", display it on the screen
*** If the album art isn't found for this track, call some other services to get alternative art. 
*** If there's still no art, get the default artist art from Last.fm
* Repeat every 60 seconds
