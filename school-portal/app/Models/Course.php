<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class Course extends Model
{
    use SoftDeletes;
    protected $fillable = ['title', 'description', 'teacher_id', 'class_id', 'is_public'];

    public function teacher() {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    public function class() {
        return $this->belongsTo(ClassModel::class);
    }
    public function resources() {
        return $this->hasMany(CourseResource::class);
    }
    
    // Alias for compatibility
    public function supports() {
        return $this->resources();
    }
    
    public function quizzes() {
        return $this->hasMany(Quiz::class);
    }
    public function exams() {
        return $this->hasMany(Exam::class);
    }
}