'use client';

import React, { useState } from 'react';

export const IdiomGenerator = () => {
  const [status, setStatus] = useState<'init' | 'in-process' | 'generated' | 'try-again'>('init');
  const [counter, setCounter] = useState(-1);

  return (
    <section>
      <div className='container px-[20rem] tablet:max-w-[1024rem] tablet:px-[56rem] desktop:max-w-[1440rem] desktop:px-[134rem] wide:max-w-[1920rem] wide:px-[200rem]'>
        <div
          className={`relative flex min-h-[380rem] flex-col overflow-hidden rounded-[24rem] bg-white px-[24rem] tablet:min-h-[762rem] tablet:rounded-[40rem] desktop:min-h-[723rem] wide:min-h-[920rem] ${status === 'generated' || status === 'try-again' ? 'justify-between py-[24rem] tablet:p-[40rem] desktop:p-[80rem]' : 'items-center justify-center'}`}
        >
          {status === 'generated' || status === 'try-again' ? (
            <>
              <img
                src='/images/illustration_worm2.png'
                className='pointer-events-none absolute hidden tablet:bottom-[-70rem] tablet:right-[-95rem] tablet:block tablet:w-[305rem] tablet:rotate-[-60deg] desktop:bottom-[-112rem] desktop:right-[-37rem] wide:bottom-[-257rem] wide:right-[-219rem] wide:w-[593rem] wide:rotate-[-73deg]'
                alt='img'
              />
              <div dangerouslySetInnerHTML={{ __html: idioms[counter] }} className='idiom-generator-wysywig mb-[32rem]' />
              <button
                type='button'
                onClick={async () => {
                  setStatus('try-again');
                  setTimeout(() => {
                    setStatus('generated');
                    counter === 5 ? setCounter(0) : setCounter(counter + 1);
                  }, 3000);
                }}
                className='mx-auto flex items-center justify-center gap-x-[8rem] rounded-full bg-[#C9FF55] px-[32rem] py-[16rem] text-[16rem] font-medium leading-tight hover:bg-[#C9FF55]/40 tablet:w-[260rem] tablet:py-[22rem] tablet:text-[24rem] wide:w-[320rem] wide:py-[24rem] wide:text-[32rem]'
              >
                {status === 'try-again' ? (
                  <>
                    Generating...
                    <svg
                      className='size-[20rem] shrink-0 animate-spin text-black tablet:size-[24rem] wide:size-[26rem]'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  </>
                ) : (
                  'Try again'
                )}
              </button>
            </>
          ) : (
            <>
              <img
                data-aos='zoom-in'
                data-aos-duration='500'
                data-aos-delay='200'
                src='/images/illustration_bubles.png'
                className='pointer-events-none absolute right-0 top-[12rem] h-[254rem] w-[226rem] mix-blend-luminosity tablet:left-[calc(50%-221rem)] tablet:top-[112rem] tablet:h-auto tablet:w-[442rem]'
                alt='illustration'
              />
              <h2
                data-aos='fade-up'
                data-aos-duration='500'
                className='relative z-10 mb-[16rem] text-center font-poppins text-[40rem] font-semibold leading-none tablet:mb-[24rem] tablet:text-[80rem] wide:text-[120rem]'
              >
                Idiom Generator
              </h2>
              <p
                data-aos='fade-up'
                data-aos-duration='500'
                className='relative z-10 mb-[32rem] text-center text-[24rem] font-medium leading-tight text-d-black/80 tablet:mb-[40rem] tablet:text-[32rem] wide:mb-[56rem] wide:text-[40rem]'
              >
                Push the button to learn new English idiom
              </p>
              <button
                data-aos='fade-up'
                data-aos-duration='500'
                type='button'
                onClick={async () => {
                  setStatus('in-process');
                  setTimeout(() => {
                    setStatus('generated');
                    counter === 5 ? setCounter(0) : setCounter(counter + 1);
                  }, 3000);
                }}
                className='talbet:text-[24rem] relative z-10 flex w-[228rem] items-center justify-center gap-x-[8rem] rounded-full bg-[#C9FF55] px-[32rem] py-[16rem] text-[16rem] font-medium leading-tight hover:bg-[#C9FF55]/40 tablet:min-w-[260rem] tablet:py-[22rem] tablet:text-[24rem] wide:min-w-[320rem] wide:py-[24rem] wide:text-[32rem]'
              >
                {status === 'in-process' ? (
                  <>
                    Generating...
                    <svg
                      className='size-[20rem] shrink-0 animate-spin text-black tablet:size-[24rem] wide:size-[26rem]'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    Generate
                    <img src='/images/icon_stars--black.svg' alt='arrow-right-icon' className='size-[20rem] tablet:size-[24rem] wide:size-[26rem]' />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const idioms = [
  `<h2>Cutting edge</h2>
  <p>
    This expression is used to describe <span>the newest, most modern level of development of something</span>, especially when referring to technology, medicine, science, etc.
    <br />
    <br />
    Examples:
    <br />
    <ul>
      <li>His project is at the cutting edge of Internet marketing strategies.</li>
      <li>The company is at the cutting edge of aeronautics</li>
    </ul>
  </p>`,

  `<h2>Break the ice</h2>
  <p>
    This expression is used to describe <span>initiating conversation in a social setting or easing tension</span>.
    <br />
    <br />
    Examples:
    <br />
    <ul>
      <li>The host told a joke to break the ice at the beginning of the party.</li>
      <li>She brought a game to help break the ice at the team meeting.</li>
    </ul>
  </p>`,

  `<h2>Bite the bullet</h2>
  <p>
    This expression is used to describe <span>facing a difficult or unpleasant situation with courage and stoicism</span>.
    <br />
    <br />
    Examples:
    <br />
    <ul>
      <li>She decided to bite the bullet and accept the job offer in a new city.</li>
      <li>You'll just have to bite the bullet and tell her the bad news.</li>
    </ul>
  </p>`,

  `<h2>Barking up the wrong tree</h2>
  <p>
    This expression is used to describe <span>when someone is pursuing a mistaken or misguided course of action</span>.
    <br />
    <br />
    Examples:
    <br />
    <ul>
      <li>If you think I'm the one who started the argument, you're barking up the wrong tree.</li>
      <li>The detective realized that he had been barking up the wrong tree in his investigation.</li>
    </ul>
  </p>`,

  `<h2>Hit the nail on the head</h2>
  <p>
    This expression is used to describe <span>saying or doing exactly the right thing</span>.
    <br />
    <br />
    Examples:
    <br />
    <ul>
      <li>He hit the nail on the head with his analysis of the problem.</li>
      <li>You really hit the nail on the head with that suggestion.</li>
    </ul>
  </p>`,

  `<h2>Under the weather</h2>
  <p>
    This expression is used to describe <span>feeling ill or unwell</span>.
    <br />
    <br />
    Examples:
    <br />
    <ul>
      <li>I'm feeling a bit under the weather today, so I think I'll stay home.</li>
      <li>She was under the weather yesterday but is feeling better now.</li>
    </ul>
  </p>`,
];
