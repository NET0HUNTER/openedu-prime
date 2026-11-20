import { seedOshwal } from '../seeds/oshwal.js';
import { seedDefault } from '../seeds/default.js';

const profile = process.argv[2] === 'default' ? 'default' : 'oshwal';
if (profile === 'default') {
  seedDefault();
  console.log('Seeded database with Standard OpenEduCat Default profile.');
} else {
  seedOshwal();
  console.log('Seeded database with Oshwal Academy (Nairobi & Mombasa / OERB) profile.');
}
