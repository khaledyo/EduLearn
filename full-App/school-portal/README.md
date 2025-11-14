# School-Portal API – SUPER-DETAILED FIELD GUIDE
# Save as README_API.txt
# BASE URL: http://your-domain.test/api
# Auth: Bearer <token>  (Laravel Sanctum)

=============================================================================
0.  GLOBAL RULES
=============================================================================
- Content-Type: application/json  (unless stated)
- All timestamps: "YYYY-MM-DD HH:mm:ss"  (MySQL format)
- Roles: student | teacher | admin
- Token life: until user logs out or token is deleted
- Errors 422 return:
  { "message":"The given data was invalid.", "errors":{ "fieldName":["error text"] } }

=============================================================================
1.  NO-TOKEN ENDPOINTS
=============================================================================

--------  POST /register  (creates student account)  ------------------------
Body:
{
  "name" : "Ali Khelifa",               # string | required | max 191
  "email": "ali@example.com",           # email| required | unique in users
  "password": "123456",                 # string | required | min 6
  "password_confirmation": "123456"     # string | required | must match above
}
Success 201:
{
  "user": {
     "id": 12,
     "name": "Ali Khelifa",
     "email": "ali@example.com",
     "role": "student"
  },
  "token": "2|laravel_sanctum_xxxxxxxxxxxxxx"
}
Failures:
422 -> email already taken / password too short / fields missing

--------  POST /login  ----------------------------------------
Body:
{
  "email": "ali@example.com",
  "password": "123456"
}
Success 200: same shape as register
Failure 401: { "message": "Invalid credentials" }

--------  GET /public-courses  --------------------------------
Description: list all courses where is_public = 1
Query params: none
Success 200: array
Each element:
  id                integer
  titre             string
  description       string
  support           array of strings (URLs)  ["http://..pdf","http://..mp4"]
  enseignantId      integer
  enseignantNom     string
  enseignantPrenom  string
  duree             integer  (minutes)
  niveau            string   ("Débutant","Intermédiaire","Avancé","Tous niveaux")
  dateCreation      string   (MySQL datetime)
Empty array -> 200 []  if none

--------  GET /public-courses/{id}  ----------------------------
{id} = course id (integer)
Success 200: single object (same keys as above)
Failure 404: { "message": "Not found" }  (if private or does not exist)

=============================================================================
2.  STUDENT ROUTES  (header: Authorization: Bearer <token>  + role student)
=============================================================================

--------  GET /student/profile  -------------------------------
Description: returns YOUR user row
Success 200:
{
  "id":12,
  "name":"Ali Khelifa",
  "email":"ali@example.com",
  "role":"student",
  "created_at":"2025-06-20T14:22:13.000000Z",
  "updated_at":"2025-06-20T14:22:13.000000Z"
}

--------  PUT /student/profile  --------------------------------
Body (only what you want to change):
{ "name":"Ali K." }   # required | string | max 191
Success 200: updated user object
Failure 422: name missing / too long

--------  POST /student/join-request/{class}  ------------------
{class} = class id in URL  (integer)
Body: none
Logic:
  - Creates pending request
  - One row per student per class (duplicate → 422)
Success 201:
{
  "id":7,
  "class_id":5,
  "student_id":12,
  "status":"pending",
  "created_at":"2025-06-20T14:25:00.000000Z",
  "updated_at":"2025-06-20T14:25:00.000000Z"
}
Failures:
403 → class does not exist
422 → request already sent

--------  GET /student/my-requests  ---------------------------
Description: all YOUR requests (any status) with class object
Success 200: array
[
  {
    "id":7,
    "status":"pending",
    "class": { "id":5, "name":"Web Dev A", ... },
    "created_at":"..."
  }
]

--------  POST /student/quiz/{quiz}/attempt  -----------------
{quiz} = quiz id  (integer)
Body:
{
  "answers": {          // required | object | questionId -> chosen option
    "1":"a",
    "2":"c",
    "3":"b"
  }
}
Grading: automatic vs correct_option (case-insensitive)
Student must be enrolled if course is private → checked internally
Success 200:
{
  "score": 3,      // integer  (how many correct)
  "total": 5       // integer  (total questions)
}
Failures:
403 → not enrolled on private course
422 → answers missing / empty

--------  POST /student/exam/{exam}/attempt  ------------------
Same flow but answers are free text:
{
  "answers": {
    "10":"blue sky",
    "11":"model view controller"
  }
}
Grading: exact match (case-insensitive)
Returns: { "score":8, "total":10 }

--------  GET /student/my-grades  ----------------------------
Description: all your quiz & exam results with relations
Success 200:
{
  "quizzes": [
    {
      "id":4,
      "score":3,
      "total":5,
      "created_at":"2025-06-20T15:00:00.000000Z",
      "quiz": { "id":1, "title":"Quiz 1", "course":{...} }
    }
  ],
  "exams": [ ...same shape... ]
}

=============================================================================
3.  TEACHER ROUTES  (token + role teacher OR admin)
=============================================================================

--------  GET /teacher/join-requests  ------------------------
Description: pending requests for classes YOU own
Success 200: array
Each item:
  id, status, created_at,
  student : { id, name, email },
  class   : { id, name, description }

--------  POST /teacher/join-requests/{request}/accept  -------
{request} = join_request id (integer)
Body: none
Logic: status -> 'accepted' + attaches student to class
Success 200: { "message":"Student accepted" }
Failure 403 → request not linked to your class

--------  POST /teacher/join-requests/{request}/reject  -------
Same URL, status -> 'rejected', no enrolment change
Returns: { "message":"Student rejected" }

