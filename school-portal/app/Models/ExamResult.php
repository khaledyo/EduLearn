<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class ExamResult extends Model
{
    protected $fillable = ['exam_id', 'student_id', 'score'];

    public function exam() {
        return $this->belongsTo(Exam::class);
    }
    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
    public function answers() {
        return $this->hasMany(ExamAnswer::class);
    }
}