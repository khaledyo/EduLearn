<?php
// app/Models/Support.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Support extends Model
{
    protected $table   = 'supports';
    public $timestamps  = false;
    protected $fillable = ['coursId','supportUrl','fileName','fileType','fileSize'];
}