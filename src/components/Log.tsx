'use client';

interface Props {
  title?: string;
  data: any;
}

export const Log = ({ data, title = 'Лог' }: Props) => {
  return (
    <>
      {console.group(title)}
      {console.log(data)}
      {console.groupEnd()}
    </>
  );
};
