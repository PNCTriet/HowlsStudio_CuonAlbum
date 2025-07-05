import { promises as fs } from 'fs';
import path from 'path';
import HomePage from './page';

async function getStaticProps() {
  try {
    // Get photo files
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    
    let photoPaths: string[] = [];
    let avatarPaths: string[] = [];
    
    try {
      const photoFiles = await fs.readdir(photosDir, { recursive: true });
      photoPaths = photoFiles
        .filter((file: any) => 
          typeof file === 'string' && 
          (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png'))
        )
        .map((file: any) => `/photos/${file}`);
    } catch (error) {
      console.log('Photos directory not found or empty');
    }
    
    try {
      const avatarFiles = await fs.readdir(avatarsDir, { recursive: true });
      avatarPaths = avatarFiles
        .filter((file: any) => 
          typeof file === 'string' && 
          (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png'))
        )
        .map((file: any) => `/avatars/${file}`);
    } catch (error) {
      console.log('Avatars directory not found or empty');
    }
    
    return {
      photoPaths,
      avatarPaths,
    };
  } catch (error) {
    console.error('Error reading files:', error);
    return {
      photoPaths: [],
      avatarPaths: [],
    };
  }
}

export default async function HomeLayout() {
  const { photoPaths, avatarPaths } = await getStaticProps();
  
  return (
    <div className="dark">
      <HomePage photoPaths={photoPaths} avatarPaths={avatarPaths} />
    </div>
  );
} 