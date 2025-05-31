export const POST_practice_writing_id = async (id: string, answer: string) => {
  const res = await fetch(`https://api.studybox.kz/practice/writing/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ answer }),
  });

  const data = await res.json();

  return data;
};
