/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Store } from "../types";

export const INITIAL_STORES: Store[] = [
  {
    id: "zuri-botanicals",
    name: "Zuri & Co. Botanicals",
    category: "Beauty & Cosmetics",
    ownerName: "Dr. Amina Diop",
    ownerBio: "Dr. Amina Diop is a wellness researcher and ethnobotanist who spent ten years cataloging West African apothecary traditions.",
    story: "Founded in Harlem, Zuri & Co. Botanicals bridges ancestral botanical knowledge with modern dermatological science. We partner directly with women-led agricultural cooperatives in Senegal and Ghana to ethical-source raw, cold-pressed shea, baobab oil, and hibiscus extracts. Every formula is micro-batched with zero synthetic preservatives to feed your body and honor your rhythm.",
    coverImage: "https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=800&auto=format&fit=crop",
    ownerImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    products: [
      {
        id: "zuri-cream",
        storeId: "zuri-botanicals",
        name: "Nile Blossom Regenerating Cream",
        price: 34.00,
        description: "A velvety, rich face cream formulated with blue lotus flower petals and organic cold-pressed rosehip seed oil. It deeply rehydrates, softens texture, and locks in youthful luster.",
        image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop",
        rating: 4.9,
        reviewsCount: 14
      },
      {
        id: "zuri-souffle",
        storeId: "zuri-botanicals",
        name: "Raw Shea Gold Body Soufflé",
        price: 26.00,
        description: "Whipped to airy perfection, our classic Shea Gold combines single-source Nilotica shea butter, organic sweet almond oil, and lavender. Melts immediately into parched skin.",
        image: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=600&auto=format&fit=crop", // whipped skincare container
        rating: 4.8,
        reviewsCount: 22
      },
      {
        id: "zuri-baobab",
        storeId: "zuri-botanicals",
        name: "Sovereign Baobab Hair Masque",
        price: 28.00,
        description: "An intensive protein-rich treatment infused with pristine Senegalese baobab seed extract. Heals split ends, builds gorgeous bounce, and clarifies scalp build-up.",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop",
        rating: 5.0,
        reviewsCount: 9
      }
    ],
    reviews: [
      {
        id: "rz-1",
        author: "Keziah Jenkins",
        rating: 5,
        comment: "This is the only cream that doesn't trigger my dry eczema! The Nile Blossom is absolutely celestial, and my face glows.",
        date: "2026-05-14"
      },
      {
        id: "rz-2",
        author: "Tariq Edwards",
        rating: 4,
        comment: "Outstanding body cream. Recommending it to my entire family. Plus, I love that they source directly from cooperations in Senegal.",
        date: "2026-06-01"
      }
    ]
  },
  {
    id: "kente-clothier",
    name: "Kente Clothier",
    category: "Fashion & Apparel",
    ownerName: "Marcus & Nia Kumi",
    ownerBio: "Siblings Marcus and Nia Kumi launched Kente Clothier after a family trip to Ghana, where they fell in love with local kente and mudcloth master-weavers.",
    story: "Kente Clothier recreates luxury streetwear and tailored statement pieces carrying ancient West African textile heritages. We collaborate directly with generational weavers in Bonwire, Ghana, combining authentic, individually hand-loomed kente strips with comfortable, premium cotton silhouettes. Every garment is designed to empower, elevate, and spark deep cultural conversations.",
    coverImage: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop",
    ownerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    rating: 4.8,
    products: [
      {
        id: "kente-bomber",
        storeId: "kente-clothier",
        name: "Royal Ghana Kente Bomber Jacket",
        price: 120.00,
        description: "A show-stopping, tailored satin bomber featuring authentic, hand-woven gold Kente shoulder patterns. Designed for comfort with soft satin lining and double-ribbed waistbands.",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop", // premium jacket
        rating: 4.9,
        reviewsCount: 31
      },
      {
        id: "kente-poncho",
        storeId: "kente-clothier",
        name: "Ancestral Mudcloth Hooded Poncho",
        price: 85.00,
        description: "A beautiful, organic heavy linen poncho printed with traditional mudcloth symbols of defense and community strength. Featuring an oversized cocoon hood.",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop", // textured dark cloth
        rating: 4.7,
        reviewsCount: 18
      },
      {
        id: "kente-scarf",
        storeId: "kente-clothier",
        name: "Bonwire Heritage Silk Scarf",
        price: 45.00,
        description: "A 100% natural mulberry silk scarf decorated in intricate royal geometric grid prints. A luxurious weight that drapes effortlessly over both formal and casual settings.",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
        rating: 4.8,
        reviewsCount: 11
      }
    ],
    reviews: [
      {
        id: "rk-1",
        author: "Chinedu Okafor",
        rating: 5,
        comment: "The weight of the satin and Kente weave is exceptional. Best clothing purchase I've made all year. Highly, highly recommend Kente Clothier!",
        date: "2026-04-18"
      },
      {
        id: "rk-2",
        author: "Solange B.",
        rating: 4.6,
        comment: "Absolutely gorgeous scarf, feels like butter. I received five compliments on my first day wearing it. True craftsmanship.",
        date: "2026-05-30"
      }
    ]
  },
  {
    id: "heritage-brew",
    name: "Heritage Brew Coffee",
    category: "Food & Beverage",
    ownerName: "Elena Vance",
    ownerBio: "Elena Vance is a veteran barista and quality grader who sources coffees directly from East African female-owned micro-lots.",
    story: "Heritage Brew Coffee celebrating the historic birthlands of Coffea Arabica. Sourcing organic, high-altitude micro-lots directly from farmers in Ethiopia, Rwanda, and Kenya. By skipping middle exporters, we return 40% more profits to African agrarian families. Every batch is roasted under Elena's careful curation in Atlanta, creating dynamic fruited profiles of absolute luxury.",
    coverImage: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop",
    ownerImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    rating: 4.7,
    products: [
      {
        id: "coffee-yirg",
        storeId: "heritage-brew",
        name: "Yirgacheffe Honey-Processed Roast",
        price: 19.50,
        description: "Fragrant and luminous, this honey-processed single origin from Southern Ethiopia bursts with delicate hints of black tea, local honey, and sweet key lime.",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop", // gourmet raw coffee bean jar
        rating: 5.0,
        reviewsCount: 42
      },
      {
        id: "coffee-rwanda",
        storeId: "heritage-brew",
        name: "Rwanda Bourbon Medium Roast",
        price: 18.00,
        description: "An incredibly smooth cup featuring tasting notes of caramelized sweet brown sugar, dry dark cherry, and a buttery hazelnut finish. Roasted with local atlanta air.",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop", // freshly poured coffee
        rating: 4.6,
        reviewsCount: 25
      }
    ],
    reviews: [
      {
        id: "rb-1",
        author: "Devon Al-Amin",
        rating: 5,
        comment: "Coffee of the gods. The Yirgacheffe smells like actual jasmines in bloom. I can never buy supermarket grocery coffee beans ever again.",
        date: "2026-06-11"
      }
    ]
  },
  {
    id: "bantu-books",
    name: "Bantu Books & Café",
    category: "Books & Literature",
    ownerName: "Tunde Campbell",
    ownerBio: "Tunde is a former school librarian, literacy advocate, and collector of rare Afrocentric historical texts.",
    story: "Bantu Books started as a humble bookstand in Oakland and is now a beloved space to discover Black excellence across global literature. We catalog and amplify writing from African, Afro-Caribbean, Afro-American, and Afro-Latine authors. Our bookstore supports children's literacy programs and hosts monthly youth poetry slams, ensuring the written word remains an active tool for community freedom.",
    coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop",
    ownerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    rating: 5.0,
    products: [
      {
        id: "book-anthology",
        storeId: "bantu-books",
        name: "Diaspora Voices: An Anthology of Contemporary Verse",
        price: 24.99,
        description: "A curated literary masterpiece bringing together 48 rising poets across the African diaspora. Explores modern themes of return, resistance, family lineage, and magic realism.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop", // premium book
        rating: 5.0,
        reviewsCount: 34
      },
      {
        id: "book-bookmark",
        storeId: "bantu-books",
        name: "Umoja Hand-Carved Mahogany Bookmark",
        price: 12.00,
        description: "Elegant, robust bookmark hand-sculpted in premium Kenya Mahogany. Laser-etched with geometric tribal Adinkra patterns symbolizing unity and resilience.",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop", // book design elements
        rating: 4.8,
        reviewsCount: 15
      }
    ],
    reviews: [
      {
        id: "rb-2",
        author: "Amadi Ndiaye",
        rating: 5,
        comment: "Excellent service and deep selection. This anthology is mind-expanding; we read it in our community circle weekly.",
        date: "2026-05-19"
      }
    ]
  },
  {
    id: "vanguard-galleria",
    name: "Vanguard Galleria",
    category: "Art & Design",
    ownerName: "Keisha Cole",
    ownerBio: "Keisha is a fine arts graduate from Howard University and former museum curator committed to breaking down barriers for Afro-gothic artists.",
    story: "Vanguard Galleria is a collective agency that offers bespoke decor, limited-edition museum-grade giclée prints, and fine ceramics by emerging Black artists. We believe original art should live in everyday homes, breathing culture, color, and ancestral dignity into living spaces. 70% of every sale goes directly to the contributing creator.",
    coverImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    ownerImage: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=400&auto=format&fit=crop",
    rating: 4.9,
    products: [
      {
        id: "art-print",
        storeId: "vanguard-galleria",
        name: "'Sovereignty' Canvas Giclée Print",
        price: 145.00,
        description: "A gorgeous, high-contrast Giclée print on textured canvas capturing the quiet strength of an elder under warm light. Limited, hand-numbered series with premium gold accents.",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop", // vibrant fine art painting
        rating: 5.0,
        reviewsCount: 8
      },
      {
        id: "art-vessel",
        storeId: "vanguard-galleria",
        name: "Anasazi Hand-Thrown Terracotta Vessel",
        price: 95.00,
        description: "Earth-toned terracotta vase hand-coiled and pit-fired with local Atlanta red clay. Excellent minimalist centerpiece with matte rustic textures.",
        image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop", // clay pot
        rating: 4.8,
        reviewsCount: 16
      }
    ],
    reviews: [
      {
        id: "rg-1",
        author: "Zarah Vance",
        rating: 5,
        comment: "The clay vessel is beautiful, sitting proudly on my mantle with organic eucalyptus stems. Exemplary work and safe shipping.",
        date: "2026-06-15"
      }
    ]
  }
];
