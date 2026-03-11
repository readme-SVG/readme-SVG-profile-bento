const { GH } = require('../lib/constants');
const { slideStat } = require('./stat');

module.exports = {
  id: 'followers',
  fn: user => slideStat(user.followers, 'followers', GH.green),
};
