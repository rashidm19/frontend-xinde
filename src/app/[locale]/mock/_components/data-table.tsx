'use client';
import React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SortingState, getSortedRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';

import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'country', desc: false }]);

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
    <div className='border-black-90 w-full max-w-full overflow-scroll desktop:overflow-hidden'>
      <Table className='bg-black-90 relative z-[90] w-full max-w-full desktop:max-w-[1512rem]'>
        <TableHeader className=''>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className='border-black-90' key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className='border-black-90 w-full max-w-full desktop:max-w-[1280rem]'>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow className='border-black-90' key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    className='border-black-90 bg-black-60 text-babypowder h-fit rounded-[16rem] border-[3rem] px-[12rem] py-[24rem] text-[12rem] font-medium leading-[130%] desktop:text-[15rem] desktop:leading-[135%]'
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className='border-black-90'>
              <TableCell colSpan={columns.length} className='text-babypowder h-[96rem] text-center text-[15rem]'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
