<?php
namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\ClassModel;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function courses(Request $request)
    {
        $courses = Course::with('teacher','supports')
            ->where('is_public', true)
            ->whereNull('class_id')  // Only show courses that are not class-specific
            ->latest()
            ->get();
        
        // Transform to match frontend expectations
        return $courses->map(function($course) {
            $teacherName = $course->teacher->name ?? '';
            $nameParts = explode(' ', $teacherName, 2);
            $prenom = $nameParts[0] ?? '';
            $nom = $nameParts[1] ?? '';
            
            return [
                'id' => $course->id,
                'titre' => $course->title,
                'title' => $course->title,
                'description' => $course->description,
                'support' => $course->supports->pluck('path')->toArray(),
                'dateCreation' => $course->created_at,
                'created_at' => $course->created_at,
                'enseignantId' => $course->teacher_id,
                'teacher_id' => $course->teacher_id,
                'enseignantNom' => $nom,
                'enseignantPrenom' => $prenom,
                'duree' => null,
                'niveau' => null,
            ];
        });
    }

    public function show(Request $request, Course $course)
    {
        $course->load('teacher', 'supports', 'class');
        
        $teacherName = $course->teacher->name ?? '';
        $nameParts = explode(' ', $teacherName, 2);
        $prenom = $nameParts[0] ?? '';
        $nom = $nameParts[1] ?? '';
        
        return [
            'id' => $course->id,
            'titre' => $course->title,
            'title' => $course->title,
            'description' => $course->description,
            'support' => $course->supports->pluck('path')->toArray(),
            'dateCreation' => $course->created_at,
            'created_at' => $course->created_at,
            'enseignantId' => $course->teacher_id,
            'teacher_id' => $course->teacher_id,
            'enseignantNom' => $nom,
            'enseignantPrenom' => $prenom,
            'duree' => null,
            'niveau' => null,
            'class_id' => $course->class_id,
            'class_name' => $course->class->name ?? null,
        ];
    }
}