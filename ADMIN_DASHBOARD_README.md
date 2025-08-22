# ISLE & ECHO Admin Dashboard

A comprehensive admin dashboard for managing tour packages, destinations, images, and website content with real-time data synchronization.

## 🚀 Features

### 📊 Dashboard Overview
- **Statistics Dashboard**: View total tours, destinations, images, and users
- **Quick Actions**: Add new tours, destinations, and upload images
- **Recent Activity**: Monitor recent tours and performance metrics
- **Real-time Updates**: Live data synchronization with the frontend

### 🎯 Tour Package Management
- **Create & Edit Tours**: Full CRUD operations for tour packages
- **Interactive Map Integration**: 3D Mapbox maps with destination markers
- **Route Planning**: Visual tour route mapping with coordinates
- **Content Management**: Manage descriptions, inclusions, exclusions, and images
- **Status Management**: Draft, Active, and Archived tour states

### 🗺️ Destination Management
- **Geographic Data**: Manage destinations with precise coordinates
- **Region Organization**: Categorize destinations by regions
- **Image Management**: Associate images with destinations
- **Tour Integration**: Link destinations to tour packages

### 🖼️ Image Management
- **Upload & Organize**: Bulk image upload and categorization
- **Grid & List Views**: Flexible viewing options
- **Usage Tracking**: Monitor where images are used
- **URL Management**: Copy image URLs for easy integration

### 🔄 Data Synchronization
- **Backend Integration**: RESTful API endpoints for data management
- **Real-time Updates**: Automatic frontend data updates
- **WebSocket Support**: Live data synchronization (simulated)
- **Error Handling**: Robust error handling and recovery

## 🛠️ Technical Architecture

### Frontend Components
```
src/app/admin/
├── layout.tsx              # Admin layout with sidebar navigation
├── page.tsx               # Main dashboard overview
├── tours/
│   ├── page.tsx           # Tour packages management
│   └── [id]/page.tsx      # Tour editor with map integration
├── destinations/
│   └── page.tsx           # Destinations management
└── images/
    └── page.tsx           # Image management system
```

### Backend API
```
src/app/api/
├── tours/route.ts         # Tour CRUD operations
├── destinations/route.ts  # Destination management
└── images/route.ts        # Image upload and management
```

### Data Services
```
src/lib/
└── dataSync.ts           # Data synchronization service
```

## 🚀 Getting Started

### 1. Access the Admin Dashboard
Navigate to `/admin` in your browser to access the admin dashboard.

### 2. Dashboard Overview
- View key statistics and metrics
- Use quick action buttons to create new content
- Monitor recent activity and performance

### 3. Managing Tour Packages

#### Creating a New Tour
1. Click "Add New Tour" from the dashboard or tours page
2. Fill in basic information (name, duration, price, etc.)
3. Select destinations from the available list
4. View the interactive route map
5. Add highlights, inclusions, and exclusions
6. Upload tour images
7. Set tour status (Draft/Active/Archived)
8. Save and publish

#### Editing Tour Routes
1. Select destinations using the checkbox list
2. View real-time route updates on the 3D map
3. The map automatically shows:
   - Destination markers with popups
   - Animated route lines
   - Interactive navigation controls
   - 3D terrain and buildings

### 4. Managing Destinations

#### Adding Destinations
1. Navigate to Destinations page
2. Click "Add Destination"
3. Enter destination details:
   - Name and region
   - Geographic coordinates (lat/lng)
   - Description and image
   - Status (Active/Inactive)

#### Geographic Data
- Use precise coordinates for accurate mapping
- Destinations are automatically linked to tours
- View destination usage across tour packages

### 5. Image Management

#### Uploading Images
1. Go to Images page
2. Click "Upload Images"
3. Select files or drag-and-drop
4. Categorize images (Destinations, Wildlife, Landscapes, etc.)
5. Images are automatically optimized and stored

#### Managing Image Usage
- Track where images are used across the website
- Copy image URLs for easy integration
- View image metadata (size, dimensions, upload date)
- Bulk select and delete operations

## 🔧 API Endpoints

### Tours API
```typescript
GET    /api/tours          # Get all tours
POST   /api/tours          # Create new tour
PUT    /api/tours          # Update existing tour
DELETE /api/tours?id={id}  # Delete tour
```

### Destinations API
```typescript
GET    /api/destinations          # Get all destinations
POST   /api/destinations          # Create new destination
PUT    /api/destinations          # Update destination
DELETE /api/destinations?id={id}  # Delete destination
```

