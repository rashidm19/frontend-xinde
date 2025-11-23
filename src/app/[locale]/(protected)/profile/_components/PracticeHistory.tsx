'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, isSameWeek, isToday, parseISO, startOfDay, subDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { cn } from '@/lib/utils';
import { PracticeHistoryEntry, PracticeSectionKey } from '@/types/Stats';
import type { PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

interface PracticeHistoryProps {
  entries: PracticeHistoryEntry[];
  loading?: boolean;
  onRetry?: () => void;
  onStartSection: (section: PracticeSectionKey) => void;
}

type FilterValue = 'all' | PracticeSectionKey;

const SECTION_FILTERS: FilterValue[] = ['all', 'writing', 'reading', 'listening', 'speaking'];

const SECTION_META: Record<PracticeSectionKey, { icon: string; hue: string }> = {
  writing: { icon: '/images/icon_writingSection.svg', hue: 'bg-d-violet-secondary' },
  reading: { icon: '/images/icon_readingSection.svg', hue: 'bg-d-blue-secondary' },
  listening: { icon: '/images/icon_listeningSection.svg', hue: 'bg-d-mint' },
  speaking: { icon: '/images/icon_speakingSection.svg', hue: 'bg-d-red-secondary' },
};

type StatusKey = 'completed' | 'cancelled' | 'review';
type GroupLabel = 'today' | 'thisWeek' | 'earlier';

const STATUS_PILL_CLASSES: Record<StatusKey, string> = {
  completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-amber-100 text-amber-700 border border-amber-200',
  review: 'bg-d-gray/70 text-d-black border border-d-gray/80',
};

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

const DEFAULT_LIMIT = 6;

export function PracticeHistory({ entries, loading, onRetry, onStartSection }: PracticeHistoryProps) {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const { t, tCommon, tActions, tImgAlts } = useCustomTranslations('profile.practiceHistory');

  const sectionLabels = useMemo(
    () => ({
      writing: tCommon('writing'),
      reading: tCommon('reading'),
      listening: tCommon('listening'),
      speaking: tCommon('speaking'),
    }),
    [tCommon]
  );

  const filterItems = useMemo(
    () =>
      SECTION_FILTERS.map(value => ({
        value,
        label: value === 'all' ? t('filters.all') : sectionLabels[value as PracticeSectionKey],
      })),
    [sectionLabels, t]
  );

  const statusLabels = useMemo(
    () => ({
      completed: t('status.completed'),
      cancelled: t('status.cancelled'),
      review: t('status.review'),
    }),
    [t]
  );

  const filteredEntries = useMemo(() => {
    if (limit !== DEFAULT_LIMIT) setLimit(DEFAULT_LIMIT);
    return filter === 'all' ? entries : entries.filter(entry => entry.section === filter);
  }, [filter, entries]);

  const limitedEntries = useMemo(() => filteredEntries.slice(0, limit), [filteredEntries, limit]);
  const canShowMore = filteredEntries.length > limit;

  const groups = useMemo(() => groupEntries(limitedEntries), [limitedEntries]);

  const weekStats = useMemo(() => computeWeekStats(entries), [entries]);

  if (!entries.length && !loading) {
    return (
      <EmptyHistoryState
        onStartSection={onStartSection}
        strings={{
          title: t('empty.title'),
          description: t('empty.description'),
          cardSubtitle: tActions('practiceNow'),
          footer: t('empty.footer'),
          imageAlt: tImgAlts('practiceHistoryIllustration'),
          cardTitle: (section: PracticeSectionKey) => t('empty.cardTitle', { section: sectionLabels[section] }),
        }}
      />
    );
  }

  const noResultsForFilter = !limitedEntries.length && !loading;

  return (
    <section className='w-full rounded-[24rem] bg-gradient-to-br from-white to-slate-50 p-[20rem] shadow-[0_16rem_40rem_-28rem_rgba(56,56,56,0.28)] tablet:p-[24rem]'>
      <header className='mb-[20rem] flex flex-col gap-[16rem]'>
        <div className='flex flex-col gap-[6rem]'>
          <h1 className='text-[22rem] font-semibold leading-tight text-d-black'>{t('title')}</h1>
          <p className='text-[13rem] text-d-black/70'>{t('subtitle')}</p>
        </div>

        <div className='grid grid-cols-3 gap-[8rem] rounded-[16rem] bg-d-light-gray/40 p-[12rem] text-center tablet:gap-[12rem]'>
          <MiniStat label={t('stats.sessions')} value={weekStats.sessions} />
          <MiniStat label={t('stats.medianBand')} value={weekStats.medianBand} />
          <MiniStat label={t('stats.streak')} value={t('stats.streakValue', { count: weekStats.streak })} />
        </div>

        <div className='-mx-[4rem] flex items-center gap-[8rem] overflow-x-auto pb-[4rem] pl-[4rem] pr-[4rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {filterItems.map(item => (
            <button
              key={item.value}
              type='button'
              onClick={() => {
                setFilter(item.value);
                setLimit(DEFAULT_LIMIT);
              }}
              className={cn(
                'flex h-[36rem] flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-[18rem] text-[12rem] font-semibold transition-colors',
                filter === item.value
                  ? 'border-d-violet bg-d-violet text-white shadow-[0_6rem_18rem_-12rem_rgba(99,106,251,0.6)]'
                  : 'border-d-gray/50 bg-white text-d-black hover:border-d-violet/60'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {loading && !limitedEntries.length ? (
        <div className='flex flex-col gap-[16rem]'>
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
        </div>
      ) : noResultsForFilter ? (
        <div className='flex flex-col items-center justify-center gap-[16rem] rounded-[20rem] border border-d-gray/60 bg-d-light-gray/40 py-[64rem] text-center'>
          <div className='text-[16rem] font-semibold text-d-black'>{t('emptyFilter.title')}</div>
          <p className='max-w-[300rem] text-[13rem] text-d-black/70'>{t('emptyFilter.description')}</p>
          <div className='flex gap-[12rem]'>
            <Button variant='secondary' className='h-[42rem] rounded-[24rem] px-[20rem] text-[12.5rem] font-semibold' onClick={() => setFilter('all')}>
              {t('emptyFilter.reset')}
            </Button>
            <Button
              className='h-[42rem] rounded-[24rem] bg-d-violet px-[20rem] text-[12.5rem] font-semibold text-white hover:bg-d-violet/80'
              onClick={() => onStartSection('writing')}
            >
              {t('emptyFilter.start')}
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-[20rem]'>
          <AnimatePresence>
            {groups.map(group => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className='flex flex-col gap-[16rem]'
              >
                <div className='text-[13rem] font-semibold uppercase tracking-[0.3rem] text-d-black/60'>{t(`groups.${group.label}`)}</div>
                <motion.ul variants={listVariants} initial='hidden' animate='show' className='flex flex-col gap-[12rem]'>
                  {group.items.map(item => {
                    const statusKey: StatusKey = item.completed_at ? 'completed' : 'cancelled';

                    return (
                      <motion.li
                        key={item.id}
                        variants={itemVariants}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className='flex flex-col gap-[12rem] rounded-[18rem] border border-d-gray/50 bg-white px-[20rem] py-[16rem] shadow-[0_10rem_24rem_-22rem_rgba(56,56,56,0.28)] tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-[16rem]'
                      >
                        <div className='flex min-w-0 items-start gap-[12rem] tablet:gap-[16rem]'>
                          <div className={cn('flex size-[44rem] flex-shrink-0 items-center justify-center rounded-full', SECTION_META[item.section].hue)}>
                            <img src={SECTION_META[item.section].icon} alt={t('sections.iconAlt', { section: sectionLabels[item.section] })} className='size-[20rem]' />
                          </div>
                          <div className='flex min-w-0 flex-col gap-[6rem]'>
                            <span className='line-clamp-2 text-[15rem] font-semibold leading-snug text-d-black'>{item?.practice?.title || ''}</span>
                            <span className='text-[12rem] font-medium text-d-black/60'>{format(parseISO(item.created_at), 'd MMM • HH:mm')}</span>
                          </div>
                        </div>

                        <div className='flex flex-wrap items-center gap-[8rem] tablet:justify-end'>
                          <MetricsCluster
                            band={item.score != null ? item.score.toFixed(1) : '--'}
                            part={item.section === 'speaking' ? formatSpeakingPart(item.practice?.part) : undefined}
                            tag={item.practice?.tag != null ? item.practice?.tag : undefined}
                            labels={{
                              band: t('metrics.band'),
                              part: t('metrics.part'),
                              tag: t('metrics.tag'),
                            }}
                          />
                          <span className={cn('rounded-full px-[12rem] py-[6rem] text-[12rem] font-medium', STATUS_PILL_CLASSES[statusKey])}>
                            {statusLabels[statusKey]}
                          </span>
                          <Button asChild className='h-auto rounded-[22rem] bg-d-violet px-[16rem] py-[8rem] text-[12rem] text-white hover:bg-d-violet/80'>
                            <Link href={buildSectionResultHref(item.section, item.id)}>{tActions('review')}</Link>
                          </Button>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </motion.div>
            ))}
          </AnimatePresence>

          {canShowMore || weekStats.streak > 0 ? (
            <div className='flex flex-col items-center gap-[10rem] pt-[14rem]'>
              {canShowMore ? (
                <Button onClick={() => setLimit(value => value + 6)} variant='secondary' className='h-[44rem] rounded-[24rem] px-[28rem] text-[12.5rem] font-semibold'>
                  {tActions('showMore')}
                </Button>
              ) : null}
              {weekStats.streak >= 3 ? (
                <span className='text-[12.5rem] font-semibold text-d-black/70'>{t('streakBanner', { count: weekStats.streak })}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {!entries.length && loading && onRetry ? (
        <div className='mt-[20rem] flex justify-center'>
          <Button variant='secondary' className='h-[40rem] rounded-[22rem] px-[20rem] text-[12.5rem] font-medium' onClick={onRetry}>
            {tActions('refresh')}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function groupEntries(entries: PracticeHistoryEntry[]) {
  const buckets: Array<{ label: GroupLabel; items: PracticeHistoryEntry[] }> = [];
  const today: PracticeHistoryEntry[] = [];
  const thisWeek: PracticeHistoryEntry[] = [];
  const earlier: PracticeHistoryEntry[] = [];
  const now = new Date();

  entries.forEach(entry => {
    const date = parseISO(entry.created_at);
    if (isToday(date)) {
      today.push(entry);
    } else if (isSameWeek(date, now, { weekStartsOn: 1 })) {
      thisWeek.push(entry);
    } else {
      earlier.push(entry);
    }
  });

  if (today.length) {
    buckets.push({ label: 'today', items: today });
  }
  if (thisWeek.length) {
    buckets.push({ label: 'thisWeek', items: thisWeek });
  }
  if (earlier.length) {
    buckets.push({ label: 'earlier', items: earlier });
  }

  return buckets;
}

function computeWeekStats(entries: PracticeHistoryEntry[]) {
  const now = new Date();
  const recent = entries.filter(entry => isSameWeek(parseISO(entry.created_at), now, { weekStartsOn: 1 }));
  const bandValues = recent
    .map(entry => entry.score)
    .filter((value): value is number => typeof value === 'number')
    .sort((a, b) => a - b);

  let medianBand = '--';
  if (bandValues.length) {
    const middle = Math.floor((bandValues.length - 1) / 2);
    medianBand = bandValues.length % 2 === 0 ? ((bandValues[middle] + bandValues[middle + 1]) / 2).toFixed(1) : bandValues[middle].toFixed(1);
  }

  const streak = computeStreak(entries);

  return {
    sessions: recent.length,
    medianBand,
    streak,
  };
}

function computeStreak(entries: PracticeHistoryEntry[]) {
  if (!entries.length) return 0;
  const dates = new Set(entries.map(entry => format(startOfDay(parseISO(entry.created_at)), 'yyyy-MM-dd')));
  let streak = 0;
  let cursor = startOfDay(new Date());

  while (dates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className='flex flex-col items-center gap-[4rem] text-center'>
      <span className='text-[11rem] font-medium uppercase tracking-[0.2rem] text-d-black/55'>{label}</span>
      <span className='text-[16rem] font-semibold text-d-black'>{value}</span>
    </div>
  );
}

function MetricsCluster({
  band,
  part,
  tag,
  labels,
}: {
  band: string;
  part?: string;
  tag?: string;
  labels: { band: string; part: string; tag: string };
}) {
  const metrics = [{ label: labels.band, value: band }];

  if (part) {
    metrics.push({ label: labels.part, value: part });
  }
  if (tag) {
    metrics.push({ label: labels.tag, value: tag });
  }

  return (
    <div className='flex flex-wrap items-center gap-[8rem]'>
      {metrics.map(metric => (
        <div
          key={metric.label}
          className='flex min-w-[88rem] flex-col gap-[2rem] rounded-[14rem] border border-d-gray/50 bg-d-light-gray/40 px-[10rem] py-[8rem] text-left'
        >
          <span className='text-[10.5rem] font-medium uppercase tracking-[0.24rem] text-d-black/55'>{metric.label}</span>
          <span className='text-[13rem] font-semibold text-d-black'>{metric.value}</span>
        </div>
      ))}
    </div>
  );
}

function formatSpeakingPart(part: PracticeSpeakingPartValue | number | null | undefined) {
  if (part == null) {
    return undefined;
  }

  if (typeof part === 'number') {
    if (part === 2) {
      return 'Part 2+3';
    }
    return `Part ${part}`;
  }

  switch (part) {
    case '1':
      return 'Part 1';
    case '2':
      return 'Part 2';
    case '3':
      return 'Part 3';
    case 'all':
      return 'All parts';
    case '2-3':
      return 'Part 2+3';
    default:
      return part;
  }
}

function HistorySkeleton() {
  return <Skeleton className='h-[88rem] w-full rounded-[18rem]' />;
}

function buildSectionResultHref(section: PracticeSectionKey, id: number) {
  if (section === 'writing' || section === 'speaking') {
    return `/practice/${section}/feedback/${id}`;
  }
  return `/practice/${section}/results/${id}`;
}

function EmptyHistoryState({
  onStartSection,
  strings,
}: {
  onStartSection: (section: PracticeSectionKey) => void;
  strings: {
    title: string;
    description: string;
    cardSubtitle: string;
    footer: string;
    imageAlt: string;
    cardTitle: (section: PracticeSectionKey) => string;
  };
}) {
  return (
    <div className='flex flex-col gap-[24rem] rounded-[24rem] border border-d-gray/60 bg-gradient-to-br from-white to-d-light-gray/50 p-[32rem] text-center'>
      <div>
        <h3 className='text-[20rem] font-semibold text-d-black'>{strings.title}</h3>
        <p className='mt-[8rem] text-[13rem] text-d-black/70'>{strings.description}</p>
      </div>
      <div className='grid grid-cols-2 gap-[16rem] tablet:grid-cols-1'>
        {(Object.keys(SECTION_META) as PracticeSectionKey[]).map(section => (
          <button
            key={section}
            type='button'
            className='flex h-[68rem] flex-col justify-center rounded-[20rem] border border-d-gray/60 bg-white px-[16rem] py-[12rem] text-left transition hover:border-d-violet hover:shadow-[0_12rem_24rem_-20rem_rgba(99,106,251,0.45)]'
            onClick={() => onStartSection(section)}
          >
            <span className='text-[13rem] font-semibold text-d-black'>{strings.cardTitle(section)}</span>
            <span className='text-[12rem] text-d-black/60'>{strings.cardSubtitle}</span>
          </button>
        ))}
      </div>
      <span className='text-[12rem] text-d-black/60'>{strings.footer}</span>
      <img src='/images/illustration_softball.png' alt={strings.imageAlt} className='mx-auto w-[160rem] opacity-50' />
    </div>
  );
}
