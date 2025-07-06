const fs = require('fs');
const path = require('path');

// Function to remove Vietnamese accents
function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Function to convert filename with accents to no accents
function convertFilename(filename) {
  const name = filename.replace('.png', '');
  const noAccentName = removeAccents(name);
  return noAccentName + '.png';
}

// Function to convert full path
function convertPath(path) {
  if (path.startsWith('/avatars/')) {
    const filename = path.split('/').pop();
    const convertedFilename = convertFilename(filename);
    return '/avatars/' + convertedFilename;
  }
  return path;
}

// Read and convert avatars.json
console.log('Converting avatars.json...');
const avatarsPath = path.join(__dirname, 'public/data/avatars.json');
const avatars = JSON.parse(fs.readFileSync(avatarsPath, 'utf8'));

const convertedAvatars = avatars.map(avatar => convertFilename(avatar));
fs.writeFileSync(avatarsPath, JSON.stringify(convertedAvatars, null, 2));

// Create mapping for old names to new names
const avatarMapping = {};
avatars.forEach((oldName, index) => {
  avatarMapping[oldName] = convertedAvatars[index];
});

console.log('Avatar mapping:', avatarMapping);

// Read and convert avatar_stats.json
console.log('Converting avatar_stats.json...');
const statsPath = path.join(__dirname, 'public/data/avatar_stats.json');
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

const convertedStats = {
  avatar_counts: {},
  total_photos: stats.total_photos,
  total_avatars: stats.total_avatars,
  total_tags: stats.total_tags,
  last_updated: new Date().toISOString()
};

Object.entries(stats.avatar_counts).forEach(([oldPath, count]) => {
  const newPath = convertPath(oldPath);
  convertedStats.avatar_counts[newPath] = count;
});

fs.writeFileSync(statsPath, JSON.stringify(convertedStats, null, 2));

// Read and convert tags.json
console.log('Converting tags.json...');
const tagsPath = path.join(__dirname, 'public/data/tags.json');
const tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));

const convertedTags = {};
Object.entries(tags).forEach(([photoName, avatarPaths]) => {
  convertedTags[photoName] = avatarPaths.map(avatarPath => convertPath(avatarPath));
});

fs.writeFileSync(tagsPath, JSON.stringify(convertedTags, null, 2));

console.log('Conversion completed!');
console.log('Please rename your avatar files in public/avatars/ to match the new names without accents.'); 