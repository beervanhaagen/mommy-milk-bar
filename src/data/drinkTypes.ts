// data/drinkTypes.ts - Drink type definitions with proper alcohol content
import { DrinkType } from '../types/drinks';
import { WineGlassIcon, BeerMugIcon, SpiritsIcon, CocktailIcon, OtherDrinkIcon } from '../components/icons/DrinkIcons';

export const drinkTypes: Record<string, DrinkType> = {
  wine: {
    id: 'wine',
    label: 'Wijn',
    abv: 12,                    // 12% alcohol
    // 125ml * 12% * 0.789 ≈ 11.8g alcohol → ~1.18 standaarddrank (10g)
    // We modelleren dit expliciet zodat de wachttijd de echte alcoholbelasting volgt
    unitsPerGlass: 1.18,
    gramsPerUnit: 10,          // 10g alcohol per standard drink (NL/EU)
    standardVolumeMl: 125,     // Standaard wijnglas 125ml
    volumeInfo: 'Standaard wijnglas van 125ml (geen grote 150ml+ glazen)',
    icon: WineGlassIcon,
  },
  beer: {
    id: 'beer',
    label: 'Bier',
    abv: 5,                     // 5% alcohol
    unitsPerGlass: 1.0,        // 1 standard drink per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    standardVolumeMl: 250,     // Standard beer glass (NOT can or pint!)
    volumeInfo: 'Standaard glas (niet 330ml blikje of 500ml vaas)',
    icon: BeerMugIcon,
  },
  spirits: {
    id: 'spirits',
    label: 'Sterke drank',
    abv: 40,                    // 40% alcohol
    unitsPerGlass: 1.0,        // 1 standard drink per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    standardVolumeMl: 32,      // Standard shot (35ml is also common)
    volumeInfo: 'Standaard shot',
    icon: SpiritsIcon,
  },
  cocktail: {
    id: 'cocktail',
    label: 'Cocktail',
    abv: 15,                    // 15% alcohol
    unitsPerGlass: 1.5,        // 1.5 standard drinks per glass
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    standardVolumeMl: 127,     // ~125ml cocktail
    volumeInfo: 'Klein cocktailglas (sterkte kan variëren)',
    icon: CocktailIcon,
  },
  other: {
    id: 'other',
    label: 'Overig',
    abv: 0,                     // Custom alcohol percentage
    unitsPerGlass: 0,          // Calculated based on custom input
    gramsPerUnit: 10,          // 10g alcohol per standard drink
    standardVolumeMl: 0,       // User specifies volume
    volumeInfo: 'Zelf in te vullen',
    icon: OtherDrinkIcon,
    isCustom: true,            // Flag for custom drinks
  },
};
