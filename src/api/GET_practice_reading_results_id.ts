export const GET_practice_reading_results_id = async (id: string) => {
  const res = await fetch(`https://api.studybox.kz/practice/reading/passed/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};
