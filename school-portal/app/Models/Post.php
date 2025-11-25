<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['course_id', 'student_id', 'content'];

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function answers() {
        return $this->hasMany(PostAnswer::class, 'post_id');
    }
}
