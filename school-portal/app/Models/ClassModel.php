<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassModel extends Model
{
    use SoftDeletes;
    protected $table = 'classes';
    protected $fillable = ['name', 'description', 'teacher_id'];

    public function teacher() {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    public function students() {
        return $this->belongsToMany(User::class, 'class_student', 'class_id', 'student_id');
    }
    public function courses() {          // 1 class → many private courses
        return $this->hasMany(Course::class);
    }
    public function joinRequests() {
        return $this->hasMany(JoinRequest::class);
    }
}