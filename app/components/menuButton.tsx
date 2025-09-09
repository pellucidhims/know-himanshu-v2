'use client';
import React, { useRef, useState, KeyboardEvent } from 'react';
import { useOutsideClick } from '../utils/customHooks';
import { degreeToRadian } from '../utils/helper';

import './menuButton.css';

const menuItems = [
  'About',
  'Education',
  'Experience',
  'Project',
  'Contact',
  'Skills',  
  'Blog',
];

const MenuItem = ({item, handleOnClick, isMenuOpen, id, optionsLength}: {item: String, handleOnClick: Function, isMenuOpen: Boolean, id: number, optionsLength: number}) => {
  const radius = 10 + id;
  const x = isMenuOpen ? (-2 + (-1 * radius) * Math.cos(degreeToRadian((id*(90/optionsLength))))) : -2;
  const y = isMenuOpen ? (-2 + radius * Math.sin(degreeToRadian((id*(90/optionsLength))))) : -2;
  return (
    <button onClick={() => handleOnClick(item)} className={`menuItem ${!isMenuOpen ? ' hideMenuItem' : ''}`} style={{translate: `${x}rem ${y}rem`, transitionDelay: `${50*(id)}ms`}}>
      {item}
    </button>
  )
}

const MenuList = ({options=[], handleOnClick, isMenuOpen}: {
  options: Array<String>,
  handleOnClick: Function,
  isMenuOpen: Boolean
}) => {
  return (
    <div className={`menuList ${!isMenuOpen ? ' hideMenuList' : ''}`}>
      {options.map((listItem, idx) => <MenuItem item={listItem} key={idx} handleOnClick={handleOnClick} isMenuOpen={isMenuOpen} id={idx} optionsLength={options.length}/>)}
    </div>
  )
}



const MenuButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useOutsideClick(() => {
    setIsMenuOpen(false);
  }, menuRef);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLElement>) => {
      if(event.key === 'Escape'){
        setIsMenuOpen(false)
      }
  }

  const handleOnClick = (item:String) => {
    alert(`now clicked: ${item}`);
  }

  return (
    <div className="menuButtonRoot" ref={menuRef} onKeyUp={handleKeyUp}>
      <button 
        id="menuButton" 
        className={`menuButton ${isMenuOpen ? ' menuLsitOpen': ''}`} 
        onClick={handleMenuToggle}
      />
      {<MenuList options={menuItems} handleOnClick={handleOnClick} isMenuOpen={isMenuOpen}/>}
    </div>
  );
};

export default MenuButton;