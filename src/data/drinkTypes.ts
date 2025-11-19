// data/drinkTypes.ts - Drink type definitions with proper alcohol content
import { DrinkType } from '../types/drinks';
import { WineGlassIcon, BeerMugIcon, SpiritsIcon, CocktailIcon, OtherDrinkIcon } from '../components/icons/DrinkIcons';

export const drinkTypes: Record<string, DrinkType> = {
  wine: {
    id: 'wine',
    label: 'Wijn',
    abv: 12,                    // 12% alcohol
    unitsPerGlass: 1.0,        // 1 standard drink per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink (NL/EU)
    icon: WineGlassIcon,
  },
  beer: {
    id: 'beer',
    label: 'Bier',
    abv: 5,                     // 5% alcohol
    unitsPerGlass: 1.0,        // 1 standard drink per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    icon: BeerMugIcon,
  },
  spirits: {
    id: 'spirits',
    label: 'Sterke drank',
    abv: 40,                    // 40% alcohol
    unitsPerGlass: 1.0,        // 1 standard drink per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    icon: SpiritsIcon,
  },
  cocktail: {
    id: 'cocktail',
    label: 'Cocktail',
    abv: 15,                    // 15% alcohol
    unitsPerGlass: 1.5,        // 1.5 standard drinks per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    icon: CocktailIcon,
  },
  other: {
    id: 'other',
    label: 'Overig',
    abv: 0,                     // Custom alcohol percentage
    unitsPerGlass: 0,          // Calculated based on custom input
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    icon: OtherDrinkIcon,
    isCustom: true,            // Flag for custom drinks
  },
};
