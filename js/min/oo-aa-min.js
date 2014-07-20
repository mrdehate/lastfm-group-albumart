function Constants(){this.LASTFM_API_KEY="e63ca8d5b65415a4ee36b32260dce956",this.ECHONEST_API_KEY="TU0XNU2PKBGD5AIJ2",this.THE_GROUP="WorkForce Software",this.BLANK_COVER_URL="http://upload.wikimedia.org/wikipedia/commons/b/b9/No_Cover.jpg",this.REFRESH_INTERVAL=6e4,this.DAY_REFRESH_INTERVAL=864e5}function Listen(t,a){function r(){var t="";return""===t&&(t=s(),""===t&&(t=n(),""===t&&(t=e(),""===t&&(t=o.BLANK_COVER_URL)))),t}function e(){var t="";return $.ajax({url:"http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist="+encodeURIComponent(i.artist)+"&api_key="+o.LASTFM_API_KEY+"&format=json",async:!1}).done(function(a){try{t=a.artist.image[2]["#text"]}catch(r){}i.apiCount++}),t}function s(){if(""===i.albumMBID||null===i.albumMBID)return"";var t="";return $.ajax({url:"http://coverartarchive.org/release/"+i.albumMBID,async:!1}).done(function(a){try{t=a.images.thumbnails.small["#text"]}catch(r){}}),t}function n(){if(""===i.artist||null===i.artist||""===i.song||null===i.song)return"";var t="";return $.ajax({url:"http://developer.echonest.com/api/v4/song/search?api_key="+o.ECHONEST_API_KEY+"&format=json&results=1&artist="+encodeURIComponent(i.artist)+"&title="+encodeURIComponent(i.song)+"&bucket=id:7digital-US&bucket=tracks",async:!1}).done(function(a){try{t=a.response.songs[0].tracks[0].release_image}catch(r){}}),t}this.userName=t,this.artist="",this.song="",this.albumArt="",this.nowPlaying=!1,this.albumMBID="",this.valid=!0,this.apiCount=0;var i=this,o=a;$.ajax({url:"http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+this.userName+"&limit=2&api_key="+o.LASTFM_API_KEY+"&format=json",async:!1}).done(function(t){if(this.apiCount++,void 0===t.recenttracks||void 0===t.recenttracks.track)return 0;try{i.artist=t.recenttracks.track[0].artist["#text"],i.song=t.recenttracks.track[0].name,i.albumArt=t.recenttracks.track[0].image[3]["#text"],i.albumMBID=t.recenttracks.track[0].album.mbid,t.recenttracks.track[0]&&t.recenttracks.track[0]["@attr"]&&t.recenttracks.track[0]["@attr"].nowplaying&&(i.nowPlaying="true"===t.recenttracks.track[0]["@attr"].nowplaying)}catch(a){i.valid=!1}}),""===this.albumArt&&this.nowPlaying&&(this.albumArt=r())}function processListen(t,a){if(t.nowPlaying){var r="";r="<div class='entry'>",r+="<div class='user'>"+t.userName+"</div>",r+="<div class='artistOuter'><span class='artist'>"+t.artist+"</span></div>",r+="<div class='songOuter'><span class='song'>"+t.song+"</span></div>",r+="<img class='imgArt' src='"+t.albumArt+"' /><br />",r+="</div>",$("."+a).append(r)}}function getArtistChart(){var t=new Constants,a="http://ws.audioscrobbler.com/2.0/?method=group.getweeklyartistchart&api_key="+t.LASTFM_API_KEY+"&group="+t.THE_GROUP+"&format=json";return $.getJSON(a,function(t){var a=new Date,r=new Date;try{a.setTime(1e3*t.weeklyartistchart["@attr"].from),r.setTime(1e3*t.weeklyartistchart["@attr"].to)}catch(e){a=null,r=null}$(".artistChart h3").html(""),a&&r&&$(".artistChart h3").html($.datepicker.formatDate("M dd",a)+" - "+$.datepicker.formatDate("M dd",r));for(var s=new Array,n=0;t.weeklyartistchart.artist[n]&&t.weeklyartistchart.artist[n].playcount&&t.weeklyartistchart.artist[n].playcount>1;)s[n]=t.weeklyartistchart.artist[n].name,n++;$(".artistChart ol").html("");var i;for(i=0;25>i&&void 0!==s[i];i++)$(".artistChart ol").append("<li>"+s[i]+"</li>");gApiCallCounter++}),!0}function updateApiCounter(){$(".stats").html("API/sec: "+(gApiCallCounter/((Date.now()-gStartupTime)/1e3)).toFixed(2))}function main(){var t=new Constants,a=new Array,r="http://ws.audioscrobbler.com/2.0/?method=group.getmembers&api_key="+t.LASTFM_API_KEY+"&group="+t.THE_GROUP+"&format=json";return $.getJSON(r,function(r){for(var e=0;r.members.user[e];)a[e]=new Listen(r.members.user[e].name,t),e++;$(".cover").html("");for(var s=0;a[s];)processListen(a[s],"cover"),s++;var n=new Date;$(".updateTime").html(n.getHours()+":"+n.getMinutes()+":"+n.getSeconds()),gApiCallCounter++}),!0}var gApiCallCounter=0,gStartupTime=Date.now();setInterval(main,(new Constants).REFRESH_INTERVAL),setInterval(updateApiCounter,(new Constants).REFRESH_INTERVAL),getArtistChart(),setInterval(getArtistChart,(new Constants).DAY_REFRESH_INTERVAL);