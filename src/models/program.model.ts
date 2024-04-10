export default class ProgramModel {
    Client?: string;
    network: Network | undefined;
    key:string | undefined;
}

export interface Network {
    download: Download;
    firewall: string[]
    upload: Upload;
}
  
export interface Download {
    minimum?: string
    recommended?: string
    urls: Url[];
}

export interface Upload {
    minimum?: string
    recommended?: string
    url: string
}

export interface Url{
    url:string;
    size:string;
}