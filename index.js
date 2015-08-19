var async = require('async');
var dependency = require('tilestrata-dependency');
var mapnik = require('mapnik');

module.exports = function(layers, options) {
	options = options || {};

	var layers = layers.map(function(pair) {
		var layer = pair[0];
		var filename = pair[1];
		return dependency(layer, filename);
	});

	return {
		serve: function(server, req, callback) {
			var vtiles, result;

			async.series([
				function loadTiles(callback) {
					async.map(layers, function(layer, callback) {
						layer.serve(server, req, function(err, buffer, headers) {
							if (err) return callback(err);
							if (buffer instanceof mapnik.VectorTile) return callback(null, buffer);

							var vtile = new mapnik.VectorTile(req.z, req.x, req.y);
							vtile._srcbytes = buffer.length;
							vtile.setData(buffer);
							vtile.parse(function(err) {
								callback(err, vtile);
							});
						});
					}, function(err, result) {
						vtiles = result;
						callback(err);
					});
				},
				function compositeTiles(callback) {
					var merged = new mapnik.VectorTile(req.z, req.x, req.y);
					merged.composite(vtiles, function(err){
						vtiles = null;
						if(err) return callback(err);
						
						result = merged.getData();
						result._vtile = merged;
						callback();
					});

				}
			], function(err) {
				if (err) return callback(err);
				callback(null, result, {'Content-Type': 'application/x-protobuf'});
			});
		}
	};
};
