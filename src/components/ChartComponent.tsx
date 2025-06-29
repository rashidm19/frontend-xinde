import React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer } from './ui/chart';
import { cn } from '@/lib/utils';

interface ChartComponentProps {
  chartData: { [key: string]: number | string }[];
  chartConfig: ChartConfig;
  title?: string;
  yAxisDomain?: [number, number];
  barColors: { [key: string]: string };
  barSizes?: { [key: string]: number };
  width?: string | number;
  height?: string | number;
  useGradient?: boolean;
  displayAsPercent?: boolean;
  containerClassName?: string;
  titleClassName?: string;
  barGapNumber?: number;
}

const CustomLegendContent: React.FC<{ chartConfig: ChartConfig }> = ({ chartConfig }) => (
  <div className='text-babypowder mt-[40rem] flex flex-row flex-wrap items-center justify-center gap-[14rem] text-[12rem] font-semibold leading-[130%] desktop:gap-x-[24rem] desktop:text-[13rem]'>
    {Object.keys(chartConfig).map(key => (
      <div key={key} className='flex items-center'>
        <div style={{ backgroundColor: chartConfig[key].color }} className='mr-[8rem] h-[13rem] w-[13rem] rounded-[50rem]' />
        {chartConfig[key].label}
      </div>
    ))}
  </div>
);

const CustomLabel: React.FC<any> = props => {
  const { x, y, width, value, displayAsPercent } = props;
  const displayValue = displayAsPercent ? `${value}%` : value;

  return (
    <text x={x + width / 2} y={y - 10} fill='#F4F4F4' textAnchor='middle' dominantBaseline='middle' className='text-[10rem] font-medium leading-[125%]'>
      {displayValue}
    </text>
  );
};

const CustomXAxisTick: React.FC<any> = props => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor='middle' fill='#F4F4F4' className='text-[12rem] font-medium'>
        {payload.value}
      </text>
    </g>
  );
};

export const ChartComponent: React.FC<ChartComponentProps> = ({
  chartData,
  chartConfig,
  title,
  yAxisDomain = [0, 30],
  barColors,
  barSizes = {},
  width,
  height,
  useGradient = false,
  displayAsPercent = false,
  containerClassName,
  titleClassName,
  barGapNumber,
}) => {
  const transformedData = Object.keys(chartConfig).map(key => ({
    name: chartConfig[key].label,
    value: chartData[0][key],
  }));

  return (
    <div className={cn('flex w-full flex-col rounded-[10rem] px-[20rem]', containerClassName)}>
      <h4 className={cn('text-silver mb-[24rem] ml-[10rem] mr-[100rem] text-[12rem] font-medium leading-[130%] desktop:ml-[30rem] desktop:text-[15rem]', titleClassName)}>
        {title}
      </h4>

      <ChartContainer config={chartConfig} className='relative z-[50] -ml-[20rem]' style={{ width, height }}>
        <ResponsiveContainer>
          <BarChart data={transformedData} barCategoryGap='40%' barGap={barGapNumber ? barGapNumber : 100 / Object.keys(barColors).length}>
            <CartesianGrid x={25} width={900} className='opacity-30' y={-110} vertical={false} />

            <XAxis dataKey='name' tick={<CustomXAxisTick />} axisLine={false} tickLine={false} />

            <YAxis
              padding={{ top: 0, bottom: 0 }} // Add this line
              domain={yAxisDomain}
              tickMargin={-10}
              width={30}
              tickCount={4}
              tick={{
                color: '#F4F4F4',
                fill: '#F4F4F4',
                fontSize: 14,
                fontWeight: 600,
              }}
              orientation='right'
              mirror={true}
              axisLine={false}
              tickLine={false}
              tickFormatter={value => (displayAsPercent ? `${value}%` : `${value}`)}
            />

            <Bar
              dataKey='value'
              fill={useGradient ? `url(#barGradient)` : barColors.bar_01}
              stroke={barColors.bar_01}
              strokeWidth={2}
              radius={6}
              barSize={barSizes.bar_01 || 90}
            >
              <LabelList dataKey='value' content={<CustomLabel displayAsPercent={displayAsPercent} />} />
            </Bar>

            {useGradient && (
              <defs>
                <linearGradient id='barGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={barColors.bar_01} stopOpacity={0.8} />
                  <stop offset='95%' stopColor={barColors.bar_01} stopOpacity={0.2} />
                </linearGradient>
              </defs>
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
