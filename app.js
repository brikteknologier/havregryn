
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , getit = require('getit')
  , markdown = require('markdown').markdown
  , async = require('async');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.locals({ content: '', team: '' });

// update content every 10 seconds
(function update() {
  async.parallel({
    content: function(cb) {
      getit('github://brikteknologier/havregryn/content/content.md', function(err, data) {
        if (err) return cb(err);
        cb(null, markdown.toHTML(data));
      });
    },
    team: function(cb) {
      getit('github://brikteknologier/havregryn/content/team.md', function(err, data) {
        if (err) return cb(err);
        cb(null, markdown.toHTML(data));
      });
    }
  }, function(err, content) {
    if (!err) app.locals(content);
    setTimeout(update, 10000);
  });
})()

app.get('/*', function(req, res) {

  res.render('brik');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
