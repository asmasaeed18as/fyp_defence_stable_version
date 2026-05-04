const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
const instructor = Buffer.from(JSON.stringify({ user_id: 1, email: 'instructor@example.com', role: 'instructor', first_name: 'Jane', last_name: 'Doe' })).toString('base64url');
const student = Buffer.from(JSON.stringify({ user_id: 2, email: 'student@example.com', role: 'student', first_name: 'Sam', last_name: 'Learner' })).toString('base64url');
console.log('instructor', `${header}.${instructor}.`);
console.log('student', `${header}.${student}.`);
