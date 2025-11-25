<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('classes', function (Blueprint $table) {
            if (!Schema::hasColumn('classes', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('courses', 'status')) {
                // default to 'approved' for existing records
                $table->string('status')->default('approved')->after('is_public');
            }
        });
    }

    public function down()
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('courses', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('classes', function (Blueprint $table) {
            if (Schema::hasColumn('classes', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
