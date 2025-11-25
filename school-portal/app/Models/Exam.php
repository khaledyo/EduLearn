<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class Exam extends Model
{
    protected $fillable = ['title', 'course_id'];

    public function course() {
        return $this->belongsTo(Course::class);
    }
    public function questions() {
        return $this->hasMany(ExamQuestion::class);
    }
    public function results() {
        return $this->hasMany(ExamResult::class);
    }
}