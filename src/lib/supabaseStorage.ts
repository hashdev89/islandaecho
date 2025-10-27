import { supabaseAdmin } from './supabaseClient'

const BUCKET_NAME = 'isleandecho'

export async function ensureBucketExists(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Checking if bucket exists:', BUCKET_NAME)
    
    // Try to list buckets to see if it exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return { success: false, error: listError.message }
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
      console.log('Bucket does not exist, creating it...')
      
      // Create the bucket
      const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB in bytes
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        return { success: false, error: createError.message }
      }

      console.log('Bucket created successfully:', createData)
      return { success: true }
    }

    console.log('Bucket already exists')
    return { success: true }
  } catch (error: unknown) {
    console.error('ensureBucketExists error:', error)
    return { success: false, error: (error as Error).message }
  }
}

export { BUCKET_NAME }

