'use strict';

module.exports.getAsset = function _getAsset(request, reply) {
	reply.file(`${process.cwd()}/data/${request.param.assetPath}`);
};
