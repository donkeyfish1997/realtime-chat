import { createClient } from 'redis';

const main = async () => {
  const client = createClient({ password: 'password' });
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  await client.set('key', 'value123');
  const value = await client.get('key');
  console.log('value', value);
  await client.hSet('user-session:123', {
    name: 'John',
    surname: 'Smith',
    company: 'Redis',
    age: 29,
  });

  const userSession = await client.hGetAll('user-session:123');
  console.log(JSON.stringify(userSession, null, 2));
  await client.quit();
};

main();
