// src/data/wheelchairs.jsx

export const wheelchairsData = [
  {
    ID_FAUT: 1,
    type: {
      ID_TYPE: 1, // Manual Wheelchair
      NOM_TYPE: "Manual Wheelchair Basic",
      category: "manual"
    },
    ID_UTILISATUER: 1, // Assuming user ID is 1 for now
    PROPULTION: 1, // Manual
    PRIX: 299.99,
    QT_STOCK: 10,
    DESCRIPTION: "Basic manual wheelchair for everyday use",
    NEW: true,
    image: "/images/wheelchairs/manual-basic.jpg",
    rating: 4.5,
    reviews: 128,
    options: [
      { NOM_OPTION: "Pliable", price_extra: 0 }
    ],
    specifications: {
      weight: "14 kg",
      maxWeight: "120 kg",
      width: "66 cm",
      foldedWidth: "28 cm"
    }
  },
  {
    ID_FAUT: 2,
    type: {
      ID_TYPE: 2, // Electric Wheelchair
      NOM_TYPE: "Electric Wheelchair Premium",
      category: "electric"
    },
    ID_UTILISATUER: 2, // Assuming user ID is 2 for now
    PROPULTION: 2, // Electric
    PRIX: 1499.99,
    QT_STOCK: 5,
    DESCRIPTION: "Advanced electric wheelchair with a long-lasting battery",
    BESTSELLER: true,
    image: "/images/wheelchairs/electric-premium.jpg",
    rating: 4.8,
    reviews: 256,
    options: [
      { NOM_OPTION: "Batterie longue durée", price_extra: 200 },
      { NOM_OPTION: "Commande joystick", price_extra: 150 }
    ],
    specifications: {
      weight: "25 kg",
      maxWeight: "150 kg",
      width: "70 cm",
      batteryLife: "20 hours"
    }
  },
  {
    ID_FAUT: 3,
    type: {
      ID_TYPE: 3, // Sport Wheelchair
      NOM_TYPE: "Sport Wheelchair Elite",
      category: "sport"
    },
    ID_UTILISATUER: 3, // Assuming user ID is 3 for now
    PROPULTION: 3, // Sport
    PRIX: 2499.99,
    QT_STOCK: 3,
    DESCRIPTION: "Lightweight sports wheelchair designed for competitive athletes",
    PROMO: true,
    image: "/images/wheelchairs/sport-elite.jpg",
    rating: 4.7,
    reviews: 98,
    options: [
      { NOM_OPTION: "Dossier réglable", price_extra: 100 },
      { NOM_OPTION: "Cadre ultra-léger", price_extra: 300 }
    ],
    specifications: {
      weight: "10 kg",
      maxWeight: "100 kg",
      width: "60 cm"
    }
  },
  {
    ID_FAUT: 4,
    type: {
      ID_TYPE: 1, // Manual Wheelchair
      NOM_TYPE: "All-Terrain Wheelchair",
      category: "manual"
    },
    ID_UTILISATUER: 4, // Assuming user ID is 4 for now
    PROPULTION: 2, // Electric Propulsion
    PRIX: 1799.99,
    QT_STOCK: 7,
    DESCRIPTION: "Wheelchair built for off-road use with all-terrain tires",
    image: "/images/wheelchairs/all-terrain.jpg",
    rating: 4.6,
    reviews: 76,
    options: [
      { NOM_OPTION: "Roues tout-terrain", price_extra: 250 }
    ],
    specifications: {
      weight: "18 kg",
      maxWeight: "130 kg",
      width: "68 cm"
    }
  },
  {
    ID_FAUT: 5,
    type: {
      ID_TYPE: 1, // Manual Wheelchair
      NOM_TYPE: "Compact Manual Wheelchair",
      category: "manual"
    },
    ID_UTILISATUER: 5, // Assuming user ID is 5 for now
    PROPULTION: 1, // Manual
    PRIX: 399.99,
    QT_STOCK: 8,
    DESCRIPTION: "Compact manual wheelchair ideal for tight spaces and urban environments",
    NEW: true,
    image: "/images/wheelchairs/compact-manual.jpg",
    rating: 4.4,
    reviews: 112,
    options: [
      { NOM_OPTION: "Pliable", price_extra: 0 }
    ],
    specifications: {
      weight: "12 kg",
      maxWeight: "110 kg",
      width: "64 cm",
      foldedWidth: "26 cm"
    }
  },
  {
    ID_FAUT: 6,
    type: {
      ID_TYPE: 2, // Electric Wheelchair
      NOM_TYPE: "Electric Wheelchair Basic",
      category: "electric"
    },
    ID_UTILISATUER: 6, // Assuming user ID is 6 for now
    PROPULTION: 2, // Electric
    PRIX: 899.99,
    QT_STOCK: 6,
    DESCRIPTION: "Affordable electric wheelchair for those who need basic features",
    BESTSELLER: true,
    image: "/images/wheelchairs/electric-basic.jpg",
    rating: 4.3,
    reviews: 89,
    options: [
      { NOM_OPTION: "Commande joystick", price_extra: 100 }
    ],
    specifications: {
      weight: "22 kg",
      maxWeight: "140 kg",
      width: "72 cm",
      batteryLife: "10 hours"
    }
  },
  {
    ID_FAUT: 7,
    type: {
      ID_TYPE: 3, // Sport Wheelchair
      NOM_TYPE: "Sport Wheelchair Pro",
      category: "sport"
    },
    ID_UTILISATUER: 7, // Assuming user ID is 7 for now
    PROPULTION: 3, // Sport
    PRIX: 3299.99,
    QT_STOCK: 2,
    DESCRIPTION: "Premium sports wheelchair with custom-fit design for professionals",
    PROMO: true,
    image: "/images/wheelchairs/sport-pro.jpg",
    rating: 4.9,
    reviews: 45,
    options: [
      { NOM_OPTION: "Siège ergonomique", price_extra: 400 }
    ],
    specifications: {
      weight: "9 kg",
      maxWeight: "95 kg",
      width: "58 cm"
    }
  }
];

// Adjust for wheelchair categories (used in SQL for the `TYPE_FAUTEUIL`)
export const wheelchairCategories = [
  { id: 'manual', name: 'Manual Wheelchairs', count: 12 },
  { id: 'electric', name: 'Electric Wheelchairs', count: 8 },
  { id: 'sport', name: 'Sport Wheelchairs', count: 6 },
  { id: 'pediatric', name: 'Pediatric Wheelchairs', count: 4 },
  { id: 'bariatric', name: 'Bariatric Wheelchairs', count: 3 }
];

// Adjust for wheelchair features (mapped for the `OPTION` table)
export const wheelchairFeatures = [
  { id: 'foldable', name: 'Foldable', count: 15 },
  { id: 'adjustable', name: 'Adjustable', count: 12 },
  { id: 'lightweight', name: 'Lightweight', count: 8 },
  { id: 'elevating', name: 'Elevating Leg Rests', count: 10 }
];
