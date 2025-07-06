const fs = require('fs');
const path = require('path');

function updateAvatarStats() {
  try {
    // Read tags data
    const tagsPath = path.join(__dirname, '../public/data/tags.json');
    const tagsLocalPath = path.join(__dirname, '../public/data/tags_local.json');
    
    let tagsData = {};
    
    // Try to read from tags.json first, then tags_local.json
    if (fs.existsSync(tagsPath)) {
      const tagsContent = fs.readFileSync(tagsPath, 'utf-8');
      tagsData = JSON.parse(tagsContent);
    } else if (fs.existsSync(tagsLocalPath)) {
      const tagsLocalContent = fs.readFileSync(tagsLocalPath, 'utf-8');
      tagsData = JSON.parse(tagsLocalContent);
    } else {
      console.error('No tags file found');
      return;
    }

    // Calculate avatar counts
    const avatarCounts = {};
    let totalTags = 0;

    Object.values(tagsData).forEach(avatarPaths => {
      avatarPaths.forEach(avatarPath => {
        // Normalize avatar path
        const normalizedPath = avatarPath.startsWith('/avatars/') ? avatarPath : `/avatars/${avatarPath}`;
        avatarCounts[normalizedPath] = (avatarCounts[normalizedPath] || 0) + 1;
        totalTags++;
      });
    });

    // Create stats object
    const stats = {
      avatar_counts: avatarCounts,
      total_photos: Object.keys(tagsData).length,
      total_avatars: Object.keys(avatarCounts).length,
      total_tags: totalTags,
      last_updated: new Date().toISOString()
    };

    // Write to avatar_stats.json
    const statsPath = path.join(__dirname, '../public/data/avatar_stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

    console.log('Avatar stats updated successfully!');
    console.log(`- Total photos: ${stats.total_photos}`);
    console.log(`- Total avatars: ${stats.total_avatars}`);
    console.log(`- Total tags: ${stats.total_tags}`);
    console.log(`- Updated: ${stats.last_updated}`);

  } catch (error) {
    console.error('Error updating avatar stats:', error);
  }
}

// Run the update
updateAvatarStats(); 