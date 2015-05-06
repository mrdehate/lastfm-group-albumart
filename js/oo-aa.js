
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
	    try {
	      tempArt = a1.artist.image[2]["#text"];
	    }
	    catch (meh) {

	    }

        self.apiCount++;
        a1 = null;
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
	    try {
	      tempArt = a1.images.thumbnails.small["#text"];
	    }
	    catch (meh) {
	    }

	    a1 = null;

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

		data = null;

	});

	//@TODO: Would be cool if we had a "debug" switch at the top of the file
	//	  console.log(this);

	  if (this.albumArt === "" && this.nowPlaying) {
		  this.albumArt = getAlbumArt();
	  }

	  gApiCallCounter = gApiCallCounter + this.apiCount;

}

function Artist(inData, inConstants) {
	//Public Variables
	this.artist = inData.name;
	this.mbid = inData.mbid;
//	this.albumArt = inData.image[2]["#text"];
	this.totalPlaycount = inData.playcount;

	this.uniqueUsers = 1;

	//Private Variables
	var self = this;
	var constants = inConstants;

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

    data = null;

  });

  return true;
}

/**
*
* Gets the top artist chart for the passed in user
* 
*/
function getUsersArtistChart(inUserName) {
	var constants = new Constants();
	var listOfArtists = new Array();

	  $.ajax({
	    url: "http://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&period=7day&api_key="+constants.LASTFM_API_KEY+"&user="+inUserName+"&format=json&limit=200",
	    async: false
	  }).done(function( data ) {
//	console.log("ARTISTS:"+JSON.stringify(data) + "<br /><br />");
		var i=0;
/*
console.log(inUserName+"|pre"+JSON.stringify(data.topartists));
console.log(inUserName+"|zero"+JSON.stringify(data.topartists.artist[0]));
console.log(inUserName+"|one"+JSON.stringify(data.topartists.artist[1]));
*/
		if (data && data.topartists && data.topartists.artist) {
		    while (data.topartists.artist[i]) {
	//		console.log("ONE ARTIST:"+JSON.stringify(data.weeklyartistchart.artist[i]) + "<br /><br />");
	    		listOfArtists[i] = new Artist(data.topartists.artist[i]);
	    		i++;
			}
		}

	  });

	return listOfArtists;

}


/**
*
* Displays top artists for the last 7 days
* 
*/
function getCustomArtistChart() {

  	var constants = new Constants();
//@TODO: Definitely something that should be in like a utility function. Maybe put all the API calls together somehow?
	var url = "http://ws.audioscrobbler.com/2.0/?method=group.getmembers&api_key="+constants.LASTFM_API_KEY+"&group="+constants.THE_GROUP+"&format=json";

  $.getJSON(url, function(memberData) {

	var groupMembers = new Array();
	var artistChart = new Array();
	var i=0;

//Get all the artist charts for all the group members
    while (memberData.members.user[i]) {
    	artistChart[i] = getUsersArtistChart(memberData.members.user[i].name);
    	i++;
	}

//combine them
	var merged = [];
	merged = merged.concat.apply(merged, artistChart);

	i=0;
	var artistTotals = [];
	var found, j;

//combine any artists that appear in the list more than once
    while (merged[i]) {
    	found = false;
    	j = 0;

    	while (j < artistTotals.length && !found) {
    		if (artistTotals[j] && 
    			merged[i] &&
    			merged[i].artist &&
    			artistTotals[j].artist &&
    			artistTotals[j].artist === merged[i].artist)
    		{
    			found = true;

		    	artistTotals[j].uniqueUsers++;
		    	artistTotals[j].totalPlaycount = Number(artistTotals[j].totalPlaycount) + Number(merged[i].totalPlaycount);
    		}

    		j++;
    	}

    	if (!found) {
    		//add to list
    		artistTotals.push(merged[i]);
    	}

    	i++;
	}

//sort by unique users that have played the artist
	artistTotals.sort(function(a,b) { return parseFloat(b.uniqueUsers) - parseFloat(a.uniqueUsers); } );

//get rid of everything that's been played by just one person
	i = 0;
	found = false;

	while (i < artistTotals.length && !found) {

		if (artistTotals[i].uniqueUsers === 1) {
			artistTotals.splice(i, Number.MAX_VALUE);

			found = true;
		}
		i++;
	}

//sort everything else by total playcount
//@TODO: This doesn't exactly make sense...should be like a subsort
//	artistTotals.sort(function(a,b) { return parseFloat(b.totalPlaycount) - parseFloat(a.totalPlaycount) } );

//display the chart
//@TODO: Move this to its own function
    var today = new Date();
    var aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);

    $('.artistChart h3').html($.datepicker.formatDate('M dd', aWeekAgo) + " - " + $.datepicker.formatDate('M dd', today));
    $('.artistChart ol').html("");

    for (j = 0; j < 25 ; j++) { 
      if (artistTotals[j] === undefined) {
        break;
      }

      $('.artistChart ol').append("<li>"+artistTotals[j].artist+" <span class='unique'>"+artistTotals[j].uniqueUsers+"</span></li>");
    }


	});



//	console.log("LEN:"+artistTotals.length);

//	console.log("TOT:"+artistTotals);

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

    $('.updateTime').html((new Date()).toLocaleTimeString());

    gApiCallCounter++;

	data = null;

  });

  return true;
}

$( document ).ready(function() {
	$('.groupName').html("What " + (new Constants()).THE_GROUP + " is Listening To Right Now");
});

setInterval(main, (new Constants()).REFRESH_INTERVAL);
setInterval(updateApiCounter, (new Constants()).REFRESH_INTERVAL);

getCustomArtistChart();
setInterval(getCustomArtistChart, (new Constants()).DAY_REFRESH_INTERVAL);

