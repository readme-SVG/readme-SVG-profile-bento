const { GH } = require('../lib/constants');
const { slideStat } = require('./stat');

module.exports = {
  id: 'issues',
  fn: (user, repos) => slideStat(repos.filter(r => !r.fork).reduce((s, r) => s + (r.open_issues_count || 0), 0), 'open issues across repos', GH.red),
};
