import {
  PortfolioData,
  Category,
  Artwork,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
  SiteSettings,
  ContactMessage,
} from '../types';

export const defaultCategories: Category[] = [
  {
    id: 'cat-drawing',
    name: 'Drawing',
    slug: 'drawing',
    description: 'Charcoal, compressed carbon, and silverpoint works on handmade gessoed rag and unprimed linen.',
    order: 1,
    coverImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-sculpture',
    name: 'Sculpture',
    slug: 'sculpture',
    description: 'Tectonic mass, cast bronze, basalt, patinated zinc, and organic stone balancing fragility against permanence.',
    order: 2,
    coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-digital-work',
    name: 'Digital Work',
    slug: 'digital-work',
    description: 'Generative light systems, computational spatial projections, and algorithmic pigment dissolution.',
    order: 3,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-1790356731864',
    name: 'Gesture',
    slug: 'gesture',
    description: 'Expressive spontaneous marks, physical momentum, and kinetic anatomy studies.',
    order: 4,
    coverImage: '',
  },
  {
    id: 'cat-experimental-work',
    name: 'Experimental Work',
    slug: 'experimental-work',
    description: 'Time-based material transformations, chemical oxidations, atmospheric weathering, and site-responsive interventions.',
    order: 5,
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'cat-1790394894178',
    name: 'Watercolor',
    slug: 'watercolor',
    description: 'Aqueous pigments, capillary bleeding, fluid landscapes, and atmospheric washes.',
    order: 6,
    coverImage: '',
  },
  {
    id: 'cat-1790396025362',
    name: 'Collage',
    slug: 'collage',
    description: 'Tactile assemblages, found postal fragments, torn paper stratifications, and mixed media.',
    order: 7,
    coverImage: '',
  },
];

export const DUMMY_DEFAULT_ARTWORK_IDS = new Set([
  'art-p1', 'art-p2', 'art-p3',
  'art-d1', 'art-d2',
  'art-s1', 'art-s2',
  'art-dw1', 'art-dw2',
  'art-exp1', 'art-exp2'
]);

