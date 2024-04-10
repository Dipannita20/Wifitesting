export interface ProgramData {
    [key: string]: {
      Client: string;
      network: {
        download?: {
          minimum: string;
          recommended: string;
          urls?: string[];
        };
        firewall?: string[];
        upload?: {
          minimum: string;
          recommended: string;
          url?: string;
        };
      };
    };
  }

  export interface Retailer {
    RetailerId: number;
    RetailerCode: string;
    RegionCode: string;
    ZoneCode: string;
    DistrictCode: string;
    District: string;
    Zone: string;
    Region: string;
    Name: string;
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    Zip: string;
    Phone: string;
    Fax: string;
    IsActive: boolean;
    Lat: number;
    Long: number;
  }
  