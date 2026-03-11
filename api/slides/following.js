const { GH } = require('../lib/constants');
const { slideStat } = require('./stat');

module.exports = {
  id: 'following',
  fn: user => slideStat(user.following, 'following', GH.pink),
};
