var fs = require('fs'),
  http = require('http'),
  express = require('express'),
  config = {
    secrets : {
      clientId : 'CLIENT_ID',
      clientSecret : 'CLIENT_SECRET',
      redirectUrl : 'REDIRECT_URL'
    },
    accessToken : false
  },
  foursquare = require('node-foursquare')(config),
  csv = parseCSV(fs.readFileSync(process.argv[2], 'utf8'))

function parseCSV(data){
  var rows = [], cols = [], split = data.split('\n')

  split.forEach(function (d,di) {
    var row = {}, d_split = d.split(',')
    d_split.forEach(function (dd,ddi) {
      if(di === 0){
        cols.push(dd)
      }else{
        row[cols[ddi]] = dd
      }
    })
    rows.push(row)
  })
  return rows
}

var location_keys = {}, locations = []

csv.forEach(function (c) {
  if(c.fs_id != 'undefined' && c.fs_id != undefined && c.fs_id != 0){
    if(!(c.fs_id in locations)){
      location_keys[c.fs_id] = {}
      locations.push(c.fs_id)
    }
  }
})

var app = express()
  app.set('port', 10069)

app.get('/login', function(req, res) {
  res.writeHead(303, { 'location': foursquare.getAuthClientRedirectUrl() });
  res.end();
});

app.get('/callback', function (req, res) {
  foursquare.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if(error) {
      res.send('An error was thrown: ' + error.message);
    }
    else {
      config.accessToken = accessToken
      res.send('NICE');
      getVenues()
    }
  });
});

var venue_count = 0, error_count = 0

function getVenues(){
  foursquare.Venues.getVenue(locations[venue_count], config.accessToken, function(error, data){
      if(error) console.log(error)
	  if(data == undefined || !('venue' in data)){	
        error_count++
        if(error_count > 50){
    			process.exit()
		    }
      }else{
         error_count = 0
      	location_keys[locations[venue_count]] = data.venue.categories
      	venue_count++
      }
      if(venue_count < locations.length){
		if(error_count == 0){
	        setTimeout(getVenues, 100)
		}else{
			setTimeout(getVenues, 600000)
		}
      }else{
        fs.writeFileSync(process.arg[3], JSON.stringify(location_keys))
        process.exit()
      }
  });
}

app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('server', __dirname, __filename);
  console.log((new Date()), "Express server listening on port " + app.get('port'));
});