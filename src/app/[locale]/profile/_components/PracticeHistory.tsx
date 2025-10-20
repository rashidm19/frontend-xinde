'use client';

import { Fragment, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, isSameWeek, isToday, parseISO, startOfDay, subDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { cn } from '@/lib/utils';
import { PracticeHistoryEntry, PracticeSectionKey } from '@/types/Stats';

interface PracticeHistoryProps {
  entries: PracticeHistoryEntry[];
  loading?: boolean;
  onRetry?: () => void;
  onCta: (section: PracticeSectionKey, id: number) => void;
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

export function PracticeHistory({ entries, loading, onRetry, onCta, onStartSection }: PracticeHistoryProps) {
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
    <section className='rounded-[24rem] bg-gradient-to-br from-white to-slate-50 p-[24rem] shadow-[0_16rem_40rem_-28rem_rgba(56,56,56,0.28)]'>
      <header className='mb-[20rem] flex flex-col gap-[16rem]'>
        <div className='flex items-center justify-between gap-[12rem] tablet:flex-col tablet:items-start'>
          <div>
            <h2 className='text-[20rem] font-semibold leading-tight text-d-black'>{t('title')}</h2>
            <p className='text-[13rem] text-d-black/70'>{t('subtitle')}</p>
          </div>
          <div className='flex items-center gap-[16rem] rounded-[18rem] border border-d-gray/60 bg-d-light-gray/40 px-[16rem] py-[10rem] text-[12.5rem] tablet:w-full tablet:justify-between'>
            <MiniStat label={t('stats.sessions')} value={weekStats.sessions} />
            <Divider />
            <MiniStat label={t('stats.medianBand')} value={weekStats.medianBand} />
            <Divider />
            <MiniStat label={t('stats.streak')} value={t('stats.streakValue', { count: weekStats.streak })} />
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-[8rem]'>
          {filterItems.map(item => (
            <button
              key={item.value}
              type='button'
              onClick={() => {
                setFilter(item.value);
                setLimit(DEFAULT_LIMIT);
              }}
              className={cn(
                'rounded-full px-[16rem] py-[8rem] text-[12.5rem] font-medium transition-colors',
                filter === item.value ? 'bg-d-violet text-white' : 'bg-d-light-gray/60 text-d-black hover:bg-d-light-gray'
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
                      whileHover={{ y: -2, boxShadow: '0 18rem 36rem -24rem rgba(56,56,56,0.32)' }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className='flex items-center justify-between gap-[16rem] rounded-[18rem] border border-d-gray/50 bg-white px-[20rem] py-[16rem] shadow-[0_10rem_24rem_-22rem_rgba(56,56,56,0.28)] tablet:flex-col tablet:items-start tablet:gap-[12rem]'
                    >
                      <div className='flex items-center gap-[16rem] tablet:flex-wrap tablet:gap-[12rem]'>
                        <div className={cn('flex size-[44rem] items-center justify-center rounded-full', SECTION_META[item.section].hue)}>
                          <img src={SECTION_META[item.section].icon} alt={t('sections.iconAlt', { section: sectionLabels[item.section] })} className='size-[20rem]' />
                        </div>
                        <div className='flex flex-col gap-[4rem]'>
                          <span className='text-[15rem] font-semibold text-d-black'>{item?.practice?.title || ''}</span>
                          <span className='text-[12.5rem] text-d-black/65'>{format(parseISO(item.created_at), 'd MMM • HH:mm')}</span>
                        </div>
                      </div>

                      <div className='flex flex-1 items-center justify-end gap-[14rem] tablet:w-full tablet:flex-wrap tablet:justify-start'>
                        <MetricsCluster
                          band={item.score != null ? item.score.toFixed(1) : '--'}
                          part={item.practice?.part != null ? String(item.practice?.part) : undefined}
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
                        <Button
                          onClick={() => onCta(item.section, item.id)}
                          className='h-[auto] rounded-[22rem] bg-d-violet px-[12rem] py-[6rem] text-[12rem] text-white hover:bg-d-violet/80'
                        >
                          {tActions('review')}
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
    <div className='flex flex-col gap-[2rem] text-center'>
      <span className='text-[11.5rem] uppercase tracking-[0.3rem] text-d-black/60'>{label}</span>
      <span className='text-[16rem] font-semibold text-d-black'>{value}</span>
    </div>
  );
}

function Divider() {
  return <span className='h-[28rem] w-[1.5rem] rounded-full bg-d-gray/60' />;
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
    <div className='flex items-stretch gap-[10rem]'>
      {metrics.map((metric, index) => (
        <Fragment key={metric.label}>
          <div className='flex h-[43rem] min-w-[84rem] flex-col items-center justify-center rounded-[16rem] border border-d-gray/40 bg-d-light-gray/50 px-[8rem]'>
            <span className='text-[11rem] uppercase tracking-[0.3rem] text-d-black/60'>{metric.label}</span>
            <span className='text-[13rem] leading-tight text-d-black'>{metric.value}</span>
          </div>
          {index < metrics.length - 1 ? <div className='h-[32rem] w-[1rem] self-center rounded-full bg-d-gray/40' /> : null}
        </Fragment>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return <Skeleton className='h-[88rem] w-full rounded-[18rem]' />;
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
