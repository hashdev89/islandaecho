#!/usr/bin/env node

/**
 * Script to upload video to Supabase storage
 * Run this with: node upload-video.js
 */

const fs = require('fs');
const path = require('path');

async function uploadVideo() {
  try {
    console.log('🚀 Starting video upload to Supabase...');
    
    // Make POST request to upload API
    const response = await fetch('http://localhost:3000/api/upload-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Video uploaded successfully!');
      console.log('📁 Path:', result.data.path);
      console.log('🌐 Public URL:', result.data.publicUrl);
      console.log('📊 File size:', (result.data.size / 1024 / 1024).toFixed(2), 'MB');
      
      console.log('\n🎯 Next steps:');
      console.log('1. Copy this URL:', result.data.publicUrl);
      console.log('2. Test your website to see the video loading from Supabase');
      console.log('3. The video will now be served from Supabase CDN for better performance');
    } else {
      console.error('❌ Upload failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
}

// Check if we're running this script directly
if (require.main === module) {
  uploadVideo();
}

module.exports = { uploadVideo };
