export interface TagData {
  [photoPath: string]: string[];
}

export interface FeedbackData {
  timestamp: string;
  message: string;
  photoCount: number;
  totalSize: number;
}

export class StorageService {
  private static readonly TAGS_KEY = 'cuon_album_tags';
  private static readonly FEEDBACK_KEY = 'cuon_album_feedback';
  private static readonly TAGS_FILE_PATH = '/data/tags.json';
  private static readonly FEEDBACK_FILE_PATH = '/data/feedback.json';

  // Tags Management
  static async saveTags(tags: TagData): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Save to localStorage
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(tags));
      
      // Also save to file via API
      await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'tags', data: tags }),
      });
    } catch (error) {
      console.error('Failed to save tags:', error);
    }
  }

  static async loadTags(): Promise<TagData> {
    if (typeof window === 'undefined') return {};
    
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(this.TAGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // If not in localStorage, try to load from file
      const response = await fetch(this.TAGS_FILE_PATH);
      if (response.ok) {
        const fileData = await response.json();
        // Also save to localStorage for faster access
        localStorage.setItem(this.TAGS_KEY, JSON.stringify(fileData));
        return fileData;
      }
      
      return {};
    } catch (error) {
      console.error('Failed to load tags:', error);
      return {};
    }
  }

  static async updateTag(photoPath: string, avatars: string[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const tags = await this.loadTags();
    tags[photoPath] = avatars;
    this.saveTags(tags);
  }

  static async removeTag(photoPath: string): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const tags = await this.loadTags();
    delete tags[photoPath];
    this.saveTags(tags);
  }

  // Feedback Management
  static async saveFeedback(feedback: FeedbackData): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = await this.loadFeedback();
      existing.push(feedback);
      
      // Save to localStorage
      localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(existing));
      
      // Also save to file via API
      await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'feedback', data: existing }),
      });
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }

  static async loadFeedback(): Promise<FeedbackData[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(this.FEEDBACK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // If not in localStorage, try to load from file
      const response = await fetch(this.FEEDBACK_FILE_PATH);
      if (response.ok) {
        const fileData = await response.json();
        // Also save to localStorage for faster access
        localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(fileData));
        return fileData;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to load feedback:', error);
      return [];
    }
  }

  // Export functions
  static async exportTags(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const tags = await this.loadTags();
    this.downloadJSON(tags, 'cuon_album_tags.json');
  }

  static async exportFeedback(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const feedback = await this.loadFeedback();
    this.downloadJSON(feedback, 'cuon_album_feedback.json');
  }

  private static downloadJSON(data: Record<string, unknown> | unknown[], filename: string): void {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  // Search functions
  static async searchPhotosByAvatar(avatarPath: string): Promise<string[]> {
    const tags = await this.loadTags();
    return Object.entries(tags)
      .filter(([, avatars]) => avatars.includes(avatarPath))
      .map(([photoPath]) => photoPath);
  }

  static async searchPhotosByAvatars(avatarPaths: string[]): Promise<string[]> {
    const tags = await this.loadTags();
    return Object.entries(tags)
      .filter(([, avatars]) => avatarPaths.some(avatar => avatars.includes(avatar)))
      .map(([photoPath]) => photoPath);
  }

  // Get photo statistics
  static async getPhotoStats(): Promise<{ totalPhotos: number; taggedPhotos: number; totalTags: number }> {
    if (typeof window === 'undefined') {
      return {
        totalPhotos: 0,
        taggedPhotos: 0,
        totalTags: 0
      };
    }
    
    const tags = await this.loadTags();
    const taggedPhotos = Object.keys(tags).length;
    const totalTags = Object.values(tags).reduce((sum, avatars) => sum + avatars.length, 0);
    
    return {
      totalPhotos: 0, // This will be set by the component
      taggedPhotos,
      totalTags
    };
  }
} 