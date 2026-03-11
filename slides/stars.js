const { GH } = require('../lib/constants');
const { slideStat } = require('./stat');

module.exports = {
  id: 'stars',
  fn: (user, repos) => slideStat(repos.reduce((s, x) => s + x.stargazers_count, 0), 'total stars earned', GH.yellow),
};
