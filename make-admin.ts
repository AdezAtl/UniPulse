import Database from 'better-sqlite3';
import { join } from 'path';

const username = process.argv[2];

if (!username) {
  console.error('\n❌ Please provide your username as an argument!');
  console.error('Usage: npx tsx make-admin.ts <your_username>\n');
  process.exit(1);
}

const db = new Database(join(process.cwd(), 'data/unipulse.db'));

const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

if (!user) {
  console.error(`\n❌ User @${username} not found in the database.\n`);
  process.exit(1);
}

db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
console.log(`\n✅ Success! @${username} is now an Admin. Please refresh the app to see your admin dashboard.\n`);
