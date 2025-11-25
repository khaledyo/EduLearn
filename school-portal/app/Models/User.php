<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;
    protected $fillable = ['name', 'email', 'password', 'role', 'status'];
    protected $hidden   = ['password', 'remember_token'];
    protected $casts    = ['email_verified_at' => 'datetime'];

    /* ---------- helpers ---------- */
    public function isAdmin(): bool   { return $this->role === 'admin'; }
    public function isTeacher(): bool { return $this->role === 'teacher'; }
    public function isStudent(): bool { return $this->role === 'student'; }

    /* ---------- relationships ---------- */
    public function classesAsTeacher() {   // 1 teacher → many classes
        return $this->hasMany(ClassModel::class, 'teacher_id');
    }
    public function classesAsStudent() {   // many-to-many
        return $this->belongsToMany(ClassModel::class, 'class_student', 'student_id', 'class_id');
    }
    public function joinRequests() {       // 1 student → many requests
        return $this->hasMany(JoinRequest::class, 'student_id');
    }
    public function courses() {            // 1 teacher → many courses
        return $this->hasMany(Course::class, 'teacher_id');
    }
    public function quizResults() {        // many results
        return $this->hasMany(QuizResult::class, 'student_id');
    }
    public function examResults() {
        return $this->hasMany(ExamResult::class, 'student_id');
    }
}