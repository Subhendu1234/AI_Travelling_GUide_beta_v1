
export enum Tab {
  TRAVEL_GUIDE = 'TRAVEL_GUIDE',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  AUDIO_TRANSCRIBER = 'AUDIO_TRANSCRIBER',
}

export interface GroundingSource {
    web?: {
      uri: string;
      title: string;
    };
}
