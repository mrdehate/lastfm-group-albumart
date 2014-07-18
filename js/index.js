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

/**
*
* For a given user, actually outputs the HTML for showing their song.
* 
*/
function getRecentArt(userName) {
  var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+userName+"&limit=2&api_key="+LASTFM_API_KEY+"&format=json";

  $.getJSON(url, function(data) {
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    if (data.recenttracks === undefined || data.recenttracks.track === undefined) {
      return 0;
    }

    var artist = data.recenttracks.track[0].artist["#text"];
    var song = data.recenttracks.track[0].name;
    var cover = data.recenttracks.track[0].image[3]["#text"];
    var albumMBID = data.recenttracks.track[0].album["mbid"];
//    var albumName = data.recenttracks.track[0].album["#text"];


    if (data.recenttracks.track[0]["@attr"] &&
        data.recenttracks.track[0]["@attr"].nowplaying === "true") {


      var htmlString = "";
      htmlString = "<div class='entry'>";
      htmlString += "<div class='user'>"+userName+"</div>";
      htmlString += "<div class='artistOuter'><span class='artist'>"+artist+"</span></div>";
      htmlString += "<div class='songOuter'><span class='song'>"+song+"</span></div>";
      htmlString += "<img class='imgArt' src='"+getCoverArt(cover, artist, albumMBID, song)+"' /><br />";
      htmlString += "</div>";
      $('.cover').append(htmlString);
      //  $('.output').html(JSON.stringify(data));
    }

    gApiCallCounter++;
  });

  return true;
}

/**
*
* Either returns the cover art if it's been supplied, or tries to get it from elsewhere.
* If there isn't cover art for a song supplied, tries to get something else interesting to show.
* 
*/
function getCoverArt(coverIn, artist, albumMBID, song) {
//@TODO: move blankCoverURL out to a config file somewhere

  var cover = "";

  if (coverIn === "") {
    cover = backupAlbumArtCoverArchive(albumMBID);

    if (coverIn === "") {
      cover = backupAlbumArtEchoNest(artist, song);

      if (cover === "") {
        cover = getArtistArt(artist);

        if (cover === "") {
          cover = BLANK_COVER_URL;
        }
      }
    }
  } else {
    cover = coverIn;
  }

  return cover;
}

/**
*
* Get the art for the given artist
*
*/
function getArtistArt(artist) {
  var cover = "";

  $.ajax({
    url: "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+encodeURIComponent(artist)+"&api_key="+LASTFM_API_KEY+"&format=json",
    async: false
  }).done(function( a1 ) {
    try{
      cover = a1.artist.image[2]["#text"];
    }
    catch (meh) {
    }
        gApiCallCounter++;
  });

  return cover; 
}

/**
*
* Calls the cover art archive. Since it requires an MBID, I'm fairly confident this will never be helpful.
* Also I think the selection at this service is poor. But it's free.
* @TODO: Needs updated API counter
*
*/
function backupAlbumArtCoverArchive(albumMBID) {
  var cover = "";

  if (albumMBID === "" || albumMBID === null) {
    return cover;
  }

  $.ajax({
    url: "http://coverartarchive.org/release/" + albumMBID,
    async: false
  }).done(function( a1 ) {
    try{
      cover = a1.images.thumbnails.small["#text"];
    }
    catch (meh) {
    }
//        gApiCallCounter++;
  });

  return cover; 
}

/**
*
* Does a search with EchoNest to get the artist and song. Art comes from 7Digital; it's not super, but it's better than nothing.
* @TODO: This breaks the API call counter, since it's a different API
*
*/
function backupAlbumArtEchoNest(artist, song) {
  var cover = "";

  if (artist === "" || artist === null || song === "" || song === null) {
    return cover;
  }

  $.ajax({
    url: "http://developer.echonest.com/api/v4/song/search?api_key=" + ECHONEST_API_KEY + "&format=json&results=1&artist=" + encodeURIComponent(artist) + "&title=" + encodeURIComponent(song) + "&bucket=id:7digital-US&bucket=tracks",
    async: false
  }).done(function( a1 ) {
    try{
      cover = a1.response.songs[0].tracks[0].release_image;
//@TODO debug code here
/*      if (cover !== "") {
        console.log("Hey it worked!!! " + cover);
      }
*/
//---------
    }
    catch (meh) {
    }
 //       gApiCallCounter++;
  });

  return cover; 
}

/**
*
* Displays chart of the top artists
* 
*/
function getArtistChart() {
//  $('.groupName').html(theGroup+" @ Last.fm");

  var url = "http://ws.audioscrobbler.com/2.0/?method=group.getweeklyartistchart&api_key="+LASTFM_API_KEY+"&group="+THE_GROUP+"&format=json";

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
* Main function driving album art display
* 
*/
function displayAlbumArt() {
//  $('.groupName').html(theGroup+" @ Last.fm");

  var url = "http://ws.audioscrobbler.com/2.0/?method=group.getmembers&api_key="+LASTFM_API_KEY+"&group="+THE_GROUP+"&format=json";

  $.getJSON(url, function(data) {
   
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    var groupMembers = new Array();

    
    var i=0;

    while (data.members.user[i]) {
      groupMembers[i] = data.members.user[i].name;
      i++;
    }

    $('.cover').html("");

    var j=0;
    while (groupMembers[j]) {
      getRecentArt(groupMembers[j]);
      j++;
    }

    $('.updateTime').html((new Date()).toLocaleTimeString());

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

setInterval(displayAlbumArt, REFRESH_INTERVAL);
setInterval(updateApiCounter, REFRESH_INTERVAL);

getArtistChart();
setInterval(getArtistChart, DAY_REFRESH_INTERVAL);
