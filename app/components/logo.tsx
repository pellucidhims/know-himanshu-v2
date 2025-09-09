'use client';
import webSiteLogo from '../../public/WebsiteLogo.svg';
import Image from 'next/image';
import React from 'react';

const WebLogo = ({
  enableConnectOnClick,
}: {
  enableConnectOnClick: Boolean
}) => {
    const handleLogoClick = () => {
      if(!enableConnectOnClick) return;
      alert('Happy to connect with you!')
    }

    return <Image src={webSiteLogo} alt="Resume Plate" className="fixed top-4 left-8 h-50 w-30 hover:scale-110 hover:transition-all transition-all hover:rotate-12 cursor-grab" onClick={handleLogoClick}/>;
  };

export default WebLogo;  