export const defaultArtworks: Artwork[] = [
  {
    "videoUrl": "",
    "medium": "Watercolor and pen",
    "videoTitle": "",
    "isFeatured": false,
    "images": [],
    "createdAt": "2026-09-25T19:14:31.055Z",
    "notes": "",
    "order": 1,
    "categorySlug": "drawing",
    "dimensions": "",
    "mediaType": "image",
    "mainImage": "/uploads/ex-peri-peri-mental-1-art-1790363671055.jpg",
    "description": "",
    "id": "art-1790363671055",
    "updatedAt": "2026-09-25T19:53:37.762Z",
    "categoryName": "Painting",
    "slug": "ex-peri-peri-mental-1",
    "year": 2024,
    "title": "EX-peri-peri-mental 1"
  },
  {
    "categorySlug": "collage",
    "title": "No more Dreams",
    "images": [],
    "order": 2,
    "categoryName": "Collage",
    "dimensions": "",
    "createdAt": "2026-09-26T06:25:12.447Z",
    "medium": "Oil pastel and tissue",
    "mediaType": "image",
    "mainImage": "/uploads/no-more-dreams-art-1790403912447.jpg",
    "id": "art-1790403912447",
    "updatedAt": "2026-09-26T06:25:12.447Z",
    "isFeatured": false,
    "notes": "",
    "description": "",
    "videoTitle": "",
    "slug": "no-more-dreams",
    "videoUrl": "",
    "year": 2026
  },
  {
    "medium": "Poster color",
    "year": 2024,
    "id": "art-1790559130485",
    "isFeatured": false,
    "slug": "tension",
    "images": [
      {
        "url": "/uploads/tension-art-1790559130485-extra-0.jpg",
        "alt": "সামনের মূল ভিউ (Front View)",
        "id": "img-1790559086494-l56l5",
        "order": 1,
        "isPrimary": true
      }
    ],
    "notes": "",
    "description": "",
    "updatedAt": "2026-09-28T01:32:10.485Z",
    "videoTitle": "",
    "mediaType": "image",
    "mainImage": "/uploads/tension-art-1790559130485.jpg",
    "categorySlug": "drawing",
    "createdAt": "2026-09-28T01:32:10.485Z",
    "videoUrl": "",
    "order": 3,
    "dimensions": "",
    "categoryName": "Painting",
    "title": "Tension"
  },
  {
    "notes": "",
    "categorySlug": "drawing",
    "slug": "experimental-work",
    "medium": "Soft pastel",
    "mediaType": "image",
    "mainImage": "/uploads/experimental-work-art-1790396679659.jpg",
    "videoTitle": "",
    "year": 2024,
    "updatedAt": "2026-09-26T04:24:39.659Z",
    "categoryName": "Painting",
    "description": "",
    "images": [],
    "isFeatured": false,
    "videoUrl": "",
    "dimensions": "",
    "title": "Experimental work",
    "id": "art-1790396679659",
    "createdAt": "2026-09-26T04:24:39.659Z",
    "order": 4
  },
  {
    "dimensions": "",
    "categoryName": "Painting",
    "id": "art-1790395576089",
    "createdAt": "2026-09-26T04:06:16.089Z",
    "notes": "",
    "categorySlug": "drawing",
    "description": "Master copy\nPuberty\nPainting by Edvard Munch",
    "medium": "soft pastel,acrylic color",
    "year": 2024,
    "videoTitle": "",
    "order": 5,
    "slug": "master-copy-puberty-painting-by-edvard-munch",
    "mediaType": "image",
    "mainImage": "/uploads/master-copy-puberty-painting-by-edvard-munch-art-1790395576089.jpg",
    "videoUrl": "",
    "images": [],
    "title": "Master copy Puberty Painting by Edvard Munch",
    "updatedAt": "2026-09-26T04:06:16.089Z",
    "isFeatured": false
  },
  {
    "videoTitle": "",
    "year": 2024,
    "images": [],
    "createdAt": "2026-09-26T04:19:26.862Z",
    "description": "",
    "slug": "love-business",
    "categorySlug": "collage",
    "medium": "",
    "isFeatured": false,
    "notes": "",
    "categoryName": "Collage",
    "videoUrl": "",
    "dimensions": "",
    "order": 6,
    "title": "Love Business",
    "id": "art-1790396366862",
    "updatedAt": "2026-09-26T04:19:26.862Z",
    "mediaType": "image",
    "mainImage": "/uploads/love-business-art-1790396366862.jpg"
  },
  {
    "mediaType": "image",
    "mainImage": "/uploads/gesture-art-1790394774275.jpg",
    "notes": "",
    "id": "art-1790394774275",
    "updatedAt": "2026-09-26T03:52:54.275Z",
    "isFeatured": false,
    "videoTitle": "",
    "description": "",
    "title": "Gesture",
    "year": 2024,
    "medium": "",
    "categorySlug": "gesture",
    "slug": "gesture",
    "videoUrl": "",
    "dimensions": "",
    "images": [],
    "order": 7,
    "categoryName": "Gesture",
    "createdAt": "2026-09-26T03:52:54.275Z"
  },
  {
    "medium": "",
    "order": 8,
    "createdAt": "2026-09-26T06:31:41.302Z",
    "dimensions": "",
    "images": [],
    "description": "",
    "title": "Breakfast",
    "id": "art-1790404301302",
    "videoTitle": "",
    "categoryName": "Collage",
    "year": 2026,
    "updatedAt": "2026-09-26T06:31:41.302Z",
    "isFeatured": false,
    "mainImage": "/uploads/breakfast-art-1790404301302.jpg",
    "mediaType": "image",
    "videoUrl": "",
    "slug": "breakfast",
    "notes": "",
    "categorySlug": "collage"
  },
  {
    "order": 9,
    "dimensions": "",
    "slug": "heaven",
    "description": "",
    "year": 2024,
    "title": "Heaven",
    "createdAt": "2026-09-28T01:20:23.409Z",
    "mediaType": "image",
    "mainImage": "/uploads/heaven-art-1790558423409.jpg",
    "medium": "",
    "updatedAt": "2026-09-28T01:20:23.409Z",
    "videoTitle": "",
    "categoryName": "Drawing",
    "id": "art-1790558423409",
    "images": [
      {
        "order": 1,
        "isPrimary": true,
        "alt": "Heaven",
        "url": "/uploads/heaven-art-1790558423409-extra-0.jpg",
        "id": "img-1790558423220-0"
      }
    ],
    "categorySlug": "drawing",
    "videoUrl": "",
    "notes": "",
    "isFeatured": false
  },
  {
    "notes": "",
    "images": [],
    "isFeatured": false,
    "createdAt": "2026-09-26T06:21:59.106Z",
    "medium": "",
    "videoTitle": "",
    "slug": "final-solution",
    "title": "Final Solution",
    "videoUrl": "",
    "year": 2024,
    "categoryName": "Collage",
    "mediaType": "image",
    "mainImage": "/uploads/final-solution-art-1790403719106.jpg",
    "updatedAt": "2026-09-26T06:21:59.106Z",
    "dimensions": "",
    "id": "art-1790403719106",
    "description": "Reference used for master copy Raoul Hausmann\nThe Art Critic (1919–20)",
    "categorySlug": "collage",
    "order": 10
  },
  {
    "dimensions": "",
    "categoryName": "Watercolor",
    "id": "art-1790559676452",
    "createdAt": "2026-09-28T01:41:16.452Z",
    "categorySlug": "watercolor",
    "notes": "",
    "description": "",
    "medium": "Watercolor",
    "year": 2023,
    "videoTitle": "",
    "order": 11,
    "slug": "still-life",
    "videoUrl": "",
    "mainImage": "/uploads/still-life-art-1790559676452.jpg",
    "mediaType": "image",
    "images": [
      {
        "id": "img-1790559675772-0",
        "isPrimary": true,
        "order": 1,
        "url": "/uploads/still-life-art-1790559676452-extra-0.jpg",
        "alt": "Still LIfe"
      }
    ],
    "title": "Still LIfe",
    "updatedAt": "2026-09-28T01:41:16.452Z",
    "isFeatured": false
  },
  {
    "images": [],
    "id": "art-1790395643176",
    "year": 2023,
    "slug": "gesture",
    "categorySlug": "gesture",
    "order": 12,
    "medium": "charcoal",
    "title": "Gesture",
    "dimensions": "",
    "createdAt": "2026-09-26T04:07:23.176Z",
    "description": "",
    "videoUrl": "",
    "categoryName": "Gesture",
    "updatedAt": "2026-09-26T04:07:23.176Z",
    "mainImage": "/uploads/gesture-art-1790395643176.jpg",
    "mediaType": "image",
    "isFeatured": false,
    "notes": "",
    "videoTitle": ""
  },
  {
    "dimensions": "",
    "year": 2025,
    "notes": "",
    "slug": "ex-peri-peri-mental-2",
    "mainImage": "/uploads/ex-peri-peri-mental-2-art-1790363867754.jpg",
    "mediaType": "image",
    "updatedAt": "2026-09-25T19:53:29.193Z",
    "description": "",
    "id": "art-1790363867754",
    "title": "EX-peri-peri-mental 2",
    "categorySlug": "drawing",
    "videoUrl": "",
    "images": [],
    "videoTitle": "",
    "createdAt": "2026-09-25T19:17:47.754Z",
    "categoryName": "Painting",
    "medium": "",
    "isFeatured": false,
    "order": 13
  },
  {
    "slug": "can-you-send-me-to-god-ex-peri-peri-mental",
    "categoryName": "Drawing",
    "title": "Can you send me to god? EX-peri-peri-mental",
    "year": 2025,
    "dimensions": "",
    "categorySlug": "drawing",
    "updatedAt": "2026-09-25T19:50:33.987Z",
    "videoUrl": "",
    "order": 14,
    "mediaType": "image",
    "mainImage": "/uploads/can-you-send-me-to-god-ex-peri-peri-mental-art-1790364232257.jpg",
    "notes": "",
    "createdAt": "2026-09-25T19:23:52.258Z",
    "videoTitle": "",
    "medium": "Watercolor and pen",
    "isFeatured": false,
    "description": "",
    "id": "art-1790364232257",
    "images": []
  },
  {
    "title": "EX-peri-peri-mental 4",
    "year": 2025,
    "videoUrl": "",
    "videoTitle": "",
    "slug": "ex-peri-peri-mental-4",
    "categorySlug": "drawing",
    "mediaType": "image",
    "mainImage": "/uploads/ex-peri-peri-mental-4-art-1790363971953.jpg",
    "description": "",
    "updatedAt": "2026-09-25T19:53:02.906Z",
    "isFeatured": false,
    "categoryName": "Painting",
    "id": "art-1790363971953",
    "order": 15,
    "notes": "",
    "medium": "",
    "dimensions": "",
    "createdAt": "2026-09-25T19:19:31.953Z",
    "images": []
  },
  {
    "description": "",
    "title": "EX-peri-peri-mental 3",
    "dimensions": "",
    "slug": "ex-peri-peri-mental-3",
    "order": 16,
    "year": 2025,
    "createdAt": "2026-09-25T19:18:31.637Z",
    "videoTitle": "",
    "updatedAt": "2026-09-25T19:53:14.859Z",
    "mainImage": "/uploads/ex-peri-peri-mental-3-art-1790363911637.jpg",
    "mediaType": "image",
    "notes": "",
    "categoryName": "Painting",
    "medium": "",
    "isFeatured": false,
    "videoUrl": "",
    "id": "art-1790363911637",
    "categorySlug": "drawing",
    "images": []
  },
  {
    "notes": "",
    "categoryName": "Drawing",
    "year": 2025,
    "slug": "ex-peri-peri-mental",
    "id": "art-1790088359418",
    "categorySlug": "drawing",
    "dimensions": "",
    "createdAt": "2026-09-22T14:45:59.419Z",
    "updatedAt": "2026-09-22T14:45:59.419Z",
    "title": "EX-Peri-Peri-Mental",
    "isFeatured": false,
    "mainImage": "/uploads/ex-peri-peri-mental-art-1790088359418.jpg",
    "medium": "",
    "description": "",
    "images": [
      {
        "isPrimary": true,
        "url": "/uploads/ex-peri-peri-mental-art-1790088359418-extra-0.jpg",
        "alt": "Artwork view",
        "id": "img-1790088301308-0",
        "order": 1
      }
    ],
    "order": 17
  },
  {
    "dimensions": "",
    "notes": "",
    "year": 2025,
    "slug": "ex-peri-peri-mental-3",
    "createdAt": "2026-09-22T14:57:00.272Z",
    "mainImage": "/uploads/ex-peri-peri-mental-3-art-1790089020272.jpg",
    "categorySlug": "drawing",
    "updatedAt": "2026-09-22T14:59:44.881Z",
    "title": "EX-Peri-Peri-Mental 3",
    "id": "art-1790089020272",
    "medium": "Pen and Watercolor",
    "order": 18,
    "categoryName": "Drawing",
    "isFeatured": false,
    "description": "",
    "images": [
      {
        "id": "img-1790089001615-0",
        "order": 1,
        "isPrimary": true,
        "alt": "EX-Peri-Peri-Mental 3",
        "url": "/uploads/ex-peri-peri-mental-3-art-1790089020272-extra-0.jpg"
      }
    ]
  },
  {
    "medium": "",
    "categorySlug": "drawing",
    "id": "art-1790144639767",
    "dimensions": "",
    "images": [
      {
        "url": "/uploads/gesture-art-1790144639767-extra-0.jpg",
        "alt": "Artwork view",
        "isPrimary": true,
        "order": 1,
        "id": "img-1790144624052-0"
      }
    ],
    "mainImage": "/uploads/gesture-art-1790144639767.jpg",
    "notes": "",
    "updatedAt": "2026-09-23T06:24:16.518Z",
    "categoryName": "Drawing",
    "order": 19,
    "createdAt": "2026-09-23T06:23:59.767Z",
    "isFeatured": false,
    "slug": "gesture",
    "description": "",
    "title": "Gesture",
    "year": 2025
  },
  {
    "dimensions": "",
    "categorySlug": "drawing",
    "description": "",
    "id": "art-1790089318815",
    "title": "EX-Peri-Peri-Mental 4",
    "order": 20,
    "slug": "ex-peri-peri-mental-4",
    "createdAt": "2026-09-22T15:01:58.815Z",
    "categoryName": "Drawing",
    "year": 2025,
    "updatedAt": "2026-09-22T18:22:46.017Z",
    "mainImage": "/uploads/ex-peri-peri-mental-4-art-1790089318815.jpg",
    "notes": "",
    "images": [
      {
        "order": 1,
        "isPrimary": true,
        "alt": "EX-Peri-Peri-Mental 4",
        "url": "/uploads/ex-peri-peri-mental-4-art-1790089318815-extra-0.jpg",
        "id": "img-1790089310133-0"
      }
    ],
    "medium": "Pen and Watercolor",
    "isFeatured": false
  },
  {
    "createdAt": "2026-09-23T06:27:17.302Z",
    "year": 2024,
    "images": [
      {
        "isPrimary": true,
        "url": "/uploads/study-work-art-1790144837302-extra-0.jpg",
        "id": "img-1790144815607-0",
        "alt": "Artwork view",
        "order": 1
      }
    ],
    "description": "",
    "slug": "study-work",
    "categorySlug": "drawing",
    "medium": "",
    "isFeatured": false,
    "notes": "",
    "categoryName": "Drawing",
    "dimensions": "",
    "order": 21,
    "title": "Study work",
    "id": "art-1790144837302",
    "updatedAt": "2026-09-23T06:27:39.769Z",
    "mainImage": "/uploads/study-work-art-1790144837302.jpg"
  },
  {
    "categoryName": "Drawing",
    "description": "",
    "notes": "",
    "categorySlug": "drawing",
    "updatedAt": "2026-09-23T06:28:29.832Z",
    "mainImage": "/uploads/ex-peri-peri-mental-5-art-1790144909832.jpg",
    "slug": "ex-peri-peri-mental-5",
    "dimensions": "",
    "year": 2024,
    "createdAt": "2026-09-23T06:28:29.832Z",
    "isFeatured": false,
    "medium": "",
    "title": "EX-Peri-Peri-Mental 5",
    "id": "art-1790144909832",
    "order": 22,
    "images": [
      {
        "isPrimary": true,
        "alt": "Artwork view",
        "url": "/uploads/ex-peri-peri-mental-5-art-1790144909832-extra-0.jpg",
        "id": "img-1790144888946-0",
        "order": 1
      }
    ]
  },
  {
    "medium": "Watercolor and pen",
    "categoryName": "Drawing",
    "videoUrl": "",
    "isFeatured": false,
    "mainImage": "/uploads/what-now--art-1790559895125.jpg",
    "mediaType": "image",
    "order": 23,
    "updatedAt": "2026-09-28T01:44:55.125Z",
    "images": [
      {
        "isPrimary": true,
        "alt": "What now?",
        "url": "/uploads/what-now--art-1790559895125-extra-0.jpg",
        "id": "img-1790559894880-0",
        "order": 1
      }
    ],
    "categorySlug": "drawing",
    "title": "What now?",
    "videoTitle": "",
    "description": "",
    "slug": "what-now-",
    "year": 2023,
    "notes": "",
    "createdAt": "2026-09-28T01:44:55.125Z",
    "dimensions": "",
    "id": "art-1790559895125"
  },
  {
    "categoryName": "Painting",
    "description": "",
    "notes": "",
    "categorySlug": "drawing",
    "updatedAt": "2026-09-26T06:29:46.472Z",
    "mediaType": "image",
    "mainImage": "/uploads/conversation-art-1790404186472.jpg",
    "dimensions": "",
    "slug": "conversation",
    "videoUrl": "",
    "year": 2026,
    "createdAt": "2026-09-26T06:29:46.472Z",
    "medium": "",
    "isFeatured": false,
    "title": "Conversation",
    "id": "art-1790404186472",
    "order": 24,
    "videoTitle": "",
    "images": []
  },
  {
    "description": "",
    "title": "Think",
    "dimensions": "",
    "order": 25,
    "slug": "think",
    "createdAt": "2026-09-28T01:44:55.967Z",
    "year": 2023,
    "videoTitle": "",
    "updatedAt": "2026-09-28T01:44:55.968Z",
    "mainImage": "/uploads/think-art-1790559895967.jpg",
    "mediaType": "image",
    "notes": "",
    "categoryName": "Drawing",
    "medium": "Watercolor and pen",
    "isFeatured": false,
    "id": "art-1790559895967",
    "videoUrl": "",
    "categorySlug": "drawing",
    "images": [
      {
        "url": "/uploads/think-art-1790559895967-extra-0.jpg",
        "alt": "Think",
        "order": 1,
        "isPrimary": true,
        "id": "img-1790559895760-1"
      }
    ]
  },
  {
    "createdAt": "2026-09-28T01:44:56.524Z",
    "videoTitle": "",
    "categorySlug": "drawing",
    "order": 26,
    "title": "MIdnight",
    "isFeatured": false,
    "categoryName": "Drawing",
    "images": [
      {
        "isPrimary": true,
        "order": 1,
        "id": "img-1790559896396-2",
        "url": "/uploads/midnight-art-1790559896523-extra-0.jpg",
        "alt": "MIdnight"
      }
    ],
    "year": 2023,
    "dimensions": "",
    "id": "art-1790559896523",
    "slug": "midnight",
    "medium": "Watercolor and pen",
    "description": "",
    "videoUrl": "",
    "notes": "",
    "mediaType": "image",
    "mainImage": "/uploads/midnight-art-1790559896523.jpg",
    "updatedAt": "2026-09-28T01:44:56.524Z"
  },
  {
    "dimensions": "",
    "videoUrl": "",
    "notes": "",
    "medium": "",
    "createdAt": "2026-09-27T03:00:12.089Z",
    "description": "",
    "images": [],
    "categoryName": "Painting",
    "id": "art-1790478012089",
    "mainImage": "/uploads/gesture-art-1790478012089.jpg",
    "mediaType": "image",
    "title": "gesture",
    "videoTitle": "",
    "updatedAt": "2026-09-27T03:00:12.089Z",
    "categorySlug": "drawing",
    "order": 27,
    "year": 2024,
    "slug": "gesture",
    "isFeatured": false
  },
  {
    "description": "",
    "categoryName": "Painting",
    "isFeatured": false,
    "notes": "",
    "videoUrl": "",
    "createdAt": "2026-09-26T16:22:24.006Z",
    "id": "art-1790439744006",
    "videoTitle": "",
    "categorySlug": "gesture",
    "slug": "skechbook",
    "year": 2023,
    "medium": "",
    "title": "Skechbook",
    "order": 28,
    "updatedAt": "2026-09-26T16:22:24.006Z",
    "mediaType": "image",
    "mainImage": "/uploads/skechbook-art-1790439744006.jpg",
    "dimensions": "",
    "images": []
  },
  {
    "title": "Gestture Skechhbook",
    "createdAt": "2026-09-27T14:45:59.976Z",
    "medium": "",
    "dimensions": "",
    "images": [
      {
        "order": 1,
        "alt": "সামনের দিক (Front View)",
        "url": "/uploads/gestture-skechhbook-art-1790520359975-extra-0.jpg",
        "id": "img-1790520283061-h7snb",
        "isPrimary": true
      }
    ],
    "videoUrl": "",
    "order": 29,
    "year": 2024,
    "videoTitle": "",
    "notes": "",
    "slug": "gestture-skechhbook",
    "description": "",
    "categorySlug": "gesture",
    "updatedAt": "2026-09-27T14:45:59.976Z",
    "mainImage": "/uploads/gestture-skechhbook-art-1790520359975.jpg",
    "mediaType": "image",
    "id": "art-1790520359975",
    "isFeatured": false,
    "categoryName": "Gesture"
  },
  {
    "notes": "",
    "slug": "494752359-673874468599241-6462202313813814478-n",
    "videoUrl": "",
    "createdAt": "2026-09-28T02:17:11.249Z",
    "year": 2023,
    "description": "",
    "dimensions": "",
    "isFeatured": false,
    "title": "494752359 673874468599241 6462202313813814478 N",
    "medium": "Pencil",
    "id": "art-1790561831249",
    "categorySlug": "gesture",
    "videoTitle": "",
    "updatedAt": "2026-09-28T02:17:11.250Z",
    "mainImage": "/uploads/494752359-673874468599241-6462202313813814478-n-art-1790561831249.jpg",
    "mediaType": "image",
    "order": 30,
    "images": [
      {
        "isPrimary": true,
        "alt": "494752359 673874468599241 6462202313813814478 N",
        "url": "/uploads/494752359-673874468599241-6462202313813814478-n-art-1790561831249-extra-0.jpg",
        "order": 1,
        "id": "img-1790561830964-6"
      }
    ],
    "categoryName": "Gesture"
  },
  {
    "categorySlug": "gesture",
    "dimensions": "",
    "updatedAt": "2026-09-28T02:17:10.199Z",
    "slug": "gesture-skechhbook",
    "id": "art-1790561830199",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561830199.jpg",
    "year": 2023,
    "notes": "",
    "categoryName": "Gesture",
    "videoUrl": "",
    "medium": "Pencil",
    "order": 31,
    "videoTitle": "",
    "images": [
      {
        "id": "img-1790561830003-5",
        "order": 1,
        "url": "/uploads/gesture-skechhbook-art-1790561830199-extra-0.jpg",
        "alt": "Gesture Skechhbook",
        "isPrimary": true
      }
    ],
    "description": "",
    "title": "Gesture Skechhbook",
    "isFeatured": false,
    "createdAt": "2026-09-28T02:17:10.199Z"
  },
  {
    "year": 2024,
    "description": "",
    "slug": "anatomy",
    "dimensions": "",
    "order": 32,
    "mediaType": "image",
    "mainImage": "/uploads/anatomy-art-1790561227644.jpg",
    "title": "Anatomy",
    "updatedAt": "2026-09-28T02:08:43.364Z",
    "videoUrl": "",
    "videoTitle": "",
    "medium": "Pencil",
    "categoryName": "Drawing",
    "createdAt": "2026-09-28T02:07:07.644Z",
    "images": [
      {
        "order": 1,
        "isPrimary": true,
        "url": "/uploads/anatomy-art-1790561227644-extra-0.jpg",
        "alt": "Anatomy ",
        "id": "img-1790561226073-0"
      }
    ],
    "id": "art-1790561227644",
    "isFeatured": false,
    "notes": "",
    "categorySlug": "drawing"
  },
  {
    "mediaType": "image",
    "mainImage": "/uploads/landscape-art-1790561043079.jpg",
    "medium": "Watercolor",
    "updatedAt": "2026-09-28T02:04:03.079Z",
    "id": "art-1790561043079",
    "isFeatured": false,
    "videoUrl": "",
    "notes": "",
    "images": [
      {
        "id": "img-1790561039938-5",
        "url": "/uploads/landscape-art-1790561043079-extra-0.jpg",
        "alt": "Landscape",
        "isPrimary": true,
        "order": 1
      }
    ],
    "description": "",
    "videoTitle": "",
    "categoryName": "Watercolor",
    "slug": "landscape",
    "order": 33,
    "year": 2024,
    "categorySlug": "watercolor",
    "dimensions": "",
    "title": "Landscape",
    "createdAt": "2026-09-28T02:04:03.079Z"
  },
  {
    "updatedAt": "2026-09-28T02:03:59.284Z",
    "mediaType": "image",
    "mainImage": "/uploads/landscape-art-1790561039284.jpg",
    "notes": "",
    "images": [
      {
        "alt": "Landscape",
        "url": "/uploads/landscape-art-1790561039284-extra-0.jpg",
        "isPrimary": true,
        "id": "img-1790561039120-4",
        "order": 1
      }
    ],
    "id": "art-1790561039284",
    "dimensions": "",
    "medium": "Watercolor",
    "year": 2024,
    "title": "Landscape",
    "slug": "landscape",
    "categorySlug": "watercolor",
    "isFeatured": false,
    "videoUrl": "",
    "description": "",
    "videoTitle": "",
    "createdAt": "2026-09-28T02:03:59.284Z",
    "categoryName": "Watercolor",
    "order": 34
  },
  {
    "id": "art-1790561038562",
    "title": "Landscape",
    "createdAt": "2026-09-28T02:03:58.562Z",
    "videoTitle": "",
    "isFeatured": false,
    "videoUrl": "",
    "order": 35,
    "notes": "",
    "year": 2024,
    "dimensions": "",
    "images": [
      {
        "isPrimary": true,
        "id": "img-1790561038370-3",
        "url": "/uploads/landscape-art-1790561038562-extra-0.jpg",
        "alt": "Landscape",
        "order": 1
      }
    ],
    "categorySlug": "watercolor",
    "slug": "landscape",
    "description": "",
    "categoryName": "Watercolor",
    "mediaType": "image",
    "mainImage": "/uploads/landscape-art-1790561038562.jpg",
    "medium": "Watercolor",
    "updatedAt": "2026-09-28T02:03:58.562Z"
  },
  {
    "isFeatured": false,
    "images": [
      {
        "isPrimary": true,
        "id": "img-1790561037490-2",
        "alt": "Landscape",
        "url": "/uploads/landscape-art-1790561037648-extra-0.jpg",
        "order": 1
      }
    ],
    "notes": "",
    "year": 2024,
    "videoTitle": "",
    "updatedAt": "2026-09-28T02:03:57.648Z",
    "id": "art-1790561037648",
    "slug": "landscape",
    "videoUrl": "",
    "mainImage": "/uploads/landscape-art-1790561037648.jpg",
    "mediaType": "image",
    "medium": "Watercolor",
    "createdAt": "2026-09-28T02:03:57.648Z",
    "description": "",
    "categorySlug": "watercolor",
    "title": "Landscape",
    "categoryName": "Watercolor",
    "order": 36,
    "dimensions": ""
  },
  {
    "dimensions": "",
    "year": 2024,
    "notes": "",
    "slug": "landscape",
    "mainImage": "/uploads/landscape-art-1790561036994.jpg",
    "mediaType": "image",
    "updatedAt": "2026-09-28T02:03:56.994Z",
    "description": "",
    "id": "art-1790561036994",
    "title": "Landscape",
    "categorySlug": "watercolor",
    "videoUrl": "",
    "images": [
      {
        "id": "img-1790561036885-1",
        "alt": "Landscape",
        "url": "/uploads/landscape-art-1790561036994-extra-0.jpg",
        "isPrimary": true,
        "order": 1
      }
    ],
    "videoTitle": "",
    "createdAt": "2026-09-28T02:03:56.994Z",
    "categoryName": "Watercolor",
    "isFeatured": false,
    "medium": "Watercolor",
    "order": 37
  },
  {
    "slug": "landscape",
    "categoryName": "Watercolor",
    "title": "Landscape",
    "dimensions": "",
    "year": 2024,
    "categorySlug": "watercolor",
    "updatedAt": "2026-09-28T02:03:56.345Z",
    "videoUrl": "",
    "order": 38,
    "mainImage": "/uploads/landscape-art-1790561036345.jpg",
    "mediaType": "image",
    "notes": "",
    "createdAt": "2026-09-28T02:03:56.345Z",
    "videoTitle": "",
    "medium": "Watercolor",
    "isFeatured": false,
    "description": "",
    "id": "art-1790561036345",
    "images": [
      {
        "id": "img-1790561036217-0",
        "isPrimary": true,
        "order": 1,
        "alt": "Landscape",
        "url": "/uploads/landscape-art-1790561036345-extra-0.jpg"
      }
    ]
  },
  {
    "title": "Gesture Skechhbook",
    "videoTitle": "",
    "videoUrl": "",
    "year": 2023,
    "categorySlug": "gesture",
    "slug": "gesture-skechhbook",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561834964.jpg",
    "description": "",
    "isFeatured": false,
    "updatedAt": "2026-09-28T02:17:14.964Z",
    "categoryName": "Gesture",
    "id": "art-1790561834964",
    "order": 39,
    "notes": "",
    "medium": "Pencil",
    "dimensions": "",
    "createdAt": "2026-09-28T02:17:14.964Z",
    "images": [
      {
        "isPrimary": true,
        "order": 1,
        "id": "img-1790561834847-10",
        "alt": "Gesture Skechhbook",
        "url": "/uploads/gesture-skechhbook-art-1790561834964-extra-0.jpg"
      }
    ]
  },
  {
    "isFeatured": false,
    "createdAt": "2026-09-28T02:17:14.257Z",
    "order": 40,
    "id": "art-1790561834257",
    "title": "Gesture Skechhbook",
    "videoUrl": "",
    "videoTitle": "",
    "images": [
      {
        "id": "img-1790561834049-9",
        "isPrimary": true,
        "order": 1,
        "url": "/uploads/gesture-skechhbook-art-1790561834257-extra-0.jpg",
        "alt": "Gesture Skechhbook"
      }
    ],
    "categorySlug": "gesture",
    "year": 2023,
    "slug": "gesture-skechhbook",
    "description": "",
    "updatedAt": "2026-09-28T02:17:14.257Z",
    "categoryName": "Gesture",
    "medium": "Pencil",
    "notes": "",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561834257.jpg",
    "mediaType": "image",
    "dimensions": ""
  },
  {
    "categoryName": "Gesture",
    "notes": "",
    "categorySlug": "gesture",
    "id": "art-1790561833400",
    "dimensions": "",
    "createdAt": "2026-09-28T02:17:13.400Z",
    "description": "",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561833400.jpg",
    "mediaType": "image",
    "isFeatured": false,
    "updatedAt": "2026-09-28T02:17:13.400Z",
    "title": "Gesture Skechhbook",
    "videoUrl": "",
    "images": [
      {
        "url": "/uploads/gesture-skechhbook-art-1790561833400-extra-0.jpg",
        "alt": "Gesture Skechhbook",
        "isPrimary": true,
        "id": "img-1790561833237-8",
        "order": 1
      }
    ],
    "slug": "gesture-skechhbook",
    "order": 41,
    "videoTitle": "",
    "year": 2023,
    "medium": "Pencil"
  },
  {
    "videoUrl": "",
    "images": [
      {
        "alt": "Gesture Skechhbook",
        "url": "/uploads/gesture-skechhbook-art-1790561832519-extra-0.jpg",
        "order": 1,
        "id": "img-1790561832381-7",
        "isPrimary": true
      }
    ],
    "dimensions": "",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561832519.jpg",
    "updatedAt": "2026-09-28T02:17:12.519Z",
    "slug": "gesture-skechhbook",
    "medium": "Pencil",
    "year": 2023,
    "notes": "",
    "order": 42,
    "videoTitle": "",
    "categorySlug": "gesture",
    "id": "art-1790561832519",
    "isFeatured": false,
    "createdAt": "2026-09-28T02:17:12.519Z",
    "description": "",
    "title": "Gesture Skechhbook",
    "categoryName": "Gesture"
  },
  {
    "isFeatured": false,
    "description": "",
    "videoTitle": "",
    "updatedAt": "2026-09-28T02:17:08.550Z",
    "notes": "",
    "id": "art-1790561828550",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561828550.jpg",
    "createdAt": "2026-09-28T02:17:08.550Z",
    "categorySlug": "gesture",
    "order": 43,
    "images": [
      {
        "order": 1,
        "id": "img-1790561828258-4",
        "isPrimary": true,
        "alt": "Gesture Skechhbook",
        "url": "/uploads/gesture-skechhbook-art-1790561828550-extra-0.jpg"
      }
    ],
    "categoryName": "Gesture",
    "slug": "gesture-skechhbook",
    "medium": "Pencil",
    "dimensions": "",
    "year": 2023,
    "videoUrl": "",
    "title": "Gesture Skechhbook"
  },
  {
    "updatedAt": "2026-09-28T02:17:07.242Z",
    "images": [
      {
        "url": "/uploads/gesture-skechhbook-art-1790561827242-extra-0.jpg",
        "alt": "Gesture Skechhbook",
        "isPrimary": true,
        "order": 1,
        "id": "img-1790561827058-3"
      }
    ],
    "order": 44,
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561827242.jpg",
    "id": "art-1790561827242",
    "description": "",
    "medium": "Pencil",
    "title": "Gesture Skechhbook",
    "videoUrl": "",
    "dimensions": "",
    "categorySlug": "gesture",
    "isFeatured": false,
    "categoryName": "Gesture",
    "videoTitle": "",
    "year": 2023,
    "createdAt": "2026-09-28T02:17:07.242Z",
    "notes": "",
    "slug": "gesture-skechhbook"
  },
  {
    "notes": "",
    "categoryName": "Gesture",
    "id": "art-1790561826410",
    "videoTitle": "",
    "categorySlug": "gesture",
    "createdAt": "2026-09-28T02:17:06.410Z",
    "isFeatured": false,
    "updatedAt": "2026-09-28T02:17:06.410Z",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561826410.jpg",
    "slug": "gesture-skechhbook",
    "title": "Gesture Skechhbook",
    "dimensions": "",
    "medium": "Pencil",
    "description": "",
    "year": 2023,
    "order": 45,
    "images": [
      {
        "id": "img-1790561826141-2",
        "order": 1,
        "url": "/uploads/gesture-skechhbook-art-1790561826410-extra-0.jpg",
        "alt": "Gesture Skechhbook",
        "isPrimary": true
      }
    ],
    "videoUrl": ""
  },
  {
    "id": "art-1790561825340",
    "medium": "Pencil",
    "year": 2023,
    "isFeatured": false,
    "slug": "gesture-skechhbook",
    "images": [
      {
        "isPrimary": true,
        "id": "img-1790561825070-1",
        "url": "/uploads/gesture-skechhbook-art-1790561825340-extra-0.jpg",
        "alt": "Gesture Skechhbook",
        "order": 1
      }
    ],
    "notes": "",
    "description": "",
    "updatedAt": "2026-09-28T02:17:05.340Z",
    "videoTitle": "",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561825340.jpg",
    "createdAt": "2026-09-28T02:17:05.340Z",
    "categorySlug": "gesture",
    "videoUrl": "",
    "order": 46,
    "title": "Gesture Skechhbook",
    "dimensions": "",
    "categoryName": "Gesture"
  },
  {
    "createdAt": "2026-09-28T02:17:04.145Z",
    "isFeatured": false,
    "categorySlug": "gesture",
    "videoUrl": "",
    "notes": "",
    "description": "",
    "id": "art-1790561824144",
    "categoryName": "Gesture",
    "videoTitle": "",
    "images": [
      {
        "order": 1,
        "isPrimary": true,
        "alt": "Gesture Skechhbook",
        "url": "/uploads/gesture-skechhbook-art-1790561824144-extra-0.jpg",
        "id": "img-1790561823743-0"
      }
    ],
    "year": 2023,
    "slug": "gesture-skechhbook",
    "order": 47,
    "dimensions": "",
    "title": "Gesture Skechhbook",
    "medium": "Pencil",
    "mediaType": "image",
    "mainImage": "/uploads/gesture-skechhbook-art-1790561824144.jpg",
    "updatedAt": "2026-09-28T02:17:04.145Z"
  },
  {
    "slug": "hand-and-feet",
    "id": "art-1790567097082",
    "isFeatured": false,
    "year": 2024,
    "description": "",
    "notes": "",
    "createdAt": "2026-09-28T03:44:57.082Z",
    "videoUrl": "",
    "videoTitle": "",
    "medium": "Pencil",
    "categoryName": "Drawing",
    "order": 48,
    "updatedAt": "2026-09-28T03:45:19.623Z",
    "mediaType": "image",
    "mainImage": "/uploads/hand-and-feet-art-1790567097082.jpg",
    "images": [
      {
        "isPrimary": true,
        "id": "img-1790567096935-0",
        "alt": "Hand and feet ",
        "url": "/uploads/hand-and-feet-art-1790567097082-extra-0.jpg",
        "order": 1
      }
    ],
    "dimensions": "",
    "categorySlug": "drawing",
    "title": "Hand and feet"
  },
  {
    "description": "",
    "categorySlug": "sculpture",
    "slug": "portrait",
    "title": "Portrait",
    "images": [
      {
        "order": 1,
        "id": "img-1790150119572-1",
        "isPrimary": true,
        "url": "/uploads/portrait-art-1790150143058-extra-0.jpg",
        "alt": "Artwork view"
      },
      {
        "alt": "Artwork view",
        "url": "/uploads/portrait-art-1790150143058-extra-1.jpg",
        "order": 2,
        "isPrimary": false,
        "id": "img-1790150120088-3"
      },
      {
        "id": "img-1790150119829-2",
        "isPrimary": false,
        "order": 3,
        "alt": "Artwork view",
        "url": "/uploads/portrait-art-1790150143058-extra-2.jpg"
      },
      {
        "isPrimary": false,
        "alt": "Portrait",
        "url": "/uploads/portrait-art-1790150143058-extra-3.jpg",
        "id": "img-1790150293895-0",
        "order": 4
      }
    ],
    "createdAt": "2026-09-23T07:55:43.058Z",
    "year": 2022,
    "categoryName": "Sculpture",
    "medium": "",
    "order": 49,
    "dimensions": "",
    "notes": "",
    "isFeatured": false,
    "id": "art-1790150143058",
    "mainImage": "/uploads/portrait-art-1790150143058.jpg",
    "updatedAt": "2026-09-26T07:25:40.947Z"
  },
  {
    "notes": "",
    "year": 2023,
    "medium": "",
    "dimensions": "",
    "slug": "relief",
    "images": [
      {
        "url": "/uploads/relief-art-1790566165471-extra-0.jpg",
        "alt": "সামনের মূল ভিউ (Front View)",
        "id": "img-1790566132955-o14q6",
        "order": 1,
        "isPrimary": true
      }
    ],
    "createdAt": "2026-09-28T03:29:25.471Z",
    "videoTitle": "",
    "title": "Relief",
    "updatedAt": "2026-09-28T03:29:25.471Z",
    "mediaType": "image",
    "mainImage": "/uploads/relief-art-1790566165471.jpg",
    "description": "",
    "id": "art-1790566165471",
    "categorySlug": "sculpture",
    "isFeatured": false,
    "videoUrl": "",
    "categoryName": "Sculpture",
    "order": 50
  },
  {
    "images": [
      {
        "isPrimary": false,
        "id": "img-1790567223226-zdve1",
        "alt": "সামনের মূল ভিউ (Front View)",
        "url": "/uploads/hand-modelling-art-1790567278757-extra-0.jpg",
        "order": 1
      },
      {
        "isPrimary": true,
        "order": 2,
        "url": "/uploads/hand-modelling-art-1790567278757-extra-1.jpg",
        "alt": "ভিউ 2 (475210695 604593272194028 1931331205815315519 n)",
        "id": "img-1790567223581-f7qbt"
      },
      {
        "isPrimary": false,
        "order": 3,
        "alt": "ভিউ 3 (475229316 604593192194036 6710805731616842161 n)",
        "url": "/uploads/hand-modelling-art-1790567278757-extra-2.jpg",
        "id": "img-1790567224324-5juek"
      },
      {
        "isPrimary": false,
        "alt": "ভিউ 4 (474938849 604593255527363 6892866060136524406 n)",
        "url": "/uploads/hand-modelling-art-1790567278757-extra-3.jpg",
        "id": "img-1790567225218-kja0r",
        "order": 4
      }
    ],
    "createdAt": "2026-09-28T03:47:58.757Z",
    "medium": "Clay",
    "dimensions": "",
    "id": "art-1790567278757",
    "notes": "",
    "order": 51,
    "isFeatured": false,
    "videoUrl": "",
    "categoryName": "Sculpture",
    "updatedAt": "2026-09-28T03:47:58.757Z",
    "description": "",
    "mediaType": "image",
    "mainImage": "/uploads/hand-modelling-art-1790567278757.jpg",
    "slug": "hand-modelling",
    "videoTitle": "",
    "categorySlug": "sculpture",
    "year": 2022,
    "title": "Hand Modelling"
  },
  {
    "categoryName": "Sculpture",
    "description": "",
    "videoTitle": "",
    "title": "Relief",
    "images": [
      {
        "order": 1,
        "url": "/uploads/relief-art-1790567004915-extra-0.jpg",
        "alt": "Relief",
        "id": "img-1790567004712-0",
        "isPrimary": true
      }
    ],
    "videoUrl": "",
    "isFeatured": false,
    "categorySlug": "sculpture",
    "order": 52,
    "updatedAt": "2026-09-28T03:43:24.916Z",
    "mainImage": "/uploads/relief-art-1790567004915.jpg",
    "mediaType": "image",
    "medium": "Clay",
    "createdAt": "2026-09-28T03:43:24.916Z",
    "id": "art-1790567004915",
    "dimensions": "",
    "notes": "",
    "year": 2024,
    "slug": "relief"
  },
  {
    "year": 2024,
    "notes": "",
    "updatedAt": "2026-09-29T05:21:41.776Z",
    "images": [
      {
        "isPrimary": true,
        "id": "img-1790659229835-d56hn",
        "order": 1,
        "url": "https://res.cloudinary.com/o1yfme6l/image/upload/v1790659232/s0khdwfrecq79wynpkel.png",
        "alt": "সামনের মূল ভিউ (Front View)"
      },
      {
        "url": "https://res.cloudinary.com/o1yfme6l/image/upload/v1790659245/gcerxp82lzp867elp5cd.png",
        "alt": "ভিউ 2 (486013705 643112481675440 7396748989964166815 n removebg)",
        "isPrimary": false,
        "order": 2,
        "id": "img-1790659242516-fzg1b"
      }
    ],
    "slug": "shelter-",
    "videoTitle": "",
    "mediaType": "image",
    "mainImage": "https://res.cloudinary.com/o1yfme6l/image/upload/v1790659232/s0khdwfrecq79wynpkel.png",
    "categoryName": "Sculpture",
    "isFeatured": false,
    "medium": "Rasin ",
    "categorySlug": "sculpture",
    "title": "Shelter ",
    "dimensions": "",
    "videoUrl": "",
    "description": "",
    "createdAt": "2026-09-29T05:21:41.776Z",
    "id": "art-1790659301776",
    "order": 53
  },
  {
    "categoryName": "Sculpture",
    "description": "",
    "videoTitle": "",
    "title": "Shelter",
    "images": [
      {
        "id": "img-1790612534876-jx4v2",
        "isPrimary": true,
        "alt": "সামনের মূল ভিউ (Front View)",
        "url": "https://res.cloudinary.com/o1yfme6l/image/upload/v1790612537/veen7ihnih9qleyrystr.jpg",
        "order": 1
      },
      {
        "url": "https://res.cloudinary.com/o1yfme6l/image/upload/v1790612539/aqti4m2wuxj6ajh7fnsp.jpg",
        "alt": "ভিউ 2 (35614431 696d 41fa b6c8 54f2b002cace)",
        "isPrimary": false,
        "order": 2,
        "id": "img-1790612536718-so7fa"
      }
    ],
    "videoUrl": "",
    "isFeatured": false,
    "categorySlug": "sculpture",
    "updatedAt": "2026-09-28T16:22:54.067Z",
    "mainImage": "https://res.cloudinary.com/o1yfme6l/image/upload/v1790612537/veen7ihnih9qleyrystr.jpg",
    "mediaType": "image",
    "medium": "Clay",
    "createdAt": "2026-09-28T16:22:54.067Z",
    "id": "art-1790612574067",
    "dimensions": "",
    "notes": "",
    "year": 2024,
    "slug": "shelter",
    "order": 54
  }
];

