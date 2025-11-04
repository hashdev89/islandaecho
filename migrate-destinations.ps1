# PowerShell script to migrate destinations to Supabase

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Destinations Migration Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ Found .env.local file" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
    Write-Host "  Please create it with your Supabase credentials" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Step 1: Check migration status
Write-Host ""
Write-Host "Step 1: Checking migration status..." -ForegroundColor Yellow
Write-Host ""

try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/destinations/migrate-to-supabase" -Method GET -ErrorAction Stop
    
    if ($statusResponse.success) {
        Write-Host "✓ Migration status check successful" -ForegroundColor Green
        Write-Host ""
        Write-Host "Local Destinations: $($statusResponse.localDestinations.count)" -ForegroundColor Cyan
        Write-Host "Supabase Destinations: $($statusResponse.supabaseDestinations.count)" -ForegroundColor Cyan
        Write-Host "Needs Migration: $($statusResponse.needsMigration)" -ForegroundColor $(if ($statusResponse.needsMigration) { "Yellow" } else { "Green" })
        
        if ($statusResponse.needsMigration -and $statusResponse.missingInSupabase -gt 0) {
            Write-Host ""
            Write-Host "Missing destinations in Supabase: $($statusResponse.missingInSupabase)" -ForegroundColor Yellow
            Write-Host ""
            
            # Step 2: Run migration
            Write-Host "Step 2: Running migration..." -ForegroundColor Yellow
            Write-Host ""
            
            $migrationResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/destinations/migrate-to-supabase" -Method POST -ErrorAction Stop
            
            if ($migrationResponse.success) {
                Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Results:" -ForegroundColor Cyan
                Write-Host "  - Migrated: $($migrationResponse.migratedCount)" -ForegroundColor Green
                Write-Host "  - Skipped (already exist): $($migrationResponse.skippedCount)" -ForegroundColor Yellow
                Write-Host "  - Errors: $($migrationResponse.errorCount)" -ForegroundColor $(if ($migrationResponse.errorCount -gt 0) { "Red" } else { "Green" })
                
                if ($migrationResponse.errorCount -gt 0 -and $migrationResponse.errors) {
                    Write-Host ""
                    Write-Host "Errors:" -ForegroundColor Red
                    $migrationResponse.errors | ForEach-Object {
                        Write-Host "  - $($_.destination): $($_.error)" -ForegroundColor Red
                    }
                }
            } else {
                Write-Host "✗ Migration failed" -ForegroundColor Red
                Write-Host "Error: $($migrationResponse.error)" -ForegroundColor Red
            }
        } else {
            Write-Host ""
            Write-Host "✓ All destinations are already in Supabase!" -ForegroundColor Green
            Write-Host "No migration needed." -ForegroundColor Green
        }
    } else {
        Write-Host "✗ Status check failed" -ForegroundColor Red
        Write-Host "Error: $($statusResponse.error)" -ForegroundColor Red
        
        if ($statusResponse.error -like "*table does not exist*") {
            Write-Host ""
            Write-Host "⚠ The destinations table doesn't exist in Supabase." -ForegroundColor Yellow
            Write-Host "  Please run the SQL schema file: supabase_destinations_schema.sql" -ForegroundColor Yellow
            Write-Host "  in your Supabase SQL Editor first." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ Could not connect to the migration endpoint" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Your Next.js dev server is running (npm run dev)" -ForegroundColor Yellow
    Write-Host "  2. The server is accessible at http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Migration check complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

