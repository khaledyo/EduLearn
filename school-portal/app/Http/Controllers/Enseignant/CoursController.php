<?php
namespace App\Http\Controllers\Enseignant;

use App\Http\Controllers\Controller;
use App\Models\Cours;
use App\Models\Support;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CoursController extends Controller
{
    /* helper: same shape as your Node getCoursWithSupports */
    private function coursWithSupports($id)
    {
        $row = DB::table('courses as c')
            ->leftJoin('course_resources as s', 'c.id', '=', 's.course_id')
            ->leftJoin('users as u', 'c.teacher_id', '=', 'u.id')
            ->leftJoin('classes as cl', 'c.class_id', '=', 'cl.id')
            ->select('c.*', 'u.name as teacher_name', 'cl.name as class_name', 'cl.id as class_id', DB::raw("GROUP_CONCAT(s.path) as supports"))
            ->where('c.id', $id)
            ->groupBy('c.id', 'c.title', 'c.description', 'c.teacher_id', 'c.class_id', 'c.is_public', 'c.created_at', 'c.updated_at', 'u.name', 'cl.name', 'cl.id')
            ->first();

        if (!$row) return null;

        // Get teacher name parts
        $teacherName = $row->teacher_name ?? '';
        $nameParts = explode(' ', $teacherName, 2);
        $prenom = $nameParts[0] ?? '';
        $nom = $nameParts[1] ?? '';

        return [
            'id'              => $row->id,
            'titre'           => $row->title ?? '',
            'description'     => $row->description ?? '',
            'support'         => $row->supports ? explode(',', $row->supports) : [],
            'dateCreation'    => $row->created_at ?? now(),
            'enseignantId'    => $row->teacher_id ?? 0,
            'enseignantNom'   => $nom,
            'enseignantPrenom'=> $prenom,
            'duree'           => null, // Not in courses table
            'niveau'          => null, // Not in courses table
            'class_id'        => $row->class_id,
            'class_name'      => $row->class_name,
        ];
    }

    /* CREATE ➜ POST /enseignant/cours */
    public function store(Request $request)
    {
        $request->validate([
            'titre'       => 'required|string|max:191',
            'description' => 'required|string',
            'duree'       => 'nullable|integer|min:1',
            'niveau'      => 'nullable|string|max:191',
            'class_id'    => 'nullable|integer|exists:classes,id',  // For class-specific courses
            'files.*'     => 'nullable|file|max:10240',  // Max 10MB per file
        ]);

        $user = $request->user();
        abort_unless(in_array($user->role, ['teacher','admin']), 403);

        $classId = $request->input('class_id');
        
        // If class_id is provided, verify the teacher owns the class
        if ($classId) {
            $class = DB::table('classes')->where('id', $classId)->first();
            abort_unless($class && $class->teacher_id === $user->id, 403, 'You do not own this class');
        }

        // Create course in courses table. If a teacher creates it, mark as 'pending' for admin approval.
        $status = $user->role === 'admin' ? 'approved' : 'pending';
        $courseId = DB::table('courses')->insertGetId([
            'title'       => $request->input('titre'),
            'description' => $request->input('description'),
            'teacher_id' => $user->id,
            'class_id'   => $classId,  // null for public courses, class_id for private class courses
            'is_public'  => $classId ? false : true,  // Class courses are not public
            'status'     => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /* Handle file uploads */
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            $data = [];
            
            // Get the base URL from the request, explicitly including port
            $scheme = $request->getScheme(); // 'http' or 'https'
            $host = $request->getHttpHost(); // 'localhost:8000' or 'localhost'
            
            // If host is just 'localhost' without port, add :8000
            if ($host === 'localhost') {
                $host = 'localhost:8000';
            }
            
            $baseUrl = $scheme . '://' . $host;
            
            foreach ($files as $file) {
                // Store file in public storage
                $path = $file->store('course-resources', 'public');
                
                // Get public URL using request base URL to include port
                $url = $baseUrl . '/storage/' . $path;
                
                $data[] = [
                    'course_id' => $courseId,
                    'type'      => 'file',
                    'path'      => $url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($data)) {
                DB::table('course_resources')->insert($data);
            }
        }

        return response()->json($this->coursWithSupports($courseId), 201);
    }

    /* READ all ➜ GET /enseignant/cours */
    public function index(Request $request)
    {
        $rows = DB::table('courses as c')
            ->leftJoin('course_resources as s', 'c.id', '=', 's.course_id')
            ->leftJoin('users as u', 'c.teacher_id', '=', 'u.id')
            ->select('c.*', 'u.name as teacher_name', DB::raw("GROUP_CONCAT(s.path) as supports"))
            ->where('c.status', 'approved')
            ->groupBy('c.id', 'c.title', 'c.description', 'c.teacher_id', 'c.class_id', 'c.is_public', 'c.status', 'c.created_at', 'c.updated_at', 'u.name')
            ->orderByDesc('c.created_at')
            ->get();

        return $rows->map(function($row) {
            $teacherName = $row->teacher_name ?? '';
            $nameParts = explode(' ', $teacherName, 2);
            $prenom = $nameParts[0] ?? '';
            $nom = $nameParts[1] ?? '';

            return [
                'id'              => $row->id,
                'titre'           => $row->title ?? '',
                'description'     => $row->description ?? '',
                'support'         => $row->supports ? explode(',', $row->supports) : [],
                'dateCreation'    => $row->created_at ?? now(),
                'enseignantId'    => $row->teacher_id ?? 0,
                'enseignantNom'   => $nom,
                'enseignantPrenom'=> $prenom,
                'duree'           => null,
                'niveau'          => null,
            ];
        });
    }

    /* READ by teacher ➜ GET /enseignant/cours/enseignant/{id} */
    public function byTeacher(Request $request, $enseignantId)
    {
        $rows = DB::table('courses as c')
            ->leftJoin('course_resources as s', 'c.id', '=', 's.course_id')
            ->leftJoin('users as u', 'c.teacher_id', '=', 'u.id')
            ->select('c.*', 'u.name as teacher_name', DB::raw("GROUP_CONCAT(s.path) as supports"))
            ->where('c.teacher_id', $enseignantId)
            ->where('c.status', 'approved')
            ->groupBy('c.id', 'c.title', 'c.description', 'c.teacher_id', 'c.class_id', 'c.is_public', 'c.created_at', 'c.updated_at', 'u.name')
            ->orderByDesc('c.created_at')
            ->get();

        return $rows->map(function($row) {
            $teacherName = $row->teacher_name ?? '';
            $nameParts = explode(' ', $teacherName, 2);
            $prenom = $nameParts[0] ?? '';
            $nom = $nameParts[1] ?? '';

            return [
                'id'              => $row->id,
                'titre'           => $row->title ?? '',
                'description'     => $row->description ?? '',
                'support'         => $row->supports ? explode(',', $row->supports) : [],
                'dateCreation'    => $row->created_at ?? now(),
                'enseignantId'    => $row->teacher_id ?? 0,
                'enseignantNom'   => $nom,
                'enseignantPrenom'=> $prenom,
                'duree'           => null,
                'niveau'          => null,
            ];
        });
    }

    /* READ one ➜ GET /enseignant/cours/{id} */
    public function show(Request $request, $id)
    {
        $cours = $this->coursWithSupports($id);
        abort_if(!$cours, 404, 'Cours non trouvé');
        return $cours;
    }

    /* UPDATE ➜ PUT /enseignant/cours/{id} */
    public function update(Request $request, $id)
    {
        $request->validate([
            'titre'       => 'sometimes|required|string|max:191',
            'description' => 'sometimes|required|string',
            'support'     => 'nullable|string',
            'duree'       => 'sometimes|integer|min:1',
            'niveau'      => 'sometimes|string|max:191'
        ]);

        $user = $request->user();
        $course = DB::table('courses')->where('id', $id)->first();
        
        abort_if(!$course, 404, 'Cours non trouvé');
        abort_if($course->teacher_id !== $user->id && $user->role !== 'admin', 403);

        $updateData = [];
        if ($request->has('titre')) {
            $updateData['title'] = $request->input('titre');
        }
        if ($request->has('description')) {
            $updateData['description'] = $request->input('description');
        }
        $updateData['updated_at'] = now();

        DB::table('courses')->where('id', $id)->update($updateData);

        /* supports replacement */
        DB::table('course_resources')->where('course_id', $id)->delete();
        if ($request->filled('support')) {
            $urls = array_filter(array_map('trim', explode(',', $request->input('support'))));
            $data = array_map(fn($url) => [
                'course_id' => $id,
                'type'      => 'url',
                'path'      => $url,
                'created_at' => now(),
                'updated_at' => now(),
            ], $urls);
            DB::table('course_resources')->insert($data);
        }

        return $this->coursWithSupports($id);
    }

    /* ADD SUPPORTS ➜ POST /enseignant/cours/{id}/supports */
    public function addSupports(Request $request, $id)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240', // Max 10MB per file
        ]);

        $user = $request->user();
        $course = DB::table('courses')->where('id', $id)->first();
        
        abort_if(!$course, 404, 'Cours non trouvé');
        abort_if($course->teacher_id !== $user->id && $user->role !== 'admin', 403);

        /* Handle file uploads */
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            $data = [];
            
            // Get the base URL from the request, explicitly including port
            $scheme = $request->getScheme(); // 'http' or 'https'
            $host = $request->getHttpHost(); // 'localhost:8000' or 'localhost'
            
            // If host is just 'localhost' without port, add :8000
            if ($host === 'localhost') {
                $host = 'localhost:8000';
            }
            
            $baseUrl = $scheme . '://' . $host;
            
            foreach ($files as $file) {
                // Store file in public storage
                $path = $file->store('course-resources', 'public');
                
                // Get public URL using request base URL to include port
                $url = $baseUrl . '/storage/' . $path;
                
                $data[] = [
                    'course_id' => $id,
                    'type'      => 'file',
                    'path'      => $url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($data)) {
                DB::table('course_resources')->insert($data);
            }
        }

        return $this->coursWithSupports($id);
    }

    /* DELETE ➜ DELETE /enseignant/cours/{id} */
    public function destroy(Request $request, $id)
    {
        $user  = $request->user();
        $course = DB::table('courses')->where('id', $id)->first();

        abort_if(!$course, 404, 'Cours non trouvé');
        abort_if($course->teacher_id !== $user->id && $user->role !== 'admin', 403);

        DB::table('course_resources')->where('course_id', $id)->delete();
        DB::table('courses')->where('id', $id)->delete();

        return response()->json(['message' => 'Cours supprimé avec succès']);
    }

    /* SEARCH ➜ GET /enseignant/cours/recherche?search=foo&enseignantId=2 */
    public function search(Request $request)
    {
        $request->validate([
            'search'       => 'required|string|max:191',
            'enseignantId' => 'nullable|integer|exists:users,id'
        ]);

        $search = "%{$request->input('search')}%";

        $qb = DB::table('courses as c')
            ->leftJoin('course_resources as s', 'c.id', '=', 's.course_id')
            ->leftJoin('users as u', 'c.teacher_id', '=', 'u.id')
            ->select('c.*', 'u.name as teacher_name', DB::raw("GROUP_CONCAT(s.path) as supports"))
            ->where(function ($q) use ($search) {
                $q->where('c.title', 'like', $search)
                  ->orWhere('c.description', 'like', $search);
            })
            ->where('c.status', 'approved')
            ->groupBy('c.id', 'c.title', 'c.description', 'c.teacher_id', 'c.class_id', 'c.is_public', 'c.created_at', 'c.updated_at', 'u.name')
            ->orderByDesc('c.created_at');

        if ($request->filled('enseignantId')) {
            $qb->where('c.teacher_id', $request->input('enseignantId'));
        }

        $rows = $qb->get();

        return $rows->map(function($row) {
            $teacherName = $row->teacher_name ?? '';
            $nameParts = explode(' ', $teacherName, 2);
            $prenom = $nameParts[0] ?? '';
            $nom = $nameParts[1] ?? '';

            return [
                'id'              => $row->id,
                'titre'           => $row->title ?? '',
                'description'     => $row->description ?? '',
                'support'         => $row->supports ? explode(',', $row->supports) : [],
                'dateCreation'    => $row->created_at ?? now(),
                'enseignantId'    => $row->teacher_id ?? 0,
                'enseignantNom'   => $nom,
                'enseignantPrenom'=> $prenom,
                'duree'           => null,
                'niveau'          => null,
            ];
        });
    }
}