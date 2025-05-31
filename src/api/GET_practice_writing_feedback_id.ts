export const GET_practice_writing_feedback_id = async (id: string) => {
  const res = await fetch(`https://api.studybox.kz/practice/writing/passed/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
