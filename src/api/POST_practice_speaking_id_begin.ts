export const POST_practice_speaking_id_begin = async () => {
  const id = localStorage.getItem('practiceSpeakingId') as string;
  const part = localStorage.getItem('practiceSpeakingPart') as string;

  const res = await fetch(`https://api.studybox.kz/practice/speaking/${id}?part=${part}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await res.json();

  if (data.id) {
    localStorage.setItem('practiceSpeakingIdStarted', data.id);
  }

  return data;
};