export const defaultExhibitions: Exhibition[] = [
  {
    id: 'ex-1',
    title: 'The Material Unconscious',
    year: 2025,
    dateString: 'October 12, 2024 — January 18, 2025',
    venue: 'Palais des Arts Contemporains',
    location: 'Paris, France',
    type: 'Solo',
    description: 'A major solo presentation gathering ten monumental paintings and four new bronze cast works exploring subterranean memory and material transience. Curated by Hélène D’Orsay.',
    externalLink: 'https://example.com/exhibitions/palais-des-arts-oliva-biswas',
    order: 1,
  },
  {
    id: 'ex-2',
    title: 'Vessel and Void: Tactile Geologies',
    year: 2024,
    dateString: 'May 4 — June 28, 2024',
    venue: 'Gallery Modernist',
    location: 'London, United Kingdom',
    type: 'Solo',
    description: 'Solo exhibition focusing on monochromatic stratification, raw chalk pigments, and tectonic stone installations.',
    order: 2,
  },
  {
    id: 'ex-3',
    title: 'Subterranean Frequencies',
    year: 2024,
    dateString: 'April 20 — November 24, 2024',
    venue: '60th International Art Exhibition — La Biennale di Venezia',
    location: 'Venice, Italy',
    type: 'Biennial',
    description: 'Collateral exhibition featuring Oliva Biswas’s site-specific sea-spray weathering scrolls inside the historic Arsenale North basin.',
    externalLink: 'https://example.com/biennale-arte-collateral',
    order: 3,
  },
  {
    id: 'ex-4',
    title: 'Forms of Silence',
    year: 2023,
    dateString: 'September 15 — November 12, 2023',
    venue: 'The Drawing Center',
    location: 'New York, NY, USA',
    type: 'Solo',
    description: 'Survey of large-scale graphite and Japanese ink drawings examining bodily respiration and the limits of tactile mark-making on handmade washi.',
    order: 4,
  },
  {
    id: 'ex-5',
    title: 'Liminal Geographies: Materialities of Absence',
    year: 2022,
    dateString: 'March 10 — May 22, 2022',
    venue: 'Mori Contemporary',
    location: 'Tokyo, Japan',
    type: 'Group',
    description: 'Curated international group exhibition exploring architectural scale, shadow, and mineral permanence alongside works by Lee Ufan and Rachel Whiteread.',
    order: 5,
  },
];

