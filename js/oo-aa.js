//Global Variables yay!
var LASTFM_API_KEY = "e63ca8d5b65415a4ee36b32260dce956";
var ECHONEST_API_KEY = "TU0XNU2PKBGD5AIJ2";

 // var THE_GROUP = "350 groups";
 // var THE_GROUP = "The Musical Elitists";
var THE_GROUP = "WorkForce Software";
var BLANK_COVER_URL = "http://upload.wikimedia.org/wikipedia/commons/b/b9/No_Cover.jpg";
var REFRESH_INTERVAL = 60000;
var DAY_REFRESH_INTERVAL = 86400000;

var gApiCallCounter = 0; 
var gStartupTime = Date.now();

//@TODO: temp for debugging
var groupMembers = new Array();

function Listen(inUserName) {
	//Public Variables
	this.userName = inUserName;
	this.artist = "";
	this.song = "";
	this.albumArt = "";
	this.nowPlaying = false;
	this.albumMBID = "";

	this.valid = true;
	this.apiCount = 0;

	//Private Variables
//	var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+this.userName+"&limit=2&api_key="+LASTFM_API_KEY+"&format=json";
	var self = this;

	/**
	*
	* Either returns the cover art if it's been supplied, or tries to get it from elsewhere.
	* If there isn't cover art for a song supplied, tries to get something else interesting to show.
	* 
	*/
	function getAlbumArt() {

	  var tempArt = "";

	  if (tempArt === "") {
	    tempArt = backupAlbumArtCoverArchive();

		if (tempArt === "") {
	      tempArt = backupAlbumArtEchoNest();

		  if (tempArt === "") {
	        tempArt = getArtistArt();

	        if (tempArt === "") {
	        	tempArt = BLANK_COVER_URL;
	        }
	      }
	    }
	  }

	  return tempArt;

	}

	/**
	*
	* Get the art for the current artist
	*
	*/
	function getArtistArt() {

	  var tempArt = "";

	  $.ajax({
	    url: "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+self.artist+"&api_key="+LASTFM_API_KEY+"&format=json",
	    async: false
	  }).done(function( a1 ) {
	    try{
	      tempArt = a1.artist.image[2]["#text"];
	    }
	    catch (meh) {
	    }
	        self.apiCount++;
	  });

	return tempArt;
	}

	/**
	*
	* Calls the cover art archive. Since it requires an MBID, I'm fairly confident this will never be helpful.
	* Also I think the selection at this service is poor. But it's free.
	* @TODO: Needs updated API counter
	*
	*/
	function backupAlbumArtCoverArchive() {

	  if (self.albumMBID === "" || self.albumMBID === null) {
	    return "";
	  }

      var tempArt = "";

	  $.ajax({
	    url: "http://coverartarchive.org/release/" + self.albumMBID,
	    async: false
	  }).done(function( a1 ) {
	    try{
	      tempArt = a1.images.thumbnails.small["#text"];
	    }
	    catch (meh) {
	    }
	//        gApiCallCounter++;
	  });

	  return tempArt;
	}

	/**
	*
	* Does a search with EchoNest to get the artist and song. Art comes from 7Digital; it's not super, but it's better than nothing.
	* @TODO: This breaks the API call counter, since it's a different API
	*
	*/
	function backupAlbumArtEchoNest() {
	  if (self.artist === "" || self.artist === null || self.song === "" || self.song === null) {
	    return "";
	  }

	var tempArt = "";

	  $.ajax({
	    url: "http://developer.echonest.com/api/v4/song/search?api_key=" + ECHONEST_API_KEY + "&format=json&results=1&artist=" + self.artist + "&title=" + self.song + "&bucket=id:7digital-US&bucket=tracks",
	    async: false
	  }).done(function( a1 ) {
	    try{
	      tempArt = a1.response.songs[0].tracks[0].release_image;
	    }
	    catch (meh) {
	    }
	 //       gApiCallCounter++;
	  });

	  return tempArt;
	}


	//Begin
	  $.ajax({
	    url: "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+this.userName+"&limit=2&api_key="+LASTFM_API_KEY+"&format=json",
	    async: false
	  }).done(function( data ) {

		this.apiCount++;
		//    $('.output').append(JSON.stringify(data) + "<br /><br />");

		if (data.recenttracks === undefined || data.recenttracks.track === undefined) {
		  return 0;
		}

		try {
		    self.artist = data.recenttracks.track[0].artist["#text"];
		    self.song = data.recenttracks.track[0].name;
		    self.albumArt = data.recenttracks.track[0].image[3]["#text"];
		    self.albumMBID = data.recenttracks.track[0].album.mbid;

		    if (data.recenttracks.track[0] &&
		        data.recenttracks.track[0]["@attr"] &&
		        data.recenttracks.track[0]["@attr"].nowplaying) {
			    self.nowPlaying = data.recenttracks.track[0]["@attr"].nowplaying === "true";
		    }
		} catch (meh) {
			self.valid = false;
		}
//console.log(data);
//		console.log("self:"+ self.getAlbumArt(""));
	});

//@TODO: Would be cool if we had a "debug" switch at the top of the file
//	  console.log(this);

	  if (this.albumArt === "" && this.nowPlaying) {
		  this.albumArt = getAlbumArt();
	  }

}

function processListen(inListen, inTargetClass) {

	if (inListen.nowPlaying) {
		var htmlString = "";
	    htmlString = "<div class='entry'>";
	    htmlString += "<div class='user'>"+inListen.userName+"</div>";
	    htmlString += "<div class='artistOuter'><span class='artist'>"+inListen.artist+"</span></div>";
	    htmlString += "<div class='songOuter'><span class='song'>"+inListen.song+"</span></div>";
	    htmlString += "<img class='imgArt' src='"+inListen.albumArt+"' /><br />";
	    htmlString += "</div>";
	    $('.'+inTargetClass).append(htmlString);
	}
}


function main() {

	  var url = "http://ws.audioscrobbler.com/2.0/?method=group.getmembers&api_key="+LASTFM_API_KEY+"&group="+THE_GROUP+"&format=json";

  $.getJSON(url, function(data) {
   
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    
    var i=0;

    while (data.members.user[i]) {
      groupMembers[i] = new Listen(data.members.user[i].name);
      i++;
    }

    $('.cover').html("");

    var j=0;
    while (groupMembers[j]) {
      processListen(groupMembers[j], 'cover');
      j++;
    }

    var time = new Date();
    $('.updateTime').html(time.getHours()+":"+time.getMinutes()+":"+time.getSeconds());

    gApiCallCounter++;

  });

  return true;
}

setInterval(main, REFRESH_INTERVAL);
