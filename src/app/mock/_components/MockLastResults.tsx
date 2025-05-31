'use client';

import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

import { ScrollArea } from '../../../components/ui/scroll-area';

interface MockLastResults {
  id: number | undefined;
  score: number | undefined;
  type: string;
  reading: number | undefined;
  listening: number | undefined;
  speaking: number | undefined;
  writing: number | undefined;
  date: string;
  time: string;
  feedback: string | undefined;
}

// * Table columns
const columns: ColumnDef<MockLastResults>[] = [
  {
    id: 'score',
    accessorKey: 'score',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Score
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div className='w-[74rem]'>
        <div
          lang='ru'
          className={`${row.original.score && row.original.score > 7 ? 'bg-d-green-secondary' : 'bg-d-light-gray'} flex h-[50rem] w-[50rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
        >
          {row.original.score ? row.original.score : '-'}
        </div>
      </div>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Type
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[90rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.type}
      </div>
    ),
  },
  {
    id: 'reading',
    accessorKey: 'reading',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Reading
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[120rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.reading}
      </div>
    ),
  },
  {
    id: 'listening',
    accessorKey: 'listening',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Listening
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[70rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.listening ? row.original.listening : '-'}
      </div>
    ),
  },
  {
    id: 'speaking',
    accessorKey: 'speaking',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Speaking
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[110rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.speaking ? row.original.speaking : '-'}
      </div>
    ),
  },
  {
    id: 'writing',
    accessorKey: 'writing',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Writing
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[80rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.writing ? row.original.writing : '-'}
      </div>
    ),
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[96rem] flex-col items-center justify-center hyphens-auto rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.date}
      </div>
    ),
  },
  {
    id: 'time',
    accessorKey: 'time',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[106rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Time
        <img src='/images/icon_up-down-sorting.svg' className='size-[16rem]' alt='Sort' />
      </button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`flex h-[50rem] w-[94rem] flex-col items-center justify-center rounded-[8rem] text-center text-[14rem] font-medium leading-[26rem] text-d-black`}
      >
        {row.original.time}
      </div>
    ),
  },
  {
    id: 'feedback',
    accessorKey: 'feedback',
    header: ({ column }) => (
      <button
        className='flex h-[60rem] w-[90rem] flex-row items-center gap-x-[4rem] rounded-[12rem] border border-transparent py-[24rem] pr-[10rem] text-[14rem] leading-[26rem] tracking-[-0.2rem] text-d-black/80'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      ></button>
    ),
    cell: ({ row }) => (
      <div
        lang='ru'
        className={`line-clamp-2 flex h-[50rem] w-[90rem] flex-col items-center justify-center rounded-[8rem] text-center text-[14rem] font-medium leading-[20rem] text-d-black`}
      >
        {row.original.feedback ? row.original.feedback : '-'}
      </div>
    ),
  },
];

// * Table strucutre
function DataTable({ data }: { data: MockLastResults[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className='w-full max-w-full overflow-scroll desktop:overflow-hidden'>
      <Table className='relative z-[90] flex w-full max-w-full flex-col'>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className=''>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className='flex w-full max-w-full flex-col gap-y-[12rem]'>
          {table.getRowModel().rows && table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className='flex gap-x-[12rem]' data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className='h-fit text-center font-medium'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='mb-[140rem] mt-[110rem] flex w-full flex-col items-center gap-y-[24rem]'>
                <div className='font-poppins text-[14rem]'>Complete exam by section or take MOCK test to view results </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const MockLastResults = ({ data }: { data: MockLastResults[] }) => {
  return (
    <section>
      <div className='relative max-w-[1016rem] overflow-hidden rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        {data.length < 1 && (
          <img
            src='/images/illustration_flower_full.png'
            className='pointer-events-none absolute bottom-[-66rem] right-[96rem] h-auto w-[366rem] opacity-40 mix-blend-luminosity'
            alt='illistration'
          />
        )}
        {/* // * Title & Full litst btn */}
        <div className='flex items-center justify-between'>
          <h2 className='text-[20rem] font-medium leading-normal'>Last MOCK Results</h2>

          <Dialog>
            <DialogTrigger disabled={data.length === 0} className='flex h-[30rem] items-center gap-x-[4rem] px-[16rem] disabled:cursor-not-allowed'>
              <span className='relative z-[40] text-[14rem] font-medium leading-normal text-d-black/80'>View full list</span>
              <img src='/images/icon_chevron--down.svg' className='size-[14rem]' alt='icon' />{' '}
            </DialogTrigger>

            <DialogContent className='fixed left-0 top-0 flex h-full min-h-[100dvh] w-full max-w-full flex-col items-center justify-center overflow-hidden backdrop-brightness-90'>
              <section className='fixed flex max-h-[95dvh] w-[1040rem] flex-col gap-y-[8rem] rounded-[16rem] bg-white p-[40rem]'>
                <DialogClose className='absolute right-[24rem] top-[24rem] z-[110] cursor-pointer'>
                  <img src='/images/icon_close--black.svg' alt='Close' className='size-[20rem]' />
                </DialogClose>
                <h2 className='mx-auto text-center text-[20rem] font-medium leading-normal'>MOCK Results</h2>
                <ScrollArea className='relative overflow-scroll desktop:max-h-[530rem]'>
                  <DataTable data={data} />
                </ScrollArea>
              </section>
            </DialogContent>
          </Dialog>
        </div>

        {data.length > 0 ? (
          <DataTable data={data.slice(0, 5)} />
        ) : (
          <div className='mb-[140rem] mt-[110rem] flex w-full flex-col items-center gap-y-[24rem]'>
            <div className='font-poppins text-[14rem]'>Complete exam by section or take MOCK test to view results </div>
          </div>
        )}
      </div>
    </section>
  );
};
