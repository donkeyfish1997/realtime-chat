import * as bcrypt from 'bcrypt';

async function functionName(password: string) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
}

functionName('pass').then((passHash) => {
  console.log('passHash: ', passHash);
});
