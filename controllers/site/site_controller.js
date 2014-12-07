var controller = function() {
	var actions = {};

	actions.name = '';

	actions.index = {
		path 	: '',
		method	: 'get',
		handler	: function(req, res, next) {
			
		}
	};

	actions.api_index = {
		path 	: '',
		prefix	: 'api',
		method	: 'get',
		handler	: function(req, res, next) {
			res.status(200).json({
				message: "Halo dari Skripsi Server. Sementara, silakan kontak Imam Hidayat <imam.hidayat92@gmail.com> untuk dokumentasi."
			});
		}
	};

	return actions;
};

module.exports = controller;
