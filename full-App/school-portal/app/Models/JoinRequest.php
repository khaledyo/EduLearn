<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;   // ← REQUIRED
use Illuminate\Database\Eloquent\Relations\BelongsTo;   // optional but nice for type-hints
use Illuminate\Database\Eloquent\Relations\HasMany;
class JoinRequest extends Model
{
    protected $fillable = ['class_id', 'student_id', 'status'];

    public function class() {
        return $this->belongsTo(ClassModel::class);
    }
    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }
}