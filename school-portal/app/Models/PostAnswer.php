<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostAnswer extends Model
{
    protected $fillable = ['post_id', 'teacher_id', 'content'];

    public function teacher() {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function post() {
        return $this->belongsTo(Post::class, 'post_id');
    }
}
