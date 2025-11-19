// components/icons/DrinkIcons.tsx - PNG icons for drinks
import React from 'react';
import { Image } from 'react-native';

export const WineGlassIcon = ({ size = 28 }) => (
  <Image 
    source={require('../../../assets/MMB_other/Wine_png.png')} 
    style={{ width: size, height: size }} 
    resizeMode="contain" 
  />
);

export const BeerMugIcon = ({ size = 28 }) => (
  <Image 
    source={require('../../../assets/MMB_other/beer_png.png')} 
    style={{ width: size, height: size }} 
    resizeMode="contain" 
  />
);

export const SpiritsIcon = ({ size = 28 }) => (
  <Image 
    source={require('../../../assets/MMB_other/strongdrink_png.png')} 
    style={{ width: size, height: size }} 
    resizeMode="contain" 
  />
);

export const CocktailIcon = ({ size = 28 }) => (
  <Image 
    source={require('../../../assets/MMB_other/Cocktail_png.png')} 
    style={{ width: size, height: size }} 
    resizeMode="contain" 
  />
);

export const OtherDrinkIcon = ({ size = 28 }) => (
  <Image 
    source={require('../../../assets/MMB_other/other_drink.png')} 
    style={{ width: size, height: size }} 
    resizeMode="contain" 
  />
);