export const defaultAbout: AboutContent = {
  biography: `Oliva Biswas (b. 1991) is a contemporary multidisciplinary artist whose practice spans painting, drawing, sculpture, and atmospheric material interventions. Working between studios in Paris and New York, Biswas interrogates the relationship between geologic duration, tactile memory, and bodily presence.\n\nRooted in an uncompromising commitment to raw matter, her works reject synthetic uniformity in favor of hand-collected mineral pigments, pulverized basalt, French ochres, beeswax, volcanic ash, and cold wax. Over prolonged temporal cycles—often extending over several seasons—Biswas layers, burns, dissolves, and reconstructs her surfaces, producing works that exist not as passive representations, but as active geological records.\n\nHer work has been exhibited internationally across major institutions including the Palais des Arts Contemporains in Paris, The Drawing Center in New York, and during the 60th Venice Biennale. Her pieces reside in distinguished private and public collections across Europe, North America, and East Asia.`,
  statement: `To paint or sculpt is not to decorate space; it is to interrogate the gravity of matter. I am drawn to materials that bear scars of time—unrefined earth pigments, charred oak, volcanic basalt, salt crust, and beeswax that contracts with temperature.\n\nIn my studio, making is an act of listening to the inherent physical logic of the substrate. When pigment meets linseed oil or wax, chemical transmutations take place that no human hand can fully premeditate. My responsibility is to create the conditions for silence to articulate itself: an acoustic quiet where the weight of a brush mark or the fissure in drying chalk carries tectonic consequence.`,
  education: `MFA in Fine Arts (Painting & Sculpture), Yale School of Art, New Haven, CT (2018)\nBFA in Fine Arts, Rhode Island School of Design (RISD), Providence, RI (2015)\nClassical Drawing Apprentice, Studio Simi, Florence, Italy (2013)`,
  awards: `Pollock-Krasner Foundation Grant (2023)\nGuggenheim Fellowship Nominee in Fine Arts (2024)\nJoan Mitchell Foundation Emerging Artist Fellowship (2021)\nElizabeth Greenshields Foundation Award (2019, 2017)\nYale School of Art Al Held Fellowship (2018)`,
  residencies: `Villa Medici — French Academy in Rome, Italy (2024)\nMacDowell Fellowship, Peterborough, NH, USA (2022)\nSkowhegan School of Painting & Sculpture, Madison, ME, USA (2019)\nCité Internationale des Arts, Paris, France (2017)`,
  collections: `Fondation d'Art Contemporain, Paris, France\nMoMA Contemporary Drawing Archives, New York, USA\nTate Modern Research Library & Special Collections, London, UK\nFondazione Sandretto Re Rebaudengo, Turin, Italy\nPrivate collections in Paris, London, Basel, Seoul, New York, and Tokyo`,
  press: `The Art Newspaper: "The Tactile Radicalism of Oliva Biswas" by Claire Vasseur (2024)\nFrieze: "Review: The Material Unconscious at Palais des Arts" (2024)\nArtforum: Critics' Picks — Oliva Biswas at The Drawing Center (2023)\nBomb Magazine: In Conversation: Oliva Biswas and Hans Ulrich Obrist (2022)`,
  portraitImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
};

