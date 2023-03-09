export const mockConceptsResponse = {
  "entities": [
    {
      entityType: "http://example.org/Office-0.0.1/Office",
      relatedConcepts: [
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/Sneakers",
          count: 2,
        },
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/BasketballShoes",
          count: 1,
        },
      ],
    },
    {
      entityType: "http://example.org/Customer-0.0.1/Customer",
      relatedConcepts: [
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/BasketballShoes",
          count: 1,
        },
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/Boot",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Polyester",
          count: 1,
        },
      ],
    },
    {
      entityType: "http://example.org/BabyRegistry-0.0.1/BabyRegistry",
      relatedConcepts: [
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/Boot",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Polyester",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Wool",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Silk",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/SkinAndLeather",
          count: 1,
        },
      ],
    },
    {
      entityType: "http://example.org/BabyRegistry-0.0.1/Client",
      relatedConcepts: [
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Polyester",
          count: 1,
        },
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/Sneakers",
          count: 2,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Mohair",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/Linen",
          count: 1,
        },
        {
          conceptClass: "ClothStyle",
          conceptId: "http://www.example.com/Category/SkinAndLeather",
          count: 1,
        },
        {
          conceptClass: "ShoeType",
          conceptId: "http://www.example.com/Category/Boot",
          count: 1,
        },
      ],
    },
  ],
};
