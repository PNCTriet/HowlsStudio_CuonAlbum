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

// Avatar mapping from old names to new names
const avatarMapping = {
  'ái_vy.png': 'ai_vy.png',
  'anh_max.png': 'anh_max.png',
  'bạn_nhật_thy_1.png': 'ban_nhat_thy_1.png',
  'bạn_nhật_thy_10.png': 'ban_nhat_thy_10.png',
  'bạn_nhật_thy_11.png': 'ban_nhat_thy_11.png',
  'bạn_nhật_thy_12.png': 'ban_nhat_thy_12.png',
  'bạn_nhật_thy_13.png': 'ban_nhat_thy_13.png',
  'bạn_nhật_thy_2.png': 'ban_nhat_thy_2.png',
  'bạn_nhật_thy_3.png': 'ban_nhat_thy_3.png',
  'bạn_nhật_thy_4.png': 'ban_nhat_thy_4.png',
  'bạn_nhật_thy_5.png': 'ban_nhat_thy_5.png',
  'bạn_nhật_thy_6.png': 'ban_nhat_thy_6.png',
  'bạn_nhật_thy_7.png': 'ban_nhat_thy_7.png',
  'bạn_nhật_thy_8.png': 'ban_nhat_thy_8.png',
  'bạn_nhật_thy_9.png': 'ban_nhat_thy_9.png',
  'bạn_nhật_thy.png': 'ban_nhat_thy.png',
  'bảo_ngọc.png': 'bao_ngoc.png',
  'bary.png': 'bary.png',
  'cao_triết.png': 'cao_triet.png',
  'cát_nhiên.png': 'cat_nhien.png',
  'chị_hà.png': 'chi_ha.png',
  'chị_mai.png': 'chi_mai.png',
  'chị_quỳnh_anh.png': 'chi_quynh_anh.png',
  'ck_bora.png': 'ck_bora.png',
  'em_su.png': 'em_su.png',
  'gia_hân_1.png': 'gia_han_1.png',
  'gia_hân.png': 'gia_han.png',
  'hải_đông.png': 'hai_dong.png',
  'khánh_tòn.png': 'khanh_ton.png',
  'khánh_vy.png': 'khanh_vy.png',
  'kim_phạm.png': 'kim_pham.png',
  'kim_tuyến.png': 'kim_tuyen.png',
  'lan_anh.png': 'lan_anh.png',
  'mẹ_giang.png': 'me_giang.png',
  'minh_hưng.png': 'minh_hung.png',
  'ngọc_hân.png': 'ngoc_han.png',
  'nhà_bảo_ngọc_1.png': 'nha_bao_ngoc_1.png',
  'nhà_bảo_ngọc.png': 'nha_bao_ngoc.png',
  'nhà_yên_khê_1.png': 'nha_yen_khe_1.png',
  'nhà_yên_khê.png': 'nha_yen_khe.png',
  'nhật_thy.png': 'nhat_thy.png',
  'nhi_đinh.png': 'nhi_dinh.png',
  'phương_hằng.png': 'phuong_hang.png',
  'thanh_thuỷ.png': 'thanh_thuy.png',
  'thanh_tuyền.png': 'thanh_tuyen.png',
  'tường_duy.png': 'tuong_duy.png',
  'tuyết_ngân.png': 'tuyet_ngan.png',
  'yên_khê.png': 'yen_khe.png'
};

const avatarsDir = path.join(__dirname, 'public/avatars');

console.log('Starting to rename avatar files...');

// Get all files in the avatars directory
const files = fs.readdirSync(avatarsDir);

let renamedCount = 0;
let skippedCount = 0;

files.forEach(filename => {
  if (avatarMapping[filename]) {
    const oldPath = path.join(avatarsDir, filename);
    const newPath = path.join(avatarsDir, avatarMapping[filename]);
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ Renamed: ${filename} → ${avatarMapping[filename]}`);
      renamedCount++;
    } catch (error) {
      console.error(`❌ Error renaming ${filename}:`, error.message);
    }
  } else {
    console.log(`⏭️  Skipped: ${filename} (no mapping needed)`);
    skippedCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Renamed: ${renamedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`📁 Total processed: ${files.length} files`);

// Verify the conversion by checking if all new names exist
console.log('\n🔍 Verifying conversion...');
const newFiles = fs.readdirSync(avatarsDir);
const expectedFiles = Object.values(avatarMapping);

const missingFiles = expectedFiles.filter(file => !newFiles.includes(file));
const extraFiles = newFiles.filter(file => !expectedFiles.includes(file));

if (missingFiles.length > 0) {
  console.log('❌ Missing files:', missingFiles);
} else {
  console.log('✅ All expected files are present');
}

if (extraFiles.length > 0) {
  console.log('⚠️  Extra files found:', extraFiles);
}

console.log('\n🎉 Avatar file renaming completed!'); 