export const defaultCV: CVDoc = {
  id: 'cv-initial',
  url: '/uploads/Oliva_Biswas_CV_2025.pdf',
  filename: 'Oliva_Biswas_Curriculum_Vitae_2025.pdf',
  uploadedAt: new Date().toISOString(),
  sizeBytes: 184520,
};

export const defaultSocialLinks: SocialLink[] = [
  {
    id: 'soc-ig',
    platform: 'Instagram',
    label: '@olivabiswas.studio',
    url: 'https://instagram.com/olivabiswas.studio',
    isEnabled: true,
  },
  {
    id: 'soc-li',
    platform: 'LinkedIn',
    label: 'Oliva Biswas',
    url: 'https://linkedin.com/in/olivabiswas',
    isEnabled: true,
  },
  {
    id: 'soc-be',
    platform: 'Behance',
    label: 'Oliva Biswas Portfolio',
    url: 'https://behance.net/olivabiswas',
    isEnabled: true,
  },
];

export const defaultSettings: SiteSettings = {
  artistName: 'OLIVA BISWAS',
  siteTitle: 'Oliva Biswas — Contemporary Artist',
  headerSubtitle: 'Contemporary Art',
  tagline: 'Painting · Drawing · Sculpture · Experimental Practice',
  coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=2400&auto=format&fit=crop',
  coverTagline: 'Selected Works & Archive',
  enterButtonText: 'ENTER',
  showCoverOnLanding: true,
  customYears: ['2025', '2024', '2023', '2022', '2021', '2020'],
  contactEmail: 'studio@olivabiswas.com',
  studioLocation: 'Paris / New York',
  metaDescription: 'Official portfolio of contemporary artist Oliva Biswas. Exhibitions, painting, drawing, sculpture, digital and experimental work.',
  seoKeywords: 'Oliva Biswas, Contemporary Artist, Fine Art, Painting, Sculpture, Drawing, Biennale, Museum Exhibition',
  instagramUrl: 'https://instagram.com/olivabiswas.studio',
  coverNamePosition: 'bottom-left',
  coverEnterPosition: 'bottom-right',
  coverNameFontSize: '8xl',
  coverSubtitleFontSize: 'sm',
  coverEnterFontSize: 'sm',
  coverFontFamily: 'sans',
  coverNameLetterSpacing: 'wider',
  coverEnterShape: 'rectangle',
  coverNameColor: '#ffffff',
  coverSubtitleColor: '#e5e5e5',
  coverEnterTextColor: '#ffffff',
  coverEnterBgColor: 'transparent',
  coverEnterBorderColor: '#ffffff',
  coverOverlayStyle: 'gradient',
};