--------  GET /teacher/my-classes  ----------------------------
Description: classes you created + students count
Success 200: array
[
  {
    "id":5,
    "name":"Web Dev A",
    "description":"...",
    "students_count": 28,
    "created_at":"..."
  }
]

--------  GET /teacher/class/{class}/students  ---------------
{class} = class id
Returns: array of enrolled users (id, name, email)
Failure 403 → not your class

--------  DELETE /teacher/class/{class}/student/{student}  ----
Removes student from class & deletes his join-request
Returns: { "message":"Student removed" }
Failure 403 → not your class

=============================================================================
4.  QUIZ / EXAM CRUD  (teacher only)
=============================================================================
Base paths:
  /teacher/quiz          -> QuizController
  /teacher/question/quiz -> QuizQuestionController
  /teacher/exam          -> ExamController
  /teacher/question/exam -> ExamQuestionController

--------  Quiz resource  --------------------------------------
GET    /teacher/quiz
Description: list quizzes that belong to courses YOU teach
Success 200: array of quiz objects (with course relation)

POST   /teacher/quiz
Body:
{
  "title": "Final Quiz",      // required | string | max 191
  "course_id": 3              // required | integer | must be your course
}
Success 201: created quiz object
Failure 403 → course not yours | 422 → validation errors

GET    /teacher/quiz/{quiz}
Returns: quiz object + questions array
Failure 404 → not found | 403 → not your quiz

PUT    /teacher/quiz/{quiz}
Body: { "title": "New title" }   // required
Returns: updated quiz
Failure 403 → not your quiz

DELETE /teacher/quiz/{quiz}
Returns: 204 No Content
Failure 403 → not your quiz

--------  Quiz Question resource  -----------------------------
GET    /teacher/question/quiz/{quiz}
Returns: array of questions for that quiz
Failure 403 → not your quiz

POST   /teacher/question/quiz/{quiz}
Body:
{
  "question": "What is Laravel?",   // required | string
  "option_a": "Framework",          // required | string
  "option_b": "Language",           // required | string
  "option_c": "Library",            // required | string
  "option_d": "Operating System",   // required | string
  "correct_option": "a"             // required | in:a,b,c,d
}
Success 201: created question object
Failure 422 → missing field / wrong correct_option

PUT    /teacher/question/quiz/{quiz}/{question}
Same body rules → full update
Returns: updated question

DELETE /teacher/question/quiz/{quiz}/{question}
Returns: 204 No Content
Failure 403 → question not in your quiz

--------  Exam resource  (identical URLs, replace "quiz" with "exam") --------
Same 5 routes, only differences:
- Model = Exam
- POST/PUT body for **exam question**:
  {
    "question": "Define MVC",           // required | string
    "correct_answer": "Model View Controller"  // required | string
  }
Correct answer is free text (case-insensitive match when student attempts).

--------  Results  -------------------------------------------
GET /teacher/quiz/{quiz}/results  
GET /teacher/exam/{exam}/results  
Returns: array of result objects each with:
  id, score, total, created_at, student { id, name, email }

=============================================================================
5.  ENSEIGNANT/COURS  (original teacher course CRUD)
=============================================================================
Routes already documented earlier – kept unchanged.
Quick reminder:

POST   /enseignant/cours  
GET    /enseignant/cours  
GET    /enseignant/cours/recherche?search=foo&enseignantId=2  
GET    /enseignant/cours/enseignant/{id}  
GET    /enseignant/cours/{id}  
PUT    /enseignant/cours/{id}  
DELETE /enseignant/cours/{id}  

Body & response shapes identical to previous file – no change.

=============================================================================
6.  ADMIN ENDPOINTS  (role = admin)
=============================================================================

BASE /admin/users  (full resource)

GET /admin/users  
Returns: array of all users (id, name, email, role, timestamps)

POST /admin/users  
Body:
{
  "name": "Mr Admin",           // required | string | max 191
  "email": "admin2@site.com",   // required | unique email
  "password": "secret",         // required | min 6
  "role": "admin"               // required | in:admin,teacher,student
}
Success 201 → created user object (with id)

GET /admin/users/{user}  
PUT /admin/users/{user}  
Body for update (only send what you change):
{
  "name": "Updated Name",       // optional
  "email": "new@mail.com",      // optional | unique
  "role": "teacher"             // optional | in:admin,teacher,student
}
Returns: updated user object

DELETE /admin/users/{user}  
Returns: 204 No Content

GET /admin/stats  
Returns:
{
  "users": 42,
  "courses": 18,
  "classes": 7
}

=============================================================================
7.  COMMON STATUS CODES
============================================================================
200 OK  
201 Created  
204 No Content  
401 Unauthorized → token missing / invalid  
403 Forbidden → wrong role  
404 Not Found → id not found  
422 Unprocessable Entity → validation failed (details in "errors")  
500 Internal Server Error

=============================================================================
8.  QUICK CURL TESTS
============================================================================
# 1. register student
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam","email":"sam@a.com","password":"123456","password_confirmation":"123456"}'

# 2. login (save token)
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sam@a.com","password":"123456"}' | jq -r .token)

# 3. browse public courses
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/public-courses

# 4. student attempt quiz
curl -X POST http://localhost:8000/api/student/quiz/1/attempt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":{"1":"a","2":"c"}}'

# 5. teacher create quiz
curl -X POST http://localhost:8000/api/teacher/quiz \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Final Quiz","course_id":3}'

# 6. admin create user
curl -X POST http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"NewTeacher","email":"t@x.com","password":"secret","role":"teacher"}'