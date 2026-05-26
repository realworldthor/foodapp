import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

const restaurant = {
  name: 'Cafe Bella',
  description: 'Authentic flavours delivered fast. Fresh ingredients, bold taste.',
  address: '12, Hazratganj, Lucknow, UP 226001',
  phone: '+91 98765 43210',
  openingTime: '09:00',
  closingTime: '23:00',
  deliveryTime: '30 mins',
  minimumOrder: 149,
  isOpen: true,
};

const menuItems = [
  // STARTERS
  { name: 'Paneer Tikka', description: 'Soft paneer cubes marinated in spices and grilled to perfection.', price: 249, originalPrice: 299, category: 'Starters', isVeg: true, preparationTime: '15 mins', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
  { name: 'Chicken Wings', description: 'Crispy chicken wings tossed in smoky BBQ sauce.', price: 299, originalPrice: 349, category: 'Starters', isVeg: false, preparationTime: '20 mins', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
  { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with fresh vegetables and served with dipping sauce.', price: 179, originalPrice: 219, category: 'Starters', isVeg: true, preparationTime: '15 mins', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
  { name: 'Soup of the Day', description: 'Chef\'s special soup made fresh daily with seasonal ingredients.', price: 149, originalPrice: 179, category: 'Starters', isVeg: true, preparationTime: '10 mins', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },

  // MAIN COURSE
  { name: 'Butter Chicken', description: 'Tender chicken in a rich, creamy tomato-based sauce. Best paired with naan.', price: 349, originalPrice: 399, category: 'Main Course', isVeg: false, preparationTime: '25 mins', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Paneer Butter Masala', description: 'Cottage cheese in a smooth, buttery tomato gravy. A vegetarian classic.', price: 299, originalPrice: 349, category: 'Main Course', isVeg: true, preparationTime: '20 mins', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Dal Makhani', description: 'Slow cooked black lentils in a rich buttery gravy. Comfort food at its best.', price: 249, originalPrice: 299, category: 'Main Course', isVeg: true, preparationTime: '20 mins', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices.', price: 399, originalPrice: 449, category: 'Main Course', isVeg: false, preparationTime: '30 mins', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Veg Biryani', description: 'Aromatic basmati rice cooked with fresh vegetables and whole spices.', price: 299, originalPrice: 349, category: 'Main Course', isVeg: true, preparationTime: '25 mins', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
  { name: 'Fish Curry', description: 'Fresh fish cooked in a tangy coconut-based curry sauce.', price: 379, originalPrice: 429, category: 'Main Course', isVeg: false, preparationTime: '25 mins', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },

  // BREADS
  { name: 'Butter Naan', description: 'Soft leavened bread baked in a tandoor and brushed with butter.', price: 49, originalPrice: 59, category: 'Breads', isVeg: true, preparationTime: '10 mins', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { name: 'Garlic Naan', description: 'Tandoor baked bread topped with garlic and fresh coriander.', price: 59, originalPrice: 69, category: 'Breads', isVeg: true, preparationTime: '10 mins', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { name: 'Tandoori Roti', description: 'Whole wheat bread baked fresh in a tandoor oven.', price: 39, originalPrice: 49, category: 'Breads', isVeg: true, preparationTime: '10 mins', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { name: 'Paratha', description: 'Flaky layered whole wheat flatbread served with butter.', price: 49, originalPrice: 59, category: 'Breads', isVeg: true, preparationTime: '10 mins', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },

  // DRINKS
  { name: 'Mango Lassi', description: 'Thick and creamy yogurt drink blended with fresh Alphonso mangoes.', price: 129, originalPrice: 149, category: 'Drinks', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Fresh Lime Soda', description: 'Refreshing lime juice with sparkling water. Sweet or salted.', price: 79, originalPrice: 99, category: 'Drinks', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Cold Coffee', description: 'Rich espresso blended with cold milk and ice cream.', price: 149, originalPrice: 179, category: 'Drinks', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Masala Chai', description: 'Traditional Indian spiced tea brewed with ginger, cardamom and cinnamon.', price: 49, originalPrice: 59, category: 'Drinks', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },

  // DESSERTS
  { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup.', price: 99, originalPrice: 129, category: 'Desserts', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Chocolate Brownie', description: 'Warm fudgy brownie served with a scoop of vanilla ice cream.', price: 179, originalPrice: 199, category: 'Desserts', isVeg: true, preparationTime: '10 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Rasmalai', description: 'Soft cottage cheese patties soaked in sweetened saffron milk.', price: 129, originalPrice: 149, category: 'Desserts', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
  { name: 'Ice Cream', description: 'Choice of vanilla, chocolate, or strawberry. Two scoops served fresh.', price: 99, originalPrice: 119, category: 'Desserts', isVeg: true, preparationTime: '5 mins', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
];

export async function GET() {
  // DISABLE IN PRODUCTION
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed disabled in production' },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    await MenuItem.deleteMany({});
    await Restaurant.deleteMany({});

    const createdRestaurant = await Restaurant.create(restaurant);
    await MenuItem.insertMany(
      menuItems.map(item => ({ ...item, restaurant: createdRestaurant._id }))
    );

    return NextResponse.json({
      message: `Database seeded! ${menuItems.length} menu items and 1 restaurant created.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Seeding failed' },
      { status: 500 }
    );
  }
}