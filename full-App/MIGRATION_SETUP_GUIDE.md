# Database Migrations - Setup Guide for New PCs

## Quick Answer
✅ **YES!** Migrations will create the correct database structure on another PC automatically.

## How It Works

### On Your Current PC (Development):
1. You created database schema using migrations
2. Migrations are saved in `database/migrations/` folder
3. They track what changes were made and in what order

### On a New PC (Deployment):
1. Clone/copy the entire project
2. Run migrations with: `php artisan migrate`
3. Laravel reads all migration files and creates the complete database schema

## Step-by-Step Setup on New PC

### Step 1: Copy Project Files
```bash
# Copy entire project folder to new PC
# Or clone from git repository
git clone <your-repo-url>
cd school-portal
```

### Step 2: Install PHP Dependencies
```bash
composer install
```

### Step 3: Setup Environment
```bash
# Copy example env file
cp .env.example .env

# OR on Windows:
copy .env.example .env

# Generate app key
php artisan key:generate
```

### Step 4: Configure Database in .env
Edit `.env` file and set your database connection:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sohir_db          # Database name (will be created)
DB_USERNAME=root              # MySQL user
DB_PASSWORD=                   # MySQL password
```

### Step 5: Create Empty Database (MySQL Only)
```bash
# Option 1: Create via MySQL command
mysql -u root -p -e "CREATE DATABASE sohir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Option 2: Create via phpMyAdmin
# 1. Open phpMyAdmin
# 2. Click "New"
# 3. Enter database name: sohir_db
# 4. Charset: utf8mb4, Collation: utf8mb4_unicode_ci
# 5. Click Create

# Option 3: SQLite (no setup needed)
# Just set in .env: DB_CONNECTION=sqlite
# And create file: touch database/database.sqlite
```

### Step 6: Run Migrations
```bash
# Run all migrations
php artisan migrate

# OR with forced execution (if prompted)
php artisan migrate --force

# On Windows with existing database:
php artisan migrate --force --seed
```

### Step 7: Verify Success
```bash
# Check if tables were created
php artisan migrate:status

# Output should show:
# [√] 2025_09_11_001000_create_elearning_schema
# [√] 2025_11_13_000001_add_status_to_users_table
# [√] 2025_11_13_200902_create_exam_answers_table
# ... etc
```

### Step 8: Optional - Add Test Data (Seeding)
```bash
# If you have seeders
php artisan db:seed

# Or specific seeder
php artisan db:seed --class=UserSeeder
```

## Your Current Migrations Explained

Your project has these migrations in order:

1. **`2025_09_11_001000_create_elearning_schema.php`**
   - Creates: users, classes, courses, quizzes, exams, quiz_results, exam_results
   - This is your MAIN schema with all tables

2. **`2025_11_13_000001_add_status_to_users_table.php`**
   - Adds: status column to users table (for active/inactive)

3. **`2025_11_13_200900_update_exam_questions_for_multiple_choice.php`**
   - Updates: exam_questions table (changes schema)

4. **`2025_11_13_201132_revert_exam_questions_to_text_only.php`**
   - Reverts: exam_questions back to text-only format

5. **`2025_11_13_200902_create_exam_answers_table.php`**
   - Creates: exam_answers table (stores student answers)

6. **`2025_11_13_215000_make_exam_results_score_nullable.php`**
   - Updates: exam_results.score to allow NULL values

7. **`2025_11_13_161259_create_personal_access_tokens_table.php`**
   - Creates: personal_access_tokens table (for Sanctum auth)

## Important Notes

### ✅ Migrations Handle:
- Creating all tables
- Setting column types (VARCHAR, INT, TEXT, etc.)
- Adding indexes for performance
- Setting up foreign keys (relationships)
- Adding timestamps (created_at, updated_at)

### ❌ Migrations DO NOT Handle:
- Actual data (users, courses, etc.)
- Seeded test data
- Configuration values
- API keys or secrets

### For Data:
If you want to transfer existing data (users, courses, etc.):

**Option 1: Export Database**
```bash
# On old PC - export database
mysqldump -u root -p sohir_db > backup.sql

# On new PC - import database
mysql -u root -p sohir_db < backup.sql
# (Then you DON'T need to run migrations)
```

**Option 2: Use Seeders**
```bash
# Create seeder with sample data
php artisan make:seeder UserSeeder

# Then run: php artisan db:seed
```

## Troubleshooting

### Problem: "SQLSTATE[HY000]: General error: 3 Error writing file"
**Solution:** Database doesn't exist yet
```bash
mysql -u root -p -e "CREATE DATABASE sohir_db;"
php artisan migrate
```

### Problem: "migration not found" or "table already exists"
**Solution:** Database already has tables
```bash
# Option 1: Fresh start (DELETES all data!)
php artisan migrate:fresh

# Option 2: Reset and reseed
php artisan migrate:reset
php artisan migrate
php artisan db:seed
```

### Problem: "Could not find driver"
**Solution:** Missing PHP extension
```bash
# For MySQL: Install php-mysql
# Windows: Uncomment in php.ini: extension=pdo_mysql

# For SQLite: Install php-sqlite3
# Windows: Uncomment in php.ini: extension=pdo_sqlite
```

## Best Practices

### 1. Always Commit Migrations to Git
```bash
# Migrations should be in version control
git add database/migrations/
git commit -m "Add new migration"
git push
```

### 2. Never Modify Old Migrations
✅ **DO:**
```bash
# Create new migration to change schema
php artisan make:migration alter_users_table
```

❌ **DON'T:**
```bash
# Don't edit old migration files
# They may have already been applied on production
```

### 3. Test on Clean Database
```bash
# Before deploying, test complete setup:
php artisan migrate:fresh
php artisan db:seed
# Test application
```

## Complete New PC Setup (All Steps)

```bash
# 1. Get the code
git clone <your-repo>
cd school-portal

# 2. Install dependencies
composer install
npm install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Configure database in .env
# Edit .env with your database details

# 5. Create empty database
mysql -u root -p -e "CREATE DATABASE sohir_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 6. Run migrations
php artisan migrate

# 7. Run seeders (optional - for test data)
php artisan db:seed

# 8. Build frontend (if needed)
npm run build

# 9. Start servers
php artisan serve          # Backend (localhost:8000)
# In another terminal:
npm start                  # Frontend (localhost:4200)
```

## Verification Checklist

After running migrations, verify:

- [ ] No error messages
- [ ] Can see `php artisan migrate:status` shows all migrations
- [ ] Database exists with correct tables
- [ ] Foreign keys work (relationships)
- [ ] Can login to application
- [ ] Can create/view courses
- [ ] Can create/submit quizzes
- [ ] Can submit exams

## Summary

✅ **Migrations WILL create complete database structure**
✅ **Just need to run: `php artisan migrate`**
✅ **Works across any PC with PHP + MySQL**
✅ **Version controlled so always up-to-date**
✅ **Easy deployment process**

Your application is properly set up for deployment to any PC! 🚀

---

**Need more help?** Check:
- Laravel docs: https://laravel.com/docs/migrations
- Your current migrations in: `database/migrations/`
- Database config in: `.env` file
