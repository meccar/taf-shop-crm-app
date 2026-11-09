import { APP_ASSETS } from "@/lib/constants/assets";
import type {
  StoreFormat,
  StoreStatus,
} from "@/features/stores/types/store.types";
import type {
  CategoryIconKey,
  CategoryStatus,
} from "@/features/categories/types/category.types";
import type { ProductStatus } from "@/features/products/types/product.types";
import type { ActivityLogItem } from "@/features/dashboard/types/dashboard.types";
import type { WorkspaceSettings } from "@/features/settings/types/settings.types";

export interface StoreRecord {
  id: string;
  code: string;
  name: string;
  slug: string;
  format: StoreFormat;
  description: string | null;
  address: string;
  cityStateZip: string;
  phone: string | null;
  email: string | null;
  managerName: string;
  managerEmail: string;
  taxRate: number;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: CategoryIconKey;
  posOrder: number;
  status: CategoryStatus;
  appliesToAllStores: boolean;
  storeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockDatabaseState {
  stores: StoreRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  activityLogs: ActivityLogItem[];
  settings: WorkspaceSettings;
}

export function createInitialSeedState(): MockDatabaseState {
  const now = Date.now();
  const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
  const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

  const stores: StoreRecord[] = [
    {
      id: "store-1",
      code: "#STR-01",
      name: "Downtown Flagship",
      slug: "downtown-flagship",
      format: "FLAGSHIP",
      description: "Omnichannel Retail Node • 2 Floored Flagship",
      address: "742 Evergreen Blvd, Suite 100",
      cityStateZip: "Downtown Core District, CA 90210",
      phone: "+1 (213) 555-0140",
      email: "downtown@shopcrm.internal",
      managerName: "Sarah Jenkins",
      managerEmail: "sarah.j@shopcrm.internal",
      taxRate: 9.5,
      status: "ACTIVE",
      createdAt: daysAgo(180),
      updatedAt: minsAgo(10),
    },
    {
      id: "store-2",
      code: "#STR-02",
      name: "Westside Shopping Mall",
      slug: "westside-shopping-mall",
      format: "MALL",
      description: "Enclosed Mall Boutique • Standard Lineup",
      address: "1200 Westside Ave, Level 2, Unit 204",
      cityStateZip: "Westside Galleria, CA 90064",
      phone: "+1 (310) 555-0182",
      email: "westside@shopcrm.internal",
      managerName: "Marcus Vance",
      managerEmail: "marcus.v@shopcrm.internal",
      taxRate: 9.5,
      status: "ACTIVE",
      createdAt: daysAgo(145),
      updatedAt: hoursAgo(1),
    },
    {
      id: "store-3",
      code: "#STR-03",
      name: "Metro North Outlet",
      slug: "metro-north-outlet",
      format: "OUTLET",
      description: "Factory Outlet Clearance & Overstock",
      address: "8840 Northway Plaza, Bay 14",
      cityStateZip: "North District Commercial Hub, CA 91402",
      phone: "+1 (818) 555-0199",
      email: "metronorth@shopcrm.internal",
      managerName: "Elena Rostova",
      managerEmail: "elena.r@shopcrm.internal",
      taxRate: 8.75,
      status: "ACTIVE",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
    },
    {
      id: "store-4",
      code: "#STR-04",
      name: "Harbor Pop-up Shop",
      slug: "harbor-popup-shop",
      format: "POPUP",
      description: "Seasonal Waterfront Stand • Hardware Pending",
      address: "Pier 17 Pavilion, Boardwalk",
      cityStateZip: "Harborfront Promenade, CA 90401",
      phone: "+1 (310) 555-0124",
      email: "harbor@shopcrm.internal",
      managerName: "Sarah Jenkins",
      managerEmail: "sarah.j@shopcrm.internal",
      taxRate: 10.25,
      status: "INACTIVE",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
  ];

  const categories: CategoryRecord[] = [
    {
      id: "cat-1",
      name: "Kitchenware & Dining",
      slug: "kitchenware-dining",
      description: "Cookware, ceramics, tableware, and insulated drinkware.",
      iconKey: "utensils",
      posOrder: 1,
      status: "ACTIVE",
      appliesToAllStores: true,
      storeIds: ["store-1", "store-2", "store-3", "store-4"],
      createdAt: daysAgo(160),
      updatedAt: hoursAgo(2),
    },
    {
      id: "cat-2",
      name: "Apparel & Bags",
      slug: "apparel-bags",
      description:
        "Everyday canvas totes, eco-friendly apparel, and wearables.",
      iconKey: "shirt",
      posOrder: 2,
      status: "ACTIVE",
      appliesToAllStores: false,
      storeIds: ["store-1", "store-2", "store-3"],
      createdAt: daysAgo(155),
      updatedAt: hoursAgo(5),
    },
    {
      id: "cat-3",
      name: "Home Goods & Decor",
      slug: "home-goods-decor",
      description: "Candles, aroma diffusers, planters, and ambient lighting.",
      iconKey: "lamp",
      posOrder: 3,
      status: "ACTIVE",
      appliesToAllStores: true,
      storeIds: ["store-1", "store-2", "store-3", "store-4"],
      createdAt: daysAgo(150),
      updatedAt: hoursAgo(6),
    },
    {
      id: "cat-4",
      name: "Office & Stationery",
      slug: "office-stationery",
      description: "Desk mats, vegan leather accessories, and desk organizers.",
      iconKey: "pen-tool",
      posOrder: 4,
      status: "ACTIVE",
      appliesToAllStores: true,
      storeIds: ["store-1", "store-2", "store-3", "store-4"],
      createdAt: daysAgo(140),
      updatedAt: daysAgo(1),
    },
    {
      id: "cat-5",
      name: "Health & Personal Care",
      slug: "health-personal-care",
      description: "Organic soaps, balms, and natural skincare items.",
      iconKey: "sparkles",
      posOrder: 5,
      status: "ACTIVE",
      appliesToAllStores: false,
      storeIds: ["store-1", "store-2"],
      createdAt: daysAgo(130),
      updatedAt: daysAgo(2),
    },
    {
      id: "cat-6",
      name: "Seasonal & Outdoor",
      slug: "seasonal-outdoor",
      description: "Summer outdoor goods, picnic sets, and seasonal specials.",
      iconKey: "sun",
      posOrder: 6,
      status: "ACTIVE",
      appliesToAllStores: true,
      storeIds: ["store-1", "store-2", "store-3", "store-4"],
      createdAt: daysAgo(120),
      updatedAt: daysAgo(3),
    },
    {
      id: "cat-7",
      name: "Specialty Gifts",
      slug: "specialty-gifts",
      description: "Curated holiday bundles, greeting cards, and gift wrap.",
      iconKey: "gift",
      posOrder: 7,
      status: "ACTIVE",
      appliesToAllStores: true,
      storeIds: ["store-1", "store-2", "store-3", "store-4"],
      createdAt: daysAgo(110),
      updatedAt: daysAgo(4),
    },
    {
      id: "cat-8",
      name: "Archive / Clearance",
      slug: "archive-clearance",
      description: "Discontinued lines and end-of-season closeout stock.",
      iconKey: "archive",
      posOrder: 8,
      status: "INACTIVE",
      appliesToAllStores: false,
      storeIds: ["store-3"],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(12),
    },
  ];

  const products: ProductRecord[] = [
    // Downtown Flagship (store-1)
    {
      id: "prod-101",
      storeId: "store-1",
      categoryId: "cat-1",
      name: "Matte Navy Pour-Over Stoneware Kettle",
      sku: "KIT-KTL-001",
      description:
        "Hand-glazed matte navy ceramic pour-over kettle with precision gooseneck spout (850ml).",
      price: 68.0,
      stockQuantity: 42,
      lowStockThreshold: 12,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.ceramicKettle,
      createdAt: daysAgo(45),
      updatedAt: minsAgo(14),
    },
    {
      id: "prod-102",
      storeId: "store-1",
      categoryId: "cat-2",
      name: "Heavyweight Ecru Utility Canvas Tote",
      sku: "APP-TOT-014",
      description:
        "18oz organic cotton canvas everyday carryall with reinforced navy webbing handles and interior key clip.",
      price: 44.0,
      stockQuantity: 64,
      lowStockThreshold: 15,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.canvasTote,
      createdAt: daysAgo(40),
      updatedAt: minsAgo(38),
    },
    {
      id: "prod-103",
      storeId: "store-1",
      categoryId: "cat-3",
      name: "Architectural Stoneware Ultrasonic Diffuser",
      sku: "HOM-DIF-008",
      description:
        "Matte white fluted ceramic aroma diffuser paired with 15ml cedarwood & lavender botanical oil.",
      price: 92.0,
      stockQuantity: 7,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.aromaDiffuser,
      createdAt: daysAgo(35),
      updatedAt: hoursAgo(2),
    },
    {
      id: "prod-104",
      storeId: "store-1",
      categoryId: "cat-1",
      name: "Double-Wall Insulated Espresso Tumbler (Set of 2)",
      sku: "KIT-TMB-022",
      description:
        "Stackable kiln-fired ceramic espresso tumblers keeping beverages hot without exterior condensation.",
      price: 34.0,
      stockQuantity: 29,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.ceramicKettle,
      createdAt: daysAgo(32),
      updatedAt: hoursAgo(4),
    },
    {
      id: "prod-105",
      storeId: "store-1",
      categoryId: "cat-4",
      name: "Pebbled Vegan Leather Desk Folio Pad",
      sku: "OFF-DSK-003",
      description:
        "Water-resistant slate desk mat with magnetic cable channel and microfiber backing (80cm x 40cm).",
      price: 56.0,
      stockQuantity: 5,
      lowStockThreshold: 8,
      status: "ACTIVE",
      imageUrl: null,
      createdAt: daysAgo(29),
      updatedAt: hoursAgo(6),
    },
    {
      id: "prod-106",
      storeId: "store-1",
      categoryId: "cat-5",
      name: "Cold-Pressed Hinoki & Bergamot Hand Wash",
      sku: "HPC-WSH-019",
      description:
        "Refillable 500ml amber glass apothecary pump bottle formulated with oat amino surfactants.",
      price: 28.0,
      stockQuantity: 51,
      lowStockThreshold: 12,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.aromaDiffuser,
      createdAt: daysAgo(27),
      updatedAt: hoursAgo(11),
    },
    {
      id: "prod-107",
      storeId: "store-1",
      categoryId: "cat-6",
      name: "Woven Waterproof Harbor Picnic Blanket",
      sku: "SEA-BLN-005",
      description:
        "Recycled ripstop backing with brushed herringbone cotton top layer and carry strap.",
      price: 78.0,
      stockQuantity: 18,
      lowStockThreshold: 8,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.canvasTote,
      createdAt: daysAgo(24),
      updatedAt: daysAgo(1),
    },
    {
      id: "prod-108",
      storeId: "store-1",
      categoryId: "cat-7",
      name: "Artisan Morning Pour-Over Gift Box",
      sku: "GFT-BOX-011",
      description:
        "Curated gift bundle containing stoneware dripper, unbleached filters, and brass scoop.",
      price: 115.0,
      stockQuantity: 0,
      lowStockThreshold: 6,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.ceramicKettle,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(1),
    },
    {
      id: "prod-109",
      storeId: "store-1",
      categoryId: "cat-4",
      name: "Machined Aluminum Pen Tray & Paperweight",
      sku: "OFF-TRY-017",
      description:
        "Anodized brushed aluminum desk tray milled with three precision pen grooves.",
      price: 42.0,
      stockQuantity: 23,
      lowStockThreshold: 8,
      status: "ACTIVE",
      imageUrl: null,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(2),
    },
    {
      id: "prod-110",
      storeId: "store-1",
      categoryId: "cat-3",
      name: "Hand-Poured Vetiver & Fig Soy Candle",
      sku: "HOM-CND-031",
      description:
        "60-hour clean-burning natural soy wax candle housed in a reusable stoneware vessel.",
      price: 38.0,
      stockQuantity: 4,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.aromaDiffuser,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(2),
    },
    {
      id: "prod-111",
      storeId: "store-1",
      categoryId: "cat-2",
      name: "Merino Ribbed Commuter Beanie — Navy",
      sku: "APP-BNE-042",
      description: "100% ethically sourced extra-fine merino wool knit cap.",
      price: 36.0,
      stockQuantity: 31,
      lowStockThreshold: 10,
      status: "DRAFT",
      imageUrl: null,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(3),
    },
    {
      id: "prod-112",
      storeId: "store-1",
      categoryId: "cat-7",
      name: "Letterpress Geometric Note Card Set (8-Pack)",
      sku: "GFT-CRD-009",
      description:
        "Heavy cotton rag stationery printed on vintage Heidelberg presses with kraft envelopes.",
      price: 24.0,
      stockQuantity: 47,
      lowStockThreshold: 12,
      status: "ACTIVE",
      imageUrl: null,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(4),
    },

    // Westside Shopping Mall (store-2)
    {
      id: "prod-201",
      storeId: "store-2",
      categoryId: "cat-2",
      name: "Heavyweight Ecru Utility Canvas Tote",
      sku: "WSM-TOT-014",
      description:
        "Mall boutique allocation of the 18oz everyday organic canvas tote.",
      price: 44.0,
      stockQuantity: 38,
      lowStockThreshold: 12,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.canvasTote,
      createdAt: daysAgo(40),
      updatedAt: hoursAgo(1),
    },
    {
      id: "prod-202",
      storeId: "store-2",
      categoryId: "cat-3",
      name: "Architectural Stoneware Ultrasonic Diffuser",
      sku: "WSM-DIF-008",
      description:
        "Matte white fluted ceramic aroma diffuser with starter botanical essence.",
      price: 92.0,
      stockQuantity: 19,
      lowStockThreshold: 8,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.aromaDiffuser,
      createdAt: daysAgo(35),
      updatedAt: hoursAgo(3),
    },
    {
      id: "prod-203",
      storeId: "store-2",
      categoryId: "cat-1",
      name: "Matte Navy Pour-Over Stoneware Kettle",
      sku: "WSM-KTL-001",
      description: "Precision gooseneck ceramic pour-over kettle.",
      price: 68.0,
      stockQuantity: 6,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.ceramicKettle,
      createdAt: daysAgo(30),
      updatedAt: hoursAgo(7),
    },
    {
      id: "prod-204",
      storeId: "store-2",
      categoryId: "cat-5",
      name: "Botanical Shea & Rosemary Cuticle Balm",
      sku: "WSM-BLM-012",
      description: "Concentrated travel tin hand salve.",
      price: 22.0,
      stockQuantity: 44,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: null,
      createdAt: daysAgo(22),
      updatedAt: daysAgo(1),
    },
    {
      id: "prod-205",
      storeId: "store-2",
      categoryId: "cat-4",
      name: "Dot-Grid Layflat Hardcover Notebook",
      sku: "WSM-NTB-006",
      description:
        "120gsm fountain-pen friendly Japanese paper with linen bookcloth cover.",
      price: 26.0,
      stockQuantity: 0,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: null,
      createdAt: daysAgo(19),
      updatedAt: daysAgo(2),
    },

    // Metro North Outlet (store-3)
    {
      id: "prod-301",
      storeId: "store-3",
      categoryId: "cat-1",
      name: "Past-Season Slate Stoneware Serving Platter",
      sku: "MNO-PLT-088",
      description: "Factory overstock 14-inch oval stoneware serving platter.",
      price: 39.0,
      stockQuantity: 27,
      lowStockThreshold: 8,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.ceramicKettle,
      createdAt: daysAgo(28),
      updatedAt: daysAgo(1),
    },
    {
      id: "prod-302",
      storeId: "store-3",
      categoryId: "cat-2",
      name: "Weekender Waxed Canvas Duffel — Outlet Edition",
      sku: "MNO-DFL-051",
      description: "Water-repellent waxed canvas carry-on bag.",
      price: 98.0,
      stockQuantity: 4,
      lowStockThreshold: 6,
      status: "ACTIVE",
      imageUrl: APP_ASSETS.products.canvasTote,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(1),
    },
    {
      id: "prod-303",
      storeId: "store-3",
      categoryId: "cat-6",
      name: "Insulated Stainless Trail Flask (1L)",
      sku: "MNO-FLK-019",
      description: "Powder-coated vacuum insulated outdoor bottle.",
      price: 29.5,
      stockQuantity: 33,
      lowStockThreshold: 10,
      status: "ACTIVE",
      imageUrl: null,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    },
  ];

  const activityLogs: ActivityLogItem[] = [
    {
      id: "act-1",
      entityType: "PRODUCT",
      entityName: "Matte Navy Pour-Over Stoneware Kettle",
      action: "Restocked +18 units in POS inventory",
      actorName: "Sarah Jenkins",
      storeCode: "#STR-01",
      timestamp: minsAgo(14),
    },
    {
      id: "act-2",
      entityType: "STORE",
      entityName: "Westside Shopping Mall",
      action: "Completed hourly POS catalog sync",
      actorName: "Marcus Vance",
      storeCode: "#STR-02",
      timestamp: hoursAgo(1),
    },
    {
      id: "act-3",
      entityType: "CATEGORY",
      entityName: "Kitchenware & Dining",
      action: "Verified POS quick-key priority #1 across 4 stores",
      actorName: "Sarah Jenkins",
      storeCode: null,
      timestamp: hoursAgo(2),
    },
    {
      id: "act-4",
      entityType: "PRODUCT",
      entityName: "Artisan Morning Pour-Over Gift Box",
      action: "Flagged Out of Stock (0 units remaining)",
      actorName: "Inventory Monitor",
      storeCode: "#STR-01",
      timestamp: daysAgo(1),
    },
    {
      id: "act-5",
      entityType: "STORE",
      entityName: "Harbor Pop-up Shop",
      action: "Provisioned store #STR-04 in Setup Phase",
      actorName: "Sarah Jenkins",
      storeCode: "#STR-04",
      timestamp: daysAgo(3),
    },
  ];

  const settings: WorkspaceSettings = {
    customerId: "RET-994",
    organizationName: "Shop CRM Retail Group",
    primaryContactEmail: "sarah.j@shopcrm.internal",
    clusterRegion: "US-EAST",
    defaultTaxRate: 9.5,
    defaultLowStockThreshold: 10,
    posAutoSyncEnabled: true,
    enforceUniqueSkuPerStore: true,
    updatedAt: daysAgo(2),
  };

  return {
    stores,
    categories,
    products,
    activityLogs,
    settings,
  };
}
