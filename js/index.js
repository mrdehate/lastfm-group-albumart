//Global Variables yay!
var LASTFM_API_KEY = "e63ca8d5b65415a4ee36b32260dce956";
//  var theGroup = "350 groups";
//  var theGroup = "The Musical Elitists";
var THE_GROUP = "WorkForce Software";
var BLANK_COVER_URL = "http://upload.wikimedia.org/wikipedia/commons/d/d7/No_Cover_.jpg";
var REFRESH_INTERVAL = 60000;


function getRecentArt(userName) {
  var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+userName+"&limit=2&api_key="+LASTFM_API_KEY+"&format=json";

  $.getJSON(url, function(data) {
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    if (data.recenttracks === undefined || data.recenttracks.track === undefined) {
      return 0;
    }

/*if (data && data.recenttracks && data.recenttracks.track && data.recenttracks.track[0] && data.recenttracks.track[0].artist && data.recenttracks.track[0].artist["#text"]) {
  console.log("yes");
} else {
  console.log("no:"+userName+" | "+JSON.stringify(data));
}
*/

    var artist = data.recenttracks.track[0].artist["#text"];
    var song = data.recenttracks.track[0].name;
    var cover = data.recenttracks.track[0].image[3]["#text"];

    if (data.recenttracks.track[0]["@attr"] &&
        data.recenttracks.track[0]["@attr"].nowplaying === "true") {


      var htmlString = "";
      htmlString = "<div class='entry'>";
      htmlString += "<div class='user'>"+userName+"</div>";
      htmlString += "<div class='artist'>"+artist+"</div>";
      htmlString += "<div class='song'>"+song+"</div>";
      htmlString += "<img class='imgArt' src='"+getCoverArt(cover, artist)+"' /><br />";
      htmlString += "</div>";
      $('.cover').append(htmlString);
      //  $('.output').html(JSON.stringify(data));
    }

  });

  return true;
}

function getCoverArt(coverIn, artist) {
//@TODO: move blankCoverURL out to a config file somewhere

  var cover = "";

  if (coverIn === "") {
    $.ajax({
      url: "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+artist+"&api_key="+LASTFM_API_KEY+"&format=json",
      async: false
    }).done(function( a1 ) {
      try{
        cover = a1.artist.image[2]["#text"];
      }
      catch (meh) {
          cover = BLANK_COVER_URL;
      }
    });
    if (cover === "") {
      cover = BLANK_COVER_URL;
    }
  } else {
    cover = coverIn;
  }

  return cover;
}

function getGroupMembers() {
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

    var time = new Date();
    $('.updateTime').html(time.getHours()+":"+time.getMinutes()+":"+time.getSeconds());

  });

  return true;
}

setInterval(getGroupMembers, REFRESH_INTERVAL);
