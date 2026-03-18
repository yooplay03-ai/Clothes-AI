export enum ClothingCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  DRESS = 'dress',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORY = 'accessory',
  BAG = 'bag',
  UNDERWEAR = 'underwear',
  ACTIVEWEAR = 'activewear',
}

export enum ClothingColor {
  BLACK = 'black',
  WHITE = 'white',
  GRAY = 'gray',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  BROWN = 'brown',
  BEIGE = 'beige',
  NAVY = 'navy',
  MULTICOLOR = 'multicolor',
}

export enum ClothingSeason {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL_SEASON = 'all_season',
}

export enum ClothingOccasion {
  CASUAL = 'casual',
  WORK = 'work',
  FORMAL = 'formal',
  SPORT = 'sport',
  OUTDOOR = 'outdoor',
  PARTY = 'party',
  DATE = 'date',
}

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  category: ClothingCategory;
  colors: ClothingColor[];
  seasons: ClothingSeason[];
  occasions: ClothingOccasion[];
  imageUrl?: string;
  thumbnailUrl?: string;
  material?: string;
  size?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  tags: string[];
  wearCount: number;
  lastWornAt?: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClothingItemDto {
  name: string;
  brand?: string;
  category: ClothingCategory;
  colors: ClothingColor[];
  seasons: ClothingSeason[];
  occasions: ClothingOccasion[];
  imageUrl?: string;
  material?: string;
  size?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateClothingItemDto extends Partial<CreateClothingItemDto> {
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface WardrobeStats {
  totalItems: number;
  byCategory: Record<ClothingCategory, number>;
  byColor: Record<ClothingColor, number>;
  bySeason: Record<ClothingSeason, number>;
  mostWorn: ClothingItem[];
  leastWorn: ClothingItem[];
  recentlyAdded: ClothingItem[];
}
