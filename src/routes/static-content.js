'use strict';

module.exports.getAsset = function _getAsset(request, reply) {
	let path = request.params.assetPath.replace(/^\.\.?\//, '');
	reply.file(`${process.cwd()}/data/${path}`);
};
