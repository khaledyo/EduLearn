<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ClassModel;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        return [
            'users'   => User::count(),
            'courses' => Course::count(),
            'classes' => ClassModel::count(),
        ];
    }
}