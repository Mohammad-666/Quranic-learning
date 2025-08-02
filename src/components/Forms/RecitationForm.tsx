import React, { useState, useEffect } from 'react';
import { Recitation, Course, Lesson, Student } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { MultiSelect } from '../UI/MultiSelect';

interface RecitationFormProps {
  initialData?: Recitation | null;
  onSave: (data: Recitation) => void;
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const RecitationForm: React.FC<RecitationFormProps> = ({
  initialData,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<Recitation>({
    student_id: 0,
    course_id: 0,
    lesson_id: 0,
    recitation_per_page: [],
    recitation_evaluation: '',
    current_juz: 1,
    current_juz_page: 1,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchData();
  }, [initialData]);

  const fetchData = async () => {
    try {
      const [coursesResponse, lessonsResponse, studentsResponse] = await Promise.all([
        apiService.getAll('courses'),
        apiService.getAll('lessons'),
        apiService.getAll('students'),
      ]);
      setCourses(coursesResponse.data || []);
      setLessons(lessonsResponse.data || []);
      setStudents(studentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleChange = (field: keyof Recitation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map((course) => ({
    value: course.id!,
    label: course.title,
  }));

  const lessonOptions = lessons.map((lesson) => ({
    value: lesson.id!,
    label: lesson.lesson_title,
  }));

  const studentOptions = students.map((student) => ({
    value: student.id!,
    label: student.name,
  }));

  const evaluationOptions = [
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
  ];

  const recitationPageOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Page ${i + 1}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Course"
          value={formData.course_id}
          onChange={(e) => handleChange('course_id', parseInt(e.target.value))}
          options={courseOptions}
          error={validationErrors.course_id?.[0]}
          required
        />

        <Select
          label="Lesson"
          value={formData.lesson_id}
          onChange={(e) => handleChange('lesson_id', parseInt(e.target.value))}
          options={lessonOptions}
          error={validationErrors.lesson_id?.[0]}
          required
        />

        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => handleChange('student_id', parseInt(e.target.value))}
          options={studentOptions}
          error={validationErrors.student_id?.[0]}
          required
        />

        <Select
          label="Evaluation"
          value={formData.recitation_evaluation}
          onChange={(e) => handleChange('recitation_evaluation', e.target.value)}
          options={evaluationOptions}
          error={validationErrors.recitation_evaluation?.[0]}
          required
        />

        <Input
          label="Current Juz"
          type="number"
          min="1"
          max="30"
          value={formData.current_juz}
          onChange={(e) => handleChange('current_juz', parseInt(e.target.value))}
          error={validationErrors.current_juz?.[0]}
          required
        />

        <Input
          label="Current Juz Page"
          type="number"
          min="1"
          max="20"
          value={formData.current_juz_page}
          onChange={(e) => handleChange('current_juz_page', parseInt(e.target.value))}
          error={validationErrors.current_juz_page?.[0]}
          required
        />
      </div>

      {/* ✅ MultiSelect for recitation pages */}
      <MultiSelect
        label="Recitation Per Page"
        options={recitationPageOptions}
        value={formData.recitation_per_page.map((p) => p.toString())}
        onChange={(selected) => {
          const pages = selected.map((p) => parseInt(p));
          handleChange('recitation_per_page', pages);
        }}
        error={validationErrors.recitation_per_page?.[0]}
      />

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Recitation' : 'Create Recitation'}
        </Button>
      </div>
    </form>
  );
};
