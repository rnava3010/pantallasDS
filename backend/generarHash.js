const bcrypt = require('bcrypt');

const passwordTemporal = 'admin123';

bcrypt.hash(passwordTemporal, 10, (err, hash) => {
  if (err) console.error(err);
  console.log('---------------------------------------------------');
  console.log(`Contraseña: ${passwordTemporal}`);
  console.log(`HASH PARA LA BD: ${hash}`);
  console.log('---------------------------------------------------');
});