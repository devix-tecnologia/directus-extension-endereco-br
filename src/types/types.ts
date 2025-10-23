import { ApiExtensionContext } from './DirectusImports.js';

export interface IZipConfig {
  accessToken?: string;
  ApiExtensionContext?: ApiExtensionContext;
  storage?: string;
  baseURL?: string;
}

export interface IDirectusFile {
  data: {
    id: string;
    storage: string;
    filename_disk: string;
    filename_download: string;
    title: string | null;
    type: string | null;
    folder: string | null;
    uploaded_by: string;
    uploaded_on: string | null;
    modified_by: string | null;
    modified_on: string | null;
    charset: string | null;
    filesize: string;
    width: string | null;
    height: string | null;
    duration: string | null;
    embed: string | null;
    description: string | null;
    location: string | null;
    tags: string | null;
    metadata: string | null;
  };
}
