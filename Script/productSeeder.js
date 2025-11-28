import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjOoiRxq8ZrUsGKIYezh7oLDbD9y5anSk",
  authDomain: "pawfessional-app.firebaseapp.com",
  projectId: "pawfessional-app",
  storageBucket: "pawfessional-app.firebasestorage.app",
  messagingSenderId: "1002952882973",
  appId: "1:1002952882973:web:a607e1d828d754116e3ff4"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const seedProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const sampleData = [
      // --- Food ---
      { name: "Pet's Milk Lactose-Free 1L", brand: "Cosi", count: 10, productType: "Food", price: 200, cost: 150 },
      { name: "Value Meal Dog food in Can 390g", brand: "Vitality", count: 10, productType: "Food", price: 160, cost: 110 },
      { name: "Vitality High Energy", brand: "Vitality", count: 10, productType: "Food", price: 280, cost: 230 },
      { name: "Vitality Classic", brand: "Vitality", count: 10, productType: "Food", price: 250, cost: 200 },
      { name: "Royal Canin Hairball Care Adult Wet Cat Food", brand: "Royal Canin", count: 10, productType: "Food", price: 75, cost: 25 },
      { name: "Royal Canin Urinary Care Cat Slices in Gravy", brand: "Royal Canin", count: 10, productType: "Food", price: 85, cost: 35 },
      { name: "Royal Canin Renal Can Wet Food for Dogs", brand: "Royal Canin", count: 10, productType: "Food", price: 180, cost: 130 },
      { name: "Royal Canin Veterinary Gastrointestinal", brand: "Royal Canin", count: 10, productType: "Food", price: 180, cost: 130 },
      { name: "Royal Canin Veterinary Canine Urinary Wet Dog Food", brand: "Royal Canin", count: 10, productType: "Food", price: 80, cost: 30 },
      { name: "Royal Canin Hepatic Adult Wet Dog Food", brand: "Royal Canin", count: 10, productType: "Food", price: 180, cost: 130 },
      { name: "Royal Canin Recovery for Dogs and Cats Canned", brand: "Royal Canin", count: 10, productType: "Food", price: 300, cost: 250 },
      { name: "Dr. Healmedix Hepatic 1.5kg Dog Dry Food", brand: "Healmedix", count: 10, productType: "Food", price: 1400, cost: 1300 },
      { name: "Pedigree Dentastix Daily Oral Care", brand: "Pedigree", count: 10, productType: "Food", price: 75, cost: 125 },
      { name: "Pedigree Puppy Chicken Chunks in Gravy Wet Dog Food", brand: "Pedigree", count: 10, productType: "Food", price: 48, cost: 38 },
      { name: "Pedigree Puppy Wet Dog Food Beef Flavor in Gravy", brand: "Pedigree", count: 10, productType: "Food", price: 45, cost: 35 },
      { name: "Pedigree Adult Beef in Gravy Wet Dog", brand: "Pedigree", count: 10, productType: "Food", price: 45, cost: 35 },
      { name: "Special Delight Tuna and Ocean Fish", brand: "Special Delight", count: 10, productType: "Food", price: 40, cost: 30 },
      { name: "Special Delight Tuna and Salmon Mousse", brand: "Special Delight", count: 8, productType: "Food", price: 350, cost: 250 },
      { name: "Special Delight Red Meat in Jelly", brand: "Special Delight", count: 10, productType: "Food", price: 40, cost: 30 },
      { name: "Whiskas Junior Tuna Wet Cat Food", brand: "Whiskas", count: 10, productType: "Food", price: 40, cost: 30 },
      { name: "Whiskas Junior Mackerel Wet Cat Food", brand: "Whiskas", count: 10, productType: "Food", price: 40, cost: 30 },
      { name: "Tuna Cat Food Pouch for Adult", brand: "Whiskas", count: 10, productType: "Food", price: 35, cost: 25 },
      { name: "Sheba Wet Cat Food", brand: "Sheba", count: 10, productType: "Food", price: 45, cost: 35 },
      { name: "Kitekat Wet Cat Food Chicken and Tuna", brand: "Kitekat", count: 10, productType: "Food", price: 30, cost: 20 },
      { name: "Kitekat Wet Cat Food Chicken and Salmon", brand: "Kitekat", count: 10, productType: "Food", price: 30, cost: 20 },
      { name: "Persian Kitten Dry Cat Food 400g", brand: "Royal Canin", count: 10, productType: "Food", price: 290, cost: 240 },
      { name: "Royal Canin Breed Health Nutrition Shih tzu", brand: "Royal Canin", count: 10, productType: "Food", price: 320, cost: 280 },
      { name: "Nutripe Lamb and Green Tripe Pure", brand: "Nutripe", count: 10, productType: "Food", price: 130, cost: 80 },
      { name: "Nutripe Dog Food Beef And Green Tripe", brand: "Nutripe", count: 10, productType: "Food", price: 130, cost: 80},
      { name: "Vitality Valuemeal Dog Food Grain Free", brand: "Vitality", count: 10, productType: "Food", price: 160, cost: 110 },
      { name: "Charco's Beef Dog Treats", brand: "Charco’s", count: 10, productType: "Food", price: 180, cost: 130 },
      { name: "Charco's Original Dog Treats", brand: "Charco’s", count: 10, productType: "Food", price: 130, cost: 80 },

      // --- Vitamins ---
      { name: "Petdelyte Oral Solution", brand: "Petdelyte", count: 10, productType: "Vitamin", price: 70, cost: 50 },
      { name: "LC-Vit Syrup Multivitamins Lysine", brand: "Lysine", count: 10, productType: "Vitamin", price: 200, cost: 150 },
      { name: "Hepatosure Sorbitol Inositol Hepato Protectant", brand: "Sorbitol", count: 10, productType: "Vitamin", price: 300, cost: 250 },
      { name: "Mondex Water Soluble Powder 340g", brand: "Mondex", count: 10, productType: "Vitamin", price: 180, cost: 130 },

      // --- Pet Supplies ---
      { name: "Toothpaste with Chicken Flavor", brand: "Bioline", count: 10, productType: "Pet Supplies", price: 70, cost: 20 },
      { name: "Toothpaste with Beef Flavor", brand: "Bioline", count: 10, productType: "Pet Supplies", price: 150, cost: 100 },
      { name: "Toothpaste with Mint Flavor", brand: "Bioline", count: 10, productType: "Pet Supplies", price: 150, cost: 100 },
      { name: "Toothpaste with Orange Flavor", brand: "Bioline", count: 10, productType: "Pet Supplies", price: 150, cost: 100 },
      { name: "Cat Litter Deodorant Powder", brand: "Bioline", count: 10, productType: "Pet Supplies", price: 250, cost: 200 },
      { name: "Royal Tail Essentials Madre de Cacao Dog Soap Tutti Fruitie", brand: "Royal Tail", count: 10, productType: "Pet Supplies", price: 80, cost: 30 },
      { name: "Royal Tail Shampoo 1Gallon/4000mL", brand: "Royal Tail", count: 10, productType: "Pet Supplies", price: 950, cost: 800 },
      { name: "Royal Tail Essentials Madre de Cacao Dog Soap", brand: "Royal Tail", count: 10, productType: "Pet Supplies", price: 80, cost: 30 },
      { name: "Royal Tail Sweet Talk", brand: "Royal Tail", count: 10, productType: "Pet Supplies", price: 250, cost: 200 },
      { name: "Royal Ear Cleanser", brand: "Royal Tail", count: 10, productType: "Pet Supplies", price: 350, cost: 300 },
      { name: "Furfect Soap Biosulfur+Madre de Cacao", brand: "Furfect", count: 10, productType: "Pet Supplies", price: 80, cost: 30 },
      { name: "Papi Groom & Bloom 3 in 1 All Purpose Shampoo", brand: "Papi", count: 10, productType: "Pet Supplies", price: 150, cost: 100 },
      { name: "Vetspro Fipronil Spray", brand: "Vets Pro", count: 10, productType: "Pet Supplies", price: 300, cost: 250 },
      { name: "Wound Spray", brand: "Vets Pro", count: 10, productType: "Pet Supplies", price: 350, cost: 300 },
    ];

    for (let i = 0; i < sampleData.length; i++) {
      const item = sampleData[i];
      const docRef = doc(db, "products", (i + 1).toString());

      const placeholderImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAocB9pT2Q7sAAAAASUVORK5CYII=";

      await setDoc(docRef, {
        productID: i + 1,
        ...item,
        price: item.price,
        cost: item.cost,
        profit: item.price - item.cost,
        image: placeholderImageBase64
      });

      await delay(200);
    }

  } catch (error) {
    console.error("Firestore seeding failed:", error);
  }
};

seedProducts();
