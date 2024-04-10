export interface ISpeedTestResult {
  downloadSpeed?: number;
  uploadSpeed?: number;
  firewallTestUrls?: IFirewall[];
}

export interface IFirewall {
  url?: string;
  status: number;
}
