import { Guid } from "guid-typescript";

export class VideoMetadata {
    id: string;
    title: string;
    format: string;
    tags: string[]; 
    description: string;
    uploadDate: Date;

    constructor(title: string, format: string, description: string, tags: string[], uploadDate: Date){
        this.title = title;
        this.format = format;
        this.description = description;
        this.tags = tags;
        this.uploadDate = new Date();
    }
}