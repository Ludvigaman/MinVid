export class VideoMetadata {
    id: string;
    title: string;
    format: string;
    tags: string[]; 
    description: string;
    uploadDate: Date;
    duration: number; 
    isShort?: boolean;
    is360?: boolean;

    constructor(title: string, format: string, description: string, tags: string[], uploadDate: Date, duration: number, isShort?: boolean, is360?: boolean) {
        this.title = title;
        this.format = format;
        this.description = description;
        this.tags = tags;
        this.uploadDate = new Date();
        this.duration = duration;
        this.isShort = isShort;
        this.is360 = is360;
    }
}