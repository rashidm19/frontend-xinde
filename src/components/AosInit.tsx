'use client';

import 'aos/dist/aos.css';

import React, { useEffect } from 'react';

import AOS from 'aos';

export function AosInit() {
  useEffect(() => {
    AOS.init();
  }, []);

  return <></>;
}
