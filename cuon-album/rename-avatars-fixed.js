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

const avatarsDir = path.join(__dirname, 'public/avatars');

console.log('Starting to rename avatar files...');

// Get all files in the avatars directory
const files = fs.readdirSync(avatarsDir);

let renamedCount = 0;
let skippedCount = 0;

files.forEach(filename => {
  // Convert the filename to no accents
  const noAccentName = convertFilename(filename);
  
  // Only rename if the name actually changed
  if (filename !== noAccentName) {
    const oldPath = path.join(avatarsDir, filename);
    const newPath = path.join(avatarsDir, noAccentName);
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ Renamed: ${filename} → ${noAccentName}`);
      renamedCount++;
    } catch (error) {
      console.error(`❌ Error renaming ${filename}:`, error.message);
    }
  } else {
    console.log(`⏭️  Skipped: ${filename} (no change needed)`);
    skippedCount++;
  }
});

function convertFilename(filename) {
  const name = filename.replace('.png', '');
  const noAccentName = removeAccents(name);
  return noAccentName + '.png';
}

console.log('\n📊 Summary:');
console.log(`✅ Renamed: ${renamedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`📁 Total processed: ${files.length} files`);

// Show final list of files
console.log('\n📋 Final file list:');
const finalFiles = fs.readdirSync(avatarsDir);
finalFiles.sort().forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\n🎉 Avatar file renaming completed!'); 