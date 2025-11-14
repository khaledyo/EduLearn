<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAnswer extends Model
{
    protected $fillable = ['exam_result_id', 'question_id', 'answer'];

    public function examResult() {
        return $this->belongsTo(ExamResult::class);
    }

    public function question() {
        return $this->belongsTo(ExamQuestion::class, 'question_id');
    }
}