export const defaultMessages: ContactMessage[] = [
  {
    id: 'msg-demo-1',
    name: 'Sophie Laurent',
    email: 'slaurent@galeriemoderne.fr',
    subject: 'Exhibition catalogue inquiry — Paris Autumn 2025',
    message: 'Dear Oliva, we were captivated by your presentation at Palais des Arts. We would love to discuss a studio visit next month when you are in Paris.',
    receivedAt: '2025-01-14T11:24:00.000Z',
    read: true,
  },
];

export const defaultPortfolioData: PortfolioData = {
  settings: defaultSettings,
  categories: defaultCategories,
  artworks: defaultArtworks,
  years: ['2025', '2024', '2023', '2022', '2021', '2020'],
  exhibitions: defaultExhibitions,
  about: defaultAbout,
  cv: defaultCV,
  socialLinks: defaultSocialLinks,
  messages: defaultMessages,
  inquiries: defaultMessages,
};

const STORAGE_KEY = 'oliva_biswas_portfolio_v2';
const ADMIN_PASS_KEY = 'oliva_biswas_admin_pass';
const ADMIN_USERNAME_KEY = 'oliva_biswas_admin_username_cfg';

const IDB_DATA_NAME = 'OlivaBiswasPortfolioDataDB';
const IDB_DATA_STORE = 'portfolio_store';

