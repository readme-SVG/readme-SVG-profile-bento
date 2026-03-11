const { W, H, GH } = require('../lib/constants');
const { T, svg } = require('../lib/svg');

module.exports = {
  id: 'age',
  fn: user => {
    const created = new Date(user.created_at);
    const yrs = new Date().getFullYear() - created.getFullYear();
    const cx = W / 2;
    const cy = H / 2 - 12;
    let o = '';
    o += `<circle cx="${cx}" cy="${cy}" r="78" fill="${GH.green}" opacity="0.04"/>`;
    o += `<circle cx="${cx}" cy="${cy}" r="50" fill="${GH.green}" opacity="0.05"/>`;
    o += T(cx, cy + 14, `${yrs}y`, 60, GH.text, 700, 'middle');
    o += T(cx, cy + 36, 'on github', 13, GH.green, 600, 'middle');
    o += T(cx, cy + 54, `since ${created.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, 11, GH.mut, 400, 'middle');
    return svg(o);
  },
};
