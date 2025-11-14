<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class QuizQuestion extends Model
{
    protected $fillable = ['quiz_id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option'];

    public function quiz() {
        return $this->belongsTo(Quiz::class);
    }
}