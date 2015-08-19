var async = require('async');
var dependency = require('tilestrata-dependency');
var mapnik = require('mapnik');

module.exports = function(layers, options) {
	options = options || {};

	var layers = layers.map(function(pair) {
		var layer = pair[0];
		var filename = pair[1];
		var dep = dependency(layer, filename);
		dep.name = layer;
		return dep;
	});

	return {
		init: function(server, callback){
			layers.forEach(function(layer){
				var source_opts = server.layer(layer.name).options;
				layer.minZoom = source_opts.minZoom;
				layer.maxZoom = source_opts.maxZoom;
			});
			callback();
		},
		serve: function(server, req, callback) {
			var vtiles, result;

			async.series([
				function loadTiles(callback) {
					async.map(layers, function(layer, callback) {

						//don't request vector tiles beyond the zoom constraints of the source
						if(layer.minZoom && req.z < layer.minZoom) return callback(null, null);
						if(layer.maxZoom && req.z > layer.maxZoom) return callback(null, null);

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
						if(!err){
							//remove nulls from skipped sources
							vtiles = result.filter(function(vtile){ return !!vtile; });
						}
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