let inMemoryDataCache: PortfolioData | null = null;
let idbDataPromise: Promise<IDBDatabase> | null = null;

function getPortfolioIDB(): Promise<IDBDatabase> {
  if (idbDataPromise) return idbDataPromise;
  idbDataPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(IDB_DATA_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_DATA_STORE)) {
        db.createObjectStore(IDB_DATA_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbDataPromise;
}

export async function savePortfolioToIndexedDB(data: PortfolioData): Promise<void> {
  try {
    const db = await getPortfolioIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_DATA_STORE, 'readwrite');
      const store = tx.objectStore(IDB_DATA_STORE);
      const req = store.put(data, 'main_portfolio');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB portfolio save note:', err);
  }
}

export async function loadPortfolioFromIndexedDB(): Promise<PortfolioData | null> {
  try {
    const db = await getPortfolioIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_DATA_STORE, 'readonly');
      const store = tx.objectStore(IDB_DATA_STORE);
      const req = store.get('main_portfolio');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export function getLocalPortfolioData(): PortfolioData {
  if (typeof window === 'undefined') return defaultPortfolioData;
  if (inMemoryDataCache) return inMemoryDataCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      inMemoryDataCache = defaultPortfolioData;
      // Kick off background IndexedDB load
      loadPortfolioFromIndexedDB().then(idb => {
        if (idb) {
          inMemoryDataCache = idb;
        } else {
          savePortfolioToIndexedDB(defaultPortfolioData).catch(() => {});
        }
      });
      return defaultPortfolioData;
    }
    const parsed = JSON.parse(raw);
    const rawArtworks = Array.isArray(parsed.artworks) ? parsed.artworks : [];
    const cleanArtworks = rawArtworks.filter((a: any) => a && !DUMMY_DEFAULT_ARTWORK_IDS.has(a.id));

    const data: PortfolioData = {
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaultCategories,
      artworks: cleanArtworks,
      years: parsed.years || defaultPortfolioData.years,
      exhibitions: Array.isArray(parsed.exhibitions) ? parsed.exhibitions : defaultExhibitions,
      about: { ...defaultAbout, ...(parsed.about || {}) },
      cv: parsed.cv !== undefined ? parsed.cv : defaultCV,
      socialLinks: parsed.socialLinks || defaultSocialLinks,
      messages: parsed.messages || defaultMessages,
      inquiries: parsed.inquiries || parsed.messages || defaultMessages,
    };
    inMemoryDataCache = data;

    // Check if IndexedDB has more complete/recent data
    loadPortfolioFromIndexedDB().then(idb => {
      if (idb && idb.artworks && idb.artworks.length > data.artworks.length) {
        const idbArtworks = (idb.artworks || []).filter((a: any) => a && !DUMMY_DEFAULT_ARTWORK_IDS.has(a.id));
        inMemoryDataCache = {
          ...data,
          ...idb,
          artworks: idbArtworks,
        };
      }
    });

    return data;
  } catch (err) {
    console.error('Failed to parse local portfolio data:', err);
    return defaultPortfolioData;
  }
}

