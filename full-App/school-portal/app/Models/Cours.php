<?php
// app/Models/Cours.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cours extends Model
{
    protected $table = 'cours';          // your table name
    protected $fillable = [
        'titre','description','enseignantId','duree','niveau','dateCreation'
    ];
    public $timestamps = false;          // you used dateCreation instead

    public function supports(): HasMany
    {
        return $this->hasMany(Support::class, 'coursId');
    }
    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enseignantId');
    }
}