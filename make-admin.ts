import { getUserByUsername, setUserRole } from './src/lib/db.js';

const username = process.argv[2];

if (!username) {
  console.error('\n❌ Please provide your username as an argument!');
  console.error('Usage: npx tsx make-admin.ts <your_username>\n');
  process.exit(1);
}

const user = getUserByUsername(username);

if (!user) {
  console.error(`\n❌ User @${username} not found in the database.\n`);
  process.exit(1);
}

setUserRole(user.id, 'admin');
console.log(`\n✅ Success! @${username} is now an Admin. Please refresh the app to see your admin dashboard.\n`);
