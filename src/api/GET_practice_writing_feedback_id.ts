export const GET_practice_writing_feedback_id = async (id: string) => {
  const res = await fetch(`https://api.studybox.kz/practice/writing/passed/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (res.status === 404) {
    const error = new Error('Not Found');
    // @ts-expect-error добавляем статус внутрь объекта ошибки
    error.status = 404;
    throw error;
  }

  if (!res.ok) {
    throw new Error(`Backend responded with status ${res.status}`);
  }

  return res.json();
};
