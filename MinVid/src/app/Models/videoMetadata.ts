export class VideoMetadata {
    id: string;
    title: string;
    format: string;
    tags: string[]; 
    description: string;
    uploadDate: Date;
    duration: number; 
    isShort?: boolean;

    constructor(title: string, format: string, description: string, tags: string[], uploadDate: Date, duration: number, isShort?: boolean){
        this.title = title;
        this.format = format;
        this.description = description;
        this.tags = tags;
        this.uploadDate = new Date();
        this.duration = duration;
        this.isShort = isShort;
    }
}