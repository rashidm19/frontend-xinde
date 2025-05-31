import Link from 'next/link';
import React from 'react';

export default function UserAgreement() {
  return (
    <main>
      <section className='relative flex min-h-[1024rem] items-center'>
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <Link
            href='/'
            className='absolute left-[40rem] top-[80rem] flex h-[64rem] w-[150rem] items-center justify-center gap-x-[14rem] rounded-[40rem] bg-white hover:bg-white/70'
          >
            <img src='/images/icon_chevron--back.svg' alt='Icon Back' />
            <span className='text-[20rem] font-normal leading-[26rem]'>Back</span>
          </Link>
          <div className='flex h-fit w-[902rem] flex-col rounded-[24rem] bg-white p-[64rem] shadow-card'>
            <h1 className='mx-auto mb-[24rem] text-center text-[32rem] font-normal leading-[26rem]'>User Agreement</h1>

            <p className='mb-[48rem] text-center text-[20rem] font-medium leading-[24rem] tracking-[-0.2rem] text-d-black'>Effective Date:</p>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>1. Introduction</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                Welcome to StudyBox. By accessing or using our service, you agree to be bound by the terms and conditions of this User Agreement. If you do not agree to
                these terms, you must not use our service.
              </p>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>2. Definitions</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                "Service" refers to [Service Name], including but not limited to any related websites, mobile applications, and other platforms operated by [Company
                Name].
                <br />
                <br />
                "User" refers to any person or entity accessing or using the Service.
                <br />
                <br />
                "Content" refers to all information, text, images, videos, and other material provided by the Service or its users.
              </p>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>3. Eligibility</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                To use the Service, you must be at least [minimum age, typically 13 or 18] years old and have the legal capacity to enter into this Agreement. By using
                the Service, you represent and warrant that you meet these requirements.
              </p>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>4. User Account</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                Account Creation: You may be required to create an account to access certain features of the Service. You agree to provide accurate, complete, and
                up-to-date information during registration.
                <br />
                <br />
                Account Security: You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your
                account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>5. Use of the Service</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                Permitted Use: You may use the Service for lawful purposes only. You agree not to use the Service in any way that could harm, disrupt, or impair the
                functioning of the Service or interfere with other users' enjoyment of it.
              </p>
              <div className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                Prohibited Activities: You agree not to:
                <ul className='ml-[24rem] mt-[20rem] flex list-outside list-disc flex-col items-start gap-y-[18rem]'>
                  <li className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                    Engage in any activity that is illegal, harmful, or violates the rights of others.
                  </li>
                  <li className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                    Upload or distribute any content that is defamatory, obscene, or otherwise objectionable.
                  </li>
                  <li className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                    Use the Service to transmit unsolicited commercial messages or spam. Reverse engineer, decompile, or otherwise attempt to obtain the source code of
                    the Service.
                  </li>
                </ul>
              </div>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>6. Intellectual Property</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                <span className='font-bold'>Ownership:</span> All intellectual property rights in the Service and its content are owned by [Company Name] or its
                licensors. You are granted a limited, non-exclusive, non-transferable license to use the Service for your personal use.
                <br />
                <br />
                <span className='font-bold'>User Content:</span> By submitting content to the Service, you grant [Company Name] a worldwide, royalty-free, perpetual
                license to use, modify, reproduce, and distribute your content in connection with the operation of the Service.
              </p>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>7. Privacy</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                Your use of the Service is also governed by our Privacy Policy, which can be found at [Privacy Policy URL]. By using the Service, you consent to the
                collection, use, and sharing of your information as described in the Privacy Policy.
              </p>
            </div>

            <div className='mb-[48rem] flex flex-col items-start gap-x-[32rem] text-d-black'>
              <p className='mb-[24rem] text-[20rem] font-semibold leading-[24rem] tracking-[-0.2rem]'>8. Termination</p>
              <p className='text-[20rem] font-normal leading-[24rem] tracking-[-0.2rem]'>
                We reserve the right to suspend or terminate your access to the Service at any time, without notice, for any reason, including but not limited to
                violation of this Agreement. Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

            <Link href='/login' className='mx-auto flex h-[65rem] w-[280rem] items-center justify-center gap-x-[24rem] rounded-[40rem] bg-d-light-gray hover:bg-d-gray'>
              <span className='text-[20rem] font-normal leading-[26rem]'>Back</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
