var vtilecomposite = require('../index.js');
var tilestrata = require('tilestrata');
var TileServer = tilestrata.TileServer;
var TileRequest = tilestrata.TileRequest;
var assert = require('chai').assert;
var fs = require('fs');
var mapnik = require('mapnik');

describe('"tilestrata-vtile-composite"', function() {
	it('should be able to composite vector tiles', function(done) {
		var server = new TileServer();

		var req = TileRequest.parse('/layer/5/5/12/tile.pbf');
		server.layer('src1').route('tile.pbf').use({
			serve: function(server, req, callback) {
				return callback(null, fs.readFileSync(__dirname + '/data/world_metatile.pbf'), {});
			}
		});
		server.layer('src2').route('tile.pbf').use({
			serve: function(server, req, callback) {
				return callback(null, fs.readFileSync(__dirname + '/data/world_metatile.pbf'), {});
			}
		});
		server.layer('layer').route('tile.pbf').use(vtilecomposite([
			['src1','tile.pbf'],
			['src2','tile.pbf']
		]));

		server.initialize(function(err) {
			if (err) throw err;
			server.serve(req, false, function(status, buffer, headers) {
				assert.equal(status, 200);
				assert.equal(headers['Content-Type'], 'application/x-protobuf');
				assert.equal(headers['Content-Encoding'], 'gzip');
				assert.instanceOf(buffer, Buffer);

				var vtile = buffer._vtile;
				assert.instanceOf(vtile, mapnik.VectorTile);
				assert.equal(buffer._vx, 5);
				assert.equal(buffer._vy, 12);
				assert.equal(buffer._vz, 5);
				assert.equal(vtile.getData().length, 23454);
				assert.deepEqual(vtile.names(),["world","world"]);

				done();
			});
		});
	});
	it('should ignore source layers when zoom is beyond minZoom or maxZoom', function(done) {
		var server = new TileServer();

		var req = TileRequest.parse('/layer/5/5/12/tile.pbf');
		server.layer('srcLow', {maxZoom: 4}).route('tile.pbf').use({
			serve: function(server, req, callback) {
				return callback(null, fs.readFileSync(__dirname + '/data/world_metatile.pbf'), {});
			}
		});
		server.layer('srcMed').route('tile.pbf').use({
			serve: function(server, req, callback) {
				return callback(null, fs.readFileSync(__dirname + '/data/world_metatile.pbf'), {});
			}
		});
		server.layer('srcHigh', {minZoom: 6}).route('tile.pbf').use({
			serve: function(server, req, callback) {
				return callback(null, fs.readFileSync(__dirname + '/data/world_metatile.pbf'), {});
			}
		});
		server.layer('layer').route('tile.pbf').use(vtilecomposite([
			['srcLow','tile.pbf'],
			['srcMed','tile.pbf'],
			['srcHigh','tile.pbf']
		]));

		server.initialize(function(err) {
			if (err) throw err;
			server.serve(req, false, function(status, buffer, headers) {
				assert.equal(status, 200);
				assert.equal(headers['Content-Encoding'], 'gzip');
				assert.equal(headers['Content-Type'], 'application/x-protobuf');
				assert.instanceOf(buffer, Buffer);

				var vtile = buffer._vtile;
				assert.instanceOf(vtile, mapnik.VectorTile);
				assert.equal(vtile.getData().length, 11727);
				assert.deepEqual(vtile.names(),["world"]);

				done();
			});
		});
	});
	it('should gracefully error if empty buffer from source', function(done) {
		var server = new TileServer();

		var req = TileRequest.parse('/layer/5/5/12/tile.pbf');
		server.layer('src').route('tile.pbf').use({
			serve: function(server, req, callback) {
				var vtile = new mapnik.VectorTile(5,5,12);
				var buffer = vtile.getData();
				buffer._vtile = vtile;
				return callback(null, buffer, {});
			}
		});
		server.layer('layer').route('tile.pbf').use(vtilecomposite([
			['src','tile.pbf']
		]));

		server.initialize(function(err) {
			assert.isFalse(!!err, err);
			server.serve(req, false, function(status, buffer, headers) {
				assert.equal(status, 204);
				assert.equal(buffer.toString(), 'No data');
				done();
			});
		});
	});
	it('should ignore 204 no data errors from source', function(done) {
		var server = new TileServer();

		var req = TileRequest.parse('/layer/5/5/12/tile.pbf');
		server.layer('src1').route('tile.pbf').use({
			serve: function(server, req, callback) {
				var err = new Error("No data");
				err.statusCode = 204;
				return callback(err, null, {});
			}
		});
		server.layer('src2').route('tile.pbf').use({
			serve: function(server, req, callback) {
				return callback(null, fs.readFileSync(__dirname + '/data/world_metatile.pbf'), {});
			}
		});
		server.layer('layer').route('tile.pbf').use(vtilecomposite([
			['src1','tile.pbf'],
			['src2','tile.pbf']
		]));

		server.initialize(function(err) {
			if (err) throw err;
			server.serve(req, false, function(status, buffer, headers) {
				assert.equal(status, 200);
				assert.equal(headers['Content-Encoding'], 'gzip');
				assert.equal(headers['Content-Type'], 'application/x-protobuf');
				assert.instanceOf(buffer, Buffer);

				var vtile = buffer._vtile;
				assert.instanceOf(vtile, mapnik.VectorTile);
				assert.equal(vtile.getData().length, 11727);
				assert.deepEqual(vtile.names(),["world"]);

				done();
			});
		});
	});
});
