

function getRecentArt(userName) {
  var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+userName+"&limit=2&api_key=e63ca8d5b65415a4ee36b32260dce956&format=json";

  $.getJSON(url, function(data) {
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    if (data.recenttracks == undefined || data.recenttracks.track == undefined) {
      return 0;
    }

/*if (data && data.recenttracks && data.recenttracks.track && data.recenttracks.track[0] && data.recenttracks.track[0].artist && data.recenttracks.track[0].artist["#text"]) {
  console.log("yes");
} else {
  console.log("no:"+userName+" | "+JSON.stringify(data));
}
*/

    var artist = data.recenttracks.track[0].artist["#text"];
    var song = data.recenttracks.track[0]["name"];
    var cover = data.recenttracks.track[0].image[3]["#text"];

    if (data.recenttracks.track[0]["@attr"] &&
        data.recenttracks.track[0]["@attr"]["nowplaying"] == "true") {

      if (cover == "") {
        cover = "http://upload.wikimedia.org/wikipedia/commons/d/d7/No_Cover_.jpg";
      }
      var htmlString = "";
      htmlString = "<div class='entry'>";
      htmlString += "<div class='user'>"+userName+"</div>";
      htmlString += "<div class='artist'>"+artist+"</div>";
      htmlString += "<div class='song'>"+song+"</div>";
      htmlString += "<img class='imgArt' src='"+cover+"' /><br />";
      htmlString += "</div>";
      $('.cover').append(htmlString);
      //  $('.output').html(JSON.stringify(data));
    }

  });

  return true;
};

function getGroupMembers() {
//  var theGroup = "350 groups";
//  var theGroup = "The Musical Elitists";
  var theGroup = "WorkForce Software";
  $('.groupName').html(theGroup+" @ Last.fm");

  var url = "http://ws.audioscrobbler.com/2.0/?method=group.getmembers&api_key=e63ca8d5b65415a4ee36b32260dce956&group="+theGroup+"&format=json";

  $.getJSON(url, function(data) {
   
//    $('.output').append(JSON.stringify(data) + "<br /><br />");

    var users = data.members.user;
    var groupMembers = new Array();    

    $('.cover').html("");
    
    var i=0;

    while (data.members.user[i]) {
      groupMembers[i] = data.members.user[i].name;
      i++;
    }

    var j=0;
    while (groupMembers[j]) {
      var hi = getRecentArt(groupMembers[j]);
      j++;
    }

    var time = new Date();
    h = time.getHours(); 
    m = time.getMinutes();
    s = time.getSeconds();
    $('.updateTime').html(h+":"+m+":"+s);
    
  });

  return true;
};


$(document).ready(function() {

  var members = getGroupMembers();
  setInterval(getGroupMembers, 60000);

});