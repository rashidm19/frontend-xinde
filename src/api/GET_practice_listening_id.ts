export const GET_practice_listening_id = async (id: string) => {
  const res = await fetch(`https://api.studybox.kz/practice/listening/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