### Images API
```typescript
GET    /api/images               # Get all images
POST   /api/images/upload        # Upload new image
DELETE /api/images?id={id}       # Delete image
```

## 🔄 Data Synchronization

### Real-time Updates
The dashboard uses a data synchronization service that:
- Automatically syncs data between backend and frontend
- Provides real-time updates (simulated with polling)
- Handles error recovery and retry logic
- Maintains data consistency across the application

### Frontend Integration
```typescript
import { useDataSync } from '@/lib/dataSync'

// In your component
const { data: tours, loading, error } = useDataSync('tours')
```

### Manual Sync
```typescript
import { dataSync } from '@/lib/dataSync'

// Sync all data
await dataSync.syncAllData()

// Start real-time updates
dataSync.startRealTimeUpdates()
```

## 🗺️ Map Integration

### Mapbox Configuration
The dashboard integrates with Mapbox GL JS for interactive 3D maps:

- **3D Terrain**: Realistic terrain visualization
- **Building Extrusions**: 3D building models
- **Interactive Markers**: Clickable destination markers
- **Animated Routes**: Smooth route line animations
- **Navigation Controls**: Zoom, pan, and fullscreen controls

### Map Features
- **Destination Markers**: Custom markers with popups
- **Route Visualization**: Animated lines connecting destinations
- **Geographic Accuracy**: Precise coordinate plotting
- **Interactive Elements**: Click markers to fly to locations

## 📱 Responsive Design

The admin dashboard is fully responsive and works on:
- Desktop computers (full feature set)
- Tablets (optimized layout)
- Mobile devices (collapsible sidebar)

## 🔒 Security Considerations

### Authentication
- Implement proper authentication for admin access
- Use role-based access control (RBAC)
- Secure API endpoints with authentication middleware

### Data Validation
- Validate all input data on both frontend and backend
- Sanitize user inputs to prevent XSS attacks
- Implement proper error handling

### File Upload Security
- Validate file types and sizes
- Scan uploaded images for malware
- Store files securely with proper permissions

## 🚀 Deployment

### Environment Variables
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
DATABASE_URL=your_database_connection_string
UPLOAD_SECRET=your_file_upload_secret
```

### Build and Deploy
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

## 🔧 Customization

### Adding New Features
1. Create new API endpoints in `src/app/api/`
2. Add corresponding admin pages in `src/app/admin/`
3. Update the data synchronization service
4. Add navigation items to the admin layout

### Styling Customization
- Modify Tailwind CSS classes for styling
- Update color schemes in the theme configuration
- Customize component layouts and spacing

### Data Model Extensions
- Extend TypeScript interfaces for new data types
- Update API endpoints to handle new fields
- Modify frontend forms to include new properties

## 📊 Performance Optimization

### Image Optimization
- Automatic image compression and resizing
- Lazy loading for better performance
- CDN integration for faster delivery

### Data Loading
- Implement pagination for large datasets
- Use React Query for efficient data fetching
- Optimize database queries

### Caching Strategy
- Implement Redis caching for frequently accessed data
- Use Next.js built-in caching mechanisms
- Cache static assets and API responses

## 🐛 Troubleshooting

### Common Issues

#### Map Not Loading
- Check Mapbox token configuration
- Verify internet connection
- Check browser console for errors

#### Data Not Syncing
- Verify API endpoints are accessible
- Check network connectivity
- Review error logs in browser console

#### Image Upload Failures
- Check file size limits
- Verify file type restrictions
- Ensure proper permissions on upload directory

### Debug Mode
Enable debug mode by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

This will show additional logging and error information.

## 📈 Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed performance metrics
- **Bulk Operations**: Mass import/export functionality
- **Advanced Search**: Full-text search with filters
- **User Management**: Admin user roles and permissions
- **Content Scheduling**: Publish content at specific times
- **Multi-language Support**: Internationalization
- **Mobile App**: Native mobile admin application

### Integration Possibilities
- **CRM Integration**: Connect with customer management systems
- **Payment Processing**: Integrate with payment gateways
- **Email Marketing**: Connect with email service providers
- **Social Media**: Auto-post to social platforms
- **Analytics**: Google Analytics and custom tracking

## 📞 Support

For technical support or feature requests:
- Create an issue in the project repository
- Contact the development team
- Check the documentation for common solutions

---

**ISLE & ECHO Admin Dashboard** - Empowering travel businesses with powerful content management tools.
