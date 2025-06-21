import '../../home.css';

import { DreamUniversity } from './_components/DreamUniversity';
import { FollowUs } from './_components/FollowUs';
import { Header } from './_components/Header';
import { Hero } from './_components/Hero';
import { IdiomGenerator } from './_components/IdiomGenerator';
import { MakeYourWay } from './_components/MakeYourWay';
import { MasterIELTS } from './_components/MasterIELTS';
import { Practice } from './_components/Practice';
import { RunningLine } from './_components/RunningLine';

export default function Home() {
  return (
    <main className='max-w-[375rem] overflow-hidden tablet:max-w-none'>
      <Header />
      <Hero />
      <RunningLine />
      <Practice />
      <MasterIELTS />
      <DreamUniversity />
      <IdiomGenerator />
      <MakeYourWay />
      <FollowUs />
    </main>
  );
}
