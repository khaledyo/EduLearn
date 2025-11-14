<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:191',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'role' => 'nullable|in:student,teacher',
        ]);

        $role = $request->input('role', 'student');
        
        // Teachers are pending until admin approval, students are active immediately
        $status = ($role === 'teacher') ? 'pending' : 'active';

        $user = User::create([
            'name'     => $request->input('name'),
            'email'    => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role'     => $role,
            'status'   => $status,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        $message = ($status === 'pending') 
            ? 'Compte créé avec succès. Votre compte est en attente d\'approbation par un administrateur.'
            : 'Compte créé avec succès.';

        return response()->json([
            'user' => $user, 
            'token' => $token,
            'message' => $message
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check if account is active
        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Votre compte est en attente d\'approbation par un administrateur.'
            ], 403);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }
}