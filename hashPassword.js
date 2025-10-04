const bcrypt = require('bcryptjs'); // or 'bcrypt' if you prefer

const plaintextPassword = '12345678';

bcrypt.hash(plaintextPassword, 10).then(hash => {
  console.log('Hashed password:', hash);
}).catch(err => {
  console.error('Error generating hash:', err);
});
