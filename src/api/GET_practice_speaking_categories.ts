export const GET_practice_speaking_categories = async () => {
  const res = await fetch(`https://api.studybox.kz/practice/speaking/categories`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
