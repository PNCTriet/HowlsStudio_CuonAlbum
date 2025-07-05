# Cuốn Album – Tag Page

A Next.js 14 application for tagging photos with avatars, built with TypeScript, Tailwind CSS, and Tabler icons.

## Features

### Core Functionality
- **Photo Tagging**: Tag photos with multiple avatars
- **Smart Suggestions**: AI-powered avatar suggestions based on previous tags
- **Progress Tracking**: Visual progress bars and navigation between photos
- **Persistent Storage**: Tags saved to both localStorage and JSON files
- **Export Functionality**: Export tag data as JSON files

### Gallery Features
- **Search & Filter**: Search photos by name and filter by avatar tags
- **Multi-select**: Select multiple photos for batch operations
- **Batch Download**: Download multiple photos with feedback
- **Avatar Modal**: View all avatars in a photo with click-to-filter

### UI/UX
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Notifications for save operations
- **Sticky Bottom Bar**: Always accessible export and progress controls
- **Sidebar**: Quick access to selected avatars and actions

## File Structure

```
cuon-album/
├── public/
│   ├── photos/          # Photo files (JPG, PNG, etc.)
│   ├── avatars/         # Avatar files (JPG, PNG, etc.)
│   └── data/            # JSON data files (auto-generated)
│       ├── tags.json    # Tag data
│       └── feedback.json # User feedback
├── src/
│   ├── app/
│   │   ├── home/        # Gallery page
│   │   ├── tag/         # Tagging page
│   │   └── api/
│   │       └── save-data/ # API for saving JSON files
│   ├── components/      # React components
│   └── services/        # Storage and utility services
```

## JSON File Storage

The application automatically saves data to JSON files in the `public/data/` directory:

### tags.json
Stores all photo-avatar tag mappings:
```json
{
  "/photos/photo1.jpg": ["/avatars/avatar1.jpg", "/avatars/avatar2.jpg"],
  "/photos/photo2.jpg": ["/avatars/avatar3.jpg"]
}
```

### feedback.json
Stores user feedback from downloads:
```json
[
  {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "message": "Great photos!",
    "photoCount": 5,
    "totalSize": 62914560
  }
]
```

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Add Photos and Avatars**:
   - Place photos in `public/photos/`
   - Place avatars in `public/avatars/`

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Gallery: `http://localhost:3000/home`
   - Tag Page: `http://localhost:3000/tag`

## Usage

### Tagging Photos
1. Navigate to the Tag Page
2. Use arrow keys or buttons to navigate between photos
3. Click avatars to tag them to the current photo
4. Use smart suggestions for faster tagging
5. Save progress regularly
6. Export data when finished

### Gallery Features
1. Navigate to the Gallery
2. Search photos by name
3. Filter by avatar tags
4. Select multiple photos
5. Download with optional feedback
6. View avatar details in modal

## Data Persistence

- **localStorage**: Fast access for immediate operations
- **JSON Files**: Permanent storage in `public/data/`
- **Auto-sync**: Data automatically syncs between localStorage and files
- **Backup**: JSON files serve as backup and can be shared

## API Endpoints

### POST /api/save-data
Saves data to JSON files:
```json
{
  "type": "tags" | "feedback",
  "data": { /* data to save */ }
}
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Tabler Icons**: Beautiful icon library
- **Node.js**: Server-side file operations

## Development

### Key Components
- `PhotoTagger`: Main tagging interface
- `AvatarTile`: Individual avatar component
- `BottomBar`: Export and progress controls
- `Sidebar`: Selected avatars management
- `StorageService`: Data persistence layer

### State Management
- React hooks for local state
- localStorage for persistence
- JSON files for backup and sharing
- Real-time sync between storage methods

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own needs!
