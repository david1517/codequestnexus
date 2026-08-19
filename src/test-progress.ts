import { COURSES, getCourseBySlug } from './data/courses';
import { downloadLesson } from './utils/download';

console.log('Total de cursos:', COURSES.length);
const html = getCourseBySlug('html');
console.log('Curso HTML:', html?.name);
console.log('Lições:', html?.lessons.length);