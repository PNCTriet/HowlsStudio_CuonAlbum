const fs = require('fs');
const path = require('path');

// Read the files
const avatarsPath = path.join(__dirname, 'public/data/avatars.json');
const tagsPath = path.join(__dirname, 'public/data/tags.json');
const statsPath = path.join(__dirname, 'public/data/avatar_stats.json');

const avatars = JSON.parse(fs.readFileSync(avatarsPath, 'utf8'));
const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

console.log('=== AVATAR MAPPING DEBUG ===\n');

// Check avatars.json
console.log('1. Avatars in avatars.json:');
avatars.forEach((avatar, index) => {
  console.log(`   ${index + 1}. ${avatar}`);
});

// Check all unique avatars in tags.json
console.log('\n2. Unique avatars in tags.json:');
const uniqueAvatarsInTags = new Set();
Object.values(tags).forEach(avatarPaths => {
  avatarPaths.forEach(avatarPath => {
    uniqueAvatarsInTags.add(avatarPath);
  });
});

const sortedAvatarsInTags = Array.from(uniqueAvatarsInTags).sort();
sortedAvatarsInTags.forEach((avatar, index) => {
  console.log(`   ${index + 1}. ${avatar}`);
});

// Check for mismatches
console.log('\n3. Checking for mismatches...');
const avatarsSet = new Set(avatars);

const missingInAvatars = sortedAvatarsInTags.filter(avatar => !avatarsSet.has(avatar.replace('/avatars/', '')));
const missingInTags = avatars.filter(avatar => !sortedAvatarsInTags.includes(`/avatars/${avatar}`));

if (missingInAvatars.length > 0) {
  console.log('❌ Avatars in tags.json but missing in avatars.json:');
  missingInAvatars.forEach(avatar => console.log(`   - ${avatar}`));
} else {
  console.log('✅ All avatars in tags.json exist in avatars.json');
}

if (missingInTags.length > 0) {
  console.log('❌ Avatars in avatars.json but not used in tags.json:');
  missingInTags.forEach(avatar => console.log(`   - ${avatar}`));
} else {
  console.log('✅ All avatars in avatars.json are used in tags.json');
}

// Check avatar_stats.json
console.log('\n4. Checking avatar_stats.json...');
const statsAvatars = Object.keys(stats.avatar_counts);
const statsAvatarsSet = new Set(statsAvatars);

const missingInStats = sortedAvatarsInTags.filter(avatar => !statsAvatarsSet.has(avatar));
const extraInStats = statsAvatars.filter(avatar => !sortedAvatarsInTags.includes(avatar));

if (missingInStats.length > 0) {
  console.log('❌ Avatars in tags.json but missing in avatar_stats.json:');
  missingInStats.forEach(avatar => console.log(`   - ${avatar}`));
} else {
  console.log('✅ All avatars in tags.json exist in avatar_stats.json');
}

if (extraInStats.length > 0) {
  console.log('❌ Avatars in avatar_stats.json but not used in tags.json:');
  extraInStats.forEach(avatar => console.log(`   - ${avatar}`));
} else {
  console.log('✅ All avatars in avatar_stats.json are used in tags.json');
}

console.log('\n=== SUMMARY ===');
console.log(`Total avatars in avatars.json: ${avatars.length}`);
console.log(`Total unique avatars in tags.json: ${sortedAvatarsInTags.length}`);
console.log(`Total avatars in avatar_stats.json: ${statsAvatars.length}`);
console.log(`Total photos in tags.json: ${Object.keys(tags).length}`); 