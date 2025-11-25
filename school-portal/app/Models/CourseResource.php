<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class CourseResource extends Model
{
    protected $fillable = ['course_id', 'type', 'path'];

    public function course() {
        return $this->belongsTo(Course::class);
    }
}