export async function getLocalPortfolioDataAsync(): Promise<PortfolioData> {
  const idbData = await loadPortfolioFromIndexedDB();
  if (idbData && (idbData.artworks?.length || idbData.settings)) {
    const rawIdbArtworks = Array.isArray(idbData.artworks) ? idbData.artworks : [];
    const cleanIdbArtworks = rawIdbArtworks.filter((a: any) => a && !DUMMY_DEFAULT_ARTWORK_IDS.has(a.id));

    const merged: PortfolioData = {
      settings: { ...defaultSettings, ...(idbData.settings || {}) },
      categories: Array.isArray(idbData.categories) && idbData.categories.length > 0 ? idbData.categories : defaultCategories,
      artworks: cleanIdbArtworks,
      years: idbData.years || defaultPortfolioData.years,
      exhibitions: Array.isArray(idbData.exhibitions) && idbData.exhibitions.length > 0 ? idbData.exhibitions : defaultExhibitions,
      about: { ...defaultAbout, ...(idbData.about || {}) },
      cv: idbData.cv !== undefined ? idbData.cv : defaultCV,
      socialLinks: idbData.socialLinks || defaultSocialLinks,
      messages: idbData.messages || defaultMessages,
      inquiries: idbData.inquiries || defaultMessages,
    };
    inMemoryDataCache = merged;
    return merged;
  }
  return getLocalPortfolioData();
}

export function saveLocalPortfolioData(data: PortfolioData): void {
  inMemoryDataCache = data;
  if (typeof window === 'undefined') return;

  // 1. Always persist to IndexedDB (no 5MB limit, handles 100MB+ of photos safely)
  savePortfolioToIndexedDB(data).catch(() => {});

  // 2. Persist to localStorage with safety catch for quota
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage quota limit reached. Preserved completely in IndexedDB cache.', err);
    try {
      // Keep lightweight metadata in localStorage without large base64 strings
      const lightweightArtworks = (data.artworks || []).map(a => {
        const isBig = a.mainImage && a.mainImage.length > 30000;
        return {
          ...a,
          mainImage: isBig ? '' : a.mainImage,
          images: (a.images || []).map(img => ({
            ...img,
            url: img.url && img.url.length > 30000 ? '' : img.url,
          })),
        };
      });
      const safeData = {
        ...data,
        artworks: lightweightArtworks,
        messages: (data.messages || []).slice(0, 5),
        inquiries: (data.inquiries || []).slice(0, 5),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    } catch {
      // IndexedDB has already safely saved the entire dataset
    }
  }
}

export async function saveLocalPortfolioDataAsync(data: PortfolioData): Promise<void> {
  inMemoryDataCache = data;
  if (typeof window === 'undefined') return;
  await savePortfolioToIndexedDB(data);
  saveLocalPortfolioData(data);
}

export function getLocalAdminPassword(): string {
  if (typeof window === 'undefined') return 'oliva23';
  return localStorage.getItem(ADMIN_PASS_KEY) || 'oliva23';
}

export function setLocalAdminPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASS_KEY, password);
}

export function getLocalAdminUsername(): string {
  if (typeof window === 'undefined') return 'olivabiswas';
  return localStorage.getItem(ADMIN_USERNAME_KEY) || 'olivabiswas';
}

export function setLocalAdminUsername(username: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_USERNAME_KEY, username.trim());
}
