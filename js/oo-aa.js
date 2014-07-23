
var gApiCallCounter = 0; 
var gStartupTime = Date.now();

function Constants() {
	this.LASTFM_API_KEY = "e63ca8d5b65415a4ee36b32260dce956";
	this.ECHONEST_API_KEY = "TU0XNU2PKBGD5AIJ2";

	 // var THE_GROUP = "350 groups";
	 // var THE_GROUP = "The Musical Elitists";
	this.THE_GROUP = "WorkForce Software";
	this.BLANK_COVER_URL = "http://upload.wikimedia.org/wikipedia/commons/b/b9/No_Cover.jpg";
	this.REFRESH_INTERVAL = 60000;
	this.DAY_REFRESH_INTERVAL = 86400000;
}

function Listen(inUserName, inConstants) {
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
	var self = this;
	var constants = inConstants;

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
	        	tempArt = constants.BLANK_COVER_URL;
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
	    url: "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+encodeURIComponent(self.artist)+"&api_key="+constants.LASTFM_API_KEY+"&format=json",
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
	    url: "http://developer.echonest.com/api/v4/song/search?api_key=" + constants.ECHONEST_API_KEY + "&format=json&results=1&artist=" + encodeURIComponent(self.artist) + "&title=" + encodeURIComponent(self.song) + "&bucket=id:7digital-US&bucket=tracks",
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
	    url: "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+this.userName+"&limit=2&api_key="+constants.LASTFM_API_KEY+"&format=json",
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
	});

	//@TODO: Would be cool if we had a "debug" switch at the top of the file
	//	  console.log(this);

	  if (this.albumArt === "" && this.nowPlaying) {
		  this.albumArt = getAlbumArt();
	  }

	  gApiCallCounter = gApiCallCounter + this.apiCount;

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


/**
*
* Displays chart of the top artists
* 
*/
function getArtistChart() {
//  $('.groupName').html(theGroup+" @ Last.fm");

  var constants = new Constants();

  var url = "http://ws.audioscrobbler.com/2.0/?method=group.getweeklyartistchart&api_key="+constants.LASTFM_API_KEY+"&group="+constants.THE_GROUP+"&format=json";

  $.getJSON(url, function(data) {
   
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

//*** handle the chart dates ***
    var chartStart = new Date();
    var chartEnd = new Date();

    try{
      chartStart.setTime(data.weeklyartistchart["@attr"].from*1000);   //last.fm sends this value in seconds since 1970; JS data object uses milliseconds
      chartEnd.setTime(data.weeklyartistchart["@attr"].to*1000);
    }
    catch (meh) {
      chartStart = null;
      chartEnd = null;
    }

    $('.artistChart h3').html("");
    if (chartStart && chartEnd) {
      $('.artistChart h3').html($.datepicker.formatDate('M dd', chartStart) + " - " + $.datepicker.formatDate('M dd', chartEnd));
    }

//*** get the artists ***
    var topArtists = new Array();
    var i=0;

    while (data.weeklyartistchart.artist[i]) {
//      console.log(data.weeklyartistchart.artist[i].playcount);
      if(data.weeklyartistchart.artist[i].playcount && data.weeklyartistchart.artist[i].playcount > 1) {
        topArtists[i] = data.weeklyartistchart.artist[i].name;
      } else {
        break;
      }
      i++;
    }

    $('.artistChart ol').html("");

    var j;

    for (j = 0; j < 25 ; j++) { 
      if (topArtists[j] === undefined) {
        break;
      }

      $('.artistChart ol').append("<li>"+topArtists[j]+"</li>");
    }

    gApiCallCounter++;

  });

  return true;
}


/**
*
* Update the api counter to list API calls per second
* 
*/
function updateApiCounter() {
  $(".stats").html("API/sec: " + (gApiCallCounter/((Date.now() - gStartupTime)/1000)).toFixed(2));
}


function main() {
	var constants = new Constants();
	var groupMembers = new Array();
	var url = "http://ws.audioscrobbler.com/2.0/?method=group.getmembers&api_key="+constants.LASTFM_API_KEY+"&group="+constants.THE_GROUP+"&format=json";

  $.getJSON(url, function(data) {
   
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    
    var i=0;

    while (data.members.user[i]) {
      groupMembers[i] = new Listen(data.members.user[i].name, constants);
      i++;
    }

    $('.cover').html("");

    var j=0;
    while (groupMembers[j]) {
      processListen(groupMembers[j], 'cover');
      j++;
    }

    var time = new Date();
    $('.updateTime').html((new Date()).toLocaleTimeString());

    gApiCallCounter++;

  });

  return true;
}

setInterval(main, (new Constants()).REFRESH_INTERVAL);
setInterval(updateApiCounter, (new Constants()).REFRESH_INTERVAL);

getArtistChart();
setInterval(getArtistChart, (new Constants()).DAY_REFRESH_INTERVAL);

