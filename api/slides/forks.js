const { GH } = require('../lib/constants');
const { slideStat } = require('./stat');

module.exports = {
  id: 'forks',
  fn: (user, repos) => slideStat(repos.filter(r => !r.fork).reduce((s, r) => s + r.forks_count, 0), 'total forks received', GH.purple),
};
