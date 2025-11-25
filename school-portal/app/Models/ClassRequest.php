<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassRequest extends Model
{
    protected $fillable = ['teacher_id', 'name', 'description', 'status'];

    public function teacher() {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
