interface Props {
  grade?: string;
  name?: string;
  region?: string;
}

export async function postUser({grade, name, region}: Props) {
  const values = {
    ...(grade && {grade}),
    ...(name && {name}),
    ...(region && {region}),
  }

  const response = await fetch('https://api.studybox.kz/auth/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(values),
  });
}