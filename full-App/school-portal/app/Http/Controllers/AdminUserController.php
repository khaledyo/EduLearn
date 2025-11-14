<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        return User::latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:191',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role'  => ['required', Rule::in(['admin','teacher','student'])],
        ]);
        return User::create([
            'name'  => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role'  => $request->input('role'),
        ]);
    }

    public function show(Request $request, User $user)
    {
        return $user;
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'sometimes|required|string|max:191',
            'email' => 'sometimes|required|email|unique:users,'.$user->id,
            'role'  => ['sometimes','required', Rule::in(['admin','teacher','student'])],
        ]);
        $user->update($request->only(['name','email','role']));
        return $user;
    }

    public function destroy(Request $request, User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}