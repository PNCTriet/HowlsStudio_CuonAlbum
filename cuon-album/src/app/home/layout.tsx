import { promises as fs } from 'fs';
import path from 'path';
import HomePage from './page';
import { AppConfig } from '@/config/appConfig';

async function getStaticProps() {
  try {
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    
    let photoPaths: string[] = [];
    let avatarPaths: string[] = [];
    
    if (AppConfig.USE_SUPABASE) {
      // Read photo paths from tags.json (Supabase mode)
      try {
        const tagsPath = path.join(process.cwd(), 'public', 'data', 'tags.json');
        const tagsData = await fs.readFile(tagsPath, 'utf-8');
        const tags = JSON.parse(tagsData);
        
        // Extract photo names directly from tags.json (they are already just filenames)
        photoPaths = Object.keys(tags).map(photoName => `/photos/${photoName}`);
        if (AppConfig.LOG_LOADING_INFO) {
          console.log(`[SUPABASE MODE] Loaded ${photoPaths.length} photos from tags.json`);
        }
      } catch {
        console.log('Tags.json file not found or empty, falling back to photos directory');
        photoPaths = await getLocalPhotoPaths();
      }
    } else {
      // Read from local photos directory (local mode)
      photoPaths = await getLocalPhotoPaths();
    }
    
    try {
      const avatarFiles = await fs.readdir(avatarsDir, { recursive: true });
      avatarPaths = avatarFiles
        .filter((file: string) => 
          typeof file === 'string' && 
          (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png'))
        )
        .map((file: string) => `/avatars/${file}`);
    } catch {
      console.log('Avatars directory not found or empty');
    }
    
    return {
      photoPaths,
      avatarPaths,
      config: { USE_SUPABASE: AppConfig.USE_SUPABASE }
    };
  } catch {
    console.error('Error reading files');
    return {
      photoPaths: [],
      avatarPaths: [],
      config: { USE_SUPABASE: AppConfig.USE_SUPABASE }
    };
  }
}

async function getLocalPhotoPaths(): Promise<string[]> {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    const photoFiles = await fs.readdir(photosDir, { recursive: true });
    const paths = photoFiles
      .filter((file: string) => 
        typeof file === 'string' && 
        (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png'))
      )
      .map((file: string) => `/photos/${file}`);
    if (AppConfig.LOG_LOADING_INFO) {
      console.log(`[LOCAL MODE] Loaded ${paths.length} photos from local directory`);
    }
    return paths;
  } catch {
    console.log('Photos directory not found or empty');
    return [];
  }
}

export default async function HomeLayout() {
  const { photoPaths, avatarPaths, config } = await getStaticProps();
  
  return (
    <div className="dark">
      <HomePage photoPaths={photoPaths} avatarPaths={avatarPaths} config={config} />
    </div>
  );
} 