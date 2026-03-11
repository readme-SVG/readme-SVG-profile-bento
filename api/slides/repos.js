const { GH } = require('../lib/constants');
const { slideStat } = require('./stat');

module.exports = {
  id: 'repos',
  fn: user => slideStat(user.public_repos, 'public repositories', GH.blue),
};
