<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class QuizResult extends Model
{
    protected $fillable = ['quiz_id', 'student_id', 'score'];

    public function quiz() {
        return $this->belongsTo(Quiz::class);
    }
    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
}